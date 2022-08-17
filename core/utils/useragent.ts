/**
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Useragent detection.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.userAgent
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.userAgent');


/** The raw useragent string. */
let rawUserAgent: string;

let isIe: boolean;

let isEdge: boolean;

let isJavaFx: boolean;

let isChrome: boolean;

let isWebKit: boolean;

let isGecko: boolean;

let isAndroid: boolean;

let isIPad: boolean;

let isIPod: boolean;

let isIPhone: boolean;

let isMac: boolean;

let isTablet: boolean;

let isMobile: boolean;

(function(raw) {
rawUserAgent = raw;
const rawUpper = rawUserAgent.toUpperCase();
/**
 * Case-insensitive test of whether name is in the useragent string.
 * @param name Name to test.
 * @return True if name is present.
 */
function has(name: string): boolean {
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
isTablet = isIPad || isAndroid && !has('Mobile') || has('Silk');
isMobile = !isTablet && (isIPod || isIPhone || isAndroid || has('IEMobile'));
})(globalThis['navigator'] && globalThis['navigator']['userAgent'] || '');

/** @alias Blockly.utils.userAgent.raw */
export const raw: string = rawUserAgent;

/** @alias Blockly.utils.userAgent.IE */
export const IE: boolean = isIe;

/** @alias Blockly.utils.userAgent.EDGE */
export const EDGE: boolean = isEdge;

/** @alias Blockly.utils.userAgent.JavaFx */
export const JavaFx: boolean = isJavaFx;

/** @alias Blockly.utils.userAgent.CHROME */
export const CHROME: boolean = isChrome;

/** @alias Blockly.utils.userAgent.WEBKIT */
export const WEBKIT: boolean = isWebKit;
/** @alias Blockly.utils.userAgent.GECKO */
export const GECKO: boolean = isGecko;

/** @alias Blockly.utils.userAgent.ANDROID */
export const ANDROID: boolean = isAndroid;

/** @alias Blockly.utils.userAgent.IPAD */
export const IPAD: boolean = isIPad;
/** @alias Blockly.utils.userAgent.IPOD */
export const IPOD: boolean = isIPod;

/** @alias Blockly.utils.userAgent.IPHONE */
export const IPHONE: boolean = isIPhone;

/** @alias Blockly.utils.userAgent.MAC */
export const MAC: boolean = isMac;

/** @alias Blockly.utils.userAgent.TABLET */
export const TABLET: boolean = isTablet;

/** @alias Blockly.utils.userAgent.MOBILE */
export const MOBILE: boolean = isMobile;
