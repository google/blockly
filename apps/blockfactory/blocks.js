/**
 * Blockly Apps: Block Factory Blocks
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
        .appendTitle('name')
        .appendTitle(new Blockly.FieldTextInput('math_foo'), 'NAME');
    this.appendStatementInput('INPUTS')
        .setCheck('Input')
        .appendTitle('inputs');
    var dropdown = new Blockly.FieldDropdown([
        ['external inputs', 'EXT'],
        ['inline inputs', 'INT']]);
    this.appendDummyInput()
        .appendTitle(dropdown, 'INLINE');
    dropdown = new Blockly.FieldDropdown([
        ['no connections', 'NONE'],
        ['left output', 'LEFT'],
        ['top+bottom connections', 'BOTH'],
        ['top connection', 'TOP'],
        ['bottom connection', 'BOTTOM']],
        function(option) {
          var block = this.sourceBlock_;
          var outputExists = block.getInput('OUTPUTTYPE');
          var topExists = block.getInput('TOPTYPE');
          var bottomExists = block.getInput('BOTTOMTYPE');
          if (option == 'LEFT') {
            if (!outputExists) {
              block.appendValueInput('OUTPUTTYPE')
                  .setCheck('Type')
                  .appendTitle('output type');
              block.moveInputBefore('OUTPUTTYPE', 'COLOUR');
            }
          } else if (outputExists) {
            block.removeInput('OUTPUTTYPE');
          }
          if (option == 'TOP' || option == 'BOTH') {
            if (!topExists) {
              block.appendValueInput('TOPTYPE')
                  .setCheck('Type')
                  .appendTitle('top type');
              block.moveInputBefore('TOPTYPE', 'COLOUR');
            }
          } else if (topExists) {
            block.removeInput('TOPTYPE');
          }
          if (option == 'BOTTOM' || option == 'BOTH') {
            if (!bottomExists) {
              block.appendValueInput('BOTTOMTYPE')
                  .setCheck('Type')
                  .appendTitle('bottom type');
              block.moveInputBefore('BOTTOMTYPE', 'COLOUR');
            }
          } else if (bottomExists) {
            block.removeInput('BOTTOMTYPE');
          }
        });
    this.appendDummyInput()
        .appendTitle(dropdown, 'CONNECTIONS');
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendTitle('colour');
    /*
    this.appendValueInput('TOOLTIP')
        .setCheck('String')
        .appendTitle('tooltip');
    this.appendValueInput('HELP')
        .setCheck('String')
        .appendTitle('help url');
    */
    this.setTooltip('Build a custom block by plugging\n' +
                    'titles, inputs and other blocks here.');
  }
};

var ALIGNMENT_OPTIONS =
    [['left', 'LEFT'], ['right', 'RIGHT'], ['centre', 'CENTRE']];

Blockly.Blocks['input_value'] = {
  // Value input.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle('value input')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'INPUTNAME');
    this.appendStatementInput('TITLES')
        .setCheck('Title')
        .appendTitle('titles')
        .appendTitle(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.appendValueInput('TYPE')
        .setCheck('Type')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle('type');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('A value socket for horizontal connections.');
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
        .appendTitle('statement input')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'INPUTNAME');
    this.appendStatementInput('TITLES')
        .setCheck('Title')
        .appendTitle('titles')
        .appendTitle(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.appendValueInput('TYPE')
        .setCheck('Type')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendTitle('type');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('A statement socket for enclosed vertical stacks.');
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
        .appendTitle('dummy input');
    this.appendStatementInput('TITLES')
        .setCheck('Title')
        .appendTitle('titles')
        .appendTitle(new Blockly.FieldDropdown(ALIGNMENT_OPTIONS), 'ALIGN');
    this.setPreviousStatement(true, 'Input');
    this.setNextStatement(true, 'Input');
    this.setTooltip('For adding titles on a separate\n' +
                    'row with no connections.\n' +
                    'Alignment options (left, right, centre)\n' +
                    'apply only to multi-line titles.');
  }
};

