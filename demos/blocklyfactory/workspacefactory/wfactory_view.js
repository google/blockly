/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * Controls the UI elements for workspace factory, mainly the category tabs.
 * Also includes downloading files because that interacts directly with the DOM.
 * Depends on FactoryController (for adding mouse listeners). Tabs for each
 * category are stored in tab map, which associates a unique ID for a
 * category with a particular tab.
 *
 * @author Emma Dauterman (edauterman)
 */

 /**
  * Class for a FactoryView
  * @constructor
  */

FactoryView = function() {
  // For each tab, maps ID of a ListElement to the td DOM element.
  this.tabMap = Object.create(null);
};

/**
 * Adds a category tab to the UI, and updates tabMap accordingly.
 *
 * @param {!string} name The name of the category being created
 * @param {!string} id ID of category being created
 * @param {boolean} firstCategory true if it's the first category, false
 * otherwise
 * @return {!Element} DOM element created for tab
 */
FactoryView.prototype.addCategoryRow = function(name, id, firstCategory) {
  var table = document.getElementById('categoryTable');
  // Delete help label and enable category buttons if it's the first category.
  if (firstCategory) {
    table.deleteRow(0);
  }
  // Create tab.
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure tab.
  nextEntry.id = this.createCategoryIdName(name);
  nextEntry.textContent = name;
  // Store tab.
  this.tabMap[id] = table.rows[count].cells[0];
  // Return tab.
  return nextEntry;
};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {!string} id ID of category to be deleted.
 * @param {!string} name The name of the category to be deleted.
 */
FactoryView.prototype.deleteElementRow = function(id, index) {
  // Delete tab entry.
  delete this.tabMap[id];
  // Delete tab row.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  table.deleteRow(index);

  // If last category removed, add category help text and disable category
  // buttons.
  this.addEmptyCategoryMessage();
};

/**
 * If there are no toolbox elements created, adds a help message to show
 * where categories will appear. Should be called when deleting list elements
 * in case the last element is deleted.
 */
FactoryView.prototype.addEmptyCategoryMessage = function() {
  var table = document.getElementById('categoryTable');
  if (table.rows.length == 0) {
    var row = table.insertRow(0);
    row.textContent = 'Your categories will appear here';
  }
}

/**
 * Given the index of the currently selected element, updates the state of
 * the buttons that allow the user to edit the list elements. Updates the edit
 * and arrow buttons. Should be called when adding or removing elements
 * or when changing to a new element or when swapping to a different element.
 *
 * TODO(evd2014): Switch to using CSS to add/remove styles.
 *
 * @param {int} selectedIndex The index of the currently selected category,
 * -1 if no categories created.
 * @param {ListElement} selected The selected ListElement.
 */
FactoryView.prototype.updateState = function(selectedIndex, selected) {
  // Disable/enable editing buttons as necessary.
  document.getElementById('button_editCategory').disabled = selectedIndex < 0 ||
      selected.type != ListElement.TYPE_CATEGORY;
  document.getElementById('button_remove').disabled = selectedIndex < 0;
  document.getElementById('button_up').disabled =
      selectedIndex <= 0 ? true : false;
  var table = document.getElementById('categoryTable');
  document.getElementById('button_down').disabled = selectedIndex >=
      table.rows.length - 1 || selectedIndex < 0 ? true : false;
  // Disable/enable the workspace as necessary.
  this.disableWorkspace(this.shouldDisableWorkspace(selected));
};

/**
 * Determines the DOM id for a category given its name.
 *
 * @param {!string} name Name of category
 * @return {!string} ID of category tab
 */
FactoryView.prototype.createCategoryIdName = function(name) {
  return 'tab_' + name;
};

/**
 * Switches a tab on or off.
 *
 * @param {!string} id ID of the tab to switch on or off.
 * @param {boolean} selected True if tab should be on, false if tab should be
 * off.
 */
FactoryView.prototype.setCategoryTabSelection = function(id, selected) {
  if (!this.tabMap[id]) {
    return;   // Exit if tab does not exist.
  }
  this.tabMap[id].className = selected ? 'tabon' : 'taboff';
};

/**
 * Used to bind a click to a certain DOM element (used for category tabs).
 * Taken directly from code.js
 *
 * @param {string|!Element} e1 tab element or corresponding id string
 * @param {!Function} func Function to be executed on click
 */
FactoryView.prototype.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Creates a file and downloads it. In some browsers downloads, and in other
 * browsers, opens new tab with contents.
 *
 * @param {!string} filename Name of file
 * @param {!Blob} data Blob containing contents to download
 */
