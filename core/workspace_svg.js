/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a workspace rendered as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WorkspaceSvg');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.blockRendering');
goog.require('Blockly.ConnectionDB');
goog.require('Blockly.constants');
goog.require('Blockly.ContextMenuRegistry');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.Gesture');
goog.require('Blockly.Grid');
goog.require('Blockly.MarkerManager');
goog.require('Blockly.Msg');
goog.require('Blockly.navigation');
goog.require('Blockly.Options');
goog.require('Blockly.registry');
goog.require('Blockly.ThemeManager');
goog.require('Blockly.Themes.Classic');
goog.require('Blockly.TouchGesture');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Metrics');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.toolbox');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceAudio');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.Xml');

goog.requireType('Blockly.blockRendering.Renderer');
goog.requireType('Blockly.IASTNodeLocationSvg');
goog.requireType('Blockly.IBoundedElement');
goog.requireType('Blockly.IFlyout');


/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @param {!Blockly.Options} options Dictionary of options.
 * @param {Blockly.BlockDragSurfaceSvg=} opt_blockDragSurface Drag surface for
 *     blocks.
 * @param {Blockly.WorkspaceDragSurfaceSvg=} opt_wsDragSurface Drag surface for
 *     the workspace.
 * @extends {Blockly.Workspace}
 * @implements {Blockly.IASTNodeLocationSvg}
 * @constructor
 */
Blockly.WorkspaceSvg = function(options,
    opt_blockDragSurface, opt_wsDragSurface) {
  Blockly.WorkspaceSvg.superClass_.constructor.call(this, options);
  /** @type {function():!Blockly.utils.Metrics} */
  this.getMetrics =
      options.getMetrics || Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_;
  /** @type {function(!{x:number, y:number}):void} */
  this.setMetrics =
      options.setMetrics || Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_;


  this.connectionDBList = Blockly.ConnectionDB.init(this.connectionChecker);

  if (opt_blockDragSurface) {
    this.blockDragSurface_ = opt_blockDragSurface;
  }

  if (opt_wsDragSurface) {
    this.workspaceDragSurface_ = opt_wsDragSurface;
  }

  this.useWorkspaceDragSurface_ =
      !!this.workspaceDragSurface_ && Blockly.utils.is3dSupported();

  /**
   * List of currently highlighted blocks.  Block highlighting is often used to
   * visually mark blocks currently being executed.
   * @type {!Array.<!Blockly.BlockSvg>}
   * @private
   */
  this.highlightedBlocks_ = [];

  /**
   * Object in charge of loading, storing, and playing audio for a workspace.
   * @type {!Blockly.WorkspaceAudio}
   * @private
   */
  this.audioManager_ = new Blockly.WorkspaceAudio(
      /** @type {Blockly.WorkspaceSvg} */ (options.parentWorkspace));

  /**
   * This workspace's grid object or null.
   * @type {Blockly.Grid}
   * @private
   */
  this.grid_ = this.options.gridPattern ?
      new Blockly.Grid(this.options.gridPattern, options.gridOptions) : null;

  /**
   * Manager in charge of markers and cursors.
   * @type {!Blockly.MarkerManager}
   * @private
   */
  this.markerManager_ = new Blockly.MarkerManager(this);

  /**
  * Map from function names to callbacks, for deciding what to do when a custom
  * toolbox category is opened.
  * @type {!Object.<string, ?function(!Blockly.Workspace):!Array.<!Element>>}
  * @private
  */
  this.toolboxCategoryCallbacks_ = {};

  /**
  * Map from function names to callbacks, for deciding what to do when a button
  * is clicked.
  * @type {!Object.<string, ?function(!Blockly.FlyoutButton)>}
  * @private
  */
  this.flyoutButtonCallbacks_ = {};

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
    this.addChangeListener(Blockly.Procedures.mutatorOpenListener);
  }

  /**
   * Object in charge of storing and updating the workspace theme.
   * @type {!Blockly.ThemeManager}
   * @protected
   */
  this.themeManager_ = this.options.parentWorkspace ?
      this.options.parentWorkspace.getThemeManager() :
      new Blockly.ThemeManager(this,
          this.options.theme || Blockly.Themes.Classic);
  this.themeManager_.subscribeWorkspace(this);

  /**
   * The block renderer used for rendering blocks on this workspace.
   * @type {!Blockly.blockRendering.Renderer}
   * @private
   */
  this.renderer_ = Blockly.blockRendering.init(this.options.renderer || 'geras',
      this.getTheme(), this.options.rendererOverrides);

  /**
   * Cached parent SVG.
   * @type {SVGElement}
   * @private
   */
  this.cachedParentSvg_ = null;

  /**
   * True if keyboard accessibility mode is on, false otherwise.
   * @type {boolean}
   */
  this.keyboardAccessibilityMode = false;

  /**
   * The list of top-level bounded elements on the workspace.
   * @type {!Array.<!Blockly.IBoundedElement>}
   * @private
   */
  this.topBoundedElements_ = [];
};
Blockly.utils.object.inherits(Blockly.WorkspaceSvg, Blockly.Workspace);

/**
 * A wrapper function called when a resize event occurs.
 * You can pass the result to `unbindEvent_`.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.WorkspaceSvg.prototype.resizeHandlerWrapper_ = null;

/**
 * The render status of an SVG workspace.
 * Returns `false` for headless workspaces and true for instances of
 * `Blockly.WorkspaceSvg`.
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.rendered = true;

/**
 * Whether the workspace is visible.  False if the workspace has been hidden
 * by calling `setVisible(false)`.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.isVisible_ = true;

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
 * Current horizontal scrolling offset in pixel units, relative to the
 * workspace origin.
 *
 * It is useful to think about a view, and a canvas moving beneath that
 * view. As the canvas moves right, this value becomes more positive, and
 * the view is now "seeing" the left side of the canvas. As the canvas moves
 * left, this value becomes more negative, and the view is now "seeing" the
 * right side of the canvas.
 *
 * The confusing thing about this value is that it does not, and must not
 * include the absoluteLeft offset. This is because it is used to calculate
 * the viewLeft value.
 *
 * The viewLeft is relative to the workspace origin (although in pixel
 * units). The workspace origin is the top-left corner of the workspace (at
 * least when it is enabled). It is shifted from the top-left of the blocklyDiv
 * so as not to be beneath the toolbox.
 *
 * When the workspace is enabled the viewLeft and workspace origin are at
 * the same X location. As the canvas slides towards the right beneath the view
 * this value (scrollX) becomes more positive, and the viewLeft becomes more
 * negative relative to the workspace origin (imagine the workspace origin
 * as a dot on the canvas sliding to the right as the canvas moves).
 *
 * So if the scrollX were to include the absoluteLeft this would in a way
 * "unshift" the workspace origin. This means that the viewLeft would be
 * representing the left edge of the blocklyDiv, rather than the left edge
 * of the workspace.
 *
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset in pixel units, relative to the
 * workspace origin.
 *
 * It is useful to think about a view, and a canvas moving beneath that
 * view. As the canvas moves down, this value becomes more positive, and the
 * view is now "seeing" the upper part of the canvas. As the canvas moves
 * up, this value becomes more negative, and the view is "seeing" the lower
 * part of the canvas.
 *
 * This confusing thing about this value is that it does not, and must not
 * include the absoluteTop offset. This is because it is used to calculate
 * the viewTop value.
 *
 * The viewTop is relative to the workspace origin (although in pixel
 * units). The workspace origin is the top-left corner of the workspace (at
 * least when it is enabled). It is shifted from the top-left of the
 * blocklyDiv so as not to be beneath the toolbox.
 *
 * When the workspace is enabled the viewTop and workspace origin are at the
 * same Y location. As the canvas slides towards the bottom this value
 * (scrollY) becomes more positive, and the viewTop becomes more negative
 * relative to the workspace origin (image in the workspace origin as a dot
 * on the canvas sliding downwards as the canvas moves).
 *
 * So if the scrollY were to include the absoluteTop this would in a way
 * "unshift" the workspace origin. This means that the viewTop would be
 * representing the top edge of the blocklyDiv, rather than the top edge of
 * the workspace.
 *
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
 * @type {Blockly.utils.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragDeltaXY_ = null;

/**
 * Current scale.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scale = 1;

// TODO(#4203) Enable viewport events after ui events refactor.
// /**
//  * Cached scale value. Used to detect changes in viewport.
//  * @type {number}
//  * @private
//  */
// Blockly.WorkspaceSvg.prototype.oldScale_ = 1;
//
// /**
//  * Cached viewport top value. Used to detect changes in viewport.
//  * @type {number}
//  * @private
//  */
// Blockly.WorkspaceSvg.prototype.oldTop_ = 0;
//
// /**
//  * Cached viewport left value. Used to detect changes in viewport.
//  * @type {number}
//  * @private
//  */
// Blockly.WorkspaceSvg.prototype.oldLeft_ = 0;

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
 * Fixed flyout providing blocks which may be dragged into this workspace.
 * @type {Blockly.IFlyout}
 * @private
 */
