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
 * @param {string} code Raw JavaScript text.
 * @param {Function} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {
  this.initFunc_ = opt_initFunc;
  this.UNDEFINED = this.createPrimitive(undefined);
  this.ast = acorn.parse(code);
  var scope = this.createScope(this.ast, null);
  this.stateStack = [{node: this.ast, scope: scope, thisExpression: scope}];
};

/**
 * Execute one step of the interpreter.
 * @return {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {
  if (this.stateStack.length == 0) {
    return false;
  }
  var state = this.stateStack[0];
  this['step' + state.node.type]();
  return true;
};

/**
 * Execute the interpreter to program completion.
 */
Interpreter.prototype.run = function() {
  while(this.step()) {};
};

/**
 * Initialize the global scope with buitin properties and functions.
 * @param {!Object} scope Global scope.
 */
Interpreter.prototype.initGlobalScope = function(scope) {
  // Initialize uneditable global properties.
  this.setProperty(scope, 'Infinity',
                   this.createPrimitive(Infinity), true);
  this.setProperty(scope, 'NaN',
                   this.createPrimitive(NaN), true);
  this.setProperty(scope, 'undefined',
                   this.UNDEFINED, true);
  this.setProperty(scope, 'window',
                   scope, true);
  this.setProperty(scope, 'self',
                   scope, false); // Editable.

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
  wrapper = function(str) {
    str = str || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(parseFloat(str.toNumber()));
  };
  this.setProperty(scope, 'parseFloat',
                   this.createNativeFunction(wrapper));
  wrapper = function(str, radix) {
    str = str || thisInterpreter.UNDEFINED;
    radix = radix || thisInterpreter.UNDEFINED;
    return thisInterpreter.createPrimitive(
        parseInt(str.toString(), radix.toNumber()));
  };
  this.setProperty(scope, 'parseInt',
                   this.createNativeFunction(wrapper));

  var func = this.createObject(this.FUNCTION);
  func.eval = true;
  this.setProperty(func, 'length', this.createPrimitive(1), true);
  this.setProperty(scope, 'eval', func);

  var strFunctions = ['escape', 'unescape',
                      'decodeURI', 'decodeURIComponent',
                      'encodeURI', 'encodeURIComponent'];
  for (var i = 0; i < strFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(str) {
        str = str || thisInterpreter.UNDEFINED;
        return thisInterpreter.createPrimitive(nativeFunc(str.toString()));
      };
    })(window[strFunctions[i]]);
    this.setProperty(scope, strFunctions[i],
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
      throw new SyntaxError('Function arg string contains parenthesis');
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

  // Create stub functions for apply and call.
  // These are processed as special cases in stepCallExpression.
  var node = {
    type: 'FunctionApply_',
    params: [],
    id: null,
    body: null,
    start: 0,
    end: 0
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'apply',
                   this.createFunction(node, {}), false, true);
  var node = {
    type: 'FunctionCall_',
    params: [],
    id: null,
    body: null,
    start: 0,
    end: 0
  };
  this.setProperty(this.FUNCTION.properties.prototype, 'call',
                   this.createFunction(node, {}), false, true);

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
        throw new RangeError('Invalid array length');
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
      var tmp = this.properties[this.length - i - 1]
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
    for (var i = index + howmany; i < this.length; i++) {
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
    fromIndex = Math.max(0, Math.min(fromIndex, this.length));
    for (var i = fromIndex; i < this.length; i++) {
      var element = thisInterpreter.getProperty(this, i);
      if (thisInterpreter.comp(element, searchElement) == 0) {
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
    fromIndex = Math.max(0, Math.min(fromIndex, this.length));
    for (var i = fromIndex; i >= 0; i--) {
      var element = thisInterpreter.getProperty(this, i);
      if (thisInterpreter.comp(element, searchElement) == 0) {
        return thisInterpreter.createPrimitive(i);
      }
    }
    return thisInterpreter.createPrimitive(-1);
  };
  this.setProperty(this.ARRAY.properties.prototype, 'lastIndexOf',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(opt_compFunc) {
    var compFuncWrapper;
    if (opt_compFunc) {
      var node = opt_compFunc.node;
      var body = node.body;
      // set callee depending whether the call is via
      // inline function or function name
      var callee = node.type == 'FunctionDeclaration'
                    ? node.id : opt_compFunc.node;
      compFuncWrapper = function(x, y) {
        var callState = {
          callee: callee,
          arguments: node.params,
          type: 'CallExpression',
          start: 0,
          end: 0
        };
        var exprState = {
          expression: callState,
          type: 'ExpressionStatement',
          start: 0,
          end: 0
        };
        var scope = thisInterpreter.createScope(opt_compFunc, opt_compFunc.parentScope);
        // Add all arguments.
        for (var i = 0; i < node.params.length; i++) {
          var paramName = thisInterpreter.createPrimitive(node.params[i].name);
          var paramValue = arguments.length > i ? arguments[i] :
              thisInterpreter.UNDEFINED;
          thisInterpreter.setProperty(scope, paramName, paramValue);
        }
        // Build arguments variable.
        var argsList = thisInterpreter.createObject(thisInterpreter.ARRAY);
        for (var i = 0; i < arguments.length; i++) {
          thisInterpreter.setProperty(argsList, thisInterpreter.createPrimitive(i),
                                      arguments[i]);
        }
        thisInterpreter.setProperty(scope, 'arguments', argsList);
        thisInterpreter.stateStack.unshift({
          node: exprState,
          scope: scope,
          breakpoint: true
        });
        // run the function
        do {
          thisInterpreter.step();
        } while (!thisInterpreter.stateStack[0].breakpoint)
        return thisInterpreter.stateStack[0].value.data;
      }
    }
    var jsList = [];
    for (var i = 0; i < this.length; i++) {
      jsList[i] = this.properties[i];
    }
    jsList.sort(compFuncWrapper);
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
    if (this.parent == thisInterpreter.NUMBER) {
      this.toBoolean = function() {return !!value;};
      this.toNumber = function() {return value;};
      this.toString = function() {return String(value);};
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
  };
  this.NUMBER = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Number', this.NUMBER);

  var numConsts = ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY',
                   'POSITIVE_INFINITY'];
  for (var i = 0; i < numConsts.length; i++) {
    this.setProperty(this.NUMBER, numConsts[i],
                     this.createPrimitive(Number[numConsts[i]]));
  }

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
  this.setProperty(this.OBJECT.properties.prototype, 'toString',
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
    value = (value || thisInterpreter.UNDEFINED).toString();
    if (this.parent == thisInterpreter.STRING) {
      this.toBoolean = function() {return !!value;};
      this.toNumber = function() {return Number(value);};
      this.toString = function() {return value;};
      this.valueOf = function() {return value;};
      this.data = value;
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
  };
  this.STRING = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'String', this.STRING);

  var functions = ['toLowerCase', 'toUpperCase',
                   'toLocaleLowerCase', 'toLocaleUpperCase'];
  for (var i = 0; i < functions.length; i++) {
    var wrapper = (function(nativeFunc) {
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

  wrapper = function(num) {
    var str = this.toString();
    num = (num || thisInterpreter.UNDEFINED).toNumber();
    return thisInterpreter.createPrimitive(str.charAt(num));
  };
  this.setProperty(this.STRING.properties.prototype, 'charAt',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(num) {
    var str = this.toString();
    num = (num || thisInterpreter.UNDEFINED).toNumber();
    return thisInterpreter.createPrimitive(str.charCodeAt(num));
  };
  this.setProperty(this.STRING.properties.prototype, 'charCodeAt',
                   this.createNativeFunction(wrapper), false, true);

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

  wrapper = function(separator, limit) {
    var str = this.toString();
    if (separator) {
      separator = thisInterpreter.isa(separator, thisInterpreter.REGEXP) 
                  ? separator.data : separator.toString();
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

  wrapper = function(indexA, indexB) {
    var str = this.toString();
    indexA = indexA ? indexA.toNumber() : undefined;
    indexB = indexB ? indexB.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.substring(indexA, indexB));
  };
  this.setProperty(this.STRING.properties.prototype, 'substring',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(start, length) {
    var str = this.toString();
    start = start ? start.toNumber() : undefined;
    length = length ? length.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.substr(start, length));
  };
  this.setProperty(this.STRING.properties.prototype, 'substr',
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

  wrapper = function(beginSlice, endSlice) {
    var str = this.toString();
    beginSlice = beginSlice ? beginSlice.toNumber() : undefined;
    endSlice = endSlice ? endSlice.toNumber() : undefined;
    return thisInterpreter.createPrimitive(str.slice(beginSlice, endSlice));
  };
  this.setProperty(this.STRING.properties.prototype, 'slice',
                   this.createNativeFunction(wrapper), false, true);

  wrapper = function(regexp) {
    var str = this.toString();
    regexp = regexp ? regexp.data : undefined;
    var match = str.match(regexp);
    if (match === null) {
      return thisInterpreter.createPrimitive(null);
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
    if (this.parent == thisInterpreter.STRING) {
      this.toBoolean = function() {return value;};
      this.toNumber = function() {return Number(value);};
      this.toString = function() {return String(value);};
      this.valueOf = function() {return value;};
      return undefined;
    } else {
      return thisInterpreter.createPrimitive(value);
    }
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
      var newDate = this;
    } else {
      var newDate = thisInterpreter.createObject(thisInterpreter.DATE);
    }
    var dateString = a;
    if (!arguments.length) {
      newDate.date = new Date();
    } else if (arguments.length == 1 && (dateString.type == 'string' ||
        thisInterpreter.isa(dateString, thisInterpreter.STRING))) {
      newDate.date = new Date(dateString.toString());
    } else {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i] ? arguments[i].toNumber() : undefined
      }
      // Sadly there is no way to use 'apply' on a constructor.
      if (args.length == 1) {
        newDate.date = new Date(args[0]);
      } else if (args.length == 2) {
        newDate.date = new Date(args[0], args[1]);
      } else if (args.length == 3) {
        newDate.date = new Date(args[0], args[1], args[2]);
      } else if (args.length == 4) {
        newDate.date = new Date(args[0], args[1], args[2], args[3]);
      } else if (args.length == 5) {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4]);
      } else if (args.length == 6) {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4],
                                args[5]);
      } else {
        newDate.date = new Date(args[0], args[1], args[2], args[3], args[4],
                                args[5], args[6]);
      }
    }
    newDate.toString = function() {return String(this.date);};
    newDate.toNumber = function() {return Number(this.date);};
    newDate.valueOf = function() {return this.date.valueOf();};
    return newDate;
  };
  this.DATE = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'Date', this.DATE);

  // Static methods on Date.
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

  // Getter methods.
  var getFunctions = ['getDate', 'getDay', 'getFullYear', 'getHours',
      'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds', 'getTime',
      'getTimezoneOffset', 'getUTCDate', 'getUTCDay', 'getUTCFullYear',
      'getUTCHours', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth',
      'getUTCSeconds', 'getYear'];
  for (var i = 0; i < getFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function() {
        return thisInterpreter.createPrimitive(this.date[nativeFunc]());
      };
    })(getFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, getFunctions[i],
                     this.createNativeFunction(wrapper), false, true);
  }

  // Setter methods.
  var setFunctions = ['setDate', 'setFullYear', 'setHours', 'setMilliseconds',
      'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate',
      'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes',
      'setUTCMonth', 'setUTCSeconds', 'setYear'];
  for (var i = 0; i < setFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function(var_args) {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i] ? arguments[i].toNumber() : undefined;
        }
        return thisInterpreter.createPrimitive(
            this.date[nativeFunc].apply(this.date, args));
      };
    })(setFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, setFunctions[i],
                     this.createNativeFunction(wrapper), false, true);
  }

  // Conversion getter methods.
  var getFunctions = ['toDateString', 'toISOString', 'toGMTString',
      'toLocaleDateString', 'toLocaleString', 'toLocaleTimeString',
      'toTimeString', 'toUTCString'];
  for (var i = 0; i < getFunctions.length; i++) {
    wrapper = (function(nativeFunc) {
      return function() {
        return thisInterpreter.createPrimitive(this.date[nativeFunc]());
      };
    })(getFunctions[i]);
    this.setProperty(this.DATE.properties.prototype, getFunctions[i],
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
                     this.createPrimitive(Math[mathConsts[i]]));
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
                     this.createNativeFunction(wrapper));
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
    var rgx;
    if (this.parent == thisInterpreter.REGEXP) {
      rgx = this;
    } else {
      rgx = thisInterpreter.createObject(thisInterpreter.REGEXP);
    }

    pattern = pattern.toString();
    flags = flags && flags.toString();
    thisInterpreter.createRegExp(rgx, new RegExp(pattern, flags || ''));
    return rgx;
  };
  this.REGEXP = this.createNativeFunction(wrapper);
  this.setProperty(scope, 'RegExp', this.REGEXP);

  wrapper = function() {
    return thisInterpreter.createPrimitive(this.data.toString());
  };
  this.setProperty(this.REGEXP.properties.prototype, 'toString',
                   this.createNativeFunction(wrapper), false, true);

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
    return thisInterpreter.createPrimitive(null);
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

  /**
   * Converts from native JS object to this.OBJECT.
   * @param {!Object} nativeObj The native JS object to be converted.
   * @return {Object} The equivalent this.OBJECT.
   */
  function toPseudoObject(nativeObj) {
    if (typeof nativeObj !== 'object') {
      return thisInterpreter.createPrimitive(nativeObj);
    }

    var pseudoObject;
    if (nativeObj instanceof Array) { // is array
      pseudoObject = thisInterpreter.createObject(thisInterpreter.ARRAY);
      for (var i = 0; i < nativeObj.length; i++) {
        thisInterpreter.setProperty(pseudoObject, i,
                                    toPseudoObject(nativeObj[i]));
      }
    } else { // is object
      pseudoObject = thisInterpreter.createObject(thisInterpreter.OBJECT);
      for (var key in nativeObj) {
        thisInterpreter.setProperty(pseudoObject, key,
                                    toPseudoObject(nativeObj[key]));
      }
    }

    return pseudoObject;
  }

  var wrapper = (function(nativeFunc) {
    return function() {
      var arg = arguments[0].data;
      var nativeObj = nativeFunc.call(JSON, arg);
      return toPseudoObject(nativeObj);
    };
  })(JSON.parse);
  this.setProperty(myJSON, 'parse',
                   this.createNativeFunction(wrapper));

  /**
   * Converts from this.OBJECT object to native JS object.
   * @param {!Object} obj The this.OBJECT object to be converted.
   * @return {Object} The equivalent native JS object.
   */
  function toNativeObject(obj) {
    if (obj.isPrimitive) {
      return obj.data;
    }

    var nativeObj;
    if (obj.length) { // is array
      nativeObj = [];
      for (var i = 0; i < obj.length; i++) {
        nativeObj[i] = toNativeObject(obj.properties[i]);
      }
    } else { // is object
      nativeObj = {};
      for (var key in obj.properties) {
        nativeObj[key] = toNativeObject(obj.properties[key]);
      }
    }

    return nativeObj;
  }

  wrapper = (function(nativeFunc) {
    return function() {
      var arg = toNativeObject(arguments[0]);
      return thisInterpreter.createPrimitive(nativeFunc.call(JSON, arg));
    };
  })(JSON.stringify);
  this.setProperty(myJSON, 'stringify',
                   this.createNativeFunction(wrapper));
};

