/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a zoom icons.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.ZoomControls');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_click.js';

import * as browserEvents from './browser_events.js';
import {ComponentManager} from './component_manager.js';
import * as Css from './css.js';
import * as eventUtils from './events/utils.js';
import type {IPositionable} from './interfaces/i_positionable.js';
import type {UiMetrics} from './metrics_manager.js';
import * as uiPosition from './positionable_helpers.js';
import {SPRITE} from './sprites.js';
import * as Touch from './touch.js';
import * as dom from './utils/dom.js';
import {Rect} from './utils/rect.js';
import {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Class for a zoom controls.
 *
 * @alias Blockly.ZoomControls
 */
export class ZoomControls implements IPositionable {
  /**
   * The unique ID for this component that is used to register with the
   * ComponentManager.
   */
  id = 'zoomControls';

  /**
   * A handle to use to unbind the mouse down event handler for zoom reset
   *    button. Opaque data returned from browserEvents.conditionalBind.
   */
  private onZoomResetWrapper_: browserEvents.Data|null = null;

  /**
   * A handle to use to unbind the mouse down event handler for zoom in
   * button. Opaque data returned from browserEvents.conditionalBind.
   */
  private onZoomInWrapper_: browserEvents.Data|null = null;

  /**
   * A handle to use to unbind the mouse down event handler for zoom out
   * button. Opaque data returned from browserEvents.conditionalBind.
   */
  private onZoomOutWrapper_: browserEvents.Data|null = null;

  /** The zoom in svg <g> element. */
  private zoomInGroup: SVGGElement|null = null;

  /** The zoom out svg <g> element. */
  private zoomOutGroup: SVGGElement|null = null;

  /** The zoom reset svg <g> element. */
  private zoomResetGroup: SVGGElement|null = null;

  /** Width of the zoom controls. */
  private readonly WIDTH_ = 32;

  /** Height of each zoom control. */
  private readonly HEIGHT_ = 32;

  /** Small spacing used between the zoom in and out control, in pixels. */
  private readonly SMALL_SPACING_ = 2;

  /**
   * Large spacing used between the zoom in and reset control, in pixels.
   */
  private readonly LARGE_SPACING_ = 11;

  /** Distance between zoom controls and bottom or top edge of workspace. */
  private readonly MARGIN_VERTICAL_ = 20;

  /** Distance between zoom controls and right or left edge of workspace. */
  private readonly MARGIN_HORIZONTAL_ = 20;

  /** The SVG group containing the zoom controls. */
  private svgGroup: SVGElement|null = null;

  /** Left coordinate of the zoom controls. */
  private left_ = 0;

  /** Top coordinate of the zoom controls. */
  private top_ = 0;

  /** Whether this has been initialized. */
  private initialized_ = false;

  /** @param workspace The workspace to sit in. */
  constructor(private readonly workspace: WorkspaceSvg) {}

  /**
   * Create the zoom controls.
   *
   * @returns The zoom controls SVG group.
   */
  createDom(): SVGElement {
    this.svgGroup = dom.createSvgElement(Svg.G, {});

    // Each filter/pattern needs a unique ID for the case of multiple Blockly
    // instances on a page.  Browser behaviour becomes undefined otherwise.
    // https://neil.fraser.name/news/2015/11/01/
    const rnd = String(Math.random()).substring(2);
    this.createZoomOutSvg_(rnd);
    this.createZoomInSvg_(rnd);
    if (this.workspace.isMovable()) {
      // If we zoom to the center and the workspace isn't movable we could
      // loose blocks at the edges of the workspace.
      this.createZoomResetSvg_(rnd);
    }
    return this.svgGroup;
  }

  /** Initializes the zoom controls. */
  init() {
    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [ComponentManager.Capability.POSITIONABLE],
    });
    this.initialized_ = true;
  }

  /**
   * Disposes of this zoom controls.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose() {
    this.workspace.getComponentManager().removeComponent('zoomControls');
    if (this.svgGroup) {
      dom.removeNode(this.svgGroup);
    }
    if (this.onZoomResetWrapper_) {
      browserEvents.unbind(this.onZoomResetWrapper_);
    }
    if (this.onZoomInWrapper_) {
      browserEvents.unbind(this.onZoomInWrapper_);
    }
    if (this.onZoomOutWrapper_) {
      browserEvents.unbind(this.onZoomOutWrapper_);
    }
  }

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   *
   * @returns The UI elements's bounding box. Null if bounding box should be
   *     ignored by other UI elements.
   */
  getBoundingRectangle(): Rect|null {
    let height = this.SMALL_SPACING_ + 2 * this.HEIGHT_;
    if (this.zoomResetGroup) {
      height += this.LARGE_SPACING_ + this.HEIGHT_;
    }
    const bottom = this.top_ + height;
    const right = this.left_ + this.WIDTH_;
    return new Rect(this.top_, bottom, this.left_, right);
  }

  /**
   * Positions the zoom controls.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   *
   * @param metrics The workspace metrics.
   * @param savedPositions List of rectangles that are already on the workspace.
   */
  position(metrics: UiMetrics, savedPositions: Rect[]) {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }

    const cornerPosition =
        uiPosition.getCornerOppositeToolbox(this.workspace, metrics);
    let height = this.SMALL_SPACING_ + 2 * this.HEIGHT_;
    if (this.zoomResetGroup) {
      height += this.LARGE_SPACING_ + this.HEIGHT_;
    }
    const startRect = uiPosition.getStartPositionRect(
        cornerPosition, new Size(this.WIDTH_, height), this.MARGIN_HORIZONTAL_,
        this.MARGIN_VERTICAL_, metrics, this.workspace);

    const verticalPosition = cornerPosition.vertical;
    const bumpDirection = verticalPosition === uiPosition.verticalPosition.TOP ?
        uiPosition.bumpDirection.DOWN :
        uiPosition.bumpDirection.UP;
    const positionRect = uiPosition.bumpPositionRect(
        startRect, this.MARGIN_VERTICAL_, bumpDirection, savedPositions);

    if (verticalPosition === uiPosition.verticalPosition.TOP) {
      const zoomInTranslateY = this.SMALL_SPACING_ + this.HEIGHT_;
      this.zoomInGroup?.setAttribute(
          'transform', 'translate(0, ' + zoomInTranslateY + ')');
      if (this.zoomResetGroup) {
        const zoomResetTranslateY =
            zoomInTranslateY + this.LARGE_SPACING_ + this.HEIGHT_;
        this.zoomResetGroup.setAttribute(
            'transform', 'translate(0, ' + zoomResetTranslateY + ')');
      }
    } else {
      const zoomInTranslateY =
          this.zoomResetGroup ? this.LARGE_SPACING_ + this.HEIGHT_ : 0;
      this.zoomInGroup?.setAttribute(
          'transform', 'translate(0, ' + zoomInTranslateY + ')');
      const zoomOutTranslateY =
          zoomInTranslateY + this.SMALL_SPACING_ + this.HEIGHT_;
      this.zoomOutGroup?.setAttribute(
          'transform', 'translate(0, ' + zoomOutTranslateY + ')');
    }

    this.top_ = positionRect.top;
    this.left_ = positionRect.left;
    this.svgGroup?.setAttribute(
        'transform', 'translate(' + this.left_ + ',' + this.top_ + ')');
  }

  /**
   * Create the zoom in icon and its event handler.
   *
   * @param rnd The random string to use as a suffix in the clip path's ID.
   *     These IDs must be unique in case there are multiple Blockly instances
   *     on the same page.
   */
  private createZoomOutSvg_(rnd: string) {
    /* This markup will be generated and added to the .svgGroup:
        <g class="blocklyZoom">
          <clipPath id="blocklyZoomoutClipPath837493">
            <rect width="32" height="32></rect>
          </clipPath>
          <image width="96" height="124" x="-64" y="-92"
        xlink:href="media/sprites.png"
              clip-path="url(#blocklyZoomoutClipPath837493)"></image>
        </g>
        */
    this.zoomOutGroup =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoomoutClipPath' + rnd},
        this.zoomOutGroup);
    dom.createSvgElement(
        Svg.RECT, {
          'width': 32,
          'height': 32,
        },
        clip);
    const zoomoutSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'x': -64,
          'y': -92,
          'clip-path': 'url(#blocklyZoomoutClipPath' + rnd + ')',
        },
        this.zoomOutGroup);
    zoomoutSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace.options.pathToMedia + SPRITE.url);

    // Attach listener.
    this.onZoomOutWrapper_ = browserEvents.conditionalBind(
        this.zoomOutGroup, 'mousedown', null, this.zoom_.bind(this, -1));
  }

  /**
   * Create the zoom out icon and its event handler.
   *
   * @param rnd The random string to use as a suffix in the clip path's ID.
   *     These IDs must be unique in case there are multiple Blockly instances
   *     on the same page.
   */
  private createZoomInSvg_(rnd: string) {
    /* This markup will be generated and added to the .svgGroup:
        <g class="blocklyZoom">
          <clipPath id="blocklyZoominClipPath837493">
            <rect width="32" height="32"></rect>
          </clipPath>
          <image width="96" height="124" x="-32" y="-92"
        xlink:href="media/sprites.png"
              clip-path="url(#blocklyZoominClipPath837493)"></image>
        </g>
        */
    this.zoomInGroup =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoominClipPath' + rnd}, this.zoomInGroup);
    dom.createSvgElement(
        Svg.RECT, {
          'width': 32,
          'height': 32,
        },
        clip);
    const zoominSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'x': -32,
          'y': -92,
          'clip-path': 'url(#blocklyZoominClipPath' + rnd + ')',
        },
        this.zoomInGroup);
    zoominSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace.options.pathToMedia + SPRITE.url);

    // Attach listener.
    this.onZoomInWrapper_ = browserEvents.conditionalBind(
        this.zoomInGroup, 'mousedown', null, this.zoom_.bind(this, 1));
  }

  /**
   * Handles a mouse down event on the zoom in or zoom out buttons on the
   *    workspace.
   *
   * @param amount Amount of zooming. Negative amount values zoom out, and
   *     positive amount values zoom in.
   * @param e A mouse down event.
   */
  private zoom_(amount: number, e: Event) {
    this.workspace.markFocused();
    this.workspace.zoomCenter(amount);
    this.fireZoomEvent_();
    Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();           // Don't start a workspace scroll.
    e.preventDefault();            // Stop double-clicking from selecting text.
  }

  /**
   * Create the zoom reset icon and its event handler.
   *
   * @param rnd The random string to use as a suffix in the clip path's ID.
   *     These IDs must be unique in case there are multiple Blockly instances
   *     on the same page.
   */
  private createZoomResetSvg_(rnd: string) {
    /* This markup will be generated and added to the .svgGroup:
        <g class="blocklyZoom">
          <clipPath id="blocklyZoomresetClipPath837493">
            <rect width="32" height="32"></rect>
          </clipPath>
          <image width="96" height="124" x="-32" y="-92"
        xlink:href="media/sprites.png"
              clip-path="url(#blocklyZoomresetClipPath837493)"></image>
        </g>
        */
    this.zoomResetGroup =
        dom.createSvgElement(Svg.G, {'class': 'blocklyZoom'}, this.svgGroup);
    const clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyZoomresetClipPath' + rnd},
        this.zoomResetGroup);
    dom.createSvgElement(Svg.RECT, {'width': 32, 'height': 32}, clip);
    const zoomresetSvg = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'height': SPRITE.height,
          'y': -92,
          'clip-path': 'url(#blocklyZoomresetClipPath' + rnd + ')',
        },
        this.zoomResetGroup);
    zoomresetSvg.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace.options.pathToMedia + SPRITE.url);

    // Attach event listeners.
    this.onZoomResetWrapper_ = browserEvents.conditionalBind(
        this.zoomResetGroup, 'mousedown', null, this.resetZoom_.bind(this));
  }

  /**
   * Handles a mouse down event on the reset zoom button on the workspace.
   *
   * @param e A mouse down event.
   */
  private resetZoom_(e: Event) {
    this.workspace.markFocused();

    // zoom is passed amount and computes the new scale using the formula:
    // targetScale = currentScale * Math.pow(speed, amount)
    const targetScale = this.workspace.options.zoomOptions.startScale;
    const currentScale = this.workspace.scale;
    const speed = this.workspace.options.zoomOptions.scaleSpeed;
    // To compute amount:
    // amount = log(speed, (targetScale / currentScale))
    // Math.log computes natural logarithm (ln), to change the base, use
    // formula: log(base, value) = ln(value) / ln(base)
    const amount = Math.log(targetScale / currentScale) / Math.log(speed);
    this.workspace.beginCanvasTransition();
    this.workspace.zoomCenter(amount);
    this.workspace.scrollCenter();

    setTimeout(this.workspace.endCanvasTransition.bind(this.workspace), 500);
    this.fireZoomEvent_();
    Touch.clearTouchIdentifier();  // Don't block future drags.
    e.stopPropagation();           // Don't start a workspace scroll.
    e.preventDefault();            // Stop double-clicking from selecting text.
  }

  /** Fires a zoom control UI event. */
  private fireZoomEvent_() {
    const uiEvent = new (eventUtils.get(eventUtils.CLICK))(
        null, this.workspace.id, 'zoom_controls');
    eventUtils.fire(uiEvent);
  }
}

/** CSS for zoom controls.  See css.js for use. */
Css.register(`
.blocklyZoom>image, .blocklyZoom>svg>image {
  opacity: .4;
}

.blocklyZoom>image:hover, .blocklyZoom>svg>image:hover {
  opacity: .6;
}

.blocklyZoom>image:active, .blocklyZoom>svg>image:active {
  opacity: .8;
}
`);
