/**
 * @fileoverview Obsolete blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.obsolete'); // Deprecated
goog.provide('Blockly.Constants.Obsolete');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

/* ====================================================================== *
 * -------------------------- SIMPLE BLOCKS ----------------------------- *
 * ====================================================================== */
Blockly.Blocks.fable_spin_gesture_detected = {
  /**
       *
       * @this Blockly.Block
       */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_SPIN_GESTURE_DETECTED);

    var gestureArray = [[Blockly.Msg.FABLE_SPIN_GESTURE_PUSH, 'push'],
      [Blockly.Msg.FABLE_SPIN_GESTURE_PULL, 'pull']];

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(gestureArray), 'GESTURE');

    var sensorsArray = [[Blockly.Msg.FABLE_SPIN_ANY_MOTORS, 'any sensor'],
      ['1', '1'],
      ['2', '2'],
      ['3', '3']];

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_FROM_SENSOR)
      .appendField(new Blockly.FieldDropdown(sensorsArray), 'SPIN_SENSOR');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_GESTURE_DETECTED_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_GESTURE_DETECTED,
      Blockly.Msg.FABLE_SPIN_GESTURE_PUSH,
      Blockly.Msg.FABLE_SPIN_GESTURE_PULL,
      Blockly.Msg.FABLE_SPIN_ANY_MOTORS, '1', '2', '3',
      Blockly.Msg.FABLE_SPIN_FROM_SENSOR,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_gesture_detected', keywords);
  }
};

Blockly.Blocks.fable_spin_turn_with_radius = {
  /**
       *
       * @this Blockly.Block
       */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('ANGLE')
      .appendField(Blockly.Msg.FABLE_SPIN_SET_TURN)
      .setCheck('Number');

    this.appendValueInput('RADIUS')
      .appendField(Blockly.Msg.FABLE_SPIN_SET_RADIUS)
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.CENTIMETERS, '\'cm\''],
        [Blockly.Msg.MILLIMETERS, '\'mm\''],
        [Blockly.Msg.FEET, '\'ft\''],
        [Blockly.Msg.INCHES, '\'in\'']]),
      'METRIC');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_SET_TURN_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_SET_TURN,
      Blockly.Msg.FABLE_SPIN_SET_RADIUS,
      Blockly.Msg.CENTIMETERS,
      Blockly.Msg.MILLIMETERS,
      Blockly.Msg.FEET,
      Blockly.Msg.INCHES,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SPIN}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_turn_with_radius', keywords);
  }
};

Blockly.Blocks.fable_spin_lift_and_hold = {
  /**
       *
       * @this Blockly.Block
       */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.spinIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_SPIN_LIFT_MOTOR);

    const motorArray = [[Blockly.Msg.FABLE_SPIN_MOTOR_A, 'A'],
      [Blockly.Msg.FABLE_SPIN_MOTOR_B, 'B']];

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(motorArray), 'MOTOR_ID');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SPIN_TO_ANGLE);

    this.appendValueInput('ANGLE')
      .setCheck('Number');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Spin, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPIN_LIFT_MOTOR_TOOLTIP); // change tool tip in translations
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SPIN_LIFT_MOTOR,
      Blockly.Msg.FABLE_SPIN_MOTOR_A,
      Blockly.Msg.FABLE_SPIN_MOTOR_B,
      Blockly.Msg.FABLE_SPIN_TO_ANGLE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_SERVO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_spin_lift_and_hold', keywords);
  }
};

Blockly.Blocks.fable_start_logging = {
  /**
   * Block for key pressed.
   * @this Blockly.Block
   */
  init: function () {
    this.setHelpUrl('http://www.example.com/');
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_LOGGING);
    this.appendValueInput('VALUE')
      .setCheck('Number');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.FABLE_LOGGING_TOOLTIP);
    this.setInputsInline(true);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_LOGGING
    ];

    Blockly.Search.preprocessSearchKeywords('fable_start_logging', keywords);
  }
};

