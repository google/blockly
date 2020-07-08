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

goog.provide('Blockly.NewToolbox');

goog.require('Blockly.ToolboxCategory');
goog.require('Blockly.ToolboxSeparator');

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
Blockly.NewToolbox = function(workspace) {
  /**
   * The workspace this toolbox is on.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * Whether the toolbox should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspace.options.horizontalLayout;

  /**
   * The html container for the toolbox.
   * @type {HTMLDivElement}
   */
  this.HtmlDiv = null;

  /**
   * The width of the toolbox.
   * @type {number}
   */
  this.width = 0;

  /**
   * The height of the toolbox.
   * @type {number}
   */
  this.height = 0;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = workspace.options.RTL;

  /**
   * The list of items in the toolbox.
   * TODO: Create another array to hold the blocks if it is a simple toolbox.
   * @type {Array<Blockly.ToolboxItem>}
   */
  this.toolboxItems = [];

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

  /**
   * The currently selected item.
   * @type {Blockly.IToolboxItem}
   * @protected
   */
  this.selectedItem_ = null;
};

/**
 * Initializes the toolbox.
 */
Blockly.NewToolbox.prototype.init = function() {
  var workspace = this.workspace_;
  var svg = this.workspace_.getParentSvg();

  this.HtmlDiv = this.createContainer_(workspace);
  this.contentsDiv = this.createContentsContainer_();
  if (this.isHorizontal()) {
    this.contentsDiv.style.flexDirection = 'row';
  }
  this.HtmlDiv.appendChild(this.contentsDiv);

  svg.parentNode.insertBefore(this.HtmlDiv, svg);

  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');

  // Clicking on toolbox closes popups.
  Blockly.bindEventWithChecks_(this.HtmlDiv, 'mousedown', this, this.onClick_,
      /* opt_noCaptureIdentifier */ false, /* opt_noPreventDefault */ true);

  this.flyout_ = this.createFlyout_();
  // Insert the flyout after the workspace.
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.flyout_.init(workspace);

  this.render(workspace.options.languageTree);
};

/**
 * Create the container div for the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace that the toolbox is on.
 * @return {!HTMLDivElement} The div that holds the toolbox.
 * @protected
 */
Blockly.NewToolbox.prototype.createContainer_ = function(workspace) {
  var toolboxContainer = document.createElement('div');
  toolboxContainer.className = 'blocklyToolboxDiv blocklyNonSelectable';
  toolboxContainer.setAttribute('dir', workspace.RTL ? 'RTL' : 'LTR');
  return toolboxContainer;
};

/**
 * Create the container for all the contents in the toolbox.
 * @return {!HTMLDivElement} The div that holds the toolbox.
 * @protected
 */
Blockly.NewToolbox.prototype.createContentsContainer_ = function() {
  var contentsContainer = document.createElement('div');
  contentsContainer.classList.add('blocklyToolboxContents');
  return contentsContainer;
};

/**
 * Event listener for when the toolbox is clicked.
 * @param {Event} e Click event to handle.
 * @protected
 */
Blockly.NewToolbox.prototype.onClick_ = function(e) {
  if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
    // Close flyout.
    Blockly.hideChaff(false);
  } else {
    // Just close popups.
    Blockly.hideChaff(true);
  }
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
};

/**
 * Creates the flyout based on the toolbox layout.
 * @return {Blockly.Flyout} The flyout for the toolbox.
 * @throws {Error} If missing a require for both `Blockly.HorizontalFlyout` and
 *     `Blockly.VerticalFlyout`.
 * @protected
 */
Blockly.NewToolbox.prototype.createFlyout_ = function() {
  var workspace = this.workspace_;
  var flyout = null;
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer,
        'rendererOverrides': workspace.options.rendererOverrides
      }));
  workspaceOptions.toolboxPosition = workspace.options.toolboxPosition;

  if (workspace.horizontalLayout) {
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    flyout = new Blockly.HorizontalFlyout(workspaceOptions);
  } else {
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    flyout = new Blockly.VerticalFlyout(workspaceOptions);
  }
  if (!flyout) {
    throw Error('One of Blockly.VerticalFlyout or Blockly.Horizontal must be' +
        'required.');
  }
  return flyout;
};

