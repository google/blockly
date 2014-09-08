/**
 * Blockly Apps: Puzzle
 *
 * Copyright 2013 Google Inc.
 * https://blockly.googlecode.com/
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
 * @fileoverview JavaScript for Blockly's Puzzle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Puzzle = {};

// Supported languages.
BlocklyApps.LANGUAGES =
    ['ace', 'af', 'ar', 'be-tarask', 'br', 'ca', 'cdo', 'cs', 'da', 'de', 'el',
     'en', 'es', 'eu', 'fa', 'fi', 'fo', 'fr', 'frr', 'gl', 'hak', 'he', 'hi',
     'hu', 'ia', 'is', 'it', 'ja', 'ka', 'km', 'ko', 'ksh', 'ky', 'la', 'lb',
     'lt', 'lv', 'mk', 'ml', 'mr', 'ms', 'mzn', 'nb', 'nl', 'oc', 'pa', 'pl',
     'pms', 'ps', 'pt-br', 'ro', 'ru', 'si', 'sk', 'sv', 'sw', 'th', 'tr', 'uk',
     'vi', 'zh-hans', 'zh-hant'];
BlocklyApps.LANG = BlocklyApps.getLang();

document.write('<script type="text/javascript" src="generated/' +
               BlocklyApps.LANG + '.js"></script>\n');

/**
 * Initialize Blockly and the puzzle.  Called on page load.
 */
Puzzle.init = function() {
  BlocklyApps.init();

  var rtl = BlocklyApps.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var onresize = function(e) {
    blocklyDiv.style.width = (window.innerWidth - 20) + 'px';
    blocklyDiv.style.height =
        (window.innerHeight - blocklyDiv.offsetTop - 15) + 'px';
  };
  onresize();
  window.addEventListener('resize', onresize);

  Blockly.inject(document.getElementById('blockly'),
      {path: '../../',
       rtl: rtl,
       scrollbars: false,
       trashcan: false});

  // Add the blocks.
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if (loadOnce) {
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else {
    // Create one of every block.
    var blocksCountries = [];
    var blocksFlags = [];
    var blocksCities = [];
    var i = 1;
    while (BlocklyApps.getMsgOrNull('Puzzle_country' + i)) {
      var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'country');
      block.populate(i);
      blocksCountries.push(block);
      var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'flag');
      block.populate(i);
      blocksFlags.push(block);
      var j = 1;
      while (BlocklyApps.getMsgOrNull('Puzzle_country' + i + 'City' + j)) {
        var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'city');
        block.populate(i, j);
        blocksCities.push(block);
        j++;
      }
      i++;
    }
    Puzzle.shuffle(blocksCountries);
    Puzzle.shuffle(blocksFlags);
    Puzzle.shuffle(blocksCities);
    var blocks = [].concat(blocksCountries, blocksFlags, blocksCities);
    if (rtl) {
      blocks.reverse();
    }
    // Initialize all the blocks.
    for (var i = 0, block; block = blocks[i]; i++) {
      block.setDeletable(false);
      block.initSvg();
      block.render();
    }
    var totalArea = 0;
    // Measure the surface area of each block.
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.svg_.getRootElement().getBBox();
      block.cached_width_ = blockBox.width;
      block.cached_height_ = blockBox.height;
      block.cached_area_ = blockBox.width * blockBox.height;
      totalArea += block.cached_area_;
    }
    // Position the blocks randomly.
    var MARGIN = 50;
    Blockly.svgResize();
    var workspaceBox = Blockly.svgSize();
    workspaceBox.width -= MARGIN;
    workspaceBox.height -= MARGIN;
    var countedArea = 0;
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.svg_.getRootElement().getBBox();
      // Spread the blocks horizontally, grouped by type.
      // Spacing is proportional to block's area.
      if (rtl) {
        var dx = blockBox.width +
                 (countedArea / totalArea) * workspaceBox.width;
      } else {
        var dx = (countedArea / totalArea) *
                 (workspaceBox.width - blockBox.width);
      }
      dx = Math.round(dx + Math.random() * MARGIN);
      var dy = Math.round(Math.random() *
                          (workspaceBox.height - blockBox.height));
      block.moveBy(dx, dy);
      countedArea += block.cached_area_;
    }
  }

  BlocklyApps.bindClick('checkButton', Puzzle.checkAnswers);
  BlocklyApps.bindClick('helpButton', function(){Puzzle.showHelp(true);});

  Puzzle.showHelp(false);
  /**
   * HACK:
   * Chrome (v34) displays a broken image tag on any image that is also
   * shown in the help dialog.  Resetting the image fixes the problem.
   * If Chrome stops corrupting the Australian flag, delete this entire hack.
   */
  if (goog.userAgent.WEBKIT) {
    for (var i = 0, block; block = blocksFlags[i]; i++) {
      var img = block.getInput('IMG').fieldRow[0];
      var src = img.getValue();
      img.setValue(src);
    }
  }
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', BlocklyApps.initReadonly);
} else {
  window.addEventListener('load', Puzzle.init);
}

