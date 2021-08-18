/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Useragent detection.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.userAgent
 * @namespace
 */
goog.module('Blockly.utils.userAgent');
goog.module.declareLegacyNamespace();

goog.require('Blockly.utils.global');


/** @type {boolean} */
let IE;
exports.IE = IE;

/** @type {boolean} */
let EDGE;
exports.EDGE = EDGE;

/** @type {boolean} */
let JAVA_FX;
exports.JAVA_FX = JAVA_FX;

/** @type {boolean} */
let CHROME;
exports.CHROME = CHROME;

/** @type {boolean} */
let WEBKIT;
exports.WEBKIT = WEBKIT;

/** @type {boolean} */
let GECKO;
exports.GECKO = GECKO;

/** @type {boolean} */
let ANDROID;
exports.ANDROID = ANDROID;

/** @type {boolean} */
let IPAD;
exports.IPAD = IPAD;

/** @type {boolean} */
let IPOD;
exports.IPOD = IPOD;

/** @type {boolean} */
let IPHONE;
exports.IPHONE = IPHONE;

/** @type {boolean} */
let MAC;
exports.MAC = MAC;

/** @type {boolean} */
let TABLET;
exports.TABLET = TABLET;

/** @type {boolean} */
let MOBILE;
exports.MOBILE = MOBILE;

(function(raw) {
  raw = raw;
  const rawUpper = raw.toUpperCase();

  /**
   * Case-insensitive test of whether name is in the useragent string.
   * @param {string} name Name to test.
   * @return {boolean} True if name is present.
   */
  function has(name) {
    return rawUpper.indexOf(name.toUpperCase()) != -1;
  }

  // Browsers.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/browser.js
  IE = has('Trident') || has('MSIE');
  EDGE = has('Edge');
  // Useragent for JavaFX:
  // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
  //     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
  JAVA_FX = has('JavaFX');
  CHROME = (has('Chrome') || has('CriOS')) &&
        !EDGE;

  // Engines.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/engine.js
  WEBKIT = has('WebKit') &&
      !EDGE;
  GECKO = has('Gecko') &&
      !WEBKIT &&
      !IE &&
      !EDGE;

  // Platforms.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/platform.js and
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/extra.js
  ANDROID = has('Android');
  const maxTouchPoints = Blockly.utils.global['navigator'] &&
      Blockly.utils.global['navigator']['maxTouchPoints'];
  IPAD = has('iPad') ||
      has('Macintosh') && maxTouchPoints > 0;
  IPOD = has('iPod');
  IPHONE = has('iPhone') &&
      !IPAD && !IPOD;
  MAC = has('Macintosh');

  // Devices.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/device.js
  TABLET = IPAD ||
      (ANDROID && !has('Mobile')) || has('Silk');
  MOBILE = !TABLET &&
      (IPOD || IPHONE ||
       ANDROID || has('IEMobile'));
})((Blockly.utils.global['navigator'] && Blockly.utils.global['navigator']['userAgent']) || '');
