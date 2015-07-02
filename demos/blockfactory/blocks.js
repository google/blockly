/**
 * Blockly Demos: Block Factory Blocks
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
 * @fileoverview Blocks for Blockly's Block Factory application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks['factory_base'] = {
  // Base of new block.
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .appendField('name')
        .appendField(new Blockly.FieldTextInput('math_foo'), 'NAME');
    this.appendStatementInput('INPUTS')
        .setCheck('Input')
        .appendField('inputs');
    var dropdown = new Blockly.FieldDropdown([
        ['automatic inputs', 'AUTO'],
        ['external inputs', 'EXT'],
        ['inline inputs', 'INT']]);
    this.appendDummyInput()
        .appendField(dropdown, 'INLINE');
    dropdown = new Blockly.FieldDropdown([
        ['no connections', 'NONE'],
        ['← left output', 'LEFT'],
        ['↕ top+bottom connections', 'BOTH'],
        ['↑ top connection', 'TOP'],
        ['↓ bottom connection', 'BOTTOM']],
        function(option) {
          this.sourceBlock_.updateShape_(option);
        });
    this.appendDummyInput()
        .appendField(dropdown, 'CONNECTIONS');
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField('colour');
    /*
    this.appendValueInput('TOOLTIP')
        .setCheck('String')
        .appendField('tooltip');
    this.appendValueInput('HELP')
        .setCheck('String')
        .appendField('help url');
    */
    this.setTooltip('Build a custom block by plugging\n' +
        'fields, inputs and other blocks here.');
    this.setHelpUrl(
        'https://developers.google.com/blockly/custom-blocks/block-factory');
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('connections', this.getFieldValue('CONNECTIONS'));
    return container;
  },
  domToMutation: function(xmlElement) {
    var connections = xmlElement.getAttribute('connections');
    this.updateShape_(connections);
  },
  updateShape_: function(option) {
    var outputExists = this.getInput('OUTPUTTYPE');
    var topExists = this.getInput('TOPTYPE');
    var bottomExists = this.getInput('BOTTOMTYPE');
    if (option == 'LEFT') {
      if (!outputExists) {
        this.appendValueInput('OUTPUTTYPE')
            .setCheck('Type')
            .appendField('output type');
        this.moveInputBefore('OUTPUTTYPE', 'COLOUR');
      }
    } else if (outputExists) {
      this.removeInput('OUTPUTTYPE');
    }
    if (option == 'TOP' || option == 'BOTH') {
      if (!topExists) {
        this.appendValueInput('TOPTYPE')
            .setCheck('Type')
            .appendField('top type');
        this.moveInputBefore('TOPTYPE', 'COLOUR');
      }
    } else if (topExists) {
      this.removeInput('TOPTYPE');
    }
    if (option == 'BOTTOM' || option == 'BOTH') {
      if (!bottomExists) {
        this.appendValueInput('BOTTOMTYPE')
            .setCheck('Type')
            .appendField('bottom type');
        this.moveInputBefore('BOTTOMTYPE', 'COLOUR');
      }
    } else if (bottomExists) {
      this.removeInput('BOTTOMTYPE');
    }
  }
};

var ALIGNMENT_OPTIONS =
    [['left', 'LEFT'], ['right', 'RIGHT'], ['centre', 'CENTRE']];

Blockly.Blocks['input_value'] = {
  // Value input.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField('value input')
        .appendField(new Blockly.FieldTextInput('NAME'), 'INPUTNAME');
    this.appendStatementInput('FIELDS')
        .setCheck('Field')
        .appendField('fields')
        .appendField(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.appendValueInput('TYPE')
        .setCheck('Type')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('type');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('A value socket for horizontal connections.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=71');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    inputNameCheck(this);
  }
};

Blockly.Blocks['input_statement'] = {
  // Statement input.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField('statement input')
        .appendField(new Blockly.FieldTextInput('NAME'), 'INPUTNAME');
    this.appendStatementInput('FIELDS')
        .setCheck('Field')
        .appendField('fields')
        .appendField(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.appendValueInput('TYPE')
        .setCheck('Type')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('type');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('A statement socket for enclosed vertical stacks.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=246');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    inputNameCheck(this);
  }
};

Blockly.Blocks['input_dummy'] = {
  // Dummy input.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField('dummy input');
    this.appendStatementInput('FIELDS')
        .setCheck('Field')
        .appendField('fields')
        .appendField(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('For adding fields on a separate row with no ' +
                    'connections. Alignment options (left, right, centre) ' +
                    'apply only to multi-line fields.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=293');
  }
};

Blockly.Blocks['field_static'] = {
  // Text value.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('text')
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Static text that serves as a label.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=88');
  }
};

