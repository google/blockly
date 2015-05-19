/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Helper functions for generating PHP for blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.PHP');

goog.require('Blockly.Generator');


/**
 * PHP code generator.
 * @type !Blockly.Generator
 */
Blockly.PHP = new Blockly.Generator('PHP');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.PHP.addReservedWords(
        // http://php.net/manual/en/reserved.keywords.php
    '__halt_compiler,abstract,and,array,as,break,callable,case,catch,class,clone,const,continue,declare,default,die,do,echo,else,elseif,empty,enddeclare,endfor,endforeach,endif,endswitch,endwhile,eval,exit,extends,final,for,foreach,function,global,goto,if,implements,include,include_once,instanceof,insteadof,interface,isset,list,namespace,new,or,print,private,protected,public,require,require_once,return,static,switch,throw,trait,try,unset,use,var,while,xor,' +
        // http://php.net/manual/en/reserved.constants.php
    'PHP_VERSION,PHP_MAJOR_VERSION,PHP_MINOR_VERSION,PHP_RELEASE_VERSION,PHP_VERSION_ID,PHP_EXTRA_VERSION,PHP_ZTS,PHP_DEBUG,PHP_MAXPATHLEN,PHP_OS,PHP_SAPI,PHP_EOL,PHP_INT_MAX,PHP_INT_SIZE,DEFAULT_INCLUDE_PATH,PEAR_INSTALL_DIR,PEAR_EXTENSION_DIR,PHP_EXTENSION_DIR,PHP_PREFIX,PHP_BINDIR,PHP_BINARY,PHP_MANDIR,PHP_LIBDIR,PHP_DATADIR,PHP_SYSCONFDIR,PHP_LOCALSTATEDIR,PHP_CONFIG_FILE_PATH,PHP_CONFIG_FILE_SCAN_DIR,PHP_SHLIB_SUFFIX,E_ERROR,E_WARNING,E_PARSE,E_NOTICE,E_CORE_ERROR,E_CORE_WARNING,E_COMPILE_ERROR,E_COMPILE_WARNING,E_USER_ERROR,E_USER_WARNING,E_USER_NOTICE,E_DEPRECATED,E_USER_DEPRECATED,E_ALL,E_STRICT,__COMPILER_HALT_OFFSET__,TRUE,FALSE,NULL,__CLASS__,__DIR__,__FILE__,__FUNCTION__,__LINE__,__METHOD__,__NAMESPACE__,__TRAIT__');

/**
 * Order of operation ENUMs.
 * http://php.net/manual/en/language.operators.precedence.php
 */
Blockly.PHP.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.PHP.ORDER_CLONE = 1;          // clone
Blockly.PHP.ORDER_NEW = 1;            // new
Blockly.PHP.ORDER_MEMBER = 2;         // ()
Blockly.PHP.ORDER_FUNCTION_CALL = 2;  // ()
Blockly.PHP.ORDER_INCREMENT = 3;      // ++
Blockly.PHP.ORDER_DECREMENT = 3;      // --
Blockly.PHP.ORDER_LOGICAL_NOT = 4;    // !
Blockly.PHP.ORDER_BITWISE_NOT = 4;    // ~
Blockly.PHP.ORDER_UNARY_PLUS = 4;     // +
Blockly.PHP.ORDER_UNARY_NEGATION = 4; // -
Blockly.PHP.ORDER_MULTIPLICATION = 5; // *
Blockly.PHP.ORDER_DIVISION = 5;       // /
Blockly.PHP.ORDER_MODULUS = 5;        // %
Blockly.PHP.ORDER_ADDITION = 6;       // +
Blockly.PHP.ORDER_SUBTRACTION = 6;    // -
Blockly.PHP.ORDER_BITWISE_SHIFT = 7;  // << >> >>>
Blockly.PHP.ORDER_RELATIONAL = 8;     // < <= > >=
Blockly.PHP.ORDER_IN = 8;             // in
Blockly.PHP.ORDER_INSTANCEOF = 8;     // instanceof
Blockly.PHP.ORDER_EQUALITY = 9;       // == != === !==
Blockly.PHP.ORDER_BITWISE_AND = 10;   // &
Blockly.PHP.ORDER_BITWISE_XOR = 11;   // ^
Blockly.PHP.ORDER_BITWISE_OR = 12;    // |
Blockly.PHP.ORDER_CONDITIONAL = 13;   // ?:
Blockly.PHP.ORDER_ASSIGNMENT = 14;    // = += -= *= /= %= <<= >>= ...
Blockly.PHP.ORDER_LOGICAL_AND = 15;   // &&
Blockly.PHP.ORDER_LOGICAL_OR = 16;    // ||
Blockly.PHP.ORDER_COMMA = 17;         // ,
Blockly.PHP.ORDER_NONE = 99;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.PHP.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.PHP.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.PHP.functionNames_ = Object.create(null);

  if (!Blockly.PHP.variableDB_) {
    Blockly.PHP.variableDB_ =
        new Blockly.Names(Blockly.PHP.RESERVED_WORDS_, true);
  } else {
    Blockly.PHP.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  for (var x = 0; x < variables.length; x++) {
    defvars[x] = Blockly.PHP.variableDB_.getName(variables[x],
        Blockly.Variables.NAME_TYPE) + ';';
  }
  Blockly.PHP.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.PHP.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.PHP.definitions_) {
    definitions.push(Blockly.PHP.definitions_[name]);
  }
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.PHP.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped PHP string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} PHP string.
 * @private
 */
Blockly.PHP.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating PHP from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The PHP code created for this block.
 * @return {string} PHP code with comments and subsequent blocks added.
 * @private
 */
Blockly.PHP.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.PHP.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.PHP.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.PHP.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.PHP.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
