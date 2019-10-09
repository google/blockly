/**
 * @license
 * Copyright 2019 Google LLC
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
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.userAgent
 * @namespace
 */
goog.provide('Blockly.utils.userAgent');

goog.require('Blockly.utils.global');

(function(raw) {
  Blockly.utils.userAgent.raw = raw;
  var rawUpper = Blockly.utils.userAgent.raw.toUpperCase();
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
  Blockly.utils.userAgent.IE = has('Trident') || has('MSIE');
  Blockly.utils.userAgent.EDGE = has('Edge');
  // Useragent for JavaFX:
  // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
  //     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
  Blockly.utils.userAgent.JAVA_FX = has('JavaFX');

  // Engines.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/engine.js
  Blockly.utils.userAgent.WEBKIT = has('WebKit') &&
      !Blockly.utils.userAgent.EDGE;
  Blockly.utils.userAgent.GECKO = has('Gecko') &&
      !Blockly.utils.userAgent.WEBKIT &&
      !Blockly.utils.userAgent.IE &&
      !Blockly.utils.userAgent.EDGE;

  // Platforms.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/platform.js
  Blockly.utils.userAgent.ANDROID = has('Android');
  Blockly.utils.userAgent.IPAD = has('iPad');
  Blockly.utils.userAgent.IPOD = has('iPod');
  Blockly.utils.userAgent.IPHONE = has('iPhone') &&
      !Blockly.utils.userAgent.IPAD && !Blockly.utils.userAgent.IPOD;
  Blockly.utils.userAgent.MAC = has('Macintosh');

  // Devices.  Logic from:
  // https://github.com/google/closure-library/blob/master/closure/goog/labs/useragent/device.js
  Blockly.utils.userAgent.TABLET = Blockly.utils.userAgent.IPAD ||
      (Blockly.utils.userAgent.ANDROID && !has('Mobile')) || has('Silk');
  Blockly.utils.userAgent.MOBILE = !Blockly.utils.userAgent.TABLET &&
      (Blockly.utils.userAgent.IPOD || Blockly.utils.userAgent.IPHONE ||
       Blockly.utils.userAgent.ANDROID || has('IEMobile'));
})((Blockly.utils.global.navigator && Blockly.utils.global.navigator.userAgent) || '');
