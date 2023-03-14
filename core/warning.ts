/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a warning.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Warning');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_bubble_open.js';

import type {BlockSvg} from './block_svg.js';
import {Bubble} from './bubble.js';
import * as eventUtils from './events/utils.js';
import {Icon} from './icon.js';
import type {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';


/**
 * Class for a warning.
 */
export class Warning extends Icon {
  private text: {[key: string]: string};

  /** The top-level node of the warning text, or null if not created. */
  private paragraphElement: SVGTextElement|null = null;

  /** Does this icon get hidden when the block is collapsed? */
  override collapseHidden = false;

  /** @param block The block associated with this warning. */
  constructor(block: BlockSvg) {
    super(block);
    this.createIcon();
    // The text object can contain multiple warnings.
    this.text = Object.create(null);
  }

  /**
   * Draw the warning icon.
   *
   * @param group The icon group.
   */
  protected override drawIcon_(group: Element) {
    // Triangle with rounded corners.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconShape',
          'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z',
        },
        group);
    // Can't use a real '!' text character since different browsers and
    // operating systems render it differently. Body of exclamation point.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconSymbol',
          'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z',
        },
        group);
    // Dot of exclamation point.
    dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyIconSymbol',
          'x': '7',
          'y': '11',
          'height': '2',
          'width': '2',
        },
        group);
  }

  /**
   * Show or hide the warning bubble.
   *
   * @param visible True if the bubble should be visible.
   */
  override setVisible(visible: boolean) {
    if (visible === this.isVisible()) {
      return;
    }
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.getBlock(), visible, 'warning'));
    if (visible) {
      this.createBubble();
    } else {
      this.disposeBubble();
    }
  }

  /** Show the bubble. */
  private createBubble() {
    this.paragraphElement = Bubble.textToDom(this.getText());
    this.bubble_ = Bubble.createNonEditableBubble(
        this.paragraphElement, this.getBlock(), this.iconXY_ as Coordinate);
    this.applyColour();
  }

  /** Dispose of the bubble and references to it. */
  private disposeBubble() {
    if (this.bubble_) {
      this.bubble_.dispose();
      this.bubble_ = null;
    }
    this.paragraphElement = null;
  }

  /**
   * Set this warning's text.
   *
   * @param text Warning text (or '' to delete). This supports linebreaks.
   * @param id An ID for this text entry to be able to maintain multiple
   *     warnings.
   */
  setText(text: string, id: string) {
    if (this.text[id] === text) {
      return;
    }
    if (text) {
      this.text[id] = text;
    } else {
      delete this.text[id];
    }
    if (this.isVisible()) {
      this.setVisible(false);
      this.setVisible(true);
    }
  }

  /**
   * Get this warning's texts.
   *
   * @returns All texts concatenated into one string.
   */
  getText(): string {
    const allWarnings = [];
    for (const id in this.text) {
      allWarnings.push(this.text[id]);
    }
    return allWarnings.join('\n');
  }

  /** Dispose of this warning. */
  override dispose() {
    this.getBlock().warning = null;
    super.dispose();
  }
}
