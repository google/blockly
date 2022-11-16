/* eslint-disable max-len */
/**
 * @license
 * Copyright 2011 Google LLC
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
 * @fileoverview ModuleBar from whence to create blocks.
 * @author dev@varwin.com (Varwin Developers)
 */
"use strict";

goog.module("Blockly.ModuleBar");

const Css = goog.require("Blockly.Css");
// const Touch = goog.require('Blockly.Touch');
const utils = goog.require("Blockly.utils");
const utilsDom = goog.require("Blockly.utils.dom");
const browserEvents = goog.require("Blockly.browserEvents");
const eventUtils = goog.require("Blockly.Events.utils");
const {Msg} = goog.require('Blockly.Msg');

/**
 * Class for a module bar.
 * Creates the moduleBar's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new module box.
 * @constructor
 */
const ModuleBar = function(workspace) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {?Element}
   * @private
   */
  this.dragDropModuleEl_ = null;

  /**
   * @type {?Element}
   * @private
   */
  this.dragDropTargetModuleEl_ = null;

  /**
   * @type {?Element}
   * @private
   */
  this.htmlContainer_ = null;

  this.ulContainer_ = null;

  /**
   * Click event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onClickWrapper_ = null;

  /**
   * Workspace change event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onWorkspaceChangeWrapper_ = null;

  /**
   * Mouse down event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onMouseDownWrapper_ = null;

  /**
   * Mouse move event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onMouseMoveWrapper_ = null;

  /**
   * Mouse wheel event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onMouseWheelWrapper_ = null;

  /**
   * Mouse up event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onMouseUpWrapper_ = null;

  /**
   * Flag blockly loading finished
   * @type {boolean}
   * @private
   */
  this.isFinishedLoading_ = false;
};

/**
 * Initializes the module bar.
 */
ModuleBar.prototype.init = function() {
  const injectionContainer = this.workspace_.getInjectionDiv();

  /**
   * HTML container for the ModuleBar.
   * @type {Element}
   */
  this.htmlContainer_ = document.createElement("div");
  this.htmlContainer_.className =
  "blocklyModuleBarContainer blocklyNonSelectable cursorNotAllowed";

  this.ulContainer_ = document.createElement("ul");
  this.ulContainer_.className = "blocklyModuleBarContainer";
  this.htmlContainer_.appendChild(this.ulContainer_);

  injectionContainer.parentNode.insertBefore(
    this.htmlContainer_,
    injectionContainer
  );

  if (this.workspace_.RTL) {
    this.htmlContainer_.setAttribute("dir", "rtl");
  }

    // create tab
    const newTab = document.createElement("div");
    newTab.className = "blocklyModuleBarTab blocklyModuleBarTabCreate";
    newTab.setAttribute("role", "create-module-control");
    newTab.setAttribute("title", Blockly.Msg["NEW_MODULE"]);
  
    const newLink = document.createElement("a");
    newLink.className = "blocklyModuleBarLink";
    newLink.setAttribute("role", "create-module-control");
  
    const createIcon = document.createElement("span");
    createIcon.innerHTML = Msg['NEW_TAB'];
    createIcon.setAttribute("role", "create-module-control");
  
    newLink.appendChild(createIcon);
    newTab.appendChild(newLink);
    this.htmlContainer_.appendChild(newTab);

  this.attachEvents_();
  this.render();
};

/**
 * Fill the module Bar.
 * @package
 */
ModuleBar.prototype.render = function() {
  this.ulContainer_.innerHTML = "";

  const modules = this.workspace_.getModuleManager().getAllModules();

  for (let i = 0; i < modules.length; i++) {
    const tab = document.createElement("li");

    tab.className = "blocklyModuleBarTab";
    tab.setAttribute("data-module-id", modules[i].getId());
    tab.setAttribute("ondragstart", "return false;");

    const link = document.createElement("a");
    const name = document.createElement("span");

    name.className = "blocklyModuleName";
    name.appendChild(utils.xml.createTextNode(modules[i].getName()));
    link.appendChild(name);
    link.className = "blocklyModuleBarLink";

    const activeModule = this.workspace_.getModuleManager().getActiveModule();

    if (activeModule && modules[i].getId() === activeModule.getId()) {
      link.className += " blocklyModuleBarLinkActive";

      const menuIcon = document.createElement("span");

      menuIcon.className =
        "blocklyModuleBarTabIcon blocklyModuleBarTabMenuIcon";
      menuIcon.setAttribute("role", "module-menu-control");
      link.appendChild(menuIcon);
    }

    tab.appendChild(link);

    this.ulContainer_.appendChild(tab);
  }
};

