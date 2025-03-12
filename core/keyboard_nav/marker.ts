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

import type {MarkerSvg} from '../renderers/common/marker_svg.js';
import type {ASTNode} from './ast_node.js';

/**
 * Class for a marker.
 * This is used in keyboard navigation to save a location in the Blockly AST.
 */
export class Marker {
  /** The colour of the marker. */
  colour: string | null = null;

  /** The current location of the marker. */
  private curNode: ASTNode | null = null;

  /**
   * The object in charge of drawing the visual representation of the current
   * node.
   */
  private drawer: MarkerSvg | null = null;

  /** The type of the marker. */
  type = 'marker';

  /**
   * Sets the object in charge of drawing the marker.
   *
   * @param drawer The object in charge of drawing the marker.
   */
  setDrawer(drawer: MarkerSvg) {
    this.drawer = drawer;
  }

  /**
   * Get the current drawer for the marker.
   *
   * @returns The object in charge of drawing the marker.
   */
  getDrawer(): MarkerSvg | null {
    return this.drawer;
  }

  /**
   * Gets the current location of the marker.
   *
   * @returns The current field, connection, or block the marker is on.
   */
  getCurNode(): ASTNode | null {
    return this.curNode;
  }

  /**
   * Set the location of the marker and call the update method.
   *
   * @param newNode The new location of the marker, or null to remove it.
   */
  setCurNode(newNode: ASTNode | null) {
    const oldNode = this.curNode;
    this.curNode = newNode;
    this.drawer?.draw(oldNode, this.curNode);
  }

  /**
   * Redraw the current marker.
   *
   * @internal
   */
  draw() {
    this.drawer?.draw(this.curNode, this.curNode);
  }

  /** Hide the marker SVG. */
  hide() {
    this.drawer?.hide();
  }

  /** Dispose of this marker. */
  dispose() {
    this.drawer?.dispose();
    this.drawer = null;
    this.curNode = null;
  }
}
