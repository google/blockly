/**
 * @license
 * Copyright 2017 Google LLC
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
 * @fileoverview Object representing a map of modules.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

/**
 * Class for a module management.
 * @class
 */
goog.module('Blockly.ModuleManager');

const {ModuleModel} = goog.require('Blockly.ModuleModel');
const Events = goog.require('Blockly.Events');
const {ModuleCreate} = goog.require('Blockly.Events.ModuleCreate');
const {ModuleActivate} = goog.require('Blockly.Events.ModuleActivate');
const {ModuleMove} = goog.require('Blockly.Events.ModuleMove');
const {ModuleDelete} = goog.require('Blockly.Events.ModuleDelete');
const {ModuleRename} = goog.require('Blockly.Events.ModuleRename');
const {MoveBlockToModule} = goog.require('Blockly.Events.MoveBlockToModule');
const idGenerator = goog.require('Blockly.utils.idGenerator');

/**
 * Class for a module management.
 * @param {!Blockly.Workspace} workspace The workspace this manager belongs to.
 * @constructor
 * @alias Blockly.ModuleManager
 */
const ModuleManager = function(workspace) {
  /**
   * Default module
   * @private
   * @type {ModuleModel}
   */
  this.defaultModule_ = new ModuleModel(workspace, 'DEFAULT_MODULE_NAME', 'general');

  /**
   * A map from module type to list of module names.  The lists contain all
   * of the named modules in the workspace.
   * @type {Array.<ModuleModel>}
   * @private
   */
  this.moduleMap_ = [this.defaultModule_];

  /**
   * Active module
   * @type {?string}
   * @private
   */
  this.activeModuleId_ = this.defaultModule_.getId();

  /**
   * The workspace this map belongs to.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;
};

/**
 * Clear the module map.
 */
ModuleManager.prototype.clear = function() {
  const deletedModules = this.moduleMap_;
  this.moduleMap_ = [];
  this.activeModuleId_ = null;

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  const existingGroup = Events.getGroup();
  if (!existingGroup) {
    Events.setGroup(true);
  }

  try {
    for (let i = 0; i < deletedModules.length; i++) {
      this.fireDeleteEvent_(deletedModules[i]);
    }
  } finally {
    if (!existingGroup) {
      Events.setGroup(false);
    }
  }
};


/**
 * Create default module if empty modules.
 */
ModuleManager.prototype.createDefaultModuleIfNeed = function() {
  if (this.moduleMap_.length === 0) {
    this.moduleMap_ = [this.defaultModule_];
    this.activeModuleId_ = [this.defaultModule_.getId()];
  }
};

/**
 * Rename a module by updating its name in the module map. Identify the
 * module to rename with the given ID.
 * @param {ModuleModel} module Module to rename.
 * @param {string} newName New module name.
 */
ModuleManager.prototype.renameModule = function(module, newName) {
  const previousName = module.name;
  module.name = newName;

  if (module._translationKey) {
    module._translationKey = null;
  }

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  Events.fire(new ModuleRename(module, previousName));
};


/**
 * Move a module to position.
 * @param {ModuleModel} module Module to move.
 * @param {int} newOrder New module order.
 */
ModuleManager.prototype.moveModule = function(module, newOrder) {
  const previousOrder = this.getModuleOrder(module.getId());

  this.moduleMap_.splice(newOrder, 0, this.moduleMap_.splice(previousOrder, 1)[0]);

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  Events.fire(new ModuleMove(module, newOrder, previousOrder));
};

/**
 * Create a module with a given name, optional type, and optional ID.
 * @param {string} name The name of the module. It can be verbose name or key of Blockly.Msg
 * @param {?string=} opt_id The unique ID of the module. This will default to
 *     a UUID.
*  @param {?number=} scrollX WS horizontal scrolling offset in pixel units.
*  @param {?number=} scrollY WS vertical scrolling offset in pixel units.
*  @param {?number=} scale WS scale.
 * @return {!ModuleModel} The newly created module.
 */
ModuleManager.prototype.createModule = function(name, opt_id, scrollX, scrollY, scale) {
  if (opt_id && this.getModuleById(opt_id)) {
    return this.getModuleById(opt_id);
  }

  const id = opt_id || idGenerator.genUid();
  const module = new ModuleModel(this.workspace, name, id);

  module.scrollX = scrollX || 0;
  module.scrollY = scrollY || 0;

  if (scale) {
    module.scale = scale;
  }

  this.moduleMap_.push(module);

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  this.fireCreateEvent_(module);

  return module;
};

/**
 * Fire a create event for module.
 * @param {!ModuleModel} module The module that was just created.
 * @private
 */
ModuleManager.prototype.fireCreateEvent_ = function(module) {
  if (Events.isEnabled()) {
    const existingGroup = Events.getGroup();
    if (!existingGroup) {
      Events.setGroup(true);
    }
    try {
      Events.fire(new ModuleCreate(module));
    } finally {
      if (!existingGroup) {
        Events.setGroup(false);
      }
    }
  }
};


/**
 * Move block to module.
 * @param {Blockly.BlockSvg} block The block.
 * @param {ModuleModel} module Target module.
 */
ModuleManager.prototype.moveBlockToModule = function(block, module) {
  const newModuleId = module.getId();
  const previousModuleId = block.getModuleId();

  if (newModuleId === previousModuleId) {
    return;
  }

  const existingGroup = Events.getGroup();
  if (!existingGroup) {
    Events.setGroup(true);
  }

  try {
    block.getDescendants(false).forEach(function(descendant) {
      descendant.setModuleId(module.getId());
    });
    block.unplug();
    block.removeRender();

    Events.disable();
    this.activateModule(module);
    Events.enable();

    this.workspace.centerOnBlock(block.id);

    block.select();

    Events.fire(new MoveBlockToModule(block, newModuleId, previousModuleId));
  } finally {
    if (!existingGroup) {
      Events.setGroup(false);
    }
  }
};

/**
 * Move blocks to module.
 * @param {Blockly.BlockSvg} blocks Blocks array to move in module.
 * @param {ModuleModel} module Module into which will be blocks moved.
 * @param {MassOperationsHandler} massOperations Mass operations handler for workspace.
 */
ModuleManager.prototype.moveBlocksToModule = function(blocks, module, massOperations) {
  const newModuleId = module.getId();
  const previousModuleId = blocks[0].getModuleId();

  if (newModuleId === previousModuleId) {
    return;
  }

  const existingGroup = Events.getGroup();
  if (!existingGroup) {
    Events.setGroup(true);
  }

  try {
    blocks.forEach((block) => {
      block.getDescendants(false).forEach(function(descendant) {
        descendant.setModuleId(module.getId());
      });

      block.unplug();
      block.removeRender();
    });

    massOperations.cleanUp();

    Events.disable();
    this.activateModule(module);
    Events.enable();

    blocks.forEach((b) => massOperations.addBlockToSelected(b));
  } finally {
    if (!existingGroup) {
      Events.setGroup(false);
    }
  }
};

/**
 * Fire a delete event for module.
 * @param {Blockly.Block} block The moved block.
 *     Null for a blank event.
 * @param {String} newModuleId The new module id.
 * @param {String} previousModuleId The previous module id.
 * @extends {Events.ModuleBase}
 * @private
 */
ModuleManager.prototype.fireMoveBlockToModule_ = function(block, newModuleId, previousModuleId) {
  if (Events.isEnabled()) {
    const existingGroup = Events.getGroup();
    if (!existingGroup) {
      Events.setGroup(true);
    }
    try {
      Events.fire(new MoveBlockToModule(block, newModuleId, previousModuleId));
    } finally {
      if (!existingGroup) {
        Events.setGroup(false);
      }
    }
  }
};

/**
 * Delete a module and all its top blocks.
 * @param {ModuleModel} module Module to delete.
 * @return {ModuleModel} previous sibling module
 */
ModuleManager.prototype.deleteModule = function(module) {
  for (let i = 0; i < this.moduleMap_.length; i++) {
    if (this.moduleMap_[i].getId() === module.getId()) {
      this.moduleMap_.splice(i, 1);
      let existingGroup = null;

      try {
        existingGroup = Events.getGroup();

        if (!existingGroup) {
          Events.setGroup(true);
        }

        if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
          this.workspace.getModuleBar().render();
        }

        this.fireDeleteEvent_(module);
      } finally {
        if (!existingGroup) {
          Events.setGroup(false);
        }
      }
      return this.moduleMap_[i - 1] || this.moduleMap_[0];
    }
  }
};

