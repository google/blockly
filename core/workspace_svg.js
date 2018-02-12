/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Object representing a workspace rendered as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WorkspaceSvg');

// TODO(scr): Fix circular dependencies
//goog.require('Blockly.BlockSvg');
goog.require('Blockly.ConnectionDB');
goog.require('Blockly.constants');
goog.require('Blockly.Gesture');
goog.require('Blockly.Grid');
goog.require('Blockly.Options');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Touch');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VariablesDynamic');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceAudio');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.Xml');
goog.require('Blockly.ZoomControls');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @param {!Blockly.Options} options Dictionary of options.
 * @param {Blockly.BlockDragSurfaceSvg=} opt_blockDragSurface Drag surface for
 *     blocks.
 * @param {Blockly.WorkspaceDragSurfaceSvg=} opt_wsDragSurface Drag surface for
 *     the workspace.
 * @extends {Blockly.Workspace}
 * @constructor
 */
Blockly.WorkspaceSvg = function(options, opt_blockDragSurface, opt_wsDragSurface) {
  Blockly.WorkspaceSvg.superClass_.constructor.call(this, options);
  this.getMetrics =
      options.getMetrics || Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_;
  this.setMetrics =
      options.setMetrics || Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_;

  Blockly.ConnectionDB.init(this);

  if (opt_blockDragSurface) {
    this.blockDragSurface_ = opt_blockDragSurface;
  }

  if (opt_wsDragSurface) {
    this.workspaceDragSurface_ = opt_wsDragSurface;
  }

  this.useWorkspaceDragSurface_ =
      this.workspaceDragSurface_ && Blockly.utils.is3dSupported();

  /**
   * List of currently highlighted blocks.  Block highlighting is often used to
   * visually mark blocks currently being executed.
   * @type !Array.<!Blockly.BlockSvg>
   * @private
   */
  this.highlightedBlocks_ = [];

  /**
   * Object in charge of loading, storing, and playing audio for a workspace.
   * @type {Blockly.WorkspaceAudio}
   * @private
   */
  this.audioManager_ = new Blockly.WorkspaceAudio(options.parentWorkspace);

  /**
   * This workspace's grid object or null.
   * @type {Blockly.Grid}
   * @private
   */
  this.grid_ = this.options.gridPattern ?
      new Blockly.Grid(options.gridPattern, options.gridOptions) : null;

  if (Blockly.Variables && Blockly.Variables.flyoutCategory) {
    this.registerToolboxCategoryCallback(Blockly.VARIABLE_CATEGORY_NAME,
        Blockly.Variables.flyoutCategory);
  }
  if (Blockly.VariablesDynamic && Blockly.VariablesDynamic.flyoutCategory) {
    this.registerToolboxCategoryCallback(Blockly.VARIABLE_DYNAMIC_CATEGORY_NAME,
        Blockly.VariablesDynamic.flyoutCategory);
  }
  if (Blockly.Procedures && Blockly.Procedures.flyoutCategory) {
    this.registerToolboxCategoryCallback(Blockly.PROCEDURE_CATEGORY_NAME,
        Blockly.Procedures.flyoutCategory);
  }
};
goog.inherits(Blockly.WorkspaceSvg, Blockly.Workspace);

/**
 * A wrapper function called when a resize event occurs.
 * You can pass the result to `unbindEvent_`.
 * @type {Array.<!Array>}
 */
Blockly.WorkspaceSvg.prototype.resizeHandlerWrapper_ = null;

/**
 * The render status of an SVG workspace.
 * Returns `true` for visible workspaces and `false` for non-visible,
 * or headless, workspaces.
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.rendered = true;

/**
 * Is this workspace the surface for a flyout?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.isFlyout = false;

/**
 * Is this workspace the surface for a mutator?
 * @type {boolean}
 * @package
 */
Blockly.WorkspaceSvg.prototype.isMutator = false;

/**
 * Whether this workspace has resizes enabled.
 * Disable during batch operations for a performance improvement.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.resizesEnabled_ = true;

/**
 * Current horizontal scrolling offset in pixel units.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset in pixel units.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollY = 0;

/**
 * Horizontal scroll value when scrolling started in pixel units.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.startScrollX = 0;

/**
 * Vertical scroll value when scrolling started in pixel units.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.startScrollY = 0;

/**
 * Distance from mouse to object being dragged.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragDeltaXY_ = null;

/**
 * Current scale.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scale = 1;

/**
 * The workspace's trashcan (if any).
 * @type {Blockly.Trashcan}
 */
Blockly.WorkspaceSvg.prototype.trashcan = null;

/**
 * This workspace's scrollbars, if they exist.
 * @type {Blockly.ScrollbarPair}
 */
Blockly.WorkspaceSvg.prototype.scrollbar = null;

/**
 * The current gesture in progress on this workspace, if any.
 * @type {Blockly.Gesture}
 * @private
 */
Blockly.WorkspaceSvg.prototype.currentGesture_ = null;

/**
 * This workspace's surface for dragging blocks, if it exists.
 * @type {Blockly.BlockDragSurfaceSvg}
 * @private
 */
Blockly.WorkspaceSvg.prototype.blockDragSurface_ = null;

/**
 * This workspace's drag surface, if it exists.
 * @type {Blockly.WorkspaceDragSurfaceSvg}
 * @private
 */
Blockly.WorkspaceSvg.prototype.workspaceDragSurface_ = null;

/**
  * Whether to move workspace to the drag surface when it is dragged.
  * True if it should move, false if it should be translated directly.
  * @type {boolean}
  * @private
  */
Blockly.WorkspaceSvg.prototype.useWorkspaceDragSurface_ = false;

/**
 * Whether the drag surface is actively in use. When true, calls to
 * translate will translate the drag surface instead of the translating the
 * workspace directly.
 * This is set to true in setupDragSurface and to false in resetDragSurface.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.isDragSurfaceActive_ = false;

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {!goog.math.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.lastRecordedPageScroll_ = null;

/**
 * Map from function names to callbacks, for deciding what to do when a button
 * is clicked.
 * @type {!Object.<string, function(!Blockly.FlyoutButton)>}
 * @private
 */
Blockly.WorkspaceSvg.prototype.flyoutButtonCallbacks_ = {};

/**
 * Map from function names to callbacks, for deciding what to do when a custom
 * toolbox category is opened.
 * @type {!Object.<string, function(!Blockly.Workspace):!Array.<!Element>>}
 * @private
 */
Blockly.WorkspaceSvg.prototype.toolboxCategoryCallbacks_ = {};

