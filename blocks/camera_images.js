/**
 * @fileoverview Camera/Images blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.cameraImages'); // Deprecated
goog.provide('Blockly.Constants.CameraImages');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_imshow = {
  /**
     * Block for showing an image.
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
      .appendField(Blockly.Msg.FABLE_IMAGE_SHOW);

    this.appendValueInput('IMAGE')
      .setCheck('Image');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_IMAGE_SHOW_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_IMAGE_SHOW,
      '%{BKY_VISION}',
      '%{BKY_LABEL_IMAGES}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_imshow', keywords);
  }
};

Blockly.Blocks.fable_imread = {
  /**
     * Block for reading an image.
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
      .appendField(Blockly.Msg.FABLE_IMAGE_READ);

    this.appendDynamicFileInput('image', false, true);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_IMAGE_READ_TOOLTIP);
    this.setOutput(true, 'Image');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_IMAGE_READ,
      '%{BKY_VISION}',
      '%{BKY_LABEL_IMAGES}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_imread', keywords);
  }
};

Blockly.Blocks.fable_imfilter = {
  /**
     * Block for applying 'filters' to an image.
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
      .appendField(Blockly.Msg.FABLE_IMAGE_FILTER);

    var options = [[Blockly.Msg.FABLE_IMAGE_FILTER_GRAYSCALE, 'gray'],
      ['hsv', 'hsv'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_CANNY, 'canny'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_BLUR, 'gaussian'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_BINARY, 'thresholding'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_ADAPTIVETH, 'adaptive_th'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_CARTOON, 'cartoon']];

    var inputOptions = {};
    inputOptions.insertBefore = 'IMAGE';
    inputOptions.addBlock = 'math_number';
    inputOptions.blockFields = { NUM: 50 };

    this.appendDrowdownWithMutation(options, ['canny', 'gaussian', 'thresholding'], 'SENSITIVITY', 'Number', Blockly.Msg.FABLE_IMAGE_FILTER_SENSITIVITY, inputOptions);

    this.appendValueInput('IMAGE')
      .setCheck('Image');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_IMAGE_FILTER_TOOLTIP);
    this.setOutput(true, 'Image');
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_IMAGE_FILTER,
      Blockly.Msg.FABLE_IMAGE_FILTER_GRAYSCALE,
      'hsv',
      Blockly.Msg.FABLE_IMAGE_FILTER_CANNY,
      Blockly.Msg.FABLE_IMAGE_FILTER_BLUR,
      Blockly.Msg.FABLE_IMAGE_FILTER_BINARY,
      Blockly.Msg.FABLE_IMAGE_FILTER_ADAPTIVETH,
      Blockly.Msg.FABLE_IMAGE_FILTER_CARTOON,
      Blockly.Msg.FABLE_IMAGE_FILTER_SENSITIVITY,
      '%{BKY_VISION}',
      '%{BKY_LABEL_IMAGES}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_imfilter', keywords);
  }
};

Blockly.Blocks.fable_imsave = {
  /**
     * Block for saving an image.
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
      .appendField(Blockly.Msg.FABLE_IMAGE_SAVE);

    this.appendValueInput('IMAGE')
      .setCheck('Image');

    this.appendDummyInput()
      .appendField(Blockly.Msg.AS)
      .appendField(new Blockly.FieldTextInput('my_image'), 'FILENAME');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_IMAGE_SAVE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_IMAGE_SAVE,
      '%{BKY_VISION}',
      '%{BKY_LABEL_IMAGES}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_imsave', keywords);
  }
};
