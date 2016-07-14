/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects (created as internal variables) and interacts
 * with previewWorkspace and toolboxWorkspace (internal references stored to
 * both). Provides the functionality for the actions the user can initiate:
 * - adding and removing categories
 * - switching between categories
 * - printing and downloading configuration xml
 * - updating the preview workspace
 * - changing a category name
 * - moving the position of a category.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryController
 * @constructor
 * @param {!Blockly.workspace} toolboxWorkspace workspace where blocks are
 * dragged into corresponding categories
 * @param {!Blockly.workspace} previewWorkspace workspace that shows preview
 * of what workspace would look like using generated XML
 */
FactoryController = function(toolboxWorkspace, previewWorkspace) {
  this.toolboxWorkspace = toolboxWorkspace;
  this.previewWorkspace = previewWorkspace;
  this.model = new FactoryModel();
  this.view = new FactoryView();
  this.generator = new FactoryGenerator(this.model, this.toolboxWorkspace);
};

/**
 * Attached to "Add Category" button. Currently prompts the user for a name,
 * checking that it's valid (not used before), and then creates a tab and
 * switches to it.
 */
FactoryController.prototype.addCategory = function() {
  // Check if it's the first category added
  var firstCategory = !this.model.hasCategories();
  // Give the option to save blocks if their workspace is not empty and they
  // are creating their first category.
  if (firstCategory && this.toolboxWorkspace.getAllBlocks().length > 0) {
    var confirmCreate = confirm('Do you want to save your work in another '
        + 'category?');
    // Create a new category for current blocks
    if (confirmCreate) {
      var name = prompt('Enter the name of the category for your ' +
          'current blocks: ');
      this.createCategory(name,true);
      this.model.setSelectedId(this.model.getId(name));
    // Warn user that work will be erased
    } else {
      alert("The blocks currently in your workspace will be deleted.");
    }
  }
  // After possibly creating a category, check again if it's the first category
  firstCategory = !this.model.hasCategories();
  // Get name from user.
  var name = prompt('Enter the name of your new category: ');
  if (!name) {  // If cancelled.
    return;
  }
  while (this.model.hasCategoryName(name)) {
    name = prompt('That name is already in use. Please enter another name: ');
    if (!name) {  // If cancelled.
      return;
    }
  }
 this.createCategory(name,firstCategory);
  // Switch to category
  this.switchCategory(this.model.getId(name));
};

/**
 * Helper method for addCategory. Creates a category given a name and a boolean
 * for if it's the first category created. Updates the model and the view but
 * doesn't switch to the category.
 *
 * @param {!string} name Name of category to be created
 * @param {boolean} firstCategory true if it's the first category created,
 * false otherwise
 */

FactoryController.prototype.createCategory = function(name, firstCategory) {
  // Create empty category
  this.model.addNewCategoryEntry(name);
  // Create new category.
  var tab = this.view.addCategoryRow(name, this.model.getId(name),
      firstCategory);
  var self = this;
  var clickFunction = function(id) {  // Keep this in scope for switchCategory
    return function() {
      self.switchCategory(id);
    };
  };
  this.view.bindClick(tab, clickFunction(this.model.getId(name)));
}

/**
 * Attached to "Remove Category" button. Checks if the user wants to delete
 * the current category.  Removes the category and switches to another category.
 * When the last category is removed, it switches to a single flyout mode.
 *
 * TODO(edauterman): make case insensitive
 */
FactoryController.prototype.removeCategory = function() {
  // Check if user wants to remove current category.
  var check = confirm('Are you sure you want to delete the currently selected'
        + ' category? ');
  if (!check) { // If cancelled, exit.
    return;
  }
  // Delete category visually.
  var selectedName = this.view.deleteCategoryRow(this.model.getSelectedId());
  // Find next logical category to switch to.
  var next = this.model.getNextOpenCategory(selectedName);
  // Delete category in model.
  this.model.deleteCategoryEntry(selectedName);
  // Open next category.
  this.clearAndLoadCategory(next);
  if (!next) {
    alert("You currently have no categories. All your blocks will be " +
        "displayed in a single flyout.");
  }
};

/**
 * Switches to a new tab for the category given by name. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new category.
 * TODO(edauterman): If they've put blocks in a "simple" flyout, give the user
 * the option to put these blocks in a category so they don't lose all their
 * work.
 *
 * @param {id} id ID of tab to be opened, must be valid category ID
 */
FactoryController.prototype.switchCategory = function(id) {
  // Caches information to reload or generate xml if switching to/from category.
  if (this.model.getSelectedId() != null && id != null) {
    this.model.saveCategoryEntry(this.model.getSelectedId(),
        this.toolboxWorkspace);
  }
  // Load category.
  this.clearAndLoadCategory(id);
};

/**
 * Switches to a new tab for the category by name. Helper for switchCategory.
 * Updates selected, clears the workspace and clears undo, loads a new category.
 *
 * @param {!string} id ID of category to load
 */
