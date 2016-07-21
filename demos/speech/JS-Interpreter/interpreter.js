/**
 * @license
 * JavaScript Interpreter
 *
 * Copyright 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Interpreting JavaScript in JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {
  if (typeof code == 'string') {
    code = acorn.parse(code);
  }
  this.ast = code;
  this.initFunc_ = opt_initFunc;
  this.paused_ = false;
  // Predefine some common primitives for performance.
  this.UNDEFINED = new Interpreter.Primitive(undefined, this);
  this.NULL = new Interpreter.Primitive(null, this);
  this.NAN = new Interpreter.Primitive(NaN, this);
  this.TRUE = new Interpreter.Primitive(true, this);
  this.FALSE = new Interpreter.Primitive(false, this);
  this.NUMBER_ZERO = new Interpreter.Primitive(0, this);
  this.NUMBER_ONE = new Interpreter.Primitive(1, this);
  this.STRING_EMPTY = new Interpreter.Primitive('', this);
  var scope = this.createScope(this.ast, null);
  // Fix the parent properties now that the global scope exists.
  //this.UNDEFINED.parent = undefined;
  //this.NULL.parent = undefined;
  this.TRUE.parent = this.BOOLEAN;
  this.FALSE.parent = this.BOOLEAN;
  this.NUMBER_ZERO.parent = this.NUMBER;
  this.NUMBER_ONE.parent = this.NUMBER;
  this.STRING_EMPTY.parent = this.STRING;
  this.stateStack = [{
    node: this.ast,
    scope: scope,
    thisExpression: scope,
    done: false
  }];
};

/**
 * Add more code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.appendCode = function(code) {
  var state = this.stateStack[this.stateStack.length - 1];
  if (!state || state.node.type != 'Program') {
    throw Error('Expecting original AST to start with a Program node.');
  }
  if (typeof code == 'string') {
    code = acorn.parse(code);
  }
  if (!code || code.type != 'Program') {
    throw Error('Expecting new AST to start with a Program node.');
  }
  // Append the new program to the old one.
  for (var i = 0, node; node = code.body[i]; i++) {
    state.node.body.push(node);
  }
  state.done = false;
};

/**
 * Execute one step of the interpreter.
 * @return {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {
  var state = this.stateStack[0];
  if (!state || state.node.type == 'Program' && state.done) {
    return false;
  } else if (this.paused_) {
    return true;
  }
  this['step' + state.node.type]();
  return true;
};

/**
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @return {boolean} True if a execution is asynchonously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function() {
  while (!this.paused_ && this.step()) {}
  return this.paused_;
};

/**
 * Initialize the global scope with buitin properties and functions.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initGlobalScope = function(scope) {
  // Initialize uneditable global properties.
  this.setProperty(scope, 'Infinity', this.createPrimitive(Infinity), true);
  this.setProperty(scope, 'NaN', this.NAN, true);
  this.setProperty(scope, 'undefined', this.UNDEFINED, true);
  this.setProperty(scope, 'window', scope, true);
  this.setProperty(scope, 'self', scope, false); // Editable.

  // Initialize global objects.
  this.initFunction(scope);
  this.initObject(scope);
  // Unable to set scope's parent prior (this.OBJECT did not exist).
  scope.parent = this.OBJECT;
  this.initArray(scope);
  this.initNumber(scope);
  this.initString(scope);
  this.initBoolean(scope);
  this.initDate(scope);
  this.initMath(scope);
  this.initRegExp(scope);
  this.initJSON(scope);
  this.initError(scope);

  // Initialize global functions.
  var thisInterpreter = this;
  var wrapper;
  wrapper = function(num) {
    num = num || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(isNaN(num.toNumber()));
  };
  this.setProperty(scope, 'isNaN',
                   this.createNativeFunction(wrapper));

  wrapper = function(num) {
    num = num || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(isFinite(num.toNumber()));
  };
  this.setProperty(scope, 'isFinite',
                   this.createNativeFunction(wrapper));

  this.setProperty(scope, 'parseFloat',
                   this.getProperty(this.NUMBER, 'parseFloat'));

  this.setProperty(scope, 'parseInt',
                   this.getProperty(this.NUMBER, 'parseInt'));

  var func = this.createObject(this.FUNCTION);
  func.eval = true;
  this.setProperty(func, 'length', this.NUMBER_ONE, true);
  this.setProperty(scope, 'eval', func);

  var strFunctions = [
    [escape, 'escape'], [unescape, 'unescape'],
    [decodeURI, 'decodeURI'], [decodeURIComponent, 'decodeURIComponent'],
    [encodeURI, 'encodeURI'], [encodeURIComponent, 'encodeURIComponent']
  ];
  for (var i = 0; i < strFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(str) {
        str = (str || thisInterpreter.UNDEFINED).toString();
        try {
          str = nativeFunc(str);
        } catch (e) {
          // decodeURI('%xy') will throw an error.  Catch and rethrow.
          thisInterpreter.throwException(thisInterpreter.URI_ERROR, e.message);
        }
        return thisInterpreter.createPrimitive(str);
      };
    })(strFunctions[i][0]);
    this.setProperty(scope, strFunctions[i][1],
                     this.createNativeFunction(wrapper));
  }

  // Run any user-provided initialization.
  if (this.initFunc_) {
    this.initFunc_(this, scope);
  }
};

/**
 * Initialize the Function class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initFunction = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Function constructor.
  wrapper = function(var_args) {
    if (this.parent == thisInterpreter.FUNCTION) {
      // Called with new.
      var newFunc = this;
    } else {
      var newFunc = thisInterpreter.createObject(thisInterpreter.FUNCTION);
    }
    if (arguments.length) {
      var code = arguments[arguments.length - 1].toString();
    } else {
      var code = '';
    }
    var args = [];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i].toString());
    }
    args = args.join(', ');
    if (args.indexOf(')') != -1) {
      throw SyntaxError('Function arg string contains parenthesis');
    }
    // Interestingly, the scope for constructed functions is the global scope,
    // even if they were constructed in some other scope.
    newFunc.parentScope =
        thisInterpreter.stateStack[thisInterpreter.stateStack.length - 1].scope;
    var ast = acorn.parse('$ = function(' + args + ') {' + code + '};');
    newFunc.node = ast.body[0].expression.right;
    thisInterpreter.setProperty(newFunc, 'length',
        thisInterpreter.createPrimitive(newFunc.node.length), true);
    return newFunc;
  };
  this.FUNCTION = this.createObject(null);
  this.setProperty(scope, 'Function', this.FUNCTION);
  // Manually setup type and prototype because createObj doesn't recognize
  // this object as a function (this.FUNCTION did not exist).
  this.FUNCTION.type = 'function';
  this.setProperty(this.FUNCTION, 'prototype', this.createObject(null));
  this.FUNCTION.nativeFunc = wrapper;

  wrapper = function(thisArg, args) {
    var state = thisInterpreter.stateStack[0];
    // Rewrite the current 'CallExpression' to apply a different function.
    state.func_ = this;
    // Assign the 'this' object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments = [];
    if (args) {
      if (thisInterpreter.isa(args, thisInterpreter.ARRAY)) {
        for (var i = 0; i < args.length; i++) {
          state.arguments[i] = thisInterpreter.getProperty(args, i);
        }
      } else {
        thisInterpreter.throwException(thisInterpreter.TYPE_ERROR,
            'CreateListFromArrayLike called on non-object');
      }
    }
    state.doneArgs_ = true;
    state.doneExec_ = false;
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'apply',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(thisArg, var_args) {
    var state = thisInterpreter.stateStack[0];
    // Rewrite the current 'CallExpression' to call a different function.
    state.func_ = this;
    // Assign the 'this' object.
    state.funcThis_ = thisArg;
    // Bind any provided arguments.
    state.arguments = [];
    for (var i = 1; i < arguments.length; i++) {
      state.arguments.push(arguments[i]);
    }
    state.doneArgs_ = true;
    state.doneExec_ = false;
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'call',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(thisArg, var_args) {
    // Clone function
    var clone = thisInterpreter.createFunction(this.node, this.parentScope);
    // Assign the 'this' object.
    if (thisArg) {
      clone.boundThis_ = thisArg;
    }
    // Bind any provided arguments.
    clone.boundArgs_ = [];
    for (var i = 1; i < arguments.length; i++) {
      clone.boundArgs_.push(arguments[i]);
    }
    return clone;
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'bind',
                   this.createNativeFunction(wrapper), false, true);
  // Function has no parent to inherit from, so it needs its own mandatory
  // toString and valueOf functions.
  wrapper = function() {
    return thisInterpreter.createPrimitive(this.toString());
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'toString',
                   this.createNativeFunction(wrapper), false, true);
  this.setProperty(this.FUNCTION, 'toString',
                   this.createNativeFunction(wrapper), false, true);
  wrapper = function() {
    return thisInterpreter.createPrimitive(this.valueOf());
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'valueOf',
                   this.createNativeFunction(wrapper), false, true);
  this.setProperty(this.FUNCTION, 'valueOf',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Object class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initObject = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Object constructor.
  wrapper = function(var_args) {
    if (this.parent == thisInterpreter.OBJECT) {
      // Called with new.
      var newObj = this;
    } else {
      var newObj = thisInterpreter.createObject(thisInterpreter.OBJECT);
    }
    return newObj;
  };
  this.OBJECT = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Object', this.OBJECT);

  wrapper = function() {
    return thisInterpreter.createPrimitive(this.toString());
  };
  this.setProperty(this.OBJECT.properties.prototype, 'toString',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function() {
    return thisInterpreter.createPrimitive(this.valueOf());
  };
  this.setProperty(this.OBJECT.properties.prototype, 'valueOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(prop) {
    prop = (prop || thisInterpreter.UNDEFINED).toString();
    for (var key in this.properties) {
      if (key == prop) {
        return thisInterpreter.TRUE;
      }
    }
    return thisInterpreter.FALSE;
  };
  this.setProperty(this.OBJECT.properties.prototype, 'hasOwnProperty',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(key) {
    key = (key || thisInterpreter.UNDEFINED).toString();
    return thisInterpreter.createPrimitive(!(key in this.nonenumerable));
  };
  this.setProperty(this.OBJECT.properties.prototype, 'propertyIsEnumerable',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(obj) {
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var i = 0;
    for (var key in obj.properties) {
      thisInterpreter.setProperty(pseudoList, i,
          thisInterpreter.createPrimitive(key));
      i++;
    }
    return pseudoList;
  };
  this.setProperty(this.OBJECT, 'getOwnPropertyNames',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(obj) {
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var i = 0;
    for (var key in obj.properties) {
      if (key in obj.nonenumerable) {
        continue;
      }
      thisInterpreter.setProperty(pseudoList, i,
          thisInterpreter.createPrimitive(key));
      i++;
    }
    return pseudoList;
  };
  this.setProperty(this.OBJECT, 'keys',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(obj, prop, descriptor) {
    prop = (prop || thisInterpreter.UNDEFINED).toString();
    if (!(descriptor instanceof Interpreter.Object)) {
      throw Error('Property description must be an object.');
    }
    return obj;
  };
  this.setProperty(this.OBJECT, 'defineProperty',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Array class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initArray = function(scope) {
  var thisInterpreter = this;
  var getInt = function(obj, def) {
    // Return an integer, or the default.
    var n = obj ? Math.floor(obj.toNumber()) : def;
    if (isNaN(n)) {
      n = def;
    }
    return n;
  };
  var strictComp = function(a, b) {
    // Strict === comparison.
    if (a.isPrimitive && b.isPrimitive) {
      return a.data === b.data;
    }
    return a === b;
  };
  var wrapper;
  // Array constructor.
  wrapper = function(var_args) {
    if (this.parent == thisInterpreter.ARRAY) {
      // Called with new.
      var newArray = this;
    } else {
      var newArray = thisInterpreter.createObject(thisInterpreter.ARRAY);
    }
    var first = arguments[0];
    if (first && first.type == 'number') {
      if (isNaN(thisInterpreter.arrayIndex(first))) {
        thisInterpreter.throwException(thisInterpreter.RANGE_ERROR,
                                       'Invalid array length');
      }
      newArray.length = first.data;
    } else {
      for (var i = 0; i < arguments.length; i++) {
        newArray.properties[i] = arguments[i];
      }
      newArray.length = i;
    }
    return newArray;
  };
  this.ARRAY = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Array', this.ARRAY);

  // Static methods on Array.
  wrapper = function(obj) {
    return thisInterpreter.createPrimitive(
        thisInterpreter.isa(obj, thisInterpreter.ARRAY));
  };
  this.setProperty(this.ARRAY, 'isArray',
                   this.createNativeFunction(wrapper), false, true);

  // Instance methods on Array.
  wrapper = function() {
    if (this.length) {
      var value = this.properties[this.length - 1];
      delete this.properties[this.length - 1];
      this.length--;
    } else {
      var value = thisInterpreter.UNDEFINED;
    }
    return value;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'pop',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(var_args) {
    for (var i = 0; i < arguments.length; i++) {
      this.properties[this.length] = arguments[i];
      this.length++;
    }
    return thisInterpreter.createPrimitive(this.length);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'push',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function() {
    if (this.length) {
      var value = this.properties[0];
      for (var i = 1; i < this.length; i++) {
        this.properties[i - 1] = this.properties[i];
      }
      this.length--;
      delete this.properties[this.length];
    } else {
      var value = thisInterpreter.UNDEFINED;
    }
    return value;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'shift',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(var_args) {
    for (var i = this.length - 1; i >= 0; i--) {
      this.properties[i + arguments.length] = this.properties[i];
    }
    this.length += arguments.length;
    for (var i = 0; i < arguments.length; i++) {
      this.properties[i] = arguments[i];
    }
    return thisInterpreter.createPrimitive(this.length);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'unshift',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function() {
    for (var i = 0; i < this.length / 2; i++) {
      var tmp = this.properties[this.length - i - 1];
      this.properties[this.length - i - 1] = this.properties[i];
      this.properties[i] = tmp;
    }
    return thisInterpreter.UNDEFINED;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'reverse',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(index, howmany, var_args) {
    index = getInt(index, 0);
    if (index < 0) {
      index = Math.max(this.length + index, 0);
    } else {
      index = Math.min(index, this.length);
    }
    howmany = getInt(howmany, Infinity);
    howmany = Math.min(howmany, this.length - index);
    var removed = thisInterpreter.createObject(thisInterpreter.ARRAY);
    // Remove specified elements.
    for (var i = index; i < index + howmany; i++) {
      removed.properties[removed.length++] = this.properties[i];
      this.properties[i] = this.properties[i + howmany];
    }
    // Move other element to fill the gap.
    for (var i = index + howmany; i < this.length - howmany; i++) {
      this.properties[i] = this.properties[i + howmany];
    }
    // Delete superfluous properties.
    for (var i = this.length - howmany; i < this.length; i++) {
      delete this.properties[i];
    }
    this.length -= howmany;
    // Insert specified items.
    for (var i = this.length - 1; i >= index; i--) {
      this.properties[i + arguments.length - 2] = this.properties[i];
    }
    this.length += arguments.length - 2;
    for (var i = 2; i < arguments.length; i++) {
      this.properties[index + i - 2] = arguments[i];
    }
    return removed;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'splice',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(opt_begin, opt_end) {
    var list = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var begin = getInt(opt_begin, 0);
    if (begin < 0) {
      begin = this.length + begin;
    }
    begin = Math.max(0, Math.min(begin, this.length));
    var end = getInt(opt_end, this.length);
    if (end < 0) {
      end = this.length + end;
    }
    end = Math.max(0, Math.min(end, this.length));
    var length = 0;
    for (var i = begin; i < end; i++) {
      var element = thisInterpreter.getProperty(this, i);
      thisInterpreter.setProperty(list, length++, element);
    }
    return list;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'slice',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(opt_separator) {
    if (!opt_separator || opt_separator.data === undefined) {
      var sep = undefined;
    } else {
      var sep = opt_separator.toString();
    }
    var text = [];
    for (var i = 0; i < this.length; i++) {
      text[i] = this.properties[i];
    }
    return thisInterpreter.createPrimitive(text.join(sep));
  };
  this.setProperty(this.ARRAY.properties.prototype, 'join',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(var_args) {
    var list = thisInterpreter.createObject(thisInterpreter.ARRAY);
    var length = 0;
    // Start by copying the current array.
    for (var i = 0; i < this.length; i++) {
      var element = thisInterpreter.getProperty(this, i);
      thisInterpreter.setProperty(list, length++, element);
    }
    // Loop through all arguments and copy them in.
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (thisInterpreter.isa(value, thisInterpreter.ARRAY)) {
        for (var j = 0; j < value.length; j++) {
          var element = thisInterpreter.getProperty(value, j);
          thisInterpreter.setProperty(list, length++, element);
        }
      } else {
        thisInterpreter.setProperty(list, length++, value);
      }
    }
    return list;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'concat',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(searchElement, opt_fromIndex) {
    searchElement = searchElement || thisInterpreter.UNDEFINED;
    var fromIndex = getInt(opt_fromIndex, 0);
    if (fromIndex < 0) {
      fromIndex = this.length + fromIndex;
    }
    fromIndex = Math.max(0, fromIndex);
    for (var i = fromIndex; i < this.length; i++) {
      var element = thisInterpreter.getProperty(this, i);
      if (strictComp(element, searchElement)) {
        return thisInterpreter.createPrimitive(i);
      }
    }
    return thisInterpreter.createPrimitive(-1);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'indexOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(searchElement, opt_fromIndex) {
    searchElement = searchElement || thisInterpreter.UNDEFINED;
    var fromIndex = getInt(opt_fromIndex, this.length);
    if (fromIndex < 0) {
      fromIndex = this.length + fromIndex;
    }
    fromIndex = Math.min(fromIndex, this.length - 1);
    for (var i = fromIndex; i >= 0; i--) {
      var element = thisInterpreter.getProperty(this, i);
      if (strictComp(element, searchElement)) {
        return thisInterpreter.createPrimitive(i);
      }
    }
    return thisInterpreter.createPrimitive(-1);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'lastIndexOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(opt_compFunc) {
    var jsList = [];
    for (var i = 0; i < this.length; i++) {
      jsList[i] = this.properties[i];
    }
    // TODO: Add custom sort comparison function(opt_compFunc).
    jsList.sort();
    for (var i = 0; i < jsList.length; i++) {
      thisInterpreter.setProperty(this, i, jsList[i]);
    }
    return this;
  };
  this.setProperty(this.ARRAY.properties.prototype, 'sort',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Number class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initNumber = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Number constructor.
  wrapper = function(value) {
    value = value ? value.toNumber() : 0;
    if (this.parent != thisInterpreter.NUMBER) {
      // Called as Number().
      return thisInterpreter.createPrimitive(value);
    }
    // Called as new Number().
    this.data = value;
    return this;
  };
  this.NUMBER = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Number', this.NUMBER);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY',
                   'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i],
                     this.createPrimitive(Number[numConsts[i]]));
  }

  wrapper = function(str) {
    str = str || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(parseFloat(str.toString()));
  };
  this.setProperty(this.NUMBER, 'parseFloat',
                   this.createNativeFunction(wrapper));

  wrapper = function(str, radix) {
    str = str || thisInterpreter.UNDEFINED;
    radix = radix || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(
        parseInt(str.toString(), radix.toNumber()));
  };
  this.setProperty(this.NUMBER, 'parseInt',
                   this.createNativeFunction(wrapper));

  wrapper = function(fractionDigits) {
    fractionDigits = fractionDigits ? fractionDigits.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toExponential(fractionDigits));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toExponential',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(digits) {
    digits = digits ? digits.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toFixed(digits));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toFixed',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(precision) {
    precision = precision ? precision.toNumber() : undefined;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toPrecision(precision));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toPrecision',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(radix) {
    radix = radix ? radix.toNumber() : 10;
    var n = this.toNumber();
    return thisInterpreter.createPrimitive(n.toString(radix));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toString',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(locales, options) {
    locales = locales ? thisInterpreter.pseudoToNative(locales) : undefined;
    options = options ? thisInterpreter.pseudoToNative(options) : undefined;
    return thisInterpreter.createPrimitive(
        this.toNumber().toLocaleString(locales, options));
  };
  this.setProperty(this.NUMBER.properties.prototype, 'toLocaleString',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the String class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initString = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // String constructor.
  wrapper = function(value) {
    value = value ? value.toString() : '';
    if (this.parent != thisInterpreter.STRING) {
      // Called as String().
      return thisInterpreter.createPrimitive(value);
    }
    // Called as new String().
    this.data = value;
    return this;
  };
  this.STRING = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'String', this.STRING);

  // Static methods.
  wrapper = function(var_args) {
    for (var i = 0; i < arguments.length; i++) {
      arguments[i] = arguments[i].toNumber();
    }
    return thisInterpreter.createPrimitive(
        String.fromCharCode.apply(String, arguments));
  };
  this.setProperty(this.STRING, 'fromCharCode',
                   this.createNativeFunction(wrapper), false, true);

  // Instance methods.
  // Methods with no arguments.
  var functions = ['toLowerCase', 'toUpperCase',
                   'toLocaleLowerCase', 'toLocaleUpperCase'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function() {
        return thisInterpreter.createPrimitive(nativeFunc.apply(this));
      };
    })(String.prototype[functions[i]]);
    this.setProperty(this.STRING.properties.prototype, functions[i],
                     this.createNativeFunction(wrapper), false, true);
  }

  // Trim function may not exist in host browser.  Write them from scratch.
  wrapper = function() {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/^\s+|\s+$/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trim',
                   this.createNativeFunction(wrapper), false, true);
  wrapper = function() {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/^\s+/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trimLeft',
                   this.createNativeFunction(wrapper), false, true);
  wrapper = function() {
    var str = this.toString();
    return thisInterpreter.createPrimitive(str.replace(/\s+$/g, ''));
  };
  this.setProperty(this.STRING.properties.prototype, 'trimRight',
                   this.createNativeFunction(wrapper), false, true);

  // Methods with only numeric arguments.
  var functions = ['charAt', 'charCodeAt', 'substring', 'slice', 'substr'];
  for (var i = 0; i < functions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function() {
        for (var j = 0; j < arguments.length; j++) {
          arguments[j] = arguments[j].toNumber();
        }
        return thisInterpreter.createPrimitive(
            nativeFunc.apply(this, arguments));
      };
    })(String.prototype[functions[i]]);
    this.setProperty(this.STRING.properties.prototype, functions[i],
                     this.createNativeFunction(wrapper), false, true);
  }

  wrapper = function(searchValue, fromIndex) {
    var str = this.toString();
    searchValue = (searchValue || thisInterpreter.UNDEFINED).toString();
    fromIndex = fromIndex ? fromIndex.toNumber() : undefined;
    return thisInterpreter.createPrimitive(
        str.indexOf(searchValue, fromIndex));
  };
  this.setProperty(this.STRING.properties.prototype, 'indexOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(searchValue, fromIndex) {
    var str = this.toString();
    searchValue = (searchValue || thisInterpreter.UNDEFINED).toString();
    fromIndex = fromIndex ? fromIndex.toNumber() : undefined;
    return thisInterpreter.createPrimitive(
        str.lastIndexOf(searchValue, fromIndex));
  };
  this.setProperty(this.STRING.properties.prototype, 'lastIndexOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(compareString, locales, options) {
    compareString = (compareString || thisInterpreter.UNDEFINED).toString();
    locales = locales ? thisInterpreter.pseudoToNative(locales) : undefined;
    options = options ? thisInterpreter.pseudoToNative(options) : undefined;
    return thisInterpreter.createPrimitive(
        this.toString().localeCompare(compareString, locales, options));
  };
  this.setProperty(this.STRING.properties.prototype, 'localeCompare',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(separator, limit) {
    var str = this.toString();
    if (separator) {
      separator = thisInterpreter.isa(separator, thisInterpreter.REGEXP) ?
          separator.data : separator.toString();
    } else { // is this really necessary?
      separator = undefined;
    }
    limit = limit ? limit.toNumber() : undefined;
    var jsList = str.split(separator, limit);
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    for (var i = 0; i < jsList.length; i++) {
      thisInterpreter.setProperty(pseudoList, i,
          thisInterpreter.createPrimitive(jsList[i]));
    }
    return pseudoList;
  };
  this.setProperty(this.STRING.properties.prototype, 'split',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(var_args) {
    var str = this.toString();
    for (var i = 0; i < arguments.length; i++) {
      str += arguments[i].toString();
    }
    return thisInterpreter.createPrimitive(str);
  };
  this.setProperty(this.STRING.properties.prototype, 'concat',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(regexp) {
    var str = this.toString();
    regexp = regexp ? regexp.data : undefined;
    var match = str.match(regexp);
    if (match === null) {
      return thisInterpreter.NULL;
    }
    var pseudoList = thisInterpreter.createObject(thisInterpreter.ARRAY);
    for (var i = 0; i < match.length; i++) {
      thisInterpreter.setProperty(pseudoList, i,
          thisInterpreter.createPrimitive(match[i]));
    }
    return pseudoList;
  };
  this.setProperty(this.STRING.properties.prototype, 'match',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(regexp) {
    var str = this.toString();
    regexp = regexp ? regexp.data : undefined;
    return thisInterpreter.createPrimitive(str.search(regexp));
  };
  this.setProperty(this.STRING.properties.prototype, 'search',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(substr, newSubStr) {
    var str = this.toString();
    substr = (substr || thisInterpreter.UNDEFINED).valueOf();
    newSubStr = (newSubStr || thisInterpreter.UNDEFINED).toString();
    return thisInterpreter.createPrimitive(str.replace(substr, newSubStr));
  };
  this.setProperty(this.STRING.properties.prototype, 'replace',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize the Boolean class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initBoolean = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Boolean constructor.
  wrapper = function(value) {
    value = value ? value.toBoolean() : false;
    if (this.parent != thisInterpreter.BOOLEAN) {
      // Called as Boolean().
      return thisInterpreter.createPrimitive(value);
    }
    // Called as new Boolean().
    this.data = value;
    return this;
  };
  this.BOOLEAN = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Boolean', this.BOOLEAN);
};

/**
 * Initialize the Date class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initDate = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Date constructor.
  wrapper = function(a, b, c, d, e, f, h) {
    if (this.parent == thisInterpreter.DATE) {
      // Called with new.
      var newDate = this;
    } else {
      // Calling Date() as a function returns a string, no arguments are heeded.
      return thisInterpreter.createPrimitive(Date());
    }
    if (!arguments.length) {
      newDate.data = new Date();
    } else if (arguments.length == 1 && (a.type == 'string' ||
        thisInterpreter.isa(a, thisInterpreter.STRING))) {
      newDate.data = new Date(a.toString());
    } else {
      var args = [null];
      for (var i = 0; i < arguments.length; i++) {
        args[i + 1] = arguments[i] ? arguments[i].toNumber() : undefined;
      }
      newDate.data = new (Function.prototype.bind.apply(Date, args));
    }
    return newDate;
  };
  this.DATE = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Date', this.DATE);

  // Static methods.
  wrapper = function() {
    return thisInterpreter.createPrimitive(new Date().getTime());
  };
  this.setProperty(this.DATE, 'now',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(dateString) {
    dateString = dateString ? dateString.toString() : undefined;
    return thisInterpreter.createPrimitive(Date.parse(dateString));
  };
  this.setProperty(this.DATE, 'parse',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(a, b, c, d, e, f, h) {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i] ? arguments[i].toNumber() : undefined;
    }
    return thisInterpreter.createPrimitive(Date.UTC.apply(Date, args));
  };
  this.setProperty(this.DATE, 'UTC',
                   this.createNativeFunction(wrapper), false, true);

  // Instance methods.
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
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = thisInterpreter.pseudoToNative(arguments[i]);
        }
        return thisInterpreter.createPrimitive(
            this.data[nativeFunc].apply(this.data, args));
      };
    })(functions[i]);
    this.setProperty(this.DATE.properties.prototype, functions[i],
                     this.createNativeFunction(wrapper), false, true);
  }
};

/**
 * Initialize Math object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initMath = function(scope) {
  var thisInterpreter = this;
  var myMath = this.createObject(this.OBJECT);
  this.setProperty(scope, 'Math', myMath);
  var mathConsts = ['E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI',
                    'SQRT1_2', 'SQRT2'];
  for (var i = 0; i < mathConsts.length; i++) {
    this.setProperty(myMath, mathConsts[i],
        this.createPrimitive(Math[mathConsts[i]]), false, true);
  }
  var numFunctions = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos',
                      'exp', 'floor', 'log', 'max', 'min', 'pow', 'random',
                      'round', 'sin', 'sqrt', 'tan'];
  for (var i = 0; i < numFunctions.length; i++) {
    var wrapper = (function(nativeFunc) {
      return function() {
        for (var j = 0; j < arguments.length; j++) {
          arguments[j] = arguments[j].toNumber();
        }
        return thisInterpreter.createPrimitive(
            nativeFunc.apply(Math, arguments));
      };
    })(Math[numFunctions[i]]);
    this.setProperty(myMath, numFunctions[i],
        this.createNativeFunction(wrapper), false, true);
  }
};

/**
 * Initialize Regular Expression object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initRegExp = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Regex constructor.
  wrapper = function(pattern, flags) {
    if (this.parent == thisInterpreter.REGEXP) {
      // Called with new.
      var rgx = this;
    } else {
      var rgx = thisInterpreter.createObject(thisInterpreter.REGEXP);
    }
    pattern = pattern ? pattern.toString() : '';
    flags = flags ? flags.toString() : '';
    thisInterpreter.populateRegExp_(rgx, new RegExp(pattern, flags));
    return rgx;
  };
  this.REGEXP = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'RegExp', this.REGEXP);

  this.setProperty(this.REGEXP.properties.prototype, 'global',
      this.UNDEFINED, true, true);
  this.setProperty(this.REGEXP.properties.prototype, 'ignoreCase',
      this.UNDEFINED, true, true);
  this.setProperty(this.REGEXP.properties.prototype, 'multiline',
      this.UNDEFINED, true, true);
  this.setProperty(this.REGEXP.properties.prototype, 'source',
      this.createPrimitive('(?:)'), true, true);

  wrapper = function(str) {
    str = str.toString();
    return thisInterpreter.createPrimitive(this.data.test(str));
  };
  this.setProperty(this.REGEXP.properties.prototype, 'test',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(str) {
    str = str.toString();
    // Get lastIndex from wrapped regex, since this is settable.
    this.data.lastIndex =
        thisInterpreter.getProperty(this, 'lastIndex').toNumber();
    var match = this.data.exec(str);
    thisInterpreter.setProperty(this, 'lastIndex',
        thisInterpreter.createPrimitive(this.data.lastIndex));

    if (match) {
      var result = thisInterpreter.createObject(thisInterpreter.ARRAY);
      for (var i = 0; i < match.length; i++) {
        thisInterpreter.setProperty(result, i,
            thisInterpreter.createPrimitive(match[i]));
      }
      // match has additional properties.
      thisInterpreter.setProperty(result, 'index',
          thisInterpreter.createPrimitive(match.index));
      thisInterpreter.setProperty(result, 'input',
          thisInterpreter.createPrimitive(match.input));
      return result;
    }
    return thisInterpreter.NULL;
  };
  this.setProperty(this.REGEXP.properties.prototype, 'exec',
                   this.createNativeFunction(wrapper), false, true);
};

/**
 * Initialize JSON object.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initJSON = function(scope) {
  var thisInterpreter = this;
  var myJSON = thisInterpreter.createObject(this.OBJECT);
  this.setProperty(scope, 'JSON', myJSON);

  var wrapper = function(text) {
    var nativeObj = JSON.parse(text.toString());
    return thisInterpreter.nativeToPseudo(nativeObj);
  };
  this.setProperty(myJSON, 'parse', this.createNativeFunction(wrapper));

  wrapper = function(value) {
    var nativeObj = thisInterpreter.pseudoToNative(value);
    return thisInterpreter.createPrimitive(JSON.stringify(nativeObj));
  };
  this.setProperty(myJSON, 'stringify', this.createNativeFunction(wrapper));
};

/**
 * Initialize the Error class.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initError = function(scope) {
  var thisInterpreter = this;
  var wrapper;
  // Error constructor.
  wrapper = function(opt_message) {
    if (this.parent == thisInterpreter.ERROR) {
      // Called with new.
      var newError = this;
    } else {
      var newError = thisInterpreter.createObject(thisInterpreter.ERROR);
    }
    if (opt_message) {
      thisInterpreter.setProperty(newError, 'message',
          thisInterpreter.createPrimitive(String(opt_message)), false, true);
    }
    return newError;
  };
  this.ERROR = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Error', this.ERROR);
  this.setProperty(this.ERROR.properties.prototype,
                   'message', this.STRING_EMPTY, false, true);
  this.setProperty(this.ERROR.properties.prototype,
                   'name', this.createPrimitive('Error'), false, true);

  // Create half a dozen error subclasses.
  var errors = {
    EVAL_ERROR: 'EvalError',
    RANGE_ERROR: 'RangeError',
    REFERENCE_ERROR: 'ReferenceError',
    SYNTAX_ERROR: 'SyntaxError',
    TYPE_ERROR: 'TypeError',
    URI_ERROR: 'URIError'
  };
  for (var constName in errors) {
    var errorName = errors[constName];
    //EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError
    wrapper = function(name) {
      return function(opt_message) {
        if (thisInterpreter.isa(this.parent, thisInterpreter.ERROR)) {
          // Called with new.
          var newError = this;
        } else {
          var newError = thisInterpreter.createObject(thisInterpreter[name]);
        }
        if (opt_message) {
          thisInterpreter.setProperty(newError, 'message',
              thisInterpreter.createPrimitive(String(opt_message)), false, true);
        }
        return newError;
      };
    };
    this[constName] = this.createNativeFunction(wrapper(constName));
    this.setProperty(this[constName], 'prototype', this.createObject(this.ERROR));
    this.setProperty(this[constName].properties.prototype,
                     'name', this.createPrimitive(errorName), false, true);
    this.setProperty(scope, errorName, this[constName]);
  }
};

/**
 * Is an object of a certain class?
 * @param {Object} child Object to check.
 * @param {Object} parent Constructor of object.
 * @return {boolean} True if object is the class or inherits from it.
 *     False otherwise.
 */
