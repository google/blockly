/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing an AST node.
 * Used to traverse the Blockly AST.
 *
 * @class
 */
// Former goog.module ID: Blockly.ASTNode

import {Block} from '../block.js';
import type {Connection} from '../connection.js';
import {ConnectionType} from '../connection_type.js';
import type {Field} from '../field.js';
import {FlyoutItem} from '../flyout_base.js';
import {FlyoutButton} from '../flyout_button.js';
import type {Input} from '../inputs/input.js';
import type {IASTNodeLocation} from '../interfaces/i_ast_node_location.js';
import type {IASTNodeLocationWithBlock} from '../interfaces/i_ast_node_location_with_block.js';
import {Coordinate} from '../utils/coordinate.js';
import type {Workspace} from '../workspace.js';
import {WorkspaceSvg} from '../workspace_svg.js';

/**
 * Class for an AST node.
 * It is recommended that you use one of the createNode methods instead of
 * creating a node directly.
 */
export class ASTNode {
  /**
   * True to navigate to all fields. False to only navigate to clickable fields.
   */
  static NAVIGATE_ALL_FIELDS = false;

  /**
   * The default y offset to use when moving the cursor from a stack to the
   * workspace.
   */
  private static readonly DEFAULT_OFFSET_Y: number = -20;
  private readonly type: string;
  private readonly isConnectionLocation: boolean;
  private readonly location: IASTNodeLocation;

  /** The coordinate on the workspace. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Coordinate'.
  private wsCoordinate: Coordinate = null as AnyDuringMigration;

  /**
   * @param type The type of the location.
   *     Must be in ASTNode.types.
   * @param location The position in the AST.
   * @param opt_params Optional dictionary of options.
   */
  constructor(type: string, location: IASTNodeLocation, opt_params?: Params) {
    if (!location) {
      throw Error('Cannot create a node without a location.');
    }

    /**
     * The type of the location.
     * One of ASTNode.types
     */
    this.type = type;

    /** Whether the location points to a connection. */
    this.isConnectionLocation = ASTNode.isConnectionType(type);

    /** The location of the AST node. */
    this.location = location;

    this.processParams(opt_params || null);
  }

  /**
   * Parse the optional parameters.
   *
   * @param params The user specified parameters.
   */
  private processParams(params: Params | null) {
    if (!params) {
      return;
    }
    if (params.wsCoordinate) {
      this.wsCoordinate = params.wsCoordinate;
    }
  }

  /**
   * Gets the value pointed to by this node.
   * It is the callers responsibility to check the node type to figure out what
   * type of object they get back from this.
   *
   * @returns The current field, connection, workspace, or block the cursor is
   *     on.
   */
  getLocation(): IASTNodeLocation {
    return this.location;
  }

  /**
   * The type of the current location.
   * One of ASTNode.types
   *
   * @returns The type of the location.
   */
  getType(): string {
    return this.type;
  }

  /**
   * The coordinate on the workspace.
   *
   * @returns The workspace coordinate or null if the location is not a
   *     workspace.
   */
  getWsCoordinate(): Coordinate {
    return this.wsCoordinate;
  }

  /**
   * Whether the node points to a connection.
   *
   * @returns [description]
   * @internal
   */
  isConnection(): boolean {
    return this.isConnectionLocation;
  }

