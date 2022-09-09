/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Empty name space for the Message singleton.
 *
 * @namespace Blockly.Msg
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Msg');


/** A dictionary of localised messages. */
export const Msg: {[key: string]: string} = Object.create(null);

/**
 * Sets the locale (i.e. the localized messages/block-text/etc) to the given
 * locale.
 *
 * @param locale An object defining the messages for a given language.
 */
export const setLocale = function(locale: {[key: string]: string}) {
  Object.keys(locale).forEach(function(k) {
    Msg[k] = locale[k];
  });
};
