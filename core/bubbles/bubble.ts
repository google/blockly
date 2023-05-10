/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dom from '../utils/dom.js';
import {IBubble} from '../interfaces/i_bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';

export class Bubble implements IBubble {
  protected svgRoot: SVGGElement;

  private size = new Size(0, 0);

  private colour = '#ffffff';

  public constructor(
    private readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate
  ) {
    this.svgRoot = dom.createSvgElement(Svg.G, {});
  }

  public dispose() {}

  public setAnchorLocation(anchor: Coordinate) {
    this.anchor = anchor;
    // TODO: Move the anchor.
  }

  protected getSize() {
    return this.size;
  }

  protected setSize(size: Size) {
    this.size = size;
  }

  protected getColour(): string {
    return this.colour;
  }

  protected setColour(colour: string) {
    this.colour = colour;
  }
}
