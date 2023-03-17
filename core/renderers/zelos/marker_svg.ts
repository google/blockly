/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.zelos.MarkerSvg');

import type {BlockSvg} from '../../block_svg.js';
import type {ASTNode} from '../../keyboard_nav/ast_node.js';
import type {Marker} from '../../keyboard_nav/marker.js';
import type {RenderedConnection} from '../../rendered_connection.js';
import * as dom from '../../utils/dom.js';
import {Svg} from '../../utils/svg.js';
import type {WorkspaceSvg} from '../../workspace_svg.js';
import type {ConstantProvider as BaseConstantProvider} from '../common/constants.js';
import {MarkerSvg as BaseMarkerSvg} from '../common/marker_svg.js';

import type {ConstantProvider as ZelosConstantProvider} from './constants.js';


/**
 * Class to draw a marker.
 */
export class MarkerSvg extends BaseMarkerSvg {
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  constants_!: ZelosConstantProvider;

  private markerCircle_: SVGCircleElement|null = null;

  /**
   * @param workspace The workspace the marker belongs to.
   * @param constants The constants for the renderer.
   * @param marker The marker to draw.
   */
  constructor(
      workspace: WorkspaceSvg, constants: BaseConstantProvider,
      marker: Marker) {
    super(workspace, constants, marker);
  }

  /**
   * Position and display the marker for an input or an output connection.
   *
   * @param curNode The node to draw the marker for.
   */
  private showWithInputOutput_(curNode: ASTNode) {
    const block = curNode.getSourceBlock() as BlockSvg;
    const connection = curNode.getLocation() as RenderedConnection;
    const offsetInBlock = connection.getOffsetInBlock();

    this.positionCircle_(offsetInBlock.x, offsetInBlock.y);
    this.setParent_(block);
    this.showCurrent_();
  }

  override showWithOutput_(curNode: ASTNode) {
    this.showWithInputOutput_(curNode);
  }

  override showWithInput_(curNode: ASTNode) {
    this.showWithInputOutput_(curNode);
  }

  /**
   * Draw a rectangle around the block.
   *
   * @param curNode The current node of the marker.
   */
  override showWithBlock_(curNode: ASTNode) {
    const block = curNode.getLocation() as BlockSvg;

    // Gets the height and width of entire stack.
    const heightWidth = block.getHeightWidth();
    // Add padding so that being on a stack looks different than being on a
    // block.
    this.positionRect_(0, 0, heightWidth.width, heightWidth.height);
    this.setParent_(block);
    this.showCurrent_();
  }

  /**
   * Position the circle we use for input and output connections.
   *
   * @param x The x position of the circle.
   * @param y The y position of the circle.
   */
  private positionCircle_(x: number, y: number) {
    this.markerCircle_?.setAttribute('cx', `${x}`);
    this.markerCircle_?.setAttribute('cy', `${y}`);
    this.currentMarkerSvg = this.markerCircle_;
  }

  override hide() {
    super.hide();
    if (this.markerCircle_) {
      this.markerCircle_.style.display = 'none';
    }
  }

  override createDomInternal_() {
    /* clang-format off */
    /* This markup will be generated and added to the .svgGroup_:
        <g>
          <rect width="100" height="5">
            <animate attributeType="XML" attributeName="fill" dur="1s"
              values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
          </rect>
        </g>
        */
    /* clang-format on */
    super.createDomInternal_();

    this.markerCircle_ = dom.createSvgElement(
        Svg.CIRCLE, {
          'r': this.constants_.CURSOR_RADIUS,
          'style': 'display: none',
          'stroke-width': this.constants_.CURSOR_STROKE_WIDTH,
        },
        this.markerSvg_);

    // Markers and stack cursors don't blink.
    if (this.isCursor()) {
      const blinkProperties = this.getBlinkProperties_();
      dom.createSvgElement(Svg.ANIMATE, blinkProperties, this.markerCircle_!);
    }

    return this.markerSvg_!;
  }

  override applyColour_(curNode: ASTNode) {
    super.applyColour_(curNode);

    this.markerCircle_?.setAttribute('fill', this.colour_);
    this.markerCircle_?.setAttribute('stroke', this.colour_);

    if (this.isCursor()) {
      const values = this.colour_ + ';transparent;transparent;';
      this.markerCircle_?.firstElementChild!.setAttribute('values', values);
    }
  }
}
