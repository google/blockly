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
'use strict';

goog.provide('Blockly.ModuleBar');

goog.require('Blockly.Css');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * Class for a module bar.
 * Creates the moduleBar's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new module box.
 * @constructor
 */
Blockly.ModuleBar = function(workspace) {
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

  /**
   * Click event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onClickWrapper_ = null;

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
   * Mouse up event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onMouseUpWrapper_ = null;
};

/**
 * Initializes the module bar.
 */
Blockly.ModuleBar.prototype.init = function() {
  var injectionContainer = this.workspace_.getInjectionDiv();

  /**
   * HTML container for the ModuleBar.
   * @type {Element}
   */
  this.htmlContainer_ = document.createElement('ul');
  this.htmlContainer_.className = 'blocklyModuleBarContainer blocklyNonSelectable';
  injectionContainer.parentNode.insertBefore(this.htmlContainer_, injectionContainer);

  if (this.workspace_.RTL) {
    this.htmlContainer_.setAttribute('dir', 'rtl');
  }

  this.attachEvents_();

  // TODO: theme settings
  /*
  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.htmlContainer_, 'moduleBarBackgroundColour',
      'background-color');
  themeManager.subscribe(this.htmlContainer_, 'moduleBarForegroundColour', 'color');
  */

  this.render();
};

/**
 * Fill the module Bar.
 * @package
 */
Blockly.ModuleBar.prototype.render = function() {
  this.htmlContainer_.innerHTML = '';

  var modules = this.workspace_.getModuleManager().getAllModules();
  for (var i = 0; i < modules.length; i++) {
    var tab = document.createElement('li');
    tab.className = 'blocklyModuleBarTab';
    tab.setAttribute('data-module-id', modules[i].getId());
    tab.setAttribute('ondragstart', 'return false;');

    var link = document.createElement('a');

    var name = document.createElement('span');
    name.className = 'blocklyModuleName';
    name.appendChild(Blockly.utils.xml.createTextNode(modules[i].name));
    link.appendChild(name);


    var activeModule = this.workspace_.getModuleManager().getActiveModule();
    if (activeModule && modules[i].getId() === activeModule.getId()) {
      link.className = 'blocklyModuleBarLink blocklyModuleBarLinkActive';

      var menuIcon = document.createElement('span');
      menuIcon.className = 'blocklyModuleBarTabIcon blocklyModuleBarTabMenuIcon';
      menuIcon.setAttribute('role', 'module-menu-control');
      link.appendChild(menuIcon);
    } else {
      link.className = 'blocklyModuleBarLink';
    }

    tab.appendChild(link);

    this.htmlContainer_.appendChild(tab);
  }

  // create tab
  var newTab = document.createElement('li');
  newTab.className = 'blocklyModuleBarTab blocklyModuleBarTabCreate';
  newTab.setAttribute('role', 'create-module-control');
  newTab.setAttribute('title', Blockly.Msg['NEW_MODULE']);

  var newLink =  document.createElement('a');
  newLink.className = 'blocklyModuleBarLink';
  newLink.setAttribute('role', 'create-module-control');

  var createIcon = document.createElement('span');
  createIcon.className = 'blocklyModuleBarTabIcon blocklyModuleBarTabCreateIcon';
  createIcon.setAttribute('role', 'create-module-control');

  newLink.appendChild(createIcon);
  newTab.appendChild(newLink);
  this.htmlContainer_.appendChild(newTab);
};

/**
 * Set whether this module bar's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.ModuleBar.prototype.setContainerVisible = function(visible) {
  this.htmlContainer_.setAttribute('style', 'display: ' + (visible ? '' : 'none'));
};

/**
 * Adds the event listeners.
 * @private
 */
Blockly.ModuleBar.prototype.attachEvents_ = function() {
  this.onClickWrapper_ = Blockly.bindEventWithChecks_(this.htmlContainer_,
    'click', this, this.onMouseClick_);

  this.onMouseDownWrapper_ = Blockly.bindEventWithChecks_(this.htmlContainer_,
    'mousedown', this, this.onMouseDown_);

  this.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document,
    'mouseup', this, this.onMouseUp_);

  this.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(document,
    'mousemove', this, this.onMouseMove_);
};

/**
 * Removes the event listeners.
 * @private
 */
Blockly.ModuleBar.prototype.detachEvents_ = function() {
  if (this.onClickWrapper_) {
    Blockly.unbindEvent_(this.onClickWrapper_);
    this.onClickWrapper_ = null;
  }

  if (this.onMouseDownWrapper_) {
    Blockly.unbindEvent_(this.onMouseDownWrapper_);
    this.onMouseDownWrapper_ = null;
  }

  if (this.onMouseUpWrapper_) {
    Blockly.unbindEvent_(this.onMouseUpWrapper_);
    this.onMouseUpWrapper_ = null;
  }

  if (this.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(this.onMouseMoveWrapper_);
    this.onMouseMoveWrapper_ = null;
  }
};

