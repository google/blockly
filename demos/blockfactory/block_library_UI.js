/**
 * @fileoverview Javascript for Block Library's UI for pulling blocks from the
 * Block Library's storage to edit in Block Factory.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockLibrary.UI');
goog.require('BlockLibrary');

// TODO: check out closure dropdown

/**
 * Creates a node of a given element type and appends to the node with given id.
 *
 * @param {string} optionName - value of option
 * @param {string} optionText - text in option
 * @param {string} dropdownID - id for HTML select element
 */
BlockLibrary.UI.addOption = function(optionName, optionText, dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  var option = document.createElement('option');
  option.text = optionText;
  option.value = optionName;
  dropdown.add(option);
};

/**
 * Removes option currently selected in dropdown from dropdown menu.
 *
 * @param {string} dropdownID - id of HTML select element within which to find
 *     the selected option.
 * TODO: split into removeOption and getSelectedOption
 */
BlockLibrary.UI.removeSelectedOption = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  if (dropdown) {
    dropdown.remove(dropdown.selectedIndex);
  }
};

/**
 * Removes all options from dropdown.
 *
 * @param {string} dropdownID - id of HTML select element to clear options of.
 */
BlockLibrary.UI.clearOptions = function(dropdownID) {
  var dropdown = document.getElementById(dropdownID);
  while (dropdown.length > 0) {
    dropdown.remove(dropdown.length - 1);
  }
};
