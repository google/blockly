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
// goog.require('Blockly.Block');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Trashcan');
goog.require('Blockly.ZoomControls');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for a workspace.  This is an onscreen area with optional trashcan,
 * scrollbars, bubbles, and dragging.
 * @param {!Object} options Dictionary of options.
 * @extends {Blockly.Workspace}
 * @constructor
 */
Blockly.WorkspaceSvg = function(options) {
  Blockly.WorkspaceSvg.superClass_.constructor.call(this, options);
  this.getMetrics = options.getMetrics;
  this.setMetrics = options.setMetrics;

  Blockly.ConnectionDB.init(this);

  /**
   * Database of pre-loaded sounds.
   * @private
   * @const
   */
  this.SOUNDS_ = Object.create(null);

  /**
   * Opaque data that can be passed to Blockly.unbindEvent_.
   * @type {Array.<!Array>}
   * @private
   */
  this.eventWrappers_ = [];
};
goog.inherits(Blockly.WorkspaceSvg, Blockly.Workspace);

/**
 * Svg workspaces are user-visible (as opposed to a headless workspace).
 * @type {boolean} True if visible.  False if headless.
 */
Blockly.WorkspaceSvg.prototype.rendered = true;

/**
 * Is this workspace the surface for a flyout?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.isFlyout = false;

/**
 * Is this workspace currently being dragged around?
 * @type {boolean}
 */
Blockly.WorkspaceSvg.prototype.isScrolling = false;

/**
 * Current horizontal scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollX = 0;

/**
 * Current vertical scrolling offset.
 * @type {number}
 */
Blockly.WorkspaceSvg.prototype.scrollY = 0;

/**
 * Horizontal distance from mouse to object being dragged.
 * @type {number}
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragDeltaX_ = 0;

/**
 * Vertical distance from mouse to object being dragged.
 * @type {number}
 * @private
 */
Blockly.WorkspaceSvg.prototype.dragDeltaY_ = 0;

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
 * Create the trash can elements.
 * @param {string=} opt_backgroundClass Either 'blocklyMainBackground' or
 *     'blocklyMutatorBackground'.
 * @return {!Element} The workspace's SVG group.
 */
