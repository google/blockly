/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockDragSurfaceSvg} from '../block_drag_surface.js';
import * as browserEvents from '../browser_events.js';
import {IBubble} from '../interfaces/i_bubble.js';
import {ContainerRegion} from '../metrics_manager.js';
import {Scrollbar} from '../scrollbar.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import * as math from '../utils/math.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import * as userAgent from '../utils/useragent.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class Bubble implements IBubble {
  static BORDER_WIDTH = 6;
  static MIN_SIZE = this.BORDER_WIDTH * 2;
  static TAIL_THICKNESS = 5;
  static TAIL_ANGLE = 20;
  static TAIL_BEND = 4;
  static ANCHOR_RADIUS = 8;

  private svgRoot: SVGGElement;
  private tail: SVGPathElement;
  private background: SVGRectElement;
  protected contentContainer: SVGGElement;

  private size = new Size(0, 0);
  private colour = '#ffffff';
  private visible = false;
  public disposed = false;

  private relativeTop = 0;
  private relativeLeft = 0;

  constructor(
    private readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect: Rect
  ) {
    this.svgRoot = dom.createSvgElement(Svg.G, {}, workspace.getBubbleCanvas());
    const embossGroup = dom.createSvgElement(
      Svg.G,
      this.getFilter(),
      this.svgRoot
    );
    this.tail = dom.createSvgElement(Svg.PATH, {}, embossGroup);
    this.background = dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyDraggable',
        'x': 0,
        'y': 0,
        'rx': Bubble.BORDER_WIDTH,
        'ry': Bubble.BORDER_WIDTH,
      },
      embossGroup
    );
    this.contentContainer = dom.createSvgElement(Svg.G, {}, this.svgRoot);

    browserEvents.conditionalBind(
      this.background,
      'pointerDown',
      this,
      this.onMouseDown
    );
  }

  dispose() {
    dom.removeNode(this.svgRoot);
    this.disposed = true;
  }

  setAnchorLocation(anchor: Coordinate, relayout: boolean) {
    this.anchor = anchor;
    if (relayout) {
      this.positionByRect(this.ownerRect);
    } else {
      this.positionRelativeToAnchor();
    }
  }

  public setPositionRelativeToAnchor(left: number, top: number) {
    this.relativeLeft = left;
    this.relativeTop = top;
    this.positionRelativeToAnchor();
  }

  protected getSize() {
    return this.size;
  }

  protected setSize(size: Size, relayout: boolean) {
    // TODO: set size.
    size.width = Math.max(size.width, Bubble.MIN_SIZE);
    size.height = Math.max(size.height, Bubble.MIN_SIZE);
    this.size = size;

    this.background.setAttribute('width', `${size.width}`);
    this.background.setAttribute('height', `${size.height}`);

    if (relayout) {
      this.positionByRect(this.ownerRect);
    } else {
      this.positionRelativeToAnchor();
    }
    this.renderTail();
  }

  protected getColour(): string {
    return this.colour;
  }

  protected setColour(colour: string) {
    this.colour = colour;
    this.tail.setAttribute('fill', colour);
    this.background.setAttribute('fill', colour);
  }

  private getFilter(): {filter?: string} {
    // TODO: Do we think this is actually still a problem??
    if (userAgent.JavaFx) return {};
    return {
      'filter': `url(#${
        this.workspace.getRenderer().getConstants().embossFilterId
      })`,
    };
  }

  private onMouseDown(e: PointerEvent) {
    this.workspace.getGesture(e)?.handleBubbleStart(e, this);
  }

  protected positionRelativeToAnchor() {
    let left = this.anchor.x;
    if (this.workspace.RTL) {
      left -= this.relativeLeft + this.size.width;
    } else {
      left += this.relativeLeft;
    }
    const top = this.relativeTop + this.anchor.y;
    this.moveTo(left, top);
  }

  /** @internal */
  moveTo(x: number, y: number) {
    this.svgRoot.setAttribute('transform', `translate(${x}, ${y})`);
  }

  protected positionByRect(rect: Rect) {
    const viewMetrics = this.workspace.getMetricsManager().getViewMetrics(true);

    const optimalLeft = this.getOptimalRelativeLeft(viewMetrics);
    const optimalTop = this.getOptimalRelativeTop(viewMetrics);

    const topPosition = {
      x: optimalLeft,
      y: (-this.size.height -
        this.workspace.getRenderer().getConstants().MIN_BLOCK_HEIGHT) as number,
    };
    const startPosition = {x: -this.size.width - 30, y: optimalTop};
    const endPosition = {x: rect.width, y: optimalTop};
    const bottomPosition = {x: optimalLeft, y: rect.height};

    const closerPosition =
      rect.width < rect.height ? endPosition : bottomPosition;
    const fartherPosition =
      rect.width < rect.height ? bottomPosition : endPosition;

    const topPositionOverlap = this.getOverlap(topPosition, viewMetrics);
    const startPositionOverlap = this.getOverlap(startPosition, viewMetrics);
    const closerPositionOverlap = this.getOverlap(closerPosition, viewMetrics);
    const fartherPositionOverlap = this.getOverlap(
      fartherPosition,
      viewMetrics
    );

    // Set the position to whichever position shows the most of the bubble,
    // with tiebreaks going in the order: top > start > close > far.
    const mostOverlap = Math.max(
      topPositionOverlap,
      startPositionOverlap,
      closerPositionOverlap,
      fartherPositionOverlap
    );
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
    this.positionRelativeToAnchor();
  }

  private getOverlap(
    relativeMin: {x: number; y: number},
    viewMetrics: ContainerRegion
  ): number {
    // The position of the top-left corner of the bubble in workspace units.
    const bubbleMin = {
      x: this.workspace.RTL
        ? this.anchor.x - relativeMin.x - this.size.width
        : relativeMin.x + this.anchor.x,
      y: relativeMin.y + this.anchor.y,
    };
    // The position of the bottom-right corner of the bubble in workspace units.
    const bubbleMax = {
      x: bubbleMin.x + this.size.width,
      y: bubbleMin.y + this.size.height,
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

    const overlapWidth =
      Math.min(bubbleMax.x, workspaceMax.x) -
      Math.max(bubbleMin.x, workspaceMin.x);
    const overlapHeight =
      Math.min(bubbleMax.y, workspaceMax.y) -
      Math.max(bubbleMin.y, workspaceMin.y);
    return Math.max(
      0,
      Math.min(
        1,
        (overlapWidth * overlapHeight) / (this.size.width * this.size.height)
      )
    );
  }

  private getOptimalRelativeLeft(viewMetrics: ContainerRegion): number {
    // By default, show the bubble just a bit to the left of the anchor.
    let relativeLeft = -this.size.width / 4;

    // No amount of sliding left or right will give us better overlap.
    if (this.size.width > viewMetrics.width) return relativeLeft;

    const workspaceRect = this.getWorkspaceViewRect(viewMetrics);

    if (this.workspace.RTL) {
      // Bubble coordinates are flipped in RTL.
      const bubbleRight = this.anchor.x - relativeLeft;
      const bubbleLeft = bubbleRight - this.size.width;

      if (bubbleLeft < workspaceRect.left) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = -(workspaceRect.left - this.anchor.x + this.size.width);
      } else if (bubbleRight > workspaceRect.right) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = -(workspaceRect.right - this.anchor.x);
      }
    } else {
      const bubbleLeft = relativeLeft + this.anchor.x;
      const bubbleRight = bubbleLeft + this.size.width;

      if (bubbleLeft < workspaceRect.left) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = workspaceRect.left - this.anchor.x;
      } else if (bubbleRight > workspaceRect.right) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = workspaceRect.right - this.anchor.x - this.size.width;
      }
    }

    return relativeLeft;
  }

  private getOptimalRelativeTop(viewMetrics: ContainerRegion): number {
    // By default, show the bubble just a bit higher than the anchor.
    let relativeTop = -this.size.height / 4;

    // No amount of sliding up or down will give us better overlap.
    if (this.size.height > viewMetrics.height) return relativeTop;

    const top = this.anchor.y + relativeTop;
    const bottom = top + this.size.height;
    const workspaceRect = this.getWorkspaceViewRect(viewMetrics);

    if (top < workspaceRect.top) {
      // Slide the bubble down until it is onscreen.
      relativeTop = workspaceRect.top - this.anchor.y;
    } else if (bottom > workspaceRect.bottom) {
      // Slide the bubble up until it is onscreen.
      relativeTop = workspaceRect.bottom - this.anchor.y - this.size.height;
    }

    return relativeTop;
  }

  private getWorkspaceViewRect(viewMetrics: ContainerRegion) {
    const top = viewMetrics.top;
    let bottom = viewMetrics.top + viewMetrics.height;
    let left = viewMetrics.left;
    let right = viewMetrics.left + viewMetrics.width;

    bottom -= this.getScrollbarThickness();
    if (this.workspace.RTL) {
      left -= this.getScrollbarThickness();
    } else {
      right -= this.getScrollbarThickness();
    }

    return new Rect(top, bottom, left, right);
  }

  private getScrollbarThickness() {
    return Scrollbar.scrollbarThickness / this.workspace.scale;
  }

  private renderTail() {
    const steps = [];
    // Find the relative coordinates of the center of the bubble.
    const relBubbleX = this.size.width / 2;
    const relBubbleY = this.size.height / 2;
    // Find the relative coordinates of the center of the anchor.
    let relAnchorX = -this.relativeLeft;
    let relAnchorY = -this.relativeTop;
    if (relBubbleX === relAnchorX && relBubbleY === relAnchorY) {
      // Null case.  Bubble is directly on top of the anchor.
      // Short circuit this rather than wade through divide by zeros.
      steps.push('M ' + relBubbleX + ',' + relBubbleY);
    } else {
      // Compute the angle of the tail's line.
      const rise = relAnchorY - relBubbleY;
      let run = relAnchorX - relBubbleX;
      if (this.workspace.RTL) {
        run *= -1;
      }
      const hypotenuse = Math.sqrt(rise * rise + run * run);
      let angle = Math.acos(run / hypotenuse);
      if (rise < 0) {
        angle = 2 * Math.PI - angle;
      }
      // Compute a line perpendicular to the tail.
      let rightAngle = angle + Math.PI / 2;
      if (rightAngle > Math.PI * 2) {
        rightAngle -= Math.PI * 2;
      }
      const rightRise = Math.sin(rightAngle);
      const rightRun = Math.cos(rightAngle);

      // Calculate the thickness of the base of the tail.
      let thickness =
        (this.size.width + this.size.height) / Bubble.TAIL_THICKNESS;
      thickness = Math.min(thickness, this.size.width, this.size.height) / 4;

      // Back the tip of the tail off of the anchor.
      const backoffRatio = 1 - Bubble.ANCHOR_RADIUS / hypotenuse;
      relAnchorX = relBubbleX + backoffRatio * run;
      relAnchorY = relBubbleY + backoffRatio * rise;

      // Coordinates for the base of the tail.
      const baseX1 = relBubbleX + thickness * rightRun;
      const baseY1 = relBubbleY + thickness * rightRise;
      const baseX2 = relBubbleX - thickness * rightRun;
      const baseY2 = relBubbleY - thickness * rightRise;

      // Distortion to curve the tail.
      const radians = math.toRadians(
        this.workspace.RTL ? -Bubble.TAIL_ANGLE : Bubble.TAIL_ANGLE
      );
      let swirlAngle = angle + radians;
      if (swirlAngle > Math.PI * 2) {
        swirlAngle -= Math.PI * 2;
      }
      const swirlRise = (Math.sin(swirlAngle) * hypotenuse) / Bubble.TAIL_BEND;
      const swirlRun = (Math.cos(swirlAngle) * hypotenuse) / Bubble.TAIL_BEND;

      steps.push('M' + baseX1 + ',' + baseY1);
      steps.push(
        'C' +
          (baseX1 + swirlRun) +
          ',' +
          (baseY1 + swirlRise) +
          ' ' +
          relAnchorX +
          ',' +
          relAnchorY +
          ' ' +
          relAnchorX +
          ',' +
          relAnchorY
      );
      steps.push(
        'C' +
          relAnchorX +
          ',' +
          relAnchorY +
          ' ' +
          (baseX2 + swirlRun) +
          ',' +
          (baseY2 + swirlRise) +
          ' ' +
          baseX2 +
          ',' +
          baseY2
      );
    }
    steps.push('z');
    this.tail?.setAttribute('d', steps.join(' '));
  }

  /** @internal */
  getRelativeToSurfaceXY(): Coordinate {
    return new Coordinate(
      this.workspace.RTL
        ? -this.relativeLeft + this.anchor.x - this.size.width
        : this.anchor.x + this.relativeLeft,
      this.anchor.y + this.relativeTop
    );
  }

  /** @internal */
  getSvgRoot(): SVGElement {
    return this.svgRoot;
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
  moveDuringDrag(newLoc: Coordinate) {
    this.moveTo(newLoc.x, newLoc.y);
    if (this.workspace.RTL) {
      this.relativeLeft = this.anchor.x - newLoc.x - this.size.width;
    } else {
      this.relativeLeft = newLoc.x - this.anchor.x;
    }
    this.relativeTop = newLoc.y - this.anchor.y;
    this.renderTail();
  }

  setDragging(_start: boolean) {
    // NOOP in base class.
  }

  /** @internal */
  setDeleteStyle(_enable: boolean) {
    // NOOP in base class.
  }

  /** @internal */
  isDeletable(): boolean {
    return false;
  }

  /** @internal */
  showContextMenu(_e: Event) {
    // NOOP in base class.
  }
}
