/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.theme');

const {assertEventFired} = goog.require('Blockly.test.helpers.events');
const eventUtils = goog.require('Blockly.Events.utils');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Theme', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
    // Clear all registered themes.
    Blockly.registry.TEST_ONLY.typeMap['theme'] = {};
  });

  function defineThemeTestBlocks() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "stack_block",
      "message0": "",
      "previousStatement": null,
      "nextStatement": null,
    },
    {
      "type": "row_block",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "INPUT",
        },
      ],
      "output": null,
    }]);
  }

  function createBlockStyles() {
    return {
      "styleOne": {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap',
      },
    };
  }

  function createMultipleBlockStyles() {
    return {
      "styleOne": {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap',
      },
      "styleTwo": {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": '',
      },
    };
  }

  function stringifyAndCompare(val1, val2) {
    const stringVal1 = JSON.stringify(val1);
    const stringVal2 = JSON.stringify(val2);
    chai.assert.equal(stringVal1, stringVal2);
  }

  test('Set All BlockStyles', function() {
    const theme = new Blockly.Theme('test', createBlockStyles());
    stringifyAndCompare(createBlockStyles(), theme.blockStyles);
    const blockStyles = createMultipleBlockStyles();
    for (const key in blockStyles) {
      theme.blockStyles[key] = blockStyles[key];
    }
    stringifyAndCompare(createMultipleBlockStyles(), theme.blockStyles);
  });

  test('Get All BlockStyles', function() {
    const theme = new Blockly.Theme('test', createMultipleBlockStyles());
    const allBlocks = theme.blockStyles;
    stringifyAndCompare(createMultipleBlockStyles(), allBlocks);
  });

  test('Get BlockStyles', function() {
    const theme = new Blockly.Theme('test', createBlockStyles());
    const blockStyle = theme.blockStyles['styleOne'];

    stringifyAndCompare(blockStyle, createBlockStyles().styleOne);
  });

  test('Set BlockStyle Update', function() {
    const theme = new Blockly.Theme('test', createBlockStyles());
    const blockStyle = createBlockStyles();
    blockStyle.styleOne.colourPrimary = '#00ff00';

    theme.blockStyles['styleOne'] = blockStyle.styleOne;

    stringifyAndCompare(theme.blockStyles, blockStyle);
  });

  test('Set BlockStyle Add', function() {
    const theme = new Blockly.Theme('test', createBlockStyles());
    const blockStyle = createMultipleBlockStyles();

    theme.blockStyles['styleTwo'] = blockStyle.styleTwo;

    stringifyAndCompare(theme.blockStyles, blockStyle);
  });

  test('Set Theme', function() {
    defineThemeTestBlocks();
    let workspace;
    try {
      const blockStyles = createBlockStyles();
      const theme = new Blockly.Theme('themeName', blockStyles);
      workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
      const blockA = workspace.newBlock('stack_block');

      blockA.setStyle = function() {this.styleName_ = 'styleTwo';};
      const refreshToolboxSelectionStub =
          sinon.stub(workspace, 'refreshToolboxSelection');
      blockA.styleName_ = 'styleOne';

      // Stubs are cleaned up in sharedTestTeardown
      sinon.stub(Blockly, "getMainWorkspace").returns(workspace);
      sinon.stub(Blockly, "hideChaff");

      workspace.setTheme(theme);

      // Checks that the theme was set correctly on Blockly namespace
      stringifyAndCompare(workspace.getTheme(), theme);

      // Checks that the setTheme function was called on the block
      chai.assert.equal(blockA.getStyleName(), 'styleTwo');

      // Checks that the toolbox refreshed method was called
      sinon.assert.calledOnce(refreshToolboxSelectionStub);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.ThemeChange,
          {themeName: 'themeName', type: eventUtils.THEME_CHANGE}, workspace.id);
    } finally {
      workspaceTeardown.call(this, workspace);
    }
  });

  suite('Validate block styles', function() {
    setup(function() {
      this.constants = new Blockly.blockRendering.ConstantProvider();
    });

    test('Null', function() {
      const inputStyle = null;
      const expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Empty', function() {
      const inputStyle = {};
      const expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete hex', function() {
      const inputStyle = {
        "colourPrimary": "#012345",
      };
      const expectedOutput = {
        "colourPrimary": "#012345",
        "colourSecondary": "#99a7b5",
        "colourTertiary": "#4d657d",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete hex', function() {
      const inputStyle = {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap',
      };
      const expectedOutput = {
        "colourPrimary": "#aaaaaa",
        "colourSecondary": "#bbbbbb",
        "colourTertiary": "#cccccc",
        "hat": 'cap',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete hue', function() {
      const inputStyle = {
        "colourPrimary": "20",
        "colourSecondary": "40",
        "colourTertiary": "60",
      };
      const expectedOutput = {
        "colourPrimary": "#a5745b",
        "colourSecondary": "#a58c5b",
        "colourTertiary": "#a5a55b",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete hue', function() {
      const inputStyle = {
        "colourPrimary": "20",
      };
      const expectedOutput = {
        "colourPrimary": "#a5745b",
        "colourSecondary": "#dbc7bd",
        "colourTertiary": "#c09e8c",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Complete css colour name', function() {
      const inputStyle = {
        "colourPrimary": "red",
        "colourSecondary": "white",
        "colourTertiary": "blue",
      };
      const expectedOutput = {
        "colourPrimary": "#ff0000",
        "colourSecondary": "#ffffff",
        "colourTertiary": "#0000ff",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });

    test('Incomplete css colour name', function() {
      const inputStyle = {
        "colourPrimary": "black",
      };
      const expectedOutput = {
        "colourPrimary": "#000000",
        "colourSecondary": "#999999",
        "colourTertiary": "#4d4d4d",
        "hat": '',
      };
      stringifyAndCompare(
          this.constants.validatedBlockStyle_(inputStyle), expectedOutput);
    });
  });
});