Blockly.WorkspaceSvg.prototype.flyout_ = null;

/**
 * Category-based toolbox providing blocks which may be dragged into this
 * workspace.
 * @type {Blockly.IToolbox}
 * @private
 */
Blockly.WorkspaceSvg.prototype.toolbox_ = null;

/**
 * The current gesture in progress on this workspace, if any.
 * @type {Blockly.TouchGesture}
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
 * The first parent div with 'injectionDiv' in the name, or null if not set.
 * Access this with getInjectionDiv.
 * @type {Element}
 * @private
 */
Blockly.WorkspaceSvg.prototype.injectionDiv_ = null;

/**
 * Last known position of the page scroll.
 * This is used to determine whether we have recalculated screen coordinate
 * stuff since the page scrolled.
 * @type {Blockly.utils.Coordinate}
 * @private
 */
Blockly.WorkspaceSvg.prototype.lastRecordedPageScroll_ = null;

/**
 * Developers may define this function to add custom menu options to the
 * workspace's context menu or edit the workspace-created set of menu options.
 * @param {!Array.<!Object>} options List of menu options to add to.
 * @param {!Event} e The right-click event that triggered the context menu.
 */
Blockly.WorkspaceSvg.prototype.configureContextMenu;

/**
 * In a flyout, the target workspace where blocks should be placed after a drag.
 * Otherwise null.
 * @type {Blockly.WorkspaceSvg}
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
 * Inverted screen CTM is dirty, recalculate it.
 * @type {boolean}
 * @private
 */
Blockly.WorkspaceSvg.prototype.inverseScreenCTMDirty_ = true;

/**
 * Get the marker manager for this workspace.
 * @return {Blockly.MarkerManager} The marker manager.
 */
Blockly.WorkspaceSvg.prototype.getMarkerManager = function() {
  return this.markerManager_;
};

/**
 * Add the cursor svg to this workspaces svg group.
 * @param {SVGElement} cursorSvg The svg root of the cursor to be added to the
 *     workspace svg group.
 * @package
 */
Blockly.WorkspaceSvg.prototype.setCursorSvg = function(cursorSvg) {
  this.markerManager_.setCursorSvg(cursorSvg);
};

/**
 * Add the marker svg to this workspaces svg group.
 * @param {SVGElement} markerSvg The svg root of the marker to be added to the
 *     workspace svg group.
 * @package
 */
Blockly.WorkspaceSvg.prototype.setMarkerSvg = function(markerSvg) {
  this.markerManager_.setMarkerSvg(markerSvg);
};

/**
 * Get the marker with the given id.
 * @param {string} id The id of the marker.
 * @return {Blockly.Marker} The marker with the given id or null if no marker
 *     with the given id exists.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getMarker = function(id) {
  if (this.markerManager_) {
    return this.markerManager_.getMarker(id);
  }
  return null;
};

/**
 * The cursor for this workspace.
 * @return {Blockly.Cursor} The cursor for the workspace.
 */
Blockly.WorkspaceSvg.prototype.getCursor = function() {
  if (this.markerManager_) {
    return this.markerManager_.getCursor();
  }
  return null;
};

/**
 * Get the block renderer attached to this workspace.
 * @return {!Blockly.blockRendering.Renderer} The renderer attached to this workspace.
 */
Blockly.WorkspaceSvg.prototype.getRenderer = function() {
  return this.renderer_;
};

/**
 * Get the theme manager for this workspace.
 * @return {!Blockly.ThemeManager} The theme manager for this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getThemeManager = function() {
  return this.themeManager_;
};

/**
 * Get the workspace theme object.
 * @return {!Blockly.Theme} The workspace theme object.
 */
Blockly.WorkspaceSvg.prototype.getTheme = function() {
  return this.themeManager_.getTheme();
};

/**
 * Set the workspace theme object.
 * If no theme is passed, default to the `Blockly.Themes.Classic` theme.
 * @param {Blockly.Theme} theme The workspace theme object.
 */
Blockly.WorkspaceSvg.prototype.setTheme = function(theme) {
  if (!theme) {
    theme = /** @type {!Blockly.Theme} */ (Blockly.Themes.Classic);
  }
  this.themeManager_.setTheme(theme);
};

/**
 * Refresh all blocks on the workspace after a theme update.
 * @package
 */
Blockly.WorkspaceSvg.prototype.refreshTheme = function() {
  if (this.svgGroup_) {
    this.renderer_.refreshDom(this.svgGroup_, this.getTheme());
  }

  // Update all blocks in workspace that have a style name.
  this.updateBlockStyles_(this.getAllBlocks(false).filter(
      function(block) {
        return block.getStyleName() !== undefined;
      }
  ));

  // Update current toolbox selection.
  this.refreshToolboxSelection();
  if (this.toolbox_) {
    this.toolbox_.refreshTheme();
  }

  // Re-render if workspace is visible
  if (this.isVisible()) {
    this.setVisible(true);
  }

  var event = new Blockly.Events.Ui(null, 'theme', null, null);
  event.workspaceId = this.id;
  Blockly.Events.fire(event);
};

/**
 * Updates all the blocks with new style.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to update the style
 *     on.
 * @private
 */
Blockly.WorkspaceSvg.prototype.updateBlockStyles_ = function(blocks) {
  for (var i = 0, block; (block = blocks[i]); i++) {
    var blockStyleName = block.getStyleName();
    if (blockStyleName) {
      block.setStyle(blockStyleName);
      if (block.mutator) {
        block.mutator.updateBlockStyle();
      }
    }
  }
};

/**
 * Getter for the inverted screen CTM.
 * @return {SVGMatrix} The matrix to use in mouseToSvg
 */
Blockly.WorkspaceSvg.prototype.getInverseScreenCTM = function() {

  // Defer getting the screen CTM until we actually need it, this should
  // avoid forced reflows from any calls to updateInverseScreenCTM.
  if (this.inverseScreenCTMDirty_) {
    var ctm = this.getParentSvg().getScreenCTM();
    if (ctm) {
      this.inverseScreenCTM_ = ctm.inverse();
      this.inverseScreenCTMDirty_ = false;
    }
  }

  return this.inverseScreenCTM_;
};

/**
 * Mark the inverse screen CTM as dirty.
 */
Blockly.WorkspaceSvg.prototype.updateInverseScreenCTM = function() {
  this.inverseScreenCTMDirty_ = true;
};

/**
 * Getter for isVisible
 * @return {boolean} Whether the workspace is visible.
 *     False if the workspace has been hidden by calling `setVisible(false)`.
 */
Blockly.WorkspaceSvg.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * Return the absolute coordinates of the top-left corner of this element,
 * scales that after canvas SVG element, if it's a descendant.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!SVGElement} element SVG element to find the coordinates of.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getSvgXY = function(element) {
  var x = 0;
  var y = 0;
  var scale = 1;
  if (Blockly.utils.dom.containsNode(this.getCanvas(), element) ||
      Blockly.utils.dom.containsNode(this.getBubbleCanvas(), element)) {
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
    element = /** @type {!SVGElement} */ (element.parentNode);
  } while (element && element != this.getParentSvg());
  return new Blockly.utils.Coordinate(x, y);
};

