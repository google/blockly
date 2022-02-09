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
goog.declareModuleId('Blockly.utils.userAgent');

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
 * @alias Blockly.utils.userAgent.raw
 */
export {rawUserAgent as raw};

/**
 * @alias Blockly.utils.userAgent.IE
 */
export {isIe as IE};

/**
 * @alias Blockly.utils.userAgent.EDGE
 */
export {isEdge as EDGE};

/**
 * @alias Blockly.utils.userAgent.JavaFx
 */
export {isJavaFx as JavaFx};

/**
 * @alias Blockly.utils.userAgent.CHROME
 */
export {isChrome as CHROME};

/**
 * @alias Blockly.utils.userAgent.WEBKIT
 */
export {isWebKit as WEBKIT};

/**
 * @alias Blockly.utils.userAgent.GECKO
 */
export {isGecko as GECKO};

/**
 * @alias Blockly.utils.userAgent.ANDROID
 */
export {isAndroid as ANDROID};

/**
 * @alias Blockly.utils.userAgent.IPAD
 */
export {isIPad as IPAD};

/**
 * @alias Blockly.utils.userAgent.IPOD
 */
export {isIPod as IPOD};

/**
 * @alias Blockly.utils.userAgent.IPHONE
 */
export {isIPhone as IPHONE};

/**
 * @alias Blockly.utils.userAgent.MAC
 */
export {isMac as MAC};

/**
 * @alias Blockly.utils.userAgent.TABLET
 */
export {isTablet as TABLET};

/**
 * @alias Blockly.utils.userAgent.MOBILE
 */
export {isMobile as MOBILE};