Interpreter.prototype.isa = function(child, parent) {
  if (!child || !parent) {
    return false;
  }
  while (child.parent != parent) {
    if (!child.parent || !child.parent.properties.prototype) {
      return false;
    }
    child = child.parent.properties.prototype;
  }
  return true;
};

/**
 * Compares two objects against each other.
 * @param {!Object} a First object.
 * @param {!Object} b Second object.
 * @return {number} -1 if a is smaller, 0 if a == b, 1 if a is bigger,
 *     NaN if they are not comparable.
 */
Interpreter.prototype.comp = function(a, b) {
  if (a.isPrimitive && typeof a == 'number' && isNaN(a.data) ||
      b.isPrimitive && typeof b == 'number' && isNaN(b.data)) {
    // NaN is not comparable to anything, including itself.
    return NaN;
  }
  if (a === b) {
    return 0;
  }
  if (a.isPrimitive && b.isPrimitive) {
    a = a.data;
    b = b.data;
  } else {
    // TODO: Handle other types.
    return NaN;
  }
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
};

/**
 * Is a value a legal integer for an array?
 * @param {*} n Value to check.
 * @return {number} Zero, or a positive integer if the value can be
 *     converted to such.  NaN otherwise.
 */
Interpreter.prototype.arrayIndex = function(n) {
  n = Number(n);
  if (!isFinite(n) || n != Math.floor(n) || n < 0) {
    return NaN;
  }
  return n;
};