/**
 * Is an object of a certain class?
 * @param {Object} child Object to check.
 * @param {!Object} parent Class of object.
 * @return {boolean} True if object is the class or inherits from it.
 *     False otherwise.
 */
Interpreter.prototype.isa = function(child, parent) {
  if (!child || !parent) {
    return false;
  } else if (child.parent == parent) {
    return true;
  } else if (!child.parent || !child.parent.prototype) {
    return false;
  }
  return this.isa(child.parent.prototype, parent);
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
    return NaN;
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
 * Create a new data object for a primitive.
 * @param {undefined|null|boolean|number|string} data Data to encapsulate.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createPrimitive = function(data) {
  if (data instanceof RegExp) {
    return this.createRegExp(this.createObject(this.REGEXP), data);
  }
  var type = typeof data;
  var obj = {
    data: data,
    isPrimitive: true,
    type: type,
    toBoolean: function() {return Boolean(this.data);},
    toNumber: function() {return Number(this.data);},
    toString: function() {return String(this.data);},
    valueOf: function() {return this.data;}
  };
  if (type == 'number') {
    obj.parent = this.NUMBER;
  } else if (type == 'string') {
    obj.parent = this.STRING;
  } else if (type == 'boolean') {
    obj.parent = this.BOOLEAN;
  }
  return obj;
};

/**
 * Create a new data object.
 * @param {Object} parent Parent constructor function.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createObject = function(parent) {
  var obj = {
    isPrimitive: false,
    type: 'object',
    parent: parent,
    fixed: Object.create(null),
    nonenumerable: Object.create(null),
    properties: Object.create(null),
    toBoolean: function() {return true;},
    toNumber: function() {return 0;},
    toString: function() {return '[' + this.type + ']';},
    valueOf: function() {return this;}
  };
  // Functions have prototype objects.
  if (this.isa(obj, this.FUNCTION)) {
    obj.type = 'function';
    this.setProperty(obj, 'prototype', this.createObject(this.OBJECT || null));
  };
  // Arrays have length.
  if (this.isa(obj, this.ARRAY)) {
    obj.length = 0;
    obj.toString = function() {
      var strs = [];
      for (var i = 0; i < this.length; i++) {
        strs[i] = this.properties[i].toString();
      }
      return strs.join(',');
    };
  };

  return obj;
};

/**
 * Creates a new regular expression object.
 * @param {Object} obj The existing object to set.
 * @param {Object} data The native regular expression.
 * @return {!Object} New regular expression object.
 */
Interpreter.prototype.createRegExp = function(obj, data) {
  obj.data = data
  // lastIndex is settable, all others are read-only attributes
  this.setProperty(obj, 'lastIndex', this.createPrimitive(obj.data.lastIndex), false, true);
  this.setProperty(obj, 'source', this.createPrimitive(obj.data.source), true, true);
  this.setProperty(obj, 'global', this.createPrimitive(obj.data.global), true, true);
  this.setProperty(obj, 'ignoreCase', this.createPrimitive(obj.data.ignoreCase), true, true);
  this.setProperty(obj, 'multiline', this.createPrimitive(obj.data.multiline), true, true);
  return obj;
}

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
 * Fetch a property value from a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {!Object} Property value (may be UNDEFINED).
 */
Interpreter.prototype.getProperty = function(obj, name) {
  name = name.toString();
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
    throw new TypeError('Primitive data type has no properties');
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
 * @param {*} value New property value.
 * @param {boolean} opt_fixed Unchangeable property if true.
 * @param {boolean} opt_nonenum Non-enumerable property if true.
 */
Interpreter.prototype.setProperty = function(obj, name, value,
                                             opt_fixed, opt_nonenum) {
  name = name.toString();
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
        throw new RangeError('Invalid array length');
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
  throw 'No scope found.';
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
  return scope;
};

/**
 * Retrieves a value from the scope chain.
 * @param {!Object} name Name of variable.
 * @throws {string} Error if identifier does not exist.
 */
Interpreter.prototype.getValueFromScope = function(name) {
  var scope = this.getScope();
  var nameStr = name.toString();
  while (scope) {
    if (this.hasProperty(scope, nameStr)) {
      return this.getProperty(scope, nameStr);
    }
    scope = scope.parentScope;
  }
  throw 'Unknown identifier: ' + nameStr;
};

/**
 * Sets a value to the current scope.
 * @param {!Object} name Name of variable.
 * @param {*} value Value.
 */
Interpreter.prototype.setValueToScope = function(name, value) {
  var scope = this.getScope();
  var nameStr = name.toString();
  while (scope) {
    if (this.hasProperty(scope, nameStr)) {
      return this.setProperty(scope, nameStr, value);
    }
    scope = scope.parentScope;
  }
  throw 'Unknown identifier: ' + nameStr;
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
    this.setProperty(scope, node.id.name,
        this.createFunction(node, scope));
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
  } else if (!state.doneRight) {
    state.doneRight = true;
    state.leftSide = state.value;
    this.stateStack.unshift({node: node.right});
  } else {
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
        throw 'Unknown assignment expression: ' + node.operator;
      }
      value = this.createPrimitive(value);
    }
    this.setValue(leftSide, value);
    this.stateStack[0].value = value;
  }
};