/**
 * Return the position of the workspace origin relative to the injection div
 * origin in pixels.
 * The workspace origin is where a block would render at position (0, 0).
 * It is not the upper left corner of the workspace SVG.
 * @return {!Blockly.utils.Coordinate} Offset in pixels.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getOriginOffsetInPixels = function() {
  return Blockly.utils.getInjectionDivXY_(this.getCanvas());
};

/**
 * Return the injection div that is a parent of this workspace.
 * Walks the DOM the first time it's called, then returns a cached value.
 * Note: We assume this is only called after the workspace has been injected
 * into the DOM.
 * @return {!Element} The first parent div with 'injectionDiv' in the name.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getInjectionDiv = function() {
  // NB: it would be better to pass this in at createDom, but is more likely to
  // break existing uses of Blockly.
  if (!this.injectionDiv_) {
    var element = this.svgGroup_;
    while (element) {
      var classes = element.getAttribute('class') || '';
      if ((' ' + classes + ' ').indexOf(' injectionDiv ') != -1) {
        this.injectionDiv_ = element;
        break;
      }
      element = /** @type {!Element} */ (element.parentNode);
    }
  }
  return /** @type {!Element} */ (this.injectionDiv_);
};

/**
 * Get the svg block canvas for the workspace.
 * @return {SVGElement} The svg group for the workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getBlockCanvas = function() {
  return this.svgBlockCanvas_;
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
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyWorkspace'}, null);

  // Note that a <g> alone does not receive mouse events--it must have a
  // valid target inside it.  If no background class is specified, as in the
  // flyout, the workspace will not receive mouse events.
  if (opt_backgroundClass) {
    /** @type {SVGElement} */
    this.svgBackground_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {'height': '100%', 'width': '100%', 'class': opt_backgroundClass},
        this.svgGroup_);

    if (opt_backgroundClass == 'blocklyMainBackground' && this.grid_) {
      this.svgBackground_.style.fill =
          'url(#' + this.grid_.getPatternId() + ')';
    } else {
      this.themeManager_.subscribe(this.svgBackground_,
          'workspaceBackgroundColour', 'fill');
    }
  }
  /** @type {SVGElement} */
  this.svgBlockCanvas_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyBlockCanvas'}, this.svgGroup_);
  /** @type {SVGElement} */
  this.svgBubbleCanvas_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyBubbleCanvas'}, this.svgGroup_);

  if (!this.isFlyout) {
    Blockly.bindEventWithChecks_(this.svgGroup_, 'mousedown', this,
        this.onMouseDown_, false, true);
    Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this,
        this.onMouseWheel_);
  }

  // Determine if there needs to be a category tree, or a simple list of
  // blocks.  This cannot be changed later, since the UI is very different.
  if (this.options.hasCategories) {
    if (!Blockly.Toolbox) {
      throw Error('Missing require for Blockly.Toolbox');
    }
    var ToolboxClass = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.TOOLBOX, this.options);
    this.toolbox_ = new ToolboxClass(this);
  }
  if (this.grid_) {
    this.grid_.update(this.scale);
  }
  this.recordDeleteAreas();

  this.markerManager_.setCursor(new Blockly.Cursor());
  this.markerManager_.registerMarker(Blockly.navigation.MARKER_NAME,
      new Blockly.Marker());

  this.renderer_.createDom(this.svgGroup_, this.getTheme());
  return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
 */
Blockly.WorkspaceSvg.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  if (this.currentGesture_) {
    this.currentGesture_.cancel();
  }
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
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

  this.renderer_.dispose();

  if (this.markerManager_) {
    this.markerManager_.dispose();
    this.markerManager_ = null;
  }

  Blockly.WorkspaceSvg.superClass_.dispose.call(this);

  // Dispose of theme manager after all blocks and mutators are disposed of.
  if (this.themeManager_) {
    this.themeManager_.unsubscribeWorkspace(this);
    this.themeManager_.unsubscribe(this.svgBackground_);
    if (!this.options.parentWorkspace) {
      this.themeManager_.dispose();
      this.themeManager_ = null;
    }
  }

  this.connectionDBList = null;

  this.toolboxCategoryCallbacks_ = null;
  this.flyoutButtonCallbacks_ = null;

  if (!this.options.parentWorkspace) {
    // Top-most workspace.  Dispose of the div that the
    // SVG is injected into (i.e. injectionDiv).
    var parentSvg = this.getParentSvg();
    if (parentSvg && parentSvg.parentNode) {
      Blockly.utils.dom.removeNode(parentSvg.parentNode);
    }
  }
  if (this.resizeHandlerWrapper_) {
    Blockly.unbindEvent_(this.resizeHandlerWrapper_);
    this.resizeHandlerWrapper_ = null;
  }
};

/**
 * Obtain a newly created block.
 *
 * This block's svg must still be initialized
 * ([initSvg]{@link Blockly.BlockSvg#initSvg}) and it must be rendered
 * ([render]{@link Blockly.BlockSvg#render}) before the block will be visible.
 * @param {!string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @return {!Blockly.BlockSvg} The created block.
 * @override
 */
Blockly.WorkspaceSvg.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.BlockSvg(this, prototypeName, opt_id);
};

/**
 * Add a trashcan.
 * @package
 */
Blockly.WorkspaceSvg.prototype.addTrashcan = function() {
  if (!Blockly.Trashcan) {
    throw Error('Missing require for Blockly.Trashcan');
  }
  /** @type {Blockly.Trashcan} */
  this.trashcan = new Blockly.Trashcan(this);
  var svgTrashcan = this.trashcan.createDom();
  this.svgGroup_.insertBefore(svgTrashcan, this.svgBlockCanvas_);
};

/**
 * Add zoom controls.
 * @package
 */
Blockly.WorkspaceSvg.prototype.addZoomControls = function() {
  if (!Blockly.ZoomControls) {
    throw Error('Missing require for Blockly.ZoomControls');
  }
  /** @type {Blockly.ZoomControls} */
  this.zoomControls_ = new Blockly.ZoomControls(this);
  var svgZoomControls = this.zoomControls_.createDom();
  this.svgGroup_.appendChild(svgZoomControls);
};

/**
 * Add a flyout element in an element with the given tag name.
 * @param {string|
 * !Blockly.utils.Svg<!SVGSVGElement>|
 * !Blockly.utils.Svg<!SVGGElement>} tagName What type of tag the
 *     flyout belongs in.
 * @return {!Element} The element containing the flyout DOM.
 * @package
 */
Blockly.WorkspaceSvg.prototype.addFlyout = function(tagName) {
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': this,
        'rtl': this.RTL,
        'oneBasedIndex': this.options.oneBasedIndex,
        'horizontalLayout': this.horizontalLayout,
        'renderer': this.options.renderer,
        'rendererOverrides': this.options.rendererOverrides
      }));
  workspaceOptions.toolboxPosition = this.options.toolboxPosition;
  if (this.horizontalLayout) {
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    this.flyout_ = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    this.flyout_ = new Blockly.VerticalFlyout(workspaceOptions);
  }
  this.flyout_.autoClose = false;
  this.flyout_.getWorkspace().setVisible(true);

  // Return the element so that callers can place it in their desired
  // spot in the DOM.  For example, mutator flyouts do not go in the same place
  // as main workspace flyouts.
  return this.flyout_.createDom(tagName);
};

