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
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'ASTNode'.
  private curNode: ASTNode = null as AnyDuringMigration;

  /**
   * The object in charge of drawing the visual representation of the current
   * node.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'MarkerSvg'.
  private drawer: MarkerSvg = null as AnyDuringMigration;

  /** The type of the marker. */
  type = 'marker';

  /** Constructs a new Marker instance. */
  constructor() {}

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
  getDrawer(): MarkerSvg {
    return this.drawer;
  }

  /**
   * Gets the current location of the marker.
   *
   * @returns The current field, connection, or block the marker is on.
   */
  getCurNode(): ASTNode {
    return this.curNode;
  }

  /**
   * Set the location of the marker and call the update method.
   * Setting isStack to true will only work if the newLocation is the top most
   * output or previous connection on a stack.
   *
   * @param newNode The new location of the marker.
   */
  setCurNode(newNode: ASTNode) {
    const oldNode = this.curNode;
    this.curNode = newNode;
    if (this.drawer) {
      this.drawer.draw(oldNode, this.curNode);
    }
  }

  /**
   * Redraw the current marker.
   *
   * @internal
   */
  draw() {
    if (this.drawer) {
      this.drawer.draw(this.curNode, this.curNode);
    }
  }

  /** Hide the marker SVG. */
  hide() {
    if (this.drawer) {
      this.drawer.hide();
    }
  }

  /** Dispose of this marker. */
  dispose() {
    if (this.getDrawer()) {
      this.getDrawer().dispose();
    }
  }
}
