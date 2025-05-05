/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing a marker.
 * Used primarily for keyboard navigation to show a marked location.
 *
 * @class
 */
// Former goog.module ID: Blockly.Marker

import {BlockSvg} from '../block_svg.js';
import {Field} from '../field.js';
import {FlyoutButton} from '../flyout_button.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import {RenderedConnection} from '../rendered_connection.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {ASTNode} from './ast_node.js';

/**
 * Class for a marker.
 * This is used in keyboard navigation to save a location in the Blockly AST.
 */
export class Marker {
  /** The colour of the marker. */
  colour: string | null = null;

  /** The current location of the marker. */
  protected curNode: INavigable<any> | null = null;

  /** The type of the marker. */
  type = 'marker';

  /**
   * Gets the current location of the marker.
   *
   * @returns The current field, connection, or block the marker is on.
   */
  getCurNode(): INavigable<any> | null {
    return this.curNode;
  }

  /**
   * Set the location of the marker and call the update method.
   *
   * @param newNode The new location of the marker, or null to remove it.
   */
  setCurNode(newNode: INavigable<any> | null) {
    const oldNode = this.curNode;
    this.curNode = newNode;
  }

  /** Dispose of this marker. */
  dispose() {
    this.curNode = null;
  }

  /**
   * Converts an INavigable to a legacy ASTNode.
   *
   * @param node The INavigable instance to convert.
   * @returns An ASTNode representation of the given object if possible,
   *     otherwise null.
   */
  toASTNode(node: INavigable<any> | null): ASTNode | null {
    if (node instanceof BlockSvg) {
      return ASTNode.createBlockNode(node);
    } else if (node instanceof Field) {
      return ASTNode.createFieldNode(node);
    } else if (node instanceof WorkspaceSvg) {
      return ASTNode.createWorkspaceNode(node, new Coordinate(0, 0));
    } else if (node instanceof FlyoutButton) {
      return ASTNode.createButtonNode(node);
    } else if (node instanceof RenderedConnection) {
      return ASTNode.createConnectionNode(node);
    }

    return null;
  }

  /**
   * Returns the block that this marker's current node is a child of.
   *
   * @returns The parent block of the marker's current node if any, otherwise
   *     null.
   */
  getSourceBlock(): BlockSvg | null {
    const curNode = this.getCurNode();
    if (curNode instanceof BlockSvg) {
      return curNode;
    } else if (curNode instanceof Field) {
      return curNode.getSourceBlock() as BlockSvg;
    } else if (curNode instanceof RenderedConnection) {
      return curNode.getSourceBlock();
    }

    return null;
  }
}
