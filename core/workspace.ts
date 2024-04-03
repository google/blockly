/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a workspace.
 *
 * @class
 */
// Former goog.module ID: Blockly.Workspace

// Unused import preserved for side-effects. Remove if unneeded.
import './connection_checker.js';

import type {Block} from './block.js';
import type {BlocklyOptions} from './blockly_options.js';
import type {ConnectionDB} from './connection_db.js';
import type {Abstract} from './events/events_abstract.js';
import * as common from './common.js';
import * as eventUtils from './events/utils.js';
import type {IASTNodeLocation} from './interfaces/i_ast_node_location.js';
import type {IConnectionChecker} from './interfaces/i_connection_checker.js';
import {Options} from './options.js';
import * as registry from './registry.js';
import * as arrayUtils from './utils/array.js';
import * as idGenerator from './utils/idgenerator.js';
import * as math from './utils/math.js';
import type * as toolbox from './utils/toolbox.js';
import {VariableMap} from './variable_map.js';
import type {VariableModel} from './variable_model.js';
import type {WorkspaceComment} from './workspace_comment.js';
import {IProcedureMap} from './interfaces/i_procedure_map.js';
import {ObservableProcedureMap} from './observable_procedure_map.js';

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 */
export class Workspace implements IASTNodeLocation {
  /**
   * Angle away from the horizontal to sweep for blocks.  Order of execution is
   * generally top to bottom, but a small angle changes the scan to give a bit
   * of a left to right bias (reversed in RTL).  Units are in degrees. See:
   * https://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling
   */
  static SCAN_ANGLE = 3;
  id: string;
  options: Options;
  RTL: boolean;
  horizontalLayout: boolean;
  toolboxPosition: toolbox.Position;

  /**
   * Returns `true` if the workspace is visible and `false` if it's headless.
   */
  rendered = false;

  /**
   * Is this workspace the surface for a flyout?
   *
   * @internal
   */
  internalIsFlyout = false;

  /** Is this workspace the surface for a flyout? */
  get isFlyout(): boolean {
    return this.internalIsFlyout;
  }

  /**
   * Is this workspace the surface for a mutator?
   *
   * @internal
   */
  internalIsMutator = false;

  /** Is this workspace the surface for a mutator? */
  get isMutator(): boolean {
    return this.internalIsMutator;
  }

  /**
   * Returns `true` if the workspace is currently in the process of a bulk
   * clear.
   *
   * @internal
   */
  isClearing = false;

  /**
   * Maximum number of undo events in stack. `0` turns off undo, `Infinity`
   * sets it to unlimited.
   */
  MAX_UNDO = 1024;

  /** Set of databases for rapid lookup of connection locations. */
  connectionDBList: ConnectionDB[] = [];
  connectionChecker: IConnectionChecker;

  private readonly topBlocks: Block[] = [];
  private readonly topComments: WorkspaceComment[] = [];
  private readonly commentDB = new Map<string, WorkspaceComment>();
  private readonly listeners: Function[] = [];
  protected undoStack_: Abstract[] = [];
  protected redoStack_: Abstract[] = [];
  private readonly blockDB = new Map<string, Block>();
  private readonly typedBlocksDB = new Map<string, Block[]>();
  private variableMap: VariableMap;
  private procedureMap: IProcedureMap = new ObservableProcedureMap();

  /**
   * Blocks in the flyout can refer to variables that don't exist in the main
   * workspace.  For instance, the "get item in list" block refers to an
   * "item" variable regardless of whether the variable has been created yet.
   * A FieldVariable must always refer to a VariableModel.  We reconcile
   * these by tracking "potential" variables in the flyout.  These variables
   * become real when references to them are dragged into the main workspace.
   */
  private potentialVariableMap: VariableMap | null = null;

  /** @param opt_options Dictionary of options. */
  constructor(opt_options?: Options) {
    this.id = idGenerator.genUid();
    common.registerWorkspace(this);
    this.options = opt_options || new Options({} as BlocklyOptions);
    this.RTL = !!this.options.RTL;
    this.horizontalLayout = !!this.options.horizontalLayout;
    this.toolboxPosition = this.options.toolboxPosition;

    const connectionCheckerClass = registry.getClassFromOptions(
      registry.Type.CONNECTION_CHECKER,
      this.options,
      true,
    );
    /**
     * An object that encapsulates logic for safety, type, and dragging checks.
     */
    this.connectionChecker = new connectionCheckerClass!(this);

    /**
     * A map from variable type to list of variable names.  The lists contain
     * all of the named variables in the workspace, including variables that are
     * not currently in use.
     */
    this.variableMap = new VariableMap(this);
  }

