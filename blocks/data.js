/**
 * @fileoverview Data blocks for Fable Blockly.
 *
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Blocks.data'); // Deprecated
goog.provide('Blockly.Constants.Data');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.Mutator');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

Blockly.Blocks.fable_make_plot = {
  /**
     * Block for realtime plot.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.graphIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_TIME_SERIES);

    this.appendValueInput('VALUE')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLOT_LABEL)
      .appendField(new Blockly.FieldDropdown([[Blockly.Msg.BLUE, 'A'],
        [Blockly.Msg.ORANGE, 'B'],
        [Blockly.Msg.BROWN, 'C']]),
      'SERIES_ID');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setTooltip(Blockly.Msg.FABLE_TIME_SERIES_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_TIME_SERIES,
      Blockly.Msg.FABLE_PLOT_LABEL,
      '%{BKY_DATA}',
      '%{BKY_LABEL_TIME_SERIES}'
    ];

    var toolboxKeywords = [
      Blockly.Msg.BLUE,
      Blockly.Msg.ORANGE,
      Blockly.Msg.BROWN
    ];

    Blockly.Search.preprocessSearchKeywords('fable_make_plot', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_make_plot_xy = {
  /**
     * Block for realtime plot.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.graphIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_LINE_PLOT);

    this.appendValueInput('VALUE_X')
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('VALUE_Y')
      .appendField('Y: ')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLOT_LABEL)
      .appendField(new Blockly.FieldDropdown([[Blockly.Msg.BLUE, 'A'],
        [Blockly.Msg.ORANGE, 'B'],
        [Blockly.Msg.BROWN, 'C']]),
      'SERIES_ID');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setTooltip(Blockly.Msg.FABLE_LINE_PLOT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_LINE_PLOT,
      Blockly.Msg.FABLE_PLOT_LABEL,
      '%{BKY_DATA}',
      '%{BKY_LABEL_CARTESIAN}'
    ];

    var toolboxKeywords = [
      'X',
      'Y',
      Blockly.Msg.BLUE,
      Blockly.Msg.ORANGE,
      Blockly.Msg.BROWN
    ];

    Blockly.Search.preprocessSearchKeywords('fable_make_plot_xy', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_make_scatter_plot = {
  /**
     * Block for realtime plot.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.graphIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_SCATTER_PLOT);

    this.appendValueInput('VALUE_X')
      .appendField('X: ')
      .setCheck('Number');

    this.appendValueInput('VALUE_Y')
      .appendField('Y: ')
      .setCheck('Number');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_PLOT_LABEL)
      .appendField(new Blockly.FieldDropdown([[Blockly.Msg.BLUE, 'A'],
        [Blockly.Msg.ORANGE, 'B'],
        [Blockly.Msg.BROWN, 'C']]),
      'SERIES_ID');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setTooltip(Blockly.Msg.FABLE_SCATTER_PLOT_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_SCATTER_PLOT,
      Blockly.Msg.FABLE_PLOT_LABEL,
      '%{BKY_DATA}',
      '%{BKY_LABEL_SCATTER}'
    ];

    var toolboxKeywords = [
      'X',
      'Y',
      Blockly.Msg.BLUE,
      Blockly.Msg.ORANGE,
      Blockly.Msg.BROWN
    ];

    Blockly.Search.preprocessSearchKeywords('fable_make_scatter_plot', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.fable_log = {
  /**
     * Block for data loggin into a csv file.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var image = new Blockly.FieldImage(
      Blockly.Blocks.Definitions.saveIcon,
      Blockly.Blocks.Definitions.iconSize,
      Blockly.Blocks.Definitions.iconSize, '*');
    this.appendDummyInput()
      .appendField(image);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_LOG);

    this.appendValueInput('VALUE')
      .setCheck(null);

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_LOG_IN_FILE)
      .appendField(new Blockly.FieldTextInput('Fable-log.csv'), 'FILENAME');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.dataStyle);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.FABLE_LOG_TOOLTIP);
    this.setHelpUrl('http://www.example.com/');
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_LOG,
      Blockly.Msg.FABLE_LOG_IN_FILE,
      '%{BKY_DATA}',
      '%{BKY_LABEL_FILE_LOGGING}'
    ];

    var toolboxKeywords = [
      'Fable-log.csv'
    ];

    Blockly.Search.preprocessSearchKeywords('fable_log', keywords, toolboxKeywords);
  }
};
