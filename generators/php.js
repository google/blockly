/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper functions for generating PHP for blocks.
 * @suppress {checkTypes|globalThis}
 */
'use strict';

goog.module('Blockly.PHP');
goog.module.declareLegacyNamespace();

const objectUtils = goog.require('Blockly.utils.object');
const stringUtils = goog.require('Blockly.utils.string');
const {Block} = goog.requireType('Blockly.Block');
const {Generator} = goog.require('Blockly.Generator');
const {inputTypes} = goog.require('Blockly.inputTypes');
const {Names} = goog.require('Blockly.Names');
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * PHP code generator.
 * @type {!Generator}
 */
const PHP = new Generator('PHP');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 */
PHP.addReservedWords(
    // http://php.net/manual/en/reserved.keywords.php
    '__halt_compiler,abstract,and,array,as,break,callable,case,catch,class,' +
    'clone,const,continue,declare,default,die,do,echo,else,elseif,empty,' +
    'enddeclare,endfor,endforeach,endif,endswitch,endwhile,eval,exit,extends,' +
    'final,for,foreach,function,global,goto,if,implements,include,' +
    'include_once,instanceof,insteadof,interface,isset,list,namespace,new,or,' +
    'print,private,protected,public,require,require_once,return,static,' +
    'switch,throw,trait,try,unset,use,var,while,xor,' +
    // http://php.net/manual/en/reserved.constants.php
    'PHP_VERSION,PHP_MAJOR_VERSION,PHP_MINOR_VERSION,PHP_RELEASE_VERSION,' +
    'PHP_VERSION_ID,PHP_EXTRA_VERSION,PHP_ZTS,PHP_DEBUG,PHP_MAXPATHLEN,' +
    'PHP_OS,PHP_SAPI,PHP_EOL,PHP_INT_MAX,PHP_INT_SIZE,DEFAULT_INCLUDE_PATH,' +
    'PEAR_INSTALL_DIR,PEAR_EXTENSION_DIR,PHP_EXTENSION_DIR,PHP_PREFIX,' +
    'PHP_BINDIR,PHP_BINARY,PHP_MANDIR,PHP_LIBDIR,PHP_DATADIR,PHP_SYSCONFDIR,' +
    'PHP_LOCALSTATEDIR,PHP_CONFIG_FILE_PATH,PHP_CONFIG_FILE_SCAN_DIR,' +
    'PHP_SHLIB_SUFFIX,E_ERROR,E_WARNING,E_PARSE,E_NOTICE,E_CORE_ERROR,' +
    'E_CORE_WARNING,E_COMPILE_ERROR,E_COMPILE_WARNING,E_USER_ERROR,' +
    'E_USER_WARNING,E_USER_NOTICE,E_DEPRECATED,E_USER_DEPRECATED,E_ALL,' +
    'E_STRICT,__COMPILER_HALT_OFFSET__,TRUE,FALSE,NULL,__CLASS__,__DIR__,' +
    '__FILE__,__FUNCTION__,__LINE__,__METHOD__,__NAMESPACE__,__TRAIT__');

/**
 * Order of operation ENUMs.
 * http://php.net/manual/en/language.operators.precedence.php
 */
