/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Toolbox');

goog.require('Blockly.Css');
goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.navigation');
goog.require('Blockly.registry');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.CollapsibleToolboxItem');
goog.requireType('Blockly.IBlocklyActionable');
goog.requireType('Blockly.IDeleteArea');
goog.requireType('Blockly.IStyleable');
goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.SelectableToolboxItem');
goog.requireType('Blockly.ToolboxItem');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 * @implements {Blockly.IBlocklyActionable}
 * @implements {Blockly.IDeleteArea}
 * @implements {Blockly.IStyleable}
 * @implements {Blockly.IToolbox}
 */
Blockly.Toolbox = function(workspace) {
  /**
   * The workspace this toolbox is on.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * The JSON describing the contents of this toolbox.
   * @type {!Array<!Blockly.utils.toolbox.ToolboxItemDef>}
   * @protected
   */
  this.toolboxDef_ = workspace.options.languageTree || [];

  /**
   * Whether the toolbox should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspace.options.horizontalLayout;

  /**
   * The html container for the toolbox.
   * @type {?Element}
   */
  this.HtmlDiv = null;

  /**
   * The html container for the contents of a toolbox.
   * @type {?Element}
   * @protected
   */
  this.contentsDiv_ = null;

  /**
   * The list of items in the toolbox.
   * @type {!Array<!Blockly.ToolboxItem>}
   * @protected
   */
  this.contents_ = [];

  /**
   * The width of the toolbox.
   * @type {number}
   * @protected
   */
  this.width_ = 0;

  /**
   * The height of the toolbox.
   * @type {number}
   * @protected
   */
  this.height_ = 0;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * The flyout for the toolbox.
   * @type {?Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;

  /**
   * A map from toolbox item IDs to toolbox items.
   * @type {!Object<string, Blockly.ToolboxItem>}
   * @protected
   */
  this.contentIds_ = {};

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

  /**
   * The currently selected item.
   * @type {?Blockly.SelectableToolboxItem}
   * @protected
   */
  this.selectedItem_ = null;

  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   * @type {!Array<!Blockly.EventData>}
   * @protected
   */
  this.boundEvents_ = [];
};

/**
 * Initializes the toolbox
 * @public
 */
Blockly.Toolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = workspace.getParentSvg();

  this.flyout_ = this.createFlyout_();

  this.HtmlDiv = this.createDom_(this.workspace_);
  this.render(this.toolboxDef_);
  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');

  // Insert the flyout after the workspace.
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.flyout_.init(workspace);
};

/**
 * Creates the dom for the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace this toolbox is on.
 * @return {!Element} The html container for the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.createDom_ = function(workspace) {
  var svg = workspace.getParentSvg();

  var container = this.createContainer_();

  this.contentsDiv_ = this.createContentsContainer_();
  this.contentsDiv_.tabIndex = 0;
  Blockly.utils.aria.setRole(this.contentsDiv_, Blockly.utils.aria.Role.TREE);
  container.appendChild(this.contentsDiv_);

  svg.parentNode.insertBefore(container, svg);

  this.attachEvents_(container, this.contentsDiv_);
  return container;
};

/**
 * Creates the container div for the toolbox.
 * @return {!Element} The html container for the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.createContainer_ = function() {
  var toolboxContainer = document.createElement('div');
  toolboxContainer.setAttribute('layout', this.isHorizontal() ? 'h' : 'v');
  Blockly.utils.dom.addClass(toolboxContainer, 'blocklyToolboxDiv');
  toolboxContainer.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  return toolboxContainer;
};

/**
 * Creates the container for all the contents in the toolbox.
 * @return {!Element} The html container for the toolbox contents.
 * @protected
 */
Blockly.Toolbox.prototype.createContentsContainer_ = function() {
  var contentsContainer = document.createElement('div');
  Blockly.utils.dom.addClass(contentsContainer, 'blocklyToolboxContents');
  if (this.isHorizontal()) {
    contentsContainer.style.flexDirection = 'row';
  }
  return contentsContainer;
};

/**
 * Adds event listeners to the toolbox container div.
 * @param {!Element} container The html container for the toolbox.
 * @param {!Element} contentsContainer The html container for the contents
 *     of the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.attachEvents_ = function(container,
    contentsContainer) {
  // Clicking on toolbox closes popups.
  var clickEvent = Blockly.bindEventWithChecks_(container, 'mousedown', this,
      this.onClick_, /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(clickEvent);

  var keyDownEvent = Blockly.bindEventWithChecks_(contentsContainer, 'keydown',
      this, this.onKeyDown_, /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(keyDownEvent);
};

/**
 * Creates the flyout based on the toolbox layout.
 * @return {!Blockly.Flyout} The flyout for the toolbox.
 * @throws {Error} If missing a require for `Blockly.HorizontalFlyout`,
 *     `Blockly.VerticalFlyout`, and no flyout plugin is specified.
 * @protected
 */
Blockly.Toolbox.prototype.createFlyout_ = function() {
  var workspace = this.workspace_;
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer,
        'rendererOverrides': workspace.options.rendererOverrides,
        'toolboxPosition': workspace.options.toolboxPosition
      }));

  var FlyoutClass = null;
  if (workspace.horizontalLayout) {
    FlyoutClass = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, workspace.options);
  } else {
    FlyoutClass = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX, workspace.options);
  }

  if (!FlyoutClass) {
    throw Error('Blockly.VerticalFlyout, Blockly.HorizontalFlyout or your own' +
        ' custom flyout must be required.');
  }
  return new FlyoutClass(workspaceOptions);
};

