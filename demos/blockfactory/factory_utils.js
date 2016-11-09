/**
 * @license
 * Blockly Demos: Block Factory
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview FactoryUtils is a namespace that holds block starter code
 * generation functions shared by the Block Factory, Workspace Factory, and
 * Exporter applications within Blockly Factory. Holds functions to generate
 * block definitions and generator stubs and to create and download files.
 *
 * @author fraser@google.com (Neil Fraser), quachtina96 (Tina Quach)
 */
 'use strict';

/**
 * Namespace for FactoryUtils.
 */
goog.provide('FactoryUtils');


/**
 * Get block definition code for the current block.
 * @param {string} blockType Type of block.
 * @param {!Blockly.Block} rootBlock RootBlock from main workspace in which
 *    user uses Block Factory Blocks to create a custom block.
 * @param {string} format 'JSON' or 'JavaScript'.
 * @param {!Blockly.Workspace} workspace Where the root block lives.
 * @return {string} Block definition.
 */
FactoryUtils.getBlockDefinition = function(blockType, rootBlock, format, workspace) {
  blockType = blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
  switch (format) {
    case 'JSON':
      var code = FactoryUtils.formatJson_(blockType, rootBlock);
      break;
    case 'JavaScript':
      var code = FactoryUtils.formatJavaScript_(blockType, rootBlock, workspace);
      break;
  }
  return code;
};

/**
 * Get the generator code for a given block.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 * @param {string} generatorLanguage 'JavaScript', 'Python', 'PHP', 'Lua',
 *   'Dart'.
 * @return {string} Generator code for multiple blocks.
 */
