/**
 * Blockly Apps: Puzzle Blocks
 *
 * Copyright 2013 Google Inc.
 * https://blockly.googlecode.com/
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
 * @fileoverview Blocks for Blockly's Puzzle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


Blockly.Blocks['country'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .appendField('', 'NAME');
    this.appendValueInput('FLAG')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyApps.getMsg('Puzzle_flag'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyApps.getMsg('Puzzle_language'))
        .appendField(new Blockly.FieldDropdown(Puzzle.languages), 'LANG');
    this.appendStatementInput('CITIES')
        .appendField(BlocklyApps.getMsg('Puzzle_cities'));
  },
  mutationToDom: function() {
    // Save the country number.
    var container = document.createElement('mutation');
    container.setAttribute('country', this.country);
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the country number.
    this.populate(parseInt(xmlElement.getAttribute('country'), 10));
  },
  country: 0,
  populate: function(n) {
    this.country = n;
    // Set the country name.
    this.setFieldValue(BlocklyApps.getMsg('Puzzle_country' + n), 'NAME');
    this.helpUrl = BlocklyApps.getMsg('Puzzle_country' + n + 'HelpUrl');
  },
  isCorrect: function() {
    return this.getFieldValue('LANG') == this.country;
  }
};

Blockly.Blocks['flag'] = {
  init: function() {
    this.setColour(30);
    this.appendDummyInput('IMG');
    this.setOutput(true);
    this.setTooltip('');
  },
  mutationToDom: Blockly.Blocks['country'].mutationToDom,
  domToMutation: Blockly.Blocks['country'].domToMutation,
  country: 0,
  populate: function(n) {
    this.country = n;
    // Set the flag image.
    var flag = BlocklyApps.getMsg('Puzzle_country' + n + 'Flag');
    var flagHeight = BlocklyApps.getMsg('Puzzle_country' + n + 'FlagHeight');
    var flagWidth = BlocklyApps.getMsg('Puzzle_country' + n + 'FlagWidth');
    this.getInput('IMG')
        .appendField(new Blockly.FieldImage(flag, flagWidth, flagHeight));
  },
  isCorrect: function() {
    var parent = this.getParent();
    return parent && (parent.country == this.country);
  }
};

Blockly.Blocks['city'] = {
  init: function() {
    this.setColour(290);
    this.appendDummyInput().appendField('', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  mutationToDom: function() {
    // Save the country and city numbers.
    var container = document.createElement('mutation');
    container.setAttribute('country', this.country);
    container.setAttribute('city', this.city);
    return container;
  },
  domToMutation: function(xmlElement) {
    // Restore the country and city numbers.
    this.populate(parseInt(xmlElement.getAttribute('country'), 10),
                  parseInt(xmlElement.getAttribute('city'), 10));
  },
  country: 0,
  city: 0,
  populate: function(n, m) {
    this.country = n;
    this.city = m;
    // Set the city name.
    this.setFieldValue(BlocklyApps.getMsg(
        'Puzzle_country' + n + 'City' + m), 'NAME');
  },
  isCorrect: function() {
    var parent = this.getSurroundParent();
    return parent && (parent.country == this.country);
  }
};
