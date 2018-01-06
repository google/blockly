/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Math blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.math');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.math.HUE = '#000000';

Blockly.Blocks['math_number'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour('#999999');
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0),'NUM');
    this.setOutput(true, Blockly.Types.NUMBER.output);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Number block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.MATH_NUMBER_TOOLTIP;
    });
  },

  getBlockType: function() {
	var numString = this.getFieldValue('NUM');
    return Blockly.Types.identifyNumber(numString);
  }
};

Blockly.Blocks['math_arithmetic'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": Blockly.Types.NUMBER.checkList
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options":
            [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
             [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
             [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
             [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
             [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": Blockly.Types.NUMBER.checkList
        }
      ],
      "inputsInline": true,
      "output": Blockly.Types.NUMBER.output,
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
        'POWER': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
      };
      return TOOLTIPS[mode];
    });
  }
  //TODO: a getBlockType based on the two input types following C++ rules
};

Blockly.Blocks['math_single'] = {
  /**
   * Block for advanced math operators with single operand.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_SINGLE_OP_ROOT, 'ROOT'],
            [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, 'ABS'],
            ['-', 'NEG'],
            ['ln', 'LN'],
            ['log10', 'LOG10'],
            ['e^', 'EXP'],
            ['10^', 'POW10']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": Blockly.Types.DECIMAL.checkList
        }
      ],
      "output": Blockly.Types.DECIMAL.output,
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_SINGLE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ROOT': Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT,
        'ABS': Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
        'NEG': Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG,
        'LN': Blockly.Msg.MATH_SINGLE_TOOLTIP_LN,
        'LOG10': Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10,
        'EXP': Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP,
        'POW10': Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10
      };
      return TOOLTIPS[mode];
    });
  },
  /** @return {!string} Type of the block, all these operations are floats. */
  getBlockType: function() {
    return Blockly.Types.DECIMAL;
  }
};

Blockly.Blocks['math_trig'] = {
  /**
   * Block for trigonometry operators.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_TRIG_SIN, 'SIN'],
            [Blockly.Msg.MATH_TRIG_COS, 'COS'],
            [Blockly.Msg.MATH_TRIG_TAN, 'TAN'],
            [Blockly.Msg.MATH_TRIG_ASIN, 'ASIN'],
            [Blockly.Msg.MATH_TRIG_ACOS, 'ACOS'],
            [Blockly.Msg.MATH_TRIG_ATAN, 'ATAN']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": Blockly.Types.DECIMAL.checkList
        }
      ],
      "output": Blockly.Types.DECIMAL.output,
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_TRIG_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'SIN': Blockly.Msg.MATH_TRIG_TOOLTIP_SIN,
        'COS': Blockly.Msg.MATH_TRIG_TOOLTIP_COS,
        'TAN': Blockly.Msg.MATH_TRIG_TOOLTIP_TAN,
        'ASIN': Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN,
        'ACOS': Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS,
        'ATAN': Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN
      };
      return TOOLTIPS[mode];
    });
  },
  /** @return {!string} Type of the block, all these operations are floats. */
  getBlockType: function() {
    return Blockly.Types.DECIMAL;
  }
};