FactoryUtils.getGeneratorStub = function(block, generatorLanguage) {
  function makeVar(root, name) {
    name = name.toLowerCase().replace(/\W/g, '_');
    return '  var ' + root + '_' + name;
  }
  // The makevar function lives in the original update generator.
  var language = generatorLanguage;
  var code = [];
  code.push("Blockly." + language + "['" + block.type +
            "'] = function(block) {");

  // Generate getters for any fields or inputs.
  for (var i = 0, input; input = block.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      var name = field.name;
      if (!name) {
        continue;
      }
      if (field instanceof Blockly.FieldVariable) {
        // Subclass of Blockly.FieldDropdown, must test first.
        code.push(makeVar('variable', name) +
                  " = Blockly." + language +
                  ".variableDB_.getName(block.getFieldValue('" + name +
                  "'), Blockly.Variables.NAME_TYPE);");
      } else if (field instanceof Blockly.FieldAngle) {
        // Subclass of Blockly.FieldTextInput, must test first.
        code.push(makeVar('angle', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (Blockly.FieldDate && field instanceof Blockly.FieldDate) {
        // Blockly.FieldDate may not be compiled into Blockly.
        code.push(makeVar('date', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldColour) {
        code.push(makeVar('colour', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldCheckbox) {
        code.push(makeVar('checkbox', name) +
                  " = block.getFieldValue('" + name + "') == 'TRUE';");
      } else if (field instanceof Blockly.FieldDropdown) {
        code.push(makeVar('dropdown', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldNumber) {
        code.push(makeVar('number', name) +
                  " = block.getFieldValue('" + name + "');");
      } else if (field instanceof Blockly.FieldTextInput) {
        code.push(makeVar('text', name) +
                  " = block.getFieldValue('" + name + "');");
      }
    }
    var name = input.name;
    if (name) {
      if (input.type == Blockly.INPUT_VALUE) {
        code.push(makeVar('value', name) +
                  " = Blockly." + language + ".valueToCode(block, '" + name +
                  "', Blockly." + language + ".ORDER_ATOMIC);");
      } else if (input.type == Blockly.NEXT_STATEMENT) {
        code.push(makeVar('statements', name) +
                  " = Blockly." + language + ".statementToCode(block, '" +
                  name + "');");
      }
    }
  }
  // Most languages end lines with a semicolon.  Python does not.
  var lineEnd = {
    'JavaScript': ';',
    'Python': '',
    'PHP': ';',
    'Dart': ';'
  };
  code.push("  // TODO: Assemble " + language + " into code variable.");
  if (block.outputConnection) {
    code.push("  var code = '...';");
    code.push("  // TODO: Change ORDER_NONE to the correct strength.");
    code.push("  return [code, Blockly." + language + ".ORDER_NONE];");
  } else {
    code.push("  var code = '..." + (lineEnd[language] || '') + "\\n';");
    code.push("  return code;");
  }
  code.push("};");

  return code.join('\n');
};

/**
 * Update the language code as JSON.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
FactoryUtils.formatJson_ = function(blockType, rootBlock) {
  var JS = {};
  // Type is not used by Blockly, but may be used by a loader.
  JS.type = blockType;
  // Generate inputs.
  var message = [];
  var args = [];
  var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
  var lastInput = null;
  while (contentsBlock) {
    if (!contentsBlock.disabled && !contentsBlock.getInheritedDisabled()) {
      var fields = FactoryUtils.getFieldsJson_(
          contentsBlock.getInputTargetBlock('FIELDS'));
      for (var i = 0; i < fields.length; i++) {
        if (typeof fields[i] == 'string') {
          message.push(fields[i].replace(/%/g, '%%'));
        } else {
          args.push(fields[i]);
          message.push('%' + args.length);
        }
      }

      var input = {type: contentsBlock.type};
      // Dummy inputs don't have names.  Other inputs do.
      if (contentsBlock.type != 'input_dummy') {
        input.name = contentsBlock.getFieldValue('INPUTNAME');
      }
      var check = JSON.parse(
          FactoryUtils.getOptTypesFrom(contentsBlock, 'TYPE') || 'null');
      if (check) {
        input.check = check;
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        input.align = align;
      }
      args.push(input);
      message.push('%' + args.length);
      lastInput = contentsBlock;
    }
    contentsBlock = contentsBlock.nextConnection &&
        contentsBlock.nextConnection.targetBlock();
  }
  // Remove last input if dummy and not empty.
  if (lastInput && lastInput.type == 'input_dummy') {
    var fields = lastInput.getInputTargetBlock('FIELDS');
    if (fields && FactoryUtils.getFieldsJson_(fields).join('').trim() != '') {
      var align = lastInput.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        JS.lastDummyAlign0 = align;
      }
      args.pop();
      message.pop();
    }
  }
  JS.message0 = message.join(' ');
  if (args.length) {
    JS.args0 = args;
  }
  // Generate inline/external switch.
  if (rootBlock.getFieldValue('INLINE') == 'EXT') {
    JS.inputsInline = false;
  } else if (rootBlock.getFieldValue('INLINE') == 'INT') {
    JS.inputsInline = true;
  }
  // Generate output, or next/previous connections.
  switch (rootBlock.getFieldValue('CONNECTIONS')) {
    case 'LEFT':
      JS.output =
          JSON.parse(
              FactoryUtils.getOptTypesFrom(rootBlock, 'OUTPUTTYPE') || 'null');
      break;
    case 'BOTH':
      JS.previousStatement =
          JSON.parse(
              FactoryUtils.getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      JS.nextStatement =
          JSON.parse(
              FactoryUtils.getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
    case 'TOP':
      JS.previousStatement =
          JSON.parse(
              FactoryUtils.getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      break;
    case 'BOTTOM':
      JS.nextStatement =
          JSON.parse(
              FactoryUtils.getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
  }
  // Generate colour.
  var colourBlock = rootBlock.getInputTargetBlock('COLOUR');
  if (colourBlock && !colourBlock.disabled) {
    var hue = parseInt(colourBlock.getFieldValue('HUE'), 10);
    JS.colour = hue;
  }
  JS.tooltip = '';
  JS.helpUrl = 'http://www.example.com/';
  return JSON.stringify(JS, null, '  ');
};

/**
 * Update the language code as JavaScript.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @param {!Blockly.Workspace} workspace Where the root block lives.
 * @return {string} Generated language code.
 * @private
 */
FactoryUtils.formatJavaScript_ = function(blockType, rootBlock, workspace) {
  var code = [];
  code.push("Blockly.Blocks['" + blockType + "'] = {");
  code.push("  init: function() {");
  // Generate inputs.
  var TYPES = {'input_value': 'appendValueInput',
               'input_statement': 'appendStatementInput',
               'input_dummy': 'appendDummyInput'};
  var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
  while (contentsBlock) {
    if (!contentsBlock.disabled && !contentsBlock.getInheritedDisabled()) {
      var name = '';
      // Dummy inputs don't have names.  Other inputs do.
      if (contentsBlock.type != 'input_dummy') {
        name =
            FactoryUtils.escapeString(contentsBlock.getFieldValue('INPUTNAME'));
      }
      code.push('    this.' + TYPES[contentsBlock.type] + '(' + name + ')');
      var check = FactoryUtils.getOptTypesFrom(contentsBlock, 'TYPE');
      if (check) {
        code.push('        .setCheck(' + check + ')');
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        code.push('        .setAlign(Blockly.ALIGN_' + align + ')');
      }
      var fields = FactoryUtils.getFieldsJs_(
          contentsBlock.getInputTargetBlock('FIELDS'));
      for (var i = 0; i < fields.length; i++) {
        code.push('        .appendField(' + fields[i] + ')');
      }
      // Add semicolon to last line to finish the statement.
      code[code.length - 1] += ';';
    }
    contentsBlock = contentsBlock.nextConnection &&
        contentsBlock.nextConnection.targetBlock();
  }
  // Generate inline/external switch.
  if (rootBlock.getFieldValue('INLINE') == 'EXT') {
    code.push('    this.setInputsInline(false);');
  } else if (rootBlock.getFieldValue('INLINE') == 'INT') {
    code.push('    this.setInputsInline(true);');
  }
  // Generate output, or next/previous connections.
  switch (rootBlock.getFieldValue('CONNECTIONS')) {
    case 'LEFT':
      code.push(FactoryUtils.connectionLineJs_('setOutput', 'OUTPUTTYPE', workspace));
      break;
    case 'BOTH':
      code.push(
          FactoryUtils.connectionLineJs_('setPreviousStatement', 'TOPTYPE', workspace));
      code.push(
          FactoryUtils.connectionLineJs_('setNextStatement', 'BOTTOMTYPE', workspace));
      break;
    case 'TOP':
      code.push(
          FactoryUtils.connectionLineJs_('setPreviousStatement', 'TOPTYPE', workspace));
      break;
    case 'BOTTOM':
      code.push(
          FactoryUtils.connectionLineJs_('setNextStatement', 'BOTTOMTYPE', workspace));
      break;
  }
  // Generate colour.
  var colourBlock = rootBlock.getInputTargetBlock('COLOUR');
  if (colourBlock && !colourBlock.disabled) {
    var hue = parseInt(colourBlock.getFieldValue('HUE'), 10);
    if (!isNaN(hue)) {
      code.push('    this.setColour(' + hue + ');');
    }
  }
  code.push("    this.setTooltip('');");
  code.push("    this.setHelpUrl('http://www.example.com/');");
  code.push('  }');
  code.push('};');
  return code.join('\n');
};

/**
 * Create JS code required to create a top, bottom, or value connection.
 * @param {string} functionName JavaScript function name.
 * @param {string} typeName Name of type input.
 * @param {!Blockly.Workspace} workspace Where the root block lives.
 * @return {string} Line of JavaScript code to create connection.
 * @private
 */
FactoryUtils.connectionLineJs_ = function(functionName, typeName, workspace) {
  var type = FactoryUtils.getOptTypesFrom(
      FactoryUtils.getRootBlock(workspace), typeName);
  if (type) {
    type = ', ' + type;
  } else {
    type = '';
  }
  return '    this.' + functionName + '(true' + type + ');';
};

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string>} Field strings.
 * @private
 */
FactoryUtils.getFieldsJs_ = function(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(FactoryUtils.escapeString(block.getFieldValue('TEXT')));
          break;
        case 'field_input':
          // Result: new Blockly.FieldTextInput('Hello'), 'GREET'
          fields.push('new Blockly.FieldTextInput(' +
              FactoryUtils.escapeString(block.getFieldValue('TEXT')) + '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_number':
          // Result: new Blockly.FieldNumber(10, 0, 100, 1), 'NUMBER'
          var args = [
            Number(block.getFieldValue('VALUE')),
            Number(block.getFieldValue('MIN')),
            Number(block.getFieldValue('MAX')),
            Number(block.getFieldValue('PRECISION'))
          ];
          // Remove any trailing arguments that aren't needed.
          if (args[3] == 0) {
            args.pop();
            if (args[2] == Infinity) {
              args.pop();
              if (args[1] == -Infinity) {
                args.pop();
              }
            }
          }
          fields.push('new Blockly.FieldNumber(' + args.join(', ') + '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_angle':
          // Result: new Blockly.FieldAngle(90), 'ANGLE'
          fields.push('new Blockly.FieldAngle(' +
              parseFloat(block.getFieldValue('ANGLE')) + '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_checkbox':
          // Result: new Blockly.FieldCheckbox('TRUE'), 'CHECK'
          fields.push('new Blockly.FieldCheckbox(' +
              FactoryUtils.escapeString(block.getFieldValue('CHECKED')) +
               '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_colour':
          // Result: new Blockly.FieldColour('#ff0000'), 'COLOUR'
          fields.push('new Blockly.FieldColour(' +
              FactoryUtils.escapeString(block.getFieldValue('COLOUR')) +
              '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_date':
          // Result: new Blockly.FieldDate('2015-02-04'), 'DATE'
          fields.push('new Blockly.FieldDate(' +
              FactoryUtils.escapeString(block.getFieldValue('DATE')) + '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_variable':
          // Result: new Blockly.FieldVariable('item'), 'VAR'
          var varname
              = FactoryUtils.escapeString(block.getFieldValue('TEXT') || null);
          fields.push('new Blockly.FieldVariable(' + varname + '), ' +
              FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_dropdown':
          // Result:
          // new Blockly.FieldDropdown([['yes', '1'], ['no', '0']]), 'TOGGLE'
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = '[' +
                FactoryUtils.escapeString(block.getFieldValue('USER' + i)) +
                ', ' +
                FactoryUtils.escapeString(block.getFieldValue('CPU' + i)) + ']';
          }
          if (options.length) {
            fields.push('new Blockly.FieldDropdown([' +
                options.join(', ') + ']), ' +
                FactoryUtils.escapeString(block.getFieldValue('FIELDNAME')));
          }
          break;
        case 'field_image':
          // Result: new Blockly.FieldImage('http://...', 80, 60)
          var src = FactoryUtils.escapeString(block.getFieldValue('SRC'));
          var width = Number(block.getFieldValue('WIDTH'));
          var height = Number(block.getFieldValue('HEIGHT'));
          var alt = FactoryUtils.escapeString(block.getFieldValue('ALT'));
          fields.push('new Blockly.FieldImage(' +
              src + ', ' + width + ', ' + height + ', ' + alt + ')');
          break;
      }
    }
    block = block.nextConnection && block.nextConnection.targetBlock();
  }
  return fields;
};

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string|!Object>} Array of static text and field configs.
 * @private
 */
FactoryUtils.getFieldsJson_ = function(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(block.getFieldValue('TEXT'));
          break;
        case 'field_input':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            text: block.getFieldValue('TEXT')
          });
          break;
        case 'field_number':
          var obj = {
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            value: parseFloat(block.getFieldValue('VALUE'))
          };
          var min = parseFloat(block.getFieldValue('MIN'));
          if (min > -Infinity) {
            obj.min = min;
          }
          var max = parseFloat(block.getFieldValue('MAX'));
          if (max < Infinity) {
            obj.max = max;
          }
          var precision = parseFloat(block.getFieldValue('PRECISION'));
          if (precision) {
            obj.precision = precision;
          }
          fields.push(obj);
          break;
        case 'field_angle':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            angle: Number(block.getFieldValue('ANGLE'))
          });
          break;
        case 'field_checkbox':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            checked: block.getFieldValue('CHECKED') == 'TRUE'
          });
          break;
        case 'field_colour':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            colour: block.getFieldValue('COLOUR')
          });
          break;
        case 'field_date':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            date: block.getFieldValue('DATE')
          });
          break;
        case 'field_variable':
          fields.push({
            type: block.type,
            name: block.getFieldValue('FIELDNAME'),
            variable: block.getFieldValue('TEXT') || null
          });
          break;
        case 'field_dropdown':
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = [block.getFieldValue('USER' + i),
                block.getFieldValue('CPU' + i)];
          }
          if (options.length) {
            fields.push({
              type: block.type,
              name: block.getFieldValue('FIELDNAME'),
              options: options
            });
          }
          break;
        case 'field_image':
          fields.push({
            type: block.type,
            src: block.getFieldValue('SRC'),
            width: Number(block.getFieldValue('WIDTH')),
            height: Number(block.getFieldValue('HEIGHT')),
            alt: block.getFieldValue('ALT')
          });
          break;
      }
    }
    block = block.nextConnection && block.nextConnection.targetBlock();
  }
  return fields;
};

