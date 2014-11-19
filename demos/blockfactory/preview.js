/**
 * Blockly Demos: Block Factory
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview JavaScript for Blockly's Block Factory preview.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * The uneditable preview block.
 * @type {Blockly.Block}
 */
var previewBlock = null;

/**
 * Create the specified block in this preview pane.
 * @param {string} type Name of block.
 * @param {string} code JavaScript code to create a block.
 */
function updateFunc(type, code) {
  if (previewBlock) {
    previewBlock.dispose();
    previewBlock = null;
  }
  eval(code);
  // Create the preview block.
  previewBlock = Blockly.Block.obtain(Blockly.mainWorkspace, type);
  previewBlock.initSvg();
  previewBlock.render();
  previewBlock.setMovable(false);
  previewBlock.setDeletable(false);
}

/**
 * Initialize Blockly.  Called on page load.
 */
function init() {
  var rtl = (document.location.search == '?rtl');
  Blockly.inject(document.body, {rtl: rtl});

  try {
    // Let the top-level application know that Blockly is ready.
    window.parent.initPreview(updateFunc);
  } catch (e) {
    // Attempt to diagnose the problem.
    var msg = 'Error: Unable to communicate between frames.\n' +
        'The preview frame will not be functional.\n\n';
    if (window.parent == window) {
      msg += 'Try loading index.html instead of preview.html';
    } else if (window.location.protocol == 'file:') {
      msg += 'This may be due to a security restriction preventing\n' +
          'access when using the file:// protocol.\n\n' +
          'Try using a different browser, or use the Block Factory online at:\n' +
          'https://blockly-demo.appspot.com/static/demos/blockfactory/index.html';
    }
    alert(msg);
  }
}

window.addEventListener('load', init);