/**
 * In a flyout, the target workspace where blocks should be placed after a drag.
 * Otherwise null.
 * @type {?Blockly.WorkspaceSvg}
 * @package
 */
Blockly.WorkspaceSvg.prototype.targetWorkspace = null;

/**
 * Inverted screen CTM, for use in mouseToSvg.
 * @type {SVGMatrix}
 * @private
 */
Blockly.WorkspaceSvg.prototype.inverseScreenCTM_ = null;

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
Blockly.WorkspaceSvg.prototype.getInverseScreenCTM = function() {
  return this.inverseScreenCTM_;
};

/**
 * Update the inverted screen CTM.
 */
Blockly.WorkspaceSvg.prototype.updateInverseScreenCTM = function() {
  var ctm = this.getParentSvg().getScreenCTM();
  if (ctm) {
    this.inverseScreenCTM_ = ctm.inverse();
  }
};

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Element} element Element to find the coordinates of.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 * @private
 */
Blockly.WorkspaceSvg.prototype.getSvgXY = function(element) {
  var x = 0;
  var y = 0;
  var scale = 1;
  if (goog.dom.contains(this.getCanvas(), element) ||
      goog.dom.contains(this.getBubbleCanvas(), element)) {
    // Before the SVG canvas, scale the coordinates.
    scale = this.scale;
  }
  do {
    // Loop through this block and every parent.
    var xy = Blockly.utils.getRelativeXY(element);
    if (element == this.getCanvas() ||
        element == this.getBubbleCanvas()) {
      // After the SVG canvas, don't scale the coordinates.
      scale = 1;
    }
    x += xy.x * scale;
    y += xy.y * scale;
    element = element.parentNode;
  } while (element && element != this.getParentSvg());
  return new goog.math.Coordinate(x, y);
};

/**
 * Return the position of the workspace origin relative to the injection div
 * origin in pixels.
 * The workspace origin is where a block would render at position (0, 0).
 * It is not the upper left corner of the workspace SVG.
 * @return {!goog.math.Coordinate} Offset in pixels.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getOriginOffsetInPixels = function() {
  return Blockly.utils.getInjectionDivXY_(this.svgBlockCanvas_);
};

/**
 * Save resize handler data so we can delete it later in dispose.
 * @param {!Array.<!Array>} handler Data that can be passed to unbindEvent_.
 */
Blockly.WorkspaceSvg.prototype.setResizeHandlerWrapper = function(handler) {
  this.resizeHandlerWrapper_ = handler;
};

/**
 * Create the workspace DOM elements.
 * @param {string=} opt_backgroundClass Either 'blocklyMainBackground' or
 *     'blocklyMutatorBackground'.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.WorkspaceSvg.prototype.createDom = function(opt_backgroundClass) {
  /**
   * <g class="blocklyWorkspace">
   *   <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
   *   [Trashcan and/or flyout may go here]
   *   <g class="blocklyBlockCanvas"></g>
   *   <g class="blocklyBubbleCanvas"></g>
   * </g>
   * @type {SVGElement}
   */
  this.svgGroup_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyWorkspace'}, null);

  // Note that a <g> alone does not receive mouse events--it must have a
  // valid target inside it.  If no background class is specified, as in the
  // flyout, the workspace will not receive mouse events.
  if (opt_backgroundClass) {
    /** @type {SVGElement} */
    this.svgBackground_ = Blockly.utils.createSvgElement('rect',
        {'height': '100%', 'width': '100%', 'class': opt_backgroundClass},
        this.svgGroup_);

    if (opt_backgroundClass == 'blocklyMainBackground' && this.grid_) {
      this.svgBackground_.style.fill =
          'url(#' + this.grid_.getPatternId() + ')';
    }
  }
  /** @type {SVGElement} */
  this.svgBlockCanvas_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyBlockCanvas'}, this.svgGroup_);
  /** @type {SVGElement} */
  this.svgBubbleCanvas_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyBubbleCanvas'}, this.svgGroup_);
  var bottom = Blockly.Scrollbar.scrollbarThickness;
  if (this.options.hasTrashcan) {
    bottom = this.addTrashcan_(bottom);
  }
  if (this.options.zoomOptions && this.options.zoomOptions.controls) {
    this.addZoomControls_(bottom);
  }

  if (!this.isFlyout) {
    Blockly.bindEventWithChecks_(this.svgGroup_, 'mousedown', this,
        this.onMouseDown_);
    if (this.options.zoomOptions && this.options.zoomOptions.wheel) {
      // Mouse-wheel.
      Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this,
          this.onMouseWheel_);
    }
  }

  // Determine if there needs to be a category tree, or a simple list of
  // blocks.  This cannot be changed later, since the UI is very different.
  if (this.options.hasCategories) {
    /**
     * @type {Blockly.Toolbox}
     * @private
     */
    this.toolbox_ = new Blockly.Toolbox(this);
  }
  if (this.grid_) {
    this.grid_.update(this.scale);
  }
  this.recordDeleteAreas();
  return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.WorkspaceSvg.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  Blockly.WorkspaceSvg.superClass_.dispose.call(this);
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBlockCanvas_ = null;
  this.svgBubbleCanvas_ = null;
  if (this.toolbox_) {
    this.toolbox_.dispose();
    this.toolbox_ = null;
  }
  if (this.flyout_) {
    this.flyout_.dispose();
    this.flyout_ = null;
  }
  if (this.trashcan) {
    this.trashcan.dispose();
    this.trashcan = null;
  }
  if (this.scrollbar) {
    this.scrollbar.dispose();
    this.scrollbar = null;
  }
  if (this.zoomControls_) {
    this.zoomControls_.dispose();
    this.zoomControls_ = null;
  }

  if (this.audioManager_) {
    this.audioManager_.dispose();
    this.audioManager_ = null;
  }

  if (this.grid_) {
    this.grid_.dispose();
    this.grid_ = null;
  }

  if (this.toolboxCategoryCallbacks_) {
    this.toolboxCategoryCallbacks_ = null;
  }
  if (this.flyoutButtonCallbacks_) {
    this.flyoutButtonCallbacks_ = null;
  }
  if (!this.options.parentWorkspace) {
    // Top-most workspace.  Dispose of the div that the
    // SVG is injected into (i.e. injectionDiv).
    goog.dom.removeNode(this.getParentSvg().parentNode);
  }
  if (this.resizeHandlerWrapper_) {
    Blockly.unbindEvent_(this.resizeHandlerWrapper_);
    this.resizeHandlerWrapper_ = null;
  }
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @return {!Blockly.BlockSvg} The created block.
 */
