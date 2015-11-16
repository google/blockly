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
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Variables');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Category to separate variable names from procedures and generated functions.
 */
Blockly.Variables.NAME_TYPE = 'VARIABLE';

/**
 * Find all user-created variables.
 * @param {!Blockly.Block|!Blockly.Workspace} root Root block or workspace.
 * @return {!Array.<string>} Array of variable names.
 */
Blockly.Variables.allVariables = function(root) {
  var blocks;
  if (root.getDescendants) {
    // Root is Block.
    blocks = root.getDescendants();
  } else if (root.getAllBlocks) {
    // Root is Workspace.
    blocks = root.getAllBlocks();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }
  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    if (blocks[x].getVars) {
      var blockVariables = blocks[x].getVars();
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          variableHash[varName.toLowerCase()] = varName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var name in variableHash) {
    variableList.push(variableHash[name]);
  }
  return variableList;
};

/**
 * Compute the intersection between two arrays of types
 * @param {Array<string>} arr1
 * @param {Array<string>} arr2
 * @return {Array<string>}
 *  Any exact matches on both sides are kept.
 *  Any matches which have a more specific qualifier are replaced by the
 *    more specific qualifier.  e.g. Array: and Array:Foo result in Array:Foo
 *  Any matches against an entry in the VariableTypeEquivalence array are 
 *    replaced by the VariableTypeEquivalence entry.
 */
Blockly.Variables.Intersection = function(arr1, arr2) {
  /**
   * This private function builds up a proper map from the input array
   */
  var buildMap = function(arr) {
    var map = {};
    var collections = {};
    // We want to add all of the elements from the array as hash keys
    for (var i = 0; i < arr.length; i++) {
      // If this element has a defined equivalence, we want to use it
      var toadd = Blockly.VariableTypeEquivalence[arr[i]];
      if (!toadd) {
        // If no equivalence, we just have an array of the element to add
        toadd = [arr[i]];
      }
      // Since we may end up with more than one from the equivalence we need
      // to iterate over them all.
      for (var e = 0; e < toadd.length; e++) {
        // See if this has any subtypes (Array:String, Map:String, ...)
        var subtype = toadd[e].split(':');
        // TODO: Do we need to handle equivalence of subtypes?
        var submap = map;
        // We should have at least one, but put them into place.
        while(subtype.length > 0) {
          var elem = subtype.shift();
          // If the current type already exists in the map, we don't need to
          // do anything.  If there is a sub type, it will be put in place.
          // If not, we already have it done.  For example if the first type
          // was Array:String and the second type was just Array we would hit
          // this case and not have to record the less restrictive type.
          if (typeof submap[elem] === 'object') {
            submap = submap[elem];
          } else if (subtype.length) {
            // The current type wasn't an object or doesn't exist, but we have
            // at least one more level (i.e. the first time we encounter a type
            // of Array:String).  Just create a hash at that level and navigate
            // into it for the remainder of the types
            submap[elem] = {};
            submap = submap[elem];
          } else {
            // We are at the bottom level and there was nothing already here
            // so just mark this entry as being a plain value.
            submap[elem] = 1;
          }
        }
      }
    }
    return map;
  };

  /**
   * This private function filters two maps in order to find the intersection of
   * types in the two maps taking into account types which are of a higher
   * equivalence value
   */
  var filterMap = function(m1, m2) {
    var res = {};
    var found = false;
    for (var key in m1) {
      if (m1.hasOwnProperty(key) && m2.hasOwnProperty(key)) {
        if (m1[key] === 1) {
          // The first map is a singleton so we take whatever is in the second
          // map (which may also be a singleton, but we don't care.
          // Hence if we have Array  on M1 and Array:{String,Number} we will
          // get Array:{String,Number}
          res[key] = m2[key];
          found = true;
        } else if (m2[key] === 1) {
          // The first map is not a singleton but the second map is, so we take
          // the first map value
          res[key] = m1[key];
          found = true;
        } else {
          // Both maps are hashes.  We need to take the interdection of the
          // two values.
          var intersect = filterMap(m1[key], m2[key]);
          if (!intersect) {
            intersect = { 'Var': 1};
          }
          res[key] = intersect;
          found = true;
        }
      }
    }
    if (!found) {
      res = null;
    }
    return res;
  }

  /**
   * This private function takes the map result and converts it back into an
   * array of strings
   */
  var consolidateMap = function(map) {
    var result = [];
    if (map) {
      for (var key in map) {
        if (map.hasOwnProperty(key)) {
          if (map[key] === 1) {
            result.push(key);
          } else {
            var submap = consolidateMap(map[key]);
            for(var i = 0; i < submap.length; i++) {
              result.push(key+':'+submap[i]);
            }
          }
        }
      }
    }
    return result;
  }

  // We are going to mangle the arrays so make a deep copy
  var m1 = buildMap(arr1);
  var m2 = buildMap(arr2);

  // Filter the map and then convert it back to the array that we need.
  return consolidateMap(filterMap(m1,m2));
};
/**
 * Resolve an array of type information to a single type.
 * @param {!Array<string>} typeArray Array of Blockly types.
 * @return {!String} Single type.
 */
