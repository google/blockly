/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Generating Java for variable blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.variables');

goog.require('Blockly.Java');


Blockly.Java['variables_get'] = function(block) {
  // Remember if this is a global variable to be initialized
  Blockly.Java.setGlobalVar(block,block.getFieldValue('VAR'), null);
  // Variable getter.
  var code = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  if(Blockly.Java.GetVariableType(this.procedurePrefix_+
      block.getFieldValue('VAR')) === 'Var') {
    code += '.cloneObject()';
  }
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['variables_set'] = function(block) {
  // Remember if this is a global variable to be initialized
  Blockly.Java.setGlobalVar(block,block.getFieldValue('VAR'), null);
  // Variable setter.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '0';
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  // See if we have to handle the case where the type of the variable doesn't
  // match the type of what is being assigned.
  var sourceType = Blockly.Java.getValueType(block, 'VALUE');
  var destType = Blockly.Java.GetBlocklyType(block.getFieldValue('VAR'));
  var compatible = false;

  if (sourceType && goog.array.contains(sourceType, destType)) {
      compatible = true;
  }
  if (destType === 'String' && !compatible) {
    argument0 = Blockly.Java.toStringCode(block, 'VALUE');
  }
  var code = varName;
  if(Blockly.Java.GetVariableType(this.procedurePrefix_+
      block.getFieldValue('VAR')) === 'Var') {
    code += '.setObject(' + argument0 + ');\n';
  } else {
    code += ' = ' + argument0 + ';\n';
  }
  return code;
};

Blockly.Java['hash_variables_get'] = function(block) {
  // Remember if this is a global variable to be initialized
  var varName = block.getFieldValue('VAR');
  Blockly.Java.setGlobalVar(block,varName, null);
  var vartype = Blockly.Java.GetVariableType(this.procedurePrefix_ + varName);
  var code = Blockly.Java.variableDB_.getName(varName,
      Blockly.Variables.NAME_TYPE);
  if (Blockly.VariableTypeEquivalence[vartype]) {
    code += '.' + block.getFieldValue('HASHKEY');
  } else {
    code += '.get(' + block.getFieldValue('HASHKEY') + ')';
  }

  // See if the parent has a type that it wants
  var parent = block.getParent();
  // Look at our parents to see if we know the type that we are assigning to
  if (parent) {
    var func = parent.getVars;
    if (func) {
      var blockVariables = func.call(parent);
      if (blockVariables && blockVariables.length) {
        if (goog.array.contains(blockVariables, 'String')) {
          code += '.getObjectAsString()';
        } else if (goog.array.contains(blockVariables, 'List')) {
          code += '.getObjectAsList()';
        }
      }
    }
  }
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['hash_parmvariables_get'] = function(block) {
  // Remember if this is a global variable to be initialized
  Blockly.Java.setGlobalVar(block,block.getFieldValue('VAR'), null);
  // Variable getter.
  var getter = 'getString';
  var parent = block.getParent();
  // Look at our parents to see if we know the type that we are assigning to
  if (parent) {
    var func = parent.getVars;
    if (func) {
      var blockVariables = func.call(parent);
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          var vartype = Blockly.Java.GetVariableType(varName);

          if (vartype === 'Array') {
            getter = 'get';
          } else if (vartype === 'Object') {
            getter = 'get';
          }
        }
      }
    } else {
    }
  }
  var argument0 = Blockly.Java.valueToCode(block, 'VAR',
      Blockly.Java.ORDER_NONE) || '0';
  var code = argument0 + '.' + getter + '('+
             Blockly.Java.quote_(block.getFieldValue('HASHKEY')) + ')' ;
  return [code, Blockly.Java.ORDER_ATOMIC];
};


Blockly.Java['hash_variables_set'] = function(block) {
  // Remember if this is a global variable to be initialized
  Blockly.Java.setGlobalVar(block,block.getFieldValue('VAR'), null);
  // Variable setter.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '0';
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return varName + '{' + block.getFieldValue('HASHKEY') + '}' +
                     ' = ' + argument0 + ';\n';
};

Blockly.Java['initialize_variable'] = function (block) {
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '0';
  if(block.procedurePrefix_ != '') {
    // Variable setter.
    var vartype = Blockly.Java.GetVariableType(block.procedurePrefix_+
        block.getFieldValue('VAR'));
    if ('LinkedList' === vartype) {
        Blockly.Java.addImport('java.util.LinkedList');
    }
    var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
        Blockly.Variables.NAME_TYPE);
    return vartype + ' ' + varName + ' = ' + argument0 + ';\n';
  } else {
    // Remember if this is a global variable to be initialized
    Blockly.Java.setGlobalVar(block,block.getFieldValue('VAR'), argument0);
    return '';
  }
};
