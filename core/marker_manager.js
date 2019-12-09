/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview Object representing a workspace rendered as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.MarkerManager');

goog.require('Blockly.Marker');
goog.require('Blockly.Cursor');


/**
 * Class to manage the multiple markers on a workspace.
 * @param {Blockly.Workspace} workspace The workspace for the marker manager.
 * @constructor
 * @package
 */
Blockly.MarkerManager = function(workspace){
  /**
   * The cursor.
   * @type {Blockly.Cursor}
   */
  this.cursor_ = null;

  /**
   * The svg element of the cursor.
   * @type {Blockly.SVGElement}
   */
  this.cursorSvg_ = null;

  /**
   * The list of markers for the workspace.
   * @type {Array.<Blockly.Marker>}
   */
  this.markers_ = {};

  /**
   * The workspace this marker manager is associated with.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;
};

/**
 * Register the marker by adding it to the list of markers.
 * @param {string} id A unique identifier for the marker.
 * @param {!Blockly.Marker} marker The marker to register.
 */
Blockly.MarkerManager.prototype.registerMarker = function(id, marker) {
  if (this.markers_[id]) {
    // Dispose of the old marker and the old marker drawer.
    // TODO: Do something if the marker id already exists.
  }
  marker.setDrawer(this.workspace_.getRenderer().makeMarkerDrawer(this, marker));
  this.setMarkerSvg(marker.getDrawer().createDom());
  this.markers_[id] = marker;
};

/**
 * Unregister the marker by removiing it from the list of markers.
 * @param {Blockly.Marker} marker The marker to unregister.
 */
Blockly.MarkerManager.prototype.unregisterMarker = function(marker) {
  // Remove marker from list and dispose of it.
  // If it is a cursor then don't do anything???
};

/**
 * Sets the cursor for use with keyboard navigation.
 * @param {Blockly.Cursor} cursor The cursor used to move around this workspace.
 */
Blockly.MarkerManager.prototype.setCursor = function(cursor) {
  if (this.cursor_ && this.cursor_.getDrawer()) {
    this.cursor_.getDrawer().dispose();
  }
  this.cursor_ = cursor;
  if (this.cursor_) {
    var drawer = this.workspace_.getRenderer().makeMarkerDrawer(this, cursor);
    this.cursor_.setDrawer(drawer);
    this.setCursorSvg(this.cursor_.getDrawer().createDom());
  }
};

/**
 * Add the cursor svg to this workspaces svg group.
 * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
 *     workspace svg group.
 * @package
 */
Blockly.MarkerManager.prototype.setCursorSvg = function(cursorSvg) {
  if (!cursorSvg) {
    this.cursorSvg_ = null;
    return;
  }

  this.workspace_.getBlockCanvas().appendChild(cursorSvg);
  this.cursorSvg_ = cursorSvg;
};

/**
 * Add the marker svg to this workspaces svg group.
 * @param {SVGElement} markerSvg The svg root of the marker to be added to the
 *     workspace svg group.
 * @package
 */
Blockly.MarkerManager.prototype.setMarkerSvg = function(markerSvg) {
  if (!markerSvg) {
    this.markerSvg_ = null;
    return;
  }

  // TODO: Do I need this?
  if (this.workspace_.getBlockCanvas()) {
    if (this.cursorSvg_) {
      this.workspace_.getBlockCanvas().insertBefore(markerSvg, this.cursorSvg_);
    } else {
      this.workspace_.getBlockCanvas().appendChild(markerSvg);
    }
  }
};

/**
 * Dispose of the marker manager.
 * Go through and delete all markers associated with this marker manager.
 * @package
 */
Blockly.MarkerManager.prototype.dispose = function() {
  // TODO: Go through all the markers on the marker manager and remove
  this.markers_ = null;
  this.cursor_ = null;
};

/**
 * Get the cursor for the workspace.
 * @return {Blockly.Cursor} The cursor for this workspace.
 */
Blockly.MarkerManager.prototype.getCursor = function() {
  return this.cursor_;
};

/**
 * Get a single marker that corresponds to the given id.
 * @param {string} id A unique identifier for the marker.
 * @return {Blockly.Marker} The marker that corresponds to the given id, or null
 *     if none exists.
 */
Blockly.MarkerManager.prototype.getMarker = function(id) {
  return this.markers_[id];
};
