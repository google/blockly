/**
 * @fileoverview Helper for the toolbox search handler.
 * Checks for any functions made by the user and adds a "execute function x" blocks
 * to the toolbox search.
 * Additionally, update and remove those function blocks that get changed or deleted by the user.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.WorkspaceSearchHelper');

goog.require('Blockly.Search');

/**
 * @param {Blockly.ToolboxSearch} parent - The toolbox search handler that this helper will, well, help.
 * @param {Blockly.WorkspaceSvg} workspace - Main Blockly workspace.
 * It's the workspace in which the user will create/edit function blocks.
 */
Blockly.WorkspaceSearchHelper = function (parent, workspace) {
  this.workspace_ = workspace;
  this.parent_ = parent;

  var thisObj = this;

  // Add a workspace change listener (so blocks get added/removed to a trie when
  // the user adds/removes them to/from the workspace)
  this.workspace_.addChangeListener(function (event) {
    thisObj.onNewWorkspaceEvent(event);
  });
};

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add, update or remove blocks to the Search handler's trie
 * whenever the user adds, changes or removes blocks from the workspace.
 *
 * @param {!Blockly.Event} event The Blockly event that got fired because of something changing in Blockly.
 */
Blockly.WorkspaceSearchHelper.prototype.onNewWorkspaceEvent = function (event) {
  var i;
  var blockData;

  // If a block was added to the workspace, add it's associated keywords to the handler's trie.
  if (event.type === Blockly.Events.CREATE) {
    // Decode the XML contents so any child blocks that also got added to the workspace get added to the trie as well,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksAdded = this.parent_.decodeXmlBlocks(event.xml);

    // Go through all added blocks
    for (i = 0; i < blocksAdded.length; i++) {
      blockData = blocksAdded[i];

      // Add the block's information to the trie
      if (blockData[0] && blockData[1]) {
        this.parent_.onBlockAdded(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.DELETE) {
    // If a block was removed from the workspace, remove it's associated keywords from the handler's trie.
    // Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.parent_.decodeXmlBlocks(event.oldXml);

    // Go through all removed blocks
    for (i = 0; i < blocksRemoved.length; i++) {
      blockData = blocksRemoved[i];

      // Remove the block and all associated keywords from the trie
      if (blockData[0] && blockData[1]) {
        this.parent_.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.CHANGE && event.element === 'field') {
    // If any of the fields in the block changed, the block's information has to be updated,
    // e.g. the user chose a different option in the dropdown.
    // This is done so the search doesn't consider a block as a result if the dropdown doesn't match the search term, for example.
    // @todo Check if any other element types should be handled.

    // Get the block and the changed field
    var blockInfo = this.workspace_.getBlockById(event.blockId);
    var changedField = blockInfo.getField(event.name);

    // Initialize 2 lists. One will hold all keywords that have to be added, the other keywords that will be removed from the trie
    var toAdd = [];
    var toRemove = [];

    // Different cases depending on the type of field that was changed
    if (changedField instanceof Blockly.FieldDropdown) {
      // The changed field was a dropdown

      // Get all of the dropdown options
      var dropdownOptions;
      if (changedField.menuGenerator_ && typeof changedField.menuGenerator_ !== 'function') {
        dropdownOptions = changedField.menuGenerator_;
      } else if (changedField.generatedOptions_) {
        dropdownOptions = changedField.generatedOptions_;
      }

      // Go through the dropdown options
      for (i = 0; i < dropdownOptions.length; i++) {
        var dropdown = dropdownOptions[i];
        if (dropdown[1]) {
          // If the OLD dropdown option was found, put it in toRemove
          if (dropdown[1] === event.oldValue) {
            if (typeof dropdown[0] === 'string') {
              toRemove.push(dropdown[0]);
            }
            toRemove.push(dropdown[1]);
          } else if (dropdown[1] === event.newValue) {
            // Otherwise, if the NEW dropdown option was found, put it in toAdd
            if (typeof dropdown[0] === 'string') {
              toAdd.push(dropdown[0]);
            }
            toAdd.push(dropdown[1]);
          }
        }
      }
    } else if (changedField instanceof Blockly.FieldBoolean) {
      // The changed field was a boolean
      // Add the new value to toAdd
      toAdd.push(event.newValue.toString());
      toAdd.push(event.newValue ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);

      // Add the old value to toRemove
      toRemove.push((!event.newValue).toString());
      toRemove.push(!event.newValue ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);
    } else if (changedField instanceof Blockly.ButtonInput ||
                 changedField instanceof Blockly.AsciiInput) {
      // The changed field was a ButtonInput or a AsciiInput

      // Retrieve the display text (b/c the value has extra info that is hidden from the user)
      toAdd.push(changedField.getDisplayText_());

      // Do the same for the value that should be removed
      toRemove.push(changedField.getDisplayText_(event.oldValue));
    } else if (changedField instanceof Blockly.FieldTextInput ||
                changedField instanceof Blockly.FieldAngle ||
                changedField instanceof Blockly.FieldJointAngle) {
      // The changed field was a text input (number and text fields), or an angle

      // Just add newValue and oldValue to the two lists respectively
      toAdd.push(event.newValue.toString());
      toRemove.push(event.oldValue.toString());
    }

    this.onBlockChanged(event, toAdd, toRemove);
  }
};

/**
 * When a block is changed and the CHANGE event is handled, this function gets executed.
 * It will receive all keywords that have changed.
 *
 * New keywords get added to the trie.
 * Old keywords get removed from the trie.
 *
 * @param {Blockly.Event} event - The CHANGE Blockly event that triggered this method.
 * @param {Array<String>} toAdd - The list of keywords associated with the changed block that should be added to the trie.
 * @param {Array<String>} toRemove - The list of keywords associated with the changed block that should be deregistered.
 */
Blockly.WorkspaceSearchHelper.prototype.onBlockChanged = function (event, toAdd, toRemove) {
  var j;
  for (j = 0; j < toRemove.length; j++) {
    const splitText = toRemove[j].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

    // Go through the single words of the element after splitting it.
    for (let k = 0; k < splitText.length; k++) {
      const text = splitText[k];

      // Remove the keyword from the block's keywords
      if (text && text !== '') {
        // Remove a keyword from the search trie
        this.parent_.removeFromTrie(text, event.blockId);

        // Remove the reverse information as well, i.e. remove the keyword from the block's list of keywords
        for (let l = 0; l < this.parent_.blocksAdded_[event.blockId].length; l++) {
          if (this.parent_.blocksAdded_[event.blockId][l] === text) {
            this.parent_.blocksAdded_[event.blockId].splice(l, 1);
            l--;
          }
        }
      }
    }
  }

  for (j = 0; j < toAdd.length; j++) {
    const splitText = toAdd[j].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');
    // Go through the single words of the element after splitting it.
    for (let k = 0; k < splitText.length; k++) {
      const text = splitText[k];

      // Add the keyword to the block's keywords
      if (text && text !== '') {
        // Add a keyword to the search trie
        this.parent_.addToTrie(text, event.blockId);

        // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
        this.parent_.blocksAdded_[event.blockId].push(text);
      }
    }
  }
};

/**
 * Generates a list of dynamic keywords associated with the block.
 * This includes text fields, selected dropdown options, numbers inside math field, etc.
 *
 * @param {Blockly.Block} block - The block that this function will extract field inputs from.
 *
 * @returns {Array<String>} - An list of words extracted from the block.
 */
Blockly.WorkspaceSearchHelper.prototype.generateDynamicKeywords_ = function (block) {
  var dynamicKeywords = [];

  // Go through the block's inputs
  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];

    // Go through each input's fields
    for (var j = 0; j < input.fieldRow.length; j++) {
      var field = input.fieldRow[j];

      // A lot of checks for the type of field
      if (field instanceof Blockly.FieldDropdown) {
        // The field is a dropdown

        // Get the selected dropdown option
        var selectedDropdown;
        if (field.menuGenerator_ && typeof field.menuGenerator_ !== 'function') {
          selectedDropdown = field.menuGenerator_[field.selectedIndex_];
        } else if (field.generatedOptions_) {
          selectedDropdown = field.generatedOptions_[field.selectedIndex_];
        }

        // Add the dropdown option if it was found.
        if (selectedDropdown[0] && typeof selectedDropdown[0] === 'string') {
          dynamicKeywords.push(selectedDropdown[0].toString());
        }
        // Also add the dropdown option's Python code. Might wanna remove this depending on the situation.
        if (selectedDropdown[1]) {
          dynamicKeywords.push(selectedDropdown[1].toString());
        }
      } else if (field instanceof Blockly.FieldTextInput ||
                 field instanceof Blockly.FieldAngle ||
                 field instanceof Blockly.FieldJointAngle) {
        // The field is a text or math input, or an angle
        // Just grab the value inside the field
        dynamicKeywords.push(field.value_.toString());
      } else if (field instanceof Blockly.ButtonInput ||
                 field instanceof Blockly.AsciiInput) {
        // The field is a ButtonInput or an AsciiInput
        // Get the displayed text, since the value has some extra metadata that is hidden from the user
        dynamicKeywords.push(field.getDisplayText_());
      } else if (field instanceof Blockly.FieldBoolean) {
        // The field is a boolean
        // Grab the value and the associated TRUE/FALSE localized keyword.
        dynamicKeywords.push(field.value_.toString());
        dynamicKeywords.push(field.value_ ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);
      }
    }
  }

  return dynamicKeywords;
};
