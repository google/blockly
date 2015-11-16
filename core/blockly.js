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
goog.require('Blockly.FieldTextArea');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Generator');
goog.require('Blockly.Msg');
goog.require('Blockly.Procedures');
goog.require('Blockly.Realtime');
goog.require('Blockly.Toolbox');
goog.require('Blockly.TypeBlock');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.inject');
goog.require('Blockly.utils');
goog.require('goog.color');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');


// Turn off debugging when compiled.
var CLOSURE_DEFINES = {'goog.DEBUG': false};

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
  width: 96,
  height: 124,
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
 * Currently selected field.
 * @type {Blockly.Field}
 */
Blockly.selectedField = null;

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
 * @type {Blockly.WorkspaceSvg}
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
 * latest clicked position is used to open the type blocking suggestions window
 * Initial position is 0,0
 * @type {{x: number, y:number}}
 */
Blockly.latestClick = { x: 0, y: 0 };

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
 * Defines list of variables for various scopes.
 * @type {Object.<!Array>}
 */
Blockly.scopeVariableList = {
  'Types': ['String','Number','Boolean','Array','Map']
};
/**
 * Defines list of variable type equivalences.
 * @type {Object.<!Array>}
 */
 Blockly.VariableTypeEquivalence = {
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
  if (e.touches && e.touches.length >= 2) {
    return;  // Multi-touch gestures won't have e.clientX.
  }
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
    if (Math.sqrt(dx * dx + dy * dy) > Blockly.DRAG_RADIUS) {
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
  if (e.keyCode == goog.events.KeyCodes.TAB && Blockly.WidgetDiv.isVisible()) {
    Blockly.WidgetDiv.hide();
  } else if (Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  var deleteBlock = false;
  if (e.keyCode == goog.events.KeyCodes.ESC) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
    Blockly.selectField(null);
  } else if (e.keyCode == goog.events.KeyCodes.TAB) {
    if (e.shiftKey) {
      Blockly.selectPrevField();
    } else {
      Blockly.selectNextField();
    }
  } else if (e.keyCode == goog.events.KeyCodes.BACKSPACE ||
             e.keyCode == goog.events.KeyCodes.DELETE) {
    // Delete or backspace.
    try {
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        deleteBlock = true;
      }
    } finally {
      // Stop the browser from going back to the previous page.
      // Use a finally so that any error in delete code above doesn't disappear
      // from the console when the page rolls back.
      e.preventDefault();
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    var handled = false;
    if (Blockly.selected &&
        Blockly.selected.isDeletable() && Blockly.selected.isMovable()) {
      // Figure out how much to move the block by so that it unsnaps and
      // stays unsnapped.
      var dist = Math.round(.5+
        (Blockly.selected.workspace.scale*Blockly.SNAP_RADIUS+1));
      if (e.keyCode === goog.events.KeyCodes.C) {
        // 'c' for copy.
        Blockly.hideChaff();
        Blockly.copy_(Blockly.selected);
        handled = true;
      } else if (e.keyCode === goog.events.KeyCodes.X) {
        // 'x' for cut.
        Blockly.copy_(Blockly.selected);
        handled = true;
        deleteBlock = true;
      } else if (e.altKey && e.keyCode === goog.events.KeyCodes.RIGHT) {
        Blockly.selected.moveByKey(dist,0);
      } else if (e.altKey && e.keyCode === goog.events.KeyCodes.LEFT) {
        Blockly.selected.moveByKey(-dist,0);
      } else if (e.altKey && e.keyCode === goog.events.KeyCodes.DOWN) {
        Blockly.selected.moveByKey(0,dist);
      } else if (e.altKey && e.keyCode === goog.events.KeyCodes.UP) {
        Blockly.selected.moveByKey(0,-dist);
      }
    }
    if (e.keyCode == goog.events.KeyCodes.V) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.clipboardSource_.paste(Blockly.clipboardXml_);
        handled = true;
      }
    }
    if (!handled && e.metaKey && e.keyCode &&
        Blockly.selected && Blockly.selected.contextMenu) {
      var options = Blockly.selected.buildContextMenu_();
      for (var opt = 0; opt < options.length; opt++) {
        if (options[opt].enabled && options[opt].accel == e.keyCode) {
          Blockly.doCommand(options[opt].callback);
          break;
        }
      }
    }
  } else if (Blockly.WidgetDiv.isVisible()) {
    Blockly.WidgetDiv.onKeyDown_(e);
  } else {
    var block = Blockly.selected;
    if (block && e.shiftKey &&
        (e.keyCode === goog.events.KeyCodes.RIGHT ||
         e.keyCode === goog.events.KeyCodes.LEFT ||
         e.keyCode === goog.events.KeyCodes.UP ||
         e.keyCode === goog.events.KeyCodes.DOWN)) {
      Blockly.selectNearestBlock(block,e.keyCode);
    } else if (block && e.keyCode === (block.RTL ? goog.events.KeyCodes.RIGHT
                                          : goog.events.KeyCodes.LEFT)) {
      Blockly.selectPrevBlock();
    } else if (block && e.keyCode === (block.RTL ? goog.events.KeyCodes.LEFT
                                                 : goog.events.KeyCodes.RIGHT)) {
      Blockly.selectNextBlock();
    } else if (block && e.keyCode === goog.events.KeyCodes.UP) {
      Blockly.selectParentBlock();
    } else if (block && e.keyCode === goog.events.KeyCodes.DOWN) {
      Blockly.selectChildBlock();
    } else if (block && e.keyCode === goog.events.KeyCodes.SPACE) {
      var box = goog.style.getBoundingClientRect_(block.svgGroup_);
      var offset = Blockly.SNAP_RADIUS * block.workspace.scale;
      if (block.RTL) {
        e.clientX = box.right - offset;
      } else {
        e.clientX = box.left + offset;
      }
      e.clientY = box.top + offset;
//      Blockly.selected.workspace.scrollToArea(Blockly.selected);
      Blockly.selectBlock(Blockly.selected);
      Blockly.selected.showContextMenu_(e);
    } else {
      Blockly.TypeBlock.onKeyDown_(e);
    }
  }
  if (deleteBlock) {
    // Common code for delete and cut.
    Blockly.hideChaff();
    var heal = Blockly.dragMode_ != 2;
    Blockly.selected.dispose(heal, true);
    if (Blockly.highlightedConnection_) {
      Blockly.highlightedConnection_.unhighlight();
      Blockly.highlightedConnection_ = null;
    }
  }
};

