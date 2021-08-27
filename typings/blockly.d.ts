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
    toolbox?: Blockly.utils.toolbox.ToolboxDefinition;
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
    parentWorkspace?: Blockly.WorkspaceSvg;
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
    class Block__Class implements Blockly.IASTNodeLocation, Blockly.IDeletable  { 
    
            /**
             * Class for one block.
             * Not normally called directly, workspace.newBlock() is preferred.
             * @param {!Blockly.Workspace} workspace The block's workspace.
             * @param {!string} prototypeName Name of the language object containing
             *     type-specific functions for this block.
             * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
             *     create a new ID.
             * @constructor
             * @implements {Blockly.IASTNodeLocation}
             * @implements {Blockly.IDeletable}
             * @throws When the prototypeName is not valid or not allowed.
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
    
            /** @type {!Array<!Blockly.Input>} */
            inputList: Blockly.Input[];
    
            /** @type {boolean|undefined} */
            inputsInline: boolean|any /*undefined*/;
    
            /** @type {!Blockly.Tooltip.TipInfo} */
            tooltip: Blockly.Tooltip.TipInfo;
    
            /** @type {boolean} */
            contextMenu: boolean;
    
            /**
             * @type {Blockly.Block}
             * @protected
             */
            parentBlock_: Blockly.Block;
    
            /**
             * @type {!Array<!Blockly.Block>}
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
             * @type {string}
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
             * @type {?function():!Array<string>}
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
             * @return {!Array<!Blockly.Connection>} Array of connections.
             * @package
             */
            getConnections_(_all: boolean): Blockly.Connection[];
    
            /**
             * Walks down a stack of blocks and finds the last next connection on the stack.
             * @param {boolean} ignoreShadows If true,the last connection on a non-shadow
             *     block will be returned. If false, this will follow shadows to find the
             *     last connection.
             * @return {?Blockly.Connection} The last next connection on the stack, or null.
             * @package
             */
            lastConnectionInStack(ignoreShadows: boolean): Blockly.Connection;
    
            /**
             * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
             * connected should not coincidentally line up on screen.
             */
            bumpNeighbours(): void;
    
            /**
             * Return the parent block or null if this block is at the top level. The parent
             * block is either the block connected to the previous connection (for a statement
             * block) or the block connected to the output connection (for a value block).
             * @return {?Blockly.Block} The block (if any) that holds the current block.
             */
            getParent(): Blockly.Block;
    
            /**
             * Return the input that connects to the specified block.
             * @param {!Blockly.Block} block A block connected to an input on this block.
             * @return {?Blockly.Input} The input (if any) that connects to the specified
             *     block.
             */
            getInputWithBlock(block: Blockly.Block): Blockly.Input;
    
            /**
             * Return the parent block that surrounds the current block, or null if this
             * block has no surrounding block.  A parent block might just be the previous
             * statement, whereas the surrounding block is an if statement, while loop, etc.
             * @return {?Blockly.Block} The block (if any) that surrounds the current block.
             */
            getSurroundParent(): Blockly.Block;
    
            /**
             * Return the next statement block directly connected to this block.
             * @return {?Blockly.Block} The next statement block or null.
             */
            getNextBlock(): Blockly.Block;
    
            /**
             * Returns the block connected to the previous connection.
             * @return {?Blockly.Block} The previous statement block or null.
             */
            getPreviousBlock(): Blockly.Block;
    
            /**
             * Return the connection on the first statement input on this block, or null if
             * there are none.
             * @return {?Blockly.Connection} The first statement connection or null.
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
             * @return {!Array<!Blockly.Block>} Array of blocks.
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
             * @return {!Array<!Blockly.Block>} Flattened array of blocks.
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
             * @return {?Blockly.Connection} The matching connection on this block, or null.
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
             * Sets the tooltip for this block.
             * @param {!Blockly.Tooltip.TipInfo} newTip The text for the tooltip, a function
             *     that returns the text for the tooltip, or a parent object whose tooltip
             *     will be used. To not display a tooltip pass the empty string.
             */
            setTooltip(newTip: Blockly.Tooltip.TipInfo): void;
    
            /**
             * Returns the tooltip text for this block.
             * @return {!string} The tooltip text for this block.
             */
            getTooltip(): string;
    
            /**
             * Get the colour of a block.
             * @return {string} #RRGGBB string.
             */
            getColour(): string;
    
            /**
             * Get the name of the block style.
             * @return {string} Name of the block style.
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
             * @param {string} blockStyleName Name of the block style.
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
             * @return {?Blockly.Field} Named field, or null if field does not exist.
             */
            getField(name: string): Blockly.Field;
    
            /**
             * Return all variables referenced by this block.
             * @return {!Array<string>} List of variable names.
             */
            getVars(): string[];
    
            /**
             * Return all variables referenced by this block.
             * @return {!Array<!Blockly.VariableModel>} List of variable models.
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
             * Returns the language-neutral value of the given field.
             * @param {string} name The name of the field.
             * @return {*} Value of the field or null if field does not exist.
             */
            getFieldValue(name: string): any;
    
            /**
             * Sets the value of the given field for this block.
             * @param {*} newValue The value to set.
             * @param {string} name The name of the field to set the value of.
             */
            setFieldValue(newValue: any, name: string): void;
    
            /**
             * Set whether this block can chain onto the bottom of another block.
             * @param {boolean} newBoolean True if there can be a previous statement.
             * @param {(string|Array<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setPreviousStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether another block can chain onto the bottom of this block.
             * @param {boolean} newBoolean True if there can be a next statement.
             * @param {(string|Array<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setNextStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether this block returns a value.
             * @param {boolean} newBoolean True if there is an output.
             * @param {(string|Array<string>|null)=} opt_check Returned type or list
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
             * @param {number} type One of Blockly.inputTypes.
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
             * @return {?Blockly.Input} The input object, or null if input does not exist.
             */
            getInput(name: string): Blockly.Input;
    
            /**
             * Fetches the block attached to the named input.
             * @param {string} name The name of the input.
             * @return {?Blockly.Block} The attached value block, or null if the input is
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
     * The language-neutral ID given to the collapsed input.
     * @const {string}
     */
    var COLLAPSED_INPUT_NAME: any /*missing*/;

    /**
     * The language-neutral ID given to the collapsed field.
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
             * @param {number} x X translation in pixel coordinates.
             * @param {number} y Y translation in pixel coordinates.
             * @param {number} scale Scale of the group.
             */
            translateAndScaleGroup(x: number, y: number, scale: number): void;
    
            /**
             * Translates the entire surface by a relative offset.
             * @param {number} deltaX Horizontal offset in pixel units.
             * @param {number} deltaY Vertical offset in pixel units.
             */
            translateBy(deltaX: number, deltaY: number): void;
    
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
             * @return {?SVGElement} Drag surface group element.
             */
            getGroup(): SVGElement;
    
            /**
             * Returns the SVG drag surface.
             * @returns {?SVGElement} The SVG drag surface.
             */
            getSvgRoot(): SVGElement;
    
            /**
             * Get the current blocks on the drag surface, if any (primarily
             * for BlockSvg.getRelativeToSurfaceXY).
             * @return {?Element} Drag surface block DOM element, or null if no blocks exist.
             */
            getCurrentBlock(): Element;
    
            /**
             * Gets the translation of the child block surface
             * This surface is in charge of keeping track of how much the workspace has
             * moved.
             * @return {!Blockly.utils.Coordinate} The amount the workspace has been moved.
             */
            getWsTranslation(): Blockly.utils.Coordinate;
    
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
    class BlockDragger__Class implements Blockly.IBlockDragger  { 
    
            /**
             * Class for a block dragger.  It moves blocks around the workspace when they
             * are being dragged by a mouse or touch.
             * @param {!Blockly.BlockSvg} block The block to drag.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
             * @constructor
             * @implements {Blockly.IBlockDragger}
             */
            constructor(block: Blockly.BlockSvg, workspace: Blockly.WorkspaceSvg);
    
            /**
             * The top block in the stack that is being dragged.
             * @type {!Blockly.BlockSvg}
             * @protected
             */
            draggingBlock_: Blockly.BlockSvg;
    
            /**
             * The workspace on which the block is being dragged.
             * @type {!Blockly.WorkspaceSvg}
             * @protected
             */
            workspace_: Blockly.WorkspaceSvg;
    
            /**
             * Object that keeps track of connections on dragged blocks.
             * @type {!Blockly.InsertionMarkerManager}
             * @protected
             */
            draggedConnectionManager_: Blockly.InsertionMarkerManager;
    
            /**
             * Whether the block would be deleted if dropped immediately.
             * @type {boolean}
             * @protected
             */
            wouldDeleteBlock_: boolean;
    
            /**
             * The location of the top left corner of the dragging block at the beginning
             * of the drag in workspace coordinates.
             * @type {!Blockly.utils.Coordinate}
             * @protected
             */
            startXY_: Blockly.utils.Coordinate;
    
            /**
             * A list of all of the icons (comment, warning, and mutator) that are
             * on this block and its descendants.  Moving an icon moves the bubble that
             * extends from it if that bubble is open.
             * @type {Array<!Object>}
             * @protected
             */
            dragIconData_: Object[];
    
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
             * @public
             */
            startDrag(currentDragDeltaXY: Blockly.utils.Coordinate, healStack: boolean): void;
    
            /**
             * Whether or not we should disconnect the block when a drag is started.
             * @param {boolean} healStack Whether or not to heal the stack after
             *     disconnecting.
             * @return {boolean} True to disconnect the block, false otherwise.
             * @protected
             */
            shouldDisconnect_(healStack: boolean): boolean;
    
            /**
             * Disconnects the block and moves it to a new location.
             * @param {boolean} healStack Whether or not to heal the stack after
             *     disconnecting.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at mouse down, in pixel units.
             * @protected
             */
            disconnectBlock_(healStack: boolean, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Fire a UI event at the start of a block drag.
             * @protected
             */
            fireDragStartEvent_(): void;
    
            /**
             * Execute a step of block dragging, based on the given event.  Update the
             * display accordingly.
             * @param {!Event} e The most recent move event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @public
             */
            drag(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Finish a block drag and put the block back on the workspace.
             * @param {!Event} e The mouseup/touchend event.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the position at the start of the drag, in pixel units.
             * @public
             */
            endDrag(e: Event, currentDragDeltaXY: Blockly.utils.Coordinate): void;
    
            /**
             * Calculates the drag delta and new location values after a block is dragged.
             * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
             *     moved from the start of the drag, in pixel units.
             * @return {{delta: !Blockly.utils.Coordinate, newLocation:
             *     !Blockly.utils.Coordinate}} New location after drag. delta is in
             *     workspace units. newLocation is the new coordinate where the block should
             *     end up.
             * @protected
             */
            getNewLocationAfterDrag_(currentDragDeltaXY: Blockly.utils.Coordinate): { delta: Blockly.utils.Coordinate; newLocation: Blockly.utils.Coordinate };
    
            /**
             * May delete the dragging block, if allowed. If `this.wouldDeleteBlock_` is not
             * true, the block will not be deleted. This should be called at the end of a
             * block drag.
             * @return {boolean} True if the block was deleted.
             * @protected
             */
            maybeDeleteBlock_(): boolean;
    
            /**
             * Updates the necessary information to place a block at a certain location.
             * @param {!Blockly.utils.Coordinate} delta The change in location from where
             *     the block started the drag to where it ended the drag.
             * @protected
             */
            updateBlockAfterMove_(delta: Blockly.utils.Coordinate): void;
    
            /**
             * Fire a UI event at the end of a block drag.
             * @protected
             */
            fireDragEndEvent_(): void;
    
            /**
             * Adds or removes the style of the cursor for the toolbox.
             * This is what changes the cursor to display an x when a deletable block is
             * held over the toolbox.
             * @param {boolean} isEnd True if we are at the end of a drag, false otherwise.
             * @protected
             */
            updateToolboxStyle_(isEnd: boolean): void;
    
            /**
             * Fire a move event at the end of a block drag.
             * @protected
             */
            fireMoveEvent_(): void;
    
            /**
             * Update the cursor (and possibly the trash can lid) to reflect whether the
             * dragging block would be deleted if released immediately.
             * @protected
             */
            updateCursorDuringBlockDrag_(): void;
    
            /**
             * Convert a coordinate object from pixels to workspace units, including a
             * correction for mutator workspaces.
             * This function does not consider differing origins.  It simply scales the
             * input's x and y values.
             * @param {!Blockly.utils.Coordinate} pixelCoord A coordinate with x and y
             *     values in CSS pixel units.
             * @return {!Blockly.utils.Coordinate} The input coordinate divided by the
             *     workspace scale.
             * @protected
             */
            pixelsToWorkspaceUnits_(pixelCoord: Blockly.utils.Coordinate): Blockly.utils.Coordinate;
    
            /**
             * Move all of the icons connected to this drag.
             * @param {!Blockly.utils.Coordinate} dxy How far to move the icons from their
             *     original positions, in workspace units.
             * @protected
             */
            dragIcons_(dxy: Blockly.utils.Coordinate): void;
    
            /**
             * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
             * or 2 insertion markers.
             * @return {!Array<!Blockly.BlockSvg>} A possibly empty list of insertion
             *     marker blocks.
             * @public
             */
            getInsertionMarkers(): Blockly.BlockSvg[];
    } 
    
}


declare module Blockly {

    class BlockSvg extends BlockSvg__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BlockSvg__Class extends Blockly.Block__Class implements Blockly.IASTNodeLocationSvg, Blockly.IBoundedElement, Blockly.ICopyable, Blockly.IDraggable  { 
    
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
             * @implements {Blockly.IDraggable}
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
             * @type {?function(!Array<!Object>)}
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
             * @type {?Blockly.Mutator}
             */
            mutator: Blockly.Mutator;
    
            /**
             * Block's comment icon (if any).
             * @type {?Blockly.Comment}
             * @deprecated August 2019. Use getCommentIcon instead.
             */
            comment: Blockly.Comment;
    
            /**
             * Block's warning icon (if any).
             * @type {?Blockly.Warning}
             */
            warning: Blockly.Warning;
    
            /**
             * Returns a list of mutator, comment, and warning icons.
             * @return {!Array<!Blockly.Icon>} List of icons.
             */
            getIcons(): Blockly.Icon[];
    
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
             * @return {?Array<!Object>} Context menu options or null if no menu.
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
             * @return {?Blockly.ICopyable.CopyData} Copy metadata, or null if the block is
             *     an insertion marker.
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
             * @return {?Blockly.Comment} The comment icon attached to this block, or null.
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
             * @param {?Blockly.Mutator} mutator A mutator dialog instance or null to remove.
             */
            setMutator(mutator: Blockly.Mutator): void;
    
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
             * @param {string} blockStyleName Name of the block style.
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
             * @param {(string|Array<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setPreviousStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether another block can chain onto the bottom of this block.
             * @param {boolean} newBoolean True if there can be a next statement.
             * @param {(string|Array<string>|null)=} opt_check Statement type or
             *     list of statement types.  Null/undefined if any type could be connected.
             */
            setNextStatement(newBoolean: boolean, opt_check?: string|string[]|any /*null*/): void;
    
            /**
             * Set whether this block returns a value.
             * @param {boolean} newBoolean True if there is an output.
             * @param {(string|Array<string>|null)=} opt_check Returned type or list
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
             * @return {!Array<!Blockly.RenderedConnection>} Array of connections.
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
             * Add the cursor SVG to this block's SVG group.
             * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
             *     block SVG group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker SVG to this block's SVG group.
             * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
             *     block SVG group.
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
     * Don't collide with Blockly.inputTypes.
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
     * This constant is overridden by the build script (npm run build) to the value
     * of the version in package.json. This is done by the Closure Compiler in the
     * buildCompressed gulp task.
     * For local builds, you can pass --define='Blockly.VERSION=X.Y.Z' to the
     * compiler to override this constant.
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
     * @type {!Array<!Blockly.Connection>}
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
     * Returns the dimensions of the specified SVG image.
     * @param {!SVGElement} svg SVG image.
     * @return {!Blockly.utils.Size} Contains width and height properties.
     * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
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
     * Delete the given block.
     * @param {!Blockly.BlockSvg} selected The block to delete.
     * @package
     */
    function deleteBlock(selected: Blockly.BlockSvg): void;

    /**
     * Copy a block or workspace comment onto the local clipboard.
     * @param {!Blockly.ICopyable} toCopy Block or Workspace Comment to be copied.
     * @package
     */
    function copy(toCopy: Blockly.ICopyable): void;

    /**
     * Paste a block or workspace comment on to the main workspace.
     * @return {boolean} True if the paste was successful, false otherwise.
     * @package
     */
    function paste(): boolean;

    /**
     * Duplicate this block and its children, or a workspace comment.
     * @param {!Blockly.ICopyable} toDuplicate Block or Workspace Comment to be
     *     copied.
     * @package
     */
    function duplicate(toDuplicate: Blockly.ICopyable): void;

    /**
     * Close tooltips, context menus, dropdown selections, etc.
     * @param {boolean=} opt_onlyClosePopups Whether only popups should be closed.
     */
    function hideChaff(opt_onlyClosePopups?: boolean): void;

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
     * @param {!Array<!Object>} jsonArray An array of JSON block definitions.
     */
    function defineBlocksWithJsonArray(jsonArray: Object[]): void;

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

    /**
     * @see Blockly.browserEvents.bind
     */
    var bindEvent_: any /*missing*/;

    /**
     * @see Blockly.browserEvents.unbind
     */
    var unbindEvent_: any /*missing*/;

    /**
     * @see Blockly.browserEvents.conditionalBind
     */
    var bindEventWithChecks_: any /*missing*/;

    /**
     * @see Blockly.constants.ALIGN.LEFT
     */
    var ALIGN_LEFT: any /*missing*/;

    /**
     * @see Blockly.constants.ALIGN.CENTRE
     */
    var ALIGN_CENTRE: any /*missing*/;

    /**
     * @see Blockly.constants.ALIGN.RIGHT
     */
    var ALIGN_RIGHT: any /*missing*/;

    /**
     * @see Blockly.connectionTypes.INPUT_VALUE
     */
    var INPUT_VALUE: any /*missing*/;

    /**
     * @see Blockly.connectionTypes.OUTPUT_VALUE
     */
    var OUTPUT_VALUE: any /*missing*/;

    /**
     * @see Blockly.connectionTypes.NEXT_STATEMENT
     */
    var NEXT_STATEMENT: any /*missing*/;

    /**
     * @see Blockly.connectionTypes.PREVIOUS_STATEMENT
     */
    var PREVIOUS_STATEMENT: any /*missing*/;

    /**
     * @see Blockly.inputTypes.DUMMY_INPUT
     */
    var DUMMY_INPUT: any /*missing*/;

    /**
     * @see Blockly.utils.toolbox.Position.TOP
     */
    var TOOLBOX_AT_TOP: any /*missing*/;

    /**
     * @see Blockly.utils.toolbox.Position.BOTTOM
     */
    var TOOLBOX_AT_BOTTOM: any /*missing*/;

    /**
     * @see Blockly.utils.toolbox.Position.LEFT
     */
    var TOOLBOX_AT_LEFT: any /*missing*/;

    /**
     * @see Blockly.utils.toolbox.Position.RIGHT
     */
    var TOOLBOX_AT_RIGHT: any /*missing*/;
}


declare module Blockly {

    /**
     * A mapping of block type names to block prototype objects.
     * @type {!Object<string,Object>}
     */
    var Blocks: { [key: string]: Object };
}


declare module Blockly.browserEvents {

    /**
     * Blockly opaque event data used to unbind events when using
     * `Blockly.browserEvents.bind` and
     * `Blockly.browserEvents.conditionalBind`.
     * @typedef {!Array<!Array>}
     */
    interface Data extends Array<any[]> { }

    /**
     * Bind an event handler that can be ignored if it is not part of the active
     * touch stream.
     * Use this for events that either start or continue a multi-part gesture (e.g.
     * mousedown or mousemove, which may be part of a drag or click).
     * @param {!EventTarget} node Node upon which to listen.
     * @param {string} name Event name to listen to (e.g. 'mousedown').
     * @param {?Object} thisObject The value of 'this' in the function.
     * @param {!Function} func Function to call when event is triggered.
     * @param {boolean=} opt_noCaptureIdentifier True if triggering on this event
     *     should not block execution of other event handlers on this touch or
     *     other simultaneous touches.  False by default.
     * @param {boolean=} opt_noPreventDefault True if triggering on this event
     *     should prevent the default handler.  False by default.  If
     *     opt_noPreventDefault is provided, opt_noCaptureIdentifier must also be
     *     provided.
     * @return {!Blockly.browserEvents.Data} Opaque data that can be passed to
     *     unbindEvent_.
     * @public
     */
    function conditionalBind(node: EventTarget, name: string, thisObject: Object, func: Function, opt_noCaptureIdentifier?: boolean, opt_noPreventDefault?: boolean): Blockly.browserEvents.Data;

    /**
     * Bind an event handler that should be called regardless of whether it is part
     * of the active touch stream.
     * Use this for events that are not part of a multi-part gesture (e.g.
     * mouseover for tooltips).
     * @param {!EventTarget} node Node upon which to listen.
     * @param {string} name Event name to listen to (e.g. 'mousedown').
     * @param {?Object} thisObject The value of 'this' in the function.
     * @param {!Function} func Function to call when event is triggered.
     * @return {!Blockly.browserEvents.Data} Opaque data that can be passed to
     *     unbindEvent_.
     * @public
     */
    function bind(node: EventTarget, name: string, thisObject: Object, func: Function): Blockly.browserEvents.Data;

    /**
     * Unbind one or more events event from a function call.
     * @param {!Blockly.browserEvents.Data} bindData Opaque data from bindEvent_.
     *     This list is emptied during the course of calling this function.
     * @return {!Function} The function call.
     * @public
     */
    function unbind(bindData: Blockly.browserEvents.Data): Function;
}


declare module Blockly {

    class Bubble extends Bubble__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Bubble__Class implements Blockly.IBubble  { 
    
            /**
             * Class for UI bubble.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace on which to draw the
             *     bubble.
             * @param {!Element} content SVG content for the bubble.
             * @param {!Element} shape SVG element to avoid eclipsing.
             * @param {!Blockly.utils.Coordinate} anchorXY Absolute position of bubble's
             *     anchor point.
             * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
             * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
             * @implements {Blockly.IBubble}
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
             * @return {!SVGElement} The root SVG node of the bubble's group.
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
             * Update the style of this bubble when it is dragged over a delete area.
             * @param {boolean} _enable True if the bubble is about to be deleted, false
             *     otherwise.
             */
            setDeleteStyle(_enable: boolean): void;
    
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

    /**
     * Create the text for a non editable bubble.
     * @param {string} text The text to display.
     * @return {!SVGTextElement} The top-level node of the text.
     * @package
     */
    function textToDom(text: string): SVGTextElement;

    /**
     * Creates a bubble that can not be edited.
     * @param {!SVGTextElement} paragraphElement The text element for the non
     *     editable bubble.
     * @param {!Blockly.BlockSvg} block The block that the bubble is attached to.
     * @param {!Blockly.utils.Coordinate} iconXY The coordinate of the icon.
     * @return {!Blockly.Bubble} The non editable bubble.
     * @package
     */
    function createNonEditableBubble(paragraphElement: SVGTextElement, block: Blockly.BlockSvg, iconXY: Blockly.utils.Coordinate): Blockly.Bubble;
}


declare module Blockly {

    class BubbleDragger extends BubbleDragger__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class BubbleDragger__Class  { 
    
            /**
             * Class for a bubble dragger.  It moves things on the bubble canvas around the
             * workspace when they are being dragged by a mouse or touch.  These can be
             * block comments, mutators, warnings, or workspace comments.
             * @param {!Blockly.IBubble} bubble The item on the bubble canvas to drag.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
             * @constructor
             */
            constructor(bubble: Blockly.IBubble, workspace: Blockly.WorkspaceSvg);
    
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

    class ComponentManager extends ComponentManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ComponentManager__Class  { 
    
            /**
             * Manager for all items registered with the workspace.
             * @constructor
             */
            constructor();
    
            /**
             * Adds a component.
             * @param {!Blockly.ComponentManager.ComponentDatum} componentInfo The data for
             *   the component to register.
             * @param {boolean=} opt_allowOverrides True to prevent an error when overriding
             *     an already registered item.
             */
            addComponent(componentInfo: Blockly.ComponentManager.ComponentDatum, opt_allowOverrides?: boolean): void;
    
            /**
             * Removes a component.
             * @param {string} id The ID of the component to remove.
             */
            removeComponent(id: string): void;
    
            /**
             * Adds a capability to a existing registered component.
             * @param {string} id The ID of the component to add the capability to.
             * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
             *     capability to add.
             * @template T
             */
            addCapability<T>(id: string, capability: string|Blockly.ComponentManager.Capability<T>): void;
    
            /**
             * Removes a capability from an existing registered component.
             * @param {string} id The ID of the component to remove the capability from.
             * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
             *     capability to remove.
             * @template T
             */
            removeCapability<T>(id: string, capability: string|Blockly.ComponentManager.Capability<T>): void;
    
            /**
             * Returns whether the component with this id has the specified capability.
             * @param {string} id The ID of the component to check.
             * @param {string|!Blockly.ComponentManager.Capability<T>} capability The
             *     capability to check for.
             * @return {boolean} Whether the component has the capability.
             * @template T
             */
            hasCapability<T>(id: string, capability: string|Blockly.ComponentManager.Capability<T>): boolean;
    
            /**
             * Gets the component with the given ID.
             * @param {string} id The ID of the component to get.
             * @return {!Blockly.IComponent|undefined} The component with the given name
             *    or undefined if not found.
             */
            getComponent(id: string): Blockly.IComponent|any /*undefined*/;
    
            /**
             * Gets all the components with the specified capability.
             * @param {string|!Blockly.ComponentManager.Capability<T>
             *   } capability The capability of the component.
             * @param {boolean} sorted Whether to return list ordered by weights.
             * @return {!Array<T>} The components that match the specified capability.
             * @template T
             */
            getComponents<T>(capability: string|Blockly.ComponentManager.Capability<T>, sorted: boolean): T[];
    } 
    
}

declare module Blockly.ComponentManager {

    class Capability<T> extends Capability__Class<T> { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Capability__Class<T>  { 
    
            /**
             * A name with the capability of the element stored in the generic.
             * @param {string} name The name of the component capability.
             * @constructor
             * @template T
             */
            constructor(name: string);
    } 
    

    /**
     * An object storing component information.
     * @typedef {{
     *    component: !Blockly.IComponent,
     *    capabilities: (
     *     !Array<string|!Blockly.ComponentManager.Capability<!Blockly.IComponent>>
     *       ),
     *    weight: number
     *  }}
     */
    interface ComponentDatum {
        component: Blockly.IComponent;
        capabilities: string|Blockly.ComponentManager.Capability<Blockly.IComponent>[];
        weight: number
    }
}

declare module Blockly.ComponentManager.Capability {

    /** @type {!Blockly.ComponentManager.Capability<!Blockly.IPositionable>} */
    var POSITIONABLE: Blockly.ComponentManager.Capability<Blockly.IPositionable>;

    /** @type {!Blockly.ComponentManager.Capability<!Blockly.IDragTarget>} */
    var DRAG_TARGET: Blockly.ComponentManager.Capability<Blockly.IDragTarget>;

    /** @type {!Blockly.ComponentManager.Capability<!Blockly.IDeleteArea>} */
    var DELETE_AREA: Blockly.ComponentManager.Capability<Blockly.IDeleteArea>;

    /** @type {!Blockly.ComponentManager.Capability<!Blockly.IAutoHideable>} */
    var AUTOHIDEABLE: Blockly.ComponentManager.Capability<Blockly.IAutoHideable>;
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
             * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
             *     connectionChecker instead.
             */
            canConnectWithReason(target: Blockly.Connection): number;
    
            /**
             * Checks whether the current connection and target connection are compatible
             * and throws an exception if they are not.
             * @param {Blockly.Connection} target The connection to check compatibility
             *    with.
             * @package
             * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
             *     connectionChecker instead.
             */
            checkConnection(target: Blockly.Connection): void;
    
            /**
             * Get the workspace's connection type checker object.
             * @return {!Blockly.IConnectionChecker} The connection type checker for the
             *     source block's workspace.
             * @package
             */
            getConnectionChecker(): Blockly.IConnectionChecker;
    
            /**
             * Check if the two connections can be dragged to connect to each other.
             * @param {!Blockly.Connection} candidate A nearby connection to check.
             * @return {boolean} True if the connection is allowed, false otherwise.
             * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
             *     connectionChecker instead.
             */
            isConnectionAllowed(candidate: Blockly.Connection): boolean;
    
            /**
             * Called when an attempted connection fails. NOP by default (i.e. for headless
             * workspaces).
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
             * @return {?Blockly.Block} The connected block or null if none is connected.
             */
            targetBlock(): Blockly.Block;
    
            /**
             * Is this connection compatible with another connection with respect to the
             * value type system.  E.g. square_root("Hello") is not compatible.
             * @param {!Blockly.Connection} otherConnection Connection to compare against.
             * @return {boolean} True if the connections share a type.
             * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
             *     connectionChecker instead.
             */
            checkType(otherConnection: Blockly.Connection): boolean;
    
            /**
             * Function to be called when this connection's compatible types have changed.
             * @protected
             */
            onCheckChanged_(): void;
    
            /**
             * Change a connection's compatibility.
             * @param {?(string|!Array<string>)} check Compatible value type or list of
             *     value types. Null if all types are compatible.
             * @return {!Blockly.Connection} The connection being modified
             *     (to allow chaining).
             */
            setCheck(check: string|string[]): Blockly.Connection;
    
            /**
             * Get a connection's compatibility.
             * @return {?Array} List of compatible value types.
             *     Null if all types are compatible.
             * @public
             */
            getCheck(): any[];
    
            /**
             * Changes the connection's shadow block.
             * @param {?Element} shadow DOM representation of a block or null.
             */
            setShadowDom(shadow: Element): void;
    
            /**
             * Returns the xml representation of the connection's shadow block.
             * @param {boolean=} returnCurrent If true, and the shadow block is currently
             *     attached to this connection, this serializes the state of that block
             *     and returns it (so that field values are correct). Otherwise the saved
             *     shadowDom is just returned.
             * @return {?Element} Shadow DOM representation of a block or null.
             */
            getShadowDom(returnCurrent?: boolean): Element;
    
            /**
             * Find all nearby compatible connections to this connection.
             * Type checking does not apply, since this function is used for bumping.
             *
             * Headless configurations (the default) do not have neighboring connection,
             * and always return an empty list (the default).
             * {@link Blockly.RenderedConnection} overrides this behavior with a list
             * computed from the rendered positioning.
             * @param {number} _maxLimit The maximum radius to another connection.
             * @return {!Array<!Blockly.Connection>} List of connections.
             * @package
             */
            neighbours(_maxLimit: number): Blockly.Connection[];
    
            /**
             * Get the parent input of a connection.
             * @return {?Blockly.Input} The input that the connection belongs to or null if
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
     * Returns the connection (starting at the startBlock) which will accept
     * the given connection. This includes compatible connection types and
     * connection checks.
     * @param {!Blockly.Block} startBlock The block on which to start the search.
     * @param {!Blockly.Connection} orphanConnection The connection that is looking
     *     for a home.
     * @return {?Blockly.Connection} The suitable connection point on the chain of
     *     blocks, or null.
     */
    function getConnectionForOrphanedConnection(startBlock: Blockly.Block, orphanConnection: Blockly.Connection): Blockly.Connection;
}


declare module Blockly {

    class ConnectionChecker extends ConnectionChecker__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ConnectionChecker__Class implements Blockly.IConnectionChecker  { 
    
            /**
             * Class for connection type checking logic.
             * @implements {Blockly.IConnectionChecker}
             * @constructor
             */
            constructor();
    
            /**
             * Check whether the current connection can connect with the target
             * connection.
             * @param {Blockly.Connection} a Connection to check compatibility with.
             * @param {Blockly.Connection} b Connection to check compatibility with.
             * @param {boolean} isDragging True if the connection is being made by dragging
             *     a block.
             * @param {number=} opt_distance The max allowable distance between the
             *     connections for drag checks.
             * @return {boolean} Whether the connection is legal.
             * @public
             */
            canConnect(a: Blockly.Connection, b: Blockly.Connection, isDragging: boolean, opt_distance?: number): boolean;
    
            /**
             * Checks whether the current connection can connect with the target
             * connection, and return an error code if there are problems.
             * @param {Blockly.Connection} a Connection to check compatibility with.
             * @param {Blockly.Connection} b Connection to check compatibility with.
             * @param {boolean} isDragging True if the connection is being made by dragging
             *     a block.
             * @param {number=} opt_distance The max allowable distance between the
             *     connections for drag checks.
             * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
             *    an error code otherwise.
             * @public
             */
            canConnectWithReason(a: Blockly.Connection, b: Blockly.Connection, isDragging: boolean, opt_distance?: number): number;
    
            /**
             * Helper method that translates a connection error code into a string.
             * @param {number} errorCode The error code.
             * @param {Blockly.Connection} a One of the two connections being checked.
             * @param {Blockly.Connection} b The second of the two connections being
             *     checked.
             * @return {string} A developer-readable error string.
             * @public
             */
            getErrorMessage(errorCode: number, a: Blockly.Connection, b: Blockly.Connection): string;
    
            /**
             * Check that connecting the given connections is safe, meaning that it would
             * not break any of Blockly's basic assumptions (e.g. no self connections).
             * @param {Blockly.Connection} a The first of the connections to check.
             * @param {Blockly.Connection} b The second of the connections to check.
             * @return {number} An enum with the reason this connection is safe or unsafe.
             * @public
             */
            doSafetyChecks(a: Blockly.Connection, b: Blockly.Connection): number;
    
            /**
             * Check whether this connection is compatible with another connection with
             * respect to the value type system.  E.g. square_root("Hello") is not
             * compatible.
             * @param {!Blockly.Connection} a Connection to compare.
             * @param {!Blockly.Connection} b Connection to compare against.
             * @return {boolean} True if the connections share a type.
             * @public
             */
            doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean;
    
            /**
             * Check whether this connection can be made by dragging.
             * @param {!Blockly.RenderedConnection} a Connection to compare.
             * @param {!Blockly.RenderedConnection} b Connection to compare against.
             * @param {number} distance The maximum allowable distance between connections.
             * @return {boolean} True if the connection is allowed during a drag.
             * @public
             */
            doDragChecks(a: Blockly.RenderedConnection, b: Blockly.RenderedConnection, distance: number): boolean;
    
            /**
             * Helper function for drag checking.
             * @param {!Blockly.Connection} a The connection to check, which must be a
             *     statement input or next connection.
             * @param {!Blockly.Connection} b A nearby connection to check, which
             *     must be a previous connection.
             * @return {boolean} True if the connection is allowed, false otherwise.
             * @protected
             */
            canConnectToPrevious_(a: Blockly.Connection, b: Blockly.Connection): boolean;
    } 
    
}


declare module Blockly {

    class ConnectionDB extends ConnectionDB__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ConnectionDB__Class  { 
    
            /**
             * Database of connections.
             * Connections are stored in order of their vertical component.  This way
             * connections in an area may be looked up quickly using a binary search.
             * @param {!Blockly.IConnectionChecker} checker The workspace's
             *     connection type checker, used to decide if connections are valid during a
             *     drag.
             * @constructor
             */
            constructor(checker: Blockly.IConnectionChecker);
    
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
             * @return {!Array<!Blockly.RenderedConnection>} List of connections.
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
     * @param {!Blockly.IConnectionChecker} checker The workspace's
     *     connection checker, used to decide if connections are valid during a drag.
     * @return {!Array<!Blockly.ConnectionDB>} Array of databases.
     */
    function init(checker: Blockly.IConnectionChecker): Blockly.ConnectionDB[];
}


declare module Blockly {

    /**
     * Enum for the type of a connection or input.
     * @enum {number}
     */
    enum connectionTypes { INPUT_VALUE, OUTPUT_VALUE, NEXT_STATEMENT, PREVIOUS_STATEMENT } 
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

declare module Blockly.constants {

    /**
     * Enum for alignment of inputs.
     * @enum {number}
     */
    enum ALIGN { LEFT, CENTRE, RIGHT } 

    /**
     * The language-neutral ID given to the collapsed input.
     * @const {string}
     */
    var COLLAPSED_INPUT_NAME: any /*missing*/;

    /**
     * The language-neutral ID given to the collapsed field.
     * @const {string}
     */
    var COLLAPSED_FIELD_NAME: any /*missing*/;
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
     * @param {!Array<!Object>} options Array of menu options.
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


declare module Blockly.ContextMenuItems {

    /** Option to undo previous action. */
    function registerUndo(): void;

    /** Option to redo previous action. */
    function registerRedo(): void;

    /** Option to clean up blocks. */
    function registerCleanup(): void;

    /** Option to collapse all blocks. */
    function registerCollapse(): void;

    /** Option to expand all blocks. */
    function registerExpand(): void;

    /** Option to delete all blocks. */
    function registerDeleteAll(): void;

    /** Option to duplicate a block. */
    function registerDuplicate(): void;

    /** Option to add or remove block-level comment. */
    function registerComment(): void;

    /** Option to inline variables. */
    function registerInline(): void;

    /** Option to collapse or expand a block. */
    function registerCollapseExpandBlock(): void;

    /** Option to disable or enable a block. */
    function registerDisable(): void;

    /** Option to delete a block. */
    function registerDelete(): void;

    /** Option to open help for a block. */
    function registerHelp(): void;

    /**
     * Registers all default context menu items. This should be called once per instance of
     * ContextMenuRegistry.
     * @package
     */
    function registerDefaultOptions(): void;
}


declare module Blockly {

    class ContextMenuRegistry extends ContextMenuRegistry__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ContextMenuRegistry__Class  { 
    
            /**
             * Class for the registry of context menu items. This is intended to be a
             * singleton. You should not create a new instance, and only access this class
             * from Blockly.ContextMenuRegistry.registry.
             * @constructor
             */
            constructor();
    
            /**
             * Registers a RegistryItem.
             * @param {!Blockly.ContextMenuRegistry.RegistryItem} item Context menu item to register.
             * @throws {Error} if an item with the given ID already exists.
             */
            register(item: Blockly.ContextMenuRegistry.RegistryItem): void;
    
            /**
             * Unregisters a RegistryItem with the given ID.
             * @param {string} id The ID of the RegistryItem to remove.
             * @throws {Error} if an item with the given ID does not exist.
             */
            unregister(id: string): void;
    
            /**
             * @param {string} id The ID of the RegistryItem to get.
             * @return {?Blockly.ContextMenuRegistry.RegistryItem} RegistryItem or null if not found
             */
            getItem(id: string): Blockly.ContextMenuRegistry.RegistryItem;
    
            /**
             * Gets the valid context menu options for the given scope type (e.g. block or workspace) and scope.
             * Blocks are only shown if the preconditionFn shows they should not be hidden.
             * @param {!Blockly.ContextMenuRegistry.ScopeType} scopeType Type of scope where menu should be
             *     shown (e.g. on a block or on a workspace)
             * @param {!Blockly.ContextMenuRegistry.Scope} scope Current scope of context menu
             *     (i.e., the exact workspace or block being clicked on)
             * @return {!Array<!Blockly.ContextMenuRegistry.ContextMenuOption>} the list of ContextMenuOptions
             */
            getContextMenuOptions(scopeType: Blockly.ContextMenuRegistry.ScopeType, scope: Blockly.ContextMenuRegistry.Scope): Blockly.ContextMenuRegistry.ContextMenuOption[];
    } 
    
}

declare module Blockly.ContextMenuRegistry {

    /**
     * Where this menu item should be rendered. If the menu item should be rendered in multiple
     * scopes, e.g. on both a block and a workspace, it should be registered for each scope.
     * @enum {string}
     */
    enum ScopeType { BLOCK, WORKSPACE } 

    /**
     * The actual workspace/block where the menu is being rendered. This is passed to callback and
     * displayText functions that depend on this information.
     * @typedef {{
     *    block: (Blockly.BlockSvg|undefined),
     *    workspace: (Blockly.WorkspaceSvg|undefined)
     * }}
     */
    interface Scope {
        block: Blockly.BlockSvg|any /*undefined*/;
        workspace: Blockly.WorkspaceSvg|any /*undefined*/
    }

    /**
     * A menu item as entered in the registry.
     * @typedef {{
     *    callback: function(!Blockly.ContextMenuRegistry.Scope),
     *    scopeType: !Blockly.ContextMenuRegistry.ScopeType,
     *    displayText: ((function(!Blockly.ContextMenuRegistry.Scope):string)|string),
     *    preconditionFn: function(!Blockly.ContextMenuRegistry.Scope):string,
     *    weight: number,
     *    id: string
     * }}
    */
    interface RegistryItem {
        callback: { (_0: Blockly.ContextMenuRegistry.Scope): any /*missing*/ };
        scopeType: Blockly.ContextMenuRegistry.ScopeType;
        displayText: { (_0: Blockly.ContextMenuRegistry.Scope): string }|string;
        preconditionFn: { (_0: Blockly.ContextMenuRegistry.Scope): string };
        weight: number;
        id: string
    }

    /**
     * A menu item as presented to contextmenu.js.
     * @typedef {{
     *    text: string,
     *    enabled: boolean,
     *    callback: function(!Blockly.ContextMenuRegistry.Scope),
     *    scope: !Blockly.ContextMenuRegistry.Scope,
     *    weight: number
     * }}
     */
    interface ContextMenuOption {
        text: string;
        enabled: boolean;
        callback: { (_0: Blockly.ContextMenuRegistry.Scope): any /*missing*/ };
        scope: Blockly.ContextMenuRegistry.Scope;
        weight: number
    }

    /**
     * Singleton instance of this class. All interactions with this class should be
     * done on this object.
     * @type {?Blockly.ContextMenuRegistry}
     */
    var registry: Blockly.ContextMenuRegistry;
}


declare module Blockly.Css {

    /**
     * Add some CSS to the blob that will be injected later.  Allows optional
     * components such as fields and the toolbox to store separate CSS.
     * The provided array of CSS will be destroyed by this function.
     * @param {!Array<string>} cssArray Array of CSS strings.
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
     * Array making up the CSS content for Blockly.
     */
    var CONTENT: any /*missing*/;
}


declare module Blockly {

    class DeleteArea extends DeleteArea__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class DeleteArea__Class extends Blockly.DragTarget__Class implements Blockly.IDeleteArea  { 
    
            /**
             * Abstract class for a component that can delete a block or bubble that is
             * dropped on top of it.
             * @extends {Blockly.DragTarget}
             * @implements {Blockly.IDeleteArea}
             * @constructor
             */
            constructor();
    
            /**
             * Whether the last block or bubble dragged over this delete area would be
             * deleted if dropped on this component.
             * This property is not updated after the block or bubble is deleted.
             * @type {boolean}
             * @protected
             */
            wouldDelete_: boolean;
    
            /**
             * Returns whether the provided block or bubble would be deleted if dropped on
             * this area.
             * This method should check if the element is deletable and is always called
             * before onDragEnter/onDragOver/onDragExit.
             * @param {!Blockly.IDraggable} element The block or bubble currently being
             *   dragged.
             * @param {boolean} couldConnect Whether the element could could connect to
             *     another.
             * @return {boolean} Whether the element provided would be deleted if dropped on
             *     this area.
             */
            wouldDelete(element: Blockly.IDraggable, couldConnect: boolean): boolean;
    
            /**
             * Updates the internal wouldDelete_ state.
             * @param {boolean} wouldDelete The new value for the wouldDelete state.
             * @protected
             */
            updateWouldDelete_(wouldDelete: boolean): void;
    } 
    
}


declare module Blockly {

    class DragTarget extends DragTarget__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class DragTarget__Class implements Blockly.IDragTarget  { 
    
            /**
             * Abstract class for a component with custom behaviour when a block or bubble
             * is dragged over or dropped on top of it.
             * @implements {Blockly.IDragTarget}
             * @constructor
             */
            constructor();
    
            /**
             * Returns the bounding rectangle of the drag target area in pixel units
             * relative to the Blockly injection div.
             * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
             *   target area should be ignored.
             */
            getClientRect(): Blockly.utils.Rect;
    
            /**
             * Handles when a cursor with a block or bubble enters this drag target.
             * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
             *   dragged.
             */
            onDragEnter(_dragElement: Blockly.IDraggable): void;
    
            /**
             * Handles when a cursor with a block or bubble is dragged over this drag
             * target.
             * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
             *   dragged.
             */
            onDragOver(_dragElement: Blockly.IDraggable): void;
    
            /**
             * Handles when a cursor with a block or bubble exits this drag target.
             * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
             *   dragged.
             */
            onDragExit(_dragElement: Blockly.IDraggable): void;
    
            /**
             * Handles when a block or bubble is dropped on this component.
             * Should not handle delete here.
             * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
             *   dragged.
             */
            onDrop(_dragElement: Blockly.IDraggable): void;
    
            /**
             * Returns whether the provided block or bubble should not be moved after being
             * dropped on this component. If true, the element will return to where it was
             * when the drag started.
             * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
             *   dragged.
             * @return {boolean} Whether the block or bubble provided should be returned to
             *     drag start.
             */
            shouldPreventMove(_dragElement: Blockly.IDraggable): boolean;
    } 
    
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
     * @param {!Array<string>=} opt_blockList A list of blocks to appear in the
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
     * @param {!Object<string, string>} lookupTable The table of field values to
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
    class Field__Class implements Blockly.IASTNodeLocationSvg, Blockly.IASTNodeLocationWithBlock, Blockly.IKeyboardAccessible, Blockly.IRegistrable  { 
    
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
             * @implements {Blockly.IKeyboardAccessible}
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
             * @return {?Function} Validation function, or null.
             */
            getValidator(): Function;
    
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
             * Sets the tooltip for this field.
             * @param {?Blockly.Tooltip.TipInfo} newTip The
             *     text for the tooltip, a function that returns the text for the tooltip, a
             *     parent object whose tooltip will be used, or null to display the tooltip
             *     of the parent block. To not display a tooltip pass the empty string.
             */
            setTooltip(newTip: Blockly.Tooltip.TipInfo): void;
    
            /**
             * Returns the tooltip text for this field.
             * @return {string} The tooltip text for this field.
             */
            getTooltip(): string;
    
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
             * Handles the given keyboard shortcut.
             * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} _shortcut The shortcut to be handled.
             * @return {boolean} True if the shortcut has been handled, false otherwise.
             * @public
             */
            onShortcut(_shortcut: Blockly.ShortcutRegistry.KeyboardShortcut): boolean;
    
            /**
             * Add the cursor SVG to this fields SVG group.
             * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
             *     field group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker SVG to this fields SVG group.
             * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
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
             * @type {?SVGElement}
             */
            gauge_: SVGElement;
    
            /**
             * The angle picker's line drawn representing the value's angle.
             * @type {?SVGElement}
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
             * @param {Array<string>} colours Array of colours for this block,
             *     or null to use default (Blockly.FieldColour.COLOURS).
             * @param {Array<string>=} opt_titles Optional array of colour tooltips,
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
     * @type {!Array<string>}
     */
    var COLOURS: string[];

    /**
     * An array of tooltip strings for the palette.  If not the same length as
     * COLOURS, the colour's hex code will be used for any missing titles.
     * All colour pickers use this unless overridden with setColours.
     * @type {!Array<string>}
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
             * @param {(!Array<!Array>|!Function)} menuGenerator A non-empty array of
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
             * @type {(!Array<!Array>|
             *    !function(this:Blockly.FieldDropdown): !Array<!Array>)}
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
             * The dropdown menu.
             * @type {?Blockly.Menu}
             * @protected
             */
            menu_: Blockly.Menu;
    
            /**
             * Sets the field's value based on the given XML element. Should only be
             * called by Blockly.Xml.
             * @param {!Element} fieldElement The element containing info about the
             *    field's state.
             * @package
             */
            fromXml(fieldElement: Element): void;
    
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
             * @return {!Array<!Array>} A non-empty array of option tuples:
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
     * @param {!Array<!Array>} options Array of option tuples:
     *     (human-readable text or image, language-neutral name).
     * @param {number} prefixLength The length of the common prefix.
     * @param {number} suffixLength The length of the common suffix
     * @return {!Array<!Array>} A new array with all of the option text trimmed.
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
             * Set the CSS class applied to the field's textElement_.
             * @param {?string} cssClass The new CSS class name, or null to remove.
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
             *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/multiline-text-input#creation}
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
             * Defines the maximum number of lines of field.
             * If exceeded, scrolling functionality is enabled.
             * @type {number}
             * @protected
             */
            maxLines_: number;
    
            /**
             * Whether Y overflow is currently occurring.
             * @type {boolean}
             * @protected
             */
            isOverflowedY_: boolean;
    
            /**
             * Serializes this field's value to XML. Should only be called by Blockly.Xml.
             * @param {!Element} fieldElement The element to populate with info about the
             *    field's state.
             * @return {!Element} The element containing info about the field's state.
             * @package
             */
            toXml(fieldElement: Element): Element;
    
            /**
             * Sets the field's value based on the given XML element. Should only be
             * called by Blockly.Xml.
             * @param {!Element} fieldElement The element containing info about the
             *    field's state.
             * @package
             */
            fromXml(fieldElement: Element): void;
    
            /**
             * Create the block UI for this field.
             * @package
             */
            initView(): void;
    
            /**
             * Called by setValue if the text input is valid. Updates the value of the
             * field, and updates the text of the field if it is not currently being
             * edited (i.e. handled by the htmlInput_). Is being redefined here to update
             * overflow state of the field.
             * @param {*} newValue The value to be saved. The default validator guarantees
             * that this is a string.
             * @protected
             */
            doValueUpdate_(newValue: any): void;
    
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
             * Sets the maxLines config for this field.
             * @param {number} maxLines Defines the maximum number of lines allowed,
             *     before scrolling functionality is enabled.
             */
            setMaxLines(maxLines: number): void;
    
            /**
             * Returns the maxLines config of this field.
             * @return {number} The maxLines config value.
             */
            getMaxLines(): number;
    
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
     * @param {!Blockly.IRegistrableField} fieldClass The field class containing a
     *     fromJson function that can construct an instance of the field.
     * @throws {Error} if the type name is empty, the field is already
     *     registered, or the fieldClass is not an object containing a fromJson
     *     function.
     */
    function register(type: string, fieldClass: Blockly.IRegistrableField): void;

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
     * @return {?Blockly.Field} The new field instance or null if a field wasn't
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
             * Closes the editor, saves the results, and disposes of any events or
             * DOM-references belonging to the editor.
             * @protected
             */
            widgetDispose_(): void;
    
            /**
             * Bind handlers for user input on the text input field's editor.
             * @param {!HTMLElement} htmlInput The htmlInput to which event
             *    handlers will be bound.
             * @protected
             */
            bindInputEvents_(htmlInput: HTMLElement): void;
    
            /**
             * Unbind handlers for user input and workspace size changes.
             * @protected
             */
            unbindInputEvents_(): void;
    
            /**
             * Handle key down to the editor.
             * @param {!Event} e Keyboard event.
             * @protected
             */
            onHtmlInputKeyDown_(e: Event): void;
    
            /**
             * Set the HTML input value and the field's internal value. The difference
             * between this and ``setValue`` is that this also updates the HTML input
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
             * Transform the provided value into a text to show in the HTML input.
             * Override this method if the field's HTML input representation is different
             * than the field's value. This should be coupled with an override of
             * `getValueFromEditorText_`.
             * @param {*} value The value stored in this field.
             * @return {string} The text to show on the HTML input.
             * @protected
             */
            getEditorText_(value: any): string;
    
            /**
             * Transform the text received from the HTML input into a value to store
             * in this field.
             * Override this method if the field's HTML input representation is different
             * than the field's value. This should be coupled with an override of
             * `getEditorText_`.
             * @param {string} text Text received from the HTML input.
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
             * @param {Array<string>=} opt_variableTypes A list of the types of variables
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
             * @type {(!Array<!Array>|
             *    !function(this:Blockly.FieldDropdown): !Array<!Array>)}
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
             * @return {?Blockly.VariableModel} The selected variable, or null if none was
             *     selected.
             * @package
             */
            getVariable(): Blockly.VariableModel;
    
            /**
             * Gets the validation function for this field, or null if not set.
             * Returns null if the variable is not set, because validators should not
             * run on the initial setValue call, because the field won't be attached to
             * a block and workspace at that point.
             * @return {?Function} Validation function, or null.
             */
            getValidator(): Function;
    
            /**
             * Ensure that the ID belongs to a valid variable of an allowed type.
             * @param {*=} opt_newValue The ID of the new variable to set.
             * @return {?string} The validated ID, or null if invalid.
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
     * @return {!Array<!Array>} Array of variable names/id tuples.
     * @this {Blockly.FieldVariable}
     */
    function dropdownCreate(): any[][];
}


declare module Blockly {

    class Flyout extends Flyout__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Flyout__Class extends Blockly.DeleteArea__Class implements Blockly.IFlyout  { 
    
            /**
             * Class for a flyout.
             * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
             *     workspace.
             * @constructor
             * @abstract
             * @implements {Blockly.IFlyout}
             * @extends {Blockly.DeleteArea}
             */
            constructor(workspaceOptions: Blockly.Options);
    
            /**
             * @type {!Blockly.WorkspaceSvg}
             * @protected
             */
            workspace_: Blockly.WorkspaceSvg;
    
            /**
             * The unique id for this component that is used to register with the
             * ComponentManager.
             * @type {string}
             */
            id: string;
    
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
             * @type {!Array<!Blockly.FlyoutButton>}
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
            SCROLLBAR_MARGIN: number;
    
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
             * either exist as its own SVG element or be a g element nested inside a
             * separate SVG element.
             * @param {string|
             * !Blockly.utils.Svg<!SVGSVGElement>|
             * !Blockly.utils.Svg<!SVGGElement>} tagName The type of tag to
             *     put the flyout in. This should be <svg> or <g>.
             * @return {!SVGElement} The flyout's SVG group.
             */
            createDom(tagName: string|Blockly.utils.Svg<SVGSVGElement>|Blockly.utils.Svg<SVGGElement>): SVGElement;
    
            /**
             * Initializes the flyout.
             * @param {!Blockly.WorkspaceSvg} targetWorkspace The workspace in which to
             *     create new blocks.
             */
            init(targetWorkspace: Blockly.WorkspaceSvg): void;
    
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
             * Get the scale (zoom level) of the flyout. By default,
             * this matches the target workspace scale, but this can be overridden.
             * @return {number} Flyout workspace scale.
             */
            getFlyoutScale(): number;
    
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
             * @param {!Blockly.utils.toolbox.FlyoutDefinition|string} flyoutDef Contents to display
             *     in the flyout. This is either an array of Nodes, a NodeList, a
             *     toolbox definition, or a string with the name of the dynamic category.
             */
            show(flyoutDef: Blockly.utils.toolbox.FlyoutDefinition|string): void;
    
            /**
             * Create a block from the xml and permanently disable any blocks that were
             * defined as disabled.
             * @param {!Element} blockXml The xml of the block.
             * @return {!Blockly.BlockSvg} The block created from the blockXml.
             * @protected
             */
            createBlock_(blockXml: Element): Blockly.BlockSvg;
    
            /**
             * Delete blocks, mats and buttons from a previous showing of the flyout.
             * @protected
             */
            clearOldBlocks_(): void;
    
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
             * Returns the bounding rectangle of the drag target area in pixel units
             * relative to viewport.
             * @return {Blockly.utils.Rect} The component's bounding box.
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
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Lay out the blocks in the flyout.
             * @param {!Array<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array<number>} gaps The visible gaps between blocks.
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
    
            /**
             * Calculates the x coordinate for the flyout position.
             * @return {number} X coordinate.
             */
            getX(): number;
    
            /**
             * Calculates the y coordinate for the flyout position.
             * @return {number} Y coordinate.
             */
            getY(): number;
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
             * @param {!Blockly.utils.toolbox.ButtonOrLabelInfo} json
             *    The JSON specifying the label/button.
             * @param {boolean} isLabel Whether this button should be styled as a label.
             * @constructor
             * @package
             */
            constructor(workspace: Blockly.WorkspaceSvg, targetWorkspace: Blockly.WorkspaceSvg, json: Blockly.utils.toolbox.ButtonOrLabelInfo, isLabel: boolean);
    
            /**
             * The JSON specifying the label / button.
             * @type {!Blockly.utils.toolbox.ButtonOrLabelInfo}
             */
            info: Blockly.utils.toolbox.ButtonOrLabelInfo;
    
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
             * @return {boolean} Whether or not the button is a label.
             */
            isLabel(): boolean;
    
            /**
             * Location of the button.
             * @return {!Blockly.utils.Coordinate} x, y coordinates.
             * @package
             */
            getPosition(): Blockly.utils.Coordinate;
    
            /**
             * @return {string} Text of the button.
             */
            getButtonText(): string;
    
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
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Calculates the x coordinate for the flyout position.
             * @return {number} X coordinate.
             */
            getX(): number;
    
            /**
             * Calculates the y coordinate for the flyout position.
             * @return {number} Y coordinate.
             */
            getY(): number;
    
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
             * @param {!Array<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array<number>} gaps The visible gaps between blocks.
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
             * Returns the bounding rectangle of the drag target area in pixel units
             * relative to viewport.
             * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
             *   target area should be ignored.
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
             * Sets the translation of the flyout to match the scrollbars.
             * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
             *     between 0 and 1 specifying the degree of scrolling and a
             *     similar x property.
             * @protected
             */
            setMetrics_(xyRatio: { x: number; y: number }): void;
    
            /**
             * Calculates the x coordinate for the flyout position.
             * @return {number} X coordinate.
             */
            getX(): number;
    
            /**
             * Calculates the y coordinate for the flyout position.
             * @return {number} Y coordinate.
             */
            getY(): number;
    
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
             * @param {!Array<!Object>} contents The blocks and buttons to lay out.
             * @param {!Array<number>} gaps The visible gaps between blocks.
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
             * Returns the bounding rectangle of the drag target area in pixel units
             * relative to viewport.
             * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
             *   target area should be ignored.
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

declare module Blockly.VerticalFlyout {

    /**
     * The name of the vertical flyout in the registry.
     * @type {string}
     */
    var registryName: string;
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
             * @type {!Array<!Array<number>>}
             */
            ORDER_OVERRIDES: number[][];
    
            /**
             * Whether the init method has been called.
             * Generators that set this flag to false after creation and true in init
             * will cause blockToCode to emit a warning if the generator has not been
             * initialized. If this flag is untouched, it will have no effect.
             * @type {?boolean}
             */
            isInitialized: boolean;
    
            /**
             * Generate code for all blocks in the workspace to the specified language.
             * @param {!Blockly.Workspace=} workspace Workspace to generate code from.
             * @return {string} Generated code.
             */
            workspaceToCode(workspace?: Blockly.Workspace): string;
    
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
             * The generator must be initialized before calling this function.
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
             * @type {!Object|undefined}
             * @protected
             */
            definitions_: Object|any /*undefined*/;
    
            /**
             * A dictionary mapping desired function names in definitions_ to actual
             * function names (to avoid collisions with user functions).
             * @type {!Object|undefined}
             * @protected
             */
            functionNames_: Object|any /*undefined*/;
    
            /**
             * A database of variable and procedure names.
             * @type {!Blockly.Names|undefined}
             * @protected
             */
            nameDB_: Blockly.Names|any /*undefined*/;
    
            /**
             * Define a developer-defined function (not a user-defined procedure) to be
             * included in the generated code.  Used for creating private helper functions.
             * The first time this is called with a given desiredName, the code is
             * saved and an actual name is generated.  Subsequent calls with the
             * same desiredName have no effect but have the same return value.
             *
             * It is up to the caller to make sure the same desiredName is not
             * used for different helper functions (e.g. use "colourRandom" and
             * "listRandom", not "random").  There is no danger of colliding with reserved
             * words, or user-defined variable or procedure names.
             *
             * The code gets output when Blockly.Generator.finish() is called.
             *
             * @param {string} desiredName The desired name of the function
             *     (e.g. mathIsPrime).
             * @param {!Array<string>} code A list of statements.  Use '  ' for indents.
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
             * Subclasses may override this, e.g. to prepend the generated code with import
             * statements or variable definitions.
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
             * @type {?Blockly.browserEvents.Data}
             * @protected
             */
            onMoveWrapper_: Blockly.browserEvents.Data;
    
            /**
             * A handle to use to unbind a mouse up listener at the end of a drag.
             * Opaque data returned from Blockly.bindEventWithChecks_.
             * @type {?Blockly.browserEvents.Data}
             * @protected
             */
            onUpWrapper_: Blockly.browserEvents.Data;
    
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
             * @param {!Blockly.IFlyout} flyout The flyout the event hit.
             * @package
             */
            handleFlyoutStart(e: Event, flyout: Blockly.IFlyout): void;
    
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
             * @param {!Blockly.IBubble} bubble The bubble the event hit.
             * @package
             */
            handleBubbleStart(e: Event, bubble: Blockly.IBubble): void;
    
            /**
             * Record the field that a gesture started on.
             * @param {Blockly.Field} field The field the gesture started on.
             * @package
             */
            setStartField(field: Blockly.Field): void;
    
            /**
             * Record the bubble that a gesture started on
             * @param {Blockly.IBubble} bubble The bubble the gesture started on.
             * @package
             */
            setStartBubble(bubble: Blockly.IBubble): void;
    
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
             * @return {!Array<!Blockly.BlockSvg>} A possibly empty list of insertion
             *     marker blocks.
             * @package
             */
            getInsertionMarkers(): Blockly.BlockSvg[];
    
            /**
             * Gets the current dragger if an item is being dragged. Null if nothing is
             * being dragged.
             * @return {!Blockly.WorkspaceDragger|!Blockly.BubbleDragger|!Blockly.IBlockDragger|null}
             *    The dragger that is currently in use or null if no drag is in progress.
             */
            getCurrentDragger(): Blockly.WorkspaceDragger|Blockly.BubbleDragger|Blockly.IBlockDragger|any /*null*/;
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
             * Get the ID of the pattern element, which should be randomized to avoid
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
             * The icon SVG group.
             * @type {?SVGGElement}
             */
            iconGroup_: SVGGElement;
    
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
             * @type {?Blockly.Bubble}
             * @protected
             */
            bubble_: Blockly.Bubble;
    
            /**
             * Absolute coordinate of icon's center.
             * @type {?Blockly.utils.Coordinate}
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
             * @return {?Blockly.utils.Coordinate} Object with x and y properties in
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
    
            /**
             * Show or hide the icon.
             * @param {boolean} visible True if the icon should be visible.
             */
            setVisible(visible: boolean): void;
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

    /**
     * Bumps the given object that has passed out of bounds.
     * @param {!Blockly.WorkspaceSvg} workspace The workspace containing the object.
     * @param {!Blockly.MetricsManager.ContainerRegion} scrollMetrics Scroll metrics
     *    in workspace coordinates.
     * @param {!Blockly.IBoundedElement} object The object to bump.
     * @return {boolean} True if block was bumped.
     * @package
     */
    function bumpObjectIntoBounds_(workspace: Blockly.WorkspaceSvg, scrollMetrics: Blockly.MetricsManager.ContainerRegion, object: Blockly.IBoundedElement): boolean;
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
    
            /** @type {!Array<!Blockly.Field>} */
            fieldRow: Blockly.Field[];
    
            /**
             * Alignment of input's fields (left, right or centre).
             * @type {number}
             */
            align: number;
    
            /**
             * Get the source block for this input.
             * @return {?Blockly.Block} The source block, or null if there is none.
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
             * @return {!Array<!Blockly.BlockSvg>} List of blocks to render.
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
             * @param {string|Array<string>|null} check Compatible value type or
             *     list of value types.  Null if all types are compatible.
             * @return {!Blockly.Input} The input being modified (to allow chaining).
             */
            setCheck(check: string|string[]|any /*null*/): Blockly.Input;
    
            /**
             * Change the alignment of the connection's field(s).
             * @param {number} align One of the values of Blockly.constants.ALIGN.
             *   In RTL mode directions are reversed, and ALIGN.RIGHT aligns to the left.
             * @return {!Blockly.Input} The input being modified (to allow chaining).
             */
            setAlign(align: number): Blockly.Input;
    
            /**
             * Changes the connection's shadow block.
             * @param {?Element} shadow DOM representation of a block or null.
             * @return {!Blockly.Input} The input being modified (to allow chaining).
             */
            setShadowDom(shadow: Element): Blockly.Input;
    
            /**
             * Returns the XML representation of the connection's shadow block.
             * @return {?Element} Shadow DOM representation of a block or null.
             */
            getShadowDom(): Element;
    
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

    /**
     * Enum for the type of a connection or input.
     * @enum {number}
     */
    enum inputTypes { VALUE, STATEMENT, DUMMY } 
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
             * @param {?Blockly.IDragTarget} dragTarget The drag target that the block is
             *     currently over.
             * @package
             */
            update(dxy: Blockly.utils.Coordinate, dragTarget: Blockly.IDragTarget): void;
    
            /**
             * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
             * or 2 insertion markers.
             * @return {!Array<!Blockly.BlockSvg>} A possibly empty list of insertion
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

    /**
     * An error message to throw if the block created by createMarkerBlock_ is
     * missing any components.
     * @type {string}
     * @const
     */
    var DUPLICATE_BLOCK_ERROR: string;
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
             * @param {string} id The ID of the marker to unregister.
             */
            unregisterMarker(id: string): void;
    
            /**
             * Get the cursor for the workspace.
             * @return {?Blockly.Cursor} The cursor for this workspace.
             */
            getCursor(): Blockly.Cursor;
    
            /**
             * Get a single marker that corresponds to the given ID.
             * @param {string} id A unique identifier for the marker.
             * @return {?Blockly.Marker} The marker that corresponds to the given ID,
             *     or null if none exists.
             */
            getMarker(id: string): Blockly.Marker;
    
            /**
             * Sets the cursor and initializes the drawer for use with keyboard navigation.
             * @param {Blockly.Cursor} cursor The cursor used to move around this workspace.
             */
            setCursor(cursor: Blockly.Cursor): void;
    
            /**
             * Add the cursor SVG to this workspace SVG group.
             * @param {?SVGElement} cursorSvg The SVG root of the cursor to be added to the
             *     workspace SVG group.
             * @package
             */
            setCursorSvg(cursorSvg: SVGElement): void;
    
            /**
             * Add the marker SVG to this workspaces SVG group.
             * @param {?SVGElement} markerSvg The SVG root of the marker to be added to the
             *     workspace SVG group.
             * @package
             */
            setMarkerSvg(markerSvg: SVGElement): void;
    
            /**
             * Redraw the attached cursor SVG if needed.
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

declare module Blockly.MarkerManager {

    /**
     * The name of the local marker.
     * @type {string}
     * @const
     */
    var LOCAL_MARKER: string;
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
             * @return {?Element} The DOM element.
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
             * @param {?Blockly.MenuItem} item Item to highlight, or null.
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
             * @return {?Element} The DOM element.
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

    class MetricsManager extends MetricsManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class MetricsManager__Class implements Blockly.IMetricsManager  { 
    
            /**
             * The manager for all workspace metrics calculations.
             * @param {!Blockly.WorkspaceSvg} workspace The workspace to calculate metrics
             *     for.
             * @implements {Blockly.IMetricsManager}
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg);
    
            /**
             * The workspace to calculate metrics for.
             * @type {!Blockly.WorkspaceSvg}
             * @protected
             */
            workspace_: Blockly.WorkspaceSvg;
    
            /**
             * Gets the dimensions of the given workspace component, in pixel coordinates.
             * @param {?Blockly.IToolbox|?Blockly.IFlyout} elem The element to get the
             *     dimensions of, or null.  It should be a toolbox or flyout, and should
             *     implement getWidth() and getHeight().
             * @return {!Blockly.utils.Size} An object containing width and height
             *     attributes, which will both be zero if elem did not exist.
             * @protected
             */
            getDimensionsPx_(elem: Blockly.IToolbox|Blockly.IFlyout): Blockly.utils.Size;
    
            /**
             * Gets the width and the height of the flyout on the workspace in pixel
             * coordinates. Returns 0 for the width and height if the workspace has a
             * category toolbox instead of a simple toolbox.
             * @param {boolean=} opt_own Whether to only return the workspace's own flyout.
             * @return {!Blockly.MetricsManager.ToolboxMetrics} The width and height of the
             *     flyout.
             * @public
             */
            getFlyoutMetrics(opt_own?: boolean): Blockly.MetricsManager.ToolboxMetrics;
    
            /**
             * Gets the width, height and position of the toolbox on the workspace in pixel
             * coordinates. Returns 0 for the width and height if the workspace has a simple
             * toolbox instead of a category toolbox. To get the width and height of a
             * simple toolbox @see {@link getFlyoutMetrics}.
             * @return {!Blockly.MetricsManager.ToolboxMetrics} The object with the width,
             *     height and position of the toolbox.
             * @public
             */
            getToolboxMetrics(): Blockly.MetricsManager.ToolboxMetrics;
    
            /**
             * Gets the width and height of the workspace's parent SVG element in pixel
             * coordinates. This area includes the toolbox and the visible workspace area.
             * @return {!Blockly.utils.Size} The width and height of the workspace's parent
             *     SVG element.
             * @public
             */
            getSvgMetrics(): Blockly.utils.Size;
    
            /**
             * Gets the absolute left and absolute top in pixel coordinates.
             * This is where the visible workspace starts in relation to the SVG container.
             * @return {!Blockly.MetricsManager.AbsoluteMetrics} The absolute metrics for
             *     the workspace.
             * @public
             */
            getAbsoluteMetrics(): Blockly.MetricsManager.AbsoluteMetrics;
    
            /**
             * Gets the metrics for the visible workspace in either pixel or workspace
             * coordinates. The visible workspace does not include the toolbox or flyout.
             * @param {boolean=} opt_getWorkspaceCoordinates True to get the view metrics in
             *     workspace coordinates, false to get them in pixel coordinates.
             * @return {!Blockly.MetricsManager.ContainerRegion} The width, height, top and
             *     left of the viewport in either workspace coordinates or pixel
             *     coordinates.
             * @public
             */
            getViewMetrics(opt_getWorkspaceCoordinates?: boolean): Blockly.MetricsManager.ContainerRegion;
    
            /**
             * Gets content metrics in either pixel or workspace coordinates.
             * The content area is a rectangle around all the top bounded elements on the
             * workspace (workspace comments and blocks).
             * @param {boolean=} opt_getWorkspaceCoordinates True to get the content metrics
             *     in workspace coordinates, false to get them in pixel coordinates.
             * @return {!Blockly.MetricsManager.ContainerRegion} The
             *     metrics for the content container.
             * @public
             */
            getContentMetrics(opt_getWorkspaceCoordinates?: boolean): Blockly.MetricsManager.ContainerRegion;
    
            /**
             * Returns whether the scroll area has fixed edges.
             * @return {boolean} Whether the scroll area has fixed edges.
             * @package
             */
            hasFixedEdges(): boolean;
    
            /**
             * Computes the fixed edges of the scroll area.
             * @param {!Blockly.MetricsManager.ContainerRegion=} opt_viewMetrics The view
             *     metrics if they have been previously computed. Passing in null may cause
             *     the view metrics to be computed again, if it is needed.
             * @return {!Blockly.MetricsManager.FixedEdges} The fixed edges of the scroll
             *     area.
             * @protected
             */
            getComputedFixedEdges_(opt_viewMetrics?: Blockly.MetricsManager.ContainerRegion): Blockly.MetricsManager.FixedEdges;
    
            /**
             * Returns the content area with added padding.
             * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The view
             *     metrics.
             * @param {!Blockly.MetricsManager.ContainerRegion} contentMetrics The content
             *     metrics.
             * @return {{top: number, bottom: number, left: number, right: number}} The
             *     padded content area.
             * @protected
             */
            getPaddedContent_(viewMetrics: Blockly.MetricsManager.ContainerRegion, contentMetrics: Blockly.MetricsManager.ContainerRegion): { top: number; bottom: number; left: number; right: number };
    
            /**
             * Returns the metrics for the scroll area of the workspace.
             * @param {boolean=} opt_getWorkspaceCoordinates True to get the scroll metrics
             *     in workspace coordinates, false to get them in pixel coordinates.
             * @param {!Blockly.MetricsManager.ContainerRegion=} opt_viewMetrics The view
             *     metrics if they have been previously computed. Passing in null may cause
             *     the view metrics to be computed again, if it is needed.
             * @param {!Blockly.MetricsManager.ContainerRegion=} opt_contentMetrics The
             *     content metrics if they have been previously computed. Passing in null
             *     may cause the content metrics to be computed again, if it is needed.
             * @return {!Blockly.MetricsManager.ContainerRegion} The metrics for the scroll
             *    container.
             */
            getScrollMetrics(opt_getWorkspaceCoordinates?: boolean, opt_viewMetrics?: Blockly.MetricsManager.ContainerRegion, opt_contentMetrics?: Blockly.MetricsManager.ContainerRegion): Blockly.MetricsManager.ContainerRegion;
    
            /**
             * Returns common metrics used by UI elements.
             * @return {!Blockly.MetricsManager.UiMetrics} The UI metrics.
             */
            getUiMetrics(): Blockly.MetricsManager.UiMetrics;
    
            /**
             * Returns an object with all the metrics required to size scrollbars for a
             * top level workspace.  The following properties are computed:
             * Coordinate system: pixel coordinates, -left, -up, +right, +down
             * .viewHeight: Height of the visible portion of the workspace.
             * .viewWidth: Width of the visible portion of the workspace.
             * .contentHeight: Height of the content.
             * .contentWidth: Width of the content.
             * .scrollHeight: Height of the scroll area.
             * .scrollWidth: Width of the scroll area.
             * .svgHeight: Height of the Blockly div (the view + the toolbox,
             *    simple or otherwise),
             * .svgWidth: Width of the Blockly div (the view + the toolbox,
             *    simple or otherwise),
             * .viewTop: Top-edge of the visible portion of the workspace, relative to
             *     the workspace origin.
             * .viewLeft: Left-edge of the visible portion of the workspace, relative to
             *     the workspace origin.
             * .contentTop: Top-edge of the content, relative to the workspace origin.
             * .contentLeft: Left-edge of the content relative to the workspace origin.
             * .scrollTop: Top-edge of the scroll area, relative to the workspace origin.
             * .scrollLeft: Left-edge of the scroll area relative to the workspace origin.
             * .absoluteTop: Top-edge of the visible portion of the workspace, relative
             *     to the blocklyDiv.
             * .absoluteLeft: Left-edge of the visible portion of the workspace, relative
             *     to the blocklyDiv.
             * .toolboxWidth: Width of the toolbox, if it exists.  Otherwise zero.
             * .toolboxHeight: Height of the toolbox, if it exists.  Otherwise zero.
             * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
             * .flyoutHeight: Height of the flyout if it is always open.  Otherwise zero.
             * .toolboxPosition: Top, bottom, left or right. Use TOOLBOX_AT constants to
             *     compare.
             * @return {!Blockly.utils.Metrics} Contains size and position metrics of a top
             *     level workspace.
             * @public
             */
            getMetrics(): Blockly.utils.Metrics;
    } 
    

    class FlyoutMetricsManager extends FlyoutMetricsManager__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class FlyoutMetricsManager__Class extends Blockly.MetricsManager__Class  { 
    
            /**
             * Calculates metrics for a flyout's workspace.
             * The metrics are mainly used to size scrollbars for the flyout.
             * @param {!Blockly.WorkspaceSvg} workspace The flyout's workspace.
             * @param {!Blockly.IFlyout} flyout The flyout.
             * @extends {Blockly.MetricsManager}
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, flyout: Blockly.IFlyout);
    
            /**
             * The flyout that owns the workspace to calculate metrics for.
             * @type {!Blockly.IFlyout}
             * @protected
             */
            flyout_: Blockly.IFlyout;
    } 
    
}

declare module Blockly.MetricsManager {

    /**
     * Describes the width, height and location of the toolbox on the main
     * workspace.
     * @typedef {{
     *            width: number,
     *            height: number,
     *            position: !Blockly.utils.toolbox.Position
     *          }}
     */
    interface ToolboxMetrics {
        width: number;
        height: number;
        position: Blockly.utils.toolbox.Position
    }

    /**
     * Describes where the viewport starts in relation to the workspace SVG.
     * @typedef {{
     *            left: number,
     *            top: number
     *          }}
     */
    interface AbsoluteMetrics {
        left: number;
        top: number
    }

    /**
     * All the measurements needed to describe the size and location of a container.
     * @typedef {{
     *            height: number,
     *            width: number,
     *            top: number,
     *            left: number
     *          }}
     */
    interface ContainerRegion {
        height: number;
        width: number;
        top: number;
        left: number
    }

    /**
     * Describes fixed edges of the workspace.
     * @typedef {{
     *            top: (number|undefined),
     *            bottom: (number|undefined),
     *            left: (number|undefined),
     *            right: (number|undefined)
     *          }}
     */
    interface FixedEdges {
        top: number|any /*undefined*/;
        bottom: number|any /*undefined*/;
        left: number|any /*undefined*/;
        right: number|any /*undefined*/
    }

    /**
     * Common metrics used for UI elements.
     * @typedef {{
     *            viewMetrics: !Blockly.MetricsManager.ContainerRegion,
     *            absoluteMetrics: !Blockly.MetricsManager.AbsoluteMetrics,
     *            toolboxMetrics: !Blockly.MetricsManager.ToolboxMetrics
     *          }}
     */
    interface UiMetrics {
        viewMetrics: Blockly.MetricsManager.ContainerRegion;
        absoluteMetrics: Blockly.MetricsManager.AbsoluteMetrics;
        toolboxMetrics: Blockly.MetricsManager.ToolboxMetrics
    }
}


declare module Blockly {

    class Mutator extends Mutator__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Mutator__Class extends Blockly.Icon__Class  { 
    
            /**
             * Class for a mutator dialog.
             * @param {!Array<string>} quarkNames List of names of sub-blocks for flyout.
             * @extends {Blockly.Icon}
             * @constructor
             */
            constructor(quarkNames: string[]);
    
            /**
             * Set the block this mutator is associated with.
             * @param {!Blockly.BlockSvg} block The block associated with this mutator.
             * @package
             */
            setBlock(block: Blockly.BlockSvg): void;
    
            /**
             * Returns the workspace inside this mutator icon's bubble.
             * @return {?Blockly.WorkspaceSvg} The workspace inside this mutator icon's
             *     bubble or null if the mutator isn't open.
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
     * @return {?Blockly.Workspace} The mutator's parent workspace or null.
     * @public
     */
    function findParentWs(workspace: Blockly.Workspace): Blockly.Workspace;
}


declare module Blockly {

    class Names extends Names__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Names__Class  { 
    
            /**
             * Class for a database of entity names (variables, procedures, etc).
             * @param {string} reservedWords A comma-separated string of words that are
             *     illegal for use as names in a language (e.g. 'new,if,this,...').
             * @param {string=} opt_variablePrefix Some languages need a '$' or a namespace
             *     before all variable names (but not procedure names).
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
             * Generate names for user variables, but only ones that are being used.
             * @param {!Blockly.Workspace} workspace Workspace to generate variables from.
             */
            populateVariables(workspace: Blockly.Workspace): void;
    
            /**
             * Generate names for procedures.
             * @param {!Blockly.Workspace} workspace Workspace to generate procedures from.
             */
            populateProcedures(workspace: Blockly.Workspace): void;
    
            /**
             * Convert a Blockly entity name to a legal exportable entity name.
             * @param {string} nameOrId The Blockly entity name (no constraints) or
             *     variable ID.
             * @param {string} realm The realm of entity in Blockly
             *     ('VARIABLE', 'PROCEDURE', 'DEVELOPER_VARIABLE', etc...).
             * @return {string} An entity name that is legal in the exported language.
             */
            getName(nameOrId: string, realm: string): string;
    
            /**
             * Return a list of all known user-created names in a specified realm.
             * @param {string} realm The realm of entity in Blockly
             *     ('VARIABLE', 'PROCEDURE', 'DEVELOPER_VARIABLE', etc...).
             * @return {!Array<string>} A list of Blockly entity names (no constraints).
             */
            getUserNames(realm: string): string[];
    
            /**
             * Convert a Blockly entity name to a legal exportable entity name.
             * Ensure that this is a new name not overlapping any previously defined name.
             * Also check against list of reserved words for the current language and
             * ensure name doesn't collide.
             * @param {string} name The Blockly entity name (no constraints).
             * @param {string} realm The realm of entity in Blockly
             *     ('VARIABLE', 'PROCEDURE', 'DEVELOPER_VARIABLE', etc...).
             * @return {string} An entity name that is legal in the exported language.
             */
            getDistinctName(name: string, realm: string): string;
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
    
            /** @type {?Object<string, number>} */
            maxInstances: { [key: string]: number };
    
            /** @type {string} */
            pathToMedia: string;
    
            /** @type {boolean} */
            hasCategories: boolean;
    
            /** @type {!Blockly.Options.MoveOptions} */
            moveOptions: Blockly.Options.MoveOptions;
    
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
    
            /** @type {?Blockly.utils.toolbox.ToolboxInfo} */
            languageTree: Blockly.utils.toolbox.ToolboxInfo;
    
            /** @type {!Blockly.Options.GridOptions} */
            gridOptions: Blockly.Options.GridOptions;
    
            /** @type {!Blockly.Options.ZoomOptions} */
            zoomOptions: Blockly.Options.ZoomOptions;
    
            /** @type {!Blockly.utils.toolbox.Position} */
            toolboxPosition: Blockly.utils.toolbox.Position;
    
            /** @type {!Blockly.Theme} */
            theme: Blockly.Theme;
    
            /** @type {string} */
            renderer: string;
    
            /** @type {?Object} */
            rendererOverrides: Object;
    
            /**
             * The SVG element for the grid pattern.
             * Created during injection.
             * @type {?SVGElement}
             */
            gridPattern: SVGElement;
    
            /**
             * The parent of the current workspace, or null if there is no parent
             * workspace.  We can assert that this is of type WorkspaceSvg as opposed to
             * Workspace as this is only used in a rendered workspace.
             * @type {Blockly.WorkspaceSvg}
             */
            parentWorkspace: Blockly.WorkspaceSvg;
    
            /**
             * Map of plugin type to name of registered plugin or plugin class.
             * @type {!Object<string, (function(new:?, ...?)|string)>}
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
     * Grid Options.
     * @typedef {{
     *     colour: string,
     *     length: number,
     *     snap: boolean,
     *     spacing: number
     * }}
     */
    interface GridOptions {
        colour: string;
        length: number;
        snap: boolean;
        spacing: number
    }

    /**
     * Move Options.
     * @typedef {{
     *     drag: boolean,
     *     scrollbars: (boolean | !Blockly.Options.ScrollbarOptions),
     *     wheel: boolean
     * }}
     */
    interface MoveOptions {
        drag: boolean;
        scrollbars: boolean|Blockly.Options.ScrollbarOptions;
        wheel: boolean
    }

    /**
     * Scrollbar Options.
     * @typedef {{
     *     horizontal: boolean,
     *     vertical: boolean
     * }}
     */
    interface ScrollbarOptions {
        horizontal: boolean;
        vertical: boolean
    }

    /**
     * Zoom Options.
     * @typedef {{
     *     controls: boolean,
     *     maxScale: number,
     *     minScale: number,
     *     pinch: boolean,
     *     scaleSpeed: number,
     *     startScale: number,
     *     wheel: boolean
     * }}
     */
    interface ZoomOptions {
        controls: boolean;
        maxScale: number;
        minScale: number;
        pinch: boolean;
        scaleSpeed: number;
        startScale: number;
        wheel: boolean
    }

    /**
     * Parse the provided toolbox tree into a consistent DOM format.
     * @param {?Node|?string} toolboxDef DOM tree of blocks, or text representation
     *    of same.
     * @return {?Node} DOM tree of blocks, or null.
     * @deprecated Use Blockly.utils.toolbox.parseToolboxTree. (2020 September 28)
     */
    function parseToolboxTree(toolboxDef: Node|string): Node;
}


declare module Blockly.uiPosition {

    /**
     * Enum for vertical positioning.
     * @enum {number}
     * @package
     */
    enum verticalPosition { TOP, BOTTOM } 

    /**
     * Enum for horizontal positioning.
     * @enum {number}
     * @package
     */
    enum horizontalPosition { LEFT, RIGHT } 

    /**
     * An object defining a horizontal and vertical positioning.
     * @typedef {{
     *   horizontal: !Blockly.uiPosition.horizontalPosition,
     *   vertical: !Blockly.uiPosition.verticalPosition
     * }}
     * @package
     */
    interface Position {
        horizontal: Blockly.uiPosition.horizontalPosition;
        vertical: Blockly.uiPosition.verticalPosition
    }

    /**
     * Enum for bump rules to use for dealing with collisions.
     * @enum {number}
     * @package
     */
    enum bumpDirection { UP, DOWN } 

    /**
     * Returns a rectangle representing reasonable position for where to place a UI
     * element of the specified size given the restraints and locations of the
     * scrollbars. This method does not take into account any already placed UI
     * elements.
     * @param {!Blockly.uiPosition.Position} position The starting
     *    horizontal and vertical position.
     * @param {!Blockly.utils.Size} size the size of the UI element to get a start
     *    position for.
     * @param {number} horizontalPadding The horizontal padding to use.
     * @param {number} verticalPadding The vertical padding to use.
     * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace UI metrics.
     * @param {!Blockly.WorkspaceSvg} workspace The workspace.
     * @return {!Blockly.utils.Rect} The suggested start position.
     * @package
     */
    function getStartPositionRect(position: Blockly.uiPosition.Position, size: Blockly.utils.Size, horizontalPadding: number, verticalPadding: number, metrics: Blockly.MetricsManager.UiMetrics, workspace: Blockly.WorkspaceSvg): Blockly.utils.Rect;

    /**
     * Returns a corner position that is on the opposite side of the workspace from
     * the toolbox.
     * If in horizontal orientation, defaults to the bottom corner. If in vertical
     * orientation, defaults to the right corner.
     * @param {!Blockly.WorkspaceSvg} workspace The workspace.
     * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
     * @return {!Blockly.uiPosition.Position} The suggested corner position.
     * @package
     */
    function getCornerOppositeToolbox(workspace: Blockly.WorkspaceSvg, metrics: Blockly.MetricsManager.UiMetrics): Blockly.uiPosition.Position;

    /**
     * Returns a position Rect based on a starting position that is bumped
     * so that it doesn't intersect with any of the provided savedPositions. This
     * method does not check that the bumped position is still within bounds.
     * @param {!Blockly.utils.Rect} startRect The starting position to use.
     * @param {number} margin The margin to use between elements when bumping.
     * @param {!Blockly.uiPosition.bumpDirection} bumpDirection The direction
     *    to bump if there is a collision with an existing UI element.
     * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
     *    represent the positions of UI elements already placed.
     * @return {!Blockly.utils.Rect} The suggested position rectangle.
     * @package
     */
    function bumpPositionRect(startRect: Blockly.utils.Rect, margin: number, bumpDirection: Blockly.uiPosition.bumpDirection, savedPositions: Blockly.utils.Rect[]): Blockly.utils.Rect;
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
     * @return {!Array<!Array<!Array>>} Pair of arrays, the
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
     * @return {!Array<!Element>} Array of XML block elements.
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
     * @return {!Array<!Blockly.Block>} Array of caller blocks.
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
     * @return {?Blockly.Block} The procedure definition block, or null not found.
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
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @param {?function(new:T, ...?)|Object} registryItem The class or object to
     *     register.
     * @param {boolean=} opt_allowOverrides True to prevent an error when overriding
     *     an already registered item.
     * @throws {Error} if the type or name is empty, a name with the given type has
     *     already been registered, or if the given class or object is not valid for
     * it's type.
     * @template T
     */
    function register<T>(type: string|Blockly.registry.Type<T>, name: string, registryItem: { (_0: any[]): any /*missing*/ }|Object, opt_allowOverrides?: boolean): void;

    /**
     * Unregisters the registry item with the given type and name.
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @template T
     */
    function unregister<T>(type: string|Blockly.registry.Type<T>, name: string): void;

    /**
     * Gets the registry item for the given name and type. This can be either a
     * class or an object.
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
     *     are unable to find the plugin.
     * @return {?function(new:T, ...?)|Object} The class or object with the given
     *     name and type or null if none exists.
     * @template T
     */
    function getItem_<T>(type: string|Blockly.registry.Type<T>, name: string, opt_throwIfMissing?: boolean): { (_0: any[]): any /*missing*/ }|Object;

    /**
     * Returns whether or not the registry contains an item with the given type and
     * name.
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @return {boolean} True if the registry has an item with the given type and
     *     name, false otherwise.
     * @template T
     */
    function hasItem<T>(type: string|Blockly.registry.Type<T>, name: string): boolean;

    /**
     * Gets the class for the given name and type.
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Field, Renderer)
     * @param {string} name The plugin's name. (Ex. field_angle, geras)
     * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
     *     are unable to find the plugin.
     * @return {?function(new:T, ...?)} The class with the given name and type or
     *     null if none exists.
     * @template T
     */
    function getClass<T>(type: string|Blockly.registry.Type<T>, name: string, opt_throwIfMissing?: boolean): { (_0: any[]): any /*missing*/ };

    /**
     * Gets the object for the given name and type.
     * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
     *     (e.g. Category)
     * @param {string} name The plugin's name. (Ex. logic_category)
     * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
     *     are unable to find the object.
     * @return {?T} The object with the given name and type or null if none exists.
     * @template T
     */
    function getObject<T>(type: string|Blockly.registry.Type<T>, name: string, opt_throwIfMissing?: boolean): T;

    /**
     * Gets the class from Blockly options for the given type.
     * This is used for plugins that override a built in feature. (e.g. Toolbox)
     * @param {!Blockly.registry.Type<T>} type The type of the plugin.
     * @param {!Blockly.Options} options The option object to check for the given
     *     plugin.
     * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
     *     are unable to find the plugin.
     * @return {?function(new:T, ...?)} The class for the plugin.
     * @template T
     */
    function getClassFromOptions<T>(type: Blockly.registry.Type<T>, options: Blockly.Options, opt_throwIfMissing?: boolean): { (_0: any[]): any /*missing*/ };
}

declare module Blockly.registry.Type {

    /** @type {!Blockly.registry.Type<Blockly.IConnectionChecker>} */
    var CONNECTION_CHECKER: Blockly.registry.Type<Blockly.IConnectionChecker>;

    /** @type {!Blockly.registry.Type<Blockly.Cursor>} */
    var CURSOR: Blockly.registry.Type<Blockly.Cursor>;

    /** @type {!Blockly.registry.Type<Blockly.Events.Abstract>} */
    var EVENT: Blockly.registry.Type<Blockly.Events.Abstract>;

    /** @type {!Blockly.registry.Type<Blockly.Field>} */
    var FIELD: Blockly.registry.Type<Blockly.Field>;

    /** @type {!Blockly.registry.Type<Blockly.blockRendering.Renderer>} */
    var RENDERER: Blockly.registry.Type<Blockly.blockRendering.Renderer>;

    /** @type {!Blockly.registry.Type<Blockly.IToolbox>} */
    var TOOLBOX: Blockly.registry.Type<Blockly.IToolbox>;

    /** @type {!Blockly.registry.Type<Blockly.Theme>} */
    var THEME: Blockly.registry.Type<Blockly.Theme>;

    /** @type {!Blockly.registry.Type<Blockly.ToolboxItem>} */
    var TOOLBOX_ITEM: Blockly.registry.Type<Blockly.ToolboxItem>;

    /** @type {!Blockly.registry.Type<Blockly.IFlyout>} */
    var FLYOUTS_VERTICAL_TOOLBOX: Blockly.registry.Type<Blockly.IFlyout>;

    /** @type {!Blockly.registry.Type<Blockly.IFlyout>} */
    var FLYOUTS_HORIZONTAL_TOOLBOX: Blockly.registry.Type<Blockly.IFlyout>;

    /** @type {!Blockly.registry.Type<Blockly.IMetricsManager>} */
    var METRICS_MANAGER: Blockly.registry.Type<Blockly.IMetricsManager>;

    /** @type {!Blockly.registry.Type<Blockly.IBlockDragger>} */
    var BLOCK_DRAGGER: Blockly.registry.Type<Blockly.IBlockDragger>;
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
             * @return {!Array<!Blockly.Block>} List of blocks to render.
             */
            startTrackingAll(): Blockly.Block[];
    
            /**
             * Check if the two connections can be dragged to connect to each other.
             * @param {!Blockly.Connection} candidate A nearby connection to check.
             * @param {number=} maxRadius The maximum radius allowed for connections, in
             *     workspace units.
             * @return {boolean} True if the connection is allowed, false otherwise.
             * @deprecated July 2020
             */
            isConnectionAllowed(candidate: Blockly.Connection, maxRadius?: number): boolean;
    
            /**
             * Behavior after a connection attempt fails.
             * Bumps this connection away from the other connection. Called when an
             * attempted connection fails.
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
             * @return {!Array<!Blockly.Connection>} List of connections.
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
             * @param {boolean=} addHorizontal Whether to add a horizontal scrollbar.
             *    Defaults to true.
             * @param {boolean=} addVertical Whether to add a vertical scrollbar. Defaults
             *    to true.
             * @param {string=} opt_class A class to be applied to these scrollbars.
             * @param {number=} opt_margin The margin to apply to these scrollbars.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, addHorizontal?: boolean, addVertical?: boolean, opt_class?: string, opt_margin?: number);
    
            /**
             * Dispose of this pair of scrollbars.
             * Unlink from all DOM elements to prevent memory leaks.
             * @suppress {checkTypes}
             */
            dispose(): void;
    
            /**
             * Recalculate both of the scrollbars' locations and lengths.
             * Also reposition the corner rectangle.
             */
            resize(): void;
    
            /**
             * Returns whether scrolling horizontally is enabled.
             * @return {boolean} True if horizontal scroll is enabled.
             */
            canScrollHorizontally(): boolean;
    
            /**
             * Returns whether scrolling vertically is enabled.
             * @return {boolean} True if vertical scroll is enabled.
             */
            canScrollVertically(): boolean;
    
            /**
             * Record the origin of the workspace that the scrollbar is in, in pixels
             * relative to the injection div origin. This is for times when the scrollbar is
             * used in an object whose origin isn't the same as the main workspace
             * (e.g. in a flyout.)
             * @param {number} x The x coordinate of the scrollbar's origin, in CSS pixels.
             * @param {number} y The y coordinate of the scrollbar's origin, in CSS pixels.
             * @package
             */
            setOrigin(x: number, y: number): void;
    
            /**
             * Set the handles of both scrollbars.
             * @param {number} x The horizontal content displacement, relative to the view
             *    in pixels.
             * @param {number} y The vertical content displacement, relative to the view in
             *    pixels.
             * @param {boolean} updateMetrics Whether to update metrics on this set call.
             *    Defaults to true.
             */
            set(x: number, y: number, updateMetrics: boolean): void;
    
            /**
             * Set the handle of the horizontal scrollbar to be at a certain position in
             *    CSS pixels relative to its parents.
             * @param {number} x Horizontal scroll value.
             */
            setX(x: number): void;
    
            /**
             * Set the handle of the vertical scrollbar to be at a certain position in
             *    CSS pixels relative to its parents.
             * @param {number} y Vertical scroll value.
             */
            setY(y: number): void;
    
            /**
             * Set whether this scrollbar's container is visible.
             * @param {boolean} visible Whether the container is visible.
             */
            setContainerVisible(visible: boolean): void;
    
            /**
             * If any of the scrollbars are visible. Non-paired scrollbars may disappear
             * when they aren't needed.
             * @return {boolean} True if visible.
             */
            isVisible(): boolean;
    
            /**
             * Recalculates the scrollbars' locations within their path and length.
             * This should be called when the contents of the workspace have changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeContent(hostMetrics: Blockly.utils.Metrics): void;
    
            /**
             * Recalculates the scrollbars' locations on the screen and path length.
             * This should be called when the layout or size of the window has changed.
             * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
             *     the required dimensions, possibly fetched from the host object.
             */
            resizeView(hostMetrics: Blockly.utils.Metrics): void;
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
             * @param {number=} opt_margin The margin to apply to this scrollbar.
             * @constructor
             */
            constructor(workspace: Blockly.WorkspaceSvg, horizontal: boolean, opt_pair?: boolean, opt_class?: string, opt_margin?: number);
    
            /**
             * The ratio of handle position offset to workspace content displacement.
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
             * @suppress {checkTypes}
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
             * Helper to calculate the ratio of handle position to scrollbar view size.
             * @return {number} Ratio.
             * @protected
             */
            getRatio_(): number;
    
            /**
             * Set the scrollbar handle's position.
             * @param {number} value The content displacement, relative to the view in
             *    pixels.
             * @param {boolean=} updateMetrics Whether to update metrics on this set call.
             *    Defaults to true.
             */
            set(value: number, updateMetrics?: boolean): void;
    
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

    /**
     * Default margin around the scrollbar (between the scrollbar and the edge of
     * the viewport in pixels).
     * @type {number}
     * @const
     * @package
     */
    var DEFAULT_SCROLLBAR_MARGIN: number;
}


declare module Blockly.ShortcutItems {

    /**
     * Object holding the names of the default shortcut items.
     * @enum {string}
     */
    enum names { ESCAPE, DELETE, COPY, CUT, PASTE, UNDO, REDO } 

    /** Keyboard shortcut to hide chaff on escape. */
    function registerEscape(): void;

    /** Keyboard shortcut to delete a block on delete or backspace */
    function registerDelete(): void;

    /** Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c. */
    function registerCopy(): void;

    /** Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x. */
    function registerCut(): void;

    /** Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v. */
    function registerPaste(): void;

    /** Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z. */
    function registerUndo(): void;

    /** Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z, or alt+shift+z. */
    function registerRedo(): void;

    /**
     * Registers all default keyboard shortcut item. This should be called once per instance of
     * KeyboardShortcutRegistry.
     * @package
     */
    function registerDefaultShortcuts(): void;
}


declare module Blockly {

    class ShortcutRegistry extends ShortcutRegistry__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class ShortcutRegistry__Class  { 
    
            /**
             * Class for the registry of keyboard shortcuts. This is intended to be a
             * singleton. You should not create a new instance, and only access this class
             * from Blockly.ShortcutRegistry.registry.
             * @constructor
             */
            constructor();
    
            /**
             * Registers a keyboard shortcut.
             * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The
             *     shortcut for this key code.
             * @param {boolean=} opt_allowOverrides True to prevent a warning when
             *     overriding an already registered item.
             * @throws {Error} if a shortcut with the same name already exists.
             * @public
             */
            register(shortcut: Blockly.ShortcutRegistry.KeyboardShortcut, opt_allowOverrides?: boolean): void;
    
            /**
             * Unregisters a keyboard shortcut registered with the given key code. This will
             * also remove any key mappings that reference this shortcut.
             * @param {string} shortcutName The name of the shortcut to unregister.
             * @return {boolean} True if an item was unregistered, false otherwise.
             * @public
             */
            unregister(shortcutName: string): boolean;
    
            /**
             * Adds a mapping between a keycode and a keyboard shortcut.
             * @param {string|Blockly.utils.KeyCodes} keyCode The key code for the keyboard
             *     shortcut. If registering a key code with a modifier (ex: ctrl+c) use
             *     Blockly.ShortcutRegistry.registry.createSerializedKey;
             * @param {string} shortcutName The name of the shortcut to execute when the
             *     given keycode is pressed.
             * @param {boolean=} opt_allowCollision True to prevent an error when adding a
             *     shortcut to a key that is already mapped to a shortcut.
             * @throws {Error} if the given key code is already mapped to a shortcut.
             * @public
             */
            addKeyMapping(keyCode: string|Blockly.utils.KeyCodes, shortcutName: string, opt_allowCollision?: boolean): void;
    
            /**
             * Removes a mapping between a keycode and a keyboard shortcut.
             * @param {string} keyCode The key code for the keyboard shortcut. If
             *     registering a key code with a modifier (ex: ctrl+c) use
             *     Blockly.ShortcutRegistry.registry.createSerializedKey;
             * @param {string} shortcutName The name of the shortcut to execute when the
             *     given keycode is pressed.
             * @param {boolean=} opt_quiet True to not console warn when there is no
             *     shortcut to remove.
             * @return {boolean} True if a key mapping was removed, false otherwise.
             * @public
             */
            removeKeyMapping(keyCode: string, shortcutName: string, opt_quiet?: boolean): boolean;
    
            /**
             * Removes all the key mappings for a shortcut with the given name.
             * Useful when changing the default key mappings and the key codes registered to the shortcut are
             * unknown.
             * @param {string} shortcutName The name of the shortcut to remove from the key map.
             * @public
             */
            removeAllKeyMappings(shortcutName: string): void;
    
            /**
             * Sets the key map. Setting the key map will override any default key mappings.
             * @param {!Object<string, !Array<string>>} keyMap The object with key code to
             *     shortcut names.
             * @public
             */
            setKeyMap(keyMap: { [key: string]: string[] }): void;
    
            /**
             * Gets the current key map.
             * @return {!Object<string,!Array<!Blockly.ShortcutRegistry.KeyboardShortcut>>}
             *     The object holding key codes to Blockly.ShortcutRegistry.KeyboardShortcut.
             * @public
             */
            getKeyMap(): { [key: string]: Blockly.ShortcutRegistry.KeyboardShortcut[] };
    
            /**
             * Gets the registry of keyboard shortcuts.
             * @return {!Object<string, !Blockly.ShortcutRegistry.KeyboardShortcut>}
             *     The registry of keyboard shortcuts.
             * @public
             */
            getRegistry(): { [key: string]: Blockly.ShortcutRegistry.KeyboardShortcut };
    
            /**
             * Handles key down events.
             * @param {!Blockly.Workspace} workspace The main workspace where the event was
             *     captured.
             * @param {!Event} e The key down event.
             * @return {boolean} True if the event was handled, false otherwise.
             * @public
             */
            onKeyDown(workspace: Blockly.Workspace, e: Event): boolean;
    
            /**
             * Gets the shortcuts registered to the given key code.
             * @param {string} keyCode The serialized key code.
             * @return {!Array<string>|undefined} The list of shortcuts to call when the
             *     given keyCode is used. Undefined if no shortcuts exist.
             * @public
             */
            getShortcutNamesByKeyCode(keyCode: string): string[]|any /*undefined*/;
    
            /**
             * Gets the serialized key codes that the shortcut with the given name is
             * registered under.
             * @param {string} shortcutName The name of the shortcut.
             * @return {!Array<string>} An array with all the key codes the shortcut is
             *     registered under.
             * @public
             */
            getKeyCodesByShortcutName(shortcutName: string): string[];
    
            /**
             * Creates the serialized key code that will be used in the key map.
             * @param {number} keyCode Number code representing the key.
             * @param {?Array<string>} modifiers List of modifier key codes to be used with
             *     the key. All valid modifiers can be found in the
             *     Blockly.ShortcutRegistry.modifierKeys.
             * @return {string} The serialized key code for the given modifiers and key.
             * @public
             */
            createSerializedKey(keyCode: number, modifiers: string[]): string;
    } 
    
}

declare module Blockly.ShortcutRegistry {

    /**
     * Enum of valid modifiers.
     * @enum {!Blockly.utils.KeyCodes<number>}
     */
    enum modifierKeys { Shift, Control, Alt, Meta } 

    /**
     * A keyboard shortcut.
     * @typedef {{
     *    callback: ((function(!Blockly.Workspace, Event,
     * !Blockly.ShortcutRegistry.KeyboardShortcut):boolean)|undefined),
     *    name: string,
     *    preconditionFn: ((function(!Blockly.Workspace):boolean)|undefined),
     *    metadata: (Object|undefined)
     * }}
     */
    interface KeyboardShortcut {
        callback: { (_0: Blockly.Workspace, _1: Event, _2: Blockly.ShortcutRegistry.KeyboardShortcut): boolean }|any /*undefined*/;
        name: string;
        preconditionFn: { (_0: Blockly.Workspace): boolean }|any /*undefined*/;
        metadata: Object|any /*undefined*/
    }
}


declare module Blockly {

    class Theme extends Theme__Class { }
    /** Fake class which should be extended to avoid inheriting static properties */
    class Theme__Class  { 
    
            /**
             * Class for a theme.
             * @param {string} name Theme name.
             * @param {!Object<string, Blockly.Theme.BlockStyle>=} opt_blockStyles A map
             *     from style names (strings) to objects with style attributes for blocks.
             * @param {!Object<string, Blockly.Theme.CategoryStyle>=} opt_categoryStyles A
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
             * @type {!Object<string, !Blockly.Theme.BlockStyle>}
             * @package
             */
            blockStyles: { [key: string]: Blockly.Theme.BlockStyle };
    
            /**
             * The category styles map.
             * @type {!Object<string, Blockly.Theme.CategoryStyle>}
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
     * @param {string} name 