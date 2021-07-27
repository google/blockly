/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a code comment on a rendered workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.WorkspaceCommentSvg');
goog.module.declareLegacyNamespace();

goog.require('Blockly');
goog.require('Blockly.browserEvents');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Css');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentDelete');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentMove');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Selected');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.WorkspaceComment');

goog.requireType('Blockly.BlockDragSurfaceSvg');
goog.requireType('Blockly.IBoundedElement');
goog.requireType('Blockly.IBubble');
goog.requireType('Blockly.ICopyable');
goog.requireType('Blockly.Workspace');


/**
 * Class for a workspace comment's SVG representation.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {number} height Height of the comment.
 * @param {number} width Width of the comment.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Blockly.WorkspaceComment}
 * @implements {Blockly.IBoundedElement}
 * @implements {Blockly.IBubble}
 * @implements {Blockly.ICopyable}
 * @constructor
 */
const WorkspaceCommentSvg = function(
    workspace, content, height, width, opt_id) {
  /**
   * Mouse up event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseUpWrapper_ = null;

  /**
   * Mouse move event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseMoveWrapper_ = null;

  // Create core elements for the block.
  /**
   * @type {!SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {'class': 'blocklyComment'}, null);
  this.svgGroup_.translate_ = '';

  this.svgRect_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT, {
        'class': 'blocklyCommentRect',
        'x': 0,
        'y': 0,
        'rx': WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': WorkspaceCommentSvg.BORDER_RADIUS
      });
  this.svgGroup_.appendChild(this.svgRect_);

  /**
   * Whether the comment is rendered onscreen and is a part of the DOM.
   * @type {boolean}
   * @private
   */
  this.rendered_ = false;

  /**
   * Whether to move the comment to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.blockDragSurface_;

  WorkspaceCommentSvg.superClass_.constructor.call(
      this, workspace, content, height, width, opt_id);

  this.render();
};
Blockly.utils.object.inherits(
    WorkspaceCommentSvg, Blockly.WorkspaceComment);

/**
 * The width and height to use to size a workspace comment when it is first
 * added, before it has been edited by the user.
 * @type {number}
 * @package
 */
WorkspaceCommentSvg.DEFAULT_SIZE = 100;

/**
 * Size of the resize icon.
 * @type {number}
 * @const
 * @private
 */
WorkspaceCommentSvg.RESIZE_SIZE = 8;

/**
 * Radius of the border around the comment.
 * @type {number}
 * @const
 * @private
 */
WorkspaceCommentSvg.BORDER_RADIUS = 3;

/**
 * Offset from the foreignobject edge to the textarea edge.
 * @type {number}
 * @const
 * @private
 */
WorkspaceCommentSvg.TEXTAREA_OFFSET = 2;

/**
 * Offset from the top to make room for a top bar.
 * @type {number}
 * @const
 * @private
 */
WorkspaceCommentSvg.TOP_OFFSET = 10;

/**
 * Dispose of this comment.
 * @package
 */
WorkspaceCommentSvg.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }
  // If this comment is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.COMMENT_DELETE))(this));
  }

  Blockly.utils.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgRect_ = null;
  // Dispose of any rendered components
  this.disposeInternal_();

  Blockly.Events.disable();
  WorkspaceCommentSvg.superClass_.dispose.call(this);
  Blockly.Events.enable();
};

/**
 * Create and initialize the SVG representation of a workspace comment.
 * May be called more than once.
 *
 * @param {boolean=} opt_noSelect Text inside text area will be selected if false
 *
 * @package
 */
WorkspaceCommentSvg.prototype.initSvg = function(opt_noSelect) {
  if (!this.workspace.rendered) {
    throw TypeError('Workspace is headless.');
  }
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.browserEvents.conditionalBind(
        this.svgRectTarget_, 'mousedown', this, this.pathMouseDown_);
    Blockly.browserEvents.conditionalBind(
        this.svgHandleTarget_, 'mousedown', this, this.pathMouseDown_);
  }
  this.eventsInit_ = true;

  this.updateMovable();
  if (!this.getSvgRoot().parentNode) {
    this.workspace.getBubbleCanvas().appendChild(this.getSvgRoot());
  }

  if (!opt_noSelect && this.textarea_) {
    this.textarea_.select();
  }
};