/**
 * Fetch the type(s) defined in the given input.
 * Format as a string for appending to the generated code.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {?string} String defining the types.
 */
FactoryUtils.getOptTypesFrom = function(block, name) {
  var types = FactoryUtils.getTypesFrom_(block, name);
  if (types.length == 0) {
    return undefined;
  } else if (types.indexOf('null') != -1) {
    return 'null';
  } else if (types.length == 1) {
    return types[0];
  } else {
    return '[' + types.join(', ') + ']';
  }
};


/**
 * Fetch the type(s) defined in the given input.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {!Array.<string>} List of types.
 * @private
 */
FactoryUtils.getTypesFrom_ = function(block, name) {
  var typeBlock = block.getInputTargetBlock(name);
  var types;
  if (!typeBlock || typeBlock.disabled) {
    types = [];
  } else if (typeBlock.type == 'type_other') {
    types = [FactoryUtils.escapeString(typeBlock.getFieldValue('TYPE'))];
  } else if (typeBlock.type == 'type_group') {
    types = [];
    for (var n = 0; n < typeBlock.typeCount_; n++) {
      types = types.concat(FactoryUtils.getTypesFrom_(typeBlock, 'TYPE' + n));
    }
    // Remove duplicates.
    var hash = Object.create(null);
    for (var n = types.length - 1; n >= 0; n--) {
      if (hash[types[n]]) {
        types.splice(n, 1);
      }
      hash[types[n]] = true;
    }
  } else {
    types = [FactoryUtils.escapeString(typeBlock.valueType)];
  }
  return types;
};