Blockly.WorkspaceSvg.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.BlockSvg(this, prototypeName, opt_id);
};

/**
 * Add a trashcan.
 * @param {number} bottom Distance from workspace bottom to bottom of trashcan.
 * @return {number} Distance from workspace bottom to the top of trashcan.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addTrashcan_ = function(bottom) {
  /** @type {Blockly.Trashcan} */
  this.trashcan = new Blockly.Trashcan(this);
  var svgTrashcan = this.trashcan.createDom();
  this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
  return this.trashcan.init(bottom);
};

/**
 * Add zoom controls.
 * @param {number} bottom Distance from workspace bottom to bottom of controls.
 * @return {number} Distance from workspace bottom to the top of controls.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addZoomControls_ = function(bottom) {
  /** @type {Blockly.ZoomControls} */
  this.zoomControls_ = new Blockly.ZoomControls(this);
  var svgZoomControls = this.zoomControls_.createDom();
  this.svgGroup_.appendChild(svgZoomControls);
  return this.zoomControls_.init(bottom);
};

/**
 * Add a flyout element in an element with the given tag name.
 * @param {string} tagName What type of tag the flyout belongs in.
 * @return {!Element} The element containing the flyout DOM.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addFlyout_ = function(tagName) {
  var workspaceOptions = {
    disabledPatternId: this.options.disabledPatternId,
    parentWorkspace: this,
    RTL: this.RTL,
    oneBasedIndex: this.options.oneBasedIndex,
    horizontalLayout: this.horizontalLayout,
    toolboxPosition: this.options.toolboxPosition
  };
  /**
   * @type {!Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;
  if (this.horizontalLayout) {
    this.flyout_ = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    this.flyout_ = new Blockly.VerticalFlyout(workspaceOptions);
  }
  this.flyout_.autoClose = false;

  // Return the element  so that callers can place it in their desired
  // spot in the DOM.  For example, mutator flyouts do not go in the same place
  // as main workspace flyouts.
  return this.flyout_.createDom(tagName);
};

/**
 * Getter for the flyout associated with this workspace.  This flyout may be
 * owned by either the toolbox or the workspace, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @return {Blockly.Flyout} The flyout on this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getFlyout_ = function() {
  if (this.flyout_) {
    return this.flyout_;
  }
  if (this.toolbox_) {
    return this.toolbox_.flyout_;
  }
  return null;
};

/**
 * Update items that use screen coordinate calculations
 * because something has changed (e.g. scroll position, window size).
 * @private
 */
Blockly.WorkspaceSvg.prototype.updateScreenCalculations_ = function() {
  this.updateInverseScreenCTM();
  this.recordDeleteAreas();
};

/**
 * If enabled, resize the parts of the workspace that change when the workspace
 * contents (e.g. block positions) change.  This will also scroll the
 * workspace contents if needed.
 * @package
 */
Blockly.WorkspaceSvg.prototype.resizeContents = function() {
  if (!this.resizesEnabled_ || !this.rendered) {
    return;
  }
  if (this.scrollbar) {
    // TODO(picklesrus): Once rachel-fenichel's scrollbar refactoring
    // is complete, call the method that only resizes scrollbar
    // based on contents.
    this.scrollbar.resize();
  }
  this.updateInverseScreenCTM();
};

/**
 * Resize and reposition all of the workspace chrome (toolbox,
 * trash, scrollbars etc.)
 * This should be called when something changes that
 * requires recalculating dimensions and positions of the
 * trash, zoom, toolbox, etc. (e.g. window resize).
 */
Blockly.WorkspaceSvg.prototype.resize = function() {
  if (this.toolbox_) {
    this.toolbox_.position();
  }
  if (this.flyout_) {
    this.flyout_.position();
  }
  if (this.trashcan) {
    this.trashcan.position();
  }
  if (this.zoomControls_) {
    this.zoomControls_.position();
  }
  if (this.scrollbar) {
    this.scrollbar.resize();
  }
  this.updateScreenCalculations_();
};

/**
 * Resizes and repositions workspace chrome if the page has a new
 * scroll position.
 * @package
 */
Blockly.WorkspaceSvg.prototype.updateScreenCalculationsIfScrolled =
    function() {
    /* eslint-disable indent */
  var currScroll = goog.dom.getDocumentScroll();
  if (!goog.math.Coordinate.equals(this.lastRecordedPageScroll_,
     currScroll)) {
    this.lastRecordedPageScroll_ = currScroll;
    this.updateScreenCalculations_();
  }
}; /* eslint-enable indent */

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!Element} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getCanvas = function() {
  return this.svgBlockCanvas_;
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getBubbleCanvas = function() {
  return this.svgBubbleCanvas_;
};

/**
 * Get the SVG element that contains this workspace.
 * @return {Element} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getParentSvg = function() {
  if (this.cachedParentSvg_) {
    return this.cachedParentSvg_;
  }
  var element = this.svgGroup_;
  while (element) {
    if (element.tagName == 'svg') {
      this.cachedParentSvg_ = element;
      return element;
    }
    element = element.parentNode;
  }
  return null;
};

/**
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
Blockly.WorkspaceSvg.prototype.translate = function(x, y) {
  if (this.useWorkspaceDragSurface_ && this.isDragSurfaceActive_) {
    this.workspaceDragSurface_.translateSurface(x,y);
  } else {
    var translation = 'translate(' + x + ',' + y + ') ' +
        'scale(' + this.scale + ')';
    this.svgBlockCanvas_.setAttribute('transform', translation);
    this.svgBubbleCanvas_.setAttribute('transform', translation);
  }
  // Now update the block drag surface if we're using one.
  if (this.blockDragSurface_) {
    this.blockDragSurface_.translateAndScaleGroup(x, y, this.scale);
  }
};

/**
 * Called at the end of a workspace drag to take the contents
 * out of the drag surface and put them back into the workspace SVG.
 * Does nothing if the workspace drag surface is not enabled.
 * @package
 */
Blockly.WorkspaceSvg.prototype.resetDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  this.isDragSurfaceActive_ = false;

  var trans = this.workspaceDragSurface_.getSurfaceTranslation();
  this.workspaceDragSurface_.clearAndHide(this.svgGroup_);
  var translation = 'translate(' + trans.x + ',' + trans.y + ') ' +
      'scale(' + this.scale + ')';
  this.svgBlockCanvas_.setAttribute('transform', translation);
  this.svgBubbleCanvas_.setAttribute('transform', translation);
};

