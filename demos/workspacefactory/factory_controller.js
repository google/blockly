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
        + 'category? If you don\'t, the blocks in your workspace will be ' +
        'deleted.');
    // Create a new category for current blocks
    if (confirmCreate) {
      var name = prompt('Enter the name of the category for your ' +
          'current blocks: ');
      this.createCategory(name, true);
      this.model.setSelectedByName(name);
    // Warn user that work will be erased
    }
  }
  // After possibly creating a category, check again if it's the first category
  firstCategory = !this.model.hasCategories();
  // Get name from user.
  name = this.promptForNewCategoryName('Enter the name of your new category: ');
  if (!name) {  //Exit if cancelled.
    return;
  }
  // Create category.
 this.createCategory(name, firstCategory);
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
  var selectedName = this.model.getSelectedName();
  // Delete category visually.
  this.view.deleteCategoryRow(this.model.getSelectedId());
  // Find next logical category to switch to.
  var next = this.model.getNextCategoryOnDelete(selectedName);
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
 * Gets a valid name for a new category from the user
 *
 * @param {!string} promptString Prompt for the user to enter a name.
 * @return {string} Valid name for a new category, or null if cancelled.
 */
FactoryController.prototype.promptForNewCategoryName = function(promptString) {
  do {
    var name = prompt(promptString);
    if (!name) {  // If cancelled.
      return null;
    }
  } while (this.model.hasCategoryByName(name));
  return name;
}

/**
 * Switches to a new tab for the category given by name. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new category.
 * TODO(edauterman): If they've put blocks in a "simple" flyout, give the user
 * the option to put these blocks in a category so they don't lose all their
 * work.
 *
 * @param {!string} id ID of tab to be opened, must be valid category ID.
 */
FactoryController.prototype.switchCategory = function(id) {
  // Caches information to reload or generate xml if switching to/from category.
  if (this.model.getSelectedId() != null && id != null) {
    this.model.saveCategoryEntry(this.model.getSelected(),
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
  this.model.setSelectedById(id);
  // Clear workspace.
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  // Loads next category if switching to a category.
  if (id != null) {
    this.view.setCategoryTabSelection(id, true);
    if (this.model.hasCategoryById(id)) { // Only load pre-existing categories.
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
 * currently in use, exits if user presses cancel. Won't be called if there
 * are no categories because the button will be disabled.
 */
FactoryController.prototype.changeName = function() {
  // Get new name from user.
  var newName = this.promptForNewCategoryName('What do you want to change this'
    + ' category\'s name to?');
  if (!newName) { // If cancelled.
    return;
  }
  // Change category name.
  this.model.changeCategoryName(newName, this.model.getSelected());
  this.view.updateCategoryName(newName, this.model.getSelectedId());
};

/**
 * Tied to arrow up and arrow down keys. On pressing the up or down key, moves
 * the selected category up or down one space in the list of categories.
 *
 * @param {Event} e Keyboard event received, fired onkeydown and used to get
 * which key was pressed.
 */
FactoryController.prototype.moveCategory = function(e) {
  // Do nothing if not arrow up or arrow down, or no categories.
  if ((e.key != 'ArrowUp' && e.key != 'ArrowDown') ||
      !this.model.getSelectedId()) {
    return;
  }
  // Get categories.
  var curr = this.model.getSelected();
  if (!curr) {  // Return if no selected category.
    return;
  }
  var swapIndex = this.model.getIndexByCategoryId(curr.id) + (e.key == 'ArrowUp'
      ? - 1 : + 1);
  var swap = this.model.getCategoryByIndex(swapIndex);
  if (!swap) {  // Return if cannot swap in that direction.
    return;
  }
  // Visually swap category labels.
  this.view.swapCategories(curr, swap);
  // Save currently loaded category.
  this.model.saveCategoryEntry(curr, this.toolboxWorkspace);
  // Swap model information about categories, swap model.
  this.model.swapCategoryIds(curr, swap);
  this.model.swapCategoryOrder(curr, swap);
  // Switch to the same category the user was on.
  this.switchCategory(curr.id);
};
