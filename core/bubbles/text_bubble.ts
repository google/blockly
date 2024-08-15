/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {Bubble} from './bubble.js';

/**
 * A bubble that displays non-editable text. Used by the warning icon.
 */
export class TextBubble extends Bubble {
  private paragraph: SVGTextElement;

  constructor(
    private text: string,
    public readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect,
  ) {
    super(workspace, anchor, ownerRect);
    this.paragraph = this.stringToSvg(text, this.contentContainer);
    this.updateBubbleSize();
  }

  /** @returns the current text of this text bubble. */
  getText(): string {
    return this.text;
  }

  /** Sets the current text of this text bubble, and updates the display. */
  setText(text: string) {
    this.text = text;
    dom.removeNode(this.paragraph);
    this.paragraph = this.stringToSvg(text, this.contentContainer);
    this.updateBubbleSize();
  }

  /**
   * Converts the given string into an svg containing that string,
   * broken up by newlines.
   */
  private stringToSvg(text: string, container: SVGGElement) {
    const paragraph = this.createParagraph(container);
    const spans = this.createSpans(paragraph, text);
    if (this.workspace.RTL)
      this.rightAlignSpans(paragraph.getBBox().width, spans);
    return paragraph;
  }

  /** Creates the paragraph container for this bubble's view's spans. */
  private createParagraph(container: SVGGElement): SVGTextElement {
    return dom.createSvgElement(
      Svg.TEXT,
      {
        'class': 'blocklyText blocklyBubbleText blocklyNoPointerEvents',
        'y': Bubble.BORDER_WIDTH,
      },
      container,
    );
  }

  /** Creates the spans visualizing the text of this bubble. */
  private createSpans(parent: SVGTextElement, text: string): SVGTSpanElement[] {
    return text.split('\n').map((line) => {
      const tspan = dom.createSvgElement(
        Svg.TSPAN,
        {'dy': '1em', 'x': Bubble.BORDER_WIDTH},
        parent,
      );
      const textNode = document.createTextNode(line);
      tspan.appendChild(textNode);
      return tspan;
    });
  }

  /** Right aligns the given spans. */
  private rightAlignSpans(maxWidth: number, spans: SVGTSpanElement[]) {
    for (const span of spans) {
      span.setAttribute('text-anchor', 'end');
      span.setAttribute('x', `${maxWidth + Bubble.BORDER_WIDTH}`);
    }
  }

  /** Updates the size of this bubble to account for the size of the text. */
  private updateBubbleSize() {
    const bbox = this.paragraph.getBBox();
    this.setSize(
      new Size(
        bbox.width + Bubble.BORDER_WIDTH * 2,
        bbox.height + Bubble.BORDER_WIDTH * 2,
      ),
      true,
    );
  }
}