  /**
   * Dispose of this workspace.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose() {
    this.listeners.length = 0;
    this.clear();
    // Remove from workspace database.
    common.unregisterWorkpace(this);
  }

  /**
   * Compare function for sorting objects (blocks, comments, etc) by position;
   *    top to bottom (with slight LTR or RTL bias).
   *
   * @param a The first object to compare.
   * @param b The second object to compare.
   * @returns The comparison value. This tells Array.sort() how to change object
   *     a's index.
   */
  private sortObjects_(
    a: Block | WorkspaceComment,
    b: Block | WorkspaceComment,
  ): number {
    const offset =
      Math.sin(math.toRadians(Workspace.SCAN_ANGLE)) * (this.RTL ? -1 : 1);
    const aXY = a.getRelativeToSurfaceXY();
    const bXY = b.getRelativeToSurfaceXY();
    return aXY.y + offset * aXY.x - (bXY.y + offset * bXY.x);
  }

  /**
   * Adds a block to the list of top blocks.
   *
   * @param block Block to add.
   */
  addTopBlock(block: Block) {
    this.topBlocks.push(block);
  }

  /**
   * Removes a block from the list of top blocks.
   *
   * @param block Block to remove.
   */
  removeTopBlock(block: Block) {
    if (!arrayUtils.removeElem(this.topBlocks, block)) {
      throw Error("Block not present in workspace's list of top-most blocks.");
    }
  }

  /**
   * Finds the top-level blocks and returns them.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param ordered Sort the list if true.
   * @returns The top-level block objects.
   */
  getTopBlocks(ordered = false): Block[] {
    // Copy the topBlocks list.
    const blocks = new Array<Block>().concat(this.topBlocks);
    if (ordered && blocks.length > 1) {
      blocks.sort(this.sortObjects_.bind(this));
    }
    return blocks;
  }

  /**
   * Add a block to the list of blocks keyed by type.
   *
   * @param block Block to add.
   */
  addTypedBlock(block: Block) {
    if (!this.typedBlocksDB.has(block.type)) {
      this.typedBlocksDB.set(block.type, []);
    }
    this.typedBlocksDB.get(block.type)!.push(block);
  }

  /**
   * Remove a block from the list of blocks keyed by type.
   *
   * @param block Block to remove.
   */
  removeTypedBlock(block: Block) {
    arrayUtils.removeElem(this.typedBlocksDB.get(block.type)!, block);
    if (!this.typedBlocksDB.get(block.type)!.length) {
      this.typedBlocksDB.delete(block.type);
    }
  }

  /**
   * Finds the blocks with the associated type and returns them. Blocks are
   * optionally sorted by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param type The type of block to search for.
   * @param ordered Sort the list if true.
   * @returns The blocks of the given type.
   */
  getBlocksByType(type: string, ordered = false): Block[] {
    if (!this.typedBlocksDB.has(type)) {
      return [];
    }
    const blocks = this.typedBlocksDB.get(type)!.slice(0);
    if (ordered && blocks && blocks.length > 1) {
      blocks.sort(this.sortObjects_.bind(this));
    }

    return blocks.filter(function (block: Block) {
      return !block.isInsertionMarker();
    });
  }

  /**
   * Adds a comment to the list of top comments.
   *
   * @param comment comment to add.
   * @internal
   */
  addTopComment(comment: WorkspaceComment) {
    this.topComments.push(comment);

    // Note: If the comment database starts to hold block comments, this may
    // need to move to a separate function.
    if (this.commentDB.has(comment.id)) {
      console.warn(
        'Overriding an existing comment on this workspace, with id "' +
          comment.id +
          '"',
      );
    }
    this.commentDB.set(comment.id, comment);
  }

  /**
   * Removes a comment from the list of top comments.
   *
   * @param comment comment to remove.
   * @internal
   */
  removeTopComment(comment: WorkspaceComment) {
    if (!arrayUtils.removeElem(this.topComments, comment)) {
      throw Error(
        "Comment not present in workspace's list of top-most " + 'comments.',
      );
    }
    // Note: If the comment database starts to hold block comments, this may
    // need to move to a separate function.
    this.commentDB.delete(comment.id);
  }

  /**
   * Finds the top-level comments and returns them.  Comments are optionally
   * sorted by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param ordered Sort the list if true.
   * @returns The top-level comment objects.
   * @internal
   */
  getTopComments(ordered = false): WorkspaceComment[] {
    // Copy the topComments list.
    const comments = new Array<WorkspaceComment>().concat(this.topComments);
    if (ordered && comments.length > 1) {
      comments.sort(this.sortObjects_.bind(this));
    }
    return comments;
  }

