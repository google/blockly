/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Bubble} from './bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class TextInputBubble extends Bubble {
  private inputRoot: SVGForeignObjectElement;
  private textArea: HTMLTextAreaElement;

  private readonly DEFAULT_SIZE = new Size(
    160 + Bubble.DOUBLE_BORDER,
    80 + Bubble.DOUBLE_BORDER
  );

  private readonly MIN_SIZE = new Size(
    45 + Bubble.DOUBLE_BORDER,
    20 + Bubble.DOUBLE_BORDER
  );

  constructor(
    protected readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect
  ) {
    super(workspace, anchor, ownerRect);
    ({inputRoot: this.inputRoot, textArea: this.textArea} = this.createEditor(
      this.contentContainer
    ));
    this.setSize(this.DEFAULT_SIZE, true);
  }

  private createEditor(container: SVGGElement): {
    inputRoot: SVGForeignObjectElement;
    textArea: HTMLTextAreaElement;
  } {
    const inputRoot = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      container
    );

    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';

    const textArea = document.createElementNS(
      dom.HTML_NS,
      'textarea'
    ) as HTMLTextAreaElement;
    textArea.className = 'blocklyCommentTextarea';
    textArea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');

    body.appendChild(textArea);
    inputRoot.appendChild(body);

    return {inputRoot, textArea};
  }

  public setSize(size: Size, relayout = false) {
    size.width = Math.max(size.width, this.MIN_SIZE.width);
    size.height = Math.max(size.height, this.MIN_SIZE.height);

    const widthMinusBorder = size.width - Bubble.DOUBLE_BORDER;
    const heightMinusBorder = size.height - Bubble.DOUBLE_BORDER;
    this.inputRoot.setAttribute('width', `${widthMinusBorder}`);
    this.inputRoot.setAttribute('height', `${heightMinusBorder}`);
    this.textArea.style.width = `${widthMinusBorder - 4}px`;
    this.textArea.style.height = `${heightMinusBorder - 4}px`;

    super.setSize(size, relayout);
  }
}
