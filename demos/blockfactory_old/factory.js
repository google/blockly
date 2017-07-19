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
 * Workspace for user to build block.
 * @type {Blockly.Workspace}
 */
var mainWorkspace = null;

/**
 * Workspace for preview of block.
 * @type {Blockly.Workspace}
 */
var previewWorkspace = null;

/**
 * Name of block if not named.
 */
var UNNAMED = 'unnamed';

/**
 * Change the language code format.
 */
function formatChange() {
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
    updatePreview();
  } else {
    mask.style.display = 'none';
    languageTA.style.display = 'none';
    languagePre.style.display = 'block';
    updateLanguage();
  }
  disableEnableLink();
}

/**
 * Update the language code based on constructs made in Blockly.
 */
function updateLanguage() {
  var rootBlock = getRootBlock();
  if (!rootBlock) {
    return;
  }
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  if (!blockType) {
    blockType = UNNAMED;
  }
  blockType = blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
  switch (document.getElementById('format').value) {
    case 'JSON':
      var code = formatJson_(blockType, rootBlock);
      break;
    case 'JavaScript':
      var code = formatJavaScript_(blockType, rootBlock);
      break;
  }
  injectCode(code, 'languagePre');
  updatePreview();
}

/**
 * Update the language code as JSON.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
function formatJson_(blockType, rootBlock) {
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
      var fields = getFieldsJson_(contentsBlock.getInputTargetBlock('FIELDS'));
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
      var check = JSON.parse(getOptTypesFrom(contentsBlock, 'TYPE') || 'null');
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
    if (fields && getFieldsJson_(fields).join('').trim() != '') {
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
          JSON.parse(getOptTypesFrom(rootBlock, 'OUTPUTTYPE') || 'null');
      break;
    case 'BOTH':
      JS.previousStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      JS.nextStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
      break;
    case 'TOP':
      JS.previousStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'TOPTYPE') || 'null');
      break;
    case 'BOTTOM':
      JS.nextStatement =
          JSON.parse(getOptTypesFrom(rootBlock, 'BOTTOMTYPE') || 'null');
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
}

/**
 * Update the language code as JavaScript.
 * @param {string} blockType Name of block.
 * @param {!Blockly.Block} rootBlock Factory_base block.
 * @return {string} Generanted language code.
 * @private
 */
function formatJavaScript_(blockType, rootBlock) {
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
        name = escapeString(contentsBlock.getFieldValue('INPUTNAME'));
      }
      code.push('    this.' + TYPES[contentsBlock.type] + '(' + name + ')');
      var check = getOptTypesFrom(contentsBlock, 'TYPE');
      if (check) {
        code.push('        .setCheck(' + check + ')');
      }
      var align = contentsBlock.getFieldValue('ALIGN');
      if (align != 'LEFT') {
        code.push('        .setAlign(Blockly.ALIGN_' + align + ')');
      }
      var fields = getFieldsJs_(contentsBlock.getInputTargetBlock('FIELDS'));
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
      code.push(connectionLineJs_('setOutput', 'OUTPUTTYPE'));
      break;
    case 'BOTH':
      code.push(connectionLineJs_('setPreviousStatement', 'TOPTYPE'));
      code.push(connectionLineJs_('setNextStatement', 'BOTTOMTYPE'));
      break;
    case 'TOP':
      code.push(connectionLineJs_('setPreviousStatement', 'TOPTYPE'));
      break;
    case 'BOTTOM':
      code.push(connectionLineJs_('setNextStatement', 'BOTTOMTYPE'));
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
}

/**
 * Create JS code required to create a top, bottom, or value connection.
 * @param {string} functionName JavaScript function name.
 * @param {string} typeName Name of type input.
 * @return {string} Line of JavaScript code to create connection.
 * @private
 */
function connectionLineJs_(functionName, typeName) {
  var type = getOptTypesFrom(getRootBlock(), typeName);
  if (type) {
    type = ', ' + type;
  } else {
    type = '';
  }
  return '    this.' + functionName + '(true' + type + ');';
}

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string>} Field strings.
 * @private
 */