/**
 * Class for a number, string, boolean, null, or undefined.
 * @param {number|string|boolean|null|undefined} data Primitive value.
 * @param {!Interpreter} interpreter The JS Interpreter to bind to.
 * @constructor
 */
Interpreter.Primitive = function(data, interpreter) {
  var type = typeof data;
  this.data = data;
  this.type = type;
  if (type == 'number') {
    this.parent = interpreter.NUMBER;
  } else if (type == 'string') {
    this.parent = interpreter.STRING;
  } else if (type == 'boolean') {
    this.parent = interpreter.BOOLEAN;
  }
};

/**
 * @type {number|string|boolean|null|undefined}
 */
Interpreter.Primitive.prototype.data = undefined;

/**
 * @type {string}
 */
Interpreter.Primitive.prototype.type = undefined;

/**
 * @type {Function}
 */
Interpreter.Primitive.prototype.parent = null;

/**
 * @type {boolean}
 */
Interpreter.Primitive.prototype.isPrimitive = true;

/**
 * Convert this primitive into a boolean.
 * @return {boolean} Boolean value.
 */
Interpreter.Primitive.prototype.toBoolean = function() {
  return Boolean(this.data);
};

/**
 * Convert this primitive into a number.
 * @return {number} Number value.
 */
Interpreter.Primitive.prototype.toNumber = function() {
  return Number(this.data);
};

