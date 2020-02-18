/**
 * @fileoverview Senses/Joint blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.sensesJoint'); // Deprecated
goog.provide('Blockly.Constants.SensesJoint');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_get_module_motor_position = {
  /**
     * Block for getting joint motor position.
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

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_JOINT_MOTOR_GET_POSITION);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');
    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_MOTOR_GET_POSITION_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_MOTOR_GET_POSITION,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_module_motor_position', keywords);
  }
};

Blockly.Blocks.fable_read_joint_sensor = {
  /**
     * Block collapsing the previous getter blocks. It displays a dropdown with Position, Speed or Torque.
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
      .appendField(Blockly.Msg.FABLE_READ_JOINT_SENSOR);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FABLE_JOINT_POSITION_X, '\'angleX\''],
        [Blockly.Msg.FABLE_JOINT_POSITION_Y, '\'angleY\''],
        [Blockly.Msg.FABLE_JOINT_TORQUE_X, '\'torqueX\''],
        [Blockly.Msg.FABLE_JOINT_TORQUE_Y, '\'torqueY\''],
        [Blockly.Msg.FABLE_JOINT_SPEED_X, '\'speedX\''],
        [Blockly.Msg.FABLE_JOINT_SPEED_Y, '\'speedY\'']]),
      'METRIC');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);

    // this.setTooltip(Blockly.Msg.FABLE_READ_JOINT_SENSOR_TOOLTIP);
    var thisBlock = this;
    this.setTooltip(function () {
      var metric = thisBlock.getFieldValue('METRIC');
      var TOOLTIPS = {
        '\'angleX\'': Blockly.Msg.FABLE_JOINT_MOTOR_GET_POSITION_TOOLTIP,
        '\'angleY\'': Blockly.Msg.FABLE_JOINT_MOTOR_GET_POSITION_TOOLTIP,
        '\'torqueX\'': Blockly.Msg.FABLE_JOINT_GET_MOTOR_TORQUE_TOOLTIP,
        '\'torqueY\'': Blockly.Msg.FABLE_JOINT_GET_MOTOR_TORQUE_TOOLTIP,
        '\'speedX\'': Blockly.Msg.FABLE_JOINT_GET_MOTOR_SPEED_TOOLTIP,
        '\'speedY\'': Blockly.Msg.FABLE_JOINT_GET_MOTOR_SPEED_TOOLTIP
      };
      return TOOLTIPS[metric];
    });

    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_READ_JOINT_SENSOR,
      Blockly.Msg.FABLE_JOINT_POSITION_X,
      Blockly.Msg.FABLE_JOINT_POSITION_Y,
      Blockly.Msg.FABLE_JOINT_TORQUE_X,
      Blockly.Msg.FABLE_JOINT_TORQUE_Y,
      Blockly.Msg.FABLE_JOINT_SPEED_X,
      Blockly.Msg.FABLE_JOINT_SPEED_Y,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_read_joint_sensor', keywords);
  }
};
