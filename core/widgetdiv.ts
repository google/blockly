/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.WidgetDiv

import * as common from './common.js';
import * as dom from './utils/dom.js';
import type {Field} from './field.js';
import type {Rect} from './utils/rect.js';
import type {Size} from './utils/size.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/** The object currently using this container. */
let owner: unknown = null;

/** Optional cleanup function set by whichever object uses the widget. */
let dispose: (() => void) | null = null;

/** A class name representing the current owner's workspace renderer. */
let rendererClassName = '';

/** A class name representing the current owner's workspace theme. */
let themeClassName = '';

/** The HTML container for popup overlays (e.g. editor widgets). */
let containerDiv: HTMLDivElement | null;

/**
 * Returns the HTML container for editor widgets.
 *
 * @returns The editor widget container.
 */
export function getDiv(): HTMLDivElement | null {
  return containerDiv;
}

/**
 * Allows unit tests to reset the div. Do not use outside of tests.
 *
 * @param newDiv The new value for the DIV field.
 * @internal
 */
export function testOnly_setDiv(newDiv: HTMLDivElement | null) {
  containerDiv = newDiv;
}

/**
 * Create the widget div and inject it onto the page.
 */
export function createDom() {
  if (containerDiv) {
    return; // Already created.
  }

  containerDiv = document.createElement('div') as HTMLDivElement;
  containerDiv.className = 'blocklyWidgetDiv';
  const container = common.getParentContainer() || document.body;
  container.appendChild(containerDiv);
}

/**
 * Initialize and display the widget div.  Close the old one if needed.
 *
 * @param newOwner The object that will be using this container.
 * @param rtl Right-to-left (true) or left-to-right (false).
 * @param newDispose Optional cleanup function to be run when the widget is
 *     closed.
 */
export function show(newOwner: unknown, rtl: boolean, newDispose: () => void) {
  hide();
  owner = newOwner;
  dispose = newDispose;
  const div = containerDiv;
  if (!div) return;
  div.style.direction = rtl ? 'rtl' : 'ltr';
  div.style.display = 'block';
  const mainWorkspace = common.getMainWorkspace() as WorkspaceSvg;
  rendererClassName = mainWorkspace.getRenderer().getClassName();
  themeClassName = mainWorkspace.getTheme().getClassName();
  if (rendererClassName) {
    dom.addClass(div, rendererClassName);
  }
  if (themeClassName) {
    dom.addClass(div, themeClassName);
  }
}

/**
 * Destroy the widget and hide the div.
 */
export function hide() {
  if (!isVisible()) {
    return;
  }
  owner = null;

  const div = containerDiv;
  if (!div) return;
  div.style.display = 'none';
  div.style.left = '';
  div.style.top = '';
  dispose && dispose();
  dispose = null;
  div.textContent = '';

  if (rendererClassName) {
    dom.removeClass(div, rendererClassName);
    rendererClassName = '';
  }
  if (themeClassName) {
    dom.removeClass(div, themeClassName);
    themeClassName = '';
  }
  (common.getMainWorkspace() as WorkspaceSvg).markFocused();
}

/**
 * Is the container visible?
 *
 * @returns True if visible.
 */
export function isVisible(): boolean {
  return !!owner;
}

/**
 * Destroy the widget and hide the div if it is being used by the specified
 * object.
 *
 * @param oldOwner The object that was using this container.
 */
export function hideIfOwner(oldOwner: unknown) {
  if (owner === oldOwner) {
    hide();
  }
}
/**
 * Set the widget div's position and height.  This function does nothing clever:
 * it will not ensure that your widget div ends up in the visible window.
 *
 * @param x Horizontal location (window coordinates, not body).
 * @param y Vertical location (window coordinates, not body).
 * @param height The height of the widget div (pixels).
 */
function positionInternal(x: number, y: number, height: number) {
  containerDiv!.style.left = x + 'px';
  containerDiv!.style.top = y + 'px';
  containerDiv!.style.height = height + 'px';
}

