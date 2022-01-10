/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Useragent detection.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * Useragent detection.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.userAgent
 */
goog.module('Blockly.utils.userAgent');

const {globalThis} = goog.require('Blockly.utils.global');


/**
 * The raw useragent string.
 * @type {string}
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
  return rawUpper.indexOf(name.toUpperCase()) !== -1;
}

// Browsers.  Logic from:
// https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/browser.js
isIe = has('Trident') || has('MSIE');
isEdge = has('Edge');
// Useragent for JavaFX:
// Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
//     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
isJavaFx = has('JavaFX');
isChrome = (has('Chrome') || has('CriOS')) && !isEdge;

// Engines.  Logic from:
// https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/engine.js
isWebKit = has('WebKit') && !isEdge;
isGecko = has('Gecko') && !isWebKit && !isIe && !isEdge;

// Platforms.  Logic from:
// https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/platform.js
// and
// https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/extra.js
isAndroid = has('Android');
const maxTouchPoints =
    globalThis['navigator'] && globalThis['navigator']['maxTouchPoints'];
isIPad = has('iPad') || has('Macintosh') && maxTouchPoints > 0;
isIPod = has('iPod');
isIPhone = has('iPhone') && !isIPad && !isIPod;
isMac = has('Macintosh');

// Devices.  Logic from:
// https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/device.js
isTablet = isIPad || (isAndroid && !has('Mobile')) || has('Silk');
isMobile = !isTablet && (isIPod || isIPhone || isAndroid || has('IEMobile'));
})((globalThis['navigator'] && globalThis['navigator']['userAgent']) || '');

/**
 * @const {string}
 * @alias Blockly.utils.userAgent.raw
 */
exports.raw = rawUserAgent;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.IE
 */
exports.IE = isIe;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.EDGE
 */
exports.EDGE = isEdge;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.JavaFx
 */
exports.JavaFx = isJavaFx;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.CHROME
 */
exports.CHROME = isChrome;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.WEBKIT
 */
exports.WEBKIT = isWebKit;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.GECKO
 */
exports.GECKO = isGecko;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.ANDROID
 */
exports.ANDROID = isAndroid;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.IPAD
 */
exports.IPAD = isIPad;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.IPOD
 */
exports.IPOD = isIPod;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.IPHONE
 */
exports.IPHONE = isIPhone;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.MAC
 */
exports.MAC = isMac;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.TABLET
 */
exports.TABLET = isTablet;

/**
 * @const {boolean}
 * @alias Blockly.utils.userAgent.MOBILE
 */
exports.MOBILE = isMobile;
