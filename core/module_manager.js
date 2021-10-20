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

goog.provide('Blockly.ModuleManager');

goog.require('Blockly.ModuleBar');
goog.require('Blockly.Events');
goog.require('Blockly.ModuleModel');
goog.require('Blockly.Events.ModuleDelete');
goog.require('Blockly.Events.ModuleRename');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');


/**
 * Class for a module management.
 * @param {!Blockly.Workspace} workspace The workspace this manager belongs to.
 * @constructor
 */
Blockly.ModuleManager = function(workspace) {
  /**
   * Default module
   * @private
   * @type {Blockly.ModuleModel}
   */
  this.defaultModule_ =  new Blockly.ModuleModel(workspace,Blockly.Msg['DEFAULT_MODULE_NAME'], 'general');

  /**
   * A map from module type to list of module names.  The lists contain all
   * of the named modules in the workspace.
   * @type {Array.<Blockly.ModuleModel>}
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
Blockly.ModuleManager.prototype.clear = function() {
  var deletedModules = this.moduleMap_;
  this.moduleMap_ = [];
  this.activeModuleId_ = null;

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }

  try {
    for (var i = 0; i < deletedModules.length; i++) {
      this.fireDeleteEvent_(deletedModules[i]);
    }
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};


/**
 * Create default module if empty modules.
 */
Blockly.ModuleManager.prototype.createDefaultModuleIfNeed = function() {
  if (this.moduleMap_.length === 0) {
    this.moduleMap_ = [this.defaultModule_];
    this.activeModuleId_ = [this.defaultModule_.getId()];
  }
};

/**
 * Rename a module by updating its name in the module map. Identify the
 * module to rename with the given ID.
 * @param {Blockly.ModuleModel} module Module to rename.
 * @param {string} newName New module name.
 */
Blockly.ModuleManager.prototype.renameModule = function(module, newName) {
  var previousName = module.name;
  module.name = newName;
  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  Blockly.Events.fire(new Blockly.Events.ModuleRename(module, previousName));
};


/**
 * Move a module to position.
 * @param {Blockly.ModuleModel} module Module to move.
 * @param {int} newOrder New module order.
 */
Blockly.ModuleManager.prototype.moveModule = function(module, newOrder) {
  var previousOrder = this.getModuleOrder(module.getId());

  this.moduleMap_.splice(newOrder,0,this.moduleMap_.splice(previousOrder, 1)[0]);

  if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
    this.workspace.getModuleBar().render();
  }

  Blockly.Events.fire(new Blockly.Events.ModuleMove(module, newOrder, previousOrder));
};

/**
 * Create a module with a given name, optional type, and optional ID.
 * @param {string} name The name of the module.
 * @param {?string=} opt_id The unique ID of the module. This will default to
 *     a UUID.
*  @param {?number=} scrollX WS horizontal scrolling offset in pixel units.
*  @param {?number=} scrollY WS vertical scrolling offset in pixel units.
*  @param {?number=} scale WS scale.
 * @return {!Blockly.ModuleModel} The newly created module.
 */
Blockly.ModuleManager.prototype.createModule = function(name, opt_id, scrollX, scrollY, scale) {
  if (opt_id && this.getModuleById(opt_id)) {
    return this.getModuleById(opt_id);
  }

  var id = opt_id || Blockly.utils.genUid();
  var module = new Blockly.ModuleModel(this.workspace, name, id);
  module.scrollX = scrollX || 0;
  module.scrollY = scrollY || 0;
  if (scale) {
    module.scale = scale
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
 * @param {!Blockly.ModuleModel} module The module that was just created.
 * @private
 */
Blockly.ModuleManager.prototype.fireCreateEvent_ = function(module) {
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.ModuleCreate(module));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  }
};


/**
 * Move block to module.
 * @param {Blockly.BlockSvg} block
 * @param {Blockly.ModuleModel} module
 */
Blockly.ModuleManager.prototype.moveBlockToModule = function (block, module) {
  var newModuleId = module.getId();
  var previousModuleId = block.getModuleId();

  if (newModuleId === previousModuleId) {
    return
  }

  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }

  try {
    block.getDescendants(false).forEach(function (descendant) {
      descendant.setModuleId(module.getId())
    });
    block.unplug();
    block.removeRender();

    Blockly.Events.disable();
    this.activateModule(module);
    Blockly.Events.enable();

    this.workspace.centerOnBlock(block.id);

    block.select();

    Blockly.Events.fire(new Blockly.Events.MoveBlockToModule(block, newModuleId, previousModuleId));
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }

}

/**
 * Fire a delete event for module.
 * @param {Blockly.Block} block The moved block.
 *     Null for a blank event.
 * @param {String} newModuleId The new module id.
 * @param {String} previousModuleId The previous module id.
 * @extends {Blockly.Events.ModuleBase}
 * @private
 */