/**
 * Make a block selected and focus on it.
 * @param {!Blockly.Block} block Block to be shown.
 */
Blockly.selectBlock = function(block) {
  if (block) {
    block.select();
    var xy = block.getRelativeToSurfaceXY();
    var height = block.height;
    var width = block.width;
    var rect = {
                top: xy.y,
                bottom: xy.y + block.height
               };
    if (block.RTL) {
      rect.left = xy.x-width;
      rect.right = xy.x;
    } else {
      rect.left = xy.x;
      rect.right = xy.x + width;
    }
    block.workspace.scrollToArea(rect, block.RTL);
  }
};

/**
 * Make a field selected based on distance.
 * @param {Blockly.Field} field New field to select.
 * @param {key} key Key indicating direction to select.
 */
Blockly.selectNearestBlock = function(block,keyCode) {
  var xfactor = 0;
  var yfactor = 0;
  var xdir = 0;
  var ydir = 0;
  if (keyCode == goog.events.KeyCodes.RIGHT) {
    xdir = 1; // x must be larger
    xfactor = 1;
    yfactor = .5;
  } else if (keyCode == goog.events.KeyCodes.LEFT) {
    xdir = -1; // x must be lower
    yfactor = .5;
  } else if (keyCode == goog.events.KeyCodes.UP) {
    ydir = -1; // y must be lower
    xfactor = .5;
  } else  if (keyCode == goog.events.KeyCodes.DOWN) {
    ydir = 1; // y must be higher
    xfactor = .5;
    yfactor = 0;
  }
  // Remember that right to left blocks start from the upper right corner.
  if (block.RTL) {
    xfactor = -xfactor;
  }
  // Determine our initial comparison point
  var xy = block.getRelativeToSurfaceXY();
  xy.x += block.width * xfactor;
  xy.y += block.height * yfactor;

  var blocks = block.workspace.getAllBlocks();
  var closest = null;
  var distance = null;
  for (var blk = 0; blk < blocks.length; blk++) {
    var bxy = blocks[blk].getRelativeToSurfaceXY();
    bxy.x += block.width * xfactor;
    bxy.y += block.height * yfactor;
    var dx = bxy.x - xy.x;
    var dy = bxy.y - xy.y;
    var dirtest = dx*xdir + dy*ydir;
    if (dirtest > 0) {
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (distance == null || dist < distance) {
        distance = dist;
        closest = blocks[blk];
      }
    }
  }
  if (closest) {
    Blockly.selectBlock(closest);
  }
};
/**
 * Make a field selected.
 * @param {Blockly.Field} field New field to select.
 */
