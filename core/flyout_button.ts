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
// Former goog.module ID: Blockly.FlyoutButton

import type {IASTNodeLocationSvg} from './blockly.js';
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
export class FlyoutButton implements IASTNodeLocationSvg {
  /** The horizontal margin around the text in the button. */
  static TEXT_MARGIN_X = 5;

  /** The vertical margin around the text in the button. */
  static TEXT_MARGIN_Y = 2;

  /** The radius of the flyout button's borders. */
  static BORDER_RADIUS = 4;

  private readonly text: string;
  private readonly position: Coordinate;
  private readonly callbackKey: string;
  private readonly cssClass: string | null;

  /** Mouse up event data. */
  private onMouseUpWrapper: browserEvents.Data | null = null;
  info: toolbox.ButtonOrLabelInfo;

  /** The width of the button's rect. */
  width = 0;

  /** The height of the button's rect. */
  height = 0;

  /** The root SVG group for the button or label. */
  private svgGroup: SVGGElement | null = null;

  /** The SVG element with the text of the label or button. */
  private svgText: SVGTextElement | null = null;

  /**
   * Holds the cursors svg element when the cursor is attached to the button.
   * This is null if there is no cursor on the button.
   */
  cursorSvg: SVGElement | null = null;

  /**
   * @param workspace The workspace in which to place this button.
   * @param targetWorkspace The flyout's target workspace.
   * @param json The JSON specifying the label/button.
   * @param isFlyoutLabel Whether this button should be styled as a label.
   * @internal
   */
  constructor(
    private readonly workspace: WorkspaceSvg,
    private readonly targetWorkspace: WorkspaceSvg,
    json: toolbox.ButtonOrLabelInfo,
    private readonly isFlyoutLabel: boolean,
  ) {
    this.text = json['text'];

    this.position = new Coordinate(0, 0);

    /** The key to the function called when this button is clicked. */
    this.callbackKey =
      (json as AnyDuringMigration)[
        'callbackKey'
      ] /* Check the lower case version
                                                   too to satisfy IE */ ||
      (json as AnyDuringMigration)['callbackkey'];

    /** If specified, a CSS class to add to this button. */
    this.cssClass = (json as AnyDuringMigration)['web-class'] || null;

    /** The JSON specifying the label / button. */
    this.info = json;
  }

  /**
   * Create the button elements.
   *
   * @returns The button's SVG group.
   */
  createDom(): SVGElement {
    let cssClass = this.isFlyoutLabel
      ? 'blocklyFlyoutLabel'
      : 'blocklyFlyoutButton';
    if (this.cssClass) {
      cssClass += ' ' + this.cssClass;
    }

    this.svgGroup = dom.createSvgElement(
      Svg.G,
      {'class': cssClass},
      this.workspace.getCanvas(),
    );

    let shadow;
    if (!this.isFlyoutLabel) {
      // Shadow rectangle (light source does not mirror in RTL).
      shadow = dom.createSvgElement(
        Svg.RECT,
        {
          'class': 'blocklyFlyoutButtonShadow',
          'rx': FlyoutButton.BORDER_RADIUS,
          'ry': FlyoutButton.BORDER_RADIUS,
          'x': 1,
          'y': 1,
        },
        this.svgGroup!,
      );
    }
    // Background rectangle.
    const rect = dom.createSvgElement(
      Svg.RECT,
      {
        'class': this.isFlyoutLabel
          ? 'blocklyFlyoutLabelBackground'
          : 'blocklyFlyoutButtonBackground',
        'rx': FlyoutButton.BORDER_RADIUS,
        'ry': FlyoutButton.BORDER_RADIUS,
      },
      this.svgGroup!,
    );

    const svgText = dom.createSvgElement(
      Svg.TEXT,
      {
        'class': this.isFlyoutLabel ? 'blocklyFlyoutLabelText' : 'blocklyText',
        'x': 0,
        'y': 0,
        'text-anchor': 'middle',
      },
      this.svgGroup!,
    );
    let text = parsing.replaceMessageReferences(this.text);
    if (this.workspace.RTL) {
      // Force text to be RTL by adding an RLM.
      text += '\u200F';
    }
    svgText.textContent = text;
    if (this.isFlyoutLabel) {
      this.svgText = svgText;
      this.workspace
        .getThemeManager()
        .subscribe(this.svgText, 'flyoutForegroundColour', 'fill');
    }

    const fontSize = style.getComputedStyle(svgText, 'fontSize');
    const fontWeight = style.getComputedStyle(svgText, 'fontWeight');
    const fontFamily = style.getComputedStyle(svgText, 'fontFamily');
    this.width = dom.getFastTextWidthWithSizeString(
      svgText,
      fontSize,
      fontWeight,
      fontFamily,
    );
    const fontMetrics = dom.measureFontMetrics(
      text,
      fontSize,
      fontWeight,
      fontFamily,
    );
    this.height = fontMetrics.height;

    if (!this.isFlyoutLabel) {
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
      String(this.height / 2 - fontMetrics.height / 2 + fontMetrics.baseline),
    );

    this.updateTransform();

    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'EventTarget'.
    this.onMouseUpWrapper = browserEvents.conditionalBind(
      this.svgGroup as AnyDuringMigration,
      'pointerup',
      this,
      this.onMouseUp,
    );
    return this.svgGroup!;
  }

