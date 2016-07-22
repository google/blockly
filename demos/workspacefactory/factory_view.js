/**
 * Controls the UI elements for workspace factory, mainly the category tabs.
 * Also includes downlaoding files because that interacts directly with the DOM.
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

FactoryView = function(){
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
    this.enableCategoryTools(true);
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
FactoryView.prototype.deleteCategoryRow = function(id, index) {
  // Delete tab entry.
  delete this.tabMap[id];
  // Delete tab row.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  table.deleteRow(index);
  // If last category removed, add category help text and disable category
  // buttons.
  if (count == 1) {
    var row = table.insertRow(0);
    row.textContent = 'Your categories will appear here';
    this.enableCategoryTools(false);
  }
};

/**
 * Enables or disables tools to edit categories depending on value of
 * enable. Used when switching from no categories to having categories or
 * vice versa. Should be called when adding or removing categories.
 *
 * @param {boolean} enable True if tools should be enabled (if categories exist)
 * and false otherwise.
 */
FactoryView.prototype.enableCategoryTools = function(enable) {
  document.getElementById('button_name').disabled = !enable;
  document.getElementById('button_up').disabled = !enable;
  document.getElementById('button_down').disabled = !enable;
};

/**
 * Enables or disables the move up and down buttons depending on the index
 * of the selected category. Should be called when switching categories.
 *
 * @param {int} selectedIndex The index of the selected category.
 */
FactoryView.prototype.enableMoveBasedOnSelection = function(selectedIndex) {
  document.getElementById('button_up').disabled =
      selectedIndex == 0 ? true : false;
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  document.getElementById('button_down').disabled =
      selectedIndex == count - 1 ? true : false;
};

/**
 * Determines the DOM id for a category given its name.
 *
 * @param {!string} name Name of category
 * @return {!string} ID of category tab
 */
FactoryView.prototype.createCategoryIdName = function(name) {
  return 'tab_' + name;
}

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
 * Given the two tabs to be swapped and the indexes of those tabs, swaps
 * them.
 *
 * @param {Category} curr Category currently selected.
 * @param {Category} swap Category to be swapped with.
 * @param {int} currIndex Index of category currently selected.
 * @param {int} swapIndex Index of category to be swapped with.
 */
FactoryView.prototype.swapCategories = function(curr, swap,
    currIndex, swapIndex) {
  // Find tabs to swap.
  var currTab = this.tabMap[curr.id];
  var swapTab = this.tabMap[swap.id];
  var table = document.getElementById('categoryTable');
  // Swap tabs.
  table.rows[currIndex].appendChild(swapTab);
  table.rows[swapIndex].appendChild(currTab);
};