Blockly.selectField = function(field) {
  Blockly.selectedField = field;
  if (field) {
    var block = field.sourceBlock_;
    // First we select the block and scroll so that it is visible in the view
    // Generally this will also have the fields in view, but if the block is
    // large enough and the field is far enough to the end of the block, it
    // might be possible that the field is obscured, but we want to use the
    // block as a basis to start with.
    block.select();
    var xy = block.getRelativeToSurfaceXY();
    var height = block.height;
    var width = block.width;
    var rect = {
                top: xy.y,
                bottom: xy.y + block.height
               };
    if (block.RTL) {
      rect.left = xy.x-width;
      rect.right = xy.x;
    } else {
      rect.left = xy.x;
      rect.right = xy.x + width;
    }
    block.workspace.scrollToArea(rect, block.RTL);

    
    var fieldElem = field.getSvgRoot();
    if (fieldElem) {
      var elemXy = Blockly.getRelativeXY_(fieldElem);
      rect = {
               top: xy.y + elemXy.y,
               bottom: xy.y + block.height
             };
      if (block.RTL) {
        rect.left = xy.x - width;
        rect.right = xy.x - elemXy.x;
      } else {
        rect.left = xy.x + elemXy.x;
        rect.right = xy.x + width;
      }
      block.workspace.scrollToArea(rect, block.RTL);
    }

    // Now we need to active the field for editing
    field.showEditor_();
  }
};

/**
 * ↹ Tab:
 *     Activates the next editable following the logic of → Right arrow
 *      (→ Left arrow in RTL mode) to go past any fields
 *     which have no editable fields.
 *    Note that it does not ever leave the Blockly canvas to activate
 *    other UI elements of the browser.
 */
Blockly.selectNextField = function() {
  var lastField = Blockly.selectedField;
  var curBlock = Blockly.selected;
  var selField = null;
  // Find us a field to select
  while(selField === null) {
    // If we started out with no block selected, go to the first block
    if (!curBlock) {
      curBlock = Blockly.findNextBlock(null);
      lastField = null;
    }
    // If we found no block (or there are no blocks) then we can just quit
    if (!curBlock) {
      break;
    }
    // See if the current block has any editable fields on it
    var fields = curBlock.getEditableFields();
    if (fields.length) {
      // It does have fields, see what field we should select in it
      var spot = 0;
      if (lastField) {
        // if the currently selected field is one of them and look for any
        // fields after it
        spot = goog.array.indexOf(fields, lastField)+1;
        if (spot >= fields.length) {
          // it was the last field on the block so we want to skip to the next
          spot = -1;
        }
      }
      if (spot !== -1) {
        selField = fields[spot];
      }
    }
    if (selField === null) {
      // No fields so go to the next block
      curBlock = Blockly.findNextBlock(curBlock);
      lastField = null;
      if (curBlock == Blockly.selected) {
        break;
      }
    }
  }
  Blockly.selectField(selField);
};

/**
 * ⇧↹ Shift Tab
 *    Activates the previous editable field following the logic of
 *      → Left arrow (→ Right arrow in RTL mode) to go past any fields
 *     which have no editable fields.
 *    Note that it does not ever leave the Blockly canvas to activate
 *    other UI elements of the browser.
 */

