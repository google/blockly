/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBubble } from "./i_bubble";

export interface IHasBubble {
  /** @returns True if the bubble is currently open, false otherwise. */
  bubbleIsVisible(): boolean;

  /** Sets whether the bubble is open or not. */
  setBubbleVisible(visible: boolean): Promise<void>;

  getBubble(): IBubble | null;
}

/** Type guard that checks whether the given object is a IHasBubble. */
export function hasBubble(obj: any): obj is IHasBubble {
  return (
    obj.bubbleIsVisible !== undefined && obj.setBubbleVisible !== undefined
  );
}
