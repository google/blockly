/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interpreting JavaScript in JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {
  if (typeof code === 'string') {
    code = this.parse_(code, 'code');
  }
  // Get a handle on Acorn's node_t object.
  var nodeConstructor = code.constructor;
  this.newNode = function() {
    return new nodeConstructor({'options': {}});
  };
  // Clone the root 'Program' node so that the AST may be modified.
  var ast = this.newNode();
  for (var prop in code) {
    ast[prop] = (prop === 'body') ? code[prop].slice() : code[prop];
  }
  this.ast = ast;
  this.initFunc_ = opt_initFunc;
  this.paused_ = false;
  this.polyfills_ = [];
  // Unique identifier for native functions.  Used in serialization.
  this.functionCounter_ = 0;
  // Map node types to our step function names; a property lookup is faster
  // than string concatenation with "step" prefix.
  this.stepFunctions_ = Object.create(null);
  var stepMatch = /^step([A-Z]\w*)$/;
  var m;
  for (var methodName in this) {
    if ((typeof this[methodName] === 'function') &&
        (m = methodName.match(stepMatch))) {
      this.stepFunctions_[m[1]] = this[methodName].bind(this);
    }
  }
  // Create and initialize the global scope.
  this.globalScope = this.createScope(this.ast, null);
  this.globalObject = this.globalScope.object;
  // Run the polyfills.
  this.ast = this.parse_(this.polyfills_.join('\n'), 'polyfills');
  this.polyfills_ = undefined;  // Allow polyfill strings to garbage collect.
  Interpreter.stripLocations_(this.ast, undefined, undefined);
  var state = new Interpreter.State(this.ast, this.globalScope);
  state.done = false;
  this.stateStack = [state];
  this.run();
  this.value = undefined;
  // Point at the main program.
  this.ast = ast;
  var state = new Interpreter.State(this.ast, this.globalScope);
  state.done = false;
  this.stateStack.length = 0;
  this.stateStack[0] = state;
};

/**
  * Completion Value Types.
  * @enum {number}
  */
 Interpreter.Completion = {
   NORMAL: 0,
   BREAK: 1,
   CONTINUE: 2,
   RETURN: 3,
   THROW: 4
 };

/**
 * @const {!Object} Configuration used for all Acorn parsing.
 */
Interpreter.PARSE_OPTIONS = {
  'locations': true,
  'ecmaVersion': 5
};

/**
 * Property descriptor of readonly properties.
 */
Interpreter.READONLY_DESCRIPTOR = {
  configurable: true,
  enumerable: true,
  writable: false
};

/**
 * Property descriptor of non-enumerable properties.
 */
Interpreter.NONENUMERABLE_DESCRIPTOR = {
  configurable: true,
  enumerable: false,
  writable: true
};

/**
 * Property descriptor of readonly, non-enumerable properties.
 */
Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR = {
  configurable: true,
  enumerable: false,
  writable: false
};

/**
 * Property descriptor of non-configurable, readonly, non-enumerable properties.
 * E.g. NaN, Infinity.
 */
Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR = {
  configurable: false,
  enumerable: false,
  writable: false
};

/**
 * Property descriptor of variables.
 */
Interpreter.VARIABLE_DESCRIPTOR = {
  configurable: false,
  enumerable: true,
  writable: true
};

/**
 * Unique symbol for indicating that a step has encountered an error, has
 * added it to the stack, and will be thrown within the user's program.
 * When STEP_ERROR is thrown in the JS-Interpreter, the error can be ignored.
 */
Interpreter.STEP_ERROR = {'STEP_ERROR': true};

/**
 * Unique symbol for indicating that a reference is a variable on the scope,
 * not an object property.
 */
Interpreter.SCOPE_REFERENCE = {'SCOPE_REFERENCE': true};

/**
 * Unique symbol for indicating, when used as the value of the value
 * parameter in calls to setProperty and friends, that the value
 * should be taken from the property descriptor instead.
 */
Interpreter.VALUE_IN_DESCRIPTOR = {'VALUE_IN_DESCRIPTOR': true};

/**
 * Unique symbol for indicating that a RegExp timeout has occurred in a VM.
 */
Interpreter.REGEXP_TIMEOUT = {'REGEXP_TIMEOUT': true};

/**
 * For cycle detection in array to string and error conversion;
 * see spec bug github.com/tc39/ecma262/issues/289
 * Since this is for atomic actions only, it can be a class property.
 */
Interpreter.toStringCycles_ = [];

/**
 * Node's vm module, if loaded and required.
 * @type {Object}
 */
Interpreter.vm = null;

/**
 * Currently executing interpreter.  Needed so Interpreter.Object instances
 * can know their environment.
 * @type {Interpreter}
 */
Interpreter.currentInterpreter_ = null;

/**
 * The global object (`window` in a browser, `global` in node.js) is usually
 * `globalThis`, but older systems use `this`.
 */
Interpreter.nativeGlobal =
    (typeof globalThis === 'undefined') ? this : globalThis;

/**
 * Code for executing regular expressions in a thread.
 */
Interpreter.WORKER_CODE = [
  "onmessage = function(e) {",
    "var result;",
    "var data = e.data;",
    "switch (data[0]) {",
      "case 'split':",
        // ['split', string, separator, limit]
        "result = data[1].split(data[2], data[3]);",
        "break;",
      "case 'match':",
        // ['match', string, regexp]
        "result = data[1].match(data[2]);",
        "break;",
      "case 'search':",
        // ['search', string, regexp]
        "result = data[1].search(data[2]);",
        "break;",
      "case 'replace':",
        // ['replace', string, regexp, newSubstr]
        "result = data[1].replace(data[2], data[3]);",
        "break;",
      "case 'exec':",
        // ['exec', regexp, lastIndex, string]
        "var regexp = data[1];",
        "regexp.lastIndex = data[2];",
        "result = [regexp.exec(data[3]), data[1].lastIndex];",
        "break;",
      "default:",
        "throw Error('Unknown RegExp operation: ' + data[0]);",
    "}",
    "postMessage(result);",
  "};"];

/**
 * Is a value a legal integer for an array length?
 * @param {Interpreter.Value} x Value to check.
 * @return {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.legalArrayLength = function(x) {
  var n = x >>> 0;
  // Array length must be between 0 and 2^32-1 (inclusive).
  return (n === Number(x)) ? n : NaN;
};

/**
 * Is a value a legal integer for an array index?
 * @param {Interpreter.Value} x Value to check.
 * @return {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.legalArrayIndex = function(x) {
  var n = x >>> 0;
  // Array index cannot be 2^32-1, otherwise length would be 2^32.
  // 0xffffffff is 2^32-1.
  return (String(n) === String(x) && n !== 0xffffffff) ? n : NaN;
};

/**
 * Remove start and end values from AST, or set start and end values to a
 * constant value.  Used to remove highlighting from polyfills and to set
 * highlighting in an eval to cover the entire eval expression.
 * @param {!Object} node AST node.
 * @param {number=} start Starting character of all nodes, or undefined.
 * @param {number=} end Ending character of all nodes, or undefined.
 * @private
 */
Interpreter.stripLocations_ = function(node, start, end) {
  if (start) {
    node['start'] = start;
  } else {
    delete node['start'];
  }
  if (end) {
    node['end'] = end;
  } else {
    delete node['end'];
  }
  for (var name in node) {
    if (name !== 'loc' && node.hasOwnProperty(name)) {
      var prop = node[name];
      if (prop && typeof prop === 'object') {
        Interpreter.stripLocations_(prop, start, end);
      }
    }
  }
};

/**
 * Some pathological regular expressions can take geometric time.
 * Regular expressions are handled in one of three ways:
 * 0 - throw as invalid.
 * 1 - execute natively (risk of unresponsive program).
 * 2 - execute in separate thread (not supported by IE 9).
 */
Interpreter.prototype['REGEXP_MODE'] = 2;

/**
 * If REGEXP_MODE = 2, the length of time (in ms) to allow a RegExp
 * thread to execute before terminating it.
 */
Interpreter.prototype['REGEXP_THREAD_TIMEOUT'] = 1000;

/**
 * Length of time (in ms) to allow a polyfill to run before ending step.
 * If set to 0, polyfills will execute step by step.
 * If set to 1000, polyfills will run for up to a second per step
 * (execution will resume in the polyfill in the next step).
 * If set to Infinity, polyfills will run to completion in a single step.
 */
Interpreter.prototype['POLYFILL_TIMEOUT'] = 1000;

/**
 * Flag indicating that a getter function needs to be called immediately.
 * @private
 */
Interpreter.prototype.getterStep_ = false;

/**
 * Flag indicating that a setter function needs to be called immediately.
 * @private
 */
Interpreter.prototype.setterStep_ = false;

/**
 * Number of code chunks appended to the interpreter.
 * @private
 */
Interpreter.prototype.appendCodeNumber_ = 0;

/**
 * Parse JavaScript code into an AST using Acorn.
 * @param {string} code Raw JavaScript text.
 * @param {string} sourceFile Name of filename (for stack trace).
 * @return {!Object} AST.
 * @private
 */
Interpreter.prototype.parse_ = function(code, sourceFile) {
   // Create a new options object, since Acorn will modify this object.
   var options = {};
   for (var name in Interpreter.PARSE_OPTIONS) {
     options[name] = Interpreter.PARSE_OPTIONS[name];
   }
   options['sourceFile'] = sourceFile;
   return acorn.parse(code, options);
};

/**
 * Add more code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.appendCode = function(code) {
  var state = this.stateStack[0];
  if (!state || state.node['type'] !== 'Program') {
    throw Error('Expecting original AST to start with a Program node.');
  }
  if (typeof code === 'string') {
    code = this.parse_(code, 'appendCode' + (this.appendCodeNumber_++));
  }
  if (!code || code['type'] !== 'Program') {
    throw Error('Expecting new AST to start with a Program node.');
  }
  this.populateScope_(code, state.scope);
  // Append the new program to the old one.
  Array.prototype.push.apply(state.node['body'], code['body']);
  state.done = false;
};

/**
 * Execute one step of the interpreter.
 * @return {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {
  var stack = this.stateStack;
  var endTime = Date.now() + this['POLYFILL_TIMEOUT'];
  do {
    var state = stack[stack.length - 1];
    if (!state) {
      return false;
    }
    var node = state.node, type = node['type'];
    if (type === 'Program' && state.done) {
      return false;
    } else if (this.paused_) {
      return true;
    }
    // Record the interpreter in a global property so calls to toString/valueOf
    // can execute in the proper context.
    var oldInterpreterValue = Interpreter.currentInterpreter_;
    Interpreter.currentInterpreter_ = this;
    try {
      try {
        var nextState = this.stepFunctions_[type](stack, state, node);
      } catch (e) {
        // Eat any step errors.  They have been thrown on the stack.
        if (e !== Interpreter.STEP_ERROR) {
          // Uh oh.  This is a real error in the JS-Interpreter.  Rethrow.
          throw e;
        }
      }
    } finally {
      // Restore to previous value (probably null, maybe nested toString calls).
      Interpreter.currentInterpreter_ = oldInterpreterValue;
    }
    if (nextState) {
      stack.push(nextState);
    }
    if (this.getterStep_) {
      // Getter from this step was not handled.
      throw Error('Getter not supported in this context');
    }
    if (this.setterStep_) {
      // Setter from this step was not handled.
      throw Error('Setter not supported in this context');
    }
    // This may be polyfill code.  Keep executing until we arrive at user code.
  } while (!node['end'] && endTime > Date.now());
  return true;
};

/**
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @return {boolean} True if a execution is asynchronously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function() {
  while (!this.paused_ && this.step()) {}
  return this.paused_;
};

/**
 * Initialize the global object with buitin properties and functions.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initGlobal = function(globalObject) {
  // Initialize uneditable global properties.
  this.setProperty(globalObject, 'NaN', NaN,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'Infinity', Infinity,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'undefined', undefined,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'window', globalObject,
      Interpreter.READONLY_DESCRIPTOR);
  this.setProperty(globalObject, 'this', globalObject,
      Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'self', globalObject);  // Editable.

  // Create the objects which will become Object.prototype and
  // Function.prototype, which are needed to bootstrap everything else.
  this.OBJECT_PROTO = new Interpreter.Object(null);
  this.FUNCTION_PROTO = new Interpreter.Object(this.OBJECT_PROTO);
  // Initialize global objects.
  this.initFunction(globalObject);
  this.initObject(globalObject);
  // Unable to set globalObject's parent prior (OBJECT did not exist).
  // Note that in a browser this would be `Window`, whereas in Node.js it would
  // be `Object`.  This interpreter is closer to Node in that it has no DOM.
  globalObject.proto = this.OBJECT_PROTO;
  this.setProperty(globalObject, 'constructor', this.OBJECT,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.initArray(globalObject);
  this.initString(globalObject);
  this.initBoolean(globalObject);
  this.initNumber(globalObject);
  this.initDate(globalObject);
  this.initRegExp(globalObject);
  this.initError(globalObject);
  this.initMath(globalObject);
  this.initJSON(globalObject);

  // Initialize global functions.
  var thisInterpreter = this;
  var func = this.createNativeFunction(
      function(_x) {throw EvalError("Can't happen");}, false);
  func.eval = true;
  this.setProperty(globalObject, 'eval', func,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'parseInt',
      this.createNativeFunction(parseInt, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'parseFloat',
      this.createNativeFunction(parseFloat, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'isNaN',
      this.createNativeFunction(isNaN, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(globalObject, 'isFinite',
      this.createNativeFunction(isFinite, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var strFunctions = [
    [escape, 'escape'], [unescape, 'unescape'],
    [decodeURI, 'decodeURI'], [decodeURIComponent, 'decodeURIComponent'],
    [encodeURI, 'encodeURI'], [encodeURIComponent, 'encodeURIComponent']
  ];
  for (var i = 0; i < strFunctions.length; i++) {
    var wrapper = (function(nativeFunc) {
      return function(str) {
        try {
          return nativeFunc(str);
        } catch (e) {
          // decodeURI('%xy') will throw an error.  Catch and rethrow.
          thisInterpreter.throwException(thisInterpreter.URI_ERROR, e.message);
        }
      };
    })(strFunctions[i][0]);
    this.setProperty(globalObject, strFunctions[i][1],
        this.createNativeFunction(wrapper, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }
  // Preserve publicly properties from being pruned/renamed by JS compilers.
  // Add others as needed.
  this['OBJECT'] = this.OBJECT;     this['OBJECT_PROTO'] = this.OBJECT_PROTO;
  this['FUNCTION'] = this.FUNCTION; this['FUNCTION_PROTO'] = this.FUNCTION_PROTO;
  this['ARRAY'] = this.ARRAY;       this['ARRAY_PROTO'] = this.ARRAY_PROTO;
  this['REGEXP'] = this.REGEXP;     this['REGEXP_PROTO'] = this.REGEXP_PROTO;
  this['DATE'] = this.DATE;         this['DATE_PROTO'] = this.DATE_PROTO;

  // Run any user-provided initialization.
  if (this.initFunc_) {
    this.initFunc_(this, globalObject);
  }
};

/**
 * Number of functions created by the interpreter.
 * @private
 */
Interpreter.prototype.functionCodeNumber_ = 0;

