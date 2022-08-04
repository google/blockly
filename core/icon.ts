/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing an icon on a block.
 */

/**
 * Object representing an icon on a block.
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Icon');

import type {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import type {Bubble} from './bubble.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';


/**
 * Class for an icon.
 * @alias Blockly.Icon
 */
export abstract class Icon {
  protected block_: BlockSvg;
  /** The icon SVG group. */
  iconGroup_: SVGGElement|null = null;

  /** Whether this icon gets hidden when the block is collapsed. */
  collapseHidden = true;

  /** Height and width of icons. */
  readonly SIZE = 17;

  /** Bubble UI (if visible). */
  protected bubble_: Bubble|null = null;

  /** Absolute coordinate of icon's center. */
  protected iconXY_: Coordinate|null = null;

  /** @param block The block associated with this icon. */
  constructor(block: BlockSvg) {
    this.block_ = block;
  }

  /** Create the icon on the block. */
  createIcon() {
    if (this.iconGroup_) {
      // Icon already exists.
      return;
    }
    /* Here's the markup that will be generated:
        <g class="blocklyIconGroup">
          ...
        </g>
        */
    this.iconGroup_ =
        dom.createSvgElement(Svg.G, {'class': 'blocklyIconGroup'});
    if (this.block_.isInFlyout) {
      dom.addClass(this.iconGroup_ as Element, 'blocklyIconGroupReadonly');
    }
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element'.
    this.drawIcon_(this.iconGroup_ as AnyDuringMigration);

    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Node'.
    this.block_.getSvgRoot().appendChild(this.iconGroup_ as AnyDuringMigration);
    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'EventTarget'.
    browserEvents.conditionalBind(
        this.iconGroup_ as AnyDuringMigration, 'mouseup', this,
        this.iconClick_);
    this.updateEditable();
  }

  /** Dispose of this icon. */
  dispose() {
    // Dispose of and unlink the icon.
    dom.removeNode(this.iconGroup_);
    this.iconGroup_ = null;
    // Dispose of and unlink the bubble.
    this.setVisible(false);
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'BlockSvg'.
    this.block_ = null as AnyDuringMigration;
  }

  /** Add or remove the UI indicating if this icon may be clicked or not. */
  updateEditable() {}
  // No-op on the base class.

  /**
   * Is the associated bubble visible?
   * @return True if the bubble is visible.
   */
  isVisible(): boolean {
    return !!this.bubble_;
  }

  /**
   * Clicking on the icon toggles if the bubble is visible.
   * @param e Mouse click event.
   */
  protected iconClick_(e: Event) {
    if (this.block_.workspace.isDragging()) {
      // Drag operation is concluding.  Don't open the editor.
      return;
    }
    if (!this.block_.isInFlyout && !browserEvents.isRightButton(e)) {
      this.setVisible(!this.isVisible());
    }
  }

  /** Change the colour of the associated bubble to match its block. */
  applyColour() {
    if (this.isVisible()) {
      this.bubble_!.setColour(this.block_.style.colourPrimary);
    }
  }

  /**
   * Notification that the icon has moved.  Update the arrow accordingly.
   * @param xy Absolute location in workspace coordinates.
   */
  setIconLocation(xy: Coordinate) {
    this.iconXY_ = xy;
    if (this.isVisible()) {
      this.bubble_!.setAnchorLocation(xy);
    }
  }

  /**
   * Notification that the icon has moved, but we don't really know where.
   * Recompute the icon's location from scratch.
   */
  computeIconLocation() {
    // Find coordinates for the centre of the icon and update the arrow.
    const blockXY = this.block_.getRelativeToSurfaceXY();
    const iconXY = svgMath.getRelativeXY(this.iconGroup_ as SVGElement);
    const newXY = new Coordinate(
        blockXY.x + iconXY.x + this.SIZE / 2,
        blockXY.y + iconXY.y + this.SIZE / 2);
    if (!Coordinate.equals(this.getIconLocation(), newXY)) {
      this.setIconLocation(newXY);
    }
  }

  /**
   * Returns the center of the block's icon relative to the surface.
   * @return Object with x and y properties in workspace coordinates.
   */
  getIconLocation(): Coordinate|null {
    return this.iconXY_;
  }

  /**
   * Get the size of the icon as used for rendering.
   * This differs from the actual size of the icon, because it bulges slightly
   * out of its row rather than increasing the height of its row.
   * @return Height and width.
   */
  getCorrectedSize(): Size {
    // TODO (#2562): Remove getCorrectedSize.
    return new Size(this.SIZE, this.SIZE - 2);
  }

  /**
   * Draw the icon.
   * @param _group The icon group.
   */
  protected drawIcon_(_group: Element) {}
  // No-op on base class.

  /**
   * Show or hide the icon.
   * @param _visible True if the icon should be visible.
   */
  setVisible(_visible: boolean) {}
}
// No-op on base class
