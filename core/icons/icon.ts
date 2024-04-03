/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {Block} from '../block.js';
import type {BlockSvg} from '../block_svg.js';
import * as browserEvents from '../browser_events.js';
import {hasBubble} from '../interfaces/i_has_bubble.js';
import type {IIcon} from '../interfaces/i_icon.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import type {IconType} from './icon_types.js';
import * as deprecation from '../utils/deprecation.js';
import * as tooltip from '../tooltip.js';

/**
 * The abstract icon class. Icons are visual elements that live in the top-start
 * corner of the block. Usually they provide more "meta" information about a
 * block (such as warnings or comments) as opposed to fields, which provide
 * "actual" information, related to how a block functions.
 */
export abstract class Icon implements IIcon {
  /**
   * The position of this icon relative to its blocks top-start,
   * in workspace units.
   */
  protected offsetInBlock: Coordinate = new Coordinate(0, 0);

  /** The position of this icon in workspace coordinates. */
  protected workspaceLocation: Coordinate = new Coordinate(0, 0);

  /** The root svg element visually representing this icon. */
  protected svgRoot: SVGGElement | null = null;

  /** The tooltip for this icon. */
  protected tooltip: tooltip.TipInfo;

  constructor(protected sourceBlock: Block) {
    this.tooltip = sourceBlock;
  }

  getType(): IconType<IIcon> {
    throw new Error('Icons must implement getType');
  }

  initView(pointerdownListener: (e: PointerEvent) => void): void {
    if (this.svgRoot) return; // The icon has already been initialized.

    const svgBlock = this.sourceBlock as BlockSvg;
    this.svgRoot = dom.createSvgElement(Svg.G, {'class': 'blocklyIconGroup'});
    svgBlock.getSvgRoot().appendChild(this.svgRoot);
    this.updateSvgRootOffset();
    browserEvents.conditionalBind(
      this.svgRoot,
      'pointerdown',
      this,
      pointerdownListener,
    );
    (this.svgRoot as any).tooltip = this;
    tooltip.bindMouseEvents(this.svgRoot);
  }

  dispose(): void {
    tooltip.unbindMouseEvents(this.svgRoot);
    dom.removeNode(this.svgRoot);
  }

  getWeight(): number {
    return -1;
  }

  getSize(): Size {
    return new Size(0, 0);
  }

  /**
   * Sets the tooltip for this icon to the given value. Null to show the
   * tooltip of the block.
   */
  setTooltip(tip: tooltip.TipInfo | null) {
    this.tooltip = tip ?? this.sourceBlock;
  }

  /** Returns the tooltip for this icon. */
  getTooltip(): tooltip.TipInfo {
    return this.tooltip;
  }

  applyColour(): void {}

  updateEditable(): void {}

  updateCollapsed(): void {
    if (!this.svgRoot) return;
    if (this.sourceBlock.isCollapsed()) {
      this.svgRoot.style.display = 'none';
    } else {
      this.svgRoot.style.display = 'block';
    }
    if (hasBubble(this)) {
      this.setBubbleVisible(false);
    }
  }

  hideForInsertionMarker(): void {
    if (!this.svgRoot) return;
    this.svgRoot.style.display = 'none';
  }

  isShownWhenCollapsed(): boolean {
    return false;
  }

  setOffsetInBlock(offset: Coordinate): void {
    this.offsetInBlock = offset;
    this.updateSvgRootOffset();
  }

  private updateSvgRootOffset(): void {
    this.svgRoot?.setAttribute(
      'transform',
      `translate(${this.offsetInBlock.x}, ${this.offsetInBlock.y})`,
    );
  }

  onLocationChange(blockOrigin: Coordinate): void {
    this.workspaceLocation = Coordinate.sum(blockOrigin, this.offsetInBlock);
  }

  onClick(): void {}

  /**
   * Check whether the icon should be clickable while the block is in a flyout.
   * The default is that icons are clickable in all flyouts (auto-closing or not).
   * Subclasses may override this function to change this behavior.
   *
   * @param autoClosingFlyout true if the containing flyout is an auto-closing one.
   * @returns Whether the icon should be clickable while the block is in a flyout.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isClickableInFlyout(autoClosingFlyout: boolean): boolean {
    return true;
  }

  /**
   * Sets the visibility of the icon's bubble if one exists.
   *
   * @deprecated Use `setBubbleVisible` instead. To be removed in v11.
   */
  setVisible(visibility: boolean): void {
    deprecation.warn('setVisible', 'v10', 'v11', 'setBubbleVisible');
    if (hasBubble(this)) this.setBubbleVisible(visibility);
  }
}
