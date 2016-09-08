/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview Contains the init functions for the workspace factory tab.
 * Adds click handlers to buttons and dropdowns, adds event listeners for
 * keydown events and Blockly events, and configures the initial setup of
 * the page.
 *
 * @author Emma Dauterman (evd2014)
 */

 goog.require('FactoryUtils');

/**
 * Namespace for workspace factory initialization methods.
 * @namespace
 */
WorkspaceFactoryInit = {};

/**
 * Initialization for workspace factory tab.
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
WorkspaceFactoryInit.initWorkspaceFactory = function(controller) {
  // Disable category editing buttons until categories are created.
  document.getElementById('button_remove').disabled = true;
  document.getElementById('button_up').disabled = true;
  document.getElementById('button_down').disabled = true;
  document.getElementById('button_editCategory').disabled = true;

  this.initColorPicker_(controller);
  this.addWorkspaceFactoryEventListeners_(controller);
  this.assignWorkspaceFactoryClickHandlers_(controller);
  this.addWorkspaceFactoryOptionsListeners_(controller);

  // Check standard options and apply the changes to update the view.
  controller.setStandardOptionsAndUpdate();
};

/**
 * Initialize the color picker in workspace factory.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
WorkspaceFactoryInit.initColorPicker_ = function(controller) {
  // Array of Blockly category colors, variety of hues with saturation 45%
  // and value 65% as specified in Blockly Developer documentation:
  // https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
  var colors = ['#A65C5C',
      '#A6635C',
      '#A66A5C',
      '#A6725C',
      '#A6795C',
      '#A6815C',
      '#A6885C',
      '#A6905C',
      '#A6975C',
      '#A69F5C',
      '#A6A65C',
      '#9FA65C',
      '#97A65C',
      '#90A65C',
      '#88A65C',
      '#81A65C',
      '#79A65C',
      '#6FA65C',
      '#66A65C',
      '#5EA65C',
      '#5CA661',
      '#5CA668',
      '#5CA66F',
      '#5CA677',
      '#5CA67E',
      '#5CA686',
      '#5CA68D',
      '#5CA695',
      '#5CA69C',
      '#5CA6A4',
      '#5CA1A6',
      '#5C9AA6',
      '#5C92A6',
      '#5C8BA6',
      '#5C83A6',
      '#5C7CA6',
      '#5C74A6',
      '#5C6AA6',
      '#5C61A6',
      '#5E5CA6',
      '#665CA6',
      '#6D5CA6',
      '#745CA6',
      '#7C5CA6',
      '#835CA6',
      '#8B5CA6',
      '#925CA6',
      '#9A5CA6',
      '#A15CA6',
      '#A65CA4',
      '#A65C9C',
      '#A65C95',
      '#A65C8D',
      '#A65C86',
      '#A65C7E',
      '#A65C77',
      '#A65C6F',
      '#A65C66',
      '#A65C61',
      '#A65C5E'];

  // Create color picker with specific set of Blockly colors.
  var colorPicker = new goog.ui.ColorPicker();
  colorPicker.setColors(colors);

  // Create and render the popup color picker and attach to button.
  var popupPicker = new goog.ui.PopupColorPicker(null, colorPicker);
  popupPicker.render();
  popupPicker.attach(document.getElementById('dropdown_color'));
  popupPicker.setFocusable(true);
  goog.events.listen(popupPicker, 'change', function(e) {
    controller.changeSelectedCategoryColor(popupPicker.getSelectedColor());
    document.getElementById('dropdownDiv_editCategory').classList.remove
        ("show");
  });
};

/**
 * Assign click handlers for workspace factory.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
WorkspaceFactoryInit.assignWorkspaceFactoryClickHandlers_ =
    function(controller) {
  document.getElementById('tab_toolbox').addEventListener
      ('click',
      function() {
        controller.setMode(WorkspaceFactoryController.MODE_TOOLBOX);
      });

  document.getElementById('tab_preload').addEventListener
      ('click',
      function() {
        controller.setMode(WorkspaceFactoryController.MODE_PRELOAD);
      });

  document.getElementById('button_add').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_add').classList.toggle("show");
      });

  document.getElementById('dropdown_newCategory').addEventListener
      ('click',
      function() {
        controller.addCategory();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('dropdown_loadCategory').addEventListener
      ('click',
      function() {
        controller.loadCategory();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('dropdown_separator').addEventListener
      ('click',
      function() {
        controller.addSeparator();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('dropdown_loadStandardToolbox').addEventListener
      ('click',
      function() {
        controller.loadStandardToolbox();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('button_remove').addEventListener
      ('click',
      function() {
        controller.removeElement();
      });

  document.getElementById('dropdown_exportToolbox').addEventListener
      ('click',
      function() {
        controller.exportXmlFile(WorkspaceFactoryController.MODE_TOOLBOX);
        document.getElementById('dropdownDiv_export').classList.remove("show");
      });

  document.getElementById('dropdown_exportPreload').addEventListener
      ('click',
      function() {
        controller.exportXmlFile(WorkspaceFactoryController.MODE_PRELOAD);
        document.getElementById('dropdownDiv_export').classList.remove("show");
      });

  document.getElementById('dropdown_exportOptions').addEventListener
      ('click',
      function() {
        controller.exportInjectFile();
        document.getElementById('dropdownDiv_export').classList.remove("show");
      });

  document.getElementById('dropdown_exportAll').addEventListener
      ('click',
      function() {
        controller.exportInjectFile();
        controller.exportXmlFile(WorkspaceFactoryController.MODE_TOOLBOX);
        controller.exportXmlFile(WorkspaceFactoryController.MODE_PRELOAD);
        document.getElementById('dropdownDiv_export').classList.remove("show");
      });

  document.getElementById('button_export').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_export').classList.toggle("show");
        document.getElementById('dropdownDiv_load').classList.remove("show");
        document.getElementById('dropdownDiv_importBlocks').classList.
            remove("show");
      });

  document.getElementById('button_up').addEventListener
      ('click',
      function() {
        controller.moveElement(-1);
      });

  document.getElementById('button_down').addEventListener
      ('click',
      function() {
        controller.moveElement(1);
      });

  document.getElementById('button_editCategory').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_editCategory').classList.
        toggle("show");
      });

  document.getElementById('dropdown_name').addEventListener
      ('click',
      function() {
        controller.changeCategoryName();
        document.getElementById('dropdownDiv_editCategory').classList.
            remove("show");
      });

document.getElementById('button_importBlocks').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_importBlocks').classList.
            toggle("show");
        document.getElementById('dropdownDiv_export').classList.remove("show");
        document.getElementById('dropdownDiv_load').classList.remove("show");
      });

  document.getElementById('button_load').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_load').classList.toggle("show");
        document.getElementById('dropdownDiv_export').classList.remove("show");
        document.getElementById('dropdownDiv_importBlocks').classList.
            remove("show");
      });

  document.getElementById('input_loadToolbox').addEventListener
      ('change',
      function() {
        controller.importFile(event.target.files[0],
            WorkspaceFactoryController.MODE_TOOLBOX);
        document.getElementById('dropdownDiv_load').classList.remove("show");
      });

  document.getElementById('input_loadPreload').addEventListener
      ('change',
      function() {
        controller.importFile(event.target.files[0],
            WorkspaceFactoryController.MODE_PRELOAD);
        document.getElementById('dropdownDiv_load').classList.remove("show");
      });

  document.getElementById('input_importBlocksJson').addEventListener
      ('change',
      function() {
        controller.importBlocks(event.target.files[0],'JSON');
        document.getElementById('dropdownDiv_importBlocks').classList.
            remove("show");
      });

  document.getElementById('input_importBlocksJs').addEventListener
      ('change',
      function() {
        controller.importBlocks(event.target.files[0],'JavaScript');
        document.getElementById('dropdownDiv_importBlocks').classList.
            remove("show");
      });

  document.getElementById('button_clear').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_importBlocks').classList.
            remove("show");
        document.getElementById('dropdownDiv_export').classList.remove("show");
        document.getElementById('dropdownDiv_load').classList.remove("show");
        controller.clearAll();
      });

  document.getElementById('button_addShadow').addEventListener
      ('click',
      function() {
        controller.addShadow();
        WorkspaceFactoryInit.displayAddShadow_(false);
        WorkspaceFactoryInit.displayRemoveShadow_(true);
      });

  document.getElementById('button_removeShadow').addEventListener
      ('click',
      function() {
        controller.removeShadow();
        WorkspaceFactoryInit.displayAddShadow_(true);
        WorkspaceFactoryInit.displayRemoveShadow_(false);

        // Disable shadow editing button if turning invalid shadow block back
        // to normal block.
        if (!Blockly.selected.getSurroundParent()) {
          document.getElementById('button_addShadow').disabled = true;
        }
      });

  document.getElementById('button_standardOptions').addEventListener
      ('click', function() {
        controller.setStandardOptionsAndUpdate();
      });

  document.getElementById('button_optionsHelp').addEventListener
      ('click', function() {
        open('https://developers.google.com/blockly/guides/get-started/web');
      });
};

/**
 * Add event listeners for workspace factory.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
WorkspaceFactoryInit.addWorkspaceFactoryEventListeners_ = function(controller) {
  // Use up and down arrow keys to move categories.
  window.addEventListener('keydown', function(e) {
    // Don't let arrow keys have any effect if not in Workspace Factory
    // editing the toolbox.
    if (!(controller.keyEventsEnabled && controller.selectedMode
        == WorkspaceFactoryController.MODE_TOOLBOX)) {
      return;
    }

    if (e.keyCode == 38) {
      // Arrow up.
      controller.moveElement(-1);
    } else if (e.keyCode == 40) {
      // Arrow down.
      controller.moveElement(1);
    }
  });

  // Determines if a block breaks shadow block placement rules.
  // Breaks rules if (1) a shadow block no longer has a valid
  // parent, or (2) a normal block is inside of a shadow block.
  var isInvalidBlockPlacement = function(block) {
    return ((controller.isUserGenShadowBlock(block.id) &&
        !block.getSurroundParent()) ||
        (!controller.isUserGenShadowBlock(block.id) && block.getSurroundParent()
        && controller.isUserGenShadowBlock(block.getSurroundParent().id)));
  };

  // Add change listeners for toolbox workspace in workspace factory.
  controller.toolboxWorkspace.addChangeListener(function(e) {
    // Listen for Blockly move and delete events to update preview.
    // Not listening for Blockly create events because causes the user to drop
    // blocks when dragging them into workspace. Could cause problems if ever
    // load blocks into workspace directly without calling updatePreview.
    if (e.type == Blockly.Events.MOVE || e.type == Blockly.Events.DELETE ||
          e.type == Blockly.Events.CHANGE) {
      controller.saveStateFromWorkspace();
      controller.updatePreview();
    }

    // Listen for Blockly UI events to correctly enable the "Edit Block" button.
    // Only enable "Edit Block" when a block is selected and it has a
    // surrounding parent, meaning it is nested in another block (blocks that
    // are not nested in parents cannot be shadow blocks).
    if (e.type == Blockly.Events.MOVE || (e.type == Blockly.Events.UI &&
        e.element == 'selected')) {
      var selected = Blockly.selected;

      // Show shadow button if a block is selected. Show "Add Shadow" if
      // a block is not a shadow block, show "Remove Shadow" if it is a
      // shadow block.
      if (selected) {
        var isShadow = controller.isUserGenShadowBlock(selected.id);
        WorkspaceFactoryInit.displayAddShadow_(!isShadow);
        WorkspaceFactoryInit.displayRemoveShadow_(isShadow);
      } else {
        WorkspaceFactoryInit.displayAddShadow_(false);
        WorkspaceFactoryInit.displayRemoveShadow_(false);
      }

      if (selected != null && selected.getSurroundParent() != null &&
          !controller.isUserGenShadowBlock(selected.getSurroundParent().id)) {
        // Selected block is a valid shadow block or could be a valid shadow
        // block.

        // Enable block editing and remove warnings if the block is not a
        // variable user-generated shadow block.
        document.getElementById('button_addShadow').disabled = false;
        document.getElementById('button_removeShadow').disabled = false;

        if (!FactoryUtils.hasVariableField(selected) &&
            controller.isDefinedBlock(selected)) {
          selected.setWarningText(null);
        }
      } else {
        // Selected block cannot be a valid shadow block.

        if (selected != null && isInvalidBlockPlacement(selected)) {
          // Selected block breaks shadow block rules.
          // Invalid shadow block if (1) a shadow block no longer has a valid
          // parent, or (2) a normal block is inside of a shadow block.

          if (!controller.isUserGenShadowBlock(selected.id)) {
            // Warn if a non-shadow block is nested inside a shadow block.
            selected.setWarningText('Only shadow blocks can be nested inside\n'
                + 'other shadow blocks.');
          } else if (!FactoryUtils.hasVariableField(selected)) {
            // Warn if a shadow block is invalid only if not replacing
            // warning for variables.
            selected.setWarningText('Shadow blocks must be nested inside other'
                + ' blocks.')
          }

          // Give editing options so that the user can make an invalid shadow
          // block a normal block.
          document.getElementById('button_removeShadow').disabled = false;
          document.getElementById('button_addShadow').disabled = true;
        } else {
          // Selected block does not break any shadow block rules, but cannot
          // be a shadow block.

          // Remove possible 'invalid shadow block placement' warning.
          if (selected != null && controller.isDefinedBlock(selected) &&
              (!FactoryUtils.hasVariableField(selected) ||
              !controller.isUserGenShadowBlock(selected.id))) {
            selected.setWarningText(null);
          }

          // No block selected that is a shadow block or could be a valid shadow
          // block. Disable block editing.
          document.getElementById('button_addShadow').disabled = true;
          document.getElementById('button_removeShadow').disabled = true;
        }
      }
    }

    // Convert actual shadow blocks added from the toolbox to user-generated
    // shadow blocks.
    if (e.type == Blockly.Events.CREATE) {
      controller.convertShadowBlocks();

      // Let the user create a Variables or Functions category if they use
      // blocks from either category.

      // Get all children of a block and add them to childList.
      var getAllChildren = function(block, childList) {
        childList.push(block);
        var children = block.getChildren();
        for (var i = 0, child; child = children[i]; i++) {
          getAllChildren(child, childList);
        }
      };

      var newBaseBlock = controller.toolboxWorkspace.getBlockById(e.blockId);
      var allNewBlocks = [];
      getAllChildren(newBaseBlock, allNewBlocks);
      var variableCreated = false;
      var procedureCreated = false;

      // Check if the newly created block or any of its children are variable
      // or procedure blocks.
      for (var i = 0, block; block = allNewBlocks[i]; i++) {
        if (FactoryUtils.hasVariableField(block)) {
          variableCreated = true;
        } else if (FactoryUtils.isProcedureBlock(block)) {
          procedureCreated = true;
        }
      }

      // If any of the newly created blocks are variable or procedure blocks,
      // prompt the user to create the corresponding standard category.
      if (variableCreated && !controller.hasVariablesCategory()) {
        if (confirm('Your new block has a variables field. To use this block '
            + 'fully, you will need a Variables category. Do you want to add '
            + 'a Variables category to your custom toolbox?')) {
          controller.setMode(WorkspaceFactoryController.MODE_TOOLBOX);
          controller.loadCategoryByName('variables');
        }
      }

      if (procedureCreated && !controller.hasProceduresCategory()) {
        if (confirm('Your new block is a function block. To use this block '
            + 'fully, you will need a Functions category. Do you want to add '
            + 'a Functions category to your custom toolbox?')) {
          controller.setMode(WorkspaceFactoryController.MODE_TOOLBOX);
          controller.loadCategoryByName('functions');
        }
      }
    }
  });
};

/**
 * Display or hide the add shadow button.
 *
 * @param {boolean} show True if the add shadow button should be shown, false
 *    otherwise.
 */
