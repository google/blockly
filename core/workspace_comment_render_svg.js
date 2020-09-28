/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');


/**
 * Size of the resize icon.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.RESIZE_SIZE = 8;

/**
 * Radius of the border around the comment.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.BORDER_RADIUS = 3;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET = 2;

/**
 * Offset from the top to make room for a top bar.
 * @type {number}
 * @const
 * @private
 */
Blockly.WorkspaceCommentSvg.TOP_OFFSET = 10;

/**
 * Returns a bounding box describing the dimensions of this comment.
 * @return {!{height: number, width: number}} Object with height and width
 *     properties in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getHeightWidth = function() {
  return { width: this.getWidth(), height: this.getHeight() };
};

/**
 * Renders the workspace comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.render = function() {
  if (this.rendered_) {
    return;
  }

  var size = this.getHeightWidth();

  // Add text area
  this.createEditor_();
  this.svgGroup_.appendChild(this.foreignObject_);

  this.svgHandleTarget_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': 'blocklyCommentHandleTarget',
        'x': 0,
        'y': 0
      });
  this.svgGroup_.appendChild(this.svgHandleTarget_);
  this.svgRectTarget_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': 'blocklyCommentTarget',
        'x': 0,
        'y': 0,
        'rx': Blockly.WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_RADIUS
      });
  this.svgGroup_.appendChild(this.svgRectTarget_);

  // Add the resize icon
  this.addResizeDom_();
  if (this.isDeletable()) {
    // Add the delete icon
    this.addDeleteDom_();
  }

  this.setSize_(size.width, size.height);

  // Set the content
  this.textarea_.value = this.content_;

  this.rendered_ = true;

  if (this.resizeGroup_) {
    Blockly.bindEventWithChecks_(
        this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
  }

  if (this.isDeletable()) {
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.bindEventWithChecks_(
        this.deleteGroup_, 'mouseup', this, this.deleteMouseUp_);
  }
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject class="blocklyCommentForeignObject" x="0" y="10" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FOREIGNOBJECT,
      {
        'x': 0,
        'y': Blockly.WorkspaceCommentSvg.TOP_OFFSET,
        'class': 'blocklyCommentForeignObject'
      },
      null);
  var body = document.createElementNS(Blockly.utils.dom.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.utils.dom.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.utils.dom.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  textarea.readOnly = !this.isEditable();
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(
      /* eslint-disable no-unused-vars */ e
      /* eslint-enable no-unused-vars */) {
    this.setContent(textarea.value);
  });
  return this.foreignObject_;
};

/**
 * Add the resize icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addResizeDom_ = function() {
  this.resizeGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'
      },
      this.svgGroup_);
  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.POLYGON,
      {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
      this.resizeGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize / 3
      }, this.resizeGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': resizeSize * 2 / 3, 'y1': resizeSize - 1,
        'x2': resizeSize - 1, 'y2': resizeSize * 2 / 3
      }, this.resizeGroup_);
};

/**
 * Add the delete icon to the DOM
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.addDeleteDom_ = function() {
  this.deleteGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        'class': 'blocklyCommentDeleteIcon'
      },
      this.svgGroup_);
  this.deleteIconBorder_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CIRCLE,
      {
        'class': 'blocklyDeleteIconShape',
        'r': '7',
        'cx': '7.5',
        'cy': '7.5'
      },
      this.deleteGroup_);
  // x icon.
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'x1': '5', 'y1': '10',
        'x2': '10', 'y2': '5',
        'stroke': '#fff',
        'stroke-width': '2'
      },
      this.deleteGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.LINE,
      {
        'x1': '5', 'y1': '5',
        'x2': '10', 'y2': '10',
        'stroke': '#fff',
        'stroke-width': '2'
      },
      this.deleteGroup_);
};

/**
 * Handle a mouse-down on comment's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseDown_ = function(e) {
  this.unbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace.startDrag(e, new Blockly.utils.Coordinate(
    this.workspace.RTL ? -this.width_ : this.width_, this.height_));

  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mouseup', this, this.resizeMouseUp_);
  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', this, this.resizeMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-down on comment's delete icon.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseDown_ = function(e) {
  // Highlight the delete icon.
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.deleteIconBorder_),
      'blocklyDeleteIconHighlighted');
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Handle a mouse-out on comment's delete icon.
 * @param {!Event} _e Mouse out event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseOut_ = function(_e) {
  // Restore highlight on the delete icon.
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.deleteIconBorder_),
      'blocklyDeleteIconHighlighted');
};

/**
 * Handle a mouse-up on comment's delete icon.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment.
  this.dispose(true, true);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.unbindDragEvents_ = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-up event while dragging a comment's border or resize handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseUp_ = function(/* e */) {
  Blockly.Touch.clearTouchIdentifier();
  this.unbindDragEvents_();
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var newXY = this.workspace.moveDrag(e);
  this.setSize_(this.RTL ? -newXY.x : newXY.x, newXY.y);
};