/**
 * Called at the beginning of a workspace drag to move contents of
 * the workspace to the drag surface.
 * Does nothing if the drag surface is not enabled.
 * @package
 */
Blockly.WorkspaceSvg.prototype.setupDragSurface = function() {
  // Don't do anything if we aren't using a drag surface.
  if (!this.useWorkspaceDragSurface_) {
    return;
  }

  // This can happen if the user starts a drag, mouses up outside of the
  // document where the mouseup listener is registered (e.g. outside of an
  // iframe) and then moves the mouse back in the workspace.  On mobile and ff,
  // we get the mouseup outside the frame. On chrome and safari desktop we do
  // not.
  if (this.isDragSurfaceActive_) {
    return;
  }

  this.isDragSurfaceActive_ = true;

  // Figure out where we want to put the canvas back.  The order
  // in the is important because things are layered.
  var previousElement = this.svgBlockCanvas_.previousSibling;
  var width = this.getParentSvg().getAttribute('width');
  var height = this.getParentSvg().getAttribute('height');
  var coord = Blockly.utils.getRelativeXY(this.svgBlockCanvas_);
  this.workspaceDragSurface_.setContentsAndShow(this.svgBlockCanvas_,
      this.svgBubbleCanvas_, previousElement, width, height, this.scale);
  this.workspaceDragSurface_.translateSurface(coord.x, coord.y);
};

/**
 * @return {?Blockly.BlockDragSurfaceSvg} This workspace's block drag surface,
 *     if one is in use.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getBlockDragSurface = function() {
  return this.blockDragSurface_;
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * @return {number} Width.
 */
Blockly.WorkspaceSvg.prototype.getWidth = function() {
  var metrics = this.getMetrics();
  return metrics ? metrics.viewWidth / this.scale : 0;
};

/**
 * Toggles the visibility of the workspace.
 * Currently only intended for main workspace.
 * @param {boolean} isVisible True if workspace should be visible.
 */
Blockly.WorkspaceSvg.prototype.setVisible = function(isVisible) {

  // Tell the scrollbar whether its container is visible so it can
  // tell when to hide itself.
  if (this.scrollbar) {
    this.scrollbar.setContainerVisible(isVisible);
  }

  // Tell the flyout whether its container is visible so it can
  // tell when to hide itself.
  if (this.getFlyout_()) {
    this.getFlyout_().setContainerVisible(isVisible);
  }

  this.getParentSvg().style.display = isVisible ? 'block' : 'none';
  if (this.toolbox_) {
    // Currently does not support toolboxes in mutators.
    this.toolbox_.HtmlDiv.style.display = isVisible ? 'block' : 'none';
  }
  if (isVisible) {
    this.render();
    if (this.toolbox_) {
      this.toolbox_.position();
    }
  } else {
    Blockly.hideChaff(true);
  }
};

/**
 * Render all blocks in workspace.
 */
Blockly.WorkspaceSvg.prototype.render = function() {
  // Generate list of all blocks.
  var blocks = this.getAllBlocks();
  // Render each block.
  for (var i = blocks.length - 1; i >= 0; i--) {
    blocks[i].render(false);
  }
};

/**
 * Was used back when block highlighting (for execution) and block selection
 * (for editing) were the same thing.
 * Any calls of this function can be deleted.
 * @deprecated October 2016
 */
Blockly.WorkspaceSvg.prototype.traceOn = function() {
  console.warn('Deprecated call to traceOn, delete this.');
};

/**
 * Highlight or unhighlight a block in the workspace.  Block highlighting is
 * often used to visually mark blocks currently being executed.
 * @param {?string} id ID of block to highlight/unhighlight,
 *   or null for no block (used to unhighlight all blocks).
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
Blockly.WorkspaceSvg.prototype.highlightBlock = function(id, opt_state) {
  if (opt_state === undefined) {
    // Unhighlight all blocks.
    for (var i = 0, block; block = this.highlightedBlocks_[i]; i++) {
      block.setHighlighted(false);
    }
    this.highlightedBlocks_.length = 0;
  }
  // Highlight/unhighlight the specified block.
  var block = id ? this.getBlockById(id) : null;
  if (block) {
    var state = (opt_state === undefined) || opt_state;
    // Using Set here would be great, but at the cost of IE10 support.
    if (!state) {
      goog.array.remove(this.highlightedBlocks_, block);
    } else if (this.highlightedBlocks_.indexOf(block) == -1) {
      this.highlightedBlocks_.push(block);
    }
    block.setHighlighted(state);
  }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.WorkspaceSvg.prototype.paste = function(xmlBlock) {
  if (!this.rendered || xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  if (this.currentGesture_) {
    this.currentGesture_.cancel();  // Dragging while pasting?  No.
  }
  Blockly.Events.disable();
  try {
    var block = Blockly.Xml.domToBlock(xmlBlock, this);
    // Move the duplicate to original position.
    var blockX = parseInt(xmlBlock.getAttribute('x'), 10);
    var blockY = parseInt(xmlBlock.getAttribute('y'), 10);
    if (!isNaN(blockX) && !isNaN(blockY)) {
      if (this.RTL) {
        blockX = -blockX;
      }
      // Offset block until not clobbering another block and not in connection
      // distance with neighbouring blocks.
      do {
        var collide = false;
        var allBlocks = this.getAllBlocks();
        for (var i = 0, otherBlock; otherBlock = allBlocks[i]; i++) {
          var otherXY = otherBlock.getRelativeToSurfaceXY();
          if (Math.abs(blockX - otherXY.x) <= 1 &&
              Math.abs(blockY - otherXY.y) <= 1) {
            collide = true;
            break;
          }
        }
        if (!collide) {
          // Check for blocks in snap range to any of its connections.
          var connections = block.getConnections_(false);
          for (var i = 0, connection; connection = connections[i]; i++) {
            var neighbour = connection.closest(Blockly.SNAP_RADIUS,
                new goog.math.Coordinate(blockX, blockY));
            if (neighbour.connection) {
              collide = true;
              break;
            }
          }
        }
        if (collide) {
          if (this.RTL) {
            blockX -= Blockly.SNAP_RADIUS;
          } else {
            blockX += Blockly.SNAP_RADIUS;
          }
          blockY += Blockly.SNAP_RADIUS * 2;
        }
      } while (collide);
      block.moveBy(blockX, blockY);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled() && !block.isShadow()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(block));
  }
  block.select();
};

/**
 * Refresh the toolbox unless there's a drag in progress.
 * @package
 */