WorkspaceFactoryInit.displayAddShadow_ = function(show) {
  document.getElementById('button_addShadow').style.display =
      show ? 'inline-block' : 'none';
};

/**
 * Display or hide the remove shadow button.
 *
 * @param {boolean} show True if the remove shadow button should be shown, false
 *    otherwise.
 */
WorkspaceFactoryInit.displayRemoveShadow_ = function(show) {
  document.getElementById('button_removeShadow').style.display =
      show ? 'inline-block' : 'none';
}

/**
 * Add listeners for workspace factory options input elements.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
WorkspaceFactoryInit.addWorkspaceFactoryOptionsListeners_ =
    function(controller) {

  // Checking the grid checkbox displays grid options.
  document.getElementById('option_grid_checkbox').addEventListener('change',
      function(e) {
        document.getElementById('grid_options').style.display =
            document.getElementById('option_grid_checkbox').checked ?
            'block' : 'none';
      });

  // Checking the grid checkbox displays zoom options.
  document.getElementById('option_zoom_checkbox').addEventListener('change',
      function(e) {
        document.getElementById('zoom_options').style.display =
            document.getElementById('option_zoom_checkbox').checked ?
            'block' : 'none';
      });

  document.getElementById('option_readOnly_checkbox').addEventListener('change',
    function(e) {
      document.getElementById('trashcan_option').style.display =
          document.getElementById('option_readOnly_checkbox').checked ?
            'none' : 'block';
    });

    document.getElementById('option_infiniteBlocks_checkbox').addEventListener('change',
    function(e) {
      document.getElementById('maxBlockNumber_option').style.display =
          document.getElementById('option_infiniteBlocks_checkbox').checked ?
            'none' : 'block';
    });

  // Generate new options every time an options input is updated.
  var optionsElements = document.getElementsByClassName('optionsInput');
  for (var i = 0; i < optionsElements.length; i++) {
    optionsElements[i].addEventListener('change', function() {
      controller.generateNewOptions();
    });
  }
};