  /**
   * Find all blocks in workspace.  Blocks are optionally sorted
   * by position; top to bottom (with slight LTR or RTL bias).
   *
   * @param ordered Sort the list if true.
   * @returns Array of blocks.
   */
  getAllBlocks(ordered = false): Block[] {
    let blocks: Block[];
    if (ordered) {
      // Slow, but ordered.
      const topBlocks = this.getTopBlocks(true);
      blocks = [];
      for (let i = 0; i < topBlocks.length; i++) {
        blocks.push(...topBlocks[i].getDescendants(true));
      }
    } else {
      // Fast, but in no particular order.
      blocks = this.getTopBlocks(false);
      for (let i = 0; i < blocks.length; i++) {
        blocks.push(...blocks[i].getChildren(false));
      }
    }

    // Insertion markers exist on the workspace for rendering reasons, but
    // aren't "real" blocks from a developer perspective.
    const filtered = blocks.filter(function (block) {
      return !block.isInsertionMarker();
    });

    return filtered;
  }

  /** Dispose of all blocks and comments in workspace. */
  clear() {
    this.isClearing = true;
    try {
      const existingGroup = eventUtils.getGroup();
      if (!existingGroup) {
        eventUtils.setGroup(true);
      }
      while (this.topBlocks.length) {
        this.topBlocks[0].dispose(false);
      }
      while (this.topComments.length) {
        this.topComments[this.topComments.length - 1].dispose();
      }
      eventUtils.setGroup(existingGroup);
      this.variableMap.clear();
      if (this.potentialVariableMap) {
        this.potentialVariableMap.clear();
      }
    } finally {
      this.isClearing = false;
    }
  }

  /* Begin functions that are just pass-throughs to the variable map. */
  /**
   * Rename a variable by updating its name in the variable map. Identify the
   * variable to rename with the given ID.
   *
   * @param id ID of the variable to rename.
   * @param newName New variable name.
   */
  renameVariableById(id: string, newName: string) {
    this.variableMap.renameVariableById(id, newName);
  }

  /**
   * Create a variable with a given name, optional type, and optional ID.
   *
   * @param name The name of the variable. This must be unique across variables
   *     and procedures.
   * @param opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param opt_id The unique ID of the variable. This will default to a UUID.
   * @returns The newly created variable.
   */
  createVariable(
    name: string,
    opt_type?: string | null,
    opt_id?: string | null,
  ): VariableModel {
    return this.variableMap.createVariable(name, opt_type, opt_id);
  }

  /**
   * Find all the uses of the given variable, which is identified by ID.
   *
   * @param id ID of the variable to find.
   * @returns Array of block usages.
   */
  getVariableUsesById(id: string): Block[] {
    return this.variableMap.getVariableUsesById(id);
  }

  /**
   * Delete a variables by the passed in ID and all of its uses from this
   * workspace. May prompt the user for confirmation.
   *
   * @param id ID of variable to delete.
   */
  deleteVariableById(id: string) {
    this.variableMap.deleteVariableById(id);
  }

  /**
   * Find the variable by the given name and return it. Return null if not
   * found.
   *
   * @param name The name to check for.
   * @param opt_type The type of the variable.  If not provided it defaults to
   *     the empty string, which is a specific type.
   * @returns The variable with the given name.
   */
  getVariable(name: string, opt_type?: string): VariableModel | null {
    // TODO (#1559): Possibly delete this function after resolving #1559.
    return this.variableMap.getVariable(name, opt_type);
  }

  /**
   * Find the variable by the given ID and return it. Return null if not found.
   *
   * @param id The ID to check for.
   * @returns The variable with the given ID.
   */
  getVariableById(id: string): VariableModel | null {
    return this.variableMap.getVariableById(id);
  }

  /**
   * Find the variable with the specified type. If type is null, return list of
   *     variables with empty string type.
   *
   * @param type Type of the variables to find.
   * @returns The sought after variables of the passed in type. An empty array
   *     if none are found.
   */
  getVariablesOfType(type: string | null): VariableModel[] {
    return this.variableMap.getVariablesOfType(type);
  }

  /**
   * Return all variable types.
   *
   * @returns List of variable types.
   * @internal
   */
  getVariableTypes(): string[] {
    return this.variableMap.getVariableTypes(this);
  }

  /**
   * Return all variables of all types.
   *
   * @returns List of variable models.
   */
  getAllVariables(): VariableModel[] {
    return this.variableMap.getAllVariables();
  }

