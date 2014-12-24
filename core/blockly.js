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
goog.require('Blockly.Connection');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
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
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.ui.ColorPicker');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.userAgent');


/**
 * Path to Blockly's media directory.  Can be relative, absolute, or remote.
 * Used for loading sounds and sprites.  Defaults to demo server.
 */
Blockly.pathToMedia = 'https://blockly-demo.appspot.com/static/media/';

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
 * ENUM for a right-facing value input.  E.g. 'test' or 'return'.
 * @const
 */
Blockly.INPUT_VALUE = 1;
/**
 * ENUM for a left-facing value output.  E.g. 'call random'.
 * @const
 */
Blockly.OUTPUT_VALUE = 2;
/**
 * ENUM for a down-facing block stack.  E.g. 'then-do' or 'else-do'.
 * @const
 */
Blockly.NEXT_STATEMENT = 3;
/**
 * ENUM for an up-facing block stack.  E.g. 'close screen'.
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
 * Database of pre-loaded sounds.
 * @private
 * @const
 */
Blockly.SOUNDS_ = Object.create(null);

/**
 * Currently selected block.
 * @type {Blockly.Block}
 */
Blockly.selected = null;

/**
 * Is Blockly in a read-only, non-editable mode?
 * Note that this property may only be set before init is called.
 * It can't be used to dynamically toggle editability on and off.
 */
Blockly.readOnly = false;

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
 * The main workspace (defined by inject.js).
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboard_ = null;

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
 * Returns the dimensions of the current SVG image.
 * @return {!Object} Contains width and height properties.
 */
Blockly.svgSize = function() {
  return {width: Blockly.svg.cachedWidth_,
          height: Blockly.svg.cachedHeight_};
};

/**
 * Size the SVG image to completely fill its container.
 * Record the height/width of the SVG image.
 */
