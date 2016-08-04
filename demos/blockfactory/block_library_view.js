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
 * @param {string} optionName - Value of option.
 * @param {string} optionText - Text in option.
 * @param {string} dropdownID - ID for HTML select element.
 * @param {boolean} selected - Whether or not the option should be selected on the
 *     dropdown.
 * @param {boolean} enabled - Whether or not the option should be enabled.
 */
BlockLibraryView.addOption = function(optionName, optionText, dropdownID, selected, enabled) {
  var dropdown = document.getElementById(dropdownID);
  var option = document.createElement('option');
  option.text = optionText;
  option.value = optionName;
  option.selected = selected;
  option.disabled = !enabled;
  dropdown.add(option);
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

/**
 * Adds a default, blank option to dropdown for when no block from library is
 * selected.
 *
 * @param {string} dropdownID - ID of HTML select element
 */
BlockLibraryView.addDefaultOption = function(dropdownID) {
  BlockLibraryView.addOption(
      'BLOCK_LIBRARY_DEFAULT_BLANK', '', dropdownID, true, false);
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

