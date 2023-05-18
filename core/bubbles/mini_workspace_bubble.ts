/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Abstract as AbstractEvent} from '../events/events_abstract.js';
import type {BlocklyOptions} from '../blockly_options.js';
import {Bubble} from './bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Options} from '../options.js';
import {Svg} from '../utils/svg.js';
import type {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

export class MiniWorkspaceBubble extends Bubble {
  /**
   * The minimum amount of change to the mini workspace view to trigger
   * resizing the bubble.
   */
  private static readonly MINIMUM_VIEW_CHANGE = 10;

  /** The root svg element containing the workspace. */
  private svgDialog: SVGElement;

  /** The workspace that gets shown within this bubble. */
  private miniWorkspace: WorkspaceSvg;

  /**
   * Should this bubble automatically reposition itself when it resizes?
   * Becomes false after this bubble is first dragged.
   */
  private autoLayout = true;

  /** @internal */
  constructor(
    workspaceOptions: BlocklyOptions,
    protected readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect
  ) {
    super(workspace, anchor, ownerRect);
    const options = new Options(workspaceOptions);
    this.validateWorkspaceOptions(options);

    this.svgDialog = dom.createSvgElement(
      Svg.SVG,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      this.contentContainer
    );
    workspaceOptions.parentWorkspace = this.workspace;
    this.miniWorkspace = this.newWorkspaceSvg(new Options(workspaceOptions));
    const background = this.miniWorkspace.createDom('blocklyMutatorBackground');
    this.svgDialog.appendChild(background);
    if (options.languageTree) {
      background.insertBefore(
        this.miniWorkspace.addFlyout(Svg.G),
        this.miniWorkspace.getCanvas()
      );
      const flyout = this.miniWorkspace.getFlyout();
      flyout?.init(this.miniWorkspace);
      flyout?.show(options.languageTree);
    }

    this.miniWorkspace.addChangeListener(this.updateBubbleSize.bind(this));
    this.miniWorkspace
      .getFlyout()
      ?.getWorkspace()
      ?.addChangeListener(this.updateBubbleSize.bind(this));
    this.updateBubbleSize();
  }

  dispose() {
    this.miniWorkspace.dispose();
    super.dispose();
  }

  /** @internal */
  getWorkspace(): WorkspaceSvg {
    return this.miniWorkspace;
  }

  /** Adds a change listener to the mini workspace. */
  addWorkspaceChangeListener(listener: (e: AbstractEvent) => void) {
    this.miniWorkspace.addChangeListener(listener);
  }

  /**
   * Validates the workspace options to make sure folks aren't trying to
   * enable things the miniworkspace doesn't support.
   */
  private validateWorkspaceOptions(options: Options) {
    if (options.hasCategories) {
      throw new Error(
        'The miniworkspace bubble does not support toolboxes with categories'
      );
    }
    if (options.hasTrashcan) {
      throw new Error('The miniworkspace bubble does not support trashcans');
    }
    if (
      options.zoomOptions.controls ||
      options.zoomOptions.wheel ||
      options.zoomOptions.pinch
    ) {
      throw new Error('The miniworkspace bubble does not support zooming');
    }
    if (
      options.moveOptions.scrollbars ||
      options.moveOptions.wheel ||
      options.moveOptions.drag
    ) {
      throw new Error(
        'The miniworkspace bubble does not scrolling/moving the workspace'
      );
    }
    if (options.horizontalLayout) {
      throw new Error(
        'The miniworkspace bubble does not support horizontal layouts'
      );
    }
  }

  /**
   * Updates the size of this bubble to account for the size of the
   * mini workspace.
   */
  private updateBubbleSize() {
    if (this.miniWorkspace.isDragging()) return;

    const currSize = this.getSize();
    const newSize = this.calculateWorkspaceSize();
    if (
      Math.abs(currSize.width - newSize.width) <
        MiniWorkspaceBubble.MINIMUM_VIEW_CHANGE &&
      Math.abs(currSize.height - newSize.height) <
        MiniWorkspaceBubble.MINIMUM_VIEW_CHANGE
    ) {
      // Only resize if the size has noticeably changed.
      return;
    }
    this.svgDialog.setAttribute('width', `${newSize.width}px`);
    this.svgDialog.setAttribute('height', `${newSize.height}px`);
    this.miniWorkspace.setCachedParentSvgSize(newSize.width, newSize.height);
    if (this.miniWorkspace.RTL) {
      // Scroll the workspace to always left-align.
      this.miniWorkspace
        .getCanvas()
        .setAttribute('transform', `translate(${newSize.width}, 0)`);
    }
    this.setSize(
      new Size(
        newSize.width + Bubble.DOUBLE_BORDER,
        newSize.height + Bubble.DOUBLE_BORDER
      ),
      this.autoLayout
    );
    this.miniWorkspace.resize();
    this.miniWorkspace.recordDragTargets();
  }

  /**
   * Calculates the size of the mini workspace for use in resizing the bubble.
   */
  private calculateWorkspaceSize(): Size {
    const canvas = this.miniWorkspace.getCanvas();
    const bbox = canvas.getBBox();
    let width = bbox.width + Bubble.DOUBLE_BORDER * 3;
    let height = bbox.height + bbox.y + Bubble.DOUBLE_BORDER * 3;
    const flyout = this.miniWorkspace.getFlyout();
    if (flyout) {
      const flyoutScrollMetrics = flyout
        .getWorkspace()
        .getMetricsManager()
        .getScrollMetrics();
      height = Math.max(height, flyoutScrollMetrics.height + 20);
      width += flyout.getWidth();
    }
    return new Size(width, height);
  }

  /**
   * Move this bubble during a drag.
   *
   * @param newLoc The location to translate to, in workspace coordinates.
   * @internal
   */
  moveDuringDrag(newLoc: Coordinate): void {
    super.moveDuringDrag(newLoc);
    this.autoLayout = false;
  }

  /** @internal */
  moveTo(x: number, y: number): void {
    super.moveTo(x, y);
    this.miniWorkspace.recordDragTargets();
  }

  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  newWorkspaceSvg(options: Options): WorkspaceSvg {
    throw new Error(
      'The implementation of newWorkspaceSvg should be ' +
        'monkey-patched in by blockly.ts'
    );
  }
}