Blockly.selectPrevField = function() {
  var lastField = Blockly.selectedField;
  var curBlock = Blockly.selected;
  var selField = null;
  // Find us a field to select
  while(selField === null) {
    // If we started out with no block selected, go to the first block
    if (!curBlock) {
      curBlock = Blockly.findNextBlock(null);
      lastField = null;
    }
    // If we found no block (or there are no blocks) then we can just quit
    if (!curBlock) {
      break;
    }
    // See if the current block has any editable fields on it
    var fields = curBlock.getEditableFields();
    if (fields.length) {
      // It does have fields, see what field we should select in it
      var spot = fields.length-1;
      if (lastField) {
        // if the currently selected field is one of them and look for any
        // fields after it
        spot = goog.array.indexOf(fields, lastField)-1;
        if (spot < 0) {
          // it was the last field on the block so we want to skip to the next
          spot = -1;
        }
      }
      if (spot !== -1) {
        selField = fields[spot];
      }
    }
    if (selField === null) {
      // No fields so go to the next block
      curBlock = Blockly.findPrevBlock(curBlock);
      lastField = null;
      if (curBlock == Blockly.selected) {
        break;
      }
    }
  }
  Blockly.selectField(selField);
};

/**
 * Make a field selected.
 * → Right Arrow (← Left arrow in RTL mode)
 *    First child of this block if any,
 *    otherwise go to the next sibling of the closest ancestor
 *    that has a next sibling.
 *    This behavior allows the right arrow to traverse the tree in
 *    pre-order traversal.
 *    Note that this follows all the way to the top of disconnected blocks in
 *    that it jumps to the next collection of disconnected blocks when you
 *    attempt to go to the right arrow off the last block,
 *    it will go to the next set of blocks in the workspace.
 *    When you get to the last block in the entire workspace,
 *    the first block in the workspace should be selected.
 */
Blockly.selectNextBlock = function() {
  var newSelect = Blockly.findNextBlock(Blockly.selected);
  Blockly.selectField(null);
  Blockly.selectBlock(newSelect);
}

/**
 * Determine the next block in order from this block.
 * @param {Blockly.Block} block Block to navigate from.
 * @return {Blockly.Block} block that is next in order from this block
 */
Blockly.findNextTopBlock = function(block) {
  var nextBlock = null;
  // Get all the top blocks in physical sorted order to look through.
  var blocks = Blockly.getMainWorkspace().getTopBlocks(true);
  if (blocks.length > 0) {
    var spot = goog.array.indexOf(blocks, block)+1;
    // Did we actually find anything to match us in the array?
    if (spot > 0) {
      // When we get to the end of the array, wrap back to the first one
      if (spot === blocks.length) {
        spot = 0;
      }
      nextBlock = blocks[spot];
    }
  }
  return nextBlock;
};

/**
 * Determine the next block in order from this block.
 * @param {Blockly.Block} block Block to navigate from.
 * @return {Blockly.Block} block that is next in order from this block
 */
Blockly.findNextBlock = function(block) {
  /** @type {Blockly.Block} */
  var newSelect = null; // New block to be selected
  /** @type {Blockly.Block} */
  var baseBlock = block;  // Block being evaluated
  /** @type {Blockly.Block} */
  var prevBlock = null;  // Last block we had selected
  while ((baseBlock != null) && (newSelect === null)) {
    // Look through the children to see if the previous block was one of them.
    // If so, then we will take it.
    var children = [];
    if (!baseBlock.isCollapsed()) {
      children = baseBlock.getOrderedChildren();
    }
    var spot = 0;
    if (children.length > 0) {
      spot = goog.array.indexOf(children, prevBlock)+1;
    }
    if (spot < children.length) {
      newSelect = children[spot];
    } else {
      // Nothing more on this block, so let's try for our parent (remembering
      // which child we were
      prevBlock = baseBlock;
      baseBlock = baseBlock.getParent();
    }
  }
  // If we didn't get any blocks out of the current group, try for the next one
  // at the top level.  Note that prevBlock will point to the top level block
  // in the current group.
  if (newSelect === null) {
    newSelect = Blockly.findNextTopBlock(prevBlock);
  }
  return newSelect;
};

