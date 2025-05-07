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
import {FlyoutButton} from '../flyout_button.js';
import type {Input} from '../inputs/input.js';
import type {IASTNodeLocation} from '../interfaces/i_ast_node_location.js';
import type {IASTNodeLocationWithBlock} from '../interfaces/i_ast_node_location_with_block.js';
import {Coordinate} from '../utils/coordinate.js';
import type {Workspace} from '../workspace.js';

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
  private wsCoordinate: Coordinate | null = null;

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
  getWsCoordinate(): Coordinate | null {
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

  private getVisibleInputs(block: Block): Input[] {
    return block.inputList.filter((input) => input.isVisible());
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
  static createFieldNode(field: Field): ASTNode {
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
    const type = connection.type;
    const parentInput = connection.getParentInput();
    if (
      (type === ConnectionType.INPUT_VALUE ||
        type === ConnectionType.NEXT_STATEMENT) &&
      parentInput
    ) {
      return ASTNode.createInputNode(parentInput);
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
    if (!input.connection) {
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
  static createBlockNode(block: Block): ASTNode {
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
  static createStackNode(topBlock: Block): ASTNode {
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
  static createButtonNode(button: FlyoutButton): ASTNode {
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
    workspace: Workspace,
    wsCoordinate: Coordinate,
  ): ASTNode {
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
