/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.blockRendering.PathObject

import type {BlockSvg} from '../../block_svg.js';
import type {Connection} from '../../connection.js';
import {RenderedConnection} from '../../rendered_connection.js';
import type {BlockStyle} from '../../theme.js';
import {Coordinate} from '../../utils/coordinate.js';
import * as dom from '../../utils/dom.js';
import {Svg} from '../../utils/svg.js';
import type {ConstantProvider} from './constants.js';
import type {IPathObject} from './i_path_object.js';

/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 */
export class PathObject implements IPathObject {
  svgRoot: SVGElement;
  svgPath: SVGElement;

  constants: ConstantProvider;
  style: BlockStyle;

  /** Highlight paths associated with connections. */
  private connectionHighlights = new WeakMap<RenderedConnection, SVGElement>();

  /** Locations of connection highlights. */
  private highlightOffsets = new WeakMap<RenderedConnection, Coordinate>();

  /**
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @param constants The renderer's constants.
   */
  constructor(
    root: SVGElement,
    style: BlockStyle,
    constants: ConstantProvider,
  ) {
    this.constants = constants;
    this.style = style;
    this.svgRoot = root;

    /** The primary path of the block. */
    this.svgPath = dom.createSvgElement(
      Svg.PATH,
      {'class': 'blocklyPath'},
      this.svgRoot,
    );

    this.setClass_('blocklyBlock', true);
  }

  /**
   * Set the path generated by the renderer onto the respective SVG element.
   *
   * @param pathString The path.
   */
  setPath(pathString: string) {
    this.svgPath.setAttribute('d', pathString);
  }

  /**
   * Flip the SVG paths in RTL.
   */
  flipRTL() {
    // Mirror the block's path.
    this.svgPath.setAttribute('transform', 'scale(-1 1)');
  }

  /**
   * Apply the stored colours to the block's path, taking into account whether
   * the paths belong to a shadow block.
   *
   * @param block The source block.
   */
  applyColour(block: BlockSvg) {
    this.svgPath.setAttribute('stroke', this.style.colourTertiary);
    this.svgPath.setAttribute('fill', this.style.colourPrimary);

    this.updateShadow_(block.isShadow());
    this.updateDisabled_(!block.isEnabled() || block.getInheritedDisabled());
  }

  /**
   * Set the style.
   *
   * @param blockStyle The block style to use.
   */
  setStyle(blockStyle: BlockStyle) {
    this.style = blockStyle;
  }

  /**
   * Add or remove the given CSS class on the path object's root SVG element.
   *
   * @param className The name of the class to add or remove
   * @param add True if the class should be added.  False if it should be
   *     removed.
   */
  protected setClass_(className: string, add: boolean) {
    if (!className) {
      return;
    }
    if (add) {
      dom.addClass(this.svgRoot, className);
    } else {
      dom.removeClass(this.svgRoot, className);
    }
  }

  /**
   * Set whether the block shows a highlight or not.  Block highlighting is
   * often used to visually mark blocks currently being executed.
   *
   * @param enable True if highlighted.
   */

  updateHighlighted(enable: boolean) {
    if (enable) {
      this.setClass_('blocklyHighlighted', true);
    } else {
      this.setClass_('blocklyHighlighted', false);
    }
  }

  /**
   * Updates the look of the block to reflect a shadow state.
   *
   * @param shadow True if the block is a shadow block.
   */
  protected updateShadow_(shadow: boolean) {
    if (shadow) {
      this.setClass_('blocklyShadow', true);
      this.svgPath.setAttribute('stroke', 'none');
      this.svgPath.setAttribute('fill', this.style.colourSecondary);
    } else {
      this.setClass_('blocklyShadow', false);
    }
  }

  /**
   * Updates the look of the block to reflect a disabled state.
   *
   * @param disabled True if disabled.
   */
  protected updateDisabled_(disabled: boolean) {
    this.setClass_('blocklyDisabled', disabled);
    this.setClass_('blocklyDisabledPattern', disabled);
  }

  /**
   * Add or remove styling showing that a block is selected.
   *
   * @param enable True if selection is enabled, false otherwise.
   */
  updateSelected(enable: boolean) {
    this.setClass_('blocklySelected', enable);
  }

  /**
   * Add or remove styling showing that a block is dragged over a delete area.
   *
   * @param enable True if the block is being dragged over a delete area, false
   *     otherwise.
   */
  updateDraggingDelete(enable: boolean) {
    this.setClass_('blocklyDraggingDelete', enable);
  }

  /**
   * Add or remove styling showing that a block is an insertion marker.
   *
   * @param enable True if the block is an insertion marker, false otherwise.
   */
  updateInsertionMarker(enable: boolean) {
    this.setClass_('blocklyInsertionMarker', enable);
  }

  /**
   * Add or remove styling showing that a block is movable.
   *
   * @param enable True if the block is movable, false otherwise.
   */
  updateMovable(enable: boolean) {
    this.setClass_('blocklyDraggable', enable);
  }

  /**
   * Add or remove styling that shows that if the dragging block is dropped,
   * this block will be replaced.  If a shadow block, it will disappear.
   * Otherwise it will bump.
   *
   * @param enable True if styling should be added.
   */
  updateReplacementFade(enable: boolean) {
    this.setClass_('blocklyReplaceable', enable);
  }

  /**
   * Add or remove styling that shows that if the dragging block is dropped,
   * this block will be connected to the input.
   *
   * @param _conn The connection on the input to highlight.
   * @param _enable True if styling should be added.
   */
  updateShapeForInputHighlight(_conn: Connection, _enable: boolean) {
    // NOOP
  }

  /** Adds the given path as a connection highlight for the given connection. */
  addConnectionHighlight(
    connection: RenderedConnection,
    connectionPath: string,
    offset: Coordinate,
    rtl: boolean,
  ): SVGElement {
    const transformation =
      `translate(${offset.x}, ${offset.y})` + (rtl ? ' scale(-1 1)' : '');

    const previousHighlight = this.connectionHighlights.get(connection);
    if (previousHighlight) {
      // Since a connection already exists, make sure that its path and
      // transform are correct.
      previousHighlight.setAttribute('d', connectionPath);
      previousHighlight.setAttribute('transform', transformation);
      return previousHighlight;
    }

    const highlight = dom.createSvgElement(
      Svg.PATH,
      {
        'id': connection.id,
        'class': 'blocklyHighlightedConnectionPath',
        'style': 'display: none;',
        'd': connectionPath,
        'transform': transformation,
      },
      this.svgRoot,
    );
    this.connectionHighlights.set(connection, highlight);
    return highlight;
  }

  /**
   * Removes any highlight associated with the given connection, if it exists.
   */
  removeConnectionHighlight(connection: RenderedConnection) {
    const highlight = this.connectionHighlights.get(connection);
    if (!highlight) return;
    dom.removeNode(highlight);
    this.connectionHighlights.delete(connection);
  }
}
