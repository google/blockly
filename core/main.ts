/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file The entrypoint for blockly_compressed.js.  Provides various
 * backwards-compatibility hacks.  Not used when loading in
 * uncompressed mode.
 */

// Former goog.module ID: Blockly.main

import * as Blockly from './blockly.js';
import * as Msg from './msg.js';
import * as colour from './utils/colour.js';
import * as deprecation from './utils/deprecation.js';

/*
 * Aliased functions and properties that used to be on the Blockly namespace.
 * Everything in this section is deprecated. Both external and internal code
 * should avoid using these functions and use the designated replacements.
 * Everything in this section will be removed in a future version of Blockly.
 */

// Add accessors for properties on Blockly that have now been deprecated.
// This will not work in uncompressed mode; it depends on Blockly being
// transpiled from a ES Module object to a plain object by Closure Compiler.
Object.defineProperties(Blockly, {
  /**
   * The richness of block colours, regardless of the hue.
   * Must be in the range of 0 (inclusive) to 1 (exclusive).
   *
   * @name Blockly.HSV_SATURATION
   * @type {number}
   * @deprecated Use Blockly.utils.colour.getHsvSaturation() /
   *     .setHsvSaturation() instead.  (July 2023)
   * @suppress {checkTypes}
   */
  HSV_SATURATION: {
    get: function () {
      deprecation.warn(
        'Blockly.HSV_SATURATION',
        'version 10',
        'version 11',
        'Blockly.utils.colour.getHsvSaturation()',
      );
      return colour.getHsvSaturation();
    },
    set: function (newValue) {
      deprecation.warn(
        'Blockly.HSV_SATURATION',
        'version 10',
        'version 11',
        'Blockly.utils.colour.setHsvSaturation()',
      );
      colour.setHsvSaturation(newValue);
    },
  },
  /**
   * The intensity of block colours, regardless of the hue.
   * Must be in the range of 0 (inclusive) to 1 (exclusive).
   *
   * @name Blockly.HSV_VALUE
   * @type {number}
   * @deprecated Use Blockly.utils.colour.getHsvValue() / .setHsvValue instead.
   *     (July 2023)
   * @suppress {checkTypes}
   */
  HSV_VALUE: {
    get: function () {
      deprecation.warn(
        'Blockly.HSV_VALUE',
        'version 10',
        'version 11',
        'Blockly.utils.colour.getHsvValue()',
      );
      return colour.getHsvValue();
    },
    set: function (newValue) {
      deprecation.warn(
        'Blockly.HSV_VALUE',
        'version 10',
        'version 11',
        'Blockly.utils.colour.setHsvValue()',
      );
      colour.setHsvValue(newValue);
    },
  },
});

// If Blockly is compiled with ADVANCED_COMPILATION and/or loaded as a
// CJS or ES module there will not be a Blockly global variable
// created.  This can cause problems because a very common way of
// loading translations is to use a <script> tag to load one of
// the generated msg/*.js files, which consists of lines like:
//
// Blockly.Msg["ADD_COMMENT"] = "Add Comment";
// Blockly.Msg["CLEAN_UP"] = "Clean up Blocks";
//
// This obviously only works if Blockly.Msg is the Msg export from the
// Blockly.Msg module - so make sure it is, but only if there is not
// yet a Blockly global variable.
if (!('Blockly' in globalThis)) {
  (globalThis as any)['Blockly'] = {'Msg': Msg};
}
