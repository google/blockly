/**
 * @fileoverview Camera/Video blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.cameraVideo'); // Deprecated
goog.provide('Blockly.Constants.CameraVideo');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_video_filter = {
  /**
     * Block for applying 'filters' to video feed.
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
      .appendField(Blockly.Msg.FABLE_VIDEO_FILTER);

    var options = [[Blockly.Msg.FABLE_IMAGE_FILTER_FLIP, 'flip'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_GRAYSCALE, 'gray'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_HSV, 'hsv'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_SEPIA, 'sepia'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_BLUR, 'gaussian'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_MEDIAN_BLUR, 'smear'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_CANNY, 'canny'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_ADAPTIVETH, 'adaptive_th'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_SHARP, 'sharp'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_BG_SUBST, 'segmentation'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_CARTOON, 'cartoon'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_WATERED, 'water'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_SKETCH, 'pencil'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_SKETCH_COLOR, 'color_pencil'],
      [Blockly.Msg.FABLE_IMAGE_FILTER_STYLISH, 'stylish']];

    var inputOptions = {};
    inputOptions.addBlock = 'math_number';
    inputOptions.blockFields = { NUM: 50 };

    this.appendDrowdownWithMutation(options, ['canny', 'gaussian', 'smear'], 'SENSITIVITY', 'Number', Blockly.Msg.FABLE_IMAGE_FILTER_SENSITIVITY, inputOptions);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_VIDEO_FILTER_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_VIDEO_FILTER,
      Blockly.Msg.FABLE_IMAGE_FILTER_FLIP,
      Blockly.Msg.FABLE_IMAGE_FILTER_GRAYSCALE,
      Blockly.Msg.FABLE_IMAGE_FILTER_HSV,
      Blockly.Msg.FABLE_IMAGE_FILTER_SEPIA,
      Blockly.Msg.FABLE_IMAGE_FILTER_BLUR,
      Blockly.Msg.FABLE_IMAGE_FILTER_MEDIAN_BLUR,
      Blockly.Msg.FABLE_IMAGE_FILTER_CANNY,
      Blockly.Msg.FABLE_IMAGE_FILTER_ADAPTIVETH,
      Blockly.Msg.FABLE_IMAGE_FILTER_BG_SUBST,
      Blockly.Msg.FABLE_IMAGE_FILTER_CARTOON,
      Blockly.Msg.FABLE_IMAGE_FILTER_WATERED,
      Blockly.Msg.FABLE_IMAGE_FILTER_SKETCH,
      Blockly.Msg.FABLE_IMAGE_FILTER_SKETCH_COLOR,
      Blockly.Msg.FABLE_IMAGE_FILTER_STYLISH,
      Blockly.Msg.FABLE_IMAGE_FILTER_SENSITIVITY,
      '%{BKY_VISION}',
      '%{BKY_LABEL_VIDEO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_video_filter', keywords);
  }
};

Blockly.Blocks.fable_clear_video_filters = {
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
      .appendField(Blockly.Msg.FABLE_VIDEO_FILTER_RESET);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_VIDEO_FILTER_RESET_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_VIDEO_FILTER_RESET,
      '%{BKY_VISION}',
      '%{BKY_LABEL_VIDEO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_clear_video_filters', keywords);
  }
};

Blockly.Blocks.fable_draw_circle = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput().appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_CIRCLE);

    this.appendValueInput('CENTROID_X')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_CENTER)
      .appendField('x: ')
      .setCheck('Number');

    this.appendValueInput('CENTROID_Y')
      .appendField('y: ')
      .setCheck('Number');

    this.appendValueInput('RADIUS')
      .appendField(Blockly.Msg.FABLE_VIDEO_CIRCLE_RADIUS)
      .setCheck('Number');

    this.appendValueInput('COLOUR')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_COLOR)
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_VIDEO_DRAW_CIRCLE_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_VIDEO_DRAW_CIRCLE,
      Blockly.Msg.FABLE_VIDEO_DRAW_CENTER,
      'x',
      'y',
      Blockly.Msg.FABLE_VIDEO_CIRCLE_RADIUS,
      '%{BKY_VISION}',
      '%{BKY_LABEL_VIDEO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_draw_circle', keywords);
  }
};

Blockly.Blocks.fable_draw_rect = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput().appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_RECT);

    this.appendValueInput('ORIGIN_X')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_CENTER)
      .appendField('x: ')
      .setCheck('Number');

    this.appendValueInput('ORIGIN_Y')
      .appendField('y: ')
      .setCheck('Number');

    this.appendValueInput('WIDTH')
      .appendField(Blockly.Msg.FABLE_VIDEO_RECT_WIDTH)
      .setCheck('Number');

    this.appendValueInput('HEIGHT')
      .appendField(Blockly.Msg.FABLE_VIDEO_RECT_HEIGHT)
      .setCheck('Number');

    this.appendValueInput('COLOUR')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_COLOR)
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_VIDEO_DRAW_RECT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_VIDEO_DRAW_RECT,
      'x',
      'y',
      Blockly.Msg.FABLE_VIDEO_RECT_WIDTH,
      Blockly.Msg.FABLE_VIDEO_RECT_HEIGHT,
      '%{BKY_VISION}',
      '%{BKY_LABEL_VIDEO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_draw_rect', keywords);
  }
};

Blockly.Blocks.fable_draw_text = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.cameraIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput().appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_TEXT);

    this.appendValueInput('INPUT_TEXT')
      .setCheck('String');

    this.appendValueInput('CENTROID_X')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_ORIGIN)
      .appendField('x: ')
      .setCheck('Number');

    this.appendValueInput('CENTROID_Y')
      .appendField('y: ')
      .setCheck('Number');

    this.appendValueInput('COLOUR')
      .appendField(Blockly.Msg.FABLE_VIDEO_DRAW_COLOR)
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.cameraStyle);
    this.setTooltip(Blockly.Msg.FABLE_VIDEO_DRAW_TEXT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_VIDEO_DRAW_TEXT,
      Blockly.Msg.FABLE_VIDEO_DRAW_ORIGIN,
      'x',
      'y',
      '%{BKY_VISION}',
      '%{BKY_LABEL_VIDEO}'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_draw_text', keywords);
  }
};