Blockly.WorkspaceSvg.prototype.refreshToolboxSelection = function() {
  var ws = this.isFlyout ? this.targetWorkspace : this;
  if (ws && !ws.currentGesture_ && ws.toolbox_ && ws.toolbox_.flyout_) {
    ws.toolbox_.refreshSelection();
  }
};

/**
 * Rename a variable by updating its name in the variable map.  Update the
 *     flyout to show the renamed variable immediately.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 * @package
 */
Blockly.WorkspaceSvg.prototype.renameVariableById = function(id, newName) {
  Blockly.WorkspaceSvg.superClass_.renameVariableById.call(this, id, newName);
  this.refreshToolboxSelection();
};

/**
 * Delete a variable by the passed in ID.   Update the flyout to show
 *     immediately that the variable is deleted.
 * @param {string} id ID of variable to delete.
 * @package
 */
Blockly.WorkspaceSvg.prototype.deleteVariableById = function(id) {
  Blockly.WorkspaceSvg.superClass_.deleteVariableById.call(this, id);
  this.refreshToolboxSelection();
};

/**
 * Create a new variable with the given name.  Update the flyout to show the new
 *     variable immediately.
 * @param {string} name The new variable's name.
 * @param {string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {?Blockly.VariableModel} The newly created variable.
 * @package
 */
Blockly.WorkspaceSvg.prototype.createVariable = function(name, opt_type, opt_id) {
  var newVar = Blockly.WorkspaceSvg.superClass_.createVariable.call(
      this, name, opt_type, opt_id);
  this.refreshToolboxSelection();
  return newVar;
};

/**
 * Make a list of all the delete areas for this workspace.
 */
