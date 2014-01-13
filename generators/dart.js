/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Helper functions for generating Dart for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart');

goog.require('Blockly.CodeGenerator');

Blockly.Dart = Blockly.Generator.get('Dart');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Dart.addReservedWords(
    // http://www.dartlang.org/docs/spec/latest/dart-language-specification.pdf
    // Section 16.1.1
    'assert,break,case,catch,class,const,continue,default,do,else,extends,false,final,finally,for,if,in,is,new,null,return,super,switch,this,throw,true,try,var,void,while,with,' +
    // http://api.dartlang.org/dart_core.html
    'Collection,Comparable,Completer,Date,double,Function,Future,Hashable,HashMap,HashSet,int,InvocationMirror,Iterable,Iterator,LinkedHashMap,List,Map,Match,num,Options,Pattern,Queue,RegExp,Sequence,SequenceCollection,Set,Stopwatch,String,StringBuffer,Strings,Type,bool,DoubleLinkedQueue,DoubleLinkedQueueEntry,Duration,Expando,Expect,Futures,Object,SequenceIterator,SequenceList,Comparator,AbstractClassInstantiationError,ArgumentError,AssertionError,CastError,Error,Exception,ExpectException,FallThroughError,FormatException,FutureAlreadyCompleteException,FutureNotCompleteException,FutureUnhandledException,IllegalJSRegExpException,IntegerDivisionByZeroException,NoSuchMethodError,NullThrownError,OutOfMemoryError,RangeError,RuntimeError,StackOverflowError,StateError,TypeError,UnimplementedError,UnsupportedError');
/**
 * Order of operation ENUMs.
 * http://www.dartlang.org/docs/dart-up-and-running/ch02.html#operator_table
 */
Blockly.Dart.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Dart.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Dart.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Dart.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Dart.ORDER_ADDITIVE = 4;       // + -
Blockly.Dart.ORDER_SHIFT = 5;          // << >>
Blockly.Dart.ORDER_RELATIONAL = 6;     // is is! >= > <= <
Blockly.Dart.ORDER_EQUALITY = 7;       // == != === !==
Blockly.Dart.ORDER_BITWISE_AND = 8;    // &
Blockly.Dart.ORDER_BITWISE_XOR = 9;    // ^
Blockly.Dart.ORDER_BITWISE_OR = 10;    // |
Blockly.Dart.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Dart.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Dart.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Blockly.Dart.ORDER_ASSIGNMENT = 14;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.Dart.ORDER_NONE = 99;          // (...)

/**
 * Arbitrary code to inject into locations that risk causing infinite loops.
 * Any instances of '%1' will be replaced by the block ID that failed.
 * E.g. '  checkTimeout(%1);\n'
 * @type ?string
 */
Blockly.Dart.INFINITE_LOOP_TRAP = null;

/**
 * Initialise the database of variable names.
 */
Blockly.Dart.init = function() {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Dart.definitions_ = {};

  if (Blockly.Variables) {
    if (!Blockly.Dart.variableDB_) {
      Blockly.Dart.variableDB_ =
          new Blockly.Names(Blockly.Dart.RESERVED_WORDS_);
    } else {
      Blockly.Dart.variableDB_.reset();
    }

    var defvars = [];
    var variables = Blockly.Variables.allVariables();
    for (var x = 0; x < variables.length; x++) {
      defvars[x] = 'var ' +
          Blockly.Dart.variableDB_.getName(variables[x],
          Blockly.Variables.NAME_TYPE) + ';';
    }
    Blockly.Dart.definitions_['variables'] = defvars.join('\n');
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Dart.finish = function(code) {
  // Indent every line.
  code = '  ' + code.replace(/\n/g, '\n  ');
  code = code.replace(/\n\s+$/, '\n');
  code = 'main() {\n' + code + '}';

  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Dart.definitions_) {
    var def = Blockly.Dart.definitions_[name];
    if (def.match(/^import\s/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
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
 * @private
 */
Blockly.Dart.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Dart from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Dart code created for this block.
 * @return {string} Dart code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Blockly.Dart.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Generator.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Generator.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
