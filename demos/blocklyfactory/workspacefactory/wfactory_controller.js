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
  this.generator = new FactoryGenerator(this.model);
  // Tracks which editing mode the user is in. Toolbox mode on start.
  this.selectedMode = FactoryController.MODE_TOOLBOX;
};

// Toolbox editing mode. Changes the user makes to the workspace updates the
// toolbox.
FactoryController.MODE_TOOLBOX = 'toolbox';
// Pre-loaded workspace editing mode. Changes the user makes to the workspace
// udpates the pre-loaded blocks.
FactoryController.MODE_PRELOAD = 'preload';

/**
 * Currently prompts the user for a name, checking that it's valid (not used
 * before), and then creates a tab and switches to it.
 */
FactoryController.prototype.addCategory = function() {
  // Check if it's the first category added.
  var isFirstCategory = !this.model.hasElements();
  // Give the option to save blocks if their workspace is not empty and they
  // are creating their first category.
  if (isFirstCategory && this.toolboxWorkspace.getAllBlocks().length > 0) {
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

      // Create the new category.
      this.createCategory(name, true);
      // Set the new category as selected.
      var id = this.model.getCategoryIdByName(name);
      this.model.setSelectedById(id);
      this.view.setCategoryTabSelection(id, true);
      // Allow user to use the default options for injecting with categories.
      this.allowToSetDefaultOptions();
    }
  }

  // After possibly creating a category, check again if it's the first category.
  isFirstCategory = !this.model.hasElements();
  // Get name from user.
  name = this.promptForNewCategoryName('Enter the name of your new category: ');
  if (!name) {  //Exit if cancelled.
    return;
  }
  // Create category.
  this.createCategory(name, isFirstCategory);
  // Switch to category.
  this.switchElement(this.model.getCategoryIdByName(name));

   // Allow the user to use the default options for injecting the workspace
  // when there are categories if adding the first category.
  if (isFirstCategory) {
    this.allowToSetDefaultOptions();
  }
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
 * @param {boolean} isFirstCategory True if it's the first category created,
 * false otherwise.
 */
