/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Top level object for Blockly.
goog.provide('Blockly');

// Blockly core dependencies.
goog.require('Blockly.BlockSvg');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
// Date picker commented out since it increases footprint by 60%.
// Add it only if you need it.
//goog.require('Blockly.FieldDate');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Generator');
goog.require('Blockly.Msg');
goog.require('Blockly.Procedures');
goog.require('Blockly.Realtime');
goog.require('Blockly.Toolbox');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.inject');
goog.require('Blockly.utils');

// Closure dependencies.
goog.require('goog.color');


/**
 * Required name space for SVG elements.
 * @const
 */
Blockly.SVG_NS = 'http://www.w3.org/2000/svg';
/**
 * Required name space for HTML elements.
 * @const
 */
Blockly.HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_SATURATION = 0.45;
/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_VALUE = 0.65;

/**
 * Sprited icons and images.
 */
Blockly.SPRITE = {
  width: 64,
  height: 92,
  url: 'sprites.png'
};

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
Blockly.makeColour = function(hue) {
  return goog.color.hsvToHex(hue, Blockly.HSV_SATURATION,
      Blockly.HSV_VALUE * 255);
};

/**
 * ENUM for a right-facing value input.  E.g. 'set item to' or 'return'.
 * @const
 */
Blockly.INPUT_VALUE = 1;
/**
 * ENUM for a left-facing value output.  E.g. 'random fraction'.
 * @const
 */
Blockly.OUTPUT_VALUE = 2;
/**
 * ENUM for a down-facing block stack.  E.g. 'if-do' or 'else'.
 * @const
 */
Blockly.NEXT_STATEMENT = 3;
/**
 * ENUM for an up-facing block stack.  E.g. 'break out of loop'.
 * @const
 */
Blockly.PREVIOUS_STATEMENT = 4;
/**
 * ENUM for an dummy input.  Used to add field(s) with no input.
 * @const
 */
Blockly.DUMMY_INPUT = 5;

/**
 * ENUM for left alignment.
 * @const
 */
Blockly.ALIGN_LEFT = -1;
/**
 * ENUM for centre alignment.
 * @const
 */
Blockly.ALIGN_CENTRE = 0;
/**
 * ENUM for right alignment.
 * @const
 */
Blockly.ALIGN_RIGHT = 1;

/**
 * Lookup table for determining the opposite type of a connection.
 * @const
 */
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;

/**
 * Currently selected block.
 * @type {Blockly.Block}
 */
Blockly.selected = null;

/**
 * Currently highlighted connection (during a drag).
 * @type {Blockly.Connection}
 * @private
 */
Blockly.highlightedConnection_ = null;

/**
 * Connection on dragged block that matches the highlighted connection.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.localConnection_ = null;

/**
 * Number of pixels the mouse must move before a drag starts.
 */
Blockly.DRAG_RADIUS = 5;

/**
 * Maximum misalignment between connections for them to snap together.
 */
Blockly.SNAP_RADIUS = 20;

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 */
Blockly.BUMP_DELAY = 250;

/**
 * Number of characters to truncate a collapsed block to.
 */
Blockly.COLLAPSE_CHARS = 30;

/**
 * Length in ms for a touch to become a long press.
 */
Blockly.LONGPRESS = 750;

/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboardXml_ = null;

/**
 * Source of the local clipboard.
 * @type {Blockly.Workspace}
 * @private
 */
Blockly.clipboardSource_ = null;

/**
 * Is the mouse dragging a block?
 * 0 - No drag operation.
 * 1 - Still inside the sticky DRAG_RADIUS.
 * 2 - Freely draggable.
 * @private
 */
Blockly.dragMode_ = 0;

/**
 * Wrapper function called when a touch mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.onTouchUpWrapper_ = null;

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!Element} svg SVG image.
 * @return {!Object} Contains width and height properties.
 */
Blockly.svgSize = function(svg) {
  return {width: svg.cachedWidth_,
          height: svg.cachedHeight_};
};

/**
 * Size the SVG image to completely fill its container.
 * Record the height/width of the SVG image.
 * @param {!Blockly.WorkspaceSvg} workspace Any workspace in the SVG.
 */
