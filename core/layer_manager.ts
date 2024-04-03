/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {WorkspaceSvg} from './workspace_svg.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import {IRenderedElement} from './interfaces/i_rendered_element.js';
import * as layerNums from './layers.js';
import {Coordinate} from './utils/coordinate.js';

/** @internal */
export class LayerManager {
  /** The layer elements being dragged are appended to. */
  private dragLayer: SVGGElement | undefined;
  /** The layers elements not being dragged are appended to.  */
  private layers = new Map<number, SVGGElement>();

  /** @internal */
  constructor(private workspace: WorkspaceSvg) {
    const injectionDiv = workspace.getInjectionDiv();
    // `getInjectionDiv` is actually nullable. We hit this if the workspace
    // is part of a flyout and the workspace the flyout is attached to hasn't
    // been appended yet.
    if (injectionDiv) {
      this.dragLayer = this.createDragLayer(injectionDiv);
    }

    // We construct these manually so we can add the css class for backwards
    // compatibility.
    const blockLayer = this.createLayer(layerNums.BLOCK);
    dom.addClass(blockLayer, 'blocklyBlockCanvas');
    const bubbleLayer = this.createLayer(layerNums.BUBBLE);
    dom.addClass(bubbleLayer, 'blocklyBubbleCanvas');
  }

  private createDragLayer(injectionDiv: Element) {
    const svg = dom.createSvgElement(Svg.SVG, {
      'class': 'blocklyBlockDragSurface',
      'xmlns': dom.SVG_NS,
      'xmlns:html': dom.HTML_NS,
      'xmlns:xlink': dom.XLINK_NS,
      'version': '1.1',
    });
    injectionDiv.append(svg);
    return dom.createSvgElement(Svg.G, {}, svg);
  }

  /**
   * Translates layers when the workspace is dragged or zoomed.
   *
   * @internal
   */
  translateLayers(newCoord: Coordinate, newScale: number) {
    const translation = `translate(${newCoord.x}, ${newCoord.y}) scale(${newScale})`;
    this.dragLayer?.setAttribute('transform', translation);
    for (const [_, layer] of this.layers) {
      layer.setAttribute('transform', translation);
    }
  }

  /**
   * Moves the given element to the drag layer, which exists on top of all other
   * layers, and the drag surface.
   *
   * @internal
   */
  moveToDragLayer(elem: IRenderedElement) {
    this.dragLayer?.appendChild(elem.getSvgRoot());
  }

  /**
   * Moves the given element off of the drag layer.
   *
   * @internal
   */
  moveOffDragLayer(elem: IRenderedElement, layerNum: number) {
    this.append(elem, layerNum);
  }

  /**
   * Appends the given element to a layer. If the layer does not exist, it is
   * created.
   *
   * @internal
   */
  append(elem: IRenderedElement, layerNum: number) {
    if (!this.layers.has(layerNum)) {
      this.createLayer(layerNum);
    }
    this.layers.get(layerNum)?.appendChild(elem.getSvgRoot());
  }

  /**
   * Creates a layer and inserts it at the proper place given the layer number.
   *
   * More positive layers exist later in the dom and are rendered ontop of
   * less positive layers. Layers are added to the layer map as a side effect.
   */
  private createLayer(layerNum: number): SVGGElement {
    const parent = this.workspace.getSvgGroup();
    const layer = dom.createSvgElement(Svg.G, {});

    let inserted = false;
    const sortedLayers = [...this.layers].sort((a, b) => a[0] - b[0]);
    for (const [num, sib] of sortedLayers) {
      if (layerNum < num) {
        parent.insertBefore(layer, sib);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      parent.appendChild(layer);
    }
    this.layers.set(layerNum, layer);
    return layer;
  }

  /**
   * Returns true if the given element is a layer managed by the layer manager.
   * False otherwise.
   *
   * @internal
   */
  hasLayer(elem: SVGElement) {
    return (
      elem === this.dragLayer ||
      new Set(this.layers.values()).has(elem as SVGGElement)
    );
  }

  /**
   * We need to be able to access this layer explicitly for backwards
   * compatibility.
   *
   * @internal
   */
  getBlockLayer(): SVGGElement {
    return this.layers.get(layerNums.BLOCK)!;
  }

  /**
   * We need to be able to access this layer explicitly for backwards
   * compatibility.
   *
   * @internal
   */
  getBubbleLayer(): SVGGElement {
    return this.layers.get(layerNums.BUBBLE)!;
  }
}
