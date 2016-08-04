/**
 * Blockly Demos: Block Factory
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
 * @fileoverview JavaScript for Blockly's Block Factory application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Namespace for Block Factory.
 */
goog.provide('BlockFactory');

goog.require('goog.dom.classes');

/**
 * Workspace for user to build block.
 * @type {Blockly.Workspace}
 */
BlockFactory.mainWorkspace = null;

/**
 * Workspace for preview of block.
 * @type {Blockly.Workspace}
 */
BlockFactory.previewWorkspace = null;

/**
 * Name of block if not named.
 */
BlockFactory.UNNAMED = 'unnamed';

/**
 * Existing direction ('ltr' vs 'rtl') of preview.
 */
BlockFactory.oldDir = null;

// UI

/**
 * Inject code into a pre tag, with syntax highlighting.
 * Safe from HTML/script injection.
 * @param {string} code Lines of code.
 * @param {string} id ID of <pre> element to inject into.
 */
BlockFactory.injectCode = function(code, id) {
  var pre = document.getElementById(id);
  pre.textContent = code;
  code = pre.innerHTML;
  code = prettyPrintOne(code, 'js');
  pre.innerHTML = code;
};

// Utils

/**
 * Escape a string.
 * @param {string} string String to escape.
 * @return {string} Escaped string surrouned by quotes.
 */
BlockFactory.escapeString = function(string) {
  return JSON.stringify(string);
};

/**
 * Return the uneditable container block that everything else attaches to in
 * given workspace
 *
 * @param {!Blockly.Workspace} workspace - where the root block lives
 * @return {Blockly.Block} root block
 */
BlockFactory.getRootBlock = function(workspace) {
  var blocks = workspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'factory_base') {
      return block;
    }
  }
  return null;
};

// Language Code: Block Definitions

/**
 * Change the language code format.
 */
BlockFactory.formatChange = function() {
  var mask = document.getElementById('blocklyMask');
  var languagePre = document.getElementById('languagePre');
  var languageTA = document.getElementById('languageTA');
  if (document.getElementById('format').value == 'Manual') {
    Blockly.hideChaff();
    mask.style.display = 'block';
    languagePre.style.display = 'none';
    languageTA.style.display = 'block';
    var code = languagePre.textContent.trim();
    languageTA.value = code;
    languageTA.focus();
    BlockFactory.updatePreview();
  } else {
    mask.style.display = 'none';
    languageTA.style.display = 'none';
    languagePre.style.display = 'block';
    BlockFactory.updateLanguage();
  }
  BlockFactory.disableEnableLink();
};

/**
 * Get block definition code for the current block.
 *
 * @param {string} blockType - Type of block.
 * @param {!Blockly.Block} rootBlock - RootBlock from main workspace in which
 *    user uses Block Factory Blocks to create a custom block.
 * @param {string} format - 'JSON' or 'JavaScript'.
 * @param {!Blockly.Workspace} workspace - Where the root block lives.
 * @return {string} Block definition.
 */
BlockFactory.getBlockDefinition = function(blockType, rootBlock, format, workspace) {
  blockType = blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
  switch (format) {
    case 'JSON':
      var code = BlockFactory.formatJson_(blockType, rootBlock);
      break;
    case 'JavaScript':
      var code = BlockFactory.formatJavaScript_(blockType, rootBlock, workspace);
      break;
  }
  return code;
};

/**
 * Update the language code based on constructs made in Blockly.
 */
BlockFactory.updateLanguage = function() {
  var rootBlock = BlockFactory.getRootBlock(BlockFactory.mainWorkspace);
  if (!rootBlock) {
    return;
  }
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  if (!blockType) {
    blockType = BlockFactory.UNNAMED;
  }
  var format = document.getElementById('format').value;
  var code = BlockFactory.getBlockDefinition(blockType, rootBlock, format,
      BlockFactory.mainWorkspace);
  BlockFactory.injectCode(code, 'languagePre');
  BlockFactory.updatePreview();
};