Interpreter.prototype['stepBinaryExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneLeft) {
    state.doneLeft = true;
    this.stateStack.unshift({node: node.left});
  } else if (!state.doneRight) {
    state.doneRight = true;
    state.leftValue = state.value;
    this.stateStack.unshift({node: node.right});
  } else {
    this.stateStack.shift();
    var leftSide = state.leftValue;
    var rightSide = state.value;
    var value;
    var comp = this.comp(leftSide, rightSide);
    if (node.operator == '==' || node.operator == '!=') {
      value = comp === 0;
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
        throw 'Unknown binary operator: ' + node.operator;
      }
    }
    this.stateStack[0].value = this.createPrimitive(value);
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
  while (state && state.node.type != 'callExpression') {
    if (label ? label == state.label : (state.isLoop || state.isSwitch)) {
      return;
    }
    state = this.stateStack.shift();
  }
  throw new SyntaxError('Illegal break statement');
};

Interpreter.prototype['stepBlockStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  var n = state.n_ || 0;
  if (node.body[n]) {
    state.n_ = n + 1;
    this.stateStack.unshift({node: node.body[n]});
  } else {
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepCallExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.doneCallee_) {
    state.doneCallee_ = true;
    this.stateStack.unshift({node: node.callee, components: true});
  } else {
    if (!state.func_) {
      // Determine value of the function.
      if (state.value.type == 'function') {
        state.func_ = state.value;
      } else {
        state.member_ = state.value[0];
        state.func_ = this.getValue(state.value);
        if (!state.func_ || state.func_.type != 'function') {
          throw new TypeError((state.func_ && state.func_.type) +
                              ' is not a function');
        }
      }
      // Determine value of 'this' in function.
      if (state.node.type == 'NewExpression') {
        state.funcThis_ = this.createObject(state.func_);
        state.isConstructor_ = true;
      } else if (state.value.length) {
        state.funcThis_ = state.value[0];
      } else {
        state.funcThis_ =
            this.stateStack[this.stateStack.length - 1].thisExpression;
      }
      state.arguments = [];
      var n = 0;
    } else {
      var n = state.n_;
      if (state.arguments.length != node.arguments.length) {
        state.arguments[n - 1] = state.value;
      }
    }
    if (node.arguments[n]) {
      state.n_ = n + 1;
      this.stateStack.unshift({node: node.arguments[n]});
    } else if (!state.doneExec) {
      state.doneExec = true;
      if (state.func_.node &&
          (state.func_.node.type == 'FunctionApply_' ||
           state.func_.node.type == 'FunctionCall_')) {
        state.funcThis_ = state.arguments.shift();
        if (state.func_.node.type == 'FunctionApply_') {
          // Unpack all the arguments from the provided array.
          var argsList = state.arguments.shift();
          if (argsList && this.isa(argsList, this.ARRAY)) {
            state.arguments = [];
            for (var i = 0; i < argsList.length; i++) {
              state.arguments[i] = this.getProperty(argsList, i);
            }
          } else {
            state.arguments = [];
          }
        }
        state.func_ = state.member_;
      }
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
          evalInterpreter.stateStack[0].scope.parentScope =
              this.getScope();
          var state = {
            node: {type: 'Eval_'},
            interpreter: evalInterpreter
          };
          this.stateStack.unshift(state);
        }
      } else {
        throw new TypeError('function not a function (huh?)');
      }
    } else {
      this.stateStack.shift();
      this.stateStack[0].value = state.isConstructor_ ?
          state.funcThis_ : state.value;
    }
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
  while (state && state.node.type != 'callExpression') {
    if (state.isLoop) {
      if (!label || (label == state.label)) {
        return;
      }
    }
    this.stateStack.shift();
    state = this.stateStack[0];
  }
  throw new SyntaxError('Illegal continue statement');
};