Blockly.Blocks['title_static'] = {
  // Text value.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('text')
        .appendTitle(new Blockly.FieldTextInput(''), 'TEXT');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('Static text that serves as a label.');
  }
};

Blockly.Blocks['title_input'] = {
  // Text input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('text input')
        .appendTitle(new Blockly.FieldTextInput('default'), 'TEXT')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('An input field for the user to enter text.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    titleNameCheck(this);
  }
};

Blockly.Blocks['title_angle'] = {
  // Angle input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('angle input')
        .appendTitle(new Blockly.FieldAngle('90'), 'ANGLE')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('An input field for the user to enter an angle.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    titleNameCheck(this);
  }
};

Blockly.Blocks['title_dropdown'] = {
  // Dropdown menu.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('dropdown')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.appendDummyInput('OPTION0')
        .appendTitle(new Blockly.FieldTextInput('option'), 'USER0')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU0');
    this.appendDummyInput('OPTION1')
        .appendTitle(new Blockly.FieldTextInput('option'), 'USER1')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU1');
    this.appendDummyInput('OPTION2')
        .appendTitle(new Blockly.FieldTextInput('option'), 'USER2')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU2');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setMutator(new Blockly.Mutator(['title_dropdown_option']));
    this.setTooltip('Dropdown menu with a list of options.');
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
      input.appendTitle(new Blockly.FieldTextInput('option'), 'USER' + x);
      input.appendTitle(',');
      input.appendTitle(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + x);
    }
  },
  decompose: function(workspace) {
    var containerBlock = new Blockly.Block(workspace,
                                           'title_dropdown_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.optionCount_; x++) {
      var optionBlock = new Blockly.Block(workspace, 'title_dropdown_option');
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
          .appendTitle(new Blockly.FieldTextInput(
              optionBlock.userData_ || 'option'), 'USER' + this.optionCount_)
          .appendTitle(',')
          .appendTitle(new Blockly.FieldTextInput(
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
      optionBlock.userData_ = this.getTitleValue('USER' + x);
      optionBlock.cpuData_ = this.getTitleValue('CPU' + x);
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
      titleNameCheck(this);
    }
  }
};

Blockly.Blocks['title_dropdown_container'] = {
  // Container.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('add options');
    this.appendStatementInput('STACK');
    this.setTooltip('Add, remove, or reorder options\n' +
                    'to reconfigure this dropdown menu.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['title_dropdown_option'] = {
  // Add option.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new option to the dropdown menu.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['title_checkbox'] = {
  // Checkbox.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('checkbox')
        .appendTitle(new Blockly.FieldCheckbox('TRUE'), 'CHECKED')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('Checkbox field.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    titleNameCheck(this);
  }
};

Blockly.Blocks['title_colour'] = {
  // Colour input.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('colour')
        .appendTitle(new Blockly.FieldColour('#ff0000'), 'COLOUR')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('Colour input field.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    titleNameCheck(this);
  }
};

Blockly.Blocks['title_variable'] = {
  // Dropdown for variables.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle('variable')
        .appendTitle(new Blockly.FieldTextInput('item'), 'TEXT')
        .appendTitle(',')
        .appendTitle(new Blockly.FieldTextInput('NAME'), 'TITLENAME');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('Dropdown menu for variable names.');
  },
  onchange: function() {
    if (!this.workspace) {
      // Block has been deleted.
      return;
    }
    titleNameCheck(this);
  }
};

Blockly.Blocks['title_image'] = {
  // Image.
  init: function() {
    this.setColour(160);
    var src = 'http://www.gstatic.com/codesite/ph/images/star_on.gif';
    this.appendDummyInput()
        .appendTitle('image')
        .appendTitle(new Blockly.FieldTextInput(src), 'SRC');
    this.appendDummyInput()
        .appendTitle('width')
        .appendTitle(new Blockly.FieldTextInput('15'), 'WIDTH')
        .appendTitle('height')
        .appendTitle(new Blockly.FieldTextInput('15'), 'HEIGHT');
    this.setPreviousStatement(true, 'Title');
    this.setNextStatement(true, 'Title');
    this.setTooltip('Static image (JPEG, PNG, GIF, SVG, BMP).\n' +
                    'Retains aspect ratio regardless of height and width.');
  }
};

Blockly.Blocks['type_group'] = {
  // Group of types.
  init: function() {
    this.setColour(230);
    this.appendValueInput('TYPE0')
        .setCheck('Type')
        .appendTitle('any of');
    this.appendValueInput('TYPE1')
        .setCheck('Type');
    this.setOutput(true, 'Type');
    this.setMutator(new Blockly.Mutator(['type_group_item']));
    this.setTooltip('Allows more than one type to be accepted.');
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
        input.appendTitle('any of');
      }
    }
  },
  decompose: function(workspace) {
    var containerBlock = new Blockly.Block(workspace,
                                           'type_group_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 0; x < this.typeCount_; x++) {
      var typeBlock = new Blockly.Block(workspace, 'type_group_item');
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
        input.appendTitle('any of');
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
        .appendTitle('add types');
    this.appendStatementInput('STACK');
    this.setTooltip('Add, or remove allowed type.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['type_group_item'] = {
  // Add type.
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('type');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new allowed type.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['type_null'] = {
  // Null type.
  valueType: 'null',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('any');
    this.setOutput(true, 'Type');
    this.setTooltip('Any type is allowed.');
  }
};

Blockly.Blocks['type_boolean'] = {
  // Boolean type.
  valueType: 'Boolean',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('boolean');
    this.setOutput(true, 'Type');
    this.setTooltip('Booleans (true/false) are allowed.');
  }
};

Blockly.Blocks['type_number'] = {
  // Number type.
  valueType: 'Number',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('number');
    this.setOutput(true, 'Type');
    this.setTooltip('Numbers (int/float) are allowed.');
  }
};

