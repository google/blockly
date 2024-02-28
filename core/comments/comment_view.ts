/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IRenderedElement} from '../interfaces/i_rendered_element.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import * as dom from '../utils/dom.js';
import {Svg} from '../utils/svg.js';
import * as layers from '../layers.js';
import * as css from '../css.js';
import {Size} from '../utils.js';

export class CommentView implements IRenderedElement {
  private svgRoot: SVGGElement;
  private backgroundRect: SVGRectElement;
  private topBar: SVGRectElement;

  constructor(private readonly workspace: WorkspaceSvg) {
    this.svgRoot = dom.createSvgElement(Svg.G, {'class': 'blocklyComment'});

    this.backgroundRect = dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyCommentRect',
        'x': 0,
        'y': 0,
      },
      this.svgRoot,
    );

    this.topBar = dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyCommentTopbar',
        'x': 0,
        'y': 0,
      },
      this.svgRoot,
    );

    this.setSize(new Size(100, 100));

    // TODO: Remove this comment before merging.
    // I think we want comments to exist on the same layer as blocks.
    workspace.getLayerManager()?.append(this, layers.BLOCK);
  }

  getSvgRoot(): SVGElement {
    return this.svgRoot;
  }

  setSize(size: Size) {
    const topBarSize = this.topBar.getBBox();

    this.svgRoot.setAttribute('height', `${size.height}`);
    this.svgRoot.setAttribute('width', `${size.width}`);

    this.backgroundRect.setAttribute(
      'height',
      `${size.height - topBarSize.height}`,
    );
    this.backgroundRect.setAttribute('width', `${size.width}`);

    this.topBar.setAttribute('width', `${size.width}`);
  }
}

css.register(`
.blocklyWorkspace {
  --commentFillColour: #FFFCC7;
  --commentBorderColour: #F2E49B;
}

.blocklyCommentRect {
  fill: var(--commentFillColour);
  stroke: var(--commentBorderColour);
  stroke-width: 1px;
}
.blocklyCommentTopbar {
  fill: var(--commentBorderColour);
  height: 24px;
}
`);
