/** @fileoverview Methods for graphically rendering a marker as SVG. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Methods for graphically rendering a marker as SVG.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from 'google3/third_party/javascript/blockly/core/block_svg';
/* eslint-disable-next-line no-unused-vars */
import { ASTNode } from 'google3/third_party/javascript/blockly/core/keyboard_nav/ast_node';
/* eslint-disable-next-line no-unused-vars */
import { Marker } from 'google3/third_party/javascript/blockly/core/keyboard_nav/marker';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from 'google3/third_party/javascript/blockly/core/rendered_connection';
import * as dom from 'google3/third_party/javascript/blockly/core/utils/dom';
import { Svg } from 'google3/third_party/javascript/blockly/core/utils/svg';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from 'google3/third_party/javascript/blockly/core/workspace_svg';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider as BaseConstantProvider } from '../common/constants';
import { MarkerSvg as BaseMarkerSvg } from '../common/marker_svg';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider as ZelosConstantProvider } from './constants';


/**
 * Class to draw a marker.
 * @alias Blockly.zelos.MarkerSvg
 */
export class MarkerSvg extends BaseMarkerSvg {
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  constants_!: ZelosConstantProvider;

  private markerCircle_: SVGCircleElement | null = null;

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
   * @param x The x position of the circle.
   * @param y The y position of the circle.
   */
  private positionCircle_(x: number, y: number) {
    this.markerCircle_?.setAttribute('cx', x.toString());
    this.markerCircle_?.setAttribute('cy', y.toString());
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

    // AnyDuringMigration because:  Argument of type 'SVGGElement | null' is not
    // assignable to parameter of type 'Element | undefined'.
    this.markerCircle_ = dom.createSvgElement(
      Svg.CIRCLE, {
      'r': this.constants_.CURSOR_RADIUS,
      'style': 'display: none',
      'stroke-width': this.constants_.CURSOR_STROKE_WIDTH,
    },
      this.markerSvg_!);

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