Blockly.WorkspaceSvg.prototype.recordDeleteAreas = function() {
  if (this.trashcan) {
    this.deleteAreaTrash_ = this.trashcan.getClientRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getClientRect();
  } else if (this.toolbox_) {
    this.deleteAreaToolbox_ = this.toolbox_.getClientRect();
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
 * Is the mouse event over a delete area (toolbox or non-closing flyout)?
 * @param {!Event} e Mouse move event.
 * @return {?number} Null if not over a delete area, or an enum representing
 *     which delete area the event is over.
 */
Blockly.WorkspaceSvg.prototype.isDeleteArea = function(e) {
  var xy = new goog.math.Coordinate(e.clientX, e.clientY);
  if (this.deleteAreaTrash_ && this.deleteAreaTrash_.contains(xy)) {
    return Blockly.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ && this.deleteAreaToolbox_.contains(xy)) {
    return Blockly.DELETE_AREA_TOOLBOX;
  }
  return Blockly.DELETE_AREA_NONE;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseDown_ = function(e) {
  var gesture = this.getGesture(e);
  if (gesture) {
    gesture.handleWsStart(e, this);
  }
};

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {!goog.math.Coordinate} xy Starting location of object.
 */
Blockly.WorkspaceSvg.prototype.startDrag = function(e, xy) {
  // Record the starting offset between the bubble's location and the mouse.
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = goog.math.Coordinate.difference(xy, point);
};

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
Blockly.WorkspaceSvg.prototype.moveDrag = function(e) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return goog.math.Coordinate.sum(this.dragDeltaXY_, point);
};

/**
 * Is the user currently dragging a block or scrolling the flyout/workspace?
 * @return {boolean} True if currently dragging or scrolling.
 */
Blockly.WorkspaceSvg.prototype.isDragging = function() {
  return this.currentGesture_ != null && this.currentGesture_.isDragging();
};

/**
 * Is this workspace draggable and scrollable?
 * @return {boolean} True if this workspace may be dragged.
 */
Blockly.WorkspaceSvg.prototype.isDraggable = function() {
  return !!this.scrollbar;
};

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * @param {!Event} e Mouse wheel event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseWheel_ = function(e) {
  // TODO: Remove gesture cancellation and compensate for coordinate skew during
  // zoom.
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  // The vertical scroll distance that corresponds to a click of a zoom button.
  var PIXELS_PER_ZOOM_STEP = 50;
  var delta = -e.deltaY / PIXELS_PER_ZOOM_STEP;
  var position = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  this.zoom(position.x, position.y, delta);
  e.preventDefault();
};

/**
 * Calculate the bounding box for the blocks on the workspace.
 * Coordinate system: workspace coordinates.
 *
 * @return {Object} Contains the position and size of the bounding box
 *   containing the blocks on the workspace.
 */
Blockly.WorkspaceSvg.prototype.getBlocksBoundingBox = function() {
  var topBlocks = this.getTopBlocks(false);
  // There are no blocks, return empty rectangle.
  if (!topBlocks.length) {
    return {x: 0, y: 0, width: 0, height: 0};
  }

  // Initialize boundary using the first block.
  var boundary = topBlocks[0].getBoundingRectangle();

  // Start at 1 since the 0th block was used for initialization
  for (var i = 1; i < topBlocks.length; i++) {
    var blockBoundary = topBlocks[i].getBoundingRectangle();
    if (blockBoundary.topLeft.x < boundary.topLeft.x) {
      boundary.topLeft.x = blockBoundary.topLeft.x;
    }
    if (blockBoundary.bottomRight.x > boundary.bottomRight.x) {
      boundary.bottomRight.x = blockBoundary.bottomRight.x;
    }
    if (blockBoundary.topLeft.y < boundary.topLeft.y) {
      boundary.topLeft.y = blockBoundary.topLeft.y;
    }
    if (blockBoundary.bottomRight.y > boundary.bottomRight.y) {
      boundary.bottomRight.y = blockBoundary.bottomRight.y;
    }
  }
  return {
    x: boundary.topLeft.x,
    y: boundary.topLeft.y,
    width: boundary.bottomRight.x - boundary.topLeft.x,
    height: boundary.bottomRight.y - boundary.topLeft.y
  };
};

/**
 * Clean up the workspace by ordering all the blocks in a column.
 */
Blockly.WorkspaceSvg.prototype.cleanUp = function() {
  this.setResizesEnabled(false);
  Blockly.Events.setGroup(true);
  var topBlocks = this.getTopBlocks(true);
  var cursorY = 0;
  for (var i = 0, block; block = topBlocks[i]; i++) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(-xy.x, cursorY - xy.y);
    block.snapToGrid();
    cursorY = block.getRelativeToSurfaceXY().y +
        block.getHeightWidth().height + Blockly.BlockSvg.MIN_BLOCK_Y;
  }
  Blockly.Events.setGroup(false);
  this.setResizesEnabled(true);
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
  if (this.options.readOnly || this.isFlyout) {
    return;
  }
  var menuOptions = [];
  var topBlocks = this.getTopBlocks(true);
  var eventGroup = Blockly.utils.genUid();
  var ws = this;

  // Options to undo/redo previous action.
  var undoOption = {};
  undoOption.text = Blockly.Msg.UNDO;
  undoOption.enabled = this.undoStack_.length > 0;
  undoOption.callback = this.undo.bind(this, false);
  menuOptions.push(undoOption);
  var redoOption = {};
  redoOption.text = Blockly.Msg.REDO;
  redoOption.enabled = this.redoStack_.length > 0;
  redoOption.callback = this.undo.bind(this, true);
  menuOptions.push(redoOption);

  // Option to clean up blocks.
  if (this.scrollbar) {
    var cleanOption = {};
    cleanOption.text = Blockly.Msg.CLEAN_UP;
    cleanOption.enabled = topBlocks.length > 1;
    cleanOption.callback = this.cleanUp.bind(this);
    menuOptions.push(cleanOption);
  }

  // Add a little animation to collapsing and expanding.
  var DELAY = 10;
  if (this.options.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    for (var i = 0; i < topBlocks.length; i++) {
      var block = topBlocks[i];
      while (block) {
        if (block.isCollapsed()) {
          hasCollapsedBlocks = true;
        } else {
          hasExpandedBlocks = true;
        }
        block = block.getNextBlock();
      }
    }

    /**
     * Option to collapse or expand top blocks.
     * @param {boolean} shouldCollapse Whether a block should collapse.
     * @private
     */
    var toggleOption = function(shouldCollapse) {
      var ms = 0;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
          block = block.getNextBlock();
          ms += DELAY;
        }
      }
    };

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      toggleOption(true);
    };
    menuOptions.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      toggleOption(false);
    };
    menuOptions.push(expandOption);
  }

  // Option to delete all blocks.
  // Count the number of blocks that are deletable.
  var deleteList = [];
  function addDeletableBlocks(block) {
    if (block.isDeletable()) {
      deleteList = deleteList.concat(block.getDescendants());
    } else {
      var children = block.getChildren();
      for (var i = 0; i < children.length; i++) {
        addDeletableBlocks(children[i]);
      }
    }
  }
  for (var i = 0; i < topBlocks.length; i++) {
    addDeletableBlocks(topBlocks[i]);
  }

  function deleteNext() {
    Blockly.Events.setGroup(eventGroup);
    var block = deleteList.shift();
    if (block) {
      if (block.workspace) {
        block.dispose(false, true);
        setTimeout(deleteNext, DELAY);
      } else {
        deleteNext();
      }
    }
    Blockly.Events.setGroup(false);
  }

  var deleteOption = {
    text: deleteList.length == 1 ? Blockly.Msg.DELETE_BLOCK :
        Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteList.length)),
    enabled: deleteList.length > 0,
    callback: function() {
      if (ws.currentGesture_) {
        ws.currentGesture_.cancel();
      }
      if (deleteList.length < 2 ) {
        deleteNext();
      } else {
        Blockly.confirm(
            Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', deleteList.length),
            function(ok) {
              if (ok) {
                deleteNext();
              }
            });
      }
    }
  };
  menuOptions.push(deleteOption);

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.WorkspaceSvg.prototype.updateToolbox = function(tree) {
  tree = Blockly.Options.parseToolboxTree(tree);
  if (!tree) {
    if (this.options.languageTree) {
      throw 'Can\'t nullify an existing toolbox.';
    }
    return;  // No change (null to null).
  }
  if (!this.options.languageTree) {
    throw 'Existing toolbox is null.  Can\'t create new toolbox.';
  }
  if (tree.getElementsByTagName('category').length) {
    if (!this.toolbox_) {
      throw 'Existing toolbox has no categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.toolbox_.populate_(tree);
    this.toolbox_.addColour_();
  } else {
    if (!this.flyout_) {
      throw 'Existing toolbox has categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.flyout_.show(tree.childNodes);
  }
};

/**
 * Mark this workspace as the currently focused main workspace.
 */
Blockly.WorkspaceSvg.prototype.markFocused = function() {
  if (this.options.parentWorkspace) {
    this.options.parentWorkspace.markFocused();
  } else {
    Blockly.mainWorkspace = this;
    // We call e.preventDefault in many event handlers which means we
    // need to explicitly grab focus (e.g from a textarea) because
    // the browser will not do it for us.  How to do this is browser dependant.
    this.setBrowserFocus();
  }
};

/**
 * Set the workspace to have focus in the browser.
 * @private
 */
Blockly.WorkspaceSvg.prototype.setBrowserFocus = function() {
  // Blur whatever was focused since explcitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur();
  }
  try {
    // Focus the workspace SVG - this is for Chrome and Firefox.
    this.getParentSvg().focus();
  } catch (e) {
    // IE and Edge do not support focus on SVG elements. When that fails
    // above, get the injectionDiv (the workspace's parent) and focus that
    // instead.  This doesn't work in Chrome.
    try {
      // In IE11, use setActive (which is IE only) so the page doesn't scroll
      // to the workspace gaining focus.
      this.getParentSvg().parentNode.setActive();
    } catch (e) {
      // setActive support was discontinued in Edge so when that fails, call
      // focus instead.
      this.getParentSvg().parentNode.focus();
    }
  }
};

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} amount Amount of zooming
 *                        (negative zooms out and positive zooms in).
 */
Blockly.WorkspaceSvg.prototype.zoom = function(x, y, amount) {
  var speed = this.options.zoomOptions.scaleSpeed;
  var metrics = this.getMetrics();
  var center = this.getParentSvg().createSVGPoint();
  center.x = x;
  center.y = y;
  center = center.matrixTransform(this.getCanvas().getCTM().inverse());
  x = center.x;
  y = center.y;
  var canvas = this.getCanvas();
  // Scale factor.
  var scaleChange = Math.pow(speed, amount);
  // Clamp scale within valid range.
  var newScale = this.scale * scaleChange;
  if (newScale > this.options.zoomOptions.maxScale) {
    scaleChange = this.options.zoomOptions.maxScale / this.scale;
  } else if (newScale < this.options.zoomOptions.minScale) {
    scaleChange = this.options.zoomOptions.minScale / this.scale;
  }
  if (this.scale == newScale) {
    return;  // No change in zoom.
  }
  if (this.scrollbar) {
    var matrix = canvas.getCTM()
        .translate(x * (1 - scaleChange), y * (1 - scaleChange))
        .scale(scaleChange);
    // newScale and matrix.a should be identical (within a rounding error).
    // ScrollX and scrollY are in pixels.
    this.scrollX = matrix.e - metrics.absoluteLeft;
    this.scrollY = matrix.f - metrics.absoluteTop;
  }
  this.setScale(newScale);
};

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
Blockly.WorkspaceSvg.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics();
  var x = metrics.viewWidth / 2;
  var y = metrics.viewHeight / 2;
  this.zoom(x, y, type);
};

