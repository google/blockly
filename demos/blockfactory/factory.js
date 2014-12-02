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
 * The type of the generated block.
 */
var blockType = '';

/**
 * Initialize Blockly.  Called on page load.
 * @param {!Function} updateFunc Function to update the preview.
 */
function initPreview(updateFunc) {
  updatePreview.updateFunc = updateFunc;
  updatePreview();
}

/**
 * When the workspace changes, update the three other displays.
 */
function onchange() {
  var name = '';
  var rootBlock = getRootBlock();
  if (rootBlock) {
    name = rootBlock.getFieldValue('NAME');
  }
  blockType = name.replace(/\W/g, '_').replace(/^(\d)/, '_\\1').toLowerCase();
  if (!blockType) {
    blockType = 'unnamed';
  }
  updateLanguage();
  updateGenerator();
  updatePreview();
}

/**
 * Update the language code.
 */
function updateLanguage() {
  // Generate name.
  var code = [];
  code.push("Blockly.Blocks['" + blockType + "'] = {");
  var rootBlock = getRootBlock();
  if (rootBlock) {
    code.push("  init: function() {");
    code.push("    this.setHelpUrl('http://www.example.com/');");
    // Generate colour.
    var colourBlock = rootBlock.getInputTargetBlock('COLOUR');
    if (colourBlock && !colourBlock.disabled) {
      var hue = parseInt(colourBlock.getFieldValue('HUE'), 10);
      code.push('    this.setColour(' + hue + ');');
    }
    // Generate inputs.
    var TYPES = {'input_value': 'appendValueInput',
                 'input_statement': 'appendStatementInput',
                 'input_dummy': 'appendDummyInput'};
    var inputVarDefined = false;
    var contentsBlock = rootBlock.getInputTargetBlock('INPUTS');
    while (contentsBlock) {
      if (!contentsBlock.disabled && !contentsBlock.getInheritedDisabled()) {
        var align = contentsBlock.getFieldValue('ALIGN');
        var fields = getFields(contentsBlock.getInputTargetBlock('FIELDS'));
        var name = '';
        // Dummy inputs don't have names.  Other inputs do.
        if (contentsBlock.type != 'input_dummy') {
          name = escapeString(contentsBlock.getFieldValue('INPUTNAME'));
        }
        var check = getOptTypesFrom(contentsBlock, 'TYPE');
        code.push('    this.' + TYPES[contentsBlock.type] +
            '(' + name + ')');
        if (check && check != 'null') {
          code.push('        .setCheck(' + check + ')');
        }
        if (align != 'LEFT') {
          code.push('        .setAlign(Blockly.ALIGN_' + align + ')');
        }
        for (var x = 0; x < fields.length; x++) {
          code.push('        .appendField(' + fields[x] + ')');
        }
        // Add semicolon to last line to finish the statement.
        code[code.length - 1] += ';';
      }
      contentsBlock = contentsBlock.nextConnection &&
          contentsBlock.nextConnection.targetBlock();
    }
    // Generate inline/external switch.
    if (rootBlock.getFieldValue('INLINE') == 'INT') {
      code.push('    this.setInputsInline(true);');
    }
    // Generate output, or next/previous connections.
    switch (rootBlock.getFieldValue('CONNECTIONS')) {
      case 'LEFT':
        code.push(connectionLine_('setOutput', 'OUTPUTTYPE'));
        break;
      case 'BOTH':
        code.push(connectionLine_('setPreviousStatement', 'TOPTYPE'));
        code.push(connectionLine_('setNextStatement', 'BOTTOMTYPE'));
        break;
      case 'TOP':
        code.push(connectionLine_('setPreviousStatement', 'TOPTYPE'));
        break;
      case 'BOTTOM':
        code.push(connectionLine_('setNextStatement', 'BOTTOMTYPE'));
        break;
    }
    code.push("    this.setTooltip('');");
    code.push("  }");
  }
  code.push("};");

  injectCode(code, 'languagePre');
}

/**
 * Create JS code required to create a top, bottom, or value connection.
 * @param {string} functionName JavaScript function name.
 * @param {string} typeName Name of type input.
 * @return {string} Line of JavaScript code to create connection.
 * @private
 */
function connectionLine_(functionName, typeName) {
  var type = getOptTypesFrom(getRootBlock(), typeName);
  if (type) {
    type = ', ' + type;
  }
  return '    this.' + functionName + '(true' + type + ');';
}

/**
 * Returns a field string and any config.
 * @param {!Blockly.Block} block Field block.
 * @return {string} Field string.
 */
