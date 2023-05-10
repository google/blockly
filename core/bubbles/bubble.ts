/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as browserEvents from '../browser_events.js';
import {IBubble} from '../interfaces/i_bubble.js';
import {ContainerRegion} from '../metrics_manager.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Rect} from '../utils/rect.js';
import {Scrollbar} from '../scrollbar.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import * as userAgent from '../utils/useragent.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class Bubble /* implements IBubble */ {
  static BORDER_WIDTH = 6;
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
    protected anchor: Coordinate
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

  setAnchorLocation(anchor: Coordinate) {
    this.anchor = anchor;
    // TODO: Do we want to automatically position?
    // this.positionRelativeToAnchor();
  }

  protected getSize() {
    return this.size;
  }

  protected setSize(size: Size) {
    // TODO: set size.
    this.size = size;
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
    // this.workspace.getGesture(e)?.handleBubbleStart(e, this);
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
}