/*
 * ← Left Arrow  (→ Right arrow in RTL mode)
 *    If this block has a previous sibling,
 *       follow that block to the last sibling of any children recursively,
 *    otherwise select the parent block.
 *    The intent is that the Left arrow selects the block in reverse of what
 *    the right arrow did so that you traverse the blocks in the same
 *    forward/backwards order.
 */
Blockly.selectPrevBlock = function() {
  var newSelect = Blockly.findPrevBlock(Blockly.selected);
  Blockly.selectField(null);
  Blockly.selectBlock(newSelect);
}

/**
 * Determine the previous block in order from this block.
 * @param {Blockly.Block} block Block to navigate from.
 * @return {Blockly.Block} block that is previous in order from this block
 */
Blockly.findPrevTopBlock = function(block) {
  var prevBlock = null;
  // Get all the top blocks in physical sorted order to look through.
  var blocks = Blockly.getMainWorkspace().getTopBlocks(true);
  if (blocks.length > 0) {
    var spot = goog.array.indexOf(blocks, block);
    // Did we actually find anything to match us in the array?
    if (spot >= 0) {
      // When we get to the start of the array, wrap back to the last one
      if (spot === 0) {
        spot = blocks.length;
      }
      prevBlock = blocks[spot-1];
    }
  }
  return prevBlock;
};

/**
 * Determine the previous block in order from this block.
 * @param {Blockly.Block} block Block to navigate from.
 * @return {Blockly.Block} block that is previous in order from this block
 */
Blockly.findPrevBlock = function(block) {
  /** @type {Blockly.Block} */
  var newSelect = null; // New block to be selected
  /** @type {Blockly.Block} */
  var baseBlock = null;  // Block being evaluated
  /** @type {Blockly.Block} */
  var prevBlock = block;  // Last block we had selected
  if (prevBlock != null) {
    baseBlock = prevBlock.getParent();
    // If we didn't get any blocks out of the current group, try for the previous
    // one at the top level.  Note that prevBlock will point to the top level
    // block in the current group.
    if (baseBlock === null) {
      baseBlock = Blockly.findPrevTopBlock(prevBlock);
    }
  }
  while ((baseBlock != null) && (newSelect === null)) {
    // If this block has any children, we go to the last one of any children
    // otherwise we go to the parent
    var children = [];
    if (!baseBlock.isCollapsed()) {
      children = baseBlock.getOrderedChildren();
    }
    if (children.length === 0) {
      newSelect = baseBlock;
    } else {
      var spot = goog.array.indexOf(children, prevBlock);
      if (spot === 0) {
        newSelect = baseBlock;
      } else {
        if (spot === -1) {
          spot = children.length;
        }
        prevBlock = null;
        baseBlock = children[spot-1];
      }
    }
  }
  return newSelect;
};

/*
 * ↑ Up Arrow
 *    Previous sibling of current block if there is one,
 *    otherwise follow the logic for the left arrow key
 *    (right arrow when in RTL mode)
 */
Blockly.selectParentBlock = function() {
  /** @type {Blockly.Block} */
  var newSelect = null; // New block to be selected
  /** @type {Blockly.Block} */
  var baseBlock = null;  // Block being evaluated
  /** @type {Blockly.Block} */
  var prevBlock = Blockly.selected;  // Last block we had selected
  if (prevBlock != null) {
    if (prevBlock.previousConnection != null) {
      newSelect = prevBlock.previousConnection.targetBlock();
    }
    if (newSelect === null) {
      baseBlock = prevBlock.getSurroundParent();
      if (baseBlock != null) {
        var children = [];
        if (!baseBlock.isCollapsed() && !baseBlock.getInputsInline()) {
          children = baseBlock.getOrderedChildren();
        }
        if (children.length >= 0) {
          var spot = goog.array.indexOf(children, prevBlock);
          if (spot > 0) {
            newSelect = children[spot-1];
          }
        }
        if (newSelect === null) {
          newSelect = baseBlock;
        }
      }
    }
  }
  if (newSelect === null) {
    newSelect = Blockly.findPrevTopBlock(prevBlock);
  }
  Blockly.selectField(null);
  Blockly.selectBlock(newSelect);
};

