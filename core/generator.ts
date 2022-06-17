/**
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 */

/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Utility functions for generating executable code from
 * Blockly code.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import {Block} from './block.js';
import * as common from './common.js';
/* eslint-disable-next-line no-unused-vars */
import {Names, NameType} from './names.js';
import * as deprecation from './utils/deprecation.js';
/* eslint-disable-next-line no-unused-vars */
import {Workspace} from './workspace.js';


/**
 * Class for a code generator that translates the blocks into a language.
 * @unrestricted
 * @alias Blockly.Generator
 */
export class Generator {
  name_: AnyDuringMigration;

  /**
   * This is used as a placeholder in functions defined using
   * Generator.provideFunction_.  It must not be legal code that could
   * legitimately appear in a function definition (or comment), and it must
   * not confuse the regular expression parser.
   */
  protected FUNCTION_NAME_PLACEHOLDER_ = '{leCUI8hutHZI4480Dc}';
  FUNCTION_NAME_PLACEHOLDER_REGEXP_: AnyDuringMigration;

  /**
   * Arbitrary code to inject into locations that risk causing infinite loops.
   * Any instances of '%1' will be replaced by the block ID that failed.
   * E.g. '  checkTimeout(%1);\n'
   */
  INFINITE_LOOP_TRAP: string|null = null;

  /**
   * Arbitrary code to inject before every statement.
   * Any instances of '%1' will be replaced by the block ID of the statement.
   * E.g. 'highlight(%1);\n'
   */
  STATEMENT_PREFIX: string|null = null;

  /**
   * Arbitrary code to inject after every statement.
   * Any instances of '%1' will be replaced by the block ID of the statement.
   * E.g. 'highlight(%1);\n'
   */
  STATEMENT_SUFFIX: string|null = null;

  /**
   * The method of indenting.  Defaults to two spaces, but language generators
   * may override this to increase indent or change to tabs.
   */
  INDENT = '  ';

  /**
   * Maximum length for a comment before wrapping.  Does not account for
   * indenting level.
   */
  COMMENT_WRAP = 60;

  /** List of outer-inner pairings that do NOT require parentheses. */
  ORDER_OVERRIDES: number[][] = [];

  /**
   * Whether the init method has been called.
   * Generators that set this flag to false after creation and true in init
   * will cause blockToCode to emit a warning if the generator has not been
   * initialized. If this flag is untouched, it will have no effect.
   */
  isInitialized: boolean|null = null;

  /** Comma-separated list of reserved words. */
  protected RESERVED_WORDS_ = '';

  /** A dictionary of definitions to be printed before the code. */
  protected definitions_?: AnyDuringMigration = undefined;

  /**
   * A dictionary mapping desired function names in definitions_ to actual
   * function names (to avoid collisions with user functions).
   */
  protected functionNames_?: AnyDuringMigration = undefined;

  /** A database of variable and procedure names. */
  protected nameDB_?: Names = undefined;

  /** @param name Language name of this generator. */
  constructor(name: string) {
    this.name_ = name;

    this.FUNCTION_NAME_PLACEHOLDER_REGEXP_ =
        new RegExp(this.FUNCTION_NAME_PLACEHOLDER_, 'g');
  }

