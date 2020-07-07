/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly Theme tests.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

suite('Theme', function() {
  teardown(function() {
    // Clear all registered themes.
    Blockly.registry.typeMap_['theme'] = {};
  });

  function defineThemeTestBlocks() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "stack_block",
      "message0": "",
      "previousStatement": null,
      "nextStatement": null
    },
    {
      "type": "row_block",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "INPUT"
        }
      ],
      "output": null
    }]);
  }

  function undefineThemeTestBlocks() {
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
  }


  function createBlockStyles() {
    return {
      "styleOne": {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap'
      }
    };
  }

  function createMultipleBlockStyles() {
    return {
      "styleOne": {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap'
      },
      "styleTwo": {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": ''
      }
    };
  }

  function stringifyAndCompare(val1, val2) {
    var stringVal1 = JSON.stringify(val1);
    var stringVal2 = JSON.stringify(val2);
    chai.assert.equal(stringVal1, stringVal2);
  }

  test('Set All BlockStyles', function() {
    var theme = new Blockly.Theme('test', createBlockStyles());
    stringifyAndCompare(createBlockStyles(), theme.blockStyles);
    var blockStyles = createMultipleBlockStyles();
    for (var key in blockStyles) {
      theme.blockStyles[key] = blockStyles[key];
    }
    stringifyAndCompare(createMultipleBlockStyles(), theme.blockStyles);
  });

  test('Get All BlockStyles', function() {
    var theme = new Blockly.Theme('test', createMultipleBlockStyles());
    var allBlocks = theme.blockStyles;
    stringifyAndCompare(createMultipleBlockStyles(), allBlocks);
  });

  test('Get BlockStyles', function() {
    var theme = new Blockly.Theme('test', createBlockStyles());
    var blockStyle = theme.blockStyles['styleOne'];

    stringifyAndCompare(blockStyle, createBlockStyles().styleOne);
  });

  test('Set BlockStyle Update', function() {
    var theme = new Blockly.Theme('test', createBlockStyles());
    var blockStyle = createBlockStyles();
    blockStyle.styleOne.colourPrimary = '#00ff00';

    theme.blockStyles['styleOne'] = blockStyle.styleOne;

    stringifyAndCompare(theme.blockStyles, blockStyle);
  });

  test('Set BlockStyle Add', function() {
    var theme = new Blockly.Theme('test', createBlockStyles());
    var blockStyle = createMultipleBlockStyles();

    theme.blockStyles['styleTwo'] = blockStyle.styleTwo;

    stringifyAndCompare(theme.blockStyles, blockStyle);
  });

  test('Set Theme', function() {
    defineThemeTestBlocks();
    var blockStyles = createBlockStyles();
    var workspace = new Blockly.WorkspaceSvg({});
    var blockA = workspace.newBlock('stack_block');

    blockA.setStyle = function() {this.styleName_ = 'styleTwo';};
    var callCount = 1;
    workspace.refreshToolboxSelection = function() {
      return ++callCount;
    };
    blockA.styleName_ = 'styleOne';

    var stub = sinon.stub(Blockly, "getMainWorkspace").returns(workspace);
    var hideStub = sinon.stub(Blockly, "hideChaff");

    workspace.setTheme(blockStyles);

    // Checks that the theme was set correctly on Blockly namespace
    stringifyAndCompare(workspace.getTheme(), blockStyles);

    // Checks that the setTheme function was called on the block
    chai.assert.equal(blockA.getStyleName(), 'styleTwo');

    // check that the toolbox refreshed method was called
    chai.assert.equal(workspace.refreshToolboxSelection(), 3);

    chai.assert.equal(Blockly.Events.FIRE_QUEUE_.pop().element, 'theme');

    undefineThemeTestBlocks();

    stub.restore();
    hideStub.restore();
  });

  suite('Validate block styles', function() {
    setup(function() {
      this.constants = new Blockly.blockRendering.ConstantProvider();
    });

    test('Null', function() {
      var inputStyle = null;
      var expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Empty', function() {
      var inputStyle = {};
      var expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete hex', function() {
      var inputStyle = {
        "colourPrimary": "#012345"
      };
      var expectedOutput = {
        "colourPrimary": "#012345",
        "colourSecondary": "#99a7b5",
        "colourTertiary": "#4d657d",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete hex', function() {
      var inputStyle = {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap'
      };
      var expectedOutput = {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap'
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete hue', function() {
      var inputStyle = {
        "colourPrimary": "20",
        "colourSecondary": "40",
        "colourTertiary": "60",
      };
      var expectedOutput = {
        "colourPrimary": "#a5745b",
        "colourSecondary": "#a58c5b",
        "colourTertiary": "#a5a55b",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete hue', function() {
      var inputStyle = {
        "colourPrimary": "20",
      };
      var expectedOutput = {
        "colourPrimary": "#a5745b",
        "colourSecondary": "#dbc7bd",
        "colourTertiary": "#c09e8c",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete css colour name', function() {
      var inputStyle = {
        "colourPrimary": "red",
        "colourSecondary": "white",
        "colourTertiary": "blue"
      };
      var expectedOutput = {
        "colourPrimary": "#ff0000",
        "colourSecondary": "#ffffff",
        "colourTertiary": "#0000ff",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete css colour name', function() {
      var inputStyle = {
        "colourPrimary": "black",
      };
      var expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": ''
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });
  });
});