  /**
   * Returns all variable names of all types.
   *
   * @returns List of all variable names of all types.
   */
  getAllVariableNames(): string[] {
    return this.variableMap.getAllVariableNames();
  }
  /* End functions that are just pass-throughs to the variable map. */
  /**
   * Returns the horizontal offset of the workspace.
   * Intended for LTR/RTL compatibility in XML.
   * Not relevant for a headless workspace.
   *
   * @returns Width.
   */
  getWidth(): number {
    return 0;
  }

  /* eslint-disable jsdoc/require-returns-check */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Obtain a newly created block.
   *
   * @param prototypeName Name of the language object containing type-specific
   *     functions for this block.
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   * @returns The created block.
   */
  newBlock(prototypeName: string, opt_id?: string): Block {
    throw new Error(
      'The implementation of newBlock should be ' +
        'monkey-patched in by blockly.ts',
    );
  }
  /* eslint-enable */

  /**
   * The number of blocks that may be added to the workspace before reaching
   *     the maxBlocks.
   *
   * @returns Number of blocks left.
   */
  remainingCapacity(): number {
    if (isNaN(this.options.maxBlocks)) {
      return Infinity;
    }

    return this.options.maxBlocks - this.getAllBlocks(false).length;
  }

  /**
   * The number of blocks of the given type that may be added to the workspace
   *    before reaching the maxInstances allowed for that type.
   *
   * @param type Type of block to return capacity for.
   * @returns Number of blocks of type left.
   */
  remainingCapacityOfType(type: string): number {
    if (!this.options.maxInstances) {
      return Infinity;
    }

    const maxInstanceOfType =
      this.options.maxInstances[type] !== undefined
        ? this.options.maxInstances[type]
        : Infinity;

    return maxInstanceOfType - this.getBlocksByType(type, false).length;
  }

  /**
   * Check if there is remaining capacity for blocks of the given counts to be
   *    created. If the total number of blocks represented by the map is more
   * than the total remaining capacity, it returns false. If a type count is
   * more than the remaining capacity for that type, it returns false.
   *
   * @param typeCountsMap A map of types to counts (usually representing blocks
   *     to be created).
   * @returns True if there is capacity for the given map, false otherwise.
   */
  isCapacityAvailable(typeCountsMap: {[key: string]: number}): boolean {
    if (!this.hasBlockLimits()) {
      return true;
    }
    let copyableBlocksCount = 0;
    for (const type in typeCountsMap) {
      if (typeCountsMap[type] > this.remainingCapacityOfType(type)) {
        return false;
      }
      copyableBlocksCount += typeCountsMap[type];
    }
    if (copyableBlocksCount > this.remainingCapacity()) {
      return false;
    }
    return true;
  }

  /**
   * Checks if the workspace has any limits on the maximum number of blocks,
   *    or the maximum number of blocks of specific types.
   *
   * @returns True if it has block limits, false otherwise.
   */
  hasBlockLimits(): boolean {
    return this.options.maxBlocks !== Infinity || !!this.options.maxInstances;
  }

  /**
   * Gets the undo stack for workplace.
   *
   * @returns undo stack
   * @internal
   */
  getUndoStack(): Abstract[] {
    return this.undoStack_;
  }

  /**
   * Gets the redo stack for workplace.
   *
   * @returns redo stack
   * @internal
   */
  getRedoStack(): Abstract[] {
    return this.redoStack_;
  }

