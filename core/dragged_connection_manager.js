/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.DraggedConnectionManager');

goog.require('Blockly.RenderedConnection');

/**
 * TODO: Doc
 * @constructor
 */
Blockly.DraggedConnectionManager = function(block) {
  this.topBlock_ = block;

  Blockly.selected = block;
  this.workspace_ = block.workspace;

  this.availableConnections_ = [];
  this.availableConnectionsCached_ = false;

  this.allDraggedConnections_ = [];

  this.closestConnection_ = null;

  this.localConnection_ = null;

  this.radiusConnection_ = -1;

  this.wouldDeleteBlock_ = false;

  this.setAvailableConnections();
};

Blockly.DraggedConnectionManager.prototype.setAvailableConnections = function() {
  if (!this.availableConnectionsCached_) {
    // TODO: remove?
    this.availableConnections_ = this.topBlock_.getConnections_(false);
    // Also check the last connection on this stack
    var lastOnStack = this.topBlock_.lastConnectionInStack_();
    if (lastOnStack && lastOnStack != this.topBlock_.nextConnection) {
      this.availableConnections_.push(lastOnStack);
    }
    this.availableConnectionsCached_ = true;
  } else {
    console.trace('Tried to set available connections too many times.');
  }
};

Blockly.DraggedConnectionManager.prototype.getAvailableConnections = function() {
  return this.availableConnections_;
};

Blockly.DraggedConnectionManager.prototype.addDraggedConnections = function(block) {
  this.allDraggedConnections_ = this.allDraggedConnections_.concat(block.getConnections_(true));
};

Blockly.DraggedConnectionManager.prototype.clearDraggedConnections = function() {
  this.allDraggedConnections_ = [];
};

Blockly.DraggedConnectionManager.prototype.getDraggedConnections = function() {
  return this.allDraggedConnections_;
};

Blockly.DraggedConnectionManager.prototype.updateClosestConnection = function(e,
    dxy) {
  var oldClosestConnection = this.closestConnection_;

  this.closestConnection_ = null;
  this.localConnection_ = null;
  this.radiusConnection_ = Blockly.SNAP_RADIUS;
  for (var i = 0; i < this.availableConnections_.length; i++) {
    var myConnection = this.availableConnections_[i];
    var neighbour = myConnection.closest(this.radiusConnection_, dxy);
    if (neighbour.connection) {
      this.closestConnection_ = neighbour.connection;
      this.localConnection_ = myConnection;
      this.radiusConnection_ = neighbour.radius;
    }
  }

  var closestConnectionChanged =
      oldClosestConnection != this.closestConnection_;

  if (closestConnectionChanged) {
    if (oldClosestConnection) {
      oldClosestConnection.unhighlight();
    }
  }

  var wouldDeleteBlock = this.updateCursor(e);

  if (!wouldDeleteBlock && closestConnectionChanged &&
      this.closestConnection_) {
    this.closestConnection_.highlight();
  }

};

Blockly.DraggedConnectionManager.prototype.removeConnectionHighlighting = function() {
  if (this.closestConnection_) {
    this.closestConnection_.unhighlight();
  }
};

Blockly.DraggedConnectionManager.prototype.addConnectionHighlighting = function() {
  if (this.closestConnection_) {
    this.closestConnection_.highlight();
  }
};


/**
 * Provide visual indication of whether the block will be deleted if
 * dropped here.
 * Prefer connecting over dropping into the trash can, but prefer dragging to
 * the toolbox over connecting to other blocks.
 * @param {!Event} e Mouse move event.
 * @return {boolean} True if the block would be deleted if dropped here,
 *     otherwise false.
 */
Blockly.DraggedConnectionManager.prototype.updateCursor = function(e) {
  var deleteArea = this.workspace_.isDeleteArea(e);
  var wouldConnect = this.closestConnection_ &&
      deleteArea != Blockly.DELETE_AREA_TOOLBOX;
  var wouldDelete = deleteArea && !this.topBlock_.getParent() &&
      this.topBlock_.isDeletable();
  var showDeleteCursor = wouldDelete && !wouldConnect;

  if (showDeleteCursor) {
    Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
    if (deleteArea == Blockly.DELETE_AREA_TRASH && this.workspace_.trashcan) {
      this.workspace_.trashcan.setOpen_(true);
    }
    return true;
  } else {
    Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
    if (this.workspace_.trashcan) {
      this.workspace_.trashcan.setOpen_(false);
    }
    return false;
  }
};
