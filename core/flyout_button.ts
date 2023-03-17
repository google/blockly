/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a button in the flyout.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.FlyoutButton');

import * as browserEvents from './browser_events.js';
import * as Css from './css.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import * as parsing from './utils/parsing.js';
import * as style from './utils/style.js';
import {Svg} from './utils/svg.js';
import type * as toolbox from './utils/toolbox.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for a button or label in the flyout.
 */
export class FlyoutButton {
  /** The horizontal margin around the text in the button. */
  static TEXT_MARGIN_X = 5;

  /** The vertical margin around the text in the button. */
  static TEXT_MARGIN_Y = 2;

  /** The radius of the flyout button's borders. */
  static BORDER_RADIUS = 4;

  private readonly text_: string;
  private readonly position_: Coordinate;
  private readonly callbackKey_: string;
  private readonly cssClass_: string|null;

  /** Mouse up event data. */
  private onMouseUpWrapper_: browserEvents.Data|null = null;
  info: toolbox.ButtonOrLabelInfo;

  /** The width of the button's rect. */
  width = 0;

  /** The height of the button's rect. */
  height = 0;

  /** The root SVG group for the button or label. */
  private svgGroup_: SVGGElement|null = null;

  /** The SVG element with the text of the label or button. */
  private svgText_: SVGTextElement|null = null;

  /**
   * @param workspace The workspace in which to place this button.
   * @param targetWorkspace The flyout's target workspace.
   * @param json The JSON specifying the label/button.
   * @param isLabel_ Whether this button should be styled as a label.
   * @internal
   */
  constructor(
      private readonly workspace: WorkspaceSvg,
      private readonly targetWorkspace: WorkspaceSvg,
      json: toolbox.ButtonOrLabelInfo, private readonly isLabel_: boolean) {
    this.text_ = json['text'];

    this.position_ = new Coordinate(0, 0);

    /** The key to the function called when this button is clicked. */
    this.callbackKey_ =
        (json as
         AnyDuringMigration)['callbackKey'] || /* Check the lower case version
                                                   too to satisfy IE */
        (json as AnyDuringMigration)['callbackkey'];

    /** If specified, a CSS class to add to this button. */
    this.cssClass_ = (json as AnyDuringMigration)['web-class'] || null;

    /** The JSON specifying the label / button. */
    this.info = json;
  }

  /**
   * Create the button elements.
   *
   * @returns The button's SVG group.
   */
  createDom(): SVGElement {
    let cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
    if (this.cssClass_) {
      cssClass += ' ' + this.cssClass_;
    }

    this.svgGroup_ = dom.createSvgElement(
        Svg.G, {'class': cssClass}, this.workspace.getCanvas());

    let shadow;
    if (!this.isLabel_) {
      // Shadow rectangle (light source does not mirror in RTL).
      shadow = dom.createSvgElement(
          Svg.RECT, {
            'class': 'blocklyFlyoutButtonShadow',
            'rx': FlyoutButton.BORDER_RADIUS,
            'ry': FlyoutButton.BORDER_RADIUS,
            'x': 1,
            'y': 1,
          },
          this.svgGroup_!);
    }
    // Background rectangle.
    const rect = dom.createSvgElement(
        Svg.RECT, {
          'class': this.isLabel_ ? 'blocklyFlyoutLabelBackground' :
                                   'blocklyFlyoutButtonBackground',
          'rx': FlyoutButton.BORDER_RADIUS,
          'ry': FlyoutButton.BORDER_RADIUS,
        },
        this.svgGroup_!);

    const svgText = dom.createSvgElement(
        Svg.TEXT, {
          'class': this.isLabel_ ? 'blocklyFlyoutLabelText' : 'blocklyText',
          'x': 0,
          'y': 0,
          'text-anchor': 'middle',
        },
        this.svgGroup_!);
    let text = parsing.replaceMessageReferences(this.text_);
    if (this.workspace.RTL) {
      // Force text to be RTL by adding an RLM.
      text += '\u200F';
    }
    svgText.textContent = text;
    if (this.isLabel_) {
      this.svgText_ = svgText;
      this.workspace.getThemeManager().subscribe(
          this.svgText_, 'flyoutForegroundColour', 'fill');
    }

    const fontSize = style.getComputedStyle(svgText, 'fontSize');
    const fontWeight = style.getComputedStyle(svgText, 'fontWeight');
    const fontFamily = style.getComputedStyle(svgText, 'fontFamily');
    this.width = dom.getFastTextWidthWithSizeString(
        svgText, fontSize, fontWeight, fontFamily);
    const fontMetrics =
        dom.measureFontMetrics(text, fontSize, fontWeight, fontFamily);
    this.height = fontMetrics.height;

    if (!this.isLabel_) {
      this.width += 2 * FlyoutButton.TEXT_MARGIN_X;
      this.height += 2 * FlyoutButton.TEXT_MARGIN_Y;
      shadow?.setAttribute('width', String(this.width));
      shadow?.setAttribute('height', String(this.height));
    }
    rect.setAttribute('width', String(this.width));
    rect.setAttribute('height', String(this.height));

    svgText.setAttribute('x', String(this.width / 2));
    svgText.setAttribute(
        'y',
        String(
            this.height / 2 - fontMetrics.height / 2 + fontMetrics.baseline));

    this.updateTransform_();

    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'EventTarget'.
    this.onMouseUpWrapper_ = browserEvents.conditionalBind(
        this.svgGroup_ as AnyDuringMigration, 'pointerup', this,
        this.onMouseUp_);
    return this.svgGroup_!;
  }

