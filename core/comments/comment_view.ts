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
  private topBar: SVGRectElement;
  private deleteIcon: SVGImageElement;
  private foldoutIcon: SVGImageElement;
  private resizeHandle: SVGImageElement;
  private foreignObject: SVGForeignObjectElement;
  private textarea: HTMLTextAreaElement;
  private size: Size = new Size(120, 100);

  constructor(private readonly workspace: WorkspaceSvg) {
    this.svgRoot = dom.createSvgElement(Svg.G, {'class': 'blocklyComment'});

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

    this.foreignObject = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'class': 'blocklyCommentForeignObject',
      },
      this.svgRoot,
    );
    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';
    this.textarea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    this.textarea.className = 'blocklyTextarea blocklyText';
    // TODO: Handle RTL.
    // this.textarea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');
    body.appendChild(this.textarea);
    this.foreignObject.appendChild(body);

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

    // Set size to the default size.
    this.setSize(this.size);
  }

  getSvgRoot(): SVGElement {
    return this.svgRoot;
  }

  getSize(): Size {
    return this.size;
  }

  setSize(size: Size) {
    this.size = size;
    const topBarSize = this.topBar.getBBox();
    const deleteSize = this.deleteIcon.getBBox();
    const foldoutSize = this.foldoutIcon.getBBox();
    const resizeSize = this.resizeHandle.getBBox();

    this.svgRoot.setAttribute('height', `${size.height}`);
    this.svgRoot.setAttribute('width', `${size.width}`);

    this.topBar.setAttribute('width', `${size.width}`);

    this.foreignObject.setAttribute(
      'height',
      `${size.height - topBarSize.height}`,
    );
    this.foreignObject.setAttribute('y', `${topBarSize.height}`);
    this.foreignObject.setAttribute('width', `${size.width}`);

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

.blocklyComment .blocklyTextarea {
  background-color: var(--commentFillColour);
  border: 1px solid var(--commentBorderColour);
  outline: 0;
  resize: none;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8px;
  width: 100%;
  height: 100%;
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