/**
 * Update the language code as JSON.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
BlockFactory.formatJson_ = function(blockType, rootBlock) {
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
      var fields = BlockFactory.getFieldsJson_(
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
          BlockFactory.getOptTypesFrom(contentsBlock, 'TYPE') || 'null');
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
    if (fields && BlockFactory.getFieldsJson_(fields).join('').trim() != '') {
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
              BlockFactory.getOptTypesFrom(rootBlock, 'OUTPUTTYPE') || 'null');
      break;
    case 'BOTH':
      JS.previousStatement =
          JSON.parse(
              BlockFactory.getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      JS.nextStatement =
          JSON.parse(
              BlockFactory.getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
    case 'TOP':
      JS.previousStatement =
          JSON.parse(
              BlockFactory.getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      break;
    case 'BOTTOM':
      JS.nextStatement =
          JSON.parse(
              BlockFactory.getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
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
 * @param {!Blockly.Workspace} workspace - Where the root block lives.

 * @return {string} Generated language code.
 * @private
 */
BlockFactory.formatJavaScript_ = function(blockType, rootBlock, workspace) {
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
            BlockFactory.escapeString(contentsBlock.getFieldValue('INPUTNAME'));
      }
      code.push('    this.' + TYPES[contentsBlock.type] + '(' + name + ')');
      var check = BlockFactory.getOptTypesFrom(contentsBlock, 'TYPE');
      if (check) {
        code.push('        .setCheck(' + check + ')');
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        code.push('        .setAlign(Blockly.ALIGN_' + align + ')');
      }
      var fields = BlockFactory.getFieldsJs_(
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
      code.push(BlockFactory.connectionLineJs_('setOutput', 'OUTPUTTYPE', workspace));
      break;
    case 'BOTH':
      code.push(
          BlockFactory.connectionLineJs_('setPreviousStatement', 'TOPTYPE', workspace));
      code.push(
          BlockFactory.connectionLineJs_('setNextStatement', 'BOTTOMTYPE', workspace));
      break;
    case 'TOP':
      code.push(
          BlockFactory.connectionLineJs_('setPreviousStatement', 'TOPTYPE', workspace));
      break;
    case 'BOTTOM':
      code.push(
          BlockFactory.connectionLineJs_('setNextStatement', 'BOTTOMTYPE', workspace));
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
 * @param {!Blockly.Workspace} workspace - Where the root block lives.
 * @return {string} Line of JavaScript code to create connection.
 * @private
 */
BlockFactory.connectionLineJs_ = function(functionName, typeName, workspace) {
  var type = BlockFactory.getOptTypesFrom(
      BlockFactory.getRootBlock(workspace), typeName);
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
BlockFactory.getFieldsJs_ = function(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(BlockFactory.escapeString(block.getFieldValue('TEXT')));
          break;
        case 'field_input':
          // Result: new Blockly.FieldTextInput('Hello'), 'GREET'
          fields.push('new Blockly.FieldTextInput(' +
              BlockFactory.escapeString(block.getFieldValue('TEXT')) + '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_angle':
          // Result: new Blockly.FieldAngle(90), 'ANGLE'
          fields.push('new Blockly.FieldAngle(' +
              parseFloat(block.getFieldValue('ANGLE')) + '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_checkbox':
          // Result: new Blockly.FieldCheckbox('TRUE'), 'CHECK'
          fields.push('new Blockly.FieldCheckbox(' +
              BlockFactory.escapeString(block.getFieldValue('CHECKED')) +
               '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_colour':
          // Result: new Blockly.FieldColour('#ff0000'), 'COLOUR'
          fields.push('new Blockly.FieldColour(' +
              BlockFactory.escapeString(block.getFieldValue('COLOUR')) +
              '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_date':
          // Result: new Blockly.FieldDate('2015-02-04'), 'DATE'
          fields.push('new Blockly.FieldDate(' +
              BlockFactory.escapeString(block.getFieldValue('DATE')) + '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_variable':
          // Result: new Blockly.FieldVariable('item'), 'VAR'
          var varname
              = BlockFactory.escapeString(block.getFieldValue('TEXT') || null);
          fields.push('new Blockly.FieldVariable(' + varname + '), ' +
              BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_dropdown':
          // Result:
          // new Blockly.FieldDropdown([['yes', '1'], ['no', '0']]), 'TOGGLE'
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = '[' +
                BlockFactory.escapeString(block.getFieldValue('USER' + i)) +
                ', ' +
                BlockFactory.escapeString(block.getFieldValue('CPU' + i)) + ']';
          }
          if (options.length) {
            fields.push('new Blockly.FieldDropdown([' +
                options.join(', ') + ']), ' +
                BlockFactory.escapeString(block.getFieldValue('FIELDNAME')));
          }
          break;
        case 'field_image':
          // Result: new Blockly.FieldImage('http://...', 80, 60)
          var src = BlockFactory.escapeString(block.getFieldValue('SRC'));
          var width = Number(block.getFieldValue('WIDTH'));
          var height = Number(block.getFieldValue('HEIGHT'));
          var alt = BlockFactory.escapeString(block.getFieldValue('ALT'));
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
BlockFactory.getFieldsJson_ = function(block) {
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
BlockFactory.getOptTypesFrom = function(block, name) {
  var types = BlockFactory.getTypesFrom_(block, name);
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
BlockFactory.getTypesFrom_ = function(block, name) {
  var typeBlock = block.getInputTargetBlock(name);
  var types;
  if (!typeBlock || typeBlock.disabled) {
    types = [];
  } else if (typeBlock.type == 'type_other') {
    types = [BlockFactory.escapeString(typeBlock.getFieldValue('TYPE'))];
  } else if (typeBlock.type == 'type_group') {
    types = [];
    for (var n = 0; n < typeBlock.typeCount_; n++) {
      types = types.concat(BlockFactory.getTypesFrom_(typeBlock, 'TYPE' + n));
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
    types = [BlockFactory.escapeString(typeBlock.valueType)];
  }
  return types;
};

// Generator Code

/**
 * Get the generator code for a given block.
 *
 * @param {!Blockly.Block} block - Rendered block in preview workspace.
 * @param {string} generatorLanguage - 'JavaScript', 'Python', 'PHP', 'Lua',
 *     'Dart'.
 * @return {string} Generator code for multiple blocks.
 */
BlockFactory.getGeneratorStub = function(block, generatorLanguage) {
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
 * Update the generator code.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 */
BlockFactory.updateGenerator = function(block) {
  var language = document.getElementById('language').value;
  var generatorStub = BlockFactory.getGeneratorStub(block, language);
  BlockFactory.injectCode(generatorStub, 'generatorPre');
};

// Preview Block

/**
 * Update the preview display.
 */
BlockFactory.updatePreview = function() {
  // Toggle between LTR/RTL if needed (also used in first display).
  var newDir = document.getElementById('direction').value;
  if (BlockFactory.oldDir != newDir) {
    if (BlockFactory.previewWorkspace) {
      BlockFactory.previewWorkspace.dispose();
    }
    var rtl = newDir == 'rtl';
    BlockFactory.previewWorkspace = Blockly.inject('preview',
        {rtl: rtl,
         media: '../../media/',
         scrollbars: true});
    BlockFactory.oldDir = newDir;
  }
  BlockFactory.previewWorkspace.clear();

  // Fetch the code and determine its format (JSON or JavaScript).
  var format = document.getElementById('format').value;
  if (format == 'Manual') {
    var code = document.getElementById('languageTA').value;
    // If the code is JSON, it will parse, otherwise treat as JS.
    try {
      JSON.parse(code);
      format = 'JSON';
    } catch (e) {
      format = 'JavaScript';
    }
  } else {
    var code = document.getElementById('languagePre').textContent;
  }
  if (!code.trim()) {
    // Nothing to render.  Happens while cloud storage is loading.
    return;
  }

  // Backup Blockly.Blocks object so that main workspace and preview don't
  // collide if user creates a 'factory_base' block, for instance.
  var backupBlocks = Blockly.Blocks;
  try {
    // Make a shallow copy.
    Blockly.Blocks = {};
    for (var prop in backupBlocks) {
      Blockly.Blocks[prop] = backupBlocks[prop];
    }

    if (format == 'JSON') {
      var json = JSON.parse(code);
      Blockly.Blocks[json.id || BlockFactory.UNNAMED] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    } else if (format == 'JavaScript') {
      eval(code);
    } else {
      throw 'Unknown format: ' + format;
    }

    // Look for a block on Blockly.Blocks that does not match the backup.
    var blockType = null;
    for (var type in Blockly.Blocks) {
      if (typeof Blockly.Blocks[type].init == 'function' &&
          Blockly.Blocks[type] != backupBlocks[type]) {
        blockType = type;
        break;
      }
    }
    if (!blockType) {
      return;
    }

    // Create the preview block.
    var previewBlock = BlockFactory.previewWorkspace.newBlock(blockType);
    previewBlock.initSvg();
    previewBlock.render();
    previewBlock.setMovable(false);
    previewBlock.setDeletable(false);
    previewBlock.moveBy(15, 10);
    BlockFactory.previewWorkspace.clearUndo();
    BlockFactory.updateGenerator(previewBlock);
  } finally {
    Blockly.Blocks = backupBlocks;
  }
};

// File Import, Creation, Download

/**
 * Generate a file from the contents of a given text area and
 * download that file.
 * @param {string} filename The name of the file to create.
 * @param {string} id The text area to download.
*/
BlockFactory.downloadTextArea = function(filename, id) {
  var code = document.getElementById(id).textContent;
  BlockFactory.createAndDownloadFile_(code, filename, 'plain');
};

/**
 * Create a file with the given attributes and download it.
 * @param {string} contents - The contents of the file.
 * @param {string} filename - The name of the file to save to.
 * @param {string} fileType - The type of the file to save.
 * @private
 */
BlockFactory.createAndDownloadFile_ = function(contents, filename, fileType) {
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
 * Save the workspace's xml representation to a file.
 * @private
 */
BlockFactory.saveWorkspaceToFile = function() {
  var xmlElement = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);
  var prettyXml = Blockly.Xml.domToPrettyText(xmlElement);
  BlockFactory.createAndDownloadFile_(prettyXml, 'blockXml', 'xml');
};

/**
 * Imports xml file for a block to the workspace.
 */
BlockFactory.importBlockFromFile = function() {
  var files = document.getElementById('files');
  // If the file list is empty, they user likely canceled in the dialog.
  if (files.files.length > 0) {
    // The input tag doesn't have the "mulitple" attribute
    // so the user can only choose 1 file.
    var file = files.files[0];
    var fileReader = new FileReader();
    fileReader.addEventListener('load', function(event) {
      var fileContents = event.target.result;
      var xml = '';
      try {
        xml = Blockly.Xml.textToDom(fileContents);
      } catch (e) {
        var message = 'Could not load your saved file.\n'+
          'Perhaps it was created with a different version of Blockly?';
        window.alert(message + '\nXML: ' + fileContents);
        return;
      }
      BlockFactory.mainWorkspace.clear();
      Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
    });

    fileReader.readAsText(file);
  }
};

/**
 * Disable link and save buttons if the format is 'Manual', enable otherwise.
 */
BlockFactory.disableEnableLink = function() {
  var linkButton = document.getElementById('linkButton');
  var saveBlockButton = document.getElementById('localSaveButton');
  var saveToLibButton = document.getElementById('saveToBlockLibraryButton');
  var disabled = document.getElementById('format').value == 'Manual';
  linkButton.disabled = disabled;
  saveBlockButton.disabled = disabled;
  saveToLibButton.disabled = disabled;
};

// Block Factory Expansion View Utils

/**
 * Render starter block (math_foo).
 */
 BlockFactory.showStarterBlock = function() {
    var xml = '<xml><block type="factory_base" deletable="false" ' +
        'movable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(xml), BlockFactory.mainWorkspace);
};

/**
 * Hides element so that it's invisible and doesn't take up space.
 *
 * @param {string} elementID - ID of element to hide.
 */
BlockFactory.hide = function(elementID) {
  document.getElementById(elementID).style.display = 'none';
};

/**
 * Un-hides an element.
 *
 * @param {string} elementID - ID of element to hide.
 */
BlockFactory.show = function(elementID) {
  document.getElementById(elementID).style.display = 'block';
};

/**
 * Hides element so that it's invisible but still takes up space.
 *
 * @param {string} elementID - ID of element to hide.
 */
BlockFactory.makeInvisible = function(elementID) {
  document.getElementById(elementID).visibility = 'hidden';
};

/**
 * Makes element visible.
 *
 * @param {string} elementID - ID of element to hide.
 */
BlockFactory.makeVisible = function(elementID) {
  document.getElementById(elementID).visibility = 'visible';
};