/**
 * Set whether this module bar's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
ModuleBar.prototype.setContainerVisible = function(visible) {
  this.htmlContainer_.setAttribute(
    "style",
    "display: " + (visible ? "" : "none")
  );
};

/**
 * Adds the event listeners.
 * @private
 */
ModuleBar.prototype.attachEvents_ = function() {
  this.onClickWrapper_ = browserEvents.conditionalBind(
    this.htmlContainer_,
    "click",
    this,
    this.onMouseClick_
  );
  this.onMouseDownWrapper_ = browserEvents.conditionalBind(
    this.htmlContainer_,
    "mousedown",
    this,
    this.onMouseDown_
  );
  this.onMouseUpWrapper_ = browserEvents.conditionalBind(
    document,
    "mouseup",
    this,
    this.onMouseUp_
  );
  this.onMouseMoveWrapper_ = browserEvents.conditionalBind(
    document,
    "mousemove",
    this,
    this.onMouseMove_
  );
  this.onMouseWheelWrapper_ = browserEvents.conditionalBind(
    this.htmlContainer_,
    "wheel",
    this,
    this.onMouseWheel_
  );
  this.onWorkspaceChangeWrapper_ = this.workspace_.addChangeListener(
    this.onWorkspaceChange_.bind(this)
  );
};

/**
 * Removes the event listeners.
 * @private
 */
ModuleBar.prototype.detachEvents_ = function() {
  if (this.onClickWrapper_) {
    Blockly.browserEvents.unbind(this.onClickWrapper_);
    this.onClickWrapper_ = null;
  }

  if (this.onMouseDownWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseDownWrapper_);
    this.onMouseDownWrapper_ = null;
  }

  if (this.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }

  if (this.onMouseMoveWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }

  if (this.onMouseWheelWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseWheelWrapper_);
    this.onMouseWheelWrapper_ = null;
  }

  if (this.onWorkspaceChangeWrapper_) {
    this.workspace_.removeChangeListener(this.onWorkspaceChangeWrapper_);
  }
};