/**
 * Fire a delete event for module.
 * @param {!ModuleModel} module The module that was just deleted.
 * @private
 */
ModuleManager.prototype.fireDeleteEvent_ = function(module) {
  if (Events.isEnabled()) {
    const existingGroup = Events.getGroup();

    if (!existingGroup) {
      Events.setGroup(true);
    }
    try {
      Events.fire(new ModuleDelete(module));
    } finally {
      if (!existingGroup) {
        Events.setGroup(false);
      }
    }
  }
};

/**
 * Activate a module, switch top blocks visibility.
 * @param {ModuleModel} module Module to activate.
 */
ModuleManager.prototype.activateModule = function(module) {
  if (this.activeModuleId_ && this.activeModuleId_ === module.getId()) {
    return;
  }

  Blockly.ContextMenu.hide();
  const previousActive = this.getActiveModule();
  const existingGroup = Events.getGroup();

  if (!existingGroup) {
    Events.setGroup(true);
  }

  try {
    Events.disable();

    // remove render
    if (this.workspace.rendered) {
      Blockly.hideChaff(true);

      // Disable workspace resizes as an optimization.
      if (this.workspace.setResizesEnabled) {
        this.workspace.setResizesEnabled(false);
      }

      const topBlocks = this.workspace.getTopBlocks(false, true);

      for (let i = 0; i < topBlocks.length; i++) {
        topBlocks[i].removeRender();
      }
    }

    // set new active module
    this.setActiveModuleId(module.getId());

    if (this.workspace.rendered) {
      const topBlocks = this.workspace.getTopBlocks(false, true);

      const enableConnectionTracking = function(block) {
        setTimeout(function() {
          if (!block.disposed) {
            block.setConnectionTracking(true);
          }
        }, 1);
      };

      for (let i = 0; i < topBlocks.length; i++) {
        const topBlock = topBlocks[i];
        const blocks = topBlock.getDescendants(false);

        // Wait to track connections to speed up assembly.
        topBlock.setConnectionTracking(false);

        // Render each block.
        for (let j = blocks.length - 1; j >= 0; j--) {
          blocks[j].initSvg();
        }
        for (let j = blocks.length - 1; j >= 0; j--) {
          blocks[j].render(false);
        }

        // Populating the connection database may be deferred until after the
        // blocks have rendered.
        enableConnectionTracking(topBlock);
        topBlock.updateDisabled();

        this.workspace.addTopBoundedElement(topBlock);
      }

      // Re-enable workspace resizing.
      if (this.workspace.setResizesEnabled) {
        this.workspace.setResizesEnabled(true);
      }

      // Allow the scrollbars to resize and move based on the new contents.
      this.workspace.resizeContents();

      // store scroll positions before scale
      const scrollX = module.scrollX;
      const scrollY = module.scrollY;
      if (this.workspace.scale !== module.scale) {
        this.workspace.setScale(module.scale);
      }

      this.workspace.scroll(scrollX, scrollY);

      if (this.workspace.getModuleBar()) {
        this.workspace.getModuleBar().render();
      }
    }

    Events.enable();
    Events.fire(new ModuleActivate(module, previousActive));
  } catch (e) {
    Events.enable();
  } finally {
    if (!existingGroup) {
      Events.setGroup(false);
    }
  }
};

