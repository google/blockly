/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects (created as internal variables) and interacts
 * with previewWorkspace and toolboxWorkspace (internal references stored to
 * both). Also depends on standard_categories.js for standard Blockly
 * categories. Provides the functionality for the actions the user can initiate:
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
 * Currently prompts the user for a name, checking that it's valid (not used
 * before), and then creates a tab and switches to it.
 */
FactoryController.prototype.addCategory = function() {
  // Check if it's the first category added.
  var firstCategory = !this.model.hasToolbox();
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
  firstCategory = !this.model.hasToolbox();
  // Get name from user.
  name = this.promptForNewCategoryName('Enter the name of your new category: ');
  if (!name) {  //Exit if cancelled.
    return;
  }
  // Create category.
  this.createCategory(name, firstCategory);
  // Switch to category.
  this.switchElement(this.model.getCategoryIdByName(name));
  // Update preview.
  this.updatePreview();
};

/**
 * Helper method for addCategory. Adds a category to the view given a name, ID,
 * and a boolean for if it's the first category created. Assumes the category
 * has already been created in the model. Does not switch to category.
 *
 * @param {!string} name Name of category being added.
 * @param {!string} id The ID of the category being added.
 * @param {boolean} firstCategory True if it's the first category created,
 * false otherwise.
 */
FactoryController.prototype.createCategory = function(name, firstCategory) {
  // Create empty category
  var category = new ListElement(ListElement.TYPE_CATEGORY, name);
  this.model.addElementToList(category);
  // Create new category.
  var tab = this.view.addCategoryRow(name, category.id, firstCategory);
  this.addClickToSwitch(tab, category.id);
};

/**
 * Given a tab and a ID to be associated to that tab, adds a listener to
 * that tab so that when the user clicks on the tab, it switches to the
 * element associated with that ID.
 *
 * @param {!Element} tab The DOM element to add the listener to.
 * @param {!string} id The ID of the element to switch to when tab is clicked.
 */
FactoryController.prototype.addClickToSwitch = function(tab, id) {
  var self = this;
  var clickFunction = function(id) {  // Keep this in scope for switchElement
    return function() {
      self.switchElement(id);
    };
  };
  this.view.bindClick(tab, clickFunction(id));
};

/**
 * Attached to "-" button. Checks if the user wants to delete
 * the current element.  Removes the element and switches to another element.
 * When the last element is removed, it switches to a single flyout mode.
 *
 */
