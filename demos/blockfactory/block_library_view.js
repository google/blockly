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
 * @param {boolean} selected - Whether or not the option should be selected on the
 *     dropdown.
 */
BlockLibraryView.addOption = function(optionName, selected) {
  // Create new dropdown item to represent saved block.
  var newBlockItem = new goog.ui.ComboBoxItem(optionName);
  this.dropdown.addItem(newBlockItem);
  if (selected) {
    this.dropdown.setValue(optionName);
  }
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
 * Returns block type of selected block.
 *
 * @param {Element} dropdown - HTML select element.
 * @return {string} Type of block selected.
 */
BlockLibraryView.getSelected = function(dropdown) {
  var index = dropdown.selectedIndex;
  return dropdown.options[index].value;
};