FactoryView.prototype.createAndDownloadFile = function(filename, data) {
   var clickEvent = new MouseEvent("click", {
     "view": window,
     "bubbles": true,
     "cancelable": false
   });
   var a = document.createElement('a');
   a.href = window.URL.createObjectURL(data);
   a.download = filename;
   a.textContent = 'Download file!';
   a.dispatchEvent(clickEvent);
 };

/**
 * Given the ID of a certain category, updates the corresponding tab in
 * the DOM to show a new name.
 *
 * @param {!string} newName Name of string to be displayed on tab
 * @param {!string} id ID of category to be updated
 *
 */
FactoryView.prototype.updateCategoryName = function(newName, id) {
  this.tabMap[id].textContent = newName;
  this.tabMap[id].id = this.createCategoryIdName(newName);
};

/**
 * Moves a tab from one index to another. Adjusts index inserting before
 * based on if inserting before or after. Checks that the indexes are in
 * bounds, throws error if not.
 *
 * @param {!string} id The ID of the category to move.
 * @param {int} newIndex The index to move the category to.
 * @param {int} oldIndex The index the category is currently at.
 */
FactoryView.prototype.moveTabToIndex = function(id, newIndex, oldIndex) {
  var table = document.getElementById('categoryTable');
  // Check that indexes are in bounds
  if (newIndex < 0 || newIndex >= table.rows.length || oldIndex < 0 ||
      oldIndex >= table.rows.length) {
    throw new Error('Index out of bounds when moving tab in the view.');
  }
  if (newIndex < oldIndex) {  // Inserting before.
    var row = table.insertRow(newIndex);
    row.appendChild(this.tabMap[id]);
    table.deleteRow(oldIndex + 1);
  } else {  // Inserting after.
    var row = table.insertRow(newIndex + 1);
    row.appendChild(this.tabMap[id]);
    table.deleteRow(oldIndex);
  }
};

/**
 * Given a category ID and color, use that color to color the left border of the
 * tab for that category.
 *
 * @param {!string} id The ID of the category to color.
 * @param {!string} color The color for to be used for the border of the tab.
 * Must be a valid CSS string.
 */
FactoryView.prototype.setBorderColor = function(id, color) {
  var tab = this.tabMap[id];
  tab.style.borderLeftWidth = "8px";
  tab.style.borderLeftStyle = "solid";
  tab.style.borderColor = color;
};

/**
 * Given a separator ID, creates a corresponding tab in the view, updates
 * tab map, and returns the tab.
 *
 * @param {!string} id The ID of the separator.
 * @param {!Element} The td DOM element representing the separator.
 */
FactoryView.prototype.addSeparatorTab = function(id) {
  // Create separator.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure separator.
  nextEntry.style.height = '10px';
  // Store and return separator.
  this.tabMap[id] = table.rows[count].cells[0];
  return nextEntry;
};

/**
 * Disables or enables the workspace by putting a div over or under the
 * toolbox workspace, depending on the value of disable. Used when switching
 * to/from separators where the user shouldn't be able to drag blocks into
 * the workspace.
 *
 * @param {boolean} disable True if the workspace should be disabled, false
 * if it should be enabled.
 */
FactoryView.prototype.disableWorkspace = function(disable) {
  document.getElementById('disable_div').style.zIndex = disable ? 1 : -1;
};

/**
 * Determines if the workspace should be disabled. The workspace should be
 * disabled if category is a separator or has VARIABLE or PROCEDURE tags.
 *
 * @return {boolean} True if the workspace should be disabled, false otherwise.
 */
FactoryView.prototype.shouldDisableWorkspace = function(category) {
  return category != null && (category.type == ListElement.TYPE_SEPARATOR ||
      category.custom == 'VARIABLE' || category.custom == 'PROCEDURE');
};

/*
 * Removes all categories and separators in the view. Clears the tabMap to
 * reflect this.
 */
FactoryView.prototype.clearToolboxTabs = function() {
  this.tabMap = [];
  var oldCategoryTable = document.getElementById('categoryTable');
  var newCategoryTable = document.createElement('table');
  newCategoryTable.id = 'categoryTable';
  oldCategoryTable.parentElement.replaceChild(newCategoryTable,
      oldCategoryTable);
};

/**
 * Given a set of blocks currently loaded user-generated shadow blocks, visually
 * marks them without making them actual shadow blocks (allowing them to still
 * be editable and movable).
 *
 * @param {!<Blockly.Block>} blocks Array of user-generated shadow blocks
 * currently loaded.
 */
FactoryView.prototype.markShadowBlocks = function(blocks) {
  for (var i = 0; i < blocks.length; i++) {
    this.markShadowBlock(blocks[i]);
  }
};

/**
 * Visually marks a user-generated shadow block as a shadow block in the
 * workspace without making the block an actual shadow block (allowing it
 * to be moved and edited).
 *
 * @param {!Blockly.Block} block The block that should be marked as a shadow
 *    block (must be rendered).
 */