FactoryController.prototype.createCategory = function(name, isFirstCategory) {
  // Create empty category
  var category = new ListElement(ListElement.TYPE_CATEGORY, name);
  this.model.addElementToList(category);
  // Create new category.
  var tab = this.view.addCategoryRow(name, category.id, isFirstCategory);
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
  if (!next && this.model.hasElements()) {
    next = this.model.getElementByIndex(selectedIndex - 1);
  }
  var nextId = next ? next.id : null;

  // Open next element.
  this.clearAndLoadElement(nextId);

  // If no element to switch to, display message, clear the workspace, and
  // set a default selected element not in toolbox list in the model.
  if (!nextId) {
    alert('You currently have no categories or separators. All your blocks' +
        ' will be displayed in a single flyout.');
    this.toolboxWorkspace.clear();
    this.toolboxWorkspace.clearUndo();
    this.model.createDefaultSelectedIfEmpty();
    // Allow the user to use the default options for injecting the workspace
    // when there are no categories.
    this.allowToSetDefaultOptions();
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
  // Disables events while switching so that Blockly delete and create events
  // don't update the preview repeatedly.
  Blockly.Events.disable();
  // Caches information to reload or generate xml if switching to/from element.
  // Only saves if a category is selected.
  if (this.model.getSelectedId() != null && id != null) {
    this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
  }
  // Load element.
  this.clearAndLoadElement(id);
  // Enable Blockly events again.
  Blockly.Events.enable();
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

  // If switching to another category, set category selection in the model and
  // view.
  if (id != null) {
    // Set next category.
    this.model.setSelectedById(id);

    // Clears workspace and loads next category.
    this.clearAndLoadXml_(this.model.getSelectedXml());

    // Selects the next tab.
    this.view.setCategoryTabSelection(id, true);

    // Order blocks as if shown in the flyout.
    this.toolboxWorkspace.cleanUp_();
  }

  // Update category editing buttons.
  this.view.updateState(this.model.getIndexByElementId
      (this.model.getSelectedId()), this.model.getSelected());
};

/**
 * Tied to "Export" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 *
 * @param {!string} exportMode The type of file to export
 *    (FactoryController.MODE_TOOLBOX for the toolbox configuration, and
 *    FactoryController.MODE_PRELOAD for the pre-loaded workspace configuration)
 */
FactoryController.prototype.exportXmlFile = function(exportMode) {
  // Generate XML.
  if (exportMode == FactoryController.MODE_TOOLBOX) {
    // Export the toolbox XML.

    var configXml = Blockly.Xml.domToPrettyText
        (this.generator.generateToolboxXml());
  } else if (exportMode == FactoryController.MODE_PRELOAD) {
    // Export the pre-loaded block XML.

    var configXml = Blockly.Xml.domToPrettyText
        (this.generator.generateWorkspaceXml());
  } else {
    // Unknown mode. Throw error.
    throw new Error ("Unknown export mode: " + exportMode);
  }

  // Get file name.
  var fileName = prompt('File Name for ' + (exportMode ==
      FactoryController.MODE_TOOLBOX ? 'toolbox XML: ' :
      'pre-loaded workspace XML: '));
  if (!fileName) { // If cancelled
    return;
  }
  // Download file.
  var data = new Blob([configXml], {type: 'text/xml'});
  this.view.createAndDownloadFile(fileName, data);
 };

/**
 * Export the options object to be used for the Blockly inject call. Gets a
 * file name from the user and downloads the options object to that file.
 */
FactoryController.prototype.exportOptionsFile = function() {
  var fileName = prompt('File Name for options object for injecting: ');
  if (!fileName) {  // If cancelled.
    return;
  }
  // Generate new options to remove toolbox XML from options object (if
  // necessary).
  this.generateNewOptions();
  // TODO(evd2014): Use Regex to prettify JSON generated.
  var data = new Blob([JSON.stringify(this.model.options)],
      {type: 'text/plain'});
  this.view.createAndDownloadFile(fileName, data);
};

/**
 * Tied to "Print" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
FactoryController.prototype.printConfig = function() {
  // Capture any changes made by user before generating XML.
  this.saveStateFromWorkspace();
  // Print XML.
  window.console.log(Blockly.Xml.domToPrettyText
      (this.generator.generateToolboxXml()));
};

/**
 * Updates the preview workspace based on the toolbox workspace. If switching
 * from no categories to categories or categories to no categories, reinjects
 * Blockly with reinjectPreview, otherwise just updates without reinjecting.
 * Called whenever a list element is created, removed, or modified and when
 * Blockly move and delete events are fired. Do not call on create events
 * or disabling will cause the user to "drop" their current blocks. Make sure
 * that no changes have been made to the workspace since updating the model
 * (if this might be the case, call saveStateFromWorkspace).
 */
FactoryController.prototype.updatePreview = function() {
  // Disable events to stop updatePreview from recursively calling itself
  // through event handlers.
  Blockly.Events.disable();

  if (this.selectedMode == FactoryController.MODE_TOOLBOX) {
    // If currently editing the toolbox.
    // Get toolbox XML.
    var tree = Blockly.Options.parseToolboxTree
        (this.generator.generateToolboxXml());
    // No categories, creates a simple flyout.
    if (tree.getElementsByTagName('category').length == 0) {
      // No categories, creates a simple flyout.
      if (this.previewWorkspace.toolbox_) {
        this.reinjectPreview(tree); // Switch to simple flyout, more expensive.
      } else {
        this.previewWorkspace.flyout_.show(tree.childNodes);
      }

    } else {
      // Uses categories, creates a toolbox.

      if (!previewWorkspace.toolbox_) {
        this.reinjectPreview(tree); // Create a toolbox, more expensive.
      } else {
        this.previewWorkspace.toolbox_.populate_(tree);
      }
    }

    // Update pre-loaded blocks in the preview workspace to make sure that
    // blocks don't get cleared when updating preview from event listeners while
    // switching modes.
    this.previewWorkspace.clear();
    Blockly.Xml.domToWorkspace(this.generator.generateWorkspaceXml(),
        this.previewWorkspace);
  } else if (this.selectedMode == FactoryController.MODE_PRELOAD){
    // If currently editing the pre-loaded workspace.
    this.previewWorkspace.clear();
    Blockly.Xml.domToWorkspace(this.generator.generateWorkspaceXml(),
        this.previewWorkspace);
  }

  // Reenable events.
  Blockly.Events.enable();
};

/**
 * Saves the state from the workspace depending on the current mode. Should
 * be called after making changes to the workspace.
 */
FactoryController.prototype.saveStateFromWorkspace = function() {
  if (this.selectedMode == FactoryController.MODE_TOOLBOX) {
    // If currently editing the toolbox.
    this.model.getSelected().saveFromWorkspace(toolboxWorkspace);
  } else if (this.selectedMode == FactoryController.MODE_PRELOAD) {
    // If currently editing the pre-loaded workspace.
    this.model.savePreloadXml
        (Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
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
  this.model.setOptionsAttribute('toolbox', Blockly.Xml.domToPrettyText(tree));
  this.previewWorkspace = Blockly.inject('preview_blocks', this.model.options);
  Blockly.Xml.domToWorkspace(this.generator.generateWorkspaceXml(),
      this.previewWorkspace);
};

/**
 * Tied to "change name" button. Changes the name of the selected category.
 * Continues prompting the user until they input a category name that is not
 * currently in use, exits if user presses cancel.
 */
FactoryController.prototype.changeCategoryName = function() {
  // Return if a category is not selected.
  if (this.model.getSelected().type != ListElement.TYPE_CATEGORY) {
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
  // Return if category is not selected.
  if (this.model.getSelected().type != ListElement.TYPE_CATEGORY) {
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

  var isFirstCategory = !this.model.hasElements();
  // Copy the standard category in the model.
  var copy = standardCategory.copy();

  // Add it to the model.
  this.model.addElementToList(copy);

  // Update the copy in the view.
  var tab = this.view.addCategoryRow(copy.name, copy.id, isFirstCategory);
  this.addClickToSwitch(tab, copy.id);
  // Color the category tab in the view.
  if (copy.color) {
    this.view.setBorderColor(copy.id, copy.color);
  }
  // Switch to loaded category.
  this.switchElement(copy.id);
  // Convert actual shadow blocks to user-generated shadow blocks.
  this.convertShadowBlocks_();
  // Save state from workspace before updating preview.
  this.saveStateFromWorkspace();
  if (isFirstCategory) {
    // Allow the user to use the default options for injecting the workspace
    // when there are categories.
    this.allowToSetDefaultOptions();
  }
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
  if (!this.model.hasElements()) {
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

/**
 * Connected to the import button. Given the file path inputted by the user
 * from file input, if the import mode is for the toolbox, this function loads
 * that toolbox XML to the workspace, creating category and separator tabs as
 * necessary. If the import mode is for pre-loaded blocks in the workspace,
 * this function loads that XML to the workspace to be edited further. This
 * function switches mode to whatever the import mode is. Catches errors from
 * file reading and prints an error message alerting the user.
 *
 * @param {string} file The path for the file to be imported into the workspace.
 * Should contain valid toolbox XML.
 * @param {!string} importMode The mode corresponding to the type of file the
 *    user is importing (FactoryController.MODE_TOOLBOX or
 *    FactoryController.MODE_PRELOAD).
 */
FactoryController.prototype.importFile = function(file, importMode) {
  // Exit if cancelled.
  if (!file) {
    return;
  }

  var reader = new FileReader();

  // To be executed when the reader has read the file.
  reader.onload = function() {
    // Try to parse XML from file and load it into toolbox editing area.
    // Print error message if fail.
    try {
      var tree = Blockly.Xml.textToDom(reader.result);
      if (importMode == FactoryController.MODE_TOOLBOX) {
        // Switch mode and import toolbox XML.
        controller.setMode(FactoryController.MODE_TOOLBOX);
        controller.importToolboxFromTree_(tree);
      } else if (importMode == FactoryController.MODE_PRELOAD) {
        // Switch mode and import pre-loaded workspace XML.
        controller.setMode(FactoryController.MODE_PRELOAD);
        controller.importPreloadFromTree_(tree);
      } else {
        // Throw error if invalid mode.
        throw new Error("Unknown import mode: " + importMode);
      }
     } catch(e) {
       alert('Cannot load XML from file.');
       console.log(e);
     }
  }

  // Read the file asynchronously.
  reader.readAsText(file);
};

/**
 * Given a XML DOM tree, loads it into the toolbox editing area so that the
 * user can continue editing their work. Assumes that tree is in valid toolbox
 * XML format. Assumes that the mode is MODE_TOOLBOX.
 * @private
 *
 * @param {!Element} tree XML tree to be loaded to toolbox editing area.
 */
FactoryController.prototype.importToolboxFromTree_ = function(tree) {
  // Clear current editing area.
  this.model.clearToolboxList();
  this.view.clearToolboxTabs();

  if (tree.getElementsByTagName('category').length == 0) {
    // No categories present.
    // Load all the blocks into a single category evenly spaced.
    Blockly.Xml.domToWorkspace(tree, this.toolboxWorkspace);
    this.toolboxWorkspace.cleanUp_();

    // Convert actual shadow blocks to user-generated shadow blocks.
    this.convertShadowBlocks();

    // Add message to denote empty category.
    this.view.addEmptyCategoryMessage();

  } else {
    // Categories/separators present.
    for (var i = 0, item; item = tree.children[i]; i++) {

      if (item.tagName == 'category') {
        // If the element is a category, create a new category and switch to it.
        this.createCategory(item.getAttribute('name'), false);
        var category = this.model.getElementByIndex(i);
        this.switchElement(category.id);

        // Load all blocks in that category to the workspace to be evenly
        // spaced and saved to that category.
        for (var j = 0, blockXml; blockXml = item.children[j]; j++) {
          Blockly.Xml.domToBlock(blockXml, this.toolboxWorkspace);
        }

        // Evenly space the blocks.
        // TODO(evd2014): Change to cleanUp once cleanUp_ is made public in
        // master.
        this.toolboxWorkspace.cleanUp_();

        // Convert actual shadow blocks to user-generated shadow blocks.
        this.convertShadowBlocks();

        // Set category color.
        if (item.getAttribute('colour')) {
          category.changeColor(item.getAttribute('colour'));
          this.view.setBorderColor(category.id, category.color);
        }
        // Set any custom tags.
        if (item.getAttribute('custom')) {
          this.model.addCustomTag(category, item.getAttribute('custom'));
        }
      } else {
        // If the element is a separator, add the separator and switch to it.
        this.addSeparator();
        this.switchElement(this.model.getElementByIndex(i).id);
      }
    }
  }
  this.view.updateState(this.model.getIndexByElementId
      (this.model.getSelectedId()), this.model.getSelected());

  this.saveStateFromWorkspace();

  this.saveStateFromWorkspace();
  // Allow the user to set default configuration options for a single flyout
  // or multiple categories.
  this.allowToSetDefaultOptions();

  this.updatePreview();
};

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
FactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.updatePreview();
}

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
FactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.saveStateFromWorkspace();
  this.updatePreview();
}

/**
 * Given a XML DOM tree, loads it into the pre-loaded workspace editing area.
 * Assumes that tree is in valid XML format and that the selected mode is
 * MODE_PRELOAD.
 *
 * @param {!Element} tree XML tree to be loaded to pre-loaded block editing
 *    area.
 */
FactoryController.prototype.importPreloadFromTree_ = function(tree) {
  this.clearAndLoadXml_(tree);
  this.model.savePreloadXml(tree);
  this.saveStateFromWorkspace();
  this.updatePreview();
}

/**
 * Clears the toolbox editing area completely, deleting all categories and all
 * blocks in the model and view. Sets the mode to toolbox mode. Tied to "Clear
 * Toolbox" button.
 */
FactoryController.prototype.clearToolbox = function() {
  this.setMode(FactoryController.MODE_TOOLBOX);
  var hasCategories = this.model.hasElements();
  this.model.clearToolboxList();
  this.view.clearToolboxTabs();
  this.view.addEmptyCategoryMessage();
  this.view.updateState(-1, null);
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  this.saveStateFromWorkspace();
  if (hasCategories) {
    this.allowToSetDefaultOptions();
  }
  this.updatePreview();
};

/*
 * Makes the currently selected block a user-generated shadow block. These
 * blocks are not made into real shadow blocks, but recorded in the model
 * and visually marked as shadow blocks, allowing the user to move and edit
 * them (which would be impossible with actual shadow blocks). Updates the
 * preview when done.
 *
 */
FactoryController.prototype.addShadow = function() {
  // No block selected to make a shadow block.
  if (!Blockly.selected) {
    return;
  }
  this.view.markShadowBlock(Blockly.selected);
  this.model.addShadowBlock(Blockly.selected.id);
  this.saveStateFromWorkspace();
  this.updatePreview();
};

/**
 * If the currently selected block is a user-generated shadow block, this
 * function makes it a normal block again, removing it from the list of
 * shadow blocks and loading the workspace again. Updates the preview again.
 *
 */
FactoryController.prototype.removeShadow = function() {
  // No block selected to modify.
  if (!Blockly.selected) {
    return;
  }
  this.model.removeShadowBlock(Blockly.selected.id);
  this.view.unmarkShadowBlock(Blockly.selected);
  this.saveStateFromWorkspace();
  this.updatePreview();
};

/**
 * Given a unique block ID, uses the model to determine if a block is a
 * user-generated shadow block.
 *
 * @param {!string} blockId The unique ID of the block to examine.
 * @return {boolean} True if the block is a user-generated shadow block, false
 *    otherwise.
 */
FactoryController.prototype.isUserGenShadowBlock = function(blockId) {
  return this.model.isShadowBlock(blockId);
}

/**
 * Call when importing XML containing real shadow blocks. This function turns
 * all real shadow blocks loaded in the workspace into user-generated shadow
 * blocks, meaning they are marked as shadow blocks by the model and appear as
 * shadow blocks in the view but are still editable and movable.
 */
FactoryController.prototype.convertShadowBlocks = function() {
  var blocks = this.toolboxWorkspace.getAllBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.isShadow()) {
      block.setShadow(false);
      this.model.addShadowBlock(block.id);
      this.view.markShadowBlock(block);
    }
  }
};

/**
 * Sets the currently selected mode that determines what the toolbox workspace
 * is being used to edit. Updates the view and then saves and loads XML
 * to and from the toolbox and updates the help text.
 *
 * @param {!string} tab The type of tab being switched to
 *    (FactoryController.MODE_TOOLBOX or FactoryController.MODE_PRELOAD).
 */
FactoryController.prototype.setMode = function(mode) {
  // No work to change mode that's currently set.
  if (this.selectedMode == mode) {
    return;
  }

  // No work to change mode that's currently set.
  if (this.selectedMode == mode) {
    return;
  }

  // Set tab selection and display appropriate tab.
  this.view.setModeSelection(mode);

  // Update selected tab.
  this.selectedMode = mode;

  // Update help text above workspace.
  this.view.updateHelpText(mode);

  if (mode == FactoryController.MODE_TOOLBOX) {
    // Open the toolbox editing space.
    document.getElementById('editHelpText').textContent =
        'Drag blocks into your toolbox:';
    this.model.savePreloadXml
        (Blockly.Xml.workspaceToDom(this.toolboxWorkspace));
    this.clearAndLoadXml_(this.model.getSelectedXml());
    this.view.disableWorkspace(this.view.shouldDisableWorkspace
        (this.model.getSelected()));
  } else {
    // Open the pre-loaded workspace editing space.
    document.getElementById('editHelpText').textContent =
        'Drag blocks into your pre-loaded workspace:';
    if (this.model.getSelected()) {
      this.model.getSelected().saveFromWorkspace(this.toolboxWorkspace);
    }
    this.clearAndLoadXml_(this.model.getPreloadXml());
    this.view.disableWorkspace(false);
  }
};

/**
 * Clears the toolbox workspace and loads XML to it, marking shadow blocks
 * as necessary.
 * @private
 *
 * @param {!Element} xml The XML to be loaded to the workspace.
 */
FactoryController.prototype.clearAndLoadXml_ = function(xml) {
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  Blockly.Xml.domToWorkspace(xml, this.toolboxWorkspace);
  this.view.markShadowBlocks(this.model.getShadowBlocksInWorkspace
      (this.toolboxWorkspace.getAllBlocks()));
};

/**
 * Sets the standard default options for the options object and updates
 * the preview workspace. The default values depends on if categories are
 * present.
 */
FactoryController.prototype.setStandardOptionsAndUpdate = function() {
  this.view.setBaseOptions();
  this.view.setCategoryOptions(this.model.hasElements());
  this.generateNewOptions();
 };

/**
 * Asks the user if they want to use default configuration options specific
 * to categories or a single flyout of blocks. If desired, makes the necessary
 * changes to the options object depending on if there are categories and then
 * updates the preview workspace. Only updates category/flyout specific
 * options, not the base default options that are set regardless of if
 * categories or a single flyout are used.
 */
FactoryController.prototype.allowToSetDefaultOptions = function() {
  if (!this.model.hasElements() && !confirm('Do you want to use the default ' +
      'workspace configuration options for injecting a workspace without ' +
      'categories?')) {
    return;
  } else if (this.model.hasElements() && !confirm('Do you want to use the ' +
      'default workspace configuration options for injecting a workspace ' +
      'with categories?')) {
    return;
  }
  this.view.setCategoryOptions(this.model.hasElements());
  this.generateNewOptions();
};

/**
 * Generates a new options object for injecting a Blockly workspace based
 * on user input. Should be called every time a change has been made to
 * an input field. Updates the model and reinjects the preview workspace.
 */
FactoryController.prototype.generateNewOptions = function() {
  var optionsObj = new Object(null);

  // Add all standard options to the options object.
  // Use parse int to get numbers from value inputs.
  optionsObj['collapse'] =
      document.getElementById('option_collapse_checkbox').checked;
  optionsObj['comments'] =
      document.getElementById('option_comments_checkbox').checked;
  optionsObj['css'] = document.getElementById('option_css_checkbox').checked;
  optionsObj['disable'] =
      document.getElementById('option_disable_checkbox').checked;
  optionsObj['maxBlocks'] =
      parseInt(document.getElementById('option_maxBlocks_text').value);
  optionsObj['media'] = document.getElementById('option_media_text').value;
  optionsObj['readOnly'] =
      document.getElementById('option_readOnly_checkbox').checked;
  optionsObj['rtl'] = document.getElementById('option_rtl_checkbox').checked;
  optionsObj['scrollbars'] =
      document.getElementById('option_scrollbars_checkbox').checked;
  optionsObj['sounds'] =
      document.getElementById('option_sounds_checkbox').checked;
  optionsObj['trashcan'] =
      document.getElementById('option_trashcan_checkbox').checked;

  // If using a grid, add all grid options.
  if (document.getElementById('option_grid_checkbox').checked) {
    var grid = new Object(null);
    grid['spacing'] =
        parseInt(document.getElementById('gridOption_spacing_text').value);
    grid['length'] =
        parseInt(document.getElementById('gridOption_length_text').value);
    grid['colour'] = document.getElementById('gridOption_colour_text').value;
    grid['snap'] = document.getElementById('gridOption_snap_checkbox').checked;
    optionsObj['grid'] = grid;
  }

  // If using zoom, add all zoom options.
  if (document.getElementById('option_zoom_checkbox').checked) {
    var zoom = new Object(null);
    zoom['controls'] =
        document.getElementById('zoomOption_controls_checkbox').checked;
    zoom['wheel'] =
        document.getElementById('zoomOption_wheel_checkbox').checked;
    zoom['startScale'] =
        parseInt(document.getElementById('zoomOption_startScale_text').value);
    zoom['maxScale'] =
        parseInt(document.getElementById('zoomOption_maxScale_text').value);
    zoom['minScale'] =
        parseInt(document.getElementById('zoomOption_minScale_text').value);
    zoom['scaleSpeed'] =
        parseInt(document.getElementById('zoomOption_scaleSpeed_text').value);
    optionsObj['zoom'] = zoom;
  }

  this.model.setOptions(optionsObj);

  this.reinjectPreview(Blockly.Options.parseToolboxTree
      (this.generator.generateToolboxXml()));
};