/**
 * Convert this primitive into a string.
 * @return {string} String value.
 */
Interpreter.Primitive.prototype.toString = function() {
  return String(this.data);
};

/**
 * Return the primitive value.
 * @return {number|string|boolean|null|undefined} Primitive value.
 */
Interpreter.Primitive.prototype.valueOf = function() {
  return this.data;
};

/**
 * Create a new data object for a primitive.
 * @param {number|string|boolean|null|undefined|RegExp} data Data to
 *     encapsulate.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createPrimitive = function(data) {
  // Reuse a predefined primitive constant if possible.
  if (data === undefined) {
    return this.UNDEFINED;
  } else if (data === null) {
    return this.NULL;
  } else if (data === true) {
    return this.TRUE;
  } else if (data === false) {
    return this.FALSE;
  } else if (data === 0) {
    return this.NUMBER_ZERO;
  } else if (data === 1) {
    return this.NUMBER_ONE;
  } else if (data === '') {
    return this.STRING_EMPTY;
  } else if (data instanceof RegExp) {
    return this.populateRegExp_(this.createObject(this.REGEXP), data);
  }
  return new Interpreter.Primitive(data, this);
};

/**
 * Class for an object.
 * @param {Object} parent Parent constructor function.
 * @constructor
 */
Interpreter.Object = function(parent) {
  this.fixed = Object.create(null);
  this.nonenumerable = Object.create(null);
  this.properties = Object.create(null);
  this.parent = parent;
};

/**
 * @type {string}
 */
Interpreter.Object.prototype.type = 'object';

/**
 * @type {Function}
 */
Interpreter.Object.prototype.parent = null;

/**
 * @type {boolean}
 */
Interpreter.Object.prototype.isPrimitive = false;

/**
 * @type {number|string|boolean|undefined}
 */
Interpreter.Object.prototype.data = undefined;

/**
 * Convert this object into a boolean.
 * @return {boolean} Boolean value.
 */
Interpreter.Object.prototype.toBoolean = function() {
  return true;
};

/**
 * Convert this object into a number.
 * @return {number} Number value.
 */
Interpreter.Object.prototype.toNumber = function() {
  return Number(this.data === undefined ? this.toString() : this.data);
};

/**
 * Convert this object into a string.
 * @return {string} String value.
 */
Interpreter.Object.prototype.toString = function() {
  return this.data === undefined ? ('[' + this.type + ']') : String(this.data);
};

/**
 * Return the object value.
 * @return {!Object} Value.
 */
Interpreter.Object.prototype.valueOf = function() {
  return this.data === undefined ? this : this.data;
};