/**
 * Getter for the flyout associated with this workspace.  This flyout may be
 * owned by either the toolbox or the workspace, depending on toolbox
 * configuration.  It will be null if there is no flyout.
 * @param {boolean=} opt_own Only return the workspace's own flyout if True.
 * @return {Blockly.IFlyout} The flyout on this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getFlyout = function(opt_own) {
  if (this.flyout_ || opt_own) {
    return this.flyout_;
  }
  if (this.toolbox_) {
    return this.toolbox_.getFlyout();
  }
  return null;
};

/**
 * Getter for the toolbox associated with this workspace, if one exists.
 * @return {Blockly.IToolbox} The toolbox on this workspace.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getToolbox = function() {
  return this.toolbox_;
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
  var currScroll = Blockly.utils.getDocumentScroll();
  if (!Blockly.utils.Coordinate.equals(
      this.lastRecordedPageScroll_, currScroll)) {
    this.lastRecordedPageScroll_ = currScroll;
    this.updateScreenCalculations_();
  }
}; /* eslint-enable indent */

/**
 * Get the SVG element that forms the drawing surface.
 * @return {!SVGGElement} SVG group element.
 */
Blockly.WorkspaceSvg.prototype.getCanvas = function() {
  return /** @type {!SVGGElement} */ (this.svgBlockCanvas_);
};

/**
 * Get the SVG element that forms the bubble surface.
 * @return {!SVGGElement} SVG group element.
 */
Blockly.WorkspaceSvg.prototype.getBubbleCanvas = function() {
  return /** @type {!SVGGElement} */ (this.svgBubbleCanvas_);
};

/**
 * Get the SVG element that contains this workspace.
 * Note: We assume this is only called after the workspace has been injected
 * into the DOM.
 * @return {!SVGElement} SVG element.
 */
Blockly.WorkspaceSvg.prototype.getParentSvg = function() {
  if (!this.cachedParentSvg_) {
    var element = this.svgGroup_;
    while (element) {
      if (element.tagName == 'svg') {
        this.cachedParentSvg_ = element;
        break;
      }
      element = /** @type {!SVGElement} */ (element.parentNode);
    }
  }
  return /** @type {!SVGElement} */ (this.cachedParentSvg_);
};

/**
 * Fires a viewport event if events are enabled and there is a change in
 * viewport values.
 * @package
 */
Blockly.WorkspaceSvg.prototype.maybeFireViewportChangeEvent = function() {
  // TODO(#4203) Enable viewport events after ui events refactor.
  // if (!Blockly.Events.isEnabled()) {
  //   return;
  // }
  // var scale = this.scale;
  // var top = -this.scrollY;
  // var left = -this.scrollX;
  // if (scale == this.oldScale_ && top == this.oldTop_ && left == this.oldLeft_) {
  //   return;
  // }
  // this.oldScale_ = scale;
  // this.oldTop_ = top;
  // this.oldLeft_ = left;
  // var event = new Blockly.Events.Ui(null, 'viewport', null,
  //     { scale: scale, top: top, left: left });
  // event.workspaceId = this.id;
  // Blockly.Events.fire(event);
};

/**
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation, in pixel units relative to the
 *    top left of the Blockly div.
 * @param {number} y Vertical translation, in pixel units relative to the
 *    top left of the Blockly div.
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
  // And update the grid if we're using one.
  if (this.grid_) {
    this.grid_.moveTo(x, y);
  }

  this.maybeFireViewportChangeEvent();
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
  var previousElement =
    /** @type {Element} */ (this.svgBlockCanvas_.previousSibling);
  var width = parseInt(this.getParentSvg().getAttribute('width'), 10);
  var height = parseInt(this.getParentSvg().getAttribute('height'), 10);
  var coord = Blockly.utils.getRelativeXY(this.getCanvas());
  this.workspaceDragSurface_.setContentsAndShow(this.getCanvas(),
      this.getBubbleCanvas(), previousElement, width, height, this.scale);
  this.workspaceDragSurface_.translateSurface(coord.x, coord.y);
};

/**
 * @return {Blockly.BlockDragSurfaceSvg} This workspace's block drag surface,
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
  this.isVisible_ = isVisible;
  if (!this.svgGroup_) {
    return;
  }

  // Tell the scrollbar whether its container is visible so it can
  // tell when to hide itself.
  if (this.scrollbar) {
    this.scrollbar.setContainerVisible(isVisible);
  }

  // Tell the flyout whether its container is visible so it can
  // tell when to hide itself.
  if (this.getFlyout()) {
    this.getFlyout().setContainerVisible(isVisible);
  }

  this.getParentSvg().style.display = isVisible ? 'block' : 'none';
  if (this.toolbox_) {
    // Currently does not support toolboxes in mutators.
    this.toolbox_.setVisible(isVisible);
  }
  if (isVisible) {
    var blocks = this.getAllBlocks(false);
    // Tell each block on the workspace to mark its fields as dirty.
    for (var i = blocks.length - 1; i >= 0; i--) {
      blocks[i].markDirty();
    }

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
  var blocks = this.getAllBlocks(false);
  // Render each block.
  for (var i = blocks.length - 1; i >= 0; i--) {
    blocks[i].render(false);
  }

  if (this.currentGesture_) {
    var imList = this.currentGesture_.getInsertionMarkers();
    for (var i = 0; i < imList.length; i++) {
      imList[i].render(false);
    }
  }

  this.markerManager_.updateMarkers();
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
    for (var i = 0, block; (block = this.highlightedBlocks_[i]); i++) {
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
      Blockly.utils.arrayRemove(this.highlightedBlocks_, block);
    } else if (this.highlightedBlocks_.indexOf(block) == -1) {
      this.highlightedBlocks_.push(block);
    }
    block.setHighlighted(state);
  }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element|!DocumentFragment} xmlBlock XML block element or an empty
 *     DocumentFragment if the block was an insertion marker.
 */
Blockly.WorkspaceSvg.prototype.paste = function(xmlBlock) {
  if (!this.rendered || !xmlBlock.tagName || xmlBlock.getElementsByTagName('block').length >=
      this.remainingCapacity()) {
    return;
  }
  // The check above for tagName rules out the possibility of this being a DocumentFragment.
  xmlBlock = /** @type {!Element} */ (xmlBlock);
  if (this.currentGesture_) {
    this.currentGesture_.cancel();  // Dragging while pasting?  No.
  }
  if (xmlBlock.tagName.toLowerCase() == 'comment') {
    this.pasteWorkspaceComment_(xmlBlock);
  } else {
    this.pasteBlock_(xmlBlock);
  }
};

/**
 * Paste the provided block onto the workspace.
 * @param {!Element} xmlBlock XML block element.
 * @private
 */