Blockly.Variables.resolveTypes = function(typeArray) {
  var result = '';
  if (typeArray.length === 0) {
    result = 'Number';
  }
  else if (typeArray.length === 1) {
    result = typeArray[0];
  }
  else if (goog.array.indexOf(typeArray, 'Object') !== -1) {
    result = typeArray[0];
  } else {
    // Conflict of types and JSON isn't one of them. For now we will
    // return the first one we found
    console.log('Multiple types found for '+typeArray);
    result = typeArray[0];
  }
  return result;
};
/**
 * Find all user-created variables with their types.
 * @param {!Blockly.Block|!Blockly.Workspace} root Root block or workspace.
 * @return {!} Hash of variable names and their types.
 */
Blockly.Variables.allVariablesTypes = function(root) {
  var blocks;
  if (root.getDescendants) {
    // Root is Block.
    blocks = root.getDescendants();
  } else if (root.getAllBlocks) {
    // Root is Workspace.
    blocks = root.getAllBlocks();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }
  var variableHash = Object.create(null);
  var variableTypes = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getVarsTypes;
    if (func) {
      var blockVariablesTypes = func.call(blocks[x]);
      for (var key in blockVariablesTypes) {
        if (blockVariablesTypes.hasOwnProperty(key)) {
          if (typeof variableHash[key] === 'undefined') {
            variableHash[key] = blockVariablesTypes[key];
          } else {
            var intersect = Blockly.Variables.Intersection(
                      variableHash[key], blockVariablesTypes[key]);
            if (goog.array.isEmpty(intersect)) {
              intersect = ['Var'];
            }
            console.log('Block:'+ blocks[x].type + '.'+blocks[x].id+
            ' For: '+key+' was:'+variableHash[key]+' got:'+
            blockVariablesTypes[key]+' result='+intersect);
            variableHash[key] = intersect;
          }
        }
      }
    }
  }
  //
  // We now have all of the variables.  Next we want to go through and flatten
  // the types into what we know and what we don't know.  There will be several
  // options here.
  //   1) We have a single type for the variable.  This is the easy case.  We
  //      take that type.
  //   2) We have no type information.  For these we will assume that the
  //      type will be a scalar.
  //   3) We have more than one type, but the types are all mutable (i.e. int
  //      vs float or JSON vs Array).  For that we use the superior type
  //   4) We have a conflict between types.  For this we will take the superior
  //      type and then tell all of the functions that there is a conflict on
  //      that variable which needs to be resolved.
  var variableList = Object.create(null);;
  for (var key in variableHash) {
    variableList[key] = this.resolveTypes(variableHash[key]);
  }
  return variableList;
};

/**
 * Find all instances of the specified variable and rename them.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Blockly.Workspace} workspace Workspace rename variables in.
 */
Blockly.Variables.renameVariable = function(oldName, newName, workspace) {
  var blocks = workspace.getAllBlocks();
  // Iterate through every block.
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].renameVar) {
      blocks[i].renameVar(oldName, newName);
    }
  }
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  var variableList = Blockly.Variables.allVariables(workspace);
  variableList.sort(goog.string.caseInsensitiveCompare);
  // In addition to the user's variables, we also want to display the default
  // variable name at the top.  We also don't want this duplicated if the
  // user has created a variable of the same name.
  goog.array.remove(variableList, Blockly.Msg.VARIABLES_DEFAULT_NAME);
  variableList.unshift(Blockly.Msg.VARIABLES_DEFAULT_NAME);

  var xmlList = [];
  for (var i = 0; i < variableList.length; i++) {
    if (Blockly.Blocks['variables_set']) {
      // <block type="variables_set" gap="8">
      //   <field name="VAR">item</field>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'variables_set');
      if (Blockly.Blocks['variables_get']) {
        block.setAttribute('gap', 8);
      }
      var field = goog.dom.createDom('field', null, variableList[i]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
    if (Blockly.Blocks['variables_get']) {
      // <block type="variables_get" gap="24">
      //   <field name="VAR">item</field>
      // </block>
      var block = goog.dom.createDom('block');
      block.setAttribute('type', 'variables_get');
      if (Blockly.Blocks['variables_set']) {
        block.setAttribute('gap', 24);
      }
      var field = goog.dom.createDom('field', null, variableList[i]);
      field.setAttribute('name', 'VAR');
      block.appendChild(field);
      xmlList.push(block);
    }
  }
  return xmlList;
};

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
 * @return {string} New variable name.
 */
Blockly.Variables.generateUniqueName = function(workspace) {
  var variableList = Blockly.Variables.allVariables(workspace);
  var newName = '';
  if (variableList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < variableList.length; i++) {
        if (variableList[i].toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Find a context for a variable.  If it is inside a procedure, we want to have
 * The name of the containing procedure.  If this is a global variable then
 * we want to return a null
 * @param {!Blockly.Block} block Block to get context for
 * @param {string} name string of the name to look for.
 * @return {string} Context of the procedure (string) or null)
*/
Blockly.Variables.getLocalContext = function(block,name) {
  do {
    if (block.getProcedureDef) {
      var tuple = block.getProcedureDef.call(block);
      var params = tuple[1];
      if (name === null) {
        return tuple[0]+'.';
      }
      for(var i = 0; i < params.length; i++) {
        if (params[i]['name'] === name) {
          return tuple[0]+'.';
        }
      }
      break;
    } else if (block.type === 'initialize_variable' &&
        block.getFieldValue('VAR') === name ) {
      // We found an initialize_variable block, so now we want to go through
      // and continue until we find the containing procedure (if any)
      name = null;
    }
    block = block.getParent();
  } while (block);
  return null;
};
