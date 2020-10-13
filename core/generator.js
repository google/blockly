/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Generator');

goog.require('Blockly.constants');
goog.require('Blockly.Block');


/**
 * Class for a code generator that translates the blocks into a language.
 * @param {string} name Language name of this generator.
 * @constructor
 */
Blockly.Generator = function(name) {
  this.name_ = name;
  this.FUNCTION_NAME_PLACEHOLDER_REGEXP_ =
      new RegExp(this.FUNCTION_NAME_PLACEHOLDER_, 'g');
};

/**
 * Category to separate generated function names from variables and procedures.
 */
Blockly.Generator.NAME_TYPE = 'generated_function';

/**
 * Arbitrary code to inject into locations that risk causing infinite loops.
 * Any instances of '%1' will be replaced by the block ID that failed.
 * E.g. '  checkTimeout(%1);\n'
 * @type {?string}
 */
Blockly.Generator.prototype.INFINITE_LOOP_TRAP = null;

/**
 * Arbitrary code to inject before every statement.
 * Any instances of '%1' will be replaced by the block ID of the statement.
 * E.g. 'highlight(%1);\n'
 * @type {?string}
 */
Blockly.Generator.prototype.STATEMENT_PREFIX = null;

/**
 * Arbitrary code to inject after every statement.
 * Any instances of '%1' will be replaced by the block ID of the statement.
 * E.g. 'highlight(%1);\n'
 * @type {?string}
 */
Blockly.Generator.prototype.STATEMENT_SUFFIX = null;

/**
 * The method of indenting.  Defaults to two spaces, but language generators
 * may override this to increase indent or change to tabs.
 * @type {string}
 */
Blockly.Generator.prototype.INDENT = '  ';

/**
 * Maximum length for a comment before wrapping.  Does not account for
 * indenting level.
 * @type {number}
 */
Blockly.Generator.prototype.COMMENT_WRAP = 60;

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.Generator.prototype.ORDER_OVERRIDES = [];

/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 * @return {string} Generated code.
 */
Blockly.Generator.prototype.workspaceToCode = function(workspace) {
  if (!workspace) {
    // Backwards compatibility from before there could be multiple workspaces.
    console.warn('No workspace specified in workspaceToCode call.  Guessing.');
    workspace = Blockly.getMainWorkspace();
  }
  var code = [];
  this.init(workspace);
  var blocks = workspace.getTopBlocks(true);
  for (var i = 0, block; (block = blocks[i]); i++) {
    var line = this.blockToCode(block);
    if (Array.isArray(line)) {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0];
    }
    if (line) {
      if (block.outputConnection) {
        // This block is a naked value.  Ask the language's code generator if
        // it wants to append a semicolon, or something.
        line = this.scrubNakedValue(line);
        if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
          line = this.injectId(this.STATEMENT_PREFIX, block) + line;
        }
        if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
          line = line + this.injectId(this.STATEMENT_SUFFIX, block);
        }
      }
      code.push(line);
    }
  }
  code = code.join('\n');  // Blank line between each section.
  code = this.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * Intended for indenting code or adding comment markers.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Generator.prototype.prefixLines = function(text, prefix) {
  return prefix + text.replace(/(?!\n$)\n/g, '\n' + prefix);
};

/**
 * Recursively spider a tree of blocks, returning all their comments.
 * @param {!Blockly.Block} block The block from which to start spidering.
 * @return {string} Concatenated list of comments.
 */
Blockly.Generator.prototype.allNestedComments = function(block) {
  var comments = [];
  var blocks = block.getDescendants(true);
  for (var i = 0; i < blocks.length; i++) {
    var comment = blocks[i].getCommentText();
    if (comment) {
      comments.push(comment);
    }
  }
  // Append an empty string to create a trailing line break when joined.
  if (comments.length) {
    comments.push('');
  }
  return comments.join('\n');
};