  /** Correctly position the flyout button and make it visible. */
  show() {
    this.updateTransform();
    this.svgGroup!.setAttribute('display', 'block');
  }

  /** Update SVG attributes to match internal state. */
  private updateTransform() {
    this.svgGroup!.setAttribute(
      'transform',
      'translate(' + this.position.x + ',' + this.position.y + ')',
    );
  }

  /**
   * Move the button to the given x, y coordinates.
   *
   * @param x The new x coordinate.
   * @param y The new y coordinate.
   */
  moveTo(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.updateTransform();
  }

  /** @returns Whether or not the button is a label. */
  isLabel(): boolean {
    return this.isFlyoutLabel;
  }

  /**
   * Location of the button.
   *
   * @returns x, y coordinates.
   * @internal
   */
  getPosition(): Coordinate {
    return this.position;
  }

  /** @returns Text of the button. */
  getButtonText(): string {
    return this.text;
  }

  /**
   * Get the button's target workspace.
   *
   * @returns The target workspace of the flyout where this button resides.
   */
  getTargetWorkspace(): WorkspaceSvg {
    return this.targetWorkspace;
  }

  /**
   * Get the button's workspace.
   *
   * @returns The workspace in which to place this button.
   */
  getWorkspace(): WorkspaceSvg {
    return this.workspace;
  }

  /** Dispose of this button. */
  dispose() {
    if (this.onMouseUpWrapper) {
      browserEvents.unbind(this.onMouseUpWrapper);
    }
    if (this.svgGroup) {
      dom.removeNode(this.svgGroup);
    }
    if (this.svgText) {
      this.workspace.getThemeManager().unsubscribe(this.svgText);
    }
  }

  /**
   * Add the cursor SVG to this buttons's SVG group.
   *
   * @param cursorSvg The SVG root of the cursor to be added to the button SVG
   *     group.
   */
  setCursorSvg(cursorSvg: SVGElement) {
    if (!cursorSvg) {
      this.cursorSvg = null;
      return;
    }
    if (this.svgGroup) {
      this.svgGroup.appendChild(cursorSvg);
      this.cursorSvg = cursorSvg;
    }
  }

  /**
   * Required by IASTNodeLocationSvg, but not used. A marker cannot be set on a
   * button. If the 'mark' shortcut is used on a button, its associated callback
   * function is triggered.
   */
  setMarkerSvg() {
    throw new Error('Attempted to set a marker on a button.');
  }

  /**
   * Do something when the button is clicked.
   *
   * @param e Pointer up event.
   */
  private onMouseUp(e: PointerEvent) {
    const gesture = this.targetWorkspace.getGesture(e);
    if (gesture) {
      gesture.cancel();
    }

    if (this.isFlyoutLabel && this.callbackKey) {
      console.warn(
        'Labels should not have callbacks. Label text: ' + this.text,
      );
    } else if (
      !this.isFlyoutLabel &&
      !(
        this.callbackKey &&
        this.targetWorkspace.getButtonCallback(this.callbackKey)
      )
    ) {
      console.warn('Buttons should have callbacks. Button text: ' + this.text);
    } else if (!this.isFlyoutLabel) {
      const callback = this.targetWorkspace.getButtonCallback(this.callbackKey);
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
