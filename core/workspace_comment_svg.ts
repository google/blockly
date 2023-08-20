/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a code comment on a rendered workspace.
 *
 * @class
 */
// Former goog.module ID: Blockly.WorkspaceCommentSvg

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_selected.js';

import * as browserEvents from './browser_events.js';
import * as common from './common.js';
// import * as ContextMenu from './contextmenu.js';
import * as Css from './css.js';
import type {CommentMove} from './events/events_comment_move.js';
import * as eventUtils from './events/utils.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import type {IBubble} from './interfaces/i_bubble.js';
import type {ICopyable} from './interfaces/i_copyable.js';
import * as Touch from './touch.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {Rect} from './utils/rect.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';
import {WorkspaceComment} from './workspace_comment.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import {
  WorkspaceCommentCopyData,
  WorkspaceCommentPaster,
} from './clipboard/workspace_comment_paster.js';

/** Size of the resize icon. */
const RESIZE_SIZE = 8;

/** Radius of the border around the comment. */
const BORDER_RADIUS = 3;

/** Offset from the foreignobject edge to the textarea edge. */
const TEXTAREA_OFFSET = 2;

/**
 * Class for a workspace comment's SVG representation.
 */
export class WorkspaceCommentSvg
  extends WorkspaceComment
  implements IBoundedElement, IBubble, ICopyable<WorkspaceCommentCopyData>
{
  /**
   * The width and height to use to size a workspace comment when it is first
   * added, before it has been edited by the user.
   *
   * @internal
   */
  static DEFAULT_SIZE = 100;

  /** Offset from the top to make room for a top bar. */
  private static readonly TOP_OFFSET = 10;
  override workspace: WorkspaceSvg;

  /** Mouse up event data. */
  private onMouseUpWrapper: browserEvents.Data | null = null;

  /** Mouse move event data. */
  private onMouseMoveWrapper: browserEvents.Data | null = null;

  /** Whether event handlers have been initialized. */
  private eventsInit = false;
  private textarea: HTMLTextAreaElement | null = null;

  private svgRectTarget: SVGRectElement | null = null;

  private svgHandleTarget: SVGRectElement | null = null;

  private foreignObject: SVGForeignObjectElement | null = null;

  private resizeGroup: SVGGElement | null = null;

  private deleteGroup: SVGGElement | null = null;

  private deleteIconBorder: SVGCircleElement | null = null;

  private focused = false;
  private autoLayout = false;

  // Create core elements for the block.
  private readonly svgGroup: SVGElement;
  svgRect_: SVGRectElement;

  /** Whether the comment is rendered onscreen and is a part of the DOM. */
  private rendered = false;

  /**
   * @param workspace The block's workspace.
   * @param content The content of this workspace comment.
   * @param height Height of the comment.
   * @param width Width of the comment.
   * @param opt_id Optional ID.  Use this ID if provided, otherwise create a new
   *     ID.
   */
  constructor(
    workspace: WorkspaceSvg,
    content: string,
    height: number,
    width: number,
    opt_id?: string,
  ) {
    super(workspace, content, height, width, opt_id);
    this.svgGroup = dom.createSvgElement(Svg.G, {'class': 'blocklyComment'});
    this.workspace = workspace;

    this.svgRect_ = dom.createSvgElement(Svg.RECT, {
      'class': 'blocklyCommentRect',
      'x': 0,
      'y': 0,
      'rx': BORDER_RADIUS,
      'ry': BORDER_RADIUS,
    });
    this.svgGroup.appendChild(this.svgRect_);

    this.render();
  }

  /**
   * Dispose of this comment.
   *
   * @internal
   */
  override dispose() {
    if (this.disposed_) {
      return;
    }
    // If this comment is being dragged, unlink the mouse events.
    if (common.getSelected() === this) {
      this.unselect();
      this.workspace.cancelCurrentGesture();
    }

    if (eventUtils.isEnabled()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.COMMENT_DELETE))(this));
    }

    dom.removeNode(this.svgGroup);

    eventUtils.disable();
    super.dispose();
    eventUtils.enable();
  }

  /**
   * Create and initialize the SVG representation of a workspace comment.
   * May be called more than once.
   *
   * @param opt_noSelect Text inside text area will be selected if false
   * @internal
   */
  initSvg(opt_noSelect?: boolean) {
    if (!this.workspace.rendered) {
      throw TypeError('Workspace is headless.');
    }
    if (!this.workspace.options.readOnly && !this.eventsInit) {
      browserEvents.conditionalBind(
        this.svgRectTarget as SVGRectElement,
        'pointerdown',
        this,
        this.pathMouseDown,
      );
      browserEvents.conditionalBind(
        this.svgHandleTarget as SVGRectElement,
        'pointerdown',
        this,
        this.pathMouseDown,
      );
    }
    this.eventsInit = true;

    this.updateMovable();
    if (!this.getSvgRoot().parentNode) {
      this.workspace.getBubbleCanvas().appendChild(this.getSvgRoot());
    }

    if (!opt_noSelect && this.textarea) {
      this.textarea.select();
    }
  }

  /**
   * Handle a pointerdown on an SVG comment.
   *
   * @param e Pointer down event.
   */
  private pathMouseDown(e: PointerEvent) {
    const gesture = this.workspace.getGesture(e);
    if (gesture) {
      gesture.handleBubbleStart(e, this);
    }
  }

  /**
   * Show the context menu for this workspace comment.
   *
   * @param e Pointer event.
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showContextMenu(e: PointerEvent) {
    throw new Error(
      'The implementation of showContextMenu should be ' +
        'monkey-patched in by blockly.ts',
    );
  }

  /**
   * Select this comment.  Highlight it visually.
   *
   * @internal
   */
  select() {
    if (common.getSelected() === this) {
      return;
    }
    let oldId = null;
    if (common.getSelected()) {
      oldId = common.getSelected()!.id;
      // Unselect any previously selected block.
      eventUtils.disable();
      try {
        common.getSelected()!.unselect();
      } finally {
        eventUtils.enable();
      }
    }
    const event = new (eventUtils.get(eventUtils.SELECTED))(
      oldId,
      this.id,
      this.workspace.id,
    );
    eventUtils.fire(event);
    common.setSelected(this);
    this.addSelect();
  }

  /**
   * Unselect this comment.  Remove its highlighting.
   *
   * @internal
   */
  unselect() {
    if (common.getSelected() !== this) {
      return;
    }
    const event = new (eventUtils.get(eventUtils.SELECTED))(
      this.id,
      null,
      this.workspace.id,
    );
    eventUtils.fire(event);
    common.setSelected(null);
    this.removeSelect();
    this.blurFocus();
  }

  /**
   * Select this comment.  Highlight it visually.
   *
   * @internal
   */
  addSelect() {
    dom.addClass(this.svgGroup, 'blocklySelected');
    this.setFocus();
  }

  /**
   * Unselect this comment.  Remove its highlighting.
   *
   * @internal
   */
  removeSelect() {
    dom.addClass(this.svgGroup, 'blocklySelected');
    this.blurFocus();
  }

  /**
   * Focus this comment.  Highlight it visually.
   *
   * @internal
   */
  addFocus() {
    dom.addClass(this.svgGroup, 'blocklyFocused');
  }

  /**
   * Unfocus this comment.  Remove its highlighting.
   *
   * @internal
   */
  removeFocus() {
    dom.removeClass(this.svgGroup, 'blocklyFocused');
  }

  /**
   * Return the coordinates of the top-left corner of this comment relative to
   * the drawing surface's origin (0,0), in workspace units.
   * If the comment is on the workspace, (0, 0) is the origin of the workspace
   * coordinate system.
   * This does not change with workspace scale.
   *
   * @returns Object with .x and .y properties in workspace coordinates.
   * @internal
   */
  override getRelativeToSurfaceXY(): Coordinate {
    let x = 0;
    let y = 0;

    let element: Node | null = this.getSvgRoot();
    if (element) {
      do {
        // Loop through this comment and every parent.
        const xy = svgMath.getRelativeXY(element as Element);
        x += xy.x;
        y += xy.y;
        element = element.parentNode;
      } while (
        element &&
        element !== this.workspace.getBubbleCanvas() &&
        element !== null
      );
    }
    this.xy_ = new Coordinate(x, y);
    return this.xy_;
  }

  /**
   * Move a comment by a relative offset.
   *
   * @param dx Horizontal offset, in workspace units.
   * @param dy Vertical offset, in workspace units.
   * @internal
   */
  override moveBy(dx: number, dy: number) {
    const event = new (eventUtils.get(eventUtils.COMMENT_MOVE))(
      this,
    ) as CommentMove;
    // TODO: Do I need to look up the relative to surface XY position here?
    const xy = this.getRelativeToSurfaceXY();
    this.translate(xy.x + dx, xy.y + dy);
    this.xy_ = new Coordinate(xy.x + dx, xy.y + dy);
    event.recordNew();
    eventUtils.fire(event);
    this.workspace.resizeContents();
  }

  /**
   * Transforms a comment by setting the translation on the transform attribute
   * of the block's SVG.
   *
   * @param x The x coordinate of the translation in workspace units.
   * @param y The y coordinate of the translation in workspace units.
   * @internal
   */
  translate(x: number, y: number) {
    this.xy_ = new Coordinate(x, y);
    this.getSvgRoot().setAttribute(
      'transform',
      'translate(' + x + ',' + y + ')',
    );
  }

  /**
   * Move this comment during a drag.
   *
   * @param newLoc The location to translate to, in workspace coordinates.
   * @internal
   */
  moveDuringDrag(newLoc: Coordinate) {
    const translation = `translate(${newLoc.x}, ${newLoc.y})`;
    this.getSvgRoot().setAttribute('transform', translation);
  }

  /**
   * Move the bubble group to the specified location in workspace coordinates.
   *
   * @param x The x position to move to.
   * @param y The y position to move to.
   * @internal
   */
  moveTo(x: number, y: number) {
    this.translate(x, y);
  }

  /**
   * Clear the comment of transform="..." attributes.
   * Used when the comment is switching from 3d to 2d transform or vice versa.
   */
  private clearTransformAttributes() {
    this.getSvgRoot().removeAttribute('transform');
  }

  /**
   * Returns the coordinates of a bounding box describing the dimensions of this
   * comment.
   * Coordinate system: workspace coordinates.
   *
   * @returns Object with coordinates of the bounding box.
   * @internal
   */
  getBoundingRectangle(): Rect {
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
    return new Rect(top, bottom, left, right);
  }

  /**
   * Add or remove the UI indicating if this comment is movable or not.
   *
   * @internal
   */
  updateMovable() {
    if (this.isMovable()) {
      dom.addClass(this.svgGroup, 'blocklyDraggable');
    } else {
      dom.removeClass(this.svgGroup, 'blocklyDraggable');
    }
  }

  /**
   * Set whether this comment is movable or not.
   *
   * @param movable True if movable.
   * @internal
   */
  override setMovable(movable: boolean) {
    super.setMovable(movable);
    this.updateMovable();
  }

  /**
   * Set whether this comment is editable or not.
   *
   * @param editable True if editable.
   */
  override setEditable(editable: boolean) {
    super.setEditable(editable);
    if (this.textarea) {
      this.textarea.readOnly = !editable;
    }
  }

  /**
   * Recursively adds or removes the dragging class to this node and its
   * children.
   *
   * @param adding True if adding, false if removing.
   * @internal
   */
  setDragging(adding: boolean) {
    if (adding) {
      dom.addClass(this.getSvgRoot(), 'blocklyDragging');
    } else {
      dom.removeClass(this.getSvgRoot(), 'blocklyDragging');
    }
  }

  /**
   * Return the root node of the SVG or null if none exists.
   *
   * @returns The root SVG node (probably a group).
   * @internal
   */
  getSvgRoot(): SVGElement {
    return this.svgGroup;
  }

  /**
   * Returns this comment's text.
   *
   * @returns Comment text.
   * @internal
   */
  override getContent(): string {
    return this.textarea ? this.textarea.value : this.content_;
  }

  /**
   * Set this comment's content.
   *
   * @param content Comment content.
   * @internal
   */
  override setContent(content: string) {
    super.setContent(content);
    if (this.textarea) {
      this.textarea.value = content;
    }
  }

  /**
   * Update the cursor over this comment by adding or removing a class.
   *
   * @param enable True if the delete cursor should be shown, false otherwise.
   * @internal
   */
  setDeleteStyle(enable: boolean) {
    if (enable) {
      dom.addClass(this.svgGroup, 'blocklyDraggingDelete');
    } else {
      dom.removeClass(this.svgGroup, 'blocklyDraggingDelete');
    }
  }

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   *
   * @param _enable True if auto-layout should be enabled, false otherwise.
   * @internal
   */
  setAutoLayout(_enable: boolean) {}
  // NOP for compatibility with the bubble dragger.

  /**
   * Encode a comment subtree as XML with XY coordinates.
   *
   * @param opt_noId True if the encoder should skip the comment ID.
   * @returns Tree of XML elements.
   * @internal
   */
  override toXmlWithXY(opt_noId?: boolean): Element {
    let width = 0; // Not used in LTR.
    if (this.workspace.RTL) {
      // Here be performance dragons: This calls getMetrics().
      width = this.workspace.getWidth();
    }
    const element = this.toXml(opt_noId);
    const xy = this.getRelativeToSurfaceXY();
    element.setAttribute(
      'x',
      String(Math.round(this.workspace.RTL ? width - xy.x : xy.x)),
    );
    element.setAttribute('y', String(Math.round(xy.y)));
    element.setAttribute('h', String(this.getHeight()));
    element.setAttribute('w', String(this.getWidth()));
    return element;
  }

  /**
   * Encode a comment for copying.
   *
   * @returns Copy metadata.
   */
  toCopyData(): WorkspaceCommentCopyData {
    return {
      paster: WorkspaceCommentPaster.TYPE,
      commentState: this.toXmlWithXY(),
    };
  }

  /**
   * Returns a bounding box describing the dimensions of this comment.
   *
   * @returns Object with height and width properties in workspace units.
   * @internal
   */
  getHeightWidth(): {height: number; width: number} {
    return {width: this.getWidth(), height: this.getHeight()};
  }

  /**
   * Renders the workspace comment.
   *
   * @internal
   */
  render() {
    if (this.rendered) {
      return;
    }

    const size = this.getHeightWidth();

    // Add text area
    const foreignObject = this.createEditor();
    this.svgGroup.appendChild(foreignObject);

    this.svgHandleTarget = dom.createSvgElement(Svg.RECT, {
      'class': 'blocklyCommentHandleTarget',
      'x': 0,
      'y': 0,
    });
    this.svgGroup.appendChild(this.svgHandleTarget);
    this.svgRectTarget = dom.createSvgElement(Svg.RECT, {
      'class': 'blocklyCommentTarget',
      'x': 0,
      'y': 0,
      'rx': BORDER_RADIUS,
      'ry': BORDER_RADIUS,
    });
    this.svgGroup.appendChild(this.svgRectTarget);

    // Add the resize icon
    this.addResizeDom();
    if (this.isDeletable()) {
      // Add the delete icon
      this.addDeleteDom();
    }

    this.setSize(size.width, size.height);

    // Set the content
    this.textarea!.value = this.content_;

    this.rendered = true;

    if (this.resizeGroup) {
      browserEvents.conditionalBind(
        this.resizeGroup,
        'pointerdown',
        this,
        this.resizeMouseDown,
      );
    }

    if (this.isDeletable()) {
      browserEvents.conditionalBind(
        this.deleteGroup as SVGGElement,
        'pointerdown',
        this,
        this.deleteMouseDown,
      );
      browserEvents.conditionalBind(
        this.deleteGroup as SVGGElement,
        'pointerout',
        this,
        this.deleteMouseOut,
      );
      browserEvents.conditionalBind(
        this.deleteGroup as SVGGElement,
        'pointerup',
        this,
        this.deleteMouseUp,
      );
    }
  }

  /**
   * Create the text area for the comment.
   *
   * @returns The top-level node of the editor.
   */
  private createEditor(): Element {
    /* Create the editor.  Here's the markup that will be generated:
          <foreignObject class="blocklyCommentForeignObject" x="0" y="10"
          width="164" height="164"> <body xmlns="http://www.w3.org/1999/xhtml"
          class="blocklyMinimalBody"> <textarea
       xmlns="http://www.w3.org/1999/xhtml" class="blocklyCommentTextarea"
                  style="height: 164px; width: 164px;"></textarea>
            </body>
          </foreignObject>
        */
    this.foreignObject = dom.createSvgElement(Svg.FOREIGNOBJECT, {
      'x': 0,
      'y': WorkspaceCommentSvg.TOP_OFFSET,
      'class': 'blocklyCommentForeignObject',
    });
    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';
    const textarea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    textarea.className = 'blocklyCommentTextarea';
    textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
    textarea.readOnly = !this.isEditable();
    body.appendChild(textarea);
    this.textarea = textarea;
    this.foreignObject.appendChild(body);
    // Don't zoom with mousewheel.
    browserEvents.conditionalBind(
      textarea,
      'wheel',
      this,
      function (e: WheelEvent) {
        e.stopPropagation();
      },
    );
    browserEvents.conditionalBind(
      textarea,
      'change',
      this,
      function (this: WorkspaceCommentSvg, _e: Event) {
        this.setContent(textarea.value);
      },
    );
    return this.foreignObject;
  }

  /** Add the resize icon to the DOM */
  private addResizeDom() {
    this.resizeGroup = dom.createSvgElement(
      Svg.G,
      {'class': this.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'},
      this.svgGroup,
    );
    dom.createSvgElement(
      Svg.POLYGON,
      {
        'points': `0,${RESIZE_SIZE} ${RESIZE_SIZE},${RESIZE_SIZE} ${RESIZE_SIZE},0`,
      },
      this.resizeGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': RESIZE_SIZE / 3,
        'y1': RESIZE_SIZE - 1,
        'x2': RESIZE_SIZE - 1,
        'y2': RESIZE_SIZE / 3,
      },
      this.resizeGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': (RESIZE_SIZE * 2) / 3,
        'y1': RESIZE_SIZE - 1,
        'x2': RESIZE_SIZE - 1,
        'y2': (RESIZE_SIZE * 2) / 3,
      },
      this.resizeGroup,
    );
  }

  /** Add the delete icon to the DOM */
  private addDeleteDom() {
    this.deleteGroup = dom.createSvgElement(
      Svg.G,
      {'class': 'blocklyCommentDeleteIcon'},
      this.svgGroup,
    );
    this.deleteIconBorder = dom.createSvgElement(
      Svg.CIRCLE,
      {'class': 'blocklyDeleteIconShape', 'r': '7', 'cx': '7.5', 'cy': '7.5'},
      this.deleteGroup,
    );
    // x icon.
    dom.createSvgElement(
      Svg.LINE,
      {
        'x1': '5',
        'y1': '10',
        'x2': '10',
        'y2': '5',
        'stroke': '#fff',
        'stroke-width': '2',
      },
      this.deleteGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'x1': '5',
        'y1': '5',
        'x2': '10',
        'y2': '10',
        'stroke': '#fff',
        'stroke-width': '2',
      },
      this.deleteGroup,
    );
  }

  /**
   * Handle a pointerdown on comment's resize corner.
   *
   * @param e Pointer down event.
   */
  private resizeMouseDown(e: PointerEvent) {
    this.unbindDragEvents();
    if (browserEvents.isRightButton(e)) {
      // No right-click.
      e.stopPropagation();
      return;
    }
    // Left-click (or middle click)
    this.workspace.startDrag(
      e,
      new Coordinate(
        this.workspace.RTL ? -this.width_ : this.width_,
        this.height_,
      ),
    );

    this.onMouseUpWrapper = browserEvents.conditionalBind(
      document,
      'pointerup',
      this,
      this.resizeMouseUp,
    );
    this.onMouseMoveWrapper = browserEvents.conditionalBind(
      document,
      'pointermove',
      this,
      this.resizeMouseMove,
    );
    this.workspace.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /**
   * Handle a pointerdown on comment's delete icon.
   *
   * @param e Pointer down event.
   */
  private deleteMouseDown(e: PointerEvent) {
    // Highlight the delete icon.
    if (this.deleteIconBorder) {
      dom.addClass(this.deleteIconBorder, 'blocklyDeleteIconHighlighted');
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /**
   * Handle a pointerout on comment's delete icon.
   *
   * @param _e Pointer out event.
   */
  private deleteMouseOut(_e: PointerEvent) {
    // Restore highlight on the delete icon.
    if (this.deleteIconBorder) {
      dom.removeClass(this.deleteIconBorder, 'blocklyDeleteIconHighlighted');
    }
  }

  /**
   * Handle a pointerup on comment's delete icon.
   *
   * @param e Pointer up event.
   */
  private deleteMouseUp(e: PointerEvent) {
    // Delete this comment.
    this.dispose();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /** Stop binding to the global pointerup and pointermove events. */
  private unbindDragEvents() {
    if (this.onMouseUpWrapper) {
      browserEvents.unbind(this.onMouseUpWrapper);
      this.onMouseUpWrapper = null;
    }
    if (this.onMouseMoveWrapper) {
      browserEvents.unbind(this.onMouseMoveWrapper);
      this.onMouseMoveWrapper = null;
    }
  }

  /**
   * Handle a pointerup event while dragging a comment's border or resize
   * handle.
   *
   * @param _e Pointer up event.
   */
  private resizeMouseUp(_e: PointerEvent) {
    Touch.clearTouchIdentifier();
    this.unbindDragEvents();
  }

  /**
   * Resize this comment to follow the pointer.
   *
   * @param e Pointer move event.
   */
  private resizeMouseMove(e: PointerEvent) {
    this.autoLayout = false;
    const newXY = this.workspace.moveDrag(e);
    this.setSize(this.RTL ? -newXY.x : newXY.x, newXY.y);
  }

  /**
   * Callback function triggered when the comment has resized.
   * Resize the text area accordingly.
   */
  private resizeComment() {
    const size = this.getHeightWidth();
    const topOffset = WorkspaceCommentSvg.TOP_OFFSET;
    const textOffset = TEXTAREA_OFFSET * 2;

    this.foreignObject?.setAttribute('width', String(size.width));
    this.foreignObject?.setAttribute('height', String(size.height - topOffset));
    if (this.RTL) {
      this.foreignObject?.setAttribute('x', String(-size.width));
    }

    if (!this.textarea) return;
    this.textarea.style.width = size.width - textOffset + 'px';
    this.textarea.style.height = size.height - textOffset - topOffset + 'px';
  }

  /**
   * Set size
   *
   * @param width width of the container
   * @param height height of the container
   */
  private setSize(width: number, height: number) {
    // Minimum size of a comment.
    width = Math.max(width, 45);
    height = Math.max(height, 20 + WorkspaceCommentSvg.TOP_OFFSET);
    this.width_ = width;
    this.height_ = height;
    this.svgRect_.setAttribute('width', `${width}`);
    this.svgRect_.setAttribute('height', `${height}`);
    this.svgRectTarget?.setAttribute('width', `${width}`);
    this.svgRectTarget?.setAttribute('height', `${height}`);
    this.svgHandleTarget?.setAttribute('width', `${width}`);
    this.svgHandleTarget?.setAttribute(
      'height',
      String(WorkspaceCommentSvg.TOP_OFFSET),
    );
    if (this.RTL) {
      this.svgRect_.setAttribute('transform', 'scale(-1 1)');
      this.svgRectTarget?.setAttribute('transform', 'scale(-1 1)');
    }

    if (this.resizeGroup) {
      if (this.RTL) {
        // Mirror the resize group.
        this.resizeGroup.setAttribute(
          'transform',
          'translate(' +
            (-width + RESIZE_SIZE) +
            ',' +
            (height - RESIZE_SIZE) +
            ') scale(-1 1)',
        );
        this.deleteGroup?.setAttribute(
          'transform',
          'translate(' +
            (-width + RESIZE_SIZE) +
            ',' +
            -RESIZE_SIZE +
            ') scale(-1 1)',
        );
      } else {
        this.resizeGroup.setAttribute(
          'transform',
          'translate(' +
            (width - RESIZE_SIZE) +
            ',' +
            (height - RESIZE_SIZE) +
            ')',
        );
        this.deleteGroup?.setAttribute(
          'transform',
          'translate(' + (width - RESIZE_SIZE) + ',' + -RESIZE_SIZE + ')',
        );
      }
    }

    // Allow the contents to resize.
    this.resizeComment();
  }

  /**
   * Set the focus on the text area.
   *
   * @internal
   */
  setFocus() {
    this.focused = true;
    // Defer CSS changes.
    setTimeout(() => {
      if (this.disposed_) {
        return;
      }
      this.textarea!.focus();
      this.addFocus();
      if (this.svgRectTarget) {
        dom.addClass(this.svgRectTarget, 'blocklyCommentTargetFocused');
      }
      if (this.svgHandleTarget) {
        dom.addClass(this.svgHandleTarget, 'blocklyCommentHandleTargetFocused');
      }
    }, 0);
  }

  /**
   * Remove focus from the text area.
   *
   * @internal
   */
  blurFocus() {
    this.focused = false;
    // Defer CSS changes.
    setTimeout(() => {
      if (this.disposed_) {
        return;
      }

      this.textarea!.blur();
      this.removeFocus();
      if (this.svgRectTarget) {
        dom.removeClass(this.svgRectTarget, 'blocklyCommentTargetFocused');
      }
      if (this.svgHandleTarget) {
        dom.removeClass(
          this.svgHandleTarget,
          'blocklyCommentHandleTargetFocused',
        );
      }
    }, 0);
  }

  /**
   * Decode an XML comment tag and create a rendered comment on the workspace.
   *
   * @param xmlComment XML comment element.
   * @param workspace The workspace.
   * @param opt_wsWidth The width of the workspace, which is used to position
   *     comments correctly in RTL.
   * @returns The created workspace comment.
   * @internal
   */
  static fromXmlRendered(
    xmlComment: Element,
    workspace: WorkspaceSvg,
    opt_wsWidth?: number,
  ): WorkspaceCommentSvg {
    eventUtils.disable();
    let comment;
    try {
      const info = WorkspaceComment.parseAttributes(xmlComment);

      comment = new WorkspaceCommentSvg(
        workspace,
        info.content,
        info.h,
        info.w,
        info.id,
      );
      if (workspace.rendered) {
        comment.initSvg(true);
        comment.render();
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
      eventUtils.enable();
    }

    WorkspaceComment.fireCreateEvent(comment);
    return comment;
  }
}

/** CSS for workspace comment.  See css.js for use. */
Css.register(`
.blocklyCommentForeignObject {
  position: relative;
  z-index: 0;
}

.blocklyCommentRect {
  fill: #E7DE8E;
  stroke: #bcA903;
  stroke-width: 1px;
}

.blocklyCommentTarget {
  fill: transparent;
  stroke: #bcA903;
}

.blocklyCommentTargetFocused {
  fill: none;
}

.blocklyCommentHandleTarget {
  fill: none;
}

.blocklyCommentHandleTargetFocused {
  fill: transparent;
}

.blocklyFocused>.blocklyCommentRect {
  fill: #B9B272;
  stroke: #B9B272;
}

.blocklySelected>.blocklyCommentTarget {
  stroke: #fc3;
  stroke-width: 3px;
}

.blocklyCommentDeleteIcon {
  cursor: pointer;
  fill: #000;
  display: none;
}

.blocklySelected > .blocklyCommentDeleteIcon {
  display: block;
}

.blocklyDeleteIconShape {
  fill: #000;
  stroke: #000;
  stroke-width: 1px;
}

.blocklyDeleteIconShape.blocklyDeleteIconHighlighted {
  stroke: #fc3;
}
`);
