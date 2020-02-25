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
  this.htmlContainer_ = null;

  /**
   * Click event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onClickWrapper_ = null;
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

    var link = document.createElement('a');

    var name = document.createElement('span');
    name.appendChild(Blockly.utils.xml.createTextNode(modules[i].name));
    link.appendChild(name);


    if (modules[i].getId() === this.workspace_.getModuleManager().getActiveModule().getId()) {
      link.className = 'blocklyModuleBarLink blocklyModuleBarLinkActive';

      var renameIcon = document.createElement('span');
      renameIcon.className = 'blocklyModuleBarTabIcon blocklyModuleBarTabRenameIcon';
      renameIcon.setAttribute('role', 'rename-module-control');
      renameIcon.setAttribute('title', Blockly.Msg['RENAME_MODULE']);
      link.appendChild(renameIcon);

      var deleteIcon = document.createElement('span');
      deleteIcon.className = 'blocklyModuleBarTabIcon blocklyModuleBarTabDeleteIcon';
      deleteIcon.setAttribute('role', 'delete-module-control');
      deleteIcon.setAttribute('title', Blockly.Msg['DELETE_MODULE']);
      link.appendChild(deleteIcon);
    } else {
      link.className = 'blocklyModuleBarLink';
    }

    tab.appendChild(link);

    this.htmlContainer_.appendChild(tab);
  }

  // create tab
  var tab = document.createElement('li');
  tab.className = 'blocklyModuleBarTab blocklyModuleBarTabCreate';
  tab.setAttribute('role', 'create-module-control');
  tab.setAttribute('title', Blockly.Msg['NEW_MODULE']);

  var link =  document.createElement('a');
  link.className = 'blocklyModuleBarLink';
  link.setAttribute('role', 'create-module-control');

  var createIcon = document.createElement('span');
  createIcon.className = 'blocklyModuleBarTabIcon blocklyModuleBarTabCreateIcon';
  createIcon.setAttribute('role', 'create-module-control');

  link.appendChild(createIcon);
  tab.appendChild(link);
  this.htmlContainer_.appendChild(tab);
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
    'click', this, this.handleMouseEvent_);
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
};

/**
 * Handles mouse events.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.handleMouseEvent_ = function(e) {
  console.log(e);
  var role = e.target.getAttribute('role');

  switch (role) {
    case 'create-module-control':
      return this.createModuleControlHandler_();
    case 'rename-module-control':
      return this.renameModuleControlHandler_();
    case 'delete-module-control':
      return this.deleteModuleControlHandler_();
  }

  return this.activateModuleControlHandler_(e);
};

/**
 * Activate module control handler.
 * @param {!Event} e The browser event.
 * @private
 */
Blockly.ModuleBar.prototype.activateModuleControlHandler_ = function(e) {
  var module = this.getModuleFromEvent_(e);
  if (module) {
    this.workspace_.getModuleManager().activateModule(module);
  }
};

/**
 * Finds the containing module given an event.
 * @param {!Event} e The browser event.
 * @return {?Blockly.ModuleModel} The containing module or null if no module is
 *     found.
 * @private
 */