Blockly.Blocks.test_variables_set = {
  /**
     * Block for variable setter.
     * @this Blockly.Block
     */
  init: function () {
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.interpolateMsg(
      // TODO: Combine these messages instead of using concatenation.
      Blockly.Msg.VARIABLES_SET_TITLE + ' %1 ' +
            Blockly.Msg.VARIABLES_SET_TAIL + ' %2',
      ['VAR', new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM)],
      ['VALUE', null, Blockly.ALIGN_RIGHT],
      Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
    this.contextMenuType_ = 'variables_get';
  },
  /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
  getVars: function () {
    return [this.getFieldValue('VAR')];
  },
  /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
  renameVar: function (oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  }
  // customContextMenu: Blockly.Blocks.variables_get.customContextMenu
};

Blockly.Blocks.test_key = {
  init: function () {
    var image = new Blockly.FieldImage('keyboard_key.png',
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);
    this.setHelpUrl('http://www.example.com/');
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.interpolateMsg(
      // TODO: Combine these messages instead of using concatenation.
      Blockly.Msg.VARIABLES_SET_TITLE + ' %1 ',
      ['VAR', new Blockly.typeTest(Blockly.Msg.VARIABLES_SET_ITEM)],
      Blockly.ALIGN_RIGHT);
    this.setTooltip(Blockly.Msg.FABLE_CHECK_FOR_KEY_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_TAKE_PICTURE
    ];

    Blockly.Search.preprocessSearchKeywords('test_key', keywords);
  }
};

