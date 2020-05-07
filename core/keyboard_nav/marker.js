/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a marker.
 * Used primarily for keyboard navigation to show a marked location.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Marker');

goog.require('Blockly.ASTNode');
goog.require('Blockly.navigation');


/**
 * Class for a marker.
 * This is used in keyboard navigation to save a location in the Blockly AST.
 * @constructor
 */
Blockly.Marker = function() {
  /**
   * The colour of the marker.
   * @type {?string}
   */
  this.colour = null;

  /**
   * The current location of the marker.
   * @type {Blockly.ASTNode}
   * @private
   */
  this.curNode_ = null;

  /**
   * The object in charge of drawing the visual representation of the current node.
   * @type {Blockly.blockRendering.MarkerSvg}
   * @private
   */
  this.drawer_ = null;

  /**
   * The type of the marker.
   * @type {string}
   */
  this.type = 'marker';
};

/**
 * Sets the object in charge of drawing the marker.
 * @param {Blockly.blockRendering.MarkerSvg} drawer The object in charge of
 *     drawing the marker.
 */
Blockly.Marker.prototype.setDrawer = function(drawer) {
  this.drawer_ = drawer;
};

/**
 * Get the current drawer for the marker.
 * @return {Blockly.blockRendering.MarkerSvg} The object in charge of drawing
 *     the marker.
 */
Blockly.Marker.prototype.getDrawer = function() {
  return this.drawer_;
};

/**
 * Gets the current location of the marker.
 * @return {Blockly.ASTNode} The current field, connection, or block the marker
 *     is on.
 */
Blockly.Marker.prototype.getCurNode = function() {
  return this.curNode_;
};

/**
 * Set the location of the marker and call the update method.
 * Setting isStack to true will only work if the newLocation is the top most
 * output or previous connection on a stack.
 * @param {Blockly.ASTNode} newNode The new location of the marker.
 */
Blockly.Marker.prototype.setCurNode = function(newNode) {
  var oldNode = this.curNode_;
  this.curNode_ = newNode;
  if (this.drawer_) {
    this.drawer_.draw(oldNode, this.curNode_);
  }
};

/**
 * Redraw the current marker.
 * @package
 */
Blockly.Marker.prototype.draw = function() {
  if (this.drawer_) {
    this.drawer_.draw(this.curNode_, this.curNode_);
  }
};

/**
 * Hide the marker SVG.
 */
Blockly.Marker.prototype.hide = function() {
  if (this.drawer_) {
    this.drawer_.hide();
  }
};

/**
 * Dispose of this marker.
 */
Blockly.Marker.prototype.dispose = function() {
  if (this.getDrawer()) {
    this.getDrawer().dispose();
  }
};