/**
 * Generate code for the specified block (and attached blocks).
 * @param {Blockly.Block} block The block to generate code for.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.Generator.prototype.blockToCode = function(block, opt_thisOnly) {
  if (!block) {
    return '';
  }
  if (!block.isEnabled()) {
    // Skip past this block if it is disabled.
    return opt_thisOnly ? '' : this.blockToCode(block.getNextBlock());
  }
  if (block.isInsertionMarker()) {
    // Skip past insertion markers.
    return opt_thisOnly ? '' : this.blockToCode(block.getChildren(false)[0]);
  }

  var func = this[block.type];
  if (typeof func != 'function') {
    throw Error('Language "' + this.name_ + '" does not know how to generate ' +
        ' code for block type "' + block.type + '".');
  }
  // First argument to func.call is the value of 'this' in the generator.
  // Prior to 24 September 2013 'this' was the only way to access the block.
  // The current preferred method of accessing the block is through the second
  // argument to func.call, which becomes the first parameter to the generator.
  var code = func.call(block, block);
  if (Array.isArray(code)) {
    // Value blocks return tuples of code and operator order.
    if (!block.outputConnection) {
      throw TypeError('Expecting string from statement block: ' + block.type);
    }
    return [this.scrub_(block, code[0], opt_thisOnly), code[1]];
  } else if (typeof code == 'string') {
    if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
      code = this.injectId(this.STATEMENT_PREFIX, block) + code;
    }
    if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
      code = code + this.injectId(this.STATEMENT_SUFFIX, block);
    }
    return this.scrub_(block, code, opt_thisOnly);
  } else if (code === null) {
    // Block has handled code generation itself.
    return '';
  } else {
    throw SyntaxError('Invalid code generated: ' + code);
  }
};

/**
 * Generate code representing the specified value input.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} outerOrder The maximum binding strength (minimum order value)
 *     of any operators adjacent to "block".
 * @return {string} Generated code or '' if no blocks are connected or the
 *     specified input does not exist.
 */
Blockly.Generator.prototype.valueToCode = function(block, name, outerOrder) {
  if (isNaN(outerOrder)) {
    throw TypeError('Expecting valid order from block: ' + block.type);
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var tuple = this.blockToCode(targetBlock);
  if (tuple === '') {
    // Disabled block.
    return '';
  }
  // Value blocks must return code and order of operations info.
  // Statement blocks must only return code.
  if (!Array.isArray(tuple)) {
    throw TypeError('Expecting tuple from value block: ' + targetBlock.type);
  }
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (isNaN(innerOrder)) {
    throw TypeError('Expecting valid order from value block: ' +
        targetBlock.type);
  }
  if (!code) {
    return '';
  }

  // Add parentheses if needed.
  var parensNeeded = false;
  var outerOrderClass = Math.floor(outerOrder);
  var innerOrderClass = Math.floor(innerOrder);
  if (outerOrderClass <= innerOrderClass) {
    if (outerOrderClass == innerOrderClass &&
        (outerOrderClass == 0 || outerOrderClass == 99)) {
      // Don't generate parens around NONE-NONE and ATOMIC-ATOMIC pairs.
      // 0 is the atomic order, 99 is the none order.  No parentheses needed.
      // In all known languages multiple such code blocks are not order
      // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
    } else {
      // The operators outside this code are stronger than the operators
      // inside this code.  To prevent the code from being pulled apart,
      // wrap the code in parentheses.
      parensNeeded = true;
      // Check for special exceptions.
      for (var i = 0; i < this.ORDER_OVERRIDES.length; i++) {
        if (this.ORDER_OVERRIDES[i][0] == outerOrder &&
            this.ORDER_OVERRIDES[i][1] == innerOrder) {
          parensNeeded = false;
          break;
        }
      }
    }
  }
  if (parensNeeded) {
    // Technically, this should be handled on a language-by-language basis.
    // However all known (sane) languages use parentheses for grouping.
    code = '(' + code + ')';
  }
  return code;
};

/**
 * Generate a code string representing the blocks attached to the named
 * statement input. Indent the code.
 * This is mainly used in generators. When trying to generate code to evaluate
 * look at using workspaceToCode or blockToCode.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @return {string} Generated code or '' if no blocks are connected.
 */
Blockly.Generator.prototype.statementToCode = function(block, name) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = this.blockToCode(targetBlock);
  // Value blocks must return code and order of operations info.
  // Statement blocks must only return code.
  if (typeof code != 'string') {
    throw TypeError('Expecting code from statement block: ' +
        (targetBlock && targetBlock.type));
  }
  if (code) {
    code = this.prefixLines(/** @type {string} */ (code), this.INDENT);
  }
  return code;
};

/**
 * Add an infinite loop trap to the contents of a loop.
 * Add statement suffix at the start of the loop block (right after the loop
 * statement executes), and a statement prefix to the end of the loop block
 * (right before the loop statement executes).
 * @param {string} branch Code for loop contents.
 * @param {!Blockly.Block} block Enclosing block.
 * @return {string} Loop contents, with infinite loop trap added.
 */
Blockly.Generator.prototype.addLoopTrap = function(branch, block) {
  if (this.INFINITE_LOOP_TRAP) {
    branch = this.prefixLines(this.injectId(this.INFINITE_LOOP_TRAP, block),
        this.INDENT) + branch;
  }
  if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
    branch = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block),
        this.INDENT) + branch;
  }
  if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
    branch = branch + this.prefixLines(this.injectId(this.STATEMENT_PREFIX,
        block), this.INDENT);
  }
  return branch;
};

