/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Utility functions for handling Instances.
 */
'use strict';

goog.provide('Blockly.Instances');

goog.require('Blockly.Workspace');
//goog.require('goog.string');


/**
 * Category to separate instance names from instances, procedures and
 * generated functions.
 */
Blockly.Instances.NAME_TYPE = 'INSTANCE';

/**
 * Find all user-created instances.
 * @param {?string} instanceType
 * @param {!Blockly.Workspace} workspace Workspace to transverse for instances.
 * @return {!Array.<string>} Array of instance names.
 */
Blockly.Instances.allInstancesOf = function(instanceType, workspace) {
  var blocks;
  if (workspace.getAllBlocks) {
    blocks = workspace.getAllBlocks();
  } else {
    throw 'Not a valid Workspace: ' + workspace;
  }

  var instanceHash = Object.create(null);
  // Iterate through every block and add each instance to the hash.
  for (var i = 0; i < blocks.length; i++) {
    var blockInstances = blocks[i].getInstances(instanceType);
    for (var j = 0; j < blockInstances.length; j++) {
      var instanceName = blockInstances[j];
      // Instance name may be null if the block is only half-built.
      if (instanceName) {
        instanceHash[instanceName.toLowerCase()] = instanceName;
      }
    }
  }
  // Flatten the hash into a list.
  var instanceList = [];
  for (var name in instanceHash) {
    instanceList.push(instanceHash[name]);
  }
  return instanceList;
};

/** Returns all instances of all types. */
Blockly.Instances.allInstances = function(workspace) {
  return Blockly.Instances.allInstancesOf(undefined, workspace);
};

/** Returns the first Instance name of a given type. */
Blockly.Instances.getAnyInstanceOf = function(instanceType, workspace) {
  var blocks;
  if (workspace.getAllBlocks) {
    blocks = workspace.getAllBlocks();
  } else {
    throw 'Not a valid Workspace: ' + workspace;
  }

  for (var i = 0; i < blocks.length; i++) {
    var blockInstances = blocks[i].getInstances(instanceType);
    if (blockInstances.length) {
      return blockInstances[0];
    }
  }
};

/** Indicates if the given instance is present in the workspace. */
Blockly.Instances.isInstancePresent = function(
    instanceName, instanceType, block) {
  var blocks;
  if (block.workspace && block.workspace.getAllBlocks) {
    blocks = block.workspace.getAllBlocks();
  } else {
    throw 'Not a valid block: ' + block;
  }

  for (var i = 0; i < blocks.length; i++) {
    var blockInstances = blocks[i].getInstances(instanceType);
    for (var j = 0; j < blockInstances.length; j++) {
      if ((blockInstances[j] === instanceName) && (blocks[i] !== block)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Find all instances of the specified name and type and rename them.
 * @param {string} oldName Instance to rename.
 * @param {string} newName New Instance name.
 * @param {!Blockly.Workspace} workspace Workspace rename instances in.
 */
Blockly.Instances.renameInstance = function(
    oldName, newName, instanceType, workspace) {
  Blockly.Events.setGroup(true);
  var blocks = workspace.getAllBlocks();
  // Iterate through every block.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameInstance(oldName, newName, instanceType);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Return a new instance name that is not yet being used as an instance or as a
 * variable name. This will try to  generate single letter names in the range
 * 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
 * @return {string} New instance name.
 */
Blockly.Instances.generateUniqueName = function(workspace) {
  var combinedList = Blockly.Variables.allVariables(workspace).concat(
      Blockly.Instances.allInstances(workspace));
  var newName = '';
  if (combinedList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < combinedList.length; i++) {
        if (combinedList[i].toLowerCase() == potName) {
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
 * Return a version of the instance name that has not yet been used.
 * It does so by adding a number at the end of the name.
 * @param {string} instanceName Instance name to make unique.
 * @param {!Blockly.Workspace|Blockly.Block} workspace The workspace to be unique in.
 * @return {string} Unique instance name based on name input.
 */
Blockly.Instances.convertToUniqueName = function(instanceName, workspace) {
  var combinedList = Blockly.Variables.allVariables(workspace).concat(
      Blockly.Instances.allInstances(workspace));
  return Blockly.Instances.appendToName_(instanceName, combinedList);
};

/** */
Blockly.Instances.convertToUniqueNameBlock = function(instanceName, block) {
  var blocks;
  if (block.workspace) {
    blocks = block.workspace.getAllBlocks();
  } else {
    throw 'Not a valid Workspace: ' + workspace;
  }

  var instanceHash = Object.create(null);
  // Iterate through every block and add each instance to the hash.
  for (var i = 0; i < blocks.length; i++) {
    // Do not add to the list this block instance
    if (blocks[i] !== block) {
      var blockInstances = blocks[i].getInstances();
      for (var j = 0; j < blockInstances.length; j++) {
        var blockInstanceName = blockInstances[j];
        // Instance name may be null if the block is only half-built.
        if (blockInstanceName) {
          instanceHash[blockInstanceName.toLowerCase()] = blockInstanceName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var instanceList = [];
  for (var name in instanceHash) {
    instanceList.push(instanceHash[name]);
  }

  var combinedList = Blockly.Variables.allVariables(block.workspace).concat(
      instanceList);
  return Blockly.Instances.appendToName_(instanceName, combinedList);
};

/** */
Blockly.Instances.appendToName_ = function(instanceName, nameList) {
  if (!instanceName) {
    return Blockly.Instances.generateUniqueName(workspace);
  } else {
    var newName = instanceName;
    var nameSuffix = 1;

/*    if (instanceName.match(/_\d+$/)) {
      // instanceName ends with and underscore and a number, so increase count
      var instanceNameSuffix = instanceName.match(/\d+$/)[0];
      instanceName = instanceName.slice(
          0, (instanceNameSuffix.length * -1) - 1);
      nameSuffix = parseInt(instanceNameSuffix, 10) + 1;
      newName = instanceName + '_' + nameSuffix;
    }
*/
    while (nameList.indexOf(newName) !== -1) {
      newName = instanceName + '_' + nameSuffix++;
    }
    return newName;
  }
};