/**
 * Render the toolbox with all of the toolbox items. This should only be used
 * for re rendering the entire toolbox. For adding single items use
 * insertToolboxItem.
 * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
 *    containing information on the contents of the toolbox.
 */
Blockly.NewToolbox.prototype.render = function(toolboxDef) {
  for (var i = 0, childIn; (childIn = toolboxDef[i]); i++) {
    switch (childIn['kind'].toUpperCase()) {
      case 'CATEGORY':
        var category = new Blockly.ToolboxCategory(childIn, this);
        this.toolboxItems.push(category);

        var categoryDom = category.createDom();
        this.contentsDiv.appendChild(categoryDom);
        break;
      case 'SEP':
        var separator = new Blockly.ToolboxSeparator(childIn, this);
        this.toolboxItems.push(separator);

        var separatorDom = separator.createDom();
        this.contentsDiv.appendChild(separatorDom);
        break;
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
        break;
      default:
        // TODO: Handle someone adding a custom component.
    }
  }
};

/**
 * Get whether or not the toolbox is horizontal.
 * @return {boolean} True if the toolbox is horizontal, false if the toolbox is
 *     vertical.
 */
Blockly.NewToolbox.prototype.isHorizontal = function() {
  return this.horizontalLayout_ == true;
};

/**
 * Dispose of this toolbox.
 */
Blockly.NewToolbox.prototype.dispose = function() {
  this.flyout_.dispose();
  for (var i = 0; i < this.toolboxItems.length; i++) {
    var toolboxItem = this.toolboxItems[i];
    toolboxItem.dispose();
  }
  this.workspace_.getThemeManager().unsubscribe(this.HtmlDiv);
  Blockly.utils.dom.removeNode(this.HtmlDiv);
};

/**
 * Get the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.NewToolbox.prototype.getWidth = function() {
  return this.width;
};

/**
 * Get the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.NewToolbox.prototype.getHeight = function() {
  return this.height;
};

/**
 * Get the toolbox flyout.
 * @return {Blockly.Flyout} The toolbox flyout.
 */
Blockly.NewToolbox.prototype.getFlyout = function() {
  return this.flyout_;
};

/**
 * Position the toolbox based on whether it is a horizontal toolbox and whether
 * the workspace is in rtl.
 */
