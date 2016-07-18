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

FactoryView = function(){
  this.tabMap = Object.create(null);
};

/**
 * Adds a category tab to the UI, and sets the tab so that when clicked, it
 * switches to that tab. Updates tabMap accordingly.
 *
 * @param {string} name The name of the category to be created
 */
FactoryView.prototype.addCategoryRow = function(name) {
  // Create tab.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure tab.
  nextEntry.id = "tab_" + name;
  nextEntry.textContent = name;
  // Store tab.
  this.tabMap[name] = table.rows[count].cells[0];
  // When click the tab with that name, switch to that tab.
  this.bindClick(nextEntry, function(name) {return function ()
      {FactoryController.switchCategory(name)};}(name));
};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {string} name Then name of the category to be deleted
 */
FactoryView.prototype.deleteCategoryRow = function(name) {
  delete this.tabMap[name];
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  for (var i=0; i<count; i++) {
    var row = table.rows[i];
    if (row.cells[0].childNodes[0].textContent == name) {
      table.deleteRow(i);
      return;
    }
  }
};

/**
 * Switches a tab on or off.
 *
 * @param {string} name name of the tab to switch on or off
 * @param {boolean} on true if tab should be on, false if tab should be off
 */
FactoryView.prototype.toggleTab = function(name, on) {
  this.tabMap[name].className = on ? 'tabon' : 'taboff';
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
 * @param {!string} contents material to be written to file
 * @param {!string} filename Name of file
 * @param {!string} fileType Type of file to be downloaded
 */
FactoryView.prototype.createAndDownloadFile = function(contents, filename,
    fileType) {
   var data = new Blob([contents], {type: 'text/' + fileType});
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