  /** Correctly position the flyout button and make it visible. */
  show() {
    this.updateTransform_();
    this.svgGroup_!.setAttribute('display', 'block');
  }

  /** Update SVG attributes to match internal state. */
  private updateTransform_() {
    this.svgGroup_!.setAttribute(
        'transform',
        'translate(' + this.position_.x + ',' + this.position_.y + ')');
  }

  /**
   * Move the button to the given x, y coordinates.
   *
   * @param x The new x coordinate.
   * @param y The new y coordinate.
   */
  moveTo(x: number, y: number) {
    this.position_.x = x;
    this.position_.y = y;
    this.updateTransform_();
  }

  /** @returns Whether or not the button is a label. */
  isLabel(): boolean {
    return this.isLabel_;
  }

  /**
   * Location of the button.
   *
   * @returns x, y coordinates.
   * @internal
   */
  getPosition(): Coordinate {
    return this.position_;
  }

  /** @returns Text of the button. */
  getButtonText(): string {
    return this.text_;
  }

  /**
   * Get the button's target workspace.
   *
   * @returns The target workspace of the flyout where this button resides.
   */
  getTargetWorkspace(): WorkspaceSvg {
    return this.targetWorkspace;
  }

  /** Dispose of this button. */
  dispose() {
    if (this.onMouseUpWrapper_) {
      browserEvents.unbind(this.onMouseUpWrapper_);
    }
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
    }
    if (this.svgText_) {
      this.workspace.getThemeManager().unsubscribe(this.svgText_);
    }
  }

  /**
   * Do something when the button is clicked.
   *
   * @param e Pointer up event.
   */
  private onMouseUp_(e: PointerEvent) {
    const gesture = this.targetWorkspace.getGesture(e);
    if (gesture) {
      gesture.cancel();
    }

    if (this.isLabel_ && this.callbackKey_) {
      console.warn(
          'Labels should not have callbacks. Label text: ' + this.text_);
    } else if (
        !this.isLabel_ &&
        !(this.callbackKey_ &&
          this.targetWorkspace.getButtonCallback(this.callbackKey_))) {
      console.warn('Buttons should have callbacks. Button text: ' + this.text_);
    } else if (!this.isLabel_) {
      const callback =
          this.targetWorkspace.getButtonCallback(this.callbackKey_);
      if (callback) {
        callback(this);
      }
    }
  }
}

/** CSS for buttons and labels. See css.js for use. */
Css.register(`
.blocklyFlyoutButton {
  fill: #888;
  cursor: default;
}

.blocklyFlyoutButtonShadow {
  fill: #666;
}

.blocklyFlyoutButton:hover {
  fill: #aaa;
}

.blocklyFlyoutLabel {
  cursor: default;
}

.blocklyFlyoutLabelBackground {
  opacity: 0;
}
`);