FactoryController.prototype.removeElement = function() {
  // Check that there is a currently selected category to remove.
  if (!this.model.getSelected()) {
    return;
  }
  // Check if user wants to remove current category.
  var check = confirm('Are you sure you want to delete the currently selected '
        + this.model.getSelected().type + '?');
  if (!check) { // If cancelled, exit.
    return;
  }
  var selectedId = this.model.getSelectedId();
  var selectedIndex = this.model.getIndexByElementId(selectedId);
  // Delete element visually.
  this.view.deleteElementRow(selectedId, selectedIndex);
  // Delete element in model.
  this.model.deleteElementFromList(selectedIndex);
  // Find next logical element to switch to.
  var next = this.model.getElementByIndex(selectedIndex);
  if (!next && this.model.hasToolbox()) {
    next = this.model.getElementByIndex(selectedIndex - 1);
  }
  var nextId = next ? next.id : null;
  // Open next element.
  this.clearAndLoadElement(nextId);
  if (!nextId) {
    alert('You currently have no categories or separators. All your blocks' +
        ' will be displayed in a single flyout.');
  }
  // Update preview.
  this.updatePreview();
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
 * Switches to a new tab for the element given by ID. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new element.
 *
 * @param {!string} id ID of tab to be opened, must be valid element ID.
 */
FactoryController.prototype.switchElement = function(id) {
  // Caches information to reload or generate xml if switching to/from element.
  // Only saves if a category is selected.
  if (this.model.getSelectedId() != null && id != null) {
    this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
  }
  // Load element.
  this.clearAndLoadElement(id);
};

/**
 * Switches to a new tab for the element by ID. Helper for switchElement.
 * Updates selected, clears the workspace and clears undo, loads a new element.
 *
 * @param {!string} id ID of category to load
 */
FactoryController.prototype.clearAndLoadElement = function(id) {
  // Unselect current tab if switching to and from an element.
  if (this.model.getSelectedId() != null && id != null) {
    this.view.setCategoryTabSelection(this.model.getSelectedId(), false);
  }
  // If switching from a separator, enable workspace in view.
  if (this.model.getSelectedId() != null && this.model.getSelected().type ==
      ListElement.TYPE_SEPARATOR) {
    this.view.disableWorkspace(false);
  }
  // Set next category.
  this.model.setSelectedById(id);
  // Clear workspace.
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  // Loads next category if switching to an element.
  if (id != null) {
    this.view.setCategoryTabSelection(id, true);
    Blockly.Xml.domToWorkspace(this.model.getSelectedXml(),
        this.toolboxWorkspace);
    // Disable workspace if switching to a separator.
    if (this.model.getSelected().type == ListElement.TYPE_SEPARATOR) {
      this.view.disableWorkspace(true);
    }
  }
  // Update category editing buttons.
  this.view.updateState(this.model.getIndexByElementId
      (this.model.getSelectedId()), this.model.getSelected());
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
 * Updates the preview workspace based on the toolbox workspace. If switching
 * from no categories to categories or categories to no categories, reinjects
 * Blockly with reinjectPreview, otherwise just updates without reinjecting.
 * Called whenever a list element is created, removed, or modified and when
 * Blockly move and delete events are fired. Do not call on create events
 * or disabling will cause the user to "drop" their current blocks.
 */
FactoryController.prototype.updatePreview = function() {
  // Disable events to stop updatePreview from recursively calling itself
  // through event handlers.
  Blockly.Events.disable();
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
  // Reenable events.
  Blockly.Events.enable();
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
FactoryController.prototype.changeCategoryName = function() {
  // Return if no category selected or element a separator.
  if (!this.model.getSelected() ||
      this.model.getSelected().type == ListElement.TYPE_SEPARATOR) {
    return;
  }
  // Get new name from user.
  var newName = this.promptForNewCategoryName('What do you want to change this'
    + ' category\'s name to?');
  if (!newName) { // If cancelled.
    return;
  }
  // Change category name.
  this.model.getSelected().changeName(newName);
  this.view.updateCategoryName(newName, this.model.getSelectedId());
  // Update preview.
  this.updatePreview();
};

/**
 * Tied to arrow up and arrow down buttons. Swaps with the element above or
 * below the currently selected element (offset categories away from the
 * current element). Updates state to enable the correct element editing
 * buttons.
 *
 * @param {int} offset The index offset from the currently selected element
 * to swap with. Positive if the element to be swapped with is below, negative
 * if the element to be swapped with is above.
 */
FactoryController.prototype.moveElement = function(offset) {
  var curr = this.model.getSelected();
  if (!curr) {  // Return if no selected element.
    return;
  }
  var currIndex = this.model.getIndexByElementId(curr.id);
  var swapIndex = this.model.getIndexByElementId(curr.id) + offset;
  var swap = this.model.getElementByIndex(swapIndex);
  if (!swap) {  // Return if cannot swap in that direction.
    return;
  }
  // Move currently selected element to index of other element.
  // Indexes must be valid because confirmed that curr and swap exist.
  this.moveElementToIndex(curr, swapIndex, currIndex);
  // Update element editing buttons.
  this.view.updateState(swapIndex, this.model.getSelected());
  // Update preview.
  this.updatePreview();
};

/**
 * Moves a element to a specified index and updates the model and view
 * accordingly. Helper functions throw an error if indexes are out of bounds.
 *
 * @param {!Element} element The element to move.
 * @param {int} newIndex The index to insert the element at.
 * @param {int} oldIndex The index the element is currently at.
 */
FactoryController.prototype.moveElementToIndex = function(element, newIndex,
    oldIndex) {
  this.model.moveElementToIndex(element, newIndex, oldIndex);
  this.view.moveTabToIndex(element.id, newIndex, oldIndex);
};

/**
 * Changes the color of the selected category. Return if selected element is
 * a separator.
 *
 * @param {!string} color The color to change the selected category. Must be
 * a valid CSS string.
 */
FactoryController.prototype.changeSelectedCategoryColor = function(color) {
  // Return if no category selected or element a separator.
  if (!this.model.getSelected() ||
      this.model.getSelected().type == ListElement.TYPE_SEPARATOR) {
    return;
  }
  // Change color of selected category.
  this.model.getSelected().changeColor(color);
  this.view.setBorderColor(this.model.getSelectedId(), color);
  this.updatePreview();
};

/**
 * Tied to the "Standard Category" dropdown option, this function prompts
 * the user for a name of a standard Blockly category (case insensitive) and
 * loads it as a new category and switches to it. Leverages standardCategories
 * map in standard_categories.js.
 */
FactoryController.prototype.loadCategory = function() {
  // Prompt user for the name of the standard category to load.
  do {
    var name = prompt('Enter the name of the category you would like to import '
        + '(Logic, Loops, Math, Text, Lists, Colour, Variables, or Functions)');
    if (!name) {
      return;   // Exit if cancelled.
    }
  } while (!this.isStandardCategoryName(name));

  // Check if the user can create that standard category.
  if (this.model.hasVariables() && name.toLowerCase() == 'variables') {
    alert('A Variables category already exists. You cannot create multiple' +
        ' variables categories.');
    return;
  }
  if (this.model.hasProcedures() && name.toLowerCase() == 'functions') {
    alert('A Functions category already exists. You cannot create multiple' +
        ' functions categories.');
    return;
  }
  // Check if the user can create a category with that name.
  var standardCategory = this.standardCategories[name.toLowerCase()]
  if (this.model.hasCategoryByName(standardCategory.name)) {
    alert('You already have a category with the name ' + standardCategory.name
        + '. Rename your category and try again.');
    return;
  }
  // Copy the standard category in the model.
  var copy = standardCategory.copy();
  this.model.addElementToList(copy);

  // Update the copy in the view.
  var tab = this.view.addCategoryRow(copy.name, copy.id, this.model.getSelected() == null);
  this.addClickToSwitch(tab, copy.id);
  // Color the category tab in the view.
  if (copy.color) {
    this.view.setBorderColor(copy.id, copy.color);
  }
  // Switch to loaded category.
  this.switchElement(copy.id);
  // Update preview.
  this.updatePreview();
};

/**
 * Given the name of a category, determines if it's the name of a standard
 * category (case insensitive).
 *
 * @param {string} name The name of the category that should be checked if it's
 * in standardCategories
 * @return {boolean} True if name is a standard category name, false otherwise.
 */
FactoryController.prototype.isStandardCategoryName = function(name) {
  for (var category in this.standardCategories) {
    if (name.toLowerCase() == category) {
      return true;
    }
  }
  return false;
};

/**
 * Connected to the "add separator" dropdown option. If categories already
 * exist, adds a separator to the model and view. Does not switch to select
 * the separator, and updates the preview.
 */
FactoryController.prototype.addSeparator = function() {
  // Don't allow the user to add a separator if a category has not been created.
  if (!this.model.hasToolbox()) {
    alert('Add a category before adding a separator.');
    return;
  }
  // Create the separator in the model.
  var separator = new ListElement(ListElement.TYPE_SEPARATOR);
  this.model.addElementToList(separator);
  // Create the separator in the view.
  var tab = this.view.addSeparatorTab(separator.id);
  this.addClickToSwitch(tab, separator.id);
  // Switch to the separator and update the preview.
  this.switchElement(separator.id);
  this.updatePreview();
};
