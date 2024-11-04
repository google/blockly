/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview State manager for window.location.hash.
 * @author samelh@google.com (Sam El-Husseini)
 */

/**
 * A class that manages loading / storing the state from a window hash.
 */
export class HashState {
  /**
   * Load the state from the window hash string.
   * @param {string} hash The hash string.
   * @param {Object} state The state.
   */
  static parse(hash, state) {
    decodeURIComponent(hash).replace(
      /#?([^=&]+)=([^=&]+)/gm,
      function (_m0, key, value) {
        let current = state;
        let i;
        while ((i = key.indexOf('.')) > -1) {
          current[key.substr(0, i)] = current[key.substr(0, i)] || {};
          current = current[key.substr(0, i)];
          key = key.substr(i + 1);
        }
        // Parse the value.
        if (value == 'true' || value == 'false') {
          // Boolean.
          value = value == 'true';
        } else if (!isNaN(value)) {
          // Number.
          value = Number(value);
        }
        current[key] = value;
      },
    );
  }

  /**
   * Serialize the state into a hash string.
   * @param {Object} state The state.
   * @returns {string} The serialized state.
   */
  static save(state) {
    const result = {};
    const flatten = (cur, prop) => {
      if (Object(cur) !== cur) {
        result[prop] = cur;
      } else {
        let isEmpty = true;
        for (const p in cur) {
          if (Object.prototype.hasOwnProperty.call(cur, p)) {
            isEmpty = false;
            flatten(cur[p], prop ? prop + '.' + p : p);
          }
        }
        if (isEmpty && prop != '') {
          result[prop] = {};
        }
      }
    };
    flatten(state, '');
    return Object.keys(result)
      .map((k) => `${k}=${result[k]}`)
      .join('&');
  }
}
