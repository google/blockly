/**
 * @fileoverview Actions/Spin blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.actionSpin'); // Deprecated
goog.provide('Blockly.Constants.ActionSpin');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_set_speed_simple = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    // TODO: ROTATE LEFT/ROTATE RIGHT instead of just left/right
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FABLE_SPIN_SET_DRIVE_FORWARD, 'forward'],
        [Blockly.Msg.FABLE_SPIN_SET_DRIVE_BACKWARD, 'backward'],
        [Blockly.Msg.FABLE_SPIN_SET_DRIVE_STOP, 'stop'],
        [Blockly.Msg.LEFT, 'left'],
        [Blockly.Msg.RIGHT, 'right']
      ]), 'MOVEMENT');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_DRIVE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.FABLE_SPIN_SET_DRIVE_FORWARD,
      Blockly.Msg.FABLE_SPIN_SET_DRIVE_BACKWARD,
      Blockly.Msg.FABLE_SPIN_SET_DRIVE_STOP,
      Blockly.Msg.LEFT,
      Blockly.Msg.RIGHT
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_speed_simple', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_set_speed = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_SPIN_SET_SPEED);

    this.appendValueInput('MOTOR_A_SPEED')
      .appendField(Blockly.Msg.FABLE_SPIN_MOTOR_A + ': ')
      .setCheck('Number');

    this.appendValueInput('MOTOR_B_SPEED')
      .appendField(Blockly.Msg.FABLE_SPIN_MOTOR_B + ': ')
      .setCheck('Number');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_SPEED_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_SPEED,
      Blockly.Msg.FABLE_SPIN_MOTOR_A,
      Blockly.Msg.FABLE_SPIN_MOTOR_B,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [

    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_set_speed', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_drive = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_DRIVE);

    this.appendValueInput('DISTANCE')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.METERS, '\'m\''],
        [Blockly.Msg.CENTIMETERS, '\'cm\''],
        [Blockly.Msg.FEET, '\'ft\''],
        [Blockly.Msg.INCHES, '\'in\'']]),
      'METRIC');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_DRIVE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_DRIVE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.METERS,
      Blockly.Msg.CENTIMETERS,
      Blockly.Msg.FEET,
      Blockly.Msg.INCHES
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_drive', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_drive_with_speed = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_DRIVE);

    this.appendValueInput('DISTANCE')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.METERS, '\'m\''],
        [Blockly.Msg.CENTIMETERS, '\'cm\''],
        [Blockly.Msg.FEET, '\'ft\''],
        [Blockly.Msg.INCHES, '\'in\'']]),
      'METRIC');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_WITH_SPEED);

    this.appendValueInput('SPEED')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_DRIVE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_DRIVE,
      Blockly.Msg.FABLE_WITH_SPEED,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.METERS,
      Blockly.Msg.CENTIMETERS,
      Blockly.Msg.FEET,
      Blockly.Msg.INCHES
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_drive_with_speed', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_spin = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_SPIN);

    this.appendValueInput('TURNS')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.TIMES, '\'times\''],
        [Blockly.Msg.DEGREES, '\'degrees\''],
        [Blockly.Msg.RADIANS, '\'radians\'']]),
      'METRIC');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_SPIN_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_SPIN,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.TIMES,
      Blockly.Msg.DEGREES,
      Blockly.Msg.RADIANS
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_spin', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_spin_with_speed = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_SPIN);

    this.appendValueInput('TURNS')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.TIMES, '\'times\''],
        [Blockly.Msg.DEGREES, '\'degrees\''],
        [Blockly.Msg.RADIANS, '\'radians\'']]),
      'METRIC');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_WITH_SPEED);

    this.appendValueInput('SPEED')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_SPIN_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_SPIN,
      Blockly.Msg.FABLE_WITH_SPEED,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.TIMES,
      Blockly.Msg.DEGREES,
      Blockly.Msg.RADIANS
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_spin_with_speed', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_headlights = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    var optionsArray = [[Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TURN_ON, 'on'],
      [Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TURN_OFF, 'off'],
      [Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TOGGLE, 'toggle']];

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_HEADLIGHTS);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(optionsArray), 'HEADLIGHTS_ACTION');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_HEADLIGHTS_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_HEADLIGHTS,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TURN_ON,
      Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TURN_OFF,
      Blockly.Msg.FABLE_SPIN_HEADLIGHTS_TOGGLE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_headlights', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_set_ir_message = {
  /**
     * Block for sending ir message to send.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    const image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');

    this.appendDummyInput().appendField(image);
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_SET_IR_MESSAGE)
      .appendField(new Blockly.AsciiInput('KEYCODE_SPACEBAR    32'), 'MESSAGE');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_IR_MESSAGE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_IR_MESSAGE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.SPACEBAR,
      Blockly.Msg.UP,
      Blockly.Msg.DOWN,
      Blockly.Msg.LEFT,
      Blockly.Msg.RIGHT
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_set_ir_message', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_spin_reset_encoder = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_SPIN_RESET_ENCODER);

    const motorArray = [[Blockly.Msg.FABLE_SPIN_MOTOR_A, 'A'],
      [Blockly.Msg.FABLE_SPIN_MOTOR_B, 'B'],
      [Blockly.Msg.FABLE_SPIN_BOTH_MOTORS, 'both']];

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(motorArray), 'MOTOR_ID');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_RESET_ENCODER_TOOLTIP); // change tool tip in translations
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_RESET_ENCODER,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SERVO}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.FABLE_SPIN_MOTOR_A,
      Blockly.Msg.FABLE_SPIN_MOTOR_B,
      Blockly.Msg.FABLE_SPIN_BOTH_MOTORS
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_reset_encoder', keywords, toolboxKeywords);
  }
};
