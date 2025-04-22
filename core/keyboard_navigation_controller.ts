/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The KeyboardNavigationController handles coordinating Blockly-wide
 * keyboard navigation behavior, such as enabling/disabling full
 * cursor visualization.
 */
export class KeyboardNavigationController {
  /** Whether the user is actively using keyboard navigation. */
  private isActive = false;
  /** Css class name added to body if keyboard nav is active. */
  private activeClassName = 'blocklyKeyboardNavigation';

  /**
   * Sets whether we think the user is actively using keyboard navigation.
   *
   * If they are, we'll apply a css class to the entire page so that
   * focused items can apply additional styling for keyboard users.
   *
   * @param isUsing
   */
  setIsActive(isUsing: boolean = true) {
    this.isActive = isUsing;
    this.updateActiveVisualization();
  }

  /**
   * @returns true if we think the user is actively using keyboard navigation
   * (e.g., has recently taken some action that is only relevant to keyboard users)
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /** Adds or removes the css class that indicates keyboard navigation is active. */
  private updateActiveVisualization() {
    if (this.isActive) {
      document.body.classList.add(this.activeClassName);
    } else {
      document.body.classList.remove(this.activeClassName);
    }
  }
}

/** Singleton instance of the keyboard navigation controller. */
export const keyboardNavigationController = new KeyboardNavigationController();
