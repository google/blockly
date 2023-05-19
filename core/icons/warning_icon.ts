/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from '../block_svg.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Icon} from './icon.js';
import {IHasBubble} from '../interfaces/i_has_bubble.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils.js';
import {Svg} from '../utils/svg.js';
import {TextBubble} from '../bubbles/text_bubble.js';

export class WarningIcon extends Icon implements IHasBubble {
  static readonly TYPE = 'warning';

  static readonly WEIGHT = 2;

  static readonly SIZE = 17;

  private textMap: Map<string, string> = new Map();

  private textBubble: TextBubble | null = null;

  constructor(protected readonly sourceBlock: BlockSvg) {
    super(sourceBlock);
  }

  getType(): string {
    return WarningIcon.TYPE;
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // Already initialized.

    super.initView(pointerdownListener);
    // Triangle with rounded corners.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconShape',
        'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z',
      },
      this.svgRoot
    );
    // Can't use a real '!' text character since different browsers and
    // operating systems render it differently. Body of exclamation point.
    dom.createSvgElement(
      Svg.PATH,
      {
        'class': 'blocklyIconSymbol',
        'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z',
      },
      this.svgRoot
    );
    // Dot of exclamation point.
    dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyIconSymbol',
        'x': '7',
        'y': '11',
        'height': '2',
        'width': '2',
      },
      this.svgRoot
    );
  }

  dispose() {
    if (this.textBubble) this.textBubble.dispose();
  }

  getWeight(): number {
    return WarningIcon.WEIGHT;
  }

  getSize(): Size {
    return new Size(17, 17);
  }

  applyColour(): void {
    this.textBubble?.setColour(this.sourceBlock.style.colourPrimary);
  }

  updateCollapsed(): void {
    // We are shown when collapsed, so do nothing! I.e. skip the default
    // behavior of hiding.
  }

  isShownWhenCollapsed(): boolean {
    return true;
  }

  onLocationChange(blockOrigin: Coordinate): void {
    super.onLocationChange(blockOrigin);
    if (this.bubbleIsVisible()) {
      this.textBubble?.setAnchorLocation(this.getAnchorLocation());
    }
  }

  setText(text: string, id: string): this {
    if (this.textMap.get(id) === text) return this;

    if (text) {
      this.textMap.set(id, text);
    } else {
      this.textMap.delete(id);
    }

    if (this.bubbleIsVisible()) this.textBubble?.setText(this.getText());
    return this;
  }

  getText(): string {
    return [...this.textMap.values()].join('\n');
  }

  bubbleIsVisible(): boolean {
    return !!this.textBubble;
  }

  setBubbleVisible(visible: boolean): void {
    if (this.bubbleIsVisible() === visible) return;

    if (visible) {
      this.textBubble = new TextBubble(
        this.getText(),
        this.sourceBlock.workspace,
        this.getAnchorLocation(),
        this.getBubbleOwnerRect()
      );
    } else {
      this.textBubble?.dispose();
      this.textBubble = null;
    }
  }

  private getAnchorLocation(): Coordinate {
    const midIcon = WarningIcon.SIZE / 2;
    return Coordinate.sum(
      this.workspaceLocation,
      new Coordinate(midIcon, midIcon)
    );
  }

  private getBubbleOwnerRect(): Rect {
    const bbox = this.sourceBlock.getSvgRoot().getBBox();
    return new Rect(bbox.y, bbox.y + bbox.height, bbox.x, bbox.x + bbox.width);
  }
}
