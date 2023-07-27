/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IPaster} from '../interfaces/i_paster.js';
import {CopyData} from '../interfaces/i_copyable.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {WorkspaceCommentSvg} from '../workspace_comment_svg.js';

export class WorkspaceCommentPaster
  implements IPaster<WorkspaceCommentCopyData, WorkspaceCommentSvg>
{
  paste(
    copyData: WorkspaceCommentCopyData,
    workspace: WorkspaceSvg,
    coordinate?: Coordinate,
  ): WorkspaceCommentSvg {
    const state = copyData.saveInfo as Element;
    if (coordinate) {
      state.setAttribute('x', `${coordinate.x}`);
      state.setAttribute('y', `${coordinate.y}`);
    }
    return WorkspaceCommentSvg.fromXmlRendered(state, workspace);
  }
}

export interface WorkspaceCommentCopyData extends CopyData {}