/*
 * ↓ Down Arrow
 *     Next Sibling of the current block if there is one,
 *     otherwise follow the logic for the right arrow key
 *     (left arrow when in RTL mode)
 */
Blockly.selectChildBlock = function() {
  /** @type {Blockly.Block} */
  var newSelect = null; // New block to be selected
  /** @type {Blockly.Block} */
  var baseBlock = null;  // Block being evaluated
  /** @type {Blockly.Block} */
  var prevBlock = Blockly.selected;  // Last block we had selected
  if (prevBlock != null) {
    newSelect = prevBlock.getNextBlock();
    if (newSelect === null) {
      baseBlock = prevBlock.getSurroundParent();
      if (baseBlock != null) {
        var children = [];
        if (!baseBlock.isCollapsed() && !baseBlock.getInputsInline()) {
          children = baseBlock.getOrderedChildren();
        }
        if (children.length >= 0) {
          var spot = goog.array.indexOf(children, prevBlock);
          if (spot >= 0 && spot < (children.length-1)) {
            newSelect = children[spot+1];
          }
        }
        if (newSelect === null) {
          newSelect = baseBlock;
        }
      }
    }
  }
  if (newSelect === null) {
    newSelect = Blockly.findNextTopBlock(prevBlock);
  }
  Blockly.selectField(null);
  Blockly.selectBlock(newSelect);
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
 * @param {!Blockly.Block|!Blockly.WorkspaceSvg} uiObject The block or workspace
 *   under the touchstart event.
 * @private
 */
Blockly.longStart_ = function(e, uiObject) {
  Blockly.longStop_();
  Blockly.longPid_ = setTimeout(function() {
      e.button = 2;  // Simulate a right button click.
      uiObject.onMouseDown_(e);
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
  if (Blockly.dragMode_ != 2) {
    Blockly.Xml.deleteNext(xmlBlock);
  }
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', block.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboardXml_ = xmlBlock;
  Blockly.clipboardSource_ = block.workspace;
};

/**
 * Duplicate this block and its children.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.duplicate_ = function(block) {
  // Save the clipboard.
  var clipboardXml = Blockly.clipboardXml_;
  var clipboardSource = Blockly.clipboardSource_;

  // Create a duplicate via a copy/paste operation.
  Blockly.copy_(block);
  block.workspace.paste(Blockly.clipboardXml_);

  // Restore the clipboard.
  Blockly.clipboardXml_ = clipboardXml;
  Blockly.clipboardSource_ = clipboardSource;
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
  Blockly.TypeBlock.hide();
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
  // Set the margin to match the flyout's margin so that the workspace does
  // not jump as blocks are added.
  var MARGIN = Blockly.Flyout.prototype.CORNER_RADIUS - 1;
  var viewWidth = svgSize.width - MARGIN;
  var viewHeight = svgSize.height - MARGIN;
  try {
    var blockBox = this.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  // Fix scale.
  var contentWidth = blockBox.width * this.scale;
  var contentHeight = blockBox.height * this.scale;
  var contentX = blockBox.x * this.scale;
  var contentY = blockBox.y * this.scale;
  if (this.scrollbar) {
    // Add a border around the content that is at least half a screenful wide.
    // Ensure border is wide enough that blocks can scroll over entire screen.
    var leftEdge = Math.min(contentX - viewWidth / 2,
                            contentX + contentWidth - viewWidth);
    var rightEdge = Math.max(contentX + contentWidth + viewWidth / 2,
                             contentX + viewWidth);
    var topEdge = Math.min(contentY - viewHeight / 2,
                           contentY + contentHeight - viewHeight);
    var bottomEdge = Math.max(contentY + contentHeight + viewHeight / 2,
                              contentY + viewHeight);
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
    if (goog.userAgent.IE) {
      // IE doesn't notice that the x/y offsets have changed.  Force an update.
      this.updateGridPattern_();
    }
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
