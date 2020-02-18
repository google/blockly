/**
 * @fileoverview Senses blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.sensesCommon'); // Deprecated
goog.provide('Blockly.Constants.SensesCommon');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_get_module_id = {
  /**
     * Block for selecting Module IDs as dropdown.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    // var image = new Blockly.FieldImage(
    //  'head.png',
    //  Blockly.Blocks.Definitions.iconSize,
    //  Blockly.Blocks.Definitions.iconSize, '*');
    // this.appendDummyInput().appendField(image);

    this.appendDummyInput().appendField(Blockly.Msg.FABLE_MODULE_ID);

    // TODO: Check if this block can have the Face module added
    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_any, [['Hub']], [['#']]);

    this.appendDummyInput();

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_MODULE_ID_TOOLTIP);
    this.setOutput(true, 'String');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_MODULE_ID,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_module_id', keywords);
  }
};

Blockly.Blocks.fable_get_time = {
  /**
     * Block for getting the running time.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.timeIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_GET_TIME);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.FABLE_GET_TIME_TOOLTIP);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_GET_TIME,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_time', keywords);
  }
};

Blockly.Blocks.fable_get_microphone = {
  /**
     * Block for getting the microphone volume.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.micIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_MICROPHONE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_MICROPHONE_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_MICROPHONE,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_microphone', keywords);
  }
};

Blockly.Blocks.fable_get_module_battery = {
  /**
     * Block for battery level.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.batteryIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_BATTERY_LEVEL);

    this.appendDynamicIDInput(Blockly.Blocks.Definitions.requestedModules_anyNoDongle, [], [['#']]);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_BATTERY_LEVEL_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_BATTERY_LEVEL,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_get_module_battery', keywords);
  }
};

Blockly.Blocks.fable_check_key = {
  /**
     * Block for key pressed.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.keyboardIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image)
      .appendField(Blockly.Msg.FABLE_CHECK_FOR_KEY);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.SPACEBAR, 'spacebar'],
        [Blockly.Msg.UP, 'up'],
        [Blockly.Msg.DOWN, 'down'],
        [Blockly.Msg.LEFT, 'left'],
        [Blockly.Msg.RIGHT, 'right']]), 'CHECK_KEY');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_CHECK_FOR_KEY_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CHECK_FOR_KEY,
      Blockly.Msg.SPACEBAR,
      Blockly.Msg.UP,
      Blockly.Msg.DOWN,
      Blockly.Msg.LEFT,
      Blockly.Msg.RIGHT,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_check_key', keywords);
  }
};

Blockly.Blocks.fable_check_custom_key = {
  /**
     * Block for key pressed.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.keyboardIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    // Space is hardcoded to make sure the translations file doesn't fuck up the key code.
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CHECK_FOR_KEY)
      .appendField(new Blockly.ButtonInput('KEYCODE_SPACEBAR'), 'KEYBUTTON');
    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.sensesStyle);
    this.setTooltip(Blockly.Msg.FABLE_CHECK_FOR_KEY_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CHECK_FOR_KEY,
      Blockly.Msg.SPACEBAR,
      Blockly.Msg.UP,
      Blockly.Msg.DOWN,
      Blockly.Msg.LEFT,
      Blockly.Msg.RIGHT,
      '%{BKY_INPUT}',
      '%{BKY_LABEL_COMMON}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_check_custom_key', keywords);
  }
};

Blockly.Blocks.fable_get_chromebook_gesture = {
  /**
     * Block for getting sensor data from the Chromebook device.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.chromebookIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    // TODO: Rename localized variables below
    this.appendDummyInput()
      .appendField(Blockly.Msg.CHROMEBOOK_READ_GESTURE);

    // TODO: Rename localized variables below
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.CHROMEBOOK_GESTURE_SHAKE, '\'shake\''],
        [Blockly.Msg.CHROMEBOOK_GESTURE_TOUCH, '\'touch\'']]), 'METRIC');

    // [Blockly.Msg.CHROMEBOOK_GESTURE_PAN, '\'pan\''],
    // [Blockly.Msg.CHROMEBOOK_GESTURE_PINCH, '\'pinch\''],
    // [Blockly.Msg.CHROMEBOOK_GESTURE_SWIPE, '\'swipe\'']

    // Properties:
    this.setColour(Blockly.Blocks.Definitions.sensesStyle);

    // TODO: Rename localized variables below
    var thisBlock = this;
    this.setTooltip(function () {
      var sensor = thisBlock.getFieldValue('METRIC');
      var TOOLTIPS = {
        '\'shake\'': Blockly.Msg.GESTURE_SHAKE_TOOLTIP,
        '\'touch\'': Blockly.Msg.GESTURE_TOUCH_TOOLTIP
      };
      try {
        return TOOLTIPS[sensor];
      } catch (err) {
        return Blockly.Msg.FACE_READ_SENSOR_TOOLTIP;
      }
    });

    // '\'pan\'': Blockly.Msg.GESTURE_PAN_TOOLTIP,
    // '\'pinch\'': Blockly.Msg.GESTURE_PINCH_TOOLTIP,
    // '\'swipe\'': Blockly.Msg.GESTURE_SWIPE_TOOLTIP,

    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');

    // Add the warning that this block is not supported
    const warning = Blockly.Msg.FABLE_BLOCK_NOT_SUPPORTED.replace('{0}', Blockly.Msg.FABLE_PLATFORM_PC_PLURAL);
    this.setWarningText(warning, 333);
    this.setDisabled(true);
  }
};

Blockly.Blocks.fable_get_chromebook_sensor = {
  /**
     * Block for getting sensor data from the Chromebook device.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.chromebookIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    // TODO: Rename localized variables below
    this.appendDummyInput()
      .appendField(Blockly.Msg.FACE_READ_SENSOR);

    // TODO: Rename localized variables below
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        [Blockly.Msg.FACE_ACCELERATION_X, '\'accelerationX\''],
        [Blockly.Msg.FACE_ACCELERATION_Y, '\'accelerationY\''],
        [Blockly.Msg.FACE_ACCELERATION_Z, '\'accelerationZ\''],
        [Blockly.Msg.FACE_TOUCH_COUNT, '\'touchCount\''],
        [Blockly.Msg.FACE_TOUCH_POSITION_X, '\'touchPositionX\''],
        [Blockly.Msg.FACE_TOUCH_POSITION_Y, '\'touchPositionY\''],
        [Blockly.Msg.LATITUDE, '\'geolocationLatitude\''],
        [Blockly.Msg.LONGITUDE, '\'geolocationLongitude\''],
        [Blockly.Msg.ALTITUDE, '\'geolocationAltitude\'']]),
      'METRIC');
    // [Blockly.Msg.FACE_COMPASS, '\'compass\''],
    // [Blockly.Msg.FACE_TOUCH_PRESSURE, '\'touchPressure\''],

    // Properties:
    this.setColour(Blockly.Blocks.Definitions.sensesStyle);

    // TODO: Rename localized variables below
    var thisBlock = this;
    this.setTooltip(function () {
      var sensor = thisBlock.getFieldValue('METRIC');
      var TOOLTIPS = {
        '\'accelerationX\'': Blockly.Msg.CHROMEBOOK_ACCELERATION_X_TOOLTIP,
        '\'accelerationY\'': Blockly.Msg.CHROMEBOOK_ACCELERATION_Y_TOOLTIP,
        '\'accelerationZ\'': Blockly.Msg.CHROMEBOOK_ACCELERATION_Z_TOOLTIP,
        '\'compass\'': Blockly.Msg.CHROMEBOOK_COMPASS_TOOLTIP,
        '\'touchCount\'': Blockly.Msg.CHROMEBOOK_TOUCH_COUNT_TOOLTIP,
        '\'touchPositionX\'': Blockly.Msg.CHROMEBOOK_TOUCH_POSITION_X_TOOLTIP,
        '\'touchPositionY\'': Blockly.Msg.CHROMEBOOK_TOUCH_POSITION_Y_TOOLTIP,
        '\'geolocationLatitude\'': Blockly.Msg.CHROMEBOOK_LATITTUDE_TOOLTIP,
        '\'geolocationLongitude\'': Blockly.Msg.CHROMEBOOK_LONGITUDE_TOOLTIP,
        '\'geolocationAltitude\'': Blockly.Msg.CHROMEBOOK_ALTITTUDE_TOOLTIP
      };
      try {
        return TOOLTIPS[sensor];
      } catch (err) {
        return Blockly.Msg.FACE_READ_SENSOR_TOOLTIP;
      }
    });

    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');

    // Add the warning that this block is not supported
    const warning = Blockly.Msg.FABLE_BLOCK_NOT_SUPPORTED.replace('{0}', Blockly.Msg.FABLE_PLATFORM_PC_PLURAL);
    this.setWarningText(warning, 333);
    this.setDisabled(true);
  }
};