FactoryView.prototype.markShadowBlock = function(block) {
  // Add Blockly CSS for user-generated shadow blocks.
  Blockly.addClass_(block.svgGroup_, 'shadowBlock');
  // If not a valid shadow block, add a warning message.
  if (!block.getSurroundParent()) {
      block.setWarningText('Shadow blocks must be nested inside' +
          ' other blocks to be displayed.');
  }
};

/**
 * Removes visual marking for a shadow block given a rendered block.
 *
 * @param {!Blockly.Block} block The block that should be unmarked as a shadow
 *    block (must be rendered).
 */
FactoryView.prototype.unmarkShadowBlock = function(block) {
  // Remove Blockly CSS for user-generated shadow blocks.
  if (Blockly.hasClass_(block.svgGroup_, 'shadowBlock')) {
    Blockly.removeClass_(block.svgGroup_, 'shadowBlock');
  }
};

/**
 * Sets the tabs for modes according to which mode the user is currenly
 * editing in.
 *
 * @param {!string} mode The mode being switched to
 *    (FactoryController.MODE_TOOLBOX or FactoryController.MODE_PRELOAD).
 */
FactoryView.prototype.setModeSelection = function(mode) {
  document.getElementById('tab_preload').className = mode ==
      FactoryController.MODE_PRELOAD ? 'tabon' : 'taboff';
  document.getElementById('preload_div').style.display = mode ==
      FactoryController.MODE_PRELOAD ? 'block' : 'none';
  document.getElementById('tab_toolbox').className = mode ==
      FactoryController.MODE_TOOLBOX ? 'tabon' : 'taboff';
  document.getElementById('toolbox_div').style.display = mode ==
      FactoryController.MODE_TOOLBOX ? 'block' : 'none';
};

/**
 * Updates the help text above the workspace depending on the selected mode.
 *
 * @param {!string} mode The selected mode (FactoryController.MODE_TOOLBOX or
 *    FactoryController.MODE_PRELOAD).
 */
FactoryView.prototype.updateHelpText = function(mode) {
  var helpText = 'Drag your blocks into your ' + (mode ==
      FactoryController.MODE_TOOLBOX ? 'toolbox: ' : 'pre-loaded workspace: ');
  document.getElementById('editHelpText').textContent = helpText;
};

/**
 * Sets the basic options that are not dependent on if there are categories
 * or a single flyout of blocks. Updates checkboxes and text fields.
 */
FactoryView.prototype.setBaseOptions = function() {
  // Set basic options.
  document.getElementById('option_css_checkbox').checked = true;
  document.getElementById('option_maxBlocks_text').value = Infinity;
  document.getElementById('option_media_text').value =
      'https://blockly-demo.appspot.com/static/media/';
  document.getElementById('option_readOnly_checkbox').checked = false;
  document.getElementById('option_rtl_checkbox').checked = false;
  document.getElementById('option_sounds_checkbox').checked = true;

  // Uncheck grid and zoom options and hide suboptions.
  document.getElementById('option_grid_checkbox').checked = false;
  document.getElementById('grid_options').style.display = 'none';
  document.getElementById('option_zoom_checkbox').checked = false;
  document.getElementById('zoom_options').style.display = 'none';

  // Set grid options.
  document.getElementById('gridOption_spacing_text').value = 0;
  document.getElementById('gridOption_length_text').value = 1;
  document.getElementById('gridOption_colour_text').value = '#888';
  document.getElementById('gridOption_snap_checkbox').checked = false;

  // Set zoom options.
  document.getElementById('zoomOption_controls_checkbox').checked = false;
  document.getElementById('zoomOption_wheel_checkbox').checked = false;
  document.getElementById('zoomOption_startScale_text').value = 1.0;
  document.getElementById('zoomOption_maxScale_text').value = 3;
  document.getElementById('zoomOption_minScale_text').value = 0.3;
  document.getElementById('zoomOption_scaleSpeed_text').value = 1.2;
};

/**
 * Updates category specific options depending on if there are categories
 * currently present. Updates checkboxes and text fields in the view.
 *
 * @param {boolean} hasCategories True if categories are present, false if all
 *    blocks are displayed in a single flyout.
 */
FactoryView.prototype.setCategoryOptions = function(hasCategories) {
  document.getElementById('option_collapse_checkbox').checked = hasCategories;
  document.getElementById('option_comments_checkbox').checked = hasCategories;
  document.getElementById('option_disable_checkbox').checked = hasCategories;
  document.getElementById('option_scrollbars_checkbox').checked = hasCategories;
  document.getElementById('option_trashcan_checkbox').checked = hasCategories;
}
