/**
 * Controls the UI elements for workspace factory, mostly controlling
 * the category tabs. Also includes downlaoding files because that interacts
 * directly with the DOM. Depends on FactoryController (for adding mouse
 * listeners).
 *
 * @author Emma Dauterman (edauterman)
 */

 /**
  * Class for a FactoryView
  * @constructor
  */

FactoryView = function() {
  this.tabMap = Object.create(null);
};

/**
 * Adds a category tab to the UI, and updates tabMap accordingly.
 *
 * @param {string} name The name of the category to be created
 * @return {!Element} DOM element created for tab
 */
FactoryView.prototype.addCategoryRow = function(name) {
  // Create tab.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure tab.
  nextEntry.id = this.createCategoryIdName(name);
  nextEntry.textContent = name;
  // Store tab.
  this.tabMap[name] = table.rows[count].cells[0];
  // When click the tab with that name, switch to that tab.
  return nextEntry;

};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {string} name Then name of the category to be deleted
 */
FactoryView.prototype.deleteCategoryRow = function(name) {
  // Delete tab entry.
  delete this.tabMap[name];
  // Find tab row.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  for (var i = 0; i < count; i++) {
    var row = table.rows[i];
    // Delete tab row.
    if (row.cells[0].id == this.createCategoryIdName(name)) {
      table.deleteRow(i);
      return;
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
 * @param {string} name name of the tab to switch on or off
 * @param {boolean} on true if tab should be on, false if tab should be off
 */
FactoryView.prototype.setCategoryTabSelection = function(name, selected) {
  if (!this.tabMap[name]) {
    return;
  }
  this.tabMap[name].className = selected ? 'tabon' : 'taboff';
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