/**
 * Callback function triggered when the comment has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.resizeComment_ = function() {
  var size = this.getHeightWidth();
  var topOffset = Blockly.WorkspaceCommentSvg.TOP_OFFSET;
  var textOffset = Blockly.WorkspaceCommentSvg.TEXTAREA_OFFSET * 2;

  this.foreignObject_.setAttribute('width', size.width);
  this.foreignObject_.setAttribute('height', size.height - topOffset);
  if (this.RTL) {
    this.foreignObject_.setAttribute('x', -size.width);
  }
  this.textarea_.style.width = (size.width - textOffset) + 'px';
  this.textarea_.style.height = (size.height - textOffset - topOffset) + 'px';
};

/**
 * Set size
 * @param {number} width width of the container
 * @param {number} height height of the container
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setSize_ = function(width, height) {
  // Minimum size of a comment.
  width = Math.max(width, 45);
  height = Math.max(height, 20 + Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  this.width_ = width;
  this.height_ = height;
  this.svgRect_.setAttribute('width', width);
  this.svgRect_.setAttribute('height', height);
  this.svgRectTarget_.setAttribute('width', width);
  this.svgRectTarget_.setAttribute('height', height);
  this.svgHandleTarget_.setAttribute('width', width);
  this.svgHandleTarget_.setAttribute('height',
      Blockly.WorkspaceCommentSvg.TOP_OFFSET);
  if (this.RTL) {
    this.svgRect_.setAttribute('transform', 'scale(-1 1)');
    this.svgRectTarget_.setAttribute('transform', 'scale(-1 1)');
  }

  var resizeSize = Blockly.WorkspaceCommentSvg.RESIZE_SIZE;
  if (this.resizeGroup_) {
    if (this.RTL) {
      // Mirror the resize group.
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (-width + resizeSize) + ',' + (height - resizeSize) + ') scale(-1 1)');
      this.deleteGroup_.setAttribute('transform', 'translate(' +
        (-width + resizeSize) + ',' + (-resizeSize) + ') scale(-1 1)');
    } else {
      this.resizeGroup_.setAttribute('transform', 'translate(' +
        (width - resizeSize) + ',' +
        (height - resizeSize) + ')');
      this.deleteGroup_.setAttribute('transform', 'translate(' +
        (width - resizeSize) + ',' +
        (-resizeSize) + ')');
    }
  }

  // Allow the contents to resize.
  this.resizeComment_();
};

/**
 * Dispose of any rendered comment components.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.disposeInternal_ = function() {
  this.textarea_ = null;
  this.foreignObject_ = null;
  this.svgRectTarget_ = null;
  this.svgHandleTarget_ = null;
  this.disposed_ = true;
};

/**
 * Set the focus on the text area.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setFocus = function() {
  var comment = this;
  this.focused_ = true;
  // Defer CSS changes.
  setTimeout(function() {
    if (comment.disposed_) {
      return;
    }
    comment.textarea_.focus();
    comment.addFocus();
    Blockly.utils.dom.addClass(
        comment.svgRectTarget_, 'blocklyCommentTargetFocused');
    Blockly.utils.dom.addClass(
        comment.svgHandleTarget_, 'blocklyCommentHandleTargetFocused');
  }, 0);
};

/**
 * Remove focus from the text area.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.blurFocus = function() {
  var comment = this;
  this.focused_ = false;
  // Defer CSS changes.
  setTimeout(function() {
    if (comment.disposed_) {
      return;
    }

    comment.textarea_.blur();
    comment.removeFocus();
    Blockly.utils.dom.removeClass(
        comment.svgRectTarget_, 'blocklyCommentTargetFocused');
    Blockly.utils.dom.removeClass(
        comment.svgHandleTarget_, 'blocklyCommentHandleTargetFocused');
  }, 0);
};