Blockly.svgResize = function(workspace) {
  var mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  var svg = mainWorkspace.options.svg;
  var div = svg.parentNode;
  if (!div) {
    // Workspace deteted, or something.
    return;
  }
  var width = div.offsetWidth;
  var height = div.offsetHeight;
  if (svg.cachedWidth_ != width) {
    svg.setAttribute('width', width + 'px');
    svg.cachedWidth_ = width;
  }
  if (svg.cachedHeight_ != height) {
    svg.setAttribute('height', height + 'px');
    svg.cachedHeight_ = height;
  }
  mainWorkspace.resize();
};

/**
 * Handle a mouse-up anywhere on the page.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function(e) {
  var workspace = Blockly.getMainWorkspace();
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  workspace.isScrolling = false;

  // Unbind the touch event if it exists.
  if (Blockly.onTouchUpWrapper_) {
    Blockly.unbindEvent_(Blockly.onTouchUpWrapper_);
    Blockly.onTouchUpWrapper_ = null;
  }
  if (Blockly.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.onMouseMoveWrapper_);
    Blockly.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.onMouseMove_ = function(e) {
  var workspace = Blockly.getMainWorkspace();
  if (workspace.isScrolling) {
    Blockly.removeAllRanges();
    var dx = e.clientX - workspace.startDragMouseX;
    var dy = e.clientY - workspace.startDragMouseY;
    var metrics = workspace.startDragMetrics;
    var x = workspace.startScrollX + dx;
    var y = workspace.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
                 metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop -
                 metrics.contentHeight);

    // Move the scrollbars and the page will scroll automatically.
    workspace.scrollbar.set(-x - metrics.contentLeft,
                                        -y - metrics.contentTop);
    // Cancel the long-press if the drag has moved too far.
    var dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (dr > Blockly.DRAG_RADIUS) {
      Blockly.longStop_();
    }
    e.stopPropagation();
  }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    try {
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        Blockly.hideChaff();
        Blockly.selected.dispose(true, true);
      }
    } finally {
      // Stop the browser from going back to the previous page.
      // Use a finally so that any error in delete code above doesn't disappear
      // from the console when the page rolls back.
      e.preventDefault();
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    if (Blockly.selected &&
        Blockly.selected.isDeletable() && Blockly.selected.isMovable()) {
      Blockly.hideChaff();
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.copy_(Blockly.selected);
      } else if (e.keyCode == 88) {
        // 'x' for cut.
        Blockly.copy_(Blockly.selected);
        Blockly.selected.dispose(true, true);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.clipboardSource_.paste(Blockly.clipboardXml_);
      }
    }
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.terminateDrag_ = function() {
  Blockly.BlockSvg.terminateDrag_();
  Blockly.Flyout.terminateDrag_();
};

/**
 * PID of queued long-press task.
 * @private
 */
Blockly.longPid_ = 0;

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only suported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 * @param {!Event} e Touch start event.
 * @param {Blockly.Block} block The block under the touchstart event, or null
 *   if the event was on the workspace.
 * @private
 */
Blockly.longStart_ = function(e, block) {
  Blockly.longStop_();
  Blockly.longPid_ = setTimeout(function() {
      e.button = 2;  // Simulate a right button click.
      if (block) {
        block.onMouseDown_(e);
      } else {
        Blockly.onMouseDown_(e);
      }
    }, Blockly.LONGPRESS);
};

/**
 * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
 * or a drag hath begun.  Kill the queued long-press task.
 * @private
 */