/**
 * Handle a mouse-down on an SVG comment.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
WorkspaceCommentSvg.prototype.pathMouseDown_ = function(e) {
  const gesture = this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBubbleStart(e, this);
  }
};

/**
 * Show the context menu for this workspace comment.
 * @param {!Event} e Mouse event.
 * @package
 */
WorkspaceCommentSvg.prototype.showContextMenu = function(e) {
  if (this.workspace.options.readOnly) {
    return;
  }
  // Save the current workspace comment in a variable for use in closures.
  const comment = this;
  const menuOptions = [];

  if (this.isDeletable() && this.isMovable()) {
    menuOptions.push(Blockly.ContextMenu.commentDuplicateOption(comment));
    menuOptions.push(Blockly.ContextMenu.commentDeleteOption(comment));
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Select this comment.  Highlight it visually.
 * @package
 */
WorkspaceCommentSvg.prototype.select = function() {
  if (Blockly.selected == this) {
    return;
  }
  let oldId = null;
  if (Blockly.selected) {
    oldId = Blockly.selected.id;
    // Unselect any previously selected block.
    Blockly.Events.disable();
    try {
      Blockly.selected.unselect();
    } finally {
      Blockly.Events.enable();
    }
  }
  const event = new (Blockly.Events.get(Blockly.Events.SELECTED))(oldId,
      this.id,
      this.workspace.id);
  Blockly.Events.fire(event);
  Blockly.selected = this;
  this.addSelect();
};

/**
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
WorkspaceCommentSvg.prototype.unselect = function() {
  if (Blockly.selected != this) {
    return;
  }
  const event = new (Blockly.Events.get(Blockly.Events.SELECTED))(this.id, null,
      this.workspace.id);
  Blockly.Events.fire(event);
  Blockly.selected = null;
  this.removeSelect();
  this.blurFocus();
};

/**
 * Select this comment.  Highlight it visually.
 * @package
 */
WorkspaceCommentSvg.prototype.addSelect = function() {
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.setFocus();
};

/**
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
WorkspaceCommentSvg.prototype.removeSelect = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.blurFocus();
};

/**
 * Focus this comment.  Highlight it visually.
 * @package
 */
WorkspaceCommentSvg.prototype.addFocus = function() {
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Unfocus this comment.  Remove its highlighting.
 * @package
 */
WorkspaceCommentSvg.prototype.removeFocus = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Return the coordinates of the top-left corner of this comment relative to
 * the drawing surface's origin (0,0), in workspace units.
 * If the comment is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 * @package
 */
WorkspaceCommentSvg.prototype.getRelativeToSurfaceXY = function() {
  let x = 0;
  let y = 0;

  const dragSurfaceGroup =
      this.useDragSurface_ ? this.workspace.blockDragSurface_.getGroup() : null;

  let element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this comment and every parent.
      const xy = Blockly.utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.blockDragSurface_.getCurrentBlock() == element) {
        const surfaceTranslation =
            this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
    } while (element && element != this.workspace.getBubbleCanvas() &&
             element != dragSurfaceGroup);
  }
  this.xy_ = new Blockly.utils.Coordinate(x, y);
  return this.xy_;
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 * @package
 */
WorkspaceCommentSvg.prototype.moveBy = function(dx, dy) {
  const event = new (Blockly.Events.get(Blockly.Events.COMMENT_MOVE))(this);
  // TODO: Do I need to look up the relative to surface XY position here?
  const xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.xy_ = new Blockly.utils.Coordinate(xy.x + dx, xy.y + dy);
  event.recordNew();
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

/**
 * Transforms a comment by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 * @package
 */
WorkspaceCommentSvg.prototype.translate = function(x, y) {
  this.xy_ = new Blockly.utils.Coordinate(x, y);
  this.getSvgRoot().setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Move this comment to its workspace's drag surface, accounting for
 * positioning.  Generally should be called at the same time as
 * setDragging(true).  Does nothing if useDragSurface_ is false.
 * @package
 */
WorkspaceCommentSvg.prototype.moveToDragSurface = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  const xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.blockDragSurface_.translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  this.workspace.blockDragSurface_.setBlocksAndShow(this.getSvgRoot());
};

/**
 * Move this comment back to the workspace block canvas.
 * Generally should be called at the same time as setDragging(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!Blockly.utils.Coordinate} newXY The position the comment should take
 *     on on the workspace canvas, in workspace coordinates.
 * @private
 */
WorkspaceCommentSvg.prototype.moveOffDragSurface = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
};

/**
 * Move this comment during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * @param {Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
WorkspaceCommentSvg.prototype.moveDuringDrag = function(
    dragSurface, newLoc) {
  if (dragSurface) {
    dragSurface.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute(
        'transform', this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
WorkspaceCommentSvg.prototype.moveTo = function(x, y) {
  this.translate(x, y);
};

/**
 * Clear the comment of transform="..." attributes.
 * Used when the comment is switching from 3d to 2d transform or vice versa.
 * @private
 */
WorkspaceCommentSvg.prototype.clearTransformAttributes_ = function() {
  this.getSvgRoot().removeAttribute('transform');
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * comment.
 * Coordinate system: workspace coordinates.
 * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
 * @package
 */
WorkspaceCommentSvg.prototype.getBoundingRectangle = function() {
  const blockXY = this.getRelativeToSurfaceXY();
  const commentBounds = this.getHeightWidth();
  const top = blockXY.y;
  const bottom = blockXY.y + commentBounds.height;
  let left;
  let right;
  if (this.RTL) {
    left = blockXY.x - commentBounds.width;
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    right = blockXY.x;
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    left = blockXY.x;
    right = blockXY.x + commentBounds.width;
  }
  return new Blockly.utils.Rect(top, bottom, left, right);
};

/**
 * Add or remove the UI indicating if this comment is movable or not.
 * @package
 */
WorkspaceCommentSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  }
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 * @package
 */
WorkspaceCommentSvg.prototype.setMovable = function(movable) {
  WorkspaceCommentSvg.superClass_.setMovable.call(this, movable);
  this.updateMovable();
};

/**
 * Set whether this comment is editable or not.
 * @param {boolean} editable True if editable.
 */
WorkspaceCommentSvg.prototype.setEditable = function(editable) {
  WorkspaceCommentSvg.superClass_.setEditable.call(this, editable);
  if (this.textarea_) {
    this.textarea_.readOnly = !editable;
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
WorkspaceCommentSvg.prototype.setDragging = function(adding) {
  if (adding) {
    const group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {!SVGElement} The root SVG node (probably a group).
 * @package
 */
WorkspaceCommentSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @package
 */
WorkspaceCommentSvg.prototype.getContent = function() {
  return this.textarea_ ? this.textarea_.value : this.content_;
};

/**
 * Set this comment's content.
 * @param {string} content Comment content.
 * @package
 */
WorkspaceCommentSvg.prototype.setContent = function(content) {
  WorkspaceCommentSvg.superClass_.setContent.call(this, content);
  if (this.textarea_) {
    this.textarea_.value = content;
  }
};

/**
 * Update the cursor over this comment by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
WorkspaceCommentSvg.prototype.setDeleteStyle = function(enable) {
  if (enable) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  }
};

/**
 * Set whether auto-layout of this bubble is enabled.  The first time a bubble
 * is shown it positions itself to not cover any blocks.  Once a user has
 * dragged it to reposition, it renders where the user put it.
 * @param {boolean} _enable True if auto-layout should be enabled, false
 *     otherwise.
 * @package
 */
WorkspaceCommentSvg.prototype.setAutoLayout = function(_enable) {
  // NOP for compatibility with the bubble dragger.
};

/**
 * Decode an XML comment tag and create a rendered comment on the workspace.
 * @param {!Element} xmlComment XML comment element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {number=} opt_wsWidth The width of the workspace, which is used to
 *     position comments correctly in RTL.
 * @return {!WorkspaceCommentSvg} The created workspace comment.
 * @package
 */
WorkspaceCommentSvg.fromXml = function(
    xmlComment, workspace, opt_wsWidth) {
  Blockly.Events.disable();
  let comment;
  try {
    const info = Blockly.WorkspaceComment.parseAttributes(xmlComment);

    comment = new WorkspaceCommentSvg(
        workspace, info.content, info.h, info.w, info.id);
    if (workspace.rendered) {
      comment.initSvg(true);
      comment.render(false);
    }
    // Position the comment correctly, taking into account the width of a
    // rendered RTL workspace.
    if (!isNaN(info.x) && !isNaN(info.y)) {
      if (workspace.RTL) {
        const wsWidth = opt_wsWidth || workspace.getWidth();
        comment.moveBy(wsWidth - info.x, info.y);
      } else {
        comment.moveBy(info.x, info.y);
      }
    }
  } finally {
    Blockly.Events.enable();
  }
  Blockly.WorkspaceComment.fireCreateEvent(comment);

  return comment;
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
 * @return {!Element} Tree of XML elements.
 * @package
 */
WorkspaceCommentSvg.prototype.toXmlWithXY = function(opt_noId) {
  let width;  // Not used in LTR.
  if (this.workspace.RTL) {
    // Here be performance dragons: This calls getMetrics().
    width = this.workspace.getWidth();
  }
  const element = this.toXml(opt_noId);
  const xy = this.getRelativeToSurfaceXY();
  element.setAttribute(
      'x', Math.round(this.workspace.RTL ? width - xy.x : xy.x));
  element.setAttribute('y', Math.round(xy.y));
  element.setAttribute('h', this.getHeight());
  element.setAttribute('w', this.getWidth());
  return element;
};

/**
 * Encode a comment for copying.
 * @return {!Blockly.ICopyable.CopyData} Copy metadata.
 * @package
 */
WorkspaceCommentSvg.prototype.toCopyData = function() {
  return {xml: this.toXmlWithXY(), source: this.workspace, typeCounts: null};
};

/**
 * Returns a bounding box describing the dimensions of this comment.
 * @return {!{height: number, width: number}} Object with height and width
 *     properties in workspace units.
 * @package
 */
WorkspaceCommentSvg.prototype.getHeightWidth = function() {
  return { width: this.getWidth(), height: this.getHeight() };
};

/**
 * Renders the workspace comment.
 * @package
 */
WorkspaceCommentSvg.prototype.render = function() {
  if (this.rendered_) {
    return;
  }

  const size = this.getHeightWidth();

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
        'rx': WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': WorkspaceCommentSvg.BORDER_RADIUS
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
    Blockly.browserEvents.conditionalBind(
        this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
  }

  if (this.isDeletable()) {
    Blockly.browserEvents.conditionalBind(
        this.deleteGroup_, 'mousedown', this, this.deleteMouseDown_);
    Blockly.browserEvents.conditionalBind(
        this.deleteGroup_, 'mouseout', this, this.deleteMouseOut_);
    Blockly.browserEvents.conditionalBind(
        this.deleteGroup_, 'mouseup', this, this.deleteMouseUp_);
  }
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
WorkspaceCommentSvg.prototype.createEditor_ = function() {
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
        'y': WorkspaceCommentSvg.TOP_OFFSET,
        'class': 'blocklyCommentForeignObject'
      },
      null);
  const body = document.createElementNS(Blockly.utils.dom.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.utils.dom.HTML_NS);
  body.className = 'blocklyMinimalBody';
  const textarea = document.createElementNS(Blockly.utils.dom.HTML_NS,
      'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  textarea.readOnly = !this.isEditable();
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  // Don't zoom with mousewheel.
  Blockly.browserEvents.conditionalBind(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.browserEvents.conditionalBind(
      textarea, 'change', this,
      function(
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
WorkspaceCommentSvg.prototype.addResizeDom_ = function() {
  this.resizeGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {
        'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'
      },
      this.svgGroup_);
  const resizeSize = WorkspaceCommentSvg.RESIZE_SIZE;
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
WorkspaceCommentSvg.prototype.addDeleteDom_ = function() {
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
WorkspaceCommentSvg.prototype.resizeMouseDown_ = function(e) {
  this.unbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace.startDrag(e, new Blockly.utils.Coordinate(
      this.workspace.RTL ? -this.width_ : this.width_, this.height_));

  this.onMouseUpWrapper_ = Blockly.browserEvents.conditionalBind(
      document, 'mouseup', this, this.resizeMouseUp_);
  this.onMouseMoveWrapper_ = Blockly.browserEvents.conditionalBind(
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
WorkspaceCommentSvg.prototype.deleteMouseDown_ = function(e) {
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
WorkspaceCommentSvg.prototype.deleteMouseOut_ = function(_e) {
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
WorkspaceCommentSvg.prototype.deleteMouseUp_ = function(e) {
  // Delete this comment.
  this.dispose(true, true);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
WorkspaceCommentSvg.prototype.unbindDragEvents_ = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }
  if (this.onMouseMoveWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-up event while dragging a comment's border or resize handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
WorkspaceCommentSvg.prototype.resizeMouseUp_ = function(/* e */) {
  Blockly.Touch.clearTouchIdentifier();
  this.unbindDragEvents_();
};

/**
 * Resize this comment to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
WorkspaceCommentSvg.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  const newXY = this.workspace.moveDrag(e);
  this.setSize_(this.RTL ? -newXY.x : newXY.x, newXY.y);
};

/**
 * Callback function triggered when the comment has resized.
 * Resize the text area accordingly.
 * @private
 */
WorkspaceCommentSvg.prototype.resizeComment_ = function() {
  const size = this.getHeightWidth();
  const topOffset = WorkspaceCommentSvg.TOP_OFFSET;
  const textOffset = WorkspaceCommentSvg.TEXTAREA_OFFSET * 2;

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
WorkspaceCommentSvg.prototype.setSize_ = function(width, height) {
  // Minimum size of a comment.
  width = Math.max(width, 45);
  height = Math.max(height, 20 + WorkspaceCommentSvg.TOP_OFFSET);
  this.width_ = width;
  this.height_ = height;
  this.svgRect_.setAttribute('width', width);
  this.svgRect_.setAttribute('height', height);
  this.svgRectTarget_.setAttribute('width', width);
  this.svgRectTarget_.setAttribute('height', height);
  this.svgHandleTarget_.setAttribute('width', width);
  this.svgHandleTarget_.setAttribute('height',
      WorkspaceCommentSvg.TOP_OFFSET);
  if (this.RTL) {
    this.svgRect_.setAttribute('transform', 'scale(-1 1)');
    this.svgRectTarget_.setAttribute('transform', 'scale(-1 1)');
  }

  const resizeSize = WorkspaceCommentSvg.RESIZE_SIZE;
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
WorkspaceCommentSvg.prototype.disposeInternal_ = function() {
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
WorkspaceCommentSvg.prototype.setFocus = function() {
  const comment = this;
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
WorkspaceCommentSvg.prototype.blurFocus = function() {
  const comment = this;
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

/**
 * CSS for workspace comment.  See css.js for use.
 */
Blockly.Css.register([
  // clang-format off
  /* eslint-disable indent */
  '.blocklyCommentForeignObject {',
    'position: relative;',
    'z-index: 0;',
  '}',

  '.blocklyCommentRect {',
    'fill: #E7DE8E;',
    'stroke: #bcA903;',
    'stroke-width: 1px;',
  '}',

  '.blocklyCommentTarget {',
    'fill: transparent;',
    'stroke: #bcA903;',
  '}',

  '.blocklyCommentTargetFocused {',
    'fill: none;',
  '}',

  '.blocklyCommentHandleTarget {',
    'fill: none;',
  '}',

  '.blocklyCommentHandleTargetFocused {',
    'fill: transparent;',
  '}',

  '.blocklyFocused>.blocklyCommentRect {',
    'fill: #B9B272;',
    'stroke: #B9B272;',
  '}',

  '.blocklySelected>.blocklyCommentTarget {',
    'stroke: #fc3;',
    'stroke-width: 3px;',
  '}',

  '.blocklyCommentDeleteIcon {',
    'cursor: pointer;',
    'fill: #000;',
    'display: none;',
  '}',

  '.blocklySelected > .blocklyCommentDeleteIcon {',
    'display: block;',
  '}',

  '.blocklyDeleteIconShape {',
    'fill: #000;',
    'stroke: #000;',
    'stroke-width: 1px;',
  '}',

  '.blocklyDeleteIconShape.blocklyDeleteIconHighlighted {',
    'stroke: #fc3;',
  '}'
  /* eslint-enable indent */
  // clang-format on
]);

exports = WorkspaceCommentSvg;
