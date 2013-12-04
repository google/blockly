/**
 * Blockly Apps: Index
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview JavaScript for Blockly's application index.
 * @author ellen.spertus@gmail.com (Ellen Spertus)
 */
'use strict';

var BlocklyAppsIndex = {};

// Supported languages.
BlocklyApps.LANGUAGES = [
  'ar', 'ca', 'da', 'de', 'el', 'en', 'es', 'fa', 'fr', 'hu', 'is', 'it', 'ko',
  'nl', 'pt-br', 'ro', 'ru', 'sv', 'tr', 'uk', 'vi', 'zh-hans', 'zh-hant'];
BlocklyApps.LANG = BlocklyApps.getLang();

// Relative directory "index/" needed because index.html is in parent directory.
document.write('<script type="text/javascript" src="index/generated/' +
               BlocklyApps.LANG + '.js"></script>\n');

window.addEventListener('load', BlocklyApps.init);
