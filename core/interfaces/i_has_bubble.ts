/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IHasBubble {
  /** @returns True if the bubble is currently open, false otherwise. */
  bubbleIsVisible(): boolean;

  /** Sets whether the bubble is open or not. */
  setBubbleVisible(visible: boolean): Promise<void>;
}

/** Type guard that checks whether the given object is a IHasBubble. */
export function hasBubble(obj: any): obj is IHasBubble {
  return (
    obj.bubbleIsVisible !== undefined && obj.setBubbleVisible !== undefined
  );
}
