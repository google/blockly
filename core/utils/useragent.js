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

/**
 * @type {string}
 * The raw useragent string.
 */
let rawUserAgent;

/** @type {boolean} */
let isIe;

/** @type {boolean} */
let isEdge;

/** @type {boolean} */
let isJavaFx;

/** @type {boolean} */
let isChrome;

/** @type {boolean} */
let isWebKit;

/** @type {boolean} */
let isGecko;

/** @type {boolean} */
let isAndroid;

/** @type {boolean} */
let isIPad;

/** @type {boolean} */
let isIPod;

/** @type {boolean} */
let isIPhone;

/** @type {boolean} */
let isMac;

/** @type {boolean} */
let isTablet;

/** @type {boolean} */
let isMobile;

(function(raw) {
  rawUserAgent = raw;
  const rawUpper = rawUserAgent.toUpperCase();
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
  isIe = has('Trident') || has('MSIE');
  isEdge = has('Edge');
  // Useragent for JavaFX:
  // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
  //     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
  isJavaFx = has('JavaFX');
  isChrome = (has('Chrome') || has('CriOS')) &&
        !isEdge;

  // Engines.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/engine.js
  isWebKit = has('WebKit') &&
      !isEdge;
  isGecko = has('Gecko') &&
      !isWebKit &&
      !isIe &&
      !isEdge;

  // Platforms.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/platform.js and
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/extra.js
  isAndroid = has('Android');
  const maxTouchPoints = Blockly.utils.global['navigator'] &&
      Blockly.utils.global['navigator']['maxTouchPoints'];
  isIPad = has('iPad') ||
      has('Macintosh') && maxTouchPoints > 0;
  isIPod = has('iPod');
  isIPhone = has('iPhone') &&
      !isIPad && !isIPod;
  isMac = has('Macintosh');

  // Devices.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/device.js
  isTablet = isIPad ||
      (isAndroid && !has('Mobile')) || has('Silk');
  isMobile = !isTablet &&
      (isIPod || isIPhone ||
       isAndroid || has('IEMobile'));
})((Blockly.utils.global['navigator'] && Blockly.utils.global['navigator']['userAgent']) || '');

/** @const {string} */
exports.raw = rawUserAgent;

/** @const {boolean} */
exports.IE = isIe;

/** @const {boolean} */
exports.EDGE = isEdge;

/** @const {boolean} */
exports.JavaFx;

/** @const {boolean} */
exports.CHROME = isChrome;

/** @const {boolean} */
exports.WEBKIT = isWebKit;

/** @const {boolean} */
exports.GECKO = isGecko;

/** @const {boolean} */
exports.ANDROID = isAndroid;

/** @const {boolean} */
exports.IPAD = isIPad;

/** @const {boolean} */
exports.IPOD = isIPod;

/** @const {boolean} */
exports.IPHONE = isIPhone;

/** @const {boolean} */
exports.MAC = isMac;

/** @const {boolean} */
exports.TABLET = isTablet;

/** @const {boolean} */
exports.MOBILE = isMobile;

