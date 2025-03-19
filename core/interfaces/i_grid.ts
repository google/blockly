import {BlocklyOptions} from '../blockly_options.js';
import {GridOptions} from '../options.js';
import {Coordinate} from '../utils';
import type {IRegistrable} from './i_registrable.js';

export interface IGrid {
  /**
   * Sets the spacing between the centers of the grid lines.
   *
   * This does not trigger snapping to the newly spaced grid. If you want to
   * snap blocks to the grid programmatically that needs to be triggered
   * on individual top-level blocks. The next time a block is dragged and
   * dropped it will snap to the grid if snapping to the grid is enabled.
   */
  setSpacing(spacing: number): void;

  /**
   * Get the spacing of the grid points (in px).
   *
   * @returns The spacing of the grid points.
   */
  getSpacing(): number;

  /** Sets the length of the grid lines. */
  setLength(length: number): void;

  /** Get the length of the grid lines (in px). */
  getLength(): number;

  /**
   * Sets whether blocks should snap to the grid or not.
   *
   * Setting this to true does not trigger snapping. If you want to snap blocks
   * to the grid programmatically that needs to be triggered on individual
   * top-level blocks. The next time a block is dragged and dropped it will
   * snap to the grid.
   */
  setSnapToGrid(snap: boolean): void;

  /**
   * Whether blocks should snap to the grid.
   *
   * @returns True if blocks should snap, false otherwise.
   */
  shouldSnap(): boolean;

  /**
   * Get the ID of the pattern element, which should be randomized to avoid
   * conflicts with other Blockly instances on the page.
   *
   * @returns The pattern ID.
   * @internal
   */
  getPatternId(): string;

  /**
   * Update the grid with a new scale.
   *
   * @param scale The new workspace scale.
   * @internal
   */
  update(scale: number): void;

  /**
   * Move the grid to a new x and y position, and make sure that change is
   * visible.
   *
   * @param x The new x position of the grid (in px).
   * @param y The new y position of the grid (in px).
   * @internal
   */
  moveTo(x: number, y: number): void;

  /**
   * Given a coordinate, return the nearest coordinate aligned to the grid.
   *
   * @param xy A workspace coordinate.
   * @returns Workspace coordinate of nearest grid point.
   *   If there's no change, return the same coordinate object.
   */
  alignXY(xy: Coordinate): Coordinate;
}

export interface IGridProvider extends IRegistrable {
  /**
   * Create the DOM for the grid described by options.
   *
   * @param rnd A random ID to append to the pattern's ID.
   * @param gridOptions The object containing grid configuration.
   * @param defs The root SVG element for this workspace's defs.
   * @returns The SVG element for the grid pattern.
   */
  createDom(
    rnd: string,
    gridOptions: GridOptions,
    defs: SVGElement,
  ): SVGElement;

  /**
   * Parse the user-specified grid options, using reasonable defaults where
   * behaviour is unspecified. See grid documentation:
   *   https://developers.google.com/blockly/guides/configure/web/grid
   *
   * @param options Dictionary of options.
   * @returns Normalized grid options.
   */
  parseGridOptions(options: BlocklyOptions): GridOptions;

  /**
   * @param pattern The grid's SVG pattern, created during injection.
   * @param options A dictionary of normalized options for the grid.
   *     See grid documentation:
   *     https://developers.google.com/blockly/guides/configure/web/grid
   */
  createGrid(pattern: SVGElement, options: GridOptions): IGrid;
}
