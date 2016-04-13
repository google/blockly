/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating JavaScript for music blocks.
 * @author sll@google.com (Sean Lip)
 */
'use strict';

goog.provide('Blockly.JavaScript.music');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['music_play_note'] = function(block) {
  // Play a single note.
  var code =
      'addBassChord([' + block.getFieldValue('PITCH') + '], 1);\n';
  return code;
};


Blockly.JavaScript['music_play_note_with_duration'] = function(block) {
  // Play a single note, with the given duration.
  var code =
      'addBassChord([' + block.getFieldValue('PITCH') + '], ' +
      block.getFieldValue('DURATION') + ');\n';
  return code;
};
