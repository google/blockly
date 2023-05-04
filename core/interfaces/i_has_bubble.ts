/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


export interface IHasBubble {
  /** @return True if the bubble is currently open, false otherwise. */
  isBubbleVisible(): boolean;

  /** Sets whether the bubble is open or not. */
  setBubbleVisible(visible: boolean): void;
}