Blockly.WorkspaceSvg.prototype.pasteBlock_ = function(xmlBlock) {
  Blockly.Events.disable();
  try {
    var block = Blockly.Xml.domToBlock(xmlBlock, this);

    // Handle paste for keyboard navigation
    var markedNode = this.getMarker(Blockly.navigation.MARKER_NAME).getCurNode();
    if (this.keyboardAccessibilityMode && markedNode &&
        markedNode.isConnection()) {
      var markedLocation =
        /** @type {!Blockly.RenderedConnection} */ (markedNode.getLocation());
      Blockly.navigation.insertBlock(/** @type {!Blockly.BlockSvg} */ (block),
          markedLocation);
      return;
    }

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
        var allBlocks = this.getAllBlocks(false);
        for (var i = 0, otherBlock; (otherBlock = allBlocks[i]); i++) {
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
          for (var i = 0, connection; (connection = connections[i]); i++) {
            var neighbour = connection.closest(Blockly.SNAP_RADIUS,
                new Blockly.utils.Coordinate(blockX, blockY));
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
 * Paste the provided comment onto the workspace.
 * @param {!Element} xmlComment XML workspace comment element.
 * @private
 * @suppress {checkTypes} Suppress checks while workspace comments are not
 *     bundled in.
 */
Blockly.WorkspaceSvg.prototype.pasteWorkspaceComment_ = function(xmlComment) {
  Blockly.Events.disable();
  try {
    var comment = Blockly.WorkspaceCommentSvg.fromXml(xmlComment, this);
    // Move the duplicate to original position.
    var commentX = parseInt(xmlComment.getAttribute('x'), 10);
    var commentY = parseInt(xmlComment.getAttribute('y'), 10);
    if (!isNaN(commentX) && !isNaN(commentY)) {
      if (this.RTL) {
        commentX = -commentX;
      }
      // Offset workspace comment.
      // TODO (#1719): Properly offset comment such that it's not interfering
      // with any blocks.
      commentX += 50;
      commentY += 50;
      comment.moveBy(commentX, commentY);
    }
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    // TODO: Fire a Workspace Comment Create event.
  }
  comment.select();
};

/**
 * Refresh the toolbox unless there's a drag in progress.
 * @package
 */
Blockly.WorkspaceSvg.prototype.refreshToolboxSelection = function() {
  var ws = this.isFlyout ? this.targetWorkspace : this;
  if (ws && !ws.currentGesture_ && ws.toolbox_ && ws.toolbox_.getFlyout()) {
    ws.toolbox_.refreshSelection();
  }
};

/**
 * Rename a variable by updating its name in the variable map.  Update the
 *     flyout to show the renamed variable immediately.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.WorkspaceSvg.prototype.renameVariableById = function(id, newName) {
  Blockly.WorkspaceSvg.superClass_.renameVariableById.call(this, id, newName);
  this.refreshToolboxSelection();
};

/**
 * Delete a variable by the passed in ID.   Update the flyout to show
 *     immediately that the variable is deleted.
 * @param {string} id ID of variable to delete.
 */
Blockly.WorkspaceSvg.prototype.deleteVariableById = function(id) {
  Blockly.WorkspaceSvg.superClass_.deleteVariableById.call(this, id);
  this.refreshToolboxSelection();
};

/**
 * Create a new variable with the given name.  Update the flyout to show the
 *     new variable immediately.
 * @param {string} name The new variable's name.
 * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {?string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {!Blockly.VariableModel} The newly created variable.
 */
Blockly.WorkspaceSvg.prototype.createVariable = function(name,
    opt_type, opt_id) {
  var newVar = Blockly.WorkspaceSvg.superClass_.createVariable.call(
      this, name, opt_type, opt_id);
  this.refreshToolboxSelection();
  return newVar;
};

/**
 * Make a list of all the delete areas for this workspace.
 */
Blockly.WorkspaceSvg.prototype.recordDeleteAreas = function() {
  if (this.trashcan && this.svgGroup_.parentNode) {
    this.deleteAreaTrash_ = this.trashcan.getClientRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getClientRect();
  } else if (this.toolbox_ && typeof this.toolbox_.getClientRect == 'function') {
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
  if (this.deleteAreaTrash_ &&
      this.deleteAreaTrash_.contains(e.clientX, e.clientY)) {
    return Blockly.DELETE_AREA_TRASH;
  }
  if (this.deleteAreaToolbox_ &&
      this.deleteAreaToolbox_.contains(e.clientX, e.clientY)) {
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
 * @param {!Blockly.utils.Coordinate} xy Starting location of object.
 */
Blockly.WorkspaceSvg.prototype.startDrag = function(e, xy) {
  // Record the starting offset between the bubble's location and the mouse.
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaXY_ = Blockly.utils.Coordinate.difference(xy, point);
};

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!Blockly.utils.Coordinate} New location of object.
 */
Blockly.WorkspaceSvg.prototype.moveDrag = function(e) {
  var point = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
      this.getInverseScreenCTM());
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  return Blockly.utils.Coordinate.sum(
      /** @type {!Blockly.utils.Coordinate} */ (this.dragDeltaXY_), point);
};

/**
 * Is the user currently dragging a block or scrolling the flyout/workspace?
 * @return {boolean} True if currently dragging or scrolling.
 */
Blockly.WorkspaceSvg.prototype.isDragging = function() {
  return this.currentGesture_ != null && this.currentGesture_.isDragging();
};

/**
 * Is this workspace draggable?
 * @return {boolean} True if this workspace may be dragged.
 */
Blockly.WorkspaceSvg.prototype.isDraggable = function() {
  return this.options.moveOptions && this.options.moveOptions.drag;
};

/**
 * Should the workspace have bounded content? Used to tell if the
 * workspace's content should be sized so that it can move (bounded) or not
 * (exact sizing).
 * @return {boolean} True if the workspace should be bounded, false otherwise.
 * @package
 */
Blockly.WorkspaceSvg.prototype.isContentBounded = function() {
  return (this.options.moveOptions && this.options.moveOptions.scrollbars) ||
      (this.options.moveOptions && this.options.moveOptions.wheel) ||
      (this.options.moveOptions && this.options.moveOptions.drag) ||
      (this.options.zoomOptions && this.options.zoomOptions.controls) ||
      (this.options.zoomOptions && this.options.zoomOptions.wheel) ||
      (this.options.zoomOptions && this.options.zoomOptions.pinch);
};

/**
 * Is this workspace movable?
 *
 * This means the user can reposition the X Y coordinates of the workspace
 * through input. This can be through scrollbars, scroll wheel, dragging, or
 * through zooming with the scroll wheel or pinch (since the zoom is centered on
 * the mouse position). This does not include zooming with the zoom controls
 * since the X Y coordinates are decided programmatically.
 * @return {boolean} True if the workspace is movable, false otherwise.
 */
Blockly.WorkspaceSvg.prototype.isMovable = function() {
  return (this.options.moveOptions && this.options.moveOptions.scrollbars) ||
      (this.options.moveOptions && this.options.moveOptions.wheel) ||
      (this.options.moveOptions && this.options.moveOptions.drag) ||
      (this.options.zoomOptions && this.options.zoomOptions.wheel) ||
      (this.options.zoomOptions && this.options.zoomOptions.pinch);
};

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * @param {!Event} e Mouse wheel event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseWheel_ = function(e) {
  // Don't scroll or zoom anything if drag is in progress.
  if (Blockly.Gesture.inProgress()) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  var canWheelZoom = this.options.zoomOptions && this.options.zoomOptions.wheel;
  var canWheelMove = this.options.moveOptions && this.options.moveOptions.wheel;
  if (!canWheelZoom && !canWheelMove) {
    return;
  }

  var scrollDelta = Blockly.utils.getScrollDeltaPixels(e);
  if (canWheelZoom && (e.ctrlKey || !canWheelMove)) {
    // Zoom.
    // The vertical scroll distance that corresponds to a click of a zoom
    // button.
    var PIXELS_PER_ZOOM_STEP = 50;
    var delta = -scrollDelta.y / PIXELS_PER_ZOOM_STEP;
    var position = Blockly.utils.mouseToSvg(e, this.getParentSvg(),
        this.getInverseScreenCTM());
    this.zoom(position.x, position.y, delta);
  } else {
    // Scroll.
    var x = this.scrollX - scrollDelta.x;
    var y = this.scrollY - scrollDelta.y;

    if (e.shiftKey && !scrollDelta.x) {
      // Scroll horizontally (based on vertical scroll delta).
      // This is needed as for some browser/system combinations which do not
      // set deltaX.
      x = this.scrollX - scrollDelta.y;
      y = this.scrollY; // Don't scroll vertically
    }
    this.scroll(x, y);
  }
  e.preventDefault();
};

/**
 * Calculate the bounding box for the blocks on the workspace.
 * Coordinate system: workspace coordinates.
 *
 * @return {!Blockly.utils.Rect} Contains the position and size of the
 *   bounding box containing the blocks on the workspace.
 */
Blockly.WorkspaceSvg.prototype.getBlocksBoundingBox = function() {
  var topElements = this.getTopBoundedElements();
  // There are no blocks, return empty rectangle.
  if (!topElements.length) {
    return new Blockly.utils.Rect(0, 0, 0, 0);
  }

  // Initialize boundary using the first block.
  var boundary = topElements[0].getBoundingRectangle();

  // Start at 1 since the 0th block was used for initialization.
  for (var i = 1; i < topElements.length; i++) {
    var blockBoundary = topElements[i].getBoundingRectangle();
    if (blockBoundary.top < boundary.top) {
      boundary.top = blockBoundary.top;
    }
    if (blockBoundary.bottom > boundary.bottom) {
      boundary.bottom = blockBoundary.bottom;
    }
    if (blockBoundary.left < boundary.left) {
      boundary.left = blockBoundary.left;
    }
    if (blockBoundary.right > boundary.right) {
      boundary.right = blockBoundary.right;
    }
  }
  return boundary;
};

/**
 * Clean up the workspace by ordering all the blocks in a column.
 */
Blockly.WorkspaceSvg.prototype.cleanUp = function() {
  this.setResizesEnabled(false);
  Blockly.Events.setGroup(true);
  var topBlocks = this.getTopBlocks(true);
  var cursorY = 0;
  for (var i = 0, block; (block = topBlocks[i]); i++) {
    if (!block.isMovable()) {
      continue;
    }
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(-xy.x, cursorY - xy.y);
    block.snapToGrid();
    cursorY = block.getRelativeToSurfaceXY().y +
        block.getHeightWidth().height +
        this.renderer_.getConstants().MIN_BLOCK_HEIGHT;
  }
  Blockly.Events.setGroup(false);
  this.setResizesEnabled(true);
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @package
 */
Blockly.WorkspaceSvg.prototype.showContextMenu = function(e) {
  if (this.options.readOnly || this.isFlyout) {
    return;
  }
  var menuOptions = Blockly.ContextMenuRegistry.registry.getContextMenuOptions(
      Blockly.ContextMenuRegistry.ScopeType.WORKSPACE, {workspace: this});

  // Allow the developer to add or modify menuOptions.
  if (this.configureContextMenu) {
    this.configureContextMenu(menuOptions, e);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {?Blockly.utils.toolbox.ToolboxDefinition} toolboxDef
 *    DOM tree of toolbox contents, string of toolbox contents, or JSON
 *    representing toolbox definition.
 */
Blockly.WorkspaceSvg.prototype.updateToolbox = function(toolboxDef) {
  var parsedToolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(toolboxDef);

  if (!parsedToolboxDef) {
    if (this.options.languageTree) {
      throw Error('Can\'t nullify an existing toolbox.');
    }
    return;  // No change (null to null).
  }
  if (!this.options.languageTree) {
    throw Error('Existing toolbox is null.  Can\'t create new toolbox.');
  }

  if (Blockly.utils.toolbox.hasCategories(parsedToolboxDef)) {
    if (!this.toolbox_) {
      throw Error('Existing toolbox has no categories.  Can\'t change mode.');
    }
    this.options.languageTree = parsedToolboxDef;
    this.toolbox_.render(parsedToolboxDef);
  } else {
    if (!this.flyout_) {
      throw Error('Existing toolbox has categories.  Can\'t change mode.');
    }
    this.options.languageTree = parsedToolboxDef;
    this.flyout_.show(parsedToolboxDef);
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
    // the browser will not do it for us.  How to do this is browser dependent.
    this.setBrowserFocus();
  }
};

/**
 * Set the workspace to have focus in the browser.
 * @private
 */
Blockly.WorkspaceSvg.prototype.setBrowserFocus = function() {
  // Blur whatever was focused since explicitly grabbing focus below does not
  // work in Edge.
  if (document.activeElement) {
    document.activeElement.blur();
  }
  try {
    // Focus the workspace SVG - this is for Chrome and Firefox.
    this.getParentSvg().focus({preventScroll:true});
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
      this.getParentSvg().parentNode.focus({preventScroll:true});
    }
  }
};

/**
 * Zooms the workspace in or out relative to/centered on the given (x, y)
 * coordinate.
 * @param {number} x X coordinate of center, in pixel units relative to the
 *     top-left corner of the parentSVG.
 * @param {number} y Y coordinate of center, in pixel units relative to the
 *     top-left corner of the parentSVG.
 * @param {number} amount Amount of zooming. The formula for the new scale
 *     is newScale = currentScale * (scaleSpeed^amount). scaleSpeed is set in
 *     the workspace options. Negative amount values zoom out, and positive
 *     amount values zoom in.
 */
Blockly.WorkspaceSvg.prototype.zoom = function(x, y, amount) {
  // Scale factor.
  var speed = this.options.zoomOptions.scaleSpeed;
  var scaleChange = Math.pow(speed, amount);
  var newScale = this.scale * scaleChange;
  if (this.scale == newScale) {
    return;  // No change in zoom.
  }

  // Clamp scale within valid range.
  if (newScale > this.options.zoomOptions.maxScale) {
    scaleChange = this.options.zoomOptions.maxScale / this.scale;
  } else if (newScale < this.options.zoomOptions.minScale) {
    scaleChange = this.options.zoomOptions.minScale / this.scale;
  }

  // Transform the x/y coordinates from the parentSVG's space into the
  // canvas' space, so that they are in workspace units relative to the top
  // left of the visible portion of the workspace.
  var matrix = this.getCanvas().getCTM();
  var center = this.getParentSvg().createSVGPoint();
  center.x = x;
  center.y = y;
  center = center.matrixTransform(matrix.inverse());
  x = center.x;
  y = center.y;

  // Find the new scrollX/scrollY so that the center remains in the same
  // position (relative to the center) after we zoom.
  // newScale and matrix.a should be identical (within a rounding error).
  matrix = matrix.translate(x * (1 - scaleChange), y * (1 - scaleChange))
      .scale(scaleChange);
  // scrollX and scrollY are in pixels.
  // The scrollX and scrollY still need to have absoluteLeft and absoluteTop
  // subtracted from them, but we'll leave that for setScale so that they're
  // correctly updated for the new flyout size if we have a simple toolbox.
  this.scrollX = matrix.e;
  this.scrollY = matrix.f;
  this.setScale(newScale);
};

/**
 * Zooming the blocks centered in the center of view with zooming in or out.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
Blockly.WorkspaceSvg.prototype.zoomCenter = function(type) {
  var metrics = this.getMetrics();
  if (this.flyout_) {
    // If you want blocks in the center of the view (visible portion of the
    // workspace) to stay centered when the size of the view decreases (i.e.
    // when the size of the flyout increases) you need the center of the
    // *blockly div* to stay in the same pixel-position.
    // Note: This only works because of how scrollCenter positions blocks.
    var x = metrics.svgWidth ? metrics.svgWidth / 2 : 0;
    var y = metrics.svgHeight ? metrics.svgHeight / 2 : 0;
  } else {
    var x = (metrics.viewWidth / 2) + metrics.absoluteLeft;
    var y = (metrics.viewHeight / 2) + metrics.absoluteTop;
  }
  this.zoom(x, y, type);
};

/**
 * Zoom the blocks to fit in the workspace if possible.
 */
Blockly.WorkspaceSvg.prototype.zoomToFit = function() {
  if (!this.isMovable()) {
    console.warn('Tried to move a non-movable workspace. This could result' +
        ' in blocks becoming inaccessible.');
    return;
  }

  var metrics = this.getMetrics();
  var workspaceWidth = metrics.viewWidth;
  var workspaceHeight = metrics.viewHeight;
  var blocksBox = this.getBlocksBoundingBox();
  var blocksWidth = blocksBox.right - blocksBox.left;
  var blocksHeight = blocksBox.bottom - blocksBox.top;
  if (!blocksWidth) {
    return;  // Prevents zooming to infinity.
  }
  if (this.flyout_) {
    // We have to add the flyout size to both the workspace size and the
    // block size because the blocks we want to resize include the blocks in
    // the flyout, and the area we want to fit them includes the portion of
    // the workspace that is behind the flyout.
    if (this.horizontalLayout) {
      workspaceHeight += this.flyout_.getHeight();
      // Convert from pixels to workspace coordinates.
      blocksHeight += this.flyout_.getHeight() / this.scale;
    } else {
      workspaceWidth += this.flyout_.getWidth();
      // Convert from pixels to workspace coordinates.
      blocksWidth += this.flyout_.getWidth() / this.scale;
    }
  }

  // Scale Units: (pixels / workspaceUnit)
  var ratioX = workspaceWidth / blocksWidth;
  var ratioY = workspaceHeight / blocksHeight;
  Blockly.Events.disable();
  try {
    this.setScale(Math.min(ratioX, ratioY));
    this.scrollCenter();
  } finally {
    Blockly.Events.enable();
  }
  this.maybeFireViewportChangeEvent();
};

/**
 * Add a transition class to the block and bubble canvas, to animate any
 * transform changes.
 * @package
 */
Blockly.WorkspaceSvg.prototype.beginCanvasTransition = function() {
  Blockly.utils.dom.addClass(
      /** @type {!SVGElement} */ (this.svgBlockCanvas_),
      'blocklyCanvasTransitioning');
  Blockly.utils.dom.addClass(
      /** @type {!SVGElement} */ (this.svgBubbleCanvas_),
      'blocklyCanvasTransitioning');
};

/**
 * Remove transition class from the block and bubble canvas.
 * @package
 */
Blockly.WorkspaceSvg.prototype.endCanvasTransition = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!SVGElement} */ (this.svgBlockCanvas_),
      'blocklyCanvasTransitioning');
  Blockly.utils.dom.removeClass(
      /** @type {!SVGElement} */ (this.svgBubbleCanvas_),
      'blocklyCanvasTransitioning');
};

/**
 * Center the workspace.
 */
Blockly.WorkspaceSvg.prototype.scrollCenter = function() {
  if (!this.isMovable()) {
    console.warn('Tried to move a non-movable workspace. This could result' +
        ' in blocks becoming inaccessible.');
    return;
  }

  var metrics = this.getMetrics();
  var x = (metrics.contentWidth - metrics.viewWidth) / 2;
  var y = (metrics.contentHeight - metrics.viewHeight) / 2;

  // Convert from workspace directions to canvas directions.
  x = -x - metrics.contentLeft;
  y = -y - metrics.contentTop;
  this.scroll(x, y);
};

/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
Blockly.WorkspaceSvg.prototype.centerOnBlock = function(id) {
  if (!this.isMovable()) {
    console.warn('Tried to move a non-movable workspace. This could result' +
        ' in blocks becoming inaccessible.');
    return;
  }

  var block = id ? this.getBlockById(id) : null;
  if (!block) {
    return;
  }

  // XY is in workspace coordinates.
  var xy = block.getRelativeToSurfaceXY();
  // Height/width is in workspace units.
  var heightWidth = block.getHeightWidth();

  // Find the enter of the block in workspace units.
  var blockCenterY = xy.y + heightWidth.height / 2;

  // In RTL the block's position is the top right of the block, not top left.
  var multiplier = this.RTL ? -1 : 1;
  var blockCenterX = xy.x + (multiplier * heightWidth.width / 2);

  // Workspace scale, used to convert from workspace coordinates to pixels.
  var scale = this.scale;

  // Center of block in pixels, relative to workspace origin (center 0,0).
  // Scrolling to here would put the block in the top-left corner of the
  // visible workspace.
  var pixelX = blockCenterX * scale;
  var pixelY = blockCenterY * scale;

  var metrics = this.getMetrics();

  // viewHeight and viewWidth are in pixels.
  var halfViewWidth = metrics.viewWidth / 2;
  var halfViewHeight = metrics.viewHeight / 2;

  // Put the block in the center of the visible workspace instead.
  var scrollToCenterX = pixelX - halfViewWidth;
  var scrollToCenterY = pixelY - halfViewHeight;

  // Convert from workspace directions to canvas directions.
  var x = -scrollToCenterX;
  var y = -scrollToCenterY;

  this.scroll(x, y);
};

/**
 * Set the workspace's zoom factor.
 * @param {number} newScale Zoom factor. Units: (pixels / workspaceUnit).
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

  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
    this.recordDeleteAreas();
  }
  if (this.grid_) {
    this.grid_.update(this.scale);
  }

  // We call scroll instead of scrollbar.resize() so that we can center the
  // zoom correctly without scrollbars, but scroll does not resize the
  // scrollbars so we have to call resizeView/resizeContent as well.
  var metrics = this.getMetrics();
  // The scroll values and the view values are additive inverses of
  // each other, so when we subtract from one we have to add to the other.
  this.scrollX -= metrics.absoluteLeft;
  this.scrollY -= metrics.absoluteTop;
  metrics.viewLeft += metrics.absoluteLeft;
  metrics.viewTop += metrics.absoluteTop;

  this.scroll(this.scrollX, this.scrollY);
  if (this.scrollbar) {
    if (this.flyout_) {
      this.scrollbar.hScroll.resizeViewHorizontal(metrics);
      this.scrollbar.vScroll.resizeViewVertical(metrics);
    } else {
      this.scrollbar.hScroll.resizeContentHorizontal(metrics);
      this.scrollbar.vScroll.resizeContentVertical(metrics);
    }
  }
};


/**
 * Get the workspace's zoom factor.  If the workspace has a parent, we call into
 * the parent to get the workspace scale.
 * @return {number} The workspace zoom factor. Units: (pixels / workspaceUnit).
 */
Blockly.WorkspaceSvg.prototype.getScale = function() {
  if (this.options.parentWorkspace) {
    return this.options.parentWorkspace.getScale();
  }
  return this.scale;
};

/**
 * Scroll the workspace to a specified offset (in pixels), keeping in the
 * workspace bounds. See comment on workspaceSvg.scrollX for more detail on
 * the meaning of these values.
 * @param {number} x Target X to scroll to.
 * @param {number} y Target Y to scroll to.
 * @package
 */
Blockly.WorkspaceSvg.prototype.scroll = function(x, y) {
  Blockly.hideChaff(/* opt_allowToolbox */ true);

  // Keep scrolling within the bounds of the content.
  var metrics = this.getMetrics();
  // This is the offset of the top-left corner of the view from the
  // workspace origin when the view is "seeing" the bottom-right corner of
  // the content.
  var maxOffsetOfViewFromOriginX = metrics.contentWidth + metrics.contentLeft -
      metrics.viewWidth;
  var maxOffsetOfViewFromOriginY = metrics.contentHeight + metrics.contentTop -
      metrics.viewHeight;
  // Canvas coordinates (aka scroll coordinates) have inverse directionality
  // to workspace coordinates so we have to inverse them.
  x = Math.min(x, -metrics.contentLeft);
  y = Math.min(y, -metrics.contentTop);
  x = Math.max(x, -maxOffsetOfViewFromOriginX);
  y = Math.max(y, -maxOffsetOfViewFromOriginY);

  this.scrollX = x;
  this.scrollY = y;
  if (this.scrollbar) {
    // The content position (displacement from the content's top-left to the
    // origin) plus the scroll position (displacement from the view's top-left
    // to the origin) gives us the distance from the view's top-left to the
    // content's top-left. Then we negate this so we get the displacement from
    // the content's top-left to the view's top-left, matching the
    // directionality of the scrollbars.

    this.scrollbar.hScroll.setHandlePosition(-(x + metrics.contentLeft) *
        this.scrollbar.hScroll.ratio);
    this.scrollbar.vScroll.setHandlePosition(-(y + metrics.contentTop) *
        this.scrollbar.vScroll.ratio);
  }
  // We have to shift the translation so that when the canvas is at 0, 0 the
  // workspace origin is not underneath the toolbox.
  x += metrics.absoluteLeft;
  y += metrics.absoluteTop;
  this.translate(x, y);
};

/**
 * Get the dimensions of the given workspace component, in pixels.
 * @param {Blockly.IToolbox|Blockly.IFlyout} elem The element to get the
 *     dimensions of, or null.  It should be a toolbox or flyout, and should
 *     implement getWidth() and getHeight().
 * @return {!Blockly.utils.Size} An object containing width and height
 *     attributes, which will both be zero if elem did not exist.
 * @private
 */
Blockly.WorkspaceSvg.getDimensionsPx_ = function(elem) {
  var width = 0;
  var height = 0;
  if (elem) {
    width = elem.getWidth();
    height = elem.getHeight();
  }
  return new Blockly.utils.Size(width, height);
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
  if (ws.isContentBounded()) {
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
  var top = blockBox.top * scale;
  var bottom = blockBox.bottom * scale;
  var left = blockBox.left * scale;
  var right = blockBox.right * scale;

  return {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: right - left,
    height: bottom - top
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

  // Add a border around the content that is at least half a screen wide.
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
 * Coordinate system: pixel coordinates, -left, -up, +right, +down
 * .viewHeight: Height of the visible portion of the workspace.
 * .viewWidth: Width of the visible portion of the workspace.
 * .contentHeight: Height of the content.
 * .contentWidth: Width of the content.
 * .svgHeight: Height of the Blockly div (the view + the toolbox,
 *    simple or otherwise),
 * .svgWidth: Width of the Blockly div (the view + the toolbox,
 *    simple or otherwise),
 * .viewTop: Top-edge of the visible portion of the workspace, relative to
 *     the workspace origin.
 * .viewLeft: Left-edge of the visible portion of the workspace, relative to
 *     the workspace origin.
 * .contentTop: Top-edge of the content, relative to the workspace origin.
 * .contentLeft: Left-edge of the content relative to the workspace origin.
 * .absoluteTop: Top-edge of the visible portion of the workspace, relative
 *     to the blocklyDiv.
 * .absoluteLeft: Left-edge of the visible portion of the workspace, relative
 *     to the blocklyDiv.
 * .toolboxWidth: Width of the toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of the toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of the flyout if it is always open.  Otherwise zero.
 * .toolboxPosition: Top, bottom, left or right. Use TOOLBOX_AT constants to
 *     compare.
 * @return {!Blockly.utils.Metrics} Contains size and position metrics of a top
 *     level workspace.
 * @private
 * @this {Blockly.WorkspaceSvg}
 */
Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function() {

  var toolboxDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
  var flyoutDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.flyout_);

  // Contains height and width in CSS pixels.
  // svgSize is equivalent to the size of the injectionDiv at this point.
  var svgSize = Blockly.svgSize(this.getParentSvg());
  var viewSize = {height: svgSize.height, width: svgSize.width};
  if (this.toolbox_) {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      viewSize.height -= toolboxDimensions.height;
    } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      viewSize.width -= toolboxDimensions.width;
    }
  } else if (this.flyout_) {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
      this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      viewSize.height -= flyoutDimensions.height;
    } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
      this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      viewSize.width -= flyoutDimensions.width;
    }
  }

  // svgSize is now the space taken up by the Blockly workspace, not including
  // the toolbox.
  var contentDimensions =
      Blockly.WorkspaceSvg.getContentDimensions_(this, viewSize);

  var absoluteLeft = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = toolboxDimensions.width;
  } else if (this.flyout_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = flyoutDimensions.width;
  }
  var absoluteTop = 0;
  if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = toolboxDimensions.height;
  } else if (this.flyout_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = flyoutDimensions.height;
  }

  var metrics = {
    contentHeight: contentDimensions.height,
    contentWidth: contentDimensions.width,
    contentTop: contentDimensions.top,
    contentLeft: contentDimensions.left,

    viewHeight: viewSize.height,
    viewWidth: viewSize.width,
    viewTop: -this.scrollY,
    viewLeft: -this.scrollX,

    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft,

    svgHeight: svgSize.height,
    svgWidth: svgSize.width,

    toolboxWidth: toolboxDimensions.width,
    toolboxHeight: toolboxDimensions.height,
    toolboxPosition: this.toolboxPosition,

    flyoutWidth: flyoutDimensions.width,
    flyoutHeight: flyoutDimensions.height
  };
  return metrics;
};