Blockly.WorkspaceSvg.prototype.createDom = function(opt_backgroundClass) {
  /*
  <g class="blocklyWorkspace">
    <rect class="blocklyMainBackground" height="100%" width="100%"></rect>
    [Trashcan and/or flyout may go here]
    <g class="blocklyBlockCanvas"></g>
    <g class="blocklyBubbleCanvas"></g>
    [Scrollbars may go here]
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g',
    {'class': 'blocklyWorkspace'}, null);
  if (opt_backgroundClass) {
    this.svgBackground_ = Blockly.createSvgElement('rect',
        {'height': '100%', 'width': '100%',
         'class': opt_backgroundClass}, this.svgGroup_);
    if (opt_backgroundClass == 'blocklyMainBackground') {
      this.svgBackground_.style.fill =
          'url(#' + this.options.gridPattern.id + ')';
    }
  }
  this.svgBlockCanvas_ = Blockly.createSvgElement('g',
      {'class': 'blocklyBlockCanvas'}, this.svgGroup_, this);
  this.svgBubbleCanvas_ = Blockly.createSvgElement('g',
      {'class': 'blocklyBubbleCanvas'}, this.svgGroup_, this);
  var bottom = Blockly.Scrollbar.scrollbarThickness;
  if (this.options.hasTrashcan) {
    bottom = this.addTrashcan_(bottom);
  }
  if (this.options.zoomOptions && this.options.zoomOptions.controls) {
    bottom = this.addZoomControls_(bottom);
  }
  Blockly.bindEvent_(this.svgGroup_, 'mousedown', this, this.onMouseDown_);
  var thisWorkspace = this;
  Blockly.bindEvent_(this.svgGroup_, 'touchstart', null,
                     function(e) {Blockly.longStart_(e, thisWorkspace);});
  if (this.options.zoomOptions && this.options.zoomOptions.wheel) {
    // Mouse-wheel.
    Blockly.bindEvent_(this.svgGroup_, 'wheel', this, this.onMouseWheel_);
  }

  // Determine if there needs to be a category tree, or a simple list of
  // blocks.  This cannot be changed later, since the UI is very different.
  if (this.options.hasCategories) {
    this.toolbox_ = new Blockly.Toolbox(this);
  } else if (this.options.languageTree) {
    this.addFlyout_();
  }
  this.updateGridPattern_();
  return this.svgGroup_;
};

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.WorkspaceSvg.prototype.dispose = function() {
  // Stop rerendering.
  this.rendered = false;
  Blockly.unbindEvent_(this.eventWrappers_);
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
  if (!this.options.parentWorkspace) {
    // Top-most workspace.  Dispose of the SVG too.
    goog.dom.removeNode(this.options.svg);
  }
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
 * Add a flyout.
 * @private
 */
Blockly.WorkspaceSvg.prototype.addFlyout_ = function() {
  var workspaceOptions = {
    parentWorkspace: this,
    RTL: this.RTL
  };
  /** @type {Blockly.Flyout} */
  this.flyout_ = new Blockly.Flyout(workspaceOptions);
  this.flyout_.autoClose = false;
  var svgFlyout = this.flyout_.createDom();
  this.svgGroup_.insertBefore(svgFlyout, this.svgBlockCanvas_);
};

/**
 * Resize this workspace and its containing objects.
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
};

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
 * Translate this workspace to new coordinates.
 * @param {number} x Horizontal translation.
 * @param {number} y Vertical translation.
 */
Blockly.WorkspaceSvg.prototype.translate = function(x, y) {
  var translation = 'translate(' + x + ',' + y + ')' +
      'scale(' + this.scale + ')';
  this.svgBlockCanvas_.setAttribute('transform', translation);
  this.svgBubbleCanvas_.setAttribute('transform', translation);
};

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.WorkspaceSvg.prototype.addTopBlock = function(block) {
  Blockly.WorkspaceSvg.superClass_.addTopBlock.call(this, block);
  if (Blockly.Realtime.isEnabled() && !this.options.parentWorkspace) {
    Blockly.Realtime.addTopBlock(block);
  }
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.WorkspaceSvg.prototype.removeTopBlock = function(block) {
  Blockly.WorkspaceSvg.superClass_.removeTopBlock.call(this, block);
  if (Blockly.Realtime.isEnabled() && !this.options.parentWorkspace) {
    Blockly.Realtime.removeTopBlock(block);
  }
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * @return {number} Width.
 */
Blockly.WorkspaceSvg.prototype.getWidth = function() {
  return this.getMetrics().viewWidth;
};

/**
 * Toggles the visibility of the workspace.
 * Currently only intended for main workspace.
 * @param {boolean} isVisible True if workspace should be visible.
 */
Blockly.WorkspaceSvg.prototype.setVisible = function(isVisible) {
  this.options.svg.style.display = isVisible ? 'block' : 'none';
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
  var renderList = this.getAllBlocks();
  for (var i = 0, block; block = renderList[i]; i++) {
    if (!block.getChildren().length) {
      block.render();
    }
  }
};

/**
 * Turn the visual trace functionality on or off.
 * @param {boolean} armed True if the trace should be on.
 */
Blockly.WorkspaceSvg.prototype.traceOn = function(armed) {
  this.traceOn_ = armed;
  if (this.traceWrapper_) {
    Blockly.unbindEvent_(this.traceWrapper_);
    this.traceWrapper_ = null;
  }
  if (armed) {
    this.traceWrapper_ = Blockly.bindEvent_(this.svgBlockCanvas_,
        'blocklySelectChange', this, function() {this.traceOn_ = false});
  }
};

/**
 * Highlight a block in the workspace.
 * @param {?string} id ID of block to find.
 */
Blockly.WorkspaceSvg.prototype.highlightBlock = function(id) {
  if (this.traceOn_ && Blockly.dragMode_ != 0) {
    // The blocklySelectChange event normally prevents this, but sometimes
    // there is a race condition on fast-executing apps.
    this.traceOn(false);
  }
  if (!this.traceOn_) {
    return;
  }
  var block = null;
  if (id) {
    block = this.getBlockById(id);
    if (!block) {
      return;
    }
  }
  // Temporary turn off the listener for selection changes, so that we don't
  // trip the monitor for detecting user activity.
  this.traceOn(false);
  // Select the current block.
  if (block) {
    block.select();
  } else if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  // Restore the monitor for user activity after the selection event has fired.
  var thisWorkspace = this;
  setTimeout(function() {thisWorkspace.traceOn(true);}, 1);
};

/**
 * Fire a change event for this workspace.  Changes include new block, dropdown
 * edits, mutations, connections, etc.  Groups of simultaneous changes (e.g.
 * a tree of blocks being deleted) are merged into one event.
 * Applications may hook workspace changes by listening for
 * 'blocklyWorkspaceChange' on workspace.getCanvas().
 */
Blockly.WorkspaceSvg.prototype.fireChangeEvent = function() {
  if (this.rendered && this.svgBlockCanvas_) {
    Blockly.fireUiEvent(this.svgBlockCanvas_, 'blocklyWorkspaceChange');
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
  Blockly.terminateDrag_();  // Dragging while pasting?  No.
  var block = Blockly.Xml.domToBlock(this, xmlBlock);
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
          var neighbour =
              connection.closest(Blockly.SNAP_RADIUS, blockX, blockY);
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
  block.select();
};

/**
 * Make a list of all the delete areas for this workspace.
 */
Blockly.WorkspaceSvg.prototype.recordDeleteAreas = function() {
  if (this.trashcan) {
    this.deleteAreaTrash_ = this.trashcan.getRect();
  } else {
    this.deleteAreaTrash_ = null;
  }
  if (this.flyout_) {
    this.deleteAreaToolbox_ = this.flyout_.getRect();
  } else if (this.toolbox_) {
    this.deleteAreaToolbox_ = this.toolbox_.getRect();
  } else {
    this.deleteAreaToolbox_ = null;
  }
};

/**
 * Is the mouse event over a delete area (toolbar or non-closing flyout)?
 * Opens or closes the trashcan and sets the cursor as a side effect.
 * @param {!Event} e Mouse move event.
 * @return {boolean} True if event is in a delete area.
 */
Blockly.WorkspaceSvg.prototype.isDeleteArea = function(e) {
  var isDelete = false;
  var mouseXY = Blockly.mouseToSvg(e, Blockly.mainWorkspace.options.svg);
  var xy = new goog.math.Coordinate(mouseXY.x, mouseXY.y);
  if (this.deleteAreaTrash_) {
    if (this.deleteAreaTrash_.contains(xy)) {
      this.trashcan.setOpen_(true);
      Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
    this.trashcan.setOpen_(false);
  }
  if (this.deleteAreaToolbox_) {
    if (this.deleteAreaToolbox_.contains(xy)) {
      Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
      return true;
    }
  }
  Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
  return false;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseDown_ = function(e) {
  this.markFocused();
  if (Blockly.isTargetInput_(e)) {
    return;
  }
  Blockly.svgResize(this);
  Blockly.terminateDrag_();  // In case mouse-up event was lost.
  Blockly.hideChaff();
  var isTargetWorkspace = e.target && e.target.nodeName &&
      (e.target.nodeName.toLowerCase() == 'svg' ||
       e.target == this.svgBackground_);
  if (isTargetWorkspace && Blockly.selected && !this.options.readOnly) {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (Blockly.isRightButton(e)) {
    // Right-click.
    this.showContextMenu_(e);
  } else if (this.scrollbar) {
    Blockly.removeAllRanges();
    // If the workspace is editable, only allow scrolling when gripping empty
    // space.  Otherwise, allow scrolling when gripping anywhere.
    this.isScrolling = true;
    // Record the current mouse position.
    this.startDragMouseX = e.clientX;
    this.startDragMouseY = e.clientY;
    this.startDragMetrics = this.getMetrics();
    this.startScrollX = this.scrollX;
    this.startScrollY = this.scrollY;

    // If this is a touch event then bind to the mouseup so workspace drag mode
    // is turned off and double move events are not performed on a block.
    // See comment in inject.js Blockly.init_ as to why mouseup events are
    // bound to the document instead of the SVG's surface.
    if ('mouseup' in Blockly.bindEvent_.TOUCH_MAP) {
      Blockly.onTouchUpWrapper_ =
          Blockly.bindEvent_(document, 'mouseup', null, Blockly.onMouseUp_);
    }
    Blockly.onMouseMoveWrapper_ =
        Blockly.bindEvent_(document, 'mousemove', null, Blockly.onMouseMove_);
  }
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Start tracking a drag of an object on this workspace.
 * @param {!Event} e Mouse down event.
 * @param {number} x Starting horizontal location of object.
 * @param {number} y Starting vertical location of object.
 */
Blockly.WorkspaceSvg.prototype.startDrag = function(e, x, y) {
  // Record the starting offset between the bubble's location and the mouse.
  var point = Blockly.mouseToSvg(e, this.options.svg);
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  this.dragDeltaX_ = x - point.x;
  this.dragDeltaY_ = y - point.y;
};

/**
 * Track a drag of an object on this workspace.
 * @param {!Event} e Mouse move event.
 * @return {!goog.math.Coordinate} New location of object.
 */
Blockly.WorkspaceSvg.prototype.moveDrag = function(e) {
  var point = Blockly.mouseToSvg(e, this.options.svg);
  // Fix scale of mouse event.
  point.x /= this.scale;
  point.y /= this.scale;
  var x = this.dragDeltaX_ + point.x;
  var y = this.dragDeltaY_ + point.y;
  return new goog.math.Coordinate(x, y);
};

/**
 * Handle a mouse-wheel on SVG drawing surface.
 * @param {!Event} e Mouse wheel event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.onMouseWheel_ = function(e) {
  // TODO: Remove terminateDrag and compensate for coordinate skew during zoom.
  Blockly.terminateDrag_();
  var delta = e.deltaY > 0 ? -1 : 1;
  var position = Blockly.mouseToSvg(e, this.options.svg);
  this.zoom(position.x, position.y, delta);
  e.preventDefault();
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
  if (this.options.readOnly) {
    return;
  }
  var menuOptions = [];
  // Add a little animation to collapsing and expanding.
  var COLLAPSE_DELAY = 10;

  if (this.options.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    var topBlocks = this.getTopBlocks(true);
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

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      var ms = 0;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          setTimeout(block.setCollapsed.bind(block, true), ms);
          block = block.getNextBlock();
          ms += COLLAPSE_DELAY;
        }
      }
    };
    menuOptions.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      var ms = 0;
      for (var i = 0; i < topBlocks.length; i++) {
        var block = topBlocks[i];
        while (block) {
          setTimeout(block.setCollapsed.bind(block, false), ms);
          block = block.getNextBlock();
          ms += COLLAPSE_DELAY;
        }
      }
    };
    menuOptions.push(expandOption);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.WorkspaceSvg.prototype.loadAudio_ = function(filenames, name) {
  if (!filenames.length) {
    return;
  }
  try {
    var audioTest = new window['Audio']();
  } catch(e) {
    // No browser support for Audio.
    // IE can throw an error even if the Audio object exists.
    return;
  }
  var sound;
  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var ext = filename.match(/\.(\w+)$/);
    if (ext && audioTest.canPlayType('audio/' + ext[1])) {
      // Found an audio format we can play.
      sound = new window['Audio'](filename);
      break;
    }
  }
  if (sound && sound.play) {
    this.SOUNDS_[name] = sound;
  }
};

/**
 * Preload all the audio files so that they play quickly when asked for.
 * @private
 */
Blockly.WorkspaceSvg.prototype.preloadAudio_ = function() {
  for (var name in this.SOUNDS_) {
    var sound = this.SOUNDS_[name];
    sound.volume = .01;
    sound.play();
    sound.pause();
    // iOS can only process one sound at a time.  Trying to load more than one
    // corrupts the earlier ones.  Just load one and leave the others uncached.
    if (goog.userAgent.IPAD || goog.userAgent.IPHONE) {
      break;
    }
  }
};

/**
 * Play an audio file at specified value.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param {number=} opt_volume Volume of sound (0-1).
 */
Blockly.WorkspaceSvg.prototype.playAudio = function(name, opt_volume) {
  var sound = this.SOUNDS_[name];
  if (sound) {
    var mySound;
    var ie9 = goog.userAgent.DOCUMENT_MODE &&
              goog.userAgent.DOCUMENT_MODE === 9;
    if (ie9 || goog.userAgent.IPAD || goog.userAgent.ANDROID) {
      // Creating a new audio node causes lag in IE9, Android and iPad. Android
      // and IE9 refetch the file from the server, iPad uses a singleton audio
      // node which must be deleted and recreated for each new audio tag.
      mySound = sound;
    } else {
      mySound = sound.cloneNode();
    }
    mySound.volume = (opt_volume === undefined ? 1 : opt_volume);
    mySound.play();
  } else if (this.options.parentWorkspace) {
    // Maybe a workspace on a lower level knows about this sound.
    this.options.parentWorkspace.playAudio(name, opt_volume);
  }
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.WorkspaceSvg.prototype.updateToolbox = function(tree) {
  tree = Blockly.parseToolboxTree_(tree);
  if (!tree) {
    if (this.options.languageTree) {
      throw 'Can\'t nullify an existing toolbox.';
    }
    // No change (null to null).
    return;
  }
  if (!this.options.languageTree) {
    throw 'Existing toolbox is null.  Can\'t create new toolbox.';
  }
  if (this.options.hasCategories) {
    if (!this.toolbox_) {
      throw 'Existing toolbox has no categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.toolbox_.populate_(tree);
  } else {
    if (!this.flyout_) {
      throw 'Existing toolbox has categories.  Can\'t change mode.';
    }
    this.options.languageTree = tree;
    this.flyout_.show(tree.childNodes);
  }
};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 */
Blockly.WorkspaceSvg.prototype.addChangeListener = function(func) {
  var wrapper = Blockly.bindEvent_(this.getCanvas(),
                            'blocklyWorkspaceChange', null, func);
  Array.prototype.push.apply(this.eventWrappers_, wrapper);
  return wrapper;
};

/**
 * Stop listening for this workspace's changes.
 * @param {!Array.<!Array>} bindData Opaque data from addChangeListener.
 */
Blockly.WorkspaceSvg.prototype.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData);
  var i = this.eventWrappers_.indexOf(bindData);
  if (i != -1) {
    this.eventWrappers_.splice(i, 1);
  }
};

/**
 * Mark this workspace as the currently focused main workspace.
 */
Blockly.WorkspaceSvg.prototype.markFocused = function() {
  Blockly.mainWorkspace = this;
};

/**
 * Zooming the blocks centered in (x, y) coordinate with zooming in or out.
 * @param {number} x X coordinate of center.
 * @param {number} y Y coordinate of center.
 * @param {number} type Type of zooming (-1 zooming out and 1 zooming in).
 */
Blockly.WorkspaceSvg.prototype.zoom = function(x, y, type) {
  var speed = this.options.zoomOptions.scaleSpeed;
  var metrics = this.getMetrics();
  var center = this.options.svg.createSVGPoint();
  center.x = x;
  center.y = y;
  center = center.matrixTransform(this.getCanvas().getCTM().inverse());
  x = center.x;
  y = center.y;
  var canvas = this.getCanvas();
  // Scale factor.
  var scaleChange = (type == 1) ? speed : 1 / speed;
  // Clamp scale within valid range.
  var newScale = this.scale * scaleChange;
  if (newScale > this.options.zoomOptions.maxScale) {
    scaleChange = this.options.zoomOptions.maxScale / this.scale;
  } else if (newScale < this.options.zoomOptions.minScale) {
    scaleChange = this.options.zoomOptions.minScale / this.scale;
  }
  var matrix = canvas.getCTM()
      .translate(x * (1 - scaleChange), y * (1 - scaleChange))
      .scale(scaleChange);
  // newScale and matrix.a should be identical (within a rounding error).
  if (this.scale == matrix.a) {
    return;  // No change in zoom.
  }
  this.scale = matrix.a;
  this.scrollX = matrix.e - metrics.absoluteLeft;
  this.scrollY = matrix.f - metrics.absoluteTop;
  this.updateGridPattern_();
  this.scrollbar.resize();
  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
  }
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
 * Reset zooming and dragging.
 */
Blockly.WorkspaceSvg.prototype.zoomReset = function() {
  this.scale = 1;
  this.updateGridPattern_();
  var metrics = this.getMetrics();
  this.scrollbar.set((metrics.contentWidth - metrics.viewWidth) / 2,
                     (metrics.contentHeight - metrics.viewHeight) / 2);
  Blockly.hideChaff(false);
  if (this.flyout_) {
    // No toolbox, resize flyout.
    this.flyout_.reflow();
  }
};

/**
 * Updates the grid pattern.
 * @private
 */
Blockly.WorkspaceSvg.prototype.updateGridPattern_ = function() {
  if (!this.options.gridPattern) {
    return;  // No grid.
  }
  // MSIE freaks if it sees a 0x0 pattern, so set empty patterns to 100x100.
  var safeSpacing = (this.options.gridOptions['spacing'] * this.scale) || 100;
  this.options.gridPattern.setAttribute('width', safeSpacing);
  this.options.gridPattern.setAttribute('height', safeSpacing);
  var half = Math.floor(this.options.gridOptions['spacing'] / 2) + 0.5;
  var start = half - this.options.gridOptions['length'] / 2;
  var end = half + this.options.gridOptions['length'] / 2;
  var line1 = this.options.gridPattern.firstChild;
  var line2 = line1 && line1.nextSibling;
  half *= this.scale;
  start *= this.scale;
  end *= this.scale;
  if (line1) {
    line1.setAttribute('stroke-width', this.scale);
    line1.setAttribute('x1', start);
    line1.setAttribute('y1', half);
    line1.setAttribute('x2', end);
    line1.setAttribute('y2', half);
  }
  if (line2) {
    line2.setAttribute('stroke-width', this.scale);
    line2.setAttribute('x1', half);
    line2.setAttribute('y1', start);
    line2.setAttribute('x2', half);
    line2.setAttribute('y2', end);
  }
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.WorkspaceSvg.prototype['setVisible'] =
    Blockly.WorkspaceSvg.prototype.setVisible;
Blockly.WorkspaceSvg.prototype['addChangeListener'] =
    Blockly.WorkspaceSvg.prototype.addChangeListener;
Blockly.WorkspaceSvg.prototype['removeChangeListener'] =
    Blockly.WorkspaceSvg.prototype.removeChangeListener;