Blockly.Blocks['field_input'] = {
  // Text input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('text input')
        .appendField(new Blockly.FieldTextInput('default'), 'TEXT')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter text.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=319');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_angle'] = {
  // Angle input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('angle input')
        .appendField(new Blockly.FieldAngle('90'), 'ANGLE')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter an angle.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=372');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_dropdown'] = {
  // Dropdown menu.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('dropdown')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.appendDummyInput('OPTION0')
        .appendField(new Blockly.FieldTextInput('option'), 'USER0')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU0');
    this.appendDummyInput('OPTION1')
        .appendField(new Blockly.FieldTextInput('option'), 'USER1')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU1');
    this.appendDummyInput('OPTION2')
        .appendField(new Blockly.FieldTextInput('option'), 'USER2')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU2');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setMutator(new Blockly.Mutator(['field_dropdown_option']));
    this.setTooltip('Dropdown menu with a list of options.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.optionCount_ = 3;
  },
  mutationToDom: function(workspace) {
    var container = document.createElement('mutation');
    container.setAttribute('options', this.optionCount_);
    return container;
  },
  domToMutation: function(container) {
    for (var x = 0; x < this.optionCount_; x++) {
      this.removeInput('OPTION' + x);
    }
    this.optionCount_ = parseInt(container.getAttribute('options'), 10);
    for (var x = 0; x < this.optionCount_; x++) {
      var input = this.appendDummyInput('OPTION' + x);
      input.appendField(new Blockly.FieldTextInput('option'), 'USER' + x);
      input.appendField(',');
      input.appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + x);
    }
  },
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'field_dropdown_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.optionCount_; x++) {
      var optionBlock =
          Blockly.Block.obtain(workspace, 'field_dropdown_option');
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    for (var x = this.optionCount_ - 1; x >= 0; x--) {
      this.removeInput('OPTION' + x);
    }
    this.optionCount_ = 0;
    // Rebuild the block's inputs.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    while (optionBlock) {
      this.appendDummyInput('OPTION' + this.optionCount_)
          .appendField(new Blockly.FieldTextInput(
              optionBlock.userData_ || 'option'), 'USER' + this.optionCount_)
          .appendField(',')
          .appendField(new Blockly.FieldTextInput(
              optionBlock.cpuData_ || 'OPTIONNAME'), 'CPU' + this.optionCount_);
      this.optionCount_++;
      optionBlock = optionBlock.nextConnection &&
          optionBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store names and values for each option.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (optionBlock) {
      optionBlock.userData_ = this.getFieldValue('USER' + x);
      optionBlock.cpuData_ = this.getFieldValue('CPU' + x);
      x++;
      optionBlock = optionBlock.nextConnection &&
          optionBlock.nextConnection.targetBlock();
    }
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    if (this.optionCount_ < 1) {
      this.setWarningText('Drop down menu must\nhave at least one option.');
    } else {
      fieldNameCheck(this);
    }
  }
};

Blockly.Blocks['field_dropdown_container'] = {
  // Container.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('add options');
    this.appendStatementInput('STACK');
    this.setTooltip('Add, remove, or reorder options\n' +
                    'to reconfigure this dropdown menu.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.contextMenu = false;
  }
};

Blockly.Blocks['field_dropdown_option'] = {
  // Add option.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new option to the dropdown menu.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=386');
    this.contextMenu = false;
  }
};

Blockly.Blocks['field_checkbox'] = {
  // Checkbox.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('checkbox')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'CHECKED')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Checkbox field.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=485');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_colour'] = {
  // Colour input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('colour')
        .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Colour input field.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=495');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_date'] = {
  // Date input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('date')
        .appendField(new Blockly.FieldDate(), 'DATE')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Date input field.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_variable'] = {
  // Dropdown for variables.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField('variable')
        .appendField(new Blockly.FieldTextInput('item'), 'TEXT')
        .appendField(',')
        .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Dropdown menu for variable names.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=510');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_image'] = {
  // Image.
  init: function() {
    this.setColour(160);
    var src = 'https://www.gstatic.com/codesite/ph/images/star_on.gif';
    this.appendDummyInput()
        .appendField('image')
        .appendField(new Blockly.FieldTextInput(src), 'SRC');
    this.appendDummyInput()
        .appendField('width')
        .appendField(new Blockly.FieldTextInput('15',
            Blockly.FieldTextInput.numberValidator), 'WIDTH')
        .appendField('height')
        .appendField(new Blockly.FieldTextInput('15',
            Blockly.FieldTextInput.numberValidator), 'HEIGHT')
        .appendField('alt text')
        .appendField(new Blockly.FieldTextInput('*'), 'ALT');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Static image (JPEG, PNG, GIF, SVG, BMP).\n' +
                    'Retains aspect ratio regardless of height and width.\n' +
                    'Alt text is for when collapsed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=567');
  }
};

