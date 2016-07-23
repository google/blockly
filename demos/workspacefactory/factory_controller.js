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
  // Workspace for user to drag blocks in for a certain category.
  this.toolboxWorkspace = toolboxWorkspace;
  // Workspace for user to preview their changes.
  this.previewWorkspace = previewWorkspace;
  // Model to keep track of categories and blocks.
  this.model = new FactoryModel();
  // Updates the category tabs.
  this.view = new FactoryView();
  // Generates XML for categories.
  this.generator = new FactoryGenerator(this.model, this.toolboxWorkspace);
};

/**
 * Attached to "Add Category" button. Currently prompts the user for a name,
 * checking that it's valid (not used before), and then creates a tab and
 * switches to it.
 */
FactoryController.prototype.addCategory = function() {
  // Check if it's the first category added.
  var firstCategory = !this.model.hasCategories();
  // Give the option to save blocks if their workspace is not empty and they
  // are creating their first category.
  if (firstCategory && this.toolboxWorkspace.getAllBlocks().length > 0) {
    var confirmCreate = confirm('Do you want to save your work in another '
        + 'category? If you don\'t, the blocks in your workspace will be ' +
        'deleted.');
    // Create a new category for current blocks.
    if (confirmCreate) {
      var name = prompt('Enter the name of the category for your ' +
          'current blocks: ');
      if (!name) {  // Exit if cancelled.
        return;
      }
      this.createCategory(name, true);
      this.model.setSelectedById(this.model.getCategoryIdByName(name));
    }
  }
  // After possibly creating a category, check again if it's the first category.
  firstCategory = !this.model.hasCategories();
  // Get name from user.
  name = this.promptForNewCategoryName('Enter the name of your new category: ');
  if (!name) {  //Exit if cancelled.
    return;
  }
  // Create category.
 this.createCategory(name, firstCategory);
  // Switch to category.
  this.switchCategory(this.model.getCategoryIdByName(name));
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
  var tab = this.view.addCategoryRow(name, this.model.getCategoryIdByName(name),
      firstCategory);
  var self = this;
  var clickFunction = function(id) {  // Keep this in scope for switchCategory
    return function() {
      self.switchCategory(id);
    };
  };
  this.view.bindClick(tab, clickFunction(this.model.getCategoryIdByName(name)));
}

/**
 * Attached to "Remove Category" button. Checks if the user wants to delete
 * the current category.  Removes the category and switches to another category.
 * When the last category is removed, it switches to a single flyout mode.
 *
 */
FactoryController.prototype.removeCategory = function() {
  // Check that there is a currently selected category to remove.
  if (!this.model.getSelected()) {
    return;
  }
  // Check if user wants to remove current category.
  var check = confirm('Are you sure you want to delete the currently selected'
        + ' category? ');
  if (!check) { // If cancelled, exit.
    return;
  }
  var selectedId = this.model.getSelectedId();
  var selectedIndex = this.model.getIndexByCategoryId(selectedId);
  // Delete category visually.
  this.view.deleteCategoryRow(selectedId, selectedIndex);
  // Delete category in model.
  this.model.deleteCategoryEntry(selectedIndex);
  // Find next logical category to switch to.
  var next = this.model.getCategoryByIndex(selectedIndex);
  if (!next && this.model.hasCategories()) {
    next = this.model.getCategoryByIndex(selectedIndex - 1);
  }
  var nextId = next ? next.id : null;
  // Open next category.
  this.clearAndLoadCategory(nextId);
  if (!nextId) {
    alert('You currently have no categories. All your blocks will be ' +
        'displayed in a single flyout.');
  }
};

/**
 * Gets a valid name for a new category from the user.
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
    Blockly.Xml.domToWorkspace(this.model.getSelectedXml(),
        this.toolboxWorkspace);
  }
  // Update category editing buttons.
  this.view.updateState(this.model.getIndexByCategoryId
      (this.model.getSelectedId()));
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
      this.reinjectPreview(tree); // Create a toolbox, more expensive.
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
 * currently in use, exits if user presses cancel.
 */
FactoryController.prototype.changeName = function() {
  // Return if no category selected.
  if (!this.model.getSelected()) {
    return;
  }
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
 * Tied to arrow up and arrow down buttons. Swaps with the category above or
 * below the currently selected category (offset categories away from the
 * current category). Updates state to enable the correct category editing
 * buttons.
 *
 * @param {int} offset The index offset from the currently selected category
 * to swap with. Positive if the category to be swapped with is below, negative
 * if the category to be swapped with is above.
 */
FactoryController.prototype.moveCategory = function(offset) {
  var curr = this.model.getSelected();
  if (!curr) {  // Return if no selected category.
    return;
  }
  var currIndex = this.model.getIndexByCategoryId(curr.id);
  var swapIndex = this.model.getIndexByCategoryId(curr.id) + offset;
  var swap = this.model.getCategoryByIndex(swapIndex);
  if (!swap) {  // Return if cannot swap in that direction.
    return;
  }
  // Move currently selected category to index of other category.
  // Indexes must be valid because confirmed that curr and swap exist.
  this.moveCategoryToIndex(curr, swapIndex, currIndex);
  // Update category editing buttons.
  this.view.updateState(swapIndex);
};

/**
 * Moves a category to a specified index and updates the model and view
 * accordingly. Helper functions throw an error if indexes are out of bounds.
 *
 * @param {!Category} category The category to move.
 * @param {int} newIndex The index to insert the category at.
 * @param {int} oldIndex The index the category is currently at.
 */
FactoryController.prototype.moveCategoryToIndex = function(category, newIndex,
    oldIndex) {
  this.model.moveInCategoryList(category, newIndex, oldIndex);
  this.view.moveTabToLocation(category.id, newIndex, oldIndex);
};