/**
 * Mouse click handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.onMouseClick_ = function(e) {
  if (!this.isFinishedLoading_) {
    return;
  }

  const role = e.target.getAttribute("role");

  switch (role) {
    case "module-menu-control":
      this.handleShowModuleMenu_(e);
      return;
    case "create-module-control":
      this.handleCreateModule_();
      return;
  }

  this.handleActivateModule_(e);
};

/**
 * Mouse down handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.onMouseDown_ = function(e) {
  const role = e.target.getAttribute("role");
  if (role === "module-menu-control") {
    return;
  }

  if (this.workspace_.getModuleManager().getAllModules().length < 2) {
    return;
  }

  const moduleEl = this.getModuleElementFromEvent_(e);
  if (!moduleEl) {
    return;
  }

  const module = this.workspace_
    .getModuleManager()
    .getModuleById(moduleEl.getAttribute("data-module-id"));
  if (!module) {
    return;
  }

  if (
    module.getId() !==
    this.workspace_.getModuleManager().getActiveModule().getId()
  ) {
    return;
  }

  this.dragDropModuleEl_ = moduleEl;
  Blockly.ContextMenu.hide();
};

/**
 * Mouse up handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.onMouseUp_ = function(e) {
  if (!this.dragDropModuleEl_) {
    return;
  }

  const module = this.workspace_
    .getModuleManager()
    .getModuleById(this.dragDropModuleEl_.getAttribute("data-module-id"));
  this.dragDropModuleEl_ = null;
  if (!this.dragDropTargetModuleEl_) {
    return;
  }

  const targetModule = this.workspace_
    .getModuleManager()
    .getModuleById(this.dragDropTargetModuleEl_.getAttribute("data-module-id"));
  this.dragDropTargetModuleEl_ = null;

  const oldPostion = this.workspace_
    .getModuleManager()
    .getModuleOrder(module.getId());
  let newPosition = this.workspace_
    .getModuleManager()
    .getModuleOrder(targetModule.getId());

  if (oldPostion > newPosition) {
    newPosition++;
  }

  this.workspace_.getModuleManager().moveModule(module, newPosition);
};

/**
 * Mouse up handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.onMouseMove_ = function(e) {
  if (!this.dragDropModuleEl_) {
    return;
  }

  const targetModuleEl = this.getModuleElementFromEvent_(e);
  if (!targetModuleEl || targetModuleEl === this.dragDropModuleEl_) {
    if (this.dragDropTargetModuleEl_) {
      this.dragDropTargetModuleEl_.classList.remove(
        "blocklyModuleBarTabDropZone"
      );
      this.dragDropTargetModuleEl_ = null;
    }

    return;
  }

  if (targetModuleEl === this.dragDropTargetModuleEl_) {
    return;
  }

  if (this.dragDropTargetModuleEl_) {
    this.dragDropTargetModuleEl_.classList.remove(
      "blocklyModuleBarTabDropZone"
    );
  }

  this.dragDropTargetModuleEl_ = targetModuleEl;
  this.dragDropTargetModuleEl_.classList.add("blocklyModuleBarTabDropZone");
};

/**
 * Mouse wheel handler.
 * @param {!Event} e The browser event.
 * @private
 */
 ModuleBar.prototype.onMouseWheel_ = function(e) {
  e.preventDefault();
  this.ulContainer_.scrollBy({
    left: e.deltaY < 0 ? -30 : 30,
  });
};

/**
 * Workspace listener on change.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.onWorkspaceChange_ = function(e) {
  if (e.type === eventUtils.FINISHED_LOADING) {
    this.isFinishedLoading_ = true;

    this.htmlContainer_.classList.remove('cursorNotAllowed');
  }
};

/**
 * Activate module control handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.handleShowModuleMenu_ = function(e) {
  const self_ = this;
  const menuOptions = [
    {
      text: Blockly.Msg["RENAME_MODULE"],
      enabled: true,
      callback: function() {
        self_.handleRenameModule_();
      },
    },
    {
      text: Blockly.Msg["DELETE_MODULE"],
      enabled: true,
      callback: function() {
        self_.handleDeleteModule_();
      },
    },
  ];

  Blockly.ContextMenu.show(e, menuOptions, this.workspace_.RTL);
};

/**
 * Activate module control handler.
 * @param {!Event} e The browser event.
 * @private
 */
ModuleBar.prototype.handleActivateModule_ = function(e) {
  const moduleEl = this.getModuleElementFromEvent_(e);
  if (!moduleEl) {
    return;
  }

  const module = this.workspace_
    .getModuleManager()
    .getModuleById(moduleEl.getAttribute("data-module-id"));
  if (!module) {
    return;
  }

  this.workspace_.getModuleManager().activateModule(module);
};

/**
 * Finds the containing module element given an event.
 * @param {!Event} e The browser event.
 * @return {?Element} The module element or null if no module element is
 *     found.
 * @private
 */
ModuleBar.prototype.getModuleElementFromEvent_ = function(e) {
  let target = e.target;
  while (target instanceof Element) {
    const moduleId = target.getAttribute("data-module-id");
    if (moduleId) {
      return target;
    }

    if (target === this.htmlContainer_) {
      return null;
    }

    target = target.parentNode;
  }
  return null;
};

/**
 * Create module control handler.
 * @private
 */
ModuleBar.prototype.handleCreateModule_ = function() {
  const workspace = this.workspace_;

  Blockly.dialog.prompt(
    Blockly.Msg["NEW_MODULE_TITLE"],
    "",
    function(moduleName) {
      if (moduleName) {
        moduleName = moduleName.replace(/[\s\xa0]+/g, " ").trim();
      }

      if (moduleName) {
        const existingGroup = Blockly.Events.getGroup();
        if (!existingGroup) {
          Blockly.Events.setGroup(true);
        }
        try {
          const module = workspace.getModuleManager().createModule(moduleName);
          workspace.getModuleManager().activateModule(module);
        } finally {
          Blockly.Events.setGroup(false);
        }
      }
    }
  );
};