Blockly.Blocks['type_group'] = {
  // Group of types.
  init: function() {
    this.setColour(230);
    this.appendValueInput('TYPE0')
        .setCheck('Type')
        .appendField('any of');
    this.appendValueInput('TYPE1')
        .setCheck('Type');
    this.setOutput(true, 'Type');
    this.setMutator(new Blockly.Mutator(['type_group_item']));
    this.setTooltip('Allows more than one type to be accepted.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
    this.typeCount_ = 2;
  },
  mutationToDom: function(workspace) {
    var container = document.createElement('mutation');
    container.setAttribute('types', this.typeCount_);
    return container;
  },
  domToMutation: function(container) {
    for (var x = 0; x < this.typeCount_; x++) {
      this.removeInput('TYPE' + x);
    }
    this.typeCount_ = parseInt(container.getAttribute('types'), 10);
    for (var x = 0; x < this.typeCount_; x++) {
      var input = this.appendValueInput('TYPE' + x)
                      .setCheck('Type');
      if (x == 0) {
        input.appendField('any of');
      }
    }
  },
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'type_group_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.typeCount_; x++) {
      var typeBlock = Blockly.Block.obtain(workspace, 'type_group_item');
      typeBlock.initSvg();
      connection.connect(typeBlock.previousConnection);
      connection = typeBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect all input blocks and remove all inputs.
    for (var x = this.typeCount_ - 1; x >= 0; x--) {
      this.removeInput('TYPE' + x);
    }
    this.typeCount_ = 0;
    // Rebuild the block's inputs.
    var typeBlock = containerBlock.getInputTargetBlock('STACK');
    while (typeBlock) {
      var input = this.appendValueInput('TYPE' + this.typeCount_)
                      .setCheck('Type');
      if (this.typeCount_ == 0) {
        input.appendField('any of');
      }
      // Reconnect any child blocks.
      if (typeBlock.valueConnection_) {
        input.connection.connect(typeBlock.valueConnection_);
      }
      this.typeCount_++;
      typeBlock = typeBlock.nextConnection &&
          typeBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    var typeBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 0;
    while (typeBlock) {
      var input = this.getInput('TYPE' + x);
      typeBlock.valueConnection_ = input && input.connection.targetConnection;
      x++;
      typeBlock = typeBlock.nextConnection &&
          typeBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['type_group_container'] = {
  // Container.
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('add types');
    this.appendStatementInput('STACK');
    this.setTooltip('Add, or remove allowed type.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
    this.contextMenu = false;
  }
};

Blockly.Blocks['type_group_item'] = {
  // Add type.
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('type');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new allowed type.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
    this.contextMenu = false;
  }
};

Blockly.Blocks['type_null'] = {
  // Null type.
  valueType: null,
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('any');
    this.setOutput(true, 'Type');
    this.setTooltip('Any type is allowed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
  }
};

Blockly.Blocks['type_boolean'] = {
  // Boolean type.
  valueType: 'Boolean',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('boolean');
    this.setOutput(true, 'Type');
    this.setTooltip('Booleans (true/false) are allowed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
  }
};

Blockly.Blocks['type_number'] = {
  // Number type.
  valueType: 'Number',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('number');
    this.setOutput(true, 'Type');
    this.setTooltip('Numbers (int/float) are allowed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
  }
};

Blockly.Blocks['type_string'] = {
  // String type.
  valueType: 'String',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('string');
    this.setOutput(true, 'Type');
    this.setTooltip('Strings (text) are allowed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
  }
};

Blockly.Blocks['type_list'] = {
  // List type.
  valueType: 'Array',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('list');
    this.setOutput(true, 'Type');
    this.setTooltip('Arrays (lists) are allowed.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
  }
};

Blockly.Blocks['type_other'] = {
  // Other type.
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendField('other')
        .appendField(new Blockly.FieldTextInput(''), 'TYPE');
    this.setOutput(true, 'Type');
    this.setTooltip('Custom type to allow.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=702');
  }
};

Blockly.Blocks['colour_hue'] = {
  // Set the colour of the block.
  init: function() {
    this.appendDummyInput()
        .appendField('hue:')
        .appendField(new Blockly.FieldAngle('0', this.validator), 'HUE');
    this.setOutput(true, 'Colour');
    this.setTooltip('Paint the block with this colour.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=55');
  },
  validator: function(text) {
    // Update the current block's colour to match.
    this.sourceBlock_.setColour(text);
  },
  mutationToDom: function(workspace) {
    var container = document.createElement('mutation');
    container.setAttribute('colour', this.getColour());
    return container;
  },
  domToMutation: function(container) {
    this.setColour(container.getAttribute('colour'));
  }
};

/**
 * Check to see if more than one field has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function fieldNameCheck(referenceBlock) {
  var name = referenceBlock.getFieldValue('FIELDNAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    var otherName = block.getFieldValue('FIELDNAME');
    if (!block.disabled && !block.getInheritedDisabled() &&
        otherName && otherName.toLowerCase() == name) {
      count++;
    }
  }
  var msg = (count > 1) ?
      'There are ' + count + ' field blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}

/**
 * Check to see if more than one input has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function inputNameCheck(referenceBlock) {
  var name = referenceBlock.getFieldValue('INPUTNAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    var otherName = block.getFieldValue('INPUTNAME');
    if (!block.disabled && !block.getInheritedDisabled() &&
        otherName && otherName.toLowerCase() == name) {
      count++;
    }
  }
  var msg = (count > 1) ?
      'There are ' + count + ' input blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}