/**
 * Create a new data object.
 * @param {Object} parent Parent constructor function.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createObject = function(parent) {
  var obj = new Interpreter.Object(parent);
  // Functions have prototype objects.
  if (this.isa(obj, this.FUNCTION)) {
    obj.type = 'function';
    this.setProperty(obj, 'prototype', this.createObject(this.OBJECT || null));
  }
  // Arrays have length.
  if (this.isa(obj, this.ARRAY)) {
    obj.length = 0;
    obj.toString = function() {
      var strs = [];
      for (var i = 0; i < this.length; i++) {
        strs[i] = (this.properties[i] == undefined ||
                   this.properties[i] == null) ?
                   '' : this.properties[i].toString();
      }
      return strs.join(',');
    };
  }
  return obj;
};

/**
 * Initialize a pseudo regular expression object based on a native regular
 * expression object.
 * @param {!Object} pseudoRegexp The existing object to set.
 * @param {!Regexp} nativeRegexp The native regular expression.
 * @return {!Object} Newly populated regular expression object.
 * @private
 */
Interpreter.prototype.populateRegExp_ = function(pseudoRegexp, nativeRegexp) {
  pseudoRegexp.data = nativeRegexp;
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(pseudoRegexp, 'lastIndex',
                   this.createPrimitive(nativeRegexp.lastIndex),
                   false, true);
  this.setProperty(pseudoRegexp, 'source',
                   this.createPrimitive(nativeRegexp.source),
                   true, true);
  this.setProperty(pseudoRegexp, 'global',
                   this.createPrimitive(nativeRegexp.global),
                   true, true);
  this.setProperty(pseudoRegexp, 'ignoreCase',
                   this.createPrimitive(nativeRegexp.ignoreCase),
                   true, true);
  this.setProperty(pseudoRegexp, 'multiline',
                   this.createPrimitive(nativeRegexp.multiline),
                   true, true);
  // Override a couple of Object's conversion functions.
  pseudoRegexp.toString = function() {return String(this.data);};
  pseudoRegexp.valueOf = function() {return this.data;};
  return pseudoRegexp;
};

/**
 * Create a new function.
 * @param {Object} node AST node defining the function.
 * @param {Object} opt_scope Optional parent scope.
 * @return {!Object} New function.
 */
Interpreter.prototype.createFunction = function(node, opt_scope) {
  var func = this.createObject(this.FUNCTION);
  func.parentScope = opt_scope || this.getScope();
  func.node = node;
  this.setProperty(func, 'length',
                   this.createPrimitive(func.node.params.length), true);
  return func;
};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc) {
  var func = this.createObject(this.FUNCTION);
  func.nativeFunc = nativeFunc;
  this.setProperty(func, 'length',
                   this.createPrimitive(nativeFunc.length), true);
  return func;
};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createAsyncFunction = function(asyncFunc) {
  var func = this.createObject(this.FUNCTION);
  func.asyncFunc = asyncFunc;
  this.setProperty(func, 'length',
                   this.createPrimitive(asyncFunc.length), true);
  return func;
};

/**
 * Converts from a native JS object or value to a JS interpreter object.
 * Can handle JSON-style values.
 * @param {*} nativeObj The native JS object to be converted.
 * @return {!Object} The equivalent JS interpreter object.
 */
Interpreter.prototype.nativeToPseudo = function(nativeObj) {
  if (typeof nativeObj !== 'object') {
    return this.createPrimitive(nativeObj);
  }
  var pseudoObj;
  if (nativeObj instanceof Array) {  // Array.
    pseudoObj = this.createObject(this.ARRAY);
    for (var i = 0; i < nativeObj.length; i++) {
      this.setProperty(pseudoObj, i, this.nativeToPseudo(nativeObj[i]));
    }
  } else {  // Object.
    pseudoObj = this.createObject(this.OBJECT);
    for (var key in nativeObj) {
      this.setProperty(pseudoObj, key, this.nativeToPseudo(nativeObj[key]));
    }
  }
  return pseudoObj;
};

/**
 * Converts from a JS interpreter object to native JS object.
 * Can handle JSON-style values.
 * @param {!Object} pseudoObj The JS interpreter object to be converted.
 * @return {*} The equivalent native JS object or value.
 */
Interpreter.prototype.pseudoToNative = function(pseudoObj) {
  if (pseudoObj.isPrimitive ||
      this.isa(pseudoObj, this.NUMBER) ||
      this.isa(pseudoObj, this.STRING) ||
      this.isa(pseudoObj, this.BOOLEAN)) {
    return pseudoObj.data;
  }
  var nativeObj;
  if (this.isa(pseudoObj, this.ARRAY)) {  // Array.
    nativeObj = [];
    for (var i = 0; i < pseudoObj.length; i++) {
      nativeObj[i] = this.pseudoToNative(pseudoObj.properties[i]);
    }
  } else {  // Object.
    nativeObj = {};
    for (var key in pseudoObj.properties) {
      nativeObj[key] = this.pseudoToNative(pseudoObj.properties[key]);
    }
  }
  return nativeObj;
};

/**
 * Fetch a property value from a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {!Object} Property value (may be UNDEFINED).
 */
Interpreter.prototype.getProperty = function(obj, name) {
  name = name.toString();
  if (obj == this.UNDEFINED || obj == this.NULL) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot read property '" + name + "' of " + obj);
  }
  // Special cases for magic length property.
  if (this.isa(obj, this.STRING)) {
    if (name == 'length') {
      return this.createPrimitive(obj.data.length);
    }
    var n = this.arrayIndex(name);
    if (!isNaN(n) && n < obj.data.length) {
      return this.createPrimitive(obj.data[n]);
    }
  } else if (this.isa(obj, this.ARRAY) && name == 'length') {
    return this.createPrimitive(obj.length);
  }
  while (true) {
    if (obj.properties && name in obj.properties) {
      return obj.properties[name];
    }
    if (obj.parent && obj.parent.properties &&
        obj.parent.properties.prototype) {
      obj = obj.parent.properties.prototype;
    } else {
      // No parent, reached the top.
      break;
    }
  }
  return this.UNDEFINED;
};

/**
 * Does the named property exist on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {boolean} True if property exists.
 */
Interpreter.prototype.hasProperty = function(obj, name) {
  name = name.toString();
  if (obj.isPrimitive) {
    throw TypeError('Primitive data type has no properties');
  }
  if (name == 'length' &&
      (this.isa(obj, this.STRING) || this.isa(obj, this.ARRAY))) {
    return true;
  }
  if (this.isa(obj, this.STRING)) {
    var n = this.arrayIndex(name);
    if (!isNaN(n) && n < obj.data.length) {
      return true;
    }
  }
  while (true) {
    if (obj.properties && name in obj.properties) {
      return true;
    }
    if (obj.parent && obj.parent.properties &&
        obj.parent.properties.prototype) {
      obj = obj.parent.properties.prototype;
    } else {
      // No parent, reached the top.
      break;
    }
  }
  return false;
};

/**
 * Set a property value on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @param {!Object} value New property value.
 * @param {boolean} opt_fixed Unchangeable property if true.
 * @param {boolean} opt_nonenum Non-enumerable property if true.
 */
Interpreter.prototype.setProperty = function(obj, name, value,
                                             opt_fixed, opt_nonenum) {
  name = name.toString();
  if (typeof value != 'object') {
    throw Error('Failure to wrap a value: ' + value);
  }
  if (obj == this.UNDEFINED || obj == this.NULL) {
    this.throwException(this.TYPE_ERROR,
                        "Cannot set property '" + name + "' of " + obj);
  }
  if (obj.isPrimitive || obj.fixed[name]) {
    return;
  }
  if (this.isa(obj, this.STRING)) {
    var n = this.arrayIndex(name);
    if (name == 'length' || (!isNaN(n) && n < obj.data.length)) {
      // Can't set length or letters on Strings.
      return;
    }
  }
  if (this.isa(obj, this.ARRAY)) {
    // Arrays have a magic length variable that is bound to the elements.
    var i;
    if (name == 'length') {
      // Delete elements if length is smaller.
      var newLength = this.arrayIndex(value.toNumber());
      if (isNaN(newLength)) {
        this.throwException(this.RANGE_ERROR, 'Invalid array length');
      }
      if (newLength < obj.length) {
        for (i in obj.properties) {
          i = this.arrayIndex(i);
          if (!isNaN(i) && newLength <= i) {
            delete obj.properties[i];
          }
        }
      }
      obj.length = newLength;
      return;  // Don't set a real length property.
    } else if (!isNaN(i = this.arrayIndex(name))) {
      // Increase length if this index is larger.
      obj.length = Math.max(obj.length, i + 1);
    }
  }
  // Set the property.
  obj.properties[name] = value;
  if (opt_fixed) {
    obj.fixed[name] = true;
  }
  if (opt_nonenum) {
    obj.nonenumerable[name] = true;
  }
};

/**
 * Delete a property value on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {boolean} True if deleted, false if undeletable.
 */
Interpreter.prototype.deleteProperty = function(obj, name) {
  name = name.toString();
  if (obj.isPrimitive || obj.fixed[name]) {
    return false;
  }
  if (name == 'length' && this.isa(obj, this.ARRAY)) {
    return false;
  }
  return delete obj.properties[name];
};

/**
 * Returns the current scope from the stateStack.
 * @return {!Object} Current scope dictionary.
 */
Interpreter.prototype.getScope = function() {
  for (var i = 0; i < this.stateStack.length; i++) {
    if (this.stateStack[i].scope) {
      return this.stateStack[i].scope;
    }
  }
  throw Error('No scope found.');
};

/**
 * Create a new scope dictionary.
 * @param {!Object} node AST node defining the scope container
 *     (e.g. a function).
 * @param {Object} parentScope Scope to link to.
 * @return {!Object} New scope.
 */
