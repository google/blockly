/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base renderer.
 */
'use strict';

/**
 * Base renderer.
 * @class
 */
goog.module('Blockly.blockRendering.Renderer');

const debug = goog.require('Blockly.blockRendering.debug');
const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {Connection} = goog.require('Blockly.Connection');
const {ConstantProvider} = goog.require('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Debug} = goog.requireType('Blockly.blockRendering.Debug');
const {Drawer} = goog.require('Blockly.blockRendering.Drawer');
/* eslint-disable-next-line no-unused-vars */
const {IPathObject} = goog.requireType('Blockly.blockRendering.IPathObject');
/* eslint-disable-next-line no-unused-vars */
const {IRegistrable} = goog.require('Blockly.IRegistrable');
const {InsertionMarkerManager} = goog.require('Blockly.InsertionMarkerManager');
const {MarkerSvg} = goog.require('Blockly.blockRendering.MarkerSvg');
/* eslint-disable-next-line no-unused-vars */
const {Marker} = goog.requireType('Blockly.Marker');
const {PathObject} = goog.require('Blockly.blockRendering.PathObject');
const {RenderInfo} = goog.require('Blockly.blockRendering.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * The base class for a block renderer.
 * @implements {IRegistrable}
 * @alias Blockly.blockRendering.Renderer
 */
class Renderer {
  /**
   * @param {string} name The renderer name.
   * @package
   */
  constructor(name) {
    /**
     * The renderer name.
     * @type {string}
     * @package
     */
    this.name = name;

    /**
     * The renderer's constant provider.
     * @type {ConstantProvider}
     * @private
     */
    this.constants_ = null;

    /**
     * Rendering constant overrides, passed in through options.
     * @type {?Object}
     * @package
     */
    this.overrides = null;
  }

  /**
   * Gets the class name that identifies this renderer.
   * @return {string} The CSS class name.
   * @package
   */
  getClassName() {
    return this.name + '-renderer';
  }

  /**
   * Initialize the renderer.
   * @param {!Theme} theme The workspace theme object.
   * @param {Object=} opt_rendererOverrides Rendering constant overrides.
   * @package
   */
  init(theme, opt_rendererOverrides) {
    this.constants_ = this.makeConstants_();
    if (opt_rendererOverrides) {
      this.overrides = opt_rendererOverrides;
      object.mixin(this.constants_, opt_rendererOverrides);
    }
    this.constants_.setTheme(theme);
    this.constants_.init();
  }

  /**
   * Create any DOM elements that this renderer needs.
   * @param {!SVGElement} svg The root of the workspace's SVG.
   * @param {!Theme} theme The workspace theme object.
   * @package
   */
  createDom(svg, theme) {
    this.constants_.createDom(
        svg, this.name + '-' + theme.name,
        '.' + this.getClassName() + '.' + theme.getClassName());
  }

  /**
   * Refresh the renderer after a theme change.
   * @param {!SVGElement} svg The root of the workspace's SVG.
   * @param {!Theme} theme The workspace theme object.
   * @package
   */
  refreshDom(svg, theme) {
    const previousConstants = this.getConstants();
    previousConstants.dispose();
    this.constants_ = this.makeConstants_();
    if (this.overrides) {
      object.mixin(this.constants_, this.overrides);
    }
    // Ensure the constant provider's random identifier does not change.
    this.constants_.randomIdentifier = previousConstants.randomIdentifier;
    this.constants_.setTheme(theme);
    this.constants_.init();
    this.createDom(svg, theme);
  }

  /**
   * Dispose of this renderer.
   * Delete all DOM elements that this renderer and its constants created.
   * @package
   */
  dispose() {
    if (this.constants_) {
      this.constants_.dispose();
    }
  }

  /**
   * Create a new instance of the renderer's constant provider.
   * @return {!ConstantProvider} The constant provider.
   * @protected
   */
  makeConstants_() {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param {!BlockSvg} block The block to measure.
   * @return {!RenderInfo} The render info object.
   * @protected
   */
  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param {!BlockSvg} block The block to render.
   * @param {!RenderInfo} info An object containing all
   *   information needed to render this block.
   * @return {!Drawer} The drawer.
   * @protected
   */
  makeDrawer_(block, info) {
    return new Drawer(block, info);
  }

  /**
   * Create a new instance of the renderer's debugger.
   * @return {!Debug} The renderer debugger.
   * @suppress {strictModuleDepCheck} Debug renderer only included in
   * playground.
   * @protected
   */
  makeDebugger_() {
    const {Debug} = goog.module.get('Blockly.blockRendering.Debug');
    if (!Debug) {
      throw Error('Missing require for Blockly.blockRendering.Debug');
    }
    return new Debug(this.getConstants());
  }

  /**
   * Create a new instance of the renderer's marker drawer.
   * @param {!WorkspaceSvg} workspace The workspace the marker belongs to.
   * @param {!Marker} marker The marker.
   * @return {!MarkerSvg} The object in charge of drawing
   *     the marker.
   * @package
   */
  makeMarkerDrawer(workspace, marker) {
    return new MarkerSvg(workspace, this.getConstants(), marker);
  }

  /**
   * Create a new instance of a renderer path object.
   * @param {!SVGElement} root The root SVG element.
   * @param {!Theme.BlockStyle} style The style object to use for
   *     colouring.
   * @return {!IPathObject} The renderer path object.
   * @package
   */
  makePathObject(root, style) {
    return new PathObject(
        root, style, /** @type {!ConstantProvider} */ (this.constants_));
  }

  /**
   * Get the current renderer's constant provider.  We assume that when this is
   * called, the renderer has already been initialized.
   * @return {!ConstantProvider} The constant provider.
   * @package
   */
  getConstants() {
    return /** @type {!ConstantProvider} */ (this.constants_);
  }

  /**
   * Determine whether or not to highlight a connection.
   * @param {Connection} _conn The connection to determine whether or not
   *     to highlight.
   * @return {boolean} True if we should highlight the connection.
   * @package
   */
  shouldHighlightConnection(_conn) {
    return true;
  }

  /**
   * Checks if an orphaned block can connect to the "end" of the topBlock's
   * block-clump. If the clump is a row the end is the last input. If the clump
   * is a stack, the end is the last next connection. If the clump is neither,
   * then this returns false.
   * @param {!BlockSvg} topBlock The top block of the block clump we want to try
   *     and connect to.
   * @param {!BlockSvg} orphanBlock The orphan block that wants to find
   *     a home.
   * @param {number} localType The type of the connection being dragged.
   * @return {boolean} Whether there is a home for the orphan or not.
   * @package
   */
  orphanCanConnectAtEnd(topBlock, orphanBlock, localType) {
    const orphanConnection =
        (localType === ConnectionType.OUTPUT_VALUE ?
             orphanBlock.outputConnection :
             orphanBlock.previousConnection);
    return !!Connection.getConnectionForOrphanedConnection(
        /** @type {!Block} **/ (topBlock),
        /** @type {!Connection} **/ (orphanConnection));
  }

  /**
   * Chooses a connection preview method based on the available connection, the
   * current dragged connection, and the block being dragged.
   * @param {!RenderedConnection} closest The available connection.
   * @param {!RenderedConnection} local The connection currently being
   *     dragged.
   * @param {!BlockSvg} topBlock The block currently being dragged.
   * @return {!InsertionMarkerManager.PREVIEW_TYPE} The preview type
   *     to display.
   * @package
   */
  getConnectionPreviewMethod(closest, local, topBlock) {
    if (local.type === ConnectionType.OUTPUT_VALUE ||
        local.type === ConnectionType.PREVIOUS_STATEMENT) {
      if (!closest.isConnected() ||
          this.orphanCanConnectAtEnd(
              topBlock,
              /** @type {!BlockSvg} */ (closest.targetBlock()), local.type)) {
        return InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
      }
      return InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE;
    }

    return InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
  }

  /**
   * Render the block.
   * @param {!BlockSvg} block The block to render.
   * @package
   */
  render(block) {
    if (debug.isDebuggerEnabled() && !block.renderingDebugger) {
      block.renderingDebugger = this.makeDebugger_();
    }
    const info = this.makeRenderInfo_(block);
    info.measure();
    this.makeDrawer_(block, info).draw();
  }
}

exports.Renderer = Renderer;
