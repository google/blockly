/**
 * @fileoverview Camera/Vision blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.cameraCompVision'); // Deprecated
goog.provide('Blockly.Constants.CameraCompVision');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.camera_take_picture = {
  /**
       * Block for taking a picture.
       * @this Blockly.Block
       */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_TAKE_PICTURE);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_TAKE_PICTURE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_TAKE_PICTURE,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [];

    Blockly.Search.preprocessSearchKeywords('camera_take_picture', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_check_for_simple_color = {
  /**
     * Block for simple color detection.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_SIMPLE_COLOR);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_SIMPLE_COLOR_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_CHECK_FOR_SIMPLE_COLOR,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_check_for_simple_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_check_for_advanced_color = {
  /**
     * Block for advance color detection. It defines Nuances of color and minimun size of color (a percentage of an
     * colored object w.r.t. the whole image).
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_ADVANCED_COLOR);

    this.appendValueInput('COLOUR')
      .setCheck('Colour');

    this.appendValueInput('NUANCES')
      .appendField(Blockly.Msg.FABLE_CAMERA_NUANCES)
      .setCheck('Number');

    this.appendValueInput('SIZE')
      .appendField(Blockly.Msg.FABLE_CAMERA_SIZE)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_ADVANCED_COLOR_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_CHECK_FOR_ADVANCED_COLOR,
      Blockly.Msg.FABLE_CAMERA_NUANCES,
      Blockly.Msg.FABLE_CAMERA_SIZE,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_check_for_advanced_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_get_center_from_simple_color = {
  /**
     * Block for getting the center coordinates of a detected color.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_SIMPLE_COLOR)
      .appendField(new Blockly.FieldDropdown([
        ['X', '\'x\''],
        ['Y', '\'y\'']
      ]), 'COLOR_CENTER');

    this.appendValueInput('COLOUR')
      .appendField(Blockly.Msg.FABLE_CAMERA_WITH_COLOR)
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_SIMPLE_COLOR_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_SIMPLE_COLOR,
      Blockly.Msg.FABLE_CAMERA_WITH_COLOR,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}',
      'X',
      'Y'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_get_center_from_simple_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_get_center_from_advanced_color = {
  /**
     * Block for getting center coordinates of a detected color (wiht Nuances and Size).
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_ADVANCED_COLOR)
      .appendField(new Blockly.FieldDropdown([
        ['X', '\'x\''],
        ['Y', '\'y\'']
      ]), 'COLOR_CENTER');

    this.appendValueInput('COLOUR')
      .appendField(Blockly.Msg.FABLE_CAMERA_WITH_COLOR)
      .setCheck('Colour');

    this.appendValueInput('NUANCES')
      .appendField(Blockly.Msg.FABLE_CAMERA_NUANCES)
      .setCheck('Number');

    this.appendValueInput('SIZE')
      .appendField(Blockly.Msg.FABLE_CAMERA_SIZE)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_ADVANCED_COLOR_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_GET_CENTER_FROM_ADVANCED_COLOR,
      Blockly.Msg.FABLE_CAMERA_WITH_COLOR,
      Blockly.Msg.FABLE_CAMERA_NUANCES,
      Blockly.Msg.FABLE_CAMERA_SIZE,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}',
      'X',
      'Y'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_get_center_from_advanced_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_check_for_motion = {
  /**
     * Block for motion detection.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_MOTION);

    this.appendValueInput('AMOUNT')
      .appendField(Blockly.Msg.FABLE_CAMERA_MOTION_AMOUNT)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_CHECK_FOR_MOTION_TOOLTIP);
    this.setOutput(true, 'Boolean');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_CHECK_FOR_MOTION,
      Blockly.Msg.FABLE_CAMERA_MOTION_AMOUNT,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
    
    ];

    Blockly.Search.preprocessSearchKeywords('camera_check_for_motion', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.camera_get_center_of_motion = {
  /**
     * Block for getting the center coordinates of a detected motion.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CAMERA_GET_MOTION_CENTER)
      .appendField(new Blockly.FieldDropdown([
        ['X', '\'x\''],
        ['Y', '\'y\'']
      ]), 'MOTION_CENTER');

    this.appendValueInput('AMOUNT')
      .appendField(Blockly.Msg.FABLE_CAMERA_MOTION_AMOUNT)
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_CAMERA_GET_MOTION_CENTER_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CAMERA_GET_MOTION_CENTER,
      Blockly.Msg.FABLE_CAMERA_MOTION_AMOUNT,
      '%{BKY_VISION}'
    ];

    var toolboxKeywords = [
      'X',
      'Y'
    ];

    Blockly.Search.preprocessSearchKeywords('camera_get_center_of_motion', keywords, toolboxKeywords);
  }
};
