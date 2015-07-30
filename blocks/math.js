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


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.math.HUE = 230;

Blockly.Blocks['math_number'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('0',
        Blockly.FieldTextInput.numberValidator), 'NUM');
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
  }
};

Blockly.Blocks['math_arithmetic'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
         [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
         [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
         [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
         [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']];
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
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
  },
  typeblock: [{ entry: Blockly.Msg.MATH_ARITHMETIC_ADD_TYPEBLOCK,
                fields: { 'OP': 'ADD' }},
              { entry: Blockly.Msg.MATH_ARITHMETIC_MINUS_TYPEBLOCK,
                fields: { 'OP': 'MINUS' }},
              { entry: Blockly.Msg.MATH_ARITHMETIC_MULTIPLY_TYPEBLOCK,
                fields: { 'OP': 'MULTIPLY' }},
              { entry: Blockly.Msg.MATH_ARITHMETIC_DIVIDE_TYPEBLOCK,
                fields: { 'OP': 'DIVIDE' }},
              { entry: Blockly.Msg.MATH_ARITHMETIC_POWER_TYPEBLOCK,
                fields: { 'OP': 'POWER' }}]
};

Blockly.Blocks['math_single'] = {
  /**
   * Block for advanced math operators with single operand.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_SINGLE_OP_ROOT, 'ROOT'],
         [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, 'ABS'],
         ['-', 'NEG'],
         ['ln', 'LN'],
         ['log10', 'LOG10'],
         ['e^', 'EXP'],
         ['10^', 'POW10']];
    this.setHelpUrl(Blockly.Msg.MATH_SINGLE_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
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
  typeblock: [{ entry: Blockly.Msg.MATH_SINGLE_OP_ROOT_TYPEBLOCK,
                fields: { 'OP': 'ROOT' }},
              { entry: Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE_TYPEBLOCK,
                fields: { 'OP': 'ABS' }},
              { entry: Blockly.Msg.MATH_SINGLE_OP_NEG_TYPEBLOCK,
                fields: { 'OP': 'NEG' }},
              { entry: 'ln',
                fields: { 'OP': 'LN' }},
              { entry: 'log10',
                fields: { 'OP': 'LOG10' }},
              { entry: 'e^',
                fields: { 'OP': 'EXP' }},
              { entry: '10^',
                fields: { 'OP': 'POW10' }}]
};

Blockly.Blocks['math_trig'] = {
  /**
   * Block for trigonometry operators.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_TRIG_SIN, 'SIN'],
         [Blockly.Msg.MATH_TRIG_COS, 'COS'],
         [Blockly.Msg.MATH_TRIG_TAN, 'TAN'],
         [Blockly.Msg.MATH_TRIG_ASIN, 'ASIN'],
         [Blockly.Msg.MATH_TRIG_ACOS, 'ACOS'],
         [Blockly.Msg.MATH_TRIG_ATAN, 'ATAN']];
    this.setHelpUrl(Blockly.Msg.MATH_TRIG_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
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
  typeblock: [{ entry: Blockly.Msg.MATH_TRIG_SIN_TYPEBLOCK,
                fields: { 'OP': 'SIN' }},
              { entry: Blockly.Msg.MATH_TRIG_COS_TYPEBLOCK,
                fields: { 'OP': 'COS' }},
              { entry: Blockly.Msg.MATH_TRIG_TAN_TYPEBLOCK,
                fields: { 'OP': 'TAN' }},
              { entry: Blockly.Msg.MATH_TRIG_ASIN_TYPEBLOCK,
                fields: { 'OP': 'ASIN' }},
              { entry: Blockly.Msg.MATH_TRIG_ACOS_TYPEBLOCK,
                fields: { 'OP': 'ACOS' }},
              { entry: Blockly.Msg.MATH_TRIG_ATAN_TYPEBLOCK,
                fields: { 'OP': 'ATAN' }}]
};

Blockly.Blocks['math_constant'] = {
  /**
   * Block for constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
   * @this Blockly.Block
   */
  init: function() {
    var CONSTANTS =
        [['\u03c0', 'PI'],
         ['e', 'E'],
         ['\u03c6', 'GOLDEN_RATIO'],
         ['sqrt(2)', 'SQRT2'],
         ['sqrt(\u00bd)', 'SQRT1_2'],
         ['\u221e', 'INFINITY']];
    this.setHelpUrl(Blockly.Msg.MATH_CONSTANT_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(CONSTANTS), 'CONSTANT');
    this.setTooltip(Blockly.Msg.MATH_CONSTANT_TOOLTIP);
  },
  typeblock: [{ entry: Blockly.Msg.MATH_CONSTANT_PI_TYPEBLOCK,
                fields: { 'CONSTANT': 'PI' }},
              { entry: Blockly.Msg.MATH_CONSTANT_E_TYPEBLOCK,
                fields: { 'CONSTANT': 'E' }},
              { entry: Blockly.Msg.MATH_CONSTANT_GOLDEN_RATIO_TYPEBLOCK,
                fields: { 'CONSTANT': 'GOLDEN_RATIO' }},
              { entry: Blockly.Msg.MATH_CONSTANT_SQRT2_TYPEBLOCK,
                fields: { 'CONSTANT': 'SQRT2' }},
              { entry: Blockly.Msg.MATH_CONSTANT_SQRT1_2_TYPEBLOCK,
                fields: { 'CONSTANT': 'SQRT1_2' }},
              { entry: Blockly.Msg.MATH_CONSTANT_INFINITY_TYPEBLOCK,
                fields: { 'CONSTANT': 'INFINITY' }}]
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
        .setCheck('Number');
    var dropdown = new Blockly.FieldDropdown(PROPERTIES, function(option) {
      var divisorInput = (option == 'DIVISIBLE_BY');
      this.sourceBlock_.updateShape_(divisorInput);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'PROPERTY');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
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
            .setCheck('Number');
      }
    } else if (inputExists) {
      this.removeInput('DIVISOR');
    }
  },
  typeblock: [{ entry: Blockly.Msg.MATH_IS_EVEN_TYPEBLOCK,
                fields: { 'PROPERTY': 'EVEN' }},
              { entry: Blockly.Msg.MATH_IS_ODD_TYPEBLOCK,
                fields: { 'PROPERTY': 'ODD' }},
              { entry: Blockly.Msg.MATH_IS_PRIME_TYPEBLOCK,
                fields: { 'PROPERTY': 'PRIME' }},
              { entry: Blockly.Msg.MATH_IS_WHOLE_TYPEBLOCK,
                fields: { 'PROPERTY': 'WHOLE' }},
              { entry: Blockly.Msg.MATH_IS_POSITIVE_TYPEBLOCK,
                fields: { 'PROPERTY': 'POSITIVE' }},
              { entry: Blockly.Msg.MATH_IS_NEGATIVE_TYPEBLOCK,
                fields: { 'PROPERTY': 'NEGATIVE' }},
              { entry: Blockly.Msg.MATH_IS_DIVISIBLE_BY_TYPEBLOCK,
                fields: { 'PROPERTY': 'DIVISIBLE_BY' }}]
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
          "check": "Number"
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
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR')];
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  typeblock: [{entry: Blockly.Msg.MATH_CHANGE_TYPEBLOCK,
              values: {"DELTA": 1}}]
};

Blockly.Blocks['math_round'] = {
  /**
   * Block for rounding functions.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ROUND_OPERATOR_ROUND, 'ROUND'],
         [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP, 'ROUNDUP'],
         [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN, 'ROUNDDOWN']];
    this.setHelpUrl(Blockly.Msg.MATH_ROUND_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setTooltip(Blockly.Msg.MATH_ROUND_TOOLTIP);
  },
  typeblock: [{ entry: Blockly.Msg.MATH_ROUND_ROUND_TYPEBLOCK,
                fields: { 'OP': 'ROUND' }},
              { entry: Blockly.Msg.MATH_ROUND_ROUNDUP_TYPEBLOCK,
                fields: { 'OP': 'ROUNDUP' }},
              { entry: Blockly.Msg.MATH_ROUND_ROUNDDOWN_TYPEBLOCK,
                fields: { 'OP': 'ROUNDDOWN' }}]
};

Blockly.Blocks['math_format_as_decimal'] = {
  init: function () {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_FORMAT_AS_DECIMAL_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "PLACES",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.getToolTipString('math_format_as_decimal_tooltip'),
      "helpUrl": Blockly.getUrlString('math_format_as_decimal_url')
    });
  },
  typeblock: Blockly.Msg.MATH_FORMAT_AS_DECIMAL_TYPEBLOCK
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
    this.setOutput(true, 'Number');
    var dropdown = new Blockly.FieldDropdown(OPERATORS, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendValueInput('LIST')
        .setCheck('Array')
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
      this.outputConnection.setCheck('Array');
    } else {
      this.outputConnection.setCheck('Number');
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
  },
  typeblock: [{ entry: Blockly.Msg.MATH_ONLIST_SUM_TYPEBLOCK,
                fields: { 'OP': 'SUM' }},
              { entry: Blockly.Msg.MATH_ONLIST_MIN_TYPEBLOCK,
                fields: { 'OP': 'MIN' }},
              { entry: Blockly.Msg.MATH_ONLIST_MAX_TYPEBLOCK,
                fields: { 'OP': 'MAX' }},
              { entry: Blockly.Msg.MATH_ONLIST_AVERAGE_TYPEBLOCK,
                fields: { 'OP': 'AVERAGE' }},
              { entry: Blockly.Msg.MATH_ONLIST_MEDIAN_TYPEBLOCK,
                fields: { 'OP': 'MEDIAN' }},
              { entry: Blockly.Msg.MATH_ONLIST_MODE_TYPEBLOCK,
                fields: { 'OP': 'MODE' }},
              { entry: Blockly.Msg.MATH_ONLIST_STD_DEV_TYPEBLOCK,
                fields: { 'OP': 'STD_DEV' }},
              { entry: Blockly.Msg.MATH_ONLIST_RANDOM_TYPEBLOCK,
                fields: { 'OP': 'RANDOM' }}]
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
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "DIVISOR",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_MODULO_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_MODULO_HELPURL
    });
  },
  typeblock: Blockly.Msg.MATH_MODULO_TYPEBLOCK
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
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "LOW",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "HIGH",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_CONSTRAIN_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_CONSTRAIN_HELPURL
    });
  },
  typeblock: [{entry: Blockly.Msg.MATH_CONSTRAIN_TYPEBLOCK,
              values: {"LOW": 1, "HIGH" : 100}}]
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
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_RANDOM_INT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_RANDOM_INT_HELPURL
    });
  },
  typeblock: [{entry: Blockly.Msg.MATH_RANDOM_INT_TYPEBLOCK,
              values: {"FROM": 1, "TO" : 100}}]
};

Blockly.Blocks['math_random_float'] = {
  /**
   * Block for random fraction between 0 and 1.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendDummyInput()
        .appendField(Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM);
    this.setTooltip(Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP);
  },
  typeblock: Blockly.Msg.MATH_RANDOM_FLOAT_TYPEBLOCK
};