Blockly.Blocks['math_constant'] = {
  /**
   * Block for constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CONSTANT",
          "options": [
            ['\u03c0', 'PI'],
            ['e', 'E'],
            ['\u03c6', 'GOLDEN_RATIO'],
            ['sqrt(2)', 'SQRT2'],
            ['sqrt(\u00bd)', 'SQRT1_2'],
            ['\u221e', 'INFINITY']
          ]
        }
      ],
      "output": Blockly.Types.DECIMAL.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_CONSTANT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_CONSTANT_HELPURL
    });
  }
};

Blockly.Blocks['math_number_property'] = {
  /**
   * Block for checking if a number is even, odd, prime, whole, positive,
   * negative or if it is divisible by certain number.
   * @this Blockly.Block
   */
  init: function() {
    var PROPERTIES =
        [[Blockly.Msg.MATH_IS_EVEN, 'EVEN'],
         [Blockly.Msg.MATH_IS_ODD, 'ODD'],
         [Blockly.Msg.MATH_IS_PRIME, 'PRIME'],
         [Blockly.Msg.MATH_IS_WHOLE, 'WHOLE'],
         [Blockly.Msg.MATH_IS_POSITIVE, 'POSITIVE'],
         [Blockly.Msg.MATH_IS_NEGATIVE, 'NEGATIVE'],
         [Blockly.Msg.MATH_IS_DIVISIBLE_BY, 'DIVISIBLE_BY']];
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendValueInput('NUMBER_TO_CHECK')
        .setCheck(Blockly.Types.NUMBER.checkList);
    var dropdown = new Blockly.FieldDropdown(PROPERTIES, function(option) {
      var divisorInput = (option == 'DIVISIBLE_BY');
      this.sourceBlock_.updateShape_(divisorInput);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'PROPERTY');
    this.setInputsInline(true);
    this.setOutput(true, Blockly.Types.BOOLEAN.output);
    this.setTooltip(Blockly.Msg.MATH_IS_TOOLTIP);
  },
  /**
   * Create XML to represent whether the 'divisorInput' should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var divisorInput = (this.getFieldValue('PROPERTY') == 'DIVISIBLE_BY');
    container.setAttribute('divisor_input', divisorInput);
    return container;
  },
  /**
   * Parse XML to restore the 'divisorInput'.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var divisorInput = (xmlElement.getAttribute('divisor_input') == 'true');
    this.updateShape_(divisorInput);
  },
  /**
   * Modify this block to have (or not have) an input for 'is divisible by'.
   * @param {boolean} divisorInput True if this block has a divisor input.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function(divisorInput) {
    // Add or remove a Value Input.
    var inputExists = this.getInput('DIVISOR');
    if (divisorInput) {
      if (!inputExists) {
        this.appendValueInput('DIVISOR')
            .setCheck(Blockly.Types.NUMBER.checkList);
      }
    } else if (inputExists) {
      this.removeInput('DIVISOR');
    }
  },
  /** @return {!string} Type of the block, all these operations are bools. */
  getBlockType: function() {
    return Blockly.Types.BOOLEAN;
  }
};

Blockly.Blocks['math_change'] = {
  /**
   * Block for adding to a variable in place.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_CHANGE_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": Blockly.Msg.MATH_CHANGE_TITLE_ITEM
        },
        {
          "type": "input_value",
          "name": "DELTA",
          "check": Blockly.Types.NUMBER.checkList,
          "align": "RIGHT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_CHANGE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  /**
   * Gets the variable type selected in the drop down, always an integer.
   * @param {!string} varName Name of the variable selected in this block to
   *     check.
   * @return {string} String to indicate the variable type.
   */
  getVarType: function(varName) {
    return Blockly.Types.NUMBER;
  }
};

Blockly.Blocks['math_round'] = {
  /**
   * Block for rounding functions.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUND, 'ROUND'],
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP, 'ROUNDUP'],
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN, 'ROUNDDOWN']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": Blockly.Types.DECIMAL.checkList
        }
      ],
      "output": Blockly.Types.DECIMAL.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_ROUND_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_ROUND_HELPURL
    });
  },
  /** @return {!string} Type of the block, round always returns a float. */
  getBlockType: function() {
    return Blockly.Types.DECIMAL;
  }
};

Blockly.Blocks['math_on_list'] = {
  /**
   * Block for evaluating a list of numbers to return sum, average, min, max,
   * etc.  Some functions also work on text (min, max, mode, median).
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ONLIST_OPERATOR_SUM, 'SUM'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MIN, 'MIN'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MAX, 'MAX'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE, 'AVERAGE'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN, 'MEDIAN'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MODE, 'MODE'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV, 'STD_DEV'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM, 'RANDOM']];
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    this.setHelpUrl(Blockly.Msg.MATH_ONLIST_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, Blockly.Types.NUMBER.output);
    var dropdown = new Blockly.FieldDropdown(OPERATORS, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendValueInput('LIST')
        .setCheck(Blockly.Types.ARRAY.checkList)
        .appendField(dropdown, 'OP');
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'SUM': Blockly.Msg.MATH_ONLIST_TOOLTIP_SUM,
        'MIN': Blockly.Msg.MATH_ONLIST_TOOLTIP_MIN,
        'MAX': Blockly.Msg.MATH_ONLIST_TOOLTIP_MAX,
        'AVERAGE': Blockly.Msg.MATH_ONLIST_TOOLTIP_AVERAGE,
        'MEDIAN': Blockly.Msg.MATH_ONLIST_TOOLTIP_MEDIAN,
        'MODE': Blockly.Msg.MATH_ONLIST_TOOLTIP_MODE,
        'STD_DEV': Blockly.Msg.MATH_ONLIST_TOOLTIP_STD_DEV,
        'RANDOM': Blockly.Msg.MATH_ONLIST_TOOLTIP_RANDOM
      };
      return TOOLTIPS[mode];
    });
  },
  /**
   * Modify this block to have the correct output type.
   * @param {string} newOp Either 'MODE' or some op than returns a number.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newOp) {
    if (newOp == 'MODE') {
      this.outputConnection.setCheck(Blockly.Types.ARRAY.output);
    } else {
      this.outputConnection.setCheck(Blockly.Types.NUMBER.output);
    }
  },
  /**
   * Create XML to represent the output type.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('op', this.getFieldValue('OP'));
    return container;
  },
  /**
   * Parse XML to restore the output type.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('op'));
  }
  //TODO: a getBlockType once the list code is finished.
};

Blockly.Blocks['math_modulo'] = {
  /**
   * Block for remainder of a division.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_MODULO_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "DIVIDEND",
          "check": Blockly.Types.NUMBER.checkList
        },
        {
          "type": "input_value",
          "name": "DIVISOR",
          "check": Blockly.Types.NUMBER.checkList
        }
      ],
      "inputsInline": true,
      "output": Blockly.Types.NUMBER.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_MODULO_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_MODULO_HELPURL
    });
  },
  /** @return {!string} Type of the block, modulus only works on integers. */
  getBlockType: function() {
    //TODO: Right now the block inputs are set to integer but will accept the
    //      "compatible" type float or plain "number", need to fix to integer.
    return Blockly.Types.NUMBER;
  }
};

Blockly.Blocks['math_constrain'] = {
  /**
   * Block for constraining a number between two limits.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_CONSTRAIN_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": Blockly.Types.NUMBER.checkList
        },
        {
          "type": "input_value",
          "name": "LOW",
          "check": Blockly.Types.NUMBER.checkList
        },
        {
          "type": "input_value",
          "name": "HIGH",
          "check": Blockly.Types.NUMBER.checkList
        }
      ],
      "inputsInline": true,
      "output": Blockly.Types.NUMBER.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_CONSTRAIN_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_CONSTRAIN_HELPURL
    });
  }
  //TODO: a getBlockType of the same type as the inputs.
};

Blockly.Blocks['math_random_int'] = {
  /**
   * Block for random integer between [X] and [Y].
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_RANDOM_INT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "FROM",
          "check": Blockly.Types.NUMBER.checkList
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": Blockly.Types.NUMBER.checkList
        }
      ],
      "inputsInline": true,
      "output": Blockly.Types.NUMBER.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_RANDOM_INT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_RANDOM_INT_HELPURL
    });
  },
  /** @return {!string} Type of the block, by definition always an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};

Blockly.Blocks['math_random_float'] = {
  /**
   * Block for random fraction between 0 and 1.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM,
      "output": Blockly.Types.DECIMAL.output,
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL
    });
  },
  /** @return {!string} Type of the block, by definition always a float. */
  getBlockType: function() {
    return Blockly.Types.DECIMAL;
  }
};