PHP.ORDER_ATOMIC = 0;             // 0 "" ...
PHP.ORDER_CLONE = 1;              // clone
PHP.ORDER_NEW = 1;                // new
PHP.ORDER_MEMBER = 2.1;           // []
PHP.ORDER_FUNCTION_CALL = 2.2;    // ()
PHP.ORDER_POWER = 3;              // **
PHP.ORDER_INCREMENT = 4;          // ++
PHP.ORDER_DECREMENT = 4;          // --
PHP.ORDER_BITWISE_NOT = 4;        // ~
PHP.ORDER_CAST = 4;               // (int) (float) (string) (array) ...
PHP.ORDER_SUPPRESS_ERROR = 4;     // @
PHP.ORDER_INSTANCEOF = 5;         // instanceof
PHP.ORDER_LOGICAL_NOT = 6;        // !
PHP.ORDER_UNARY_PLUS = 7.1;       // +
PHP.ORDER_UNARY_NEGATION = 7.2;   // -
PHP.ORDER_MULTIPLICATION = 8.1;   // *
PHP.ORDER_DIVISION = 8.2;         // /
PHP.ORDER_MODULUS = 8.3;          // %
PHP.ORDER_ADDITION = 9.1;         // +
PHP.ORDER_SUBTRACTION = 9.2;      // -
PHP.ORDER_STRING_CONCAT = 9.3;    // .
PHP.ORDER_BITWISE_SHIFT = 10;     // << >>
PHP.ORDER_RELATIONAL = 11;        // < <= > >=
PHP.ORDER_EQUALITY = 12;          // == != === !== <> <=>
PHP.ORDER_REFERENCE = 13;         // &
PHP.ORDER_BITWISE_AND = 13;       // &
PHP.ORDER_BITWISE_XOR = 14;       // ^
PHP.ORDER_BITWISE_OR = 15;        // |
PHP.ORDER_LOGICAL_AND = 16;       // &&
PHP.ORDER_LOGICAL_OR = 17;        // ||
PHP.ORDER_IF_NULL = 18;           // ??
PHP.ORDER_CONDITIONAL = 19;       // ?:
PHP.ORDER_ASSIGNMENT = 20;        // = += -= *= /= %= <<= >>= ...
PHP.ORDER_LOGICAL_AND_WEAK = 21;  // and
PHP.ORDER_LOGICAL_XOR = 22;       // xor
PHP.ORDER_LOGICAL_OR_WEAK = 23;   // or
PHP.ORDER_NONE = 99;              // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array<!Array<number>>}
 */
PHP.ORDER_OVERRIDES = [
  // (foo()).bar() -> foo().bar()
  // (foo())[0] -> foo()[0]
  [PHP.ORDER_MEMBER, PHP.ORDER_FUNCTION_CALL],
  // (foo[0])[1] -> foo[0][1]
  // (foo.bar).baz -> foo.bar.baz
  [PHP.ORDER_MEMBER, PHP.ORDER_MEMBER],
  // !(!foo) -> !!foo
  [PHP.ORDER_LOGICAL_NOT, PHP.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [PHP.ORDER_MULTIPLICATION, PHP.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [PHP.ORDER_ADDITION, PHP.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [PHP.ORDER_LOGICAL_AND, PHP.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [PHP.ORDER_LOGICAL_OR, PHP.ORDER_LOGICAL_OR]
];

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
PHP.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Workspace} workspace Workspace to generate code from.
 */
PHP.init = function(workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Names(this.RESERVED_WORDS_, '$');
  } else {
    this.nameDB_.reset();
  }

  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  this.isInitialized = true;
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
PHP.finish = function(code) {
  // Convert the definitions dictionary into a list.
  const definitions = objectUtils.values(this.definitions_);
  // Call Blockly.Generator's finish.
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
PHP.scrubNakedValue = function(line) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped PHP string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} PHP string.
 * @protected
 */
PHP.quote_ = function(string) {
  string = string.replace(/\\/g, '\\\\')
               .replace(/\n/g, '\\\n')
               .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Encode a string as a properly escaped multiline PHP string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} PHP string.
 * @protected
 */
PHP.multiline_quote_ = function(string) {
  const lines = string.split(/\n/g).map(this.quote_);
  // Join with the following, plus a newline:
  // . "\n" .
  // Newline escaping only works in double-quoted strings.
  return lines.join(' . \"\\n\" .\n');
};

/**
 * Common tasks for generating PHP from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Block} block The current block.
 * @param {string} code The PHP code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} PHP code with comments and subsequent blocks added.
 * @protected
 */
PHP.scrub_ = function(block, code, opt_thisOnly) {
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    let comment = block.getCommentText();
    if (comment) {
      comment = stringUtils.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode += this.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === inputTypes.VALUE) {
        const childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
PHP.getAdjusted = function(block, atId, opt_delta, opt_negate, opt_order) {
  let delta = opt_delta || 0;
  let order = opt_order || this.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  let defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  let outerOrder = order;
  let innerOrder;
  if (delta > 0) {
    outerOrder = this.ORDER_ADDITION;
    innerOrder = this.ORDER_ADDITION;
  } else if (delta < 0) {
    outerOrder = this.ORDER_SUBTRACTION;
    innerOrder = this.ORDER_SUBTRACTION;
  } else if (opt_negate) {
    outerOrder = this.ORDER_UNARY_NEGATION;
    innerOrder = this.ORDER_UNARY_NEGATION;
  }
  let at = this.valueToCode(block, atId, outerOrder) || defaultAtIndex;

  if (stringUtils.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};

exports = PHP;
