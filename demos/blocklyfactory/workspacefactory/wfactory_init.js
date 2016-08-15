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

/**
 * Namespace for workspace factory initialization methods.
 * @namespace
 */
FactoryInit = {};

/**
 * Initialization for workspace factory tab.
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
FactoryInit.initWorkspaceFactory = function(controller) {
  // Disable category editing buttons until categories are created.
  document.getElementById('button_remove').disabled = true;
  document.getElementById('button_up').disabled = true;
  document.getElementById('button_down').disabled = true;
  document.getElementById('button_editCategory').disabled = true;
  document.getElementById('button_editShadow').disabled = true;

  this.initColorPicker_(controller);
  this.addWorkspaceFactoryEventListeners_(controller);
  this.assignWorkspaceFactoryClickHandlers_(controller);
};

/**
 * Initialize the color picker in workspace factory.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
FactoryInit.initColorPicker_ = function(controller) {
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
FactoryInit.assignWorkspaceFactoryClickHandlers_ = function(controller) {
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

  document.getElementById('button_remove').addEventListener
      ('click',
      function() {
        controller.removeElement();
      });

  document.getElementById('button_export').addEventListener
      ('click',
      function() {
        controller.exportConfig();
      });

  document.getElementById('button_print').addEventListener
      ('click',
      function() {
        controller.printConfig();
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

  document.getElementById('button_editShadow').addEventListener
      ('click',
      function() {
        if (Blockly.selected) {
          // Can only edit blocks when a block is selected.

          if (!controller.isUserGenShadowBlock(Blockly.selected.id) &&
              Blockly.selected.getSurroundParent() != null) {
            // If a block is selected that could be a valid shadow block (not a
            // shadow block, has a surrounding parent), let the user make it a
            // shadow block. Use toggle instead of add so that the user can
            // click the button again to make the dropdown disappear without
            // clicking one of the options.
            document.getElementById('dropdownDiv_editShadowRemove').classList.
                remove("show");
            document.getElementById('dropdownDiv_editShadowAdd').classList.
                toggle("show");
          } else {
            // If the block is a shadow block, let the user make it a normal
            // block.
            document.getElementById('dropdownDiv_editShadowAdd').classList.
                remove("show");
            document.getElementById('dropdownDiv_editShadowRemove').classList.
                toggle("show");
          }
        }
      });

  document.getElementById('dropdown_name').addEventListener
      ('click',
      function() {
        controller.changeCategoryName();
        document.getElementById('dropdownDiv_editCategory').classList.
            remove("show");
      });

  document.getElementById('input_import').addEventListener
      ('change',
      function(event) {
        controller.importFile(event.target.files[0]);
      });

  document.getElementById('button_clear').addEventListener
      ('click',
      function() {
        controller.clear();
      });

  document.getElementById('dropdown_addShadow').addEventListener
      ('click',
      function() {
        controller.addShadow();
        document.getElementById('dropdownDiv_editShadowAdd').classList.
            remove("show");
      });

  document.getElementById('dropdown_removeShadow').addEventListener
      ('click',
      function() {
        controller.removeShadow();
        document.getElementById('dropdownDiv_editShadowRemove').classList.
            remove("show");
        // If turning invalid shadow block back to normal block, remove
        // warning and disable block editing privileges.
        Blockly.selected.setWarningText(null);
        if (!Blockly.selected.getSurroundParent()) {
          document.getElementById('button_editShadow').disabled = true;
        }
      });
};

/**
 * Add event listeners for workspace factory.
 * @private
 *
 * @param {!FactoryController} controller The controller for the workspace
 *    factory tab.
 */
FactoryInit.addWorkspaceFactoryEventListeners_ = function(controller) {
  // Use up and down arrow keys to move categories.
  // TODO(evd2014): When merge with next CL for editing preloaded blocks, make
  // sure mode is toolbox.
  window.addEventListener('keydown', function(e) {
    if (this.selectedTab != 'WORKSPACE_FACTORY' && e.keyCode == 38) {
      // Arrow up.
      controller.moveElement(-1);
    } else if (this.selectedTab != 'WORKSPACE_FACTORY' && e.keyCode == 40) {
      // Arrow down.
      controller.moveElement(1);
    }
  });

  // Add change listeners for toolbox workspace in workspace factory.
  controller.toolboxWorkspace.addChangeListener(
    function(e) {
    // Listen for Blockly move and delete events to update preview.
    // Not listening for Blockly create events because causes the user to drop
    // blocks when dragging them into workspace. Could cause problems if ever
    // load blocks into workspace directly without calling updatePreview.
    if (e.type == Blockly.Events.MOVE || e.type == Blockly.Events.DELETE) {
      controller.updatePreview();
    }

    // Listen for Blockly UI events to correctly enable the "Edit Block"
    // button. Only enable "Edit Block" when a block is selected and it has a
    // surrounding parent, meaning it is nested in another block (blocks that
    // are not nested in parents cannot be shadow blocks).
    if (e.type == Blockly.Events.MOVE || (e.type == Blockly.Events.UI &&
        e.element == 'selected')) {
      var selected = Blockly.selected;

      if (selected != null && selected.getSurroundParent() != null) {

        // A valid shadow block is selected. Enable block editing and remove
        // warnings.
        document.getElementById('button_editShadow').disabled = false;
        Blockly.selected.setWarningText(null);
      } else {
        if (selected != null &&
            controller.isUserGenShadowBlock(selected.id)) {

        // Provide warning if shadow block is moved and is no longer a valid
        // shadow block.
          Blockly.selected.setWarningText('Shadow blocks must be nested' +
              ' inside other blocks to be displayed.');

          // Give editing options so that the user can make an invalid shadow
          // block a normal block.
          document.getElementById('button_editShadow').disabled = false;
        } else {

          // No block selected that is a shadow block or could be a valid
          // shadow block.
          // Disable block editing.
          document.getElementById('button_editShadow').disabled = true;
          document.getElementById('dropdownDiv_editShadowRemove').classList.
              remove("show");
          document.getElementById('dropdownDiv_editShadowAdd').classList.
              remove("show");
        }
      }
    }

    // Convert actual shadow blocks added from the toolbox to user-generated
    // shadow blocks.
    if (e.type == Blockly.Events.CREATE) {
      controller.convertShadowBlocks();
    }
  });
};