/**
 * Initialize the Function class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initFunction = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  var identifierRegexp = /^[A-Za-z_$][\w$]*$/;
  // Function constructor.
  wrapper = function Function(var_args) {
    if (arguments.length) {
      var code = String(arguments[arguments.length - 1]);
    } else {
      var code = '';
    }
    var argsStr = Array.prototype.slice.call(arguments, 0, -1).join(',').trim();
    if (argsStr) {
      var args = argsStr.split(/\s*,\s*/);
      for (var i = 0; i < args.length; i++) {
        var name = args[i];
        if (!identifierRegexp.test(name)) {
          thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
              'Invalid function argument: ' + name);
        }
      }
      argsStr = args.join(', ');
    }
    // Acorn needs to parse code in the context of a function or else `return`
    // statements will be syntax errors.
    try {
      var ast = thisInterpreter.parse_('(function(' + argsStr + ') {' + code + '})',
          'function' + (thisInterpreter.functionCodeNumber_++));
    } catch (e) {
      // Acorn threw a SyntaxError.  Rethrow as a trappable error.
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
          'Invalid code: ' + e.message);
    }
    if (ast['body'].length !== 1) {
      // Function('a', 'return a + 6;}; {alert(1);');
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR,
          'Invalid code in function body.');
    }
    var node = ast['body'][0]['expression'];
    // Note that if this constructor is called as `new Function()` the function
    // object created by stepCallExpression and assigned to `this` is discarded.
    // Interestingly, the scope for constructed functions is the global scope,
    // even if they were constructed in some other scope.
    return thisInterpreter.createFunction(node, thisInterpreter.globalScope, 'anonymous');
  };
  this.FUNCTION = this.createNativeFunction(wrapper, true);

  this.setProperty(globalObject, 'Function', this.FUNCTION,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  // Throw away the created prototype and use the root prototype.
  this.setProperty(this.FUNCTION, 'prototype', this.FUNCTION_PROTO,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Configure Function.prototype.
  this.setProperty(this.FUNCTION_PROTO, 'constructor', this.FUNCTION,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.FUNCTION_PROTO.nativeFunc = function() {};
  this.FUNCTION_PROTO.nativeFunc.id = this.functionCounter_++;
  this.FUNCTION_PROTO.illegalConstructor = true;
  this.setProperty(this.FUNCTION_PROTO, 'length', 0,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.FUNCTION_PROTO.class = 'Function';

  wrapper = function apply(thisArg, args) {
    var state =
        thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1];
    // Rewrite the current CallExpression state to apply a different function.
    state.func_ = this;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    if (args !== null && args !== undefined) {
      if (args instanceof Interpreter.Object) {
        state.arguments_ = thisInterpreter.arrayPseudoToNative(args);
      } else {
        thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
            'CreateListFromArrayLike called on non-object');
      }
    }
    state.doneExec_ = false;
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'apply', wrapper);

  wrapper = function call(thisArg /*, var_args */) {
    var state =
        thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1];
    // Rewrite the current CallExpression state to call a different function.
    state.func_ = this;
    // Assign the `this` object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments_ = [];
    for (var i = 1; i < arguments.length; i++) {
      state.arguments_.push(arguments[i]);
    }
    state.doneExec_ = false;
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'call', wrapper);

  this.polyfills_.push(
// Polyfill copied from:
// developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_objects/Function/bind
"Object.defineProperty(Function.prototype, 'bind',",
    "{configurable: true, writable: true, value:",
  "function bind(oThis) {",
    "if (typeof this !== 'function') {",
      "throw TypeError('What is trying to be bound is not callable');",
    "}",
    "var aArgs   = Array.prototype.slice.call(arguments, 1),",
        "fToBind = this,",
        "fNOP    = function() {},",
        "fBound  = function() {",
          "return fToBind.apply(this instanceof fNOP",
                 "? this",
                 ": oThis,",
                 "aArgs.concat(Array.prototype.slice.call(arguments)));",
        "};",
    "if (this.prototype) {",
      "fNOP.prototype = this.prototype;",
    "}",
    "fBound.prototype = new fNOP();",
    "return fBound;",
  "}",
"});",
"");

  // Function has no parent to inherit from, so it needs its own mandatory
  // toString and valueOf functions.
  wrapper = function toString() {
    return String(this);
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'toString', wrapper);
  this.setProperty(this.FUNCTION, 'toString',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  wrapper = function valueOf() {
    return this.valueOf();
  };
  this.setNativeFunctionPrototype(this.FUNCTION, 'valueOf', wrapper);
  this.setProperty(this.FUNCTION, 'valueOf',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Object class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initObject = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Object constructor.
  wrapper = function Object(value) {
    if (value === undefined || value === null) {
      // Create a new object.
      if (thisInterpreter.calledWithNew()) {
        // Called as `new Object()`.
        return this;
      } else {
        // Called as `Object()`.
        return thisInterpreter.createObjectProto(thisInterpreter.OBJECT_PROTO);
      }
    }
    if (!(value instanceof Interpreter.Object)) {
      // Wrap the value as an object.
      var box = thisInterpreter.createObjectProto(
          thisInterpreter.getPrototype(value));
      box.data = value;
      return box;
    }
    // Return the provided object.
    return value;
  };
  this.OBJECT = this.createNativeFunction(wrapper, true);
  // Throw away the created prototype and use the root prototype.
  this.setProperty(this.OBJECT, 'prototype', this.OBJECT_PROTO,
                   Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.OBJECT_PROTO, 'constructor', this.OBJECT,
                   Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(globalObject, 'Object', this.OBJECT,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  /**
   * Checks if the provided value is null or undefined.
   * If so, then throw an error in the call stack.
   * @param {Interpreter.Value} value Value to check.
   */
  var throwIfNullUndefined = function(value) {
    if (value === undefined || value === null) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          "Cannot convert '" + value + "' to object");
    }
  };

  // Static methods on Object.
  wrapper = function getOwnPropertyNames(obj) {
    throwIfNullUndefined(obj);
    var props = (obj instanceof Interpreter.Object) ? obj.properties : obj;
    return thisInterpreter.arrayNativeToPseudo(
        Object.getOwnPropertyNames(props));
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyNames',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function keys(obj) {
    throwIfNullUndefined(obj);
    if (obj instanceof Interpreter.Object) {
      obj = obj.properties;
    }
    return thisInterpreter.arrayNativeToPseudo(Object.keys(obj));
  };
  this.setProperty(this.OBJECT, 'keys',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function create_(proto) {
    // Support for the second argument is the responsibility of a polyfill.
    if (proto === null) {
      return thisInterpreter.createObjectProto(null);
    }
    if (!(proto instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object prototype may only be an Object or null');
    }
    return thisInterpreter.createObjectProto(proto);
  };
  this.setProperty(this.OBJECT, 'create',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Add a polyfill to handle create's second argument.
  this.polyfills_.push(
"(function() {",
  "var create_ = Object.create;",
  "Object.create = function create(proto, props) {",
    "var obj = create_(proto);",
    "props && Object.defineProperties(obj, props);",
    "return obj;",
  "};",
"})();",
"");

  wrapper = function defineProperty(obj, prop, descriptor) {
    prop = String(prop);
    if (!(obj instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object.defineProperty called on non-object');
    }
    if (!(descriptor instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Property description must be an object');
    }
    if (!obj.properties[prop] && obj.preventExtensions) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          "Can't define property '" + prop + "', object is not extensible");
    }
    // The polyfill guarantees no inheritance and no getter functions.
    // Therefore the descriptor properties map is the native object needed.
    thisInterpreter.setProperty(obj, prop, Interpreter.VALUE_IN_DESCRIPTOR,
                                descriptor.properties);
    return obj;
  };
  this.setProperty(this.OBJECT, 'defineProperty',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.polyfills_.push(
// Flatten the descriptor to remove any inheritance or getter functions.
"(function() {",
  "var defineProperty_ = Object.defineProperty;",
  "Object.defineProperty = function defineProperty(obj, prop, d1) {",
    "var d2 = {};",
    "if ('configurable' in d1) d2.configurable = d1.configurable;",
    "if ('enumerable' in d1) d2.enumerable = d1.enumerable;",
    "if ('writable' in d1) d2.writable = d1.writable;",
    "if ('value' in d1) d2.value = d1.value;",
    "if ('get' in d1) d2.get = d1.get;",
    "if ('set' in d1) d2.set = d1.set;",
    "return defineProperty_(obj, prop, d2);",
  "};",
"})();",

"Object.defineProperty(Object, 'defineProperties',",
    "{configurable: true, writable: true, value:",
  "function defineProperties(obj, props) {",
    "var keys = Object.keys(props);",
    "for (var i = 0; i < keys.length; i++) {",
      "Object.defineProperty(obj, keys[i], props[keys[i]]);",
    "}",
    "return obj;",
  "}",
"});",
"");

  wrapper = function getOwnPropertyDescriptor(obj, prop) {
    if (!(obj instanceof Interpreter.Object)) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Object.getOwnPropertyDescriptor called on non-object');
    }
    prop = String(prop);
    if (!(prop in obj.properties)) {
      return undefined;
    }
    var descriptor = Object.getOwnPropertyDescriptor(obj.properties, prop);
    var getter = obj.getter[prop];
    var setter = obj.setter[prop];

    var pseudoDescriptor =
        thisInterpreter.createObjectProto(thisInterpreter.OBJECT_PROTO);
    if (getter || setter) {
      thisInterpreter.setProperty(pseudoDescriptor, 'get', getter);
      thisInterpreter.setProperty(pseudoDescriptor, 'set', setter);
    } else {
      thisInterpreter.setProperty(pseudoDescriptor, 'value',
          descriptor.value);
      thisInterpreter.setProperty(pseudoDescriptor, 'writable',
          descriptor.writable);
    }
    thisInterpreter.setProperty(pseudoDescriptor, 'configurable',
        descriptor.configurable);
    thisInterpreter.setProperty(pseudoDescriptor, 'enumerable',
        descriptor.enumerable);
    return pseudoDescriptor;
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyDescriptor',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function getPrototypeOf(obj) {
    throwIfNullUndefined(obj);
    return thisInterpreter.getPrototype(obj);
  };
  this.setProperty(this.OBJECT, 'getPrototypeOf',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function isExtensible(obj) {
    return Boolean(obj) && !obj.preventExtensions;
  };
  this.setProperty(this.OBJECT, 'isExtensible',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  wrapper = function preventExtensions(obj) {
    if (obj instanceof Interpreter.Object) {
      obj.preventExtensions = true;
    }
    return obj;
  };
  this.setProperty(this.OBJECT, 'preventExtensions',
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Object.
  this.setNativeFunctionPrototype(this.OBJECT, 'toString',
      Interpreter.Object.prototype.toString);
  this.setNativeFunctionPrototype(this.OBJECT, 'toLocaleString',
      Interpreter.Object.prototype.toString);
  this.setNativeFunctionPrototype(this.OBJECT, 'valueOf',
      Interpreter.Object.prototype.valueOf);

  wrapper = function hasOwnProperty(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Interpreter.Object) {
      return String(prop) in this.properties;
    }
    // Primitive.
    return this.hasOwnProperty(prop);
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'hasOwnProperty', wrapper);

  wrapper = function propertyIsEnumerable(prop) {
    throwIfNullUndefined(this);
    if (this instanceof Interpreter.Object) {
      return Object.prototype.propertyIsEnumerable.call(this.properties, prop);
    }
    // Primitive.
    return this.propertyIsEnumerable(prop);
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'propertyIsEnumerable', wrapper);

  wrapper = function isPrototypeOf(obj) {
    while (true) {
      // Note, circular loops shouldn't be possible.
      obj = thisInterpreter.getPrototype(obj);
      if (!obj) {
        // No parent; reached the top.
        return false;
      }
      if (obj === this) {
        return true;
      }
    }
  };
  this.setNativeFunctionPrototype(this.OBJECT, 'isPrototypeOf',  wrapper);
};

/**
 * Initialize the Array class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initArray = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Array constructor.
  wrapper = function Array(var_args) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Array()`.
      var newArray = this;
    } else {
      // Called as `Array()`.
      var newArray = thisInterpreter.createArray();
    }
    var first = arguments[0];
    if (arguments.length === 1 && typeof first === 'number') {
      if (isNaN(Interpreter.legalArrayLength(first))) {
        thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
                                       'Invalid array length');
      }
      newArray.properties.length = first;
    } else {
      for (var i = 0; i < arguments.length; i++) {
        newArray.properties[i] = arguments[i];
      }
      newArray.properties.length = i;
    }
    return newArray;
  };
  this.ARRAY = this.createNativeFunction(wrapper, true);
  this.ARRAY_PROTO = this.ARRAY.properties['prototype'];
  this.setProperty(globalObject, 'Array', this.ARRAY,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Array.
  wrapper = function isArray(obj) {
    return obj && obj.class === 'Array';
  };
  this.setProperty(this.ARRAY, 'isArray',
                   this.createNativeFunction(wrapper, false),
                   Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Array.
  this.setProperty(this.ARRAY_PROTO, 'length', 0,
      {configurable: false, enumerable: false, writable: true});
  this.ARRAY_PROTO.class = 'Array';

  this.polyfills_.push(
"Object.defineProperty(Array.prototype, 'pop',",
    "{configurable: true, writable: true, value:",
  "function pop() {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (!len || len < 0) {",
      "o.length = 0;",
      "return undefined;",
    "}",
    "len--;",
    "var x = o[len];",
    "delete o[len];",  // Needed for non-arrays.
    "o.length = len;",
    "return x;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'push',",
    "{configurable: true, writable: true, value:",
  "function push(var_args) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "for (var i = 0; i < arguments.length; i++) {",
      "o[len] = arguments[i];",
      "len++;",
    "}",
    "o.length = len;",
    "return len;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'shift',",
    "{configurable: true, writable: true, value:",
  "function shift() {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (!len || len < 0) {",
      "o.length = 0;",
      "return undefined;",
    "}",
    "var value = o[0];",
    "for (var i = 0; i < len - 1; i++) {",
      "if ((i + 1) in o) {",
        "o[i] = o[i + 1];",
      "} else {",
        "delete o[i];",
      "}",
    "}",
    "delete o[i];",  // Needed for non-arrays.
    "o.length = len - 1;",
    "return value;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'unshift',",
    "{configurable: true, writable: true, value:",
  "function unshift(var_args) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (!len || len < 0) {",
      "len = 0;",
    "}",
    "for (var i = len - 1; i >= 0; i--) {",
      "if (i in o) {",
        "o[i + arguments.length] = o[i];",
      "} else {",
        "delete o[i + arguments.length];",
      "}",
    "}",
    "for (var i = 0; i < arguments.length; i++) {",
      "o[i] = arguments[i];",
    "}",
    "return (o.length = len + arguments.length);",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'reverse',",
    "{configurable: true, writable: true, value:",
  "function reverse() {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (!len || len < 2) {",
      "return o;",  // Not an array, or too short to reverse.
    "}",
    "for (var i = 0; i < len / 2 - 0.5; i++) {",
      "var x = o[i];",
      "var hasX = i in o;",
      "if ((len - i - 1) in o) {",
        "o[i] = o[len - i - 1];",
      "} else {",
        "delete o[i];",
      "}",
      "if (hasX) {",
        "o[len - i - 1] = x;",
      "} else {",
        "delete o[len - i - 1];",
      "}",
    "}",
    "return o;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'indexOf',",
    "{configurable: true, writable: true, value:",
  "function indexOf(searchElement, fromIndex) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "var n = fromIndex | 0;",
    "if (!len || n >= len) {",
      "return -1;",
    "}",
    "var i = Math.max(n >= 0 ? n : len - Math.abs(n), 0);",
    "while (i < len) {",
      "if (i in o && o[i] === searchElement) {",
        "return i;",
      "}",
      "i++;",
    "}",
    "return -1;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'lastIndexOf',",
    "{configurable: true, writable: true, value:",
  "function lastIndexOf(searchElement, fromIndex) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (!len) {",
      "return -1;",
    "}",
    "var n = len - 1;",
    "if (arguments.length > 1) {",
      "n = fromIndex | 0;",
      "if (n) {",
        "n = (n > 0 || -1) * Math.floor(Math.abs(n));",
      "}",
    "}",
    "var i = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);",
    "while (i >= 0) {",
      "if (i in o && o[i] === searchElement) {",
        "return i;",
      "}",
      "i--;",
    "}",
    "return -1;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'slice',",
    "{configurable: true, writable: true, value:",
  "function slice(start, end) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    // Handle negative value for "start"
    "start |= 0;",
    "start = (start >= 0) ? start : Math.max(0, len + start);",
    // Handle negative value for "end"
    "if (typeof end !== 'undefined') {",
      "if (end !== Infinity) {",
        "end |= 0;",
      "}",
      "if (end < 0) {",
        "end = len + end;",
      "} else {",
        "end = Math.min(end, len);",
      "}",
    "} else {",
      "end = len;",
    "}",
    "var size = end - start;",
    "var cloned = new Array(size);",
    "for (var i = 0; i < size; i++) {",
      "if ((start + i) in o) {",
        "cloned[i] = o[start + i];",
      "}",
    "}",
    "return cloned;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'splice',",
    "{configurable: true, writable: true, value:",
  "function splice(start, deleteCount, var_args) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "start |= 0;",
    "if (start < 0) {",
      "start = Math.max(len + start, 0);",
    "} else {",
      "start = Math.min(start, len);",
    "}",
    "if (arguments.length < 1) {",
      "deleteCount = len - start;",
    "} else {",
      "deleteCount |= 0;",
      "deleteCount = Math.max(0, Math.min(deleteCount, len - start));",
    "}",
    "var removed = [];",
    // Remove specified elements.
    "for (var i = start; i < start + deleteCount; i++) {",
      "if (i in o) {",
        "removed.push(o[i]);",
      "} else {",
        "removed.length++;",
      "}",
      "if ((i + deleteCount) in o) {",
        "o[i] = o[i + deleteCount];",
      "} else {",
        "delete o[i];",
      "}",
    "}",
    // Move other element to fill the gap.
    "for (var i = start + deleteCount; i < len - deleteCount; i++) {",
      "if ((i + deleteCount) in o) {",
        "o[i] = o[i + deleteCount];",
      "} else {",
        "delete o[i];",
      "}",
    "}",
    // Delete superfluous properties.
    "for (var i = len - deleteCount; i < len; i++) {",
      "delete o[i];",
    "}",
    "len -= deleteCount;",
    // Insert specified items.
    "var arl = arguments.length - 2;",
    "for (var i = len - 1; i >= start; i--) {",
      "if (i in o) {",
        "o[i + arl] = o[i];",
      "} else {",
        "delete o[i + arl];",
      "}",
    "}",
    "len += arl;",
    "for (var i = 2; i < arguments.length; i++) {",
      "o[start + i - 2] = arguments[i];",
    "}",
    "o.length = len;",
    "return removed;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'concat',",
    "{configurable: true, writable: true, value:",
  "function concat(var_args) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var cloned = [];",
    "for (var i = -1; i < arguments.length; i++) {",
      "var value = (i === -1) ? o : arguments[i];",
      "if (Array.isArray(value)) {",
        "for (var j = 0, l = value.length; j < l; j++) {",
          "if (j in value) {",
            "cloned.push(value[j]);",
          "} else {",
            "cloned.length++;",
          "}",
        "}",
      "} else {",
        "cloned.push(value);",
      "}",
    "}",
    "return cloned;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'join',",
    "{configurable: true, writable: true, value:",
  "function join(opt_separator) {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var sep = typeof opt_separator === 'undefined' ?",
        "',' : ('' + opt_separator);",
    "var str = '';",
    "for (var i = 0; i < o.length; i++) {",
      "if (i && sep) {",
        "str += sep;",
      "}",
      "str += (o[i] === null || o[i] === undefined) ? '' : o[i];",
    "}",
    "return str;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/every
"Object.defineProperty(Array.prototype, 'every',",
    "{configurable: true, writable: true, value:",
  "function every(callbackfn, thisArg) {",
    "if (!this || typeof callbackfn !== 'function') throw TypeError();",
    "var t, k;",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (arguments.length > 1) t = thisArg;",
    "k = 0;",
    "while (k < len) {",
      "if (k in o && !callbackfn.call(t, o[k], k, o)) return false;",
      "k++;",
    "}",
    "return true;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
"Object.defineProperty(Array.prototype, 'filter',",
    "{configurable: true, writable: true, value:",
  "function filter(fun, var_args) {",
    "if (this === void 0 || this === null || typeof fun !== 'function') throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "var res = [];",
    "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;",
    "for (var i = 0; i < len; i++) {",
      "if (i in o) {",
        "var val = o[i];",
        "if (fun.call(thisArg, val, i, o)) res.push(val);",
      "}",
    "}",
    "return res;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
"Object.defineProperty(Array.prototype, 'forEach',",
    "{configurable: true, writable: true, value:",
  "function forEach(callback, thisArg) {",
    "if (!this || typeof callback !== 'function') throw TypeError();",
    "var t, k;",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (arguments.length > 1) t = thisArg;",
    "k = 0;",
    "while (k < len) {",
      "if (k in o) callback.call(t, o[k], k, o);",
      "k++;",
    "}",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map
"Object.defineProperty(Array.prototype, 'map',",
    "{configurable: true, writable: true, value:",
  "function map(callback, thisArg) {",
    "if (!this || typeof callback !== 'function') throw TypeError();",
    "var t, a, k;",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "if (arguments.length > 1) t = thisArg;",
    "a = new Array(len);",
    "k = 0;",
    "while (k < len) {",
      "if (k in o) a[k] = callback.call(t, o[k], k, o);",
      "k++;",
    "}",
    "return a;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
"Object.defineProperty(Array.prototype, 'reduce',",
    "{configurable: true, writable: true, value:",
  "function reduce(callback /*, initialValue*/) {",
    "if (!this || typeof callback !== 'function') throw TypeError();",
    "var o = Object(this), len = o.length >>> 0, k = 0, value;",
    "if (arguments.length === 2) {",
      "value = arguments[1];",
    "} else {",
      "while (k < len && !(k in o)) k++;",
      "if (k >= len) {",
        "throw TypeError('Reduce of empty array with no initial value');",
      "}",
      "value = o[k++];",
    "}",
    "for (; k < len; k++) {",
      "if (k in o) value = callback(value, o[k], k, o);",
    "}",
    "return value;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
"Object.defineProperty(Array.prototype, 'reduceRight',",
    "{configurable: true, writable: true, value:",
  "function reduceRight(callback /*, initialValue*/) {",
    "if (null === this || 'undefined' === typeof this || 'function' !== typeof callback) throw TypeError();",
    "var o = Object(this), len = o.length >>> 0, k = len - 1, value;",
    "if (arguments.length >= 2) {",
      "value = arguments[1];",
    "} else {",
      "while (k >= 0 && !(k in o)) k--;",
      "if (k < 0) {",
        "throw TypeError('Reduce of empty array with no initial value');",
      "}",
      "value = o[k--];",
    "}",
    "for (; k >= 0; k--) {",
      "if (k in o) value = callback(value, o[k], k, o);",
    "}",
    "return value;",
  "}",
"});",

// Polyfill copied from:
// developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/some
"Object.defineProperty(Array.prototype, 'some',",
    "{configurable: true, writable: true, value:",
  "function some(fun/*, thisArg*/) {",
    "if (!this || typeof fun !== 'function') throw TypeError();",
    "var o = Object(this);",
    "var len = o.length >>> 0;",
    "var thisArg = arguments.length >= 2 ? arguments[1] : void 0;",
    "for (var i = 0; i < len; i++) {",
      "if (i in o && fun.call(thisArg, o[i], i, o)) {",
        "return true;",
      "}",
    "}",
    "return false;",
  "}",
"});",


"Object.defineProperty(Array.prototype, 'sort',",
    "{configurable: true, writable: true, value:",
  "function sort(opt_comp) {",  // Bubble sort!
    "if (!this) throw TypeError();",
    "if (typeof opt_comp !== 'function') {",
      "opt_comp = undefined;",
    "}",
    "for (var i = 0; i < this.length; i++) {",
      "var changes = 0;",
      "for (var j = 0; j < this.length - i - 1; j++) {",
        "if (opt_comp ? (opt_comp(this[j], this[j + 1]) > 0) :",
            "(String(this[j]) > String(this[j + 1]))) {",
          "var swap = this[j];",
          "var hasSwap = j in this;",
          "if ((j + 1) in this) {",
            "this[j] = this[j + 1];",
          "} else {",
            "delete this[j];",
          "}",
          "if (hasSwap) {",
            "this[j + 1] = swap;",
          "} else {",
            "delete this[j + 1];",
          "}",
          "changes++;",
        "}",
      "}",
      "if (!changes) break;",
    "}",
    "return this;",
  "}",
"});",

"Object.defineProperty(Array.prototype, 'toLocaleString',",
    "{configurable: true, writable: true, value:",
  "function toLocaleString() {",
    "if (!this) throw TypeError();",
    "var o = Object(this);",
    "var out = [];",
    "for (var i = 0; i < o.length; i++) {",
      "out[i] = (o[i] === null || o[i] === undefined) ? '' : o[i].toLocaleString();",
    "}",
    "return out.join(',');",
  "}",
"});",
"");
};

/**
 * Initialize the String class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initString = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // String constructor.
  wrapper = function String(value) {
    value = arguments.length ? Interpreter.nativeGlobal.String(value) : '';
    if (thisInterpreter.calledWithNew()) {
      // Called as `new String()`.
      this.data = value;
      return this;
    } else {
      // Called as `String()`.
      return value;
    }
  };
  this.STRING = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'String', this.STRING,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on String.
  this.setProperty(this.STRING, 'fromCharCode',
      this.createNativeFunction(String.fromCharCode, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on String.
  // Methods with exclusively primitive arguments.
  var functions = ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf',
      'slice', 'substr', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
      'toLowerCase', 'toUpperCase', 'trim'];
  for (var i = 0; i < functions.length; i++) {
    this.setNativeFunctionPrototype(this.STRING, functions[i],
                                    String.prototype[functions[i]]);
  }

  wrapper = function localeCompare(compareString, locales, options) {
    locales = thisInterpreter.pseudoToNative(locales);
    options = thisInterpreter.pseudoToNative(options);
    try {
      return String(this).localeCompare(compareString, locales, options);
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.ERROR,
          'localeCompare: ' + e.message);
    }
  };
  this.setNativeFunctionPrototype(this.STRING, 'localeCompare', wrapper);

  wrapper = function split(separator, limit, callback) {
    var string = String(this);
    limit = limit ? Number(limit) : undefined;
    // Example of catastrophic split RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.split(/^(a+)+b/)
    if (thisInterpreter.isa(separator, thisInterpreter.REGEXP)) {
      separator = separator.data;
      thisInterpreter.maybeThrowRegExp(separator, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Interpreter.vm) {
          // Run split in vm.
          var sandbox = {
            'string': string,
            'separator': separator,
            'limit': limit
          };
          var code = 'string.split(separator, limit)';
          var jsList =
              thisInterpreter.vmCall(code, sandbox, separator, callback);
          if (jsList !== Interpreter.REGEXP_TIMEOUT) {
            callback(thisInterpreter.arrayNativeToPseudo(jsList));
          }
        } else {
          // Run split in separate thread.
          var splitWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(separator, splitWorker,
              callback);
          splitWorker.onmessage = function(e) {
            clearTimeout(pid);
            callback(thisInterpreter.arrayNativeToPseudo(e.data));
          };
          splitWorker.postMessage(['split', string, separator, limit]);
        }
        return;
      }
    }
    // Run split natively.
    var jsList = string.split(separator, limit);
    callback(thisInterpreter.arrayNativeToPseudo(jsList));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'split', wrapper);

  wrapper = function match(regexp, callback) {
    var string = String(this);
    if (thisInterpreter.isa(regexp, thisInterpreter.REGEXP)) {
      regexp = regexp.data;
    } else {
      regexp = new RegExp(regexp);
    }
    // Example of catastrophic match RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.match(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run match in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp
        };
        var code = 'string.match(regexp)';
        var m = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (m !== Interpreter.REGEXP_TIMEOUT) {
          callback(m && thisInterpreter.arrayNativeToPseudo(m));
        }
      } else {
        // Run match in separate thread.
        var matchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, matchWorker, callback);
        matchWorker.onmessage = function(e) {
          clearTimeout(pid);
          callback(e.data && thisInterpreter.arrayNativeToPseudo(e.data));
        };
        matchWorker.postMessage(['match', string, regexp]);
      }
      return;
    }
    // Run match natively.
    var m = string.match(regexp);
    callback(m && thisInterpreter.arrayNativeToPseudo(m));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'match', wrapper);

  wrapper = function search(regexp, callback) {
    var string = String(this);
    if (thisInterpreter.isa(regexp, thisInterpreter.REGEXP)) {
      regexp = regexp.data;
    } else {
      regexp = new RegExp(regexp);
    }
    // Example of catastrophic search RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.search(/^(a+)+b/)
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run search in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp
        };
        var code = 'string.search(regexp)';
        var n = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (n !== Interpreter.REGEXP_TIMEOUT) {
          callback(n);
        }
      } else {
        // Run search in separate thread.
        var searchWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, searchWorker, callback);
        searchWorker.onmessage = function(e) {
          clearTimeout(pid);
          callback(e.data);
        };
        searchWorker.postMessage(['search', string, regexp]);
      }
      return;
    }
    // Run search natively.
    callback(string.search(regexp));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'search', wrapper);

  wrapper = function replace_(substr, newSubstr, callback) {
    // Support for function replacements is the responsibility of a polyfill.
    var string = String(this);
    newSubstr = String(newSubstr);
    // Example of catastrophic replace RegExp:
    // 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac'.replace(/^(a+)+b/, '')
    if (thisInterpreter.isa(substr, thisInterpreter.REGEXP)) {
      substr = substr.data;
      thisInterpreter.maybeThrowRegExp(substr, callback);
      if (thisInterpreter['REGEXP_MODE'] === 2) {
        if (Interpreter.vm) {
          // Run replace in vm.
          var sandbox = {
            'string': string,
            'substr': substr,
            'newSubstr': newSubstr
          };
          var code = 'string.replace(substr, newSubstr)';
          var str = thisInterpreter.vmCall(code, sandbox, substr, callback);
          if (str !== Interpreter.REGEXP_TIMEOUT) {
            callback(str);
          }
        } else {
          // Run replace in separate thread.
          var replaceWorker = thisInterpreter.createWorker();
          var pid = thisInterpreter.regExpTimeout(substr, replaceWorker,
              callback);
          replaceWorker.onmessage = function(e) {
            clearTimeout(pid);
            callback(e.data);
          };
          replaceWorker.postMessage(['replace', string, substr, newSubstr]);
        }
        return;
      }
    }
    // Run replace natively.
    callback(string.replace(substr, newSubstr));
  };
  this.setAsyncFunctionPrototype(this.STRING, 'replace', wrapper);
  // Add a polyfill to handle replace's second argument being a function.
  this.polyfills_.push(
"(function() {",
  "var replace_ = String.prototype.replace;",
  "String.prototype.replace = function replace(substr, newSubstr) {",
    "if (typeof newSubstr !== 'function') {",
      // string.replace(string|regexp, string)
      "return replace_.call(this, substr, newSubstr);",
    "}",
    "var str = this;",
    "if (substr instanceof RegExp) {",  // string.replace(regexp, function)
      "var subs = [];",
      "var m = substr.exec(str);",
      "while (m) {",
        "m.push(m.index, str);",
        "var inject = newSubstr.apply(null, m);",
        "subs.push([m.index, m[0].length, inject]);",
        "m = substr.global ? substr.exec(str) : null;",
      "}",
      "for (var i = subs.length - 1; i >= 0; i--) {",
        "str = str.substring(0, subs[i][0]) + subs[i][2] + " +
            "str.substring(subs[i][0] + subs[i][1]);",
      "}",
    "} else {",                         // string.replace(string, function)
      "var i = str.indexOf(substr);",
      "if (i !== -1) {",
        "var inject = newSubstr(str.substr(i, substr.length), i, str);",
        "str = str.substring(0, i) + inject + " +
            "str.substring(i + substr.length);",
      "}",
    "}",
    "return str;",
  "};",
"})();",
"");
};

/**
 * Initialize the Boolean class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initBoolean = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Boolean constructor.
  wrapper = function Boolean(value) {
    value = Interpreter.nativeGlobal.Boolean(value);
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Boolean()`.
      this.data = value;
      return this;
    } else {
      // Called as `Boolean()`.
      return value;
    }
  };
  this.BOOLEAN = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Boolean', this.BOOLEAN,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize the Number class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initNumber = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Number constructor.
  wrapper = function Number(value) {
    value = arguments.length ? Interpreter.nativeGlobal.Number(value) : 0;
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Number()`.
      this.data = value;
      return this;
    } else {
      // Called as `Number()`.
      return value;
    }
  };
  this.NUMBER = this.createNativeFunction(wrapper, true);
  this.setProperty(globalObject, 'Number', this.NUMBER,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY',
                   'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i], Number[numConsts[i]],
        Interpreter.NONCONFIGURABLE_READONLY_NONENUMERABLE_DESCRIPTOR);
  }

  // Instance methods on Number.
  wrapper = function toExponential(fractionDigits) {
    try {
      return Number(this).toExponential(fractionDigits);
    } catch (e) {
      // Throws if fractionDigits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toExponential', wrapper);

  wrapper = function toFixed(digits) {
    try {
      return Number(this).toFixed(digits);
    } catch (e) {
      // Throws if digits isn't within 0-20.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toFixed', wrapper);

  wrapper = function toPrecision(precision) {
    try {
      return Number(this).toPrecision(precision);
    } catch (e) {
      // Throws if precision isn't within range (depends on implementation).
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toPrecision', wrapper);

  wrapper = function toString(radix) {
    try {
      return Number(this).toString(radix);
    } catch (e) {
      // Throws if radix isn't within 2-36.
      thisInterpreter.throwException(thisInterpreter.ERROR, e.message);
    }
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toString', wrapper);

  wrapper = function toLocaleString(locales, options) {
    locales = locales ? thisInterpreter.pseudoToNative(locales) : undefined;
    options = options ? thisInterpreter.pseudoToNative(options) : undefined;
    return Number(this).toLocaleString(locales, options);
  };
  this.setNativeFunctionPrototype(this.NUMBER, 'toLocaleString', wrapper);
};

/**
 * Initialize the Date class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initDate = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // Date constructor.
  wrapper = function Date(_value, var_args) {
    if (!thisInterpreter.calledWithNew()) {
      // Called as `Date()`.
      // Calling Date() as a function returns a string, no arguments are heeded.
      return Interpreter.nativeGlobal.Date();
    }
    // Called as `new Date(...)`.
    var args = [null].concat(Array.from(arguments));
    this.data = new (Function.prototype.bind.apply(
        Interpreter.nativeGlobal.Date, args));
    return this;
  };
  this.DATE = this.createNativeFunction(wrapper, true);
  this.DATE_PROTO = this.DATE.properties['prototype'];
  this.setProperty(globalObject, 'Date', this.DATE,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Static methods on Date.
  this.setProperty(this.DATE, 'now', this.createNativeFunction(Date.now, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.DATE, 'parse',
      this.createNativeFunction(Date.parse, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.DATE, 'UTC', this.createNativeFunction(Date.UTC, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Instance methods on Date.
  var functions = ['getDate', 'getDay', 'getFullYear', 'getHours',
      'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime',
      'getTimezoneOffset', 'getUTCDate', 'getUTCDay', 'getUTCFullYear',
      'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth',
      'getUTCSeconds', 'getYear',
      'setDate', 'setFullYear', 'setHours', 'setMilliseconds',
      'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
      'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes',
      'setUTCMonth', 'setUTCSeconds', 'setYear',
      'toDateString', 'toISOString', 'toJSON', 'toGMTString',
      'toLocaleDateString', 'toLocaleString', 'toLocaleTimeString',
      'toTimeString', 'toUTCString'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(var_args) {
        var date = this.data;
        if (!(date instanceof Date)) {
          thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
              nativeFunc + ' not called on a Date');
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = thisInterpreter.pseudoToNative(arguments[i]);
        }
        return date[nativeFunc].apply(date, args);
      };
    })(functions[i]);
    this.setNativeFunctionPrototype(this.DATE, functions[i], wrapper);
  }
};

/**
 * Initialize Regular Expression object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initRegExp = function(globalObject) {
  var thisInterpreter = this;
  var wrapper;
  // RegExp constructor.
  wrapper = function RegExp(pattern, flags) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new RegExp()`.
      var rgx = this;
    } else {
      // Called as `RegExp()`.
      if (flags === undefined &&
          thisInterpreter.isa(pattern, thisInterpreter.REGEXP)) {
        // Regexp(/foo/) returns the same obj.
        return pattern;
      }
      var rgx = thisInterpreter.createObjectProto(thisInterpreter.REGEXP_PROTO);
    }
    pattern = pattern === undefined ? '' : String(pattern);
    flags = flags ? String(flags) : '';
    thisInterpreter.populateRegExp(rgx,
        new Interpreter.nativeGlobal.RegExp(pattern, flags));
    return rgx;
  };
  this.REGEXP = this.createNativeFunction(wrapper, true);
  this.REGEXP_PROTO = this.REGEXP.properties['prototype'];
  this.setProperty(globalObject, 'RegExp', this.REGEXP,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  this.setProperty(this.REGEXP.properties['prototype'], 'global', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'ignoreCase', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'multiline', undefined,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.REGEXP.properties['prototype'], 'source', '(?:)',
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);

  // Use polyfill to avoid complexity of regexp threads.
  this.polyfills_.push(
"Object.defineProperty(RegExp.prototype, 'test',",
    "{configurable: true, writable: true, value:",
  "function test(str) {",
    "return !!this.exec(str);",
  "}",
"});");

  wrapper = function exec(string, callback) {
    var regexp = this.data;
    string = String(string);
    // Get lastIndex from wrapped regexp, since this is settable.
    regexp.lastIndex = Number(thisInterpreter.getProperty(this, 'lastIndex'));
    // Example of catastrophic exec RegExp:
    // /^(a+)+b/.exec('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac')
    thisInterpreter.maybeThrowRegExp(regexp, callback);
    if (thisInterpreter['REGEXP_MODE'] === 2) {
      if (Interpreter.vm) {
        // Run exec in vm.
        var sandbox = {
          'string': string,
          'regexp': regexp
        };
        var code = 'regexp.exec(string)';
        var match = thisInterpreter.vmCall(code, sandbox, regexp, callback);
        if (match !== Interpreter.REGEXP_TIMEOUT) {
          thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
          callback(matchToPseudo(match));
        }
      } else {
        // Run exec in separate thread.
        // Note that lastIndex is not preserved when a RegExp is passed to a
        // Web Worker.  Thus it needs to be passed back and forth separately.
        var execWorker = thisInterpreter.createWorker();
        var pid = thisInterpreter.regExpTimeout(regexp, execWorker, callback);
        var thisPseudoRegExp = this;
        execWorker.onmessage = function(e) {
          clearTimeout(pid);
          // Return tuple: [result, lastIndex]
          thisInterpreter.setProperty(thisPseudoRegExp, 'lastIndex', e.data[1]);
          callback(matchToPseudo(e.data[0]));
        };
        execWorker.postMessage(['exec', regexp, regexp.lastIndex, string]);
      }
      return;
    }
    // Run exec natively.
    var match = regexp.exec(string);
    thisInterpreter.setProperty(this, 'lastIndex', regexp.lastIndex);
    callback(matchToPseudo(match));

    function matchToPseudo(match) {
      if (match) {
        var result = thisInterpreter.arrayNativeToPseudo(match);
        // match has additional properties.
        thisInterpreter.setProperty(result, 'index', match.index);
        thisInterpreter.setProperty(result, 'input', match.input);
        return result;
      }
      return null;
    }
  };
  this.setAsyncFunctionPrototype(this.REGEXP, 'exec', wrapper);
};

/**
 * Initialize the Error class.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initError = function(globalObject) {
  var thisInterpreter = this;
  // Error constructor.
  this.ERROR = this.createNativeFunction(function Error(opt_message) {
    if (thisInterpreter.calledWithNew()) {
      // Called as `new Error()`.
      var newError = this;
    } else {
      // Called as `Error()`.
      var newError = thisInterpreter.createObject(thisInterpreter.ERROR);
    }
    thisInterpreter.populateError(newError, opt_message);
    return newError;
  }, true);
  this.setProperty(globalObject, 'Error', this.ERROR,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'message', '',
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(this.ERROR.properties['prototype'], 'name', 'Error',
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var createErrorSubclass = function(name) {
    var constructor = thisInterpreter.createNativeFunction(
        function(opt_message) {
          if (thisInterpreter.calledWithNew()) {
            // Called as `new XyzError()`.
            var newError = this;
          } else {
            // Called as `XyzError()`.
            var newError = thisInterpreter.createObject(constructor);
          }
          thisInterpreter.populateError(newError, opt_message);
          return newError;
        }, true);
    thisInterpreter.setProperty(constructor, 'prototype',
        thisInterpreter.createObject(thisInterpreter.ERROR),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(constructor.properties['prototype'], 'name',
        name, Interpreter.NONENUMERABLE_DESCRIPTOR);
    thisInterpreter.setProperty(globalObject, name, constructor,
        Interpreter.NONENUMERABLE_DESCRIPTOR);

    return constructor;
  };

  this.EVAL_ERROR = createErrorSubclass('EvalError');
  this.RANGE_ERROR = createErrorSubclass('RangeError');
  this.REFERENCE_ERROR = createErrorSubclass('ReferenceError');
  this.SYNTAX_ERROR = createErrorSubclass('SyntaxError');
  this.TYPE_ERROR = createErrorSubclass('TypeError');
  this.URI_ERROR = createErrorSubclass('URIError');
};

/**
 * Initialize Math object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initMath = function(globalObject) {
  var myMath = this.createObjectProto(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'Math', myMath,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  var mathConsts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI',
                    'SQRT1_2', 'SQRT2'];
  for (var i = 0; i < mathConsts.length; i++) {
    this.setProperty(myMath, mathConsts[i], Math[mathConsts[i]],
        Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  }
  var numFunctions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos',
                      'exp', 'floor', 'log', 'max', 'min', 'pow', 'random',
                      'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < numFunctions.length; i++) {
    this.setProperty(myMath, numFunctions[i],
        this.createNativeFunction(Math[numFunctions[i]], false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }
};

/**
 * Initialize JSON object.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Interpreter.prototype.initJSON = function(globalObject) {
  var thisInterpreter = this;
  var myJSON = thisInterpreter.createObjectProto(this.OBJECT_PROTO);
  this.setProperty(globalObject, 'JSON', myJSON,
      Interpreter.NONENUMERABLE_DESCRIPTOR);

  var wrapper = function parse(text) {
    try {
      var nativeObj = JSON.parse(String(text));
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.SYNTAX_ERROR, e.message);
    }
    return thisInterpreter.nativeToPseudo(nativeObj);
  };
  this.setProperty(myJSON, 'parse', this.createNativeFunction(wrapper, false));

  wrapper = function stringify(value, replacer, space) {
    if (replacer && replacer.class === 'Function') {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
          'Function replacer on JSON.stringify not supported');
    } else if (replacer && replacer.class === 'Array') {
      replacer = thisInterpreter.arrayPseudoToNative(replacer);
      replacer = replacer.filter(function(word) {
        // Spec says we should also support boxed primitives here.
        return typeof word === 'string' || typeof word === 'number';
      });
    } else {
      replacer = null;
    }
    // Spec says we should also support boxed primitives here.
    if (typeof space !== 'string' && typeof space !== 'number') {
      space = undefined;
    }

    var nativeObj = thisInterpreter.pseudoToNative(value);
    try {
      var str = JSON.stringify(nativeObj, replacer, space);
    } catch (e) {
      thisInterpreter.throwException(thisInterpreter.TYPE_ERROR, e.message);
    }
    return str;
  };
  this.setProperty(myJSON, 'stringify',
      this.createNativeFunction(wrapper, false));
};

/**
 * Is an object of a certain class?
 * @param {Interpreter.Value} child Object to check.
 * @param {Interpreter.Object} constructor Constructor of object.
 * @return {boolean} True if object is the class or inherits from it.
 *     False otherwise.
 */
Interpreter.prototype.isa = function(child, constructor) {
  if (child === null || child === undefined || !constructor) {
    return false;
  }
  var proto = constructor.properties['prototype'];
  if (child === proto) {
    return true;
  }
  // The first step up the prototype chain is harder since the child might be
  // a primitive value.  Subsequent steps can just follow the .proto property.
  child = this.getPrototype(child);
  while (child) {
    if (child === proto) {
      return true;
    }
    child = child.proto;
  }
  return false;
};

/**
 * Initialize a pseudo regular expression object based on a native regular
 * expression object.
 * @param {!Interpreter.Object} pseudoRegexp The existing object to set.
 * @param {!RegExp} nativeRegexp The native regular expression.
 */
Interpreter.prototype.populateRegExp = function(pseudoRegexp, nativeRegexp) {
  pseudoRegexp.data = new RegExp(nativeRegexp.source, nativeRegexp.flags);
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(pseudoRegexp, 'lastIndex', nativeRegexp.lastIndex,
      Interpreter.NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'source', nativeRegexp.source,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'global', nativeRegexp.global,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'ignoreCase', nativeRegexp.ignoreCase,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  this.setProperty(pseudoRegexp, 'multiline', nativeRegexp.multiline,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
};

/**
 * Initialize a pseudo error object.
 * @param {!Interpreter.Object} pseudoError The existing object to set.
 * @param {string=} opt_message Error's message.
 */
Interpreter.prototype.populateError = function(pseudoError, opt_message) {
  if (opt_message) {
    this.setProperty(pseudoError, 'message', String(opt_message),
        Interpreter.NONENUMERABLE_DESCRIPTOR);
  }
  var tracebackData = [];
  for (var i = this.stateStack.length - 1; i >= 0; i--) {
    var state = this.stateStack[i];
    var node = state.node;
    if (node['type'] === 'CallExpression') {
      var func = state.func_;
      if (func && tracebackData.length) {
        tracebackData[tracebackData.length - 1].name =
            this.getProperty(func, 'name');
      }
    }
    if (node['loc'] &&
        (!tracebackData.length || node['type'] === 'CallExpression')) {
      tracebackData.push({loc: node['loc']});
    }
  }
  var name = String(this.getProperty(pseudoError, 'name'));
  var message = String(this.getProperty(pseudoError, 'message'));
  var stackString = name + ': ' + message + '\n';
  for (var i = 0; i < tracebackData.length; i++) {
    var loc = tracebackData[i].loc;
    var name = tracebackData[i].name;
    var locString = loc['source'] + ':' +
        loc['start']['line'] + ':' + loc['start']['column'];
    if (name) {
      stackString += '  at ' + name + ' (' + locString + ')\n';
    } else {
      stackString += '  at ' + locString + '\n';
    }
  }
  this.setProperty(pseudoError, 'stack', stackString.trim(),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Create a Web Worker to execute regular expressions.
 * Using a separate file fails in Chrome when run locally on a file:// URI.
 * Using a data encoded URI fails in IE and Edge.
 * Using a blob works in IE11 and all other browsers.
 * @return {!Worker} Web Worker with regexp execution code loaded.
 */
Interpreter.prototype.createWorker = function() {
  var blob = this.createWorker.blob_;
  if (!blob) {
    blob = new Blob([Interpreter.WORKER_CODE.join('\n')],
        {type: 'application/javascript'});
    // Cache the blob, so it doesn't need to be created next time.
    this.createWorker.blob_ = blob;
  }
  return new Worker(URL.createObjectURL(blob));
};

/**
 * Execute regular expressions in a node vm.
 * @param {string} code Code to execute.
 * @param {!Object} sandbox Global variables for new vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Interpreter.prototype.vmCall = function(code, sandbox, nativeRegExp, callback) {
  var options = {'timeout': this['REGEXP_THREAD_TIMEOUT']};
  try {
    return Interpreter.vm['runInNewContext'](code, sandbox, options);
  } catch (e) {
    callback(null);
    this.throwException(this.ERROR, 'RegExp Timeout: ' + nativeRegExp);
  }
  return Interpreter.REGEXP_TIMEOUT;
};

/**
 * If REGEXP_MODE is 0, then throw an error.
 * Also throw if REGEXP_MODE is 2 and JS doesn't support Web Workers or vm.
 * @param {!RegExp} nativeRegExp Regular expression.
 * @param {!Function} callback Asynchronous callback function.
 */
Interpreter.prototype.maybeThrowRegExp = function(nativeRegExp, callback) {
  var ok;
  if (this['REGEXP_MODE'] === 0) {
    // Fail: No RegExp support.
    ok = false;
  } else if (this['REGEXP_MODE'] === 1) {
    // Ok: Native RegExp support.
    ok = true;
  } else {
    // Sandboxed RegExp handling.
    if (Interpreter.vm) {
      // Ok: Node's vm module already loaded.
      ok = true;
    } else if (typeof Worker === 'function' && typeof URL === 'function') {
      // Ok: Web Workers available.
      ok = true;
    } else if (typeof require === 'function') {
      // Try to load Node's vm module.
      try {
        Interpreter.vm = require('vm');
      } catch (e) {}
      ok = !!Interpreter.vm;
    } else {
      // Fail: Neither Web Workers nor vm available.
      ok = false;
    }
  }
  if (!ok) {
    callback(null);
    this.throwException(this.ERROR, 'Regular expressions not supported: ' +
        nativeRegExp);
  }
};

/**
 * Set a timeout for regular expression threads.  Unless cancelled, this will
 * terminate the thread and throw an error.
 * @param {!RegExp} nativeRegExp Regular expression (used for error message).
 * @param {!Worker} worker Thread to terminate.
 * @param {!Function} callback Async callback function to continue execution.
 * @return {number} PID of timeout.  Used to cancel if thread completes.
 */
Interpreter.prototype.regExpTimeout = function(nativeRegExp, worker, callback) {
  var thisInterpreter = this;
  return setTimeout(function() {
      worker.terminate();
      callback(null);
      try {
        thisInterpreter.throwException(thisInterpreter.ERROR,
            'RegExp Timeout: ' + nativeRegExp);
      } catch (e) {
        // Eat the expected Interpreter.STEP_ERROR.
      }
  }, this['REGEXP_THREAD_TIMEOUT']);
};

/**
 * Create a new data object based on a constructor's prototype.
 * @param {Interpreter.Object} constructor Parent constructor function,
 *     or null if scope object.
 * @return {!Interpreter.Object} New data object.
 */
Interpreter.prototype.createObject = function(constructor) {
  return this.createObjectProto(constructor &&
                                constructor.properties['prototype']);
};

/**
 * Create a new data object based on a prototype.
 * @param {Interpreter.Object} proto Prototype object.
 * @return {!Interpreter.Object} New data object.
 */
Interpreter.prototype.createObjectProto = function(proto) {
  if (typeof proto !== 'object') {
    throw Error('Non object prototype');
  }
  var obj = new Interpreter.Object(proto);
  if (this.isa(obj, this.ERROR)) {
    // Record this object as being an error so that its toString function can
    // process it correctly (toString has no access to the interpreter and could
    // not otherwise determine that the object is an error).
    obj.class = 'Error';
  }
  return obj;
};

/**
 * Create a new array.
 * @return {!Interpreter.Object} New array.
 */
Interpreter.prototype.createArray = function() {
  var array = this.createObjectProto(this.ARRAY_PROTO);
  // Arrays have length.
  this.setProperty(array, 'length', 0,
      {configurable: false, enumerable: false, writable: true});
  array.class = 'Array';
  return array;
};

/**
 * Create a new function object (could become interpreted or native or async).
 * @param {number} argumentLength Number of arguments.
 * @param {boolean} isConstructor True if function can be used with 'new'.
 * @return {!Interpreter.Object} New function.
 * @private
 */
Interpreter.prototype.createFunctionBase_ = function(argumentLength,
                                                     isConstructor) {
  var func = this.createObjectProto(this.FUNCTION_PROTO);
  if (isConstructor) {
    var proto = this.createObjectProto(this.OBJECT_PROTO);
    this.setProperty(func, 'prototype', proto,
                     Interpreter.NONENUMERABLE_DESCRIPTOR);
    this.setProperty(proto, 'constructor', func,
                     Interpreter.NONENUMERABLE_DESCRIPTOR);
  } else {
    func.illegalConstructor = true;
  }
  this.setProperty(func, 'length', argumentLength,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  func.class = 'Function';
  // When making changes to this function, check to see if those changes also
  // need to be made to the creation of FUNCTION_PROTO in initFunction.
  return func;
};

/**
 * Create a new interpreted function.
 * @param {!Object} node AST node defining the function.
 * @param {!Interpreter.Scope} scope Parent scope.
 * @param {string=} opt_name Optional name for function.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createFunction = function(node, scope, opt_name) {
  var func = this.createFunctionBase_(node['params'].length, true);
  func.parentScope = scope;
  func.node = node;
  // Choose a name for this function.
  // function foo() {}             -> 'foo'
  // var bar = function() {};      -> 'bar'
  // var bar = function foo() {};  -> 'foo'
  // foo.bar = function() {};      -> ''
  // var bar = new Function('');   -> 'anonymous'
  var name = node['id'] ? String(node['id']['name']) : (opt_name || '');
  this.setProperty(func, 'name', name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @param {boolean} isConstructor True if function can be used with 'new'.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc,
                                                      isConstructor) {
  var func = this.createFunctionBase_(nativeFunc.length, isConstructor);
  func.nativeFunc = nativeFunc;
  nativeFunc.id = this.functionCounter_++;
  this.setProperty(func, 'name', nativeFunc.name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createAsyncFunction = function(asyncFunc) {
  var func = this.createFunctionBase_(asyncFunc.length, true);
  func.asyncFunc = asyncFunc;
  asyncFunc.id = this.functionCounter_++;
  this.setProperty(func, 'name', asyncFunc.name,
      Interpreter.READONLY_NONENUMERABLE_DESCRIPTOR);
  return func;
};

/**
 * Converts from a native JavaScript object or value to a JS-Interpreter object.
 * Can handle JSON-style values, regular expressions, dates and functions.
 * Does NOT handle cycles.
 * @param {*} nativeObj The native JavaScript object to be converted.
 * @return {Interpreter.Value} The equivalent JS-Interpreter object.
 */
Interpreter.prototype.nativeToPseudo = function(nativeObj) {
  if (nativeObj instanceof Interpreter.Object) {
    throw Error('Object is already pseudo');
  }
  if ((typeof nativeObj !== 'object' && typeof nativeObj !== 'function') ||
      nativeObj === null) {
    return nativeObj;
  }

  if (nativeObj instanceof RegExp) {
    var pseudoRegexp = this.createObjectProto(this.REGEXP_PROTO);
    this.populateRegExp(pseudoRegexp, nativeObj);
    return pseudoRegexp;
  }

  if (nativeObj instanceof Date) {
    var pseudoDate = this.createObjectProto(this.DATE_PROTO);
    pseudoDate.data = new Date(nativeObj.valueOf());
    return pseudoDate;
  }

  if (typeof nativeObj === 'function') {
    var thisInterpreter = this;
    var wrapper = function() {
      var args = Array.prototype.slice.call(arguments).map(function(i) {
          return thisInterpreter.pseudoToNative(i);
      });
      var value = nativeObj.apply(thisInterpreter, args);
      return thisInterpreter.nativeToPseudo(value);
    };
    var prototype = Object.getOwnPropertyDescriptor(nativeObj, 'prototype');
    return this.createNativeFunction(wrapper, !!prototype);
  }

  if (Array.isArray(nativeObj)) {  // Array.
    var pseudoArray = this.createArray();
    for (var i = 0; i < nativeObj.length; i++) {
      if (i in nativeObj) {
        this.setProperty(pseudoArray, i, this.nativeToPseudo(nativeObj[i]));
      }
    }
    return pseudoArray;
  }

  // Object.
  var pseudoObj = this.createObjectProto(this.OBJECT_PROTO);
  for (var key in nativeObj) {
    this.setProperty(pseudoObj, key, this.nativeToPseudo(nativeObj[key]));
  }
  return pseudoObj;
};

/**
 * Converts from a JS-Interpreter object to native JavaScript object.
 * Can handle JSON-style values, regular expressions, and dates.
 * Does handle cycles.
 * @param {Interpreter.Value} pseudoObj The JS-Interpreter object to be
 * converted.
 * @param {Object=} opt_cycles Cycle detection (used in recursive calls).
 * @return {*} The equivalent native JavaScript object or value.
 */
Interpreter.prototype.pseudoToNative = function(pseudoObj, opt_cycles) {
  if ((typeof pseudoObj !== 'object' && typeof pseudoObj !== 'function') ||
      pseudoObj === null) {
    return pseudoObj;
  }
  if (!(pseudoObj instanceof Interpreter.Object)) {
    throw Error('Object is not pseudo');
  }

  if (this.isa(pseudoObj, this.REGEXP)) {  // Regular expression.
    var nativeRegExp = new RegExp(pseudoObj.data.source, pseudoObj.data.flags);
    nativeRegExp.lastIndex = pseudoObj.data.lastIndex;
    return nativeRegExp;
  }

  if (this.isa(pseudoObj, this.DATE)) {  // Date.
    return new Date(pseudoObj.data.valueOf());
  }

  var cycles = opt_cycles || {
    pseudo: [],
    native: []
  };
  var i = cycles.pseudo.indexOf(pseudoObj);
  if (i !== -1) {
    return cycles.native[i];
  }
  cycles.pseudo.push(pseudoObj);
  var nativeObj;
  if (this.isa(pseudoObj, this.ARRAY)) {  // Array.
    nativeObj = [];
    cycles.native.push(nativeObj);
    var len = this.getProperty(pseudoObj, 'length');
    for (var i = 0; i < len; i++) {
      if (this.hasProperty(pseudoObj, i)) {
        nativeObj[i] =
            this.pseudoToNative(this.getProperty(pseudoObj, i), cycles);
      }
    }
  } else {  // Object.
    nativeObj = {};
    cycles.native.push(nativeObj);
    var val;
    for (var key in pseudoObj.properties) {
      val = this.pseudoToNative(pseudoObj.properties[key], cycles);
      // Use defineProperty to avoid side effects if setting '__proto__'.
      Object.defineProperty(nativeObj, key,
          {value: val, writable: true, enumerable: true, configurable: true});
    }
  }
  cycles.pseudo.pop();
  cycles.native.pop();
  return nativeObj;
};

/**
 * Converts from a native JavaScript array to a JS-Interpreter array.
 * Does handle non-numeric properties (like str.match's index prop).
 * Does NOT recurse into the array's contents.
 * @param {!Array} nativeArray The JavaScript array to be converted.
 * @return {!Interpreter.Object} The equivalent JS-Interpreter array.
 */
Interpreter.prototype.arrayNativeToPseudo = function(nativeArray) {
  var pseudoArray = this.createArray();
  var props = Object.getOwnPropertyNames(nativeArray);
  for (var i = 0; i < props.length; i++) {
    this.setProperty(pseudoArray, props[i], nativeArray[props[i]]);
  }
  return pseudoArray;
};

/**
 * Converts from a JS-Interpreter array to native JavaScript array.
 * Does handle non-numeric properties (like str.match's index prop).
 * Does NOT recurse into the array's contents.
 * @param {!Interpreter.Object} pseudoArray The JS-Interpreter array,
 *     or JS-Interpreter object pretending to be an array.
 * @return {!Array} The equivalent native JavaScript array.
 */
Interpreter.prototype.arrayPseudoToNative = function(pseudoArray) {
  var nativeArray = [];
  for (var key in pseudoArray.properties) {
    nativeArray[key] = this.getProperty(pseudoArray, key);
  }
  // pseudoArray might be an object pretending to be an array.  In this case
  // it's possible that length is non-existent, invalid, or smaller than the
  // largest defined numeric property.  Set length explicitly here.
  nativeArray.length = Interpreter.legalArrayLength(
      this.getProperty(pseudoArray, 'length')) || 0;
  return nativeArray;
};

/**
 * Look up the prototype for this value.
 * @param {Interpreter.Value} value Data object.
 * @return {Interpreter.Object} Prototype object, null if none.
 */
Interpreter.prototype.getPrototype = function(value) {
  switch (typeof value) {
    case 'number':
      return this.NUMBER.properties['prototype'];
    case 'boolean':
      return this.BOOLEAN.properties['prototype'];
    case 'string':
      return this.STRING.properties['prototype'];
  }
  if (value) {
    return value.proto;
  }
  return null;
};

/**
 * Fetch a property value from a data object.
 * @param {Interpreter.Value} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @return {Interpreter.Value} Property value (may be undefined).
 */
Interpreter.prototype.getProperty = function(obj, name) {
  if (this.getterStep_) {
    throw Error('Getter not supported in that context');
  }
  name = String(name);
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot read property '" + name + "' of " + obj);
  }
  if (typeof obj === 'object' && !(obj instanceof Interpreter.Object)) {
    throw TypeError('Expecting native value or pseudo object');
  }
  if (name === 'length') {
    // Special cases for magic length property.
    if (this.isa(obj, this.STRING)) {
      return String(obj).length;
    }
  } else if (name.charCodeAt(0) < 0x40) {
    // Might have numbers in there?
    // Special cases for string array indexing
    if (this.isa(obj, this.STRING)) {
      var n = Interpreter.legalArrayIndex(name);
      if (!isNaN(n) && n < String(obj).length) {
        return String(obj)[n];
      }
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      var getter = obj.getter[name];
      if (getter) {
        // Flag this function as being a getter and thus needing immediate
        // execution (rather than being the value of the property).
        this.getterStep_ = true;
        return getter;
      }
      return obj.properties[name];
    }
  } while ((obj = this.getPrototype(obj)));
  return undefined;
};

/**
 * Does the named property exist on a data object.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @return {boolean} True if property exists.
 */
Interpreter.prototype.hasProperty = function(obj, name) {
  if (!(obj instanceof Interpreter.Object)) {
    throw TypeError('Primitive data type has no properties');
  }
  name = String(name);
  if (name === 'length' && this.isa(obj, this.STRING)) {
    return true;
  }
  if (this.isa(obj, this.STRING)) {
    var n = Interpreter.legalArrayIndex(name);
    if (!isNaN(n) && n < String(obj).length) {
      return true;
    }
  }
  do {
    if (obj.properties && name in obj.properties) {
      return true;
    }
  } while ((obj = this.getPrototype(obj)));
  return false;
};

/**
 * Set a property value on a data object.
 * @param {Interpreter.Value} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {Interpreter.Value} value New property value.
 *     Use Interpreter.VALUE_IN_DESCRIPTOR if value is handled by
 *     descriptor instead.
 * @param {Object=} opt_descriptor Optional descriptor object.
 * @return {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setProperty = function(obj, name, value, opt_descriptor) {
  if (this.setterStep_) {
    // Getter from previous call to setProperty was not handled.
    throw Error('Setter not supported in that context');
  }
  name = String(name);
  if (obj === undefined || obj === null) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot set property '" + name + "' of " + obj);
  }
  if (typeof obj === 'object' && !(obj instanceof Interpreter.Object)) {
    throw TypeError('Expecting native value or pseudo object');
  }
  if (opt_descriptor && ('get' in opt_descriptor || 'set' in opt_descriptor) &&
      ('value' in opt_descriptor || 'writable' in opt_descriptor)) {
    this.throwException(this.TYPE_ERROR, 'Invalid property descriptor. ' +
        'Cannot both specify accessors and a value or writable attribute');
  }
  var strict = !this.stateStack || this.getScope().strict;
  if (!(obj instanceof Interpreter.Object)) {
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't create property '" + name +
                          "' on '" + obj + "'");
    }
    return;
  }
  if (this.isa(obj, this.STRING)) {
    var n = Interpreter.legalArrayIndex(name);
    if (name === 'length' || (!isNaN(n) && n < String(obj).length)) {
      // Can't set length or letters on String objects.
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
            "property '" + name + "' of String '" + obj.data + "'");
      }
      return;
    }
  }
  if (obj.class === 'Array') {
    // Arrays have a magic length variable that is bound to the elements.
    var len = obj.properties.length;
    var i;
    if (name === 'length') {
      // Delete elements if length is smaller.
      if (opt_descriptor) {
        if (!('value' in opt_descriptor)) {
          return;
        }
        value = opt_descriptor.value;
      }
      value = Interpreter.legalArrayLength(value);
      if (isNaN(value)) {
        this.throwException(this.RANGE_ERROR, 'Invalid array length');
      }
      if (value < len) {
        for (i in obj.properties) {
          i = Interpreter.legalArrayIndex(i);
          if (!isNaN(i) && value <= i) {
            delete obj.properties[i];
          }
        }
      }
    } else if (!isNaN(i = Interpreter.legalArrayIndex(name))) {
      // Increase length if this index is larger.
      obj.properties.length = Math.max(len, i + 1);
    }
  }
  if (obj.preventExtensions && !(name in obj.properties)) {
    if (strict) {
      this.throwException(this.TYPE_ERROR, "Can't add property '" + name +
                          "', object is not extensible");
    }
    return;
  }
  if (opt_descriptor) {
    // Define the property.
    var descriptor = {};
    if ('get' in opt_descriptor && opt_descriptor.get) {
      obj.getter[name] = opt_descriptor.get;
      descriptor.get = this.setProperty.placeholderGet_;
    }
    if ('set' in opt_descriptor && opt_descriptor.set) {
      obj.setter[name] = opt_descriptor.set;
      descriptor.set = this.setProperty.placeholderSet_;
    }
    if ('configurable' in opt_descriptor) {
      descriptor.configurable = opt_descriptor.configurable;
    }
    if ('enumerable' in opt_descriptor) {
      descriptor.enumerable = opt_descriptor.enumerable;
    }
    if ('writable' in opt_descriptor) {
      descriptor.writable = opt_descriptor.writable;
      delete obj.getter[name];
      delete obj.setter[name];
    }
    if ('value' in opt_descriptor) {
      descriptor.value = opt_descriptor.value;
      delete obj.getter[name];
      delete obj.setter[name];
    } else if (value !== Interpreter.VALUE_IN_DESCRIPTOR) {
      descriptor.value = value;
      delete obj.getter[name];
      delete obj.setter[name];
    }
    try {
      Object.defineProperty(obj.properties, name, descriptor);
    } catch (e) {
      this.throwException(this.TYPE_ERROR, 'Cannot redefine property: ' + name);
    }
    // Now that the definition has suceeded, clean up any obsolete get/set funcs.
    if ('get' in opt_descriptor && !opt_descriptor.get) {
      delete obj.getter[name];
    }
    if ('set' in opt_descriptor && !opt_descriptor.set) {
      delete obj.setter[name];
    }
  } else {
    // Set the property.
    if (value === Interpreter.VALUE_IN_DESCRIPTOR) {
      throw ReferenceError('Value not specified.');
    }
    // Determine the parent (possibly self) where the property is defined.
    var defObj = obj;
    while (!(name in defObj.properties)) {
      defObj = this.getPrototype(defObj);
      if (!defObj) {
        // This is a new property.
        defObj = obj;
        break;
      }
    }
    if (defObj.setter && defObj.setter[name]) {
      this.setterStep_ = true;
      return defObj.setter[name];
    }
    if (defObj.getter && defObj.getter[name]) {
      if (strict) {
        this.throwException(this.TYPE_ERROR, "Cannot set property '" + name +
            "' of object '" + obj + "' which only has a getter");
      }
    } else {
      // No setter, simple assignment.
      try {
        obj.properties[name] = value;
      } catch (e) {
        if (strict) {
          this.throwException(this.TYPE_ERROR, "Cannot assign to read only " +
              "property '" + name + "' of object '" + obj + "'");
        }
      }
    }
  }
};

Interpreter.prototype.setProperty.placeholderGet_ = function() {throw Error('Placeholder getter');};
Interpreter.prototype.setProperty.placeholderSet_ = function() {throw Error('Placeholder setter');};

/**
 * Convenience method for adding a native function as a non-enumerable property
 * onto an object's prototype.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {!Function} wrapper Function object.
 */
Interpreter.prototype.setNativeFunctionPrototype =
    function(obj, name, wrapper) {
  this.setProperty(obj.properties['prototype'], name,
      this.createNativeFunction(wrapper, false),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Convenience method for adding an async function as a non-enumerable property
 * onto an object's prototype.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {!Function} wrapper Function object.
 */
Interpreter.prototype.setAsyncFunctionPrototype =
    function(obj, name, wrapper) {
  this.setProperty(obj.properties['prototype'], name,
      this.createAsyncFunction(wrapper),
      Interpreter.NONENUMERABLE_DESCRIPTOR);
};

/**
 * Returns the current scope from the stateStack.
 * @return {!Interpreter.Scope} Current scope.
 */
Interpreter.prototype.getScope = function() {
  var scope = this.stateStack[this.stateStack.length - 1].scope;
  if (!scope) {
    throw Error('No scope found.');
  }
  return scope;
};

/**
 * Create a new scope dictionary.
 * @param {!Object} node AST node defining the scope container
 *     (e.g. a function).
 * @param {Interpreter.Scope} parentScope Scope to link to.
 * @return {!Interpreter.Scope} New scope.
 */
Interpreter.prototype.createScope = function(node, parentScope) {
  // Determine if this scope starts with `use strict`.
  var strict = false;
  if (parentScope && parentScope.strict) {
    strict = true;
  } else {
    var firstNode = node['body'] && node['body'][0];
    if (firstNode && firstNode.expression &&
        firstNode.expression['type'] === 'Literal' &&
        firstNode.expression.value === 'use strict') {
      strict = true;
    }
  }
  var object = this.createObjectProto(null);
  var scope = new Interpreter.Scope(parentScope, strict, object);
  if (!parentScope) {
    this.initGlobal(scope.object);
  }
  this.populateScope_(node, scope);
  return scope;
};

/**
 * Create a new special scope dictionary. Similar to createScope(), but
 * doesn't assume that the scope is for a function body.
 * This is used for 'catch' clauses and 'with' statements.
 * @param {!Interpreter.Scope} parentScope Scope to link to.
 * @param {Interpreter.Object=} opt_object Optional object to transform into
 *     scope.
 * @return {!Interpreter.Scope} New scope.
 */
Interpreter.prototype.createSpecialScope = function(parentScope, opt_object) {
  if (!parentScope) {
    throw Error('parentScope required');
  }
  var object = opt_object || this.createObjectProto(null);
  return new Interpreter.Scope(parentScope, parentScope.strict, object);
};

/**
 * Retrieves a value from the scope chain.
 * @param {string} name Name of variable.
 * @return {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValueFromScope = function(name) {
  var scope = this.getScope();
  while (scope && scope !== this.globalScope) {
    if (name in scope.object.properties) {
      return scope.object.properties[name];
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has inherited properties and
  // could also have getters.
  if (scope === this.globalScope && this.hasProperty(scope.object, name)) {
    return this.getProperty(scope.object, name);
  }
  // Typeof operator is unique: it can safely look at non-defined variables.
  var prevNode = this.stateStack[this.stateStack.length - 1].node;
  if (prevNode['type'] === 'UnaryExpression' &&
      prevNode['operator'] === 'typeof') {
    return undefined;
  }
  this.throwException(this.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * Sets a value to the current scope.
 * @param {string} name Name of variable.
 * @param {Interpreter.Value} value Value.
 * @return {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValueToScope = function(name, value) {
  var scope = this.getScope();
  var strict = scope.strict;
  while (scope && scope !== this.globalScope) {
    if (name in scope.object.properties) {
      scope.object.properties[name] = value;
      return undefined;
    }
    scope = scope.parentScope;
  }
  // The root scope is also an object which has readonly properties and
  // could also have setters.
  if (scope === this.globalScope &&
      (!strict || this.hasProperty(scope.object, name))) {
    return this.setProperty(scope.object, name, value);
  }
  this.throwException(this.REFERENCE_ERROR, name + ' is not defined');
};

/**
 * Create a new scope for the given node.
 * @param {!Object} node AST node (program or function).
 * @param {!Interpreter.Scope} scope Scope dictionary to populate.
 * @private
 */
Interpreter.prototype.populateScope_ = function(node, scope) {
  if (node['type'] === 'VariableDeclaration') {
    for (var i = 0; i < node['declarations'].length; i++) {
      this.setProperty(scope.object, node['declarations'][i]['id']['name'],
          undefined, Interpreter.VARIABLE_DESCRIPTOR);
    }
  } else if (node['type'] === 'FunctionDeclaration') {
    this.setProperty(scope.object, node['id']['name'],
        this.createFunction(node, scope), Interpreter.VARIABLE_DESCRIPTOR);
    return;  // Do not recurse into function.
  } else if (node['type'] === 'FunctionExpression') {
    return;  // Do not recurse into function.
  } else if (node['type'] === 'ExpressionStatement') {
    return;  // Expressions can't contain variable/function declarations.
  }
  var nodeClass = node['constructor'];
  for (var name in node) {
    var prop = node[name];
    if (prop && typeof prop === 'object') {
      if (Array.isArray(prop)) {
        for (var i = 0; i < prop.length; i++) {
          if (prop[i] && prop[i].constructor === nodeClass) {
            this.populateScope_(prop[i], scope);
          }
        }
      } else {
        if (prop.constructor === nodeClass) {
          this.populateScope_(prop, scope);
        }
      }
    }
  }
};

/**
 * Is the current state directly being called with as a construction with 'new'.
 * @return {boolean} True if 'new foo()', false if 'foo()'.
 */
Interpreter.prototype.calledWithNew = function() {
  return this.stateStack[this.stateStack.length - 1].isConstructor;
};

/**
 * Gets a value from the scope chain or from an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @return {Interpreter.Value} Any value.
 *   May be flagged as being a getter and thus needing immediate execution
 *   (rather than being the value of the property).
 */
Interpreter.prototype.getValue = function(ref) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.getValueFromScope(ref[1]);
  } else {
    // An obj/prop components tuple (foo.bar).
    return this.getProperty(ref[0], ref[1]);
  }
};

/**
 * Sets a value to the scope chain or to an object property.
 * @param {!Array} ref Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value.
 * @return {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setValue = function(ref, value) {
  if (ref[0] === Interpreter.SCOPE_REFERENCE) {
    // A null/varname variable lookup.
    return this.setValueToScope(ref[1], value);
  } else {
    // An obj/prop components tuple (foo.bar).
    return this.setProperty(ref[0], ref[1], value);
  }
};

/**
 * Throw an exception in the interpreter that can be handled by an
 * interpreter try/catch statement.  If unhandled, a real exception will
 * be thrown.  Can be called with either an error class and a message, or
 * with an actual object to be thrown.
 * @param {!Interpreter.Object|Interpreter.Value} errorClass Type of error
 *   (if message is provided) or the value to throw (if no message).
 * @param {string=} opt_message Message being thrown.
 */
Interpreter.prototype.throwException = function(errorClass, opt_message) {
  if (opt_message === undefined) {
    var error = errorClass;  // This is a value to throw, not an error class.
  } else {
    var error = this.createObject(errorClass);
    this.populateError(error, opt_message);
  }
  this.unwind(Interpreter.Completion.THROW, error, undefined);
  // Abort anything related to the current step.
  throw Interpreter.STEP_ERROR;
};

/**
 * Unwind the stack to the innermost relevant enclosing TryStatement,
 * For/ForIn/WhileStatement or Call/NewExpression.  If this results in
 * the stack being completely unwound the thread will be terminated
 * and the appropriate error being thrown.
 * @param {Interpreter.Completion} type Completion type.
 * @param {Interpreter.Value} value Value computed, returned or thrown.
 * @param {string|undefined} label Target label for break or return.
 */
Interpreter.prototype.unwind = function(type, value, label) {
  if (type === Interpreter.Completion.NORMAL) {
    throw TypeError('Should not unwind for NORMAL completions');
  }

  loop: for (var stack = this.stateStack; stack.length > 0; stack.pop()) {
    var state = stack[stack.length - 1];
    switch (state.node['type']) {
      case 'TryStatement':
        state.cv = {type: type, value: value, label: label};
        return;
      case 'CallExpression':
      case 'NewExpression':
        if (type === Interpreter.Completion.RETURN) {
          state.value = value;
          return;
        } else if (type !== Interpreter.Completion.THROW) {
          throw Error('Unsynatctic break/continue not rejected by Acorn');
        }
        break;
      case 'Program':
        // Don't pop the stateStack.
        // Leave the root scope on the tree in case the program is appended to.
        state.done = true;
        break loop;
    }
    if (type === Interpreter.Completion.BREAK) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          (state.isLoop || state.isSwitch)) {
        stack.pop();
        return;
      }
    } else if (type === Interpreter.Completion.CONTINUE) {
      if (label ? (state.labels && state.labels.indexOf(label) !== -1) :
          state.isLoop) {
        return;
      }
    }
  }

  // Unhandled completion.  Throw a real error.
  var realError;
  if (this.isa(value, this.ERROR)) {
    var errorTable = {
      'EvalError': EvalError,
      'RangeError': RangeError,
      'ReferenceError': ReferenceError,
      'SyntaxError': SyntaxError,
      'TypeError': TypeError,
      'URIError': URIError
    };
    var name = String(this.getProperty(value, 'name'));
    var message = this.getProperty(value, 'message').valueOf();
    var errorConstructor = errorTable[name] || Error;
    realError = errorConstructor(message);
    realError.stack = String(this.getProperty(value, 'stack'));
  } else {
    realError = String(value);
  }
  throw realError;
};

/**
 * Create a call to a getter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @private
 */
Interpreter.prototype.createGetter_ = function(func, left) {
  if (!this.getterStep_) {
    throw Error('Unexpected call to createGetter');
  }
  // Clear the getter flag.
  this.getterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is explicitly provided (o).
  var funcThis = Array.isArray(left) ? left[0] : left;
  var node = new this.newNode();
  node['type'] = 'CallExpression';
  var state = new Interpreter.State(node,
      this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [];
  return state;
};

/**
 * Create a call to a setter function.
 * @param {!Interpreter.Object} func Function to execute.
 * @param {!Interpreter.Object|!Array} left
 *     Name of variable or object/propname tuple.
 * @param {Interpreter.Value} value Value to set.
 * @private
 */
Interpreter.prototype.createSetter_ = function(func, left, value) {
  if (!this.setterStep_) {
    throw Error('Unexpected call to createSetter');
  }
  // Clear the setter flag.
  this.setterStep_ = false;
  // Normally `this` will be specified as the object component (o.x).
  // Sometimes `this` is implicitly the global object (x).
  var funcThis = Array.isArray(left) ? left[0] : this.globalObject;
  var node = new this.newNode();
  node['type'] = 'CallExpression';
  var state = new Interpreter.State(node,
      this.stateStack[this.stateStack.length - 1].scope);
  state.doneCallee_ = 2;
  state.funcThis_ = funcThis;
  state.func_ = func;
  state.doneArgs_ = true;
  state.arguments_ = [value];
  return state;
};

/**
 * In non-strict mode `this` must be an object.
 * Must not be called in strict mode.
 * @param {Interpreter.Value} value Proposed value for `this`.
 * @return {!Interpreter.Object} Final value for `this`.
 * @private
 */
Interpreter.prototype.boxThis_ = function(value) {
  if (value === undefined || value === null) {
    // `Undefined` and `null` are changed to the global object.
    return this.globalObject;
  }
  if (!(value instanceof Interpreter.Object)) {
    // Primitives must be boxed.
    var box = this.createObjectProto(this.getPrototype(value));
    box.data = value;
    return box;
  }
  return value;
};

/**
 * Return the global scope object.
 * @return {!Interpreter.Scope} Scope object.
 */
Interpreter.prototype.getGlobalScope = function() {
  return this.globalScope;
};

/**
 * Return the state stack.
 * @return {!Array<!Interpreter.State>} State stack.
 */
Interpreter.prototype.getStateStack = function() {
  return this.stateStack;
};

/**
 * Replace the state stack with a new one.
 * @param {!Array<!Interpreter.State>} newStack New state stack.
 */
Interpreter.prototype.setStateStack = function(newStack) {
  this.stateStack = newStack;
};

/**
 * Typedef for JS values.
 * @typedef {!Interpreter.Object|boolean|number|string|undefined|null}
 */
Interpreter.Value;

/**
 * Class for a state.
 * @param {!Object} node AST node for the state.
 * @param {!Interpreter.Scope} scope Scope object for the state.
 * @constructor
 */
Interpreter.State = function(node, scope) {
  this.node = node;
  this.scope = scope;
};

/**
 * Class for a scope.
 * @param {Interpreter.Scope} parentScope Parent scope.
 * @param {boolean} strict True if "use strict".
 * @param {!Interpreter.Object} object Object containing scope's variables.
 * @struct
 * @constructor
 */
Interpreter.Scope = function(parentScope, strict, object) {
  this.parentScope = parentScope;
  this.strict = strict;
  this.object = object;
};

/**
 * Class for an object.
 * @param {Interpreter.Object} proto Prototype object or null.
 * @constructor
 */
Interpreter.Object = function(proto) {
  this.getter = Object.create(null);
  this.setter = Object.create(null);
  this.properties = Object.create(null);
  this.proto = proto;
};

/** @type {Interpreter.Object} */
Interpreter.Object.prototype.proto = null;

/** @type {string} */
Interpreter.Object.prototype.class = 'Object';

/** @type {Date|RegExp|boolean|number|string|null} */
Interpreter.Object.prototype.data = null;

/**
 * Convert this object into a string.
 * @return {string} String value.
 * @override
 */
Interpreter.Object.prototype.toString = function() {
  if (!Interpreter.currentInterpreter_) {
    // Called from outside an interpreter.
    return '[object Interpreter.Object]';
  }
  if (!(this instanceof Interpreter.Object)) {
    // Primitive value.
    return String(this);
  }

  if (this.class === 'Array') {
    // Array contents must not have cycles.
    var cycles = Interpreter.toStringCycles_;
    cycles.push(this);
    try {
      var strs = [];
      // Truncate very long strings.  This is not part of the spec,
      // but it prevents hanging the interpreter for gigantic arrays.
      var maxLength = this.properties.length;
      var truncated = false;
      if (maxLength > 1024) {
        maxLength = 1000;
        truncated = true;
      }
      for (var i = 0; i < maxLength; i++) {
        var value = this.properties[i];
        strs[i] = ((value instanceof Interpreter.Object) &&
            cycles.indexOf(value) !== -1) ? '...' : value;
      }
      if (truncated) {
        strs.push('...');
      }
    } finally {
      cycles.pop();
    }
    return strs.join(',');
  }

  if (this.class === 'Error') {
    // Error name and message properties must not have cycles.
    var cycles = Interpreter.toStringCycles_;
    if (cycles.indexOf(this) !== -1) {
      return '[object Error]';
    }
    var name, message;
    // Bug: Does not support getters and setters for name or message.
    var obj = this;
    do {
      if ('name' in obj.properties) {
        name = obj.properties['name'];
        break;
      }
    } while ((obj = obj.proto));
    obj = this;
    do {
      if ('message' in obj.properties) {
        message = obj.properties['message'];
        break;
      }
    } while ((obj = obj.proto));
    cycles.push(this);
    try {
      name = name && String(name);
      message = message && String(message);
    } finally {
      cycles.pop();
    }
    return message ? name + ': ' + message : String(name);
  }

  if (this.data !== null) {
    // RegExp, Date, and boxed primitives.
    return String(this.data);
  }

  return '[object ' + this.class + ']';
};

/**
 * Return the object's value.
 * @return {Interpreter.Value} Value.
 * @override
 */
Interpreter.Object.prototype.valueOf = function() {
  var callingInterpreter = Interpreter.currentInterpreter_;
  if (!callingInterpreter) {
    // Called from outside an interpreter.
    return this;
  }
  if (this.data === undefined || this.data === null ||
      this.data instanceof RegExp) {
    return this;  // An Object, RegExp, or primitive.
  }
  if (this.data instanceof Date) {
    return this.data.valueOf();  // Milliseconds.
  }
  return /** @type {(boolean|number|string)} */ (this.data);  // Boxed primitive.
};

///////////////////////////////////////////////////////////////////////////////
// Functions to handle each node type.
///////////////////////////////////////////////////////////////////////////////

Interpreter.prototype['stepArrayExpression'] = function(stack, state, node) {
  var elements = node['elements'];
  var n = state.n_ || 0;
  if (!state.array_) {
    state.array_ = this.createArray();
    state.array_.properties.length = elements.length;
  } else {
    this.setProperty(state.array_, n, state.value);
    n++;
  }
  while (n < elements.length) {
    // Skip missing elements - they're not defined, not undefined.
    if (elements[n]) {
      state.n_ = n;
      return new Interpreter.State(elements[n], state.scope);
    }
    n++;
  }
  stack.pop();
  stack[stack.length - 1].value = state.array_;
};

Interpreter.prototype['stepAssignmentExpression'] =
    function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    var nextState = new Interpreter.State(node['left'], state.scope);
    nextState.components = true;
    return nextState;
  }
  if (!state.doneRight_) {
    if (!state.leftReference_) {
      state.leftReference_ = state.value;
    }
    if (state.doneGetter_) {
      state.leftValue_ = state.value;
    }
    if (!state.doneGetter_ && node['operator'] !== '=') {
      var leftValue = this.getValue(state.leftReference_);
      state.leftValue_ = leftValue;
      if (this.getterStep_) {
        // Call the getter function.
        state.doneGetter_ = true;
        var func = /** @type {!Interpreter.Object} */ (leftValue);
        return this.createGetter_(func, state.leftReference_);
      }
    }
    state.doneRight_ = true;
    // When assigning an unnamed function to a variable, the function's name
    // is set to the variable name.  Record the variable name in case the
    // right side is a functionExpression.
    // E.g. foo = function() {};
    if (node['operator'] === '=' && node['left']['type'] === 'Identifier') {
      state.destinationName = node['left']['name'];
    }
    return new Interpreter.State(node['right'], state.scope);
  }
  if (state.doneSetter_) {
    // Return if setter function.
    // Setter method on property has completed.
    // Ignore its return value, and use the original set value instead.
    stack.pop();
    stack[stack.length - 1].value = state.setterValue_;
    return;
  }
  var value = state.leftValue_;
  var rightValue = state.value;
  switch (node['operator']) {
    case '=':    value =    rightValue; break;
    case '+=':   value +=   rightValue; break;
    case '-=':   value -=   rightValue; break;
    case '*=':   value *=   rightValue; break;
    case '/=':   value /=   rightValue; break;
    case '%=':   value %=   rightValue; break;
    case '<<=':  value <<=  rightValue; break;
    case '>>=':  value >>=  rightValue; break;
    case '>>>=': value >>>= rightValue; break;
    case '&=':   value &=   rightValue; break;
    case '^=':   value ^=   rightValue; break;
    case '|=':   value |=   rightValue; break;
    default:
      throw SyntaxError('Unknown assignment expression: ' + node['operator']);
  }
  var setter = this.setValue(state.leftReference_, value);
  if (setter) {
    state.doneSetter_ = true;
    state.setterValue_ = value;
    return this.createSetter_(setter, state.leftReference_, value);
  }
  // Return if no setter function.
  stack.pop();
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepBinaryExpression'] = function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node['left'], state.scope);
  }
  if (!state.doneRight_) {
    state.doneRight_ = true;
    state.leftValue_ = state.value;
    return new Interpreter.State(node['right'], state.scope);
  }
  stack.pop();
  var leftValue = state.leftValue_;
  var rightValue = state.value;
  var value;
  switch (node['operator']) {
    case '==':  value = leftValue ==  rightValue; break;
    case '!=':  value = leftValue !=  rightValue; break;
    case '===': value = leftValue === rightValue; break;
    case '!==': value = leftValue !== rightValue; break;
    case '>':   value = leftValue >   rightValue; break;
    case '>=':  value = leftValue >=  rightValue; break;
    case '<':   value = leftValue <   rightValue; break;
    case '<=':  value = leftValue <=  rightValue; break;
    case '+':   value = leftValue +   rightValue; break;
    case '-':   value = leftValue -   rightValue; break;
    case '*':   value = leftValue *   rightValue; break;
    case '/':   value = leftValue /   rightValue; break;
    case '%':   value = leftValue %   rightValue; break;
    case '&':   value = leftValue &   rightValue; break;
    case '|':   value = leftValue |   rightValue; break;
    case '^':   value = leftValue ^   rightValue; break;
    case '<<':  value = leftValue <<  rightValue; break;
    case '>>':  value = leftValue >>  rightValue; break;
    case '>>>': value = leftValue >>> rightValue; break;
    case 'in':
      if (!(rightValue instanceof Interpreter.Object)) {
        this.throwException(this.TYPE_ERROR,
            "'in' expects an object, not '" + rightValue + "'");
      }
      value = this.hasProperty(rightValue, leftValue);
      break;
    case 'instanceof':
      if (!this.isa(rightValue, this.FUNCTION)) {
        this.throwException(this.TYPE_ERROR,
            'Right-hand side of instanceof is not an object');
      }
      value = (leftValue instanceof Interpreter.Object) ?
          this.isa(leftValue, rightValue) : false;
      break;
    default:
      throw SyntaxError('Unknown binary operator: ' + node['operator']);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepBlockStatement'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node['body'][n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
};

Interpreter.prototype['stepBreakStatement'] = function(stack, state, node) {
  var label = node['label'] && node['label']['name'];
  this.unwind(Interpreter.Completion.BREAK, undefined, label);
};

/**
 * Number of evals called by the interpreter.
 * @private
 */
Interpreter.prototype.evalCodeNumber_ = 0;

Interpreter.prototype['stepCallExpression'] = function(stack, state, node) {
  if (!state.doneCallee_) {
    state.doneCallee_ = 1;
    // Components needed to determine value of `this`.
    var nextState = new Interpreter.State(node['callee'], state.scope);
    nextState.components = true;
    return nextState;
  }
  if (state.doneCallee_ === 1) {
    // Determine value of the function.
    state.doneCallee_ = 2;
    var func = state.value;
    if (Array.isArray(func)) {
      state.func_ = this.getValue(func);
      if (func[0] === Interpreter.SCOPE_REFERENCE) {
        // (Globally or locally) named function.  Is it named 'eval'?
        state.directEval_ = (func[1] === 'eval');
      } else {
        // Method function, `this` is object (ignored if invoked as `new`).
        state.funcThis_ = func[0];
      }
      func = state.func_;
      if (this.getterStep_) {
        // Call the getter function.
        state.doneCallee_ = 1;
        return this.createGetter_(/** @type {!Interpreter.Object} */ (func),
            state.value);
      }
    } else {
      // Already evaluated function: (function(){...})();
      state.func_ = func;
    }
    state.arguments_ = [];
    state.n_ = 0;
  }
  var func = state.func_;
  if (!state.doneArgs_) {
    if (state.n_ !== 0) {
      state.arguments_.push(state.value);
    }
    if (node['arguments'][state.n_]) {
      return new Interpreter.State(node['arguments'][state.n_++], state.scope);
    }
    // Determine value of `this` in function.
    if (node['type'] === 'NewExpression') {
      if (!(func instanceof Interpreter.Object) || func.illegalConstructor) {
        // Illegal: new escape();
        this.throwException(this.TYPE_ERROR, func + ' is not a constructor');
      }
      // Constructor, `this` is new object.
      if (func === this.ARRAY) {
        state.funcThis_ = this.createArray();
      } else {
        var proto = func.properties['prototype'];
        if (typeof proto !== 'object' || proto === null) {
          // Non-object prototypes default to `Object.prototype`.
          proto = this.OBJECT_PROTO;
        }
        state.funcThis_ = this.createObjectProto(proto);
      }
      state.isConstructor = true;
    }
    state.doneArgs_ = true;
  }
  if (!state.doneExec_) {
    state.doneExec_ = true;
    if (!(func instanceof Interpreter.Object)) {
      this.throwException(this.TYPE_ERROR, func + ' is not a function');
    }
    var funcNode = func.node;
    if (funcNode) {
      var scope = this.createScope(funcNode['body'], func.parentScope);
      // Add all arguments.
      for (var i = 0; i < funcNode['params'].length; i++) {
        var paramName = funcNode['params'][i]['name'];
        var paramValue = state.arguments_.length > i ? state.arguments_[i] :
            undefined;
        this.setProperty(scope.object, paramName, paramValue);
      }
      // Build arguments variable.
      var argsList = this.createArray();
      for (var i = 0; i < state.arguments_.length; i++) {
        this.setProperty(argsList, i, state.arguments_[i]);
      }
      this.setProperty(scope.object, 'arguments', argsList);
      // Add the function's name (var x = function foo(){};)
      var name = funcNode['id'] && funcNode['id']['name'];
      if (name) {
        this.setProperty(scope.object, name, func);
      }
      if (!scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      this.setProperty(scope.object, 'this', state.funcThis_,
                       Interpreter.READONLY_DESCRIPTOR);
      state.value = undefined;  // Default value if no explicit return.
      return new Interpreter.State(funcNode['body'], scope);
    } else if (func.eval) {
      var code = state.arguments_[0];
      if (typeof code !== 'string') {
        // JS does not parse String objects:
        // eval(new String('1 + 1')) -> '1 + 1'
        state.value = code;
      } else {
        try {
          var ast = this.parse_(String(code),
             'eval' + (this.evalCodeNumber_++));
        } catch (e) {
          // Acorn threw a SyntaxError.  Rethrow as a trappable error.
          this.throwException(this.SYNTAX_ERROR, 'Invalid code: ' + e.message);
        }
        var evalNode = new this.newNode();
        evalNode['type'] = 'EvalProgram_';
        evalNode['body'] = ast['body'];
        Interpreter.stripLocations_(evalNode, node['start'], node['end']);
        // Create new scope and update it with definitions in eval().
        var scope = state.directEval_ ? state.scope : this.globalScope;
        if (scope.strict) {
          // Strict mode get its own scope in eval.
          scope = this.createScope(ast, scope);
        } else {
          // Non-strict mode pollutes the current scope.
          this.populateScope_(ast, scope);
        }
        this.value = undefined;  // Default value if no code.
        return new Interpreter.State(evalNode, scope);
      }
    } else if (func.nativeFunc) {
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      state.value = func.nativeFunc.apply(state.funcThis_, state.arguments_);
    } else if (func.asyncFunc) {
      var thisInterpreter = this;
      var callback = function(value) {
        state.value = value;
        thisInterpreter.paused_ = false;
      };
      // Force the argument lengths to match, then append the callback.
      var argLength = func.asyncFunc.length - 1;
      var argsWithCallback = state.arguments_.concat(
          new Array(argLength)).slice(0, argLength);
      argsWithCallback.push(callback);
      this.paused_ = true;
      if (!state.scope.strict) {
        state.funcThis_ = this.boxThis_(state.funcThis_);
      }
      func.asyncFunc.apply(state.funcThis_, argsWithCallback);
      return;
    } else {
      /* A child of a function is a function but is not callable.  For example:
      var F = function() {};
      F.prototype = escape;
      var f = new F();
      f();
      */
      this.throwException(this.TYPE_ERROR, func.class + ' is not callable');
    }
  } else {
    // Execution complete.  Put the return value on the stack.
    stack.pop();
    if (state.isConstructor && typeof state.value !== 'object') {
      // Normal case for a constructor is to use the `this` value.
      stack[stack.length - 1].value = state.funcThis_;
    } else {
      // Non-constructors or constructions explicitly returning objects use
      // the return value.
      stack[stack.length - 1].value = state.value;
    }
  }
};

Interpreter.prototype['stepCatchClause'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    // Create an empty scope.
    var scope = this.createSpecialScope(state.scope);
    // Add the argument.
    this.setProperty(scope.object, node['param']['name'], state.throwValue);
    // Execute catch clause.
    return new Interpreter.State(node['body'], scope);
  } else {
    stack.pop();
  }
};

Interpreter.prototype['stepConditionalExpression'] =
    function(stack, state, node) {
  var mode = state.mode_ || 0;
  if (mode === 0) {
    state.mode_ = 1;
    return new Interpreter.State(node['test'], state.scope);
  }
  if (mode === 1) {
    state.mode_ = 2;
    var value = Boolean(state.value);
    if (value && node['consequent']) {
      // Execute `if` block.
      return new Interpreter.State(node['consequent'], state.scope);
    } else if (!value && node['alternate']) {
      // Execute `else` block.
      return new Interpreter.State(node['alternate'], state.scope);
    }
    // eval('1;if(false){2}') -> undefined
    this.value = undefined;
  }
  stack.pop();
  if (node['type'] === 'ConditionalExpression') {
    stack[stack.length - 1].value = state.value;
  }
};

Interpreter.prototype['stepContinueStatement'] = function(stack, state, node) {
  var label = node['label'] && node['label']['name'];
  this.unwind(Interpreter.Completion.CONTINUE, undefined, label);
};

Interpreter.prototype['stepDebuggerStatement'] = function(stack, state, node) {
  // Do nothing.  May be overridden by developers.
  stack.pop();
};

Interpreter.prototype['stepDoWhileStatement'] = function(stack, state, node) {
  if (node['type'] === 'DoWhileStatement' && state.test_ === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = true;
    state.test_ = true;
  }
  if (!state.test_) {
    state.test_ = true;
    return new Interpreter.State(node['test'], state.scope);
  }
  if (!state.value) {  // Done, exit loop.
    stack.pop();
  } else if (node['body']) {  // Execute the body.
    state.test_ = false;
    state.isLoop = true;
    return new Interpreter.State(node['body'], state.scope);
  }
};

Interpreter.prototype['stepEmptyStatement'] = function(stack, state, node) {
  stack.pop();
};

Interpreter.prototype['stepEvalProgram_'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node['body'][n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = this.value;
};

Interpreter.prototype['stepExpressionStatement'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    return new Interpreter.State(node['expression'], state.scope);
  }
  stack.pop();
  // Save this value to interpreter.value for use as a return value if
  // this code is inside an eval function.
  this.value = state.value;
};

Interpreter.prototype['stepForInStatement'] = function(stack, state, node) {
  // First, initialize a variable if exists.  Only do so once, ever.
  if (!state.doneInit_) {
    state.doneInit_ = true;
    if (node['left']['declarations'] &&
        node['left']['declarations'][0]['init']) {
      if (state.scope.strict) {
        this.throwException(this.SYNTAX_ERROR,
            'for-in loop variable declaration may not have an initializer.');
      }
      // Variable initialization: for (var x = 4 in y)
      return new Interpreter.State(node['left'], state.scope);
    }
  }
  // Second, look up the object.  Only do so once, ever.
  if (!state.doneObject_) {
    state.doneObject_ = true;
    if (!state.variable_) {
      state.variable_ = state.value;
    }
    return new Interpreter.State(node['right'], state.scope);
  }
  if (!state.isLoop) {
    // First iteration.
    state.isLoop = true;
    state.object_ = state.value;
    state.visited_ = Object.create(null);
  }
  // Third, find the property name for this iteration.
  if (state.name_ === undefined) {
    gotPropName: while (true) {
      if (state.object_ instanceof Interpreter.Object) {
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_.properties);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break;  // Reached end of this object's properties.
          }
          if (!Object.prototype.hasOwnProperty.call(state.object_.properties,
                prop)) {
            continue;  // Property has been deleted in the loop.
          }
          if (state.visited_[prop]) {
            continue;  // Already seen this property on a child.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
                state.object_.properties, prop)) {
            continue;  // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      } else if (state.object_ !== null && state.object_ !== undefined) {
        // Primitive value (other than null or undefined).
        if (!state.props_) {
          state.props_ = Object.getOwnPropertyNames(state.object_);
        }
        while (true) {
          var prop = state.props_.shift();
          if (prop === undefined) {
            break;  // Reached end of this value's properties.
          }
          state.visited_[prop] = true;
          if (!Object.prototype.propertyIsEnumerable.call(
                state.object_, prop)) {
            continue;  // Skip non-enumerable property.
          }
          state.name_ = prop;
          break gotPropName;
        }
      }
      state.object_ = this.getPrototype(state.object_);
      state.props_ = null;
      if (state.object_ === null) {
        // Done, exit loop.
        stack.pop();
        return;
      }
    }
  }
  // Fourth, find the variable
  if (!state.doneVariable_) {
    state.doneVariable_ = true;
    var left = node['left'];
    if (left['type'] === 'VariableDeclaration') {
      // Inline variable declaration: for (var x in y)
      state.variable_ =
          [Interpreter.SCOPE_REFERENCE, left['declarations'][0]['id']['name']];
    } else {
      // Arbitrary left side: for (foo().bar in y)
      state.variable_ = null;
      var nextState = new Interpreter.State(left, state.scope);
      nextState.components = true;
      return nextState;
    }
  }
  if (!state.variable_) {
    state.variable_ = state.value;
  }
  // Fifth, set the variable.
  if (!state.doneSetter_) {
    state.doneSetter_ = true;
    var value = state.name_;
    var setter = this.setValue(state.variable_, value);
    if (setter) {
      return this.createSetter_(setter, state.variable_, value);
    }
  }
  // Next step will be step three.
  state.name_ = undefined;
  // Reevaluate the variable since it could be a setter on the global object.
  state.doneVariable_ = false;
  state.doneSetter_ = false;
  // Sixth and finally, execute the body if there was one.  this.
  if (node['body']) {
    return new Interpreter.State(node['body'], state.scope);
  }
};

Interpreter.prototype['stepForStatement'] = function(stack, state, node) {
  var mode = state.mode_ || 0;
  if (mode === 0) {
    state.mode_ = 1;
    if (node['init']) {
      return new Interpreter.State(node['init'], state.scope);
    }
  } else if (mode === 1) {
    state.mode_ = 2;
    if (node['test']) {
      return new Interpreter.State(node['test'], state.scope);
    }
  } else if (mode === 2) {
    state.mode_ = 3;
    if (node['test'] && !state.value) {
      // Done, exit loop.
      stack.pop();
    } else {  // Execute the body.
      state.isLoop = true;
      return new Interpreter.State(node['body'], state.scope);
    }
  } else if (mode === 3) {
    state.mode_ = 1;
    if (node['update']) {
      return new Interpreter.State(node['update'], state.scope);
    }
  }
};

Interpreter.prototype['stepFunctionDeclaration'] =
    function(stack, state, node) {
  // This was found and handled when the scope was populated.
  stack.pop();
};

Interpreter.prototype['stepFunctionExpression'] = function(stack, state, node) {
  stack.pop();
  state = stack[stack.length - 1];
  state.value = this.createFunction(node, state.scope, state.destinationName);
};

Interpreter.prototype['stepIdentifier'] = function(stack, state, node) {
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [Interpreter.SCOPE_REFERENCE, node['name']];
    return;
  }
  var value = this.getValueFromScope(node['name']);
  // An identifier could be a getter if it's a property on the global object.
  if (this.getterStep_) {
    // Call the getter function.
    var func = /** @type {!Interpreter.Object} */ (value);
    return this.createGetter_(func, this.globalObject);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepIfStatement'] =
    Interpreter.prototype['stepConditionalExpression'];

Interpreter.prototype['stepLabeledStatement'] = function(stack, state, node) {
  // No need to hit this node again on the way back up the stack.
  stack.pop();
  // Note that a statement might have multiple labels.
  var labels = state.labels || [];
  labels.push(node['label']['name']);
  var nextState = new Interpreter.State(node['body'], state.scope);
  nextState.labels = labels;
  return nextState;
};

Interpreter.prototype['stepLiteral'] = function(stack, state, node) {
  stack.pop();
  var value = node['value'];
  if (value instanceof RegExp) {
    var pseudoRegexp = this.createObjectProto(this.REGEXP_PROTO);
    this.populateRegExp(pseudoRegexp, value);
    value = pseudoRegexp;
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepLogicalExpression'] = function(stack, state, node) {
  if (node['operator'] !== '&&' && node['operator'] !== '||') {
    throw SyntaxError('Unknown logical operator: ' + node['operator']);
  }
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    return new Interpreter.State(node['left'], state.scope);
  }
  if (!state.doneRight_) {
    if ((node['operator'] === '&&' && !state.value) ||
        (node['operator'] === '||' && state.value)) {
      // Shortcut evaluation.
      stack.pop();
      stack[stack.length - 1].value = state.value;
    } else {
      state.doneRight_ = true;
      return new Interpreter.State(node['right'], state.scope);
    }
  } else {
    stack.pop();
    stack[stack.length - 1].value = state.value;
  }
};

Interpreter.prototype['stepMemberExpression'] = function(stack, state, node) {
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node['object'], state.scope);
  }
  var propName;
  if (!node['computed']) {
    state.object_ = state.value;
    // obj.foo -- Just access `foo` directly.
    propName = node['property']['name'];
  } else if (!state.doneProperty_) {
    state.object_ = state.value;
    // obj[foo] -- Compute value of `foo`.
    state.doneProperty_ = true;
    return new Interpreter.State(node['property'], state.scope);
  } else {
    propName = state.value;
  }
  stack.pop();
  if (state.components) {
    stack[stack.length - 1].value = [state.object_, propName];
  } else {
    var value = this.getProperty(state.object_, propName);
    if (this.getterStep_) {
      // Call the getter function.
      var func = /** @type {!Interpreter.Object} */ (value);
      return this.createGetter_(func, state.object_);
    }
    stack[stack.length - 1].value = value;
  }
};

Interpreter.prototype['stepNewExpression'] =
    Interpreter.prototype['stepCallExpression'];

Interpreter.prototype['stepObjectExpression'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var property = node['properties'][n];
  if (!state.object_) {
    // First execution.
    state.object_ = this.createObjectProto(this.OBJECT_PROTO);
    state.properties_ = Object.create(null);
  } else {
    // Set the property computed in the previous execution.
    var propName = state.destinationName;
    if (!state.properties_[propName]) {
      // Create temp object to collect value, getter, and/or setter.
      state.properties_[propName] = {};
    }
    state.properties_[propName][property['kind']] = state.value;
    state.n_ = ++n;
    property = node['properties'][n];
  }
  if (property) {
    // Determine property name.
    var key = property['key'];
    if (key['type'] === 'Identifier') {
      var propName = key['name'];
    } else if (key['type'] === 'Literal') {
      var propName = key['value'];
    } else {
      throw SyntaxError('Unknown object structure: ' + key['type']);
    }
    // When assigning an unnamed function to a property, the function's name
    // is set to the property name.  Record the property name in case the
    // value is a functionExpression.
    // E.g. {foo: function() {}}
    state.destinationName = propName;
    return new Interpreter.State(property['value'], state.scope);
  }
  for (var key in state.properties_) {
    var kinds = state.properties_[key];
    if ('get' in kinds || 'set' in kinds) {
      // Set a property with a getter or setter.
      var descriptor = {
        configurable: true,
        enumerable: true,
        get: kinds['get'],
        set: kinds['set']
      };
      this.setProperty(state.object_, key, Interpreter.VALUE_IN_DESCRIPTOR,
                       descriptor);
    } else {
      // Set a normal property with a value.
      this.setProperty(state.object_, key, kinds['init']);
    }
  }
  stack.pop();
  stack[stack.length - 1].value = state.object_;
};

Interpreter.prototype['stepProgram'] = function(stack, state, node) {
  var expression = node['body'].shift();
  if (expression) {
    state.done = false;
    return new Interpreter.State(expression, state.scope);
  }
  state.done = true;
  // Don't pop the stateStack.
  // Leave the root scope on the tree in case the program is appended to.
};

Interpreter.prototype['stepReturnStatement'] = function(stack, state, node) {
  if (node['argument'] && !state.done_) {
    state.done_ = true;
    return new Interpreter.State(node['argument'], state.scope);
  }
  this.unwind(Interpreter.Completion.RETURN, state.value, undefined);
};

Interpreter.prototype['stepSequenceExpression'] = function(stack, state, node) {
  var n = state.n_ || 0;
  var expression = node['expressions'][n];
  if (expression) {
    state.n_ = n + 1;
    return new Interpreter.State(expression, state.scope);
  }
  stack.pop();
  stack[stack.length - 1].value = state.value;
};

Interpreter.prototype['stepSwitchStatement'] = function(stack, state, node) {
  if (!state.test_) {
    state.test_ = 1;
    return new Interpreter.State(node['discriminant'], state.scope);
  }
  if (state.test_ === 1) {
    state.test_ = 2;
    // Preserve switch value between case tests.
    state.switchValue_ = state.value;
    state.defaultCase_ = -1;
  }

  while (true) {
    var index = state.index_ || 0;
    var switchCase = node['cases'][index];
    if (!state.matched_ && switchCase && !switchCase['test']) {
      // Test on the default case is null.
      // Bypass (but store) the default case, and get back to it later.
      state.defaultCase_ = index;
      state.index_ = index + 1;
      continue;
    }
    if (!switchCase && !state.matched_ && state.defaultCase_ !== -1) {
      // Ran through all cases, no match.  Jump to the default.
      state.matched_ = true;
      state.index_ = state.defaultCase_;
      continue;
    }
    if (switchCase) {
      if (!state.matched_ && !state.tested_ && switchCase['test']) {
        state.tested_ = true;
        return new Interpreter.State(switchCase['test'], state.scope);
      }
      if (state.matched_ || state.value === state.switchValue_) {
        state.matched_ = true;
        var n = state.n_ || 0;
        if (switchCase['consequent'][n]) {
          state.isSwitch = true;
          state.n_ = n + 1;
          return new Interpreter.State(switchCase['consequent'][n],
                                       state.scope);
        }
      }
      // Move on to next case.
      state.tested_ = false;
      state.n_ = 0;
      state.index_ = index + 1;
    } else {
      stack.pop();
      return;
    }
  }
};

Interpreter.prototype['stepThisExpression'] = function(stack, state, node) {
  stack.pop();
  stack[stack.length - 1].value = this.getValueFromScope('this');
};

Interpreter.prototype['stepThrowStatement'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    return new Interpreter.State(node['argument'], state.scope);
  } else {
    this.throwException(state.value);
  }
};

Interpreter.prototype['stepTryStatement'] = function(stack, state, node) {
  if (!state.doneBlock_) {
    state.doneBlock_ = true;
    return new Interpreter.State(node['block'], state.scope);
  }
  if (state.cv && state.cv.type === Interpreter.Completion.THROW &&
      !state.doneHandler_ && node['handler']) {
    state.doneHandler_ = true;
    var nextState = new Interpreter.State(node['handler'], state.scope);
    nextState.throwValue = state.cv.value;
    state.cv = undefined;  // This error has been handled, don't rethrow.
    return nextState;
  }
  if (!state.doneFinalizer_ && node['finalizer']) {
    state.doneFinalizer_ = true;
    return new Interpreter.State(node['finalizer'], state.scope);
  }
  stack.pop();
  if (state.cv) {
    // There was no catch handler, or the catch/finally threw an error.
    // Throw the error up to a higher try.
    this.unwind(state.cv.type, state.cv.value, state.cv.label);
  }
};

Interpreter.prototype['stepUnaryExpression'] = function(stack, state, node) {
  if (!state.done_) {
    state.done_ = true;
    var nextState = new Interpreter.State(node['argument'], state.scope);
    nextState.components = node['operator'] === 'delete';
    return nextState;
  }
  stack.pop();
  var value = state.value;
  if (node['operator'] === '-') {
    value = -value;
  } else if (node['operator'] === '+') {
    value = +value;
  } else if (node['operator'] === '!') {
    value = !value;
  } else if (node['operator'] === '~') {
    value = ~value;
  } else if (node['operator'] === 'delete') {
    var result = true;
    // If value is not an array, then it is a primitive, or some other value.
    // If so, skip the delete and return true.
    if (Array.isArray(value)) {
      var obj = value[0];
      if (obj === Interpreter.SCOPE_REFERENCE) {
        // `delete foo;` is the same as `delete window.foo;`.
        obj = state.scope;
      }
      var name = String(value[1]);
      try {
        delete obj.properties[name];
      } catch (e) {
        if (state.scope.strict) {
          this.throwException(this.TYPE_ERROR, "Cannot delete property '" +
                              name + "' of '" + obj + "'");
        } else {
          result = false;
        }
      }
    }
    value = result;
  } else if (node['operator'] === 'typeof') {
    value = (value && value.class === 'Function') ? 'function' : typeof value;
  } else if (node['operator'] === 'void') {
    value = undefined;
  } else {
    throw SyntaxError('Unknown unary operator: ' + node['operator']);
  }
  stack[stack.length - 1].value = value;
};

Interpreter.prototype['stepUpdateExpression'] = function(stack, state, node) {
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    var nextState = new Interpreter.State(node['argument'], state.scope);
    nextState.components = true;
    return nextState;
  }
  if (!state.leftSide_) {
    state.leftSide_ = state.value;
  }
  if (state.doneGetter_) {
    state.leftValue_ = state.value;
  }
  if (!state.doneGetter_) {
    var leftValue = this.getValue(state.leftSide_);
    state.leftValue_ = leftValue;
    if (this.getterStep_) {
      // Call the getter function.
      state.doneGetter_ = true;
      var func = /** @type {!Interpreter.Object} */ (leftValue);
      return this.createGetter_(func, state.leftSide_);
    }
  }
  if (state.doneSetter_) {
    // Return if setter function.
    // Setter method on property has completed.
    // Ignore its return value, and use the original set value instead.
    stack.pop();
    stack[stack.length - 1].value = state.setterValue_;
    return;
  }
  var leftValue = Number(state.leftValue_);
  var changeValue;
  if (node['operator'] === '++') {
    changeValue = leftValue + 1;
  } else if (node['operator'] === '--') {
    changeValue = leftValue - 1;
  } else {
    throw SyntaxError('Unknown update expression: ' + node['operator']);
  }
  var returnValue = node['prefix'] ? changeValue : leftValue;
  var setter = this.setValue(state.leftSide_, changeValue);
  if (setter) {
    state.doneSetter_ = true;
    state.setterValue_ = returnValue;
    return this.createSetter_(setter, state.leftSide_, changeValue);
  }
  // Return if no setter function.
  stack.pop();
  stack[stack.length - 1].value = returnValue;
};

Interpreter.prototype['stepVariableDeclaration'] = function(stack, state, node) {
  var declarations = node['declarations'];
  var n = state.n_ || 0;
  var declarationNode = declarations[n];
  if (state.init_ && declarationNode) {
    // This setValue call never needs to deal with calling a setter function.
    // Note that this is setting the init value, not defining the variable.
    // Variable definition is done when scope is populated.
    this.setValueToScope(declarationNode['id']['name'], state.value);
    state.init_ = false;
    declarationNode = declarations[++n];
  }
  while (declarationNode) {
    // Skip any declarations that are not initialized.  They have already
    // been defined as undefined in populateScope_.
    if (declarationNode['init']) {
      state.n_ = n;
      state.init_ = true;
      // When assigning an unnamed function to a variable, the function's name
      // is set to the variable name.  Record the variable name in case the
      // right side is a functionExpression.
      // E.g. var foo = function() {};
      state.destinationName = declarationNode['id']['name'];
      return new Interpreter.State(declarationNode['init'], state.scope);
    }
    declarationNode = declarations[++n];
  }
  stack.pop();
};

Interpreter.prototype['stepWithStatement'] = function(stack, state, node) {
  if (!state.doneObject_) {
    state.doneObject_ = true;
    return new Interpreter.State(node['object'], state.scope);
  } else if (!state.doneBody_) {
    state.doneBody_ = true;
    var scope = this.createSpecialScope(state.scope, state.value);
    return new Interpreter.State(node['body'], scope);
  } else {
    stack.pop();
  }
};

Interpreter.prototype['stepWhileStatement'] =
    Interpreter.prototype['stepDoWhileStatement'];

// Preserve top-level API functions from being pruned/renamed by JS compilers.
// Add others as needed.
// The global object (`window` in a browser, `global` in node.js) is `this`.
this['Interpreter'] = Interpreter;
Interpreter.prototype['step'] = Interpreter.prototype.step;
Interpreter.prototype['run'] = Interpreter.prototype.run;
Interpreter.prototype['appendCode'] = Interpreter.prototype.appendCode;
Interpreter.prototype['createObject'] = Interpreter.prototype.createObject;
Interpreter.prototype['createObjectProto'] =
    Interpreter.prototype.createObjectProto;
Interpreter.prototype['createAsyncFunction'] =
    Interpreter.prototype.createAsyncFunction;
Interpreter.prototype['createNativeFunction'] =
    Interpreter.prototype.createNativeFunction;
Interpreter.prototype['getProperty'] = Interpreter.prototype.getProperty;
Interpreter.prototype['setProperty'] = Interpreter.prototype.setProperty;
Interpreter.prototype['nativeToPseudo'] = Interpreter.prototype.nativeToPseudo;
Interpreter.prototype['pseudoToNative'] = Interpreter.prototype.pseudoToNative;
Interpreter.prototype['getGlobalScope'] = Interpreter.prototype.getGlobalScope;
Interpreter.prototype['getStateStack'] = Interpreter.prototype.getStateStack;
Interpreter.prototype['setStateStack'] = Interpreter.prototype.setStateStack;
