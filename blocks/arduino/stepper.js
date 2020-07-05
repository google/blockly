/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Blocks for Arduino Stepper library.
 *     The Arduino Servo functions syntax can be found in the following URL:
 *     http://arduino.cc/en/Reference/Stepper
 *     Note that this block uses the Blockly.FieldInstance instead of
 *     Blockly.FieldDropdown which generates a unique instance per setup block
 *     in the workspace.
 */
'use strict';

goog.provide('Blockly.Blocks.stepper');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.stepper.HUE = 80;

Blockly.Blocks['stepper_config'] = {
  /**
   * Block for for the stepper generator configuration including creating
   * an object instance and setting up the speed. Info in the setHelpUrl link.
   * @this Blockly.Block
   */
  init: function() {
    var dropdownOptions = [[Blockly.Msg.ARD_STEPPER_TWO_PINS, 'TWO'],
                           [Blockly.Msg.ARD_STEPPER_FOUR_PINS, 'FOUR']];
    var dropdown = new Blockly.FieldDropdown(dropdownOptions, function(option) {
      var input = (option == 'FOUR');
      this.sourceBlock_.updateShape_(input);
    });

    this.setHelpUrl('http://arduino.cc/en/Reference/StepperConstructor');
    this.setColour(Blockly.Blocks.stepper.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_STEPPER_SETUP)
        .appendField(
            new Blockly.FieldInstance('Stepper',
                                      Blockly.Msg.ARD_STEPPER_DEFAULT_NAME,
                                      true, true, false),
            'STEPPER_NAME')
        .appendField(Blockly.Msg.ARD_STEPPER_MOTOR);
    this.appendDummyInput('PINS_DROPDOWN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_STEPPER_NUMBER_OF_PINS)
        .appendField(dropdown, "STEPPER_NUMBER_OF_PINS");
    this.appendDummyInput('PINS')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_STEPPER_PIN1)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), 'STEPPER_PIN1')
        .appendField(Blockly.Msg.ARD_STEPPER_PIN2)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), 'STEPPER_PIN2');
    this.appendValueInput('STEPPER_STEPS')
        .setCheck(Blockly.Types.NUMBER.checkList)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_STEPPER_REVOLVS);
    this.appendValueInput('STEPPER_SPEED')
        .setCheck(Blockly.Types.NUMBER.checkList)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.ARD_STEPPER_SPEED);
    this.setTooltip(Blockly.Msg.ARD_STEPPER_SETUP_TIP);
  },
  /**
   * Parse XML to restore the number of pins available.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var input = (xmlElement.getAttribute('number_of_pins') == 'FOUR');
    this.updateShape_(input);
  },
  /**
   * Create XML to represent number of pins selection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var input = this.getFieldValue('STEPPER_NUMBER_OF_PINS');
    container.setAttribute("number_of_pins", input);
    return container;
  },
  /**
   * Modify this block to have the correct number of pins available.
   * @param {boolean} fourPins True if this block has a 4 or 2 stepper pins.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function(fourPins) {
    // Single check as Pin 3 and 4 should always be added or removed together
    var extraPinsExist = this.getFieldValue('STEPPER_PIN3');
    if (fourPins) {
      if (!extraPinsExist) {
         this.getInput("PINS")
            .appendField(Blockly.Msg.ARD_STEPPER_PIN3, "PIN3")
            .appendField(new Blockly.FieldDropdown(
                Blockly.Arduino.Boards.selected.digitalPins), 'STEPPER_PIN3')
            .appendField(Blockly.Msg.ARD_STEPPER_PIN4, "PIN4")
            .appendField(new Blockly.FieldDropdown(
                Blockly.Arduino.Boards.selected.digitalPins), 'STEPPER_PIN4');
      }
    } else {
      // Two pins is selected
      if (extraPinsExist) {
        this.getInput("PINS").removeField("STEPPER_PIN3");
        this.getInput("PINS").removeField("PIN3");
        this.getInput("PINS").removeField("STEPPER_PIN4");
        this.getInput("PINS").removeField("PIN4");
      }
    }
  },
  /**
   * Updates the content of the the pin related fields.
   * @this Blockly.Block
   */
  updateFields: function() {
    Blockly.Boards.refreshBlockFieldDropdown(
        this, 'STEPPER_PIN1', 'digitalPins');
    Blockly.Boards.refreshBlockFieldDropdown(
        this, 'STEPPER_PIN2', 'digitalPins');
    Blockly.Boards.refreshBlockFieldDropdown(
        this, 'STEPPER_PIN3', 'digitalPins');
    Blockly.Boards.refreshBlockFieldDropdown(
        this, 'STEPPER_PIN4', 'digitalPins');
  }
};

Blockly.Blocks['stepper_step'] = {
  /**
   * Block for for the stepper 'step()' function.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/StepperStep');
    this.setColour(Blockly.Blocks.stepper.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_STEPPER_STEP)
        .appendField(
            new Blockly.FieldInstance('Stepper',
                                      Blockly.Msg.ARD_STEPPER_DEFAULT_NAME,
                                      false, true, false),
            'STEPPER_NAME');
    this.appendValueInput('STEPPER_STEPS')
        .setCheck(Blockly.Types.NUMBER.checkList);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_STEPPER_STEPS);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.ARD_STEPPER_STEP_TIP);
  },
  /**
   * Called whenever anything on the workspace changes.
   * It checks/warns if the selected stepper instance has a config block.
   * @this Blockly.Block
   */
  onchange: function(event) {
    if (!this.workspace || event.type == Blockly.Events.MOVE ||
        event.type == Blockly.Events.UI) {
        return;  // Block deleted or irrelevant event
    }

    var instanceName = this.getFieldValue('STEPPER_NAME')
    if (Blockly.Instances.isInstancePresent(instanceName, 'Stepper', this)) {
      this.setWarningText(null);
    } else {
      // Set a warning to select a valid stepper config block
      this.setWarningText(
        Blockly.Msg.ARD_COMPONENT_WARN1.replace(
            '%1', Blockly.Msg.ARD_STEPPER_COMPONENT).replace(
                '%2', instanceName));
    }
  }
};
