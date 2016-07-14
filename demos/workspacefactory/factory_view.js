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
 * Adds a category tab to the UI, and sets the tab so that when clicked, it
 * switches to that category based on the unique ID associated with that
 * tab. Updates tabMap accordingly.
 *
 * @param {!string} name The name of the category being created
 * @param {!string} id ID of category being created
 * @param {boolean} firstCategory true if it's the first category, false
 * otherwise
 * @return {!Element} DOM element created for tab
 */
FactoryView.prototype.addCategoryRow = function(name, id, firstCategory) {
  var table = document.getElementById('categoryTable');
  // Delete help label if it's the first category created.
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
  // When click the tab with that name, switch to that tab.
  return nextEntry;
};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {!string} id ID of category to be deleted
 * @return {!string} name of category being deleted.
 */
FactoryView.prototype.deleteCategoryRow = function(id) {
  // Get name of category.
  var name = this.tabMap[id].textContent;
  // Delete tab entry.
  delete this.tabMap[id];
  // Find tab row.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  for (var i = 0; i < count; i++) {
    var row = table.rows[i];
    // Delete tab row.
    if (row.cells[0].id == this.createCategoryIdName(name)) {
      table.deleteRow(i);
      // If last category removed, add category help text.
      if (count == 1) {
        var row = table.insertRow(0);
        row.textContent = 'Your categories will appear here';
      }
      return name;
    }
  }
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
 * @param {!string} id ID of the tab to switch on or off
 * @param {boolean} selected true if tab should be on, false if tab should be
 * off
 */
FactoryView.prototype.setCategoryTabSelection = function(id, selected) {
  if (!this.tabMap[id]) {
    return;
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
 * Given the ID of the current category selected and the direction of the swap,
 * swaps the labels on two categories, turns off the current tab, and returns
 * the name of the category currently selected and the one being swapped to
 * (so that the model can access it later). Returns null if the user attempts
 * to swap a category out of bounds.
 *
 * @param {!string} currID ID of currently selected category
 * @param {boolean} swapUp true if switching with the category above, false
 * if switching with the category below
 * @return {(string, string)} curr field contains the name of the currently
 * selected category, swap contains the name of the category to be swapped
 * with. Null if there is no valid category to swap.
 */
FactoryView.prototype.swapCategories = function(currID, swapUp) {
  // Find tabs to swap.
  var currTab = this.tabMap[currID];
  var currName = currTab.textContent;
  var currIndex = currTab.parentNode.rowIndex;
  var table = document.getElementById('categoryTable');
  var swapIndex = currIndex + (swapUp ? - 1 : + 1);
  if ((swapIndex < 0) || (swapIndex >= table.rows.length)) {
    return null;  // Return null if out of bounds.
  }
  var swapTab = table.rows[swapIndex].cells[0];
  var swapName = swapTab.textContent;
  // Adjust text content and IDs of tabs.
  swapTab.textContent = currName;
  swapTab.id = this.createCategoryIdName(currName);
  currTab.textContent = swapName;
  currTab.id = this.createCategoryIdName(swapName);
  // Unselect tab currently on (now refers to the swapped category).
  this.setCategoryTabSelection(currID,false);
  // Return name of swapped categories in object.
  return {
    curr: currName,
    swap: swapName
  };
}