/**
 * Sets the X/Y translations of a top level workspace.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this {Blockly.WorkspaceSvg}
 */
Blockly.WorkspaceSvg.setTopLevelWorkspaceMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics();
  if (typeof xyRatio.x == 'number') {
    this.scrollX = -metrics.contentWidth * xyRatio.x - metrics.contentLeft;
  }
  if (typeof xyRatio.y == 'number') {
    this.scrollY = -metrics.contentHeight * xyRatio.y - metrics.contentTop;
  }
  // We have to shift the translation so that when the canvas is at 0, 0 the
  // workspace origin is not underneath the toolbox.
  var x = this.scrollX + metrics.absoluteLeft;
  var y = this.scrollY + metrics.absoluteTop;
  // We could call scroll here, but that has extra checks we don't need to do.
  this.translate(x, y);
};

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.BlockSvg} The sought after block, or null if not found.
 * @override
 */
Blockly.WorkspaceSvg.prototype.getBlockById = function(id) {
  return /** @type {Blockly.BlockSvg} */ (
    Blockly.WorkspaceSvg.superClass_.getBlockById.call(this, id));
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.BlockSvg>} The top-level block objects.
 * @override
 */
Blockly.WorkspaceSvg.prototype.getTopBlocks = function(ordered) {
  return Blockly.WorkspaceSvg.superClass_.getTopBlocks.call(this, ordered);
};