Blockly.Blocks['type_string'] = {
  // String type.
  valueType: 'String',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('string');
    this.setOutput(true, 'Type');
    this.setTooltip('Strings (text) are allowed.');
  }
};

Blockly.Blocks['type_list'] = {
  // List type.
  valueType: 'Array',
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('list');
    this.setOutput(true, 'Type');
    this.setTooltip('Arrays (lists) are allowed.');
  }
};

Blockly.Blocks['type_other'] = {
  // Other type.
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle('other')
        .appendTitle(new Blockly.FieldTextInput(''), 'TYPE');
    this.setOutput(true, 'Type');
    this.setTooltip('Custom type to allow.');
  }
};

Blockly.Blocks['colour_hue'] = {
  // Set the colour of the block.
  init: function() {
    this.appendDummyInput()
        .appendTitle('hue:')
        .appendTitle(new Blockly.FieldAngle('0', this.validator), 'HUE');
    this.setOutput(true, 'Colour');
    this.setTooltip('Paint the block with this colour.');
  },
  validator: function(text) {
    // Update the current block's colour to match.
    this.sourceBlock_.setColour(text);
  }
};

/**
 * Check to see if more than one title has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function titleNameCheck(referenceBlock) {
  var name = referenceBlock.getTitleValue('TITLENAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    var otherName = block.getTitleValue('TITLENAME');
    if (otherName) {
      if (otherName.toLowerCase() == name) {
        count++;
      }
    }
  }
  var msg = (count > 1) ?
      'There are ' + count + ' title blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}

/**
 * Check to see if more than one input has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function inputNameCheck(referenceBlock) {
  var name = referenceBlock.getTitleValue('INPUTNAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks();
  for (var x = 0, block; block = blocks[x]; x++) {
    var otherName = block.getTitleValue('INPUTNAME');
    if (otherName) {
      if (otherName.toLowerCase() == name) {
        count++;
      }
    }
  }
  var msg = (count > 1) ?
      'There are ' + count + ' input blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}