/**
 * Escape a string.
 * @param {string} string String to escape.
 * @return {string} Escaped string surrouned by quotes.
 */
FactoryUtils.escapeString = function(string) {
  return JSON.stringify(string);
};

/**
 * Return the uneditable container block that everything else attaches to in
 * given workspace.
 * @param {!Blockly.Workspace} workspace Where the root block lives.
 * @return {Blockly.Block} Root block.
 */
FactoryUtils.getRootBlock = function(workspace) {
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'factory_base') {
      return block;
    }
  }
  return null;
};

// TODO(quachtina96): Move hide, show, makeInvisible, and makeVisible to a new
// AppView namespace.

/**
 * Hides element so that it's invisible and doesn't take up space.
 * @param {string} elementID ID of element to hide.
 */
FactoryUtils.hide = function(elementID) {
  document.getElementById(elementID).style.display = 'none';
};

/**
 * Un-hides an element.
 * @param {string} elementID ID of element to hide.
 */
FactoryUtils.show = function(elementID) {
  document.getElementById(elementID).style.display = 'block';
};

/**
 * Hides element so that it's invisible but still takes up space.
 * @param {string} elementID ID of element to hide.
 */
FactoryUtils.makeInvisible = function(elementID) {
  document.getElementById(elementID).visibility = 'hidden';
};

