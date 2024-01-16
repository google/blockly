/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from '../block_svg.js';
import {IConnectionPreviewer} from '../interfaces/i_connection_previewer.js';
import {RenderedConnection} from '../rendered_connection.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class InsertionMarkerPreviewer implements IConnectionPreviewer {
  private readonly workspace: WorkspaceSvg;

  private fadedBlock: BlockSvg | null = null;

  constructor(draggedBlock: BlockSvg) {
    this.workspace = draggedBlock.workspace;
  }

  /**
   * Display a connection preview where the draggedCon connects to the
   * staticCon, replacing the replacedBlock (currently connected to the
   * staticCon).
   *
   * @param draggedConn The connection on the block stack being dragged.
   * @param staticConn The connection not being dragged that we are
   *     connecting to.
   * @param replacedBlock The block currently connected to the staticCon that
   *     is being replaced.
   */
  previewReplacement(
    draggedConn: RenderedConnection,
    staticConn: RenderedConnection,
    replacedBlock: BlockSvg,
  ) {
    this.hidePreview();
    this.fadedBlock = replacedBlock;
    replacedBlock.fadeForReplacement(true);
  }

  /**
   * Display a connection preview where the draggedCon connects to the
   * staticCon, and no block is being relaced.
   *
   * @param draggedConn The connection on the block stack being dragged.
   * @param staticConn The connection not being dragged that we are
   *     connecting to.
   */
  previewConnection(
    // draggedConn: RenderedConnection,
    // staticConn: RenderedConnection,
  ) {}

  /** Hide any previews that are currently displayed. */
  hidePreview() {
    if (this.fadedBlock) {
      this.fadedBlock.fadeForReplacement(false);
      this.fadedBlock = null;
    }
  }

  /** Dispose of any references held by this connection previewer. */
  dispose() {
    this.hidePreview();
  }
}
