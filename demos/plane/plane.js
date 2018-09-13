/**
 * Blockly Demos: Plane Seat Calculator
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
 * @fileoverview JavaScript for Blockly's Plane Seat Calculator demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Plane = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Plane.LANGUAGE_NAME = {
  'ar': 'العربية',
  'be-tarask': 'Taraškievica',
  'br': 'Brezhoneg',
  'ca': 'Català',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'es': 'Español',
  'fa': 'فارسی',
  'fr': 'Français',
  'he': 'עברית',
  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'ia': 'Interlingua',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'ms': 'Bahasa Melayu',
  'nb': 'Norsk Bokmål',
  'nl': 'Nederlands, Vlaams',
  'pl': 'Polski',
  'pms': 'Piemontèis',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
  'sv': 'Svenska',
  'th': 'ภาษาไทย',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Plane.LANGUAGE_RTL = ['ar', 'fa', 'he'];

/**
 * Main Blockly workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Plane.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
Plane.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
Plane.getNumberParamFromUrl = function(name, minValue, maxValue) {
  var val = Number(Plane.getStringParamFromUrl(name, 'NaN'));
  return isNaN(val) ? minValue : Math.min(Math.max(minValue, val), maxValue);
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Plane.getLang = function() {
  var lang = Plane.getStringParamFromUrl('lang', '');
  if (Plane.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * Is the current language (Plane.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Plane.isRtl = function() {
  return Plane.LANGUAGE_RTL.indexOf(Plane.LANG) != -1;
};

/**
 * Load blocks saved in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Plane.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(xml, Plane.workspace);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Plane.workspace);
  }
  Plane.workspace.clearUndo();
};

/**
 * Save the blocks and reload with a different language.
 */
Plane.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // This should be skipped for the index page, which has no blocks and does
  // not load Blockly.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (typeof Blockly != 'undefined' && window.sessionStorage) {
    var xml = Blockly.Xml.workspaceToDom(Plane.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.sessionStorage.loadOnceBlocks = text;
  }

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or an error message if the element was not found.
 */
Plane.getMsg = function(key) {
  var element = document.getElementById(key);
  if (element) {
    var text = element.textContent;
    // Convert newline sequences.
    text = text.replace(/\\n/g, '\n');
    return text;
  } else {
    return '[Unknown message: ' + key + ']';
  }
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Plane.LANG = Plane.getLang();

Plane.MAX_LEVEL = 3;
Plane.LEVEL = Plane.getNumberParamFromUrl('level', 1, Plane.MAX_LEVEL);

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
  Plane.initLanguage();

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && screen.availWidth < 725) {
    viewport.setAttribute('content',
        'width=725, initial-scale=.35, user-scalable=no');
  }

  Plane.workspace = Blockly.inject('blockly',
      {media: '../../media/',
       rtl: Plane.isRtl(),
       toolbox: document.getElementById('toolbox')});

  var defaultXml =
      '<xml>' +
      '  <block type="plane_set_seats" deletable="false" x="70" y="70">' +
      '  </block>' +
      '</xml>';
  Plane.loadBlocks(defaultXml);

  Plane.workspace.addChangeListener(Plane.recalculate);
  Plane.workspace.addChangeListener(Blockly.Events.disableOrphans);

  // Initialize the slider.
  var svg = document.getElementById('plane');
  Plane.rowSlider = new Slider(60, 330, 425, svg, Plane.sliderChange);
  Plane.rowSlider.setValue(0.225);

  // Draw five 1st class rows.
  Plane.redraw(5);
};

/**
 * Initialize the page language.
 */
Plane.initLanguage = function() {
  // Set the page title with the content of the H1 title.
  document.title += ' ' + document.getElementById('title').textContent;

  // Set the HTML's language and direction.
  // document.dir fails in Mozilla, use document.body.parentNode.dir instead.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=151407
  var rtl = Plane.isRtl();
  document.head.parentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  document.head.parentElement.setAttribute('lang', Plane.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Plane.LANGUAGE_NAME) {
    languages.push([Plane.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Plane.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.addEventListener('change', Plane.changeLanguage, true);
};

/**
 * Use the blocks to calculate the number of seats.
 * Display the calculated number.
 */
Plane.recalculate = function() {
  // Find the 'set' block and use it as the formula root.
  var rootBlock = null;
  var blocks = Plane.workspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'plane_set_seats') {
      rootBlock = block;
    }
  }
  var seats = NaN;
  Blockly.JavaScript.init(Plane.workspace);
  var code = Blockly.JavaScript.blockToCode(rootBlock);
  try {
    seats = eval(code);
  } catch (e) {
    // Allow seats to remain NaN.
  }
  Plane.setText('seatText',
      Plane.getMsg('Plane_seats').replace(
          '%1', isNaN(seats) ? '?' : seats));
  Plane.setCorrect(isNaN(seats) ? null : (Plane.answer() == seats));

  // Update blocks to show values.
  function updateBlocks(blocks) {
    for (var i = 0, block; block = blocks[i]; i++) {
      block.customUpdate && block.customUpdate();
    }
  }
  updateBlocks(Plane.workspace.getAllBlocks(false));
  updateBlocks(Plane.workspace.flyout_.workspace_.getAllBlocks(false));
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
      var row = document.createElementNS('http://www.w3.org/2000/svg', 'use');
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
          Plane.getMsg('Plane_rows').replace('%1', rows1st));
    } else {
      Plane.setText('row1stText',
          Plane.getMsg('Plane_rows1').replace('%1', rows1st));
      Plane.setText('row2ndText',
          Plane.getMsg('Plane_rows2').replace('%1', rows2nd));
    }

    Plane.rows1st = rows1st;
    Plane.rows2nd = rows2nd;
    Plane.recalculate();
  }
};

window.addEventListener('load', Plane.init);

// Load the user's language pack.
document.write('<script src="generated/' + Plane.LANG + '.js"></script>\n');