/**
 * Makes element visible.
 * @param {string} elementID ID of element to hide.
 */
FactoryUtils.makeVisible = function(elementID) {
  document.getElementById(elementID).visibility = 'visible';
};

/**
 * Create a file with the given attributes and download it.
 * @param {string} contents The contents of the file.
 * @param {string} filename The name of the file to save to.
 * @param {string} fileType The type of the file to save.
 */
FactoryUtils.createAndDownloadFile = function(contents, filename, fileType) {
  var data = new Blob([contents], {type: 'text/' + fileType});
  var clickEvent = new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": false
  });

  var a = document.createElement('a');
  a.href = window.URL.createObjectURL(data);
  a.download = filename;
  a.textContent = 'Download file!';
  a.dispatchEvent(clickEvent);
};

/**
 * Get Blockly Block by rendering pre-defined block in workspace.
 * @param {!Element} blockType Type of block that has already been defined.
 * @param {!Blockly.Workspace} workspace Workspace on which to render
 *    the block.
 * @return {!Blockly.Block} The Blockly.Block of desired type.
 */
FactoryUtils.getDefinedBlock = function(blockType, workspace) {
  workspace.clear();
  return workspace.newBlock(blockType);
};

/**
 * Parses a block definition get the type of the block it defines.
 * @param {string} blockDef A single block definition.
 * @return {string} Type of block defined by the given definition.
 */