/**
 * Set active module id.
 * @param {string} id Module.
 */
ModuleManager.prototype.setActiveModuleId = function(id) {
  this.activeModuleId_ = id;
};

/**
 * Returns active module.
 * @return {!ModuleModel} current active module.
 */
ModuleManager.prototype.getActiveModule = function() {
  return this.getModuleById(this.activeModuleId_) || this.getAllModules()[0];
};

/**
 * Find the module by the given ID and return it. Return null if it is not found.
 * @param {string} id The ID to check for.
 * @return {ModuleModel} The module with the given ID.
 */
ModuleManager.prototype.getModuleById = function(id) {
  if (!id) {
    return null;
  }
  for (let i = 0; i < this.moduleMap_.length; i++) {
    if (this.moduleMap_[i].getId() === id) {
      return this.moduleMap_[i];
    }
  }
  return null;
};

/**
 * Get module order by ID.
 * @param {string} id The ID to check for.
 * @return {int} The module order.
 */
ModuleManager.prototype.getModuleOrder = function(id) {
  for (let i = 0; i < this.moduleMap_.length; i++) {
    if (this.moduleMap_[i].getId() === id) {
      return i;
    }
  }
  return 0;
};

/**
 * Return all modules of all types.
 * @return {!Array.<!ModuleModel>} List of module models.
 */
ModuleManager.prototype.getAllModules = function() {
  return this.moduleMap_;
};

exports.ModuleManager = ModuleManager;
