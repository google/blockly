/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper functions for generating Arduino for blocks.
 * @suppress {checkTypes|globalThis}
 */
 'use strict';

 goog.module('Blockly.Arduino');
 goog.module.declareLegacyNamespace();
 
 const Variables = goog.require('Blockly.Variables');
 const objectUtils = goog.require('Blockly.utils.object');
 const stringUtils = goog.require('Blockly.utils.string');
 const {Block} = goog.requireType('Blockly.Block');
 const {Generator} = goog.require('Blockly.Generator');
 const {globalThis} = goog.require('Blockly.utils.global');
 const {inputTypes} = goog.require('Blockly.inputTypes');
 const {Names, NameType} = goog.require('Blockly.Names');
 const {Workspace} = goog.requireType('Blockly.Workspace');
 
 
 /**
  * JavaScript code generator.
  * @type {!Generator}
  */
 const Arduino = new Generator('Arduino');
 
 /**
  * List of illegal variable names.
  * This is not intended to be a security feature.  Blockly is 100% client-side,
  * so bypassing this list is trivial.  This is intended to prevent users from
  * accidentally clobbering a built-in object or function.
  */
 Arduino.addReservedWords(
     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Keywords
     'break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield,' +
     'enum,' +
     'implements,interface,let,package,private,protected,public,static,' +
     'await,' +
     'null,true,false,' +
     // Magic variable.
     'arguments,' +
     // Everything in the current environment (835 items in Chrome, 104 in Node).
     Object.getOwnPropertyNames(globalThis).join(','));
 
 /**
  * Order of operation ENUMs.
  * https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
  */
 Arduino.ORDER_ATOMIC = 0;            // 0 "" ...
 Arduino.ORDER_NEW = 1.1;             // new
 Arduino.ORDER_MEMBER = 1.2;          // . []
 Arduino.ORDER_FUNCTION_CALL = 2;     // ()
 Arduino.ORDER_INCREMENT = 3;         // ++
 Arduino.ORDER_DECREMENT = 3;         // --
 Arduino.ORDER_BITWISE_NOT = 4.1;     // ~
 Arduino.ORDER_UNARY_PLUS = 4.2;      // +
 Arduino.ORDER_UNARY_NEGATION = 4.3;  // -
 Arduino.ORDER_LOGICAL_NOT = 4.4;     // !
 Arduino.ORDER_TYPEOF = 4.5;          // typeof
 Arduino.ORDER_VOID = 4.6;            // void
 Arduino.ORDER_DELETE = 4.7;          // delete
 Arduino.ORDER_AWAIT = 4.8;           // await
 Arduino.ORDER_EXPONENTIATION = 5.0;  // **
 Arduino.ORDER_MULTIPLICATION = 5.1;  // *
 Arduino.ORDER_DIVISION = 5.2;        // /
 Arduino.ORDER_MODULUS = 5.3;         // %
 Arduino.ORDER_SUBTRACTION = 6.1;     // -
 Arduino.ORDER_ADDITION = 6.2;        // +
 Arduino.ORDER_BITWISE_SHIFT = 7;     // << >> >>>
 Arduino.ORDER_RELATIONAL = 8;        // < <= > >=
 Arduino.ORDER_IN = 8;                // in
 Arduino.ORDER_INSTANCEOF = 8;        // instanceof
 Arduino.ORDER_EQUALITY = 9;          // == != === !==
 Arduino.ORDER_BITWISE_AND = 10;      // &
 Arduino.ORDER_BITWISE_XOR = 11;      // ^
 Arduino.ORDER_BITWISE_OR = 12;       // |
 Arduino.ORDER_LOGICAL_AND = 13;      // &&
 Arduino.ORDER_LOGICAL_OR = 14;       // ||
 Arduino.ORDER_CONDITIONAL = 15;      // ?:
 Arduino.ORDER_ASSIGNMENT = 16;       // = += -= **= *= /= %= <<= >>= ...
 Arduino.ORDER_YIELD = 17;            // yield
 Arduino.ORDER_COMMA = 18;            // ,
 Arduino.ORDER_NONE = 99;             // (...)
 
 /**
  * List of outer-inner pairings that do NOT require parentheses.
  * @type {!Array<!Array<number>>}
  */
 Arduino.ORDER_OVERRIDES = [
   // (foo()).bar -> foo().bar
   // (foo())[0] -> foo()[0]
   [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_MEMBER],
   // (foo())() -> foo()()
   [Arduino.ORDER_FUNCTION_CALL, Arduino.ORDER_FUNCTION_CALL],
   // (foo.bar).baz -> foo.bar.baz
   // (foo.bar)[0] -> foo.bar[0]
   // (foo[0]).bar -> foo[0].bar
   // (foo[0])[1] -> foo[0][1]
   [Arduino.ORDER_MEMBER, Arduino.ORDER_MEMBER],
   // (foo.bar)() -> foo.bar()
   // (foo[0])() -> foo[0]()
   [Arduino.ORDER_MEMBER, Arduino.ORDER_FUNCTION_CALL],
 
   // !(!foo) -> !!foo
   [Arduino.ORDER_LOGICAL_NOT, Arduino.ORDER_LOGICAL_NOT],
   // a * (b * c) -> a * b * c
   [Arduino.ORDER_MULTIPLICATION, Arduino.ORDER_MULTIPLICATION],
   // a + (b + c) -> a + b + c
   [Arduino.ORDER_ADDITION, Arduino.ORDER_ADDITION],
   // a && (b && c) -> a && b && c
   [Arduino.ORDER_LOGICAL_AND, Arduino.ORDER_LOGICAL_AND],
   // a || (b || c) -> a || b || c
   [Arduino.ORDER_LOGICAL_OR, Arduino.ORDER_LOGICAL_OR]
 ];
 
 /**
  * Whether the init method has been called.
  * @type {?boolean}
  */
 Arduino.isInitialized = false;
 
 /**
  * Initialise the database of variable names.
  * @param {!Workspace} workspace Workspace to generate code from.
  */
 Arduino.init = function(workspace) {
   // Call Blockly.Generator's init.
   Object.getPrototypeOf(this).init.call(this);
 
   if (!this.nameDB_) {
     this.nameDB_ = new Names(this.RESERVED_WORDS_);
   } else {
     this.nameDB_.reset();
   }
 
   this.nameDB_.setVariableMap(workspace.getVariableMap());
   this.nameDB_.populateVariables(workspace);
   this.nameDB_.populateProcedures(workspace);
 
   const defvars = [];
   // Add developer variables (not created or named by the user).
   const devVarList = Variables.allDeveloperVariables(workspace);
   for (let i = 0; i < devVarList.length; i++) {
     defvars.push(
         this.nameDB_.getName(devVarList[i], NameType.DEVELOPER_VARIABLE));
   }
 
   // Add user variables, but only ones that are being used.
   const variables = Variables.allUsedVarModels(workspace);
   for (let i = 0; i < variables.length; i++) {
     defvars.push(this.nameDB_.getName(variables[i].getId(), NameType.VARIABLE));
   }
 
   // Declare all of the variables.
   if (defvars.length) {
     this.definitions_['variables'] = 'var ' + defvars.join(', ') + ';';
   }
   this.isInitialized = true;
 };
 
 /**
  * Prepend the generated code with the variable definitions.
  * @param {string} code Generated code.
  * @return {string} Completed code.
  */
 Arduino.finish = function(code) {
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
 Arduino.scrubNakedValue = function(line) {
   return line + ';\n';
 };
 
 /**
  * Encode a string as a properly escaped JavaScript string, complete with
  * quotes.
  * @param {string} string Text to encode.
  * @return {string} JavaScript string.
  * @protected
  */
 Arduino.quote_ = function(string) {
   // Can't use goog.string.quote since Google's style guide recommends
   // JS string literals use single quotes.
   string = string.replace(/\\/g, '\\\\')
                .replace(/\n/g, '\\\n')
                .replace(/'/g, '\\\'');
   return '\'' + string + '\'';
 };
 
 /**
  * Encode a string as a properly escaped multiline JavaScript string, complete
  * with quotes.
  * @param {string} string Text to encode.
  * @return {string} JavaScript string.
  * @protected
  */
 Arduino.multiline_quote_ = function(string) {
   // Can't use goog.string.quote since Google's style guide recommends
   // JS string literals use single quotes.
   const lines = string.split(/\n/g).map(this.quote_);
   return lines.join(' + \'\\n\' +\n');
 };
 
 /**
  * Common tasks for generating JavaScript from blocks.
  * Handles comments for the specified block and any connected value blocks.
  * Calls any statements following this block.
  * @param {!Block} block The current block.
  * @param {string} code The JavaScript code created for this block.
  * @param {boolean=} opt_thisOnly True to generate code for only this statement.
  * @return {string} JavaScript code with comments and subsequent blocks added.
  * @protected
  */
 Arduino.scrub_ = function(block, code, opt_thisOnly) {
   let commentCode = '';
   // Only collect comments for blocks that aren't inline.
   if (!block.outputConnection || !block.outputConnection.targetConnection) {
     // Collect comment for this block.
     let comment = block.getCommentText();
     if (comment) {
       comment = stringUtils.wrap(comment, this.COMMENT_WRAP - 3);
       commentCode += this.prefixLines(comment + '\n', '// ');
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
 Arduino.getAdjusted = function(
     block, atId, opt_delta, opt_negate, opt_order) {
   let delta = opt_delta || 0;
   let order = opt_order || this.ORDER_NONE;
   if (block.workspace.options.oneBasedIndex) {
     delta--;
   }
   const defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
 
   let innerOrder;
   let outerOrder = order;
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
 
 exports = Arduino;
 