Blockly.Blocks.fable_set_face_blink_single_eye = {
  /**
     * Block for making one or both of the eyes of Fable Face blink manually as a one-time event.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_BLINK_SINGLE_EYE_PREFIX)
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FACE_BOTH_EYES, '\'Both\''],
        [Blockly.Msg.FACE_LEFT_EYE, '\'Left\''],
        [Blockly.Msg.FACE_RIGHT_EYE, '\'Right\'']]),
      'EYE');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_BLINK_SINGLE_EYE_POSTFIX);

    this.appendValueInput('BLINK_DURATION')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.SECONDS);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_BLINK_SINGLE_EYE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_BLINK_SINGLE_EYE_PREFIX,
      Blockly.Msg.FABLE_FACE_SET_BLINK_SINGLE_EYE_POSTFIX,
      Blockly.Msg.FACE_BOTH_EYES,
      Blockly.Msg.FACE_LEFT_EYE,
      Blockly.Msg.FACE_RIGHT_EYE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_blink_single_eye', keywords);
  }
};

Blockly.Blocks.fable_set_face_blink = {
  /**
     * Block for making the eyes of Fable Face blink manually as a one-time event.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_BLINK);

    this.appendValueInput('BLINK_DURATION')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.SECONDS);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_BLINK_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_BLINK,
      Blockly.Msg.SECONDS,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_blink', keywords);
  }
};

Blockly.Blocks.fable_set_face_focus_single_eye = {
  /**
     * Block for setting the direction at which one or both of the eyes of Fable Face look towards.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_FOCUS_SINGLE_EYE_PREFIX)
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FACE_BOTH_EYES, '\'Both\''],
        [Blockly.Msg.FACE_LEFT_EYE, '\'Left\''],
        [Blockly.Msg.FACE_RIGHT_EYE, '\'Right\'']]),
      'EYE');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_FOCUS_SINGLE_EYE_POSTFIX);

    this.appendValueInput('POS_X')
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('POS_Y')
      .appendField('Y: ')
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_FOCUS_SINGLE_EYE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_FOCUS_SINGLE_EYE_PREFIX,
      Blockly.Msg.FABLE_FACE_SET_FOCUS_SINGLE_EYE_POSTFIX,
      Blockly.Msg.FACE_BOTH_EYES,
      Blockly.Msg.FACE_LEFT_EYE,
      Blockly.Msg.FACE_RIGHT_EYE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_face_focus_single_eye', keywords);
  }
};

Blockly.Blocks.fable_set_iris_color = {
  /**
     * Block for setting eye color.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_FACE_SET_IRIS_COLOR);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_IRIS_COLOR_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_IRIS_COLOR,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_iris_color', keywords);
  }
};

Blockly.Blocks.fable_set_eyelid_color = {
  /**
     * Block for setting eye colour.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.eyeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');

    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_FACE_SET_EYELID_COLOR);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_FACE_SET_EYELID_COLOR_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_FACE_SET_EYELID_COLOR,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_FACE}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_eyelid_color', keywords);
  }
};

Blockly.Blocks.fable_get_module_motor_torque = {
  /**
     * Block for getting motor torque.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_JOINT_GET_MOTOR_TORQUE);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_GET_MOTOR_TORQUE_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_GET_MOTOR_TORQUE,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_module_motor_torque', keywords);
  }
};
Blockly.Blocks.fable_set_rgb = {
  /**
     * Block for rgb value.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.ledIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    this.appendDummyInput()
      .appendField(Blockly.Msg.MODULE_DONGLE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_TAKE_PICTURE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_rgb', keywords);
  }
};

Blockly.Blocks.fable_set_module_motor_torque_enable = {
  /**
     * Block for setting joint motor torque with enable trigger.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField('Motor torque')
      .appendField(new Blockly.FieldDropdown([['enabled', 'True'], ['disabled', 'False']]), 'MOTOR_TORQUE');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_DIRECTION)
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip('');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO
    var keywords = [
      'Motor torque'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_torque_enable', keywords);
  }
};

Blockly.Blocks.fable_set_module_motor_position = {
  /**
     * Block for setting joint motor position.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('MOTOR_POSITION')
      .appendField(Blockly.Msg.FABLE_JOINT_SET_MOTOR_POSITION)
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_DIRECTION)
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

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
      Blockly.Msg.FABLE_DIRECTION,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_position', keywords);
  }
};

Blockly.Blocks.fable_set_module_motor_max_speed = {
  /**
     * Block for setting joint motor speed.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput('MOTOR_MAX_SPEED')
      .appendField(Blockly.Msg.FABLE_JOINT_MAX_SPEED)
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_DIRECTION)
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_MAX_SPEED_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_MAX_SPEED,
      Blockly.Msg.FABLE_DIRECTION,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_max_speed', keywords);
  }
};

Blockly.Blocks.fable_set_module_motor_max_torque = {
  /**
     * Block for setting joint motor torque.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('MOTOR_MAX_TORQUE')
      .appendField(Blockly.Msg.FABLE_JOINT_MAX_TORQUE);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_DIRECTION)
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_MAX_TORQUE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_MAX_TORQUE,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_motor_max_torque', keywords);
  }
};

Blockly.Blocks.fable_get_module_motor_speed = {
  /**
     * Block for getting joint motor speed.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.jointIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_JOINT_GET_MOTOR_SPEED);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([['X', '\'X\''], ['Y', '\'Y\'']]), 'MOTOR_ID');

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_ON_MODULE);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_Joint, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_JOINT_GET_MOTOR_SPEED_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_JOINT_GET_MOTOR_SPEED,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_JOINT}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_module_motor_speed', keywords);
  }
};

Blockly.Blocks.fable_set_color_rgb = {
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .appendField(Blockly.Msg.COLOUR_RGB_TITLE);

    this.appendValueInput('RED')
      .appendField(Blockly.Msg.RED);

    this.appendValueInput('GREEN')
      .appendField(Blockly.Msg.GREEN);

    this.appendValueInput('BLUE')
      .appendField(Blockly.Msg.BLUE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.FABLE_SET_RGB_TOOLTIP);
    this.setOutput(!0, 'Colour');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.COLOUR_RGB_TITLE,
      Blockly.Msg.RED,
      Blockly.Msg.GREEN,
      Blockly.Msg.BLUE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_color_rgb', keywords);
  }
};

Blockly.Blocks.fable_print = {
  /**
     * Block for print.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.consoleIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('VALUE')
      .appendField(Blockly.Msg.FABLE_PRINT)
      .setCheck(['String', 'Number']);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setTooltip(Blockly.Msg.FABLE_PRINT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO
    var keywords = [
      Blockly.Msg.FABLE_PRINT
    ];

    Blockly.Search.preprocessSearchKeywords('fable_print', keywords);
  }
};
Blockly.Blocks.empty_block = {
  /**
     * Block with label, used as placeholder when most used category is empty.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField(new Blockly.FieldLabel(Blockly.Msg.FABLE_EMPTY_PLACEHOLDER_1));
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField(new Blockly.FieldLabel(Blockly.Msg.FABLE_EMPTY_PLACEHOLDER_2));

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.mathStyle);
    this.setOutput(false);
    this.disabled = true;
    this.contextMenu = false;
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      'blank'
    ];

    Blockly.Search.preprocessSearchKeywords('empty_block', keywords);
  }
};
// ------------------------------------------------------------------------------------------------------------------[FABLE CODE]
Blockly.Blocks.fable_code = {
  /**
     * Block for inserting python code.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    // this.appendValueInput('CODE').appendField(new Blockly.FieldTextInput('Neil'), 'NAME');
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CODE);
    this.appendDummyInput('CODE')
      .appendField(new Blockly.FieldTextInput('x = math.sin(0)'), 'CODE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_CODE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO
    var keywords = [
      Blockly.Msg.FABLE_CODE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_code', keywords);
  }
};

Blockly.Blocks.fable_make_advanced_plot = {
  /**
     * Block for realtime plot.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.graphIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLOT);

    this.appendValueInput('VALUE')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField('Colour: ');
    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    this.appendDummyInput()
      .appendField('    Legend: ')
      .appendField(new Blockly.FieldTextInput(''), 'LEGEND');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLOT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_PLOT
    ];

    Blockly.Search.preprocessSearchKeywords('fable_make_advanced_plot', keywords);
  }
};

Blockly.Blocks.fable_percentage = {
  /**
     * Block for percentages used in other blocks.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .appendField(new Blockly.FieldNumber('50', 0, 100), 'PERCENTAGE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.mathStyle);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      '%'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_percentage', keywords);
  }
};

Blockly.Blocks.fable_tts = {
  /**
     * Block for text-to-speech
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.speakIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField('save');

    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('Your text here ...'), 'text')
      .appendField('to audio as');

    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('my_tts'), 'file_name');

    this.appendDummyInput()
      .appendField('in')
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.LANG_EN, 'en'],
        [Blockly.Msg.LANG_DA, 'da'],
        [Blockly.Msg.LANG_FR, 'fr'],
        [Blockly.Msg.LANG_ES, 'es'],
        [Blockly.Msg.LANG_NL, 'nl'],
        [Blockly.Msg.LANG_IT, 'it'],
        [Blockly.Msg.LANG_SV, 'sv'],
        [Blockly.Msg.LANG_RU, 'ru']
      ]), 'language');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SPEAK_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      Blockly.Msg.FABLE_SPEAK,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_tts', keywords);
  }
};

/**
 * Block for playing sounds from the Stand-alone App (using the PC speakers).
 * @this Blockly.Block
 */
Blockly.Blocks.fable_play_sound_pc = {
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    const soundFileDropdown = new Blockly.FieldDropdown(
      [[Blockly.Msg.SOUND_ANGRY, 'angry.wav'],
        ['boing', 'boing.wav'],
        [Blockly.Msg.SOUND_BUZZ, 'buzz.wav'],
        [Blockly.Msg.SOUND_CHIMP, 'chimp.wav'],
        [Blockly.Msg.SOUND_ELEPHANT, 'elephant.wav'],
        [Blockly.Msg.SOUND_DRUM, 'drum.wav'],
        [Blockly.Msg.SOUND_LAUGH, 'laught.wav'],
        ['pling', 'pling.wav'],
        [Blockly.Msg.SOUND_RUNNING, 'running.wav'],
        [Blockly.Msg.SOUND_THEEND, 'theEnd.wav'],
        [Blockly.Msg.SOUND_TWIRLY, 'twirly.wav'],
        [Blockly.Msg.SOUND_WOOF, 'woof.wav']]);
    soundFileDropdown.setShouldAllowSearch(true);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLAY_SOUND)
      .appendField(soundFileDropdown, 'SOUNDFILE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLAY_SOUND_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_PLAY_SOUND,
      Blockly.Msg.SOUND_ANGRY,
      'boing',
      Blockly.Msg.SOUND_BUZZ,
      Blockly.Msg.SOUND_CHIMP,
      Blockly.Msg.SOUND_ELEPHANT,
      Blockly.Msg.SOUND_DRUM,
      Blockly.Msg.SOUND_FART_1,
      Blockly.Msg.SOUND_FART_2,
      Blockly.Msg.SOUND_LAUGH,
      'pling',
      Blockly.Msg.SOUND_RUNNING,
      Blockly.Msg.SOUND_THEEND,
      Blockly.Msg.SOUND_TWIRLY,
      Blockly.Msg.SOUND_WOOF,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_play_sound_pc', keywords);
  }
};

