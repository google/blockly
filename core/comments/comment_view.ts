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
  private deleteIcon: SVGImageElement;
  private foldoutIcon: SVGImageElement;
  private resizeHandle: SVGImageElement;

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
    // TODO: Before merging, does this mean to override an individual image,
    // folks need to replace the whole media folder?
    this.deleteIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyDeleteIcon',
        'href': `${workspace.options.pathToMedia}delete-icon.svg`,
      },
      this.svgRoot,
    );
    this.foldoutIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyFoldoutIcon',
        'href': `${workspace.options.pathToMedia}arrow-dropdown.svg`,
      },
      this.svgRoot,
    );
    this.resizeHandle = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyResizeHandle',
        'href': `${workspace.options.pathToMedia}resize-handle.svg`,
      },
      this.svgRoot,
    );

    // TODO: Remove this comment before merging.
    // I think we want comments to exist on the same layer as blocks.
    workspace.getLayerManager()?.append(this, layers.BLOCK);

    this.setSize(new Size(120, 100));
  }

  getSvgRoot(): SVGElement {
    return this.svgRoot;
  }

  setSize(size: Size) {
    const topBarSize = this.topBar.getBBox();
    const deleteSize = this.deleteIcon.getBBox();
    const foldoutSize = this.foldoutIcon.getBBox();
    const resizeSize = this.resizeHandle.getBBox();
    console.log(resizeSize);

    this.svgRoot.setAttribute('height', `${size.height}`);
    this.svgRoot.setAttribute('width', `${size.width}`);

    this.backgroundRect.setAttribute('height', `${size.height}`);
    this.backgroundRect.setAttribute('width', `${size.width}`);

    this.topBar.setAttribute('width', `${size.width}`);

    const deleteMargin = (topBarSize.height - deleteSize.height) / 2;
    this.deleteIcon.setAttribute('y', `${deleteMargin}`);
    this.deleteIcon.setAttribute(
      'x',
      `${size.width - deleteSize.width - deleteMargin}`,
    );

    const foldoutMargin = (topBarSize.height - foldoutSize.height) / 2;
    this.foldoutIcon.setAttribute('y', `${foldoutMargin}`);
    this.foldoutIcon.setAttribute('x', `${foldoutMargin}`);

    this.resizeHandle.setAttribute('x', `${size.width - resizeSize.width}`);
    this.resizeHandle.setAttribute('y', `${size.height - resizeSize.height}`);
  }
}

css.register(`
.blocklyWorkspace {
  --commentFillColour: #FFFCC7;
  --commentBorderColour: #F2E49B;
  --commentIconColour: #1A1A1A
}

.blocklyDeleteIcon {
  width: 20px;
  height: 20px;
  display: none;
  fill: var(--commentIconColour);
}

.blocklyFoldoutIcon {
  width: 20px;
  height: 20px;
  fill: var(--commentIconColour);
}
.blocklyResizeHandle {
  width: 12px;
  height: 12px;
  stroke: var(--commentIconColour);
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