  /**
   * Generate code for all blocks in the workspace to the specified language.
   * @param workspace Workspace to generate code from.
   * @return Generated code.
   */
  workspaceToCode(workspace?: Workspace): string {
    if (!workspace) {
      // Backwards compatibility from before there could be multiple workspaces.
      console.warn(
          'No workspace specified in workspaceToCode call.  Guessing.');
      workspace = common.getMainWorkspace();
    }
    let code = [];
    this.init(workspace);
    const blocks = workspace.getTopBlocks(true);
    for (let i = 0, block; block = blocks[i]; i++) {
      let line = this.blockToCode(block);
      if (Array.isArray(line)) {
        // Value blocks return tuples of code and operator order.
        // Top-level blocks don't care about operator order.
        line = line[0];
      }
      if (line) {
        if (block.outputConnection) {
          // This block is a naked value.  Ask the language's code generator if
          // it wants to append a semicolon, or something.
          // AnyDuringMigration because:  Argument of type 'string | any[]' is
          // not assignable to parameter of type 'string'.
          line = this.scrubNakedValue(line as AnyDuringMigration);
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
    // AnyDuringMigration because:  Type 'string' is not assignable to type
    // 'any[]'.
    code = code.join('\n') as AnyDuringMigration;
    // Blank line between each section.
    // AnyDuringMigration because:  Argument of type 'any[]' is not assignable
    // to parameter of type 'string'. AnyDuringMigration because:  Type 'string'
    // is not assignable to type 'any[]'.
    code = this.finish(code as AnyDuringMigration) as AnyDuringMigration;
    // Final scrubbing of whitespace.
    // AnyDuringMigration because:  Property 'replace' does not exist on type
    // 'any[]'.
    code = (code as AnyDuringMigration).replace(/^\s+\n/, '');
    code = code.replace(/\n\s+$/, '\n');
    code = code.replace(/[ \t]+\n/g, '\n');
    return code;
  }

  // The following are some helpful functions which can be used by multiple

  // languages.

  /**
   * Prepend a common prefix onto each line of code.
   * Intended for indenting code or adding comment markers.
   * @param text The lines of code.
   * @param prefix The common prefix.
   * @return The prefixed lines of code.
   */
  prefixLines(text: string, prefix: string): string {
    return prefix + text.replace(/(?!\n$)\n/g, '\n' + prefix);
  }

  /**
   * Recursively spider a tree of blocks, returning all their comments.
   * @param block The block from which to start spidering.
   * @return Concatenated list of comments.
   */
  allNestedComments(block: Block): string {
    const comments = [];
    const blocks = block.getDescendants(true);
    for (let i = 0; i < blocks.length; i++) {
      const comment = blocks[i].getCommentText();
      if (comment) {
        comments.push(comment);
      }
    }
    // Append an empty string to create a trailing line break when joined.
    if (comments.length) {
      comments.push('');
    }
    return comments.join('\n');
  }

  /**
   * Generate code for the specified block (and attached blocks).
   * The generator must be initialized before calling this function.
   * @param block The block to generate code for.
   * @param opt_thisOnly True to generate code for only this statement.
   * @return For statement blocks, the generated code.
   *     For value blocks, an array containing the generated code and an
   * operator order value.  Returns '' if block is null.
   */
  blockToCode(block: Block|null, opt_thisOnly?: boolean): string
      |AnyDuringMigration[] {
    if (this.isInitialized === false) {
      console.warn(
          'Generator init was not called before blockToCode was called.');
    }
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

    const func = (this as AnyDuringMigration)[block.type];
    if (typeof func !== 'function') {
      throw Error(
          'Language "' + this.name_ + '" does not know how to generate ' +
          'code for block type "' + block.type + '".');
    }
    // First argument to func.call is the value of 'this' in the generator.
    // Prior to 24 September 2013 'this' was the only way to access the block.
    // The current preferred method of accessing the block is through the second
    // argument to func.call, which becomes the first parameter to the
    // generator.
    let code = func.call(block, block);
    if (Array.isArray(code)) {
      // Value blocks return tuples of code and operator order.
      if (!block.outputConnection) {
        throw TypeError('Expecting string from statement block: ' + block.type);
      }
      return [this.scrub_(block, code[0], opt_thisOnly), code[1]];
    } else if (typeof code === 'string') {
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
    }
    throw SyntaxError('Invalid code generated: ' + code);
  }

  /**
   * Generate code representing the specified value input.
   * @param block The block containing the input.
   * @param name The name of the input.
   * @param outerOrder The maximum binding strength (minimum order value) of any
   *     operators adjacent to "block".
   * @return Generated code or '' if no blocks are connected or the specified
   *     input does not exist.
   */
  valueToCode(block: Block, name: string, outerOrder: number): string {
    if (isNaN(outerOrder)) {
      throw TypeError('Expecting valid order from block: ' + block.type);
    }
    const targetBlock = block.getInputTargetBlock(name);
    if (!targetBlock) {
      return '';
    }
    const tuple = this.blockToCode(targetBlock);
    if (tuple === '') {
      // Disabled block.
      return '';
    }
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    if (!Array.isArray(tuple)) {
      throw TypeError('Expecting tuple from value block: ' + targetBlock.type);
    }
    let code = tuple[0];
    const innerOrder = tuple[1];
    if (isNaN(innerOrder)) {
      throw TypeError(
          'Expecting valid order from value block: ' + targetBlock.type);
    }
    if (!code) {
      return '';
    }

    // Add parentheses if needed.
    let parensNeeded = false;
    const outerOrderClass = Math.floor(outerOrder);
    const innerOrderClass = Math.floor(innerOrder);
    if (outerOrderClass <= innerOrderClass) {
      // Don't generate parens around NONE-NONE and ATOMIC-ATOMIC pairs.
      // 0 is the atomic order, 99 is the none order.  No parentheses needed.
      // In all known languages multiple such code blocks are not order
      // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
      if (outerOrderClass === innerOrderClass &&
          (outerOrderClass === 0 || outerOrderClass === 99)) {
      } else {
        // The operators outside this code are stronger than the operators
        // inside this code.  To prevent the code from being pulled apart,
        // wrap the code in parentheses.
        parensNeeded = true;
        // Check for special exceptions.
        for (let i = 0; i < this.ORDER_OVERRIDES.length; i++) {
          if (this.ORDER_OVERRIDES[i][0] === outerOrder &&
              this.ORDER_OVERRIDES[i][1] === innerOrder) {
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
  }

  /**
   * Generate a code string representing the blocks attached to the named
   * statement input. Indent the code.
   * This is mainly used in generators. When trying to generate code to evaluate
   * look at using workspaceToCode or blockToCode.
   * @param block The block containing the input.
   * @param name The name of the input.
   * @return Generated code or '' if no blocks are connected.
   */
  statementToCode(block: Block, name: string): string {
    const targetBlock = block.getInputTargetBlock(name);
    let code = this.blockToCode(targetBlock);
    // Value blocks must return code and order of operations info.
    // Statement blocks must only return code.
    if (typeof code !== 'string') {
      throw TypeError(
          'Expecting code from statement block: ' +
          (targetBlock && targetBlock.type));
    }
    if (code) {
      code = this.prefixLines((code), this.INDENT);
    }
    return code;
  }

  /**
   * Add an infinite loop trap to the contents of a loop.
   * Add statement suffix at the start of the loop block (right after the loop
   * statement executes), and a statement prefix to the end of the loop block
   * (right before the loop statement executes).
   * @param branch Code for loop contents.
   * @param block Enclosing block.
   * @return Loop contents, with infinite loop trap added.
   */
  addLoopTrap(branch: string, block: Block): string {
    if (this.INFINITE_LOOP_TRAP) {
      branch = this.prefixLines(
                   this.injectId(this.INFINITE_LOOP_TRAP, block), this.INDENT) +
          branch;
    }
    if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
      branch = this.prefixLines(
                   this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) +
          branch;
    }
    if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
      branch = branch +
          this.prefixLines(
              this.injectId(this.STATEMENT_PREFIX, block), this.INDENT);
    }
    return branch;
  }

  /**
   * Inject a block ID into a message to replace '%1'.
   * Used for STATEMENT_PREFIX, STATEMENT_SUFFIX, and INFINITE_LOOP_TRAP.
   * @param msg Code snippet with '%1'.
   * @param block Block which has an ID.
   * @return Code snippet with ID.
   */
  injectId(msg: string, block: Block): string {
    const id = block.id.replace(/\$/g, '$$$$');
    // Issue 251.
    return msg.replace(/%1/g, '\'' + id + '\'');
  }

  /**
   * Add one or more words to the list of reserved words for this language.
   * @param words Comma-separated list of words to add to the list.
   *     No spaces.  Duplicates are ok.
   */
  addReservedWords(words: string) {
    this.RESERVED_WORDS_ += words + ',';
  }

  /**
   * Define a developer-defined function (not a user-defined procedure) to be
   * included in the generated code.  Used for creating private helper
   * functions. The first time this is called with a given desiredName, the code
   * is saved and an actual name is generated.  Subsequent calls with the same
   * desiredName have no effect but have the same return value.
   *
   * It is up to the caller to make sure the same desiredName is not
   * used for different helper functions (e.g. use "colourRandom" and
   * "listRandom", not "random").  There is no danger of colliding with reserved
   * words, or user-defined variable or procedure names.
   *
   * The code gets output when Generator.finish() is called.
   *
   * @param desiredName The desired name of the function (e.g. mathIsPrime).
   * @param code A list of statements or one multi-line code string.  Use '  '
   *     for indents (they will be replaced).
   * @return The actual name of the new function.  This may differ from
   *     desiredName if the former has already been taken by the user.
   */
  protected provideFunction_(desiredName: string, code: string[]|string):
      string {
    if (!this.definitions_[desiredName]) {
      const functionName =
          this.nameDB_!.getDistinctName(desiredName, NameType.PROCEDURE);
      this.functionNames_[desiredName] = functionName;
      if (Array.isArray(code)) {
        code = code.join('\n');
      }
      let codeText = code.trim().replace(
          this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
      // Change all '  ' indents into the desired indent.
      // To avoid an infinite loop of replacements, change all indents to '\0'
      // character first, then replace them all with the indent.
      // We are assuming that no provided functions contain a literal null char.
      let oldCodeText;
      while (oldCodeText !== codeText) {
        oldCodeText = codeText;
        codeText = codeText.replace(/^(( {2})*) {2}/gm, '$1\0');
      }
      codeText = codeText.replace(/\0/g, this.INDENT);
      this.definitions_[desiredName] = codeText;
    }
    return this.functionNames_[desiredName];
  }

  /**
   * Hook for code to run before code generation starts.
   * Subclasses may override this, e.g. to initialise the database of variable
   * names.
   * @param _workspace Workspace to generate code from.
   */
  init(_workspace: Workspace) {
    // Optionally override
    // Create a dictionary of definitions to be printed before the code.
    this.definitions_ = Object.create(null);
    // Create a dictionary mapping desired developer-defined function names in
    // definitions_ to actual function names (to avoid collisions with
    // user-defined procedures).
    this.functionNames_ = Object.create(null);
  }

  /**
   * Common tasks for generating code from blocks.  This is called from
   * blockToCode and is called on every block, not just top level blocks.
   * Subclasses may override this, e.g. to generate code for statements
   * following the block, or to handle comments for the specified block and any
   * connected value blocks.
   * @param _block The current block.
   * @param code The code created for this block.
   * @param _opt_thisOnly True to generate code for only this statement.
   * @return Code with comments and subsequent blocks added.
   */
  protected scrub_(_block: Block, code: string, _opt_thisOnly?: boolean):
      string {
    // Optionally override
    return code;
  }

  /**
   * Hook for code to run at end of code generation.
   * Subclasses may override this, e.g. to prepend the generated code with
   * import statements or variable definitions.
   * @param code Generated code.
   * @return Completed code.
   */
  finish(code: string): string {
    // Optionally override
    // Clean up temporary data.
    delete this.definitions_;
    delete this.functionNames_;
    return code;
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.
   * Subclasses may override this, e.g. if their language does not allow
   * naked values.
   * @param line Line of generated code.
   * @return Legal line of code.
   */
  scrubNakedValue(line: string): string {
    // Optionally override
    return line;
  }
}

Object.defineProperties(Generator.prototype, {
  /**
   * A database of variable names.
   * @name Blockly.Generator.prototype.variableDB_
   * @deprecated 'variableDB_' was renamed to 'nameDB_' (May 2021).
   * @suppress {checkTypes}
   */
  // AnyDuringMigration because:  Type 'Names | undefined' is not assignable to
  // type 'PropertyDescriptor'.
  variableDB_: ({
    /** @return Name database. */
    get(this: Generator): Names |
        undefined {
          deprecation.warn('variableDB_', 'May 2021', 'September 2022', 'nameDB_');
          return this.nameDB_;
        },
    /** @param nameDb New name database. */
    set(this: Generator, nameDb: Names|undefined) {
      deprecation.warn('variableDB_', 'May 2021', 'September2022', 'nameDB_');
      this.nameDB_ = nameDb;
    },
  }),
});