/**
 * Rename module control handler.
 * @private
 */
ModuleBar.prototype.handleRenameModule_ = function() {
  const workspace = this.workspace_;
  const activeModule = workspace.getModuleManager().getActiveModule();

  Blockly.dialog.prompt(
    Blockly.Msg["RENAME_MODULE_TITLE"],
    activeModule.getName(),
    function(moduleName) {
      if (moduleName) {
        moduleName = moduleName.replace(/[\s\xa0]+/g, " ").trim();
      }

      if (moduleName) {
        workspace.getModuleManager().renameModule(activeModule, moduleName);
      }
    }
  );
};

/**
 * Delete module control handler.
 * @private
 */
ModuleBar.prototype.handleDeleteModule_ = function() {
  const workspace = this.workspace_;
  const activeModule = workspace.getModuleManager().getActiveModule();

  if (workspace.getModuleManager().getAllModules().length <= 1) {
    Blockly.dialog.alert(Blockly.Msg["LAST_MODULE_DELETE_RESTRICTION"]);
    return;
  }

  if (workspace.getTopBlocks(false, true).length > 0) {
    Blockly.dialog.alert(Blockly.Msg["NOT_EMPTY_MODULE_DELETE_RESTRICTION"]);
    return;
  }

  const existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    const previousModule = workspace
      .getModuleManager()
      .deleteModule(activeModule);
    workspace.getModuleManager().activateModule(previousModule);
  } finally {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Updates module bar colors from theme.
 * @package
 */
ModuleBar.prototype.updateColourFromTheme = function() {
  // TODO: theme
};

/**
 * Dispose of this moduleBar.
 */
ModuleBar.prototype.dispose = function() {
  this.detachEvents_();

  this.workspace_.getThemeManager().unsubscribe(this.htmlContainer_);
  utilsDom.removeNode(this.htmlContainer_);
};

/**
 * CSS for ModuleBar. See css.js for use.
 */
Css.register(
  `
  .blocklyModuleBarContainer {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .cursorNotAllowed {
    cursor: not-allowed;
  }


  .blocklyModuleBarTabDropZone {
    border-right: 5px solid #ccc;
    cursor: grab;
  }

  .blocklyModuleBarLink {
    display: block;
    padding: 5px;
    text-decoration: none;
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-family: sans-serif;
    font-size: 16px;
  }

  .blocklyModuleName {
    margin: 0px 5px;
  }

  .blocklyModuleBarLinkActive {
    background-color: #ddd;
    cursor: grab;
    border-color: #ddd;
  }

  .blocklyModuleBarContainer:not(.cursorNotAllowed) > .blocklyModuleBarTab:not(.blocklyModuleBarTabDropZone) .blocklyModuleBarTab:not(.blocklyModuleBarTabCreate) .blocklyModuleBarLink:not(.blocklyModuleBarLinkActive):hover {
    background-color: #e4e4e4;
    border-color: #e4e4e4;
  }

  .blocklyModuleBarTabMenuIcon {
    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='255px' height='255px' viewBox='0 0 255 255' style='enable-background:new 0 0 255 255;' xml:space='preserve'%3E%3Cg%3E%3Cg id='arrow-drop-down'%3E%3Cpolygon points='0,63.75 127.5,191.25 255,63.75 '/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
  }

  .blocklyModuleBarTabCreate {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background-color: #ddd;
    opacity: 0.65;
  }
   
  .blocklyModuleBarTabCreate:hover {
    opacity: 1;
    cursor: pointer;
  }

  .blocklyModuleBarTabIcon {
    opacity: 0.5;
    cursor: default;
    background-repeat: no-repeat;
    background-size: contain;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0px 2px;
  }

  .blocklyModuleBarTabIcon:hover {
    opacity: 1;
  }
  `,
  "modulebar"
);

exports.ModuleBar = ModuleBar;