/**
 * Adds all the toolbox items to the toolbox.
 * @param {!Array<!Blockly.utils.toolbox.ToolboxItemDef>} toolboxDef Array
 *     holding objects containing information on the contents of the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.renderContents_ = function(toolboxDef) {
  for (var i = 0, childIn; (childIn = toolboxDef[i]); i++) {
    // TODO: Add classes to registry so we can avoid this switch statement.
    switch (childIn['kind'].toUpperCase()) {
      case 'CATEGORY':
        childIn = /** @type {Blockly.utils.toolbox.Category} */ (childIn);
        var category = new Blockly.ToolboxCategory(childIn, this);
        this.addToolboxItem_(category);
        var categoryDom = category.createDom();
        if (categoryDom) {
          this.contentsDiv_.appendChild(categoryDom);
        }
        break;
      case 'SEP':
        childIn = /** @type {Blockly.utils.toolbox.Separator} */ (childIn);
        var separator = new Blockly.ToolboxSeparator(childIn, this);
        this.addToolboxItem_(separator);
        var separatorDom = separator.createDom();
        if (separatorDom) {
          this.contentsDiv_.appendChild(separatorDom);
        }
        break;
      default:
        // TODO: Handle someone adding a custom component.
    }
  }
};

/**
 * Fills the toolbox with new toolbox items and removes any old contents.
 * @param {!Array<!Blockly.utils.toolbox.ToolboxItemDef>} toolboxDef Array
 *     holding objects containing information on the contents of the toolbox.
 * @package
 */
Blockly.Toolbox.prototype.render = function(toolboxDef) {
  this.toolboxDef_ = toolboxDef;
  // TODO: Future improvement to compare the new toolboxDef with the old and
  //  only re render what has changed.
  for (var i = 0; i < this.contents_.length; i++) {
    var child = this.contents_[i];
    child.getDiv().remove();
  }
  this.contents_ = [];
  this.contentIds_ = {};
  this.renderContents_(toolboxDef);
  this.position();
};

/**
 * Adds an item to the toolbox.
 * @param {!Blockly.ToolboxItem} toolboxItem The item in the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.addToolboxItem_ = function(toolboxItem) {
  this.contents_.push(toolboxItem);
  this.contentIds_[toolboxItem.getId()] = toolboxItem;
  if (toolboxItem.isCollapsible()) {
    var collapsibleItem = /** @type {Blockly.CollapsibleToolboxItem} */
        (toolboxItem);
    for (var i = 0, child; (child = collapsibleItem.getContents()[i]); i++) {
      this.addToolboxItem_(child);
    }
  }
};

/**
 * CSS for Toolbox.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyToolboxDelete {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyToolboxGrab {',
    'cursor: url("<<<PATH>>>/handclosed.cur"), auto;',
    'cursor: grabbing;',
    'cursor: -webkit-grabbing;',
  '}',

  /* Category tree in Toolbox. */
  '.blocklyToolboxDiv {',
    'background-color: #ddd;',
    'overflow-x: visible;',
    'overflow-y: auto;',
    'padding: 4px 0 4px 0;',
    'position: absolute;',
    'z-index: 70;', /* so blocks go under toolbox when dragging */
    '-webkit-tap-highlight-color: transparent;', /* issue #1345 */
  '}',

  '.blocklyToolboxCategory {',
    'padding-bottom: 3px',
  '}',

  '.blocklyToolboxCategory:not(.blocklyTreeSelected):hover {',
    'background-color: rgba(255, 255, 255, 0.2);',
  '}',

  '.blocklyToolboxDiv[layout="h"] .blocklyToolboxCategory {',
    'margin: 1px 5px 1px 0;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"][layout="h"] .blocklyToolboxCategory {',
    'margin: 1px 0 1px 5px;',
  '}',

  '.blocklyToolboxContents {',
    'display: flex;',
    'flex-wrap: wrap;',
    'flex-direction: column;',
  '}',

  '.blocklyToolboxContents:focus {',
    'outline: none;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'padding-right: 8px;',
    'pointer-events: none',
    'white-space: nowrap;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
    'padding-right: 0px',
  '}',


  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyToolboxDiv[layout="h"] .blocklyTreeSeparator {',
    'border-right: solid #e5e5e5 1px;',
    'border-bottom: none;',
    'height: auto;',
    'margin: 0 5px 0 5px;',
    'padding: 5px 0;',
    'width: 0;',
  '}',

  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'visibility: hidden;',
    'width: 16px;',
  '}',

  '.blocklyTreeIconClosed {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeIconClosed {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosed {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeSelected>.blocklyTreeIconClosed {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeLabel {',
    'cursor: default;',
    'font: 16px sans-serif;',
    'padding: 0 3px;',
    'vertical-align: middle;',
  '}',

  '.blocklyToolboxDelete .blocklyTreeLabel {',
    'cursor: url("<<<PATH>>>/handdelete.cur"), auto;',
  '}',

  '.blocklyTreeSelected .blocklyTreeLabel {',
    'color: #fff;',
  '}'
  /* eslint-enable indent */
]);

Blockly.registry.register(Blockly.registry.Type.TOOLBOX,
    Blockly.registry.DEFAULT, Blockly.Toolbox);