Blockly.ModuleManager.prototype.fireMoveBlockToModule_ = function(block, newModuleId, previousModuleId) {
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.MoveBlockToModule(block, newModuleId, previousModuleId));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  }
}

/**
 * Delete a module and all its top blocks.
 * @param {Blockly.ModuleModel} module Module to delete.
 * @return {Blockly.ModuleModel} previous sibling module
 */
Blockly.ModuleManager.prototype.deleteModule = function(module) {
  for (var i = 0; i < this.moduleMap_.length; i++) {
    if (this.moduleMap_[i].getId() === module.getId()) {
      this.moduleMap_.splice(i, 1);

      try {
        var existingGroup = Blockly.Events.getGroup();
        if (!existingGroup) {
          Blockly.Events.setGroup(true);
        }

        if (this.workspace instanceof Blockly.WorkspaceSvg && this.workspace.getModuleBar()) {
          this.workspace.getModuleBar().render();
        }

        this.fireDeleteEvent_(module);
      } finally {
        if (!existingGroup) {
          Blockly.Events.setGroup(false);
        }
      }

      return this.moduleMap_[i - 1] || this.moduleMap_[0];
    }
  }
};

/**
 * Fire a delete event for module.
 * @param {!Blockly.ModuleModel} module The module that was just deleted.
 * @private
 */
Blockly.ModuleManager.prototype.fireDeleteEvent_ = function(module) {
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.ModuleDelete(module));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  }
};

/**
 * Activate a module, switch top blocks visibility.
 * @param {Blockly.ModuleModel} module Module to activate.
 */
Blockly.ModuleManager.prototype.activateModule = function(module) {
  if (this.activeModuleId_ && this.activeModuleId_ === module.getId()) {
    return;
  }

  Blockly.ContextMenu.hide();
  var previousActive = this.getActiveModule();

  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }

  try {
    Blockly.Events.disable();

    // remove render
    if (this.workspace.rendered) {
      Blockly.hideChaff(true);

      // Disable workspace resizes as an optimization.
      if (this.workspace.setResizesEnabled) {
        this.workspace.setResizesEnabled(false);
      }

      var topBlocks = this.workspace.getTopBlocks(false, true)
      for (var i = 0; i < topBlocks.length; i++) {
        topBlocks[i].removeRender();
      }
    }

    // set new active module
    this.setActiveModuleId(module.getId());

    if (this.workspace.rendered) {
      var topBlocks = this.workspace.getTopBlocks(false, true)

      var enableConnectionTracking = function (block) {
        setTimeout(function () {
          if (!block.disposed) {
            block.setConnectionTracking(true);
          }
        }, 1);
      }

      for (var i = 0; i < topBlocks.length; i++) {
        var topBlock = topBlocks[i]
        var blocks = topBlock.getDescendants(false);

        // Wait to track connections to speed up assembly.
        topBlock.setConnectionTracking(false);

        // Render each block.
        for (var j = blocks.length - 1; j >= 0; j--) {
          blocks[j].initSvg();
        }
        for (var j = blocks.length - 1; j >= 0; j--) {
          blocks[j].render(false);
        }
        for (var j = blocks.length - 1; j >= 0; j--) {
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
      var scrollX = module.scrollX;
      var scrollY = module.scrollY;
      if (this.workspace.scale !== module.scale) {
        this.workspace.setScale(module.scale);
      }

      this.workspace.scroll(scrollX, scrollY);

      if (this.workspace.getModuleBar()) {
        this.workspace.getModuleBar().render();
      }
    }

    Blockly.Events.enable();
    Blockly.Events.fire(new Blockly.Events.ModuleActivate(module, previousActive));
  } catch (e) {
    Blockly.Events.enable();
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/**
 * Set active module id.
 * @param {string} id Module.
 */
Blockly.ModuleManager.prototype.setActiveModuleId = function(id) {
  this.activeModuleId_ = id;
};

/**
 * Returns active module.
 * @return {!Blockly.ModuleModel} current active module.
 */
Blockly.ModuleManager.prototype.getActiveModule = function() {
  return this.getModuleById(this.activeModuleId_) || this.getAllModules()[0];
};

/**
 * Find the module by the given ID and return it. Return null if it is not found.
 * @param {string} id The ID to check for.
 * @return {Blockly.ModuleModel} The module with the given ID.
 */
Blockly.ModuleManager.prototype.getModuleById = function(id) {
  if (!id) {
    return null;
  }
  for (var i = 0; i < this.moduleMap_.length; i++) {
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
Blockly.ModuleManager.prototype.getModuleOrder = function(id) {
  for (var i = 0; i < this.moduleMap_.length; i++) {
    if (this.moduleMap_[i].getId() === id) {
      return i;
    }
  }
  return 0;
};

/**
 * Return all modules of all types.
 * @return {!Array.<!Blockly.ModuleModel>} List of module models.
 */
Blockly.ModuleManager.prototype.getAllModules = function() {
  return this.moduleMap_;
};