/**
 * Adds a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add.
 */
Blockly.WorkspaceSvg.prototype.addTopBlock = function(block) {
  this.addTopBoundedElement(/** @type {!Blockly.BlockSvg} */ (block));
  Blockly.WorkspaceSvg.superClass_.addTopBlock.call(this, block);
};

/**
 * Removes a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.WorkspaceSvg.prototype.removeTopBlock = function(block) {
  this.removeTopBoundedElement(/** @type {!Blockly.BlockSvg} */ (block));
  Blockly.WorkspaceSvg.superClass_.removeTopBlock.call(this, block);
};

/**
 * Adds a comment to the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to add.
 */
Blockly.WorkspaceSvg.prototype.addTopComment = function(comment) {
  this.addTopBoundedElement(
      /** @type {!Blockly.WorkspaceCommentSvg} */ (comment));
  Blockly.WorkspaceSvg.superClass_.addTopComment.call(this, comment);
};

/**
 * Removes a comment from the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to remove.
 */
Blockly.WorkspaceSvg.prototype.removeTopComment = function(comment) {
  this.removeTopBoundedElement(
      /** @type {!Blockly.WorkspaceCommentSvg} */ (comment));
  Blockly.WorkspaceSvg.superClass_.removeTopComment.call(this, comment);
};