Interpreter.prototype.createScope = function(node, parentScope) {
  var scope = this.createObject(null);
  scope.parentScope = parentScope;
  if (!parentScope) {
    this.initGlobalScope(scope);
  }
  this.populateScope_(node, scope);

  // Determine if this scope starts with 'use strict'.
  scope.strict = false;
  if (parentScope && parentScope.strict) {
    scope.strict = true;
  } else {
    var firstNode = node.body && node.body[0];
    if (firstNode && firstNode.expression &&
        firstNode.expression.type == 'Literal' &&
        firstNode.expression.value == 'use strict') {
      scope.strict = true;
    }
  }
  return scope;
};

/**
 * Create a new special scope dictionary. Similar to createScope(), but
 * doesn't assume that the scope is for a function body. This is used for
 * the catch clause and with statement.
 * @param {!Object} parentScope Scope to link to.
 * @param {Object=} opt_scope Optional object to transform into scope.
 * @return {!Object} New scope.
 */
Interpreter.prototype.createSpecialScope = function(parentScope, opt_scope) {
  if (!parentScope) {
    throw Error('parentScope required');
  }
  var scope = opt_scope || this.createObject(null);
  scope.parentScope = parentScope;
  scope.strict = parentScope.strict;
  return scope;
};


/**
 * Retrieves a value from the scope chain.
 * @param {!Object} name Name of variable.
 * @return {!Object} The value.
 */
Interpreter.prototype.getValueFromScope = function(name) {
  var scope = this.getScope();
  var nameStr = name.toString();
  while (scope) {
    if (nameStr in scope.properties) {
      return scope.properties[nameStr];
    }
    scope = scope.parentScope;
  }
  this.throwException(this.REFERENCE_ERROR, nameStr + ' is not defined');
  return this.UNDEFINED;
};

/**
 * Sets a value to the current scope.
 * @param {!Object} name Name of variable.
 * @param {!Object} value Value.
 */
Interpreter.prototype.setValueToScope = function(name, value) {
  var scope = this.getScope();
  var strict = scope.strict;
  var nameStr = name.toString();
  while (scope) {
    if ((nameStr in scope.properties) || (!strict && !scope.parentScope)) {
      if (!scope.fixed[nameStr]) {
        scope.properties[nameStr] = value;
      }
      return;
    }
    scope = scope.parentScope;
  }
  this.throwException(this.REFERENCE_ERROR, nameStr + ' is not defined');
};

/**
 * Create a new scope for the given node.
 * @param {!Object} node AST node (program or function).
 * @param {!Object} scope Scope dictionary to populate.
 * @private
 */
Interpreter.prototype.populateScope_ = function(node, scope) {
  if (node.type == 'VariableDeclaration') {
    for (var i = 0; i < node.declarations.length; i++) {
      this.setProperty(scope, node.declarations[i].id.name, this.UNDEFINED);
    }
  } else if (node.type == 'FunctionDeclaration') {
    this.setProperty(scope, node.id.name, this.createFunction(node, scope));
    return;  // Do not recurse into function.
  } else if (node.type == 'FunctionExpression') {
    return;  // Do not recurse into function.
  }
  var thisIterpreter = this;
  function recurse(child) {
    if (child.constructor == thisIterpreter.ast.constructor) {
      thisIterpreter.populateScope_(child, scope);
    }
  }
  for (var name in node) {
    var prop = node[name];
    if (prop && typeof prop == 'object') {
      if (typeof prop.length == 'number' && prop.splice) {
        // Prop is an array.
        for (var i = 0; i < prop.length; i++) {
          recurse(prop[i]);
        }
      } else {
        recurse(prop);
      }
    }
  }
};

/**
 * Gets a value from the scope chain or from an object property.
 * @param {!Object|!Array} left Name of variable or object/propname tuple.
 * @return {!Object} Value.
 */
Interpreter.prototype.getValue = function(left) {
  if (left.length) {
    var obj = left[0];
    var prop = left[1];
    return this.getProperty(obj, prop);
  } else {
    return this.getValueFromScope(left);
  }
};

/**
 * Sets a value to the scope chain or to an object property.
 * @param {!Object|!Array} left Name of variable or object/propname tuple.
 * @param {!Object} value Value.
 */
Interpreter.prototype.setValue = function(left, value) {
  if (left.length) {
    var obj = left[0];
    var prop = left[1];
    this.setProperty(obj, prop, value);
  } else {
    this.setValueToScope(left, value);
  }
};

/**
 * Throw an exception in the interpreter that can be handled by a
 * interpreter try/catch statement.  If unhandled, a real exception will
 * be thrown.  Can be called with either an error class and a message, or
 * with an actual object to be thrown.
 * @param {!Object} errorClass Type of error (if message is provided) or the
 *   value to throw (if no message).
 * @param {string} opt_message Message being thrown.
 */
Interpreter.prototype.throwException = function(errorClass, opt_message) {
  if (this.stateStack[0].interpreter) {
    // This is the wrong interpreter, we are spinning on an eval.
    try {
      this.stateStack[0].interpreter.throwException(errorClass, opt_message);
      return;
    } catch (e) {
      // The eval threw an error and did not catch it.
      // Continue to see if this level can catch it.
    }
  }
  if (opt_message === undefined) {
    var error = errorClass;
  } else {
    var error = this.createObject(errorClass);
    this.setProperty(error, 'message',
        this.createPrimitive(opt_message), false, true);
  }
  // Search for a try statement.
  do {
    var state = this.stateStack.shift();
  } while (state && state.node.type !== 'TryStatement');
  if (state) {
    // Error is being trapped.
    this.stateStack.unshift({
      node: state.node.handler,
      throwValue: error
    });
  } else {
    // Throw a real error.
    var realError;
    if (this.isa(error, this.ERROR)) {
      var errorTable = {
        'EvalError': EvalError,
        'RangeError': RangeError,
        'ReferenceError': ReferenceError,
        'SyntaxError': SyntaxError,
        'TypeError': TypeError,
        'URIError': URIError
      };
      var type = errorTable[this.getProperty(error, 'name')] || Error;
      realError = type(this.getProperty(error, 'message'));
    } else {
      realError = error.toString();
    }
    throw realError;
  }
};

// Functions to handle each node type.

Interpreter.prototype['stepArrayExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (!state.array) {
    state.array = this.createObject(this.ARRAY);
  } else {
    this.setProperty(state.array, n - 1, state.value);
  }
  if (node.elements[n]) {
    state.n = n + 1;
    this.stateStack.unshift({node: node.elements[n]});
  } else {
    state.array.length = state.n || 0;
    this.stateStack.shift();
    this.stateStack[0].value = state.array;
  }
};

Interpreter.prototype['stepAssignmentExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneLeft) {
    state.doneLeft = true;
    this.stateStack.unshift({node: node.left, components: true});
    return;
  }
  if (!state.doneRight) {
    state.doneRight = true;
    state.leftSide = state.value;
    this.stateStack.unshift({node: node.right});
    return;
  }
  this.stateStack.shift();
  var leftSide = state.leftSide;
  var rightSide = state.value;
  var value;
  if (node.operator == '=') {
    value = rightSide;
  } else {
    var leftValue = this.getValue(leftSide);
    var rightValue = rightSide;
    var leftNumber = leftValue.toNumber();
    var rightNumber = rightValue.toNumber();
    if (node.operator == '+=') {
      var left, right;
      if (leftValue.type == 'string' || rightValue.type == 'string') {
        left = leftValue.toString();
        right = rightValue.toString();
      } else {
        left = leftNumber;
        right = rightNumber;
      }
      value = left + right;
    } else if (node.operator == '-=') {
      value = leftNumber - rightNumber;
    } else if (node.operator == '*=') {
      value = leftNumber * rightNumber;
    } else if (node.operator == '/=') {
      value = leftNumber / rightNumber;
    } else if (node.operator == '%=') {
      value = leftNumber % rightNumber;
    } else if (node.operator == '<<=') {
      value = leftNumber << rightNumber;
    } else if (node.operator == '>>=') {
      value = leftNumber >> rightNumber;
    } else if (node.operator == '>>>=') {
      value = leftNumber >>> rightNumber;
    } else if (node.operator == '&=') {
      value = leftNumber & rightNumber;
    } else if (node.operator == '^=') {
      value = leftNumber ^ rightNumber;
    } else if (node.operator == '|=') {
      value = leftNumber | rightNumber;
    } else {
      throw SyntaxError('Unknown assignment expression: ' + node.operator);
    }
    value = this.createPrimitive(value);
  }
  this.setValue(leftSide, value);
  this.stateStack[0].value = value;
};

Interpreter.prototype['stepBinaryExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneLeft) {
    state.doneLeft = true;
    this.stateStack.unshift({node: node.left});
    return;
  }
  if (!state.doneRight) {
    state.doneRight = true;
    state.leftValue = state.value;
    this.stateStack.unshift({node: node.right});
    return;
  }
  this.stateStack.shift();
  var leftSide = state.leftValue;
  var rightSide = state.value;
  var value;
  var comp = this.comp(leftSide, rightSide);
  if (node.operator == '==' || node.operator == '!=') {
    if (leftSide.isPrimitive && rightSide.isPrimitive) {
      value = leftSide.data == rightSide.data;
    } else {
      value = comp === 0;
    }
    if (node.operator == '!=') {
      value = !value;
    }
  } else if (node.operator == '===' || node.operator == '!==') {
    if (leftSide.isPrimitive && rightSide.isPrimitive) {
      value = leftSide.data === rightSide.data;
    } else {
      value = leftSide === rightSide;
    }
    if (node.operator == '!==') {
      value = !value;
    }
  } else if (node.operator == '>') {
    value = comp == 1;
  } else if (node.operator == '>=') {
    value = comp == 1 || comp === 0;
  } else if (node.operator == '<') {
    value = comp == -1;
  } else if (node.operator == '<=') {
    value = comp == -1 || comp === 0;
  } else if (node.operator == '+') {
    if (leftSide.type == 'string' || rightSide.type == 'string') {
      var leftValue = leftSide.toString();
      var rightValue = rightSide.toString();
    } else {
      var leftValue = leftSide.toNumber();
      var rightValue = rightSide.toNumber();
    }
    value = leftValue + rightValue;
  } else if (node.operator == 'in') {
    value = this.hasProperty(rightSide, leftSide);
  } else if (node.operator == 'instanceof') {
    if (!this.isa(rightSide, this.FUNCTION)) {
      this.throwException(this.TYPE_ERROR,
          'Expecting a function in instanceof check');
    }
    value = this.isa(leftSide, rightSide);
  } else {
    var leftValue = leftSide.toNumber();
    var rightValue = rightSide.toNumber();
    if (node.operator == '-') {
      value = leftValue - rightValue;
    } else if (node.operator == '*') {
      value = leftValue * rightValue;
    } else if (node.operator == '/') {
      value = leftValue / rightValue;
    } else if (node.operator == '%') {
      value = leftValue % rightValue;
    } else if (node.operator == '&') {
      value = leftValue & rightValue;
    } else if (node.operator == '|') {
      value = leftValue | rightValue;
    } else if (node.operator == '^') {
      value = leftValue ^ rightValue;
    } else if (node.operator == '<<') {
      value = leftValue << rightValue;
    } else if (node.operator == '>>') {
      value = leftValue >> rightValue;
    } else if (node.operator == '>>>') {
      value = leftValue >>> rightValue;
    } else {
      throw SyntaxError('Unknown binary operator: ' + node.operator);
    }
  }
  this.stateStack[0].value = this.createPrimitive(value);
};

