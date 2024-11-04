/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Local storage state manager.
 * @author samelh@google.com (Sam El-Husseini)
 */

/**
 * A class that manages loading / storing the local storage state.
 */
export class LocalStorageState {
  /**
   * Local storage state constructor.
   * @param {string} key The local storage key.
   * @param {Object=} defaultState The default state.
   */
  constructor(key, defaultState) {
    /**
     * @type {string}
     * @private
     */
    this.key_ = key;

    /**
     * @type {!Object}
     * @private
     */
    this.state_ = Object.create(null);

    /**
     * @type {!Object}
     * @private
     */
    this.defaultState_ = defaultState || Object.create(null);
  }

  /**
   * Load the state from local storage.
   */
  load() {
    this.state_ =
      JSON.parse(localStorage.getItem(this.key_)) || this.defaultState_;
  }

  /**
   * Get value of key.
   * @param {string} key The key to lookup.
   * @returns {*} The value.
   */
  get(key) {
    return this.state_[key];
  }

  /**
   * Set the value of a key.
   * @param {string} key The key to set.
   * @param {*} value The value.
   */
  set(key, value) {
    this.state_[key] = value;
  }

  /**
   * Save and persist the current state.
   */
  save() {
    localStorage.setItem(this.key_, JSON.stringify(this.state_));
  }
}
