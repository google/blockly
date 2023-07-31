/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IPaster} from '../interfaces/i_paster.js';
import {ICopyData} from '../interfaces/i_copyable.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {WorkspaceCommentSvg} from '../workspace_comment_svg.js';
import {registry} from '../clipboard.js';

export class WorkspaceCommentPaster
  implements IPaster<WorkspaceCommentCopyData, WorkspaceCommentSvg>
{
  static TYPE = 'workspace-comment';

  paste(
    copyData: WorkspaceCommentCopyData,
    workspace: WorkspaceSvg,
    coordinate?: Coordinate,
  ): WorkspaceCommentSvg {
    if (coordinate) {
      copyData.saveInfo.setAttribute('x', `${coordinate.x}`);
      copyData.saveInfo.setAttribute('y', `${coordinate.y}`);
    }
    return WorkspaceCommentSvg.fromXmlRendered(copyData.saveInfo, workspace);
  }
}

export interface WorkspaceCommentCopyData extends ICopyData {
  saveInfo: Element;
}

registry.register(WorkspaceCommentPaster.TYPE, new WorkspaceCommentPaster());
