/**
 * Blockly Apps: Plane Seat Calculator
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview JavaScript for Blockly's Plane Seat Calculator application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Plane = {};

// Supported languages.
BlocklyApps.LANGUAGES = [
  'ar', 'br', 'ca', 'da', 'de', 'el', 'en', 'es', 'fa', 'fr', 'gl', 'he', 'hu',
  'ia', 'is', 'it', 'ja', 'ko', 'lv', 'mk', 'ms', 'nl', 'pms', 'pt-br', 'ro',
  'ru', 'sk', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-hans', 'zh-hant'];
BlocklyApps.LANG = BlocklyApps.getLang();

document.write('<script type="text/javascript" src="generated/' +
               BlocklyApps.LANG + '.js"></script>\n');

Plane.MAX_LEVEL = 3;
Plane.LEVEL = BlocklyApps.getNumberParamFromUrl('level', 1, Plane.MAX_LEVEL);


Plane.rows1st = 0;
Plane.rows2nd = 0;

/**
 * Redraw the rows when the slider has moved.
 * @param {number} value New slider position.
 */
Plane.sliderChange = function(value) {
  var newRows = Math.round(value * 410 / 20);
  Plane.redraw(newRows);
};

/**
 * Change the text of a label.
 * @param {string} id ID of element to change.
 * @param {string} text New text.
 */
Plane.setText = function(id, text) {
  var el = document.getElementById(id);
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  el.appendChild(document.createTextNode(text));
};

/**
 * Display a checkmark or cross next to the answer.
 * @param {?boolean} ok True for checkmark, false for cross, null for nothing.
 */
Plane.setCorrect = function(ok) {
  var yes = document.getElementById('seatYes');
  var no = document.getElementById('seatNo');
  yes.style.display = 'none';
  no.style.display = 'none';
  if (ok === true) {
    yes.style.display = 'block';
  } else if (ok === false) {
    no.style.display = 'block';
  }
};

/**
 * Initialize Blockly and the SVG plane.
 */
Plane.init = function() {
  BlocklyApps.init();

  var rtl = BlocklyApps.isRtl();
  var toolbox = document.getElementById('toolbox');
  Blockly.inject(document.getElementById('blockly'),
      {path: '../../',
       rtl: rtl,
       toolbox: toolbox});

  var defaultXml =
      '<xml>' +
      '  <block type="plane_set_seats" deletable="false" x="70" y="70">' +
      '  </block>' +
      '</xml>';
  BlocklyApps.loadBlocks(defaultXml);

  Blockly.addChangeListener(Plane.recalculate);

  //window.onbeforeunload = function() {
  //  return 'Leaving this page will result in the loss of your work.';
  //};

  // Initialize the slider.
  var svg = document.getElementById('plane');
  Plane.rowSlider = new Slider(60, 330, 425, svg, Plane.sliderChange);
  Plane.rowSlider.setValue(0.225);

  // Draw five 1st class rows.
  Plane.redraw(5);
};

window.addEventListener('load', Plane.init);

/**
 * Use the blocks to calculate the number of seats.
 * Display the calculated number.
 */
Plane.recalculate = function() {
  // Find the 'set' block and use it as the formula root.
  var rootBlock = null;
  var blocks = Blockly.mainWorkspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'plane_set_seats') {
      rootBlock = block;
    }
  }
  var seats = NaN;
  Blockly.JavaScript.init();
  var code = Blockly.JavaScript.blockToCode(rootBlock);
  try {
    seats = eval(code);
  } catch (e) {
    // Allow seats to remain NaN.
  }
  Plane.setText('seatText',
      BlocklyApps.getMsg('Plane_seats').replace(
          '%1', isNaN(seats) ? '?' : seats));
  Plane.setCorrect(isNaN(seats) ? null : (Plane.answer() == seats));

  // Update blocks to show values.
  function updateBlocks(blocks) {
    for (var i = 0, block; block = blocks[i]; i++) {
      block.customUpdate && block.customUpdate();
    }
  }
  updateBlocks(Blockly.mainWorkspace.getAllBlocks());
  updateBlocks(Blockly.mainWorkspace.flyout_.workspace_.getAllBlocks());
};

/**
 * Calculate the correct answer.
 * @return {number} Number of seats.
 */
Plane.answer = function() {
  if (Plane.LEVEL == 1) {
    return Plane.rows1st * 4;
  } else if (Plane.LEVEL == 2) {
    return 2 + (Plane.rows1st * 4);
  } else if (Plane.LEVEL == 3) {
    return 2 + (Plane.rows1st * 4) + (Plane.rows2nd * 5);
  }
  throw 'Unknown level.';
};

/**
 * Redraw the SVG to show a new number of rows.
 * @param {number} newRows
 */
Plane.redraw = function(newRows) {
  var rows1st = Plane.rows1st;
  var rows2nd = Plane.rows2nd;
  var svg = document.getElementById('plane');
  if (newRows != rows1st) {
    while (newRows < rows1st) {
      var row = document.getElementById('row1st' + rows1st);
      row.parentNode.removeChild(row);
      rows1st--;
    }
    while (newRows > rows1st) {
      rows1st++;
      var row = document.createElementNS('http://www.w3.org/2000/svg',
                                                  'use');
      row.setAttribute('id', 'row1st' + rows1st);
      // Row of 4 seats.
      row.setAttribute('x', (rows1st - 1) * 20);
      row.setAttributeNS('http://www.w3.org/1999/xlink',
          'xlink:href', '#row1st');
      svg.appendChild(row);
    }

    if (Plane.LEVEL == 3) {
      newRows = Math.floor((21 - newRows) * 1.11);
      while (newRows < rows2nd) {
        var row = document.getElementById('row2nd' + rows2nd);
        row.parentNode.removeChild(row);
        rows2nd--;
      }
      while (newRows > rows2nd) {
        rows2nd++;
        var row = document.createElementNS('http://www.w3.org/2000/svg',
                                                    'use');
        row.setAttribute('id', 'row2nd' + rows2nd);
        row.setAttribute('x', 400 - (rows2nd - 1) * 18);
        row.setAttributeNS('http://www.w3.org/1999/xlink',
            'xlink:href', '#row2nd');
        svg.appendChild(row);
      }
    }

    if (Plane.LEVEL < 3) {
      Plane.setText('row1stText',
          BlocklyApps.getMsg('Plane_rows').replace('%1', rows1st));
    } else {
      Plane.setText('row1stText',
          BlocklyApps.getMsg('Plane_rows1').replace('%1', rows1st));
      Plane.setText('row2ndText',
          BlocklyApps.getMsg('Plane_rows2').replace('%1', rows2nd));
    }

    Plane.rows1st = rows1st;
    Plane.rows2nd = rows2nd;
    Plane.recalculate();
  }
};
