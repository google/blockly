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
 * @file Object representing a map of modules.
 * @author dev@varwin.com (Varwin Developers)
 */

/**
 * Class for a module management.
 *
 * @class
 */
// Former: goog.module('Blockly.ModuleManager');

import {ModuleModel} from './module_model.js';
import {WorkspaceSvg} from './workspace_svg.js';
import * as ContextMenu from './contextmenu.js';
import {BlockSvg} from './block_svg.js';
import * as Events from './events/events.js';
import {ModuleCreate} from './events/events_module_create.js';
import {ModuleActivate} from './events/events_module_activate.js';
import {ModuleDelete} from './events/events_module_delete.js';
import {ModuleRename} from './events/events_module_rename.js';
import {MoveBlockToModule} from './events/events_move_block_to_module.js';
import * as idGenerator from './utils/idgenerator.js';
import {ModuleMove} from './events/events_module_move.js';
import {ContextMenuRegistry} from './contextmenu_registry.js';
import {registerMovingToModule} from './contextmenu_items.js';

/**
 * Class for a module management.
 */
export class ModuleManager {
  private readonly defaultModule_: ModuleModel;
  private moduleMap_: ModuleModel[];
  private activeModuleId_: string | null;
  private readonly workspace: WorkspaceSvg;

  constructor(workspace: WorkspaceSvg) {
    this.workspace = workspace;
    this.defaultModule_ = new ModuleModel(
      workspace,
      'DEFAULT_MODULE_NAME',
      'general',
    );
    this.moduleMap_ = [this.defaultModule_];
    this.activeModuleId_ = this.defaultModule_.getId();
  }

