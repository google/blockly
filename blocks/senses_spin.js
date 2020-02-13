/**
 * @fileoverview Senses/Spin blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.sensesSpin'); // Deprecated
goog.provide('Blockly.Constants.SensesSpin');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_spin_get_sensor = {
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
      .appendField(Blockly.Msg.FABLE_SPIN_GET_SENSOR);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FABLE_SPIN_SENSOR_PROXIMITY, 'proximity'],
        [Blockly.Msg.FABLE_SPIN_SENSOR_COLOR, 'color'],
        [Blockly.Msg.FABLE_SPIN_SENSOR_AMBIENT, 'ambientLight'],
        [Blockly.Msg.FABLE_SPIN_SENSOR_DIRECTED, 'directedLight']]),
      'MEASURE');

    var sensorsArray = [['1', '1'],
      ['2', '2'],
      ['3', '3']];

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_FROM_SENSOR)
      .appendField(new Blockly.FieldDropdown(sensorsArray), 'SPIN_SENSOR');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    const _this = this;

    this.setTooltip(function () {
      const sensor = _this.getFieldValue('MEASURE');
      var TOOLTIPS = {
        proximity: Blockly.Msg.FABLE_SPIN_SENSOR_DISTANCE_TOOLTIP,
        color: Blockly.Msg.FABLE_SPIN_SENSOR_COLOR_TOOLTIP,
        ambientLight: Blockly.Msg.FABLE_SPIN_SENSOR_AMBIENT_TOOLTIP,
        directedLight: Blockly.Msg.FABLE_SPIN_SENSOR_DIRECTED_TOOLTIP
      };
      try {
        return TOOLTIPS[sensor];
      } catch (err) {
        return Blockly.Msg.FACE_READ_SENSOR_TOOLTIP;
      }
    });

    this.setInputsInline(true);
    this.setOutput(true);
    this.setHelpUrl('http://www.example.com/');
  },
  // dynamic type checker
  onchange: function (ev) {
    const sensor = this.getFieldValue('MEASURE');

    switch (sensor) {
      case 'color':
        this.setOutput(true, ['Colour', 'Array']);
        break;
      default:
        this.setOutput(true, 'Number');
        break;
    }
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_GET_SENSOR,
      Blockly.Msg.FABLE_SPIN_SENSOR_PROXIMITY,
      Blockly.Msg.FABLE_SPIN_SENSOR_COLOR,
      Blockly.Msg.FABLE_SPIN_SENSOR_AMBIENT, Blockly.Msg.FABLE_SPIN_SENSOR_DIRECTED,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_get_sensor', keywords);
  }
};

Blockly.Blocks.fable_spin_obstacle_detected = {
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
      .appendField(Blockly.Msg.FABLE_SPIN_OBSTACLE_DETECTED_1);

    this.appendValueInput('PROXIMITY_PERC')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_OBSTACLE_DETECTED_2);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_OBSTACLE_DETECTED_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_OBSTACLE_DETECTED_1,
      Blockly.Msg.FABLE_SPIN_OBSTACLE_DETECTED_2,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_obstacle_detected', keywords);
  }
};

Blockly.Blocks.fable_spin_color_found = {
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

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_SPIN_COLOR_FOUND);

    const colorOptions = [
      [{ src: Blockly.Blocks.Definitions.imageDir + 'red@1x.png', width: 25, height: 25, alt: 'red' }, '[100, 0, 0]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'green@1x.png', width: 25, height: 25, alt: 'green' }, '[0, 100, 0]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'blue@1x.png', width: 25, height: 25, alt: 'blue' }, '[0, 0, 100]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'yellow@1x.png', width: 25, height: 25, alt: 'yellow' }, '[100, 100, 0]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'magenta@1x.png', width: 25, height: 25, alt: 'magenta' }, '[100, 0, 100]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'cyan@1x.png', width: 25, height: 25, alt: 'cyan' }, '[0, 100, 100]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'white@1x.png', width: 25, height: 25, alt: 'cyan' }, '[100, 100, 100]'],
      [{ src: Blockly.Blocks.Definitions.imageDir + 'black@1x.png', width: 25, height: 25, alt: 'cyan' }, '[0, 0, 0]']
    ];

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(colorOptions), 'COLOUR');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_COLOR_FOUND_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_COLOR_FOUND,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_color_found', keywords);
  }
};

Blockly.Blocks.fable_spin_motor_moving = {
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
      .appendField(Blockly.Msg.FABLE_SPIN_CHECK_IF);

    var motorArray = [[Blockly.Msg.FABLE_SPIN_NO_MOTORS, 'no'],
      [Blockly.Msg.FABLE_SPIN_ANY_MOTORS, 'any'],
      [Blockly.Msg.FABLE_SPIN_BOTH_MOTORS, 'both'],
      [Blockly.Msg.FABLE_SPIN_MOTOR_A, 'A'],
      [Blockly.Msg.FABLE_SPIN_MOTOR_B, 'B']];

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(motorArray), 'MOTOR');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_ARE_MOTORS_MOVING);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_ARE_MOTORS_MOVING_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_CHECK_IF,
      Blockly.Msg.FABLE_SPIN_NO_MOTORS,
      Blockly.Msg.FABLE_SPIN_ANY_MOTORS,
      Blockly.Msg.FABLE_SPIN_BOTH_MOTORS,
      Blockly.Msg.FABLE_SPIN_MOTOR_A,
      Blockly.Msg.FABLE_SPIN_MOTOR_B,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_motor_moving', keywords);
  }
};

Blockly.Blocks.fable_spin_get_motor = {
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

    var optionsArray = [[Blockly.Msg.FABLE_SPIN_GET_ANGLE_A, 'angleA'],
      [Blockly.Msg.FABLE_SPIN_GET_ANGLE_B, 'angleB'],
      [Blockly.Msg.FABLE_SPIN_GET_ROUNDS_A, 'roundsA'],
      [Blockly.Msg.FABLE_SPIN_GET_ROUNDS_B, 'roundsB'],
      [Blockly.Msg.FABLE_SPIN_GET_SPEED_A, 'velocityA'],
      [Blockly.Msg.FABLE_SPIN_GET_SPEED_B, 'velocityB']];

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_GET_SENSOR);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(optionsArray), 'MEASURE');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    // TODO:BETT: dynamic tooltip
    this.setTooltip(Blockly.Msg.FABLE_SPIN_GET_SENSOR_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_GET_SENSOR,
      Blockly.Msg.FABLE_SPIN_GET_ANGLE_A,
      Blockly.Msg.FABLE_SPIN_GET_ANGLE_B,
      Blockly.Msg.FABLE_SPIN_GET_ROUNDS_A,
      Blockly.Msg.FABLE_SPIN_GET_ROUNDS_B,
      Blockly.Msg.FABLE_SPIN_GET_SPEED_A,
      Blockly.Msg.FABLE_SPIN_GET_SPEED_B,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_get_motor', keywords);
  }
};

Blockly.Blocks.fable_spin_has_reached_target = {
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
      .appendField(Blockly.Msg.FABLE_SPIN_HAS_REACHED_TARGET);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FABLE_SPIN_BOTH_MOTORS, 'both'],
        [Blockly.Msg.FABLE_SPIN_ANY_MOTORS, 'any'],
        [Blockly.Msg.FABLE_SPIN_MOTOR_A, 'A'],
        [Blockly.Msg.FABLE_SPIN_MOTOR_B, 'B']
      ]), 'MOTOR');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    // TODO:BETT: Dynamic tooltip
    this.setTooltip(Blockly.Msg.FABLE_SPIN_HAS_REACHED_TARGET_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_HAS_REACHED_TARGET,
      Blockly.Msg.FABLE_SPIN_BOTH_MOTORS,
      Blockly.Msg.FABLE_SPIN_ANY_MOTORS,
      Blockly.Msg.FABLE_SPIN_MOTOR_A,
      Blockly.Msg.FABLE_SPIN_MOTOR_B,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_has_reached_target', keywords);
  }
};

Blockly.Blocks.fable_spin_get_ir_message = {
  /**
     * Block for getting spin infrared message.
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
      .appendField(Blockly.Msg.FABLE_SPIN_GET_IR_MESSAGE)
      .appendField(new Blockly.AsciiInput('KEYCODE_SPACEBAR    32'), 'MESSAGE');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_GET_IR_MESSAGE_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_GET_IR_MESSAGE,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_get_ir_message', keywords);
  }
};
