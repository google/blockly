/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

goog.provide('Blockly.TestThemes');


/**
 * A theme with classic colours but enables start hats.
 */
Blockly.Themes.TestHats = Blockly.Theme.defineTheme('testhats', {
  'base': Blockly.Themes.Classic
});
Blockly.Themes.TestHats.setStartHats(true);

/**
 * A theme with classic colours but a different font.
 */
Blockly.Themes.TestFont = Blockly.Theme.defineTheme('testfont', {
  'base': Blockly.Themes.Classic
});
Blockly.Themes.TestFont.setFontStyle({
  'family': '"Times New Roman", Times, serif',
  'weight': null, // Use default font-weight
  'size': 16
});

/**
 * Holds the test theme name to Theme instance mapping.
 * @type {!Object<string, Blockly.Theme>}
 * @private
 */
Blockly.Themes.testThemes_ = {
  'Test Hats': Blockly.Themes.TestHats,
  'Test Font': Blockly.Themes.TestFont
};

/**
 * Get a test theme by name.
 * @param {string} value The theme name.
 * @return {Blockly.Theme} A theme object or undefined if one doesn't exist.
 * @package
 */
function getTestTheme(value) {
  return Blockly.Themes.testThemes_[value];
}

/**
 * Populate the theme changer dropdown to list the set of test themes.
 * @package
 */
function populateTestThemes() {
  var themeChanger = document.getElementById('themeChanger');
  var keys = Object.keys(Blockly.Themes.testThemes_);
  for (var i = 0, key; (key = keys[i]); i++) {
    var option = document.createElement('option');
    option.setAttribute('value', key);
    option.textContent = key;
    themeChanger.appendChild(option);
  }
}