/**
 * Mouse click handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.onMouseClick_ = function(e) {
  var role = e.target.getAttribute('role');

  switch (role) {
    case 'module-menu-control':
      return this.handleShowModuleMenu_(e);
    case 'create-module-control':
      return this.handleCreateModule_();
  }

  return this.handleActivateModule_(e);
};

/**
 * Mouse down handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.onMouseDown_ = function(e) {
  var role = e.target.getAttribute('role');
  if (role === 'module-menu-control') {
    return;
  }

  if (this.workspace_.getModuleManager().getAllModules().length < 2) {
    return;
  }

  var moduleEl = this.getModuleElementFromEvent_(e);
  if (!moduleEl) {
    return;
  }

  var module = this.workspace_.getModuleManager().getModuleById(moduleEl.getAttribute('data-module-id'));
  if (!module) {
    return;
  }

  if (module.getId() !== this.workspace_.getModuleManager().getActiveModule().getId()) {
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
Blockly.ModuleBar.prototype.onMouseUp_ = function(e) {
  if (!this.dragDropModuleEl_) {
    return;
  }

  var module = this.workspace_.getModuleManager().getModuleById(this.dragDropModuleEl_.getAttribute('data-module-id'));
  this.dragDropModuleEl_ = null;
  if (!this.dragDropTargetModuleEl_) {
    return;
  }

  var targetModule = this.workspace_.getModuleManager().getModuleById(this.dragDropTargetModuleEl_.getAttribute('data-module-id'));
  this.dragDropTargetModuleEl_ = null;

  this.workspace_.getModuleManager().moveModule(module, this.workspace_.getModuleManager().getModuleOrder(targetModule.getId()));
};

/**
 * Mouse up handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.onMouseMove_ = function(e) {
  if (!this.dragDropModuleEl_) {
    return;
  }

  var targetModuleEl = this.getModuleElementFromEvent_(e);
  if (!targetModuleEl || targetModuleEl === this.dragDropModuleEl_) {
    if (this.dragDropTargetModuleEl_) {
      this.dragDropTargetModuleEl_.classList.remove('blocklyModuleBarTabDropZone');
      this.dragDropTargetModuleEl_ = null;
    }

    return;
  }

  if (targetModuleEl === this.dragDropTargetModuleEl_) {
    return;
  }

  if (this.dragDropTargetModuleEl_) {
    this.dragDropTargetModuleEl_.classList.remove('blocklyModuleBarTabDropZone');
  }

  this.dragDropTargetModuleEl_ = targetModuleEl;
  this.dragDropTargetModuleEl_.classList.add('blocklyModuleBarTabDropZone');
};

/**
 * Mouse click handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.onMouseClick_ = function(e) {
  var role = e.target.getAttribute('role');

  switch (role) {
    case 'module-menu-control':
      return this.handleShowModuleMenu_(e);
    case 'create-module-control':
      return this.handleCreateModule_();
  }

  return this.handleActivateModule_(e);
};


/**
 * Activate module control handler.
 * @private
 */
Blockly.ModuleBar.prototype.handleShowModuleMenu_ = function(e) {
  var menuOptions = [
    {
      text: Blockly.Msg['RENAME_MODULE'],
      enabled: true,
      callback: () => {
        this.handleRenameModule_();
      }
    },
    {
      text: Blockly.Msg['DELETE_MODULE'],
      enabled: true,
      callback: () => {
        this.handleDeleteModule_();
      }
    }
  ];

  Blockly.ContextMenu.show(e, menuOptions, this.workspace_.RTL);
};

/**
 * Activate module control handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.handleActivateModule_ = function(e) {
  var moduleEl = this.getModuleElementFromEvent_(e);
  if (!moduleEl) {
    return;
  }

  var module = this.workspace_.getModuleManager().getModuleById(moduleEl.getAttribute('data-module-id'));
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
Blockly.ModuleBar.prototype.getModuleElementFromEvent_ = function(e) {
  var target = e.target;
  while (target instanceof Element) {
    var moduleId = target.getAttribute('data-module-id');
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
Blockly.ModuleBar.prototype.handleCreateModule_ = function() {
  var workspace = this.workspace_;

  Blockly.prompt(Blockly.Msg['NEW_MODULE_TITLE'], '', function(moduleName) {
    if (moduleName) {
      moduleName = moduleName.replace(/[\s\xa0]+/g, ' ').trim();
    }

    if (moduleName) {
      var existingGroup = Blockly.Events.getGroup();
      if (!existingGroup) {
        Blockly.Events.setGroup(true);
      }
      try {
        var module = workspace.getModuleManager().createModule(moduleName);
        workspace.getModuleManager().activateModule(module);
      } finally {
        Blockly.Events.setGroup(false);
      }
    }
  });
};

/**
 * Rename module control handler.
 * @private
 */
