/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @internal */
export interface IRenderedElement {
  /**
   * @returns The root SVG element of htis rendered element.
   */
  getSvgRoot(): SVGElement;
}

/**
 * @returns True if the given object is an IRenderedElement.
 *
 * @internal
 */
export function isRenderedElement(obj: any): obj is IRenderedElement {
  return obj['getSvgRoot'] !== undefined;
}