/**
 * Adds a bounded element to the list of top bounded elements.
 * @param {!Blockly.IBoundedElement} element Bounded element to add.
 */
Blockly.WorkspaceSvg.prototype.addTopBoundedElement = function(element) {
  this.topBoundedElements_.push(element);
};

/**
 * Removes a bounded element from the list of top bounded elements.
 * @param {!Blockly.IBoundedElement} element Bounded element to remove.
 */
Blockly.WorkspaceSvg.prototype.removeTopBoundedElement = function(element) {
  Blockly.utils.arrayRemove(this.topBoundedElements_, element);
};

/**
 * Finds the top-level bounded elements and returns them.
 * @return {!Array.<!Blockly.IBoundedElement>} The top-level bounded elements.
 */
Blockly.WorkspaceSvg.prototype.getTopBoundedElements = function() {
  return [].concat(this.topBoundedElements_);
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
  this.topBoundedElements_ = [];
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
  if (typeof func != 'function') {
    throw TypeError('Button callbacks must be functions.');
  }
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
  if (typeof func != 'function') {
    throw TypeError('Toolbox category callbacks must be functions.');
  }
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
  return this.toolboxCategoryCallbacks_[key] || null;
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
 * @return {Blockly.TouchGesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 * @package
 */
Blockly.WorkspaceSvg.prototype.getGesture = function(e) {
  var isStart = (e.type == 'mousedown' || e.type == 'touchstart' ||
      e.type == 'pointerdown');

  var gesture = this.currentGesture_;
  if (gesture) {
    if (isStart && gesture.hasStarted()) {
      console.warn('Tried to start the same gesture twice.');
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
    this.currentGesture_ = new Blockly.TouchGesture(e, this);
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
 * @return {!Blockly.WorkspaceAudio} The audio manager for this workspace.
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