  /**
   * Undo or redo the previous action.
   *
   * @param redo False if undo, true if redo.
   */
  undo(redo: boolean) {
    const inputStack = redo ? this.redoStack_ : this.undoStack_;
    const outputStack = redo ? this.undoStack_ : this.redoStack_;
    const inputEvent = inputStack.pop();
    if (!inputEvent) {
      return;
    }
    let events = [inputEvent];
    // Do another undo/redo if the next one is of the same group.
    while (
      inputStack.length &&
      inputEvent.group &&
      inputEvent.group === inputStack[inputStack.length - 1].group
    ) {
      const event = inputStack.pop();
      if (!event) continue;
      events.push(event);
    }
    // Push these popped events on the opposite stack.
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      outputStack.push(event);
    }
    events = eventUtils.filter(events, redo);
    eventUtils.setRecordUndo(false);
    try {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        event.run(redo);
      }
    } finally {
      eventUtils.setRecordUndo(true);
    }
  }

  /** Clear the undo/redo stacks. */
  clearUndo() {
    this.undoStack_.length = 0;
    this.redoStack_.length = 0;
    // Stop any events already in the firing queue from being undoable.
    eventUtils.clearPendingUndo();
  }

  /**
   * When something in this workspace changes, call a function.
   * Note that there may be a few recent events already on the stack.  Thus the
   * new change listener might be called with events that occurred a few
   * milliseconds before the change listener was added.
   *
   * @param func Function to call.
   * @returns Obsolete return value, ignore.
   */
  addChangeListener(func: (e: Abstract) => void): Function {
    this.listeners.push(func);
    return func;
  }

  /**
   * Stop listening for this workspace's changes.
   *
   * @param func Function to stop calling.
   */
  removeChangeListener(func: Function) {
    arrayUtils.removeElem(this.listeners, func);
  }

  /**
   * Fire a change event.
   *
   * @param event Event to fire.
   */
  fireChangeListener(event: Abstract) {
    if (event.recordUndo) {
      this.undoStack_.push(event);
      this.redoStack_.length = 0;
      while (this.undoStack_.length > this.MAX_UNDO && this.MAX_UNDO >= 0) {
        this.undoStack_.shift();
      }
    }
    for (let i = 0; i < this.listeners.length; i++) {
      const func = this.listeners[i];
      func(event);
    }
  }

  /**
   * Find the block on this workspace with the specified ID.
   *
   * @param id ID of block to find.
   * @returns The sought after block, or null if not found.
   */
  getBlockById(id: string): Block | null {
    return this.blockDB.get(id) || null;
  }

  /**
   * Set a block on this workspace with the specified ID.
   *
   * @param id ID of block to set.
   * @param block The block to set.
   * @internal
   */
  setBlockById(id: string, block: Block) {
    this.blockDB.set(id, block);
  }

  /**
   * Delete a block off this workspace with the specified ID.
   *
   * @param id ID of block to delete.
   * @internal
   */
  removeBlockById(id: string) {
    this.blockDB.delete(id);
  }

  /**
   * Find the comment on this workspace with the specified ID.
   *
   * @param id ID of comment to find.
   * @returns The sought after comment, or null if not found.
   * @internal
   */
  getCommentById(id: string): WorkspaceComment | null {
    return this.commentDB.get(id) ?? null;
  }

  /**
   * Checks whether all value and statement inputs in the workspace are filled
   * with blocks.
   *
   * @param opt_shadowBlocksAreFilled An optional argument controlling whether
   *     shadow blocks are counted as filled. Defaults to true.
   * @returns True if all inputs are filled, false otherwise.
   */
  allInputsFilled(opt_shadowBlocksAreFilled?: boolean): boolean {
    const blocks = this.getTopBlocks(false);
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return the variable map that contains "potential" variables.
   * These exist in the flyout but not in the workspace.
   *
   * @returns The potential variable map.
   * @internal
   */
  getPotentialVariableMap(): VariableMap | null {
    return this.potentialVariableMap;
  }

  /**
   * Create and store the potential variable map for this workspace.
   *
   * @internal
   */
  createPotentialVariableMap() {
    this.potentialVariableMap = new VariableMap(this);
  }

  /**
   * Return the map of all variables on the workspace.
   *
   * @returns The variable map.
   */
  getVariableMap(): VariableMap {
    return this.variableMap;
  }

  /**
   * Set the map of all variables on the workspace.
   *
   * @param variableMap The variable map.
   * @internal
   */
  setVariableMap(variableMap: VariableMap) {
    this.variableMap = variableMap;
  }

  /** Returns the map of all procedures on the workpace. */
  getProcedureMap(): IProcedureMap {
    return this.procedureMap;
  }

  /**
   * Returns the root workspace of this workspace if the workspace has
   * parent(s).
   *
   * E.g. workspaces in flyouts and mini workspace bubbles have parent
   * workspaces.
   */
  getRootWorkspace(): Workspace | null {
    let outerWs = null;
    const parent = this.options.parentWorkspace;
    // If we were in a flyout in a mutator, need to go up two levels to find
    // the actual parent.
    if (this.isFlyout) {
      if (parent && parent.options) {
        outerWs = parent.options.parentWorkspace;
      }
    } else if (parent) {
      outerWs = parent;
    }
    return outerWs;
  }

  /**
   * Find the workspace with the specified ID.
   *
   * @param id ID of workspace to find.
   * @returns The sought after workspace or null if not found.
   */
  static getById(id: string): Workspace | null {
    return common.getWorkspaceById(id);
  }

  /**
   * Find all workspaces.
   *
   * @returns Array of workspaces.
   */
  static getAll(): Workspace[] {
    return common.getAllWorkspaces();
  }
}
