/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object in charge of managing markers and the cursor.
 *
 * @class
 */
// Former goog.module ID: Blockly.MarkerManager

import type {Cursor} from './keyboard_nav/cursor.js';
import type {Marker} from './keyboard_nav/marker.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class to manage the multiple markers and the cursor on a workspace.
 */
export class MarkerManager {
  /** The name of the local marker. */
  static readonly LOCAL_MARKER = 'local_marker_1';

  /** The cursor. */
  private cursor: Cursor | null = null;

  /** The cursor's SVG element. */
  private cursorSvg: SVGElement | null = null;

  /** The map of markers for the workspace. */
  private markers = new Map<string, Marker>();

  /** The marker's SVG element. */
  private markerSvg: SVGElement | null = null;

  /**
   * @param workspace The workspace for the marker manager.
   * @internal
   */
  constructor(private readonly workspace: WorkspaceSvg) {}

  /**
   * Register the marker by adding it to the map of markers.
   *
   * @param id A unique identifier for the marker.
   * @param marker The marker to register.
   */
  registerMarker(id: string, marker: Marker) {
    if (this.markers.has(id)) {
      this.unregisterMarker(id);
    }
    marker.setDrawer(
      this.workspace.getRenderer().makeMarkerDrawer(this.workspace, marker),
    );
    this.setMarkerSvg(marker.getDrawer().createDom());
    this.markers.set(id, marker);
  }

  /**
   * Unregister the marker by removing it from the map of markers.
   *
   * @param id The ID of the marker to unregister.
   */
  unregisterMarker(id: string) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.dispose();
      this.markers.delete(id);
    } else {
      throw Error(
        'Marker with ID ' +
          id +
          ' does not exist. ' +
          'Can only unregister markers that exist.',
      );
    }
  }

  /**
   * Get the cursor for the workspace.
   *
   * @returns The cursor for this workspace.
   */
  getCursor(): Cursor | null {
    return this.cursor;
  }

  /**
   * Get a single marker that corresponds to the given ID.
   *
   * @param id A unique identifier for the marker.
   * @returns The marker that corresponds to the given ID, or null if none
   *     exists.
   */
  getMarker(id: string): Marker | null {
    return this.markers.get(id) || null;
  }

  /**
   * Sets the cursor and initializes the drawer for use with keyboard
   * navigation.
   *
   * @param cursor The cursor used to move around this workspace.
   */
  setCursor(cursor: Cursor) {
    if (this.cursor && this.cursor.getDrawer()) {
      this.cursor.getDrawer().dispose();
    }
    this.cursor = cursor;
    if (this.cursor) {
      const drawer = this.workspace
        .getRenderer()
        .makeMarkerDrawer(this.workspace, this.cursor);
      this.cursor.setDrawer(drawer);
      this.setCursorSvg(this.cursor.getDrawer().createDom());
    }
  }

  /**
   * Add the cursor SVG to this workspace SVG group.
   *
   * @param cursorSvg The SVG root of the cursor to be added to the workspace
   *     SVG group.
   * @internal
   */
  setCursorSvg(cursorSvg: SVGElement | null) {
    if (!cursorSvg) {
      this.cursorSvg = null;
      return;
    }

    this.workspace.getBlockCanvas()!.appendChild(cursorSvg);
    this.cursorSvg = cursorSvg;
  }

  /**
   * Add the marker SVG to this workspaces SVG group.
   *
   * @param markerSvg The SVG root of the marker to be added to the workspace
   *     SVG group.
   * @internal
   */
  setMarkerSvg(markerSvg: SVGElement | null) {
    if (!markerSvg) {
      this.markerSvg = null;
      return;
    }

    if (this.workspace.getBlockCanvas()) {
      if (this.cursorSvg) {
        this.workspace
          .getBlockCanvas()!
          .insertBefore(markerSvg, this.cursorSvg);
      } else {
        this.workspace.getBlockCanvas()!.appendChild(markerSvg);
      }
    }
  }

  /**
   * Redraw the attached cursor SVG if needed.
   *
   * @internal
   */
  updateMarkers() {
    if (this.workspace.keyboardAccessibilityMode && this.cursorSvg) {
      this.workspace.getCursor()!.draw();
    }
  }

  /**
   * Dispose of the marker manager.
   * Go through and delete all markers associated with this marker manager.
   *
   * @internal
   */
  dispose() {
    const markerIds = Object.keys(this.markers);
    for (let i = 0, markerId; (markerId = markerIds[i]); i++) {
      this.unregisterMarker(markerId);
    }
    this.markers.clear();
    if (this.cursor) {
      this.cursor.dispose();
      this.cursor = null;
    }
  }
}