Blockly.Blocks.fable_play_face_sound = {
  /**
     * Block for playing sounds on the face module.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_PLAY_FACE_SOUND)
      .appendField(new Blockly.FieldDropdown(
        [[Blockly.Msg.SOUND_ANGRY, 'angry.wav'],
          ['boing', 'boing.wav'],
          [Blockly.Msg.SOUND_BUZZ, 'buzz.wav'],
          [Blockly.Msg.SOUND_CHIMP, 'chimp.wav'],
          [Blockly.Msg.SOUND_ELEPHANT, 'elephant.wav'],
          [Blockly.Msg.SOUND_DRUM, 'drum.wav'],
          [Blockly.Msg.SOUND_LAUGH, 'laught.wav'],
          ['pling', 'pling.wav'],
          [Blockly.Msg.SOUND_RUNNING, 'running.wav'],
          [Blockly.Msg.SOUND_THEEND, 'theEnd.wav'],
          [Blockly.Msg.SOUND_TWIRLY, 'twirly.wav'],
          [Blockly.Msg.SOUND_WOOF, 'woof.wav']]), 'SOUNDFILE');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_PLAY_FACE_SOUND_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      Blockly.Msg.FABLE_PLAY_FACE_SOUND,
      Blockly.Msg.SOUND_ANGRY,
      'boing',
      Blockly.Msg.SOUND_BUZZ,
      Blockly.Msg.SOUND_CHIMP,
      Blockly.Msg.SOUND_ELEPHANT,
      Blockly.Msg.SOUND_DRUM,
      Blockly.Msg.SOUND_FART_1,
      Blockly.Msg.SOUND_FART_2,
      Blockly.Msg.SOUND_LAUGH,
      'pling',
      Blockly.Msg.SOUND_RUNNING,
      Blockly.Msg.SOUND_THEEND,
      Blockly.Msg.SOUND_TWIRLY,
      Blockly.Msg.SOUND_WOOF,
      '%{BKY_OUTPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_play_face_sound', keywords);
  }
};

Blockly.Blocks.fable_is_face_playing_sound = {
  /**
     * Block that checks if the face module is currently playing a sound
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_IS_FACE_PLAYING_SOUND);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_IS_FACE_PLAYING_SOUND_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    // TODO:
    var keywords = [
      Blockly.Msg.FABLE_IS_FACE_PLAYING_SOUND
    ];

    Blockly.Search.preprocessSearchKeywords('fable_is_face_playing_sound', keywords);
  }
};

Blockly.Blocks.fable_set_buzzer = {
  /**
     * Block for tone value.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('TONE')
      .appendField(Blockly.Msg.FABLE_SET_TONE)
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.MODULE_DONGLE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip('');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SET_TONE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_buzzer', keywords);
  }
};

Blockly.Blocks.fable_set_module_buzzer = {
  /**
     * Block for buzzer.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.musicIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendValueInput('TONE')
      .appendField(Blockly.Msg.FABLE_SET_TONE)
      .setCheck('Number');

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_any, [['Hub']], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.actionStyle);
    this.setTooltip(Blockly.Msg.FABLE_SET_TONE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SET_TONE
    ];

    Blockly.Search.preprocessSearchKeywords('fable_set_module_buzzer', keywords);
  }
};

Blockly.Blocks.fable_wait_for = {
  /**
     * Block for wait?.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendValueInput('WAIT_BOOLEAN')
      .appendField(Blockly.Msg.FABLE_WAIT_FOR)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.loopsStyle);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.FABLE_WAIT_FOR_TOOLTIP);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_WAIT_FOR,
      '%{BKY_LOOPS}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_wait_for', keywords);
  }
};

Blockly.Blocks.camera_get_center_of_face = {
  /**
     * Block for getting the center coordinates of a detected face.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_GET_FACE_CENTER)
      .appendField(new Blockly.FieldDropdown([
        ['X', '\'x\''],
        ['Y', '\'y\'']
      ]), 'FACE_CENTER');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_GET_FACE_CENTER_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_GET_FACE_CENTER,
      '%{BKY_VISION}'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_get_center_of_face', keywords);
  }
};

Blockly.Blocks.camera_check_for_face = {
  /**
     * Block for face detection.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_FACE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_FACE_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_CHECK_FOR_FACE,
      '%{BKY_VISION}'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_check_for_face', keywords);
  }
};