function getFields(block) {
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
        case 'field_angle':
          // Result: new Blockly.FieldAngle(90), 'ANGLE'
          fields.push('new Blockly.FieldAngle(' +
              escapeString(block.getFieldValue('ANGLE')) + '), ' +
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
        case 'field_variable':
          // Result:
          // new Blockly.FieldVariable('item'), 'VAR'
          var varname = block.getFieldValue('TEXT');
          varname = varname ? escapeString(varname) : 'null';
          fields.push('new Blockly.FieldVariable(' + varname + '), ' +
              escapeString(block.getFieldValue('FIELDNAME')));
          break;
        case 'field_dropdown':
          // Result:
          // new Blockly.FieldDropdown([['yes', '1'], ['no', '0']]), 'TOGGLE'
          var options = [];
          for (var x = 0; x < block.optionCount_; x++) {
            options[x] = '[' + escapeString(block.getFieldValue('USER' + x)) +
                ', ' + escapeString(block.getFieldValue('CPU' + x)) + ']';
          }
          if (options.length) {
            fields.push('new Blockly.FieldDropdown([' +
                options.join(', ') + ']), ' +
                escapeString(block.getFieldValue('FIELDNAME')));
          }
          break;
        case 'field_image':
          // Result: new Blockly.FieldImage('http://...', 80, 60)
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
 * Escape a string.
 * @param {string} string String to escape.
 * @return {string} Escaped string surrouned by quotes.
 */
function escapeString(string) {
  if (JSON && JSON.stringify) {
    return JSON.stringify(string);
  }
  // Hello MSIE 8.
  return '"' + string.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/**
 * Fetch the type(s) defined in the given input.
 * Format as a string for appending to the generated code.
 * @param {!Blockly.Block} block Block with input.
 * @param {string} name Name of the input.
 * @return {string} String defining the types.
 */
function getOptTypesFrom(block, name) {
  var types = getTypesFrom_(block, name);
  if (types.length == 0) {
    return '';
  } else if (types.length == 1) {
    return types[0];
  } else if (types.indexOf('null') != -1) {
    return 'null';
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
    for (var n = 0; n < typeBlock.typeCount_; n++) {
      types = types.concat(getTypesFrom_(typeBlock, 'TYPE' + n));
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
 */
function updateGenerator() {
  function makeVar(root, name) {
    name = name.toLowerCase().replace(/\W/g, '_');
    return '  var ' + root + '_' + name;
  }
  var language = document.getElementById('language').value;
  var code = [];
  code.push("Blockly." + language + "['" + blockType +
            "'] = function(block) {");
  var rootBlock = getRootBlock();
  if (rootBlock) {
    // Loop through every block, and generate getters for any fields or inputs.
    var blocks = rootBlock.getDescendants();
    for (var x = 0, block; block = blocks[x]; x++) {
      if (block.disabled || block.getInheritedDisabled()) {
        continue;
      }
      switch (block.type) {
        case 'field_input':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('text', name) +
                    " = block.getFieldValue('" + name + "');");
          break;
        case 'field_angle':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('angle', name) +
                    " = block.getFieldValue('" + name + "');");
          break;
        case 'field_dropdown':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('dropdown', name) +
                    " = block.getFieldValue('" + name + "');");
          break;
        case 'field_checkbox':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('checkbox', name) +
                    " = block.getFieldValue('" + name + "') == 'TRUE';");
          break;
        case 'field_colour':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('colour', name) +
                    " = block.getFieldValue('" + name + "');");
          break;
        case 'field_variable':
          var name = block.getFieldValue('FIELDNAME');
          code.push(makeVar('variable', name) +
                    " = Blockly." + language +
                    ".variableDB_.getName(block.getFieldValue('" + name +
                    "'), Blockly.Variables.NAME_TYPE);");
          break;
        case 'input_value':
          var name = block.getFieldValue('INPUTNAME');
          code.push(makeVar('value', name) +
                    " = Blockly." + language + ".valueToCode(block, '" + name +
                    "', Blockly." + language + ".ORDER_ATOMIC);");
          break;
        case 'input_statement':
          var name = block.getFieldValue('INPUTNAME');
          code.push(makeVar('statements', name) +
                    " = Blockly." + language + ".statementToCode(block, '" +
                    name + "');");
          break;
      }
    }
    code.push("  // TODO: Assemble " + language + " into code variable.");
    code.push("  var code = \'...\';");
    if (rootBlock.getFieldValue('CONNECTIONS') == 'LEFT') {
      code.push("  // TODO: Change ORDER_NONE to the correct strength.");
      code.push("  return [code, Blockly." + language + ".ORDER_NONE];");
    } else {
      code.push("  return code;");
    }
  }
  code.push("};");

  injectCode(code, 'generatorPre');
}

var oldDir = 'ltr';

/**
 * Update the preview display.
 */
function updatePreview() {
  var newDir = document.getElementById('direction').value;
  if (oldDir != newDir) {
    document.getElementById('previewFrame').src = 'preview.html?' + newDir;
    oldDir = newDir;
  } else if (updatePreview.updateFunc) {
    var code = document.getElementById('languagePre').textContent;
    updatePreview.updateFunc(blockType, code);
  }
}

/**
 * Inject code into a pre tag, with syntax highlighting.
 * Safe from HTML/script injection.
 * @param {!Array.<string>} code Array of lines of code.
 * @param {string} id ID of <pre> element to inject into.
 */
function injectCode(code, id) {
  var pre = document.getElementById(id);
  pre.textContent = code.join('\n');
  code = pre.innerHTML;
  code = prettyPrintOne(code, 'js');
  pre.innerHTML = code;
}

/**
 * Return the uneditable container block that everything else attaches to.
 * @return {Blockly.Block}
 */
function getRootBlock() {
  var blocks = Blockly.mainWorkspace.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (block.type == 'factory_base') {
      return block;
    }
  }
  return null;
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
    linkButton.addEventListener('click', BlocklyStorage.link);
  }

  document.getElementById('helpButton').addEventListener('click', function() {
      open('https://developers.google.com/blockly/custom-blocks/block-factory',
           'BlockFactoryHelp');
    });

  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('previewFrame'),
    document.getElementById('languagePre'),
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
  Blockly.inject(document.getElementById('blockly'), {toolbox: toolbox});

  // Create the root block.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else {
    var rootBlock = Blockly.Block.obtain(Blockly.mainWorkspace, 'factory_base');
    rootBlock.initSvg();
    rootBlock.render();
    rootBlock.setMovable(false);
    rootBlock.setDeletable(false);
  }

  Blockly.addChangeListener(onchange);
  document.getElementById('direction')
      .addEventListener('change', updatePreview);
  document.getElementById('language')
      .addEventListener('change', updateGenerator);
}
window.addEventListener('load', init);