FactoryUtils.getBlockTypeFromJsDefinition = function(blockDef) {
  var indexOfStartBracket = blockDef.indexOf('[\'');
  var indexOfEndBracket = blockDef.indexOf('\']');
  if (indexOfStartBracket != -1 && indexOfEndBracket != -1) {
    return blockDef.substring(indexOfStartBracket + 2, indexOfEndBracket);
  } else {
    throw new Error ('Could not parse block type out of JavaScript block ' +
        'definition. Brackets normally enclosing block type not found.');
  }
};

/**
 * Generates a category containing blocks of the specified block types.
 * @param {!Array.<!Blockly.Block>} blocks Blocks to include in the category.
 * @param {string} categoryName Name to use for the generated category.
 * @return {!Element} Category XML containing the given block types.
 */
FactoryUtils.generateCategoryXml = function(blocks, categoryName) {
  // Create category DOM element.
  var categoryElement = goog.dom.createDom('category');
  categoryElement.setAttribute('name', categoryName);

  // For each block, add block element to category.
  for (var i = 0, block; block = blocks[i]; i++) {

    // Get preview block XML.
    var blockXml = Blockly.Xml.blockToDom(block);
    blockXml.removeAttribute('id');

    // Add block to category and category to XML.
    categoryElement.appendChild(blockXml);
  }
  return categoryElement;
};

/**
 * Parses a string containing JavaScript block definition(s) to create an array
 * in which each element is a single block definition.
 * @param {string} blockDefsString JavaScript block definition(s).
 * @return {!Array.<string>} Array of block definitions.
 */
FactoryUtils.parseJsBlockDefinitions = function(blockDefsString) {
  var blockDefArray = [];
  var defStart = blockDefsString.indexOf('Blockly.Blocks');

  while (blockDefsString.indexOf('Blockly.Blocks', defStart) != -1) {
    var nextStart = blockDefsString.indexOf('Blockly.Blocks', defStart + 1);
    if (nextStart == -1) {
      // This is the last block definition.
      nextStart = blockDefsString.length;
    }
    var blockDef = blockDefsString.substring(defStart, nextStart);
    blockDefArray.push(blockDef);
    defStart = nextStart;
  }
  return blockDefArray;
};

/**
 * Parses a string containing JSON block definition(s) to create an array
 * in which each element is a single block definition. Expected input is
 * one or more block definitions in the form of concatenated, stringified
 * JSON objects.
 * @param {string} blockDefsString String containing JSON block
 *    definition(s).
 * @return {!Array.<string>} Array of block definitions.
 */
FactoryUtils.parseJsonBlockDefinitions = function(blockDefsString) {
  var blockDefArray = [];
  var unbalancedBracketCount = 0;
  var defStart = 0;
  // Iterate through the blockDefs string. Keep track of whether brackets
  // are balanced.
  for (var i = 0; i < blockDefsString.length; i++) {
    var currentChar = blockDefsString[i];
    if (currentChar == '{') {
      unbalancedBracketCount++;
    }
    else if (currentChar == '}') {
      unbalancedBracketCount--;
      if (unbalancedBracketCount == 0 && i > 0) {
        // The brackets are balanced. We've got a complete block defintion.
        var blockDef = blockDefsString.substring(defStart, i + 1);
        blockDefArray.push(blockDef);
        defStart = i + 1;
      }
    }
  }
  return blockDefArray;
};

/**
 * Define blocks from imported block definitions.
 * @param {string} blockDefsString Block definition(s).
 * @param {string} format Block definition format ('JSON' or 'JavaScript').
 * @return {!Array.<!Element>} Array of block types defined.
 */
FactoryUtils.defineAndGetBlockTypes = function(blockDefsString, format) {
  var blockTypes = [];

  // Define blocks and get block types.
  if (format == 'JSON') {
    var blockDefArray = FactoryUtils.parseJsonBlockDefinitions(blockDefsString);

    // Populate array of blocktypes and define each block.
    for (var i = 0, blockDef; blockDef = blockDefArray[i]; i++) {
      var json = JSON.parse(blockDef);
      blockTypes.push(json.type);

      // Define the block.
      Blockly.Blocks[json.type] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    }
  } else if (format == 'JavaScript') {
    var blockDefArray = FactoryUtils.parseJsBlockDefinitions(blockDefsString);

    // Populate array of block types.
    for (var i = 0, blockDef; blockDef = blockDefArray[i]; i++) {
      var blockType = FactoryUtils.getBlockTypeFromJsDefinition(blockDef);
      blockTypes.push(blockType);
    }

    // Define all blocks.
    eval(blockDefsString);
  }

  return blockTypes;
};

