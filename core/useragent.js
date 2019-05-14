/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Useragent detection.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.userAgent
 * @namespace
 */
goog.provide('Blockly.userAgent');


(function(raw) {
  Blockly.userAgent.raw = raw;
  var rawUpper = Blockly.userAgent.raw.toUpperCase();
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
  Blockly.userAgent.IE = has('Trident') || has('MSIE');
  Blockly.userAgent.EDGE = has('Edge');
  // Useragent for JavaFX:
  // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
  //     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
  Blockly.userAgent.JAVA_FX = has('JavaFX');

  // Engines.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/engine.js
  Blockly.userAgent.WEBKIT = has('WebKit') && !Blockly.userAgent.EDGE;
  Blockly.userAgent.GECKO = has('Gecko') && !Blockly.userAgent.WEBKIT &&
      !Blockly.userAgent.IE && !Blockly.userAgent.EDGE;

  // Platforms.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/platform.js
  Blockly.userAgent.ANDROID = has('Android');
  Blockly.userAgent.IPAD = has('iPad');
  Blockly.userAgent.IPOD = has('iPod');
  Blockly.userAgent.IPHONE = has('iPhone') &&
      !Blockly.userAgent.IPAD && !Blockly.userAgent.IPOD;
  Blockly.userAgent.MAC = has('Macintosh');

  // Devices.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/device.js
  Blockly.userAgent.TABLET = Blockly.userAgent.IPAD ||
      (Blockly.userAgent.ANDROID && !has('Mobile')) || has('Silk');
  Blockly.userAgent.MOBILE = !Blockly.userAgent.TABLET &&
      (Blockly.userAgent.IPOD || Blockly.userAgent.IPHONE ||
       Blockly.userAgent.ANDROID || has('IEMobile'));
})((this.navigator && this.navigator.userAgent) || '');