Interpreter.prototype['stepDoWhileStatement'] = function() {
  var state = this.stateStack[0];
  state.isLoop = true;
  if (state.node.type == 'DoWhileStatement' && state.test === undefined) {
    // First iteration of do/while executes without checking test.
    state.value = this.createPrimitive(true);
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
  } else if (!state.doneObject_) {
    state.doneObject_ = true;
    state.variable = state.value;
    this.stateStack.unshift({node: node.right});
  } else {
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
    if (state.value && !state.value.toBoolean()) {
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
  var state = this.stateStack[0];
  this.stateStack.shift();
  this.stateStack[0].value = this.createFunction(state.node);
};

Interpreter.prototype['stepIdentifier'] = function() {
  var state = this.stateStack[0];
  this.stateStack.shift();
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
  var state = this.stateStack[0];
  this.stateStack.shift();
  this.stateStack[0].value = this.createPrimitive(state.node.value);
};

Interpreter.prototype['stepLogicalExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (node.operator != '&&' && node.operator != '||') {
    throw 'Unknown logical operator: ' + node.operator;
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
        throw new SyntaxError('Illegal return statement');
      }
      state = this.stateStack[0];
    } while (state.node.type != 'CallExpression');
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
  } else {
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
      } else {
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
      }
    } else {
      this.stateStack.shift();
    }
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
  throw 'No this expression found.';
};

