/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview Javascript for Block Library's UI for pulling blocks from the
 * Block Library's storage to edit in Block Factory.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockLibraryView');

/**
 * Creates a node of a given element type and appends to the node with given id.
 *
 * @param {string} optionIdentifier - String used to identify option.
 * @param {string} optionText - Text to display in the dropdown for the option.
 * @param {string} dropdownID - ID for HTML select element.
 * @param {boolean} selected - Whether or not the option should be selected on
 *    the dropdown.
 * @param {boolean} enabled - Whether or not the option should be enabled.
 */
BlockLibraryView.addOption
    = function(optionIdentifier, optionText, dropdownID, selected, enabled) {
  var dropdown = document.getElementById(dropdownID);
  var option = document.createElement('option');
  // The value attribute of a dropdown's option is not visible in the UI, but is
  // useful for identifying different options that may have the same text.
  option.value = optionIdentifier;
  // The text attribute is what the user sees in the dropdown for the option.
  option.text = optionText;
  option.selected = selected;
  option.disabled = !enabled;
  dropdown.add(option);
};

/**
 * Adds a default, blank option to dropdown for when no block from library is
 * selected.
 *
 * @param {string} dropdownID - ID of HTML select element
 */
BlockLibraryView.addDefaultOption = function(dropdownID) {
  BlockLibraryView.addOption(
      'BLOCK_LIBRARY_DEFAULT_BLANK', '', dropdownID, true, true);
};

/**
 * Selects the default, blank option in dropdown identified by given ID.
 *
 * @param {string} dropdownID - ID of HTML select element
 */
BlockLibraryView.selectDefaultOption = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  // Deselect currently selected option.
  var index = dropdown.selectedIndex;
  dropdown.options[index].selected = false;
  // Select default option, always the first in the dropdown.
  var defaultOption = dropdown.options[0];
  defaultOption.selected = true;
};

/**
 * Returns block type of selected block.
 *
 * @param {Element} dropdown - HTML select element.
 * @return {string} Type of block selected.
 */
BlockLibraryView.getSelected = function(dropdown) {
  var index = dropdown.selectedIndex;
  return dropdown.options[index].value;
};

/**
 * Removes option currently selected in dropdown from dropdown menu.
 *
 * @param {string} dropdownID - ID of HTML select element within which to find
 *     the selected option.
 */
BlockLibraryView.removeSelectedOption = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  if (dropdown) {
    dropdown.remove(dropdown.selectedIndex);
  }
};

/**
 * Removes all options from dropdown.
 *
 * @param {string} dropdownID - ID of HTML select element to clear options of.
 */
BlockLibraryView.clearOptions = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  while (dropdown.length > 0) {
    dropdown.remove(dropdown.length - 1);
  }
};

