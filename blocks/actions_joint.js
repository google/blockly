/**
 * @fileoverview Actions/Joint blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.actionJoint'); // Deprecated
goog.provide('Blockly.Constants.ActionJoint');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_set_module_motor_positions = {
  /**
     * Block for joint motor positions.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput().appendField(image);

    this.appendValueInput('MOTOR_POSITION_X')
      .appendField(Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION)
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('MOTOR_POSITION_Y')
      .appendField('Y: ')
      .setCheck('Number');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_positions', keywords);
  }
};

Blockly.Blocks.fable_set_module_motor_pos_speed = {
  /**
     * Block for motor position with speed.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('MOTOR_POSITION_X')
      .appendField(Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION)
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('MOTOR_POSITION_Y')
      .appendField('Y: ')
      .setCheck('Number');

    this.appendValueInput('MOTORS_SPEEDS')
      .appendField(Blockly.Msg.FABLE_WITH_SPEED)
      .setCheck('Number');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION_WITH_SPEED_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION,
      Blockly.Msg.FABLE_WITH_SPEED,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_pos_speed', keywords);
  }
};

Blockly.Blocks.fable_set_module_accuracy = {
  /**
     * Block for joint motor accuracy.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_JOINT_SET_MOTOR_ACCURACY);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.ACCURACY_DEFAULT, 'DEFAULT'],
        [Blockly.Msg.ACCURACY_HIGH, 'HIGH']]), 'MOTOR_ACCURACY_VALUE');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_SET_MOTOR_ACCURACY_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_SET_MOTOR_ACCURACY,
      Blockly.Msg.ACCURACY_DEFAULT,
      Blockly.Msg.ACCURACY_HIGH,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_accuracy', keywords);
  }
};