/**
 * Zoom the blocks to fit in the workspace if possible.
 */
Blockly.WorkspaceSvg.prototype.zoomToFit = function() {
  var metrics = this.getMetrics();
  var blocksBox = this.getBlocksBoundingBox();
  var blocksWidth = blocksBox.width;
  var blocksHeight = blocksBox.height;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  var workspaceWidth = metrics.viewWidth;
  var workspaceHeight = metrics.viewHeight;
  if (this.flyout_) {
    workspaceWidth -= this.flyout_.width_;
  }
  if (!this.scrollbar) {
    // Origin point of 0,0 is fixed, blocks will not scroll to center.
    blocksWidth += metrics.contentLeft;
    blocksHeight += metrics.contentTop;
  }
  var ratioX = workspaceWidth / blocksWidth;
  var ratioY = workspaceHeight / blocksHeight;
  this.setScale(Math.min(ratioX, ratioY));
  this.scrollCenter();
};

/**
 * Center the workspace.
 */
Blockly.WorkspaceSvg.prototype.scrollCenter = function() {
  if (!this.scrollbar) {
    // Can't center a non-scrolling workspace.
    return;
  }
  var metrics = this.getMetrics();
  var x = (metrics.contentWidth - metrics.viewWidth) / 2;
  if (this.flyout_) {
    x -= this.flyout_.width_ / 2;
  }
  var y = (metrics.contentHeight - metrics.viewHeight) / 2;
  this.scrollbar.set(x, y);
};

/**
 * Set the workspace's zoom factor.
 * @param {number} newScale Zoom factor.
 */
Blockly.WorkspaceSvg.prototype.setScale = function(newScale) {
  if (this.options.zoomOptions.maxScale &&
      newScale > this.options.zoomOptions.maxScale) {
    newScale = this.options.zoomOptions.maxScale;
  } else if (this.options.zoomOptions.minScale &&
      newScale < this.options.zoomOptions.minScale) {
    newScale = this.options.zoomOptions.minScale;
  }
  this.scale = newScale;
  if (this.grid_) {
    this.grid_.update(this.scale);
  }
  if (this.scrollbar) {
    this.scrollbar.resize();
  } else {
    this.translate(this.scrollX, this.scrollY);
  }
  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
  }
};

/**
 * Get the dimensions of the given workspace component, in pixels.
 * @param {Blockly.Toolbox|Blockly.Flyout} elem The element to get the
 *     dimensions of, or null.  It should be a toolbox or flyout, and should
 *     implement getWidth() and getHeight().
 * @return {!Object} An object containing width and height attributes, which
 *     will both be zero if elem did not exist.
 * @private
 */
Blockly.WorkspaceSvg.getDimensionsPx_ = function(elem) {
  var width = 0;
  var height = 0;
  if (elem) {
    width = elem.getWidth();
    height = elem.getHeight();
  }
  return {
    width: width,
    height: height
  };
};

/**
 * Get the content dimensions of the given workspace, taking into account
 * whether or not it is scrollable and what size the workspace div is on screen.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing at least
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
Blockly.WorkspaceSvg.getContentDimensions_ = function(ws, svgSize) {
  if (ws.scrollbar) {
    return Blockly.WorkspaceSvg.getContentDimensionsBounded_(ws, svgSize);
  } else {
    return Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);
  }
};

/**
 * Get the bounding box for all workspace contents, in pixels.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to inspect.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left, right, top and bottom in pixels relative to the workspace origin.
 * @private
 */
Blockly.WorkspaceSvg.getContentDimensionsExact_ = function(ws) {
  // Block bounding box is in workspace coordinates.
  var blockBox = ws.getBlocksBoundingBox();
  var scale = ws.scale;

  // Convert to pixels.
  var width = blockBox.width * scale;
  var height = blockBox.height * scale;
  var left = blockBox.x * scale;
  var top = blockBox.y * scale;

  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
    width: width,
    height: height
  };
};

/**
 * Calculate the size of a scrollable workspace, which should include room for a
 * half screen border around the workspace contents.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to measure.
 * @param {!Object} svgSize An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
Blockly.WorkspaceSvg.getContentDimensionsBounded_ = function(ws, svgSize) {
  var content = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);

  // View height and width are both in pixels, and are the same as the SVG size.
  var viewWidth = svgSize.width;
  var viewHeight = svgSize.height;
  var halfWidth = viewWidth / 2;
  var halfHeight = viewHeight / 2;

  // Add a border around the content that is at least half a screenful wide.
  // Ensure border is wide enough that blocks can scroll over entire screen.
  var left = Math.min(content.left - halfWidth, content.right - viewWidth);
  var right = Math.max(content.right + halfWidth, content.left + viewWidth);

  var top = Math.min(content.top - halfHeight, content.bottom - viewHeight);
  var bottom = Math.max(content.bottom + halfHeight, content.top + viewHeight);

  var dimensions = {
    left: left,
    top: top,
    height: bottom - top,
    width: right - left
  };
  return dimensions;
};

/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates.
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * .toolboxWidth: Width of toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of flyout if it is always open.  Otherwise zero.
 * .toolboxPosition: Top, bottom, left or right.
 * @return {!Object} Contains size and position metrics of a top level
 *   workspace.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function() {

  var toolboxDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
  var flyoutDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.flyout_);

  // Contains height and width in CSS pixels.
  // svgSize is equivalent to the size of the injectionDiv at this point.
  var svgSize = Blockly.svgSize(this.getParentSvg());
  if (this.toolbox_) {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      svgSize.height -= toolboxDimensions.height;
    } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      svgSize.width -= toolboxDimensions.width;
    }
  }

  // svgSize is now the space taken up by the Blockly workspace, not including
  // the toolbox.
  var contentDimensions =
      Blockly.WorkspaceSvg.getContentDimensions_(this, svgSize);

  var absoluteLeft = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = toolboxDimensions.width;
  }
  var absoluteTop = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = toolboxDimensions.height;
  }

  var metrics = {
    contentHeight: contentDimensions.height,
    contentWidth: contentDimensions.width,
    contentTop: contentDimensions.top,
    contentLeft: contentDimensions.left,

    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    viewTop: -this.scrollY,   // Must be in pixels, somehow.
    viewLeft: -this.scrollX,  // Must be in pixels, somehow.

    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft,

    toolboxWidth: toolboxDimensions.width,
    toolboxHeight: toolboxDimensions.height,

    flyoutWidth: flyoutDimensions.width,
    flyoutHeight: flyoutDimensions.height,

    toolboxPosition: this.toolboxPosition
  };
  return metrics;
};

/**
 * Sets the X/Y translations of a top level workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set top level workspace scroll without scrollbars.';
  }
  var metrics = this.getMetrics();
  if (goog.isNumber(xyRatio.x)) {
    this.scrollX = -metrics.contentWidth * xyRatio.x - metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.scrollY = -metrics.contentHeight * xyRatio.y - metrics.contentTop;
  }
  var x = this.scrollX + metrics.absoluteLeft;
  var y = this.scrollY + metrics.absoluteTop;
  this.translate(x, y);
  if (this.grid_) {
    this.grid_.moveTo(x, y);
  }
};

/**
 * Update whether this workspace has resizes enabled.
 * If enabled, workspace will resize when appropriate.
 * If disabled, workspace will not resize until re-enabled.
 * Use to avoid resizing during a batch operation, for performance.
 * @param {boolean} enabled Whether resizes should be enabled.
 */