Interpreter.prototype['stepBlockStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n_ || 0;
  if (node.body[n]) {
    state.done = false;
    state.n_ = n + 1;
    this.stateStack.unshift({node: node.body[n]});
  } else {
    state.done = true;
    if (state.node.type != 'Program') {
      // Leave the root scope on the tree in case the program is appended to.
      this.stateStack.shift();
    }
  }
};

Interpreter.prototype['stepBreakStatement'] = function() {
  var state = this.stateStack.shift();
  var node = state.node;
  var label = null;
  if (node.label) {
    label = node.label.name;
  }
  state = this.stateStack.shift();
  while (state &&
         state.node.type != 'CallExpression' &&
         state.node.type != 'NewExpression') {
    if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
      return;
    }
    state = this.stateStack.shift();
  }
  // Syntax error, do not allow this error to be trapped.
  throw SyntaxError('Illegal break statement');
};

Interpreter.prototype['stepCallExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneCallee_) {
    state.doneCallee_ = true;
    this.stateStack.unshift({node: node.callee, components: true});
    return;
  }
  if (!state.func_) {
    // Determine value of the function.
    if (state.value.type == 'function') {
      state.func_ = state.value;
    } else {
      if (state.value.length) {
        state.member_ = state.value[0];
      }
      state.func_ = this.getValue(state.value);
      if (!state.func_ || state.func_.type != 'function') {
        this.throwException(this.TYPE_ERROR,
            (state.value && state.value.type) + ' is not a function');
        return;
      }
    }
    // Determine value of 'this' in function.
    if (state.node.type == 'NewExpression') {
      state.funcThis_ = this.createObject(state.func_);
      state.isConstructor_ = true;
    } else if (state.func_.boundThis_) {
      state.funcThis_ = state.func_.boundThis_;
    } else if (state.value.length) {
      state.funcThis_ = state.value[0];
    } else {
      state.funcThis_ =
          this.stateStack[this.stateStack.length - 1].thisExpression;
    }
    if (state.func_.boundArgs_) {
      state.arguments = state.func_.boundArgs_.concat();
    } else {
      state.arguments = [];
    }
    state.n_ = 0;
  }
  if (!state.doneArgs_) {
    if (state.n_ != 0) {
      state.arguments.push(state.value);
    }
    if (node.arguments[state.n_]) {
      this.stateStack.unshift({node: node.arguments[state.n_]});
      state.n_++;
      return;
    }
    state.doneArgs_ = true;
  }
  if (!state.doneExec_) {
    state.doneExec_ = true;
    if (state.func_.node) {
      var scope =
          this.createScope(state.func_.node.body, state.func_.parentScope);
      // Add all arguments.
      for (var i = 0; i < state.func_.node.params.length; i++) {
        var paramName = this.createPrimitive(state.func_.node.params[i].name);
        var paramValue = state.arguments.length > i ? state.arguments[i] :
            this.UNDEFINED;
        this.setProperty(scope, paramName, paramValue);
      }
      // Build arguments variable.
      var argsList = this.createObject(this.ARRAY);
      for (var i = 0; i < state.arguments.length; i++) {
        this.setProperty(argsList, this.createPrimitive(i),
                         state.arguments[i]);
      }
      this.setProperty(scope, 'arguments', argsList);
      var funcState = {
        node: state.func_.node.body,
        scope: scope,
        thisExpression: state.funcThis_
      };
      this.stateStack.unshift(funcState);
      state.value = this.UNDEFINED;  // Default value if no explicit return.
    } else if (state.func_.nativeFunc) {
      state.value = state.func_.nativeFunc.apply(state.funcThis_,
                                                 state.arguments);
    } else if (state.func_.asyncFunc) {
      var thisInterpreter = this;
      var callback = function(value) {
        state.value = value || thisInterpreter.UNDEFINED;
        thisInterpreter.paused_ = false;
      };
      var argsWithCallback = state.arguments.concat(callback);
      state.func_.asyncFunc.apply(state.funcThis_, argsWithCallback);
      this.paused_ = true;
      return;
    } else if (state.func_.eval) {
      var code = state.arguments[0];
      if (!code) {
        state.value = this.UNDEFINED;
      } else if (!code.isPrimitive) {
        // JS does not parse String objects:
        // eval(new String('1 + 1')) -> '1 + 1'
        state.value = code;
      } else {
        var evalInterpreter = new Interpreter(code.toString());
        evalInterpreter.stateStack[0].scope.parentScope = this.getScope();
        state = {
          node: {type: 'Eval_'},
          interpreter: evalInterpreter
        };
        this.stateStack.unshift(state);
      }
    } else {
      throw TypeError('function not a function (huh?)');
    }
  } else {
    // Execution complete.  Put the return value on the stack.
    this.stateStack.shift();
    if (state.isConstructor_ && state.value.type !== 'object') {
      this.stateStack[0].value = state.funcThis_;
    } else {
      this.stateStack[0].value = state.value;
    }
  }
};

Interpreter.prototype['stepCatchClause'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneBody) {
    state.doneBody = true;
    var scope;
    if (node.param) {
      scope = this.createSpecialScope(this.getScope());
      // Add the argument.
      var paramName = this.createPrimitive(node.param.name);
      this.setProperty(scope, paramName, state.throwValue);
    }
    this.stateStack.unshift({node: node.body, scope: scope});
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepConditionalExpression'] = function() {
  var state = this.stateStack[0];
  if (!state.done) {
    if (!state.test) {
      state.test = true;
      this.stateStack.unshift({node: state.node.test});
    } else {
      state.done = true;
      if (state.value.toBoolean() && state.node.consequent) {
        this.stateStack.unshift({node: state.node.consequent});
      } else if (!state.value.toBoolean() && state.node.alternate) {
        this.stateStack.unshift({node: state.node.alternate});
      }
    }
  } else {
    this.stateStack.shift();
    if (state.node.type == 'ConditionalExpression') {
      this.stateStack[0].value = state.value;
    }
  }
};

Interpreter.prototype['stepContinueStatement'] = function() {
  var node = this.stateStack[0].node;
  var label = null;
  if (node.label) {
    label = node.label.name;
  }
  var state = this.stateStack[0];
  while (state &&
         state.node.type != 'CallExpression' &&
         state.node.type != 'NewExpression') {
    if (state.isLoop) {
      if (!label || (label == state.label)) {
        return;
      }
    }
    this.stateStack.shift();
    state = this.stateStack[0];
  }
  // Syntax error, do not allow this error to be trapped.
  throw SyntaxError('Illegal continue statement');
};

Interpreter.prototype['stepDoWhileStatement'] = function() {
  var state = this.stateStack[0];
  state.isLoop = true;
  if (state.node.type == 'DoWhileStatement' && state.test === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = this.TRUE;
    state.test = true;
  }
  if (!state.test) {
    state.test = true;
    this.stateStack.unshift({node: state.node.test});
  } else {
    state.test = false;
    if (!state.value.toBoolean()) {
      this.stateStack.shift();
    } else if (state.node.body) {
      this.stateStack.unshift({node: state.node.body});
    }
  }
};

Interpreter.prototype['stepEmptyStatement'] = function() {
  this.stateStack.shift();
};

Interpreter.prototype['stepEval_'] = function() {
  var state = this.stateStack[0];
  if (!state.interpreter.step()) {
    this.stateStack.shift();
    this.stateStack[0].value = state.interpreter.value || this.UNDEFINED;
  }
};

Interpreter.prototype['stepExpressionStatement'] = function() {
  var state = this.stateStack[0];
  if (!state.done) {
    state.done = true;
    this.stateStack.unshift({node: state.node.expression});
  } else {
    this.stateStack.shift();
    // Save this value to the interpreter for use as a return value if
    // this code is inside an eval function.
    this.value = state.value;
  }
};

Interpreter.prototype['stepForInStatement'] = function() {
  var state = this.stateStack[0];
  state.isLoop = true;
  var node = state.node;
  if (!state.doneVariable_) {
    state.doneVariable_ = true;
    var left = node.left;
    if (left.type == 'VariableDeclaration') {
      // Inline variable declaration: for (var x in y)
      left = left.declarations[0].id;
    }
    this.stateStack.unshift({node: left, components: true});
    return;
  }
  if (!state.doneObject_) {
    state.doneObject_ = true;
    state.variable = state.value;
    this.stateStack.unshift({node: node.right});
    return;
  }
  if (typeof state.iterator == 'undefined') {
    // First iteration.
    state.object = state.value;
    state.iterator = 0;
  }
  var name = null;
  done: do {
    var i = state.iterator;
    for (var prop in state.object.properties) {
      if (prop in state.object.nonenumerable) {
        continue;
      }
      if (i == 0) {
        name = prop;
        break done;
      }
      i--;
    }
    state.object = state.object.parent &&
        state.object.parent.properties.prototype;
    state.iterator = 0;
  } while (state.object);
  state.iterator++;
  if (name === null) {
    this.stateStack.shift();
  } else {
    this.setValueToScope(state.variable, this.createPrimitive(name));
    if (node.body) {
      this.stateStack.unshift({node: node.body});
    }
  }
};

