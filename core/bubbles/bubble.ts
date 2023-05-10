/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as browserEvents from '../browser_events.js';
import {IBubble} from '../interfaces/i_bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
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
    this.workspace.getGesture(e)?.handleBubbleStart(e, this);
  }
}