Blockly.NewToolbox.prototype.position = function() {
  var toolboxDiv = this.HtmlDiv;
  if (!toolboxDiv) {
    // Not initialized yet.
    return;
  }

  if (this.horizontalLayout_) {
    toolboxDiv.style.left = '0';
    toolboxDiv.style.height = 'auto';
    toolboxDiv.style.width = '100%';
    this.height = toolboxDiv.offsetHeight;
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {  // Top
      toolboxDiv.style.top = '0';
    } else {  // Bottom
      toolboxDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {  // Right
      toolboxDiv.style.right = '0';
    } else {  // Left
      toolboxDiv.style.left = '0';
    }
    toolboxDiv.style.height = '100%';
    this.width = toolboxDiv.offsetWidth;
  }
  this.flyout_.position();
};

/**
 * Unhighlight any previously specified option.
 */
Blockly.NewToolbox.prototype.clearSelection = function() {
  this.setSelectedItem(null);
};

/**
 * Updates the category colours and background colour of selected categories.
 * @package
 */
Blockly.NewToolbox.prototype.refreshTheme = function() {};

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.NewToolbox.prototype.refreshSelection = function() {
  if (this.selectedItem_ && this.selectedItem_.contents) {
    this.flyout_.show(this.selectedItem_.contents);
  }
};

/**
 * Toggles the visibility of the toolbox.
 * @param {boolean} isVisible True if toolbox should be visible.
 */
Blockly.NewToolbox.prototype.setVisible = function() {};

/**
 * Select the first toolbox category if no category is selected.
 * @package
 */
Blockly.NewToolbox.prototype.selectFirstCategory = function() {};

/**
 * Set the given item as selected.
 * @param {Blockly.IToolboxItem} item The toolbox item to select.
 */
Blockly.NewToolbox.prototype.setSelectedItem = function(item) {
  // Unselect the old item.
  if (this.selectedItem_) {
    this.selectedItem_.setSelected(false);
  }

  if (!item || this.selectedItem_ == item) {
    this.selectedItem_ = null;
    this.flyout_.hide();
  } else {
    this.selectedItem_ = item;
    this.selectedItem_.setSelected(true);
    // If the new item does not have contents close the old flyout.
    // TODO: This can be fixed to just check the blocks array when I split them up.
    if (this.selectedItem_.contents && !this.selectedItem_.hasCategories()) {
      this.flyout_.show(this.selectedItem_.contents);
      this.flyout_.scrollToStart();
    } else {
      this.flyout_.hide();
    }
  }
};

/**
 * Selects the next toolbox item.
 */
Blockly.NewToolbox.prototype.selectNext = function() {
  var items = this.toolboxItems;
  var nextItemIdx = items.indexOf(this.selectedItem_) + 1;
  if (nextItemIdx < items.length) {
    this.setSelectedItem(items[nextItemIdx]);
  }
};

/**
 * Selects the previous toolbox item.
 */
Blockly.NewToolbox.prototype.selectPrevious = function() {
  var items = this.toolboxItems;
  var nextItemIdx = items.indexOf(this.selectedItem_) - 1;
  if (nextItemIdx > -1) {
    this.setSelectedItem(items[nextItemIdx]);
  }
};

/**
 * Gets the workspace for the toolbox.
 * @return {!Blockly.WorkspaceSvg} The parent workspace for the toolbox.
 */
Blockly.NewToolbox.prototype.getWorkspace = function() {
  return this.workspace_;
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
    'position: absolute;',
    'z-index: 70;', /* so blocks go under toolbox when dragging */
    '-webkit-tap-highlight-color: transparent;', /* issue #1345 */
  '}',

  '.blocklyToolboxContents {',
    'display: flex;',
    'flex-wrap: wrap;',
    'flex-direction: column;',
  '}',

  '.blocklyTreeRoot {',
    'padding: 4px 0;',
  '}',

  '.blocklyTreeRoot:focus {',
    'outline: none;',
  '}',

  '.blocklyTreeRow {',
    'height: 22px;',
    'line-height: 22px;',
    'margin-bottom: 3px;',
    'padding-right: 8px;',
    'white-space: nowrap;',
  '}',

  '.blocklyHorizontalTree {',
    'margin: 1px 5px 8px 0;',
  '}',

  '.blocklyHorizontalTreeRtl {',
    'margin: 1px 0 8px 5px;',
  '}',

  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
    'margin-left: 8px;',
    'padding-right: 0px',
  '}',

  '.blocklyTreeRow:not(.blocklyTreeSelected):hover {',
    'background-color: rgba(255, 255, 255, 0.2);',
  '}',

  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyTreeSeparatorHorizontal {',
    'border-right: solid #e5e5e5 1px;',
    'width: 0;',
    'padding: 5px 0;',
    'margin: 0 5px;',
  '}',

  '.blocklyTreeIcon {',
    'background-image: url(<<<PATH>>>/sprites.png);',
    'height: 16px;',
    'vertical-align: middle;',
    'width: 16px;',
  '}',

  '.blocklyTreeIconClosedLtr {',
    'background-position: -32px -1px;',
  '}',

  '.blocklyTreeIconClosedRtl {',
    'background-position: 0 -1px;',
  '}',

  '.blocklyTreeIconOpen {',
    'background-position: -16px -1px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedLtr {',
    'background-position: -32px -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconClosedRtl {',
    'background-position: 0 -17px;',
  '}',

  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
    'background-position: -16px -17px;',
  '}',

  '.blocklyTreeIconNone,',
  '.blocklyTreeSelected>.blocklyTreeIconNone {',
    'background-position: -48px -1px;',
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

Blockly.registry.register(Blockly.registry.Type.TOOLBOX, 'newToolbox', Blockly.NewToolbox);
