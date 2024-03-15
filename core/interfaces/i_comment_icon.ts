/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IconType} from '../icons.js';
import {IIcon, isIcon} from './i_icon.js';
import {Size} from '../utils/size.js';
import {IHasBubble, hasBubble} from './i_has_bubble.js';

export interface ICommentIcon extends IIcon, IHasBubble {
  setText(text: string): void;

  getText(): string;

  setBubbleSize(size: Size): void;

  getBubbleSize(): Size;
}

/** Checks whether the given object is an ICommentIcon. */
export function isCommentIcon(obj: Object): obj is ICommentIcon {
  return (
    isIcon(obj) &&
    hasBubble(obj) &&
    (obj as any)['setText'] !== undefined &&
    (obj as any)['getText'] !== undefined &&
    (obj as any)['setBubbleSize'] !== undefined &&
    (obj as any)['getBubbleSize'] !== undefined &&
    obj.getType() === IconType.COMMENT
  );
}
