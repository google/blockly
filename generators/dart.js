/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper functions for generating Dart for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart');

goog.require('Blockly.Generator');
goog.require('Blockly.inputTypes');
goog.require('Blockly.utils.string');


/**
 * Dart code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Dart = new Blockly.Generator('Dart');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Dart.addReservedWords(
    // https://www.dartlang.org/docs/spec/latest/dart-language-specification.pdf
    // Section 16.1.1
    'assert,break,case,catch,class,const,continue,default,do,else,enum,' +
    'extends,false,final,finally,for,if,in,is,new,null,rethrow,return,super,' +
    'switch,this,throw,true,try,var,void,while,with,' +
    // https://api.dartlang.org/dart_core.html
    'print,identityHashCode,identical,BidirectionalIterator,Comparable,' +
    'double,Function,int,Invocation,Iterable,Iterator,List,Map,Match,num,' +
    'Pattern,RegExp,Set,StackTrace,String,StringSink,Type,bool,DateTime,' +
    'Deprecated,Duration,Expando,Null,Object,RuneIterator,Runes,Stopwatch,' +
    'StringBuffer,Symbol,Uri,Comparator,AbstractClassInstantiationError,' +
    'ArgumentError,AssertionError,CastError,ConcurrentModificationError,' +
    'CyclicInitializationError,Error,Exception,FallThroughError,' +
    'FormatException,IntegerDivisionByZeroException,NoSuchMethodError,' +
    'NullThrownError,OutOfMemoryError,RangeError,StackOverflowError,' +
    'StateError,TypeError,UnimplementedError,UnsupportedError'
);

/**
 * Order of operation ENUMs.
 * https://dart.dev/guides/language/language-tour#operators
 */
Blockly.Dart.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Dart.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] . ?.
Blockly.Dart.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Dart.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Dart.ORDER_ADDITIVE = 4;       // + -
Blockly.Dart.ORDER_SHIFT = 5;          // << >>
Blockly.Dart.ORDER_BITWISE_AND = 6;    // &
Blockly.Dart.ORDER_BITWISE_XOR = 7;    // ^
Blockly.Dart.ORDER_BITWISE_OR = 8;     // |
Blockly.Dart.ORDER_RELATIONAL = 9;     // >= > <= < as is is!
Blockly.Dart.ORDER_EQUALITY = 10;      // == !=
Blockly.Dart.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Dart.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Dart.ORDER_IF_NULL = 13;       // ??
Blockly.Dart.ORDER_CONDITIONAL = 14;   // expr ? expr : expr
Blockly.Dart.ORDER_CASCADE = 15;       // ..
Blockly.Dart.ORDER_ASSIGNMENT = 16;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Dart.ORDER_NONE = 99;          // (...)

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
Blockly.Dart.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Dart.init = function(workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }

  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(this.nameDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(this.nameDB_.getName(variables[i].getId(),
        Blockly.VARIABLE_CATEGORY_NAME));
  }

  // Declare all of the variables.
  if (defvars.length) {
    this.definitions_['variables'] =
        'var ' + defvars.join(', ') + ';';
  }
  this.isInitialized = true;
};

/**
 * Prepend the generated code with import statements and variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Dart.finish = function(code) {
  // Indent every line.
  if (code) {
    code = this.prefixLines(code, this.INDENT);
  }
  code = 'main() {\n' + code + '}';

  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in this.definitions_) {
    var def = this.definitions_[name];
    if (def.match(/^import\s/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  // Call Blockly.Generator's finish.
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Dart.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped Dart string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Dart string.
 * @protected
 */
Blockly.Dart.quote_ = function(string) {
  // Can't use goog.string.quote since $ must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Encode a string as a properly escaped multiline Dart string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Dart string.
 * @protected
 */
Blockly.Dart.multiline_quote_ = function (string) {
  var lines = string.split(/\n/g).map(this.quote_);
  // Join with the following, plus a newline:
  // + '\n' +
  return lines.join(' + \'\\n\' + \n');
};

/**
 * Common tasks for generating Dart from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Dart code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Dart code with comments and subsequent blocks added.
 * @protected
 */
Blockly.Dart.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
      if (block.getProcedureDef) {
        // Use documentation comment for function comments.
        commentCode += this.prefixLines(comment + '\n', '/// ');
      } else {
        commentCode += this.prefixLines(comment + '\n', '// ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.inputTypes.VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.Dart.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || this.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta) {
    var at = this.valueToCode(block, atId,
        this.ORDER_ADDITIVE) || defaultAtIndex;
  } else if (opt_negate) {
    var at = this.valueToCode(block, atId,
        this.ORDER_UNARY_PREFIX) || defaultAtIndex;
  } else {
    var at = this.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseInt(at, 10) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = this.ORDER_ADDITIVE;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = this.ORDER_ADDITIVE;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = this.ORDER_UNARY_PREFIX;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};