Blockly.longStop_ = function() {
  if (Blockly.longPid_) {
    clearTimeout(Blockly.longPid_);
    Blockly.longPid_ = 0;
  }
};

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom_(block);
  Blockly.Xml.deleteNext(xmlBlock);
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', block.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboardXml_ = xmlBlock;
  Blockly.clipboardSource_ = block.workspace;
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function(e) {
  if (!Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if (!opt_allowToolbox) {
    var workspace = Blockly.getMainWorkspace();
    if (workspace.toolbox_ &&
        workspace.toolbox_.flyout_ &&
        workspace.toolbox_.flyout_.autoClose) {
      workspace.toolbox_.clearSelection();
    }
  }
};

/**
 * Deselect any selections on the webpage.
 * Chrome will select text outside the SVG when double-clicking.
 * Deselect this text, so that it doesn't mess up any subsequent drag.
 */
Blockly.removeAllRanges = function() {
  if (getSelection()) {
    setTimeout(function() {
        try {
          var selection = getSelection();
          if (!selection.isCollapsed) {
            selection.removeAllRanges();
          }
        } catch (e) {
          // MSIE throws 'error 800a025e' here.
        }
      }, 0);
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main workspace.  The following properties are computed:
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
 * @return {Object} Contains size and position metrics of main workspace.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.getMainWorkspaceMetrics_ = function() {
  var svgSize = Blockly.svgSize(this.options.svg);
  if (this.toolbox_) {
    svgSize.width -= this.toolbox_.width;
  }
  var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
  try {
    var blockBox = this.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (this.scrollbar) {
    // Add a border around the content that is at least half a screenful wide.
    // Ensure border is wide enough that blocks can scroll over entire screen.
    var MARGIN = 5;
    var leftScroll = this.RTL ?
        Blockly.Scrollbar.scrollbarThickness : 0;
    var rightScroll = this.RTL ?
        0 : Blockly.Scrollbar.scrollbarThickness;
    var leftEdge = Math.min(blockBox.x - viewWidth / 2,
        blockBox.x + blockBox.width - viewWidth - leftScroll + MARGIN);
    var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
        blockBox.x + viewWidth + rightScroll - MARGIN);
    var topEdge = Math.min(blockBox.y - viewHeight / 2,
        blockBox.y + blockBox.height - viewHeight + MARGIN);
    var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
        blockBox.y + viewHeight + Blockly.Scrollbar.scrollbarThickness -
        MARGIN);
  } else {
    var leftEdge = blockBox.x;
    var rightEdge = leftEdge + blockBox.width;
    var topEdge = blockBox.y;
    var bottomEdge = topEdge + blockBox.height;
  }
  var absoluteLeft = 0;
  if (!this.RTL && this.toolbox_) {
    absoluteLeft = this.toolbox_.width;
  }
  var metrics = {
    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -this.scrollY,
    viewLeft: -this.scrollX,
    contentTop: topEdge,
    contentLeft: leftEdge,
    absoluteTop: 0,
    absoluteLeft: absoluteLeft
  };
  return metrics;
};

/**
 * Sets the X/Y translations of the main workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.setMainWorkspaceMetrics_ = function(xyRatio) {
  if (!this.scrollbar) {
    throw 'Attempt to set main workspace scroll without scrollbars.';
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
  if (this.options.gridPattern) {
    this.options.gridPattern.setAttribute('x', x);
    this.options.gridPattern.setAttribute('y', y);
  }
};

/**
 * Execute a command.  Generally, a command is the result of a user action
 * e.g., a click, drag or context menu selection.  Calling the cmdThunk function
 * through doCommand() allows us to capture information that can be used for
 * capabilities like undo (which is supported by the realtime collaboration
 * feature).
 * @param {function()} cmdThunk A function representing the command execution.
 */
Blockly.doCommand = function(cmdThunk) {
  if (Blockly.Realtime.isEnabled) {
    Blockly.Realtime.doCommand(cmdThunk);
  } else {
    cmdThunk();
  }
};

/**
 * When something in Blockly's workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 * @deprecated April 2015
 */
Blockly.addChangeListener = function(func) {
  // Backwards compatability from before there could be multiple workspaces.
  console.warn('Deprecated call to Blockly.addChangeListener, ' +
               'use workspace.addChangeListener instead.');
  return Blockly.getMainWorkspace().addChangeListener(func);
};

/**
 * Returns the main workspace.  Returns the last used main workspace (based on
 * focus).
 * @return {!Blockly.Workspace} The main workspace.
 */
Blockly.getMainWorkspace = function() {
  return Blockly.mainWorkspace;
};

// Export symbols that would otherwise be renamed by Closure compiler.
if (!goog.global['Blockly']) {
  goog.global['Blockly'] = {};
}
goog.global['Blockly']['getMainWorkspace'] = Blockly.getMainWorkspace;
goog.global['Blockly']['addChangeListener'] = Blockly.addChangeListener;
goog.global['Blockly']['removeChangeListener'] = Blockly.removeChangeListener;
