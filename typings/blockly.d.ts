/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Type definitions for Blockly.
 * @author samelh@google.com (Sam El-Husseini)
 */

export = Blockly;

declare module Blockly {

  interface BlocklyOptions {
    toolbox?: HTMLElement | string;
    readOnly?: boolean;
    trashcan?: boolean;
    maxInstances?: {[type: string]: number;};
    maxTrashcanContents?: number;
    collapse?: boolean;
    comments?: boolean;
    disable?: boolean;
    sounds?: boolean;
    rtl?: boolean;
    horizontalLayout?: boolean;
    toolboxPosition?: string;
    css?: boolean;
    oneBasedIndex?: boolean;
    media?: string;
    theme?: Blockly.Theme | BlocklyThemeOptions;
    move?: {
      scrollbars?: boolean;
      drag?: boolean;
      wheel?: boolean;
    };
    grid?: {
      spacing?: number;
      colour?: string;
      length?: number;
      snap?: boolean;
    };
    zoom?: {
      controls?: boolean;
      wheel?: boolean;
      startScale?: number;
      maxScale?: number;
      minScale?: number;
      scaleSpeed?: number;
      pinch?: boolean;
    };
    renderer?: string;
    keyMap?: {[type: string]: Blockly.Action;};
  }

  interface BlocklyThemeOptions {
    base?: string;
    blockStyles?: {[blocks: string]: Blockly.Theme.BlockStyle;};
    categoryStyles?: {[category: string]: Blockly.Theme.CategoryStyle;};
    componentStyles?: {[component: string]: any;};
    fontStyle?: Blockly.Theme.FontStyle;
    startHats?: boolean;
  }

  /**
   * Set the Blockly locale.
   * Note: this method is only available in the npm release of Blockly.
   * @param {!Object} msg An object of Blockly message strings in the desired
   *     language.
   */
  function setLocale(msg: {[key: string]: string;}): void;
}

declare module Blockly.utils {
  interface Metrics {
    viewHeight: number;
    viewWidth: number;
    contentHeight: number;
    contentWidth: number;
    viewTop: number;
    viewLeft: number;
    contentTop: number;
    contentLeft: number;
    absoluteTop: number;
    absoluteLeft: number;
    svgHeight?: number;
    svgWidth?: number;
    toolboxWidth?: number;
    toolboxHeight?: number;
    flyoutWidth?: number;
    flyoutHeight?: number;
    toolboxPosition?: number;
  }
}


declare module Blockly {

    class Block extends Block__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Block__Class implements Blockly.IASTNodeLocation  { 
    
            /**
             * Class for one block.
             * Not normally called directly, workspace.newBlock() is preferred.
             * @param {!Blockly.Workspace} workspace The block's workspace.
             * @param {?string} prototypeName Name of the language object containing
             *     type-specific functions for this block.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @constructor
             * @implements {Blockly.IASTNodeLocation}
             * @throws When block is not valid or block name is not allowed.
             */
            constructor(workspace: Blockly.Workspace, prototypeName: string, opt_id?: string);
    
            /** @type {string} */
            id: string;
    
            /** @type {Blockly.Connection} */
            outputConnection: Blockly.Connection;
    
            /** @type {Blockly.Connection} */
            nextConnection: Blockly.Connection;
    
            /** @type {Blockly.Connection} */
            previousConnection: Blockly.Connection;
    
            /** @type {!Array.<!Blockly.Input>} */
            inputList: Blockly.Input[];
    
            /** @type {boolean|undefined} */
            inputsInline: boolean|any /*undefined*/;
    
            /** @type {string|!Function} */
            tooltip: string|Function;
    
            /** @type {boolean} */
            contextMenu: boolean;
    
            /**
             * @type {Blockly.Block}
             * @protected
             */
            parentBlock_: Blockly.Block;
    
            /**
             * @type {!Array.<!Blockly.Block>}
             * @protected
             */
            childBlocks_: Blockly.Block[];
    
            /**
             * @type {boolean}
             * @protected
             */
            collapsed_: boolean;
    
            /**
             * @type {?number}
             * @protected
             */
            outputShape_: number;
    
            /**
             * A string representing the comment attached to this block.
             * @type {string|Blockly.Comment}
             * @deprecated August 2019. Use getCommentText instead.
             */
            comment: string|Blockly.Comment;
    
            /**
             * A model of the comment attached to this block.
             * @type {!Blockly.Block.CommentModel}
             * @package
             */
            commentModel: Blockly.Block.CommentModel;
    
            /** @type {!Blockly.Workspace} */
            workspace: Blockly.Workspace;
    
            /** @type {boolean} */
            isInFlyout: boolean;
    
            /** @type {boolean} */
            isInMutator: boolean;
    
            /** @type {boolean} */
            RTL: boolean;
    
            /**
             * True if this block is an insertion marker.
             * @type {boolean}
             * @protected
             */
            isInsertionMarker_: boolean;
    
            /**
             * Name of the type of hat.
             * @type {string|undefined}
             */
            hat: string|any /*undefined*/;
    
            /** @type {?boolean} */
            rendered: boolean;
    
            /**
             * A count of statement inputs on the block.
             * @type {number}
             * @package
             */
            statementInputCount: number;
    
            /** @type {string} */
            type: string;
    
            /** @type {boolean|undefined} */
            inputsInlineDefault: boolean|any /*undefined*/;
    
            /**
             * Optional text data that round-trips between blocks and XML.
             * Has no effect. May be used by 3rd parties for meta information.
             * @type {?string}
             */
            data: string;
    
            /**
             * Has this block been disposed of?
             * @type {boolean}
             * @package
             */
            disposed: boolean;
    
            /**
             * Colour of the block in '#RRGGBB' format.
             * @type {string}
             * @protected
             */
            colour_: string;
    
            /**
             * Name of the block style.
             * @type {?string}
             * @protected
             */
            styleName_: string;
    
            /**
             * An optional method called during initialization.
             * @type {?function()}
             */
            init: { (): any /*missing*/ };
    
            /**
             * An optional callback method to use whenever the block's parent workspace
             * changes. This is usually only called from the constructor, the block type
             * initializer function, or an extension initializer function.
             * @type {?function(Blockly.Events.Abstract)}
             */
            onchange: { (_0: Blockly.Events.Abstract): any /*missing*/ };
    
            /**
             * An optional serialization method for defining how to serialize the
             * mutation state. This must be coupled with defining `domToMutation`.
             * @type {?function(...):!Element}
             */
            mutationToDom: any /*missing*/;
    
            /**
             * An optional deserialization method for defining how to deserialize the
             * mutation state. This must be coupled with defining `mutationToDom`.
             * @type {?function(!Element)}
             */
            domToMutation: { (_0: Element): any /*missing*/ };
    
            /**
             * An optional property for suppressing adding STATEMENT_PREFIX and
             * STATEMENT_SUFFIX to generated code.
             * @type {?boolean}
             */
            suppressPrefixSuffix: boolean;
    
            /**
             * An optional property for declaring developer variables.  Return a list of
             * variable names for use by generators.  Developer variables are never shown to
             * the user, but are declared as global variables in the generated code.
             * @type {?function():!Array.<string>}
             */
            getDeveloperVariables: { (): string[] };
    
            /**
             * Dispose of this block.
             * @param {boolean} healStack If true, then try to heal any gap by connecting
             *     the next statement with the previous statement.  Otherwise, dispose of
             *     all children of this block.
             * @suppress {checkTypes}
             */
            dispose(healStack: boolean): void;
    
            /**
             * Call initModel on all fields on the block.
             * May be called more than once.
             * Either initModel or initSvg must be called after creating a block and before
             * the first interaction with it.  Interactions include UI actions
             * (e.g. clicking and dragging) and firing events (e.g. create, delete, and
             * change).
             * @public
             */
            initModel(): void;
    
            /**
             * Unplug this block from its superior block.  If this block is a statement,
             * optionally reconnect the block underneath with the block on top.
             * @param {boolean=} opt_healStack Disconnect child statement and reconnect
             *   stack.  Defaults to false.
             */
            unplug(opt_healStack?: boolean): void;
    
            /**
             * Returns all connections originating from this block.
             * @param {boolean} _all If true, return all connections even hidden ones.
             * @return {!Array.<!Blockly.Connection>} Array of connections.
             * @package
             */
            getConnections_(_all: boolean): Blockly.Connection[];
    
            /**
             * Walks down a stack of blocks and finds the last next connection on the stack.
             * @return {Blockly.Connection} The last next connection on the stack, or null.
             * @package
             */
            lastConnectionInStack(): Blockly.Connection;
    
            /**
             * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
             * connected should not coincidentally line up on screen.
             */
            bumpNeighbours(): void;
    
            /**
             * Return the parent block or null if this block is at the top level. The parent
             * block is either the block connected to the previous connection (for a statement
             * block) or the block connected to the output connection (for a value block).
             * @return {Blockly.Block} The block that holds the current block.
             */
            getParent(): Blockly.Block;
    
            /**
             * Return the input that connects to the specified block.
             * @param {!Blockly.Block} block A block connected to an input on this block.
             * @return {Blockly.Input} The input that connects to the specified block.
             */
            getInputWithBlock(block: Blockly.Block): Blockly.Input;
    
            /**
             * Return the parent block that surrounds the current block, or null if this
             * block has no surrounding block.  A parent block might just be the previous
             * statement, whereas the surrounding block is an if statement, while loop, etc.
             * @return {Blockly.Block} The block that surrounds the current block.
             */
            getSurroundParent(): Blockly.Block;
    
            /**
             * Return the next statement block directly connected to this block.
             * @return {Blockly.Block} The next statement block or null.
             */
            getNextBlock(): Blockly.Block;
    
            /**
             * Returns the block connected to the previous connection.
             * @return {Blockly.Block} The previous statement block or null.
             */
            getPreviousBlock(): Blockly.Block;
    
            /**
             * Return the connection on the first statement input on this block, or null if
             * there are none.
             * @return {Blockly.Connection} The first statement connection or null.
             * @package
             */
            getFirstStatementConnection(): Blockly.Connection;
    
            /**
             * Return the top-most block in this block's tree.
             * This will return itself if this block is at the top level.
             * @return {!Blockly.Block} The root block.
             */
            getRootBlock(): Blockly.Block;
    
            /**
             * Walk up from the given block up through the stack of blocks to find
             * the top block of the sub stack. If we are nested in a statement input only
             * find the top-most nested block. Do not go all the way to the root block.
             * @return {!Blockly.Block} The top block in a stack.
             * @package
             */
            getTopStackBlock(): Blockly.Block;
    
            /**
             * Find all the blocks that are directly nested inside this one.
             * Includes value and statement inputs, as well as any following statement.
             * Excludes any connection on an output tab or any preceding statement.
             * Blocks are optionally sorted by position; top to bottom.
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.Block>} Array of blocks.
             */
            getChildren(ordered: boolean): Blockly.Block[];
    
            /**
             * Set parent of this block to be a new block or null.
             * @param {Blockly.Block} newParent New parent block.
             */
            setParent(newParent: Blockly.Block): void;
    
            /**
             * Find all the blocks that are directly or indirectly nested inside this one.
             * Includes this block in the list.
             * Includes value and statement inputs, as well as any following statements.
             * Excludes any connection on an output tab or any preceding statements.
             * Blocks are optionally sorted by position; top to bottom.
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
             */
            getDescendants(ordered: boolean): Blockly.Block[];
    
            /**
             * Get whether this block is deletable or not.
             * @return {boolean} True if deletable.
             */
            isDeletable(): boolean;
    
            /**
             * Set whether this block is deletable or not.
             * @param {boolean} deletable True if deletable.
             */
            setDeletable(deletable: boolean): void;
    
            /**
             * Get whether this block is movable or not.
             * @return {boolean} True if movable.
             */
            isMovable(): boolean;
    
            /**
             * Set whether this block is movable or not.
             * @param {boolean} movable True if movable.
             */
            setMovable(movable: boolean): void;
    
            /**
             * Get whether is block is duplicatable or not. If duplicating this block and
             * descendants will put this block over the workspace's capacity this block is
             * not duplicatable. If duplicating this block and descendants will put any
             * type over their maxInstances this block is not duplicatable.
             * @return {boolean} True if duplicatable.
             */
            isDuplicatable(): boolean;
    
            /**
             * Get whether this block is a shadow block or not.
             * @return {boolean} True if a shadow.
             */
            isShadow(): boolean;
    
            /**
             * Set whether this block is a shadow block or not.
             * @param {boolean} shadow True if a shadow.
             */
            setShadow(shadow: boolean): void;
    
            /**
             * Get whether this block is an insertion marker block or not.
             * @return {boolean} True if an insertion marker.
             * @package
             */
            isInsertionMarker(): boolean;
    
            /**
             * Set whether this block is an insertion marker block or not.
             * Once set this cannot be unset.
             * @param {boolean} insertionMarker True if an insertion marker.
             * @package
             */
            setInsertionMarker(insertionMarker: boolean): void;
    
            /**
             * Get whether this block is editable or not.
             * @return {boolean} True if editable.
             */
            isEditable(): boolean;
    
            /**
             * Set whether this block is editable or not.
             * @param {boolean} editable True if editable.
             */
            setEditable(editable: boolean): void;
    
            /**
             * Returns if this block has been disposed of / deleted.
             * @return {boolean} True if this block has been disposed of / deleted.
             */
            isDisposed(): boolean;
    
            /**
             * Find the connection on this block that corresponds to the given connection
             * on the other block.
             * Used to match connections between a block and its insertion marker.
             * @param {!Blockly.Block} otherBlock The other block to match against.
             * @param {!Blockly.Connection} conn The other connection to match.
             * @return {Blockly.Connection} The matching connection on this block, or null.
             * @package
             */
            getMatchingConnection(otherBlock: Blockly.Block, conn: Blockly.Connection): Blockly.Connection;
    
            /**
             * Set the URL of this block's help page.
             * @param {string|Function} url URL string for block help, or function that
             *     returns a URL.  Null for no help.
             */
            setHelpUrl(url: string|Function): void;
    
            /**
             * Change the tooltip text for a block.
             * @param {string|!Function} newTip Text for tooltip or a parent element to
             *     link to for its tooltip.  May be a function that returns a string.
             */
            setTooltip(newTip: string|Function): void;
    
            /**
             * Get the colour of a block.
             * @return {string} #RRGGBB string.
             */
            getColour(): string;
    
            /**
             * Get the name of the block style.
             * @return {?string} Name of the block style.
             */
            getStyleName(): string;
    
            /**
             * Get the HSV hue value of a block.  Null if hue not set.
             * @return {?number} Hue value (0-360).
             */
            getHue(): number;
    
            /**
             * Change the colour of a block.
             * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
             *     or a message reference string pointing to one of those two values.
             */
            setColour(colour: number|string): void;
    
            /**
             * Set the style and colour values of a block.
             * @param {string} blockStyleName Name of the block style
             */
            setStyle(blockStyleName: string): void;
    
            /**
             * Sets a callback function to use whenever the block's parent workspace
             * changes, replacing any prior onchange handler. This is usually only called
             * from the constructor, the block type initializer function, or an extension
             * initializer function.
             * @param {function(Blockly.Events.Abstract)} onchangeFn The callback to call
             *     when the block's workspace changes.
             * @throws {Error} if onchangeFn is not falsey and not a function.
             */
            setOnChange(onchangeFn: { (_0: Blockly.Events.Abstract): any /*missing*/ }): void;
    
            /**
             * Returns the named field from a block.
             * @param {string} name The name of the field.
             * @return {Blockly.Field} Named field, or null if field does not exist.
             */
            getField(name: string): Blockly.Field;
    
            /**
             * Return all variables referenced by this block.
             * @return {!Array.<string>} List of variable names.
             */
            getVars(): string[];
    
            /**
             * Return all variables referenced by this block.
             * @return {!Array.<!Blockly.VariableModel>} List of variable models.
             * @package
             */
            getVarModels(): Blockly.VariableModel[];
    
            /**
             * Notification that a variable is renaming but keeping the same ID.  If the
             * variable is in use on this block, rerender to show the new name.
             * @param {!Blockly.VariableModel} variable The variable being renamed.
             * @package
             */
            updateVarName(variable: Blockly.VariableModel): void;
    
            /**
             * Notification that a variable is renaming.
             * If the ID matches one of this block's variables, rename it.
             * @param {string} oldId ID of variable to rename.
             * @param {string} newId ID of new variable.  May be the same as oldId, but with
             *     an updated name.
             */
            renameVarById(oldId: string, newId: string): void;
    
            /**
             * Returns the language-neutral value from the field of a block.
             * @param {string} name The name of the field.
             * @return {*} Value from the field or null if field does not exist.
             */
            getFieldValue(name: string): any;
    
            /**
             * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
             * @param {string} newValue Value to be the new field.
             * @param {string} name The name of the field.
             */
            setFieldValue(newValue: string, name: string): void;
    
            /**
             * Set whether this block can chain onto the bottom of another block.
             * @param {boolean} newBoolean True if there can be a previous statement.
             * @param {(string|Array.<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setPreviousStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether another block can chain onto the bottom of this block.
             * @param {boolean} newBoolean True if there can be a next statement.
             * @param {(string|Array.<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setNextStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether this block returns a value.
             * @param {boolean} newBoolean True if there is an output.
             * @param {(string|Array.<string>|null)=} opt_check Returned type or list
             *     of returned types.  Null or undefined if any type could be returned
             *     (e.g. variable get).
             */
            setOutput(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether value inputs are arranged horizontally or vertically.
             * @param {boolean} newBoolean True if inputs are horizontal.
             */
            setInputsInline(newBoolean: boolean): void;
    
            /**
             * Get whether value inputs are arranged horizontally or vertically.
             * @return {boolean} True if inputs are horizontal.
             */
            getInputsInline(): boolean;
    
            /**
             * Set the block's output shape.
             * @param {?number} outputShape Value representing an output shape.
             */
            setOutputShape(outputShape: number): void;
    
            /**
             * Get the block's output shape.
             * @return {?number} Value representing output shape if one exists.
             */
            getOutputShape(): number;
    
            /**
             * Set whether the block is disabled or not.
             * @param {boolean} disabled True if disabled.
             * @deprecated May 2019
             */
            setDisabled(disabled: boolean): void;
    
            /**
             * Get whether this block is enabled or not.
             * @return {boolean} True if enabled.
             */
            isEnabled(): boolean;
    
            /**
             * Set whether the block is enabled or not.
             * @param {boolean} enabled True if enabled.
             */
            setEnabled(enabled: boolean): void;
    
            /**
             * Get whether the block is disabled or not due to parents.
             * The block's own disabled property is not considered.
             * @return {boolean} True if disabled.
             */
            getInheritedDisabled(): boolean;
    
            /**
             * Get whether the block is collapsed or not.
             * @return {boolean} True if collapsed.
             */
            isCollapsed(): boolean;
    
            /**
             * Set whether the block is collapsed or not.
             * @param {boolean} collapsed True if collapsed.
             */
            setCollapsed(collapsed: boolean): void;
    
            /**
             * Create a human-readable text representation of this block and any children.
             * @param {number=} opt_maxLength Truncate the string to this length.
             * @param {string=} opt_emptyToken The placeholder string used to denote an
             *     empty field. If not specified, '?' is used.
             * @return {string} Text of block.
             */
            toString(opt_maxLength?: number, opt_emptyToken?: string): string;
    
            /**
             * Shortcut for appending a value input row.
             * @param {string} name Language-neutral identifier which may used to find this
             *     input again.  Should be unique to this block.
             * @return {!Blockly.Input} The input object created.
             */
            appendValueInput(name: string): Blockly.Input;
    
            /**
             * Shortcut for appending a statement input row.
             * @param {string} name Language-neutral identifier which may used to find this
             *     input again.  Should be unique to this block.
             * @return {!Blockly.Input} The input object created.
             */
            appendStatementInput(name: string): Blockly.Input;
    
            /**
             * Shortcut for appending a dummy input row.
             * @param {string=} opt_name Language-neutral identifier which may used to find
             *     this input again.  Should be unique to this block.
             * @return {!Blockly.Input} The input object created.
             */
            appendDummyInput(opt_name?: string): Blockly.Input;
    
            /**
             * Initialize this block using a cross-platform, internationalization-friendly
             * JSON description.
             * @param {!Object} json Structured data describing the block.
             */
            jsonInit(json: Object): void;
    
            /**
             * Add key/values from mixinObj to this block object. By default, this method
             * will check that the keys in mixinObj will not overwrite existing values in
             * the block, including prototype values. This provides some insurance against
             * mixin / extension incompatibilities with future block features. This check
             * can be disabled by passing true as the second argument.
             * @param {!Object} mixinObj The key/values pairs to add to this block object.
             * @param {boolean=} opt_disableCheck Option flag to disable overwrite checks.
             */
            mixin(mixinObj: Object, opt_disableCheck?: boolean): void;
    
            /**
             * Add a value input, statement input or local variable to this block.
             * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
             *     Blockly.DUMMY_INPUT.
             * @param {string} name Language-neutral identifier which may used to find this
             *     input again.  Should be unique to this block.
             * @return {!Blockly.Input} The input object created.
             * @protected
             */
            appendInput_(type: number, name: string): Blockly.Input;
    
            /**
             * Move a named input to a different location on this block.
             * @param {string} name The name of the input to move.
             * @param {?string} refName Name of input that should be after the moved input,
             *   or null to be the input at the end.
             */
            moveInputBefore(name: string, refName: string): void;
    
            /**
             * Move a numbered input to a different location on this block.
             * @param {number} inputIndex Index of the input to move.
             * @param {number} refIndex Index of input that should be after the moved input.
             */
            moveNumberedInputBefore(inputIndex: number, refIndex: number): void;
    
            /**
             * Remove an input from this block.
             * @param {string} name The name of the input.
             * @param {boolean=} opt_quiet True to prevent an error if input is not present.
             * @return {boolean} True if operation succeeds, false if input is not present and opt_quiet is true
             * @throws {Error} if the input is not present and opt_quiet is not true.
             */
            removeInput(name: string, opt_quiet?: boolean): boolean;
    
            /**
             * Fetches the named input object.
             * @param {string} name The name of the input.
             * @return {Blockly.Input} The input object, or null if input does not exist.
             */
            getInput(name: string): Blockly.Input;
    
            /**
             * Fetches the block attached to the named input.
             * @param {string} name The name of the input.
             * @return {Blockly.Block} The attached value block, or null if the input is
             *     either disconnected or if the input does not exist.
             */
            getInputTargetBlock(name: string): Blockly.Block;
    
            /**
             * Returns the comment on this block (or null if there is no comment).
             * @return {?string} Block's comment.
             */
            getCommentText(): string;
    
            /**
             * Set this block's comment text.
             * @param {?string} text The text, or null to delete.
             */
            setCommentText(text: string): void;
    
            /**
             * Set this block's warning text.
             * @param {?string} _text The text, or null to delete.
             * @param {string=} _opt_id An optional ID for the warning text to be able to
             *     maintain multiple warnings.
             */
            setWarningText(_text: string, _opt_id?: string): void;
    
            /**
             * Give this block a mutator dialog.
             * @param {Blockly.Mutator} _mutator A mutator dialog instance or null to
             *     remove.
             */
            setMutator(_mutator: Blockly.Mutator): void;
    
            /**
             * Return the coordinates of the top-left corner of this block relative to the
             * drawing surface's origin (0,0), in workspace units.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
             */
            getRelativeToSurfaceXY(): Blockly.utils.Coordinate;
    
            /**
             * Move a block by a relative offset.
             * @param {number} dx Horizontal offset, in workspace units.
             * @param {number} dy Vertical offset, in workspace units.
             */
            moveBy(dx: number, dy: number): void;
    
            /**
             * Create a connection of the specified type.
             * @param {number} type The type of the connection to create.
             * @return {!Blockly.Connection} A new connection of the specified type.
             * @protected
             */
            makeConnection_(type: number): Blockly.Connection;
    
            /**
             * Recursively checks whether all statement and value inputs are filled with
             * blocks. Also checks all following statement blocks in this stack.
             * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
             *     whether shadow blocks are counted as filled. Defaults to true.
             * @return {boolean} True if all inputs are filled, false otherwise.
             */
            allInputsFilled(opt_shadowBlocksAreFilled?: boolean): boolean;
    
            /**
             * This method returns a string describing this Block in developer terms (type
             * name and ID; English only).
             *
             * Intended to on be used in console logs and errors. If you need a string that
             * uses the user's native language (including block text, field values, and
             * child blocks), use [toString()]{@link Blockly.Block#toString}.
             * @return {string} The description.
             */
            toDevString(): string;
    } 
    
}

declare module Blockly.Block {

    /**
     * @typedef {{
     *            text:?string,
     *            pinned:boolean,
     *            size:Blockly.utils.Size
     *          }}
     */
    interface CommentModel {
        text: string;
        pinned: boolean;
        size: Blockly.utils.Size
    }

    /**
     * The language-neutral id given to the collapsed input.
     * @const {string}
     */
    var COLLAPSED_INPUT_NAME: any /*missing*/;

    /**
     * The language-neutral id given to the collapsed field.
     * @const {string}
     */
    var COLLAPSED_FIELD_NAME: any /*missing*/;
}


declare module Blockly.blockAnimations {

    /**
     * Play some UI effects (sound, animation) when disposing of a block.
     * @param {!Blockly.BlockSvg} block The block being disposed of.
     * @package
     */
    function disposeUiEffect(block: Blockly.BlockSvg): void;

    /**
     * Play some UI effects (sound, ripple) after a connection has been established.
     * @param {!Blockly.BlockSvg} block The block being connected.
     * @package
     */
    function connectionUiEffect(block: Blockly.BlockSvg): void;

    /**
     * Play some UI effects (sound, animation) when disconnecting a block.
     * @param {!Blockly.BlockSvg} block The block being disconnected.
     * @package
     */
    function disconnectUiEffect(block: Blockly.BlockSvg): void;

    /**
     * Stop the disconnect UI animation immediately.
     * @package
     */
    function disconnectUiStop(): void;
}


declare module Blockly {

    class BlockDragSurfaceSvg extends BlockDragSurfaceSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockDragSurfaceSvg__Class  { 
    
            /**
             * Class for a drag surface for the currently dragged block. This is a separate
             * SVG that contains only the currently moving block, or nothing.
             * @param {!Element} container Containing element.
             * @constructor
             */
            constructor(container: Element);
    
            /**
             * Create the drag surface and inject it into the container.
             */
            createDom(): void;
    
            /**
             * Set the SVG blocks on the drag surface's group and show the surface.
             * Only one block group should be on the drag surface at a time.
             * @param {!SVGElement} blocks Block or group of blocks to place on the drag
             * surface.
             */
            setBlocksAndShow(blocks: SVGElement): void;
    
            /**
             * Translate and scale the entire drag surface group to the given position, to
             * keep in sync with the workspace.
             * @param {number} x X translation in workspace coordinates.
             * @param {number} y Y translation in workspace coordinates.
             * @param {number} scale Scale of the group.
             */
            translateAndScaleGroup(x: number, y: number, scale: number): void;
    
            /**
             * Translate the entire drag surface during a drag.
             * We translate the drag surface instead of the blocks inside the surface
             * so that the browser avoids repainting the SVG.
             * Because of this, the drag coordinates must be adjusted by scale.
             * @param {number} x X translation for the entire surface.
             * @param {number} y Y translation for the entire surface.
             */
            translateSurface(x: number, y: number): void;
    
            /**
             * Reports the surface translation in scaled workspace coordinates.
             * Use this when finishing a drag to return blocks to the correct position.
             * @return {!Blockly.utils.Coordinate} Current translation of the surface.
             */
            getSurfaceTranslation(): Blockly.utils.Coordinate;
    
            /**
             * Provide a reference to the drag group (primarily for
             * BlockSvg.getRelativeToSurfaceXY).
             * @return {SVGElement} Drag surface group element.
             */
            getGroup(): SVGElement;
    
            /**
             * Get the current blocks on the drag surface, if any (primarily
             * for BlockSvg.getRelativeToSurfaceXY).
             * @return {Element} Drag surface block DOM element, or undefined if no blocks
             * exist.
             */
            getCurrentBlock(): Element;
    
            /**
             * Clear the group and hide the surface; move the blocks off onto the provided
             * element.
             * If the block is being deleted it doesn't need to go back to the original
             * surface, since it would be removed immediately during dispose.
             * @param {Element=} opt_newSurface Surface the dragging blocks should be moved
             *     to, or null if the blocks should be removed from this surface without
             *     being moved to a different surface.
             */
            clearAndHide(opt_newSurface?: Element): void;
    } 
    
}


declare module Blockly {

    class BlockDragger extends BlockDragger__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockDragger__Class  { 
    
            /**
             * Class for a block dragger.  It moves blocks around the workspace when they
             * are being dragged by a mouse or touch.
             * @param {!Blockly.BlockSvg} block The block to drag.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
             * @constructor
             */
            constructor(block: Blockly.BlockSvg, workspace: Blockly.WorkspaceSvg);
    
            /**
             * Sever all links from this object.
             * @package
             */
            dispose(): void;
    
            /**
             * Start dragging a block.  This includes moving it to the drag surface.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at mouse down, in pixel units.
             * @param {boolean} healStack Whether or not to heal the stack after
             *     disconnecting.
             * @package
             */
            startBlockDrag(currentDragDeltaXY: Blockly.utils.Coordinate, healStack: boolean): void;
    
            /**
             * Execute a step of block dragging, based on the given event.  Update the
             * display accordingly.
             * @param {!Event} e The most recent move event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @package
             */
            dragBlock(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Finish a block drag and put the block back on the workspace.
             * @param {!Event} e The mouseup/touchend event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @package
             */
            endBlockDrag(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
             * or 2 insertion markers.
             * @return {!Array.<!Blockly.BlockSvg>} A possibly empty list of insertion
             *     marker blocks.
             * @package
             */
            getInsertionMarkers(): Blockly.BlockSvg[];
    } 
    
}


declare module Blockly.Events {

    class BlockBase extends BlockBase__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockBase__Class extends Blockly.Events.Abstract__Class  { 
    
            /**
             * Abstract class for a block event.
             * @param {Blockly.Block} block The block this event corresponds to.
             * @extends {Blockly.Events.Abstract}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * The block id for the block this event pertains to
             * @type {string}
             */
            blockId: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    } 
    

    class Change extends Change__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Change__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block change event.
             * @param {Blockly.Block} block The changed block.  Null for a blank event.
             * @param {string} element One of 'field', 'comment', 'disabled', etc.
             * @param {?string} name Name of input or field affected, or null.
             * @param {*} oldValue Previous value of element.
             * @param {*} newValue New value of element.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block, element: string, name: string, oldValue: any, newValue: any);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Does this event record any change of state?
             * @return {boolean} False if something changed.
             */
            isNull(): boolean;
    
            /**
             * Run a change event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class BlockChange extends BlockChange__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockChange__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block change event.
             * @param {Blockly.Block} block The changed block.  Null for a blank event.
             * @param {string} element One of 'field', 'comment', 'disabled', etc.
             * @param {?string} name Name of input or field affected, or null.
             * @param {*} oldValue Previous value of element.
             * @param {*} newValue New value of element.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block, element: string, name: string, oldValue: any, newValue: any);
    } 
    

    class Create extends Create__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Create__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block creation event.
             * @param {Blockly.Block} block The created block.  Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a creation event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class BlockCreate extends BlockCreate__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockCreate__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block creation event.
             * @param {Blockly.Block} block The created block. Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    } 
    

    class Delete extends Delete__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Delete__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block deletion event.
             * @param {Blockly.Block} block The deleted block.  Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a deletion event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class BlockDelete extends BlockDelete__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockDelete__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block deletion event.
             * @param {Blockly.Block} block The deleted block.  Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    } 
    

    class Move extends Move__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Move__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block move event.  Created before the move.
             * @param {Blockly.Block} block The moved block.  Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Record the block's new location.  Called after the move.
             */
            recordNew(): void;
    
            /**
             * Does this event record any change of state?
             * @return {boolean} False if something changed.
             */
            isNull(): boolean;
    
            /**
             * Run a move event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class BlockMove extends BlockMove__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockMove__Class extends Blockly.Events.BlockBase__Class  { 
    
            /**
             * Class for a block move event.  Created before the move.
             * @param {Blockly.Block} block The moved block.  Null for a blank event.
             * @extends {Blockly.Events.BlockBase}
             * @constructor
             */
            constructor(block: Blockly.Block);
    } 
    
}


declare module Blockly {

    class BlockSvg extends BlockSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockSvg__Class extends Blockly.Block__Class implements Blockly.IASTNodeLocationSvg, Blockly.IBoundedElement, Blockly.ICopyable  { 
    
            /**
             * Class for a block's SVG representation.
             * Not normally called directly, workspace.newBlock() is preferred.
             * @param {!Blockly.WorkspaceSvg} workspace The block's workspace.
             * @param {?string} prototypeName Name of the language object containing
             *     type-specific functions for this block.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @extends {Blockly.Block}
             * @implements {Blockly.IASTNodeLocationSvg}
             * @implements {Blockly.IBoundedElement}
             * @implements {Blockly.ICopyable}
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, prototypeName: string, opt_id?: string);
    
            /**
             * A block style object.
             * @type {!Blockly.Theme.BlockStyle}
             */
            style: Blockly.Theme.BlockStyle;
    
            /**
             * The renderer's path object.
             * @type {Blockly.blockRendering.IPathObject}
             * @package
             */
            pathObject: Blockly.blockRendering.IPathObject;
    
            /** @type {boolean} */
            rendered: boolean;
    
            /** @type {!Blockly.WorkspaceSvg} */
            workspace: Blockly.WorkspaceSvg;
    
            /** @type {Blockly.RenderedConnection} */
            outputConnection: Blockly.RenderedConnection;
    
            /** @type {Blockly.RenderedConnection} */
            nextConnection: Blockly.RenderedConnection;
    
            /** @type {Blockly.RenderedConnection} */
            previousConnection: Blockly.RenderedConnection;
    
            /**
             * Height of this block, not including any statement blocks above or below.
             * Height is in workspace units.
             */
            height: any /*missing*/;
    
            /**
             * Width of this block, including any connected value blocks.
             * Width is in workspace units.
             */
            width: any /*missing*/;
    
            /**
             * An optional method called when a mutator dialog is first opened.
             * This function must create and initialize a top-level block for the mutator
             * dialog, and return it. This function should also populate this top-level
             * block with any sub-blocks which are appropriate. This method must also be
             * coupled with defining a `compose` method for the default mutation dialog
             * button and UI to appear.
             * @type {?function(Blockly.WorkspaceSvg):!Blockly.BlockSvg}
             */
            decompose: { (_0: Blockly.WorkspaceSvg): Blockly.BlockSvg };
    
            /**
             * An optional method called when a mutator dialog saves its content.
             * This function is called to modify the original block according to new
             * settings. This method must also be coupled with defining a `decompose`
             * method for the default mutation dialog button and UI to appear.
             * @type {?function(!Blockly.BlockSvg)}
             */
            compose: { (_0: Blockly.BlockSvg): any /*missing*/ };
    
            /**
             * An optional method for defining custom block context menu items.
             * @type {?function(!Array.<!Object>)}
             */
            customContextMenu: { (_0: Object[]): any /*missing*/ };
    
            /**
             * An property used internally to reference the block's rendering debugger.
             * @type {?Blockly.blockRendering.Debug}
             * @package
             */
            renderingDebugger: Blockly.blockRendering.Debug;
    
            /**
             * Create and initialize the SVG representation of the block.
             * May be called more than once.
             */
            initSvg(): void;
    
            /**
             * Get the secondary colour of a block.
             * @return {?string} #RRGGBB string.
             */
            getColourSecondary(): string;
    
            /**
             * Get the tertiary colour of a block.
             * @return {?string} #RRGGBB string.
             */
            getColourTertiary(): string;
    
            /**
             * Get the shadow colour of a block.
             * @return {?string} #RRGGBB string.
             * @deprecated Use style.colourSecondary. (2020 January 21)
             */
            getColourShadow(): string;
    
            /**
             * Get the border colour(s) of a block.
             * @return {{colourDark, colourLight, colourBorder}} An object containing
             *     colour values for the border(s) of the block. If the block is using a
             *     style the colourBorder will be defined and equal to the tertiary colour
             *     of the style (#RRGGBB string). Otherwise the colourDark and colourLight
             *     attributes will be defined (#RRGGBB strings).
             * @deprecated Use style.colourTertiary. (2020 January 21)
             */
            getColourBorder(): { colourDark: any /*missing*/; colourLight: any /*missing*/; colourBorder: any /*missing*/ };
    
            /**
             * Select this block.  Highlight it visually.
             */
            select(): void;
    
            /**
             * Unselect this block.  Remove its highlighting.
             */
            unselect(): void;
    
            /**
             * Block's mutator icon (if any).
             * @type {Blockly.Mutator}
             */
            mutator: Blockly.Mutator;
    
            /**
             * Block's comment icon (if any).
             * @type {Blockly.Comment}
             * @deprecated August 2019. Use getCommentIcon instead.
             */
            comment: Blockly.Comment;
    
            /**
             * Block's warning icon (if any).
             * @type {Blockly.Warning}
             */
            warning: Blockly.Warning;
    
            /**
             * Returns a list of mutator, comment, and warning icons.
             * @return {!Array} List of icons.
             */
            getIcons(): any[];
    
            /**
             * Return the coordinates of the top-left corner of this block relative to the
             * drawing surface's origin (0,0), in workspace units.
             * If the block is on the workspace, (0, 0) is the origin of the workspace
             * coordinate system.
             * This does not change with workspace scale.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties in
             *     workspace coordinates.
             */
            getRelativeToSurfaceXY(): Blockly.utils.Coordinate;
    
            /**
             * Move a block by a relative offset.
             * @param {number} dx Horizontal offset in workspace units.
             * @param {number} dy Vertical offset in workspace units.
             */
            moveBy(dx: number, dy: number): void;
    
            /**
             * Transforms a block by setting the translation on the transform attribute
             * of the block's SVG.
             * @param {number} x The x coordinate of the translation in workspace units.
             * @param {number} y The y coordinate of the translation in workspace units.
             */
            translate(x: number, y: number): void;
    
            /**
             * Move this block to its workspace's drag surface, accounting for positioning.
             * Generally should be called at the same time as setDragging_(true).
             * Does nothing if useDragSurface_ is false.
             * @package
             */
            moveToDragSurface(): void;
    
            /**
             * Move a block to a position.
             * @param {Blockly.utils.Coordinate} xy The position to move to in workspace units.
             */
            moveTo(xy: Blockly.utils.Coordinate): void;
    
            /**
             * Move this block back to the workspace block canvas.
             * Generally should be called at the same time as setDragging_(false).
             * Does nothing if useDragSurface_ is false.
             * @param {!Blockly.utils.Coordinate} newXY The position the block should take on
             *     on the workspace canvas, in workspace coordinates.
             * @package
             */
            moveOffDragSurface(newXY: Blockly.utils.Coordinate): void;
    
            /**
             * Move this block during a drag, taking into account whether we are using a
             * drag surface to translate blocks.
             * This block must be a top-level block.
             * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
             *     workspace coordinates.
             * @package
             */
            moveDuringDrag(newLoc: Blockly.utils.Coordinate): void;
    
            /**
             * Snap this block to the nearest grid point.
             */
            snapToGrid(): void;
    
            /**
             * Returns the coordinates of a bounding box describing the dimensions of this
             * block and any blocks stacked below it.
             * Coordinate system: workspace coordinates.
             * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
             */
            getBoundingRectangle(): Blockly.utils.Rect;
    
            /**
             * Notify every input on this block to mark its fields as dirty.
             * A dirty field is a field that needs to be re-rendered.
             */
            markDirty(): void;
    
            /**
             * Set whether the block is collapsed or not.
             * @param {boolean} collapsed True if collapsed.
             */
            setCollapsed(collapsed: boolean): void;
    
            /**
             * Open the next (or previous) FieldTextInput.
             * @param {!Blockly.Field} start Current field.
             * @param {boolean} forward If true go forward, otherwise backward.
             */
            tab(start: Blockly.Field, forward: boolean): void;
    
            /**
             * Load the block's help page in a new window.
             * @package
             */
            showHelp(): void;
    
            /**
             * Generate the context menu for this block.
             * @protected
             * @return {Array.<!Object>} Context menu options
             */
            generateContextMenu(): Object[];
    
            /**
             * Show the context menu for this block.
             * @param {!Event} e Mouse event.
             * @package
             */
            showContextMenu(e: Event): void;
    
            /**
             * Move the connections for this block and all blocks attached under it.
             * Also update any attached bubbles.
             * @param {number} dx Horizontal offset from current location, in workspace
             *     units.
             * @param {number} dy Vertical offset from current location, in workspace
             *     units.
             * @package
             */
            moveConnections(dx: number, dy: number): void;
    
            /**
             * Recursively adds or removes the dragging class to this node and its children.
             * @param {boolean} adding True if adding, false if removing.
             * @package
             */
            setDragging(adding: boolean): void;
    
            /**
             * Set whether this block is movable or not.
             * @param {boolean} movable True if movable.
             */
            setMovable(movable: boolean): void;
    
            /**
             * Set whether this block is editable or not.
             * @param {boolean} editable True if editable.
             */
            setEditable(editable: boolean): void;
    
            /**
             * Set whether this block is a shadow block or not.
             * @param {boolean} shadow True if a shadow.
             */
            setShadow(shadow: boolean): void;
    
            /**
             * Set whether this block is an insertion marker block or not.
             * Once set this cannot be unset.
             * @param {boolean} insertionMarker True if an insertion marker.
             * @package
             */
            setInsertionMarker(insertionMarker: boolean): void;
    
            /**
             * Return the root node of the SVG or null if none exists.
             * @return {!SVGGElement} The root SVG node (probably a group).
             */
            getSvgRoot(): SVGGElement;
    
            /**
             * Dispose of this block.
             * @param {boolean=} healStack If true, then try to heal any gap by connecting
             *     the next statement with the previous statement.  Otherwise, dispose of
             *     all children of this block.
             * @param {boolean=} animate If true, show a disposal animation and sound.
             * @suppress {checkTypes}
             */
            dispose(healStack?: boolean, animate?: boolean): void;
    
            /**
             * Encode a block for copying.
             * @return {!Blockly.ICopyable.CopyData} Copy metadata.
             * @package
             */
            toCopyData(): Blockly.ICopyable.CopyData;
    
            /**
             * Change the colour of a block.
             * @package
             */
            applyColour(): void;
    
            /**
             * Enable or disable a block.
             */
            updateDisabled(): void;
    
            /**
             * Get the comment icon attached to this block, or null if the block has no
             * comment.
             * @return {Blockly.Comment} The comment icon attached to this block, or null.
             */
            getCommentIcon(): Blockly.Comment;
    
            /**
             * Set this block's comment text.
             * @param {?string} text The text, or null to delete.
             */
            setCommentText(text: string): void;
    
            /**
             * Set this block's warning text.
             * @param {?string} text The text, or null to delete.
             * @param {string=} opt_id An optional ID for the warning text to be able to
             *     maintain multiple warnings.
             */
            setWarningText(text: string, opt_id?: string): void;
    
            /**
             * Give this block a mutator dialog.
             * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
             */
            setMutator(mutator: Blockly.Mutator): void;
    
            /**
             * Set whether the block is disabled or not.
             * @param {boolean} disabled True if disabled.
             * @deprecated May 2019
             */
            setDisabled(disabled: boolean): void;
    
            /**
             * Set whether the block is enabled or not.
             * @param {boolean} enabled True if enabled.
             */
            setEnabled(enabled: boolean): void;
    
            /**
             * Set whether the block is highlighted or not.  Block highlighting is
             * often used to visually mark blocks currently being executed.
             * @param {boolean} highlighted True if highlighted.
             */
            setHighlighted(highlighted: boolean): void;
    
            /**
             * Select this block.  Highlight it visually.
             */
            addSelect(): void;
    
            /**
             * Unselect this block.  Remove its highlighting.
             */
            removeSelect(): void;
    
            /**
             * Update the cursor over this block by adding or removing a class.
             * @param {boolean} enable True if the delete cursor should be shown, false
             *     otherwise.
             * @package
             */
            setDeleteStyle(enable: boolean): void;
    
            /**
             * Get the colour of a block.
             * @return {string} #RRGGBB string.
             */
            getColour(): string;
    
            /**
             * Change the colour of a block.
             * @param {number|string} colour HSV hue value, or #RRGGBB string.
             */
            setColour(colour: number|string): void;
    
            /**
             * Set the style and colour values of a block.
             * @param {string} blockStyleName Name of the block style
             * @throws {Error} if the block style does not exist.
             */
            setStyle(blockStyleName: string): void;
    
            /**
             * Move this block to the front of the visible workspace.
             * <g> tags do not respect z-index so SVG renders them in the
             * order that they are in the DOM.  By placing this block first within the
             * block group's <g>, it will render on top of any other blocks.
             * @package
             */
            bringToFront(): void;
    
            /**
             * Set whether this block can chain onto the bottom of another block.
             * @param {boolean} newBoolean True if there can be a previous statement.
             * @param {(string|Array.<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setPreviousStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether another block can chain onto the bottom of this block.
             * @param {boolean} newBoolean True if there can be a next statement.
             * @param {(string|Array.<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setNextStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether this block returns a value.
             * @param {boolean} newBoolean True if there is an output.
             * @param {(string|Array.<string>|null)=} opt_check Returned type or list
             *     of returned types.  Null or undefined if any type could be returned
             *     (e.g. variable get).
             */
            setOutput(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether value inputs are arranged horizontally or vertically.
             * @param {boolean} newBoolean True if inputs are horizontal.
             */
            setInputsInline(newBoolean: boolean): void;
    
            /**
             * Remove an input from this block.
             * @param {string} name The name of the input.
             * @param {boolean=} opt_quiet True to prevent error if input is not present.
             * @return {boolean} True if operation succeeds, false if input is not present and opt_quiet is true
             * @throws {Error} if the input is not present and
             *     opt_quiet is not true.
             */
            removeInput(name: string, opt_quiet?: boolean): boolean;
    
            /**
             * Move a numbered input to a different location on this block.
             * @param {number} inputIndex Index of the input to move.
             * @param {number} refIndex Index of input that should be after the moved input.
             */
            moveNumberedInputBefore(inputIndex: number, refIndex: number): void;
    
            /**
             * Sets whether this block's connections are tracked in the database or not.
             *
             * Used by the deserializer to be more efficient. Setting a connection's
             * tracked_ value to false keeps it from adding itself to the db when it
             * gets its first moveTo call, saving expensive ops for later.
             * @param {boolean} track If true, start tracking. If false, stop tracking.
             * @package
             */
            setConnectionTracking(track: boolean): void;
    
            /**
             * Returns connections originating from this block.
             * @param {boolean} all If true, return all connections even hidden ones.
             *     Otherwise, for a non-rendered block return an empty list, and for a
             *     collapsed block don't return inputs connections.
             * @return {!Array.<!Blockly.RenderedConnection>} Array of connections.
             * @package
             */
            getConnections_(all: boolean): Blockly.RenderedConnection[];
    
            /**
             * Create a connection of the specified type.
             * @param {number} type The type of the connection to create.
             * @return {!Blockly.RenderedConnection} A new connection of the specified type.
             * @protected
             */
            makeConnection_(type: number): Blockly.RenderedConnection;
    
            /**
             * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
             * connected should not coincidentally line up on screen.
             */
            bumpNeighbours(): void;
    
            /**
             * Schedule snapping to grid and bumping neighbours to occur after a brief
             * delay.
             * @package
             */
            scheduleSnapAndBump(): void;
    
            /**
             * Position a block so that it doesn't move the target block when connected.
             * The block to position is usually either the first block in a dragged stack or
             * an insertion marker.
             * @param {!Blockly.RenderedConnection} sourceConnection The connection on the
             *     moving block's stack.
             * @param {!Blockly.RenderedConnection} targetConnection The connection that
             *     should stay stationary as this block is positioned.
             * @package
             */
            positionNearConnection(sourceConnection: Blockly.RenderedConnection, targetConnection: Blockly.RenderedConnection): void;
    
            /**
             * Lays out and reflows a block based on its contents and settings.
             * @param {boolean=} opt_bubble If false, just render this block.
             *   If true, also render block's parent, grandparent, etc.  Defaults to true.
             */
            render(opt_bubble?: boolean): void;
    
            /**
             * Redraw any attached marker or cursor svgs if needed.
             * @protected
             */
            updateMarkers_(): void;
    
            /**
             * Add the cursor svg to this block's svg group.
             * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
             *     block svg group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker svg to this block's svg group.
             * @param {SVGElement} markerSvg The svg root of the marker to be added to the
             *     block svg group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Returns a bounding box describing the dimensions of this block
             * and any blocks stacked below it.
             * @return {!{height: number, width: number}} Object with height and width
             *    properties in workspace units.
             * @package
             */
            getHeightWidth(): { height: number; width: number };
    
            /**
             * Visual effect to show that if the dragging block is dropped, this block will
             * be replaced.  If a shadow block, it will disappear.  Otherwise it will bump.
             * @param {boolean} add True if highlighting should be added.
             * @package
             */
            fadeForReplacement(add: boolean): void;
    
            /**
             * Visual effect to show that if the dragging block is dropped it will connect
             * to this input.
             * @param {Blockly.Connection} conn The connection on the input to highlight.
             * @param {boolean} add True if highlighting should be added.
             * @package
             */
            highlightShapeForInput(conn: Blockly.Connection, add: boolean): void;
    } 
    
}

declare module Blockly.BlockSvg {

    /**
     * Constant for identifying rows that are to be rendered inline.
     * Don't collide with Blockly.INPUT_VALUE and friends.
     * @const
     */
    var INLINE: any /*missing*/;

    /**
     * ID to give the "collapsed warnings" warning. Allows us to remove the
     * "collapsed warnings" warning without removing any warnings that belong to
     * the block.
     * @type {string}
     * @const
     */
    var COLLAPSED_WARNING_ID: string;
}


declare module Blockly {

    /**
     * Blockly core version.
     * This constant is overridden by the build script (build.py) to the value of the version
     * in package.json. This is done during the gen_core build step.
     * For local builds, you can pass --define='Blockly.VERSION=X.Y.Z' to the compiler
     * to override this constant.
     * @define {string}
     */
    var VERSION: any /*missing*/;

    /**
     * The main workspace most recently used.
     * Set by Blockly.WorkspaceSvg.prototype.markFocused
     * @type {Blockly.Workspace}
     */
    var mainWorkspace: Blockly.Workspace;

    /**
     * Currently selected block.
     * @type {?Blockly.ICopyable}
     */
    var selected: Blockly.ICopyable;

    /**
     * All of the connections on blocks that are currently being dragged.
     * @type {!Array.<!Blockly.Connection>}
     * @package
     */
    var draggingConnections: Blockly.Connection[];

    /**
     * Container element to render the WidgetDiv, DropDownDiv and Tooltip.
     * @type {?Element}
     * @package
     */
    var parentContainer: Element;

    /**
     * Blockly opaque event data used to unbind events when using
     * `Blockly.bindEvent_` and `Blockly.bindEventWithChecks_`.
     * @typedef {!Array.<!Array>}
     */
    interface EventData extends Array<any[]> { }

    /**
     * Returns the dimensions of the specified SVG image.
     * @param {!SVGElement} svg SVG image.
     * @return {!Blockly.utils.Size} Contains width and height properties.
     */
    function svgSize(svg: SVGElement): Blockly.utils.Size;

    /**
     * Size the workspace when the contents change.  This also updates
     * scrollbars accordingly.
     * @param {!Blockly.WorkspaceSvg} workspace The workspace to resize.
     */
    function resizeSvgContents(workspace: Blockly.WorkspaceSvg): void;

    /**
     * Size the SVG image to completely fill its container. Call this when the view
     * actually changes sizes (e.g. on a window resize/device orientation change).
     * See Blockly.resizeSvgContents to resize the workspace when the contents
     * change (e.g. when a block is added or removed).
     * Record the height/width of the SVG image.
     * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
     */
    function svgResize(workspace: Blockly.WorkspaceSvg): void;

    /**
     * Handle a key-down on SVG drawing surface. Does nothing if the main workspace
     * is not visible.
     * @param {!KeyboardEvent} e Key down event.
     * @package
     */
    function onKeyDown(e: KeyboardEvent): void;

    /**
     * Duplicate this block and its children, or a workspace comment.
     * @param {!Blockly.ICopyable} toDuplicate Block or Workspace Comment to be
     *     copied.
     * @package
     */
    function duplicate(toDuplicate: Blockly.ICopyable): void;

    /**
     * Close tooltips, context menus, dropdown selections, etc.
     * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
     */
    function hideChaff(opt_allowToolbox?: boolean): void;

    /**
     * Returns the main workspace.  Returns the last used main workspace (based on
     * focus).  Try not to use this function, particularly if there are multiple
     * Blockly instances on a page.
     * @return {!Blockly.Workspace} The main workspace.
     */
    function getMainWorkspace(): Blockly.Workspace;

    /**
     * Wrapper to window.alert() that app developers may override to
     * provide alternatives to the modal browser window.
     * @param {string} message The message to display to the user.
     * @param {function()=} opt_callback The callback when the alert is dismissed.
     */
    function alert(message: string, opt_callback?: { (): any /*missing*/ }): void;

    /**
     * Wrapper to window.confirm() that app developers may override to
     * provide alternatives to the modal browser window.
     * @param {string} message The message to display to the user.
     * @param {!function(boolean)} callback The callback for handling user response.
     */
    function confirm(message: string, callback: { (_0: boolean): any /*missing*/ }): void;

    /**
     * Wrapper to window.prompt() that app developers may override to provide
     * alternatives to the modal browser window. Built-in browser prompts are
     * often used for better text input experience on mobile device. We strongly
     * recommend testing mobile when overriding this.
     * @param {string} message The message to display to the user.
     * @param {string} defaultValue The value to initialize the prompt with.
     * @param {!function(?string)} callback The callback for handling user response.
     */
    function prompt(message: string, defaultValue: string, callback: { (_0: string): any /*missing*/ }): void;

    /**
     * Define blocks from an array of JSON block definitions, as might be generated
     * by the Blockly Developer Tools.
     * @param {!Array.<!Object>} jsonArray An array of JSON block definitions.
     */
    function defineBlocksWithJsonArray(jsonArray: Object[]): void;

    /**
     * Bind an event to a function call.  When calling the function, verifies that
     * it belongs to the touch stream that is currently being processed, and splits
     * multitouch events into multiple events as needed.
     * @param {!EventTarget} node Node upon which to listen.
     * @param {string} name Event name to listen to (e.g. 'mousedown').
     * @param {Object} thisObject The value of 'this' in the function.
     * @param {!Function} func Function to call when event is triggered.
     * @param {boolean=} opt_noCaptureIdentifier True if triggering on this event
     *     should not block execution of other event handlers on this touch or
     *     other simultaneous touches.  False by default.
     * @param {boolean=} opt_noPreventDefault True if triggering on this event
     *     should prevent the default handler.  False by default.  If
     *     opt_noPreventDefault is provided, opt_noCaptureIdentifier must also be
     *     provided.
     * @return {!Blockly.EventData} Opaque data that can be passed to unbindEvent_.
     */
    function bindEventWithChecks_(node: EventTarget, name: string, thisObject: Object, func: Function, opt_noCaptureIdentifier?: boolean, opt_noPreventDefault?: boolean): Blockly.EventData;

    /**
     * Bind an event to a function call.  Handles multitouch events by using the
     * coordinates of the first changed touch, and doesn't do any safety checks for
     * simultaneous event processing.  In most cases prefer is to use
     * `Blockly.bindEventWithChecks_`.
     * @param {!EventTarget} node Node upon which to listen.
     * @param {string} name Event name to listen to (e.g. 'mousedown').
     * @param {Object} thisObject The value of 'this' in the function.
     * @param {!Function} func Function to call when event is triggered.
     * @return {!Blockly.EventData} Opaque data that can be passed to unbindEvent_.
     */
    function bindEvent_(node: EventTarget, name: string, thisObject: Object, func: Function): Blockly.EventData;

    /**
     * Unbind one or more events event from a function call.
     * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.
     *     This list is emptied during the course of calling this function.
     * @return {!Function} The function call.
     */
    function unbindEvent_(bindData: any[][]): Function;

    /**
     * Is the given string a number (includes negative and decimals).
     * @param {string} str Input string.
     * @return {boolean} True if number, false otherwise.
     */
    function isNumber(str: string): boolean;

    /**
     * Convert a hue (HSV model) into an RGB hex triplet.
     * @param {number} hue Hue on a colour wheel (0-360).
     * @return {string} RGB code, e.g. '#5ba65b'.
     */
    function hueToHex(hue: number): string;

    /**
     * Checks old colour constants are not overwritten by the host application.
     * If a constant is overwritten, it prints a console warning directing the
     * developer to use the equivalent Msg constant.
     * @package
     */
    function checkBlockColourConstants(): void;

    /**
     * Set the parent container.  This is the container element that the WidgetDiv,
     * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
     * is called.
     * This method is a NOP if called after the first ``Blockly.inject``.
     * @param {!Element} container The container element.
     */
    function setParentContainer(container: Element): void;
}


declare module Blockly {

    /**
     * A mapping of block type names to block prototype objects.
     * @type {!Object.<string,Object>}
     */
    var Blocks: { [key: string]: Object };
}


declare module Blockly {

    class Bubble extends Bubble__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Bubble__Class  { 
    
            /**
             * Class for UI bubble.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace on which to draw the
             *     bubble.
             * @param {!Element} content SVG content for the bubble.
             * @param {Element} shape SVG element to avoid eclipsing.
             * @param {!Blockly.utils.Coordinate} anchorXY Absolute position of bubble's
             *     anchor point.
             * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
             * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, content: Element, shape: Element, anchorXY: Blockly.utils.Coordinate, bubbleWidth: number, bubbleHeight: number);
    
            /**
             * Describes whether this bubble has been disposed of (nodes and event
             * listeners removed from the page) or not.
             * @type {boolean}
             * @package
             */
            disposed: boolean;
    
            /**
             * Return the root node of the bubble's SVG group.
             * @return {SVGElement} The root SVG node of the bubble's group.
             */
            getSvgRoot(): SVGElement;
    
            /**
             * Expose the block's ID on the bubble's top-level SVG group.
             * @param {string} id ID of block.
             */
            setSvgId(id: string): void;
    
            /**
             * Show the context menu for this bubble.
             * @param {!Event} _e Mouse event.
             * @package
             */
            showContextMenu(_e: Event): void;
    
            /**
             * Get whether this bubble is deletable or not.
             * @return {boolean} True if deletable.
             * @package
             */
            isDeletable(): boolean;
    
            /**
             * Register a function as a callback event for when the bubble is resized.
             * @param {!Function} callback The function to call on resize.
             */
            registerResizeEvent(callback: Function): void;
    
            /**
             * Register a function as a callback event for when the bubble is moved.
             * @param {!Function} callback The function to call on move.
             */
            registerMoveEvent(callback: Function): void;
    
            /**
             * Move this bubble to the top of the stack.
             * @return {boolean} Whether or not the bubble has been moved.
             * @package
             */
            promote(): boolean;
    
            /**
             * Notification that the anchor has moved.
             * Update the arrow and bubble accordingly.
             * @param {!Blockly.utils.Coordinate} xy Absolute location.
             */
            setAnchorLocation(xy: Blockly.utils.Coordinate): void;
    
            /**
             * Move the bubble group to the specified location in workspace coordinates.
             * @param {number} x The x position to move to.
             * @param {number} y The y position to move to.
             * @package
             */
            moveTo(x: number, y: number): void;
    
            /**
             * Triggers a move callback if one exists at the end of a drag.
             * @param {boolean} adding True if adding, false if removing.
             * @package
             */
            setDragging(adding: boolean): void;
    
            /**
             * Get the dimensions of this bubble.
             * @return {!Blockly.utils.Size} The height and width of the bubble.
             */
            getBubbleSize(): Blockly.utils.Size;
    
            /**
             * Size this bubble.
             * @param {number} width Width of the bubble.
             * @param {number} height Height of the bubble.
             */
            setBubbleSize(width: number, height: number): void;
    
            /**
             * Change the colour of a bubble.
             * @param {string} hexColour Hex code of colour.
             */
            setColour(hexColour: string): void;
    
            /**
             * Dispose of this bubble.
             */
            dispose(): void;
    
            /**
             * Move this bubble during a drag, taking into account whether or not there is
             * a drag surface.
             * @param {Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
             *     rendered items during a drag, or null if no drag surface is in use.
             * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
             *     workspace coordinates.
             * @package
             */
            moveDuringDrag(dragSurface: Blockly.BlockDragSurfaceSvg, newLoc: Blockly.utils.Coordinate): void;
    
            /**
             * Return the coordinates of the top-left corner of this bubble's body relative
             * to the drawing surface's origin (0,0), in workspace units.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
             */
            getRelativeToSurfaceXY(): Blockly.utils.Coordinate;
    
            /**
             * Set whether auto-layout of this bubble is enabled.  The first time a bubble
             * is shown it positions itself to not cover any blocks.  Once a user has
             * dragged it to reposition, it renders where the user put it.
             * @param {boolean} enable True if auto-layout should be enabled, false
             *     otherwise.
             * @package
             */
            setAutoLayout(enable: boolean): void;
    } 
    
}

declare module Blockly.Bubble {

    /**
     * Width of the border around the bubble.
     */
    var BORDER_WIDTH: any /*missing*/;

    /**
     * Determines the thickness of the base of the arrow in relation to the size
     * of the bubble.  Higher numbers result in thinner arrows.
     */
    var ARROW_THICKNESS: any /*missing*/;

    /**
     * The number of degrees that the arrow bends counter-clockwise.
     */
    var ARROW_ANGLE: any /*missing*/;

    /**
     * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
     */
    var ARROW_BEND: any /*missing*/;

    /**
     * Distance between arrow point and anchor point.
     */
    var ANCHOR_RADIUS: any /*missing*/;
}


declare module Blockly {

    class BubbleDragger extends BubbleDragger__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BubbleDragger__Class  { 
    
            /**
             * Class for a bubble dragger.  It moves things on the bubble canvas around the
             * workspace when they are being dragged by a mouse or touch.  These can be
             * block comments, mutators, warnings, or workspace comments.
             * @param {!Blockly.Bubble|!Blockly.WorkspaceCommentSvg} bubble The item on the
             *     bubble canvas to drag.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
             * @constructor
             */
            constructor(bubble: Blockly.Bubble|Blockly.WorkspaceCommentSvg, workspace: Blockly.WorkspaceSvg);
    
            /**
             * Sever all links from this object.
             * @package
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Start dragging a bubble.  This includes moving it to the drag surface.
             * @package
             */
            startBubbleDrag(): void;
    
            /**
             * Execute a step of bubble dragging, based on the given event.  Update the
             * display accordingly.
             * @param {!Event} e The most recent move event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @package
             */
            dragBubble(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Finish a bubble drag and put the bubble back on the workspace.
             * @param {!Event} e The mouseup/touchend event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @package
             */
            endBubbleDrag(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    } 
    
}


declare module Blockly {

    class Comment extends Comment__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Comment__Class extends Blockly.Icon__Class  { 
    
            /**
             * Class for a comment.
             * @param {!Blockly.Block} block The block associated with this comment.
             * @extends {Blockly.Icon}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * Draw the comment icon.
             * @param {!Element} group The icon group.
             * @protected
             */
            drawIcon_(group: Element): void;
    
            /**
             * Show or hide the comment bubble.
             * @param {boolean} visible True if the bubble should be visible.
             */
            setVisible(visible: boolean): void;
    
            /**
             * Get the dimensions of this comment's bubble.
             * @return {Blockly.utils.Size} Object with width and height properties.
             */
            getBubbleSize(): Blockly.utils.Size;
    
            /**
             * Size this comment's bubble.
             * @param {number} width Width of the bubble.
             * @param {number} height Height of the bubble.
             */
            setBubbleSize(width: number, height: number): void;
    
            /**
             * Returns this comment's text.
             * @return {string} Comment text.
             * @deprecated August 2019 Use block.getCommentText() instead.
             */
            getText(): string;
    
            /**
             * Set this comment's text.
             *
             * If you want to receive a comment change event, then this should not be called
             * directly. Instead call block.setCommentText();
             * @param {string} text Comment text.
             * @deprecated August 2019 Use block.setCommentText() instead.
             */
            setText(text: string): void;
    
            /**
             * Update the comment's view to match the model.
             * @package
             */
            updateText(): void;
    
            /**
             * Dispose of this comment.
             *
             * If you want to receive a comment "delete" event (newValue: null), then this
             * should not be called directly. Instead call block.setCommentText(null);
             */
            dispose(): void;
    } 
    
}


declare module Blockly {

    class Connection extends Connection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Connection__Class implements Blockly.IASTNodeLocationWithBlock  { 
    
            /**
             * Class for a connection between blocks.
             * @param {!Blockly.Block} source The block establishing this connection.
             * @param {number} type The type of the connection.
             * @constructor
             * @implements {Blockly.IASTNodeLocationWithBlock}
             */
            constructor(source: Blockly.Block, type: number);
    
            /**
             * @type {!Blockly.Block}
             * @protected
             */
            sourceBlock_: Blockly.Block;
    
            /** @type {number} */
            type: number;
    
            /**
             * Connection this connection connects to.  Null if not connected.
             * @type {Blockly.Connection}
             */
            targetConnection: Blockly.Connection;
    
            /**
             * Has this connection been disposed of?
             * @type {boolean}
             * @package
             */
            disposed: boolean;
    
            /**
             * Horizontal location of this connection.
             * @type {number}
             * @package
             */
            x: number;
    
            /**
             * Vertical location of this connection.
             * @type {number}
             * @package
             */
            y: number;
    
            /**
             * Connect two connections together.  This is the connection on the superior
             * block.
             * @param {!Blockly.Connection} childConnection Connection on inferior block.
             * @protected
             */
            connect_(childConnection: Blockly.Connection): void;
    
            /**
             * Dispose of this connection and deal with connected blocks.
             * @package
             */
            dispose(): void;
    
            /**
             * Get the source block for this connection.
             * @return {!Blockly.Block} The source block.
             */
            getSourceBlock(): Blockly.Block;
    
            /**
             * Does the connection belong to a superior block (higher in the source stack)?
             * @return {boolean} True if connection faces down or right.
             */
            isSuperior(): boolean;
    
            /**
             * Is the connection connected?
             * @return {boolean} True if connection is connected to another connection.
             */
            isConnected(): boolean;
    
            /**
             * Checks whether the current connection can connect with the target
             * connection.
             * @param {Blockly.Connection} target Connection to check compatibility with.
             * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
             *    an error code otherwise.
             */
            canConnectWithReason(target: Blockly.Connection): number;
    
            /**
             * Checks whether the current connection and target connection are compatible
             * and throws an exception if they are not.
             * @param {Blockly.Connection} target The connection to check compatibility
             *    with.
             * @package
             */
            checkConnection(target: Blockly.Connection): void;
    
            /**
             * Check if the two connections can be dragged to connect to each other.
             * @param {!Blockly.Connection} candidate A nearby connection to check.
             * @return {boolean} True if the connection is allowed, false otherwise.
             */
            isConnectionAllowed(candidate: Blockly.Connection): boolean;
    
            /**
             * Behavior after a connection attempt fails.
             * @param {!Blockly.Connection} _otherConnection Connection that this connection
             *     failed to connect to.
             * @package
             */
            onFailedConnect(_otherConnection: Blockly.Connection): void;
    
            /**
             * Connect this connection to another connection.
             * @param {!Blockly.Connection} otherConnection Connection to connect to.
             */
            connect(otherConnection: Blockly.Connection): void;
    
            /**
             * Disconnect this connection.
             */
            disconnect(): void;
    
            /**
             * Disconnect two blocks that are connected by this connection.
             * @param {!Blockly.Block} parentBlock The superior block.
             * @param {!Blockly.Block} childBlock The inferior block.
             * @protected
             */
            disconnectInternal_(parentBlock: Blockly.Block, childBlock: Blockly.Block): void;
    
            /**
             * Respawn the shadow block if there was one connected to the this connection.
             * @protected
             */
            respawnShadow_(): void;
    
            /**
             * Returns the block that this connection connects to.
             * @return {Blockly.Block} The connected block or null if none is connected.
             */
            targetBlock(): Blockly.Block;
    
            /**
             * Is this connection compatible with another connection with respect to the
             * value type system.  E.g. square_root("Hello") is not compatible.
             * @param {!Blockly.Connection} otherConnection Connection to compare against.
             * @return {boolean} True if the connections share a type.
             */
            checkType(otherConnection: Blockly.Connection): boolean;
    
            /**
             * Function to be called when this connection's compatible types have changed.
             * @protected
             */
            onCheckChanged_(): void;
    
            /**
             * Change a connection's compatibility.
             * @param {?(string|!Array.<string>)} check Compatible value type or list of
             *     value types. Null if all types are compatible.
             * @return {!Blockly.Connection} The connection being modified
             *     (to allow chaining).
             */
            setCheck(check: string|string[]): Blockly.Connection;
    
            /**
             * Get a connection's compatibility.
             * @return {Array} List of compatible value types.
             *     Null if all types are compatible.
             * @public
             */
            getCheck(): any[];
    
            /**
             * Change a connection's shadow block.
             * @param {Element} shadow DOM representation of a block or null.
             */
            setShadowDom(shadow: Element): void;
    
            /**
             * Return a connection's shadow block.
             * @return {Element} Shadow DOM representation of a block or null.
             */
            getShadowDom(): Element;
    
            /**
             * Find all nearby compatible connections to this connection.
             * Type checking does not apply, since this function is used for bumping.
             *
             * Headless configurations (the default) do not have neighboring connection,
             * and always return an empty list (the default).
             * {@link Blockly.RenderedConnection} overrides this behavior with a list
             * computed from the rendered positioning.
             * @param {number} _maxLimit The maximum radius to another connection.
             * @return {!Array.<!Blockly.Connection>} List of connections.
             * @package
             */
            neighbours(_maxLimit: number): Blockly.Connection[];
    
            /**
             * Get the parent input of a connection.
             * @return {Blockly.Input} The input that the connection belongs to or null if
             *     no parent exists.
             * @package
             */
            getParentInput(): Blockly.Input;
    
            /**
             * This method returns a string describing this Connection in developer terms
             * (English only). Intended to on be used in console logs and errors.
             * @return {string} The description.
             */
            toString(): string;
    } 
    
}

declare module Blockly.Connection {

    /**
     * Constants for checking whether two connections are compatible.
     */
    var CAN_CONNECT: any /*missing*/;

    /**
     * Walks down a row a blocks, at each stage checking if there are any
     * connections that will accept the orphaned block.  If at any point there
     * are zero or multiple eligible connections, returns null.  Otherwise
     * returns the only input on the last block in the chain.
     * Terminates early for shadow blocks.
     * @param {!Blockly.Block} startBlock The block on which to start the search.
     * @param {!Blockly.Block} orphanBlock The block that is looking for a home.
     * @return {Blockly.Connection} The suitable connection point on the chain
     *     of blocks, or null.
     * @package
     */
    function lastConnectionInRow(startBlock: Blockly.Block, orphanBlock: Blockly.Block): Blockly.Connection;
}


declare module Blockly {

    class ConnectionDB extends ConnectionDB__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ConnectionDB__Class  { 
    
            /**
             * Database of connections.
             * Connections are stored in order of their vertical component.  This way
             * connections in an area may be looked up quickly using a binary search.
             * @constructor
             */
            constructor();
    
            /**
             * Add a connection to the database. Should not already exist in the database.
             * @param {!Blockly.RenderedConnection} connection The connection to be added.
             * @param {number} yPos The y position used to decide where to insert the
             *    connection.
             * @package
             */
            addConnection(connection: Blockly.RenderedConnection, yPos: number): void;
    
            /**
             * Remove a connection from the database.  Must already exist in DB.
             * @param {!Blockly.RenderedConnection} connection The connection to be removed.
             * @param {number} yPos The y position used to find the index of the connection.
             * @throws {Error} If the connection cannot be found in the database.
             */
            removeConnection(connection: Blockly.RenderedConnection, yPos: number): void;
    
            /**
             * Find all nearby connections to the given connection.
             * Type checking does not apply, since this function is used for bumping.
             * @param {!Blockly.RenderedConnection} connection The connection whose
             *     neighbours should be returned.
             * @param {number} maxRadius The maximum radius to another connection.
             * @return {!Array.<!Blockly.RenderedConnection>} List of connections.
             */
            getNeighbours(connection: Blockly.RenderedConnection, maxRadius: number): Blockly.RenderedConnection[];
    
            /**
             * Find the closest compatible connection to this connection.
             * @param {!Blockly.RenderedConnection} conn The connection searching for a compatible
             *     mate.
             * @param {number} maxRadius The maximum radius to another connection.
             * @param {!Blockly.utils.Coordinate} dxy Offset between this connection's
             *     location in the database and the current location (as a result of
             *     dragging).
             * @return {!{connection: Blockly.RenderedConnection, radius: number}}
             *     Contains two properties: 'connection' which is either another
             *     connection or null, and 'radius' which is the distance.
             */
            searchForClosest(conn: Blockly.RenderedConnection, maxRadius: number, dxy: Blockly.utils.Coordinate): { connection: Blockly.RenderedConnection; radius: number };
    } 
    
}

declare module Blockly.ConnectionDB {

    /**
     * Initialize a set of connection DBs for a workspace.
     * @return {!Array.<!Blockly.ConnectionDB>} Array of databases.
     */
    function init(): Blockly.ConnectionDB[];
}


declare module Blockly {

    /**
     * The multiplier for scroll wheel deltas using the line delta mode.
     * @type {number}
     */
    var LINE_MODE_MULTIPLIER: number;

    /**
     * The multiplier for scroll wheel deltas using the page delta mode.
     * @type {number}
     */
    var PAGE_MODE_MULTIPLIER: number;

    /**
     * Number of pixels the mouse must move before a drag starts.
     */
    var DRAG_RADIUS: any /*missing*/;

    /**
     * Number of pixels the mouse must move before a drag/scroll starts from the
     * flyout.  Because the drag-intention is determined when this is reached, it is
     * larger than Blockly.DRAG_RADIUS so that the drag-direction is clearer.
     */
    var FLYOUT_DRAG_RADIUS: any /*missing*/;

    /**
     * Maximum misalignment between connections for them to snap together.
     */
    var SNAP_RADIUS: any /*missing*/;

    /**
     * Maximum misalignment between connections for them to snap together,
     * when a connection is already highlighted.
     */
    var CONNECTING_SNAP_RADIUS: any /*missing*/;

    /**
     * How much to prefer staying connected to the current connection over moving to
     * a new connection.  The current previewed connection is considered to be this
     * much closer to the matching connection on the block than it actually is.
     */
    var CURRENT_CONNECTION_PREFERENCE: any /*missing*/;

    /**
     * Delay in ms between trigger and bumping unconnected block out of alignment.
     */
    var BUMP_DELAY: any /*missing*/;

    /**
     * Maximum randomness in workspace units for bumping a block.
     */
    var BUMP_RANDOMNESS: any /*missing*/;

    /**
     * Number of characters to truncate a collapsed block to.
     */
    var COLLAPSE_CHARS: any /*missing*/;

    /**
     * Length in ms for a touch to become a long press.
     */
    var LONGPRESS: any /*missing*/;

    /**
     * Prevent a sound from playing if another sound preceded it within this many
     * milliseconds.
     */
    var SOUND_LIMIT: any /*missing*/;

    /**
     * When dragging a block out of a stack, split the stack in two (true), or drag
     * out the block healing the stack (false).
     */
    var DRAG_STACK: any /*missing*/;

    /**
     * The richness of block colours, regardless of the hue.
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     */
    var HSV_SATURATION: any /*missing*/;

    /**
     * The intensity of block colours, regardless of the hue.
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     */
    var HSV_VALUE: any /*missing*/;

    /**
     * Sprited icons and images.
     */
    var SPRITE: any /*missing*/;

    /**
     * ENUM for a right-facing value input.  E.g. 'set item to' or 'return'.
     * @const
     */
    var INPUT_VALUE: any /*missing*/;

    /**
     * ENUM for a left-facing value output.  E.g. 'random fraction'.
     * @const
     */
    var OUTPUT_VALUE: any /*missing*/;

    /**
     * ENUM for a down-facing block stack.  E.g. 'if-do' or 'else'.
     * @const
     */
    var NEXT_STATEMENT: any /*missing*/;

    /**
     * ENUM for an up-facing block stack.  E.g. 'break out of loop'.
     * @const
     */
    var PREVIOUS_STATEMENT: any /*missing*/;

    /**
     * ENUM for an dummy input.  Used to add field(s) with no input.
     * @const
     */
    var DUMMY_INPUT: any /*missing*/;

    /**
     * ENUM for left alignment.
     * @const
     */
    var ALIGN_LEFT: any /*missing*/;

    /**
     * ENUM for centre alignment.
     * @const
     */
    var ALIGN_CENTRE: any /*missing*/;

    /**
     * ENUM for right alignment.
     * @const
     */
    var ALIGN_RIGHT: any /*missing*/;

    /**
     * ENUM for no drag operation.
     * @const
     */
    var DRAG_NONE: any /*missing*/;

    /**
     * ENUM for inside the sticky DRAG_RADIUS.
     * @const
     */
    var DRAG_STICKY: any /*missing*/;

    /**
     * ENUM for inside the non-sticky DRAG_RADIUS, for differentiating between
     * clicks and drags.
     * @const
     */
    var DRAG_BEGIN: any /*missing*/;

    /**
     * ENUM for freely draggable (outside the DRAG_RADIUS, if one applies).
     * @const
     */
    var DRAG_FREE: any /*missing*/;

    /**
     * Lookup table for determining the opposite type of a connection.
     * @const
     */
    var OPPOSITE_TYPE: any /*missing*/;

    /**
     * ENUM for toolbox and flyout at top of screen.
     * @const
     */
    var TOOLBOX_AT_TOP: any /*missing*/;

    /**
     * ENUM for toolbox and flyout at bottom of screen.
     * @const
     */
    var TOOLBOX_AT_BOTTOM: any /*missing*/;

    /**
     * ENUM for toolbox and flyout at left of screen.
     * @const
     */
    var TOOLBOX_AT_LEFT: any /*missing*/;

    /**
     * ENUM for toolbox and flyout at right of screen.
     * @const
     */
    var TOOLBOX_AT_RIGHT: any /*missing*/;

    /**
     * ENUM representing that an event is not in any delete areas.
     * Null for backwards compatibility reasons.
     * @const
     */
    var DELETE_AREA_NONE: any /*missing*/;

    /**
     * ENUM representing that an event is in the delete area of the trash can.
     * @const
     */
    var DELETE_AREA_TRASH: any /*missing*/;

    /**
     * ENUM representing that an event is in the delete area of the toolbox or
     * flyout.
     * @const
     */
    var DELETE_AREA_TOOLBOX: any /*missing*/;

    /**
     * String for use in the "custom" attribute of a category in toolbox XML.
     * This string indicates that the category should be dynamically populated with
     * variable blocks.
     * @const {string}
     */
    var VARIABLE_CATEGORY_NAME: any /*missing*/;

    /**
     * String for use in the "custom" attribute of a category in toolbox XML.
     * This string indicates that the category should be dynamically populated with
     * variable blocks.
     * @const {string}
     */
    var VARIABLE_DYNAMIC_CATEGORY_NAME: any /*missing*/;

    /**
     * String for use in the "custom" attribute of a category in toolbox XML.
     * This string indicates that the category should be dynamically populated with
     * procedure blocks.
     * @const {string}
     */
    var PROCEDURE_CATEGORY_NAME: any /*missing*/;

    /**
     * String for use in the dropdown created in field_variable.
     * This string indicates that this option in the dropdown is 'Rename
     * variable...' and if selected, should trigger the prompt to rename a variable.
     * @const {string}
     */
    var RENAME_VARIABLE_ID: any /*missing*/;

    /**
     * String for use in the dropdown created in field_variable.
     * This string indicates that this option in the dropdown is 'Delete the "%1"
     * variable' and if selected, should trigger the prompt to delete a variable.
     * @const {string}
     */
    var DELETE_VARIABLE_ID: any /*missing*/;
}


declare module Blockly.ContextMenu {

    /**
     * Which block is the context menu attached to?
     * @type {Blockly.Block}
     */
    var currentBlock: Blockly.Block;

    /**
     * Construct the menu based on the list of options and show the menu.
     * @param {!Event} e Mouse event.
     * @param {!Array.<!Object>} options Array of menu options.
     * @param {boolean} rtl True if RTL, false if LTR.
     */
    function show(e: Event, options: Object[], rtl: boolean): void;

    /**
     * Hide the context menu.
     */
    function hide(): void;

    /**
     * Dispose of the menu.
     */
    function dispose(): void;

    /**
     * Create a callback function that creates and configures a block,
     *   then places the new block next to the original.
     * @param {!Blockly.Block} block Original block.
     * @param {!Element} xml XML representation of new block.
     * @return {!Function} Function that creates a block.
     */
    function callbackFactory(block: Blockly.Block, xml: Element): Function;

    /**
     * Make a context menu option for deleting the current block.
     * @param {!Blockly.BlockSvg} block The block where the right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function blockDeleteOption(block: Blockly.BlockSvg): Object;

    /**
     * Make a context menu option for showing help for the current block.
     * @param {!Blockly.BlockSvg} block The block where the right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function blockHelpOption(block: Blockly.BlockSvg): Object;

    /**
     * Make a context menu option for duplicating the current block.
     * @param {!Blockly.BlockSvg} block The block where the right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function blockDuplicateOption(block: Blockly.BlockSvg): Object;

    /**
     * Make a context menu option for adding or removing comments on the current
     * block.
     * @param {!Blockly.BlockSvg} block The block where the right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function blockCommentOption(block: Blockly.BlockSvg): Object;

    /**
     * Make a context menu option for deleting the current workspace comment.
     * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
     *     right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function commentDeleteOption(comment: Blockly.WorkspaceCommentSvg): Object;

    /**
     * Make a context menu option for duplicating the current workspace comment.
     * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
     *     right-click originated.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     */
    function commentDuplicateOption(comment: Blockly.WorkspaceCommentSvg): Object;

    /**
     * Make a context menu option for adding a comment on the workspace.
     * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
     *     originated.
     * @param {!Event} e The right-click mouse event.
     * @return {!Object} A menu option, containing text, enabled, and a callback.
     * @package
     * @suppress {strictModuleDepCheck,checkTypes} Suppress checks while workspace
     *     comments are not bundled in.
     */
    function workspaceCommentOption(ws: Blockly.WorkspaceSvg, e: Event): Object;
}


declare module Blockly.Css {

    /**
     * Add some CSS to the blob that will be injected later.  Allows optional
     * components such as fields and the toolbox to store separate CSS.
     * The provided array of CSS will be destroyed by this function.
     * @param {!Array.<string>} cssArray Array of CSS strings.
     */
    function register(cssArray: string[]): void;

    /**
     * Inject the CSS into the DOM.  This is preferable over using a regular CSS
     * file since:
     * a) It loads synchronously and doesn't force a redraw later.
     * b) It speeds up loading by not blocking on a separate HTTP transfer.
     * c) The CSS content may be made dynamic depending on init options.
     * @param {boolean} hasCss If false, don't inject CSS
     *     (providing CSS becomes the document's responsibility).
     * @param {string} pathToMedia Path from page to the Blockly media directory.
     */
    function inject(hasCss: boolean, pathToMedia: string): void;

    /**
     * Set the cursor to be displayed when over something draggable.
     * See https://github.com/google/blockly/issues/981 for context.
     * @param {*} _cursor Enum.
     * @deprecated April 2017.
     */
    function setCursor(_cursor: any): void;

    /**
     * Array making up the CSS content for Blockly.
     */
    var CONTENT: any /*missing*/;
}


declare module Blockly {

    class DropDownDiv extends DropDownDiv__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class DropDownDiv__Class  { 
    
            /**
             * Class for drop-down div.
             * @constructor
             * @package
             */
            constructor();
    } 
    
}

declare module Blockly.DropDownDiv {

    /**
     * Arrow size in px. Should match the value in CSS
     * (need to position pre-render).
     * @type {number}
     * @const
     */
    var ARROW_SIZE: number;

    /**
     * Drop-down border size in px. Should match the value in CSS (need to position
     * the arrow).
     * @type {number}
     * @const
     */
    var BORDER_SIZE: number;

    /**
     * Amount the arrow must be kept away from the edges of the main drop-down div,
     * in px.
     * @type {number}
     * @const
     */
    var ARROW_HORIZONTAL_PADDING: number;

    /**
     * Amount drop-downs should be padded away from the source, in px.
     * @type {number}
     * @const
     */
    var PADDING_Y: number;

    /**
     * Length of animations in seconds.
     * @type {number}
     * @const
     */
    var ANIMATION_TIME: number;

    /**
     * Dropdown bounds info object used to encapsulate sizing information about a
     * bounding element (bounding box and width/height).
     * @typedef {{
     *        top:number,
     *        left:number,
     *        bottom:number,
     *        right:number,
     *        width:number,
     *        height:number
     * }}
     */
    interface BoundsInfo {
        top: number;
        left: number;
        bottom: number;
        right: number;
        width: number;
        height: number
    }

    /**
     * Dropdown position metrics.
     * @typedef {{
     *        initialX:number,
     *        initialY:number,
     *        finalX:number,
     *        finalY:number,
     *        arrowX:?number,
     *        arrowY:?number,
     *        arrowAtTop:?boolean,
     *        arrowVisible:boolean
     * }}
     */
    interface PositionMetrics {
        initialX: number;
        initialY: number;
        finalX: number;
        finalY: number;
        arrowX: number;
        arrowY: number;
        arrowAtTop: boolean;
        arrowVisible: boolean
    }

    /**
     * Create and insert the DOM element for this div.
     * @package
     */
    function createDom(): void;

    /**
     * Set an element to maintain bounds within. Drop-downs will appear
     * within the box of this element if possible.
     * @param {Element} boundsElement Element to bind drop-down to.
     */
    function setBoundsElement(boundsElement: Element): void;

    /**
     * Provide the div for inserting content into the drop-down.
     * @return {!Element} Div to populate with content.
     */
    function getContentDiv(): Element;

    /**
     * Clear the content of the drop-down.
     */
    function clearContent(): void;

    /**
     * Set the colour for the drop-down.
     * @param {string} backgroundColour Any CSS colour for the background.
     * @param {string} borderColour Any CSS colour for the border.
     */
    function setColour(backgroundColour: string, borderColour: string): void;

    /**
     * Shortcut to show and place the drop-down with positioning determined
     * by a particular block. The primary position will be below the block,
     * and the secondary position above the block. Drop-down will be
     * constrained to the block's workspace.
     * @param {!Blockly.Field} field The field showing the drop-down.
     * @param {!Blockly.BlockSvg} block Block to position the drop-down around.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *   hidden.
     * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
     *   positioning.
     * @return {boolean} True if the menu rendered below block; false if above.
     */
    function showPositionedByBlock(field: Blockly.Field, block: Blockly.BlockSvg, opt_onHide?: Function, opt_secondaryYOffset?: number): boolean;

    /**
     * Shortcut to show and place the drop-down with positioning determined
     * by a particular field. The primary position will be below the field,
     * and the secondary position above the field. Drop-down will be
     * constrained to the block's workspace.
     * @param {!Blockly.Field} field The field to position the dropdown against.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *   hidden.
     * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
     *   positioning.
     * @return {boolean} True if the menu rendered below block; false if above.
     */
    function showPositionedByField(field: Blockly.Field, opt_onHide?: Function, opt_secondaryYOffset?: number): boolean;

    /**
     * Show and place the drop-down.
     * The drop-down is placed with an absolute "origin point" (x, y) - i.e.,
     * the arrow will point at this origin and box will positioned below or above
     * it.  If we can maintain the container bounds at the primary point, the arrow
     * will point there, and the container will be positioned below it.
     * If we can't maintain the container bounds at the primary point, fall-back to
     * the secondary point and position above.
     * @param {Object} owner The object showing the drop-down
     * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
     * @param {number} primaryX Desired origin point x, in absolute px.
     * @param {number} primaryY Desired origin point y, in absolute px.
     * @param {number} secondaryX Secondary/alternative origin point x, in absolute
     *     px.
     * @param {number} secondaryY Secondary/alternative origin point y, in absolute
     *     px.
     * @param {Function=} opt_onHide Optional callback for when the drop-down is
     *     hidden.
     * @return {boolean} True if the menu rendered at the primary origin point.
     * @package
     */
    function show(owner: Object, rtl: boolean, primaryX: number, primaryY: number, secondaryX: number, secondaryY: number, opt_onHide?: Function): boolean;

    /**
     * Get the x positions for the left side of the DropDownDiv and the arrow,
     * accounting for the bounds of the workspace.
     * @param {number} sourceX Desired origin point x, in absolute px.
     * @param {number} boundsLeft The left edge of the bounding element, in
     *    absolute px.
     * @param {number} boundsRight The right edge of the bounding element, in
     *    absolute px.
     * @param {number} divWidth The width of the div in px.
     * @return {{divX: number, arrowX: number}} An object containing metrics for
     *    the x positions of the left side of the DropDownDiv and the arrow.
     * @package
     */
    function getPositionX(sourceX: number, boundsLeft: number, boundsRight: number, divWidth: number): { divX: number; arrowX: number };

    /**
     * Is the container visible?
     * @return {boolean} True if visible.
     */
    function isVisible(): boolean;

    /**
     * Hide the menu only if it is owned by the provided object.
     * @param {Object} owner Object which must be owning the drop-down to hide.
     * @param {boolean=} opt_withoutAnimation True if we should hide the dropdown
     *     without animating.
     * @return {boolean} True if hidden.
     */
    function hideIfOwner(owner: Object, opt_withoutAnimation?: boolean): boolean;

    /**
     * Hide the menu, triggering animation.
     */
    function hide(): void;

    /**
     * Hide the menu, without animation.
     */
    function hideWithoutAnimation(): void;

    /**
     * Repositions the dropdownDiv on window resize. If it doesn't know how to
     * calculate the new position, it will just hide it instead.
     * @package
     */
    function repositionForWindowResize(): void;
}


declare module Blockly.Events {

    /**
     * Sets whether the next event should be added to the undo stack.
     * @type {boolean}
     */
    var recordUndo: boolean;

    /**
     * Name of event that creates a block. Will be deprecated for BLOCK_CREATE.
     * @const
     */
    var CREATE: any /*missing*/;

    /**
     * Name of event that creates a block.
     * @const
     */
    var BLOCK_CREATE: any /*missing*/;

    /**
     * Name of event that deletes a block. Will be deprecated for BLOCK_DELETE.
     * @const
     */
    var DELETE: any /*missing*/;

    /**
     * Name of event that deletes a block.
     * @const
     */
    var BLOCK_DELETE: any /*missing*/;

    /**
     * Name of event that changes a block. Will be deprecated for BLOCK_CHANGE.
     * @const
     */
    var CHANGE: any /*missing*/;

    /**
     * Name of event that changes a block.
     * @const
     */
    var BLOCK_CHANGE: any /*missing*/;

    /**
     * Name of event that moves a block. Will be deprecated for BLOCK_MOVE.
     * @const
     */
    var MOVE: any /*missing*/;

    /**
     * Name of event that moves a block.
     * @const
     */
    var BLOCK_MOVE: any /*missing*/;

    /**
     * Name of event that creates a variable.
     * @const
     */
    var VAR_CREATE: any /*missing*/;

    /**
     * Name of event that deletes a variable.
     * @const
     */
    var VAR_DELETE: any /*missing*/;

    /**
     * Name of event that renames a variable.
     * @const
     */
    var VAR_RENAME: any /*missing*/;

    /**
     * Name of event that records a UI change.
     * @const
     */
    var UI: any /*missing*/;

    /**
     * Name of event that creates a comment.
     * @const
     */
    var COMMENT_CREATE: any /*missing*/;

    /**
     * Name of event that deletes a comment.
     * @const
     */
    var COMMENT_DELETE: any /*missing*/;

    /**
     * Name of event that changes a comment.
     * @const
     */
    var COMMENT_CHANGE: any /*missing*/;

    /**
     * Name of event that moves a comment.
     * @const
     */
    var COMMENT_MOVE: any /*missing*/;

    /**
     * Name of event that records a workspace load.
     */
    var FINISHED_LOADING: any /*missing*/;

    /**
     * List of events that cause objects to be bumped back into the visible
     * portion of the workspace (only used for non-movable workspaces).
     *
     * Not to be confused with bumping so that disconnected connections to do
     * not appear connected.
     * @const
     */
    var BUMP_EVENTS: any /*missing*/;

    /**
     * Create a custom event and fire it.
     * @param {!Blockly.Events.Abstract} event Custom data for event.
     */
    function fire(event: Blockly.Events.Abstract): void;

    /**
     * Filter the queued events and merge duplicates.
     * @param {!Array.<!Blockly.Events.Abstract>} queueIn Array of events.
     * @param {boolean} forward True if forward (redo), false if backward (undo).
     * @return {!Array.<!Blockly.Events.Abstract>} Array of filtered events.
     */
    function filter(queueIn: Blockly.Events.Abstract[], forward: boolean): Blockly.Events.Abstract[];

    /**
     * Modify pending undo events so that when they are fired they don't land
     * in the undo stack.  Called by Blockly.Workspace.clearUndo.
     */
    function clearPendingUndo(): void;

    /**
     * Stop sending events.  Every call to this function MUST also call enable.
     */
    function disable(): void;

    /**
     * Start sending events.  Unless events were already disabled when the
     * corresponding call to disable was made.
     */
    function enable(): void;

    /**
     * Returns whether events may be fired or not.
     * @return {boolean} True if enabled.
     */
    function isEnabled(): boolean;

    /**
     * Current group.
     * @return {string} ID string.
     */
    function getGroup(): string;

    /**
     * Start or stop a group.
     * @param {boolean|string} state True to start new group, false to end group.
     *   String to set group explicitly.
     */
    function setGroup(state: boolean|string): void;

    /**
     * Compute a list of the IDs of the specified block and all its descendants.
     * @param {!Blockly.Block} block The root block.
     * @return {!Array.<string>} List of block IDs.
     * @package
     */
    function getDescendantIds(block: Blockly.Block): string[];

    /**
     * Decode the JSON into an event.
     * @param {!Object} json JSON representation.
     * @param {!Blockly.Workspace} workspace Target workspace for event.
     * @return {!Blockly.Events.Abstract} The event represented by the JSON.
     */
    function fromJson(json: Object, workspace: Blockly.Workspace): Blockly.Events.Abstract;

    /**
     * Enable/disable a block depending on whether it is properly connected.
     * Use this on applications where all blocks should be connected to a top block.
     * Recommend setting the 'disable' option to 'false' in the config so that
     * users don't try to re-enable disabled orphan blocks.
     * @param {!Blockly.Events.Abstract} event Custom data for event.
     */
    function disableOrphans(event: Blockly.Events.Abstract): void;
}


declare module Blockly.Events {

    class Abstract extends Abstract__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Abstract__Class  { 
    
            /**
             * Abstract class for an event.
             * @constructor
             */
            constructor();
    
            /**
             * The workspace identifier for this event.
             * @type {string|undefined}
             */
            workspaceId: string|any /*undefined*/;
    
            /**
             * The event group id for the group this event belongs to. Groups define
             * events that should be treated as an single action from the user's
             * perspective, and should be undone together.
             * @type {string}
             */
            group: string;
    
            /**
             * Sets whether the event should be added to the undo stack.
             * @type {boolean}
             */
            recordUndo: boolean;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Does this event record any change of state?
             * @return {boolean} True if null, false if something changed.
             */
            isNull(): boolean;
    
            /**
             * Run an event.
             * @param {boolean} _forward True if run forward, false if run backward (undo).
             */
            run(_forward: boolean): void;
    
            /**
             * Get workspace the event belongs to.
             * @return {!Blockly.Workspace} The workspace the event belongs to.
             * @throws {Error} if workspace is null.
             * @protected
             */
            getEventWorkspace_(): Blockly.Workspace;
    } 
    
}


declare module Blockly.Extensions {

    /**
     * Registers a new extension function. Extensions are functions that help
     * initialize blocks, usually adding dynamic behavior such as onchange
     * handlers and mutators. These are applied using Block.applyExtension(), or
     * the JSON "extensions" array attribute.
     * @param {string} name The name of this extension.
     * @param {Function} initFn The function to initialize an extended block.
     * @throws {Error} if the extension name is empty, the extension is already
     *     registered, or extensionFn is not a function.
     */
    function register(name: string, initFn: Function): void;

    /**
     * Registers a new extension function that adds all key/value of mixinObj.
     * @param {string} name The name of this extension.
     * @param {!Object} mixinObj The values to mix in.
     * @throws {Error} if the extension name is empty or the extension is already
     *     registered.
     */
    function registerMixin(name: string, mixinObj: Object): void;

    /**
     * Registers a new extension function that adds a mutator to the block.
     * At register time this performs some basic sanity checks on the mutator.
     * The wrapper may also add a mutator dialog to the block, if both compose and
     * decompose are defined on the mixin.
     * @param {string} name The name of this mutator extension.
     * @param {!Object} mixinObj The values to mix in.
     * @param {(function())=} opt_helperFn An optional function to apply after
     *     mixing in the object.
     * @param {!Array.<string>=} opt_blockList A list of blocks to appear in the
     *     flyout of the mutator dialog.
     * @throws {Error} if the mutation is invalid or can't be applied to the block.
     */
    function registerMutator(name: string, mixinObj: Object, opt_helperFn?: { (): any /*missing*/ }, opt_blockList?: string[]): void;

    /**
     * Unregisters the extension registered with the given name.
     * @param {string} name The name of the extension to unregister.
     */
    function unregister(name: string): void;

    /**
     * Applies an extension method to a block. This should only be called during
     * block construction.
     * @param {string} name The name of the extension.
     * @param {!Blockly.Block} block The block to apply the named extension to.
     * @param {boolean} isMutator True if this extension defines a mutator.
     * @throws {Error} if the extension is not found.
     */
    function apply(name: string, block: Blockly.Block, isMutator: boolean): void;

    /**
     * Builds an extension function that will map a dropdown value to a tooltip
     * string.
     *
     * This method includes multiple checks to ensure tooltips, dropdown options,
     * and message references are aligned. This aims to catch errors as early as
     * possible, without requiring developers to manually test tooltips under each
     * option. After the page is loaded, each tooltip text string will be checked
     * for matching message keys in the internationalized string table. Deferring
     * this until the page is loaded decouples loading dependencies. Later, upon
     * loading the first block of any given type, the extension will validate every
     * dropdown option has a matching tooltip in the lookupTable.  Errors are
     * reported as warnings in the console, and are never fatal.
     * @param {string} dropdownName The name of the field whose value is the key
     *     to the lookup table.
     * @param {!Object.<string, string>} lookupTable The table of field values to
     *     tooltip text.
     * @return {!Function} The extension function.
     */
    function buildTooltipForDropdown(dropdownName: string, lookupTable: { [key: string]: string }): Function;

    /**
     * Builds an extension function that will install a dynamic tooltip. The
     * tooltip message should include the string '%1' and that string will be
     * replaced with the text of the named field.
     * @param {string} msgTemplate The template form to of the message text, with
     *     %1 placeholder.
     * @param {string} fieldName The field with the replacement text.
     * @return {!Function} The extension function.
     */
    function buildTooltipWithFieldText(msgTemplate: string, fieldName: string): Function;
}


declare module Blockly {

    class Field extends Field__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Field__Class implements Blockly.IASTNodeLocationSvg, Blockly.IASTNodeLocationWithBlock, Blockly.IBlocklyActionable, Blockly.IRegistrable  { 
    
            /**
             * Abstract class for an editable field.
             * @param {*} value The initial value of the field.
             * @param {?Function=} opt_validator  A function that is called to validate
             *    changes to the field's value. Takes in a value & returns a validated
             *    value, or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field. See
             *    the individual field's documentation for a list of properties this
             *    parameter supports.
             * @constructor
             * @implements {Blockly.IASTNodeLocationSvg}
             * @implements {Blockly.IASTNodeLocationWithBlock}
             * @implements {Blockly.IBlocklyActionable}
             * @implements {Blockly.IRegistrable}
             */
            constructor(value: any, opt_validator?: Function, opt_config?: Object);
    
            /**
             * A generic value possessed by the field.
             * Should generally be non-null, only null when the field is created.
             * @type {*}
             * @protected
             */
            value_: any;
    
            /**
             * Validation function called when user edits an editable field.
             * @type {Function}
             * @protected
             */
            validator_: Function;
    
            /**
             * The size of the area rendered by the field.
             * @type {!Blockly.utils.Size}
             * @protected
             */
            size_: Blockly.utils.Size;
    
            /**
             * The rendered field's SVG group element.
             * @type {SVGGElement}
             * @protected
             */
            fieldGroup_: SVGGElement;
    
            /**
             * The rendered field's SVG border element.
             * @type {SVGRectElement}
             * @protected
             */
            borderRect_: SVGRectElement;
    
            /**
             * The rendered field's SVG text element.
             * @type {SVGTextElement}
             * @protected
             */
            textElement_: SVGTextElement;
    
            /**
             * The rendered field's text content element.
             * @type {Text}
             * @protected
             */
            textContent_: Text;
    
            /**
             * Constants associated with the source block's renderer.
             * @type {Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Name of field.  Unique within each block.
             * Static labels are usually unnamed.
             * @type {string|undefined}
             */
            name: string|any /*undefined*/;
    
            /**
             * Has this field been disposed of?
             * @type {boolean}
             * @package
             */
            disposed: boolean;
    
            /**
             * Maximum characters of text to display before adding an ellipsis.
             * @type {number}
             */
            maxDisplayLength: number;
    
            /**
             * Block this field is attached to.  Starts as null, then set in init.
             * @type {Blockly.Block}
             * @protected
             */
            sourceBlock_: Blockly.Block;
    
            /**
             * Does this block need to be re-rendered?
             * @type {boolean}
             * @protected
             */
            isDirty_: boolean;
    
            /**
             * Is the field visible, or hidden due to the block being collapsed?
             * @type {boolean}
             * @protected
             */
            visible_: boolean;
    
            /**
             * The element the click handler is bound to.
             * @type {Element}
             * @protected
             */
            clickTarget_: Element;
    
            /**
             * A developer hook to override the returned text of this field.
             * Override if the text representation of the value of this field
             * is not just a string cast of its value.
             * Return null to resort to a string cast.
             * @return {?string} Current text. Return null to resort to a string cast.
             * @protected
             */
            getText_(): string;
    
            /**
             * An optional method that can be defined to show an editor when the field is
             *     clicked. Blockly will automatically set the field as clickable if this
             *     method is defined.
             * @param {Event=} opt_e Optional mouse event that triggered the field to open,
             *     or undefined if triggered programmatically.
             * @return {void}
             * @protected
             */
            showEditor_(opt_e?: Event): void;
    
            /**
             * Editable fields usually show some sort of UI indicating they are editable.
             * They will also be saved by the XML renderer.
             * @type {boolean}
             */
            EDITABLE: boolean;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable. This is not the
             * case by default so that SERIALIZABLE is backwards compatible.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Process the configuration map passed to the field.
             * @param {!Object} config A map of options used to configure the field. See
             *    the individual field's documentation for a list of properties this
             *    parameter supports.
             * @protected
             */
            configure_(config: Object): void;
    
            /**
             * Attach this field to a block.
             * @param {!Blockly.Block} block The block containing this field.
             */
            setSourceBlock(block: Blockly.Block): void;
    
            /**
             * Get the renderer constant provider.
             * @return {?Blockly.blockRendering.ConstantProvider} The renderer constant
             *     provider.
             */
            getConstants(): Blockly.blockRendering.ConstantProvider;
    
            /**
             * Get the block this field is attached to.
             * @return {Blockly.Block} The block containing this field.
             */
            getSourceBlock(): Blockly.Block;
    
            /**
             * Initialize everything to render this field. Override
             * methods initModel and initView rather than this method.
             * @package
             */
            init(): void;
    
            /**
             * Create the block UI for this field.
             * @package
             */
            initView(): void;
    
            /**
             * Initializes the model of the field after it has been installed on a block.
             * No-op by default.
             * @package
             */
            initModel(): void;
    
            /**
             * Create a field border rect element. Not to be overridden by subclasses.
             * Instead modify the result of the function inside initView, or create a
             * separate function to call.
             * @protected
             */
            createBorderRect_(): void;
    
            /**
             * Create a field text element. Not to be overridden by subclasses. Instead
             * modify the result of the function inside initView, or create a separate
             * function to call.
             * @protected
             */
            createTextElement_(): void;
    
            /**
             * Bind events to the field. Can be overridden by subclasses if they need to do
             * custom input handling.
             * @protected
             */
            bindEvents_(): void;
    
            /**
             * Sets the field's value based on the given XML element. Should only be
             * called by Blockly.Xml.
             * @param {!Element} fieldElement The element containing info about the
             *    field's state.
             * @package
             */
            fromXml(fieldElement: Element): void;
    
            /**
             * Serializes this field's value to XML. Should only be called by Blockly.Xml.
             * @param {!Element} fieldElement The element to populate with info about the
             *    field's state.
             * @return {!Element} The element containing info about the field's state.
             * @package
             */
            toXml(fieldElement: Element): Element;
    
            /**
             * Dispose of all DOM objects and events belonging to this editable field.
             * @package
             */
            dispose(): void;
    
            /**
             * Add or remove the UI indicating if this field is editable or not.
             */
            updateEditable(): void;
    
            /**
             * Check whether this field defines the showEditor_ function.
             * @return {boolean} Whether this field is clickable.
             */
            isClickable(): boolean;
    
            /**
             * Check whether this field is currently editable.  Some fields are never
             * EDITABLE (e.g. text labels). Other fields may be EDITABLE but may exist on
             * non-editable blocks.
             * @return {boolean} Whether this field is editable and on an editable block
             */
            isCurrentlyEditable(): boolean;
    
            /**
             * Check whether this field should be serialized by the XML renderer.
             * Handles the logic for backwards compatibility and incongruous states.
             * @return {boolean} Whether this field should be serialized or not.
             */
            isSerializable(): boolean;
    
            /**
             * Gets whether this editable field is visible or not.
             * @return {boolean} True if visible.
             */
            isVisible(): boolean;
    
            /**
             * Sets whether this editable field is visible or not. Should only be called
             * by input.setVisible.
             * @param {boolean} visible True if visible.
             * @package
             */
            setVisible(visible: boolean): void;
    
            /**
             * Sets a new validation function for editable fields, or clears a previously
             * set validator.
             *
             * The validator function takes in the new field value, and returns
             * validated value. The validated value could be the input value, a modified
             * version of the input value, or null to abort the change.
             *
             * If the function does not return anything (or returns undefined) the new
             * value is accepted as valid. This is to allow for fields using the
             * validated function as a field-level change event notification.
             *
             * @param {Function} handler The validator function
             *     or null to clear a previous validator.
             */
            setValidator(handler: Function): void;
    
            /**
             * Gets the validation function for editable fields, or null if not set.
             * @return {Function} Validation function, or null.
             */
            getValidator(): Function;
    
            /**
             * Validates a change.  Does nothing.  Subclasses may override this.
             * @param {string} text The user's text.
             * @return {string} No change needed.
             * @deprecated May 2019. Override doClassValidation and other relevant 'do'
             *  functions instead.
             */
            classValidator(text: string): string;
    
            /**
             * Calls the validation function for this field, as well as all the validation
             * function for the field's class and its parents.
             * @param {string} text Proposed text.
             * @return {?string} Revised text, or null if invalid.
             * @deprecated May 2019. setValue now contains all relevant logic.
             */
            callValidator(text: string): string;
    
            /**
             * Gets the group element for this editable field.
             * Used for measuring the size and for positioning.
             * @return {!SVGGElement} The group element.
             */
            getSvgRoot(): SVGGElement;
    
            /**
             * Updates the field to match the colour/style of the block. Should only be
             * called by BlockSvg.applyColour().
             * @package
             */
            applyColour(): void;
    
            /**
             * Used by getSize() to move/resize any DOM elements, and get the new size.
             *
             * All rendering that has an effect on the size/shape of the block should be
             * done here, and should be triggered by getSize().
             * @protected
             */
            render_(): void;
    
            /**
             * Show an editor when the field is clicked only if the field is clickable.
             * @param {Event=} opt_e Optional mouse event that triggered the field to open,
             *     or undefined if triggered programmatically.
             * @package
             */
            showEditor(opt_e?: Event): void;
    
            /**
             * Updates the width of the field. Redirects to updateSize_().
             * @deprecated May 2019  Use Blockly.Field.updateSize_() to force an update
             * to the size of the field, or Blockly.utils.dom.getTextWidth() to
             * check the size of the field.
             */
            updateWidth(): void;
    
            /**
             * Updates the size of the field based on the text.
             * @param {number=} opt_margin margin to use when positioning the text element.
             * @protected
             */
            updateSize_(opt_margin?: number): void;
    
            /**
             * Position a field's text element after a size change.  This handles both LTR
             * and RTL positioning.
             * @param {number} xOffset x offset to use when positioning the text element.
             * @param {number} contentWidth The content width.
             * @protected
             */
            positionTextElement_(xOffset: number, contentWidth: number): void;
    
            /**
             * Position a field's border rect after a size change.
             * @protected
             */
            positionBorderRect_(): void;
    
            /**
             * Returns the height and width of the field.
             *
             * This should *in general* be the only place render_ gets called from.
             * @return {!Blockly.utils.Size} Height and width.
             */
            getSize(): Blockly.utils.Size;
    
            /**
             * Returns the bounding box of the rendered field, accounting for workspace
             * scaling.
             * @return {!Blockly.utils.Rect} An object with top, bottom, left, and right in
             *     pixels relative to the top left corner of the page (window coordinates).
             * @package
             */
            getScaledBBox(): Blockly.utils.Rect;
    
            /**
             * Get the text from this field to display on the block. May differ from
             * ``getText`` due to ellipsis, and other formatting.
             * @return {string} Text to display.
             * @protected
             */
            getDisplayText_(): string;
    
            /**
             * Get the text from this field.
             * @return {string} Current text.
             */
            getText(): string;
    
            /**
             * Set the text in this field.  Trigger a rerender of the source block.
             * @param {*} _newText New text.
             * @deprecated 2019 setText should not be used directly. Use setValue instead.
             */
            setText(_newText: any): void;
    
            /**
             * Force a rerender of the block that this field is installed on, which will
             * rerender this field and adjust for any sizing changes.
             * Other fields on the same block will not rerender, because their sizes have
             * already been recorded.
             * @package
             */
            markDirty(): void;
    
            /**
             * Force a rerender of the block that this field is installed on, which will
             * rerender this field and adjust for any sizing changes.
             * Other fields on the same block will not rerender, because their sizes have
             * already been recorded.
             * @package
             */
            forceRerender(): void;
    
            /**
             * Used to change the value of the field. Handles validation and events.
             * Subclasses should override doClassValidation_ and doValueUpdate_ rather
             * than this method.
             * @param {*} newValue New value.
             */
            setValue(newValue: any): void;
    
            /**
             * Get the current value of the field.
             * @return {*} Current value.
             */
            getValue(): any;
    
            /**
             * Used to validate a value. Returns input by default. Can be overridden by
             * subclasses, see FieldDropdown.
             * @param {*=} opt_newValue The value to be validated.
             * @return {*} The validated value, same as input by default.
             * @protected
             * @suppress {deprecated} Suppress deprecated this.classValidator call.
             */
            doClassValidation_(opt_newValue?: any): any;
    
            /**
             * Used to update the value of a field. Can be overridden by subclasses to do
             * custom storage of values/updating of external things.
             * @param {*} newValue The value to be saved.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Used to notify the field an invalid value was input. Can be overridden by
             * subclasses, see FieldTextInput.
             * No-op by default.
             * @param {*} _invalidValue The input value that was determined to be invalid.
             * @protected
             */
            doValueInvalid_(_invalidValue: any): void;
    
            /**
             * Handle a mouse down event on a field.
             * @param {!Event} e Mouse down event.
             * @protected
             */
            onMouseDown_(e: Event): void;
    
            /**
             * Change the tooltip text for this field.
             * @param {string|Function|!SVGElement} newTip Text for tooltip or a parent
             *    element to link to for its tooltip.
             */
            setTooltip(newTip: string|Function|SVGElement): void;
    
            /**
             * The element to bind the click handler to. If not set explicitly, defaults
             * to the SVG root of the field. When this element is
             * clicked on an editable field, the editor will open.
             * @return {!Element} Element to bind click handler to.
             * @protected
             */
            getClickTarget_(): Element;
    
            /**
             * Return the absolute coordinates of the top-left corner of this field.
             * The origin (0,0) is the top-left corner of the page body.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
             * @protected
             */
            getAbsoluteXY_(): Blockly.utils.Coordinate;
    
            /**
             * Whether this field references any Blockly variables.  If true it may need to
             * be handled differently during serialization and deserialization.  Subclasses
             * may override this.
             * @return {boolean} True if this field has any variable references.
             * @package
             */
            referencesVariables(): boolean;
    
            /**
             * Search through the list of inputs and their fields in order to find the
             * parent input of a field.
             * @return {Blockly.Input} The input that the field belongs to.
             * @package
             */
            getParentInput(): Blockly.Input;
    
            /**
             * Returns whether or not we should flip the field in RTL.
             * @return {boolean} True if we should flip in RTL.
             */
            getFlipRtl(): boolean;
    
            /**
             * Returns whether or not the field is tab navigable.
             * @return {boolean} True if the field is tab navigable.
             */
            isTabNavigable(): boolean;
    
            /**
             * Handles the given action.
             * This is only triggered when keyboard accessibility mode is enabled.
             * @param {!Blockly.Action} _action The action to be handled.
             * @return {boolean} True if the field handled the action, false otherwise.
             * @package
             */
            onBlocklyAction(_action: Blockly.Action): boolean;
    
            /**
             * Add the cursor svg to this fields svg group.
             * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
             *     field group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker svg to this fields svg group.
             * @param {SVGElement} markerSvg The svg root of the marker to be added to the
             *     field group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Redraw any attached marker or cursor svgs if needed.
             * @protected
             */
            updateMarkers_(): void;
    } 
    
}

declare module Blockly.Field {

    /**
     * Non-breaking space.
     * @const
     */
    var NBSP: any /*missing*/;
}


declare module Blockly {

    class FieldAngle extends FieldAngle__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldAngle__Class extends Blockly.FieldTextInput__Class  { 
    
            /**
             * Class for an editable angle field.
             * @param {string|number=} opt_value The initial value of the field. Should cast
             *    to a number. Defaults to 0.
             * @param {Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a number & returns a
             *    validated number, or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/angle#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.FieldTextInput}
             * @constructor
             */
            constructor(opt_value?: string|number, opt_validator?: Function, opt_config?: Object);
    
            /**
             * The angle picker's gauge path depending on the value.
             * @type {SVGElement}
             */
            gauge_: SVGElement;
    
            /**
             * The angle picker's line drawn representing the value's angle.
             * @type {SVGElement}
             */
            line_: SVGElement;
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Create the block UI for this field.
             * @package
             */
            initView(): void;
    
            /**
             * Create and show the angle field's editor.
             * @param {Event=} opt_e Optional mouse event that triggered the field to open,
             *     or undefined if triggered programmatically.
             * @protected
             */
            showEditor_(opt_e?: Event): void;
    
            /**
             * Set the angle to match the mouse's position.
             * @param {!Event} e Mouse move event.
             * @protected
             */
            onMouseMove_(e: Event): void;
    } 
    
}

declare module Blockly.FieldAngle {

    /**
     * Construct a FieldAngle from a JSON arg object.
     * @param {!Object} options A JSON object with options (angle).
     * @return {!Blockly.FieldAngle} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldAngle;

    /**
     * The default amount to round angles to when using a mouse or keyboard nav
     * input. Must be a positive integer to support keyboard navigation.
     * @const {number}
     */
    var ROUND: any /*missing*/;

    /**
     * Half the width of protractor image.
     * @const {number}
     */
    var HALF: any /*missing*/;

    /**
     * Default property describing which direction makes an angle field's value
     * increase. Angle increases clockwise (true) or counterclockwise (false).
     * @const {boolean}
     */
    var CLOCKWISE: any /*missing*/;

    /**
     * The default offset of 0 degrees (and all angles). Always offsets in the
     * counterclockwise direction, regardless of the field's clockwise property.
     * Usually either 0 (0 = right) or 90 (0 = up).
     * @const {number}
     */
    var OFFSET: any /*missing*/;

    /**
     * The default maximum angle to allow before wrapping.
     * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
     * @const {number}
     */
    var WRAP: any /*missing*/;

    /**
     * Radius of protractor circle.  Slightly smaller than protractor size since
     * otherwise SVG crops off half the border at the edges.
     * @const {number}
     */
    var RADIUS: any /*missing*/;
}


declare module Blockly {

    class FieldCheckbox extends FieldCheckbox__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldCheckbox__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for a checkbox field.
             * @param {string|boolean=} opt_value The initial value of the field. Should
             *    either be 'TRUE', 'FALSE' or a boolean. Defaults to 'FALSE'.
             * @param {Function=} opt_validator  A function that is called to validate
             *    changes to the field's value. Takes in a value ('TRUE' or 'FALSE') &
             *    returns a validated value ('TRUE' or 'FALSE'), or null to abort the
             *    change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             */
            constructor(opt_value?: string|boolean, opt_validator?: Function, opt_config?: Object);
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Mouse cursor style when over the hotspot that initiates editability.
             */
            CURSOR: any /*missing*/;
    
            /**
             * Create the block UI for this checkbox.
             * @package
             */
            initView(): void;
    
            /**
             * Set the character used for the check mark.
             * @param {?string} character The character to use for the check mark, or
             *    null to use the default.
             */
            setCheckCharacter(character: string): void;
    
            /**
             * Toggle the state of the checkbox on click.
             * @protected
             */
            showEditor_(): void;
    
            /**
             * Ensure that the input value is valid ('TRUE' or 'FALSE').
             * @param {*=} opt_newValue The input value.
             * @return {?string} A valid value ('TRUE' or 'FALSE), or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Update the value of the field, and update the checkElement.
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is a either 'TRUE' or 'FALSE'.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Get the value of this field, either 'TRUE' or 'FALSE'.
             * @return {string} The value of this field.
             */
            getValue(): string;
    
            /**
             * Get the boolean value of this field.
             * @return {boolean} The boolean value of this field.
             */
            getValueBoolean(): boolean;
    
            /**
             * Get the text of this field. Used when the block is collapsed.
             * @return {string} Text representing the value of this field
             *    ('true' or 'false').
             */
            getText(): string;
    } 
    
}

declare module Blockly.FieldCheckbox {

    /**
     * Construct a FieldCheckbox from a JSON arg object.
     * @param {!Object} options A JSON object with options (checked).
     * @return {!Blockly.FieldCheckbox} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldCheckbox;

    /**
     * Default character for the checkmark.
     * @type {string}
     * @const
     */
    var CHECK_CHAR: string;
}


declare module Blockly {

    class FieldColour extends FieldColour__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldColour__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for a colour input field.
             * @param {string=} opt_value The initial value of the field. Should be in
             *    '#rrggbb' format. Defaults to the first value in the default colour array.
             * @param {Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a colour string & returns a
             *    validated colour string ('#rrggbb' format), or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             */
            constructor(opt_value?: string, opt_validator?: Function, opt_config?: Object);
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Mouse cursor style when over the hotspot that initiates the editor.
             */
            CURSOR: any /*missing*/;
    
            /**
             * Used to tell if the field needs to be rendered the next time the block is
             * rendered. Colour fields are statically sized, and only need to be
             * rendered at initialization.
             * @type {boolean}
             * @protected
             */
            isDirty_: boolean;
    
            /**
             * Create the block UI for this colour field.
             * @package
             */
            initView(): void;
    
            /**
             * Ensure that the input value is a valid colour.
             * @param {*=} opt_newValue The input value.
             * @return {?string} A valid colour, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Update the value of this colour field, and update the displayed colour.
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is a colour in '#rrggbb' format.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Get the text for this field.  Used when the block is collapsed.
             * @return {string} Text representing the value of this field.
             */
            getText(): string;
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Set a custom colour grid for this field.
             * @param {Array.<string>} colours Array of colours for this block,
             *     or null to use default (Blockly.FieldColour.COLOURS).
             * @param {Array.<string>=} opt_titles Optional array of colour tooltips,
             *     or null to use default (Blockly.FieldColour.TITLES).
             * @return {!Blockly.FieldColour} Returns itself (for method chaining).
             */
            setColours(colours: string[], opt_titles?: string[]): Blockly.FieldColour;
    
            /**
             * Set a custom grid size for this field.
             * @param {number} columns Number of columns for this block,
             *     or 0 to use default (Blockly.FieldColour.COLUMNS).
             * @return {!Blockly.FieldColour} Returns itself (for method chaining).
             */
            setColumns(columns: number): Blockly.FieldColour;
    
            /**
             * Create and show the colour field's editor.
             * @protected
             */
            showEditor_(): void;
    
            /**
             * Handles the given action.
             * This is only triggered when keyboard accessibility mode is enabled.
             * @param {!Blockly.Action} action The action to be handled.
             * @return {boolean} True if the field handled the action, false otherwise.
             * @package
             */
            onBlocklyAction(action: Blockly.Action): boolean;
    } 
    
}

declare module Blockly.FieldColour {

    /**
     * Construct a FieldColour from a JSON arg object.
     * @param {!Object} options A JSON object with options (colour).
     * @return {!Blockly.FieldColour} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldColour;

    /**
     * An array of colour strings for the palette.
     * Copied from goog.ui.ColorPicker.SIMPLE_GRID_COLORS
     * All colour pickers use this unless overridden with setColours.
     * @type {!Array.<string>}
     */
    var COLOURS: string[];

    /**
     * An array of tooltip strings for the palette.  If not the same length as
     * COLOURS, the colour's hex code will be used for any missing titles.
     * All colour pickers use this unless overridden with setColours.
     * @type {!Array.<string>}
     */
    var TITLES: string[];

    /**
     * Number of columns in the palette.
     * All colour pickers use this unless overridden with setColumns.
     */
    var COLUMNS: any /*missing*/;
}


declare module Blockly {

    class FieldDropdown extends FieldDropdown__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldDropdown__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for an editable dropdown field.
             * @param {(!Array.<!Array>|!Function)} menuGenerator A non-empty array of
             *     options for a dropdown list, or a function which generates these options.
             * @param {Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a language-neutral dropdown
             *    option & returns a validated language-neutral dropdown option, or null to
             *    abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
             */
            constructor(menuGenerator: any[][]|Function, opt_validator?: Function, opt_config?: Object);
    
            /**
             * An array of options for a dropdown list,
             * or a function which generates these options.
             * @type {(!Array.<!Array>|
             *    !function(this:Blockly.FieldDropdown): !Array.<!Array>)}
             * @protected
             */
            menuGenerator_: any[][]|{ (): any[][] };
    
            /**
             * The prefix field label, of common words set after options are trimmed.
             * @type {?string}
             * @package
             */
            prefixField: string;
    
            /**
             * The suffix field label, of common words set after options are trimmed.
             * @type {?string}
             * @package
             */
            suffixField: string;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Mouse cursor style when over the hotspot that initiates the editor.
             */
            CURSOR: any /*missing*/;
    
            /**
             * Create the block UI for this dropdown.
             * @package
             */
            initView(): void;
    
            /**
             * Whether or not the dropdown should add a border rect.
             * @return {boolean} True if the dropdown field should add a border rect.
             * @protected
             */
            shouldAddBorderRect_(): boolean;
    
            /**
             * Create a tspan based arrow.
             * @protected
             */
            createTextArrow_(): void;
    
            /**
             * Create an SVG based arrow.
             * @protected
             */
            createSVGArrow_(): void;
    
            /**
             * Create a dropdown menu under the text.
             * @param {Event=} opt_e Optional mouse event that triggered the field to open,
             *     or undefined if triggered programmatically.
             * @protected
             */
            showEditor_(opt_e?: Event): void;
    
            /**
             * Handle the selection of an item in the dropdown menu.
             * @param {!Blockly.Menu} menu The Menu component clicked.
             * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
             * @protected
             */
            onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem): void;
    
            /**
             * @return {boolean} True if the option list is generated by a function.
             *     Otherwise false.
             */
            isOptionListDynamic(): boolean;
    
            /**
             * Return a list of the options for this dropdown.
             * @param {boolean=} opt_useCache For dynamic options, whether or not to use the
             *     cached options or to re-generate them.
             * @return {!Array.<!Array>} A non-empty array of option tuples:
             *     (human-readable text or image, language-neutral name).
             * @throws {TypeError} If generated options are incorrectly structured.
             */
            getOptions(opt_useCache?: boolean): any[][];
    
            /**
             * Ensure that the input value is a valid language-neutral option.
             * @param {*=} opt_newValue The input value.
             * @return {?string} A valid language-neutral option, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Update the value of this dropdown field.
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is one of the valid dropdown options.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Updates the dropdown arrow to match the colour/style of the block.
             * @package
             */
            applyColour(): void;
    
            /**
             * Draws the border with the correct width.
             * @protected
             */
            render_(): void;
    
            /**
             * Handles the given action.
             * This is only triggered when keyboard accessibility mode is enabled.
             * @param {!Blockly.Action} action The action to be handled.
             * @return {boolean} True if the field handled the action, false otherwise.
             * @package
             */
            onBlocklyAction(action: Blockly.Action): boolean;
    } 
    
}

declare module Blockly.FieldDropdown {

    /**
     * Dropdown image properties.
     * @typedef {{
      *            src:string,
      *            alt:string,
      *            width:number,
      *            height:number
      *          }}
      */
    interface ImageProperties {
        src: string;
        alt: string;
        width: number;
        height: number
    }

    /**
     * Construct a FieldDropdown from a JSON arg object.
     * @param {!Object} options A JSON object with options (options).
     * @return {!Blockly.FieldDropdown} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldDropdown;

    /**
     * Horizontal distance that a checkmark overhangs the dropdown.
     */
    var CHECKMARK_OVERHANG: any /*missing*/;

    /**
     * Maximum height of the dropdown menu, as a percentage of the viewport height.
     */
    var MAX_MENU_HEIGHT_VH: any /*missing*/;

    /**
     * Android can't (in 2014) display "▾", so use "▼" instead.
     */
    var ARROW_CHAR: any /*missing*/;

    /**
     * Use the calculated prefix and suffix lengths to trim all of the options in
     * the given array.
     * @param {!Array.<!Array>} options Array of option tuples:
     *     (human-readable text or image, language-neutral name).
     * @param {number} prefixLength The length of the common prefix.
     * @param {number} suffixLength The length of the common suffix
     * @return {!Array.<!Array>} A new array with all of the option text trimmed.
     */
    function applyTrim_(options: any[][], prefixLength: number, suffixLength: number): any[][];
}


declare module Blockly {

    class FieldImage extends FieldImage__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldImage__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for an image on a block.
             * @param {string} src The URL of the image.
             * @param {!(string|number)} width Width of the image.
             * @param {!(string|number)} height Height of the image.
             * @param {string=} opt_alt Optional alt text for when block is collapsed.
             * @param {function(!Blockly.FieldImage)=} opt_onClick Optional function to be
             *     called when the image is clicked. If opt_onClick is defined, opt_alt must
             *     also be defined.
             * @param {boolean=} opt_flipRtl Whether to flip the icon in RTL.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/image#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             */
            constructor(src: string, width: string|number, height: string|number, opt_alt?: string, opt_onClick?: { (_0: Blockly.FieldImage): any /*missing*/ }, opt_flipRtl?: boolean, opt_config?: Object);
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Editable fields usually show some sort of UI indicating they are
             * editable. This field should not.
             * @type {boolean}
             */
            EDITABLE: boolean;
    
            /**
             * Used to tell if the field needs to be rendered the next time the block is
             * rendered. Image fields are statically sized, and only need to be
             * rendered at initialization.
             * @type {boolean}
             * @protected
             */
            isDirty_: boolean;
    
            /**
             * Create the block UI for this image.
             * @package
             */
            initView(): void;
    
            /**
             * Ensure that the input value (the source URL) is a string.
             * @param {*=} opt_newValue The input value.
             * @return {?string} A string, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Update the value of this image field, and update the displayed image.
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is a string.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Set the alt text of this image.
             * @param {?string} alt New alt text.
             * @public
             */
            setAlt(alt: string): void;
    
            /**
             * If field click is called, and click handler defined,
             * call the handler.
             * @protected
             */
            showEditor_(): void;
    
            /**
             * Set the function that is called when this image  is clicked.
             * @param {?function(!Blockly.FieldImage)} func The function that is called
             *    when the image is clicked, or null to remove.
             */
            setOnClickHandler(func: { (_0: Blockly.FieldImage): any /*missing*/ }): void;
    } 
    
}

declare module Blockly.FieldImage {

    /**
     * Construct a FieldImage from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (src, width, height,
     *    alt, and flipRtl).
     * @return {!Blockly.FieldImage} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldImage;
}


declare module Blockly {

    class FieldLabel extends FieldLabel__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldLabel__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for a non-editable, non-serializable text field.
             * @param {string=} opt_value The initial value of the field. Should cast to a
             *    string. Defaults to an empty string if null or undefined.
             * @param {string=} opt_class Optional CSS class for the field's text.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             */
            constructor(opt_value?: string, opt_class?: string, opt_config?: Object);
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Editable fields usually show some sort of UI indicating they are
             * editable. This field should not.
             * @type {boolean}
             */
            EDITABLE: boolean;
    
            /**
             * Create block UI for this label.
             * @package
             */
            initView(): void;
    
            /**
             * Ensure that the input value casts to a valid string.
             * @param {*=} opt_newValue The input value.
             * @return {?string} A valid string, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Set the css class applied to the field's textElement_.
             * @param {?string} cssClass The new css class name, or null to remove.
             */
            setClass(cssClass: string): void;
    } 
    
}

declare module Blockly.FieldLabel {

    /**
     * Construct a FieldLabel from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and class).
     * @return {!Blockly.FieldLabel} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldLabel;
}


declare module Blockly {

    class FieldLabelSerializable extends FieldLabelSerializable__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldLabelSerializable__Class extends Blockly.FieldLabel__Class  { 
    
            /**
             * Class for a non-editable, serializable text field.
             * @param {*} opt_value The initial value of the field. Should cast to a
             *    string. Defaults to an empty string if null or undefined.
             * @param {string=} opt_class Optional CSS class for the field's text.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/label-serializable#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.FieldLabel}
             * @constructor
             *
             */
            constructor(opt_value: any, opt_class?: string, opt_config?: Object);
    
            /**
             * Editable fields usually show some sort of UI indicating they are
             * editable. This field should not.
             * @type {boolean}
             */
            EDITABLE: boolean;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not.  This field should be serialized, but only edited programmatically.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    } 
    
}

declare module Blockly.FieldLabelSerializable {

    /**
     * Construct a FieldLabelSerializable from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and class).
     * @return {!Blockly.FieldLabelSerializable} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldLabelSerializable;
}


declare module Blockly {

    class FieldMultilineInput extends FieldMultilineInput__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldMultilineInput__Class extends Blockly.FieldTextInput__Class  { 
    
            /**
             * Class for an editable text area field.
             * @param {string=} opt_value The initial content of the field. Should cast to a
             *    string. Defaults to an empty string if null or undefined.
             * @param {Function=} opt_validator An optional function that is called
             *     to validate any constraints on what the user entered.  Takes the new
             *     text as an argument and returns either the accepted text, a replacement
             *     text, or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.FieldTextInput}
             * @constructor
             */
            constructor(opt_value?: string, opt_validator?: Function, opt_config?: Object);
    
            /**
             * The SVG group element that will contain a text element for each text row
             *     when initialized.
             * @type {SVGGElement}
             */
            textGroup_: SVGGElement;
    
            /**
             * Create the block UI for this field.
             * @package
             */
            initView(): void;
    
            /**
             * Updates the text of the textElement.
             * @protected
             */
            render_(): void;
    
            /**
             * Updates the size of the field based on the text.
             * @protected
             */
            updateSize_(): void;
    
            /**
             * Create the text input editor widget.
             * @return {!HTMLTextAreaElement} The newly created text input editor.
             * @protected
             */
            widgetCreate_(): HTMLTextAreaElement;
    
            /**
             * Handle key down to the editor. Override the text input definition of this
             * so as to not close the editor when enter is typed in.
             * @param {!Event} e Keyboard event.
             * @protected
             */
            onHtmlInputKeyDown_(e: Event): void;
    } 
    
}

declare module Blockly.FieldMultilineInput {

    /**
     * Construct a FieldMultilineInput from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and spellcheck).
     * @return {!Blockly.FieldMultilineInput} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldMultilineInput;
}


declare module Blockly {

    class FieldNumber extends FieldNumber__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldNumber__Class extends Blockly.FieldTextInput__Class  { 
    
            /**
             * Class for an editable number field.
             * @param {string|number=} opt_value The initial value of the field. Should cast
             *    to a number. Defaults to 0.
             * @param {?(string|number)=} opt_min Minimum value.
             * @param {?(string|number)=} opt_max Maximum value.
             * @param {?(string|number)=} opt_precision Precision for value.
             * @param {?Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a number & returns a validated
             *    number, or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.FieldTextInput}
             * @constructor
             */
            constructor(opt_value?: string|number, opt_min?: string|number, opt_max?: string|number, opt_precision?: string|number, opt_validator?: Function, opt_config?: Object);
    
            /**
             * The minimum value this number field can contain.
             * @type {number}
             * @protected
             */
            min_: number;
    
            /**
             * The maximum value this number field can contain.
             * @type {number}
             * @protected
             */
            max_: number;
    
            /**
             * The multiple to which this fields value is rounded.
             * @type {number}
             * @protected
             */
            precision_: number;
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Set the maximum, minimum and precision constraints on this field.
             * Any of these properties may be undefined or NaN to be disabled.
             * Setting precision (usually a power of 10) enforces a minimum step between
             * values. That is, the user's value will rounded to the closest multiple of
             * precision. The least significant digit place is inferred from the precision.
             * Integers values can be enforces by choosing an integer precision.
             * @param {?(number|string|undefined)} min Minimum value.
             * @param {?(number|string|undefined)} max Maximum value.
             * @param {?(number|string|undefined)} precision Precision for value.
             */
            setConstraints(min: number|string|any /*undefined*/, max: number|string|any /*undefined*/, precision: number|string|any /*undefined*/): void;
    
            /**
             * Sets the minimum value this field can contain. Updates the value to reflect.
             * @param {?(number|string|undefined)} min Minimum value.
             */
            setMin(min: number|string|any /*undefined*/): void;
    
            /**
             * Returns the current minimum value this field can contain. Default is
             * -Infinity.
             * @return {number} The current minimum value this field can contain.
             */
            getMin(): number;
    
            /**
             * Sets the maximum value this field can contain. Updates the value to reflect.
             * @param {?(number|string|undefined)} max Maximum value.
             */
            setMax(max: number|string|any /*undefined*/): void;
    
            /**
             * Returns the current maximum value this field can contain. Default is
             * Infinity.
             * @return {number} The current maximum value this field can contain.
             */
            getMax(): number;
    
            /**
             * Sets the precision of this field's value, i.e. the number to which the
             * value is rounded. Updates the field to reflect.
             * @param {?(number|string|undefined)} precision The number to which the
             *    field's value is rounded.
             */
            setPrecision(precision: number|string|any /*undefined*/): void;
    
            /**
             * Returns the current precision of this field. The precision being the
             * number to which the field's value is rounded. A precision of 0 means that
             * the value is not rounded.
             * @return {number} The number to which this field's value is rounded.
             */
            getPrecision(): number;
    } 
    
}

declare module Blockly.FieldNumber {

    /**
     * Construct a FieldNumber from a JSON arg object.
     * @param {!Object} options A JSON object with options (value, min, max, and
     *                          precision).
     * @return {!Blockly.FieldNumber} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldNumber;
}


declare module Blockly.fieldRegistry {

    /**
     * Registers a field type.
     * Blockly.fieldRegistry.fromJson uses this registry to
     * find the appropriate field type.
     * @param {string} type The field type name as used in the JSON definition.
     * @param {?function(new:Blockly.Field, ...?)} fieldClass The field class
     *     containing a fromJson function that can construct an instance of the
     *     field.
     * @throws {Error} if the type name is empty, the field is already
     *     registered, or the fieldClass is not an object containing a fromJson
     *     function.
     */
    function register(type: string, fieldClass: { (_0: any[]): any /*missing*/ }): void;

    /**
     * Unregisters the field registered with the given type.
     * @param {string} type The field type name as used in the JSON definition.
     */
    function unregister(type: string): void;

    /**
     * Construct a Field from a JSON arg object.
     * Finds the appropriate registered field by the type name as registered using
     * Blockly.fieldRegistry.register.
     * @param {!Object} options A JSON object with a type and options specific
     *     to the field type.
     * @return {Blockly.Field} The new field instance or null if a field wasn't
     *     found with the given type name
     * @package
     */
    function fromJson(options: Object): Blockly.Field;
}


declare module Blockly {

    class FieldTextInput extends FieldTextInput__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldTextInput__Class extends Blockly.Field__Class  { 
    
            /**
             * Class for an editable text field.
             * @param {string=} opt_value The initial value of the field. Should cast to a
             *    string. Defaults to an empty string if null or undefined.
             * @param {?Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a string & returns a validated
             *    string, or null to abort the change.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.Field}
             * @constructor
             */
            constructor(opt_value?: string, opt_validator?: Function, opt_config?: Object);
    
            /**
             * Allow browser to spellcheck this field.
             * @type {boolean}
             * @protected
             */
            spellcheck_: boolean;
    
            /**
             * The HTML input element.
             * @type {HTMLElement}
             */
            htmlInput_: HTMLElement;
    
            /**
             * Whether the field should consider the whole parent block to be its click
             * target.
             * @type {?boolean}
             */
            fullBlockClickTarget_: boolean;
    
            /**
             * The workspace that this field belongs to.
             * @type {?Blockly.WorkspaceSvg}
             * @protected
             */
            workspace_: Blockly.WorkspaceSvg;
    
            /**
             * The default value for this field.
             * @type {*}
             * @protected
             */
            DEFAULT_VALUE: any;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Mouse cursor style when over the hotspot that initiates the editor.
             */
            CURSOR: any /*missing*/;
    
            /**
             * Ensure that the input value casts to a valid string.
             * @param {*=} opt_newValue The input value.
             * @return {*} A valid string, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): any;
    
            /**
             * Called by setValue if the text input is not valid. If the field is
             * currently being edited it reverts value of the field to the previous
             * value while allowing the display text to be handled by the htmlInput_.
             * @param {*} _invalidValue The input value that was determined to be invalid.
             *    This is not used by the text input because its display value is stored on
             *    the htmlInput_.
             * @protected
             */
            doValueInvalid_(_invalidValue: any): void;
    
            /**
             * Called by setValue if the text input is valid. Updates the value of the
             * field, and updates the text of the field if it is not currently being
             * edited (i.e. handled by the htmlInput_).
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is a string.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
            /**
             * Updates text field to match the colour/style of the block.
             * @package
             */
            applyColour(): void;
    
            /**
             * Updates the colour of the htmlInput given the current validity of the
             * field's value.
             * @protected
             */
            render_(): void;
    
            /**
             * Set whether this field is spellchecked by the browser.
             * @param {boolean} check True if checked.
             */
            setSpellcheck(check: boolean): void;
    
            /**
             * Show the inline free-text editor on top of the text.
             * @param {Event=} _opt_e Optional mouse event that triggered the field to open,
             *     or undefined if triggered programmatically.
             * @param {boolean=} opt_quietInput True if editor should be created without
             *     focus.  Defaults to false.
             * @protected
             */
            showEditor_(_opt_e?: Event, opt_quietInput?: boolean): void;
    
            /**
             * Create the text input editor widget.
             * @return {!HTMLElement} The newly created text input editor.
             * @protected
             */
            widgetCreate_(): HTMLElement;
    
            /**
             * Bind handlers for user input on the text input field's editor.
             * @param {!HTMLElement} htmlInput The htmlInput to which event
             *    handlers will be bound.
             * @protected
             */
            bindInputEvents_(htmlInput: HTMLElement): void;
    
            /**
             * Handle key down to the editor.
             * @param {!Event} e Keyboard event.
             * @protected
             */
            onHtmlInputKeyDown_(e: Event): void;
    
            /**
             * Set the html input value and the field's internal value. The difference
             * between this and ``setValue`` is that this also updates the html input
             * value whilst editing.
             * @param {*} newValue New value.
             * @protected
             */
            setEditorValue_(newValue: any): void;
    
            /**
             * Resize the editor to fit the text.
             * @protected
             */
            resizeEditor_(): void;
    
            /**
             * Transform the provided value into a text to show in the html input.
             * Override this method if the field's html input representation is different
             * than the field's value. This should be coupled with an override of
             * `getValueFromEditorText_`.
             * @param {*} value The value stored in this field.
             * @return {string} The text to show on the html input.
             * @protected
             */
            getEditorText_(value: any): string;
    
            /**
             * Transform the text received from the html input into a value to store
             * in this field.
             * Override this method if the field's html input representation is different
             * than the field's value. This should be coupled with an override of
             * `getEditorText_`.
             * @param {string} text Text received from the html input.
             * @return {*} The value to store.
             * @protected
             */
            getValueFromEditorText_(text: string): any;
    } 
    
}

declare module Blockly.FieldTextInput {

    /**
     * Construct a FieldTextInput from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (text, and spellcheck).
     * @return {!Blockly.FieldTextInput} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldTextInput;

    /**
     * Pixel size of input border radius.
     * Should match blocklyText's border-radius in CSS.
     */
    var BORDERRADIUS: any /*missing*/;

    /**
     * Ensure that only a number may be entered.
     * @param {string} text The user's text.
     * @return {?string} A string representing a valid number, or null if invalid.
     * @deprecated
     */
    function numberValidator(text: string): string;

    /**
     * Ensure that only a non-negative integer may be entered.
     * @param {string} text The user's text.
     * @return {?string} A string representing a valid int, or null if invalid.
     * @deprecated
     */
    function nonnegativeIntegerValidator(text: string): string;
}


declare module Blockly {

    class FieldVariable extends FieldVariable__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FieldVariable__Class extends Blockly.FieldDropdown__Class  { 
    
            /**
             * Class for a variable's dropdown field.
             * @param {?string} varName The default name for the variable.  If null,
             *     a unique variable name will be generated.
             * @param {Function=} opt_validator A function that is called to validate
             *    changes to the field's value. Takes in a variable ID  & returns a
             *    validated variable ID, or null to abort the change.
             * @param {Array.<string>=} opt_variableTypes A list of the types of variables
             *     to include in the dropdown.
             * @param {string=} opt_defaultType The type of variable to create if this
             *     field's value is not explicitly set.  Defaults to ''.
             * @param {Object=} opt_config A map of options used to configure the field.
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/variable#creation}
             *    for a list of properties this parameter supports.
             * @extends {Blockly.FieldDropdown}
             * @constructor
             */
            constructor(varName: string, opt_validator?: Function, opt_variableTypes?: string[], opt_defaultType?: string, opt_config?: Object);
    
            /**
             * An array of options for a dropdown list,
             * or a function which generates these options.
             * @type {(!Array.<!Array>|
             *    !function(this:Blockly.FieldDropdown): !Array.<!Array>)}
             * @protected
             */
            menuGenerator_: any[][]|{ (): any[][] };
    
            /**
             * The initial variable name passed to this field's constructor, or an
             * empty string if a name wasn't provided. Used to create the initial
             * variable.
             * @type {string}
             */
            defaultVariableName: string;
    
            /**
             * Serializable fields are saved by the XML renderer, non-serializable fields
             * are not. Editable fields should also be serializable.
             * @type {boolean}
             */
            SERIALIZABLE: boolean;
    
            /**
             * Configure the field based on the given map of options.
             * @param {!Object} config A map of options to configure the field based on.
             * @protected
             */
            configure_(config: Object): void;
    
            /**
             * Initialize the model for this field if it has not already been initialized.
             * If the value has not been set to a variable by the first render, we make up a
             * variable rather than let the value be invalid.
             * @package
             */
            initModel(): void;
    
            /**
             * Initialize this field based on the given XML.
             * @param {!Element} fieldElement The element containing information about the
             *    variable field's state.
             */
            fromXml(fieldElement: Element): void;
    
            /**
             * Serialize this field to XML.
             * @param {!Element} fieldElement The element to populate with info about the
             *    field's state.
             * @return {!Element} The element containing info about the field's state.
             */
            toXml(fieldElement: Element): Element;
    
            /**
             * Attach this field to a block.
             * @param {!Blockly.Block} block The block containing this field.
             */
            setSourceBlock(block: Blockly.Block): void;
    
            /**
             * Get the variable's ID.
             * @return {string} Current variable's ID.
             */
            getValue(): string;
    
            /**
             * Get the text from this field, which is the selected variable's name.
             * @return {string} The selected variable's name, or the empty string if no
             *     variable is selected.
             */
            getText(): string;
    
            /**
             * Get the variable model for the selected variable.
             * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
             * after the variable has been deleted).
             * @return {Blockly.VariableModel} The selected variable, or null if none was
             *     selected.
             * @package
             */
            getVariable(): Blockly.VariableModel;
    
            /**
             * Gets the validation function for this field, or null if not set.
             * Returns null if the variable is not set, because validators should not
             * run on the initial setValue call, because the field won't be attached to
             * a block and workspace at that point.
             * @return {Function} Validation function, or null.
             */
            getValidator(): Function;
    
            /**
             * Ensure that the id belongs to a valid variable of an allowed type.
             * @param {*=} opt_newValue The id of the new variable to set.
             * @return {?string} The validated id, or null if invalid.
             * @protected
             */
            doClassValidation_(opt_newValue?: any): string;
    
            /**
             * Update the value of this variable field, as well as its variable and text.
             *
             * The variable ID should be valid at this point, but if a variable field
             * validator returns a bad ID, this could break.
             * @param {*} newId The value to be saved.
             * @protected
             */
            doValueUpdate_(newId: any): void;
    
            /**
             * Refreshes the name of the variable by grabbing the name of the model.
             * Used when a variable gets renamed, but the ID stays the same. Should only
             * be called by the block.
             * @package
             */
            refreshVariableName(): void;
    
            /**
             * Handle the selection of an item in the variable dropdown menu.
             * Special case the 'Rename variable...' and 'Delete variable...' options.
             * In the rename case, prompt the user for a new name.
             * @param {!Blockly.Menu} menu The Menu component clicked.
             * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
             * @protected
             */
            onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem): void;
    } 
    
}

declare module Blockly.FieldVariable {

    /**
     * Construct a FieldVariable from a JSON arg object,
     * dereferencing any string table references.
     * @param {!Object} options A JSON object with options (variable,
     *                          variableTypes, and defaultType).
     * @return {!Blockly.FieldVariable} The new field instance.
     * @package
     * @nocollapse
     */
    function fromJson(options: Object): Blockly.FieldVariable;

    /**
     * Return a sorted list of variable names for variable dropdown menus.
     * Include a special option at the end for creating a new variable name.
     * @return {!Array.<!Array>} Array of variable names/id tuples.
     * @this {Blockly.FieldVariable}
     */
    function dropdownCreate(): any[][];
}


declare module Blockly {

    class Flyout extends Flyout__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Flyout__Class implements Blockly.IBlocklyActionable, Blockly.IDeleteArea  { 
    
            /**
             * Class for a flyout.
             * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
             *     workspace.
             * @constructor
             * @abstract
             * @implements {Blockly.IBlocklyActionable}
             * @implements {Blockly.IDeleteArea}
             */
            constructor(workspaceOptions: Blockly.Options);
    
            /**
             * @type {!Blockly.WorkspaceSvg}
             * @protected
             */
            workspace_: Blockly.WorkspaceSvg;
    
            /**
             * Is RTL vs LTR.
             * @type {boolean}
             */
            RTL: boolean;
    
            /**
             * Whether the flyout should be laid out horizontally or not.
             * @type {boolean}
             * @package
             */
            horizontalLayout: boolean;
    
            /**
             * Position of the toolbox and flyout relative to the workspace.
             * @type {number}
             * @protected
             */
            toolboxPosition_: number;
    
            /**
             * List of visible buttons.
             * @type {!Array.<!Blockly.FlyoutButton>}
             * @protected
             */
            buttons_: Blockly.FlyoutButton[];
    
            /**
             * Width of output tab.
             * @type {number}
             * @protected
             * @const
             */
            tabWidth_: number;
    
            /**
             * The target workspace
             * @type {?Blockly.WorkspaceSvg}
             * @package
             */
            targetWorkspace: Blockly.WorkspaceSvg;
    
            /**
             * Does the flyout automatically close when a block is created?
             * @type {boolean}
             */
            autoClose: boolean;
    
            /**
             * Corner radius of the flyout background.
             * @type {number}
             * @const
             */
            CORNER_RADIUS: number;
    
            /**
             * Margin around the edges of the blocks in the flyout.
             * @type {number}
             * @const
             */
            MARGIN: number;
    
            /**
             * Gap between items in horizontal flyouts. Can be overridden with the "sep"
             * element.
             * @const {number}
             */
            GAP_X: any /*missing*/;
    
            /**
             * Gap between items in vertical flyouts. Can be overridden with the "sep"
             * element.
             * @const {number}
             */
            GAP_Y: any /*missing*/;
    
            /**
             * Top/bottom padding between scrollbar and edge of flyout background.
             * @type {number}
             * @const
             */
            SCROLLBAR_PADDING: number;
    
            /**
             * Width of flyout.
             * @type {number}
             * @protected
             */
            width_: number;
    
            /**
             * Height of flyout.
             * @type {number}
             * @protected
             */
            height_: number;
    
            /**
             * Range of a drag angle from a flyout considered "dragging toward workspace".
             * Drags that are within the bounds of this many degrees from the orthogonal
             * line to the flyout edge are considered to be "drags toward the workspace".
             * Example:
             * Flyout                                                  Edge   Workspace
             * [block] /  <-within this angle, drags "toward workspace" |
             * [block] ---- orthogonal to flyout boundary ----          |
             * [block] \                                                |
             * The angle is given in degrees from the orthogonal.
             *
             * This is used to know when to create a new block and when to scroll the
             * flyout. Setting it to 360 means that all drags create a new block.
             * @type {number}
             * @protected
            */
            dragAngleRange_: number;
    
            /**
             * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
             * either exist as its own svg element or be a g element nested inside a
             * separate svg element.
             * @param {string} tagName The type of tag to put the flyout in. This
             *     should be <svg> or <g>.
             * @return {!SVGElement} The flyout's SVG group.
             */
            createDom(tagName: string): SVGElement;
    
            /**
             * Initializes the flyout.
             * @param {!Blockly.WorkspaceSvg} targetWorkspace The workspace in which to
             *     create new blocks.
             */
            init(targetWorkspace: Blockly.WorkspaceSvg): void;
    
            /**
             * @type {!Blockly.Scrollbar}
             * @package
             */
            scrollbar: Blockly.Scrollbar;
    
            /**
             * Dispose of this flyout.
             * Unlink from all DOM elements to prevent memory leaks.
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Get the width of the flyout.
             * @return {number} The width of the flyout.
             */
            getWidth(): number;
    
            /**
             * Get the height of the flyout.
             * @return {number} The width of the flyout.
             */
            getHeight(): number;
    
            /**
             * Get the workspace inside the flyout.
             * @return {!Blockly.WorkspaceSvg} The workspace inside the flyout.
             * @package
             */
            getWorkspace(): Blockly.WorkspaceSvg;
    
            /**
             * Is the flyout visible?
             * @return {boolean} True if visible.
             */
            isVisible(): boolean;
    
            /**
             * Set whether the flyout is visible. A value of true does not necessarily mean
             * that the flyout is shown. It could be hidden because its container is hidden.
             * @param {boolean} visible True if visible.
             */
            setVisible(visible: boolean): void;
    
            /**
             * Set whether this flyout's container is visible.
             * @param {boolean} visible Whether the container is visible.
             */
            setContainerVisible(visible: boolean): void;
    
            /**
             * Update the view based on coordinates calculated in position().
             * @param {number} width The computed width of the flyout's SVG group
             * @param {number} height The computed height of the flyout's SVG group.
             * @param {number} x The computed x origin of the flyout's SVG group.
             * @param {number} y The computed y origin of the flyout's SVG group.
             * @protected
             */
            positionAt_(width: number, height: number, x: number, y: number): void;
    
            /**
             * Hide and empty the flyout.
             */
            hide(): void;
    
            /**
             * Show and populate the flyout.
             * @param {!Blockly.utils.toolbox.ToolboxDefinition|string} flyoutDef
             *    List of contents to display in the flyout as an array of xml an
             *    array of Nodes, a NodeList or a string with the name of the dynamic category.
             *    Variables and procedures have a custom set of blocks.
             */
            show(flyoutDef: Blockly.utils.toolbox.ToolboxDefinition|string): void;
    
            /**
             * Add listeners to a block that has been added to the flyout.
             * @param {!SVGElement} root The root node of the SVG group the block is in.
             * @param {!Blockly.BlockSvg} block The block to add listeners for.
             * @param {!SVGElement} rect The invisible rectangle under the block that acts
             *     as a mat for that block.
             * @protected
             */
            addBlockListeners_(root: SVGElement, block: Blockly.BlockSvg, rect: SVGElement): void;
    
            /**
             * Does this flyout allow you to create a new instance of the given block?
             * Used for deciding if a block can be "dragged out of" the flyout.
             * @param {!Blockly.BlockSvg} block The block to copy from the flyout.
             * @return {boolean} True if you can create a new instance of the block, false
             *    otherwise.
             * @package
             */
            isBlockCreatable_(block: Blockly.BlockSvg): boolean;
    
            /**
             * Create a copy of this block on the workspace.
             * @param {!Blockly.BlockSvg} originalBlock The block to copy from the flyout.
             * @return {!Blockly.BlockSvg} The newly created block.
             * @throws {Error} if something went wrong with deserialization.
             * @package
             */
            createBlock(originalBlock: Blockly.BlockSvg): Blockly.BlockSvg;
    
            /**
             * Initialize the given button: move it to the correct location,
             * add listeners, etc.
             * @param {!Blockly.FlyoutButton} button The button to initialize and place.
             * @param {number} x The x position of the cursor during this layout pass.
             * @param {number} y The y position of the cursor during this layout pass.
             * @protected
             */
            initFlyoutButton_(button: Blockly.FlyoutButton, x: number, y: number): void;
    
            /**
             * Create and place a rectangle corresponding to the given block.
             * @param {!Blockly.BlockSvg} block The block to associate the rect to.
             * @param {number} x The x position of the cursor during this layout pass.
             * @param {number} y The y position of the cursor during this layout pass.
             * @param {!{height: number, width: number}} blockHW The height and width of the
             *     block.
             * @param {number} index The index into the mats list where this rect should be
             *     placed.
             * @return {!SVGElement} Newly created SVG element for the rectangle behind the
             *     block.
             * @protected
             */
            createRect_(block: Blockly.BlockSvg, x: number, y: number, blockHW: { height: number; width: number }, index: number): SVGElement;
    
            /**
             * Move a rectangle to sit exactly behind a block, taking into account tabs,
             * hats, and any other protrusions we invent.
             * @param {!SVGElement} rect The rectangle to move directly behind the block.
             * @param {!Blockly.BlockSvg} block The block the rectangle should be behind.
             * @protected
             */
            moveRectToBlock_(rect: SVGElement, block: Blockly.BlockSvg): void;
    
            /**
             * Reflow blocks and their mats.
             */
            reflow(): void;
    
            /**
             * @return {boolean} True if this flyout may be scrolled with a scrollbar or by
             *     dragging.
             * @package
             */
            isScrollable(): boolean;
    
            /**
             * Handles the given action.
             * This is only triggered when keyboard accessibility mode is enabled.
             * @param {!Blockly.Action} action The action to be handled.
             * @return {boolean} True if the flyout handled the action, false otherwise.
             * @package
             */
            onBlocklyAction(action: Blockly.Action): boolean;
    
            /**
             * Return the deletion rectangle for this flyout in viewport coordinates.
             * @return {Blockly.utils.Rect} Rectangle in which to delete.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Position the flyout.
             * @return {void}
             */
            position(): void;
    
            /**
             * Determine if a drag delta is toward the workspace, based on the position
             * and orientation of the flyout. This is used in determineDragIntention_ to
             * determine if a new block should be created or if the flyout should scroll.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at mouse down, in pixel units.
             * @return {boolean} True if the drag is toward the workspace.
             * @package
             */
            isDragTowardWorkspace(currentDragDeltaXY: Blockly.utils.Coordinate): boolean;
    
            /**
             * Return an object with all the metrics required to size scrollbars for the
             * flyout.
             * @return {Blockly.utils.Metrics} Contains size and position metrics of the
             *     flyout.
             * @protected
             */
            getMetrics_(): Blockly.utils.Metrics;
    
            /**
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Lay out the blocks in the flyout.
             * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array.<number>} gaps The visible gaps between blocks.
             * @protected
             */
            layout_(contents: Object[], gaps: number[]): void;
    
            /**
             * Scroll the flyout.
             * @param {!Event} e Mouse wheel scroll event.
             * @protected
             */
            wheel_(e: Event): void;
    
            /**
             * Compute height of flyout.  Position mat under each block.
             * For RTL: Lay out the blocks right-aligned.
             * @return {void}
             * @protected
             */
            reflowInternal_(): void;
    } 
    
}


declare module Blockly {

    class FlyoutButton extends FlyoutButton__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FlyoutButton__Class  { 
    
            /**
             * Class for a button in the flyout.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
             *     button.
             * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
             * @param {!Blockly.utils.toolbox.Button|!Blockly.utils.toolbox.Label} json
             *    The JSON specifying the label/button.
             * @param {boolean} isLabel Whether this button should be styled as a label.
             * @constructor
             * @package
             */
            constructor(workspace: Blockly.WorkspaceSvg, targetWorkspace: Blockly.WorkspaceSvg, json: Blockly.utils.toolbox.Button|Blockly.utils.toolbox.Label, isLabel: boolean);
    
            /**
             * The width of the button's rect.
             * @type {number}
             */
            width: number;
    
            /**
             * The height of the button's rect.
             * @type {number}
             */
            height: number;
    
            /**
             * Create the button elements.
             * @return {!SVGElement} The button's SVG group.
             */
            createDom(): SVGElement;
    
            /**
             * Correctly position the flyout button and make it visible.
             */
            show(): void;
    
            /**
             * Move the button to the given x, y coordinates.
             * @param {number} x The new x coordinate.
             * @param {number} y The new y coordinate.
             */
            moveTo(x: number, y: number): void;
    
            /**
             * Location of the button.
             * @return {!Blockly.utils.Coordinate} x, y coordinates.
             * @package
             */
            getPosition(): Blockly.utils.Coordinate;
    
            /**
             * Get the button's target workspace.
             * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
             *     button resides.
             */
            getTargetWorkspace(): Blockly.WorkspaceSvg;
    
            /**
             * Dispose of this button.
             */
            dispose(): void;
    } 
    
}

declare module Blockly.FlyoutButton {

    /**
     * The horizontal margin around the text in the button.
     */
    var MARGIN_X: any /*missing*/;

    /**
     * The vertical margin around the text in the button.
     */
    var MARGIN_Y: any /*missing*/;
}


declare module Blockly {

    class FlyoutDragger extends FlyoutDragger__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FlyoutDragger__Class extends Blockly.WorkspaceDragger__Class  { 
    
            /**
             * Class for a flyout dragger.  It moves a flyout workspace around when it is
             * being dragged by a mouse or touch.
             * Note that the workspace itself manages whether or not it has a drag surface
             * and how to do translations based on that.  This simply passes the right
             * commands based on events.
             * @param {!Blockly.Flyout} flyout The flyout to drag.
             * @extends {Blockly.WorkspaceDragger}
             * @constructor
             */
            constructor(flyout: Blockly.Flyout);
    
            /**
             * Move the flyout based on the most recent mouse movements.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel coordinates.
             * @package
             */
            drag(currentDragDeltaXY: Blockly.utils.Coordinate): void;
    } 
    
}


declare module Blockly {

    class HorizontalFlyout extends HorizontalFlyout__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class HorizontalFlyout__Class extends Blockly.Flyout__Class  { 
    
            /**
             * Class for a flyout.
             * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
             *     workspace.
             * @extends {Blockly.Flyout}
             * @constructor
             */
            constructor(workspaceOptions: Blockly.Options);
    
            /**
             * Return an object with all the metrics required to size scrollbars for the
             * flyout.  The following properties are computed:
             * .viewHeight: Height of the visible rectangle,
             * .viewWidth: Width of the visible rectangle,
             * .contentHeight: Height of the contents,
             * .contentWidth: Width of the contents,
             * .viewTop: Offset of top edge of visible rectangle from parent,
             * .contentTop: Offset of the top-most content from the y=0 coordinate,
             * .absoluteTop: Top-edge of view.
             * .viewLeft: Offset of the left edge of visible rectangle from parent,
             * .contentLeft: Offset of the left-most content from the x=0 coordinate,
             * .absoluteLeft: Left-edge of view.
             * @return {Blockly.utils.Metrics} Contains size and position metrics of the
             *     flyout.
             * @protected
             */
            getMetrics_(): Blockly.utils.Metrics;
    
            /**
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Move the flyout to the edge of the workspace.
             */
            position(): void;
    
            /**
             * Scroll the flyout to the top.
             */
            scrollToStart(): void;
    
            /**
             * Scroll the flyout.
             * @param {!Event} e Mouse wheel scroll event.
             * @protected
             */
            wheel_(e: Event): void;
    
            /**
             * Lay out the blocks in the flyout.
             * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array.<number>} gaps The visible gaps between blocks.
             * @protected
             */
            layout_(contents: Object[], gaps: number[]): void;
    
            /**
             * Determine if a drag delta is toward the workspace, based on the position
             * and orientation of the flyout. This is used in determineDragIntention_ to
             * determine if a new block should be created or if the flyout should scroll.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at mouse down, in pixel units.
             * @return {boolean} True if the drag is toward the workspace.
             * @package
             */
            isDragTowardWorkspace(currentDragDeltaXY: Blockly.utils.Coordinate): boolean;
    
            /**
             * Return the deletion rectangle for this flyout in viewport coordinates.
             * @return {Blockly.utils.Rect} Rectangle in which to delete.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Compute height of flyout.  Position mat under each block.
             * For RTL: Lay out the blocks right-aligned.
             * @protected
             */
            reflowInternal_(): void;
    } 
    
}


declare module Blockly {

    class VerticalFlyout extends VerticalFlyout__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VerticalFlyout__Class extends Blockly.Flyout__Class  { 
    
            /**
             * Class for a flyout.
             * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
             *     workspace.
             * @extends {Blockly.Flyout}
             * @constructor
             */
            constructor(workspaceOptions: Blockly.Options);
    
            /**
             * Return an object with all the metrics required to size scrollbars for the
             * flyout.  The following properties are computed:
             * .viewHeight: Height of the visible rectangle,
             * .viewWidth: Width of the visible rectangle,
             * .contentHeight: Height of the contents,
             * .contentWidth: Width of the contents,
             * .viewTop: Offset of top edge of visible rectangle from parent,
             * .contentTop: Offset of the top-most content from the y=0 coordinate,
             * .absoluteTop: Top-edge of view.
             * .viewLeft: Offset of the left edge of visible rectangle from parent,
             * .contentLeft: Offset of the left-most content from the x=0 coordinate,
             * .absoluteLeft: Left-edge of view.
             * @return {Blockly.utils.Metrics} Contains size and position metrics of the
             *     flyout.
             * @protected
             */
            getMetrics_(): Blockly.utils.Metrics;
    
            /**
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Move the flyout to the edge of the workspace.
             */
            position(): void;
    
            /**
             * Scroll the flyout to the top.
             */
            scrollToStart(): void;
    
            /**
             * Scroll the flyout.
             * @param {!Event} e Mouse wheel scroll event.
             * @protected
             */
            wheel_(e: Event): void;
    
            /**
             * Lay out the blocks in the flyout.
             * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array.<number>} gaps The visible gaps between blocks.
             * @protected
             */
            layout_(contents: Object[], gaps: number[]): void;
    
            /**
             * Determine if a drag delta is toward the workspace, based on the position
             * and orientation of the flyout. This is used in determineDragIntention_ to
             * determine if a new block should be created or if the flyout should scroll.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at mouse down, in pixel units.
             * @return {boolean} True if the drag is toward the workspace.
             * @package
             */
            isDragTowardWorkspace(currentDragDeltaXY: Blockly.utils.Coordinate): boolean;
    
            /**
             * Return the deletion rectangle for this flyout in viewport coordinates.
             * @return {Blockly.utils.Rect} Rectangle in which to delete.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Compute width of flyout.  Position mat under each block.
             * For RTL: Lay out the blocks and buttons to be right-aligned.
             * @protected
             */
            reflowInternal_(): void;
    } 
    
}


declare module Blockly {

    class Generator extends Generator__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Generator__Class  { 
    
            /**
             * Class for a code generator that translates the blocks into a language.
             * @param {string} name Language name of this generator.
             * @constructor
             */
            constructor(name: string);
    
            /**
             * Arbitrary code to inject into locations that risk causing infinite loops.
             * Any instances of '%1' will be replaced by the block ID that failed.
             * E.g. '  checkTimeout(%1);\n'
             * @type {?string}
             */
            INFINITE_LOOP_TRAP: string;
    
            /**
             * Arbitrary code to inject before every statement.
             * Any instances of '%1' will be replaced by the block ID of the statement.
             * E.g. 'highlight(%1);\n'
             * @type {?string}
             */
            STATEMENT_PREFIX: string;
    
            /**
             * Arbitrary code to inject after every statement.
             * Any instances of '%1' will be replaced by the block ID of the statement.
             * E.g. 'highlight(%1);\n'
             * @type {?string}
             */
            STATEMENT_SUFFIX: string;
    
            /**
             * The method of indenting.  Defaults to two spaces, but language generators
             * may override this to increase indent or change to tabs.
             * @type {string}
             */
            INDENT: string;
    
            /**
             * Maximum length for a comment before wrapping.  Does not account for
             * indenting level.
             * @type {number}
             */
            COMMENT_WRAP: number;
    
            /**
             * List of outer-inner pairings that do NOT require parentheses.
             * @type {!Array.<!Array.<number>>}
             */
            ORDER_OVERRIDES: number[][];
    
            /**
             * Generate code for all blocks in the workspace to the specified language.
             * @param {Blockly.Workspace} workspace Workspace to generate code from.
             * @return {string} Generated code.
             */
            workspaceToCode(workspace: Blockly.Workspace): string;
    
            /**
             * Prepend a common prefix onto each line of code.
             * Intended for indenting code or adding comment markers.
             * @param {string} text The lines of code.
             * @param {string} prefix The common prefix.
             * @return {string} The prefixed lines of code.
             */
            prefixLines(text: string, prefix: string): string;
    
            /**
             * Recursively spider a tree of blocks, returning all their comments.
             * @param {!Blockly.Block} block The block from which to start spidering.
             * @return {string} Concatenated list of comments.
             */
            allNestedComments(block: Blockly.Block): string;
    
            /**
             * Generate code for the specified block (and attached blocks).
             * @param {Blockly.Block} block The block to generate code for.
             * @param {boolean=} opt_thisOnly True to generate code for only this statement.
             * @return {string|!Array} For statement blocks, the generated code.
             *     For value blocks, an array containing the generated code and an
             *     operator order value.  Returns '' if block is null.
             */
            blockToCode(block: Blockly.Block, opt_thisOnly?: boolean): string|any[];
    
            /**
             * Generate code representing the specified value input.
             * @param {!Blockly.Block} block The block containing the input.
             * @param {string} name The name of the input.
             * @param {number} outerOrder The maximum binding strength (minimum order value)
             *     of any operators adjacent to "block".
             * @return {string} Generated code or '' if no blocks are connected or the
             *     specified input does not exist.
             */
            valueToCode(block: Blockly.Block, name: string, outerOrder: number): string;
    
            /**
             * Generate a code string representing the blocks attached to the named
             * statement input. Indent the code.
             * This is mainly used in generators. When trying to generate code to evaluate
             * look at using workspaceToCode or blockToCode.
             * @param {!Blockly.Block} block The block containing the input.
             * @param {string} name The name of the input.
             * @return {string} Generated code or '' if no blocks are connected.
             */
            statementToCode(block: Blockly.Block, name: string): string;
    
            /**
             * Add an infinite loop trap to the contents of a loop.
             * Add statement suffix at the start of the loop block (right after the loop
             * statement executes), and a statement prefix to the end of the loop block
             * (right before the loop statement executes).
             * @param {string} branch Code for loop contents.
             * @param {!Blockly.Block} block Enclosing block.
             * @return {string} Loop contents, with infinite loop trap added.
             */
            addLoopTrap(branch: string, block: Blockly.Block): string;
    
            /**
             * Inject a block ID into a message to replace '%1'.
             * Used for STATEMENT_PREFIX, STATEMENT_SUFFIX, and INFINITE_LOOP_TRAP.
             * @param {string} msg Code snippet with '%1'.
             * @param {!Blockly.Block} block Block which has an ID.
             * @return {string} Code snippet with ID.
             */
            injectId(msg: string, block: Blockly.Block): string;
    
            /**
             * Comma-separated list of reserved words.
             * @type {string}
             * @protected
             */
            RESERVED_WORDS_: string;
    
            /**
             * Add one or more words to the list of reserved words for this language.
             * @param {string} words Comma-separated list of words to add to the list.
             *     No spaces.  Duplicates are ok.
             */
            addReservedWords(words: string): void;
    
            /**
             * This is used as a placeholder in functions defined using
             * Blockly.Generator.provideFunction_.  It must not be legal code that could
             * legitimately appear in a function definition (or comment), and it must
             * not confuse the regular expression parser.
             * @type {string}
             * @protected
             */
            FUNCTION_NAME_PLACEHOLDER_: string;
    
            /**
             * A dictionary of definitions to be printed before the code.
             * @type {Object}
             * @protected
             */
            definitions_: Object;
    
            /**
             * A dictionary mapping desired function names in definitions_ to actual
             * function names (to avoid collisions with user functions).
             * @type {Object}
             * @protected
             */
            functionNames_: Object;
    
            /**
             * A database of variable names.
             * @type {Blockly.Names}
             * @protected
             */
            variableDB_: Blockly.Names;
    
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
            provideFunction_(desiredName: string, code: string[]): string;
    
            /**
             * Hook for code to run before code generation starts.
             * Subclasses may override this, e.g. to initialise the database of variable
             * names.
             * @param {!Blockly.Workspace} _workspace Workspace to generate code from.
             */
            init(_workspace: Blockly.Workspace): void;
    
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
            scrub_(_block: Blockly.Block, code: string, _opt_thisOnly?: boolean): string;
    
            /**
             * Hook for code to run at end of code generation.
             * Subclasses may override this, e.g. to prepend the generated code with the
             * variable definitions.
             * @param {string} code Generated code.
             * @return {string} Completed code.
             */
            finish(code: string): string;
    
            /**
             * Naked values are top-level blocks with outputs that aren't plugged into
             * anything.
             * Subclasses may override this, e.g. if their language does not allow
             * naked values.
             * @param {string} line Line of generated code.
             * @return {string} Legal line of code.
             */
            scrubNakedValue(line: string): string;
    } 
    
}

declare module Blockly.Generator {

    /**
     * Category to separate generated function names from variables and procedures.
     */
    var NAME_TYPE: any /*missing*/;
}


declare module Blockly {

    class Gesture extends Gesture__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Gesture__Class  { 
    
            /**
             * Class for one gesture.
             * @param {!Event} e The event that kicked off this gesture.
             * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
             *     this gesture and has a reference to it.
             * @constructor
             */
            constructor(e: Event, creatorWorkspace: Blockly.WorkspaceSvg);
    
            /**
             * The workspace that the gesture started on.  There may be multiple
             * workspaces on a page; this is more accurate than using
             * Blockly.getMainWorkspace().
             * @type {Blockly.WorkspaceSvg}
             * @protected
             */
            startWorkspace_: Blockly.WorkspaceSvg;
    
            /**
             * A handle to use to unbind a mouse move listener at the end of a drag.
             * Opaque data returned from Blockly.bindEventWithChecks_.
             * @type {?Blockly.EventData}
             * @protected
             */
            onMoveWrapper_: Blockly.EventData;
    
            /**
             * A handle to use to unbind a mouse up listener at the end of a drag.
             * Opaque data returned from Blockly.bindEventWithChecks_.
             * @type {?Blockly.EventData}
             * @protected
             */
            onUpWrapper_: Blockly.EventData;
    
            /**
             * Boolean used internally to break a cycle in disposal.
             * @type {boolean}
             * @protected
             */
            isEnding_: boolean;
    
            /**
             * Sever all links from this object.
             * @package
             */
            dispose(): void;
    
            /**
             * Start a gesture: update the workspace to indicate that a gesture is in
             * progress and bind mousemove and mouseup handlers.
             * @param {!Event} e A mouse down or touch start event.
             * @package
             */
            doStart(e: Event): void;
    
            /**
             * Bind gesture events.
             * @param {!Event} e A mouse down or touch start event.
             * @package
             */
            bindMouseEvents(e: Event): void;
    
            /**
             * Handle a mouse move or touch move event.
             * @param {!Event} e A mouse move or touch move event.
             * @package
             */
            handleMove(e: Event): void;
    
            /**
             * Handle a mouse up or touch end event.
             * @param {!Event} e A mouse up or touch end event.
             * @package
             */
            handleUp(e: Event): void;
    
            /**
             * Cancel an in-progress gesture.  If a workspace or block drag is in progress,
             * end the drag at the most recent location.
             * @package
             */
            cancel(): void;
    
            /**
             * Handle a real or faked right-click event by showing a context menu.
             * @param {!Event} e A mouse move or touch move event.
             * @package
             */
            handleRightClick(e: Event): void;
    
            /**
             * Handle a mousedown/touchstart event on a workspace.
             * @param {!Event} e A mouse down or touch start event.
             * @param {!Blockly.WorkspaceSvg} ws The workspace the event hit.
             * @package
             */
            handleWsStart(e: Event, ws: Blockly.WorkspaceSvg): void;
    
            /**
             * Handle a mousedown/touchstart event on a flyout.
             * @param {!Event} e A mouse down or touch start event.
             * @param {!Blockly.Flyout} flyout The flyout the event hit.
             * @package
             */
            handleFlyoutStart(e: Event, flyout: Blockly.Flyout): void;
    
            /**
             * Handle a mousedown/touchstart event on a block.
             * @param {!Event} e A mouse down or touch start event.
             * @param {!Blockly.BlockSvg} block The block the event hit.
             * @package
             */
            handleBlockStart(e: Event, block: Blockly.BlockSvg): void;
    
            /**
             * Handle a mousedown/touchstart event on a bubble.
             * @param {!Event} e A mouse down or touch start event.
             * @param {!Blockly.Bubble} bubble The bubble the event hit.
             * @package
             */
            handleBubbleStart(e: Event, bubble: Blockly.Bubble): void;
    
            /**
             * Record the field that a gesture started on.
             * @param {Blockly.Field} field The field the gesture started on.
             * @package
             */
            setStartField(field: Blockly.Field): void;
    
            /**
             * Record the bubble that a gesture started on
             * @param {Blockly.Bubble} bubble The bubble the gesture started on.
             * @package
             */
            setStartBubble(bubble: Blockly.Bubble): void;
    
            /**
             * Record the block that a gesture started on, and set the target block
             * appropriately.
             * @param {Blockly.BlockSvg} block The block the gesture started on.
             * @package
             */
            setStartBlock(block: Blockly.BlockSvg): void;
    
            /**
             * Whether this gesture is a drag of either a workspace or block.
             * This function is called externally to block actions that cannot be taken
             * mid-drag (e.g. using the keyboard to delete the selected blocks).
             * @return {boolean} True if this gesture is a drag of a workspace or block.
             * @package
             */
            isDragging(): boolean;
    
            /**
             * Whether this gesture has already been started.  In theory every mouse down
             * has a corresponding mouse up, but in reality it is possible to lose a
             * mouse up, leaving an in-process gesture hanging.
             * @return {boolean} Whether this gesture was a click on a workspace.
             * @package
             */
            hasStarted(): boolean;
    
            /**
             * Get a list of the insertion markers that currently exist.  Block drags have
             * 0, 1, or 2 insertion markers.
             * @return {!Array.<!Blockly.BlockSvg>} A possibly empty list of insertion
             *     marker blocks.
             * @package
             */
            getInsertionMarkers(): Blockly.BlockSvg[];
    } 
    
}

declare module Blockly.Gesture {

    /**
     * Is a drag or other gesture currently in progress on any workspace?
     * @return {boolean} True if gesture is occurring.
     */
    function inProgress(): boolean;
}


declare module Blockly {

    class Grid extends Grid__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Grid__Class  { 
    
            /**
             * Class for a workspace's grid.
             * @param {!SVGElement} pattern The grid's SVG pattern, created during
             *     injection.
             * @param {!Object} options A dictionary of normalized options for the grid.
             *     See grid documentation:
             *     https://developers.google.com/blockly/guides/configure/web/grid
             * @constructor
             */
            constructor(pattern: SVGElement, options: Object);
    
            /**
             * Dispose of this grid and unlink from the DOM.
             * @package
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Whether blocks should snap to the grid, based on the initial configuration.
             * @return {boolean} True if blocks should snap, false otherwise.
             * @package
             */
            shouldSnap(): boolean;
    
            /**
             * Get the spacing of the grid points (in px).
             * @return {number} The spacing of the grid points.
             * @package
             */
            getSpacing(): number;
    
            /**
             * Get the id of the pattern element, which should be randomized to avoid
             * conflicts with other Blockly instances on the page.
             * @return {string} The pattern ID.
             * @package
             */
            getPatternId(): string;
    
            /**
             * Update the grid with a new scale.
             * @param {number} scale The new workspace scale.
             * @package
             */
            update(scale: number): void;
    
            /**
             * Move the grid to a new x and y position, and make sure that change is
             * visible.
             * @param {number} x The new x position of the grid (in px).
             * @param {number} y The new y position of the grid (in px).
             * @package
             */
            moveTo(x: number, y: number): void;
    } 
    
}

declare module Blockly.Grid {

    /**
     * Create the DOM for the grid described by options.
     * @param {string} rnd A random ID to append to the pattern's ID.
     * @param {!Object} gridOptions The object containing grid configuration.
     * @param {!SVGElement} defs The root SVG element for this workspace's defs.
     * @return {!SVGElement} The SVG element for the grid pattern.
     * @package
     */
    function createDom(rnd: string, gridOptions: Object, defs: SVGElement): SVGElement;
}


declare module Blockly {

    class Icon extends Icon__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Icon__Class  { 
    
            /**
             * Class for an icon.
             * @param {Blockly.BlockSvg} block The block associated with this icon.
             * @constructor
             * @abstract
             */
            constructor(block: Blockly.BlockSvg);
    
            /**
             * The block this icon is attached to.
             * @type {Blockly.BlockSvg}
             * @protected
             */
            block_: Blockly.BlockSvg;
    
            /**
             * Does this icon get hidden when the block is collapsed.
             */
            collapseHidden: any /*missing*/;
    
            /**
             * Height and width of icons.
             */
            SIZE: any /*missing*/;
    
            /**
             * Bubble UI (if visible).
             * @type {Blockly.Bubble}
             * @protected
             */
            bubble_: Blockly.Bubble;
    
            /**
             * Absolute coordinate of icon's center.
             * @type {Blockly.utils.Coordinate}
             * @protected
             */
            iconXY_: Blockly.utils.Coordinate;
    
            /**
             * Create the icon on the block.
             */
            createIcon(): void;
    
            /**
             * Dispose of this icon.
             */
            dispose(): void;
    
            /**
             * Add or remove the UI indicating if this icon may be clicked or not.
             */
            updateEditable(): void;
    
            /**
             * Is the associated bubble visible?
             * @return {boolean} True if the bubble is visible.
             */
            isVisible(): boolean;
    
            /**
             * Clicking on the icon toggles if the bubble is visible.
             * @param {!Event} e Mouse click event.
             * @protected
             */
            iconClick_(e: Event): void;
    
            /**
             * Change the colour of the associated bubble to match its block.
             */
            applyColour(): void;
    
            /**
             * Notification that the icon has moved.  Update the arrow accordingly.
             * @param {!Blockly.utils.Coordinate} xy Absolute location in workspace coordinates.
             */
            setIconLocation(xy: Blockly.utils.Coordinate): void;
    
            /**
             * Notification that the icon has moved, but we don't really know where.
             * Recompute the icon's location from scratch.
             */
            computeIconLocation(): void;
    
            /**
             * Returns the center of the block's icon relative to the surface.
             * @return {Blockly.utils.Coordinate} Object with x and y properties in
             *     workspace coordinates.
             */
            getIconLocation(): Blockly.utils.Coordinate;
    
            /**
             * Get the size of the icon as used for rendering.
             * This differs from the actual size of the icon, because it bulges slightly
             * out of its row rather than increasing the height of its row.
             * @return {!Blockly.utils.Size} Height and width.
             */
            getCorrectedSize(): Blockly.utils.Size;
    
            /**
             * Draw the icon.
             * @param {!Element} group The icon group.
             * @protected
             */
            drawIcon_(group: Element): void;
    } 
    
}


declare module Blockly {

    /**
     * Inject a Blockly editor into the specified container element (usually a div).
     * @param {Element|string} container Containing element, or its ID,
     *     or a CSS selector.
     * @param {Blockly.BlocklyOptions=} opt_options Optional dictionary of options.
     * @return {!Blockly.WorkspaceSvg} Newly created main workspace.
     */
    function inject(container: Element|string, opt_options?: Blockly.BlocklyOptions): Blockly.WorkspaceSvg;
}


declare module Blockly {

    class Input extends Input__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Input__Class  { 
    
            /**
             * Class for an input with an optional field.
             * @param {number} type The type of the input.
             * @param {string} name Language-neutral identifier which may used to find this
             *     input again.
             * @param {!Blockly.Block} block The block containing this input.
             * @param {Blockly.Connection} connection Optional connection for this input.
             * @constructor
             */
            constructor(type: number, name: string, block: Blockly.Block, connection: Blockly.Connection);
    
            /** @type {number} */
            type: number;
    
            /** @type {string} */
            name: string;
    
            /** @type {Blockly.Connection} */
            connection: Blockly.Connection;
    
            /** @type {!Array.<!Blockly.Field>} */
            fieldRow: Blockly.Field[];
    
            /**
             * Alignment of input's fields (left, right or centre).
             * @type {number}
             */
            align: number;
    
            /**
             * Get the source block for this input.
             * @return {Blockly.Block} The source block, or null if there is none.
             */
            getSourceBlock(): Blockly.Block;
    
            /**
             * Add a field (or label from string), and all prefix and suffix fields, to the
             * end of the input's field row.
             * @param {string|!Blockly.Field} field Something to add as a field.
             * @param {string=} opt_name Language-neutral identifier which may used to find
             *     this field again.  Should be unique to the host block.
             * @return {!Blockly.Input} The input being append to (to allow chaining).
             */
            appendField(field: string|Blockly.Field, opt_name?: string): Blockly.Input;
    
            /**
             * Inserts a field (or label from string), and all prefix and suffix fields, at
             * the location of the input's field row.
             * @param {number} index The index at which to insert field.
             * @param {string|!Blockly.Field} field Something to add as a field.
             * @param {string=} opt_name Language-neutral identifier which may used to find
             *     this field again.  Should be unique to the host block.
             * @return {number} The index following the last inserted field.
             */
            insertFieldAt(index: number, field: string|Blockly.Field, opt_name?: string): number;
    
            /**
             * Remove a field from this input.
             * @param {string} name The name of the field.
             * @param {boolean=} opt_quiet True to prevent an error if field is not present.
             * @return {boolean} True if operation succeeds, false if field is not present
             *     and opt_quiet is true.
             * @throws {Error} if the field is not present and opt_quiet is false.
             */
            removeField(name: string, opt_quiet?: boolean): boolean;
    
            /**
             * Gets whether this input is visible or not.
             * @return {boolean} True if visible.
             */
            isVisible(): boolean;
    
            /**
             * Sets whether this input is visible or not.
             * Should only be used to collapse/uncollapse a block.
             * @param {boolean} visible True if visible.
             * @return {!Array.<!Blockly.BlockSvg>} List of blocks to render.
             * @package
             */
            setVisible(visible: boolean): Blockly.BlockSvg[];
    
            /**
             * Mark all fields on this input as dirty.
             * @package
             */
            markDirty(): void;
    
            /**
             * Change a connection's compatibility.
             * @param {string|Array.<string>|null} check Compatible value type or
             *     list of value types.  Null if all types are compatible.
             * @return {!Blockly.Input} The input being modified (to allow chaining).
             */
            setCheck(check: string|string[]|any /*null*/): Blockly.Input;
    
            /**
             * Change the alignment of the connection's field(s).
             * @param {number} align One of Blockly.ALIGN_LEFT, ALIGN_CENTRE, ALIGN_RIGHT.
             *   In RTL mode directions are reversed, and ALIGN_RIGHT aligns to the left.
             * @return {!Blockly.Input} The input being modified (to allow chaining).
             */
            setAlign(align: number): Blockly.Input;
    
            /**
             * Initialize the fields on this input.
             */
            init(): void;
    
            /**
             * Sever all links to this input.
             * @suppress {checkTypes}
             */
            dispose(): void;
    } 
    
}


declare module Blockly {

    class InsertionMarkerManager extends InsertionMarkerManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class InsertionMarkerManager__Class  { 
    
            /**
             * Class that controls updates to connections during drags.  It is primarily
             * responsible for finding the closest eligible connection and highlighting or
             * unhiglighting it as needed during a drag.
             * @param {!Blockly.BlockSvg} block The top block in the stack being dragged.
             * @constructor
             */
            constructor(block: Blockly.BlockSvg);
    
            /**
             * Sever all links from this object.
             * @package
             */
            dispose(): void;
    
            /**
             * Update the available connections for the top block. These connections can
             * change if a block is unplugged and the stack is healed.
             * @package
             */
            updateAvailableConnections(): void;
    
            /**
             * Return whether the block would be deleted if dropped immediately, based on
             * information from the most recent move event.
             * @return {boolean} True if the block would be deleted if dropped immediately.
             * @package
             */
            wouldDeleteBlock(): boolean;
    
            /**
             * Return whether the block would be connected if dropped immediately, based on
             * information from the most recent move event.
             * @return {boolean} True if the block would be connected if dropped
             *   immediately.
             * @package
             */
            wouldConnectBlock(): boolean;
    
            /**
             * Connect to the closest connection and render the results.
             * This should be called at the end of a drag.
             * @package
             */
            applyConnections(): void;
    
            /**
             * Update connections based on the most recent move location.
             * @param {!Blockly.utils.Coordinate} dxy Position relative to drag start,
             *     in workspace units.
             * @param {?number} deleteArea One of {@link Blockly.DELETE_AREA_TRASH},
             *     {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
             * @package
             */
            update(dxy: Blockly.utils.Coordinate, deleteArea: number): void;
    
            /**
             * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
             * or 2 insertion markers.
             * @return {!Array.<!Blockly.BlockSvg>} A possibly empty list of insertion
             *     marker blocks.
             * @package
             */
            getInsertionMarkers(): Blockly.BlockSvg[];
    } 
    
}

declare module Blockly.InsertionMarkerManager {

    /**
     * An enum describing different kinds of previews the InsertionMarkerManager
     * could display.
     * @enum {number}
     */
    enum PREVIEW_TYPE { INSERTION_MARKER, INPUT_OUTLINE, REPLACEMENT_FADE } 
}


declare module Blockly {

    class MarkerManager extends MarkerManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class MarkerManager__Class  { 
    
            /**
             * Class to manage the multiple markers and the cursor on a workspace.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace for the marker manager.
             * @constructor
             * @package
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * Register the marker by adding it to the map of markers.
             * @param {string} id A unique identifier for the marker.
             * @param {!Blockly.Marker} marker The marker to register.
             */
            registerMarker(id: string, marker: Blockly.Marker): void;
    
            /**
             * Unregister the marker by removing it from the map of markers.
             * @param {string} id The id of the marker to unregister.
             */
            unregisterMarker(id: string): void;
    
            /**
             * Get the cursor for the workspace.
             * @return {Blockly.Cursor} The cursor for this workspace.
             */
            getCursor(): Blockly.Cursor;
    
            /**
             * Get a single marker that corresponds to the given id.
             * @param {string} id A unique identifier for the marker.
             * @return {Blockly.Marker} The marker that corresponds to the given id, or null
             *     if none exists.
             */
            getMarker(id: string): Blockly.Marker;
    
            /**
             * Sets the cursor and initializes the drawer for use with keyboard navigation.
             * @param {Blockly.Cursor} cursor The cursor used to move around this workspace.
             */
            setCursor(cursor: Blockly.Cursor): void;
    
            /**
             * Add the cursor svg to this workspace svg group.
             * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
             *     workspace svg group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker svg to this workspaces svg group.
             * @param {SVGElement} markerSvg The svg root of the marker to be added to the
             *     workspace svg group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Redraw the attached cursor svg if needed.
             * @package
             */
            updateMarkers(): void;
    
            /**
             * Dispose of the marker manager.
             * Go through and delete all markers associated with this marker manager.
             * @suppress {checkTypes}
             * @package
             */
            dispose(): void;
    } 
    
}


declare module Blockly {

    class Menu extends Menu__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Menu__Class  { 
    
            /**
             * A basic menu class.
             * @constructor
             */
            constructor();
    
            /**
             * Coordinates of the mousedown event that caused this menu to open. Used to
             * prevent the consequent mouseup event due to a simple click from activating
             * a menu item immediately.
             * @type {?Blockly.utils.Coordinate}
             * @package
             */
            openingCoords: Blockly.utils.Coordinate;
    
            /**
             * Add a new menu item to the bottom of this menu.
             * @param {!Blockly.MenuItem} menuItem Menu item to append.
             */
            addChild(menuItem: Blockly.MenuItem): void;
    
            /**
             * Creates the menu DOM.
             * @param {!Element} container Element upon which to append this menu.
             */
            render(container: Element): void;
    
            /**
             * Gets the menu's element.
             * @return {Element} The DOM element.
             * @package
             */
            getElement(): Element;
    
            /**
             * Focus the menu element.
             * @package
             */
            focus(): void;
    
            /**
             * Set the menu accessibility role.
             * @param {!Blockly.utils.aria.Role} roleName role name.
             * @package
             */
            setRole(roleName: Blockly.utils.aria.Role): void;
    
            /**
             * Dispose of this menu.
             */
            dispose(): void;
    
            /**
             * Highlights the given menu item, or clears highlighting if null.
             * @param {Blockly.MenuItem} item Item to highlight, or null.
             * @package
             */
            setHighlighted(item: Blockly.MenuItem): void;
    
            /**
             * Highlights the next highlightable item (or the first if nothing is currently
             * highlighted).
             * @package
             */
            highlightNext(): void;
    
            /**
             * Highlights the previous highlightable item (or the last if nothing is
             * currently highlighted).
             * @package
             */
            highlightPrevious(): void;
    
            /**
             * Get the size of a rendered menu.
             * @return {!Blockly.utils.Size} Object with width and height properties.
             * @package
             */
            getSize(): Blockly.utils.Size;
    } 
    
}


declare module Blockly {

    class MenuItem extends MenuItem__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class MenuItem__Class  { 
    
            /**
             * Class representing an item in a menu.
             *
             * @param {string|!HTMLElement} content Text caption to display as the content
             *     of the item, or a HTML element to display.
             * @param {string=} opt_value Data/model associated with the menu item.
             * @constructor
             */
            constructor(content: string|HTMLElement, opt_value?: string);
    
            /**
             * Creates the menuitem's DOM.
             * @return {!Element} Completed DOM.
             */
            createDom(): Element;
    
            /**
             * Dispose of this menu item.
             */
            dispose(): void;
    
            /**
             * Gets the menu item's element.
             * @return {Element} The DOM element.
             * @package
             */
            getElement(): Element;
    
            /**
             * Gets the unique ID for this menu item.
             * @return {string} Unique component ID.
             * @package
             */
            getId(): string;
    
            /**
             * Gets the value associated with the menu item.
             * @return {*} value Value associated with the menu item.
             * @package
             */
            getValue(): any;
    
            /**
             * Set menu item's rendering direction.
             * @param {boolean} rtl True if RTL, false if LTR.
             * @package
             */
            setRightToLeft(rtl: boolean): void;
    
            /**
             * Set the menu item's accessibility role.
             * @param {!Blockly.utils.aria.Role} roleName Role name.
             * @package
             */
            setRole(roleName: Blockly.utils.aria.Role): void;
    
            /**
             * Sets the menu item to be checkable or not. Set to true for menu items
             * that represent checkable options.
             * @param {boolean} checkable Whether the menu item is checkable.
             * @package
             */
            setCheckable(checkable: boolean): void;
    
            /**
             * Checks or unchecks the component.
             * @param {boolean} checked Whether to check or uncheck the component.
             * @package
             */
            setChecked(checked: boolean): void;
    
            /**
             * Highlights or unhighlights the component.
             * @param {boolean} highlight Whether to highlight or unhighlight the component.
             * @package
             */
            setHighlighted(highlight: boolean): void;
    
            /**
             * Returns true if the menu item is enabled, false otherwise.
             * @return {boolean} Whether the menu item is enabled.
             * @package
             */
            isEnabled(): boolean;
    
            /**
             * Enables or disables the menu item.
             * @param {boolean} enabled Whether to enable or disable the menu item.
             * @package
             */
            setEnabled(enabled: boolean): void;
    
            /**
             * Performs the appropriate action when the menu item is activated
             * by the user.
             * @package
             */
            performAction(): void;
    
            /**
             * Set the handler that's called when the menu item is activated by the user.
             * `obj` will be used as the 'this' object in the function when called.
             * @param {function(!Blockly.MenuItem)} fn The handler.
             * @param {!Object} obj Used as the 'this' object in fn when called.
             * @package
             */
            onAction(fn: { (_0: Blockly.MenuItem): any /*missing*/ }, obj: Object): void;
    } 
    
}


declare module Blockly {

    class Mutator extends Mutator__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Mutator__Class extends Blockly.Icon__Class  { 
    
            /**
             * Class for a mutator dialog.
             * @param {!Array.<string>} quarkNames List of names of sub-blocks for flyout.
             * @extends {Blockly.Icon}
             * @constructor
             */
            constructor(quarkNames: string[]);
    
            /**
             * Set the block this mutator is associated with.
             * @param {Blockly.BlockSvg} block The block associated with this mutator.
             * @package
             */
            setBlock(block: Blockly.BlockSvg): void;
    
            /**
             * Returns the workspace inside this mutator icon's bubble.
             * @return {Blockly.WorkspaceSvg} The workspace inside this mutator icon's
             *     bubble.
             * @package
             */
            getWorkspace(): Blockly.WorkspaceSvg;
    
            /**
             * Draw the mutator icon.
             * @param {!Element} group The icon group.
             * @protected
             */
            drawIcon_(group: Element): void;
    
            /**
             * Add or remove the UI indicating if this icon may be clicked or not.
             */
            updateEditable(): void;
    
            /**
             * Show or hide the mutator bubble.
             * @param {boolean} visible True if the bubble should be visible.
             */
            setVisible(visible: boolean): void;
    
            /**
             * Dispose of this mutator.
             */
            dispose(): void;
    
            /**
             * Update the styles on all blocks in the mutator.
             * @public
             */
            updateBlockStyle(): void;
    } 
    
}

declare module Blockly.Mutator {

    /**
     * Reconnect an block to a mutated input.
     * @param {Blockly.Connection} connectionChild Connection on child block.
     * @param {!Blockly.Block} block Parent block.
     * @param {string} inputName Name of input on parent block.
     * @return {boolean} True iff a reconnection was made, false otherwise.
     */
    function reconnect(connectionChild: Blockly.Connection, block: Blockly.Block, inputName: string): boolean;

    /**
     * Get the parent workspace of a workspace that is inside a mutator, taking into
     * account whether it is a flyout.
     * @param {Blockly.Workspace} workspace The workspace that is inside a mutator.
     * @return {Blockly.Workspace} The mutator's parent workspace or null.
     * @public
     */
    function findParentWs(workspace: Blockly.Workspace): Blockly.Workspace;
}


declare module Blockly {

    class Names extends Names__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Names__Class  { 
    
            /**
             * Class for a database of entity names (variables, functions, etc).
             * @param {string} reservedWords A comma-separated string of words that are
             *     illegal for use as names in a language (e.g. 'new,if,this,...').
             * @param {string=} opt_variablePrefix Some languages need a '$' or a namespace
             *     before all variable names.
             * @constructor
             */
            constructor(reservedWords: string, opt_variablePrefix?: string);
    
            /**
             * Empty the database and start from scratch.  The reserved words are kept.
             */
            reset(): void;
    
            /**
             * Set the variable map that maps from variable name to variable object.
             * @param {!Blockly.VariableMap} map The map to track.
             */
            setVariableMap(map: Blockly.VariableMap): void;
    
            /**
             * Convert a Blockly entity name to a legal exportable entity name.
             * @param {string} name The Blockly entity name (no constraints).
             * @param {string} type The type of entity in Blockly
             *     ('VARIABLE', 'PROCEDURE', 'BUILTIN', etc...).
             * @return {string} An entity name that is legal in the exported language.
             */
            getName(name: string, type: string): string;
    
            /**
             * Convert a Blockly entity name to a legal exportable entity name.
             * Ensure that this is a new name not overlapping any previously defined name.
             * Also check against list of reserved words for the current language and
             * ensure name doesn't collide.
             * @param {string} name The Blockly entity name (no constraints).
             * @param {string} type The type of entity in Blockly
             *     ('VARIABLE', 'PROCEDURE', 'BUILTIN', etc...).
             * @return {string} An entity name that is legal in the exported language.
             */
            getDistinctName(name: string, type: string): string;
    } 
    
}

declare module Blockly.Names {

    /**
     * Constant to separate developer variable names from user-defined variable
     * names when running generators.
     * A developer variable will be declared as a global in the generated code, but
     * will never be shown to the user in the workspace or stored in the variable
     * map.
     */
    var DEVELOPER_VARIABLE_TYPE: any /*missing*/;

    /**
     * Do the given two entity names refer to the same entity?
     * Blockly names are case-insensitive.
     * @param {string} name1 First name.
     * @param {string} name2 Second name.
     * @return {boolean} True if names are the same.
     */
    function equals(name1: string, name2: string): boolean;
}


declare module Blockly {

    class Options extends Options__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Options__Class  { 
    
            /**
             * Parse the user-specified options, using reasonable defaults where behaviour
             * is unspecified.
             * @param {!Blockly.BlocklyOptions} options Dictionary of options.
             *     Specification: https://developers.google.com/blockly/guides/get-started/web#configuration
             * @constructor
             */
            constructor(options: Blockly.BlocklyOptions);
    
            /** @type {boolean} */
            RTL: boolean;
    
            /** @type {boolean} */
            oneBasedIndex: boolean;
    
            /** @type {boolean} */
            collapse: boolean;
    
            /** @type {boolean} */
            comments: boolean;
    
            /** @type {boolean} */
            disable: boolean;
    
            /** @type {boolean} */
            readOnly: boolean;
    
            /** @type {number} */
            maxBlocks: number;
    
            /** @type {?Object.<string, number>} */
            maxInstances: { [key: string]: number };
    
            /** @type {string} */
            pathToMedia: string;
    
            /** @type {boolean} */
            hasCategories: boolean;
    
            /** @type {!Object} */
            moveOptions: Object;
    
            /** @deprecated  January 2019 */
            hasScrollbars: any /*missing*/;
    
            /** @type {boolean} */
            hasTrashcan: boolean;
    
            /** @type {number} */
            maxTrashcanContents: number;
    
            /** @type {boolean} */
            hasSounds: boolean;
    
            /** @type {boolean} */
            hasCss: boolean;
    
            /** @type {boolean} */
            horizontalLayout: boolean;
    
            /** @type {Array.<Blockly.utils.toolbox.Toolbox>} */
            languageTree: Blockly.utils.toolbox.Toolbox[];
    
            /** @type {!Object} */
            gridOptions: Object;
    
            /** @type {!Object} */
            zoomOptions: Object;
    
            /** @type {number} */
            toolboxPosition: number;
    
            /** @type {!Blockly.Theme} */
            theme: Blockly.Theme;
    
            /** @type {!Object<string,Blockly.Action>} */
            keyMap: { [key: string]: Blockly.Action };
    
            /** @type {string} */
            renderer: string;
    
            /** @type {?Object} */
            rendererOverrides: Object;
    
            /**
             * The SVG element for the grid pattern.
             * Created during injection.
             * @type {SVGElement}
             */
            gridPattern: SVGElement;
    
            /**
             * The parent of the current workspace, or null if there is no parent
             * workspace.
             * @type {Blockly.Workspace}
             */
            parentWorkspace: Blockly.Workspace;
    
            /**
             * Map of plugin type to name of registered plugin or plugin class.
             * @type {!Object.<string, (function(new:?, ...?)|string)>}
             */
            plugins: any /*missing*/;
    
            /**
             * If set, sets the translation of the workspace to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains an x and/or y property which
             *     is a float between 0 and 1 specifying the degree of scrolling.
             * @return {void}
             */
            setMetrics(xyRatio: { x: number; y: number }): void;
    
            /**
             * Return an object with the metrics required to size the workspace.
             * @return {!Blockly.utils.Metrics} Contains size and position metrics.
             */
            getMetrics(): Blockly.utils.Metrics;
    } 
    

    interface BlocklyOptions {
    }
}

declare module Blockly.Options {

    /**
     * Parse the provided toolbox tree into a consistent DOM format.
     * @param {Node|NodeList|?string} tree DOM tree of blocks, or text representation
     *    of same.
     * @return {Node} DOM tree of blocks, or null.
     */
    function parseToolboxTree(tree: Node|NodeList|string): Node;
}


declare module Blockly.Procedures {

    /**
     * Constant to separate procedure names from variables and generated functions
     * when running generators.
     * @deprecated Use Blockly.PROCEDURE_CATEGORY_NAME
     */
    var NAME_TYPE: any /*missing*/;

    /**
     * The default argument for a procedures_mutatorarg block.
     * @type {string}
     */
    var DEFAULT_ARG: string;

    /**
     * Procedure block type.
     * @typedef {{
     *    getProcedureCall: function():string,
     *    renameProcedure: function(string,string),
     *    getProcedureDef: function():!Array
     * }}
     */
    interface ProcedureBlock {
        getProcedureCall: { (): string };
        renameProcedure: { (_0: string, _1: string): any /*missing*/ };
        getProcedureDef: { (): any[] }
    }

    /**
     * Find all user-created procedure definitions in a workspace.
     * @param {!Blockly.Workspace} root Root workspace.
     * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
     *     first contains procedures without return variables, the second with.
     *     Each procedure is defined by a three-element list of name, parameter
     *     list, and return value boolean.
     */
    function allProcedures(root: Blockly.Workspace): any[][][];

    /**
     * Ensure two identically-named procedures don't exist.
     * Take the proposed procedure name, and return a legal name i.e. one that
     * is not empty and doesn't collide with other procedures.
     * @param {string} name Proposed procedure name.
     * @param {!Blockly.Block} block Block to disambiguate.
     * @return {string} Non-colliding name.
     */
    function findLegalName(name: string, block: Blockly.Block): string;

    /**
     * Return if the given name is already a procedure name.
     * @param {string} name The questionable name.
     * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
     * @param {Blockly.Block=} opt_exclude Optional block to exclude from
     *     comparisons (one doesn't want to collide with oneself).
     * @return {boolean} True if the name is used, otherwise return false.
     */
    function isNameUsed(name: string, workspace: Blockly.Workspace, opt_exclude?: Blockly.Block): boolean;

    /**
     * Rename a procedure.  Called by the editable field.
     * @param {string} name The proposed new name.
     * @return {string} The accepted name.
     * @this {Blockly.Field}
     */
    function rename(name: string): string;

    /**
     * Construct the blocks required by the flyout for the procedure category.
     * @param {!Blockly.Workspace} workspace The workspace containing procedures.
     * @return {!Array.<!Element>} Array of XML block elements.
     */
    function flyoutCategory(workspace: Blockly.Workspace): Element[];

    /**
     * Listens for when a procedure mutator is opened. Then it triggers a flyout
     * update and adds a mutator change listener to the mutator workspace.
     * @param {!Blockly.Events.Abstract} e The event that triggered this listener.
     * @package
     */
    function mutatorOpenListener(e: Blockly.Events.Abstract): void;

    /**
     * Find all the callers of a named procedure.
     * @param {string} name Name of procedure.
     * @param {!Blockly.Workspace} workspace The workspace to find callers in.
     * @return {!Array.<!Blockly.Block>} Array of caller blocks.
     */
    function getCallers(name: string, workspace: Blockly.Workspace): Blockly.Block[];

    /**
     * When a procedure definition changes its parameters, find and edit all its
     * callers.
     * @param {!Blockly.Block} defBlock Procedure definition block.
     */
    function mutateCallers(defBlock: Blockly.Block): void;

    /**
     * Find the definition block for the named procedure.
     * @param {string} name Name of procedure.
     * @param {!Blockly.Workspace} workspace The workspace to search.
     * @return {Blockly.Block} The procedure definition block, or null not found.
     */
    function getDefinition(name: string, workspace: Blockly.Workspace): Blockly.Block;
}


declare module Blockly.registry {

    class Type<T> extends Type__Class<T> { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Type__Class<T>  { 
    
            /**
             * A name with the type of the element stored in the generic.
             * @param {string} name The name of the registry type.
             * @constructor
             * @template T
             */
            constructor(name: string);
    } 
    

    /**
     * A map of maps. With the keys being the type and name of the class we are
     * registering and the value being the constructor function.
     * e.g. {'field': {'field_angle': Blockly.FieldAngle}}
     *
     * @type {Object<string, Object<string, function(new:?)>>}
     */
    var typeMap_: any /*missing*/;

    /**
     * The string used to register the default class for a type of plugin.
     * @type {string}
     */
    var DEFAULT: string;

    /**
     * Registers a class based on a type and name.
     * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @param {?function(new:T, ...?)|Object} registryItem The class or object to
     *     register.
     * @throws {Error} if the type or name is empty, a name with the given type has
     *     already been registered, or if the given class or object is not valid for it's type.
     * @template T
     */
    function register<T>(type: string|Blockly.registry.Type<T>, name: string, registryItem: { (_0: any[]): any /*missing*/ }|Object): void;

    /**
     * Unregisters the registry item with the given type and name.
     * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @template T
     */
    function unregister<T>(type: string|Blockly.registry.Type<T>, name: string): void;

    /**
     * Gets the registry item for the given name and type. This can be either a
     * class or an object.l
     * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @return {?function(new:T, ...?)|Object} The class or object with the given
     *     name and type or null if none exists.
     * @template T
     */
    function getItem_<T>(type: string|Blockly.registry.Type<T>, name: string): { (_0: any[]): any /*missing*/ }|Object;

    /**
     * Gets the class for the given name and type.
     * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @return {?function(new:T, ...?)} The class with the given name and type or
     *     null if none exists.
     * @template T
     */
    function getClass<T>(type: string|Blockly.registry.Type<T>, name: string): { (_0: any[]): any /*missing*/ };

    /**
     * Gets the object for the given name and type.
     * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Category)
     * @param {string} name The plugin's name. (Ex. logic_category)
     * @returns {T} The object with the given name and type or null if none exists.
     * @template T
     */
    function getObject<T>(type: string|Blockly.registry.Type<T>, name: string): T;

    /**
     * Gets the class from Blockly options for the given type.
     * This is used for plugins that override a built in feature. (e.g. Toolbox)
     * @param {Blockly.registry.Type<T>} type The type of the plugin.
     * @param {!Blockly.Options} options The option object to check for the given
     *     plugin.
     * @return {?function(new:T, ...?)} The class for the plugin.
     * @template T
     */
    function getClassFromOptions<T>(type: Blockly.registry.Type<T>, options: Blockly.Options): { (_0: any[]): any /*missing*/ };
}

declare module Blockly.registry.Type {

    /** @type {!Blockly.registry.Type<Blockly.blockRendering.Renderer>} */
    var RENDERER: Blockly.registry.Type<Blockly.blockRendering.Renderer>;

    /** @type {!Blockly.registry.Type<Blockly.Field>} */
    var FIELD: Blockly.registry.Type<Blockly.Field>;

    /** @type {!Blockly.registry.Type<Blockly.IToolbox>} */
    var TOOLBOX: Blockly.registry.Type<Blockly.IToolbox>;

    /** @type {!Blockly.registry.Type<Blockly.Theme>} */
    var THEME: Blockly.registry.Type<Blockly.Theme>;
}


declare module Blockly {

    class RenderedConnection extends RenderedConnection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class RenderedConnection__Class extends Blockly.Connection__Class  { 
    
            /**
             * Class for a connection between blocks that may be rendered on screen.
             * @param {!Blockly.BlockSvg} source The block establishing this connection.
             * @param {number} type The type of the connection.
             * @extends {Blockly.Connection}
             * @constructor
             */
            constructor(source: Blockly.BlockSvg, type: number);
    
            /**
             * Connection this connection connects to.  Null if not connected.
             * @type {Blockly.RenderedConnection}
             */
            targetConnection: Blockly.RenderedConnection;
    
            /**
             * Returns the distance between this connection and another connection in
             * workspace units.
             * @param {!Blockly.Connection} otherConnection The other connection to measure
             *     the distance to.
             * @return {number} The distance between connections, in workspace units.
             */
            distanceFrom(otherConnection: Blockly.Connection): number;
    
            /**
             * Move the block(s) belonging to the connection to a point where they don't
             * visually interfere with the specified connection.
             * @param {!Blockly.Connection} staticConnection The connection to move away
             *     from.
             * @package
             */
            bumpAwayFrom(staticConnection: Blockly.Connection): void;
    
            /**
             * Change the connection's coordinates.
             * @param {number} x New absolute x coordinate, in workspace coordinates.
             * @param {number} y New absolute y coordinate, in workspace coordinates.
             */
            moveTo(x: number, y: number): void;
    
            /**
             * Change the connection's coordinates.
             * @param {number} dx Change to x coordinate, in workspace units.
             * @param {number} dy Change to y coordinate, in workspace units.
             */
            moveBy(dx: number, dy: number): void;
    
            /**
             * Move this connection to the location given by its offset within the block and
             * the location of the block's top left corner.
             * @param {!Blockly.utils.Coordinate} blockTL The location of the top left
             *     corner of the block, in workspace coordinates.
             */
            moveToOffset(blockTL: Blockly.utils.Coordinate): void;
    
            /**
             * Set the offset of this connection relative to the top left of its block.
             * @param {number} x The new relative x, in workspace units.
             * @param {number} y The new relative y, in workspace units.
             */
            setOffsetInBlock(x: number, y: number): void;
    
            /**
             * Get the offset of this connection relative to the top left of its block.
             * @return {!Blockly.utils.Coordinate} The offset of the connection.
             * @package
             */
            getOffsetInBlock(): Blockly.utils.Coordinate;
    
            /**
             * Move the blocks on either side of this connection right next to each other.
             * @package
             */
            tighten(): void;
    
            /**
             * Find the closest compatible connection to this connection.
             * All parameters are in workspace units.
             * @param {number} maxLimit The maximum radius to another connection.
             * @param {!Blockly.utils.Coordinate} dxy Offset between this connection's location
             *     in the database and the current location (as a result of dragging).
             * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
             *     properties: 'connection' which is either another connection or null,
             *     and 'radius' which is the distance.
             */
            closest(maxLimit: number, dxy: Blockly.utils.Coordinate): { connection: Blockly.Connection; radius: number };
    
            /**
             * Add highlighting around this connection.
             */
            highlight(): void;
    
            /**
             * Remove the highlighting around this connection.
             */
            unhighlight(): void;
    
            /**
             * Set whether this connections is tracked in the database or not.
             * @param {boolean} doTracking If true, start tracking. If false, stop tracking.
             * @package
             */
            setTracking(doTracking: boolean): void;
    
            /**
             * Stop tracking this connection, as well as all down-stream connections on
             * any block attached to this connection. This happens when a block is
             * collapsed.
             *
             * Also closes down-stream icons/bubbles.
             * @package
             */
            stopTrackingAll(): void;
    
            /**
             * Start tracking this connection, as well as all down-stream connections on
             * any block attached to this connection. This happens when a block is expanded.
             * @return {!Array.<!Blockly.Block>} List of blocks to render.
             */
            startTrackingAll(): Blockly.Block[];
    
            /**
             * Check if the two connections can be dragged to connect to each other.
             * @param {!Blockly.Connection} candidate A nearby connection to check.
             * @param {number=} maxRadius The maximum radius allowed for connections, in
             *     workspace units.
             * @return {boolean} True if the connection is allowed, false otherwise.
             */
            isConnectionAllowed(candidate: Blockly.Connection, maxRadius?: number): boolean;
    
            /**
             * Behavior after a connection attempt fails.
             * @param {!Blockly.Connection} otherConnection Connection that this connection
             *     failed to connect to.
             * @package
             */
            onFailedConnect(otherConnection: Blockly.Connection): void;
    
            /**
             * Find all nearby compatible connections to this connection.
             * Type checking does not apply, since this function is used for bumping.
             * @param {number} maxLimit The maximum radius to another connection, in
             *     workspace units.
             * @return {!Array.<!Blockly.Connection>} List of connections.
             * @package
             */
            neighbours(maxLimit: number): Blockly.Connection[];
    
            /**
             * Connect two connections together.  This is the connection on the superior
             * block.  Rerender blocks as needed.
             * @param {!Blockly.Connection} childConnection Connection on inferior block.
             * @protected
             */
            connect_(childConnection: Blockly.Connection): void;
    
            /**
             * Function to be called when this connection's compatible types have changed.
             * @protected
             */
            onCheckChanged_(): void;
    } 
    
}

declare module Blockly.RenderedConnection {

    /**
     * Enum for different kinds of tracked states.
     *
     * WILL_TRACK means that this connection will add itself to
     * the db on the next moveTo call it receives.
     *
     * UNTRACKED means that this connection will not add
     * itself to the database until setTracking(true) is explicitly called.
     *
     * TRACKED means that this connection is currently being tracked.
     * @enum {number}
     */
    enum TrackedState { WILL_TRACK, UNTRACKED, TRACKED } 
}



declare module Blockly {

    class ScrollbarPair extends ScrollbarPair__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ScrollbarPair__Class  { 
    
            /**
             * Class for a pair of scrollbars.  Horizontal and vertical.
             * @param {!Blockly.WorkspaceSvg} workspace Workspace to bind the scrollbars to.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * Dispose of this pair of scrollbars.
             * Unlink from all DOM elements to prevent memory leaks.
             */
            dispose(): void;
    
            /**
             * Recalculate both of the scrollbars' locations and lengths.
             * Also reposition the corner rectangle.
             */
            resize(): void;
    
            /**
             * Set the handles of both scrollbars to be at a certain position in CSS pixels
             * relative to their parents.
             * @param {number} x Horizontal scroll value.
             * @param {number} y Vertical scroll value.
             */
            set(x: number, y: number): void;
    
            /**
             * Set whether this scrollbar's container is visible.
             * @param {boolean} visible Whether the container is visible.
             */
            setContainerVisible(visible: boolean): void;
    } 
    

    class Scrollbar extends Scrollbar__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Scrollbar__Class  { 
    
            /**
             * Class for a pure SVG scrollbar.
             * This technique offers a scrollbar that is guaranteed to work, but may not
             * look or behave like the system's scrollbars.
             * @param {!Blockly.WorkspaceSvg} workspace Workspace to bind the scrollbar to.
             * @param {boolean} horizontal True if horizontal, false if vertical.
             * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
             * @param {string=} opt_class A class to be applied to this scrollbar.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, horizontal: boolean, opt_pair?: boolean, opt_class?: string);
    
            /**
             * @type {?number}
             * @package
             */
            ratio: number;
    
            /**
             * The upper left corner of the scrollbar's SVG group in CSS pixels relative
             * to the scrollbar's origin.  This is usually relative to the injection div
             * origin.
             * @type {Blockly.utils.Coordinate}
             * @package
             */
            position: Blockly.utils.Coordinate;
    
            /**
             * Dispose of this scrollbar.
             * Unlink from all DOM elements to prevent memory leaks.
             */
            dispose(): void;
    
            /**
             * Set the offset of the scrollbar's handle from the scrollbar's position, and
             * change the SVG attribute accordingly.
             * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
             */
            setHandlePosition(newPosition: number): void;
    
            /**
             * Set the position of the scrollbar's SVG group in CSS pixels relative to the
             * scrollbar's origin.  This sets the scrollbar's location within the workspace.
             * @param {number} x The new x coordinate.
             * @param {number} y The new y coordinate.
             * @package
             */
            setPosition(x: number, y: number): void;
    
            /**
             * Recalculate the scrollbar's location and its length.
             * @param {Blockly.utils.Metrics=} opt_metrics A data structure of from the
             *     describing all the required dimensions.  If not provided, it will be
             *     fetched from the host object.
             */
            resize(opt_metrics?: Blockly.utils.Metrics): void;
    
            /**
             * Recalculate a horizontal scrollbar's location on the screen and path length.
             * This should be called when the layout or size of the window has changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeViewHorizontal(hostMetrics: Blockly.utils.Metrics): void;
    
            /**
             * Recalculate a horizontal scrollbar's location within its path and length.
             * This should be called when the contents of the workspace have changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeContentHorizontal(hostMetrics: Blockly.utils.Metrics): void;
    
            /**
             * Recalculate a vertical scrollbar's location on the screen and path length.
             * This should be called when the layout or size of the window has changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeViewVertical(hostMetrics: Blockly.utils.Metrics): void;
    
            /**
             * Recalculate a vertical scrollbar's location within its path and length.
             * This should be called when the contents of the workspace have changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeContentVertical(hostMetrics: Blockly.utils.Metrics): void;
    
            /**
             * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
             * needed.
             * @return {boolean} True if visible.
             */
            isVisible(): boolean;
    
            /**
             * Set whether the scrollbar's container is visible and update
             * display accordingly if visibility has changed.
             * @param {boolean} visible Whether the container is visible
             */
            setContainerVisible(visible: boolean): void;
    
            /**
             * Set whether the scrollbar is visible.
             * Only applies to non-paired scrollbars.
             * @param {boolean} visible True if visible.
             */
            setVisible(visible: boolean): void;
    
            /**
             * Update visibility of scrollbar based on whether it thinks it should
             * be visible and whether its containing workspace is visible.
             * We cannot rely on the containing workspace being hidden to hide us
             * because it is not necessarily our parent in the DOM.
             */
            updateDisplay_(): void;
    
            /**
             * Set the scrollbar handle's position.
             * @param {number} value The distance from the top/left end of the bar, in CSS
             *     pixels.  It may be larger than the maximum allowable position of the
             *     scrollbar handle.
             */
            set(value: number): void;
    
            /**
             * Record the origin of the workspace that the scrollbar is in, in pixels
             * relative to the injection div origin. This is for times when the scrollbar is
             * used in an object whose origin isn't the same as the main workspace
             * (e.g. in a flyout.)
             * @param {number} x The x coordinate of the scrollbar's origin, in CSS pixels.
             * @param {number} y The y coordinate of the scrollbar's origin, in CSS pixels.
             */
            setOrigin(x: number, y: number): void;
    } 
    
}

declare module Blockly.Scrollbar {

    /**
     * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
     * Scrollbars should be larger on touch devices.
     */
    var scrollbarThickness: any /*missing*/;
}


declare module Blockly {

    class Theme extends Theme__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Theme__Class  { 
    
            /**
             * Class for a theme.
             * @param {string} name Theme name.
             * @param {!Object.<string, Blockly.Theme.BlockStyle>=} opt_blockStyles A map
             *     from style names (strings) to objects with style attributes for blocks.
             * @param {!Object.<string, Blockly.Theme.CategoryStyle>=} opt_categoryStyles A
             *     map from style names (strings) to objects with style attributes for
             *     categories.
             * @param {!Blockly.Theme.ComponentStyle=} opt_componentStyles A map of Blockly
             *     component names to style value.
             * @constructor
             */
            constructor(name: string, opt_blockStyles?: { [key: string]: Blockly.Theme.BlockStyle }, opt_categoryStyles?: { [key: string]: Blockly.Theme.CategoryStyle }, opt_componentStyles?: Blockly.Theme.ComponentStyle);
    
            /**
             * The theme name. This can be used to reference a specific theme in CSS.
             * @type {string}
             */
            name: string;
    
            /**
             * The block styles map.
             * @type {!Object.<string, !Blockly.Theme.BlockStyle>}
             * @package
             */
            blockStyles: { [key: string]: Blockly.Theme.BlockStyle };
    
            /**
             * The category styles map.
             * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
             * @package
             */
            categoryStyles: { [key: string]: Blockly.Theme.CategoryStyle };
    
            /**
             * The UI components styles map.
             * @type {!Blockly.Theme.ComponentStyle}
             * @package
             */
            componentStyles: Blockly.Theme.ComponentStyle;
    
            /**
             * The font style.
             * @type {!Blockly.Theme.FontStyle}
             * @package
             */
            fontStyle: Blockly.Theme.FontStyle;
    
            /**
             * Whether or not to add a 'hat' on top of all blocks with no previous or
             * output connections.
             * @type {?boolean}
             * @package
             */
            startHats: boolean;
    
            /**
             * Gets the class name that identifies this theme.
             * @return {string} The CSS class name.
             * @package
             */
            getClassName(): string;
    
            /**
             * Overrides or adds a style to the blockStyles map.
             * @param {string} blockStyleName The name of the block style.
             * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
            */
            setBlockStyle(blockStyleName: string, blockStyle: Blockly.Theme.BlockStyle): void;
    
            /**
             * Overrides or adds a style to the categoryStyles map.
             * @param {string} categoryStyleName The name of the category style.
             * @param {Blockly.Theme.CategoryStyle} categoryStyle The category style.
            */
            setCategoryStyle(categoryStyleName: string, categoryStyle: Blockly.Theme.CategoryStyle): void;
    
            /**
             * Gets the style for a given Blockly UI component.  If the style value is a
             * string, we attempt to find the value of any named references.
             * @param {string} componentName The name of the component.
             * @return {?string} The style value.
             */
            getComponentStyle(componentName: string): string;
    
            /**
             * Configure a specific Blockly UI component with a style value.
             * @param {string} componentName The name of the component.
             * @param {*} styleValue The style value.
            */
            setComponentStyle(componentName: string, styleValue: any): void;
    
            /**
             * Configure a theme's font style.
             * @param {Blockly.Theme.FontStyle} fontStyle The font style.
            */
            setFontStyle(fontStyle: Blockly.Theme.FontStyle): void;
    
            /**
             * Configure a theme's start hats.
             * @param {boolean} startHats True if the theme enables start hats, false
             *     otherwise.
            */
            setStartHats(startHats: boolean): void;
    } 
    
}

declare module Blockly.Theme {

    /**
     * A block style.
     * @typedef {{
     *            colourPrimary:string,
     *            colourSecondary:string,
     *            colourTertiary:string,
     *            hat:string
     *          }}
     */
    interface BlockStyle {
        colourPrimary: string;
        colourSecondary: string;
        colourTertiary: string;
        hat: string
    }

    /**
     * A category style.
     * @typedef {{
     *            colour:string
     *          }}
     */
    interface CategoryStyle {
        colour: string
    }

    /**
     * A component style.
     * @typedef {{
     *            workspaceBackgroundColour:?string,
     *            toolboxBackgroundColour:?string,
     *            toolboxForegroundColour:?string,
     *            flyoutBackgroundColour:?string,
     *            flyoutForegroundColour:?string,
     *            flyoutOpacity:?number,
     *            scrollbarColour:?string,
     *            scrollbarOpacity:?number,
     *            insertionMarkerColour:?string,
     *            insertionMarkerOpacity:?number,
     *            markerColour:?string,
     *            cursorColour:?string,
     *            selectedGlowColour:?string,
     *            selectedGlowOpacity:?number,
     *            replacementGlowColour:?string,
     *            replacementGlowOpacity:?number
     *          }}
     */
    interface ComponentStyle {
        workspaceBackgroundColour: string;
        toolboxBackgroundColour: string;
        toolboxForegroundColour: string;
        flyoutBackgroundColour: string;
        flyoutForegroundColour: string;
        flyoutOpacity: number;
        scrollbarColour: string;
        scrollbarOpacity: number;
        insertionMarkerColour: string;
        insertionMarkerOpacity: number;
        markerColour: string;
        cursorColour: string;
        selectedGlowColour: string;
        selectedGlowOpacity: number;
        replacementGlowColour: string;
        replacementGlowOpacity: number
    }

    /**
     * A font style.
     * @typedef {{
     *            family:?string,
     *            weight:?string,
     *            size:?number
     *          }}
     */
    interface FontStyle {
        family: string;
        weight: string;
        size: number
    }

    /**
     * Define a new Blockly theme.
     * @param {string} name The name of the theme.
     * @param {!Object} themeObj An object containing theme properties.
     * @return {!Blockly.Theme} A new Blockly theme.
    */
    function defineTheme(name: string, themeObj: Object): Blockly.Theme;
}


declare module Blockly {

    class ThemeManager extends ThemeManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ThemeManager__Class  { 
    
            /**
             * Class for storing and updating a workspace's theme and UI components.
             * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
             * @param {!Blockly.Theme} theme The workspace theme.
             * @constructor
             * @package
             */
            constructor(workspace: Blockly.WorkspaceSvg, theme: Blockly.Theme);
    
            /**
             * Get the workspace theme.
             * @return {!Blockly.Theme} The workspace theme.
             * @package
             */
            getTheme(): Blockly.Theme;
    
            /**
             * Set the workspace theme, and refresh the workspace and all components.
             * @param {!Blockly.Theme} theme The workspace theme.
             * @package
             */
            setTheme(theme: Blockly.Theme): void;
    
            /**
             * Subscribe a workspace to changes to the selected theme.  If a new theme is
             * set, the workspace is called to refresh its blocks.
             * @param {!Blockly.Workspace} workspace The workspace to subscribe.
             * @package
             */
            subscribeWorkspace(workspace: Blockly.Workspace): void;
    
            /**
             * Unsubscribe a workspace to changes to the selected theme.
             * @param {!Blockly.Workspace} workspace The workspace to unsubscribe.
             * @package
             */
            unsubscribeWorkspace(workspace: Blockly.Workspace): void;
    
            /**
             * Subscribe an element to changes to the selected theme.  If a new theme is
             * selected, the element's style is refreshed with the new theme's style.
             * @param {!Element} element The element to subscribe.
             * @param {string} componentName The name used to identify the component. This
             *     must be the same name used to configure the style in the Theme object.
             * @param {string} propertyName The inline style property name to update.
             * @package
             */
            subscribe(element: Element, componentName: string, propertyName: string): void;
    
            /**
             * Unsubscribe an element to changes to the selected theme.
             * @param {Element} element The element to unsubscribe.
             * @package
             */
            unsubscribe(element: Element): void;
    
            /**
             * Dispose of this theme manager.
             * @package
             * @suppress {checkTypes}
             */
            dispose(): void;
    } 
    
}

declare module Blockly.ThemeManager {

    /**
     * A Blockly UI component type.
     * @typedef {{
      *            element:!Element,
      *            propertyName:string
      *          }}
      */
    interface Component {
        element: Element;
        propertyName: string
    }
}


declare module Blockly {

    class Toolbox extends Toolbox__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Toolbox__Class implements Blockly.IBlocklyActionable, Blockly.IDeleteArea, Blockly.IStyleable, Blockly.IToolbox  { 
    
            /**
             * Class for a Toolbox.
             * Creates the toolbox's DOM.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new
             *     blocks.
             * @constructor
             * @implements {Blockly.IBlocklyActionable}
             * @implements {Blockly.IDeleteArea}
             * @implements {Blockly.IStyleable}
             * @implements {Blockly.IToolbox}
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * Is RTL vs LTR.
             * @type {boolean}
             */
            RTL: boolean;
    
            /**
             * Position of the toolbox and flyout relative to the workspace.
             * @type {number}
             */
            toolboxPosition: number;
    
            /**
             * Width of the toolbox, which changes only in vertical layout.
             * @type {number}
             */
            width: number;
    
            /**
             * Height of the toolbox, which changes only in horizontal layout.
             * @type {number}
             */
            height: number;
    
            /**
             * Initializes the toolbox.
             * @throws {Error} If missing a require for both `Blockly.HorizontalFlyout` and
             *     `Blockly.VerticalFlyout`.
             */
            init(): void;
    
            /**
             * HTML container for the Toolbox menu.
             * @type {Element}
             */
            HtmlDiv: Element;
    
            /**
             * Fill the toolbox with categories and blocks.
             * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
             *    containing information on the contents of the toolbox.
             * @package
             */
            render(toolboxDef: Blockly.utils.toolbox.Toolbox[]): void;
    
            /**
             * Handles the given Blockly action on a toolbox.
             * This is only triggered when keyboard accessibility mode is enabled.
             * @param {!Blockly.Action} action The action to be handled.
             * @return {boolean} True if the field handled the action, false otherwise.
             * @package
             */
            onBlocklyAction(action: Blockly.Action): boolean;
    
            /**
             * Dispose of this toolbox.
             */
            dispose(): void;
    
            /**
             * Toggles the visibility of the toolbox.
             * @param {boolean} isVisible True if toolbox should be visible.
             */
            setVisible(isVisible: boolean): void;
    
            /**
             * Get the width of the toolbox.
             * @return {number} The width of the toolbox.
             */
            getWidth(): number;
    
            /**
             * Get the height of the toolbox.
             * @return {number} The width of the toolbox.
             */
            getHeight(): number;
    
            /**
             * Get the toolbox flyout.
             * @return {Blockly.Flyout} The toolbox flyout.
             */
            getFlyout(): Blockly.Flyout;
    
            /**
             * Move the toolbox to the edge.
             */
            position(): void;
    
            /**
             * Updates the category colours and background colour of selected categories.
             * @package
             */
            refreshTheme(): void;
    
            /**
             * Unhighlight any previously specified option.
             */
            clearSelection(): void;
    
            /**
             * Adds a style on the toolbox. Usually used to change the cursor.
             * @param {string} style The name of the class to add.
             * @package
             */
            addStyle(style: string): void;
    
            /**
             * Removes a style from the toolbox. Usually used to change the cursor.
             * @param {string} style The name of the class to remove.
             * @package
             */
            removeStyle(style: string): void;
    
            /**
             * Return the deletion rectangle for this toolbox.
             * @return {Blockly.utils.Rect} Rectangle in which to delete.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Update the flyout's contents without closing it.  Should be used in response
             * to a change in one of the dynamic categories, such as variables or
             * procedures.
             */
            refreshSelection(): void;
    
            /**
             * Select the first toolbox category if no category is selected.
             * @package
             */
            selectFirstCategory(): void;
    } 
    
}

declare module Blockly.Toolbox {

    class TreeSeparator extends TreeSeparator__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TreeSeparator__Class extends Blockly.tree.TreeNode__Class  { 
    
            /**
             * A blank separator node in the tree.
             * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
             * @constructor
             * @extends {Blockly.tree.TreeNode}
             */
            constructor(config: Blockly.tree.BaseNode.Config);
    } 
    
}


declare module Blockly.Tooltip {

    /**
     * Is a tooltip currently showing?
     */
    var visible: any /*missing*/;

    /**
     * Maximum width (in characters) of a tooltip.
     */
    var LIMIT: any /*missing*/;

    /**
     * Horizontal offset between mouse cursor and tooltip.
     */
    var OFFSET_X: any /*missing*/;

    /**
     * Vertical offset between mouse cursor and tooltip.
     */
    var OFFSET_Y: any /*missing*/;

    /**
     * Radius mouse can move before killing tooltip.
     */
    var RADIUS_OK: any /*missing*/;

    /**
     * Delay before tooltip appears.
     */
    var HOVER_MS: any /*missing*/;

    /**
     * Horizontal padding between tooltip and screen edge.
     */
    var MARGINS: any /*missing*/;

    /**
     * The HTML container.  Set once by Blockly.Tooltip.createDom.
     * @type {Element}
     */
    var DIV: Element;

    /**
     * Create the tooltip div and inject it onto the page.
     */
    function createDom(): void;

    /**
     * Binds the required mouse events onto an SVG element.
     * @param {!Element} element SVG element onto which tooltip is to be bound.
     */
    function bindMouseEvents(element: Element): void;

    /**
     * Unbinds tooltip mouse events from the SVG element.
     * @param {!Element} element SVG element onto which tooltip is bound.
     */
    function unbindMouseEvents(element: Element): void;

    /**
     * Dispose of the tooltip.
     * @package
     */
    function dispose(): void;

    /**
     * Hide the tooltip.
     */
    function hide(): void;

    /**
     * Hide any in-progress tooltips and block showing new tooltips until the next
     * call to unblock().
     * @package
     */
    function block(): void;

    /**
     * Unblock tooltips: allow them to be scheduled and shown according to their own
     * logic.
     * @package
     */
    function unblock(): void;
}


declare module Blockly.Touch {

    /**
      * Whether touch is enabled in the browser.
      * Copied from Closure's goog.events.BrowserFeature.TOUCH_ENABLED
      */
    var TOUCH_ENABLED: any /*missing*/;

    /**
     * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
     * in conjunction with mouse events.
     * @type {Object}
     */
    var TOUCH_MAP: Object;

    /**
     * Clear the touch identifier that tracks which touch stream to pay attention
     * to.  This ends the current drag/gesture and allows other pointers to be
     * captured.
     */
    function clearTouchIdentifier(): void;

    /**
     * Decide whether Blockly should handle or ignore this event.
     * Mouse and touch events require special checks because we only want to deal
     * with one touch stream at a time.  All other events should always be handled.
     * @param {!Event} e The event to check.
     * @return {boolean} True if this event should be passed through to the
     *     registered handler; false if it should be blocked.
     */
    function shouldHandleEvent(e: Event): boolean;

    /**
     * Get the touch identifier from the given event.  If it was a mouse event, the
     * identifier is the string 'mouse'.
     * @param {!Event} e Mouse event or touch event.
     * @return {string} The touch identifier from the first changed touch, if
     *     defined.  Otherwise 'mouse'.
     */
    function getTouchIdentifierFromEvent(e: Event): string;

    /**
     * Check whether the touch identifier on the event matches the current saved
     * identifier.  If there is no identifier, that means it's a mouse event and
     * we'll use the identifier "mouse".  This means we won't deal well with
     * multiple mice being used at the same time.  That seems okay.
     * If the current identifier was unset, save the identifier from the
     * event.  This starts a drag/gesture, during which touch events with other
     * identifiers will be silently ignored.
     * @param {!Event} e Mouse event or touch event.
     * @return {boolean} Whether the identifier on the event matches the current
     *     saved identifier.
     */
    function checkTouchIdentifier(e: Event): boolean;

    /**
     * Set an event's clientX and clientY from its first changed touch.  Use this to
     * make a touch event work in a mouse event handler.
     * @param {!Event} e A touch event.
     */
    function setClientFromTouch(e: Event): void;

    /**
     * Check whether a given event is a mouse or touch event.
     * @param {!Event} e An event.
     * @return {boolean} True if it is a mouse or touch event; false otherwise.
     */
    function isMouseOrTouchEvent(e: Event): boolean;

    /**
     * Check whether a given event is a touch event or a pointer event.
     * @param {!Event} e An event.
     * @return {boolean} True if it is a touch event; false otherwise.
     */
    function isTouchEvent(e: Event): boolean;

    /**
     * Split an event into an array of events, one per changed touch or mouse
     * point.
     * @param {!Event} e A mouse event or a touch event with one or more changed
     * touches.
     * @return {!Array.<!Event>} An array of mouse or touch events.  Each touch
     *     event will have exactly one changed touch.
     */
    function splitEventByTouches(e: Event): Event[];
}

declare module Blockly {

    /**
     * Context menus on touch devices are activated using a long-press.
     * Unfortunately the contextmenu touch event is currently (2015) only supported
     * by Chrome.  This function is fired on any touchstart event, queues a task,
     * which after about a second opens the context menu.  The tasks is killed
     * if the touch event terminates early.
     * @param {!Event} e Touch start event.
     * @param {Blockly.Gesture} gesture The gesture that triggered this longStart.
     * @package
     */
    function longStart(e: Event, gesture: Blockly.Gesture): void;

    /**
     * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
     * or a drag hath begun.  Kill the queued long-press task.
     * @package
     */
    function longStop_(): void;
}


declare module Blockly {

    class TouchGesture extends TouchGesture__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TouchGesture__Class extends Blockly.Gesture__Class  { 
    
            /**
             * Class for one gesture.
             * @param {!Event} e The event that kicked off this gesture.
             * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
             *     this gesture and has a reference to it.
             * @extends {Blockly.Gesture}
             * @constructor
             */
            constructor(e: Event, creatorWorkspace: Blockly.WorkspaceSvg);
    
            /**
             * Start a gesture: update the workspace to indicate that a gesture is in
             * progress and bind mousemove and mouseup handlers.
             * @param {!Event} e A mouse down, touch start or pointer down event.
             * @package
             */
            doStart(e: Event): void;
    
            /**
             * Bind gesture events.
             * Overriding the gesture definition of this function, binding the same
             * functions for onMoveWrapper_ and onUpWrapper_ but passing
             * opt_noCaptureIdentifier.
             * In addition, binding a second mouse down event to detect multi-touch events.
             * @param {!Event} e A mouse down or touch start event.
             * @package
             */
            bindMouseEvents(e: Event): void;
    
            /**
             * Handle a mouse down, touch start, or pointer down event.
             * @param {!Event} e A mouse down, touch start, or pointer down event.
             * @package
             */
            handleStart(e: Event): void;
    
            /**
             * Handle a mouse move, touch move, or pointer move event.
             * @param {!Event} e A mouse move, touch move, or pointer move event.
             * @package
             */
            handleMove(e: Event): void;
    
            /**
             * Handle a mouse up, touch end, or pointer up event.
             * @param {!Event} e A mouse up, touch end, or pointer up event.
             * @package
             */
            handleUp(e: Event): void;
    
            /**
             * Whether this gesture is part of a multi-touch gesture.
             * @return {boolean} Whether this gesture is part of a multi-touch gesture.
             * @package
             */
            isMultiTouch(): boolean;
    
            /**
             * Sever all links from this object.
             * @package
             */
            dispose(): void;
    
            /**
             * Handle a touch start or pointer down event and keep track of current
             * pointers.
             * @param {!Event} e A touch start, or pointer down event.
             * @package
             */
            handleTouchStart(e: Event): void;
    
            /**
             * Handle a touch move or pointer move event and zoom in/out if two pointers
             * are on the screen.
             * @param {!Event} e A touch move, or pointer move event.
             * @package
             */
            handleTouchMove(e: Event): void;
    
            /**
             * Handle a touch end or pointer end event and end the gesture.
             * @param {!Event} e A touch end, or pointer end event.
             * @package
             */
            handleTouchEnd(e: Event): void;
    
            /**
             * Helper function returning the current touch point coordinate.
             * @param {!Event} e A touch or pointer event.
             * @return {Blockly.utils.Coordinate} The current touch point coordinate
             * @package
             */
            getTouchPoint(e: Event): Blockly.utils.Coordinate;
    } 
    
}

declare module Blockly.TouchGesture {

    /**
     * A multiplier used to convert the gesture scale to a zoom in delta.
     * @const
     */
    var ZOOM_IN_MULTIPLIER: any /*missing*/;

    /**
     * A multiplier used to convert the gesture scale to a zoom out delta.
     * @const
     */
    var ZOOM_OUT_MULTIPLIER: any /*missing*/;
}


declare module Blockly {

    class Trashcan extends Trashcan__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Trashcan__Class implements Blockly.IDeleteArea  { 
    
            /**
             * Class for a trash can.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
             * @constructor
             * @implements {Blockly.IDeleteArea}
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * The trashcan flyout.
             * @type {Blockly.Flyout}
             * @package
             */
            flyout: Blockly.Flyout;
    
            /**
             * Current open/close state of the lid.
             * @type {boolean}
             */
            isOpen: boolean;
    
            /**
             * Create the trash can elements.
             * @return {!SVGElement} The trash can's SVG group.
             */
            createDom(): SVGElement;
    
            /**
             * Initialize the trash can.
             * @param {number} verticalSpacing Vertical distance from workspace edge to the
             *    same edge of the trashcan.
             * @return {number} Vertical distance from workspace edge to the opposite
             *    edge of the trashcan.
             */
            init(verticalSpacing: number): number;
    
            /**
             * Dispose of this trash can.
             * Unlink from all DOM elements to prevent memory leaks.
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Returns true if the trashcan contents-flyout is currently open.
             * @return {boolean} True if the trashcan contents-flyout is currently open.
             */
            contentsIsOpen(): boolean;
    
            /**
             * Empties the trashcan's contents. If the contents-flyout is currently open
             * it will be closed.
             */
            emptyContents(): void;
    
            /**
             * Position the trashcan.
             * It is positioned in the opposite corner to the corner the
             * categories/toolbox starts at.
             */
            position(): void;
    
            /**
             * Return the deletion rectangle for this trash can.
             * @return {Blockly.utils.Rect} Rectangle in which to delete.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Flip the lid open or shut.
             * @param {boolean} state True if open.
             * @package
             */
            setOpen(state: boolean): void;
    
            /**
             * Flip the lid shut.
             * Called externally after a drag.
             */
            close(): void;
    
            /**
             * Inspect the contents of the trash.
             */
            click(): void;
    } 
    
}


declare module Blockly.Events {

    class Ui extends Ui__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Ui__Class extends Blockly.Events.Abstract__Class  { 
    
            /**
             * Class for a UI event.
             * UI events are events that don't need to be sent over the wire for multi-user
             * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
             * categories).
             * UI events do not undo or redo.
             * @param {Blockly.Block} block The affected block.
             * @param {string} element One of 'selected', 'comment', 'mutatorOpen', etc.
             * @param {*} oldValue Previous value of element.
             * @param {*} newValue New value of element.
             * @extends {Blockly.Events.Abstract}
             * @constructor
             */
            constructor(block: Blockly.Block, element: string, oldValue: any, newValue: any);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    } 
    
}


declare module Blockly.utils {

    /**
     * Don't do anything for this event, just halt propagation.
     * @param {!Event} e An event.
     */
    function noEvent(e: Event): void;

    /**
     * Is this event targeting a text input widget?
     * @param {!Event} e An event.
     * @return {boolean} True if text input.
     */
    function isTargetInput(e: Event): boolean;

    /**
     * Return the coordinates of the top-left corner of this element relative to
     * its parent.  Only for SVG elements and children (e.g. rect, g, path).
     * @param {!Element} element SVG element to find the coordinates of.
     * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
     */
    function getRelativeXY(element: Element): Blockly.utils.Coordinate;

    /**
     * Return the coordinates of the top-left corner of this element relative to
     * the div Blockly was injected into.
     * @param {!Element} element SVG element to find the coordinates of. If this is
     *     not a child of the div Blockly was injected into, the behaviour is
     *     undefined.
     * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
     */
    function getInjectionDivXY_(element: Element): Blockly.utils.Coordinate;

    /**
     * Is this event a right-click?
     * @param {!Event} e Mouse event.
     * @return {boolean} True if right-click.
     */
    function isRightButton(e: Event): boolean;

    /**
     * Return the converted coordinates of the given mouse event.
     * The origin (0,0) is the top-left corner of the Blockly SVG.
     * @param {!Event} e Mouse event.
     * @param {!Element} svg SVG element.
     * @param {SVGMatrix} matrix Inverted screen CTM to use.
     * @return {!SVGPoint} Object with .x and .y properties.
     */
    function mouseToSvg(e: Event, svg: Element, matrix: SVGMatrix): SVGPoint;

    /**
     * Get the scroll delta of a mouse event in pixel units.
     * @param {!Event} e Mouse event.
     * @return {{x: number, y: number}} Scroll delta object with .x and .y
     *    properties.
     */
    function getScrollDeltaPixels(e: Event): { x: number; y: number };

    /**
     * Parse a string with any number of interpolation tokens (%1, %2, ...).
     * It will also replace string table references (e.g., %{bky_my_msg} and
     * %{BKY_MY_MSG} will both be replaced with the value in
     * Blockly.Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
     * (e.g., '%%').
     * @param {string} message Text which might contain string table references and
     *     interpolation tokens.
     * @return {!Array.<string|number>} Array of strings and numbers.
     */
    function tokenizeInterpolation(message: string): string|number[];

    /**
     * Replaces string table references in a message, if the message is a string.
     * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
     * the value in Blockly.Msg['MY_MSG'].
     * @param {string|?} message Message, which may be a string that contains
     *     string table references.
     * @return {string} String with message references replaced.
     */
    function replaceMessageReferences(message: string|any): string;

    /**
     * Validates that any %{MSG_KEY} references in the message refer to keys of
     * the Blockly.Msg string table.
     * @param {string} message Text which might contain string table references.
     * @return {boolean} True if all message references have matching values.
     *     Otherwise, false.
     */
    function checkMessageReferences(message: string): boolean;

    /**
     * Generate a unique ID.  This should be globally unique.
     * 87 characters ^ 20 length > 128 bits (better than a UUID).
     * @return {string} A globally unique ID string.
     */
    function genUid(): string;

    /**
     * Check if 3D transforms are supported by adding an element
     * and attempting to set the property.
     * @return {boolean} True if 3D transforms are supported.
     */
    function is3dSupported(): boolean;

    /**
     * Calls a function after the page has loaded, possibly immediately.
     * @param {function()} fn Function to run.
     * @throws Error Will throw if no global document can be found (e.g., Node.js).
     */
    function runAfterPageLoad(fn: { (): any /*missing*/ }): void;

    /**
     * Get the position of the current viewport in window coordinates.  This takes
     * scroll into account.
     * @return {!Blockly.utils.Rect} An object containing window width, height, and
     *     scroll position in window coordinates.
     * @package
     */
    function getViewportBBox(): Blockly.utils.Rect;

    /**
     * Removes the first occurrence of a particular value from an array.
     * @param {!Array} arr Array from which to remove
     *     value.
     * @param {*} obj Object to remove.
     * @return {boolean} True if an element was removed.
     * @package
     */
    function arrayRemove(arr: any[], obj: any): boolean;

    /**
     * Gets the document scroll distance as a coordinate object.
     * Copied from Closure's goog.dom.getDocumentScroll.
     * @return {!Blockly.utils.Coordinate} Object with values 'x' and 'y'.
     */
    function getDocumentScroll(): Blockly.utils.Coordinate;

    /**
     * Get a map of all the block's descendants mapping their type to the number of
     *    children with that type.
     * @param {!Blockly.Block} block The block to map.
     * @param {boolean=} opt_stripFollowing Optionally ignore all following
     *    statements (blocks that are not inside a value or statement input
     *    of the block).
     * @return {!Object} Map of types to type counts for descendants of the bock.
     */
    function getBlockTypeCounts(block: Blockly.Block, opt_stripFollowing?: boolean): Object;

    /**
     * Converts screen coordinates to workspace coordinates.
     * @param {Blockly.WorkspaceSvg} ws The workspace to find the coordinates on.
     * @param {Blockly.utils.Coordinate} screenCoordinates The screen coordinates to
     * be converted to workspace coordinates
     * @return {Blockly.utils.Coordinate} The workspace coordinates.
     * @package
     */
    function screenToWsCoordinates(ws: Blockly.WorkspaceSvg, screenCoordinates: Blockly.utils.Coordinate): Blockly.utils.Coordinate;

    /**
     * Parse a block colour from a number or string, as provided in a block
     * definition.
     * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
     *     or a message reference string pointing to one of those two values.
     * @return {{hue: ?number, hex: string}} An object containing the colour as
     *     a #RRGGBB string, and the hue if the input was an HSV hue value.
     * @throws {Error} If the colour cannot be parsed.
     */
    function parseBlockColour(colour: number|string): { hue: number; hex: string };
}


declare module Blockly.Events {

    class VarBase extends VarBase__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VarBase__Class extends Blockly.Events.Abstract__Class  { 
    
            /**
             * Abstract class for a variable event.
             * @param {Blockly.VariableModel} variable The variable this event corresponds
             *     to.
             * @extends {Blockly.Events.Abstract}
             * @constructor
             */
            constructor(variable: Blockly.VariableModel);
    
            /**
             * The variable id for the variable this event pertains to.
             * @type {string}
             */
            varId: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    } 
    

    class VarCreate extends VarCreate__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VarCreate__Class extends Blockly.Events.VarBase__Class  { 
    
            /**
             * Class for a variable creation event.
             * @param {Blockly.VariableModel} variable The created variable.
             *     Null for a blank event.
             * @extends {Blockly.Events.VarBase}
             * @constructor
             */
            constructor(variable: Blockly.VariableModel);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a variable creation event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class VarDelete extends VarDelete__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VarDelete__Class extends Blockly.Events.VarBase__Class  { 
    
            /**
             * Class for a variable deletion event.
             * @param {Blockly.VariableModel} variable The deleted variable.
             *     Null for a blank event.
             * @extends {Blockly.Events.VarBase}
             * @constructor
             */
            constructor(variable: Blockly.VariableModel);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a variable deletion event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class VarRename extends VarRename__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VarRename__Class extends Blockly.Events.VarBase__Class  { 
    
            /**
             * Class for a variable rename event.
             * @param {Blockly.VariableModel} variable The renamed variable.
             *     Null for a blank event.
             * @param {string} newName The new name the variable will be changed to.
             * @extends {Blockly.Events.VarBase}
             * @constructor
             */
            constructor(variable: Blockly.VariableModel, newName: string);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a variable rename event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    
}


declare module Blockly {

    class VariableMap extends VariableMap__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VariableMap__Class  { 
    
            /**
             * Class for a variable map.  This contains a dictionary data structure with
             * variable types as keys and lists of variables as values.  The list of
             * variables are the type indicated by the key.
             * @param {!Blockly.Workspace} workspace The workspace this map belongs to.
             * @constructor
             */
            constructor(workspace: Blockly.Workspace);
    
            /**
             * The workspace this map belongs to.
             * @type {!Blockly.Workspace}
             */
            workspace: Blockly.Workspace;
    
            /**
             * Clear the variable map.
             */
            clear(): void;
    
            /**
             * Rename the given variable by updating its name in the variable map.
             * @param {!Blockly.VariableModel} variable Variable to rename.
             * @param {string} newName New variable name.
             * @package
             */
            renameVariable(variable: Blockly.VariableModel, newName: string): void;
    
            /**
             * Rename a variable by updating its name in the variable map. Identify the
             * variable to rename with the given ID.
             * @param {string} id ID of the variable to rename.
             * @param {string} newName New variable name.
             */
            renameVariableById(id: string, newName: string): void;
    
            /**
             * Create a variable with a given name, optional type, and optional ID.
             * @param {string} name The name of the variable. This must be unique across
             *     variables and procedures.
             * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
             *     Does not need to be unique. Field_variable can filter variables based on
             *     their type. This will default to '' which is a specific type.
             * @param {?string=} opt_id The unique ID of the variable. This will default to
             *     a UUID.
             * @return {!Blockly.VariableModel} The newly created variable.
             */
            createVariable(name: string, opt_type?: string, opt_id?: string): Blockly.VariableModel;
    
            /**
             * Delete a variable.
             * @param {!Blockly.VariableModel} variable Variable to delete.
             */
            deleteVariable(variable: Blockly.VariableModel): void;
    
            /**
             * Delete a variables by the passed in ID and all of its uses from this
             * workspace. May prompt the user for confirmation.
             * @param {string} id ID of variable to delete.
             */
            deleteVariableById(id: string): void;
    
            /**
             * Deletes a variable and all of its uses from this workspace without asking the
             * user for confirmation.
             * @param {!Blockly.VariableModel} variable Variable to delete.
             * @param {!Array.<!Blockly.Block>} uses An array of uses of the variable.
             * @package
             */
            deleteVariableInternal(variable: Blockly.VariableModel, uses: Blockly.Block[]): void;
    
            /**
             * Find the variable by the given name and type and return it.  Return null if
             *     it is not found.
             * @param {string} name The name to check for.
             * @param {?string=} opt_type The type of the variable.  If not provided it
             *     defaults to the empty string, which is a specific type.
             * @return {Blockly.VariableModel} The variable with the given name, or null if
             *     it was not found.
             */
            getVariable(name: string, opt_type?: string): Blockly.VariableModel;
    
            /**
             * Find the variable by the given ID and return it. Return null if it is not
             *     found.
             * @param {string} id The ID to check for.
             * @return {Blockly.VariableModel} The variable with the given ID.
             */
            getVariableById(id: string): Blockly.VariableModel;
    
            /**
             * Get a list containing all of the variables of a specified type. If type is
             *     null, return list of variables with empty string type.
             * @param {?string} type Type of the variables to find.
             * @return {!Array.<!Blockly.VariableModel>} The sought after variables of the
             *     passed in type. An empty array if none are found.
             */
            getVariablesOfType(type: string): Blockly.VariableModel[];
    
            /**
             * Return all variable and potential variable types.  This list always contains
             * the empty string.
             * @param {?Blockly.Workspace} ws The workspace used to look for potential
             * variables. This can be different than the workspace stored on this object
             * if the passed in ws is a flyout workspace.
             * @return {!Array.<string>} List of variable types.
             * @package
             */
            getVariableTypes(ws: Blockly.Workspace): string[];
    
            /**
             * Return all variables of all types.
             * @return {!Array.<!Blockly.VariableModel>} List of variable models.
             */
            getAllVariables(): Blockly.VariableModel[];
    
            /**
             * Returns all of the variable names of all types.
             * @return {!Array.<string>} All of the variable names of all types.
             */
            getAllVariableNames(): string[];
    
            /**
             * Find all the uses of a named variable.
             * @param {string} id ID of the variable to find.
             * @return {!Array.<!Blockly.Block>} Array of block usages.
             */
            getVariableUsesById(id: string): Blockly.Block[];
    } 
    
}


declare module Blockly {

    class VariableModel extends VariableModel__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class VariableModel__Class  { 
    
            /**
             * Class for a variable model.
             * Holds information for the variable including name, ID, and type.
             * @param {!Blockly.Workspace} workspace The variable's workspace.
             * @param {string} name The name of the variable. This must be unique across
             *     variables and procedures.
             * @param {string=} opt_type The type of the variable like 'int' or 'string'.
             *     Does not need to be unique. Field_variable can filter variables based on
             *     their type. This will default to '' which is a specific type.
             * @param {string=} opt_id The unique ID of the variable. This will default to
             *     a UUID.
             * @see {Blockly.FieldVariable}
             * @constructor
             */
            constructor(workspace: Blockly.Workspace, name: string, opt_type?: string, opt_id?: string);
    
            /**
             * The workspace the variable is in.
             * @type {!Blockly.Workspace}
             */
            workspace: Blockly.Workspace;
    
            /**
             * The name of the variable, typically defined by the user. It must be
             * unique across all names used for procedures and variables. It may be
             * changed by the user.
             * @type {string}
             */
            name: string;
    
            /**
             * The type of the variable, such as 'int' or 'sound_effect'. This may be
             * used to build a list of variables of a specific type. By default this is
             * the empty string '', which is a specific type.
             * @see {Blockly.FieldVariable}
             * @type {string}
             */
            type: string;
    
            /**
             * @return {string} The ID for the variable.
             */
            getId(): string;
    } 
    
}

declare module Blockly.VariableModel {

    /**
     * A custom compare function for the VariableModel objects.
     * @param {Blockly.VariableModel} var1 First variable to compare.
     * @param {Blockly.VariableModel} var2 Second variable to compare.
     * @return {number} -1 if name of var1 is less than name of var2, 0 if equal,
     *     and 1 if greater.
     * @package
     */
    function compareByName(var1: Blockly.VariableModel, var2: Blockly.VariableModel): number;
}


declare module Blockly.Variables {

    /**
     * Constant to separate variable names from procedures and generated functions
     * when running generators.
     * @deprecated Use Blockly.VARIABLE_CATEGORY_NAME
     */
    var NAME_TYPE: any /*missing*/;

    /**
     * Find all user-created variables that are in use in the workspace.
     * For use by generators.
     * To get a list of all variables on a workspace, including unused variables,
     * call Workspace.getAllVariables.
     * @param {!Blockly.Workspace} ws The workspace to search for variables.
     * @return {!Array.<!Blockly.VariableModel>} Array of variable models.
     */
    function allUsedVarModels(ws: Blockly.Workspace): Blockly.VariableModel[];

    /**
     * Find all user-created variables that are in use in the workspace and return
     * only their names.
     * For use by generators.
     * To get a list of all variables on a workspace, including unused variables,
     * call Workspace.getAllVariables.
     * @deprecated January 2018
     */
    function allUsedVariables(): void;

    /**
     * Find all developer variables used by blocks in the workspace.
     * Developer variables are never shown to the user, but are declared as global
     * variables in the generated code.
     * To declare developer variables, define the getDeveloperVariables function on
     * your block and return a list of variable names.
     * For use by generators.
     * @param {!Blockly.Workspace} workspace The workspace to search.
     * @return {!Array.<string>} A list of non-duplicated variable names.
     */
    function allDeveloperVariables(workspace: Blockly.Workspace): string[];

    /**
     * Construct the elements (blocks and button) required by the flyout for the
     * variable category.
     * @param {!Blockly.Workspace} workspace The workspace containing variables.
     * @return {!Array.<!Element>} Array of XML elements.
     */
    function flyoutCategory(workspace: Blockly.Workspace): Element[];

    /**
     * Construct the blocks required by the flyout for the variable category.
     * @param {!Blockly.Workspace} workspace The workspace containing variables.
     * @return {!Array.<!Element>} Array of XML block elements.
     */
    function flyoutCategoryBlocks(workspace: Blockly.Workspace): Element[];

    /**
     * Return a new variable name that is not yet being used. This will try to
     * generate single letter variable names in the range 'i' to 'z' to start with.
     * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
     * then 'i2' to 'z2' etc.  Skip 'l'.
     * @param {!Blockly.Workspace} workspace The workspace to be unique in.
     * @return {string} New variable name.
     */
    function generateUniqueName(workspace: Blockly.Workspace): string;

    /**
     * Returns a unique name that is not present in the usedNames array. This
     * will try to generate single letter names in the range a -> z (skip l). It
     * will start with the character passed to startChar.
     * @param {string} startChar The character to start the search at.
     * @param {!Array.<string>} usedNames A list of all of the used names.
     * @return {string} A unique name that is not present in the usedNames array.
     */
    function generateUniqueNameFromOptions(startChar: string, usedNames: string[]): string;

    /**
     * Handles "Create Variable" button in the default variables toolbox category.
     * It will prompt the user for a variable name, including re-prompts if a name
     * is already in use among the workspace's variables.
     *
     * Custom button handlers can delegate to this function, allowing variables
     * types and after-creation processing. More complex customization (e.g.,
     * prompting for variable type) is beyond the scope of this function.
     *
     * @param {!Blockly.Workspace} workspace The workspace on which to create the
     *     variable.
     * @param {function(?string=)=} opt_callback A callback. It will be passed an
     *     acceptable new variable name, or null if change is to be aborted (cancel
     *     button), or undefined if an existing variable was chosen.
     * @param {string=} opt_type The type of the variable like 'int', 'string', or
     *     ''. This will default to '', which is a specific type.
     */
    function createVariableButtonHandler(workspace: Blockly.Workspace, opt_callback?: { (_0: string): any /*missing*/ }, opt_type?: string): void;

    /**
     * Original name of Blockly.Variables.createVariableButtonHandler(..).
     * @deprecated Use Blockly.Variables.createVariableButtonHandler(..).
     *
     * @param {!Blockly.Workspace} workspace The workspace on which to create the
     *     variable.
     * @param {function(?string=)=} opt_callback A callback. It will be passed an
     *     acceptable new variable name, or null if change is to be aborted (cancel
     *     button), or undefined if an existing variable was chosen.
     * @param {string=} opt_type The type of the variable like 'int', 'string', or
     *     ''. This will default to '', which is a specific type.
     */
    function createVariable(workspace: Blockly.Workspace, opt_callback?: { (_0: string): any /*missing*/ }, opt_type?: string): void;

    /**
     * Opens a prompt that allows the user to enter a new name for a variable.
     * Triggers a rename if the new name is valid. Or re-prompts if there is a
     * collision.
     * @param {!Blockly.Workspace} workspace The workspace on which to rename the
     *     variable.
     * @param {Blockly.VariableModel} variable Variable to rename.
     * @param {function(?string=)=} opt_callback A callback. It will
     *     be passed an acceptable new variable name, or null if change is to be
     *     aborted (cancel button), or undefined if an existing variable was chosen.
     */
    function renameVariable(workspace: Blockly.Workspace, variable: Blockly.VariableModel, opt_callback?: { (_0: string): any /*missing*/ }): void;

    /**
     * Prompt the user for a new variable name.
     * @param {string} promptText The string of the prompt.
     * @param {string} defaultText The default value to show in the prompt's field.
     * @param {function(?string)} callback A callback. It will return the new
     *     variable name, or null if the user picked something illegal.
     */
    function promptName(promptText: string, defaultText: string, callback: { (_0: string): any /*missing*/ }): void;

    /**
     * Check whether there exists a variable with the given name of any type.
     * @param {string} name The name to search for.
     * @param {!Blockly.Workspace} workspace The workspace to search for the
     *     variable.
     * @return {Blockly.VariableModel} The variable with the given name,
     *     or null if none was found.
     */
    function nameUsedWithAnyType(name: string, workspace: Blockly.Workspace): Blockly.VariableModel;

    /**
     * Generate DOM objects representing a variable field.
     * @param {!Blockly.VariableModel} variableModel The variable model to
     *     represent.
     * @return {Element} The generated DOM.
     * @public
     */
    function generateVariableFieldDom(variableModel: Blockly.VariableModel): Element;

    /**
     * Helper function to look up or create a variable on the given workspace.
     * If no variable exists, creates and returns it.
     * @param {!Blockly.Workspace} workspace The workspace to search for the
     *     variable.  It may be a flyout workspace or main workspace.
     * @param {?string} id The ID to use to look up or create the variable, or null.
     * @param {string=} opt_name The string to use to look up or create the
     *     variable.
     * @param {string=} opt_type The type to use to look up or create the variable.
     * @return {!Blockly.VariableModel} The variable corresponding to the given ID
     *     or name + type combination.
     */
    function getOrCreateVariablePackage(workspace: Blockly.Workspace, id: string, opt_name?: string, opt_type?: string): Blockly.VariableModel;

    /**
     * Look up  a variable on the given workspace.
     * Always looks in the main workspace before looking in the flyout workspace.
     * Always prefers lookup by ID to lookup by name + type.
     * @param {!Blockly.Workspace} workspace The workspace to search for the
     *     variable.  It may be a flyout workspace or main workspace.
     * @param {?string} id The ID to use to look up the variable, or null.
     * @param {string=} opt_name The string to use to look up the variable.
     *     Only used if lookup by ID fails.
     * @param {string=} opt_type The type to use to look up the variable.
     *     Only used if lookup by ID fails.
     * @return {Blockly.VariableModel} The variable corresponding to the given ID
     *     or name + type combination, or null if not found.
     * @public
     */
    function getVariable(workspace: Blockly.Workspace, id: string, opt_name?: string, opt_type?: string): Blockly.VariableModel;

    /**
     * Helper function to get the list of variables that have been added to the
     * workspace after adding a new block, using the given list of variables that
     * were in the workspace before the new block was added.
     * @param {!Blockly.Workspace} workspace The workspace to inspect.
     * @param {!Array.<!Blockly.VariableModel>} originalVariables The array of
     *     variables that existed in the workspace before adding the new block.
     * @return {!Array.<!Blockly.VariableModel>} The new array of variables that
     *     were freshly added to the workspace after creating the new block,
     *     or [] if no new variables were added to the workspace.
     * @package
     */
    function getAddedVariables(workspace: Blockly.Workspace, originalVariables: Blockly.VariableModel[]): Blockly.VariableModel[];
}


declare module Blockly.VariablesDynamic {

    /**
     * Construct the elements (blocks and button) required by the flyout for the
     * variable category.
     * @param {!Blockly.Workspace} workspace The workspace containing variables.
     * @return {!Array.<!Element>} Array of XML elements.
     */
    function flyoutCategory(workspace: Blockly.Workspace): Element[];

    /**
     * Construct the blocks required by the flyout for the variable category.
     * @param {!Blockly.Workspace} workspace The workspace containing variables.
     * @return {!Array.<!Element>} Array of XML block elements.
     */
    function flyoutCategoryBlocks(workspace: Blockly.Workspace): Element[];
}


declare module Blockly {

    class Warning extends Warning__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Warning__Class extends Blockly.Icon__Class  { 
    
            /**
             * Class for a warning.
             * @param {!Blockly.Block} block The block associated with this warning.
             * @extends {Blockly.Icon}
             * @constructor
             */
            constructor(block: Blockly.Block);
    
            /**
             * Does this icon get hidden when the block is collapsed.
             */
            collapseHidden: any /*missing*/;
    
            /**
             * Draw the warning icon.
             * @param {!Element} group The icon group.
             * @protected
             */
            drawIcon_(group: Element): void;
    
            /**
             * Show or hide the warning bubble.
             * @param {boolean} visible True if the bubble should be visible.
             */
            setVisible(visible: boolean): void;
    
            /**
             * Show the bubble.
             * @package
             */
            createBubble(): void;
    
            /**
             * Dispose of the bubble and references to it.
             * @package
             */
            disposeBubble(): void;
    
            /**
             * Set this warning's text.
             * @param {string} text Warning text (or '' to delete). This supports
             *    linebreaks.
             * @param {string} id An ID for this text entry to be able to maintain
             *     multiple warnings.
             */
            setText(text: string, id: string): void;
    
            /**
             * Get this warning's texts.
             * @return {string} All texts concatenated into one string.
             */
            getText(): string;
    
            /**
             * Dispose of this warning.
             */
            dispose(): void;
    } 
    
}


declare module Blockly.WidgetDiv {

    /**
     * Create the widget div and inject it onto the page.
     */
    function createDom(): void;

    /**
       * The HTML container for popup overlays (e.g. editor widgets).
       * @type {!Element}
       */
    var DIV: Element;

    /**
     * Initialize and display the widget div.  Close the old one if needed.
     * @param {!Object} newOwner The object that will be using this container.
     * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
     * @param {Function} dispose Optional cleanup function to be run when the
     *     widget is closed.
     */
    function show(newOwner: Object, rtl: boolean, dispose: Function): void;

    /**
     * Destroy the widget and hide the div.
     */
    function hide(): void;

    /**
     * Is the container visible?
     * @return {boolean} True if visible.
     */
    function isVisible(): boolean;

    /**
     * Destroy the widget and hide the div if it is being used by the specified
     * object.
     * @param {!Object} oldOwner The object that was using this container.
     */
    function hideIfOwner(oldOwner: Object): void;

    /**
     * Position the widget div based on an anchor rectangle.
     * The widget should be placed adjacent to but not overlapping the anchor
     * rectangle.  The preferred position is directly below and aligned to the left
     * (LTR) or right (RTL) side of the anchor.
     * @param {!Blockly.utils.Rect} viewportBBox The bounding rectangle of the
     *     current viewport, in window coordinates.
     * @param {!Blockly.utils.Rect} anchorBBox The bounding rectangle of the anchor,
     *     in window coordinates.
     * @param {!Blockly.utils.Size} widgetSize The size of the widget that is inside
     *     the widget div, in window coordinates.
     * @param {boolean} rtl Whether the workspace is in RTL mode.  This determines
     *     horizontal alignment.
     * @package
     */
    function positionWithAnchor(viewportBBox: Blockly.utils.Rect, anchorBBox: Blockly.utils.Rect, widgetSize: Blockly.utils.Size, rtl: boolean): void;
}


declare module Blockly {

    class Workspace extends Workspace__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Workspace__Class implements Blockly.IASTNodeLocation  { 
    
            /**
             * Class for a workspace.  This is a data structure that contains blocks.
             * There is no UI, and can be created headlessly.
             * @param {!Blockly.Options=} opt_options Dictionary of options.
             * @constructor
             * @implements {Blockly.IASTNodeLocation}
             */
            constructor(opt_options?: Blockly.Options);
    
            /** @type {string} */
            id: string;
    
            /** @type {!Blockly.Options} */
            options: Blockly.Options;
    
            /** @type {boolean} */
            RTL: boolean;
    
            /** @type {boolean} */
            horizontalLayout: boolean;
    
            /** @type {number} */
            toolboxPosition: number;
    
            /**
             * @type {!Array.<!Blockly.Events.Abstract>}
             * @protected
             */
            undoStack_: Blockly.Events.Abstract[];
    
            /**
             * @type {!Array.<!Blockly.Events.Abstract>}
             * @protected
             */
            redoStack_: Blockly.Events.Abstract[];
    
            /**
             * Returns `true` if the workspace is visible and `false` if it's headless.
             * @type {boolean}
             */
            rendered: boolean;
    
            /**
             * Returns `true` if the workspace is currently in the process of a bulk clear.
             * @type {boolean}
             * @package
             */
            isClearing: boolean;
    
            /**
             * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets
             * it to unlimited.
             * @type {number}
             */
            MAX_UNDO: number;
    
            /**
             * Set of databases for rapid lookup of connection locations.
             * @type {Array.<!Blockly.ConnectionDB>}
             */
            connectionDBList: Blockly.ConnectionDB[];
    
            /**
             * Dispose of this workspace.
             * Unlink from all DOM elements to prevent memory leaks.
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Adds a block to the list of top blocks.
             * @param {!Blockly.Block} block Block to add.
             */
            addTopBlock(block: Blockly.Block): void;
    
            /**
             * Removes a block from the list of top blocks.
             * @param {!Blockly.Block} block Block to remove.
             */
            removeTopBlock(block: Blockly.Block): void;
    
            /**
             * Finds the top-level blocks and returns them.  Blocks are optionally sorted
             * by position; top to bottom (with slight LTR or RTL bias).
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.Block>} The top-level block objects.
             */
            getTopBlocks(ordered: boolean): Blockly.Block[];
    
            /**
             * Add a block to the list of blocks keyed by type.
             * @param {!Blockly.Block} block Block to add.
             */
            addTypedBlock(block: Blockly.Block): void;
    
            /**
             * Remove a block from the list of blocks keyed by type.
             * @param {!Blockly.Block} block Block to remove.
             */
            removeTypedBlock(block: Blockly.Block): void;
    
            /**
             * Finds the blocks with the associated type and returns them. Blocks are
             * optionally sorted by position; top to bottom (with slight LTR or RTL bias).
             * @param {string} type The type of block to search for.
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.Block>} The blocks of the given type.
             */
            getBlocksByType(type: string, ordered: boolean): Blockly.Block[];
    
            /**
             * Adds a comment to the list of top comments.
             * @param {!Blockly.WorkspaceComment} comment comment to add.
             * @package
             */
            addTopComment(comment: Blockly.WorkspaceComment): void;
    
            /**
             * Removes a comment from the list of top comments.
             * @param {!Blockly.WorkspaceComment} comment comment to remove.
             * @package
             */
            removeTopComment(comment: Blockly.WorkspaceComment): void;
    
            /**
             * Finds the top-level comments and returns them.  Comments are optionally
             * sorted by position; top to bottom (with slight LTR or RTL bias).
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.WorkspaceComment>} The top-level comment objects.
             * @package
             */
            getTopComments(ordered: boolean): Blockly.WorkspaceComment[];
    
            /**
             * Find all blocks in workspace.  Blocks are optionally sorted
             * by position; top to bottom (with slight LTR or RTL bias).
             * @param {boolean} ordered Sort the list if true.
             * @return {!Array.<!Blockly.Block>} Array of blocks.
             */
            getAllBlocks(ordered: boolean): Blockly.Block[];
    
            /**
             * Dispose of all blocks and comments in workspace.
             */
            clear(): void;
    
            /**
             * Rename a variable by updating its name in the variable map. Identify the
             * variable to rename with the given ID.
             * @param {string} id ID of the variable to rename.
             * @param {string} newName New variable name.
             */
            renameVariableById(id: string, newName: string): void;
    
            /**
             * Create a variable with a given name, optional type, and optional ID.
             * @param {string} name The name of the variable. This must be unique across
             *     variables and procedures.
             * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
             *     Does not need to be unique. Field_variable can filter variables based on
             *     their type. This will default to '' which is a specific type.
             * @param {?string=} opt_id The unique ID of the variable. This will default to
             *     a UUID.
             * @return {!Blockly.VariableModel} The newly created variable.
             */
            createVariable(name: string, opt_type?: string, opt_id?: string): Blockly.VariableModel;
    
            /**
             * Find all the uses of the given variable, which is identified by ID.
             * @param {string} id ID of the variable to find.
             * @return {!Array.<!Blockly.Block>} Array of block usages.
             */
            getVariableUsesById(id: string): Blockly.Block[];
    
            /**
             * Delete a variables by the passed in ID and all of its uses from this
             * workspace. May prompt the user for confirmation.
             * @param {string} id ID of variable to delete.
             */
            deleteVariableById(id: string): void;
    
            /**
             * Check whether a variable exists with the given name.  The check is
             * case-insensitive.
             * @param {string} _name The name to check for.
             * @return {number} The index of the name in the variable list, or -1 if it is
             *     not present.
             * @deprecated April 2017
             */
            variableIndexOf(_name: string): number;
    
            /**
             * Find the variable by the given name and return it. Return null if it is not
             *     found.
             * @param {string} name The name to check for.
             * @param {string=} opt_type The type of the variable.  If not provided it
             *     defaults to the empty string, which is a specific type.
             * @return {Blockly.VariableModel} The variable with the given name.
             */
            getVariable(name: string, opt_type?: string): Blockly.VariableModel;
    
            /**
             * Find the variable by the given ID and return it. Return null if it is not
             *     found.
             * @param {string} id The ID to check for.
             * @return {Blockly.VariableModel} The variable with the given ID.
             */
            getVariableById(id: string): Blockly.VariableModel;
    
            /**
             * Find the variable with the specified type. If type is null, return list of
             *     variables with empty string type.
             * @param {?string} type Type of the variables to find.
             * @return {!Array.<!Blockly.VariableModel>} The sought after variables of the
             *     passed in type. An empty array if none are found.
             */
            getVariablesOfType(type: string): Blockly.VariableModel[];
    
            /**
             * Return all variable types.
             * @return {!Array.<string>} List of variable types.
             * @package
             */
            getVariableTypes(): string[];
    
            /**
             * Return all variables of all types.
             * @return {!Array.<!Blockly.VariableModel>} List of variable models.
             */
            getAllVariables(): Blockly.VariableModel[];
    
            /**
             * Returns all variable names of all types.
             * @return {!Array.<string>} List of all variable names of all types.
             */
            getAllVariableNames(): string[];
    
            /**
             * Returns the horizontal offset of the workspace.
             * Intended for LTR/RTL compatibility in XML.
             * Not relevant for a headless workspace.
             * @return {number} Width.
             */
            getWidth(): number;
    
            /**
             * Obtain a newly created block.
             * @param {?string} prototypeName Name of the language object containing
             *     type-specific functions for this block.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @return {!Blockly.Block} The created block.
             */
            newBlock(prototypeName: string, opt_id?: string): Blockly.Block;
    
            /**
             * The number of blocks that may be added to the workspace before reaching
             *     the maxBlocks.
             * @return {number} Number of blocks left.
             */
            remainingCapacity(): number;
    
            /**
             * The number of blocks of the given type that may be added to the workspace
             *    before reaching the maxInstances allowed for that type.
             * @param {string} type Type of block to return capacity for.
             * @return {number} Number of blocks of type left.
             */
            remainingCapacityOfType(type: string): number;
    
            /**
             * Check if there is remaining capacity for blocks of the given counts to be
             *    created. If the total number of blocks represented by the map is more than
             *    the total remaining capacity, it returns false. If a type count is more
             *    than the remaining capacity for that type, it returns false.
             * @param {!Object} typeCountsMap A map of types to counts (usually representing
             *    blocks to be created).
             * @return {boolean} True if there is capacity for the given map,
             *    false otherwise.
             */
            isCapacityAvailable(typeCountsMap: Object): boolean;
    
            /**
             * Checks if the workspace has any limits on the maximum number of blocks,
             *    or the maximum number of blocks of specific types.
             * @return {boolean} True if it has block limits, false otherwise.
             */
            hasBlockLimits(): boolean;
    
            /**
             * Undo or redo the previous action.
             * @param {boolean} redo False if undo, true if redo.
             */
            undo(redo: boolean): void;
    
            /**
             * Clear the undo/redo stacks.
             */
            clearUndo(): void;
    
            /**
             * When something in this workspace changes, call a function.
             * Note that there may be a few recent events already on the stack.  Thus the
             * new change listener might be called with events that occurred a few
             * milliseconds before the change listener was added.
             * @param {!Function} func Function to call.
             * @return {!Function} Obsolete return value, ignore.
             */
            addChangeListener(func: Function): Function;
    
            /**
             * Stop listening for this workspace's changes.
             * @param {Function} func Function to stop calling.
             */
            removeChangeListener(func: Function): void;
    
            /**
             * Fire a change event.
             * @param {!Blockly.Events.Abstract} event Event to fire.
             */
            fireChangeListener(event: Blockly.Events.Abstract): void;
    
            /**
             * Find the block on this workspace with the specified ID.
             * @param {string} id ID of block to find.
             * @return {Blockly.Block} The sought after block, or null if not found.
             */
            getBlockById(id: string): Blockly.Block;
    
            /**
             * Set a block on this workspace with the specified ID.
             * @param {string} id ID of block to set.
             * @param {Blockly.Block} block The block to set.
             * @package
             */
            setBlockById(id: string, block: Blockly.Block): void;
    
            /**
             * Delete a block off this workspace with the specified ID.
             * @param {string} id ID of block to delete.
             * @package
             */
            removeBlockById(id: string): void;
    
            /**
             * Find the comment on this workspace with the specified ID.
             * @param {string} id ID of comment to find.
             * @return {Blockly.WorkspaceComment} The sought after comment, or null if not
             *     found.
             * @package
             */
            getCommentById(id: string): Blockly.WorkspaceComment;
    
            /**
             * Checks whether all value and statement inputs in the workspace are filled
             * with blocks.
             * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
             *     whether shadow blocks are counted as filled. Defaults to true.
             * @return {boolean} True if all inputs are filled, false otherwise.
             */
            allInputsFilled(opt_shadowBlocksAreFilled?: boolean): boolean;
    
            /**
             * Return the variable map that contains "potential" variables.
             * These exist in the flyout but not in the workspace.
             * @return {Blockly.VariableMap} The potential variable map.
             * @package
             */
            getPotentialVariableMap(): Blockly.VariableMap;
    
            /**
             * Create and store the potential variable map for this workspace.
             * @package
             */
            createPotentialVariableMap(): void;
    
            /**
             * Return the map of all variables on the workspace.
             * @return {!Blockly.VariableMap} The variable map.
             */
            getVariableMap(): Blockly.VariableMap;
    
            /**
             * Set the map of all variables on the workspace.
             * @param {!Blockly.VariableMap} variableMap The variable map.
             * @package
             */
            setVariableMap(variableMap: Blockly.VariableMap): void;
    } 
    
}

declare module Blockly.Workspace {

    /**
     * Angle away from the horizontal to sweep for blocks.  Order of execution is
     * generally top to bottom, but a small angle changes the scan to give a bit of
     * a left to right bias (reversed in RTL).  Units are in degrees.
     * See: https://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling
     */
    var SCAN_ANGLE: any /*missing*/;

    /**
     * Find the workspace with the specified ID.
     * @param {string} id ID of workspace to find.
     * @return {Blockly.Workspace} The sought after workspace or null if not found.
     */
    function getById(id: string): Blockly.Workspace;

    /**
     * Find all workspaces.
     * @return {!Array.<!Blockly.Workspace>} Array of workspaces.
     */
    function getAll(): Blockly.Workspace[];
}


declare module Blockly {

    class WorkspaceAudio extends WorkspaceAudio__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceAudio__Class  { 
    
            /**
             * Class for loading, storing, and playing audio for a workspace.
             * @param {Blockly.WorkspaceSvg} parentWorkspace The parent of the workspace
             *     this audio object belongs to, or null.
             * @constructor
             */
            constructor(parentWorkspace: Blockly.WorkspaceSvg);
    
            /**
             * Dispose of this audio manager.
             * @package
             */
            dispose(): void;
    
            /**
             * Load an audio file.  Cache it, ready for instantaneous playing.
             * @param {!Array.<string>} filenames List of file types in decreasing order of
             *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
             *   Filenames include path from Blockly's root.  File extensions matter.
             * @param {string} name Name of sound.
             */
            load(filenames: string[], name: string): void;
    
            /**
             * Preload all the audio files so that they play quickly when asked for.
             * @package
             */
            preload(): void;
    
            /**
             * Play a named sound at specified volume.  If volume is not specified,
             * use full volume (1).
             * @param {string} name Name of sound.
             * @param {number=} opt_volume Volume of sound (0-1).
             */
            play(name: string, opt_volume?: number): void;
    } 
    
}


declare module Blockly {

    class WorkspaceComment extends WorkspaceComment__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceComment__Class  { 
    
            /**
             * Class for a workspace comment.
             * @param {!Blockly.Workspace} workspace The block's workspace.
             * @param {string} content The content of this workspace comment.
             * @param {number} height Height of the comment.
             * @param {number} width Width of the comment.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @constructor
             */
            constructor(workspace: Blockly.Workspace, content: string, height: number, width: number, opt_id?: string);
    
            /** @type {string} */
            id: string;
    
            /**
             * The comment's position in workspace units.  (0, 0) is at the workspace's
             * origin; scale does not change this value.
             * @type {!Blockly.utils.Coordinate}
             * @protected
             */
            xy_: Blockly.utils.Coordinate;
    
            /**
             * @type {!Blockly.Workspace}
             */
            workspace: Blockly.Workspace;
    
            /**
             * @protected
             * @type {boolean}
             */
            RTL: boolean;
    
            /**
             * @protected
             * @type {string}
             */
            content_: string;
    
            /**
             * @package
             * @type {boolean}
             */
            isComment: boolean;
    
            /**
             * Dispose of this comment.
             * @package
             */
            dispose(): void;
    
            /**
             * Get comment height.
             * @return {number} Comment height.
             * @package
             */
            getHeight(): number;
    
            /**
             * Set comment height.
             * @param {number} height Comment height.
             * @package
             */
            setHeight(height: number): void;
    
            /**
             * Get comment width.
             * @return {number} Comment width.
             * @package
             */
            getWidth(): number;
    
            /**
             * Set comment width.
             * @param {number} width comment width.
             * @package
             */
            setWidth(width: number): void;
    
            /**
             * Get stored location.
             * @return {!Blockly.utils.Coordinate} The comment's stored location.
             *   This is not valid if the comment is currently being dragged.
             * @package
             */
            getXY(): Blockly.utils.Coordinate;
    
            /**
             * Move a comment by a relative offset.
             * @param {number} dx Horizontal offset, in workspace units.
             * @param {number} dy Vertical offset, in workspace units.
             * @package
             */
            moveBy(dx: number, dy: number): void;
    
            /**
             * Get whether this comment is deletable or not.
             * @return {boolean} True if deletable.
             * @package
             */
            isDeletable(): boolean;
    
            /**
             * Set whether this comment is deletable or not.
             * @param {boolean} deletable True if deletable.
             * @package
             */
            setDeletable(deletable: boolean): void;
    
            /**
             * Get whether this comment is movable or not.
             * @return {boolean} True if movable.
             * @package
             */
            isMovable(): boolean;
    
            /**
             * Set whether this comment is movable or not.
             * @param {boolean} movable True if movable.
             * @package
             */
            setMovable(movable: boolean): void;
    
            /**
             * Get whether this comment is editable or not.
             * @return {boolean} True if editable.
             */
            isEditable(): boolean;
    
            /**
             * Set whether this comment is editable or not.
             * @param {boolean} editable True if editable.
             */
            setEditable(editable: boolean): void;
    
            /**
             * Returns this comment's text.
             * @return {string} Comment text.
             * @package
             */
            getContent(): string;
    
            /**
             * Set this comment's content.
             * @param {string} content Comment content.
             * @package
             */
            setContent(content: string): void;
    
            /**
             * Encode a comment subtree as XML with XY coordinates.
             * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
             * @return {!Element} Tree of XML elements.
             * @package
             */
            toXmlWithXY(opt_noId?: boolean): Element;
    
            /**
             * Encode a comment subtree as XML, but don't serialize the XY coordinates.
             * This method avoids some expensive metrics-related calls that are made in
             * toXmlWithXY().
             * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
             * @return {!Element} Tree of XML elements.
             * @package
             */
            toXml(opt_noId?: boolean): Element;
    } 
    
}

declare module Blockly.WorkspaceComment {

    /**
     * Fire a create event for the given workspace comment, if comments are enabled.
     * @param {!Blockly.WorkspaceComment} comment The comment that was just created.
     * @package
     */
    function fireCreateEvent(comment: Blockly.WorkspaceComment): void;

    /**
     * Decode an XML comment tag and create a comment on the workspace.
     * @param {!Element} xmlComment XML comment element.
     * @param {!Blockly.Workspace} workspace The workspace.
     * @return {!Blockly.WorkspaceComment} The created workspace comment.
     * @package
     */
    function fromXml(xmlComment: Element, workspace: Blockly.Workspace): Blockly.WorkspaceComment;

    /**
     * Decode an XML comment tag and return the results in an object.
     * @param {!Element} xml XML comment element.
     * @return {{w: number, h: number, x: number, y: number, content: string}} An
     *     object containing the id, size, position, and comment string.
     * @package
     */
    function parseAttributes(xml: Element): { w: number; h: number; x: number; y: number; content: string };
}



declare module Blockly {

    class WorkspaceCommentSvg extends WorkspaceCommentSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceCommentSvg__Class extends Blockly.WorkspaceComment__Class implements Blockly.IBoundedElement, Blockly.ICopyable  { 
    
            /**
             * Class for a workspace comment's SVG representation.
             * @param {!Blockly.Workspace} workspace The block's workspace.
             * @param {string} content The content of this workspace comment.
             * @param {number} height Height of the comment.
             * @param {number} width Width of the comment.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @extends {Blockly.WorkspaceComment}
             * @implements {Blockly.IBoundedElement}
             * @implements {Blockly.ICopyable}
             * @constructor
             */
            constructor(workspace: Blockly.Workspace, content: string, height: number, width: number, opt_id?: string);
    
            /**
             * Dispose of this comment.
             * @package
             */
            dispose(): void;
    
            /**
             * Create and initialize the SVG representation of a workspace comment.
             * May be called more than once.
             * @package
             */
            initSvg(): void;
    
            /**
             * Show the context menu for this workspace comment.
             * @param {!Event} e Mouse event.
             * @package
             */
            showContextMenu(e: Event): void;
    
            /**
             * Select this comment.  Highlight it visually.
             * @package
             */
            select(): void;
    
            /**
             * Unselect this comment.  Remove its highlighting.
             * @package
             */
            unselect(): void;
    
            /**
             * Select this comment.  Highlight it visually.
             * @package
             */
            addSelect(): void;
    
            /**
             * Unselect this comment.  Remove its highlighting.
             * @package
             */
            removeSelect(): void;
    
            /**
             * Focus this comment.  Highlight it visually.
             * @package
             */
            addFocus(): void;
    
            /**
             * Unfocus this comment.  Remove its highlighting.
             * @package
             */
            removeFocus(): void;
    
            /**
             * Return the coordinates of the top-left corner of this comment relative to
             * the drawing surface's origin (0,0), in workspace units.
             * If the comment is on the workspace, (0, 0) is the origin of the workspace
             * coordinate system.
             * This does not change with workspace scale.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties in
             *     workspace coordinates.
             * @package
             */
            getRelativeToSurfaceXY(): Blockly.utils.Coordinate;
    
            /**
             * Move a comment by a relative offset.
             * @param {number} dx Horizontal offset, in workspace units.
             * @param {number} dy Vertical offset, in workspace units.
             * @package
             */
            moveBy(dx: number, dy: number): void;
    
            /**
             * Transforms a comment by setting the translation on the transform attribute
             * of the block's SVG.
             * @param {number} x The x coordinate of the translation in workspace units.
             * @param {number} y The y coordinate of the translation in workspace units.
             * @package
             */
            translate(x: number, y: number): void;
    
            /**
             * Move this comment to its workspace's drag surface, accounting for
             * positioning.  Generally should be called at the same time as
             * setDragging(true).  Does nothing if useDragSurface_ is false.
             * @package
             */
            moveToDragSurface(): void;
    
            /**
             * Move this comment during a drag, taking into account whether we are using a
             * drag surface to translate blocks.
             * @param {Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
             *     rendered items during a drag, or null if no drag surface is in use.
             * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
             *     workspace coordinates.
             * @package
             */
            moveDuringDrag(dragSurface: Blockly.BlockDragSurfaceSvg, newLoc: Blockly.utils.Coordinate): void;
    
            /**
             * Move the bubble group to the specified location in workspace coordinates.
             * @param {number} x The x position to move to.
             * @param {number} y The y position to move to.
             * @package
             */
            moveTo(x: number, y: number): void;
    
            /**
             * Returns the coordinates of a bounding box describing the dimensions of this
             * comment.
             * Coordinate system: workspace coordinates.
             * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
             * @package
             */
            getBoundingRectangle(): Blockly.utils.Rect;
    
            /**
             * Add or remove the UI indicating if this comment is movable or not.
             * @package
             */
            updateMovable(): void;
    
            /**
             * Set whether this comment is movable or not.
             * @param {boolean} movable True if movable.
             * @package
             */
            setMovable(movable: boolean): void;
    
            /**
             * Set whether this comment is editable or not.
             * @param {boolean} editable True if editable.
             */
            setEditable(editable: boolean): void;
    
            /**
             * Recursively adds or removes the dragging class to this node and its children.
             * @param {boolean} adding True if adding, false if removing.
             * @package
             */
            setDragging(adding: boolean): void;
    
            /**
             * Return the root node of the SVG or null if none exists.
             * @return {SVGElement} The root SVG node (probably a group).
             * @package
             */
            getSvgRoot(): SVGElement;
    
            /**
             * Returns this comment's text.
             * @return {string} Comment text.
             * @package
             */
            getContent(): string;
    
            /**
             * Set this comment's content.
             * @param {string} content Comment content.
             * @package
             */
            setContent(content: string): void;
    
            /**
             * Update the cursor over this comment by adding or removing a class.
             * @param {boolean} enable True if the delete cursor should be shown, false
             *     otherwise.
             * @package
             */
            setDeleteStyle(enable: boolean): void;
    
            /**
             * Encode a comment subtree as XML with XY coordinates.
             * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
             * @return {!Element} Tree of XML elements.
             * @package
             */
            toXmlWithXY(opt_noId?: boolean): Element;
    
            /**
             * Encode a comment for copying.
             * @return {!Blockly.ICopyable.CopyData} Copy metadata.
             * @package
             */
            toCopyData(): Blockly.ICopyable.CopyData;
    } 
    
}

declare module Blockly.WorkspaceCommentSvg {

    /**
     * The width and height to use to size a workspace comment when it is first
     * added, before it has been edited by the user.
     * @type {number}
     * @package
     */
    var DEFAULT_SIZE: number;

    /**
     * Decode an XML comment tag and create a rendered comment on the workspace.
     * @param {!Element} xmlComment XML comment element.
     * @param {!Blockly.Workspace} workspace The workspace.
     * @param {number=} opt_wsWidth The width of the workspace, which is used to
     *     position comments correctly in RTL.
     * @return {!Blockly.WorkspaceCommentSvg} The created workspace comment.
     * @package
     */
    function fromXml(xmlComment: Element, workspace: Blockly.Workspace, opt_wsWidth?: number): Blockly.WorkspaceCommentSvg;
}


declare module Blockly {

    class WorkspaceDragSurfaceSvg extends WorkspaceDragSurfaceSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceDragSurfaceSvg__Class  { 
    
            /**
             * Blocks are moved into this SVG during a drag, improving performance.
             * The entire SVG is translated using CSS transforms instead of SVG so the
             * blocks are never repainted during drag improving performance.
             * @param {!Element} container Containing element.
             * @constructor
             */
            constructor(container: Element);
    
            /**
             * Dom structure when the workspace is being dragged. If there is no drag in
             * progress, the SVG is empty and display: none.
             * <svg class="blocklyWsDragSurface" style=transform:translate3d(...)>
             *   <g class="blocklyBlockCanvas"></g>
             *   <g class="blocklyBubbleCanvas">/g>
             * </svg>
             */
            SVG_: any /*missing*/;
    
            /**
             * Create the drag surface and inject it into the container.
             */
            createDom(): void;
    
            /**
             * Translate the entire drag surface during a drag.
             * We translate the drag surface instead of the blocks inside the surface
             * so that the browser avoids repainting the SVG.
             * Because of this, the drag coordinates must be adjusted by scale.
             * @param {number} x X translation for the entire surface
             * @param {number} y Y translation for the entire surface
             * @package
             */
            translateSurface(x: number, y: number): void;
    
            /**
             * Reports the surface translation in scaled workspace coordinates.
             * Use this when finishing a drag to return blocks to the correct position.
             * @return {!Blockly.utils.Coordinate} Current translation of the surface
             * @package
             */
            getSurfaceTranslation(): Blockly.utils.Coordinate;
    
            /**
             * Move the blockCanvas and bubbleCanvas out of the surface SVG and on to
             * newSurface.
             * @param {SVGElement} newSurface The element to put the drag surface contents
             *     into.
             * @package
             */
            clearAndHide(newSurface: SVGElement): void;
    
            /**
             * Set the SVG to have the block canvas and bubble canvas in it and then
             * show the surface.
             * @param {!SVGElement} blockCanvas The block canvas <g> element from the
             *     workspace.
             * @param {!SVGElement} bubbleCanvas The <g> element that contains the bubbles.
             * @param {Element} previousSibling The element to insert the block canvas and
                   bubble canvas after when it goes back in the DOM at the end of a drag.
             * @param {number} width The width of the workspace SVG element.
             * @param {number} height The height of the workspace SVG element.
             * @param {number} scale The scale of the workspace being dragged.
             * @package
             */
            setContentsAndShow(blockCanvas: SVGElement, bubbleCanvas: SVGElement, previousSibling: Element, width: number, height: number, scale: number): void;
    } 
    
}


declare module Blockly {

    class WorkspaceDragger extends WorkspaceDragger__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceDragger__Class  { 
    
            /**
             * Class for a workspace dragger.  It moves the workspace around when it is
             * being dragged by a mouse or touch.
             * Note that the workspace itself manages whether or not it has a drag surface
             * and how to do translations based on that.  This simply passes the right
             * commands based on events.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * The scroll position of the workspace at the beginning of the drag.
             * Coordinate system: pixel coordinates.
             * @type {!Blockly.utils.Coordinate}
             * @protected
             */
            startScrollXY_: Blockly.utils.Coordinate;
    
            /**
             * Sever all links from this object.
             * @package
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Start dragging the workspace.
             * @package
             */
            startDrag(): void;
    
            /**
             * Finish dragging the workspace and put everything back where it belongs.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel coordinates.
             * @package
             */
            endDrag(currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Move the workspace based on the most recent mouse movements.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel coordinates.
             * @package
             */
            drag(currentDragDeltaXY: Blockly.utils.Coordinate): void;
    } 
    
}


declare module Blockly.Events {

    class FinishedLoading extends FinishedLoading__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FinishedLoading__Class extends Blockly.Events.Abstract__Class  { 
    
            /**
             * Class for a finished loading event.
             * Used to notify the developer when the workspace has finished loading (i.e
             * domToWorkspace).
             * Finished loading events do not record undo or redo.
             * @param {!Blockly.Workspace} workspace The workspace that has finished
             *    loading.
             * @extends {Blockly.Events.Abstract}
             * @constructor
             */
            constructor(workspace: Blockly.Workspace);
    
            /**
             * The workspace identifier for this event.
             * @type {string}
             */
            workspaceId: string;
    
            /**
             * The event group ID for the group this event belongs to. Groups define
             * events that should be treated as an single action from the user's
             * perspective, and should be undone together.
             * @type {string}
             */
            group: string;
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    } 
    
}


declare module Blockly {

    class WorkspaceSvg extends WorkspaceSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class WorkspaceSvg__Class extends Blockly.Workspace__Class implements Blockly.IASTNodeLocationSvg  { 
    
            /**
             * Class for a workspace.  This is an onscreen area with optional trashcan,
             * scrollbars, bubbles, and dragging.
             * @param {!Blockly.Options} options Dictionary of options.
             * @param {Blockly.BlockDragSurfaceSvg=} opt_blockDragSurface Drag surface for
             *     blocks.
             * @param {Blockly.WorkspaceDragSurfaceSvg=} opt_wsDragSurface Drag surface for
             *     the workspace.
             * @extends {Blockly.Workspace}
             * @implements {Blockly.IASTNodeLocationSvg}
             * @constructor
             */
            constructor(options: Blockly.Options, opt_blockDragSurface?: Blockly.BlockDragSurfaceSvg, opt_wsDragSurface?: Blockly.WorkspaceDragSurfaceSvg);
    
            /** @type {function():!Blockly.utils.Metrics} */
            getMetrics: { (): Blockly.utils.Metrics };
    
            /** @type {function(!{x:number, y:number}):void} */
            setMetrics: { (_0: { x: number; y: number }): void };
    
            /**
             * Object in charge of storing and updating the workspace theme.
             * @type {!Blockly.ThemeManager}
             * @protected
             */
            themeManager_: Blockly.ThemeManager;
    
            /**
             * True if keyboard accessibility mode is on, false otherwise.
             * @type {boolean}
             */
            keyboardAccessibilityMode: boolean;
    
            /**
             * The render status of an SVG workspace.
             * Returns `false` for headless workspaces and true for instances of
             * `Blockly.WorkspaceSvg`.
             * @type {boolean}
             */
            rendered: boolean;
    
            /**
             * Is this workspace the surface for a flyout?
             * @type {boolean}
             */
            isFlyout: boolean;
    
            /**
             * Is this workspace the surface for a mutator?
             * @type {boolean}
             * @package
             */
            isMutator: boolean;
    
            /**
             * Current horizontal scrolling offset in pixel units, relative to the
             * workspace origin.
             *
             * It is useful to think about a view, and a canvas moving beneath that
             * view. As the canvas moves right, this value becomes more positive, and
             * the view is now "seeing" the left side of the canvas. As the canvas moves
             * left, this value becomes more negative, and the view is now "seeing" the
             * right side of the canvas.
             *
             * The confusing thing about this value is that it does not, and must not
             * include the absoluteLeft offset. This is because it is used to calculate
             * the viewLeft value.
             *
             * The viewLeft is relative to the workspace origin (although in pixel
             * units). The workspace origin is the top-left corner of the workspace (at
             * least when it is enabled). It is shifted from the top-left of the blocklyDiv
             * so as not to be beneath the toolbox.
             *
             * When the workspace is enabled the viewLeft and workspace origin are at
             * the same X location. As the canvas slides towards the right beneath the view
             * this value (scrollX) becomes more positive, and the viewLeft becomes more
             * negative relative to the workspace origin (imagine the workspace origin
             * as a dot on the canvas sliding to the right as the canvas moves).
             *
             * So if the scrollX were to include the absoluteLeft this would in a way
             * "unshift" the workspace origin. This means that the viewLeft would be
             * representing the left edge of the blocklyDiv, rather than the left edge
             * of the workspace.
             *
             * @type {number}
             */
            scrollX: number;
    
            /**
             * Current vertical scrolling offset in pixel units, relative to the
             * workspace origin.
             *
             * It is useful to think about a view, and a canvas moving beneath that
             * view. As the canvas moves down, this value becomes more positive, and the
             * view is now "seeing" the upper part of the canvas. As the canvas moves
             * up, this value becomes more negative, and the view is "seeing" the lower
             * part of the canvas.
             *
             * This confusing thing about this value is that it does not, and must not
             * include the absoluteTop offset. This is because it is used to calculate
             * the viewTop value.
             *
             * The viewTop is relative to the workspace origin (although in pixel
             * units). The workspace origin is the top-left corner of the workspace (at
             * least when it is enabled). It is shifted from the top-left of the
             * blocklyDiv so as not to be beneath the toolbox.
             *
             * When the workspace is enabled the viewTop and workspace origin are at the
             * same Y location. As the canvas slides towards the bottom this value
             * (scrollY) becomes more positive, and the viewTop becomes more negative
             * relative to the workspace origin (image in the workspace origin as a dot
             * on the canvas sliding downwards as the canvas moves).
             *
             * So if the scrollY were to include the absoluteTop this would in a way
             * "unshift" the workspace origin. This means that the viewTop would be
             * representing the top edge of the blocklyDiv, rather than the top edge of
             * the workspace.
             *
             * @type {number}
             */
            scrollY: number;
    
            /**
             * Horizontal scroll value when scrolling started in pixel units.
             * @type {number}
             */
            startScrollX: number;
    
            /**
             * Vertical scroll value when scrolling started in pixel units.
             * @type {number}
             */
            startScrollY: number;
    
            /**
             * Current scale.
             * @type {number}
             */
            scale: number;
    
            /** @type {Blockly.Trashcan} */
            trashcan: Blockly.Trashcan;
    
            /**
             * This workspace's scrollbars, if they exist.
             * @type {Blockly.ScrollbarPair}
             */
            scrollbar: Blockly.ScrollbarPair;
    
            /**
             * Developers may define this function to add custom menu options to the
             * workspace's context menu or edit the workspace-created set of menu options.
             * @param {!Array.<!Object>} options List of menu options to add to.
             * @param {!Event} e The right-click event that triggered the context menu.
             */
            configureContextMenu(options: Object[], e: Event): void;
    
            /**
             * In a flyout, the target workspace where blocks should be placed after a drag.
             * Otherwise null.
             * @type {Blockly.WorkspaceSvg}
             * @package
             */
            targetWorkspace: Blockly.WorkspaceSvg;
    
            /**
             * Get the marker manager for this workspace.
             * @return {Blockly.MarkerManager} The marker manager.
             */
            getMarkerManager(): Blockly.MarkerManager;
    
            /**
             * Add the cursor svg to this workspaces svg group.
             * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
             *     workspace svg group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker svg to this workspaces svg group.
             * @param {SVGElement} markerSvg The svg root of the marker to be added to the
             *     workspace svg group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Get the marker with the given id.
             * @param {string} id The id of the marker.
             * @return {Blockly.Marker} The marker with the given id or null if no marker
             *     with the given id exists.
             * @package
             */
            getMarker(id: string): Blockly.Marker;
    
            /**
             * The cursor for this workspace.
             * @return {Blockly.Cursor} The cursor for the workspace.
             */
            getCursor(): Blockly.Cursor;
    
            /**
             * Get the block renderer attached to this workspace.
             * @return {!Blockly.blockRendering.Renderer} The renderer attached to this workspace.
             */
            getRenderer(): Blockly.blockRendering.Renderer;
    
            /**
             * Get the theme manager for this workspace.
             * @return {!Blockly.ThemeManager} The theme manager for this workspace.
             * @package
             */
            getThemeManager(): Blockly.ThemeManager;
    
            /**
             * Get the workspace theme object.
             * @return {!Blockly.Theme} The workspace theme object.
             */
            getTheme(): Blockly.Theme;
    
            /**
             * Set the workspace theme object.
             * If no theme is passed, default to the `Blockly.Themes.Classic` theme.
             * @param {Blockly.Theme} theme The workspace theme object.
             */
            setTheme(theme: Blockly.Theme): void;
    
            /**
             * Refresh all blocks on the workspace after a theme update.
             * @package
             */
            refreshTheme(): void;
    
            /**
             * Getter for the inverted screen CTM.
             * @return {SVGMatrix} The matrix to use in mouseToSvg
             */
            getInverseScreenCTM(): SVGMatrix;
    
            /**
             * Mark the inverse screen CTM as dirty.
             */
            updateInverseScreenCTM(): void;
    
            /**
             * Getter for isVisible
             * @return {boolean} Whether the workspace is visible.
             *     False if the workspace has been hidden by calling `setVisible(false)`.
             */
            isVisible(): boolean;
    
            /**
             * Return the absolute coordinates of the top-left corner of this element,
             * scales that after canvas SVG element, if it's a descendant.
             * The origin (0,0) is the top-left corner of the Blockly SVG.
             * @param {!SVGElement} element SVG element to find the coordinates of.
             * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
             * @package
             */
            getSvgXY(element: SVGElement): Blockly.utils.Coordinate;
    
            /**
             * Return the position of the workspace origin relative to the injection div
             * origin in pixels.
             * The workspace origin is where a block would render at position (0, 0).
             * It is not the upper left corner of the workspace SVG.
             * @return {!Blockly.utils.Coordinate} Offset in pixels.
             * @package
             */
            getOriginOffsetInPixels(): Blockly.utils.Coordinate;
    
            /**
             * Return the injection div that is a parent of this workspace.
             * Walks the DOM the first time it's called, then returns a cached value.
             * Note: We assume this is only called after the workspace has been injected
             * into the DOM.
             * @return {!Element} The first parent div with 'injectionDiv' in the name.
             * @package
             */
            getInjectionDiv(): Element;
    
            /**
             * Get the svg block canvas for the workspace.
             * @return {SVGElement} The svg group for the workspace.
             * @package
             */
            getBlockCanvas(): SVGElement;
    
            /**
             * Save resize handler data so we can delete it later in dispose.
             * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent_.
             */
            setResizeHandlerWrapper(handler: any[][]): void;
    
            /**
             * Create the workspace DOM elements.
             * @param {string=} opt_backgroundClass Either 'blocklyMainBackground' or
             *     'blocklyMutatorBackground'.
             * @return {!Element} The workspace's SVG group.
             */
            createDom(opt_backgroundClass?: string): Element;
    
            /**
             * <g class="blocklyWorkspace">
             *   <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
             *   [Trashcan and/or flyout may go here]
             *   <g class="blocklyBlockCanvas"></g>
             *   <g class="blocklyBubbleCanvas"></g>
             * </g>
             * @type {SVGElement}
             */
            svgGroup_: SVGElement;
    
            /** @type {SVGElement} */
            svgBackground_: SVGElement;
    
            /** @type {SVGElement} */
            svgBlockCanvas_: SVGElement;
    
            /** @type {SVGElement} */
            svgBubbleCanvas_: SVGElement;
    
            /**
             * Dispose of this workspace.
             * Unlink from all DOM elements to prevent memory leaks.
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Add a trashcan.
             * @package
             */
            addTrashcan(): void;
    
            /**
             * Add zoom controls.
             * @package
             */
            addZoomControls(): void;
    
            /** @type {Blockly.ZoomControls} */
            zoomControls_: Blockly.ZoomControls;
    
            /**
             * Add a flyout element in an element with the given tag name.
             * @param {string} tagName What type of tag the flyout belongs in.
             * @return {!Element} The element containing the flyout DOM.
             * @package
             */
            addFlyout(tagName: string): Element;
    
            /**
             * Getter for the flyout associated with this workspace.  This flyout may be
             * owned by either the toolbox or the workspace, depending on toolbox
             * configuration.  It will be null if there is no flyout.
             * @param {boolean=} opt_own Only return the workspace's own flyout if True.
             * @return {Blockly.Flyout} The flyout on this workspace.
             * @package
             */
            getFlyout(opt_own?: boolean): Blockly.Flyout;
    
            /**
             * Getter for the toolbox associated with this workspace, if one exists.
             * @return {Blockly.IToolbox} The toolbox on this workspace.
             * @package
             */
            getToolbox(): Blockly.IToolbox;
    
            /**
             * If enabled, resize the parts of the workspace that change when the workspace
             * contents (e.g. block positions) change.  This will also scroll the
             * workspace contents if needed.
             * @package
             */
            resizeContents(): void;
    
            /**
             * Resize and reposition all of the workspace chrome (toolbox,
             * trash, scrollbars etc.)
             * This should be called when something changes that
             * requires recalculating dimensions and positions of the
             * trash, zoom, toolbox, etc. (e.g. window resize).
             */
            resize(): void;
    
            /**
             * Resizes and repositions workspace chrome if the page has a new
             * scroll position.
             * @package
             */
            updateScreenCalculationsIfScrolled(): void;
    
            /**
             * Get the SVG element that forms the drawing surface.
             * @return {!SVGGElement} SVG group element.
             */
            getCanvas(): SVGGElement;
    
            /**
             * Get the SVG element that forms the bubble surface.
             * @return {!SVGGElement} SVG group element.
             */
            getBubbleCanvas(): SVGGElement;
    
            /**
             * Get the SVG element that contains this workspace.
             * Note: We assume this is only called after the workspace has been injected
             * into the DOM.
             * @return {!SVGElement} SVG element.
             */
            getParentSvg(): SVGElement;
    
            /**
             * Translate this workspace to new coordinates.
             * @param {number} x Horizontal translation, in pixel units relative to the
             *    top left of the Blockly div.
             * @param {number} y Vertical translation, in pixel units relative to the
             *    top left of the Blockly div.
             */
            translate(x: number, y: number): void;
    
            /**
             * Called at the end of a workspace drag to take the contents
             * out of the drag surface and put them back into the workspace SVG.
             * Does nothing if the workspace drag surface is not enabled.
             * @package
             */
            resetDragSurface(): void;
    
            /**
             * Called at the beginning of a workspace drag to move contents of
             * the workspace to the drag surface.
             * Does nothing if the drag surface is not enabled.
             * @package
             */
            setupDragSurface(): void;
    
            /**
             * @return {Blockly.BlockDragSurfaceSvg} This workspace's block drag surface,
             *     if one is in use.
             * @package
             */
            getBlockDragSurface(): Blockly.BlockDragSurfaceSvg;
    
            /**
             * Returns the horizontal offset of the workspace.
             * Intended for LTR/RTL compatibility in XML.
             * @return {number} Width.
             */
            getWidth(): number;
    
            /**
             * Toggles the visibility of the workspace.
             * Currently only intended for main workspace.
             * @param {boolean} isVisible True if workspace should be visible.
             */
            setVisible(isVisible: boolean): void;
    
            /**
             * Render all blocks in workspace.
             */
            render(): void;
    
            /**
             * Was used back when block highlighting (for execution) and block selection
             * (for editing) were the same thing.
             * Any calls of this function can be deleted.
             * @deprecated October 2016
             */
            traceOn(): void;
    
            /**
             * Highlight or unhighlight a block in the workspace.  Block highlighting is
             * often used to visually mark blocks currently being executed.
             * @param {?string} id ID of block to highlight/unhighlight,
             *   or null for no block (used to unhighlight all blocks).
             * @param {boolean=} opt_state If undefined, highlight specified block and
             * automatically unhighlight all others.  If true or false, manually
             * highlight/unhighlight the specified block.
             */
            highlightBlock(id: string, opt_state?: boolean): void;
    
            /**
             * Paste the provided block onto the workspace.
             * @param {!Element} xmlBlock XML block element.
             */
            paste(xmlBlock: Element): void;
    
            /**
             * Refresh the toolbox unless there's a drag in progress.
             * @package
             */
            refreshToolboxSelection(): void;
    
            /**
             * Rename a variable by updating its name in the variable map.  Update the
             *     flyout to show the renamed variable immediately.
             * @param {string} id ID of the variable to rename.
             * @param {string} newName New variable name.
             */
            renameVariableById(id: string, newName: string): void;
    
            /**
             * Delete a variable by the passed in ID.   Update the flyout to show
             *     immediately that the variable is deleted.
             * @param {string} id ID of variable to delete.
             */
            deleteVariableById(id: string): void;
    
            /**
             * Create a new variable with the given name.  Update the flyout to show the
             *     new variable immediately.
             * @param {string} name The new variable's name.
             * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
             *     Does not need to be unique. Field_variable can filter variables based on
             *     their type. This will default to '' which is a specific type.
             * @param {?string=} opt_id The unique ID of the variable. This will default to
             *     a UUID.
             * @return {!Blockly.VariableModel} The newly created variable.
             */
            createVariable(name: string, opt_type?: string, opt_id?: string): Blockly.VariableModel;
    
            /**
             * Make a list of all the delete areas for this workspace.
             */
            recordDeleteAreas(): void;
    
            /**
             * Is the mouse event over a delete area (toolbox or non-closing flyout)?
             * @param {!Event} e Mouse move event.
             * @return {?number} Null if not over a delete area, or an enum representing
             *     which delete area the event is over.
             */
            isDeleteArea(e: Event): number;
    
            /**
             * Start tracking a drag of an object on this workspace.
             * @param {!Event} e Mouse down event.
             * @param {!Blockly.utils.Coordinate} xy Starting location of object.
             */
            startDrag(e: Event, xy: Blockly.utils.Coordinate): void;
    
            /**
             * Track a drag of an object on this workspace.
             * @param {!Event} e Mouse move event.
             * @return {!Blockly.utils.Coordinate} New location of object.
             */
            moveDrag(e: Event): Blockly.utils.Coordinate;
    
            /**
             * Is the user currently dragging a block or scrolling the flyout/workspace?
             * @return {boolean} True if currently dragging or scrolling.
             */
            isDragging(): boolean;
    
            /**
             * Is this workspace draggable?
             * @return {boolean} True if this workspace may be dragged.
             */
            isDraggable(): boolean;
    
            /**
             * Should the workspace have bounded content? Used to tell if the
             * workspace's content should be sized so that it can move (bounded) or not
             * (exact sizing).
             * @return {boolean} True if the workspace should be bounded, false otherwise.
             * @package
             */
            isContentBounded(): boolean;
    
            /**
             * Is this workspace movable?
             *
             * This means the user can reposition the X Y coordinates of the workspace
             * through input. This can be through scrollbars, scroll wheel, dragging, or
             * through zooming with the scroll wheel or pinch (since the zoom is centered on
             * the mouse position). This does not include zooming with the zoom controls
             * since the X Y coordinates are decided programmatically.
             * @return {boolean} True if the workspace is movable, false otherwise.
             */
            isMovable(): boolean;
    
            /**
             * Calculate the bounding box for the blocks on the workspace.
             * Coordinate system: workspace coordinates.
             *
             * @return {!Blockly.utils.Rect} Contains the position and size of the
             *   bounding box containing the blocks on the workspace.
             */
            getBlocksBoundingBox(): Blockly.utils.Rect;
    
            /**
             * Clean up the workspace by ordering all the blocks in a column.
             */
            cleanUp(): void;
    
            /**
             * Show the context menu for the workspace.
             * @param {!Event} e Mouse event.
             * @package
             */
            showContextMenu(e: Event): void;
    
            /**
             * Modify the block tree on the existing toolbox.
             * @param {Blockly.utils.toolbox.ToolboxDefinition|string} toolboxDef
             *    DOM tree of toolbox contents, string of toolbox contents, or array of JSON
             *    representing toolbox contents.
             */
            updateToolbox(toolboxDef: Blockly.utils.toolbox.ToolboxDefinition|string): void;
    
            /**
             * Mark this workspace as the currently focused main workspace.
             */
            markFocused(): void;
    
            /**
             * Zooms the workspace in or out relative to/centered on the given (x, y)
             * coordinate.
             * @param {number} x X coordinate of center, in pixel units relative to the
             *     top-left corner of the parentSVG.
             * @param {number} y Y coordinate of center, in pixel units relative to the
             *     top-left corner of the parentSVG.
             * @param {number} amount Amount of zooming. The formula for the new scale
             *     is newScale = currentScale * (scaleSpeed^amount). scaleSpeed is set in
             *     the workspace options. Negative amount values zoom out, and positive
             *     amount values zoom in.
             */
            zoom(x: number, y: number, amount: number): void;
    
            /**
             * Zooming the blocks centered in the center of view with zooming in or out.
             * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
             */
            zoomCenter(type: number): void;
    
            /**
             * Zoom the blocks to fit in the workspace if possible.
             */
            zoomToFit(): void;
    
            /**
             * Add a transition class to the block and bubble canvas, to animate any
             * transform changes.
             * @package
             */
            beginCanvasTransition(): void;
    
            /**
             * Remove transition class from the block and bubble canvas.
             * @package
             */
            endCanvasTransition(): void;
    
            /**
             * Center the workspace.
             */
            scrollCenter(): void;
    
            /**
             * Scroll the workspace to center on the given block.
             * @param {?string} id ID of block center on.
             * @public
             */
            centerOnBlock(id: string): void;
    
            /**
             * Set the workspace's zoom factor.
             * @param {number} newScale Zoom factor. Units: (pixels / workspaceUnit).
             */
            setScale(newScale: number): void;
    
            /**
             * Get the workspace's zoom factor.  If the workspace has a parent, we call into
             * the parent to get the workspace scale.
             * @return {number} The workspace zoom factor. Units: (pixels / workspaceUnit).
             */
            getScale(): number;
    
            /**
             * Scroll the workspace to a specified offset (in pixels), keeping in the
             * workspace bounds. See comment on workspaceSvg.scrollX for more detail on
             * the meaning of these values.
             * @param {number} x Target X to scroll to.
             * @param {number} y Target Y to scroll to.
             * @package
             */
            scroll(x: number, y: number): void;
    
            /**
             * Adds a block to the list of top blocks.
             * @param {!Blockly.Block} block Block to add.
             */
            addTopBlock(block: Blockly.Block): void;
    
            /**
             * Removes a block from the list of top blocks.
             * @param {!Blockly.Block} block Block to remove.
             */
            removeTopBlock(block: Blockly.Block): void;
    
            /**
             * Adds a comment to the list of top comments.
             * @param {!Blockly.WorkspaceComment} comment comment to add.
             */
            addTopComment(comment: Blockly.WorkspaceComment): void;
    
            /**
             * Removes a comment from the list of top comments.
             * @param {!Blockly.WorkspaceComment} comment comment to remove.
             */
            removeTopComment(comment: Blockly.WorkspaceComment): void;
    
            /**
             * Adds a bounded element to the list of top bounded elements.
             * @param {!Blockly.IBoundedElement} element Bounded element to add.
             */
            addTopBoundedElement(element: Blockly.IBoundedElement): void;
    
            /**
             * Removes a bounded element from the list of top bounded elements.
             * @param {!Blockly.IBoundedElement} element Bounded element to remove.
             */
            removeTopBoundedElement(element: Blockly.IBoundedElement): void;
    
            /**
             * Finds the top-level bounded elements and returns them.
             * @return {!Array.<!Blockly.IBoundedElement>} The top-level bounded elements.
             */
            getTopBoundedElements(): Blockly.IBoundedElement[];
    
            /**
             * Update whether this workspace has resizes enabled.
             * If enabled, workspace will resize when appropriate.
             * If disabled, workspace will not resize until re-enabled.
             * Use to avoid resizing during a batch operation, for performance.
             * @param {boolean} enabled Whether resizes should be enabled.
             */
            setResizesEnabled(enabled: boolean): void;
    
            /**
             * Dispose of all blocks in workspace, with an optimization to prevent resizes.
             */
            clear(): void;
    
            /**
             * Register a callback function associated with a given key, for clicks on
             * buttons and labels in the flyout.
             * For instance, a button specified by the XML
             * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
             * should be matched by a call to
             * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
             * @param {string} key The name to use to look up this function.
             * @param {function(!Blockly.FlyoutButton)} func The function to call when the
             *     given button is clicked.
             */
            registerButtonCallback(key: string, func: { (_0: Blockly.FlyoutButton): any /*missing*/ }): void;
    
            /**
             * Get the callback function associated with a given key, for clicks on buttons
             * and labels in the flyout.
             * @param {string} key The name to use to look up the function.
             * @return {?function(!Blockly.FlyoutButton)} The function corresponding to the
             *     given key for this workspace; null if no callback is registered.
             */
            getButtonCallback(key: string): { (_0: Blockly.FlyoutButton): any /*missing*/ };
    
            /**
             * Remove a callback for a click on a button in the flyout.
             * @param {string} key The name associated with the callback function.
             */
            removeButtonCallback(key: string): void;
    
            /**
             * Register a callback function associated with a given key, for populating
             * custom toolbox categories in this workspace.  See the variable and procedure
             * categories as an example.
             * @param {string} key The name to use to look up this function.
             * @param {function(!Blockly.Workspace):!Array.<!Element>} func The function to
             *     call when the given toolbox category is opened.
             */
            registerToolboxCategoryCallback(key: string, func: { (_0: Blockly.Workspace): Element[] }): void;
    
            /**
             * Get the callback function associated with a given key, for populating
             * custom toolbox categories in this workspace.
             * @param {string} key The name to use to look up the function.
             * @return {?function(!Blockly.Workspace):!Array.<!Element>} The function
             *     corresponding to the given key for this workspace, or null if no function
             *     is registered.
             */
            getToolboxCategoryCallback(key: string): { (_0: Blockly.Workspace): Element[] };
    
            /**
             * Remove a callback for a click on a custom category's name in the toolbox.
             * @param {string} key The name associated with the callback function.
             */
            removeToolboxCategoryCallback(key: string): void;
    
            /**
             * Look up the gesture that is tracking this touch stream on this workspace.
             * May create a new gesture.
             * @param {!Event} e Mouse event or touch event.
             * @return {Blockly.TouchGesture} The gesture that is tracking this touch
             *     stream, or null if no valid gesture exists.
             * @package
             */
            getGesture(e: Event): Blockly.TouchGesture;
    
            /**
             * Clear the reference to the current gesture.
             * @package
             */
            clearGesture(): void;
    
            /**
             * Cancel the current gesture, if one exists.
             * @package
             */
            cancelCurrentGesture(): void;
    
            /**
             * Get the audio manager for this workspace.
             * @return {!Blockly.WorkspaceAudio} The audio manager for this workspace.
             */
            getAudioManager(): Blockly.WorkspaceAudio;
    
            /**
             * Get the grid object for this workspace, or null if there is none.
             * @return {Blockly.Grid} The grid object for this workspace.
             * @package
             */
            getGrid(): Blockly.Grid;
    } 
    
}


declare module Blockly.Events {

    class CommentBase extends CommentBase__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class CommentBase__Class extends Blockly.Events.Abstract__Class  { 
    
            /**
             * Abstract class for a comment event.
             * @param {Blockly.WorkspaceComment} comment The comment this event corresponds
             *     to.
             * @extends {Blockly.Events.Abstract}
             * @constructor
             */
            constructor(comment: Blockly.WorkspaceComment);
    
            /**
             * The ID of the comment this event pertains to.
             * @type {string}
             */
            commentId: string;
    
            /**
             * The workspace identifier for this event.
             * @type {string}
             */
            workspaceId: string;
    
            /**
             * The event group id for the group this event belongs to. Groups define
             * events that should be treated as an single action from the user's
             * perspective, and should be undone together.
             * @type {string}
             */
            group: string;
    
            /**
             * Sets whether the event should be added to the undo stack.
             * @type {boolean}
             */
            recordUndo: boolean;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    } 
    

    class CommentChange extends CommentChange__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class CommentChange__Class extends Blockly.Events.CommentBase__Class  { 
    
            /**
             * Class for a comment change event.
             * @param {Blockly.WorkspaceComment} comment The comment that is being changed.
             *     Null for a blank event.
             * @param {string} oldContents Previous contents of the comment.
             * @param {string} newContents New contents of the comment.
             * @extends {Blockly.Events.CommentBase}
             * @constructor
             */
            constructor(comment: Blockly.WorkspaceComment, oldContents: string, newContents: string);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Does this event record any change of state?
             * @return {boolean} False if something changed.
             */
            isNull(): boolean;
    
            /**
             * Run a change event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class CommentCreate extends CommentCreate__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class CommentCreate__Class extends Blockly.Events.CommentBase__Class  { 
    
            /**
             * Class for a comment creation event.
             * @param {Blockly.WorkspaceComment} comment The created comment.
             *     Null for a blank event.
             * @extends {Blockly.Events.CommentBase}
             * @constructor
             */
            constructor(comment: Blockly.WorkspaceComment);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a creation event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class CommentDelete extends CommentDelete__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class CommentDelete__Class extends Blockly.Events.CommentBase__Class  { 
    
            /**
             * Class for a comment deletion event.
             * @param {Blockly.WorkspaceComment} comment The deleted comment.
             *     Null for a blank event.
             * @extends {Blockly.Events.CommentBase}
             * @constructor
             */
            constructor(comment: Blockly.WorkspaceComment);
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Run a creation event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    class CommentMove extends CommentMove__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class CommentMove__Class extends Blockly.Events.CommentBase__Class  { 
    
            /**
             * Class for a comment move event.  Created before the move.
             * @param {Blockly.WorkspaceComment} comment The comment that is being moved.
             *     Null for a blank event.
             * @extends {Blockly.Events.CommentBase}
             * @constructor
             */
            constructor(comment: Blockly.WorkspaceComment);
    
            /**
             * The comment that is being moved.  Will be cleared after recording the new
             * location.
             * @type {Blockly.WorkspaceComment}
             */
            comment_: Blockly.WorkspaceComment;
    
            /**
             * The location before the move, in workspace coordinates.
             * @type {!Blockly.utils.Coordinate}
             */
            oldCoordinate_: Blockly.utils.Coordinate;
    
            /**
             * The location after the move, in workspace coordinates.
             * @type {Blockly.utils.Coordinate}
             */
            newCoordinate_: Blockly.utils.Coordinate;
    
            /**
             * Record the comment's new location.  Called after the move.  Can only be
             * called once.
             */
            recordNew(): void;
    
            /**
             * Type of this event.
             * @type {string}
             */
            type: string;
    
            /**
             * Override the location before the move.  Use this if you don't create the
             * event until the end of the move, but you know the original location.
             * @param {!Blockly.utils.Coordinate} xy The location before the move,
             *     in workspace coordinates.
             */
            setOldCoordinate(xy: Blockly.utils.Coordinate): void;
    
            /**
             * Encode the event as JSON.
             * @return {!Object} JSON representation.
             */
            toJson(): Object;
    
            /**
             * Decode the JSON event.
             * @param {!Object} json JSON representation.
             */
            fromJson(json: Object): void;
    
            /**
             * Does this event record any change of state?
             * @return {boolean} False if something changed.
             */
            isNull(): boolean;
    
            /**
             * Run a move event.
             * @param {boolean} forward True if run forward, false if run backward (undo).
             */
            run(forward: boolean): void;
    } 
    

    /**
     * Helper function for Comment[Create|Delete]
     * @param {!Blockly.Events.CommentCreate|!Blockly.Events.CommentDelete} event
     *     The event to run.
     * @param {boolean} create if True then Create, if False then Delete
     */
    function CommentCreateDeleteHelper(event: Blockly.Events.CommentCreate|Blockly.Events.CommentDelete, create: boolean): void;
}


declare module Blockly.Xml {

    /**
     * Encode a block tree as XML.
     * @param {!Blockly.Workspace} workspace The workspace containing blocks.
     * @param {boolean=} opt_noId True if the encoder should skip the block IDs.
     * @return {!Element} XML DOM element.
     */
    function workspaceToDom(workspace: Blockly.Workspace, opt_noId?: boolean): Element;

    /**
     * Encode a list of variables as XML.
     * @param {!Array.<!Blockly.VariableModel>} variableList List of all variable
     *     models.
     * @return {!Element} Tree of XML elements.
     */
    function variablesToDom(variableList: Blockly.VariableModel[]): Element;

    /**
     * Encode a block subtree as XML with XY coordinates.
     * @param {!Blockly.Block} block The root block to encode.
     * @param {boolean=} opt_noId True if the encoder should skip the block ID.
     * @return {!Element} Tree of XML elements.
     */
    function blockToDomWithXY(block: Blockly.Block, opt_noId?: boolean): Element;

    /**
     * Encode a block subtree as XML.
     * @param {!Blockly.Block} block The root block to encode.
     * @param {boolean=} opt_noId True if the encoder should skip the block ID.
     * @return {!Element} Tree of XML elements.
     */
    function blockToDom(block: Blockly.Block, opt_noId?: boolean): Element;

    /**
     * Converts a DOM structure into plain text.
     * Currently the text format is fairly ugly: all one line with no whitespace,
     * unless the DOM itself has whitespace built-in.
     * @param {!Node} dom A tree of XML nodes.
     * @return {string} Text representation.
     */
    function domToText(dom: Node): string;

    /**
     * Converts a DOM structure into properly indented text.
     * @param {!Node} dom A tree of XML elements.
     * @return {string} Text representation.
     */
    function domToPrettyText(dom: Node): string;

    /**
     * Converts an XML string into a DOM structure.
     * @param {string} text An XML string.
     * @return {!Element} A DOM object representing the singular child of the
     *     document element.
     * @throws if the text doesn't parse.
     */
    function textToDom(text: string): Element;

    /**
     * Clear the given workspace then decode an XML DOM and
     * create blocks on the workspace.
     * @param {!Element} xml XML DOM.
     * @param {!Blockly.Workspace} workspace The workspace.
     * @return {Array.<string>} An array containing new block ids.
     */
    function clearWorkspaceAndLoadFromXml(xml: Element, workspace: Blockly.Workspace): string[];

    /**
     * Decode an XML DOM and create blocks on the workspace.
     * @param {!Element} xml XML DOM.
     * @param {!Blockly.Workspace} workspace The workspace.
     * @return {!Array.<string>} An array containing new block IDs.
     * @suppress {strictModuleDepCheck} Suppress module check while workspace
     *     comments are not bundled in.
     */
    function domToWorkspace(xml: Element, workspace: Blockly.Workspace): string[];

    /**
     * Decode an XML DOM and create blocks on the workspace. Position the new
     * blocks immediately below prior blocks, aligned by their starting edge.
     * @param {!Element} xml The XML DOM.
     * @param {!Blockly.Workspace} workspace The workspace to add to.
     * @return {Array.<string>} An array containing new block IDs.
     */
    function appendDomToWorkspace(xml: Element, workspace: Blockly.Workspace): string[];

    /**
     * Decode an XML block tag and create a block (and possibly sub blocks) on the
     * workspace.
     * @param {!Element} xmlBlock XML block element.
     * @param {!Blockly.Workspace} workspace The workspace.
     * @return {!Blockly.Block} The root block created.
     */
    function domToBlock(xmlBlock: Element, workspace: Blockly.Workspace): Blockly.Block;

    /**
     * Decode an XML list of variables and add the variables to the workspace.
     * @param {!Element} xmlVariables List of XML variable elements.
     * @param {!Blockly.Workspace} workspace The workspace to which the variable
     *     should be added.
     */
    function domToVariables(xmlVariables: Element, workspace: Blockly.Workspace): void;

    /**
     * Remove any 'next' block (statements in a stack).
     * @param {!Element} xmlBlock XML block element.
     */
    function deleteNext(xmlBlock: Element): void;
}


declare module Blockly {

    class ZoomControls extends ZoomControls__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ZoomControls__Class  { 
    
            /**
             * Class for a zoom controls.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * Create the zoom controls.
             * @return {!SVGElement} The zoom controls SVG group.
             */
            createDom(): SVGElement;
    
            /**
             * Initialize the zoom controls.
             * @param {number} verticalSpacing Vertical distances from workspace edge to the
             *    same edge of the controls.
             * @return {number} Vertical distance from workspace edge to the opposite
             *    edge of the controls.
             */
            init(verticalSpacing: number): number;
    
            /**
             * Dispose of this zoom controls.
             * Unlink from all DOM elements to prevent memory leaks.
             */
            dispose(): void;
    
            /**
             * Position the zoom controls.
             * It is positioned in the opposite corner to the corner the
             * categories/toolbox starts at.
             */
            position(): void;
    } 
    
}


declare module Blockly {

    class Component extends Component__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Component__Class  { 
    
            /**
             * Default implementation of a UI component.
             * Similar to Closure's goog.ui.Component.
             *
             * @constructor
             */
            constructor();
    
            /**
             * Whether the component is rendered right-to-left.
             * @type {boolean}
             * @protected
             */
            rightToLeft_: boolean;
    
            /**
             * Gets the unique ID for the instance of this component.  If the instance
             * doesn't already have an ID, generates one on the fly.
             * @return {string} Unique component ID.
             * @package
             */
            getId(): string;
    
            /**
             * Gets the component's element.
             * @return {Element} The element for the component.
             * @package
             */
            getElement(): Element;
    
            /**
             * Sets the component's root element to the given element.  Considered
             * protected and final.
             *
             * This should generally only be called during createDom. Setting the element
             * does not actually change which element is rendered, only the element that is
             * associated with this UI component.
             *
             * This should only be used by subclasses and its associated renderers.
             *
             * @param {Element} element Root element for the component.
             * @protected
             */
            setElementInternal(element: Element): void;
    
            /**
             * Sets the parent of this component to use for event bubbling.  Throws an error
             * if the component already has a parent or if an attempt is made to add a
             * component to itself as a child.
             * @param {Blockly.Component} parent The parent component.
             * @protected
             */
            setParent(parent: Blockly.Component): void;
    
            /**
             * Returns the component's parent, if any.
             * @return {?Blockly.Component} The parent component.
             * @protected
             */
            getParent(): Blockly.Component;
    
            /**
             * Determines whether the component has been added to the document.
             * @return {boolean} TRUE if rendered. Otherwise, FALSE.
             * @protected
             */
            isInDocument(): boolean;
    
            /**
             * Creates the initial DOM representation for the component.
             * @protected
             */
            createDom(): void;
    
            /**
             * Renders the component.  If a parent element is supplied, the component's
             * element will be appended to it.  If there is no optional parent element and
             * the element doesn't have a parentNode then it will be appended to the
             * document body.
             *
             * If this component has a parent component, and the parent component is
             * not in the document already, then this will not call `enterDocument`
             * on this component.
             *
             * Throws an Error if the component is already rendered.
             *
             * @param {Element=} opt_parentElement Optional parent element to render the
             *    component into.
             * @package
             */
            render(opt_parentElement?: Element): void;
    
            /**
             * Called when the component's element is known to be in the document. Anything
             * using document.getElementById etc. should be done at this stage.
             *
             * If the component contains child components, this call is propagated to its
             * children.
             * @protected
             */
            enterDocument(): void;
    
            /**
             * Called by dispose to clean up the elements and listeners created by a
             * component, or by a parent component/application who has removed the
             * component from the document but wants to reuse it later.
             *
             * If the component contains child components, this call is propagated to its
             * children.
             *
             * It should be possible for the component to be rendered again once this method
             * has been called.
             * @protected
             */
            exitDocument(): void;
    
            /**
             * Disposes of the object. If the object hasn't already been disposed of, calls
             * {@link #disposeInternal}.
             * @package
             */
            dispose(): void;
    
            /**
             * Disposes of the component.  Calls `exitDocument`, which is expected to
             * remove event handlers and clean up the component.  Propagates the call to
             * the component's children, if any. Removes the component's DOM from the
             * document.
             * @protected
             */
            disposeInternal(): void;
    
            /**
             * Adds the specified component as the last child of this component.  See
             * {@link Blockly.Component#addChildAt} for detailed semantics.
             *
             * @see Blockly.Component#addChildAt
             * @param {Blockly.Component} child The new child component.
             * @param {boolean=} opt_render If true, the child component will be rendered
             *    into the parent.
             * @package
             */
            addChild(child: Blockly.Component, opt_render?: boolean): void;
    
            /**
             * Adds the specified component as a child of this component at the given
             * 0-based index.
             *
             * Both `addChild` and `addChildAt` assume the following contract
             * between parent and child components:
             *  <ul>
             *    <li>the child component's element must be a descendant of the parent
             *        component's element, and
             *    <li>the DOM state of the child component must be consistent with the DOM
             *        state of the parent component (see `isInDocument`) in the
             *        steady state -- the exception is to addChildAt(child, i, false) and
             *        then immediately decorate/render the child.
             *  </ul>
             *
             * In particular, `parent.addChild(child)` will throw an error if the
             * child component is already in the document, but the parent isn't.
             *
             * Clients of this API may call `addChild` and `addChildAt` with
             * `opt_render` set to true.  If `opt_render` is true, calling these
             * methods will automatically render the child component's element into the
             * parent component's element. If the parent does not yet have an element, then
             * `createDom` will automatically be invoked on the parent before
             * rendering the child.
             *
             * Invoking {@code parent.addChild(child, true)} will throw an error if the
             * child component is already in the document, regardless of the parent's DOM
             * state.
             *
             * If `opt_render` is true and the parent component is not already
             * in the document, `enterDocument` will not be called on this component
             * at this point.
             *
             * Finally, this method also throws an error if the new child already has a
             * different parent, or the given index is out of bounds.
             *
             * @see Blockly.Component#addChild
             * @param {Blockly.Component} child The new child component.
             * @param {number} index 0-based index at which the new child component is to be
             *    added; must be between 0 and the current child count (inclusive).
             * @param {boolean=} opt_render If true, the child component will be rendered
             *    into the parent.
             * @protected
             */
            addChildAt(child: Blockly.Component, index: number, opt_render?: boolean): void;
    
            /**
             * Returns the DOM element into which child components are to be rendered,
             * or null if the component itself hasn't been rendered yet.  This default
             * implementation returns the component's root element.  Subclasses with
             * complex DOM structures must override this method.
             * @return {Element} Element to contain child elements (null if none).
             * @protected
             */
            getContentElement(): Element;
    
            /**
             * Returns true if the component has children.
             * @return {boolean} True if the component has children.
             * @protected
             */
            hasChildren(): boolean;
    
            /**
             * Returns the number of children of this component.
             * @return {number} The number of children.
             * @protected
             */
            getChildCount(): number;
    
            /**
             * Returns the child with the given ID, or null if no such child exists.
             * @param {string} id Child component ID.
             * @return {?Blockly.Component} The child with the given ID; null if none.
             * @protected
             */
            getChild(id: string): Blockly.Component;
    
            /**
             * Returns the child at the given index, or null if the index is out of bounds.
             * @param {number} index 0-based index.
             * @return {?Blockly.Component} The child at the given index; null if none.
             * @protected
             */
            getChildAt(index: number): Blockly.Component;
    
            /**
             * Calls the given function on each of this component's children in order.  If
             * `opt_obj` is provided, it will be used as the 'this' object in the
             * function when called.  The function should take two arguments:  the child
             * component and its 0-based index.  The return value is ignored.
             * @param {function(this:T,?,number):?} f The function to call for every
             * child component; should take 2 arguments (the child and its index).
             * @param {T=} opt_obj Used as the 'this' object in f when called.
             * @template T
             * @protected
             */
            forEachChild<T>(f: { (_0: any, _1: number): any }, opt_obj?: T): void;
    } 
    
}

declare module Blockly.Component {

    /**
     * The default right to left value.
     * @type {boolean}
     * @package
     */
    var defaultRightToLeft: boolean;

    /**
     * Errors thrown by the component.
     * @enum {string}
     */
    enum Error { ALREADY_RENDERED, PARENT_UNABLE_TO_BE_SET, CHILD_INDEX_OUT_OF_BOUNDS, ABSTRACT_METHOD } 
}


declare module Blockly {

    interface IASTNodeLocation {
    }

    interface IASTNodeLocationSvg extends Blockly.IASTNodeLocation {
    
        /**
          * Add the marker svg to this node's svg group.
          * @param {SVGElement} markerSvg The svg root of the marker to be added to the
          *     svg group.
          */
        setMarkerSvg(markerSvg: SVGElement): void;
    
        /**
          * Add the cursor svg to this node's svg group.
          * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
          *     svg group.
          */
        setCursorSvg(cursorSvg: SVGElement): void;
    }

    interface IASTNodeLocationWithBlock extends Blockly.IASTNodeLocation {
    
        /**
          * Get the source block associated with this node.
          * @return {Blockly.Block} The source block.
          */
        getSourceBlock(): Blockly.Block;
    }

    interface IBlocklyActionable {
    
        /**
          * Handles the given action.
          * @param {!Blockly.Action} action The action to be handled.
          * @return {boolean} True if the action has been handled, false otherwise.
          */
        onBlocklyAction(action: Blockly.Action): boolean;
    }
}


declare module Blockly {

    interface IBoundedElement {
    
        /**
          * Returns the coordinates of a bounded element describing the dimensions of the
          * element.
          * Coordinate system: workspace coordinates.
          * @return {!Blockly.utils.Rect} Object with coordinates of the bounded element.
          */
        getBoundingRectangle(): Blockly.utils.Rect;
    }
}


declare module Blockly {

    interface ICopyable extends Blockly.ISelectable {
    
        /**
          * Encode for copying.
          * @return {!Blockly.ICopyable.CopyData} Copy metadata.
          */
        toCopyData(): Blockly.ICopyable.CopyData;
    }
}

declare module Blockly.ICopyable {

    /**
     * Copy Metadata.
     * @typedef {{
     *            xml:!Element,
     *            source:Blockly.WorkspaceSvg,
     *            typeCounts:?Object
     *          }}
     */
    interface CopyData {
        xml: Element;
        source: Blockly.WorkspaceSvg;
        typeCounts: Object
    }
}


declare module Blockly {

    interface IDeletable {
    
        /**
          * Get whether this object is deletable or not.
          * @return {boolean} True if deletable.
          */
        isDeletable(): boolean;
    }
}


declare module Blockly {

    interface IDeleteArea {
    
        /**
          * Return the deletion rectangle.
          * @return {Blockly.utils.Rect} Rectangle in which to delete.
          */
        getClientRect(): Blockly.utils.Rect;
    }
}


declare module Blockly {

    interface IMovable {
    
        /**
          * Get whether this is movable or not.
          * @return {boolean} True if movable.
          */
        isMovable(): boolean;
    }
}


declare module Blockly {

    interface IRegistrable {
    }
}


declare module Blockly {

    interface ISelectable extends Blockly.IDeletable, Blockly.IMovable {
    
        /**
          * @type {string}
          */
        id: string;
    
        /**
          * Select this.  Highlight it visually.
          * @return {void}
          */
        select(): void;
    
        /**
          * Unselect this.  Unhighlight it visually.
          * @return {void}
          */
        unselect(): void;
    }
}


declare module Blockly {

    interface IStyleable {
    
        /**
          * Adds a style on the toolbox. Usually used to change the cursor.
          * @param {string} style The name of the class to add.
          */
        addStyle(style: string): void;
    
        /**
          * Removes a style from the toolbox. Usually used to change the cursor.
          * @param {string} style The name of the class to remove.
          */
        removeStyle(style: string): void;
    }
}


declare module Blockly {

    interface IToolbox extends Blockly.IRegistrable {
    
        /**
          * Initializes the toolbox.
          * @return {void}
          */
        init(): void;
    
        /**
          * Fill the toolbox with categories and blocks.
          * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
          *    containing information on the contents of the toolbox.
          */
        render(toolboxDef: Blockly.utils.toolbox.Toolbox[]): void;
    
        /**
          * Dispose of this toolbox.
          * @return {void}
          */
        dispose(): void;
    
        /**
          * Get the width of the toolbox.
          * @return {number} The width of the toolbox.
          */
        getWidth(): number;
    
        /**
          * Get the height of the toolbox.
          * @return {number} The width of the toolbox.
          */
        getHeight(): number;
    
        /**
          * Get the toolbox flyout.
          * @return {Blockly.Flyout} The toolbox flyout.
          */
        getFlyout(): Blockly.Flyout;
    
        /**
          * Move the toolbox to the edge.
          * @return {void}
          */
        position(): void;
    
        /**
          * Unhighlight any previously specified option.
          * @return {void}
          */
        clearSelection(): void;
    
        /**
          * Updates the category colours and background colour of selected categories.
          * @return {void}
          */
        refreshTheme(): void;
    
        /**
          * Update the flyout's contents without closing it.  Should be used in response
          * to a change in one of the dynamic categories, such as variables or
          * procedures.
          * @return {void}
          */
        refreshSelection(): void;
    
        /**
          * Toggles the visibility of the toolbox.
          * @param {boolean} isVisible True if the toolbox should be visible.
          */
        setVisible(isVisible: boolean): void;
    
        /**
          * Select the first toolbox category if no category is selected.
          * @return {void}
          */
        selectFirstCategory(): void;
    }
}


declare module Blockly {

    class Action extends Action__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Action__Class  { 
    
            /**
             * Class for a single action.
             * An action describes user intent. (ex go to next or go to previous)
             * @param {string} name The name of the action.
             * @param {string} desc The description of the action.
             * @constructor
             */
            constructor(name: string, desc: string);
    } 
    
}


declare module Blockly {

    class ASTNode extends ASTNode__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ASTNode__Class  { 
    
            /**
             * Class for an AST node.
             * It is recommended that you use one of the createNode methods instead of
             * creating a node directly.
             * @param {string} type The type of the location.
             *     Must be in Blockly.ASTNode.types.
             * @param {!Blockly.IASTNodeLocation} location The position in the AST.
             * @param {!Blockly.ASTNode.Params=} opt_params Optional dictionary of options.
             * @constructor
             */
            constructor(type: string, location: Blockly.IASTNodeLocation, opt_params?: Blockly.ASTNode.Params);
    
            /**
             * Gets the value pointed to by this node.
             * It is the callers responsibility to check the node type to figure out what
             * type of object they get back from this.
             * @return {!Blockly.IASTNodeLocation} The current field, connection, workspace, or
             *     block the cursor is on.
             */
            getLocation(): Blockly.IASTNodeLocation;
    
            /**
             * The type of the current location.
             * One of Blockly.ASTNode.types
             * @return {string} The type of the location.
             */
            getType(): string;
    
            /**
             * The coordinate on the workspace.
             * @return {Blockly.utils.Coordinate} The workspace coordinate or null if the
             *     location is not a workspace.
             */
            getWsCoordinate(): Blockly.utils.Coordinate;
    
            /**
             * Whether the node points to a connection.
             * @return {boolean} [description]
             * @package
             */
            isConnection(): boolean;
    
            /**
             * Finds the source block of the location of this node.
             * @return {Blockly.Block} The source block of the location, or null if the node
             * is of type workspace.
             */
            getSourceBlock(): Blockly.Block;
    
            /**
             * Find the element to the right of the current element in the AST.
             * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
             *     block, or workspace. Or null if there is no node to the right.
             */
            next(): Blockly.ASTNode;
    
            /**
             * Find the element one level below and all the way to the left of the current
             * location.
             * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
             * workspace, or block. Or null if there is nothing below this node.
             */
            in(): Blockly.ASTNode;
    
            /**
             * Find the element to the left of the current element in the AST.
             * @return {Blockly.ASTNode} An AST node that wraps the previous field,
             * connection, workspace or block. Or null if no node exists to the left.
             * null.
             */
            prev(): Blockly.ASTNode;
    
            /**
             * Find the next element that is one position above and all the way to the left
             * of the current location.
             * @return {Blockly.ASTNode} An AST node that wraps the next field, connection,
             *     workspace or block. Or null if we are at the workspace level.
             */
            out(): Blockly.ASTNode;
    } 
    
}

declare module Blockly.ASTNode {

    /**
     * @typedef {{
     *     wsCoordinate: Blockly.utils.Coordinate
     * }}
     */
    interface Params {
        wsCoordinate: Blockly.utils.Coordinate
    }

    /**
     * Object holding different types for an AST node.
     * @enum {string}
     */
    enum types { FIELD, BLOCK, INPUT, OUTPUT, NEXT, PREVIOUS, STACK, WORKSPACE } 

    /**
     * True to navigate to all fields. False to only navigate to clickable fields.
     * @type {boolean}
     */
    var NAVIGATE_ALL_FIELDS: boolean;

    /**
     * Create an AST node pointing to a field.
     * @param {Blockly.Field} field The location of the AST node.
     * @return {Blockly.ASTNode} An AST node pointing to a field.
     */
    function createFieldNode(field: Blockly.Field): Blockly.ASTNode;

    /**
     * Creates an AST node pointing to a connection. If the connection has a parent
     * input then create an AST node of type input that will hold the connection.
     * @param {Blockly.Connection} connection This is the connection the node will
     *     point to.
     * @return {Blockly.ASTNode} An AST node pointing to a connection.
     */
    function createConnectionNode(connection: Blockly.Connection): Blockly.ASTNode;

    /**
     * Creates an AST node pointing to an input. Stores the input connection as the
     *     location.
     * @param {Blockly.Input} input The input used to create an AST node.
     * @return {Blockly.ASTNode} An AST node pointing to a input.
     */
    function createInputNode(input: Blockly.Input): Blockly.ASTNode;

    /**
     * Creates an AST node pointing to a block.
     * @param {Blockly.Block} block The block used to create an AST node.
     * @return {Blockly.ASTNode} An AST node pointing to a block.
     */
    function createBlockNode(block: Blockly.Block): Blockly.ASTNode;

    /**
     * Create an AST node of type stack. A stack, represented by its top block, is
     *     the set of all blocks connected to a top block, including the top block.
     * @param {Blockly.Block} topBlock A top block has no parent and can be found
     *     in the list returned by workspace.getTopBlocks().
     * @return {Blockly.ASTNode} An AST node of type stack that points to the top
     *     block on the stack.
     */
    function createStackNode(topBlock: Blockly.Block): Blockly.ASTNode;

    /**
     * Creates an AST node pointing to a workspace.
     * @param {!Blockly.Workspace} workspace The workspace that we are on.
     * @param {Blockly.utils.Coordinate} wsCoordinate The position on the workspace
     *     for this node.
     * @return {Blockly.ASTNode} An AST node pointing to a workspace and a position
     *     on the workspace.
     */
    function createWorkspaceNode(workspace: Blockly.Workspace, wsCoordinate: Blockly.utils.Coordinate): Blockly.ASTNode;

    /**
     * Creates an AST node for the top position on a block.
     * This is either an output connection, previous connection, or block.
     * @param {!Blockly.Block} block The block to find the top most AST node on.
     * @return {Blockly.ASTNode} The AST node holding the top most position on the
     *     block.
     */
    function createTopNode(block: Blockly.Block): Blockly.ASTNode;
}


declare module Blockly {

    class BasicCursor extends BasicCursor__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BasicCursor__Class extends Blockly.Cursor__Class  { 
    
            /**
             * Class for a basic cursor.
             * This will allow the user to get to all nodes in the AST by hitting next or
             * previous.
             * @constructor
             * @extends {Blockly.Cursor}
             */
            constructor();
    
            /**
             * Uses pre order traversal to navigate the Blockly AST. This will allow
             * a user to easily navigate the entire Blockly AST without having to go in
             * and out levels on the tree.
             * @param {Blockly.ASTNode} node The current position in the AST.
             * @param {!function(Blockly.ASTNode) : boolean} isValid A function true/false
             *     depending on whether the given node should be traversed.
             * @return {Blockly.ASTNode} The next node in the traversal.
             * @protected
             */
            getNextNode_(node: Blockly.ASTNode, isValid: { (_0: Blockly.ASTNode): boolean }): Blockly.ASTNode;
    
            /**
             * Reverses the pre order traversal in order to find the previous node. This will
             * allow a user to easily navigate the entire Blockly AST without having to go in
             * and out levels on the tree.
             * @param {Blockly.ASTNode} node The current position in the AST.
             * @param {!function(Blockly.ASTNode) : boolean} isValid A function true/false
             *     depending on whether the given node should be traversed.
             * @return {Blockly.ASTNode} The previous node in the traversal or null if no
             *     previous node exists.
             * @protected
             */
            getPreviousNode_(node: Blockly.ASTNode, isValid: { (_0: Blockly.ASTNode): boolean }): Blockly.ASTNode;
    
            /**
             * Decides what nodes to traverse and which ones to skip. Currently, it
             * skips output, stack and workspace nodes.
             * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
             * @return {boolean} True if the node should be visited, false otherwise.
             * @protected
             */
            validNode_(node: Blockly.ASTNode): boolean;
    } 
    
}


declare module Blockly {

    class Cursor extends Cursor__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Cursor__Class extends Blockly.Marker__Class implements Blockly.IBlocklyActionable  { 
    
            /**
             * Class for a cursor.
             * A cursor controls how a user navigates the Blockly AST.
             * @constructor
             * @extends {Blockly.Marker}
             * @implements {Blockly.IBlocklyActionable}
             */
            constructor();
    
            /**
             * Find the next connection, field, or block.
             * @return {Blockly.ASTNode} The next element, or null if the current node is
             *     not set or there is no next value.
             * @protected
             */
            next(): Blockly.ASTNode;
    
            /**
             * Find the in connection or field.
             * @return {Blockly.ASTNode} The in element, or null if the current node is
             *     not set or there is no in value.
             * @protected
             */
            in(): Blockly.ASTNode;
    
            /**
             * Find the previous connection, field, or block.
             * @return {Blockly.ASTNode} The previous element, or null if the current node
             *     is not set or there is no previous value.
             * @protected
             */
            prev(): Blockly.ASTNode;
    
            /**
             * Find the out connection, field, or block.
             * @return {Blockly.ASTNode} The out element, or null if the current node is
             *     not set or there is no out value.
             * @protected
             */
            out(): Blockly.ASTNode;
    
            /**
             * Handles the given action.
             * This is only triggered when keyboard navigation is enabled.
             * @param {!Blockly.Action} action The action to be handled.
             * @return {boolean} True if the action has been handled, false otherwise.
             */
            onBlocklyAction(action: Blockly.Action): boolean;
    } 
    
}


declare module Blockly {

    class FlyoutCursor extends FlyoutCursor__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FlyoutCursor__Class extends Blockly.Cursor__Class  { 
    
            /**
             * Class for a flyout cursor.
             * This controls how a user navigates blocks in the flyout.
             * @constructor
             * @extends {Blockly.Cursor}
             */
            constructor();
    } 
    
}


declare module Blockly.user.keyMap {

    /**
     * Object holding valid modifiers.
     * @enum {string}
     */
    enum modifierKeys { SHIFT, CONTROL, ALT, META } 

    /**
     * Update the key map to contain the new action.
     * @param {string} keyCode The key code serialized by the serializeKeyEvent.
     * @param {!Blockly.Action} action The action to be executed when the keys
     *     corresponding to the serialized key code is pressed.
     */
    function setActionForKey(keyCode: string, action: Blockly.Action): void;

    /**
     * Creates a new key map.
     * @param {!Object<string, Blockly.Action>} keyMap The object holding the key
     *     to action mapping.
     */
    function setKeyMap(keyMap: { [key: string]: Blockly.Action }): void;

    /**
     * Gets the current key map.
     * @return {Object<string,Blockly.Action>} The object holding the key to
     *     action mapping.
     */
    function getKeyMap(): { [key: string]: Blockly.Action };

    /**
     * Get the action by the serialized key code.
     * @param {string} keyCode The serialized key code.
     * @return {Blockly.Action|undefined} The action holding the function to
     *     call when the given keyCode is used or undefined if no action exists.
     */
    function getActionByKeyCode(keyCode: string): Blockly.Action|any /*undefined*/;

    /**
     * Get the serialized key that corresponds to the action.
     * @param {!Blockly.Action} action The action for which we want to get
     *     the key.
     * @return {?string} The serialized key or null if the action does not have
     *     a key mapping.
     */
    function getKeyByAction(action: Blockly.Action): string;

    /**
     * Serialize the key event.
     * @param {!KeyboardEvent} e A key up event holding the key code.
     * @return {string} A string containing the serialized key event.
     * @package
     */
    function serializeKeyEvent(e: KeyboardEvent): string;

    /**
     * Create the serialized key code that will be used in the key map.
     * @param {number} keyCode Number code representing the key.
     * @param {!Array.<string>} modifiers List of modifiers to be used with the key.
     *     All valid modifiers can be found in the Blockly.user.keyMap.modifierKeys.
     * @return {string} The serialized key code for the given modifiers and key.
     */
    function createSerializedKey(keyCode: number, modifiers: string[]): string;

    /**
     * Creates the default key map.
     * @return {!Object<string,Blockly.Action>} An object holding the default key
     *     to action mapping.
     */
    function createDefaultKeyMap(): { [key: string]: Blockly.Action };
}


declare module Blockly {

    class Marker extends Marker__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Marker__Class  { 
    
            /**
             * Class for a marker.
             * This is used in keyboard navigation to save a location in the Blockly AST.
             * @constructor
             */
            constructor();
    
            /**
             * The colour of the marker.
             * @type {?string}
             */
            colour: string;
    
            /**
             * The type of the marker.
             * @type {string}
             */
            type: string;
    
            /**
             * Sets the object in charge of drawing the marker.
             * @param {Blockly.blockRendering.MarkerSvg} drawer The object in charge of
             *     drawing the marker.
             */
            setDrawer(drawer: Blockly.blockRendering.MarkerSvg): void;
    
            /**
             * Get the current drawer for the marker.
             * @return {Blockly.blockRendering.MarkerSvg} The object in charge of drawing
             *     the marker.
             */
            getDrawer(): Blockly.blockRendering.MarkerSvg;
    
            /**
             * Gets the current location of the marker.
             * @return {Blockly.ASTNode} The current field, connection, or block the marker
             *     is on.
             */
            getCurNode(): Blockly.ASTNode;
    
            /**
             * Set the location of the marker and call the update method.
             * Setting isStack to true will only work if the newLocation is the top most
             * output or previous connection on a stack.
             * @param {Blockly.ASTNode} newNode The new location of the marker.
             */
            setCurNode(newNode: Blockly.ASTNode): void;
    
            /**
             * Redraw the current marker.
             * @package
             */
            draw(): void;
    
            /**
             * Hide the marker SVG.
             */
            hide(): void;
    
            /**
             * Dispose of this marker.
             */
            dispose(): void;
    } 
    
}


declare module Blockly.navigation {

    /**
     * A function to call to give feedback to the user about logs, warnings, and
     * errors.  You can override this to customize feedback (e.g. warning sounds,
     * reading out the warning text, etc).
     * Null by default.
     * The first argument is one of 'log', 'warn', and 'error'.
     * The second argument is the message.
     * @type {?function(string, string)}
     * @public
     */
    var loggingCallback: { (_0: string, _1: string): any /*missing*/ };

    /**
     * State indicating focus is currently on the flyout.
     * @type {number}
     * @const
     */
    var STATE_FLYOUT: number;

    /**
     * State indicating focus is currently on the workspace.
     * @type {number}
     * @const
     */
    var STATE_WS: number;

    /**
     * State indicating focus is currently on the toolbox.
     * @type {number}
     * @const
     */
    var STATE_TOOLBOX: number;

    /**
     * The distance to move the cursor on the workspace.
     * @type {number}
     * @const
     */
    var WS_MOVE_DISTANCE: number;

    /**
     * Object holding default action names.
     * @enum {string}
     */
    enum actionNames { PREVIOUS, NEXT, IN, OUT, INSERT, MARK, DISCONNECT, TOOLBOX, EXIT, TOGGLE_KEYBOARD_NAV, MOVE_WS_CURSOR_UP, MOVE_WS_CURSOR_DOWN, MOVE_WS_CURSOR_LEFT, MOVE_WS_CURSOR_RIGHT } 

    /**
     * The name of the marker reserved for internal use.
     * @type {string}
     * @const
     */
    var MARKER_NAME: string;

    /**
     * Get the local marker.
     * @return {Blockly.Marker} The local marker for the main workspace.
     */
    function getMarker(): Blockly.Marker;

    /**
     * Get the workspace that is being navigated.
     * @return {!Blockly.WorkspaceSvg} The workspace being navigated.
     */
    function getNavigationWorkspace(): Blockly.WorkspaceSvg;

    /**
     * If there is a marked connection try connecting the block from the flyout to
     * that connection. If no connection has been marked then inserting will place
     * it on the workspace.
     */
    function insertFromFlyout(): void;

    /**
     * Tries to connect the given block to the destination connection, making an
     * intelligent guess about which connection to use to on the moving block.
     * @param {!Blockly.BlockSvg} block The block to move.
     * @param {!Blockly.RenderedConnection} destConnection The connection to connect
     *     to.
     * @return {boolean} Whether the connection was successful.
     */
    function insertBlock(block: Blockly.BlockSvg, destConnection: Blockly.RenderedConnection): boolean;

    /**
     * Set the current navigation state.
     * @param {number} newState The new navigation state.
     * @package
     */
    function setState(newState: number): void;

    /**
     * Before a block is deleted move the cursor to the appropriate position.
     * @param {!Blockly.BlockSvg} deletedBlock The block that is being deleted.
     */
    function moveCursorOnBlockDelete(deletedBlock: Blockly.BlockSvg): void;

    /**
     * When a block that the cursor is on is mutated move the cursor to the block
     * level.
     * @param {!Blockly.BlockSvg} mutatedBlock The block that is being mutated.
     * @package
     */
    function moveCursorOnBlockMutation(mutatedBlock: Blockly.BlockSvg): void;

    /**
     * Enable accessibility mode.
     */
    function enableKeyboardAccessibility(): void;

    /**
     * Disable accessibility mode.
     */
    function disableKeyboardAccessibility(): void;

    /**
     * Handler for all the keyboard navigation events.
     * @param {!KeyboardEvent} e The keyboard event.
     * @return {boolean} True if the key was handled false otherwise.
     */
    function onKeyPress(e: KeyboardEvent): boolean;

    /**
     * Decides which actions to handle depending on keyboard navigation and readonly
     * states.
     * @param {!Blockly.Action} action The current action.
     * @return {boolean} True if the action has been handled, false otherwise.
     */
    function onBlocklyAction(action: Blockly.Action): boolean;

    /**
     * The previous action.
     * @type {!Blockly.Action}
     */
    var ACTION_PREVIOUS: Blockly.Action;

    /**
     * The out action.
     * @type {!Blockly.Action}
     */
    var ACTION_OUT: Blockly.Action;

    /**
     * The next action.
     * @type {!Blockly.Action}
     */
    var ACTION_NEXT: Blockly.Action;

    /**
     * The in action.
     * @type {!Blockly.Action}
     */
    var ACTION_IN: Blockly.Action;

    /**
     * The action to try to insert a block.
     * @type {!Blockly.Action}
     */
    var ACTION_INSERT: Blockly.Action;

    /**
     * The action to mark a certain location.
     * @type {!Blockly.Action}
     */
    var ACTION_MARK: Blockly.Action;

    /**
     * The action to disconnect a block.
     * @type {!Blockly.Action}
     */
    var ACTION_DISCONNECT: Blockly.Action;

    /**
     * The action to open the toolbox.
     * @type {!Blockly.Action}
     */
    var ACTION_TOOLBOX: Blockly.Action;

    /**
     * The action to exit the toolbox or flyout.
     * @type {!Blockly.Action}
     */
    var ACTION_EXIT: Blockly.Action;

    /**
     * The action to toggle keyboard navigation mode on and off.
     * @type {!Blockly.Action}
     */
    var ACTION_TOGGLE_KEYBOARD_NAV: Blockly.Action;

    /**
     * The action to move the cursor to the left on a workspace.
     * @type {!Blockly.Action}
     */
    var ACTION_MOVE_WS_CURSOR_LEFT: Blockly.Action;

    /**
     * The action to move the cursor to the right on a workspace.
     * @type {!Blockly.Action}
     */
    var ACTION_MOVE_WS_CURSOR_RIGHT: Blockly.Action;

    /**
     * The action to move the cursor up on a workspace.
     * @type {!Blockly.Action}
     */
    var ACTION_MOVE_WS_CURSOR_UP: Blockly.Action;

    /**
     * The action to move the cursor down on a workspace.
     * @type {!Blockly.Action}
     */
    var ACTION_MOVE_WS_CURSOR_DOWN: Blockly.Action;

    /**
     * List of actions that can be performed in read only mode.
     * @type {!Array.<!Blockly.Action>}
     */
    var READONLY_ACTION_LIST: Blockly.Action[];
}


declare module Blockly {

    class TabNavigateCursor extends TabNavigateCursor__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TabNavigateCursor__Class extends Blockly.BasicCursor__Class  { 
    
            /**
             * A cursor for navigating between tab navigable fields.
             * @constructor
             * @extends {Blockly.BasicCursor}
             */
            constructor();
    } 
    
}









declare module Blockly.utils.aria {

    /**
     * ARIA role values.
     * Copied from Closure's goog.a11y.aria.Role
     * @enum {string}
     */
    enum Role { GRID, GRIDCELL, GROUP, LISTBOX, MENU, MENUITEM, MENUITEMCHECKBOX, OPTION, PRESENTATION, ROW, TREE, TREEITEM } 

    /**
     * ARIA states and properties.
     * Copied from Closure's goog.a11y.aria.State
     * @enum {string}
     */
    enum State { ACTIVEDESCENDANT, COLCOUNT, DISABLED, EXPANDED, INVALID, LABEL, LABELLEDBY, LEVEL, ORIENTATION, POSINSET, ROWCOUNT, SELECTED, SETSIZE, VALUEMAX, VALUEMIN } 

    /**
     * Sets the role of an element.
     *
     * Similar to Closure's goog.a11y.aria
     *
     * @param {!Element} element DOM node to set role of.
     * @param {!Blockly.utils.aria.Role} roleName Role name.
     */
    function setRole(element: Element, roleName: Blockly.utils.aria.Role): void;

    /**
     * Sets the state or property of an element.
     * Copied from Closure's goog.a11y.aria
     * @param {!Element} element DOM node where we set state.
     * @param {!Blockly.utils.aria.State} stateName State attribute being set.
     *     Automatically adds prefix 'aria-' to the state name if the attribute is
     *     not an extra attribute.
     * @param {string|boolean|number|!Array.<string>} value Value
     * for the state attribute.
     */
    function setState(element: Element, stateName: Blockly.utils.aria.State, value: string|boolean|number|string[]): void;
}


declare module Blockly.utils.colour {

    /**
     * Parses a colour from a string.
     * .parse('red') -> '#ff0000'
     * .parse('#f00') -> '#ff0000'
     * .parse('#ff0000') -> '#ff0000'
     * .parse('0xff0000') -> '#ff0000'
     * .parse('rgb(255, 0, 0)') -> '#ff0000'
     * @param {string|number} str Colour in some CSS format.
     * @return {?string} A string containing a hex representation of the colour,
     *   or null if can't be parsed.
     */
    function parse(str: string|number): string;

    /**
     * Converts a colour from RGB to hex representation.
     * @param {number} r Amount of red, int between 0 and 255.
     * @param {number} g Amount of green, int between 0 and 255.
     * @param {number} b Amount of blue, int between 0 and 255.
     * @return {string} Hex representation of the colour.
     */
    function rgbToHex(r: number, g: number, b: number): string;

    /**
     * Converts a colour to RGB.
     * @param {string} colour String representing colour in any
     *     colour format ('#ff0000', 'red', '0xff000', etc).
     * @return {!Array.<number>} RGB representation of the colour.
     */
    function hexToRgb(colour: string): number[];

    /**
     * Converts an HSV triplet to hex representation.
     * @param {number} h Hue value in [0, 360].
     * @param {number} s Saturation value in [0, 1].
     * @param {number} v Brightness in [0, 255].
     * @return {string} Hex representation of the colour.
     */
    function hsvToHex(h: number, s: number, v: number): string;

    /**
     * Blend two colours together, using the specified factor to indicate the
     * weight given to the first colour.
     * @param {string} colour1 First colour.
     * @param {string} colour2 Second colour.
     * @param {number} factor The weight to be given to colour1 over colour2.
     *     Values should be in the range [0, 1].
     * @return {?string} Combined colour represented in hex.
     */
    function blend(colour1: string, colour2: string, factor: number): string;

    /**
     * A map that contains the 16 basic colour keywords as defined by W3C:
     * https://www.w3.org/TR/2018/REC-css-color-3-20180619/#html4
     * The keys of this map are the lowercase "readable" names of the colours,
     * while the values are the "hex" values.
     *
     * @type {!Object<string, string>}
     */
    var names: { [key: string]: string };
}


declare module Blockly.utils {

    class Coordinate extends Coordinate__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Coordinate__Class  { 
    
            /**
             * Class for representing coordinates and positions.
             * @param {number} x Left.
             * @param {number} y Top.
             * @struct
             * @constructor
             */
            constructor(x: number, y: number);
    
            /**
             * X-value
             * @type {number}
             */
            x: number;
    
            /**
             * Y-value
             * @type {number}
             */
            y: number;
    
            /**
             * Scales this coordinate by the given scale factor.
             * @param {number} s The scale factor to use for both x and y dimensions.
             * @return {!Blockly.utils.Coordinate} This coordinate after scaling.
             */
            scale(s: number): Blockly.utils.Coordinate;
    
            /**
             * Translates this coordinate by the given offsets.
             * respectively.
             * @param {number} tx The value to translate x by.
             * @param {number} ty The value to translate y by.
             * @return {!Blockly.utils.Coordinate} This coordinate after translating.
             */
            translate(tx: number, ty: number): Blockly.utils.Coordinate;
    } 
    
}

declare module Blockly.utils.Coordinate {

    /**
     * Compares coordinates for equality.
     * @param {Blockly.utils.Coordinate} a A Coordinate.
     * @param {Blockly.utils.Coordinate} b A Coordinate.
     * @return {boolean} True iff the coordinates are equal, or if both are null.
     */
    function equals(a: Blockly.utils.Coordinate, b: Blockly.utils.Coordinate): boolean;

    /**
     * Returns the distance between two coordinates.
     * @param {!Blockly.utils.Coordinate} a A Coordinate.
     * @param {!Blockly.utils.Coordinate} b A Coordinate.
     * @return {number} The distance between `a` and `b`.
     */
    function distance(a: Blockly.utils.Coordinate, b: Blockly.utils.Coordinate): number;

    /**
     * Returns the magnitude of a coordinate.
     * @param {!Blockly.utils.Coordinate} a A Coordinate.
     * @return {number} The distance between the origin and `a`.
     */
    function magnitude(a: Blockly.utils.Coordinate): number;

    /**
     * Returns the difference between two coordinates as a new
     * Blockly.utils.Coordinate.
     * @param {!Blockly.utils.Coordinate|!SVGPoint} a An x/y coordinate.
     * @param {!Blockly.utils.Coordinate|!SVGPoint} b An x/y coordinate.
     * @return {!Blockly.utils.Coordinate} A Coordinate representing the difference
     *     between `a` and `b`.
     */
    function difference(a: Blockly.utils.Coordinate|SVGPoint, b: Blockly.utils.Coordinate|SVGPoint): Blockly.utils.Coordinate;

    /**
     * Returns the sum of two coordinates as a new Blockly.utils.Coordinate.
     * @param {!Blockly.utils.Coordinate|!SVGPoint} a An x/y coordinate.
     * @param {!Blockly.utils.Coordinate|!SVGPoint} b An x/y coordinate.
     * @return {!Blockly.utils.Coordinate} A Coordinate representing the sum of
     *     the two coordinates.
     */
    function sum(a: Blockly.utils.Coordinate|SVGPoint, b: Blockly.utils.Coordinate|SVGPoint): Blockly.utils.Coordinate;
}


declare module Blockly.utils.dom {

    /**
     * Required name space for SVG elements.
     * @const
     */
    var SVG_NS: any /*missing*/;

    /**
     * Required name space for HTML elements.
     * @const
     */
    var HTML_NS: any /*missing*/;

    /**
     * Required name space for XLINK elements.
     * @const
     */
    var XLINK_NS: any /*missing*/;

    /**
     * Node type constants.
     * https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
     * @enum {number}
     */
    enum NodeType { ELEMENT_NODE, TEXT_NODE, COMMENT_NODE, DOCUMENT_POSITION_CONTAINED_BY } 

    /**
     * Helper method for creating SVG elements.
     * @param {string} name Element's tag name.
     * @param {!Object} attrs Dictionary of attribute names and values.
     * @param {Element=} opt_parent Optional parent on which to append the element.
     * @return {!SVGElement} Newly created SVG element.
     */
    function createSvgElement(name: string, attrs: Object, opt_parent?: Element): SVGElement;

    /**
     * Add a CSS class to a element.
     * Similar to Closure's goog.dom.classes.add, except it handles SVG elements.
     * @param {!Element} element DOM element to add class to.
     * @param {string} className Name of class to add.
     * @return {boolean} True if class was added, false if already present.
     */
    function addClass(element: Element, className: string): boolean;

    /**
     * Remove a CSS class from a element.
     * Similar to Closure's goog.dom.classes.remove, except it handles SVG elements.
     * @param {!Element} element DOM element to remove class from.
     * @param {string} className Name of class to remove.
     * @return {boolean} True if class was removed, false if never present.
     */
    function removeClass(element: Element, className: string): boolean;

    /**
     * Checks if an element has the specified CSS class.
     * Similar to Closure's goog.dom.classes.has, except it handles SVG elements.
     * @param {!Element} element DOM element to check.
     * @param {string} className Name of class to check.
     * @return {boolean} True if class exists, false otherwise.
     */
    function hasClass(element: Element, className: string): boolean;

    /**
     * Removes a node from its parent. No-op if not attached to a parent.
     * @param {Node} node The node to remove.
     * @return {Node} The node removed if removed; else, null.
     */
    function removeNode(node: Node): Node;

    /**
     * Insert a node after a reference node.
     * Contrast with node.insertBefore function.
     * @param {!Element} newNode New element to insert.
     * @param {!Element} refNode Existing element to precede new node.
     */
    function insertAfter(newNode: Element, refNode: Element): void;

    /**
     * Whether a node contains another node.
     * @param {!Node} parent The node that should contain the other node.
     * @param {!Node} descendant The node to test presence of.
     * @return {boolean} Whether the parent node contains the descendant node.
     */
    function containsNode(parent: Node, descendant: Node): boolean;

    /**
     * Sets the CSS transform property on an element. This function sets the
     * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
     * with older browsers. See https://caniuse.com/#feat=transforms2d
     * @param {!Element} element Element to which the CSS transform will be applied.
     * @param {string} transform The value of the CSS `transform` property.
     */
    function setCssTransform(element: Element, transform: string): void;

    /**
     * Start caching text widths. Every call to this function MUST also call
     * stopTextWidthCache. Caches must not survive between execution threads.
     */
    function startTextWidthCache(): void;

    /**
     * Stop caching field widths. Unless caching was already on when the
     * corresponding call to startTextWidthCache was made.
     */
    function stopTextWidthCache(): void;

    /**
     * Gets the width of a text element, caching it in the process.
     * @param {!Element} textElement An SVG 'text' element.
     * @return {number} Width of element.
     */
    function getTextWidth(textElement: Element): number;

    /**
     * Gets the width of a text element using a faster method than `getTextWidth`.
     * This method requires that we know the text element's font family and size in
     * advance. Similar to `getTextWidth`, we cache the width we compute.
     * @param {!Element} textElement An SVG 'text' element.
     * @param {number} fontSize The font size to use.
     * @param {string} fontWeight The font weight to use.
     * @param {string} fontFamily The font family to use.
     * @return {number} Width of element.
     */
    function getFastTextWidth(textElement: Element, fontSize: number, fontWeight: string, fontFamily: string): number;

    /**
     * Gets the width of a text element using a faster method than `getTextWidth`.
     * This method requires that we know the text element's font family and size in
     * advance. Similar to `getTextWidth`, we cache the width we compute.
     * This method is similar to ``getFastTextWidth`` but expects the font size
     * parameter to be a string.
     * @param {!Element} textElement An SVG 'text' element.
     * @param {string} fontSize The font size to use.
     * @param {string} fontWeight The font weight to use.
     * @param {string} fontFamily The font family to use.
     * @return {number} Width of element.
     */
    function getFastTextWidthWithSizeString(textElement: Element, fontSize: string, fontWeight: string, fontFamily: string): number;

    /**
     * Measure a font's metrics. The height and baseline values.
     * @param {string} text Text to measure the font dimensions of.
     * @param {string} fontSize The font size to use.
     * @param {string} fontWeight The font weight to use.
     * @param {string} fontFamily The font family to use.
     * @return {{height: number, baseline: number}} Font measurements.
     */
    function measureFontMetrics(text: string, fontSize: string, fontWeight: string, fontFamily: string): { height: number; baseline: number };
}


declare module Blockly.utils {

    /**
     * Reference to the global object.
     *
     * More info on this implementation here:
     * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI/edit
     */
    var global: any /*missing*/;
}


declare module Blockly.utils.IdGenerator {

    /**
     * Gets the next unique ID.
     * IDs are compatible with the HTML4 id attribute restrictions:
     * Use only ASCII letters, digits, '_', '-' and '.'
     * @return {string} The next unique identifier.
     */
    function getNextUniqueId(): string;
}


declare module Blockly.utils {

    /**
     * Key codes for common characters.
     *
     * Copied from Closure's goog.events.KeyCodes
     *
     * This list is not localized and therefore some of the key codes are not
     * correct for non US keyboard layouts. See comments below.
     *
     * @enum {number}
     */
    enum KeyCodes { WIN_KEY_FF_LINUX, MAC_ENTER, BACKSPACE, TAB, NUM_CENTER, ENTER, SHIFT, CTRL, ALT, PAUSE, CAPS_LOCK, ESC, SPACE, PAGE_UP, PAGE_DOWN, END, HOME, LEFT, UP, RIGHT, DOWN, PLUS_SIGN, PRINT_SCREEN, INSERT, DELETE, ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, FF_SEMICOLON, FF_EQUALS, FF_DASH, FF_HASH, QUESTION_MARK, AT_SIGN, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, META, WIN_KEY_RIGHT, CONTEXT_MENU, NUM_ZERO, NUM_ONE, NUM_TWO, NUM_THREE, NUM_FOUR, NUM_FIVE, NUM_SIX, NUM_SEVEN, NUM_EIGHT, NUM_NINE, NUM_MULTIPLY, NUM_PLUS, NUM_MINUS, NUM_PERIOD, NUM_DIVISION, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, NUMLOCK, SCROLL_LOCK, FIRST_MEDIA_KEY, LAST_MEDIA_KEY, SEMICOLON, DASH, EQUALS, COMMA, PERIOD, SLASH, APOSTROPHE, TILDE, SINGLE_QUOTE, OPEN_SQUARE_BRACKET, BACKSLASH, CLOSE_SQUARE_BRACKET, WIN_KEY, MAC_FF_META, MAC_WK_CMD_LEFT, MAC_WK_CMD_RIGHT, WIN_IME, VK_NONAME, PHANTOM } 
}


declare module Blockly.utils.math {

    /**
     * Converts degrees to radians.
     * Copied from Closure's goog.math.toRadians.
     * @param {number} angleDegrees Angle in degrees.
     * @return {number} Angle in radians.
     */
    function toRadians(angleDegrees: number): number;

    /**
     * Converts radians to degrees.
     * Copied from Closure's goog.math.toDegrees.
     * @param {number} angleRadians Angle in radians.
     * @return {number} Angle in degrees.
     */
    function toDegrees(angleRadians: number): number;

    /**
     * Clamp the provided number between the lower bound and the upper bound.
     * @param {number} lowerBound The desired lower bound.
     * @param {number} number The number to clamp.
     * @param {number} upperBound The desired upper bound.
     * @return {number} The clamped number.
     */
    function clamp(lowerBound: number, number: number, upperBound: number): number;
}


declare module Blockly.utils {

    /**
     * @record
     */
    function Metrics(): void;
}


declare module Blockly.utils.object {

    /**
     * Inherit the prototype methods from one constructor into another.
     *
     * @param {!Function} childCtor Child class.
     * @param {!Function} parentCtor Parent class.
     * @suppress {strictMissingProperties} superClass_ is not defined on Function.
     */
    function inherits(childCtor: Function, parentCtor: Function): void;

    /**
     * Copies all the members of a source object to a target object.
     * @param {!Object} target Target.
     * @param {!Object} source Source.
     */
    function mixin(target: Object, source: Object): void;

    /**
     * Complete a deep merge of all members of a source object with a target object.
     * @param {!Object} target Target.
     * @param {!Object} source Source.
     * @return {!Object} The resulting object.
     */
    function deepMerge(target: Object, source: Object): Object;

    /**
     * Returns an array of a given object's own enumerable property values.
     * @param {!Object} obj Object containing values.
     * @return {!Array} Array of values.
     */
    function values(obj: Object): any[];
}


declare module Blockly.utils {

    class Rect extends Rect__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Rect__Class  { 
    
            /**
             * Class for representing rectangular regions.
             * @param {number} top Top.
             * @param {number} bottom Bottom.
             * @param {number} left Left.
             * @param {number} right Right.
             * @struct
             * @constructor
             */
            constructor(top: number, bottom: number, left: number, right: number);
    
            /** @type {number} */
            top: number;
    
            /** @type {number} */
            bottom: number;
    
            /** @type {number} */
            left: number;
    
            /** @type {number} */
            right: number;
    
            /**
             * Tests whether this rectangle contains a x/y coordinate.
             *
             * @param {number} x The x coordinate to test for containment.
             * @param {number} y The y coordinate to test for containment.
             * @return {boolean} Whether this rectangle contains given coordinate.
             */
            contains(x: number, y: number): boolean;
    } 
    
}


declare module Blockly.utils {

    class Size extends Size__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Size__Class  { 
    
            /**
             * Class for representing sizes consisting of a width and height.
             * @param {number} width Width.
             * @param {number} height Height.
             * @struct
             * @constructor
             */
            constructor(width: number, height: number);
    
            /**
             * Width
             * @type {number}
             */
            width: number;
    
            /**
             * Height
             * @type {number}
             */
            height: number;
    } 
    
}

declare module Blockly.utils.Size {

    /**
     * Compares sizes for equality.
     * @param {Blockly.utils.Size} a A Size.
     * @param {Blockly.utils.Size} b A Size.
     * @return {boolean} True iff the sizes have equal widths and equal
     *     heights, or if both are null.
     */
    function equals(a: Blockly.utils.Size, b: Blockly.utils.Size): boolean;
}


declare module Blockly.utils._string {

    /**
     * Fast prefix-checker.
     * Copied from Closure's goog.string.startsWith.
     * @param {string} str The string to check.
     * @param {string} prefix A string to look for at the start of `str`.
     * @return {boolean} True if `str` begins with `prefix`.
     */
    function startsWith(str: string, prefix: string): boolean;

    /**
     * Given an array of strings, return the length of the shortest one.
     * @param {!Array.<string>} array Array of strings.
     * @return {number} Length of shortest string.
     */
    function shortestStringLength(array: string[]): number;

    /**
     * Given an array of strings, return the length of the common prefix.
     * Words may not be split.  Any space after a word is included in the length.
     * @param {!Array.<string>} array Array of strings.
     * @param {number=} opt_shortest Length of shortest string.
     * @return {number} Length of common prefix.
     */
    function commonWordPrefix(array: string[], opt_shortest?: number): number;

    /**
     * Given an array of strings, return the length of the common suffix.
     * Words may not be split.  Any space after a word is included in the length.
     * @param {!Array.<string>} array Array of strings.
     * @param {number=} opt_shortest Length of shortest string.
     * @return {number} Length of common suffix.
     */
    function commonWordSuffix(array: string[], opt_shortest?: number): number;

    /**
     * Wrap text to the specified width.
     * @param {string} text Text to wrap.
     * @param {number} limit Width to wrap each line.
     * @return {string} Wrapped text.
     */
    function wrap(text: string, limit: number): string;
}


declare module Blockly.utils.style {

    /**
     * Gets the height and width of an element.
     * Similar to Closure's goog.style.getSize
     * @param {!Element} element Element to get size of.
     * @return {!Blockly.utils.Size} Object with width/height properties.
     */
    function getSize(element: Element): Blockly.utils.Size;

    /**
     * Retrieves a computed style value of a node. It returns empty string if the
     * value cannot be computed (which will be the case in Internet Explorer) or
     * "none" if the property requested is an SVG one and it has not been
     * explicitly set (firefox and webkit).
     *
     * Copied from Closure's goog.style.getComputedStyle
     *
     * @param {!Element} element Element to get style of.
     * @param {string} property Property to get (camel-case).
     * @return {string} Style value.
     */
    function getComputedStyle(element: Element, property: string): string;

    /**
     * Gets the cascaded style value of a node, or null if the value cannot be
     * computed (only Internet Explorer can do this).
     *
     * Copied from Closure's goog.style.getCascadedStyle
     *
     * @param {!Element} element Element to get style of.
     * @param {string} style Property to get (camel-case).
     * @return {string} Style value.
     */
    function getCascadedStyle(element: Element, style: string): string;

    /**
     * Returns a Coordinate object relative to the top-left of the HTML document.
     * Similar to Closure's goog.style.getPageOffset
     * @param {!Element} el Element to get the page offset for.
     * @return {!Blockly.utils.Coordinate} The page offset.
     */
    function getPageOffset(el: Element): Blockly.utils.Coordinate;

    /**
     * Calculates the viewport coordinates relative to the document.
     * Similar to Closure's goog.style.getViewportPageOffset
     * @return {!Blockly.utils.Coordinate} The page offset of the viewport.
     */
    function getViewportPageOffset(): Blockly.utils.Coordinate;

    /**
     * Shows or hides an element from the page. Hiding the element is done by
     * setting the display property to "none", removing the element from the
     * rendering hierarchy so it takes up no space. To show the element, the default
     * inherited display property is restored (defined either in stylesheets or by
     * the browser's default style rules).
     * Copied from Closure's goog.style.getViewportPageOffset
     *
     * @param {!Element} el Element to show or hide.
     * @param {*} isShown True to render the element in its default style,
     *     false to disable rendering the element.
     */
    function setElementShown(el: Element, isShown: any): void;

    /**
     * Returns true if the element is using right to left (RTL) direction.
     * Copied from Closure's goog.style.isRightToLeft
     *
     * @param {!Element} el The element to test.
     * @return {boolean} True for right to left, false for left to right.
     */
    function isRightToLeft(el: Element): boolean;

    /**
     * Gets the computed border widths (on all sides) in pixels
     * Copied from Closure's goog.style.getBorderBox
     * @param {!Element} element  The element to get the border widths for.
     * @return {!Object} The computed border widths.
     */
    function getBorderBox(element: Element): Object;

    /**
     * Changes the scroll position of `container` with the minimum amount so
     * that the content and the borders of the given `element` become visible.
     * If the element is bigger than the container, its top left corner will be
     * aligned as close to the container's top left corner as possible.
     * Copied from Closure's goog.style.scrollIntoContainerView
     *
     * @param {!Element} element The element to make visible.
     * @param {!Element} container The container to scroll. If not set, then the
     *     document scroll element will be used.
     * @param {boolean=} opt_center Whether to center the element in the container.
     *     Defaults to false.
     */
    function scrollIntoContainerView(element: Element, container: Element, opt_center?: boolean): void;

    /**
     * Calculate the scroll position of `container` with the minimum amount so
     * that the content and the borders of the given `element` become visible.
     * If the element is bigger than the container, its top left corner will be
     * aligned as close to the container's top left corner as possible.
     * Copied from Closure's goog.style.getContainerOffsetToScrollInto
     *
     * @param {!Element} element The element to make visible.
     * @param {!Element} container The container to scroll. If not set, then the
     *     document scroll element will be used.
     * @param {boolean=} opt_center Whether to center the element in the container.
     *     Defaults to false.
     * @return {!Blockly.utils.Coordinate} The new scroll position of the container,
     *     in form of goog.math.Coordinate(scrollLeft, scrollTop).
     */
    function getContainerOffsetToScrollInto(element: Element, container: Element, opt_center?: boolean): Blockly.utils.Coordinate;
}


declare module Blockly.utils.svgPaths {

    /**
     * Create a string representing the given x, y pair.  It does not matter whether
     * the coordinate is relative or absolute.  The result has leading
     * and trailing spaces, and separates the x and y coordinates with a comma but
     * no space.
     * @param {number} x The x coordinate.
     * @param {number} y The y coordinate.
     * @return {string} A string of the format ' x,y '
     * @public
     */
    function point(x: number, y: number): string;

    /**
     * Draw a cubic or quadratic curve.  See
     * developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Cubic_B%C3%A9zier_Curve
     * These coordinates are unitless and hence in the user coordinate system.
     * @param {string} command The command to use.
     *     Should be one of: c, C, s, S, q, Q.
     * @param {!Array.<string>} points  An array containing all of the points to pass to the
     *     curve command, in order.  The points are represented as strings of the
     *     format ' x, y '.
     * @return {string} A string defining one or more Bezier curves.  See the MDN
     *     documentation for exact format.
     * @public
     */
    function curve(command: string, points: string[]): string;

    /**
     * Move the cursor to the given position without drawing a line.
     * The coordinates are absolute.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
     * @param {number} x The absolute x coordinate.
     * @param {number} y The absolute y coordinate.
     * @return {string} A string of the format ' M x,y '
     * @public
     */
    function moveTo(x: number, y: number): string;

    /**
     * Move the cursor to the given position without drawing a line.
     * Coordinates are relative.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
     * @param {number} dx The relative x coordinate.
     * @param {number} dy The relative y coordinate.
     * @return {string} A string of the format ' m dx,dy '
     * @public
     */
    function moveBy(dx: number, dy: number): string;

    /**
     * Draw a line from the current point to the end point, which is the current
     * point shifted by dx along the x-axis and dy along the y-axis.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
     * @param {number} dx The relative x coordinate.
     * @param {number} dy The relative y coordinate.
     * @return {string} A string of the format ' l dx,dy '
     * @public
     */
    function lineTo(dx: number, dy: number): string;

    /**
     * Draw multiple lines connecting all of the given points in order.  This is
     * equivalent to a series of 'l' commands.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
     * @param {!Array.<string>} points An array containing all of the points to
     *     draw lines to, in order.  The points are represented as strings of the
     *     format ' dx,dy '.
     * @return {string} A string of the format ' l (dx,dy)+ '
     * @public
     */
    function line(points: string[]): string;

    /**
     * Draw a horizontal or vertical line.
     * The first argument specifies the direction and whether the given position is
     * relative or absolute.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#LineTo_path_commands
     * @param {string} command The command to prepend to the coordinate.  This
     *     should be one of: V, v, H, h.
     * @param {number} val The coordinate to pass to the command.  It may be
     *     absolute or relative.
     * @return {string} A string of the format ' command val '
     * @public
     */
    function lineOnAxis(command: string, val: number): string;

    /**
     * Draw an elliptical arc curve.
     * These coordinates are unitless and hence in the user coordinate system.
     * See developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Elliptical_Arc_Curve
     * @param {string} command The command string.  Either 'a' or 'A'.
     * @param {string} flags The flag string.  See the MDN documentation for a
     *     description and examples.
     * @param {number} radius The radius of the arc to draw.
     * @param {string} point The point to move the cursor to after drawing the arc,
     *     specified either in absolute or relative coordinates depending on the
     *     command.
     * @return {string} A string of the format 'command radius radius flags point'
     * @public
     */
    function arc(command: string, flags: string, radius: number, point: string): string;
}


declare module Blockly.utils.toolbox {

    /**
     * The information needed to create a block in the toolbox.
     * @typedef {{
     *            kind:string,
     *            blockxml:(?string|Node),
     *            type: ?string,
     *            gap: (?string|?number),
     *            disabled: (?string|?boolean)
     *          }}
     */
    interface Block {
        kind: string;
        blockxml: string|Node;
        type: string;
        gap: string|number;
        disabled: string|boolean
    }

    /**
     * The information needed to create a separator in the toolbox.
     * @typedef {{
     *            kind:string,
     *            gap:?number
     *          }}
     */
    interface Separator {
        kind: string;
        gap: number
    }

    /**
     * The information needed to create a button in the toolbox.
     * @typedef {{
     *            kind:string,
     *            text:string,
     *            callbackkey:string
     *          }}
     */
    interface Button {
        kind: string;
        text: string;
        callbackkey: string
    }

    /**
     * The information needed to create a label in the toolbox.
     * @typedef {{
     *            kind:string,
     *            text:string
     *          }}
     */
    interface Label {
        kind: string;
        text: string
    }

    /**
     * The information needed to create a category in the toolbox.
     * @typedef {{
     *            kind:string,
     *            name:string,
     *            categorystyle:?string,
     *            colour:?string,
     *            contents:Array.<Blockly.utils.toolbox.Toolbox>
     *          }}
     */
    interface Category {
        kind: string;
        name: string;
        categorystyle: string;
        colour: string;
        contents: Blockly.utils.toolbox.Toolbox[]
    }

    /**
     * Any information that can be used to create an item in the toolbox.
     * @typedef {Blockly.utils.toolbox.Block|
     *           Blockly.utils.toolbox.Separator|
     *           Blockly.utils.toolbox.Button|
     *           Blockly.utils.toolbox.Label|
     *           Blockly.utils.toolbox.Category}
     */
    type Toolbox = Blockly.utils.toolbox.Block|Blockly.utils.toolbox.Separator|Blockly.utils.toolbox.Button|Blockly.utils.toolbox.Label|Blockly.utils.toolbox.Category;

    /**
     * All of the different types that can create a toolbox.
     * @typedef {Node|
     *           NodeList|
     *           Array.<Blockly.utils.toolbox.Toolbox>|
     *           Array.<Node>}
     */
    type ToolboxDefinition = Node|NodeList|Blockly.utils.toolbox.Toolbox[]|Node[];

    /**
     * Parse the provided toolbox definition into a consistent format.
     * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition of the
     *    toolbox in one of its many forms.
     * @return {Array.<Blockly.utils.toolbox.Toolbox>} Array of JSON holding
     *    information on toolbox contents.
     * @package
     */
    function convertToolboxToJSON(toolboxDef: Blockly.utils.toolbox.ToolboxDefinition): Blockly.utils.toolbox.Toolbox[];

    /**
     * Whether or not the toolbox definition has categories or not.
     * @param {Node|Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef The definition
     *    of the toolbox. Either in xml or JSON.
     * @return {boolean} True if the toolbox has categories.
     * @package
     */
    function hasCategories(toolboxDef: Node|Blockly.utils.toolbox.Toolbox[]): boolean;
}


declare module Blockly.utils.userAgent {

    /** @const {boolean} */
    var IE: any /*missing*/;

    /** @const {boolean} */
    var EDGE: any /*missing*/;

    /** @const {boolean} */
    var JAVA_FX: any /*missing*/;

    /** @const {boolean} */
    var CHROME: any /*missing*/;

    /** @const {boolean} */
    var WEBKIT: any /*missing*/;

    /** @const {boolean} */
    var GECKO: any /*missing*/;

    /** @const {boolean} */
    var ANDROID: any /*missing*/;

    /** @const {boolean} */
    var IPAD: any /*missing*/;

    /** @const {boolean} */
    var IPOD: any /*missing*/;

    /** @const {boolean} */
    var IPHONE: any /*missing*/;

    /** @const {boolean} */
    var MAC: any /*missing*/;

    /** @const {boolean} */
    var TABLET: any /*missing*/;

    /** @const {boolean} */
    var MOBILE: any /*missing*/;
}


declare module Blockly.utils.xml {

    /**
     * Namespace for Blockly's XML.
     */
    var NAME_SPACE: any /*missing*/;

    /**
     * Get the document object.  This method is overridden in the Node.js build of
     * Blockly. See gulpfile.js, package-blockly-node task.
     * @return {!Document} The document object.
     * @public
     */
    function document(): Document;

    /**
     * Create DOM element for XML.
     * @param {string} tagName Name of DOM element.
     * @return {!Element} New DOM element.
     * @public
     */
    function createElement(tagName: string): Element;

    /**
     * Create text element for XML.
     * @param {string} text Text content.
     * @return {!Text} New DOM text node.
     * @public
     */
    function createTextNode(text: string): Text;

    /**
     * Converts an XML string into a DOM tree.
     * @param {string} text XML string.
     * @return {Document} The DOM document.
     * @throws if XML doesn't parse.
     * @public
     */
    function textToDomDocument(text: string): Document;

    /**
     * Converts a DOM structure into plain text.
     * Currently the text format is fairly ugly: all one line with no whitespace.
     * @param {!Node} dom A tree of XML nodes.
     * @return {string} Text representation.
     * @public
     */
    function domToText(dom: Node): string;
}


declare module Blockly.tree {

    class BaseNode extends BaseNode__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BaseNode__Class extends Blockly.Component__Class  { 
    
            /**
             * An abstract base class for a node in the tree.
             * Similar to goog.ui.tree.BaseNode
             *
             * @param {string} content The content of the node label treated as
             *     plain-text and will be HTML escaped.
             * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
             * @constructor
             * @extends {Blockly.Component}
             */
            constructor(content: string, config: Blockly.tree.BaseNode.Config);
    
            /**
             * Text content of the node label.
             * @type {string}
             * @package
             */
            content: string;
    
            /**
             * @type {string}
             * @package
             */
            iconClass: string;
    
            /**
             * @type {string}
             * @package
             */
            expandedIconClass: string;
    
            /**
             * The configuration for the tree.
             * @type {!Blockly.tree.BaseNode.Config}
             * @protected
             */
            config_: Blockly.tree.BaseNode.Config;
    
            /**
             * @type {Blockly.tree.TreeControl}
             * @protected
             */
            tree: Blockly.tree.TreeControl;
    
            /**
             * Whether the tree item is selected.
             * @type {boolean}
             * @protected
             */
            selected_: boolean;
    
            /**
             * Whether the tree node is expanded.
             * @type {boolean}
             * @protected
             */
            expanded_: boolean;
    
            /**
             * Adds roles and states.
             * @protected
             */
            initAccessibility(): void;
    
            /**
             * Appends a node as a child to the current node.
             * @param {Blockly.tree.BaseNode} child The child to add.
             * @package
             */
            add(child: Blockly.tree.BaseNode): void;
    
            /**
             * Returns the tree.
             * @return {?Blockly.tree.TreeControl} tree
             * @protected
             */
            getTree(): Blockly.tree.TreeControl;
    
            /**
             * Returns the depth of the node in the tree. Should not be overridden.
             * @return {number} The non-negative depth of this node (the root is zero).
             * @protected
             */
            getDepth(): number;
    
            /**
             * Returns true if the node is a descendant of this node.
             * @param {Blockly.Component} node The node to check.
             * @return {boolean} True if the node is a descendant of this node, false
             *    otherwise.
             * @protected
             */
            contains(node: Blockly.Component): boolean;
    
            /**
             * This is re-defined here to indicate to the Closure Compiler the correct
             * child return type.
             * @param {number} index 0-based index.
             * @return {Blockly.tree.BaseNode} The child at the given index; null if none.
             * @protected
             */
            getChildAt(index: number): Blockly.tree.BaseNode;
    
            /**
             * Returns the children of this node.
             * @return {!Array.<!Blockly.tree.BaseNode>} The children.
             * @package
             */
            getChildren(): Blockly.tree.BaseNode[];
    
            /**
             * Returns the node's parent, if any.
             * @return {?Blockly.tree.BaseNode} The parent node.
             * @protected
             */
            getParent(): Blockly.tree.BaseNode;
    
            /**
             * @return {Blockly.tree.BaseNode} The previous sibling of this node.
             * @protected
             */
            getPreviousSibling(): Blockly.tree.BaseNode;
    
            /**
             * @return {Blockly.tree.BaseNode} The next sibling of this node.
             * @protected
             */
            getNextSibling(): Blockly.tree.BaseNode;
    
            /**
             * @return {boolean} Whether the node is the last sibling.
             * @protected
             */
            isLastSibling(): boolean;
    
            /**
             * @return {boolean} Whether the node is selected.
             * @protected
             */
            isSelected(): boolean;
    
            /**
             * Selects the node.
             * @protected
             */
            select(): void;
    
            /**
             * Called from the tree to instruct the node change its selection state.
             * @param {boolean} selected The new selection state.
             * @protected
             */
            setSelected(selected: boolean): void;
    
            /**
             * Sets the node to be expanded.
             * @param {boolean} expanded Whether to expand or close the node.
             * @package
             */
            setExpanded(expanded: boolean): void;
    
            /**
             * Used to notify a node of that we have expanded it.
             * Can be overridden by subclasses, see Blockly.tree.TreeNode.
             * @protected
             */
            doNodeExpanded(): void;
    
            /**
             * Used to notify a node that we have collapsed it.
             * Can be overridden by subclasses, see Blockly.tree.TreeNode.
             * @protected
             */
            doNodeCollapsed(): void;
    
            /**
             * Toggles the expanded state of the node.
             * @protected
             */
            toggle(): void;
    
            /**
             * Creates HTML Element for the node.
             * @return {!Element} HTML element
             * @protected
             */
            toDom(): Element;
    
            /**
             * Creates row with icon and label dom.
             * @return {!Element} The HTML element for the row.
             * @protected
             */
            getRowDom(): Element;
    
            /**
             * Adds the selected class name to the default row class name if node is
             *     selected.
             * @return {string} The class name for the row.
             * @protected
             */
            getRowClassName(): string;
    
            /**
             * @return {!Element} The HTML element for the label.
             * @protected
             */
            getLabelDom(): Element;
    
            /**
             * @return {!Element} The HTML for the icon.
             * @protected
             */
            getIconDom(): Element;
    
            /**
             * Gets the calculated icon class.
             * @protected
             */
            getCalculatedIconClass(): void;
    
            /**
             * Gets a string containing the x and y position of the node's background.
             * @return {string} The background position style value.
             * @protected
             */
            getBackgroundPosition(): string;
    
            /**
             * @return {Element} The row is the div that is used to draw the node without
             *     the children.
             * @package
             */
            getRowElement(): Element;
    
            /**
             * @return {Element} The icon element.
             * @protected
             */
            getIconElement(): Element;
    
            /**
             * @return {Element} The label element.
             * @protected
             */
            getLabelElement(): Element;
    
            /**
             * @return {Element} The div containing the children.
             * @protected
             */
            getChildrenElement(): Element;
    
            /**
             * Updates the row styles.
             * @protected
             */
            updateRow(): void;
    
            /**
             * Updates the expand icon of the node.
             * @protected
             */
            updateExpandIcon(): void;
    
            /**
             * Handles a click event.
             * @param {!Event} e The browser event.
             * @protected
             */
            onClick_(e: Event): void;
    
            /**
             * Handles a key down event.
             * @param {!Event} e The browser event.
             * @return {boolean} The handled value.
             * @protected
             */
            onKeyDown(e: Event): boolean;
    
            /**
             * Select the next node.
             * @return {boolean} True if the action has been handled, false otherwise.
             * @package
             */
            selectNext(): boolean;
    
            /**
             * Select the previous node.
             * @return {boolean} True if the action has been handled, false otherwise.
             * @package
             */
            selectPrevious(): boolean;
    
            /**
             * Select the parent node or collapse the current node.
             * @return {boolean} True if the action has been handled, false otherwise.
             * @package
             */
            selectParent(): boolean;
    
            /**
             * Expand the current node if it's not already expanded, or select the
             * child node.
             * @return {boolean} True if the action has been handled, false otherwise.
             * @package
             */
            selectChild(): boolean;
    
            /**
             * @return {Blockly.tree.BaseNode} The last shown descendant.
             * @protected
             */
            getLastShownDescendant(): Blockly.tree.BaseNode;
    
            /**
             * @return {Blockly.tree.BaseNode} The next node to show or null if there isn't
             *     a next node to show.
             * @protected
             */
            getNextShownNode(): Blockly.tree.BaseNode;
    
            /**
             * @return {Blockly.tree.BaseNode} The previous node to show.
             * @protected
             */
            getPreviousShownNode(): Blockly.tree.BaseNode;
    
            /**
             * Internal method that is used to set the tree control on the node.
             * @param {Blockly.tree.TreeControl} tree The tree control.
             * @protected
             */
            setTreeInternal(tree: Blockly.tree.TreeControl): void;
    } 
    
}

declare module Blockly.tree.BaseNode {

    /**
     * The config type for the tree.
     * @typedef {{
     *            indentWidth:number,
     *            cssRoot:string,
     *            cssHideRoot:string,
     *            cssTreeRow:string,
     *            cssItemLabel:string,
     *            cssTreeIcon:string,
     *            cssExpandedFolderIcon:string,
     *            cssCollapsedFolderIcon:string,
     *            cssFileIcon:string,
     *            cssSelectedRow:string
     *          }}
     */
    interface Config {
        indentWidth: number;
        cssRoot: string;
        cssHideRoot: string;
        cssTreeRow: string;
        cssItemLabel: string;
        cssTreeIcon: string;
        cssExpandedFolderIcon: string;
        cssCollapsedFolderIcon: string;
        cssFileIcon: string;
        cssSelectedRow: string
    }

    /**
     * Map of nodes in existence. Needed to route events to the appropriate nodes.
     * Nodes are added to the map at {@link #enterDocument} time and removed at
     * {@link #exitDocument} time.
     * @type {Object}
     * @protected
     */
    var allNodes: Object;
}


declare module Blockly.tree {

    class TreeControl extends TreeControl__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TreeControl__Class extends Blockly.tree.BaseNode__Class  { 
    
            /**
             * An extension of the TreeControl object in closure that provides
             * a way to view a hierarchical set of data.
             * Similar to Closure's goog.ui.tree.TreeControl
             *
             * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
             * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
             * @constructor
             * @extends {Blockly.tree.BaseNode}
             */
            constructor(toolbox: Blockly.Toolbox, config: Blockly.tree.BaseNode.Config);
    
            /**
             * Returns the associated toolbox.
             * @return {Blockly.Toolbox} The toolbox.
             * @package
             */
            getToolbox(): Blockly.Toolbox;
    
            /**
             * Sets the selected item.
             * @param {Blockly.tree.BaseNode} node The item to select.
             * @package
             */
            setSelectedItem(node: Blockly.tree.BaseNode): void;
    
            /**
             * Set the handler that's triggered before a node is selected.
             * @param {function(Blockly.tree.BaseNode):boolean} fn The handler
             * @package
             */
            onBeforeSelected(fn: { (_0: Blockly.tree.BaseNode): boolean }): void;
    
            /**
             * Set the handler that's triggered after a node is selected.
             * @param {function(
             *  Blockly.tree.BaseNode, Blockly.tree.BaseNode):?} fn The handler
             * @package
             */
            onAfterSelected(fn: { (_0: Blockly.tree.BaseNode, _1: Blockly.tree.BaseNode): any }): void;
    
            /**
             * Returns the selected item.
             * @return {Blockly.tree.BaseNode} The currently selected item.
             * @package
             */
            getSelectedItem(): Blockly.tree.BaseNode;
    
            /**
             * Creates a new tree node using the same config as the root.
             * @param {string=} opt_content The content of the node label.
             * @return {!Blockly.tree.TreeNode} The new item.
             * @package
             */
            createNode(opt_content?: string): Blockly.tree.TreeNode;
    } 
    
}


declare module Blockly.tree {

    class TreeNode extends TreeNode__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TreeNode__Class extends Blockly.tree.BaseNode__Class  { 
    
            /**
             * A single node in the tree, customized for Blockly's UI.
             * Similar to Closure's goog.ui.tree.TreeNode
             *
             * @param {Blockly.Toolbox} toolbox The parent toolbox for this tree.
             * @param {string} content The content of the node label treated as
             *     plain-text and will be HTML escaped.
             * @param {!Blockly.tree.BaseNode.Config} config The configuration for the tree.
             * @constructor
             * @extends {Blockly.tree.BaseNode}
             */
            constructor(toolbox: Blockly.Toolbox, content: string, config: Blockly.tree.BaseNode.Config);
    
            /**
             * Set the handler that's triggered when the size of node has changed.
             * @param {function():?} fn The handler
             * @package
             */
            onSizeChanged(fn: { (): any }): void;
    } 
    
}


declare module Blockly.blockRendering {

    class Measurable extends Measurable__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Measurable__Class  { 
    
            /**
             * The base class to represent a part of a block that takes up space during
             * rendering.  The constructor for each non-spacer Measurable records the size
             * of the block element (e.g. field, statement input).
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * The renderer's constant provider.
             * @type {!Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    } 
    
}


declare module Blockly.blockRendering {

    class Connection extends Connection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Connection__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * The base class to represent a connection and the space that it takes up on
             * the block.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.RenderedConnection} connectionModel The connection object on
             *     the block that this represents.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, connectionModel: Blockly.RenderedConnection);
    } 
    

    class OutputConnection extends OutputConnection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class OutputConnection__Class extends Blockly.blockRendering.Connection__Class  { 
    
            /**
             * An object containing information about the space an output connection takes
             * up during rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {Blockly.RenderedConnection} connectionModel The connection object on
             *     the block that this represents.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Connection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, connectionModel: Blockly.RenderedConnection);
    } 
    

    class PreviousConnection extends PreviousConnection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class PreviousConnection__Class extends Blockly.blockRendering.Connection__Class  { 
    
            /**
             * An object containing information about the space a previous connection takes
             * up during rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {Blockly.RenderedConnection} connectionModel The connection object on
             *     the block that this represents.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Connection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, connectionModel: Blockly.RenderedConnection);
    } 
    

    class NextConnection extends NextConnection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class NextConnection__Class extends Blockly.blockRendering.Connection__Class  { 
    
            /**
             * An object containing information about the space a next connection takes
             * up during rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {Blockly.RenderedConnection} connectionModel The connection object on
             *     the block that this represents.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Connection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, connectionModel: Blockly.RenderedConnection);
    } 
    
}


declare module Blockly.blockRendering {

    class InputConnection extends InputConnection__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class InputConnection__Class extends Blockly.blockRendering.Connection__Class  { 
    
            /**
             * The base class to represent an input that takes up space on a block
             * during rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Input} input The input to measure and store information for.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Connection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, input: Blockly.Input);
    } 
    

    class InlineInput extends InlineInput__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class InlineInput__Class extends Blockly.blockRendering.InputConnection__Class  { 
    
            /**
             * An object containing information about the space an inline input takes up
             * during rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Input} input The inline input to measure and store
             *     information for.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.InputConnection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, input: Blockly.Input);
    } 
    

    class StatementInput extends StatementInput__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class StatementInput__Class extends Blockly.blockRendering.InputConnection__Class  { 
    
            /**
             * An object containing information about the space a statement input takes up
             * during rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Input} input The statement input to measure and store
             *     information for.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.InputConnection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, input: Blockly.Input);
    } 
    

    class ExternalValueInput extends ExternalValueInput__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ExternalValueInput__Class extends Blockly.blockRendering.InputConnection__Class  { 
    
            /**
             * An object containing information about the space an external value input
             * takes up during rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Input} input The external value input to measure and store
             *     information for.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.InputConnection}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, input: Blockly.Input);
    } 
    
}


declare module Blockly.blockRendering {

    class Icon extends Icon__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Icon__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the space an icon takes up during
             * rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Icon} icon The icon to measure and store information for.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, icon: Blockly.Icon);
    } 
    

    class JaggedEdge extends JaggedEdge__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class JaggedEdge__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the jagged edge of a collapsed block
             * takes up during rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    } 
    

    class Field extends Field__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Field__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the space a field takes up during
             * rendering
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {!Blockly.Field} field The field to measure and store information for.
             * @param {!Blockly.Input} parentInput The parent input for the field.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, field: Blockly.Field, parentInput: Blockly.Input);
    } 
    

    class Hat extends Hat__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Hat__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the space a hat takes up during
             * rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    } 
    

    class SquareCorner extends SquareCorner__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class SquareCorner__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the space a square corner takes up
             * during rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {string=} opt_position The position of this corner.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, opt_position?: string);
    } 
    

    class RoundCorner extends RoundCorner__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class RoundCorner__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about the space a rounded corner takes up
             * during rendering.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {string=} opt_position The position of this corner.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, opt_position?: string);
    } 
    

    class InRowSpacer extends InRowSpacer__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class InRowSpacer__Class extends Blockly.blockRendering.Measurable__Class  { 
    
            /**
             * An object containing information about a spacer between two elements on a
             * row.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {number} width The width of the spacer.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Measurable}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, width: number);
    } 
    
}


declare module Blockly.blockRendering {

    class Row extends Row__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Row__Class  { 
    
            /**
             * An object representing a single row on a rendered block and all of its
             * subcomponents.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * The type of this rendering object.
             * @package
             * @type {number}
             */
            type: number;
    
            /**
             * An array of elements contained in this row.
             * @package
             * @type {!Array.<!Blockly.blockRendering.Measurable>}
             */
            elements: Blockly.blockRendering.Measurable[];
    
            /**
             * The height of the row.
             * @package
             * @type {number}
             */
            height: number;
    
            /**
             * The width of the row, from the left edge of the block to the right.
             * Does not include child blocks unless they are inline.
             * @package
             * @type {number}
             */
            width: number;
    
            /**
             * The minimum height of the row.
             * @package
             * @type {number}
             */
            minHeight: number;
    
            /**
             * The minimum width of the row, from the left edge of the block to the right.
             * Does not include child blocks unless they are inline.
             * @package
             * @type {number}
             */
            minWidth: number;
    
            /**
             * The width of the row, from the left edge of the block to the edge of the
             * block or any connected child blocks.
             * @package
             * @type {number}
             */
            widthWithConnectedBlocks: number;
    
            /**
             * The Y position of the row relative to the origin of the block's svg group.
             * @package
             * @type {number}
             */
            yPos: number;
    
            /**
             * The X position of the row relative to the origin of the block's svg group.
             * @package
             * @type {number}
             */
            xPos: number;
    
            /**
             * Whether the row has any external inputs.
             * @package
             * @type {boolean}
             */
            hasExternalInput: boolean;
    
            /**
             * Whether the row has any statement inputs.
             * @package
             * @type {boolean}
             */
            hasStatement: boolean;
    
            /**
             * Whether the row has any inline inputs.
             * @package
             * @type {boolean}
             */
            hasInlineInput: boolean;
    
            /**
             * Whether the row has any dummy inputs.
             * @package
             * @type {boolean}
             */
            hasDummyInput: boolean;
    
            /**
             * Whether the row has a jagged edge.
             * @package
             * @type {boolean}
             */
            hasJaggedEdge: boolean;
    
            /**
             * The renderer's constant provider.
             * @type {!Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    
            /**
             * Alignment of the row.
             * @package
             * @type {?number}
             */
            align: number;
    
            /**
             * Inspect all subcomponents and populate all size properties on the row.
             * @package
             */
            measure(): void;
    
            /**
             * Get the last input on this row, if it has one.
             * @return {Blockly.blockRendering.InputConnection} The last input on the row,
             *     or null.
             * @package
             */
            getLastInput(): Blockly.blockRendering.InputConnection;
    
            /**
             * Determines whether this row should start with an element spacer.
             * @return {boolean} Whether the row should start with a spacer.
             * @package
             */
            startsWithElemSpacer(): boolean;
    
            /**
             * Determines whether this row should end with an element spacer.
             * @return {boolean} Whether the row should end with a spacer.
             * @package
             */
            endsWithElemSpacer(): boolean;
    
            /**
             * Convenience method to get the first spacer element on this row.
             * @return {Blockly.blockRendering.InRowSpacer} The first spacer element on
             *   this row.
             * @package
             */
            getFirstSpacer(): Blockly.blockRendering.InRowSpacer;
    
            /**
             * Convenience method to get the last spacer element on this row.
             * @return {Blockly.blockRendering.InRowSpacer} The last spacer element on
             *   this row.
             * @package
             */
            getLastSpacer(): Blockly.blockRendering.InRowSpacer;
    } 
    

    class TopRow extends TopRow__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class TopRow__Class extends Blockly.blockRendering.Row__Class  { 
    
            /**
             * An object containing information about what elements are in the top row of a
             * block as well as sizing information for the top row.
             * Elements in a top row can consist of corners, hats, spacers, and previous
             * connections.
             * After this constructor is called, the row will contain all non-spacer
             * elements it needs.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Row}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * The starting point for drawing the row, in the y direction.
             * This allows us to draw hats and similar shapes that don't start at the
             * origin. Must be non-negative (see #2820).
             * @package
             * @type {number}
             */
            capline: number;
    
            /**
             * How much the row extends up above its capline.
             * @type {number}
             */
            ascenderHeight: number;
    
            /**
             * Whether the block has a previous connection.
             * @package
             * @type {boolean}
             */
            hasPreviousConnection: boolean;
    
            /**
             * The previous connection on the block, if any.
             * @type {Blockly.blockRendering.PreviousConnection}
             */
            connection: Blockly.blockRendering.PreviousConnection;
    
            /**
             * Returns whether or not the top row has a left square corner.
             * @param {!Blockly.BlockSvg} block The block whose top row this represents.
             * @return {boolean} Whether or not the top row has a left square corner.
             */
            hasLeftSquareCorner(block: Blockly.BlockSvg): boolean;
    
            /**
             * Returns whether or not the top row has a right square corner.
             * @param {!Blockly.BlockSvg} _block The block whose top row this represents.
             * @return {boolean} Whether or not the top row has a right square corner.
             */
            hasRightSquareCorner(_block: Blockly.BlockSvg): boolean;
    } 
    

    class BottomRow extends BottomRow__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BottomRow__Class extends Blockly.blockRendering.Row__Class  { 
    
            /**
             * An object containing information about what elements are in the bottom row of
             * a block as well as spacing information for the top row.
             * Elements in a bottom row can consist of corners, spacers and next
             * connections.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Row}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * Whether this row has a next connection.
             * @package
             * @type {boolean}
             */
            hasNextConnection: boolean;
    
            /**
             * The next connection on the row, if any.
             * @package
             * @type {Blockly.blockRendering.NextConnection}
             */
            connection: Blockly.blockRendering.NextConnection;
    
            /**
             * The amount that the bottom of the block extends below the horizontal edge,
             * e.g. because of a next connection.  Must be non-negative (see #2820).
             * @package
             * @type {number}
             */
            descenderHeight: number;
    
            /**
             * The Y position of the bottom edge of the block, relative to the origin
             * of the block rendering.
             * @type {number}
             */
            baseline: number;
    
            /**
             * Returns whether or not the bottom row has a left square corner.
             * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
             * @return {boolean} Whether or not the bottom row has a left square corner.
             */
            hasLeftSquareCorner(block: Blockly.BlockSvg): boolean;
    
            /**
             * Returns whether or not the bottom row has a right square corner.
             * @param {!Blockly.BlockSvg} _block The block whose bottom row this represents.
             * @return {boolean} Whether or not the bottom row has a right square corner.
             */
            hasRightSquareCorner(_block: Blockly.BlockSvg): boolean;
    } 
    

    class SpacerRow extends SpacerRow__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class SpacerRow__Class extends Blockly.blockRendering.Row__Class  { 
    
            /**
             * An object containing information about a spacer between two rows.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @param {number} height The height of the spacer.
             * @param {number} width The width of the spacer.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Row}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider, height: number, width: number);
    } 
    

    class InputRow extends InputRow__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class InputRow__Class extends Blockly.blockRendering.Row__Class  { 
    
            /**
             * An object containing information about a row that holds one or more inputs.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
             *   constants provider.
             * @package
             * @constructor
             * @extends {Blockly.blockRendering.Row}
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * The total width of all blocks connected to this row.
             * @type {number}
             * @package
             */
            connectedBlockWidths: number;
    
            /**
             * Inspect all subcomponents and populate all size properties on the row.
             * @package
             */
            measure(): void;
    } 
    
}


declare module Blockly.blockRendering {

    /**
     * Types of rendering elements.
     * @enum {number}
     */
    enum Types { NONE, FIELD, HAT, ICON, SPACER, BETWEEN_ROW_SPACER, IN_ROW_SPACER, EXTERNAL_VALUE_INPUT, INPUT, INLINE_INPUT, STATEMENT_INPUT, CONNECTION, PREVIOUS_CONNECTION, NEXT_CONNECTION, OUTPUT_CONNECTION, CORNER, LEFT_SQUARE_CORNER, LEFT_ROUND_CORNER, RIGHT_SQUARE_CORNER, RIGHT_ROUND_CORNER, JAGGED_EDGE, ROW, TOP_ROW, BOTTOM_ROW, INPUT_ROW } 
}

declare module Blockly.blockRendering.Types {

    /**
     * A Left Corner Union Type.
     * @type {number}
     * @const
     * @package
     */
    var LEFT_CORNER: number;

    /**
     * A Right Corner Union Type.
     * @type {number}
     * @const
     * @package
     */
    var RIGHT_CORNER: number;

    /**
     * Get the enum flag value of an existing type or register a new type.
     * @param {!string} type The name of the type.
     * @return {!number} The enum flag value associated with that type.
     * @package
     */
    function getType(type: string): number;

    /**
     * Whether a measurable stores information about a field.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a field.
     * @package
     */
    function isField(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a hat.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a hat.
     * @package
     */
    function isHat(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about an icon.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an icon.
     * @package
     */
    function isIcon(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a spacer.
     * @param {!Blockly.blockRendering.Measurable|!Blockly.blockRendering.Row} elem
     *     The element to check.
     * @return {number} 1 if the object stores information about a spacer.
     * @package
     */
    function isSpacer(elem: Blockly.blockRendering.Measurable|Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about an in-row spacer.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   in-row spacer.
     * @package
     */
    function isInRowSpacer(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about an input.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an input.
     * @package
     */
    function isInput(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about an external input.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   external input.
     * @package
     */
    function isExternalInput(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about an inline input.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about an
     *   inline input.
     * @package
     */
    function isInlineInput(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a statement input.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   statement input.
     * @package
     */
    function isStatementInput(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a previous connection.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   previous connection.
     * @package
     */
    function isPreviousConnection(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a next connection.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   next connection.
     * @package
     */
    function isNextConnection(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a previous or next connection.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a previous or
     *   next connection.
     * @package
     */
    function isPreviousOrNextConnection(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a left round corner.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   left round corner.
     * @package
     */
    function isLeftRoundedCorner(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a right round corner.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   right round corner.
     * @package
     */
    function isRightRoundedCorner(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a left square corner.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   left square corner.
     * @package
     */
    function isLeftSquareCorner(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a right square corner.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   right square corner.
     * @package
     */
    function isRightSquareCorner(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a corner.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a
     *   corner.
     * @package
     */
    function isCorner(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a jagged edge.
     * @param {!Blockly.blockRendering.Measurable} elem The element to check.
     * @return {number} 1 if the object stores information about a jagged edge.
     * @package
     */
    function isJaggedEdge(elem: Blockly.blockRendering.Measurable): number;

    /**
     * Whether a measurable stores information about a row.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about a row.
     * @package
     */
    function isRow(row: Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about a between-row spacer.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about a
     *   between-row spacer.
     * @package
     */
    function isBetweenRowSpacer(row: Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about a top row.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about a top row.
     * @package
     */
    function isTopRow(row: Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about a bottom row.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about a bottom row.
     * @package
     */
    function isBottomRow(row: Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about a top or bottom row.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about a top or
     *   bottom row.
     * @package
     */
    function isTopOrBottomRow(row: Blockly.blockRendering.Row): number;

    /**
     * Whether a measurable stores information about an input row.
     * @param {!Blockly.blockRendering.Row} row The row to check.
     * @return {number} 1 if the object stores information about an input row.
     * @package
     */
    function isInputRow(row: Blockly.blockRendering.Row): number;
}


declare module Blockly.blockRendering {

    /**
     * Whether or not the debugger is turned on.
     * @type {boolean}
     * @package
     */
    var useDebugger: boolean;

    /**
     * Registers a new renderer.
     * @param {string} name The name of the renderer.
     * @param {!Function} rendererClass The new renderer class
     *     to register.
     * @throws {Error} if a renderer with the same name has already been registered.
     */
    function register(name: string, rendererClass: Function): void;

    /**
     * Unregisters the renderer registered with the given name.
     * @param {string} name The name of the renderer.
     */
    function unregister(name: string): void;

    /**
     * Turn on the blocks debugger.
     * @package
     */
    function startDebugger(): void;

    /**
     * Turn off the blocks debugger.
     * @package
     */
    function stopDebugger(): void;

    /**
     * Initialize anything needed for rendering (constants, etc).
     * @param {!string} name Name of the renderer to initialize.
     * @param {!Blockly.Theme} theme The workspace theme object.
     * @param {Object=} opt_rendererOverrides Rendering constant overrides.
     * @return {!Blockly.blockRendering.Renderer} The new instance of a renderer.
     *     Already initialized.
     * @package
     */
    function init(name: string, theme: Blockly.Theme, opt_rendererOverrides?: Object): Blockly.blockRendering.Renderer;
}


declare module Blockly.blockRendering {

    class ConstantProvider extends ConstantProvider__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ConstantProvider__Class  { 
    
            /**
             * An object that provides constants for rendering blocks.
             * @constructor
             * @package
             */
            constructor();
    
            /**
             * The size of an empty spacer.
             * @type {number}
             */
            NO_PADDING: number;
    
            /**
             * The size of small padding.
             * @type {number}
             */
            SMALL_PADDING: number;
    
            /**
             * The size of medium padding.
             * @type {number}
             */
            MEDIUM_PADDING: number;
    
            /**
             * The size of medium-large padding.
             * @type {number}
             */
            MEDIUM_LARGE_PADDING: number;
    
            /**
             * The size of large padding.
             * @type {number}
             */
            LARGE_PADDING: number;
    
            /**
             * Offset from the top of the row for placing fields on inline input rows
             * and statement input rows.
             * Matches existing rendering (in 2019).
             * @type {number}
             */
            TALL_INPUT_FIELD_OFFSET_Y: number;
    
            /**
             * The height of the puzzle tab used for input and output connections.
             * @type {number}
             */
            TAB_HEIGHT: number;
    
            /**
             * The offset from the top of the block at which a puzzle tab is positioned.
             * @type {number}
             */
            TAB_OFFSET_FROM_TOP: number;
    
            /**
             * Vertical overlap of the puzzle tab, used to make it look more like a puzzle
             * piece.
             * @type {number}
             */
            TAB_VERTICAL_OVERLAP: number;
    
            /**
             * The width of the puzzle tab used for input and output connections.
             * @type {number}
             */
            TAB_WIDTH: number;
    
            /**
             * The width of the notch used for previous and next connections.
             * @type {number}
             */
            NOTCH_WIDTH: number;
    
            /**
             * The height of the notch used for previous and next connections.
             * @type {number}
             */
            NOTCH_HEIGHT: number;
    
            /**
             * The minimum width of the block.
             * @type {number}
             */
            MIN_BLOCK_WIDTH: number;
    
            /**
             * The minimum height of a dummy input row.
             * @type {number}
             */
            DUMMY_INPUT_MIN_HEIGHT: number;
    
            /**
             * The minimum height of a dummy input row in a shadow block.
             * @type {number}
             */
            DUMMY_INPUT_SHADOW_MIN_HEIGHT: number;
    
            /**
             * Rounded corner radius.
             * @type {number}
             */
            CORNER_RADIUS: number;
    
            /**
             * Offset from the left side of a block or the inside of a statement input to
             * the left side of the notch.
             * @type {number}
             */
            NOTCH_OFFSET_LEFT: number;
    
            /**
             * Additional offset added to the statement input's width to account for the
             * notch.
             * @type {number}
             */
            STATEMENT_INPUT_NOTCH_OFFSET: number;
    
            /**
             * Vertical padding between consecutive statement inputs.
             * @type {number}
             */
            BETWEEN_STATEMENT_PADDING_Y: number;
    
            /**
             * The top row's minimum height.
             * @type {number}
             */
            TOP_ROW_MIN_HEIGHT: number;
    
            /**
             * The top row's minimum height if it precedes a statement.
             * @type {number}
             */
            TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT: number;
    
            /**
             * The bottom row's minimum height.
             * @type {number}
             */
            BOTTOM_ROW_MIN_HEIGHT: number;
    
            /**
             * The bottom row's minimum height if it follows a statement input.
             * @type {number}
             */
            BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT: number;
    
            /**
             * Whether to add a 'hat' on top of all blocks with no previous or output
             * connections. Can be overridden by 'hat' property on Theme.BlockStyle.
             * @type {boolean}
             */
            ADD_START_HATS: boolean;
    
            /**
             * Height of the top hat.
             * @type {number}
             */
            START_HAT_HEIGHT: number;
    
            /**
             * Width of the top hat.
             * @type {number}
             */
            START_HAT_WIDTH: number;
    
            /**
             * The height of an empty inline input.
             * @type {number}
             */
            EMPTY_INLINE_INPUT_HEIGHT: number;
    
            /**
             * The height of an empty statement input.  Note that in the old rendering this
             * varies slightly depending on whether the block has external or inline inputs.
             * In the new rendering this is consistent.  It seems unlikely that the old
             * behaviour was intentional.
             * @type {number}
             */
            EMPTY_STATEMENT_INPUT_HEIGHT: number;
    
            /**
             * Height of SVG path for jagged teeth at the end of collapsed blocks.
             * @type {number}
             */
            JAGGED_TEETH_HEIGHT: number;
    
            /**
             * Width of SVG path for jagged teeth at the end of collapsed blocks.
             * @type {number}
             */
            JAGGED_TEETH_WIDTH: number;
    
            /**
             * Point size of text.
             * @type {number}
             */
            FIELD_TEXT_FONTSIZE: number;
    
            /**
             * Text font weight.
             * @type {string}
             */
            FIELD_TEXT_FONTWEIGHT: string;
    
            /**
             * Text font family.
             * @type {string}
             */
            FIELD_TEXT_FONTFAMILY: string;
    
            /**
             * Height of text.  This constant is dynamically set in ``setFontConstants_``
             * to be the height of the text based on the font used.
             * @type {number}
             */
            FIELD_TEXT_HEIGHT: number;
    
            /**
             * Text baseline.  This constant is dynamically set in ``setFontConstants_``
             * to be the baseline of the text based on the font used.
             * @type {number}
             */
            FIELD_TEXT_BASELINE: number;
    
            /**
             * A field's border rect corner radius.
             * @type {number}
             */
            FIELD_BORDER_RECT_RADIUS: number;
    
            /**
             * A field's border rect default height.
             * @type {number}
             */
            FIELD_BORDER_RECT_HEIGHT: number;
    
            /**
             * A field's border rect X padding.
             * @type {number}
             */
            FIELD_BORDER_RECT_X_PADDING: number;
    
            /**
             * A field's border rect Y padding.
             * @type {number}
             */
            FIELD_BORDER_RECT_Y_PADDING: number;
    
            /**
             * The backing colour of a field's border rect.
             * @type {string}
             * @package
             */
            FIELD_BORDER_RECT_COLOUR: string;
    
            /**
             * A field's text element's dominant baseline.
             * @type {boolean}
             */
            FIELD_TEXT_BASELINE_CENTER: boolean;
    
            /**
             * A dropdown field's border rect height.
             * @type {number}
             */
            FIELD_DROPDOWN_BORDER_RECT_HEIGHT: number;
    
            /**
             * Whether or not a dropdown field should add a border rect when in a shadow
             * block.
             * @type {boolean}
             */
            FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW: boolean;
    
            /**
             * Whether or not a dropdown field's div should be coloured to match the
             * block colours.
             * @type {boolean}
             */
            FIELD_DROPDOWN_COLOURED_DIV: boolean;
    
            /**
             * Whether or not a dropdown field uses a text or SVG arrow.
             * @type {boolean}
             */
            FIELD_DROPDOWN_SVG_ARROW: boolean;
    
            /**
             * A dropdown field's SVG arrow padding.
             * @type {number}
             */
            FIELD_DROPDOWN_SVG_ARROW_PADDING: number;
    
            /**
             * A dropdown field's SVG arrow size.
             * @type {number}
             */
            FIELD_DROPDOWN_SVG_ARROW_SIZE: number;
    
            /**
             * A dropdown field's SVG arrow datauri.
             * @type {string}
             */
            FIELD_DROPDOWN_SVG_ARROW_DATAURI: string;
    
            /**
             * Whether or not to show a box shadow around the widget div. This is only a
             * feature of full block fields.
             * @type {boolean}
             */
            FIELD_TEXTINPUT_BOX_SHADOW: boolean;
    
            /**
             * Whether or not the colour field should display its colour value on the
             * entire block.
             * @type {boolean}
             */
            FIELD_COLOUR_FULL_BLOCK: boolean;
    
            /**
             * A colour field's default width.
             * @type {number}
             */
            FIELD_COLOUR_DEFAULT_WIDTH: number;
    
            /**
             * A colour field's default height.
             * @type {number}
             */
            FIELD_COLOUR_DEFAULT_HEIGHT: number;
    
            /**
             * A checkbox field's X offset.
             * @type {number}
             */
            FIELD_CHECKBOX_X_OFFSET: number;
    
            /**
             * A random identifier used to ensure a unique ID is used for each
             * filter/pattern for the case of multiple Blockly instances on a page.
             * @type {string}
             * @package
             */
            randomIdentifier: string;
    
            /**
             * The ID of the emboss filter, or the empty string if no filter is set.
             * @type {string}
             * @package
             */
            embossFilterId: string;
    
            /**
             * The ID of the disabled pattern, or the empty string if no pattern is set.
             * @type {string}
             * @package
             */
            disabledPatternId: string;
    
            /**
             * The ID of the debug filter, or the empty string if no pattern is set.
             * @type {string}
             * @package
             */
            debugFilterId: string;
    
            /**
             * Cursor colour.
             * @type {string}
             * @package
             */
            CURSOR_COLOUR: string;
    
            /**
             * Immovable marker colour.
             * @type {string}
             * @package
             */
            MARKER_COLOUR: string;
    
            /**
             * Width of the horizontal cursor.
             * @type {number}
             * @package
             */
            CURSOR_WS_WIDTH: number;
    
            /**
             * Height of the horizontal cursor.
             * @type {number}
             * @package
             */
            WS_CURSOR_HEIGHT: number;
    
            /**
             * Padding around a stack.
             * @type {number}
             * @package
             */
            CURSOR_STACK_PADDING: number;
    
            /**
             * Padding around a block.
             * @type {number}
             * @package
             */
            CURSOR_BLOCK_PADDING: number;
    
            /**
             * Stroke of the cursor.
             * @type {number}
             * @package
             */
            CURSOR_STROKE_WIDTH: number;
    
            /**
             * Whether text input and colour fields fill up the entire source block.
             * @type {boolean}
             * @package
             */
            FULL_BLOCK_FIELDS: boolean;
    
            /**
             * The main colour of insertion markers, in hex.  The block is rendered a
             * transparent grey by changing the fill opacity in CSS.
             * @type {string}
             * @package
             */
            INSERTION_MARKER_COLOUR: string;
    
            /**
             * The insertion marker opacity.
             * @type {number}
             * @package
             */
            INSERTION_MARKER_OPACITY: number;
    
            /**
             * Enum for connection shapes.
             * @enum {number}
             */
            SHAPES: any /*missing*/;
    
            /**
             * Initialize shape objects based on the constants set in the constructor.
             * @package
             */
            init(): void;
    
            /**
             * An object containing sizing and path information about collapsed block
             * indicators.
             * @type {!Object}
             */
            JAGGED_TEETH: Object;
    
            /**
             * An object containing sizing and path information about notches.
             * @type {!Object}
             */
            NOTCH: Object;
    
            /**
             * An object containing sizing and path information about start hats
             * @type {!Object}
             */
            START_HAT: Object;
    
            /**
             * An object containing sizing and path information about puzzle tabs.
             * @type {!Object}
             */
            PUZZLE_TAB: Object;
    
            /**
             * An object containing sizing and path information about inside corners
             * @type {!Object}
             */
            INSIDE_CORNERS: Object;
    
            /**
             * An object containing sizing and path information about outside corners.
             * @type {!Object}
             */
            OUTSIDE_CORNERS: Object;
    
            /**
             * Refresh constants properties that depend on the theme.
             * @param {!Blockly.Theme} theme The current workspace theme.
             * @package
             */
            setTheme(theme: Blockly.Theme): void;
    
            /**
             * The block styles map.
             * @type {Object.<string, Blockly.Theme.BlockStyle>}
             * @package
             */
            blockStyles: { [key: string]: Blockly.Theme.BlockStyle };
    
            /**
             * Sets dynamic properties that depend on other values or theme properties.
             * @param {!Blockly.Theme} theme The current workspace theme.
             * @protected
             */
            setDynamicProperties_(theme: Blockly.Theme): void;
    
            /**
             * Set constants related to fonts.
             * @param {!Blockly.Theme} theme The current workspace theme.
             * @protected
             */
            setFontConstants_(theme: Blockly.Theme): void;
    
            /**
             * Set constants from a theme's component styles.
             * @param {!Blockly.Theme} theme The current workspace theme.
             * @protected
             */
            setComponentConstants_(theme: Blockly.Theme): void;
    
            /**
             * Get or create a block style based on a single colour value.  Generate a name
             * for the style based on the colour.
             * @param {string} colour #RRGGBB colour string.
             * @return {{style: !Blockly.Theme.BlockStyle, name: string}} An object
             *     containing the style and an autogenerated name for that style.
             * @package
             */
            getBlockStyleForColour(colour: string): { style: Blockly.Theme.BlockStyle; name: string };
    
            /**
             * Gets the BlockStyle for the given block style name.
             * @param {?string} blockStyleName The name of the block style.
             * @return {!Blockly.Theme.BlockStyle} The named block style, or a default style
             *     if no style with the given name was found.
             */
            getBlockStyle(blockStyleName: string): Blockly.Theme.BlockStyle;
    
            /**
             * Create a block style object based on the given colour.
             * @param {string} colour #RRGGBB colour string.
             * @return {!Blockly.Theme.BlockStyle} A populated block style based on the
             *     given colour.
             * @protected
             */
            createBlockStyle_(colour: string): Blockly.Theme.BlockStyle;
    
            /**
             * Get a full block style object based on the input style object.  Populate
             * any missing values.
             * @param {{
             *     colourPrimary:string,
             *     colourSecondary:(string|undefined),
             *     colourTertiary:(string|undefined),
             *     hat:(string|undefined)
             * }} blockStyle A full or partial block style object.
            
             * @return {!Blockly.Theme.BlockStyle} A full block style object, with all
             *     required properties populated.
             * @protected
             */
            validatedBlockStyle_(blockStyle: { colourPrimary: string; colourSecondary: string|any /*undefined*/; colourTertiary: string|any /*undefined*/; hat: string|any /*undefined*/ }): Blockly.Theme.BlockStyle;
    
            /**
             * Generate a secondary colour from the passed in primary colour.
             * @param {string} colour Primary colour.
             * @return {string} The generated secondary colour.
             * @protected
             */
            generateSecondaryColour_(colour: string): string;
    
            /**
             * Generate a tertiary colour from the passed in primary colour.
             * @param {string} colour Primary colour.
             * @return {string} The generated tertiary colour.
             * @protected
             */
            generateTertiaryColour_(colour: string): string;
    
            /**
             * Dispose of this constants provider.
             * Delete all DOM elements that this provider created.
             * @package
             */
            dispose(): void;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     collapsed block indicators.
             * @package
             */
            makeJaggedTeeth(): Object;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     start hats.
             * @package
             */
            makeStartHat(): Object;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     puzzle tabs.
             * @package
             */
            makePuzzleTab(): Object;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     notches.
             * @package
             */
            makeNotch(): Object;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     inside corners.
             * @package
             */
            makeInsideCorners(): Object;
    
            /**
             * @return {!Object} An object containing sizing and path information about
             *     outside corners.
             * @package
             */
            makeOutsideCorners(): Object;
    
            /**
             * Get an object with connection shape and sizing information based on the type
             * of the connection.
             * @param {!Blockly.RenderedConnection} connection The connection to find a
             *     shape object for
             * @return {!Object} The shape object for the connection.
             * @package
             */
            shapeFor(connection: Blockly.RenderedConnection): Object;
    
            /**
             * Create any DOM elements that this renderer needs (filters, patterns, etc).
             * @param {!SVGElement} svg The root of the workspace's SVG.
             * @param {string} tagName The name to use for the CSS style tag.
             * @param {string} selector The CSS selector to use.
             * @suppress {strictModuleDepCheck} Debug renderer only included in playground.
             * @package
             */
            createDom(svg: SVGElement, tagName: string, selector: string): void;
    
            /**
             * Inject renderer specific CSS into the page.
             * @param {string} tagName The name of the style tag to use.
             * @param {string} selector The CSS selector to use.
             * @protected
             */
            injectCSS_(tagName: string, selector: string): void;
    
            /**
             * Get any renderer specific CSS to inject when the renderer is initialized.
             * @param {string} selector CSS selector to use.
             * @return {!Array.<string>} Array of CSS strings.
             * @protected
             */
            getCSS_(selector: string): string[];
    } 
    
}


declare module Blockly.blockRendering {

    class Debug extends Debug__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Debug__Class  { 
    
            /**
             * An object that renders rectangles and dots for debugging rendering code.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The renderer's
             *     constants.
             * @package
             * @constructor
             */
            constructor(constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * Remove all elements the this object created on the last pass.
             * @package
             */
            clearElems(): void;
    
            /**
             * Draw a debug rectangle for a spacer (empty) row.
             * @param {!Blockly.blockRendering.Row} row The row to render.
             * @param {number} cursorY The y position of the top of the row.
             * @param {boolean} isRtl Whether the block is rendered RTL.
             * @package
             */
            drawSpacerRow(row: Blockly.blockRendering.Row, cursorY: number, isRtl: boolean): void;
    
            /**
             * Draw a debug rectangle for a horizontal spacer.
             * @param {!Blockly.blockRendering.InRowSpacer} elem The spacer to render.
             * @param {number} rowHeight The height of the container row.
             * @param {boolean} isRtl Whether the block is rendered RTL.
             * @package
             */
            drawSpacerElem(elem: Blockly.blockRendering.InRowSpacer, rowHeight: number, isRtl: boolean): void;
    
            /**
             * Draw a debug rectangle for an in-row element.
             * @param {!Blockly.blockRendering.Measurable} elem The element to render.
             * @param {boolean} isRtl Whether the block is rendered RTL.
             * @package
             */
            drawRenderedElem(elem: Blockly.blockRendering.Measurable, isRtl: boolean): void;
    
            /**
             * Draw a circle at the location of the given connection.  Inputs and outputs
             * share the same colours, as do previous and next.  When positioned correctly
             * a connected pair will look like a bullseye.
             * @param {Blockly.RenderedConnection} conn The connection to circle.
             * @suppress {visibility} Suppress visibility of conn.offsetInBlock_ since this
             *     is a debug module.
             * @package
             */
            drawConnection(conn: Blockly.RenderedConnection): void;
    
            /**
             * Draw a debug rectangle for a non-empty row.
             * @param {!Blockly.blockRendering.Row} row The non-empty row to render.
             * @param {number} cursorY The y position of the top of the row.
             * @param {boolean} isRtl Whether the block is rendered RTL.
             * @package
             */
            drawRenderedRow(row: Blockly.blockRendering.Row, cursorY: number, isRtl: boolean): void;
    
            /**
             * Draw debug rectangles for a non-empty row and all of its subcomponents.
             * @param {!Blockly.blockRendering.Row} row The non-empty row to render.
             * @param {number} cursorY The y position of the top of the row.
             * @param {boolean} isRtl Whether the block is rendered RTL.
             * @package
             */
            drawRowWithElements(row: Blockly.blockRendering.Row, cursorY: number, isRtl: boolean): void;
    
            /**
             * Draw a debug rectangle around the entire block.
             * @param {!Blockly.blockRendering.RenderInfo} info Rendering information about
             *     the block to debug.
             * @package
             */
            drawBoundingBox(info: Blockly.blockRendering.RenderInfo): void;
    
            /**
             * Do all of the work to draw debug information for the whole block.
             * @param {!Blockly.BlockSvg} block The block to draw debug information for.
             * @param {!Blockly.blockRendering.RenderInfo} info Rendering information about
             *     the block to debug.
             * @package
             */
            drawDebug(block: Blockly.BlockSvg, info: Blockly.blockRendering.RenderInfo): void;
    
            /**
             * Show a debug filter to highlight that a block has been rendered.
             * @param {!SVGElement} svgPath The block's svg path.
             * @package
             */
            drawRender(svgPath: SVGElement): void;
    } 
    
}

declare module Blockly.blockRendering.Debug {

    /**
     * Configuration object containing booleans to enable and disable debug
     * rendering of specific rendering components.
     * @type {!Object.<string, boolean>}
     */
    var config: { [key: string]: boolean };
}


declare module Blockly.blockRendering {

    class Drawer extends Drawer__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Drawer__Class  { 
    
            /**
             * An object that draws a block based on the given rendering information.
             * @param {!Blockly.BlockSvg} block The block to render.
             * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
             *   information needed to render this block.
             * @package
             * @constructor
             */
            constructor(block: Blockly.BlockSvg, info: Blockly.blockRendering.RenderInfo);
    
            /**
             * The renderer's constant provider.
             * @type {!Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    
            /**
             * Draw the block to the workspace. Here "drawing" means setting SVG path
             * elements and moving fields, icons, and connections on the screen.
             *
             * The pieces of the paths are pushed into arrays of "steps", which are then
             * joined with spaces and set directly on the block.  This guarantees that
             * the steps are separated by spaces for improved readability, but isn't
             * required.
             * @package
             */
            draw(): void;
    
            /**
             * Save sizing information back to the block
             * Most of the rendering information can be thrown away at the end of the
             * render. Anything that needs to be kept around should be set in this function.
             * @protected
             */
            recordSizeOnBlock_(): void;
    
            /**
             * Hide icons that were marked as hidden.
             * @protected
             */
            hideHiddenIcons_(): void;
    
            /**
             * Create the outline of the block.  This is a single continuous path.
             * @protected
             */
            drawOutline_(): void;
    
            /**
             * Add steps for the top corner of the block, taking into account
             * details such as hats and rounded corners.
             * @protected
             */
            drawTop_(): void;
    
            /**
             * Add steps for the jagged edge of a row on a collapsed block.
             * @param {!Blockly.blockRendering.Row} row The row to draw the side of.
             * @protected
             */
            drawJaggedEdge_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Add steps for an external value input, rendered as a notch in the side
             * of the block.
             * @param {!Blockly.blockRendering.Row} row The row that this input
             *     belongs to.
             * @protected
             */
            drawValueInput_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Add steps for a statement input.
             * @param {!Blockly.blockRendering.Row} row The row that this input
             *     belongs to.
             * @protected
             */
            drawStatementInput_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Add steps for the right side of a row that does not have value or
             * statement input connections.
             * @param {!Blockly.blockRendering.Row} row The row to draw the
             *     side of.
             * @protected
             */
            drawRightSideRow_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Add steps for the bottom edge of a block, possibly including a notch
             * for the next connection
             * @protected
             */
            drawBottom_(): void;
    
            /**
             * Add steps for the left side of the block, which may include an output
             * connection
             * @protected
             */
            drawLeft_(): void;
    
            /**
             * Draw the internals of the block: inline inputs, fields, and icons.  These do
             * not depend on the outer path for placement.
             * @protected
             */
            drawInternals_(): void;
    
            /**
             * Push a field or icon's new position to its SVG root.
             * @param {!Blockly.blockRendering.Icon|!Blockly.blockRendering.Field} fieldInfo
             *     The rendering information for the field or icon.
             * @protected
             */
            layoutField_(fieldInfo: Blockly.blockRendering.Icon|Blockly.blockRendering.Field): void;
    
            /**
             * Add steps for an inline input.
             * @param {!Blockly.blockRendering.InlineInput} input The information about the
             * input to render.
             * @protected
             */
            drawInlineInput_(input: Blockly.blockRendering.InlineInput): void;
    
            /**
             * Position the connection on an inline value input, taking into account
             * RTL and the small gap between the parent block and child block which lets the
             * parent block's dark path show through.
             * @param {Blockly.blockRendering.InlineInput} input The information about
             * the input that the connection is on.
             * @protected
             */
            positionInlineInputConnection_(input: Blockly.blockRendering.InlineInput): void;
    
            /**
             * Position the connection on a statement input, taking into account
             * RTL and the small gap between the parent block and child block which lets the
             * parent block's dark path show through.
             * @param {!Blockly.blockRendering.Row} row The row that the connection is on.
             * @protected
             */
            positionStatementInputConnection_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Position the connection on an external value input, taking into account
             * RTL and the small gap between the parent block and child block which lets the
             * parent block's dark path show through.
             * @param {!Blockly.blockRendering.Row} row The row that the connection is on.
             * @protected
             */
            positionExternalValueConnection_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Position the previous connection on a block.
             * @protected
             */
            positionPreviousConnection_(): void;
    
            /**
             * Position the next connection on a block.
             * @protected
             */
            positionNextConnection_(): void;
    
            /**
             * Position the output connection on a block.
             * @protected
             */
            positionOutputConnection_(): void;
    } 
    
}


declare module Blockly.blockRendering {

    interface IPathObject {
    
        /**
          * The primary path of the block.
          * @type {!SVGElement}
          */
        svgPath: SVGElement;
    
        /**
          * The renderer's constant provider.
          * @type {!Blockly.blockRendering.ConstantProvider}
          */
        constants: Blockly.blockRendering.ConstantProvider;
    
        /**
          * The primary path of the block.
          * @type {!Blockly.Theme.BlockStyle}
          */
        style: Blockly.Theme.BlockStyle;
    
        /**
          * Holds the cursors svg element when the cursor is attached to the block.
          * This is null if there is no cursor on the block.
          * @type {SVGElement}
          */
        cursorSvg: SVGElement;
    
        /**
          * Holds the markers svg element when the marker is attached to the block.
          * This is null if there is no marker on the block.
          * @type {SVGElement}
          */
        markerSvg: SVGElement;
    
        /**
          * Set the path generated by the renderer onto the respective SVG element.
          * @param {string} pathString The path.
          * @package
          */
        setPath(pathString: string): void;
    
        /**
          * Apply the stored colours to the block's path, taking into account whether
          * the paths belong to a shadow block.
          * @param {!Blockly.Block} block The source block.
          * @package
          */
        applyColour(block: Blockly.Block): void;
    
        /**
          * Update the style.
          * @param {!Blockly.Theme.BlockStyle} blockStyle The block style to use.
          * @package
          */
        setStyle(blockStyle: Blockly.Theme.BlockStyle): void;
    
        /**
          * Flip the SVG paths in RTL.
          * @package
          */
        flipRTL: any /*missing*/;
    
        /**
          * Add the cursor svg to this block's svg group.
          * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
          *     block svg group.
          * @package
          */
        setCursorSvg(cursorSvg: SVGElement): void;
    
        /**
          * Add the marker svg to this block's svg group.
          * @param {SVGElement} markerSvg The svg root of the marker to be added to the
          *     block svg group.
          * @package
          */
        setMarkerSvg(markerSvg: SVGElement): void;
    
        /**
          * Set whether the block shows a highlight or not.  Block highlighting is
          * often used to visually mark blocks currently being executed.
          * @param {boolean} highlighted True if highlighted.
          * @package
          */
        updateHighlighted(highlighted: boolean): void;
    
        /**
          * Add or remove styling showing that a block is selected.
          * @param {boolean} enable True if selection is enabled, false otherwise.
          * @package
          */
        updateSelected(enable: boolean): void;
    
        /**
          * Add or remove styling showing that a block is dragged over a delete area.
          * @param {boolean} enable True if the block is being dragged over a delete
          *     area, false otherwise.
          * @package
          */
        updateDraggingDelete(enable: boolean): void;
    
        /**
          * Add or remove styling showing that a block is an insertion marker.
          * @param {boolean} enable True if the block is an insertion marker, false
          *     otherwise.
          * @package
          */
        updateInsertionMarker(enable: boolean): void;
    
        /**
          * Add or remove styling showing that a block is movable.
          * @param {boolean} enable True if the block is movable, false otherwise.
          * @package
          */
        updateMovable(enable: boolean): void;
    
        /**
          * Add or remove styling that shows that if the dragging block is dropped, this
          * block will be replaced.  If a shadow block, it will disappear.  Otherwise it
          * will bump.
          * @param {boolean} enable True if styling should be added.
          * @package
          */
        updateReplacementFade(enable: boolean): void;
    }
}


declare module Blockly.blockRendering {

    class RenderInfo extends RenderInfo__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class RenderInfo__Class  { 
    
            /**
             * An object containing all sizing information needed to draw this block.
             *
             * This measure pass does not propagate changes to the block (although fields
             * may choose to rerender when getSize() is called).  However, calling it
             * repeatedly may be expensive.
             *
             * @param {!Blockly.blockRendering.Renderer} renderer The renderer in use.
             * @param {!Blockly.BlockSvg} block The block to measure.
             * @constructor
             * @package
             */
            constructor(renderer: Blockly.blockRendering.Renderer, block: Blockly.BlockSvg);
    
            /**
             * The block renderer in use.
             * @type {!Blockly.blockRendering.Renderer}
             * @protected
             */
            renderer_: Blockly.blockRendering.Renderer;
    
            /**
             * The renderer's constant provider.
             * @type {!Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    
            /**
             * A measurable representing the output connection if the block has one.
             * Otherwise null.
             * @type {Blockly.blockRendering.OutputConnection}
             */
            outputConnection: Blockly.blockRendering.OutputConnection;
    
            /**
             * Whether the block should be rendered as a single line, either because it's
             * inline or because it has been collapsed.
             * @type {boolean}
             */
            isInline: boolean;
    
            /**
             * Whether the block is collapsed.
             * @type {boolean}
             */
            isCollapsed: boolean;
    
            /**
             * Whether the block is an insertion marker.  Insertion markers are the same
             * shape as normal blocks, but don't show fields.
             * @type {boolean}
             */
            isInsertionMarker: boolean;
    
            /**
             * True if the block should be rendered right-to-left.
             * @type {boolean}
             */
            RTL: boolean;
    
            /**
             * The height of the rendered block, including child blocks.
             * @type {number}
             */
            height: number;
    
            /**
             * The width of the rendered block, including child blocks.
             * @type {number}
             */
            widthWithChildren: number;
    
            /**
             * The width of the rendered block, excluding child blocks.  This is the right
             * edge of the block when rendered LTR.
             * @type {number}
             */
            width: number;
    
            /**
             *
             * @type {number}
             */
            statementEdge: number;
    
            /**
             * An array of Row objects containing sizing information.
             * @type {!Array.<!Blockly.blockRendering.Row>}
             */
            rows: Blockly.blockRendering.Row[];
    
            /**
             * An array of input rows on the block.
             * @type {!Array.<!Blockly.blockRendering.InputRow>}
             */
            inputRows: Blockly.blockRendering.InputRow[];
    
            /**
             * An array of measurable objects containing hidden icons.
             * @type {!Array.<!Blockly.blockRendering.Icon>}
             */
            hiddenIcons: Blockly.blockRendering.Icon[];
    
            /**
             * An object with rendering information about the top row of the block.
             * @type {!Blockly.blockRendering.TopRow}
             */
            topRow: Blockly.blockRendering.TopRow;
    
            /**
             * An object with rendering information about the bottom row of the block.
             * @type {!Blockly.blockRendering.BottomRow}
             */
            bottomRow: Blockly.blockRendering.BottomRow;
    
            /**
             * Get the block renderer in use.
             * @return {!Blockly.blockRendering.Renderer} The block renderer in use.
             * @package
             */
            getRenderer(): Blockly.blockRendering.Renderer;
    
            /**
             * Populate and return an object containing all sizing information needed to
             * draw this block.
             *
             * This measure pass does not propagate changes to the block (although fields
             * may choose to rerender when getSize() is called).  However, calling it
             * repeatedly may be expensive.
             *
             * @package
             */
            measure(): void;
    
            /**
             * Create rows of Measurable objects representing all renderable parts of the
             * block.
             * @protected
             */
            createRows_(): void;
    
            /**
             * Create all non-spacer elements that belong on the top row.
             * @package
             */
            populateTopRow_(): void;
    
            /**
             * Create all non-spacer elements that belong on the bottom row.
             * @package
             */
            populateBottomRow_(): void;
    
            /**
             * Add an input element to the active row, if needed, and record the type of the
             * input on the row.
             * @param {!Blockly.Input} input The input to record information about.
             * @param {!Blockly.blockRendering.Row} activeRow The row that is currently being
             *     populated.
             * @protected
             */
            addInput_(input: Blockly.Input, activeRow: Blockly.blockRendering.Row): void;
    
            /**
             * Decide whether to start a new row between the two Blockly.Inputs.
             * @param {!Blockly.Input} input The first input to consider
             * @param {Blockly.Input} lastInput The input that follows.
             * @return {boolean} True if the next input should be rendered on a new row.
             * @protected
             */
            shouldStartNewRow_(input: Blockly.Input, lastInput: Blockly.Input): boolean;
    
            /**
             * Add horizontal spacing between and around elements within each row.
             * @protected
             */
            addElemSpacing_(): void;
    
            /**
             * Calculate the width of a spacer element in a row based on the previous and
             * next elements in that row.  For instance, extra padding is added between two
             * editable fields.
             * @param {Blockly.blockRendering.Measurable} prev The element before the
             *     spacer.
             * @param {Blockly.blockRendering.Measurable} next The element after the spacer.
             * @return {number} The size of the spacing between the two elements.
             * @protected
             */
            getInRowSpacing_(prev: Blockly.blockRendering.Measurable, next: Blockly.blockRendering.Measurable): number;
    
            /**
             * Figure out where the right edge of the block and right edge of statement inputs
             * should be placed.
             * @protected
             */
            computeBounds_(): void;
    
            /**
             * Extra spacing may be necessary to make sure that the right sides of all
             * rows line up.  This can only be calculated after a first pass to calculate
             * the sizes of all rows.
             * @protected
             */
            alignRowElements_(): void;
    
            /**
             * Calculate the desired width of an input row.
             * @param {!Blockly.blockRendering.Row} _row The input row.
             * @return {number} The desired width of the input row.
             * @protected
             */
            getDesiredRowWidth_(_row: Blockly.blockRendering.Row): number;
    
            /**
             * Modify the given row to add the given amount of padding around its fields.
             * The exact location of the padding is based on the alignment property of the
             * last input in the field.
             * @param {Blockly.blockRendering.Row} row The row to add padding to.
             * @param {number} missingSpace How much padding to add.
             * @protected
             */
            addAlignmentPadding_(row: Blockly.blockRendering.Row, missingSpace: number): void;
    
            /**
             * Align the elements of a statement row based on computed bounds.
             * Unlike other types of rows, statement rows add space in multiple places.
             * @param {!Blockly.blockRendering.InputRow} row The statement row to resize.
             * @protected
             */
            alignStatementRow_(row: Blockly.blockRendering.InputRow): void;
    
            /**
             * Add spacers between rows and set their sizes.
             * @protected
             */
            addRowSpacing_(): void;
    
            /**
             * Create a spacer row to go between prev and next, and set its size.
             * @param {!Blockly.blockRendering.Row} prev The previous row.
             * @param {!Blockly.blockRendering.Row} next The next row.
             * @return {!Blockly.blockRendering.SpacerRow} The newly created spacer row.
             * @protected
             */
            makeSpacerRow_(prev: Blockly.blockRendering.Row, next: Blockly.blockRendering.Row): Blockly.blockRendering.SpacerRow;
    
            /**
             * Calculate the width of a spacer row.
             * @param {!Blockly.blockRendering.Row} _prev The row before the spacer.
             * @param {!Blockly.blockRendering.Row} _next The row after the spacer.
             * @return {number} The desired width of the spacer row between these two rows.
             * @protected
             */
            getSpacerRowWidth_(_prev: Blockly.blockRendering.Row, _next: Blockly.blockRendering.Row): number;
    
            /**
             * Calculate the height of a spacer row.
             * @param {!Blockly.blockRendering.Row} _prev The row before the spacer.
             * @param {!Blockly.blockRendering.Row} _next The row after the spacer.
             * @return {number} The desired height of the spacer row between these two rows.
             * @protected
             */
            getSpacerRowHeight_(_prev: Blockly.blockRendering.Row, _next: Blockly.blockRendering.Row): number;
    
            /**
             * Calculate the centerline of an element in a rendered row.
             * This base implementation puts the centerline at the middle of the row
             * vertically, with no special cases.  You will likely need extra logic to
             * handle (at minimum) top and bottom rows.
             * @param {!Blockly.blockRendering.Row} row The row containing the element.
             * @param {!Blockly.blockRendering.Measurable} elem The element to place.
             * @return {number} The desired centerline of the given element, as an offset
             *     from the top left of the block.
             * @protected
             */
            getElemCenterline_(row: Blockly.blockRendering.Row, elem: Blockly.blockRendering.Measurable): number;
    
            /**
             * Record final position information on elements on the given row, for use in
             * drawing.  At minimum this records xPos and centerline on each element.
             * @param {!Blockly.blockRendering.Row} row The row containing the elements.
             * @protected
             */
            recordElemPositions_(row: Blockly.blockRendering.Row): void;
    
            /**
             * Make any final changes to the rendering information object.  In particular,
             * store the y position of each row, and record the height of the full block.
             * @protected
             */
            finalize_(): void;
    } 
    
}


declare module Blockly.blockRendering {

    class MarkerSvg extends MarkerSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class MarkerSvg__Class  { 
    
            /**
             * Class for a marker.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The constants for
             *     the renderer.
             * @param {!Blockly.Marker} marker The marker to draw.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, constants: Blockly.blockRendering.ConstantProvider, marker: Blockly.Marker);
    
            /**
             * The constants necessary to draw the marker.
             * @type {Blockly.blockRendering.ConstantProvider}
             * @protected
             */
            constants_: Blockly.blockRendering.ConstantProvider;
    
            /**
             * The current SVG element for the marker.
             * @type {Element}
             */
            currentMarkerSvg: Element;
    
            /**
             * The colour of the marker.
             * @type {string}
             */
            colour_: string;
    
            /**
             * Return the root node of the SVG or null if none exists.
             * @return {SVGElement} The root SVG node.
             */
            getSvgRoot(): SVGElement;
    
            /**
             * Get the marker.
             * @return {!Blockly.Marker} The marker to draw for.
             */
            getMarker(): Blockly.Marker;
    
            /**
             * True if the marker should be drawn as a cursor, false otherwise.
             * A cursor is drawn as a flashing line. A marker is drawn as a solid line.
             * @return {boolean} True if the marker is a cursor, false otherwise.
             */
            isCursor(): boolean;
    
            /**
             * Create the DOM element for the marker.
             * @return {!SVGElement} The marker controls SVG group.
             * @package
             */
            createDom(): SVGElement;
    
            /**
             * Attaches the SVG root of the marker to the SVG group of the parent.
             * @param {!Blockly.IASTNodeLocationSvg} newParent The workspace, field, or
             *     block that the marker SVG element should be attached to.
             * @protected
             */
            setParent_(newParent: Blockly.IASTNodeLocationSvg): void;
    
            /**
             * Update the marker.
             * @param {Blockly.ASTNode} oldNode The previous node the marker was on or null.
             * @param {Blockly.ASTNode} curNode The node that we want to draw the marker for.
             */
            draw(oldNode: Blockly.ASTNode, curNode: Blockly.ASTNode): void;
    
            /**
             * Update the marker's visible state based on the type of curNode..
             * @param {!Blockly.ASTNode} curNode The node that we want to draw the marker for.
             * @protected
             */
            showAtLocation_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a block.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithBlock_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a previous connection.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithPrevious_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for an output connection.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithOutput_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a workspace coordinate.
             * This is a horizontal line.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithCoordinates_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a field.
             * This is a box around the field.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithField_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for an input.
             * This is a puzzle piece.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithInput_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a next connection.
             * This is a horizontal line.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithNext_(curNode: Blockly.ASTNode): void;
    
            /**
             * Position and display the marker for a stack.
             * This is a box with extra padding around the entire stack of blocks.
             * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
             * @protected
             */
            showWithStack_(curNode: Blockly.ASTNode): void;
    
            /**
             * Show the current marker.
             * @protected
             */
            showCurrent_(): void;
    
            /**
             * Position the marker for a block.
             * Displays an outline of the top half of a rectangle around a block.
             * @param {number} width The width of the block.
             * @param {number} markerOffset The extra padding for around the block.
             * @param {number} markerHeight The height of the marker.
             * @protected
             */
            positionBlock_(width: number, markerOffset: number, markerHeight: number): void;
    
            /**
             * Position the marker for an input connection.
             * Displays a filled in puzzle piece.
             * @param {!Blockly.RenderedConnection} connection The connection to position
             *     marker around.
             * @protected
             */
            positionInput_(connection: Blockly.RenderedConnection): void;
    
            /**
             * Move and show the marker at the specified coordinate in workspace units.
             * Displays a horizontal line.
             * @param {number} x The new x, in workspace units.
             * @param {number} y The new y, in workspace units.
             * @param {number} width The new width, in workspace units.
             * @protected
             */
            positionLine_(x: number, y: number, width: number): void;
    
            /**
             * Position the marker for an output connection.
             * Displays a puzzle outline and the top and bottom path.
             * @param {number} width The width of the block.
             * @param {number} height The height of the block.
             * @param {!Object} connectionShape The shape object for the connection.
             * @protected
             */
            positionOutput_(width: number, height: number, connectionShape: Object): void;
    
            /**
             * Position the marker for a previous connection.
             * Displays a half rectangle with a notch in the top to represent the previous
             * connection.
             * @param {number} width The width of the block.
             * @param {number} markerOffset The offset of the marker from around the block.
             * @param {number} markerHeight The height of the marker.
             * @param {!Object} connectionShape The shape object for the connection.
             * @protected
             */
            positionPrevious_(width: number, markerOffset: number, markerHeight: number, connectionShape: Object): void;
    
            /**
             * Move and show the marker at the specified coordinate in workspace units.
             * Displays a filled in rectangle.
             * @param {number} x The new x, in workspace units.
             * @param {number} y The new y, in workspace units.
             * @param {number} width The new width, in workspace units.
             * @param {number} height The new height, in workspace units.
             * @protected
             */
            positionRect_(x: number, y: number, width: number, height: number): void;
    
            /**
             * Hide the marker.
             */
            hide(): void;
    
            /**
             * Get the properties to make a marker blink.
             * @return {!Object} The object holding attributes to make the marker blink.
             * @protected
             */
            getBlinkProperties_(): Object;
    
            /**
             * Create the marker SVG.
             * @return {Element} The SVG node created.
             * @protected
             */
            createDomInternal_(): Element;
    
            /**
             * Apply the marker's colour.
             * @param {!Blockly.ASTNode} _curNode The node that we want to draw the marker
             *    for.
             * @protected
             */
            applyColour_(_curNode: Blockly.ASTNode): void;
    
            /**
             * Dispose of this marker.
             */
            dispose(): void;
    } 
    
}

declare module Blockly.blockRendering.MarkerSvg {

    /**
     * The name of the CSS class for a cursor.
     * @const {string}
     */
    var CURSOR_CLASS: any /*missing*/;

    /**
     * The name of the CSS class for a marker.
     * @const {string}
     */
    var MARKER_CLASS: any /*missing*/;

    /**
     * What we multiply the height by to get the height of the marker.
     * Only used for the block and block connections.
     * @const {number}
     */
    var HEIGHT_MULTIPLIER: any /*missing*/;
}


declare module Blockly.blockRendering {

    class PathObject extends PathObject__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class PathObject__Class implements Blockly.blockRendering.IPathObject  { 
    
            /**
             * An object that handles creating and setting each of the SVG elements
             * used by the renderer.
             * @param {!SVGElement} root The root SVG element.
             * @param {!Blockly.Theme.BlockStyle} style The style object to use for
             *     colouring.
             * @param {!Blockly.blockRendering.ConstantProvider} constants The renderer's
             *     constants.
             * @constructor
             * @implements {Blockly.blockRendering.IPathObject}
             * @package
             */
            constructor(root: SVGElement, style: Blockly.Theme.BlockStyle, constants: Blockly.blockRendering.ConstantProvider);
    
            /**
             * The renderer's constant provider.
             * @type {!Blockly.blockRendering.ConstantProvider}
             * @package
             */
            constants: Blockly.blockRendering.ConstantProvider;
    
            /**
             * The primary path of the block.
             * @type {!SVGElement}
             * @package
             */
            svgPath: SVGElement;
    
            /**
             * The style object to use when colouring block paths.
             * @type {!Blockly.Theme.BlockStyle}
             * @package
             */
            style: Blockly.Theme.BlockStyle;
    
            /**
             * Holds the cursors svg element when the cursor is attached to the block.
             * This is null if there is no cursor on the block.
             * @type {SVGElement}
             * @package
             */
            cursorSvg: SVGElement;
    
            /**
             * Holds the markers svg element when the marker is attached to the block.
             * This is null if there is no marker on the block.
             * @type {SVGElement}
             * @package
             */
            markerSvg: SVGElement;
    
            /**
             * Set the path generated by the renderer onto the respective SVG element.
             * @param {string} pathString The path.
             * @package
             */
            setPath(pathString: string): void;
    
            /**
             * Flip the SVG paths in RTL.
             * @package
             */
            flipRTL(): void;
    
            /**
             * Add the cursor svg to this block's svg group.
             * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
             *     block svg group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker svg to this block's svg group.
             * @param {SVGElement} markerSvg The svg root of the marker to be added to the
             *     block svg group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Apply the stored colours to the block's path, taking into account whether
             * the paths belong to a shadow block.
             * @param {!Blockly.Block} block The source block.
             * @package
             */
            applyColour(block: Blockly.Block): void;
    
            /**
             * Set the style.
             * @param {!Blockly.Theme.BlockStyle} blockStyle The block style to use.
             * @package
             */
            setStyle(blockStyle: Blockly.Theme.BlockStyle): void;
    
            /**
             * Add or remove the given CSS class on the path object's root SVG element.
             * @param {string} className The name of the class to add or remove
             * @param {boolean} add True if the class should be added.  False if it should
             *     be removed.
             * @protected
             */
            setClass_(className: string, add: boolean): void;
    
            /**
             * Set whether the block shows a highlight or not.  Block highlighting is
             * often used to visually mark blocks currently being executed.
             * @param {boolean} enable True if highlighted.
             * @package
             */
            updateHighlighted(enable: boolean): void;
    
            /**
             * Updates the look of the block to reflect a shadow state.
             * @param {boolean} shadow True if the block is a shadow block.
             * @protected
             */
            updateShadow_(shadow: boolean): void;
    
            /**
             * Updates the look of the block to reflect a disabled state.
             * @param {boolean} disabled True if disabled.
             * @protected
             */
            updateDisabled_(disabled: boolean): void;
    
            /**
             * Add or remove styling showing that a block is selected.
             * @param {boolean} enable True if selection is enabled, false otherwise.
             * @package
             */
            updateSelected(enable: boolean): void;
    
            /**
             * Add or remove styling showing that a block is dragged over a delete area.
             * @param {boolean} enable True if the block is being dragged over a delete
             *     area, false otherwise.
             * @package
             */
            updateDraggingDelete(enable: boolean): void;
    
            /**
             * Add or remove styling showing that a block is an insertion marker.
             * @param {boolean} enable True if the block is an insertion marker, false
             *     otherwise.
             * @package
             */
            updateInsertionMarker(enable: boolean): void;
    
            /**
             * Add or remove styling showing that a block is movable.
             * @param {boolean} enable True if the block is movable, false otherwise.
             * @package
             */
            updateMovable(enable: boolean): void;
    
            /**
             * Add or remove styling that shows that if the dragging block is dropped, this
             * block will be replaced.  If a shadow block, it will disappear.  Otherwise it
             * will bump.
             * @param {boolean} enable True if styling should be added.
             * @package
             */
            updateReplacementFade(enable: boolean): void;
    
            /**
             * Add or remove styling that shows that if the dragging block is dropped, this
             * block will be connected to the input.
             * @param {Blockly.Connection} _conn The connection on the input to highlight.
             * @param {boolean} _enable True if styling should be added.
             * @package
             */
            updateShapeForInputHighlight(_conn: Blockly.Connection, _enable: boolean): void;
    } 
    
}


declare module Blockly.blockRendering {

    class Renderer extends Renderer__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Renderer__Class implements Blockly.IRegistrable  { 
    
            /**
             * The base class for a block renderer.
             * @param {string} name The renderer name.
             * @package
             * @constructor
             * @implements {Blockly.IRegistrable}
             */
            constructor(name: string);
    
            /**
             * The renderer name.
             * @type {string}
             * @package
             */
            name: string;
    
            /**
             * Rendering constant overrides, passed in through options.
             * @type {?Object}
             * @package
             */
            overrides: Object;
    
            /**
             * Gets the class name that identifies this renderer.
             * @return {string} The CSS class name.
             * @package
             */
            getClassName(): string;
    
            /**
             * Initialize the renderer.
             * @param {!Blockly.Theme} theme The workspace theme object.
             * @param {Object=} opt_rendererOverrides Rendering constant overrides.
             * @package
             */
            init(theme: Blockly.Theme, opt_rendererOverrides?: Object): void;
    
            /**
             * Create any DOM elements that this renderer needs.
             * @param {!SVGElement} svg The root of the workspace's SVG.
             * @param {!Blockly.Theme} theme The workspace theme object.
             * @package
             */
            createDom(svg: SVGElement, theme: Blockly.Theme): void;
    
            /**
             * Refresh the renderer after a theme change.
             * @param {!SVGElement} svg The root of the workspace's SVG.
             * @param {!Blockly.Theme} theme The workspace theme object.
             * @package
             */
            refreshDom(svg: SVGElement, theme: Blockly.Theme): void;
    
            /**
             * Dispose of this renderer.
             * Delete all DOM elements that this renderer and its constants created.
             * @package
             */
            dispose(): void;
    
            /**
             * Create a new instance of the renderer's constant provider.
             * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
             * @protected
             */
            makeConstants_(): Blockly.blockRendering.ConstantProvider;
    
            /**
             * Create a new instance of the renderer's render info object.
             * @param {!Blockly.BlockSvg} block The block to measure.
             * @return {!Blockly.blockRendering.RenderInfo} The render info object.
             * @protected
             */
            makeRenderInfo_(block: Blockly.BlockSvg): Blockly.blockRendering.RenderInfo;
    
            /**
             * Create a new instance of the renderer's drawer.
             * @param {!Blockly.BlockSvg} block The block to render.
             * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
             *   information needed to render this block.
             * @return {!Blockly.blockRendering.Drawer} The drawer.
             * @protected
             */
            makeDrawer_(block: Blockly.BlockSvg, info: Blockly.blockRendering.RenderInfo): Blockly.blockRendering.Drawer;
    
            /**
             * Create a new instance of the renderer's debugger.
             * @return {!Blockly.blockRendering.Debug} The renderer debugger.
             * @suppress {strictModuleDepCheck} Debug renderer only included in playground.
             * @protected
             */
            makeDebugger_(): Blockly.blockRendering.Debug;
    
            /**
             * Create a new instance of the renderer's marker drawer.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
             * @param {!Blockly.Marker} marker The marker.
             * @return {!Blockly.blockRendering.MarkerSvg} The object in charge of drawing
             *     the marker.
             * @package
             */
            makeMarkerDrawer(workspace: Blockly.WorkspaceSvg, marker: Blockly.Marker): Blockly.blockRendering.MarkerSvg;
    
            /**
             * Create a new instance of a renderer path object.
             * @param {!SVGElement} root The root SVG element.
             * @param {!Blockly.Theme.BlockStyle} style The style object to use for
             *     colouring.
             * @return {!Blockly.blockRendering.IPathObject} The renderer path object.
             * @package
             */
            makePathObject(root: SVGElement, style: Blockly.Theme.BlockStyle): Blockly.blockRendering.IPathObject;
    
            /**
             * Get the current renderer's constant provider.  We assume that when this is
             * called, the renderer has already been initialized.
             * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
             * @package
             */
            getConstants(): Blockly.blockRendering.ConstantProvider;
    
            /**
             * Determine whether or not to highlight a connection.
             * @param {Blockly.Connection} _conn The connection to determine whether or not
             *     to highlight.
             * @return {boolean} True if we should highlight the connection.
             * @package
             */
            shouldHighlightConnection(_conn: Blockly.Connection): boolean;
    
            /**
             * Checks if an orphaned block can connect to the "end" of the topBlock's
             * block-clump. If the clump is a row the end is the last input. If the clump
             * is a stack, the end is the last next connection. If the clump is neither,
             * then this returns false.
             * @param {!Blockly.BlockSvg} topBlock The top block of the block clump we want to try and
             *     connect to.
             * @param {!Blockly.BlockSvg} orphanBlock The orphan block that wants to find
             *     a home.
             * @param {number} localType The type of the connection being dragged.
             * @return {boolean} Whether there is a home for the orphan or not.
             * @package
             */
            orphanCanConnectAtEnd(topBlock: Blockly.BlockSvg, orphanBlock: Blockly.BlockSvg, localType: number): boolean;
    
            /**
             * Chooses a connection preview method based on the available connection, the
             * current dragged connection, and the block being dragged.
             * @param {!Blockly.RenderedConnection} closest The available connection.
             * @param {!Blockly.RenderedConnection} local The connection currently being
             *     dragged.
             * @param {!Blockly.BlockSvg} topBlock The block currently being dragged.
             * @return {!Blockly.InsertionMarkerManager.PREVIEW_TYPE} The preview type
             *     to display.
             * @package
             */
            getConnectionPreviewMethod(closest: Blockly.RenderedConnection, local: Blockly.RenderedConnection, topBlock: Blockly.BlockSvg): Blockly.InsertionMarkerManager.PREVIEW_TYPE;
    
            /**
             * Render the block.
             * @param {!Blockly.BlockSvg} block The block to render.
             * @package
             */
            render(block: Blockly.BlockSvg): void;
    } 
    
}


declare module Blockly.Msg {

    /** @type {string} */
    var LOGIC_HUE: string;

    /** @type {string} */
    var LOOPS_HUE: string;

    /** @type {string} */
    var MATH_HUE: string;

    /** @type {string} */
    var TEXTS_HUE: string;

    /** @type {string} */
    var LISTS_HUE: string;

    /** @type {string} */
    var COLOUR_HUE: string;

    /** @type {string} */
    var VARIABLES_HUE: string;

    /** @type {string} */
    var VARIABLES_DYNAMIC_HUE: string;

    /** @type {string} */
    var PROCEDURES_HUE: string;

    /** @type {string} */
    var VARIABLES_DEFAULT_NAME: string;

    /** @type {string} */
    var UNNAMED_KEY: string;

    /** @type {string} */
    var TODAY: string;

    /** @type {string} */
    var DUPLICATE_BLOCK: string;

    /** @type {string} */
    var ADD_COMMENT: string;

    /** @type {string} */
    var REMOVE_COMMENT: string;

    /** @type {string} */
    var DUPLICATE_COMMENT: string;

    /** @type {string} */
    var EXTERNAL_INPUTS: string;

    /** @type {string} */
    var INLINE_INPUTS: string;

    /** @type {string} */
    var DELETE_BLOCK: string;

    /** @type {string} */
    var DELETE_X_BLOCKS: string;

    /** @type {string} */
    var DELETE_ALL_BLOCKS: string;

    /** @type {string} */
    var CLEAN_UP: string;

    /** @type {string} */
    var COLLAPSE_BLOCK: string;

    /** @type {string} */
    var COLLAPSE_ALL: string;

    /** @type {string} */
    var EXPAND_BLOCK: string;

    /** @type {string} */
    var EXPAND_ALL: string;

    /** @type {string} */
    var DISABLE_BLOCK: string;

    /** @type {string} */
    var ENABLE_BLOCK: string;

    /** @type {string} */
    var HELP: string;

    /** @type {string} */
    var UNDO: string;

    /** @type {string} */
    var REDO: string;

    /** @type {string} */
    var CHANGE_VALUE_TITLE: string;

    /** @type {string} */
    var RENAME_VARIABLE: string;

    /** @type {string} */
    var RENAME_VARIABLE_TITLE: string;

    /** @type {string} */
    var NEW_VARIABLE: string;

    /** @type {string} */
    var NEW_STRING_VARIABLE: string;

    /** @type {string} */
    var NEW_NUMBER_VARIABLE: string;

    /** @type {string} */
    var NEW_COLOUR_VARIABLE: string;

    /** @type {string} */
    var NEW_VARIABLE_TYPE_TITLE: string;

    /** @type {string} */
    var NEW_VARIABLE_TITLE: string;

    /** @type {string} */
    var VARIABLE_ALREADY_EXISTS: string;

    /** @type {string} */
    var VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE: string;

    /** @type {string} */
    var DELETE_VARIABLE_CONFIRMATION: string;

    /** @type {string} */
    var CANNOT_DELETE_VARIABLE_PROCEDURE: string;

    /** @type {string} */
    var DELETE_VARIABLE: string;

    /** @type {string} */
    var COLOUR_PICKER_HELPURL: string;

    /** @type {string} */
    var COLOUR_PICKER_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_RANDOM_HELPURL: string;

    /** @type {string} */
    var COLOUR_RANDOM_TITLE: string;

    /** @type {string} */
    var COLOUR_RANDOM_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_RGB_HELPURL: string;

    /** @type {string} */
    var COLOUR_RGB_TITLE: string;

    /** @type {string} */
    var COLOUR_RGB_RED: string;

    /** @type {string} */
    var COLOUR_RGB_GREEN: string;

    /** @type {string} */
    var COLOUR_RGB_BLUE: string;

    /** @type {string} */
    var COLOUR_RGB_TOOLTIP: string;

    /** @type {string} */
    var COLOUR_BLEND_HELPURL: string;

    /** @type {string} */
    var COLOUR_BLEND_TITLE: string;

    /** @type {string} */
    var COLOUR_BLEND_COLOUR1: string;

    /** @type {string} */
    var COLOUR_BLEND_COLOUR2: string;

    /** @type {string} */
    var COLOUR_BLEND_RATIO: string;

    /** @type {string} */
    var COLOUR_BLEND_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_REPEAT_HELPURL: string;

    /** @type {string} */
    var CONTROLS_REPEAT_TITLE: string;

    /** @type {string} */
    var CONTROLS_REPEAT_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_REPEAT_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_HELPURL: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_OPERATOR_WHILE: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_OPERATOR_UNTIL: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_TOOLTIP_WHILE: string;

    /** @type {string} */
    var CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL: string;

    /** @type {string} */
    var CONTROLS_FOR_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FOR_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_FOR_TITLE: string;

    /** @type {string} */
    var CONTROLS_FOR_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_FOREACH_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FOREACH_TITLE: string;

    /** @type {string} */
    var CONTROLS_FOREACH_INPUT_DO: string;

    /** @type {string} */
    var CONTROLS_FOREACH_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_HELPURL: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE: string;

    /** @type {string} */
    var CONTROLS_FLOW_STATEMENTS_WARNING: string;

    /** @type {string} */
    var CONTROLS_IF_HELPURL: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_1: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_2: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_3: string;

    /** @type {string} */
    var CONTROLS_IF_TOOLTIP_4: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_IF: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_ELSEIF: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_ELSE: string;

    /** @type {string} */
    var CONTROLS_IF_MSG_THEN: string;

    /** @type {string} */
    var CONTROLS_IF_IF_TITLE_IF: string;

    /** @type {string} */
    var CONTROLS_IF_IF_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_IF_ELSEIF_TITLE_ELSEIF: string;

    /** @type {string} */
    var CONTROLS_IF_ELSEIF_TOOLTIP: string;

    /** @type {string} */
    var CONTROLS_IF_ELSE_TITLE_ELSE: string;

    /** @type {string} */
    var CONTROLS_IF_ELSE_TOOLTIP: string;

    /** @type {string} */
    var IOS_OK: string;

    /** @type {string} */
    var IOS_CANCEL: string;

    /** @type {string} */
    var IOS_ERROR: string;

    /** @type {string} */
    var IOS_PROCEDURES_INPUTS: string;

    /** @type {string} */
    var IOS_PROCEDURES_ADD_INPUT: string;

    /** @type {string} */
    var IOS_PROCEDURES_ALLOW_STATEMENTS: string;

    /** @type {string} */
    var IOS_PROCEDURES_DUPLICATE_INPUTS_ERROR: string;

    /** @type {string} */
    var IOS_VARIABLES_ADD_VARIABLE: string;

    /** @type {string} */
    var IOS_VARIABLES_ADD_BUTTON: string;

    /** @type {string} */
    var IOS_VARIABLES_RENAME_BUTTON: string;

    /** @type {string} */
    var IOS_VARIABLES_DELETE_BUTTON: string;

    /** @type {string} */
    var IOS_VARIABLES_VARIABLE_NAME: string;

    /** @type {string} */
    var IOS_VARIABLES_EMPTY_NAME_ERROR: string;

    /** @type {string} */
    var LOGIC_COMPARE_HELPURL: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_EQ: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_NEQ: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_LT: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_LTE: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_GT: string;

    /** @type {string} */
    var LOGIC_COMPARE_TOOLTIP_GTE: string;

    /** @type {string} */
    var LOGIC_OPERATION_HELPURL: string;

    /** @type {string} */
    var LOGIC_OPERATION_TOOLTIP_AND: string;

    /** @type {string} */
    var LOGIC_OPERATION_AND: string;

    /** @type {string} */
    var LOGIC_OPERATION_TOOLTIP_OR: string;

    /** @type {string} */
    var LOGIC_OPERATION_OR: string;

    /** @type {string} */
    var LOGIC_NEGATE_HELPURL: string;

    /** @type {string} */
    var LOGIC_NEGATE_TITLE: string;

    /** @type {string} */
    var LOGIC_NEGATE_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_HELPURL: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_TRUE: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_FALSE: string;

    /** @type {string} */
    var LOGIC_BOOLEAN_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_NULL_HELPURL: string;

    /** @type {string} */
    var LOGIC_NULL: string;

    /** @type {string} */
    var LOGIC_NULL_TOOLTIP: string;

    /** @type {string} */
    var LOGIC_TERNARY_HELPURL: string;

    /** @type {string} */
    var LOGIC_TERNARY_CONDITION: string;

    /** @type {string} */
    var LOGIC_TERNARY_IF_TRUE: string;

    /** @type {string} */
    var LOGIC_TERNARY_IF_FALSE: string;

    /** @type {string} */
    var LOGIC_TERNARY_TOOLTIP: string;

    /** @type {string} */
    var MATH_NUMBER_HELPURL: string;

    /** @type {string} */
    var MATH_NUMBER_TOOLTIP: string;

    /** @type {string} */
    var MATH_ADDITION_SYMBOL: string;

    /** @type {string} */
    var MATH_SUBTRACTION_SYMBOL: string;

    /** @type {string} */
    var MATH_DIVISION_SYMBOL: string;

    /** @type {string} */
    var MATH_MULTIPLICATION_SYMBOL: string;

    /** @type {string} */
    var MATH_POWER_SYMBOL: string;

    /** @type {string} */
    var MATH_TRIG_SIN: string;

    /** @type {string} */
    var MATH_TRIG_COS: string;

    /** @type {string} */
    var MATH_TRIG_TAN: string;

    /** @type {string} */
    var MATH_TRIG_ASIN: string;

    /** @type {string} */
    var MATH_TRIG_ACOS: string;

    /** @type {string} */
    var MATH_TRIG_ATAN: string;

    /** @type {string} */
    var MATH_ARITHMETIC_HELPURL: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_ADD: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_MINUS: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_MULTIPLY: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_DIVIDE: string;

    /** @type {string} */
    var MATH_ARITHMETIC_TOOLTIP_POWER: string;

    /** @type {string} */
    var MATH_SINGLE_HELPURL: string;

    /** @type {string} */
    var MATH_SINGLE_OP_ROOT: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_ROOT: string;

    /** @type {string} */
    var MATH_SINGLE_OP_ABSOLUTE: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_ABS: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_NEG: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_LN: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_LOG10: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_EXP: string;

    /** @type {string} */
    var MATH_SINGLE_TOOLTIP_POW10: string;

    /** @type {string} */
    var MATH_TRIG_HELPURL: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_SIN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_COS: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_TAN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ASIN: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ACOS: string;

    /** @type {string} */
    var MATH_TRIG_TOOLTIP_ATAN: string;

    /** @type {string} */
    var MATH_CONSTANT_HELPURL: string;

    /** @type {string} */
    var MATH_CONSTANT_TOOLTIP: string;

    /** @type {string} */
    var MATH_IS_EVEN: string;

    /** @type {string} */
    var MATH_IS_ODD: string;

    /** @type {string} */
    var MATH_IS_PRIME: string;

    /** @type {string} */
    var MATH_IS_WHOLE: string;

    /** @type {string} */
    var MATH_IS_POSITIVE: string;

    /** @type {string} */
    var MATH_IS_NEGATIVE: string;

    /** @type {string} */
    var MATH_IS_DIVISIBLE_BY: string;

    /** @type {string} */
    var MATH_IS_TOOLTIP: string;

    /** @type {string} */
    var MATH_CHANGE_HELPURL: string;

    /** @type {string} */
    var MATH_CHANGE_TITLE: string;

    /** @type {string} */
    var MATH_CHANGE_TITLE_ITEM: string;

    /** @type {string} */
    var MATH_CHANGE_TOOLTIP: string;

    /** @type {string} */
    var MATH_ROUND_HELPURL: string;

    /** @type {string} */
    var MATH_ROUND_TOOLTIP: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUND: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUNDUP: string;

    /** @type {string} */
    var MATH_ROUND_OPERATOR_ROUNDDOWN: string;

    /** @type {string} */
    var MATH_ONLIST_HELPURL: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_SUM: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_SUM: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MIN: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MIN: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MAX: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MAX: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_AVERAGE: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_AVERAGE: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MEDIAN: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MEDIAN: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_MODE: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_MODE: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_STD_DEV: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_STD_DEV: string;

    /** @type {string} */
    var MATH_ONLIST_OPERATOR_RANDOM: string;

    /** @type {string} */
    var MATH_ONLIST_TOOLTIP_RANDOM: string;

    /** @type {string} */
    var MATH_MODULO_HELPURL: string;

    /** @type {string} */
    var MATH_MODULO_TITLE: string;

    /** @type {string} */
    var MATH_MODULO_TOOLTIP: string;

    /** @type {string} */
    var MATH_CONSTRAIN_HELPURL: string;

    /** @type {string} */
    var MATH_CONSTRAIN_TITLE: string;

    /** @type {string} */
    var MATH_CONSTRAIN_TOOLTIP: string;

    /** @type {string} */
    var MATH_RANDOM_INT_HELPURL: string;

    /** @type {string} */
    var MATH_RANDOM_INT_TITLE: string;

    /** @type {string} */
    var MATH_RANDOM_INT_TOOLTIP: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_HELPURL: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_TITLE_RANDOM: string;

    /** @type {string} */
    var MATH_RANDOM_FLOAT_TOOLTIP: string;

    /** @type {string} */
    var MATH_ATAN2_HELPURL: string;

    /** @type {string} */
    var MATH_ATAN2_TITLE: string;

    /** @type {string} */
    var MATH_ATAN2_TOOLTIP: string;

    /** @type {string} */
    var TEXT_TEXT_HELPURL: string;

    /** @type {string} */
    var TEXT_TEXT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_JOIN_HELPURL: string;

    /** @type {string} */
    var TEXT_JOIN_TITLE_CREATEWITH: string;

    /** @type {string} */
    var TEXT_JOIN_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_TITLE_JOIN: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_ITEM_TITLE_ITEM: string;

    /** @type {string} */
    var TEXT_CREATE_JOIN_ITEM_TOOLTIP: string;

    /** @type {string} */
    var TEXT_APPEND_HELPURL: string;

    /** @type {string} */
    var TEXT_APPEND_TITLE: string;

    /** @type {string} */
    var TEXT_APPEND_VARIABLE: string;

    /** @type {string} */
    var TEXT_APPEND_TOOLTIP: string;

    /** @type {string} */
    var TEXT_LENGTH_HELPURL: string;

    /** @type {string} */
    var TEXT_LENGTH_TITLE: string;

    /** @type {string} */
    var TEXT_LENGTH_TOOLTIP: string;

    /** @type {string} */
    var TEXT_ISEMPTY_HELPURL: string;

    /** @type {string} */
    var TEXT_ISEMPTY_TITLE: string;

    /** @type {string} */
    var TEXT_ISEMPTY_TOOLTIP: string;

    /** @type {string} */
    var TEXT_INDEXOF_HELPURL: string;

    /** @type {string} */
    var TEXT_INDEXOF_TOOLTIP: string;

    /** @type {string} */
    var TEXT_INDEXOF_TITLE: string;

    /** @type {string} */
    var TEXT_INDEXOF_OPERATOR_FIRST: string;

    /** @type {string} */
    var TEXT_INDEXOF_OPERATOR_LAST: string;

    /** @type {string} */
    var TEXT_CHARAT_HELPURL: string;

    /** @type {string} */
    var TEXT_CHARAT_TITLE: string;

    /** @type {string} */
    var TEXT_CHARAT_FROM_START: string;

    /** @type {string} */
    var TEXT_CHARAT_FROM_END: string;

    /** @type {string} */
    var TEXT_CHARAT_FIRST: string;

    /** @type {string} */
    var TEXT_CHARAT_LAST: string;

    /** @type {string} */
    var TEXT_CHARAT_RANDOM: string;

    /** @type {string} */
    var TEXT_CHARAT_TAIL: string;

    /** @type {string} */
    var TEXT_CHARAT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_TOOLTIP: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_HELPURL: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_INPUT_IN_TEXT: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FROM_START: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FROM_END: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_START_FIRST: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_FROM_START: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_FROM_END: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_END_LAST: string;

    /** @type {string} */
    var TEXT_GET_SUBSTRING_TAIL: string;

    /** @type {string} */
    var TEXT_CHANGECASE_HELPURL: string;

    /** @type {string} */
    var TEXT_CHANGECASE_TOOLTIP: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_UPPERCASE: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_LOWERCASE: string;

    /** @type {string} */
    var TEXT_CHANGECASE_OPERATOR_TITLECASE: string;

    /** @type {string} */
    var TEXT_TRIM_HELPURL: string;

    /** @type {string} */
    var TEXT_TRIM_TOOLTIP: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_BOTH: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_LEFT: string;

    /** @type {string} */
    var TEXT_TRIM_OPERATOR_RIGHT: string;

    /** @type {string} */
    var TEXT_PRINT_HELPURL: string;

    /** @type {string} */
    var TEXT_PRINT_TITLE: string;

    /** @type {string} */
    var TEXT_PRINT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_PROMPT_HELPURL: string;

    /** @type {string} */
    var TEXT_PROMPT_TYPE_TEXT: string;

    /** @type {string} */
    var TEXT_PROMPT_TYPE_NUMBER: string;

    /** @type {string} */
    var TEXT_PROMPT_TOOLTIP_NUMBER: string;

    /** @type {string} */
    var TEXT_PROMPT_TOOLTIP_TEXT: string;

    /** @type {string} */
    var TEXT_COUNT_MESSAGE0: string;

    /** @type {string} */
    var TEXT_COUNT_HELPURL: string;

    /** @type {string} */
    var TEXT_COUNT_TOOLTIP: string;

    /** @type {string} */
    var TEXT_REPLACE_MESSAGE0: string;

    /** @type {string} */
    var TEXT_REPLACE_HELPURL: string;

    /** @type {string} */
    var TEXT_REPLACE_TOOLTIP: string;

    /** @type {string} */
    var TEXT_REVERSE_MESSAGE0: string;

    /** @type {string} */
    var TEXT_REVERSE_HELPURL: string;

    /** @type {string} */
    var TEXT_REVERSE_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_HELPURL: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_TITLE: string;

    /** @type {string} */
    var LISTS_CREATE_EMPTY_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_HELPURL: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_INPUT_WITH: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_CONTAINER_TITLE_ADD: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_CONTAINER_TOOLTIP: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_ITEM_TITLE: string;

    /** @type {string} */
    var LISTS_CREATE_WITH_ITEM_TOOLTIP: string;

    /** @type {string} */
    var LISTS_REPEAT_HELPURL: string;

    /** @type {string} */
    var LISTS_REPEAT_TOOLTIP: string;

    /** @type {string} */
    var LISTS_REPEAT_TITLE: string;

    /** @type {string} */
    var LISTS_LENGTH_HELPURL: string;

    /** @type {string} */
    var LISTS_LENGTH_TITLE: string;

    /** @type {string} */
    var LISTS_LENGTH_TOOLTIP: string;

    /** @type {string} */
    var LISTS_ISEMPTY_HELPURL: string;

    /** @type {string} */
    var LISTS_ISEMPTY_TITLE: string;

    /** @type {string} */
    var LISTS_ISEMPTY_TOOLTIP: string;

    /** @type {string} */
    var LISTS_INLIST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_HELPURL: string;

    /** @type {string} */
    var LISTS_INDEX_OF_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_FIRST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_LAST: string;

    /** @type {string} */
    var LISTS_INDEX_OF_TOOLTIP: string;

    /** @type {string} */
    var LISTS_GET_INDEX_HELPURL: string;

    /** @type {string} */
    var LISTS_GET_INDEX_GET: string;

    /** @type {string} */
    var LISTS_GET_INDEX_GET_REMOVE: string;

    /** @type {string} */
    var LISTS_GET_INDEX_REMOVE: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_INDEX_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TAIL: string;

    /** @type {string} */
    var LISTS_GET_INDEX_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_INDEX_FROM_START_TOOLTIP: string;

    /** @type {string} */
    var LISTS_INDEX_FROM_END_TOOLTIP: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST: string;

    /** @type {string} */
    var LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_HELPURL: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_SET: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INSERT: string;

    /** @type {string} */
    var LISTS_SET_INDEX_INPUT_TO: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_FROM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_FIRST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_LAST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_SET_RANDOM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_FROM: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_LAST: string;

    /** @type {string} */
    var LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_HELPURL: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_INPUT_IN_LIST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_START_FIRST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_FROM_START: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_FROM_END: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_END_LAST: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_TAIL: string;

    /** @type {string} */
    var LISTS_GET_SUBLIST_TOOLTIP: string;

    /** @type {string} */
    var LISTS_SORT_HELPURL: string;

    /** @type {string} */
    var LISTS_SORT_TITLE: string;

    /** @type {string} */
    var LISTS_SORT_TOOLTIP: string;

    /** @type {string} */
    var LISTS_SORT_ORDER_ASCENDING: string;

    /** @type {string} */
    var LISTS_SORT_ORDER_DESCENDING: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_NUMERIC: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_TEXT: string;

    /** @type {string} */
    var LISTS_SORT_TYPE_IGNORECASE: string;

    /** @type {string} */
    var LISTS_SPLIT_HELPURL: string;

    /** @type {string} */
    var LISTS_SPLIT_LIST_FROM_TEXT: string;

    /** @type {string} */
    var LISTS_SPLIT_TEXT_FROM_LIST: string;

    /** @type {string} */
    var LISTS_SPLIT_WITH_DELIMITER: string;

    /** @type {string} */
    var LISTS_SPLIT_TOOLTIP_SPLIT: string;

    /** @type {string} */
    var LISTS_SPLIT_TOOLTIP_JOIN: string;

    /** @type {string} */
    var LISTS_REVERSE_HELPURL: string;

    /** @type {string} */
    var LISTS_REVERSE_MESSAGE0: string;

    /** @type {string} */
    var LISTS_REVERSE_TOOLTIP: string;

    /** @type {string} */
    var ORDINAL_NUMBER_SUFFIX: string;

    /** @type {string} */
    var VARIABLES_GET_HELPURL: string;

    /** @type {string} */
    var VARIABLES_GET_TOOLTIP: string;

    /** @type {string} */
    var VARIABLES_GET_CREATE_SET: string;

    /** @type {string} */
    var VARIABLES_SET_HELPURL: string;

    /** @type {string} */
    var VARIABLES_SET: string;

    /** @type {string} */
    var VARIABLES_SET_TOOLTIP: string;

    /** @type {string} */
    var VARIABLES_SET_CREATE_GET: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_TITLE: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_PROCEDURE: string;

    /** @type {string} */
    var PROCEDURES_BEFORE_PARAMS: string;

    /** @type {string} */
    var PROCEDURES_CALL_BEFORE_PARAMS: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_DO: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_DEFNORETURN_COMMENT: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_TITLE: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_PROCEDURE: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_DO: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_COMMENT: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_RETURN: string;

    /** @type {string} */
    var PROCEDURES_DEFRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_ALLOW_STATEMENTS: string;

    /** @type {string} */
    var PROCEDURES_DEF_DUPLICATE_WARNING: string;

    /** @type {string} */
    var PROCEDURES_CALLNORETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_CALLNORETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_CALLRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_CALLRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_MUTATORCONTAINER_TITLE: string;

    /** @type {string} */
    var PROCEDURES_MUTATORCONTAINER_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_MUTATORARG_TITLE: string;

    /** @type {string} */
    var PROCEDURES_MUTATORARG_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_HIGHLIGHT_DEF: string;

    /** @type {string} */
    var PROCEDURES_CREATE_DO: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_TOOLTIP: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_HELPURL: string;

    /** @type {string} */
    var PROCEDURES_IFRETURN_WARNING: string;

    /** @type {string} */
    var WORKSPACE_COMMENT_DEFAULT_TEXT: string;

    /** @type {string} */
    var WORKSPACE_ARIA_LABEL: string;

    /** @type {string} */
    var COLLAPSED_WARNINGS_WARNING: string;
}