/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle).
 * Runtime: O(n)
 * Based on Closure's goog.array.shuffle.
 * @param {!Array} arr The array to be shuffled.
 */
Puzzle.shuffle = function(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

/**
 * Return a list of all languages.
 * @return {!Array<!Array<string>>} Array of human-readable and
 *   language-neutral tuples.
 */
Puzzle.languages = function() {
  var list = [[BlocklyApps.getMsg('Puzzle_languageChoose'), '0']];
  var i = 1;
  var lang;
  while (lang = BlocklyApps.getMsgOrNull('Puzzle_country' + i + 'Language')) {
    list[i] = [lang, String(i)];
    i++;
  }
  return list;
};

/**
 * Count and highlight the errors.
 */
Puzzle.checkAnswers = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  var errors = 0;
  var badBlocks = [];
  for (var b = 0, block; block = blocks[b]; b++) {
    if (!block.isCorrect()) {
      errors++;
      // Bring the offending blocks to the front.
      block.select();
      badBlocks.push(block);
    }
  }

  var graphValue = document.getElementById('graphValue');
  window.setTimeout(function() {
      graphValue.style.width =
          (100 * (blocks.length - errors) / blocks.length) + 'px';
  }, 500);

  var messages;
  if (errors == 1) {
    messages = [BlocklyApps.getMsg('Puzzle_error1'),
                BlocklyApps.getMsg('Puzzle_tryAgain')];
  } else if (errors) {
    messages = [BlocklyApps.getMsg('Puzzle_error2').replace('%1', errors),
                BlocklyApps.getMsg('Puzzle_tryAgain')];
  } else {
    messages = [BlocklyApps.getMsg('Puzzle_error0').replace(
        '%1', blocks.length)];
  }
  var textDiv = document.getElementById('answerMessage');
  textDiv.textContent = '';
  for (var i = 0; i < messages.length; i++) {
    var line = document.createElement('div');
    line.appendChild(document.createTextNode(messages[i]));
    textDiv.appendChild(line);
  }

  var content = document.getElementById('answers');
  var button = document.getElementById('checkButton');
  var rtl = BlocklyApps.isRtl();
  var style = {
    width: '25%',
    left: rtl ? '5%' : '70%',
    top: '5em'
  };
  BlocklyApps.showDialog(content, button, true, true, style,
      BlocklyApps.stopDialogKeyDown);
  BlocklyApps.startDialogKeyDown();

  // Pick a random bad block and blink it until the dialog closes.
  if (badBlocks.length) {
    Puzzle.shuffle(badBlocks);
    var badBlock = badBlocks[0];
    var blink = function() {
      badBlock.select();
      if (BlocklyApps.isDialogVisible_) {
        window.setTimeout(function() {badBlock.unselect();}, 150);
        window.setTimeout(blink, 300);
      }
    };
    blink();
  }
};

/**
 * Show the help pop-up.
 * @param {boolean} animate Animate the pop-up opening.
 */
Puzzle.showHelp = function(animate) {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyApps.showDialog(help, button, animate, true, style,
      BlocklyApps.stopDialogKeyDown);
  BlocklyApps.startDialogKeyDown();
};
