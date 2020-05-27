/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object in charge of managing markers and the cursor.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.MarkerManager');

goog.require('Blockly.Cursor');
goog.require('Blockly.Marker');


/**
 * Class to manage the multiple markers and the cursor on a workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace for the marker manager.
 * @constructor
 * @package
 */
Blockly.MarkerManager = function(workspace){
  /**
   * The cursor.
   * @type {Blockly.Cursor}
   * @private
   */
  this.cursor_ = null;

  /**
   * The cursor's svg element.
   * @type {SVGElement}
   * @private
   */
  this.cursorSvg_ = null;

  /**
   * The map of markers for the workspace.
   * @type {!Object<string, !Blockly.Marker>}
   * @private
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
 * Register the marker by adding it to the map of markers.
 * @param {string} id A unique identifier for the marker.
 * @param {!Blockly.Marker} marker The marker to register.
 */
Blockly.MarkerManager.prototype.registerMarker = function(id, marker) {
  if (this.markers_[id]) {
    this.unregisterMarker(id);
  }
  marker.setDrawer(this.workspace_.getRenderer()
      .makeMarkerDrawer(this.workspace_, marker));
  this.setMarkerSvg(marker.getDrawer().createDom());
  this.markers_[id] = marker;
};

/**
 * Unregister the marker by removing it from the map of markers.
 * @param {string} id The id of the marker to unregister.
 */
Blockly.MarkerManager.prototype.unregisterMarker = function(id) {
  var marker = this.markers_[id];
  if (marker) {
    marker.dispose();
    delete this.markers_[id];
  } else {
    throw Error('Marker with id ' + id + ' does not exist. Can only unregister' +
        'markers that exist.');
  }
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

/**
 * Sets the cursor and initializes the drawer for use with keyboard navigation.
 * @param {Blockly.Cursor} cursor The cursor used to move around this workspace.
 */
Blockly.MarkerManager.prototype.setCursor = function(cursor) {
  if (this.cursor_ && this.cursor_.getDrawer()) {
    this.cursor_.getDrawer().dispose();
  }
  this.cursor_ = cursor;
  if (this.cursor_) {
    var drawer = this.workspace_.getRenderer()
        .makeMarkerDrawer(this.workspace_, this.cursor_);
    this.cursor_.setDrawer(drawer);
    this.setCursorSvg(this.cursor_.getDrawer().createDom());
  }
};

/**
 * Add the cursor svg to this workspace svg group.
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

  if (this.workspace_.getBlockCanvas()) {
    if (this.cursorSvg_) {
      this.workspace_.getBlockCanvas().insertBefore(markerSvg, this.cursorSvg_);
    } else {
      this.workspace_.getBlockCanvas().appendChild(markerSvg);
    }
  }
};

/**
 * Redraw the attached cursor svg if needed.
 * @package
 */
Blockly.MarkerManager.prototype.updateMarkers = function() {
  if (this.workspace_.keyboardAccessibilityMode && this.cursorSvg_) {
    this.workspace_.getCursor().draw();
  }
};

/**
 * Dispose of the marker manager.
 * Go through and delete all markers associated with this marker manager.
 * @suppress {checkTypes}
 * @package
 */
Blockly.MarkerManager.prototype.dispose = function() {
  var markerIds = Object.keys(this.markers_);
  for (var i = 0, markerId; (markerId = markerIds[i]); i++) {
    this.unregisterMarker(markerId);
  }
  this.markers_ = null;
  this.cursor_.dispose();
  this.cursor_ = null;
};