function getFieldsJs_(block) {
  var fields = [];
  while (block) {
    if (!block.disabled && !block.getInheritedDisabled()) {
      switch (block.type) {
        case 'field_static':
          // Result: 'hello'
          fields.push(escapeString(block.getFieldValue('TEXT')));
          break;
        case 'field_input':
          // Result: new Blockly.FieldTextInput('Hello'), 'GREET'
          fields.push('new Blockly.FieldTextInput(' +
              escapeString(block.getFieldValue('TEXT')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
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
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_angle':
          // Result: new Blockly.FieldAngle(90), 'ANGLE'
          fields.push('new Blockly.FieldAngle(' +
              Number(block.getFieldValue('ANGLE')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_checkbox':
          // Result: new Blockly.FieldCheckbox('TRUE'), 'CHECK'
          fields.push('new Blockly.FieldCheckbox(' +
              escapeString(block.getFieldValue('CHECKED')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_colour':
          // Result: new Blockly.FieldColour('#ff0000'), 'COLOUR'
          fields.push('new Blockly.FieldColour(' +
              escapeString(block.getFieldValue('COLOUR')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_date':
          // Result: new Blockly.FieldDate('2015-02-04'), 'DATE'
          fields.push('new Blockly.FieldDate(' +
              escapeString(block.getFieldValue('DATE')) + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_variable':
          // Result: new Blockly.FieldVariable('item'), 'VAR'
          var varname = escapeString(block.getFieldValue('TEXT') || null);
          fields.push('new Blockly.FieldVariable(' + varname + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_dropdown':
          // Result:
          // new Blockly.FieldDropdown([['yes', '1'], ['no', '0']]), 'TOGGLE'
          var options = [];
          for (var i = 0; i < block.optionCount_; i++) {
            options[i] = '[' + escapeString(block.getFieldValue('USER' + i)) +
                ', ' + escapeString(block.getFieldValue('CPU' + i)) + ']';
          }
          if (options.length) {
            fields.push('new Blockly.FieldDropdown([' +
                options.join(', ') + ']), ' +
                escapeString(block.getFieldValue('FIELDNAME')));
          }
          break;
        case 'field_image':
          // Result: new Blockly.FieldImage('http://...', 80, 60, '*')
          var src = escapeString(block.getFieldValue('SRC'));
          var width = Number(block.getFieldValue('WIDTH'));
          var height = Number(block.getFieldValue('HEIGHT'));
          var alt = escapeString(block.getFieldValue('ALT'));
          fields.push('new Blockly.FieldImage(' +
              src + ', ' + width + ', ' + height + ', ' + alt + ')');
          break;
      }
    }
    block = block.nextConnection && block.nextConnection.targetBlock();
  }
  return fields;
}

/**
 * Returns field strings and any config.
 * @param {!Blockly.Block} block Input block.
 * @return {!Array.<string|!Object>} Array of static text and field configs.
 * @private
 */
function getFieldsJson_(block) {
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
}

/**
 * Escape a string.
 * @param {string} string String to escape.
 * @return {string} Escaped string surrouned by quotes.
 */
function escapeString(string) {
  return JSON.stringify(string);
}

/**
 * Fetch the type(s) defined in the given input.
 * Format as a string for appending to the generated code.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {?string} String defining the types.
 */
function getOptTypesFrom(block, name) {
  var types = getTypesFrom_(block, name);
  if (types.length == 0) {
    return undefined;
  } else if (types.indexOf('null') != -1) {
    return 'null';
  } else if (types.length == 1) {
    return types[0];
  } else {
    return '[' + types.join(', ') + ']';
  }
}

/**
 * Fetch the type(s) defined in the given input.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {!Array.<string>} List of types.
 * @private
 */
function getTypesFrom_(block, name) {
  var typeBlock = block.getInputTargetBlock(name);
  var types;
  if (!typeBlock || typeBlock.disabled) {
    types = [];
  } else if (typeBlock.type == 'type_other') {
    types = [escapeString(typeBlock.getFieldValue('TYPE'))];
  } else if (typeBlock.type == 'type_group') {
    types = [];
    for (var i = 0; i < typeBlock.typeCount_; i++) {
      types = types.concat(getTypesFrom_(typeBlock, 'TYPE' + i));
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
    types = [escapeString(typeBlock.valueType)];
  }
  return types;
}

/**
 * Update the generator code.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 */
function updateGenerator(block) {
  function makeVar(root, name) {
    name = name.toLowerCase().replace(/\W/g, '_');
    return '  var ' + root + '_' + name;
  }
  var language = document.getElementById('language').value;
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

  injectCode(code.join('\n'), 'generatorPre');
}

/**
 * Existing direction ('ltr' vs 'rtl') of preview.
 */
var oldDir = null;

/**
 * Update the preview display.
 */
function updatePreview() {
  // Toggle between LTR/RTL if needed (also used in first display).
  var newDir = document.getElementById('direction').value;
  if (oldDir != newDir) {
    if (previewWorkspace) {
      previewWorkspace.dispose();
    }
    var rtl = newDir == 'rtl';
    previewWorkspace = Blockly.inject('preview',
        {rtl: rtl,
         media: '../../media/',
         scrollbars: true});
    oldDir = newDir;
  }
  previewWorkspace.clear();

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
      Blockly.Blocks[json.type || UNNAMED] = {
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
    var previewBlock = previewWorkspace.newBlock(blockType);
    previewBlock.initSvg();
    previewBlock.render();
    previewBlock.setMovable(false);
    previewBlock.setDeletable(false);
    previewBlock.moveBy(15, 10);
    previewWorkspace.clearUndo();

    updateGenerator(previewBlock);
  } finally {
    Blockly.Blocks = backupBlocks;
  }
}

/**
 * Inject code into a pre tag, with syntax highlighting.
 * Safe from HTML/script injection.
 * @param {string} code Lines of code.
 * @param {string} id ID of <pre> element to inject into.
 */
function injectCode(code, id) {
  var pre = document.getElementById(id);
  pre.textContent = code;
  code = pre.textContent;
  code = PR.prettyPrintOne(code, 'js');
  pre.innerHTML = code;
}

/**
 * Return the uneditable container block that everything else attaches to.
 * @return {Blockly.Block}
 */
function getRootBlock() {
  var blocks = mainWorkspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'factory_base') {
      return block;
    }
  }
  return null;
}

/**
 * Disable the link button if the format is 'Manual', enable otherwise.
 */
function disableEnableLink() {
  var linkButton = document.getElementById('linkButton');
  linkButton.disabled = document.getElementById('format').value == 'Manual';
}

/**
 * Initialize Blockly and layout.  Called on page load.
 */
function init() {
  if ('BlocklyStorage' in window) {
    BlocklyStorage.HTTPREQUEST_ERROR =
        'There was a problem with the request.\n';
    BlocklyStorage.LINK_ALERT =
        'Share your blocks with this link:\n\n%1';
    BlocklyStorage.HASH_ERROR =
        'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
    BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n'+
        'Perhaps it was created with a different version of Blockly?';
    var linkButton = document.getElementById('linkButton');
    linkButton.style.display = 'inline-block';
    linkButton.addEventListener('click',
        function() {BlocklyStorage.link(mainWorkspace);});
    disableEnableLink();
  }

  document.getElementById('helpButton').addEventListener('click',
    function() {
      open('https://developers.google.com/blockly/guides/create-custom-blocks/block-factory',
           'BlockFactoryHelp');
    });

  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('blocklyMask'),
    document.getElementById('preview'),
    document.getElementById('languagePre'),
    document.getElementById('languageTA'),
    document.getElementById('generatorPre')
  ];
  var onresize = function(e) {
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  };
  onresize();
  window.addEventListener('resize', onresize);

  var toolbox = document.getElementById('toolbox');
  mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Create the root block.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               mainWorkspace);
  } else {
    var xml = '<xml><block type="factory_base" deletable="false" movable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), mainWorkspace);
  }
  mainWorkspace.clearUndo();

  mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);
  mainWorkspace.addChangeListener(updateLanguage);
  document.getElementById('direction')
      .addEventListener('change', updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', updatePreview);
  document.getElementById('format')
      .addEventListener('change', formatChange);
  document.getElementById('language')
      .addEventListener('change', updatePreview);
}
window.addEventListener('load', init);