Blockly.ModuleBar.prototype.getModuleFromEvent_ = function(e) {
  var target = e.target;
  while (target != null) {
    var moduleId = target.getAttribute('data-module-id');
    if (moduleId) {
      return this.workspace_.getModuleManager().getModuleById(moduleId);
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
Blockly.ModuleBar.prototype.createModuleControlHandler_ = function() {
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
Blockly.ModuleBar.prototype.renameModuleControlHandler_ = function() {
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
Blockly.ModuleBar.prototype.deleteModuleControlHandler_ = function() {
  var workspace = this.workspace_;
  var activeModule =  workspace.getModuleManager().getActiveModule();

  if (workspace.getModuleManager().getAllModules().length <= 1) {
    Blockly.alert(Blockly.Msg['LAST_MODULE_DELETE_RESTRICTION']);
    return;
  }

  Blockly.confirm(Blockly.Msg['DELETE_MODULE_CONFIRMATION'].replace('%1', activeModule.name), function(ok) {
    if (ok) {
      workspace.getModuleManager().deleteModule(activeModule);
    }
  });
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

  '.blocklyModuleBarTab {',

  '}',

  '.blocklyModuleBarLink {',
    'display: block;',
    'padding: .5rem 1rem;',
    'text-decoration: none;',
    'border-top: 1px solid transparent;',
    'border-left: 1px solid transparent;',
    'border-right: 1px solid transparent;',
    'border-top-left-radius: .7rem;',
    'border-top-right-radius: .7rem;',
    'font-family: sans-serif;',
    'font-size: 16px;',
  '}',

  '.blocklyModuleBarLinkActive {',
    'background-color: #ddd;',
    'border-color: #ddd;',
  '}',

  '.blocklyModuleBarLink:not(.blocklyModuleBarLinkActive):hover {',
    'background-color: #e4e4e4;',
    'border-color: #e4e4e4;',
  '}',

  '.blocklyModuleBarTabRenameIcon {',
    'background:  url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMzgzLjk0NyAzODMuOTQ3IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzODMuOTQ3IDM4My45NDc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8Zz4NCgkJCTxwb2x5Z29uIHBvaW50cz0iMCwzMDMuOTQ3IDAsMzgzLjk0NyA4MCwzODMuOTQ3IDMxNi4wNTMsMTQ3Ljg5MyAyMzYuMDUzLDY3Ljg5MyAJCQkiLz4NCgkJCTxwYXRoIGQ9Ik0zNzcuNzA3LDU2LjA1M0wzMjcuODkzLDYuMjRjLTguMzItOC4zMi0yMS44NjctOC4zMi0zMC4xODcsMGwtMzkuMDQsMzkuMDRsODAsODBsMzkuMDQtMzkuMDQNCgkJCQlDMzg2LjAyNyw3Ny45MiwzODYuMDI3LDY0LjM3MywzNzcuNzA3LDU2LjA1M3oiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K\');',
  '}',

  '.blocklyModuleBarTabDeleteIcon {',
    'background:  url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMjk4LjY2NyAyOTguNjY3IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyOTguNjY3IDI5OC42Njc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cG9seWdvbiBwb2ludHM9IjI5OC42NjcsMzAuMTg3IDI2OC40OCwwIDE0OS4zMzMsMTE5LjE0NyAzMC4xODcsMCAwLDMwLjE4NyAxMTkuMTQ3LDE0OS4zMzMgMCwyNjguNDggMzAuMTg3LDI5OC42NjcgDQoJCQkxNDkuMzMzLDE3OS41MiAyNjguNDgsMjk4LjY2NyAyOTguNjY3LDI2OC40OCAxNzkuNTIsMTQ5LjMzMyAJCSIvPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K\');',
  '}',

  '.blocklyModuleBarTabCreateIcon {',
    'background: url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjM1N3B4IiBoZWlnaHQ9IjM1N3B4IiB2aWV3Qm94PSIwIDAgMzU3IDM1NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzU3IDM1NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGcgaWQ9ImFkZCI+DQoJCTxwYXRoIGQ9Ik0zNTcsMjA0SDIwNHYxNTNoLTUxVjIwNEgwdi01MWgxNTNWMGg1MXYxNTNoMTUzVjIwNHoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==\');',
    'margin: 0px !important;',
  '}',

  '.blocklyModuleBarTabIcon {',
    'opacity: 0.5;',
    'background-repeat: no-repeat;',
    'background-size: contain;',
    'display: inline-block;',
    'width: 12px;',
    'height: 12px;',
    'margin-left: 12px;',
  '}',

  '.blocklyModuleBarTabIcon:hover {',
    'opacity: 1;',
  '}',

  /* eslint-enable indent */
]);