Blockly.svgResize = function() {
  var svg = Blockly.svg;
  var div = svg.parentNode;
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
  // Update the scrollbars (if they exist).
  if (Blockly.mainWorkspace.scrollbar) {
    Blockly.mainWorkspace.scrollbar.resize();
  }
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onMouseDown_ = function(e) {
  Blockly.svgResize();
  Blockly.terminateDrag_();  // In case mouse-up event was lost.
  Blockly.hideChaff();
  var isTargetSvg = e.target && e.target.nodeName &&
      e.target.nodeName.toLowerCase() == 'svg';
  if (!Blockly.readOnly && Blockly.selected && isTargetSvg) {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (e.target == Blockly.svg && Blockly.isRightButton(e)) {
    // Right-click.
    Blockly.showContextMenu_(e);
  } else if ((Blockly.readOnly || isTargetSvg) &&
             Blockly.mainWorkspace.scrollbar) {
    // If the workspace is editable, only allow dragging when gripping empty
    // space.  Otherwise, allow dragging when gripping anywhere.
    Blockly.mainWorkspace.dragMode = true;
    // Record the current mouse position.
    Blockly.mainWorkspace.startDragMouseX = e.clientX;
    Blockly.mainWorkspace.startDragMouseY = e.clientY;
    Blockly.mainWorkspace.startDragMetrics =
        Blockly.mainWorkspace.getMetrics();
    Blockly.mainWorkspace.startScrollX = Blockly.mainWorkspace.scrollX;
    Blockly.mainWorkspace.startScrollY = Blockly.mainWorkspace.scrollY;

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
};

/**
 * Handle a mouse-up anywhere on the page.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function(e) {
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  Blockly.mainWorkspace.dragMode = false;

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
  if (Blockly.mainWorkspace.dragMode) {
    Blockly.removeAllRanges();
    var dx = e.clientX - Blockly.mainWorkspace.startDragMouseX;
    var dy = e.clientY - Blockly.mainWorkspace.startDragMouseY;
    var metrics = Blockly.mainWorkspace.startDragMetrics;
    var x = Blockly.mainWorkspace.startScrollX + dx;
    var y = Blockly.mainWorkspace.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
                 metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop -
                 metrics.contentHeight);

    // Move the scrollbars and the page will scroll automatically.
    Blockly.mainWorkspace.scrollbar.set(-x - metrics.contentLeft,
                                        -y - metrics.contentTop);
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
  // TODO: Add keyboard support for cursoring around the context menu.
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
        Blockly.selected.isDeletable() && Blockly.selected.isMovable() &&
        Blockly.selected.workspace == Blockly.mainWorkspace) {
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
      if (Blockly.clipboard_) {
        Blockly.mainWorkspace.paste(Blockly.clipboard_);
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
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom_(block);
  Blockly.Xml.deleteNext(xmlBlock);
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', Blockly.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboard_ = xmlBlock;
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.showContextMenu_ = function(e) {
  if (Blockly.readOnly) {
    return;
  }
  var options = [];
  // Add a little animation to collapsing and expanding.
  var COLLAPSE_DELAY = 10;

  if (Blockly.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    var topBlocks = Blockly.mainWorkspace.getTopBlocks(false);
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
    options.push(collapseOption);

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
    options.push(expandOption);
  }

  Blockly.ContextMenu.show(e, options);
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
  if (!opt_allowToolbox &&
      Blockly.mainWorkspace.toolbox_ &&
      Blockly.mainWorkspace.toolbox_.flyout_ &&
      Blockly.mainWorkspace.toolbox_.flyout_.autoClose) {
    Blockly.mainWorkspace.toolbox_.clearSelection();
  }
};

/**
 * Deselect any selections on the webpage.
 * Chrome will select text outside the SVG when double-clicking.
 * Deselect this text, so that it doesn't mess up any subsequent drag.
 */
Blockly.removeAllRanges = function() {
  if (window.getSelection) {  // W3
    var sel = window.getSelection();
    if (sel && sel.removeAllRanges) {
      sel.removeAllRanges();
      setTimeout(function() {
          try {
            window.getSelection().removeAllRanges();
          } catch (e) {
            // MSIE throws 'error 800a025e' here.
          }
        }, 0);
    }
  }
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text';
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.loadAudio_ = function(filenames, name) {
  if (!window['Audio'] || !filenames.length) {
    // No browser support for Audio.
    return;
  }
  var sound;
  var audioTest = new window['Audio']();
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
    Blockly.SOUNDS_[name] = sound;
  }
};

/**
 * Preload all the audio files so that they play quickly when asked for.
 * @private
 */
Blockly.preloadAudio_ = function() {
  for (var name in Blockly.SOUNDS_) {
    var sound = Blockly.SOUNDS_[name];
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
 * @param {?number} opt_volume Volume of sound (0-1).
 */
Blockly.playAudio = function(name, opt_volume) {
  var sound = Blockly.SOUNDS_[name];
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
 */
Blockly.getMainWorkspaceMetrics_ = function() {
  var svgSize = Blockly.svgSize();
  if (Blockly.mainWorkspace.toolbox_) {
    svgSize.width -= Blockly.mainWorkspace.toolbox_.width;
  }
  var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
  try {
    var blockBox = Blockly.mainWorkspace.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (Blockly.mainWorkspace.scrollbar) {
    // Add a border around the content that is at least half a screenful wide.
    // Ensure border is wide enough that blocks can scroll over entire screen.
    var leftEdge = Math.min(blockBox.x - viewWidth / 2,
                            blockBox.x + blockBox.width - viewWidth);
    var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth / 2,
                             blockBox.x + viewWidth);
    var topEdge = Math.min(blockBox.y - viewHeight / 2,
                           blockBox.y + blockBox.height - viewHeight);
    var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight / 2,
                              blockBox.y + viewHeight);
  } else {
    var leftEdge = blockBox.x;
    var rightEdge = leftEdge + blockBox.width;
    var topEdge = blockBox.y;
    var bottomEdge = topEdge + blockBox.height;
  }
  var absoluteLeft = 0;
  if (!Blockly.RTL && Blockly.mainWorkspace.toolbox_) {
    absoluteLeft = Blockly.mainWorkspace.toolbox_.width;
  }
  var metrics = {
    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -Blockly.mainWorkspace.scrollY,
    viewLeft: -Blockly.mainWorkspace.scrollX,
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
 */
Blockly.setMainWorkspaceMetrics_ = function(xyRatio) {
  if (!Blockly.mainWorkspace.scrollbar) {
    throw 'Attempt to set main workspace scroll without scrollbars.';
  }
  var metrics = Blockly.getMainWorkspaceMetrics_();
  if (goog.isNumber(xyRatio.x)) {
    Blockly.mainWorkspace.scrollX = -metrics.contentWidth * xyRatio.x -
        metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
    Blockly.mainWorkspace.scrollY = -metrics.contentHeight * xyRatio.y -
        metrics.contentTop;
  }
  var translation = 'translate(' +
      (Blockly.mainWorkspace.scrollX + metrics.absoluteLeft) + ',' +
      (Blockly.mainWorkspace.scrollY + metrics.absoluteTop) + ')';
  Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
  Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
                                                       translation);
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
 */
Blockly.addChangeListener = function(func) {
  return Blockly.bindEvent_(Blockly.mainWorkspace.getCanvas(),
                            'blocklyWorkspaceChange', null, func);
};

/**
 * Stop listening for Blockly's workspace changes.
 * @param {!Array.<!Array>} bindData Opaque data from addChangeListener.
 */
Blockly.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData);
};

/**
 * Returns the main workspace.
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