FactoryController.prototype.clearAndLoadCategory = function(id) {
  var table = document.getElementById('categoryTable');
  // Unselect current tab if switching to/from a category.
  if (this.model.getSelectedId() != null && id != null) {
    this.view.setCategoryTabSelection(this.model.getSelectedId(), false);
  }
  // Set next category.
  this.model.setSelectedId(id);
  // Clear workspace.
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  // Loads next category if switching to a category.
  if (id != null) {
    this.view.setCategoryTabSelection(id, true);
    if (this.model.hasCategoryId(id)) { // Only load pre-existing categories.
      Blockly.Xml.domToWorkspace(this.model.getXmlById(id),
          this.toolboxWorkspace);
    }
  }
};

/**
 * Tied to "Export Config" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 */
FactoryController.prototype.exportConfig = function() {
  // Generate XML.
  var configXml = Blockly.Xml.domToPrettyText
      (this.generator.generateConfigXml());
  // Get file name.
  var fileName = prompt("File Name: ");
  if (!fileName) { // If cancelled
    return;
  }
  // Download file.
  var data = new Blob([configXml], {type: 'text/xml'});
  this.view.createAndDownloadFile(fileName, data);
 };

/**
 * Tied to "Print Config" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
FactoryController.prototype.printConfig = function() {
  window.console.log(Blockly.Xml.domToPrettyText
      (this.generator.generateConfigXml()));
};

/**
 * Tied to "Update Preview" button. Updates the preview workspace based on
 * the toolbox workspace. If switching from no categories to categories or
 * categories to no categories, reinjects Blockly with reinjectPreview,
 * otherwise just updates without reinjecting.
 */
FactoryController.prototype.updatePreview = function() {
  var tree = Blockly.Options.parseToolboxTree
      (this.generator.generateConfigXml());
  // No categories, creates a simple flyout.
  if (tree.getElementsByTagName('category').length == 0) {
    if (this.previewWorkspace.toolbox_) {
      this.reinjectPreview(tree); // Switch to simple flyout, more expensive.
    } else {
      this.previewWorkspace.flyout_.show(tree.childNodes);
    }
  // Uses categories, creates a toolbox.
  } else {
    if (!previewWorkspace.toolbox_) {
      this.reinjectPreview(tree); // Create a toolbox, more expensive
    } else {
      this.previewWorkspace.toolbox_.populate_(tree);
    }
  }
};

/**
 * Used to completely reinject the preview workspace. This should be used only
 * when switching from simple flyout to categories, or categories to simple
 * flyout. More expensive than simply updating the flyout or toolbox.
 *
 * @param {!Element} tree of xml elements
 * @package
 */
FactoryController.prototype.reinjectPreview = function(tree) {
  this.previewWorkspace.dispose();
  previewToolbox = Blockly.Xml.domToPrettyText(tree);
  this.previewWorkspace = Blockly.inject('preview_blocks',
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
     media: '../../media/',
     toolbox: previewToolbox,
     zoom:
       {controls: true,
        wheel: true}
    });
};

/**
 * Tied to "change name" button. Changes the name of the selected category.
 * Continues prompting the user until they input a category name that is not
 * currently in use, exits if user presses cancel. Doesn't allow the user to
 * change a category name if there are no categories.
 */
FactoryController.prototype.changeName = function() {
  // Exit if no current categories.
  if (!this.model.getSelectedId()) {
    alert("No current categories created.");
    return;
  }
  // Get new name from user.
  var newName = prompt("What do you want to change this category's name to?");
  if (!newName) { // If cancelled.
    return;
  }
  while (this.model.hasCategoryName(name)) {
    newName = prompt("This name is already being used. Try another name: ");
    if (!newName) { // If cancelled.
      return;
    }
  }
  // Change category name.
  this.model.changeCategoryName(newName,this.model.getSelectedId());
  this.view.updateCategoryName(newName,this.model.getSelectedId());
};

/**
 * Tied to arrow up and arrow down keys. On pressing the up or down key, moves
 * the selected category up or down one space in the list of categories.
 *
 * @param {Event} e keyboard event received, called onkeydown
 */
FactoryController.prototype.moveCategory = function(e) {
  // Do nothing if not arrow up or arrow down, or no categories.
  if ((e.key != 'ArrowUp' && e.key != 'ArrowDown') ||
      !this.model.getSelectedId()) {
    return;
  }
  // Swap tab labels, return names of tabs
  var names = this.view.swapCategories(this.model.getSelectedId(),
      e.key == 'ArrowUp');
  if (!names) { // No valid category to swap with.
    return;
  }
  // Get category IDs
  var currID = this.model.getSelectedId();
  var swapID = this.model.getId(names.swap);
  // Save currently loaded category.
  this.model.saveCategoryEntry(currID);
  // Swap model information about categories, swap model.
  this.model.swapCategoryId(currID, swapID, names.curr, names.swap);
  this.model.swapCategoryOrder(names.curr, names.swap);
  // Switch to the same category the user was on, now with swapID.
  this.model.setSelectedId(swapID);
  this.switchCategory(swapID);
};