/**
 * Position the widget div based on an anchor rectangle.
 * The widget should be placed adjacent to but not overlapping the anchor
 * rectangle.  The preferred position is directly below and aligned to the left
 * (LTR) or right (RTL) side of the anchor.
 *
 * @param viewportBBox The bounding rectangle of the current viewport, in window
 *     coordinates.
 * @param anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param widgetSize The size of the widget that is inside the widget div, in
 *     window coordinates.
 * @param rtl Whether the workspace is in RTL mode.  This determines horizontal
 *     alignment.
 * @internal
 */
export function positionWithAnchor(
  viewportBBox: Rect,
  anchorBBox: Rect,
  widgetSize: Size,
  rtl: boolean,
) {
  const y = calculateY(viewportBBox, anchorBBox, widgetSize);
  const x = calculateX(viewportBBox, anchorBBox, widgetSize, rtl);

  if (y < 0) {
    positionInternal(x, 0, widgetSize.height + y);
  } else {
    positionInternal(x, y, widgetSize.height);
  }
}

/**
 * Calculate an x position (in window coordinates) such that the widget will not
 * be offscreen on the right or left.
 *
 * @param viewportBBox The bounding rectangle of the current viewport, in window
 *     coordinates.
 * @param anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param widgetSize The dimensions of the widget inside the widget div.
 * @param rtl Whether the Blockly workspace is in RTL mode.
 * @returns A valid x-coordinate for the top left corner of the widget div, in
 *     window coordinates.
 */
function calculateX(
  viewportBBox: Rect,
  anchorBBox: Rect,
  widgetSize: Size,
  rtl: boolean,
): number {
  if (rtl) {
    // Try to align the right side of the field and the right side of widget.
    const widgetLeft = anchorBBox.right - widgetSize.width;
    // Don't go offscreen left.
    const x = Math.max(widgetLeft, viewportBBox.left);
    // But really don't go offscreen right:
    return Math.min(x, viewportBBox.right - widgetSize.width);
  } else {
    // Try to align the left side of the field and the left side of widget.
    // Don't go offscreen right.
    const x = Math.min(anchorBBox.left, viewportBBox.right - widgetSize.width);
    // But left is more important, because that's where the text is.
    return Math.max(x, viewportBBox.left);
  }
}

/**
 * Calculate a y position (in window coordinates) such that the widget will not
 * be offscreen on the top or bottom.
 *
 * @param viewportBBox The bounding rectangle of the current viewport, in window
 *     coordinates.
 * @param anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param widgetSize The dimensions of the widget inside the widget div.
 * @returns A valid y-coordinate for the top left corner of the widget div, in
 *     window coordinates.
 */
function calculateY(
  viewportBBox: Rect,
  anchorBBox: Rect,
  widgetSize: Size,
): number {
  // Flip the widget vertically if off the bottom.
  // The widget could go off the top of the window, but it would also go off
  // the bottom.  The window is just too small.
  if (anchorBBox.bottom + widgetSize.height >= viewportBBox.bottom) {
    // The bottom of the widget is at the top of the field.
    return anchorBBox.top - widgetSize.height;
  } else {
    // The top of the widget is at the bottom of the field.
    return anchorBBox.bottom;
  }
}

/**
 * Determine if the owner is a field for purposes of repositioning.
 * We can't simply check `instanceof Field` as that would introduce a circular
 * dependency.
 */
function isRepositionable(item: any): item is Field {
  return !!item?.repositionForWindowResize;
}

/**
 * Reposition the widget div if the owner of it says to.
 * If the owner isn't a field, just give up and hide it.
 */
export function repositionForWindowResize(): void {
  if (!isRepositionable(owner) || !owner.repositionForWindowResize()) {
    // If the owner is not a Field, or if the owner returns false from the
    // reposition method, we should hide the widget div. Otherwise, we'll assume
    // the owner handled any needed resize.
    hide();
  }
}
