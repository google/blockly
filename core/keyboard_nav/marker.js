/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a marker.
 * Used primarily for keyboard navigation to show a marked location.
 */
'use strict';

/**
 * The class representing a marker.
 * Used primarily for keyboard navigation to show a marked location.
 * @class
 */
goog.module('Blockly.Marker');

/* eslint-disable-next-line no-unused-vars */
const {ASTNode} = goog.requireType('Blockly.ASTNode');
/* eslint-disable-next-line no-unused-vars */
const {MarkerSvg} = goog.requireType('Blockly.blockRendering.MarkerSvg');


/**
 * Class for a marker.
 * This is used in keyboard navigation to save a location in the Blockly AST.
 * @alias Blockly.Marker
 */
class Marker {
  /**
   * Constructs a new Marker instance.
   */
  constructor() {
    /**
     * The colour of the marker.
     * @type {?string}
     */
    this.colour = null;

    /**
     * The current location of the marker.
     * @type {ASTNode}
     * @private
     */
    this.curNode_ = null;

    /**
     * The object in charge of drawing the visual representation of the current
     * node.
     * @type {MarkerSvg}
     * @private
     */
    this.drawer_ = null;

    /**
     * The type of the marker.
     * @type {string}
     */
    this.type = 'marker';
  }

  /**
   * Sets the object in charge of drawing the marker.
   * @param {MarkerSvg} drawer The object in charge of
   *     drawing the marker.
   */
  setDrawer(drawer) {
    this.drawer_ = drawer;
  }

  /**
   * Get the current drawer for the marker.
   * @return {MarkerSvg} The object in charge of drawing
   *     the marker.
   */
  getDrawer() {
    return this.drawer_;
  }

  /**
   * Gets the current location of the marker.
   * @return {ASTNode} The current field, connection, or block the marker
   *     is on.
   */
  getCurNode() {
    return this.curNode_;
  }

  /**
   * Set the location of the marker and call the update method.
   * Setting isStack to true will only work if the newLocation is the top most
   * output or previous connection on a stack.
   * @param {ASTNode} newNode The new location of the marker.
   */
  setCurNode(newNode) {
    const oldNode = this.curNode_;
    this.curNode_ = newNode;
    if (this.drawer_) {
      this.drawer_.draw(oldNode, this.curNode_);
    }
  }

  /**
   * Redraw the current marker.
   * @package
   */
  draw() {
    if (this.drawer_) {
      this.drawer_.draw(this.curNode_, this.curNode_);
    }
  }

  /**
   * Hide the marker SVG.
   */
  hide() {
    if (this.drawer_) {
      this.drawer_.hide();
    }
  }

  /**
   * Dispose of this marker.
   */
  dispose() {
    if (this.getDrawer()) {
      this.getDrawer().dispose();
    }
  }
}

exports.Marker = Marker;