Interpreter.prototype['stepForStatement'] = function() {
  var state = this.stateStack[0];
  state.isLoop = true;
  var node = state.node;
  var mode = state.mode || 0;
  if (mode == 0) {
    state.mode = 1;
    if (node.init) {
      this.stateStack.unshift({node: node.init});
    }
  } else if (mode == 1) {
    state.mode = 2;
    if (node.test) {
      this.stateStack.unshift({node: node.test});
    }
  } else if (mode == 2) {
    state.mode = 3;
    if (node.test && state.value && !state.value.toBoolean()) {
      // Loop complete.  Bail out.
      this.stateStack.shift();
    } else if (node.body) {
      this.stateStack.unshift({node: node.body});
    }
  } else if (mode == 3) {
    state.mode = 1;
    if (node.update) {
      this.stateStack.unshift({node: node.update});
    }
  }
};

Interpreter.prototype['stepFunctionDeclaration'] = function() {
  this.stateStack.shift();
};

Interpreter.prototype['stepFunctionExpression'] = function() {
  var state = this.stateStack.shift();
  this.stateStack[0].value = this.createFunction(state.node);
};

Interpreter.prototype['stepIdentifier'] = function() {
  var state = this.stateStack.shift();
  var name = this.createPrimitive(state.node.name);
  this.stateStack[0].value =
      state.components ? name : this.getValueFromScope(name);
};

Interpreter.prototype['stepIfStatement'] =
    Interpreter.prototype['stepConditionalExpression'];

Interpreter.prototype['stepLabeledStatement'] = function() {
  // No need to hit this node again on the way back up the stack.
  var state = this.stateStack.shift();
  this.stateStack.unshift({node: state.node.body,
                          label: state.node.label.name});
};

Interpreter.prototype['stepLiteral'] = function() {
  var state = this.stateStack.shift();
  this.stateStack[0].value = this.createPrimitive(state.node.value);
};

Interpreter.prototype['stepLogicalExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.operator != '&&' && node.operator != '||') {
    throw SyntaxError('Unknown logical operator: ' + node.operator);
  }
  if (!state.doneLeft_) {
    state.doneLeft_ = true;
    this.stateStack.unshift({node: node.left});
  } else if (!state.doneRight_) {
    if ((node.operator == '&&' && !state.value.toBoolean()) ||
        (node.operator == '||' && state.value.toBoolean())) {
      // Shortcut evaluation.
      this.stateStack.shift();
      this.stateStack[0].value = state.value;
    } else {
      state.doneRight_ = true;
      this.stateStack.unshift({node: node.right});
    }
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.value;
  }
};

Interpreter.prototype['stepMemberExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneObject_) {
    state.doneObject_ = true;
    this.stateStack.unshift({node: node.object});
  } else if (!state.doneProperty_) {
    state.doneProperty_ = true;
    state.object = state.value;
    this.stateStack.unshift({
      node: node.property,
      components: !node.computed
    });
  } else {
    this.stateStack.shift();
    if (state.components) {
      this.stateStack[0].value = [state.object, state.value];
    } else {
      this.stateStack[0].value = this.getProperty(state.object, state.value);
    }
  }
};

Interpreter.prototype['stepNewExpression'] =
    Interpreter.prototype['stepCallExpression'];

Interpreter.prototype['stepObjectExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var valueToggle = state.valueToggle;
  var n = state.n || 0;
  if (!state.object) {
    state.object = this.createObject(this.OBJECT);
  } else {
    if (valueToggle) {
      state.key = state.value;
    } else {
      this.setProperty(state.object, state.key, state.value);
    }
  }
  if (node.properties[n]) {
    if (valueToggle) {
      state.n = n + 1;
      this.stateStack.unshift({node: node.properties[n].value});
    } else {
      this.stateStack.unshift({node: node.properties[n].key, components: true});
    }
    state.valueToggle = !valueToggle;
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.object;
  }
};

Interpreter.prototype['stepProgram'] =
    Interpreter.prototype['stepBlockStatement'];

Interpreter.prototype['stepReturnStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.argument && !state.done) {
    state.done = true;
    this.stateStack.unshift({node: node.argument});
  } else {
    var value = state.value || this.UNDEFINED;
    do {
      this.stateStack.shift();
      if (this.stateStack.length == 0) {
        // Syntax error, do not allow this error to be trapped.
        throw SyntaxError('Illegal return statement');
      }
      state = this.stateStack[0];
    } while (state.node.type != 'CallExpression' &&
             state.node.type != 'NewExpression');
    state.value = value;
  }
};

Interpreter.prototype['stepSequenceExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (node.expressions[n]) {
    state.n = n + 1;
    this.stateStack.unshift({node: node.expressions[n]});
  } else {
    this.stateStack.shift();
    this.stateStack[0].value = state.value;
  }
};

Interpreter.prototype['stepSwitchStatement'] = function() {
  var state = this.stateStack[0];
  state.checked = state.checked || [];
  state.isSwitch = true;

  if (!state.test) {
    state.test = true;
    this.stateStack.unshift({node: state.node.discriminant});
    return;
  }
  if (!state.switchValue) {
    // Preserve switch value between case tests.
    state.switchValue = state.value;
  }

  var index = state.index || 0;
  var currentCase = state.node.cases[index];
  if (currentCase) {
    if (!state.done && !state.checked[index] && currentCase.test) {
      state.checked[index] = true;
      this.stateStack.unshift({node: currentCase.test});
      return;
    }
    // Test on the default case will be null.
    if (state.done || !currentCase.test ||
        this.comp(state.value, state.switchValue) == 0) {
      state.done = true;
      var n = state.n || 0;
      if (currentCase.consequent[n]) {
        this.stateStack.unshift({node: currentCase.consequent[n]});
        state.n = n + 1;
        return;
      }
    }
    state.n = 0;
    state.index = index + 1;
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepThisExpression'] = function() {
  this.stateStack.shift();
  for (var i = 0; i < this.stateStack.length; i++) {
    if (this.stateStack[i].thisExpression) {
      this.stateStack[0].value = this.stateStack[i].thisExpression;
      return;
    }
  }
  throw Error('No this expression found.');
};

Interpreter.prototype['stepThrowStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.argument) {
    state.argument = true;
    this.stateStack.unshift({node: node.argument});
  } else {
    this.throwException(state.value);
  }
};

Interpreter.prototype['stepTryStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneBlock) {
    state.doneBlock = true;
    this.stateStack.unshift({node: node.block});
  } else if (!state.doneFinalizer && node.finalizer) {
    state.doneFinalizer = true;
    this.stateStack.unshift({node: node.finalizer});
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepUnaryExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.done) {
    state.done = true;
    var nextState = {node: node.argument};
    if (node.operator == 'delete') {
      nextState.components = true;
    }
    this.stateStack.unshift(nextState);
    return;
  }
  this.stateStack.shift();
  var value;
  if (node.operator == '-') {
    value = -state.value.toNumber();
  } else if (node.operator == '+') {
    value = state.value.toNumber();
  } else if (node.operator == '!') {
    value = !state.value.toBoolean();
  } else if (node.operator == '~') {
    value = ~state.value.toNumber();
  } else if (node.operator == 'typeof') {
    value = state.value.type;
  } else if (node.operator == 'delete') {
    if (state.value.length) {
      var obj = state.value[0];
      var name = state.value[1];
    } else {
      var obj = this.getScope();
      var name = state.value;
    }
    value = this.deleteProperty(obj, name);
  } else if (node.operator == 'void') {
    value = undefined;
  } else {
    throw SyntaxError('Unknown unary operator: ' + node.operator);
  }
  this.stateStack[0].value = this.createPrimitive(value);
};

Interpreter.prototype['stepUpdateExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.done) {
    state.done = true;
    this.stateStack.unshift({node: node.argument, components: true});
    return;
  }
  this.stateStack.shift();
  var leftSide = state.value;
  var leftValue = this.getValue(leftSide).toNumber();
  var changeValue;
  if (node.operator == '++') {
    changeValue = this.createPrimitive(leftValue + 1);
  } else if (node.operator == '--') {
    changeValue = this.createPrimitive(leftValue - 1);
  } else {
    throw SyntaxError('Unknown update expression: ' + node.operator);
  }
  this.setValue(leftSide, changeValue);
  this.stateStack[0].value = node.prefix ?
      changeValue : this.createPrimitive(leftValue);
};

Interpreter.prototype['stepVariableDeclaration'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n || 0;
  if (node.declarations[n]) {
    state.n = n + 1;
    this.stateStack.unshift({node: node.declarations[n]});
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepVariableDeclarator'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.init && !state.done) {
    state.done = true;
    this.stateStack.unshift({node: node.init});
    return;
  }
  if (!this.hasProperty(this, node.id.name) || node.init) {
    if (node.init) {
      var value = state.value;
      this.setValue(this.createPrimitive(node.id.name), value);
    }
  }
  this.stateStack.shift();
};

Interpreter.prototype['stepWithStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneObject) {
    state.doneObject = true;
    this.stateStack.unshift({node: node.object});
  } else if (!state.doneBody) {
    state.doneBody = true;
    var scope = this.createSpecialScope(this.getScope(), state.value);
    this.stateStack.unshift({node: node.body, scope: scope});
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepWhileStatement'] =
    Interpreter.prototype['stepDoWhileStatement'];

// Preserve top-level API functions from being pruned by JS compilers.
// Add others as needed.
// The global object ('window' in a browser, 'global' in node.js) is 'this'.
this['Interpreter'] = Interpreter;
Interpreter.prototype['appendCode'] = Interpreter.prototype.appendCode;
Interpreter.prototype['step'] = Interpreter.prototype.step;
Interpreter.prototype['run'] = Interpreter.prototype.run;
