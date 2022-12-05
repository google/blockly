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
const dom = goog.require('Blockly.utils.dom');
const utilsDom = goog.require("Blockly.utils.dom");
const browserEvents = goog.require("Blockly.browserEvents");
const eventUtils = goog.require("Blockly.Events.utils");
const {Svg} = goog.require('Blockly.utils.Svg');

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
  this.htmlContainer_.id = 'module-bar-container';
  this.htmlContainer_.className =
  "blocklyModuleBarContainer blocklyNonSelectable cursorNotAllowed";

  this.ulContainer_ = document.createElement("ul");
  this.ulContainer_.className = "blocklyModuleBarUl";
  this.htmlContainer_.appendChild(this.ulContainer_);
  injectionContainer.appendChild(this.htmlContainer_);

  if (this.workspace_.RTL) {
    this.htmlContainer_.setAttribute("dir", "rtl");
  }

  // create tab
  const newTab = document.createElement("div");
  newTab.className = "blocklyModuleBarTab blocklyModuleBarTabCreate";
  newTab.setAttribute("role", "create-module-control");

  const newLink = document.createElement("a");
  newLink.className = "blocklyModuleBarLink";
  newLink.setAttribute("role", "create-module-control");
  newTab.appendChild(newLink);
  this.htmlContainer_.appendChild(newTab);

  /**
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6.5" width="1" height="14" fill="white"/>
      <rect y="7.5" width="1" height="14" transform="rotate(-90 0 7.5)" fill="white"/>
    </svg>
  */
  const svgElem = dom.createSvgElement(Svg.SVG, {
    'xmlns': dom.SVG_NS,
    'viewBox': "0 0 14 14",
    'width': '14',
    'height': '14',
    'fill': 'none',
    'role': 'create-module-control',
  }, newLink);

  dom.createSvgElement(
      Svg.RECT, {
        'x': '6.5',
        'width': '1',
        'height': '14',
        'fill': 'white',
      },
  svgElem);

  dom.createSvgElement(
    Svg.RECT, {
      'y': '7.5',
      'width': '1',
      'height': '14',
      'fill': 'white',
      'transform': 'rotate(-90 0 7.5)',
    },
  svgElem);

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

  // Hack wait when the elements rendered in document and scroll to active tab.
  setTimeout(() => {
    const activeTab = document.querySelector(".blocklyModuleBarLinkActive");
    activeTab.scrollIntoView({block: "center", behavior: "smooth", inline: "center"});
    this.needShowShadow_();
  }, 0);
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

  this.needShowShadow_();
};

ModuleBar.prototype.needShowShadow_ = function() {
  const ulElem = document.querySelector(".blocklyModuleBarUl");
  const containerElem = document.querySelector(".blocklyModuleBarContainer");
  const DEAD_ZONE = 10;

  if (ulElem.scrollLeft > 0) {
    containerElem.classList.add('visibleLeft');
  } else {
    containerElem.classList.remove('visibleLeft');
  }

  if (ulElem.offsetWidth + Math.round(ulElem.scrollLeft) + DEAD_ZONE <= ulElem.scrollWidth) {
    containerElem.classList.add('visibleRight');
  } else {
    containerElem.classList.remove('visibleRight');
  }
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
  setTimeout(() => {this.needShowShadow_();}, 0);
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
  }

  .blocklyModuleBarUl {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    white-space: nowrap;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 35px;
    overflow-x: overlay;
    position: relative;
  }

  .cursorNotAllowed {
    cursor: not-allowed;
  }

  .blocklyModuleBarTab {
    margin: 0 5px;
  }

  .blocklyModuleBarTabDropZone {
    border-right: 5px solid #ccc;
    cursor: grab;
  }

  .blocklyModuleBarLink {
    display: flex;
    align-items: center;
    padding: 10px;
    text-decoration: none;
    border-radius: 8px 8px 0px 0px;
    font-family: sans-serif;
    font-size: 14px;
    height: 35px;
    background-color: #eee;
    border-color: #eee;
  }

  .blocklyModuleName {
    margin: 0px 5px;
  }

  .blocklyModuleBarLinkActive {
    background-color: #5867dd;
    cursor: grab;
    border-color: #5867dd;
    color: #fff !important;
  }

  .blocklyModuleBarTabMenuIcon {
    background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='10' height='7' viewBox='0 0 10 7' style='enable-background:new 255 255 255 255;' xml:space='preserve'%3E%3Cg%3E%3Cg id='arrow-drop-down'%3E%3Cpath d='M10 1.40446L5 6.5L0 1.40446L0.8875 0.5L5 4.69108L9.1125 0.5L10 1.40446Z' fill='white' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
  }

  .blocklyModuleBarTabCreate {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    background-color: #08976d;
    height: 35px;
  }

  .blocklyModuleBarTabCreate:hover > .blocklyModuleBarLink {
    background-color: #5867dd;
    transition 0.15s ease-in-out;
  }

  .blocklyModuleBarTabCreate > .blocklyModuleBarLink {
    background-color: #08976d;
    transition 0.15s ease-in-out;
  }
   
  .blocklyModuleBarTabCreate:hover {
    cursor: pointer;
    background-color: #5867dd;
    transition 0.15s ease-in-out;
  }

  .visibleRight.blocklyModuleBarContainer::after {
    content: '';
    position: absolute;
    z-index: 1;
    right: 0;
    height: 30px;
    width: 40px;
    margin-right: 40px;
    background: linear-gradient( to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
  }

  .visibleLeft.blocklyModuleBarContainer::before {
    content: '';
    position: absolute;
    z-index: 1;
    left: 0;
    height: 30px;
    width: 40px;
    margin-left: inherit;
    background: linear-gradient( to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
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