/**
 * Inject a block ID into a message to replace '%1'.
 * Used for STATEMENT_PREFIX, STATEMENT_SUFFIX, and INFINITE_LOOP_TRAP.
 * @param {string} msg Code snippet with '%1'.
 * @param {!Blockly.Block} block Block which has an ID.
 * @return {string} Code snippet with ID.
 */
Blockly.Generator.prototype.injectId = function(msg, block) {
  var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
  return msg.replace(/%1/g, '\'' + id + '\'');
};

/**
 * Comma-separated list of reserved words.
 * @type {string}
 * @protected
 */
Blockly.Generator.prototype.RESERVED_WORDS_ = '';

/**
 * Add one or more words to the list of reserved words for this language.
 * @param {string} words Comma-separated list of words to add to the list.
 *     No spaces.  Duplicates are ok.
 */
Blockly.Generator.prototype.addReservedWords = function(words) {
  this.RESERVED_WORDS_ += words + ',';
};

/**
 * This is used as a placeholder in functions defined using
 * Blockly.Generator.provideFunction_.  It must not be legal code that could
 * legitimately appear in a function definition (or comment), and it must
 * not confuse the regular expression parser.
 * @type {string}
 * @protected
 */
Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_ = '{leCUI8hutHZI4480Dc}';

/**
 * A dictionary of definitions to be printed before the code.
 * @type {Object}
 * @protected
 */
Blockly.Generator.prototype.definitions_;

/**
 * A dictionary mapping desired function names in definitions_ to actual
 * function names (to avoid collisions with user functions).
 * @type {Object}
 * @protected
 */
Blockly.Generator.prototype.functionNames_;

/**
 * A database of variable names.
 * @type {Blockly.Names}
 * @protected
 */
Blockly.Generator.prototype.variableDB_;

/**
 * Define a function to be included in the generated code.
 * The first time this is called with a given desiredName, the code is
 * saved and an actual name is generated.  Subsequent calls with the
 * same desiredName have no effect but have the same return value.
 *
 * It is up to the caller to make sure the same desiredName is not
 * used for different code values.
 *
 * The code gets output when Blockly.Generator.finish() is called.
 *
 * @param {string} desiredName The desired name of the function (e.g., isPrime).
 * @param {!Array.<string>} code A list of statements.  Use '  ' for indents.
 * @return {string} The actual name of the new function.  This may differ
 *     from desiredName if the former has already been taken by the user.
 * @protected
 */
Blockly.Generator.prototype.provideFunction_ = function(desiredName, code) {
  if (!this.definitions_[desiredName]) {
    var functionName = this.variableDB_.getDistinctName(desiredName,
        Blockly.PROCEDURE_CATEGORY_NAME);
    this.functionNames_[desiredName] = functionName;
    var codeText = code.join('\n').replace(
        this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
    // Change all '  ' indents into the desired indent.
    // To avoid an infinite loop of replacements, change all indents to '\0'
    // character first, then replace them all with the indent.
    // We are assuming that no provided functions contain a literal null char.
    var oldCodeText;
    while (oldCodeText != codeText) {
      oldCodeText = codeText;
      codeText = codeText.replace(/^(( {2})*) {2}/gm, '$1\0');
    }
    codeText = codeText.replace(/\0/g, this.INDENT);
    this.definitions_[desiredName] = codeText;
  }
  return this.functionNames_[desiredName];
};

/**
 * Hook for code to run before code generation starts.
 * Subclasses may override this, e.g. to initialise the database of variable
 * names.
 * @param {!Blockly.Workspace} _workspace Workspace to generate code from.
 */
Blockly.Generator.prototype.init = function(_workspace) {
  // Optionally override
};

/**
 * Common tasks for generating code from blocks.  This is called from
 * blockToCode and is called on every block, not just top level blocks.
 * Subclasses may override this, e.g. to generate code for statements following
 * the block, or to handle comments for the specified block and any connected
 * value blocks.
 * @param {!Blockly.Block} _block The current block.
 * @param {string} code The code created for this block.
 * @param {boolean=} _opt_thisOnly True to generate code for only this
 *     statement.
 * @return {string} Code with comments and subsequent blocks added.
 * @protected
 */
Blockly.Generator.prototype.scrub_ = function(_block, code, _opt_thisOnly) {
  // Optionally override
  return code;
};

/**
 * Hook for code to run at end of code generation.
 * Subclasses may override this, e.g. to prepend the generated code with the
 * variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Generator.prototype.finish = function(code) {
  // Optionally override
  return code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * Subclasses may override this, e.g. if their language does not allow
 * naked values.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Generator.prototype.scrubNakedValue = function(line) {
  // Optionally override
  return line;
};