Interpreter.prototype['stepThrowStatement'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.argument) {
    state.argument = true;
    this.stateStack.unshift({node: node.argument});
  } else {
    throw state.value.toString();
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
  } else {
    this.stateStack.shift();
    var value;
    if (node.operator == '-') {
      value = -state.value.toNumber();
    } else if (node.operator == '+') {
      value = state.value.toNumber();
    } else if (node.operator == '!') {
      value = !state.value.toNumber();
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
      throw 'Unknown unary operator: ' + node.operator;
    }
    this.stateStack[0].value = this.createPrimitive(value);
  }
};

Interpreter.prototype['stepUpdateExpression'] = function() {
  var state = this.stateStack[0];
  var node = state.node;
  if (!state.done) {
    state.done = true;
    this.stateStack.unshift({node: node.argument, components: true});
  } else {
    this.stateStack.shift();
    var leftSide = state.value;
    var leftValue = this.getValue(leftSide).toNumber();
    var changeValue;
    if (node.operator == '++') {
      changeValue = this.createPrimitive(leftValue + 1);
    } else if (node.operator == '--') {
      changeValue = this.createPrimitive(leftValue - 1);
    } else {
      throw 'Unknown update expression: ' + node.operator;
    }
    this.setValue(leftSide, changeValue);
    var returnValue = node.prefix ? returnValue : leftValue;
    this.stateStack[0].value = this.createPrimitive(returnValue);
  }
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
  } else {
    if (!this.hasProperty(this, node.id.name) || node.init) {
      var value = node.init ? state.value : this.UNDEFINED;
      this.setValue(this.createPrimitive(node.id.name), value);
    }
    this.stateStack.shift();
  }
};

Interpreter.prototype['stepWhileStatement'] =
    Interpreter.prototype['stepDoWhileStatement'];

// Preserve top-level API functions from being pruned by JS compilers.
// Add others as needed.
window['Interpreter'] = Interpreter;
Interpreter.prototype['step'] = Interpreter.prototype.step;
Interpreter.prototype['run'] = Interpreter.prototype.run;
