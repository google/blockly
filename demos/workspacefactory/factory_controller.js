/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects (created as internal variables) and interacts
 * with previewWorkspace and toolboxWorkspace (internal references stored
 * to both). Provides the functionality for the actions the user can initiate,
 * including:
 * -adding and removing categories
 * -switching between categories
 * -printing and downloading configuration xml
 * -updating the preview workspace.
 *
 * @author Emma Dauterman (edauterman)
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
  // Get name from user.
  var name = prompt('Enter the name of your new category: ');
  while (this.model.hasCategory(name)){
    name = prompt('That name is already in use. Please enter another name: ');
    if (!name) {  // If cancelled.
      return;
    }
  }
  // Create new category.
  var tab = this.view.addCategoryRow(name);
  var self = this;
  var clickFunction = function(name) {  // Keep this in scope for switchCategory
    return function() {
      self.switchCategory(name);
    };
  };
  this.view.bindClick(tab, clickFunction(name));
  // Switch to category.
  this.switchCategory(name);
  // Save category.
  this.model.saveCategoryEntry(name, this.toolboxWorkspace);
};

/**
 * Attached to "Remove Category" button. Checks if the user wants to delete
 * the current category.  Removes the category and switches to another category.
 * When the last category is removed, it switches to a single flyout mode.
 *
 * TODO(edauterman): make case insensitive, have it switch to a more logical
 * category (e.g. most recently added category)
 */
FactoryController.prototype.removeCategory = function() {
  // Check if user wants to remove current category.
  var check = confirm('Are you sure you want to delete the currently selected'
        + ' category? ');
  if (!check) {
    return;
  }
  // Delete category.
  this.model.deleteCategoryEntry(this.model.getSelected());
  this.view.deleteCategoryRow(this.model.getSelected());
  // Open next category.
  var next = this.model.getNextOpenCategory();
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
 * @param {string} name name of tab to be opened, must be valid category name
 */
FactoryController.prototype.switchCategory = function(name) {
  // Caches information to reload or generate xml if switching to/from category.
  if (this.model.getSelected() != null && name != null) {
    this.model.saveCategoryEntry(this.model.getSelected(),
        this.toolboxWorkspace);
  }
  // Load category.
  this.clearAndLoadCategory(name);
};

/**
 * Switches to a new tab for the category by name. Helper for switchCategory.
 * Updates selected, clears the workspace and clears undo, loads a new category.
 *
 * @param {!string} name Name of category to load
 */
FactoryController.prototype.clearAndLoadCategory = function(name) {
  var table = document.getElementById('categoryTable');
  // Unselect current tab if switching to/from a category.
  if (this.model.getSelected() != null && name != null) {
    this.view.setCategoryTabSelection(this.model.getSelected(), false);
  }
  // Set next category.
  this.model.setSelected(name);
  // Clear workspace.
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  // Loads next category if switching to a category.
  if (name != null) {
    this.view.setCategoryTabSelection(name, true);
    if (this.model.hasCategory(name)) { // Only load pre-existing categories.
      Blockly.Xml.domToWorkspace(this.model.getXml(name),
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
      this.reinjectPreview(tree); //Create a toolbox, more expensive
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
