/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Coordinate} from '../utils/coordinate';

export interface IDragger {
  /** Handles any drag startup. */
  onDragStart(e: PointerEvent): void;

  /** Handles calculating where the element should actually be moved to. */
  onDrag(e: PointerEvent, totalDelta: Coordinate): void;

  /** Handles any drag cleanup. */
  onDragEnd(e: PointerEvent): void;
}
