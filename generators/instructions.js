/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Helper functions for generating Instructions for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Instructions');

goog.require('Blockly.Generator');


/**
 * Instructions code generator.
 * @type !Blockly.Generator
 */
Blockly.Instructions = new Blockly.Generator('Instructions');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Instructions.addReservedWords(
    // Figure out set list of reserved words
    'on, off, delay, mov, beq, bneq, bgeq, add, sub, mult, jump, flash, tone, noTone' +
    'digitalWrite, digitalRead, analogWrite, analogRead, unsigned, int, double, char, String, Type, NULL, while, for, if, else, break, include, True, False' +
    'void, setup, loop, EEPROM, write, read, return');
/**
 * Order of operation ENUMs.
 * https://www.dartlang.org/docs/dart-up-and-running/ch02.html#operator_table
 */
 /* Must figure out order precedence */
Blockly.Instructions.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Instructions.ORDER_UNARY_POSTFIX = 1;  // expr++ expr-- () [] .
Blockly.Instructions.ORDER_UNARY_PREFIX = 2;   // -expr !expr ~expr ++expr --expr
Blockly.Instructions.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.Instructions.ORDER_ADDITIVE = 4;       // + -
Blockly.Instructions.ORDER_SHIFT = 5;          // << >>
Blockly.Instructions.ORDER_BITWISE_AND = 6;    // &
Blockly.Instructions.ORDER_BITWISE_XOR = 7;    // ^
Blockly.Instructions.ORDER_BITWISE_OR = 8;     // |
Blockly.Instructions.ORDER_RELATIONAL = 9;     // >= > <= < as is is!
Blockly.Instructions.ORDER_EQUALITY = 10;      // == !=
Blockly.Instructions.ORDER_LOGICAL_AND = 11;   // &&
Blockly.Instructions.ORDER_LOGICAL_OR = 12;    // ||
Blockly.Instructions.ORDER_CONDITIONAL = 13;   // expr ? expr : expr
Blockly.Instructions.ORDER_CASCADE = 14;       // ..
Blockly.Instructions.ORDER_ASSIGNMENT = 15;    // = *= /= ~/= %= += -= <<= >>= &= ^= |=

Blockly.Instructions.ORDER_NONE = 99;          // (...)

Blockly.Instructions.unusedRegister = 0;
/**
 * Initialise the database of variable names.
 */
Blockly.Instructions.init = function() {
  /* Need to figure out definitions setup and variable gets.*/
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Instructions.definitions_ = Object.create(null);
  Blockly.Instructions.mapping_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Instructions.functionNames_ = Object.create(null);

  if (!Blockly.Instructions.variableDB_) {
    Blockly.Instructions.variableDB_ =
        new Blockly.Names(Blockly.Instructions.RESERVED_WORDS_);
  } else {
    Blockly.Instructions.variableDB_.reset();
  }

  //var mapvars = [];
  var variables = Blockly.Variables.allVariables();
  for (var x = 0; x < variables.length; x++) {
  	var name = Blockly.Instructions.variableDB_.getName(variables[x],
        Blockly.Variables.NAME_TYPE);
    Blockly.Instructions.mapping_[name] = 'r' + x;
    //mapvars[name] = 'r' + x;
  }
  Blockly.Instructions.unusedRegister = variables.length;
  //Blockly.Instructions.mapping_['variables'] = mapvars.join('\n');

};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Instructions.finish = function(code) {
  /* What do we need to append?
  // Indent every line.
  if (code) {
    code = Blockly.Instructions.prefixLines(code, Blockly.Instructions.INDENT);
  }
  code = 'main() {\n' + code + '}';

  // Convert the definitions dictionary into a list.
  var imports = [];
  var definitions = [];
  for (var name in Blockly.Instructions.definitions_) {
    var def = Blockly.Instructions.definitions_[name];
    if (def.match(/^import\s/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
  */

  code = code + 'EOP';
  return code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Instructions.scrubNakedValue = function(line) {
  //return line + ';\n';
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Instructions string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Instructions string.
 * @private
 */
Blockly.Instructions.quote_ = function(string) {
  /* Will need to think about string structure.
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\$/g, '\\$')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
  */
  return string;
};

/**
 * Common tasks for generating Instructions from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Instructions code created for this block.
 * @return {string} Instructions code with comments and subsequent blocks added.
 * @private
 */

//Will we just get rid of these comments?
Blockly.Instructions.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Instructions.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Instructions.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Instructions.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Instructions.blockToCode(nextBlock);
  //return commentCode + code + nextCode;
  return code + nextCode;
};