Blockly.WorkspaceSvg.prototype.setResizesEnabled = function(enabled) {
  var reenabled = (!this.resizesEnabled_ && enabled);
  this.resizesEnabled_ = enabled;
  if (reenabled) {
    // Newly enabled.  Trigger a resize.
    this.resizeContents();
  }
};

/**
 * Dispose of all blocks in workspace, with an optimization to prevent resizes.
 */
Blockly.WorkspaceSvg.prototype.clear = function() {
  this.setResizesEnabled(false);
  Blockly.WorkspaceSvg.superClass_.clear.call(this);
  this.setResizesEnabled(true);
};

/**
 * Register a callback function associated with a given key, for clicks on
 * buttons and labels in the flyout.
 * For instance, a button specified by the XML
 * <button text="create variable" callbackKey="CREATE_VARIABLE"></button>
 * should be matched by a call to
 * registerButtonCallback("CREATE_VARIABLE", yourCallbackFunction).
 * @param {string} key The name to use to look up this function.
 * @param {function(!Blockly.FlyoutButton)} func The function to call when the
 *     given button is clicked.
 */
Blockly.WorkspaceSvg.prototype.registerButtonCallback = function(key, func) {
  goog.asserts.assert(goog.isFunction(func),
      'Button callbacks must be functions.');
  this.flyoutButtonCallbacks_[key] = func;
};

/**
 * Get the callback function associated with a given key, for clicks on buttons
 * and labels in the flyout.
 * @param {string} key The name to use to look up the function.
 * @return {?function(!Blockly.FlyoutButton)} The function corresponding to the
 *     given key for this workspace; null if no callback is registered.
 */
Blockly.WorkspaceSvg.prototype.getButtonCallback = function(key) {
  var result = this.flyoutButtonCallbacks_[key];
  return result ? result : null;
};

/**
 * Remove a callback for a click on a button in the flyout.
 * @param {string} key The name associated with the callback function.
 */
Blockly.WorkspaceSvg.prototype.removeButtonCallback = function(key) {
  this.flyoutButtonCallbacks_[key] = null;
};

/**
 * Register a callback function associated with a given key, for populating
 * custom toolbox categories in this workspace.  See the variable and procedure
 * categories as an example.
 * @param {string} key The name to use to look up this function.
 * @param {function(!Blockly.Workspace):!Array.<!Element>} func The function to
 *     call when the given toolbox category is opened.
 */
Blockly.WorkspaceSvg.prototype.registerToolboxCategoryCallback = function(key,
    func) {
  goog.asserts.assert(goog.isFunction(func),
      'Toolbox category callbacks must be functions.');
  this.toolboxCategoryCallbacks_[key] = func;
};

/**
 * Get the callback function associated with a given key, for populating
 * custom toolbox categories in this workspace.
 * @param {string} key The name to use to look up the function.
 * @return {?function(!Blockly.Workspace):!Array.<!Element>} The function
 *     corresponding to the given key for this workspace, or null if no function
 *     is registered.
 */
Blockly.WorkspaceSvg.prototype.getToolboxCategoryCallback = function(key) {
  var result = this.toolboxCategoryCallbacks_[key];
  return result ? result : null;
};

/**
 * Remove a callback for a click on a custom category's name in the toolbox.
 * @param {string} key The name associated with the callback function.
 */
Blockly.WorkspaceSvg.prototype.removeToolboxCategoryCallback = function(key) {
  this.toolboxCategoryCallbacks_[key] = null;
};

/**
 * Look up the gesture that is tracking this touch stream on this workspace.
 * May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {Blockly.Gesture} The gesture that is tracking this touch stream,
 *     or null if no valid gesture exists.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getGesture = function(e) {
  var isStart = (e.type == 'mousedown' || e.type == 'touchstart' || e.type == 'pointerdown');

  var gesture = this.currentGesture_;
  if (gesture) {
    if (isStart && gesture.hasStarted()) {
      console.warn('tried to start the same gesture twice');
      // That's funny.  We must have missed a mouse up.
      // Cancel it, rather than try to retrieve all of the state we need.
      gesture.cancel();
      return null;
    }
    return gesture;
  }

  // No gesture existed on this workspace, but this looks like the start of a
  // new gesture.
  if (isStart) {
    this.currentGesture_ = new Blockly.Gesture(e, this);
    return this.currentGesture_;
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null;
};

/**
 * Clear the reference to the current gesture.
 * @package
 */
Blockly.WorkspaceSvg.prototype.clearGesture = function() {
  this.currentGesture_ = null;
};

/**
 * Cancel the current gesture, if one exists.
 * @package
 */
Blockly.WorkspaceSvg.prototype.cancelCurrentGesture = function() {
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
};

/**
 * Get the audio manager for this workspace.
 * @return {Blockly.WorkspaceAudio} The audio manager for this workspace.
 */
Blockly.WorkspaceSvg.prototype.getAudioManager = function() {
  return this.audioManager_;
};

/**
 * Get the grid object for this workspace, or null if there is none.
 * @return {Blockly.Grid} The grid object for this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getGrid = function() {
  return this.grid_;
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.WorkspaceSvg.prototype['setVisible'] =
    Blockly.WorkspaceSvg.prototype.setVisible;
