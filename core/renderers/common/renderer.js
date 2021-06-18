/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.Renderer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.blockRendering.MarkerSvg');
goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.connectionTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.InsertionMarkerManager');
goog.require('Blockly.IRegistrable');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.Connection');
goog.requireType('Blockly.Marker');
goog.requireType('Blockly.RenderedConnection');
goog.requireType('Blockly.Theme');
goog.requireType('Blockly.utils.object');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * The base class for a block renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @implements {Blockly.IRegistrable}
 */
Blockly.blockRendering.Renderer = function(name) {

  /**
   * The renderer name.
   * @type {string}
   * @package
   */
  this.name = name;

  /**
   * The renderer's constant provider.
   * @type {Blockly.blockRendering.ConstantProvider}
   * @private
   */
  this.constants_ = null;

  /**
   * Rendering constant overrides, passed in through options.
   * @type {?Object}
   * @package
   */
  this.overrides = null;
};

/**
 * Gets the class name that identifies this renderer.
 * @return {string} The CSS class name.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.getClassName = function() {
  return this.name + '-renderer';
};

/**
 * Initialize the renderer.
 * @param {!Blockly.Theme} theme The workspace theme object.
 * @param {Object=} opt_rendererOverrides Rendering constant overrides.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.init = function(theme,
    opt_rendererOverrides) {
  this.constants_ = this.makeConstants_();
  if (opt_rendererOverrides) {
    this.overrides = opt_rendererOverrides;
    Blockly.utils.object.mixin(this.constants_, opt_rendererOverrides);
  }
  this.constants_.setTheme(theme);
  this.constants_.init();
};

/**
 * Create any DOM elements that this renderer needs.
 * @param {!SVGElement} svg The root of the workspace's SVG.
 * @param {!Blockly.Theme} theme The workspace theme object.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.createDom = function(svg, theme) {
  this.constants_.createDom(svg, this.name + '-' + theme.name,
      '.' + this.getClassName() + '.' + theme.getClassName());
};

/**
 * Refresh the renderer after a theme change.
 * @param {!SVGElement} svg The root of the workspace's SVG.
 * @param {!Blockly.Theme} theme The workspace theme object.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.refreshDom = function(svg, theme) {
  var previousConstants = this.getConstants();
  previousConstants.dispose();
  this.constants_ = this.makeConstants_();
  if (this.overrides) {
    Blockly.utils.object.mixin(this.constants_, this.overrides);
  }
  // Ensure the constant provider's random identifier does not change.
  this.constants_.randomIdentifier = previousConstants.randomIdentifier;
  this.constants_.setTheme(theme);
  this.constants_.init();
  this.createDom(svg, theme);
};

/**
 * Dispose of this renderer.
 * Delete all DOM elements that this renderer and its constants created.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.dispose = function() {
  if (this.constants_) {
    this.constants_.dispose();
  }
};

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.blockRendering.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.blockRendering.RenderInfo} The render info object.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.blockRendering.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.blockRendering.Drawer} The drawer.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.blockRendering.Drawer(block, info);
};

/**
 * Create a new instance of the renderer's debugger.
 * @return {!Blockly.blockRendering.Debug} The renderer debugger.
 * @suppress {strictModuleDepCheck} Debug renderer only included in playground.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeDebugger_ = function() {
  if (!Blockly.blockRendering.Debug) {
    throw Error('Missing require for Blockly.blockRendering.Debug');
  }
  return new Blockly.blockRendering.Debug(this.getConstants());
};

/**
 * Create a new instance of the renderer's marker drawer.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
 * @param {!Blockly.Marker} marker The marker.
 * @return {!Blockly.blockRendering.MarkerSvg} The object in charge of drawing
 *     the marker.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makeMarkerDrawer = function(
    workspace, marker) {
  return new Blockly.blockRendering.MarkerSvg(workspace, this.getConstants(), marker);
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.blockRendering.IPathObject} The renderer path object.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makePathObject = function(root,
    style) {
  return new Blockly.blockRendering.PathObject(root, style,
      /** @type {!Blockly.blockRendering.ConstantProvider} */ (this.constants_));

};

/**
 * Get the current renderer's constant provider.  We assume that when this is
 * called, the renderer has already been initialized.
 * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.getConstants = function() {
  return (
    /** @type {!Blockly.blockRendering.ConstantProvider} */
    (this.constants_));
};

/**
 * Determine whether or not to highlight a connection.
 * @param {Blockly.Connection} _conn The connection to determine whether or not
 *     to highlight.
 * @return {boolean} True if we should highlight the connection.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.shouldHighlightConnection =
    function(_conn) {
    /* eslint-disable indent */
  return true;
}; /* eslint-enable indent */

/**
 * Checks if an orphaned block can connect to the "end" of the topBlock's
 * block-clump. If the clump is a row the end is the last input. If the clump
 * is a stack, the end is the last next connection. If the clump is neither,
 * then this returns false.
 * @param {!Blockly.BlockSvg} topBlock The top block of the block clump we want to try and
 *     connect to.
 * @param {!Blockly.BlockSvg} orphanBlock The orphan block that wants to find
 *     a home.
 * @param {number} localType The type of the connection being dragged.
 * @return {boolean} Whether there is a home for the orphan or not.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.orphanCanConnectAtEnd =
    function(topBlock, orphanBlock, localType) {
      var orphanConnection = localType === Blockly.connectionTypes.OUTPUT_VALUE ?
          orphanBlock.outputConnection : orphanBlock.previousConnection;
      return !!Blockly.Connection.getConnectionForOrphanedConnection(
          /** @type {!Blockly.Block} **/ (topBlock),
          /** @type {!Blockly.Connection} **/ (orphanConnection));
    };

/**
 * Chooses a connection preview method based on the available connection, the
 * current dragged connection, and the block being dragged.
 * @param {!Blockly.RenderedConnection} closest The available connection.
 * @param {!Blockly.RenderedConnection} local The connection currently being
 *     dragged.
 * @param {!Blockly.BlockSvg} topBlock The block currently being dragged.
 * @return {!Blockly.InsertionMarkerManager.PREVIEW_TYPE} The preview type
 *     to display.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.getConnectionPreviewMethod = function(
    closest, local, topBlock) {
  if (local.type == Blockly.connectionTypes.OUTPUT_VALUE ||
      local.type == Blockly.connectionTypes.PREVIOUS_STATEMENT) {
    if (!closest.isConnected() ||
        this.orphanCanConnectAtEnd(
            topBlock,
            /** @type {!Blockly.BlockSvg} */ (closest.targetBlock()),
            local.type)) {
      return Blockly.InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
    }
    return Blockly.InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE;
  }

  return Blockly.InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
};

/**
 * Render the block.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.render = function(block) {
  if (Blockly.blockRendering.useDebugger && !block.renderingDebugger) {
    block.renderingDebugger = this.makeDebugger_();
  }
  var info = this.makeRenderInfo_(block);
  info.measure();
  this.makeDrawer_(block, info).draw();
};
