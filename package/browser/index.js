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
 * @fileoverview Blockly module for the browser. This includes Blockly core
 * and built in blocks, the JavaScript code generator and the English block
 * localization files.
 */

/* eslint-disable */
'use strict';

// Include the EN Locale by default.
Blockly.setLocale(En);

Blockly.Blocks = Blockly.Blocks || {};
Object.keys(BlocklyBlocks).forEach(function (k) {
  Blockly.Blocks[k] = BlocklyBlocks[k];
});

Blockly.JavaScript = BlocklyJS;