Blockly.ModuleBar.prototype.handleRenameModule_ = function() {
  var workspace = this.workspace_;
  var activeModule =  workspace.getModuleManager().getActiveModule();

  Blockly.prompt(Blockly.Msg['RENAME_MODULE_TITLE'], activeModule.name, function(moduleName) {
    if (moduleName) {
      moduleName = moduleName.replace(/[\s\xa0]+/g, ' ').trim();
    }

    if (moduleName) {
      workspace.getModuleManager().renameModule(activeModule, moduleName);
    }
  });
};


/**
 * Delete module control handler.
 * @private
 */
Blockly.ModuleBar.prototype.handleDeleteModule_ = function() {
  var workspace = this.workspace_;
  var activeModule =  workspace.getModuleManager().getActiveModule();

  if (workspace.getModuleManager().getAllModules().length <= 1) {
    Blockly.alert(Blockly.Msg['LAST_MODULE_DELETE_RESTRICTION']);
    return;
  }

  if (workspace.getTopBlocks(false, true).length > 0) {
    Blockly.alert(Blockly.Msg['NOT_EMPTY_MODULE_DELETE_RESTRICTION']);
    return;
  }

  workspace.getModuleManager().deleteModule(activeModule);
};


/**
 * Updates module bar colors from theme.
 * @package
 */
Blockly.ModuleBar.prototype.updateColourFromTheme = function() {
  // TODO: theme
};

/**
 * Dispose of this moduleBar.
 */
Blockly.ModuleBar.prototype.dispose = function() {
  this.detachEvents_();

  this.workspace_.getThemeManager().unsubscribe(this.htmlContainer_);
  Blockly.utils.dom.removeNode(this.htmlContainer_);
};

/**
 * CSS for ModuleBar.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyModuleBarContainer {',
    'display: -webkit-box;',
    'display: -ms-flexbox;',
    'display: flex;',
    '-ms-flex-wrap: wrap;',
    'flex-wrap: wrap;',
    'list-style: none;',
    'padding: 0;',
    'margin: 0;',
  '}',


  '.blocklyModuleBarTabDropZone {',
    'border-right: 5px solid #ccc;',
    'cursor: grab;',
  '}',

  '.blocklyModuleBarLink {',
    'display: block;',
    'padding: 5px;',
    'text-decoration: none;',
    'border-top: 1px solid transparent;',
    'border-left: 1px solid transparent;',
    'border-right: 1px solid transparent;',
    'border-top-left-radius: 8px;',
    'border-top-right-radius: 8px;',
    'font-family: sans-serif;',
    'font-size: 16px;',
  '}',

  '.blocklyModuleName {',
    'margin: 0px 5px;',
  '}',

  '.blocklyModuleBarLinkActive {',
    'background-color: #ddd;',
    'cursor: grab;',
    'border-color: #ddd;',
  '}',

  '.blocklyModuleBarTab:not(.blocklyModuleBarTabDropZone) .blocklyModuleBarLink:not(.blocklyModuleBarLinkActive):hover {',
    'background-color: #e4e4e4;',
    'border-color: #e4e4e4;',
  '}',

  '.blocklyModuleBarTabMenuIcon {',
    'background-image: url("data:image/svg+xml,%3C%3Fxml version=\'1.0\' encoding=\'iso-8859-1\'%3F%3E%3C!DOCTYPE svg PUBLIC \'-//W3C//DTD SVG 1.1//EN\' \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'%3E%3Csvg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'255px\' height=\'255px\' viewBox=\'0 0 255 255\' style=\'enable-background:new 0 0 255 255;\' xml:space=\'preserve\'%3E%3Cg%3E%3Cg id=\'arrow-drop-down\'%3E%3Cpolygon points=\'0,63.75 127.5,191.25 255,63.75 \'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");',
  '}',

  '.blocklyModuleBarTabCreateIcon {',
    'background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjM1N3B4IiBoZWlnaHQ9IjM1N3B4IiB2aWV3Qm94PSIwIDAgMzU3IDM1NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGcgaWQ9ImFkZCI+DQoJCTxwYXRoIGQ9Ik0zNTcsMjA0SDIwNHYxNTNoLTUxVjIwNEgwdi01MWgxNTNWMGg1MXYxNTNoMTUzVjIwNHoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==\');',
    'width: 15px;',
    'height: 15px;',
  '}',

  '.blocklyModuleBarTabIcon {',
    'opacity: 0.5;',
    'cursor: default;',
    'background-repeat: no-repeat;',
    'background-size: contain;',
    'display: inline-block;',
    'width: 12px;',
    'height: 12px;',
    'margin: 0px 2px;',
  '}',

  '.blocklyModuleBarTabIcon:hover {',
    'opacity: 1;',
  '}',

  /* eslint-enable indent */
]);