  /**
   * Clear the module map.
   */
  clear() {
    const deletedModules = this.moduleMap_;
    this.moduleMap_ = [];
    this.activeModuleId_ = null;

    if (this.workspace.getModuleBar && this.workspace.getModuleBar()) {
      this.workspace.getModuleBar()?.render();
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
  }

  /**
   * Create default module if empty modules.
   */
  createDefaultModuleIfNeed() {
    if (this.moduleMap_.length === 0) {
      this.moduleMap_ = [this.defaultModule_];
      this.activeModuleId_ = this.defaultModule_.getId();
    }
  }

  /**
   * Rename a module by updating its name in the module map. Identify the
   * module to rename with the given ID.
   *
   * @param {ModuleModel} module Module to rename.
   * @param {string} newName New module name.
   */
  renameModule(module: ModuleModel, newName: string) {
    const previousName = module.name;
    module.name = newName;

    if (module._translationKey) {
      module._translationKey = null;
    }

    if (this.workspace.getModuleBar()) {
      this.workspace.getModuleBar()?.render();
    }

    Events.fire(new ModuleRename(module, previousName));
  }

  /**
   * Move a module to position.
   *
   * @param {ModuleModel} module Module to move.
   * @param {number} newOrder New module order.
   */
  moveModule(module: ModuleModel, newOrder: number) {
    const previousOrder = this.getModuleOrder(module.getId());

    this.moduleMap_.splice(
      newOrder,
      0,
      this.moduleMap_.splice(previousOrder, 1)[0],
    );

    if (this.workspace.getModuleBar()) {
      this.workspace.getModuleBar()?.render();
    }

    Events.fire(new ModuleMove(module, newOrder, previousOrder));
  }

  /**
   * Create a module with a given name, optional type, and optional ID.
   *
   * @param {string} name The name of the module. It can be verbose name or key of Blockly.Msg
   * @param {?string=} opt_id The unique ID of the module. This will default to
   *     a UUID.
   *  @param {?number=} scrollX WS horizontal scrolling offset in pixel units.
   *  @param {?number=} scrollY WS vertical scrolling offset in pixel units.
   *  @param {?number=} scale WS scale.
   * @returns {!ModuleModel} The newly created module.
   */
  createModule(
    name: string,
    opt_id?: string,
    scrollX?: number,
    scrollY?: number,
    scale?: number,
  ) {
    if (opt_id && this.getModuleById(opt_id)) {
      return this.getModuleById(opt_id);
    }

    const id = opt_id || idGenerator.genUid();
    const module = new ModuleModel(this.workspace, name, id);

    module.scrollX = scrollX || 0;
    module.scrollX = scrollY || 0;

    if (scale) {
      module.scale = scale;
    }

    this.moduleMap_.push(module);

    if (this.workspace.getModuleBar()) {
      this.workspace.getModuleBar()?.render();
    }

    this.fireCreateEvent_(module);

    registerMovingToModule();

    return module;
  }

  /**
   * Fire a create event for module.
   *
   * @param {!ModuleModel} module The module that was just created.
   */
  private fireCreateEvent_(module: ModuleModel) {
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
  }

  /**
   * Move block to module.
   *
   * @param {Blockly.BlockSvg} block The block.
   * @param {ModuleModel} module Target module.
   */
  moveBlockToModule(block: BlockSvg, module: ModuleModel) {
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
      block.getDescendants(false).forEach(function (descendant: BlockSvg) {
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
  }

  /**
   * Fire a delete event for module.
   *
   * Null for a blank event.
   *
   * @param block
   * @param {string} newModuleId The new module id.
   * @param {string} previousModuleId The previous module id.
   * @augments {Events.ModuleBase}
   * @private
   */
  private fireMoveBlockToModule_(
    block: BlockSvg,
    newModuleId: string,
    previousModuleId: string,
  ) {
    if (Events.isEnabled()) {
      const existingGroup = Events.getGroup();
      if (!existingGroup) {
        Events.setGroup(true);
      }
      try {
        Events.fire(
          new MoveBlockToModule(block, newModuleId, previousModuleId),
        );
      } finally {
        if (!existingGroup) {
          Events.setGroup(false);
        }
      }
    }
  }

  /**
   * Delete a module and all its top blocks.
   */
  deleteModule(module: ModuleModel) {
    for (let i = 0; i < this.moduleMap_.length; i++) {
      if (this.moduleMap_[i].getId() === module.getId()) {
        this.moduleMap_.splice(i, 1);
        let existingGroup = null;

        try {
          existingGroup = Events.getGroup();

          if (!existingGroup) {
            Events.setGroup(true);
          }

          if (this.workspace.getModuleBar()) {
            this.workspace.getModuleBar()?.render();
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

    const optionId = module.getMenuOptionId();
    if (ContextMenuRegistry.registry.getItem(optionId)) {
      ContextMenuRegistry.registry.unregister(optionId);
    }
  }

  /**
   * Fire a delete event for module.
   *
   * @param {!ModuleModel} module The module that was just deleted.
   * @private
   */
  private fireDeleteEvent_(module: ModuleModel) {
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
  }

  /**
   * Activate a module, switch top blocks visibility.
   *
   * @param {ModuleModel} module Module to activate.
   */
  activateModule(module: ModuleModel) {
    if (this.activeModuleId_ && this.activeModuleId_ === module.getId()) {
      return;
    }

    ContextMenu.hide();
    const previousActive = this.getActiveModule();
    const existingGroup = Events.getGroup();

    if (!existingGroup) {
      Events.setGroup(true);
    }

    try {
      Events.disable();

      // remove render
      if (this.workspace.rendered) {
        this.workspace.hideChaff(true);

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

        const enableConnectionTracking = function (block: BlockSvg) {
          setTimeout(function () {
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
            blocks[j].render();
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
          this.workspace.getModuleBar()?.render();
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
  }

  /**
   * Set active module id.
   *
   * @param {string} id Module.
   */
  setActiveModuleId(id: string) {
    this.activeModuleId_ = id;
  }

  /**
   * Returns active module.
   *
   * @returns {!ModuleModel} current active module.
   */
  getActiveModule() {
    return this.getModuleById(this.activeModuleId_!) || this.getAllModules()[0];
  }

  /**
   * Find the module by the given ID and return it. Return null if it is not found.
   *
   * @param {string} id The ID to check for.
   * @returns {ModuleModel} The module with the given ID.
   */
  getModuleById(id: string) {
    if (!id) {
      return null;
    }
    for (let i = 0; i < this.moduleMap_.length; i++) {
      if (this.moduleMap_[i].getId() === id) {
        return this.moduleMap_[i];
      }
    }
    return null;
  }

  /**
   * Get module order by ID.
   *
   * @param {string} id The ID to check for.
   * @returns {int} The module order.
   */
  getModuleOrder(id: string) {
    for (let i = 0; i < this.moduleMap_.length; i++) {
      if (this.moduleMap_[i].getId() === id) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Return all modules of all types.
   *
   * @returns {!Array.<!ModuleModel>} List of module models.
   */
  getAllModules() {
    return this.moduleMap_;
  }
}