/**
 * Inject code into a pre tag, with syntax highlighting.
 * Safe from HTML/script injection.
 * @param {string} code Lines of code.
 * @param {string} id ID of <pre> element to inject into.
 */
FactoryUtils.injectCode = function(code, id) {
  var pre = document.getElementById(id);
  pre.textContent = code;
  code = pre.textContent;
  code = prettyPrintOne(code, 'js');
  pre.innerHTML = code;
};

/**
 * Returns whether or not two blocks are the same based on their XML. Expects
 * XML with a single child node that is a factory_base block, the XML found on
 * Block Factory's main workspace.
 * @param {!Element} blockXml1 An XML element with a single child node that
 *    is a factory_base block.
 * @param {!Element} blockXml2 An XML element with a single child node that
 *    is a factory_base block.
 * @return {boolean} Whether or not two blocks are the same based on their XML.
 */
FactoryUtils.sameBlockXml = function(blockXml1, blockXml2) {
  // Each XML element should contain a single child element with a 'block' tag
  if (blockXml1.tagName.toLowerCase() != 'xml' ||
      blockXml2.tagName.toLowerCase() != 'xml') {
    throw new Error('Expected two XML elements, recieved elements with tag ' +
        'names: ' + blockXml1.tagName + ' and ' + blockXml2.tagName + '.');
  }

  // Compare the block elements directly. The XML tags may include other meta
  // information we want to igrore.
  var blockElement1 = blockXml1.getElementsByTagName('block')[0];
  var blockElement2 = blockXml2.getElementsByTagName('block')[0];

  if (!(blockElement1 && blockElement2)) {
    throw new Error('Could not get find block element in XML.');
  }

  var blockXmlText1 = Blockly.Xml.domToText(blockElement1);
  var blockXmlText2 = Blockly.Xml.domToText(blockElement2);

  // Strip white space.
  blockXmlText1 = blockXmlText1.replace(/\s+/g, '');
  blockXmlText2 = blockXmlText2.replace(/\s+/g, '');

  // Return whether or not changes have been saved.
  return blockXmlText1 == blockXmlText2;
};

/*
 * Checks if a block has a variable field. Blocks with variable fields cannot
 * be shadow blocks.
 * @param {Blockly.Block} block The block to check if a variable field exists.
 * @return {boolean} True if the block has a variable field, false otherwise.
 */
FactoryUtils.hasVariableField = function(block) {
  if (!block) {
    return false;
  }
  return block.getVars().length > 0;
};

/**
 * Checks if a block is a procedures block. If procedures block names are
 * ever updated or expanded, this function should be updated as well (no
 * other known markers for procedure blocks beyond name).
 * @param {Blockly.Block} block The block to check.
 * @return {boolean} True if the block is a procedure block, false otherwise.
 */
FactoryUtils.isProcedureBlock = function(block) {
  return block &&
      (block.type == 'procedures_defnoreturn' ||
      block.type == 'procedures_defreturn' ||
      block.type == 'procedures_callnoreturn' ||
      block.type == 'procedures_callreturn' ||
      block.type == 'procedures_ifreturn');
};

/**
 * Returns whether or not a modified block's changes has been saved to the
 * Block Library.
 * TODO(quachtina96): move into the Block Factory Controller once made.
 * @param {!BlockLibraryController} blockLibraryController Block Library
 *    Controller storing custom blocks.
 * @return {boolean} True if all changes made to the block have been saved to
 *    the given Block Library.
 */
FactoryUtils.savedBlockChanges = function(blockLibraryController) {
  if (BlockFactory.isStarterBlock()) {
    return true;
  }
  var blockType = blockLibraryController.getCurrentBlockType();
  var currentXml = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);

  if (blockLibraryController.has(blockType)) {
    // Block is saved in block library.
    var savedXml = blockLibraryController.getBlockXml(blockType);
    return FactoryUtils.sameBlockXml(savedXml, currentXml);
  }
  return false;
};
