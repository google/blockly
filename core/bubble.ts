/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a UI bubble.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Bubble');

import type {BlockDragSurfaceSvg} from './block_drag_surface.js';
import type {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import type {IBubble} from './interfaces/i_bubble.js';
import type {ContainerRegion} from './metrics_manager.js';
import {Scrollbar} from './scrollbar.js';
import * as Touch from './touch.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import * as math from './utils/math.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for UI bubble.
 */
export class Bubble implements IBubble {
  /** Width of the border around the bubble. */
  static BORDER_WIDTH = 6;

  /**
   * Determines the thickness of the base of the arrow in relation to the size
   * of the bubble.  Higher numbers result in thinner arrows.
   */
  static ARROW_THICKNESS = 5;

  /** The number of degrees that the arrow bends counter-clockwise. */
  static ARROW_ANGLE = 20;

  /**
   * The sharpness of the arrow's bend.  Higher numbers result in smoother
   * arrows.
   */
  static ARROW_BEND = 4;

  /** Distance between arrow point and anchor point. */
  static ANCHOR_RADIUS = 8;

  /** Mouse up event data. */
  private static onMouseUpWrapper: browserEvents.Data|null = null;

  /** Mouse move event data. */
  private static onMouseMoveWrapper: browserEvents.Data|null = null;

  workspace_: WorkspaceSvg;
  content_: SVGElement;
  shape_: SVGElement;

  /** Flag to stop incremental rendering during construction. */
  private readonly rendered: boolean;

  /** The SVG group containing all parts of the bubble. */
  private bubbleGroup: SVGGElement|null = null;

  /**
   * The SVG path for the arrow from the bubble to the icon on the block.
   */
  private bubbleArrow: SVGPathElement|null = null;

  /** The SVG rect for the main body of the bubble. */
  private bubbleBack: SVGRectElement|null = null;

  /** The SVG group for the resize hash marks on some bubbles. */
  private resizeGroup: SVGGElement|null = null;

  /** Absolute coordinate of anchor point, in workspace coordinates. */
  private anchorXY!: Coordinate;

  /**
   * Relative X coordinate of bubble with respect to the anchor's centre,
   * in workspace units.
   * In RTL mode the initial value is negated.
   */
  private relativeLeft = 0;

  /**
   * Relative Y coordinate of bubble with respect to the anchor's centre, in
   * workspace units.
   */
  private relativeTop = 0;

  /** Width of bubble, in workspace units. */
  private width = 0;

  /** Height of bubble, in workspace units. */
  private height = 0;

  /** Automatically position and reposition the bubble. */
  private autoLayout = true;

  /** Method to call on resize of bubble. */
  private resizeCallback: (() => void)|null = null;

  /** Method to call on move of bubble. */
  private moveCallback: (() => void)|null = null;

  /** Mouse down on bubbleBack event data. */
  private onMouseDownBubbleWrapper: browserEvents.Data|null = null;

  /** Mouse down on resizeGroup event data. */
  private onMouseDownResizeWrapper: browserEvents.Data|null = null;

  /**
   * Describes whether this bubble has been disposed of (nodes and event
   * listeners removed from the page) or not.
   *
   * @internal
   */
  disposed = false;
  private arrowRadians: number;

  /**
   * @param workspace The workspace on which to draw the bubble.
   * @param content SVG content for the bubble.
   * @param shape SVG element to avoid eclipsing.
   * @param anchorXY Absolute position of bubble's anchor point.
   * @param bubbleWidth Width of bubble, or null if not resizable.
   * @param bubbleHeight Height of bubble, or null if not resizable.
   */
  constructor(
      workspace: WorkspaceSvg, content: SVGElement, shape: SVGElement,
      anchorXY: Coordinate, bubbleWidth: number|null,
      bubbleHeight: number|null) {
    this.rendered = false;
    this.workspace_ = workspace;
    this.content_ = content;
    this.shape_ = shape;

    let angle = Bubble.ARROW_ANGLE;
    if (this.workspace_.RTL) {
      angle = -angle;
    }
    this.arrowRadians = math.toRadians(angle);

    const canvas = workspace.getBubbleCanvas();
    canvas.appendChild(
        this.createDom(content, !!(bubbleWidth && bubbleHeight)));

    this.setAnchorLocation(anchorXY);
    if (!bubbleWidth || !bubbleHeight) {
      const bBox = (this.content_ as SVGGraphicsElement).getBBox();
      bubbleWidth = bBox.width + 2 * Bubble.BORDER_WIDTH;
      bubbleHeight = bBox.height + 2 * Bubble.BORDER_WIDTH;
    }
    this.setBubbleSize(bubbleWidth, bubbleHeight);

    // Render the bubble.
    this.positionBubble();
    this.renderArrow();
    this.rendered = true;
  }

  /**
   * Create the bubble's DOM.
   *
   * @param content SVG content for the bubble.
   * @param hasResize Add diagonal resize gripper if true.
   * @returns The bubble's SVG group.
   */
  private createDom(content: Element, hasResize: boolean): SVGElement {
    /* Create the bubble.  Here's the markup that will be generated:
        <g>
          <g filter="url(#blocklyEmbossFilter837493)">
            <path d="... Z" />
            <rect class="blocklyDraggable" rx="8" ry="8" width="180"
       height="180"/>
          </g>
          <g transform="translate(165, 165)" class="blocklyResizeSE">
            <polygon points="0,15 15,15 15,0"/>
            <line class="blocklyResizeLine" x1="5" y1="14" x2="14" y2="5"/>
            <line class="blocklyResizeLine" x1="10" y1="14" x2="14" y2="10"/>
          </g>
          [...content goes here...]
        </g>
        */
    this.bubbleGroup = dom.createSvgElement(Svg.G, {});
    let filter: {filter?: string} = {
      'filter': 'url(#' +
          this.workspace_.getRenderer().getConstants().embossFilterId + ')',
    };
    if (userAgent.JavaFx) {
      // Multiple reports that JavaFX can't handle filters.
      // https://github.com/google/blockly/issues/99
      filter = {};
    }
    const bubbleEmboss = dom.createSvgElement(Svg.G, filter, this.bubbleGroup);
    this.bubbleArrow = dom.createSvgElement(Svg.PATH, {}, bubbleEmboss);
    this.bubbleBack = dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyDraggable',
          'x': 0,
          'y': 0,
          'rx': Bubble.BORDER_WIDTH,
          'ry': Bubble.BORDER_WIDTH,
        },
        bubbleEmboss);
    if (hasResize) {
      this.resizeGroup = dom.createSvgElement(
          Svg.G, {
            'class': this.workspace_.RTL ? 'blocklyResizeSW' :
                                           'blocklyResizeSE',
          },
          this.bubbleGroup);
      const size = 2 * Bubble.BORDER_WIDTH;
      dom.createSvgElement(
          Svg.POLYGON, {'points': `0,${size} ${size},${size} ${size},0`},
          this.resizeGroup);
      dom.createSvgElement(
          Svg.LINE, {
            'class': 'blocklyResizeLine',
            'x1': size / 3,
            'y1': size - 1,
            'x2': size - 1,
            'y2': size / 3,
          },
          this.resizeGroup);
      dom.createSvgElement(
          Svg.LINE, {
            'class': 'blocklyResizeLine',
            'x1': size * 2 / 3,
            'y1': size - 1,
            'x2': size - 1,
            'y2': size * 2 / 3,
          },
          this.resizeGroup);
    } else {
      this.resizeGroup = null;
    }

    if (!this.workspace_.options.readOnly) {
      this.onMouseDownBubbleWrapper = browserEvents.conditionalBind(
          this.bubbleBack, 'pointerdown', this, this.bubbleMouseDown);
      if (this.resizeGroup) {
        this.onMouseDownResizeWrapper = browserEvents.conditionalBind(
            this.resizeGroup, 'pointerdown', this, this.resizeMouseDown);
      }
    }
    this.bubbleGroup.appendChild(content);
    return this.bubbleGroup;
  }

  /**
   * Return the root node of the bubble's SVG group.
   *
   * @returns The root SVG node of the bubble's group.
   */
  getSvgRoot(): SVGElement {
    return this.bubbleGroup as SVGElement;
  }

  /**
   * Expose the block's ID on the bubble's top-level SVG group.
   *
   * @param id ID of block.
   */
  setSvgId(id: string) {
    this.bubbleGroup?.setAttribute('data-block-id', id);
  }

  /**
   * Handle a pointerdown on bubble's border.
   *
   * @param e Pointer down event.
   */
  private bubbleMouseDown(e: PointerEvent) {
    const gesture = this.workspace_.getGesture(e);
    if (gesture) {
      gesture.handleBubbleStart(e, this);
    }
  }

  /**
   * Show the context menu for this bubble.
   *
   * @param _e Mouse event.
   * @internal
   */
  showContextMenu(_e: Event) {}
  // NOP on bubbles, but used by the bubble dragger to pass events to
  // workspace comments.

  /**
   * Get whether this bubble is deletable or not.
   *
   * @returns True if deletable.
   * @internal
   */
  isDeletable(): boolean {
    return false;
  }

  /**
   * Update the style of this bubble when it is dragged over a delete area.
   *
   * @param _enable True if the bubble is about to be deleted, false otherwise.
   */
  setDeleteStyle(_enable: boolean) {}
  // NOP if bubble is not deletable.

  /**
   * Handle a pointerdown on bubble's resize corner.
   *
   * @param e Pointer down event.
   */
  private resizeMouseDown(e: PointerEvent) {
    this.promote();
    Bubble.unbindDragEvents();
    if (browserEvents.isRightButton(e)) {
      // No right-click.
      e.stopPropagation();
      return;
    }
    // Left-click (or middle click)
    this.workspace_.startDrag(
        e,
        new Coordinate(
            this.workspace_.RTL ? -this.width : this.width, this.height));

    Bubble.onMouseUpWrapper = browserEvents.conditionalBind(
        document, 'pointerup', this, Bubble.bubbleMouseUp);
    Bubble.onMouseMoveWrapper = browserEvents.conditionalBind(
        document, 'pointermove', this, this.resizeMouseMove);
    this.workspace_.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /**
   * Resize this bubble to follow the pointer.
   *
   * @param e Pointer move event.
   */
  private resizeMouseMove(e: PointerEvent) {
    this.autoLayout = false;
    const newXY = this.workspace_.moveDrag(e);
    this.setBubbleSize(this.workspace_.RTL ? -newXY.x : newXY.x, newXY.y);
    if (this.workspace_.RTL) {
      // RTL requires the bubble to move its left edge.
      this.positionBubble();
    }
  }

  /**
   * Register a function as a callback event for when the bubble is resized.
   *
   * @param callback The function to call on resize.
   */
  registerResizeEvent(callback: () => void) {
    this.resizeCallback = callback;
  }

  /**
   * Register a function as a callback event for when the bubble is moved.
   *
   * @param callback The function to call on move.
   */
  registerMoveEvent(callback: () => void) {
    this.moveCallback = callback;
  }

  /**
   * Move this bubble to the top of the stack.
   *
   * @returns Whether or not the bubble has been moved.
   * @internal
   */
  promote(): boolean {
    const svgGroup = this.bubbleGroup?.parentNode;
    if (svgGroup?.lastChild !== this.bubbleGroup && this.bubbleGroup) {
      svgGroup?.appendChild(this.bubbleGroup);
      return true;
    }
    return false;
  }

  /**
   * Notification that the anchor has moved.
   * Update the arrow and bubble accordingly.
   *
   * @param xy Absolute location.
   */
  setAnchorLocation(xy: Coordinate) {
    this.anchorXY = xy;
    if (this.rendered) {
      this.positionBubble();
    }
  }

  /** Position the bubble so that it does not fall off-screen. */
  private layoutBubble() {
    // Get the metrics in workspace units.
    const viewMetrics =
        this.workspace_.getMetricsManager().getViewMetrics(true);

    const optimalLeft = this.getOptimalRelativeLeft(viewMetrics);
    const optimalTop = this.getOptimalRelativeTop(viewMetrics);
    const bbox = (this.shape_ as SVGGraphicsElement).getBBox();

    const topPosition = {
      x: optimalLeft,
      y: -this.height -
              this.workspace_.getRenderer().getConstants().MIN_BLOCK_HEIGHT as
          number,
    };
    const startPosition = {x: -this.width - 30, y: optimalTop};
    const endPosition = {x: bbox.width, y: optimalTop};
    const bottomPosition = {x: optimalLeft, y: bbox.height};

    const closerPosition =
        bbox.width < bbox.height ? endPosition : bottomPosition;
    const fartherPosition =
        bbox.width < bbox.height ? bottomPosition : endPosition;

    const topPositionOverlap = this.getOverlap(topPosition, viewMetrics);
    const startPositionOverlap = this.getOverlap(startPosition, viewMetrics);
    const closerPositionOverlap = this.getOverlap(closerPosition, viewMetrics);
    const fartherPositionOverlap =
        this.getOverlap(fartherPosition, viewMetrics);

    // Set the position to whichever position shows the most of the bubble,
    // with tiebreaks going in the order: top > start > close > far.
    const mostOverlap = Math.max(
        topPositionOverlap, startPositionOverlap, closerPositionOverlap,
        fartherPositionOverlap);
    if (topPositionOverlap === mostOverlap) {
      this.relativeLeft = topPosition.x;
      this.relativeTop = topPosition.y;
      return;
    }
    if (startPositionOverlap === mostOverlap) {
      this.relativeLeft = startPosition.x;
      this.relativeTop = startPosition.y;
      return;
    }
    if (closerPositionOverlap === mostOverlap) {
      this.relativeLeft = closerPosition.x;
      this.relativeTop = closerPosition.y;
      return;
    }
    // TODO: I believe relativeLeft_ should actually be called relativeStart_
    //  and then the math should be fixed to reflect this. (hopefully it'll
    //  make it look simpler)
    this.relativeLeft = fartherPosition.x;
    this.relativeTop = fartherPosition.y;
  }

  /**
   * Calculate the what percentage of the bubble overlaps with the visible
   * workspace (what percentage of the bubble is visible).
   *
   * @param relativeMin The position of the top-left corner of the bubble
   *     relative to the anchor point.
   * @param viewMetrics The view metrics of the workspace the bubble will appear
   *     in.
   * @returns The percentage of the bubble that is visible.
   */
  private getOverlap(
      relativeMin: {x: number, y: number},
      viewMetrics: ContainerRegion): number {
    // The position of the top-left corner of the bubble in workspace units.
    const bubbleMin = {
      x: this.workspace_.RTL ? this.anchorXY.x - relativeMin.x - this.width :
                               relativeMin.x + this.anchorXY.x,
      y: relativeMin.y + this.anchorXY.y,
    };
    // The position of the bottom-right corner of the bubble in workspace units.
    const bubbleMax = {
      x: bubbleMin.x + this.width,
      y: bubbleMin.y + this.height,
    };

    // We could adjust these values to account for the scrollbars, but the
    // bubbles should have been adjusted to not collide with them anyway, so
    // giving the workspace a slightly larger "bounding box" shouldn't affect
    // the calculation.

    // The position of the top-left corner of the workspace.
    const workspaceMin = {x: viewMetrics.left, y: viewMetrics.top};
    // The position of the bottom-right corner of the workspace.
    const workspaceMax = {
      x: viewMetrics.left + viewMetrics.width,
      y: viewMetrics.top + viewMetrics.height,
    };

    const overlapWidth = Math.min(bubbleMax.x, workspaceMax.x) -
        Math.max(bubbleMin.x, workspaceMin.x);
    const overlapHeight = Math.min(bubbleMax.y, workspaceMax.y) -
        Math.max(bubbleMin.y, workspaceMin.y);
    return Math.max(
        0,
        Math.min(1, overlapWidth * overlapHeight / (this.width * this.height)));
  }

  /**
   * Calculate what the optimal horizontal position of the top-left corner of
   * the bubble is (relative to the anchor point) so that the most area of the
   * bubble is shown.
   *
   * @param viewMetrics The view metrics of the workspace the bubble will appear
   *     in.
   * @returns The optimal horizontal position of the top-left corner of the
   *     bubble.
   */
  private getOptimalRelativeLeft(viewMetrics: ContainerRegion): number {
    let relativeLeft = -this.width / 4;

    // No amount of sliding left or right will give us a better overlap.
    if (this.width > viewMetrics.width) {
      return relativeLeft;
    }

    if (this.workspace_.RTL) {
      // Bubble coordinates are flipped in RTL.
      const bubbleRight = this.anchorXY.x - relativeLeft;
      const bubbleLeft = bubbleRight - this.width;

      const workspaceRight = viewMetrics.left + viewMetrics.width;
      const workspaceLeft = viewMetrics.left +
          // Thickness in workspace units.
          Scrollbar.scrollbarThickness / this.workspace_.scale;

      if (bubbleLeft < workspaceLeft) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = -(workspaceLeft - this.anchorXY.x + this.width);
      } else if (bubbleRight > workspaceRight) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = -(workspaceRight - this.anchorXY.x);
      }
    } else {
      const bubbleLeft = relativeLeft + this.anchorXY.x;
      const bubbleRight = bubbleLeft + this.width;

      const workspaceLeft = viewMetrics.left;
      const workspaceRight = viewMetrics.left + viewMetrics.width -
          // Thickness in workspace units.
          Scrollbar.scrollbarThickness / this.workspace_.scale;

      if (bubbleLeft < workspaceLeft) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = workspaceLeft - this.anchorXY.x;
      } else if (bubbleRight > workspaceRight) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = workspaceRight - this.anchorXY.x - this.width;
      }
    }

    return relativeLeft;
  }

  /**
   * Calculate what the optimal vertical position of the top-left corner of
   * the bubble is (relative to the anchor point) so that the most area of the
   * bubble is shown.
   *
   * @param viewMetrics The view metrics of the workspace the bubble will appear
   *     in.
   * @returns The optimal vertical position of the top-left corner of the
   *     bubble.
   */
  private getOptimalRelativeTop(viewMetrics: ContainerRegion): number {
    let relativeTop = -this.height / 4;

    // No amount of sliding up or down will give us a better overlap.
    if (this.height > viewMetrics.height) {
      return relativeTop;
    }

    const bubbleTop = this.anchorXY.y + relativeTop;
    const bubbleBottom = bubbleTop + this.height;
    const workspaceTop = viewMetrics.top;
    const workspaceBottom = viewMetrics.top +
        viewMetrics.height -  // Thickness in workspace units.
        Scrollbar.scrollbarThickness / this.workspace_.scale;

    const anchorY = this.anchorXY.y;
    if (bubbleTop < workspaceTop) {
      // Slide the bubble down until it is onscreen.
      relativeTop = workspaceTop - anchorY;
    } else if (bubbleBottom > workspaceBottom) {
      // Slide the bubble up until it is onscreen.
      relativeTop = workspaceBottom - anchorY - this.height;
    }

    return relativeTop;
  }

  /** Move the bubble to a location relative to the anchor's centre. */
  private positionBubble() {
    let left = this.anchorXY.x;
    if (this.workspace_.RTL) {
      left -= this.relativeLeft + this.width;
    } else {
      left += this.relativeLeft;
    }
    const top = this.relativeTop + this.anchorXY.y;
    this.moveTo(left, top);
  }

  /**
   * Move the bubble group to the specified location in workspace coordinates.
   *
   * @param x The x position to move to.
   * @param y The y position to move to.
   * @internal
   */
  moveTo(x: number, y: number) {
    this.bubbleGroup?.setAttribute(
        'transform', 'translate(' + x + ',' + y + ')');
  }

  /**
   * Triggers a move callback if one exists at the end of a drag.
   *
   * @param adding True if adding, false if removing.
   * @internal
   */
  setDragging(adding: boolean) {
    if (!adding && this.moveCallback) {
      this.moveCallback();
    }
  }

  /**
   * Get the dimensions of this bubble.
   *
   * @returns The height and width of the bubble.
   */
  getBubbleSize(): Size {
    return new Size(this.width, this.height);
  }

  /**
   * Size this bubble.
   *
   * @param width Width of the bubble.
   * @param height Height of the bubble.
   */
  setBubbleSize(width: number, height: number) {
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    // Minimum size of a bubble.
    width = Math.max(width, doubleBorderWidth + 45);
    height = Math.max(height, doubleBorderWidth + 20);
    this.width = width;
    this.height = height;
    this.bubbleBack?.setAttribute('width', `${width}`);
    this.bubbleBack?.setAttribute('height', `${height}`);
    if (this.resizeGroup) {
      if (this.workspace_.RTL) {
        // Mirror the resize group.
        const resizeSize = 2 * Bubble.BORDER_WIDTH;
        this.resizeGroup.setAttribute(
            'transform',
            'translate(' + resizeSize + ',' + (height - doubleBorderWidth) +
                ') scale(-1 1)');
      } else {
        this.resizeGroup.setAttribute(
            'transform',
            'translate(' + (width - doubleBorderWidth) + ',' +
                (height - doubleBorderWidth) + ')');
      }
    }
    if (this.autoLayout) {
      this.layoutBubble();
    }
    this.positionBubble();
    this.renderArrow();

    // Allow the contents to resize.
    if (this.resizeCallback) {
      this.resizeCallback();
    }
  }

  /** Draw the arrow between the bubble and the origin. */
  private renderArrow() {
    const steps = [];
    // Find the relative coordinates of the center of the bubble.
    const relBubbleX = this.width / 2;
    const relBubbleY = this.height / 2;
    // Find the relative coordinates of the center of the anchor.
    let relAnchorX = -this.relativeLeft;
    let relAnchorY = -this.relativeTop;
    if (relBubbleX === relAnchorX && relBubbleY === relAnchorY) {
      // Null case.  Bubble is directly on top of the anchor.
      // Short circuit this rather than wade through divide by zeros.
      steps.push('M ' + relBubbleX + ',' + relBubbleY);
    } else {
      // Compute the angle of the arrow's line.
      const rise = relAnchorY - relBubbleY;
      let run = relAnchorX - relBubbleX;
      if (this.workspace_.RTL) {
        run *= -1;
      }
      const hypotenuse = Math.sqrt(rise * rise + run * run);
      let angle = Math.acos(run / hypotenuse);
      if (rise < 0) {
        angle = 2 * Math.PI - angle;
      }
      // Compute a line perpendicular to the arrow.
      let rightAngle = angle + Math.PI / 2;
      if (rightAngle > Math.PI * 2) {
        rightAngle -= Math.PI * 2;
      }
      const rightRise = Math.sin(rightAngle);
      const rightRun = Math.cos(rightAngle);

      // Calculate the thickness of the base of the arrow.
      const bubbleSize = this.getBubbleSize();
      let thickness =
          (bubbleSize.width + bubbleSize.height) / Bubble.ARROW_THICKNESS;
      thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 4;

      // Back the tip of the arrow off of the anchor.
      const backoffRatio = 1 - Bubble.ANCHOR_RADIUS / hypotenuse;
      relAnchorX = relBubbleX + backoffRatio * run;
      relAnchorY = relBubbleY + backoffRatio * rise;

      // Coordinates for the base of the arrow.
      const baseX1 = relBubbleX + thickness * rightRun;
      const baseY1 = relBubbleY + thickness * rightRise;
      const baseX2 = relBubbleX - thickness * rightRun;
      const baseY2 = relBubbleY - thickness * rightRise;

      // Distortion to curve the arrow.
      let swirlAngle = angle + this.arrowRadians;
      if (swirlAngle > Math.PI * 2) {
        swirlAngle -= Math.PI * 2;
      }
      const swirlRise = Math.sin(swirlAngle) * hypotenuse / Bubble.ARROW_BEND;
      const swirlRun = Math.cos(swirlAngle) * hypotenuse / Bubble.ARROW_BEND;

      steps.push('M' + baseX1 + ',' + baseY1);
      steps.push(
          'C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) + ' ' +
          relAnchorX + ',' + relAnchorY + ' ' + relAnchorX + ',' + relAnchorY);
      steps.push(
          'C' + relAnchorX + ',' + relAnchorY + ' ' + (baseX2 + swirlRun) +
          ',' + (baseY2 + swirlRise) + ' ' + baseX2 + ',' + baseY2);
    }
    steps.push('z');
    this.bubbleArrow?.setAttribute('d', steps.join(' '));
  }

  /**
   * Change the colour of a bubble.
   *
   * @param hexColour Hex code of colour.
   */
  setColour(hexColour: string) {
    this.bubbleBack?.setAttribute('fill', hexColour);
    this.bubbleArrow?.setAttribute('fill', hexColour);
  }

  /** Dispose of this bubble. */
  dispose() {
    if (this.onMouseDownBubbleWrapper) {
      browserEvents.unbind(this.onMouseDownBubbleWrapper);
    }
    if (this.onMouseDownResizeWrapper) {
      browserEvents.unbind(this.onMouseDownResizeWrapper);
    }
    Bubble.unbindDragEvents();
    dom.removeNode(this.bubbleGroup);
    this.disposed = true;
  }

  /**
   * Move this bubble during a drag, taking into account whether or not there is
   * a drag surface.
   *
   * @param dragSurface The surface that carries rendered items during a drag,
   *     or null if no drag surface is in use.
   * @param newLoc The location to translate to, in workspace coordinates.
   * @internal
   */
  moveDuringDrag(dragSurface: BlockDragSurfaceSvg, newLoc: Coordinate) {
    if (dragSurface) {
      dragSurface.translateSurface(newLoc.x, newLoc.y);
    } else {
      this.moveTo(newLoc.x, newLoc.y);
    }
    if (this.workspace_.RTL) {
      this.relativeLeft = this.anchorXY.x - newLoc.x - this.width;
    } else {
      this.relativeLeft = newLoc.x - this.anchorXY.x;
    }
    this.relativeTop = newLoc.y - this.anchorXY.y;
    this.renderArrow();
  }

  /**
   * Return the coordinates of the top-left corner of this bubble's body
   * relative to the drawing surface's origin (0,0), in workspace units.
   *
   * @returns Object with .x and .y properties.
   */
  getRelativeToSurfaceXY(): Coordinate {
    return new Coordinate(
        this.workspace_.RTL ?
            -this.relativeLeft + this.anchorXY.x - this.width :
            this.anchorXY.x + this.relativeLeft,
        this.anchorXY.y + this.relativeTop);
  }

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   *
   * @param enable True if auto-layout should be enabled, false otherwise.
   * @internal
   */
  setAutoLayout(enable: boolean) {
    this.autoLayout = enable;
  }

  /** Stop binding to the global mouseup and mousemove events. */
  private static unbindDragEvents() {
    if (Bubble.onMouseUpWrapper) {
      browserEvents.unbind(Bubble.onMouseUpWrapper);
      Bubble.onMouseUpWrapper = null;
    }
    if (Bubble.onMouseMoveWrapper) {
      browserEvents.unbind(Bubble.onMouseMoveWrapper);
      Bubble.onMouseMoveWrapper = null;
    }
  }

  /**
   * Handle a pointerup event while dragging a bubble's border or resize handle.
   *
   * @param _e Pointer up event.
   */
  private static bubbleMouseUp(_e: PointerEvent) {
    Touch.clearTouchIdentifier();
    Bubble.unbindDragEvents();
  }

  /**
   * Create the text for a non editable bubble.
   *
   * @param text The text to display.
   * @returns The top-level node of the text.
   * @internal
   */
  static textToDom(text: string): SVGTextElement {
    const paragraph = dom.createSvgElement(Svg.TEXT, {
      'class': 'blocklyText blocklyBubbleText blocklyNoPointerEvents',
      'y': Bubble.BORDER_WIDTH,
    });
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const tspanElement = dom.createSvgElement(
          Svg.TSPAN, {'dy': '1em', 'x': Bubble.BORDER_WIDTH}, paragraph);
      const textNode = document.createTextNode(lines[i]);
      tspanElement.appendChild(textNode);
    }
    return paragraph;
  }

  /**
   * Creates a bubble that can not be edited.
   *
   * @param paragraphElement The text element for the non editable bubble.
   * @param block The block that the bubble is attached to.
   * @param iconXY The coordinate of the icon.
   * @returns The non editable bubble.
   * @internal
   */
  static createNonEditableBubble(
      paragraphElement: SVGTextElement, block: BlockSvg,
      iconXY: Coordinate): Bubble {
    const bubble = new Bubble(
        block.workspace!, paragraphElement, block.pathObject.svgPath, (iconXY),
        null, null);
    // Expose this bubble's block's ID on its top-level SVG group.
    bubble.setSvgId(block.id);
    if (block.RTL) {
      // Right-align the paragraph.
      // This cannot be done until the bubble is rendered on screen.
      const maxWidth = paragraphElement.getBBox().width;
      for (let i = 0, textElement;
           textElement = paragraphElement.childNodes[i] as SVGTSpanElement;
           i++) {
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('x', String(maxWidth + Bubble.BORDER_WIDTH));
      }
    }
    return bubble;
  }
}