  /**
   * Given an input find the next editable field or an input with a non null
   * connection in the same block. The current location must be an input
   * connection.
   *
   * @returns The AST node holding the next field or connection or null if there
   *     is no editable field or input connection after the given input.
   */
  private findNextForInput(): ASTNode | null {
    const location = this.location as Connection;
    const parentInput = location.getParentInput();
    const block = parentInput!.getSourceBlock();
    // AnyDuringMigration because:  Argument of type 'Input | null' is not
    // assignable to parameter of type 'Input'.
    const curIdx = block!.inputList.indexOf(parentInput as AnyDuringMigration);
    for (let i = curIdx + 1; i < block!.inputList.length; i++) {
      const input = block!.inputList[i];
      const fieldRow = input.fieldRow;
      for (let j = 0; j < fieldRow.length; j++) {
        const field = fieldRow[j];
        if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
          return ASTNode.createFieldNode(field);
        }
      }
      if (input.connection) {
        return ASTNode.createInputNode(input);
      }
    }
    return null;
  }

  /**
   * Given a field find the next editable field or an input with a non null
   * connection in the same block. The current location must be a field.
   *
   * @returns The AST node pointing to the next field or connection or null if
   *     there is no editable field or input connection after the given input.
   */
  private findNextForField(): ASTNode | null {
    const location = this.location as Field;
    const input = location.getParentInput();
    const block = location.getSourceBlock();
    if (!block) {
      throw new Error(
        'The current AST location is not associated with a block',
      );
    }
    const curIdx = block.inputList.indexOf(input);
    let fieldIdx = input.fieldRow.indexOf(location) + 1;
    for (let i = curIdx; i < block.inputList.length; i++) {
      const newInput = block.inputList[i];
      const fieldRow = newInput.fieldRow;
      while (fieldIdx < fieldRow.length) {
        if (fieldRow[fieldIdx].isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
          return ASTNode.createFieldNode(fieldRow[fieldIdx]);
        }
        fieldIdx++;
      }
      fieldIdx = 0;
      if (newInput.connection) {
        return ASTNode.createInputNode(newInput);
      }
    }
    return null;
  }

  /**
   * Given an input find the previous editable field or an input with a non null
   * connection in the same block. The current location must be an input
   * connection.
   *
   * @returns The AST node holding the previous field or connection.
   */
  private findPrevForInput(): ASTNode | null {
    const location = this.location as Connection;
    const parentInput = location.getParentInput();
    const block = parentInput!.getSourceBlock();
    // AnyDuringMigration because:  Argument of type 'Input | null' is not
    // assignable to parameter of type 'Input'.
    const curIdx = block!.inputList.indexOf(parentInput as AnyDuringMigration);
    for (let i = curIdx; i >= 0; i--) {
      const input = block!.inputList[i];
      if (input.connection && input !== parentInput) {
        return ASTNode.createInputNode(input);
      }
      const fieldRow = input.fieldRow;
      for (let j = fieldRow.length - 1; j >= 0; j--) {
        const field = fieldRow[j];
        if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
          return ASTNode.createFieldNode(field);
        }
      }
    }
    return null;
  }

  /**
   * Given a field find the previous editable field or an input with a non null
   * connection in the same block. The current location must be a field.
   *
   * @returns The AST node holding the previous input or field.
   */
  private findPrevForField(): ASTNode | null {
    const location = this.location as Field;
    const parentInput = location.getParentInput();
    const block = location.getSourceBlock();
    if (!block) {
      throw new Error(
        'The current AST location is not associated with a block',
      );
    }
    const curIdx = block.inputList.indexOf(parentInput);
    let fieldIdx = parentInput.fieldRow.indexOf(location) - 1;
    for (let i = curIdx; i >= 0; i--) {
      const input = block.inputList[i];
      if (input.connection && input !== parentInput) {
        return ASTNode.createInputNode(input);
      }
      const fieldRow = input.fieldRow;
      while (fieldIdx > -1) {
        if (fieldRow[fieldIdx].isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
          return ASTNode.createFieldNode(fieldRow[fieldIdx]);
        }
        fieldIdx--;
      }
      // Reset the fieldIdx to the length of the field row of the previous
      // input.
      if (i - 1 >= 0) {
        fieldIdx = block.inputList[i - 1].fieldRow.length - 1;
      }
    }
    return null;
  }

  /**
   * Navigate between stacks of blocks on the workspace.
   *
   * @param forward True to go forward. False to go backwards.
   * @returns The first block of the next stack or null if there are no blocks
   *     on the workspace.
   */
  private navigateBetweenStacks(forward: boolean): ASTNode | null {
    let curLocation = this.getLocation();
    // TODO(#6097): Use instanceof checks to exit early for values of
    // curLocation that don't make sense.
    if ((curLocation as IASTNodeLocationWithBlock).getSourceBlock) {
      const block = (curLocation as IASTNodeLocationWithBlock).getSourceBlock();
      if (block) {
        curLocation = block;
      }
    }
    // TODO(#6097): Use instanceof checks to exit early for values of
    // curLocation that don't make sense.
    const curLocationAsBlock = curLocation as Block;
    if (!curLocationAsBlock || curLocationAsBlock.isDeadOrDying()) {
      return null;
    }
    if (curLocationAsBlock.workspace.isFlyout) {
      return this.navigateFlyoutContents(forward);
    }
    const curRoot = curLocationAsBlock.getRootBlock();
    const topBlocks = curRoot.workspace.getTopBlocks(true);
    for (let i = 0; i < topBlocks.length; i++) {
      const topBlock = topBlocks[i];
      if (curRoot.id === topBlock.id) {
        const offset = forward ? 1 : -1;
        const resultIndex = i + offset;
        if (resultIndex === -1 || resultIndex === topBlocks.length) {
          return null;
        }
        return ASTNode.createStackNode(topBlocks[resultIndex]);
      }
    }
    throw Error(
      "Couldn't find " + (forward ? 'next' : 'previous') + ' stack?!',
    );
  }

  /**
   * Navigate between buttons and stacks of blocks on the flyout workspace.
   *
   * @param forward True to go forward. False to go backwards.
   * @returns The next button, or next stack's first block, or null
   */
  private navigateFlyoutContents(forward: boolean): ASTNode | null {
    const nodeType = this.getType();
    let location;
    let targetWorkspace;

    switch (nodeType) {
      case ASTNode.types.STACK: {
        location = this.getLocation() as Block;
        const workspace = location.workspace as WorkspaceSvg;
        targetWorkspace = workspace.targetWorkspace as WorkspaceSvg;
        break;
      }
      case ASTNode.types.BUTTON: {
        location = this.getLocation() as FlyoutButton;
        targetWorkspace = location.getTargetWorkspace() as WorkspaceSvg;
        break;
      }
      default:
        return null;
    }

    const flyout = targetWorkspace.getFlyout();
    if (!flyout) return null;

    const nextItem = this.findNextLocationInFlyout(
      flyout.getContents(),
      location,
      forward,
    );
    if (!nextItem) return null;

    if (nextItem.type === 'button' && nextItem.button) {
      return ASTNode.createButtonNode(nextItem.button);
    } else if (nextItem.type === 'block' && nextItem.block) {
      return ASTNode.createStackNode(nextItem.block);
    }

    return null;
  }

  /**
   * Finds the next (or previous if navigating backward) item in the flyout that should be navigated to.
   *
   * @param flyoutContents Contents of the current flyout.
   * @param currentLocation Current ASTNode location.
   * @param forward True if we're navigating forward, else false.
   * @returns The next (or previous) FlyoutItem, or null if there is none.
   */
  private findNextLocationInFlyout(
    flyoutContents: FlyoutItem[],
    currentLocation: IASTNodeLocation,
    forward: boolean,
  ): FlyoutItem | null {
    const currentIndex = flyoutContents.findIndex((item: FlyoutItem) => {
      if (currentLocation instanceof Block && item.block === currentLocation) {
        return true;
      }
      if (
        currentLocation instanceof FlyoutButton &&
        item.button === currentLocation
      ) {
        return true;
      }
      return false;
    });

    if (currentIndex < 0) return null;

    const resultIndex = forward ? currentIndex + 1 : currentIndex - 1;
    if (resultIndex === -1 || resultIndex === flyoutContents.length) {
      return null;
    }

    return flyoutContents[resultIndex];
  }

  /**
   * Finds the top most AST node for a given block.
   * This is either the previous connection, output connection or block
   * depending on what kind of connections the block has.
   *
   * @param block The block that we want to find the top connection on.
   * @returns The AST node containing the top connection.
   */
  private findTopASTNodeForBlock(block: Block): ASTNode | null {
    const topConnection = getParentConnection(block);
    if (topConnection) {
      return ASTNode.createConnectionNode(topConnection);
    } else {
      return ASTNode.createBlockNode(block);
    }
  }

  /**
   * Get the AST node pointing to the input that the block is nested under or if
   * the block is not nested then get the stack AST node.
   *
   * @param block The source block of the current location.
   * @returns The AST node pointing to the input connection or the top block of
   *     the stack this block is in.
   */
  private getOutAstNodeForBlock(block: Block): ASTNode | null {
    if (!block) {
      return null;
    }
    // If the block doesn't have a previous connection then it is the top of the
    // substack.
    const topBlock = block.getTopStackBlock();
    const topConnection = getParentConnection(topBlock);
    // If the top connection has a parentInput, create an AST node pointing to
    // that input.
    if (
      topConnection &&
      topConnection.targetConnection &&
      topConnection.targetConnection.getParentInput()
    ) {
      // AnyDuringMigration because:  Argument of type 'Input | null' is not
      // assignable to parameter of type 'Input'.
      return ASTNode.createInputNode(
        topConnection.targetConnection.getParentInput() as AnyDuringMigration,
      );
    } else {
      // Go to stack level if you are not underneath an input.
      return ASTNode.createStackNode(topBlock);
    }
  }

  /**
   * Find the first editable field or input with a connection on a given block.
   *
   * @param block The source block of the current location.
   * @returns An AST node pointing to the first field or input.
   * Null if there are no editable fields or inputs with connections on the
   * block.
   */
  private findFirstFieldOrInput(block: Block): ASTNode | null {
    const inputs = block.inputList;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const fieldRow = input.fieldRow;
      for (let j = 0; j < fieldRow.length; j++) {
        const field = fieldRow[j];
        if (field.isClickable() || ASTNode.NAVIGATE_ALL_FIELDS) {
          return ASTNode.createFieldNode(field);
        }
      }
      if (input.connection) {
        return ASTNode.createInputNode(input);
      }
    }
    return null;
  }

  /**
   * Finds the source block of the location of this node.
   *
   * @returns The source block of the location, or null if the node is of type
   *     workspace or button.
   */
  getSourceBlock(): Block | null {
    if (this.getType() === ASTNode.types.BLOCK) {
      return this.getLocation() as Block;
    } else if (this.getType() === ASTNode.types.STACK) {
      return this.getLocation() as Block;
    } else if (this.getType() === ASTNode.types.WORKSPACE) {
      return null;
    } else if (this.getType() === ASTNode.types.BUTTON) {
      return null;
    } else {
      return (this.getLocation() as IASTNodeLocationWithBlock).getSourceBlock();
    }
  }

  /**
   * Find the element to the right of the current element in the AST.
   *
   * @returns An AST node that wraps the next field, connection, block, or
   *     workspace. Or null if there is no node to the right.
   */
  next(): ASTNode | null {
    switch (this.type) {
      case ASTNode.types.STACK:
        return this.navigateBetweenStacks(true);

      case ASTNode.types.OUTPUT: {
        const connection = this.location as Connection;
        return ASTNode.createBlockNode(connection.getSourceBlock());
      }
      case ASTNode.types.FIELD:
        return this.findNextForField();

      case ASTNode.types.INPUT:
        return this.findNextForInput();

      case ASTNode.types.BLOCK: {
        const block = this.location as Block;
        const nextConnection = block.nextConnection;
        if (!nextConnection) return null;
        return ASTNode.createConnectionNode(nextConnection);
      }
      case ASTNode.types.PREVIOUS: {
        const connection = this.location as Connection;
        return ASTNode.createBlockNode(connection.getSourceBlock());
      }
      case ASTNode.types.NEXT: {
        const connection = this.location as Connection;
        const targetConnection = connection.targetConnection;
        return ASTNode.createConnectionNode(targetConnection!);
      }
      case ASTNode.types.BUTTON:
        return this.navigateFlyoutContents(true);
    }

    return null;
  }

  /**
   * Find the element one level below and all the way to the left of the current
   * location.
   *
   * @returns An AST node that wraps the next field, connection, workspace, or
   *     block. Or null if there is nothing below this node.
   */
  in(): ASTNode | null {
    switch (this.type) {
      case ASTNode.types.WORKSPACE: {
        const workspace = this.location as Workspace;
        const topBlocks = workspace.getTopBlocks(true);
        if (topBlocks.length > 0) {
          return ASTNode.createStackNode(topBlocks[0]);
        }
        break;
      }
      case ASTNode.types.STACK: {
        const block = this.location as Block;
        return this.findTopASTNodeForBlock(block);
      }
      case ASTNode.types.BLOCK: {
        const block = this.location as Block;
        return this.findFirstFieldOrInput(block);
      }
      case ASTNode.types.INPUT: {
        const connection = this.location as Connection;
        const targetConnection = connection.targetConnection;
        return ASTNode.createConnectionNode(targetConnection!);
      }
    }

    return null;
  }

  /**
   * Find the element to the left of the current element in the AST.
   *
   * @returns An AST node that wraps the previous field, connection, workspace
   *     or block. Or null if no node exists to the left. null.
   */
  prev(): ASTNode | null {
    switch (this.type) {
      case ASTNode.types.STACK:
        return this.navigateBetweenStacks(false);

      case ASTNode.types.OUTPUT:
        return null;

      case ASTNode.types.FIELD:
        return this.findPrevForField();

      case ASTNode.types.INPUT:
        return this.findPrevForInput();

      case ASTNode.types.BLOCK: {
        const block = this.location as Block;
        const topConnection = getParentConnection(block);
        if (!topConnection) return null;
        return ASTNode.createConnectionNode(topConnection);
      }
      case ASTNode.types.PREVIOUS: {
        const connection = this.location as Connection;
        const targetConnection = connection.targetConnection;
        if (targetConnection && !targetConnection.getParentInput()) {
          return ASTNode.createConnectionNode(targetConnection);
        }
        break;
      }
      case ASTNode.types.NEXT: {
        const connection = this.location as Connection;
        return ASTNode.createBlockNode(connection.getSourceBlock());
      }
      case ASTNode.types.BUTTON:
        return this.navigateFlyoutContents(false);
    }

    return null;
  }

  /**
   * Find the next element that is one position above and all the way to the
   * left of the current location.
   *
   * @returns An AST node that wraps the next field, connection, workspace or
   *     block. Or null if we are at the workspace level.
   */
  out(): ASTNode | null {
    switch (this.type) {
      case ASTNode.types.STACK: {
        const block = this.location as Block;
        const blockPos = block.getRelativeToSurfaceXY();
        // TODO: Make sure this is in the bounds of the workspace.
        const wsCoordinate = new Coordinate(
          blockPos.x,
          blockPos.y + ASTNode.DEFAULT_OFFSET_Y,
        );
        return ASTNode.createWorkspaceNode(block.workspace, wsCoordinate);
      }
      case ASTNode.types.OUTPUT: {
        const connection = this.location as Connection;
        const target = connection.targetConnection;
        if (target) {
          return ASTNode.createConnectionNode(target);
        }
        return ASTNode.createStackNode(connection.getSourceBlock());
      }
      case ASTNode.types.FIELD: {
        const field = this.location as Field;
        const block = field.getSourceBlock();
        if (!block) {
          throw new Error(
            'The current AST location is not associated with a block',
          );
        }
        return ASTNode.createBlockNode(block);
      }
      case ASTNode.types.INPUT: {
        const connection = this.location as Connection;
        return ASTNode.createBlockNode(connection.getSourceBlock());
      }
      case ASTNode.types.BLOCK: {
        const block = this.location as Block;
        return this.getOutAstNodeForBlock(block);
      }
      case ASTNode.types.PREVIOUS: {
        const connection = this.location as Connection;
        return this.getOutAstNodeForBlock(connection.getSourceBlock());
      }
      case ASTNode.types.NEXT: {
        const connection = this.location as Connection;
        return this.getOutAstNodeForBlock(connection.getSourceBlock());
      }
    }

    return null;
  }

  /**
   * Whether an AST node of the given type points to a connection.
   *
   * @param type The type to check.  One of ASTNode.types.
   * @returns True if a node of the given type points to a connection.
   */
  private static isConnectionType(type: string): boolean {
    switch (type) {
      case ASTNode.types.PREVIOUS:
      case ASTNode.types.NEXT:
      case ASTNode.types.INPUT:
      case ASTNode.types.OUTPUT:
        return true;
    }
    return false;
  }

  /**
   * Create an AST node pointing to a field.
   *
   * @param field The location of the AST node.
   * @returns An AST node pointing to a field.
   */
  static createFieldNode(field: Field): ASTNode | null {
    if (!field) {
      return null;
    }
    return new ASTNode(ASTNode.types.FIELD, field);
  }

  /**
   * Creates an AST node pointing to a connection. If the connection has a
   * parent input then create an AST node of type input that will hold the
   * connection.
   *
   * @param connection This is the connection the node will point to.
   * @returns An AST node pointing to a connection.
   */
  static createConnectionNode(connection: Connection): ASTNode | null {
    if (!connection) {
      return null;
    }
    const type = connection.type;
    if (type === ConnectionType.INPUT_VALUE) {
      // AnyDuringMigration because:  Argument of type 'Input | null' is not
      // assignable to parameter of type 'Input'.
      return ASTNode.createInputNode(
        connection.getParentInput() as AnyDuringMigration,
      );
    } else if (
      type === ConnectionType.NEXT_STATEMENT &&
      connection.getParentInput()
    ) {
      // AnyDuringMigration because:  Argument of type 'Input | null' is not
      // assignable to parameter of type 'Input'.
      return ASTNode.createInputNode(
        connection.getParentInput() as AnyDuringMigration,
      );
    } else if (type === ConnectionType.NEXT_STATEMENT) {
      return new ASTNode(ASTNode.types.NEXT, connection);
    } else if (type === ConnectionType.OUTPUT_VALUE) {
      return new ASTNode(ASTNode.types.OUTPUT, connection);
    } else if (type === ConnectionType.PREVIOUS_STATEMENT) {
      return new ASTNode(ASTNode.types.PREVIOUS, connection);
    }
    return null;
  }

  /**
   * Creates an AST node pointing to an input. Stores the input connection as
   * the location.
   *
   * @param input The input used to create an AST node.
   * @returns An AST node pointing to a input.
   */
  static createInputNode(input: Input): ASTNode | null {
    if (!input || !input.connection) {
      return null;
    }
    return new ASTNode(ASTNode.types.INPUT, input.connection);
  }

  /**
   * Creates an AST node pointing to a block.
   *
   * @param block The block used to create an AST node.
   * @returns An AST node pointing to a block.
   */
  static createBlockNode(block: Block): ASTNode | null {
    if (!block) {
      return null;
    }
    return new ASTNode(ASTNode.types.BLOCK, block);
  }

  /**
   * Create an AST node of type stack. A stack, represented by its top block, is
   *     the set of all blocks connected to a top block, including the top
   * block.
   *
   * @param topBlock A top block has no parent and can be found in the list
   *     returned by workspace.getTopBlocks().
   * @returns An AST node of type stack that points to the top block on the
   *     stack.
   */
  static createStackNode(topBlock: Block): ASTNode | null {
    if (!topBlock) {
      return null;
    }
    return new ASTNode(ASTNode.types.STACK, topBlock);
  }

  /**
   * Create an AST node of type button. A button in this case refers
   * specifically to a button in a flyout.
   *
   * @param button A top block has no parent and can be found in the list
   *     returned by workspace.getTopBlocks().
   * @returns An AST node of type stack that points to the top block on the
   *     stack.
   */
  static createButtonNode(button: FlyoutButton): ASTNode | null {
    if (!button) {
      return null;
    }
    return new ASTNode(ASTNode.types.BUTTON, button);
  }

  /**
   * Creates an AST node pointing to a workspace.
   *
   * @param workspace The workspace that we are on.
   * @param wsCoordinate The position on the workspace for this node.
   * @returns An AST node pointing to a workspace and a position on the
   *     workspace.
   */
  static createWorkspaceNode(
    workspace: Workspace | null,
    wsCoordinate: Coordinate | null,
  ): ASTNode | null {
    if (!wsCoordinate || !workspace) {
      return null;
    }
    const params = {wsCoordinate};
    return new ASTNode(ASTNode.types.WORKSPACE, workspace, params);
  }

  /**
   * Creates an AST node for the top position on a block.
   * This is either an output connection, previous connection, or block.
   *
   * @param block The block to find the top most AST node on.
   * @returns The AST node holding the top most position on the block.
   */
  static createTopNode(block: Block): ASTNode | null {
    let astNode;
    const topConnection = getParentConnection(block);
    if (topConnection) {
      astNode = ASTNode.createConnectionNode(topConnection);
    } else {
      astNode = ASTNode.createBlockNode(block);
    }
    return astNode;
  }
}

export namespace ASTNode {
  export interface Params {
    wsCoordinate: Coordinate;
  }

  export enum types {
    FIELD = 'field',
    BLOCK = 'block',
    INPUT = 'input',
    OUTPUT = 'output',
    NEXT = 'next',
    PREVIOUS = 'previous',
    STACK = 'stack',
    WORKSPACE = 'workspace',
    BUTTON = 'button',
  }
}

export type Params = ASTNode.Params;
// No need to export ASTNode.types from the module at this time because (1) it
// wasn't automatically converted by the automatic migration script, (2) the
// name doesn't follow the styleguide.

/**
 * Gets the parent connection on a block.
 * This is either an output connection, previous connection or undefined.
 * If both connections exist return the one that is actually connected
 * to another block.
 *
 * @param block The block to find the parent connection on.
 * @returns The connection connecting to the parent of the block.
 */
function getParentConnection(block: Block): Connection | null {
  let topConnection = block.outputConnection;
  if (
    !topConnection ||
    (block.previousConnection && block.previousConnection.isConnected())
  ) {
    topConnection = block.previousConnection;
  }
  return topConnection;
}
