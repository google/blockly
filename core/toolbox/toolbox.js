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

goog.require('Blockly.BlockSvg');
goog.require('Blockly.browserEvents');
goog.require('Blockly.CollapsibleToolboxCategory');
goog.require('Blockly.ComponentManager');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.Css');
goog.require('Blockly.DeleteArea');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.ToolboxItemSelect');
goog.require('Blockly.IAutoHideable');
goog.require('Blockly.IKeyboardAccessible');
goog.require('Blockly.IStyleable');
goog.require('Blockly.IToolbox');
goog.require('Blockly.Options');
goog.require('Blockly.registry');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.ICollapsibleToolboxItem');
goog.requireType('Blockly.IDraggable');
goog.requireType('Blockly.IFlyout');
goog.requireType('Blockly.ISelectableToolboxItem');
goog.requireType('Blockly.IToolboxItem');
goog.requireType('Blockly.ShortcutRegistry');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to create new
 *     blocks.
 * @constructor
 * @implements {Blockly.IAutoHideable}
 * @implements {Blockly.IKeyboardAccessible}
 * @implements {Blockly.IStyleable}
 * @implements {Blockly.IToolbox}
 * @extends {Blockly.DeleteArea}
 */
Blockly.Toolbox = function(workspace) {
  Blockly.Toolbox.superClass_.constructor.call(this);
  /**
   * The workspace this toolbox is on.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;

  /**
   * The unique id for this component that is used to register with the
   * ComponentManager.
   * @type {string}
   */
  this.id = 'toolbox';

  /**
   * The JSON describing the contents of this toolbox.
   * @type {!Blockly.utils.toolbox.ToolboxInfo}
   * @protected
   */
  this.toolboxDef_ = workspace.options.languageTree || {'contents': []};

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
   * Whether the Toolbox is visible.
   * @type {boolean}
   * @protected
   */
  this.isVisible_ = false;

  /**
   * The list of items in the toolbox.
   * @type {!Array<!Blockly.IToolboxItem>}
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
   * @type {?Blockly.IFlyout}
   * @private
   */
  this.flyout_ = null;

  /**
   * A map from toolbox item IDs to toolbox items.
   * @type {!Object<string, !Blockly.IToolboxItem>}
   * @protected
   */
  this.contentMap_ = Object.create(null);

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {!Blockly.utils.toolbox.Position}
   */
  this.toolboxPosition = workspace.options.toolboxPosition;

  /**
   * The currently selected item.
   * @type {?Blockly.ISelectableToolboxItem}
   * @protected
   */
  this.selectedItem_ = null;

  /**
   * The previously selected item.
   * @type {?Blockly.ISelectableToolboxItem}
   * @protected
   */
  this.previouslySelectedItem_ = null;

  /**
   * Array holding info needed to unbind event handlers.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   * @type {!Array<!Blockly.browserEvents.Data>}
   * @protected
   */
  this.boundEvents_ = [];
};
Blockly.utils.object.inherits(Blockly.Toolbox, Blockly.DeleteArea);

/**
 * Handles the given keyboard shortcut.
 * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} _shortcut The shortcut to be handled.
 * @return {boolean} True if the shortcut has been handled, false otherwise.
 * @public
 */
Blockly.Toolbox.prototype.onShortcut = function(_shortcut) {
  return false;
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
  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'), svg);
  this.setVisible(true);
  this.flyout_.init(workspace);

  this.render(this.toolboxDef_);
  var themeManager = workspace.getThemeManager();
  themeManager.subscribe(this.HtmlDiv, 'toolboxBackgroundColour',
      'background-color');
  themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');
  this.workspace_.getComponentManager().addComponent({
    component: this,
    weight: 1,
    capabilities: [
      Blockly.ComponentManager.Capability.AUTOHIDEABLE,
      Blockly.ComponentManager.Capability.DELETE_AREA,
      Blockly.ComponentManager.Capability.DRAG_TARGET
    ]
  });
};

/**
 * Creates the DOM for the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace this toolbox is on.
 * @return {!Element} The HTML container for the toolbox.
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
 * @return {!Element} The HTML container for the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.createContainer_ = function() {
  var toolboxContainer = document.createElement('div');
  toolboxContainer.setAttribute('layout', this.isHorizontal() ? 'h' : 'v');
  Blockly.utils.dom.addClass(toolboxContainer, 'blocklyToolboxDiv');
  Blockly.utils.dom.addClass(toolboxContainer, 'blocklyNonSelectable');
  toolboxContainer.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  return toolboxContainer;
};

/**
 * Creates the container for all the contents in the toolbox.
 * @return {!Element} The HTML container for the toolbox contents.
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
 * @param {!Element} container The HTML container for the toolbox.
 * @param {!Element} contentsContainer The HTML container for the contents
 *     of the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.attachEvents_ = function(container,
    contentsContainer) {
  // Clicking on toolbox closes popups.
  var clickEvent = Blockly.browserEvents.conditionalBind(
      container, 'click', this, this.onClick_,
      /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(clickEvent);

  var keyDownEvent = Blockly.browserEvents.conditionalBind(
      contentsContainer, 'keydown', this, this.onKeyDown_,
      /* opt_noCaptureIdentifier */ false,
      /* opt_noPreventDefault */ true);
  this.boundEvents_.push(keyDownEvent);
};

/**
 * Handles on click events for when the toolbox or toolbox items are clicked.
 * @param {!Event} e Click event to handle.
 * @protected
 */
Blockly.Toolbox.prototype.onClick_ = function(e) {
  if (Blockly.utils.isRightButton(e) || e.target == this.HtmlDiv) {
    // Close flyout.
    Blockly.hideChaff(false);
  } else {
    var targetElement = e.target;
    var itemId = targetElement.getAttribute('id');
    if (itemId) {
      var item = this.getToolboxItemById(itemId);
      if (item.isSelectable()) {
        this.setSelectedItem(item);
        item.onClick(e);
      }
    }
    // Just close popups.
    Blockly.hideChaff(true);
  }
  Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
};

/**
 * Handles key down events for the toolbox.
 * @param {!KeyboardEvent} e The key down event.
 * @protected
 */
Blockly.Toolbox.prototype.onKeyDown_ = function(e) {
  var handled = false;
  switch (e.keyCode) {
    case Blockly.utils.KeyCodes.DOWN:
      handled = this.selectNext_();
      break;
    case Blockly.utils.KeyCodes.UP:
      handled = this.selectPrevious_();
      break;
    case Blockly.utils.KeyCodes.LEFT:
      handled = this.selectParent_();
      break;
    case Blockly.utils.KeyCodes.RIGHT:
      handled = this.selectChild_();
      break;
    case Blockly.utils.KeyCodes.ENTER:
    case Blockly.utils.KeyCodes.SPACE:
      if (this.selectedItem_ && this.selectedItem_.isCollapsible()) {
        var collapsibleItem = /** @type {!Blockly.ICollapsibleToolboxItem} */ (this.selectedItem_);
        collapsibleItem.toggleExpanded();
        handled = true;
      }
      break;
    default:
      handled = false;
      break;
  }
  if (!handled && this.selectedItem_ && this.selectedItem_.onKeyDown) {
    handled = this.selectedItem_.onKeyDown(e);
  }

  if (handled) {
    e.preventDefault();
  }
};

/**
 * Creates the flyout based on the toolbox layout.
 * @return {!Blockly.IFlyout} The flyout for the toolbox.
 * @throws {Error} If missing a require for `Blockly.HorizontalFlyout`,
 *     `Blockly.VerticalFlyout`, and no flyout plugin is specified.
 * @protected
 */
Blockly.Toolbox.prototype.createFlyout_ = function() {
  var workspace = this.workspace_;
  // TODO (#4247): Look into adding a makeFlyout method to Blockly Options.
  var workspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'parentWorkspace': workspace,
        'rtl': workspace.RTL,
        'oneBasedIndex': workspace.options.oneBasedIndex,
        'horizontalLayout': workspace.horizontalLayout,
        'renderer': workspace.options.renderer,
        'rendererOverrides': workspace.options.rendererOverrides,
        'move': {
          'scrollbars': true,
        }
      }));
  // Options takes in either 'end' or 'start'. This has already been parsed to
  // be either 0 or 1, so set it after.
  workspaceOptions.toolboxPosition = workspace.options.toolboxPosition;
  var FlyoutClass = null;
  if (workspace.horizontalLayout) {
    FlyoutClass = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, workspace.options,
        true);
  } else {
    FlyoutClass = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX, workspace.options,
        true);
  }
  return new FlyoutClass(workspaceOptions);
};

/**
 * Fills the toolbox with new toolbox items and removes any old contents.
 * @param {!Blockly.utils.toolbox.ToolboxInfo} toolboxDef Object holding information
 *     for creating a toolbox.
 * @package
 */
Blockly.Toolbox.prototype.render = function(toolboxDef) {
  this.toolboxDef_ = toolboxDef;
  for (var i = 0; i < this.contents_.length; i++) {
    var toolboxItem = this.contents_[i];
    if (toolboxItem) {
      toolboxItem.dispose();
    }
  }
  this.contents_ = [];
  this.contentMap_ = Object.create(null);
  this.renderContents_(toolboxDef['contents']);
  this.position();
  this.handleToolboxItemResize();
};

/**
 * Adds all the toolbox items to the toolbox.
 * @param {!Array<!Blockly.utils.toolbox.ToolboxItemInfo>} toolboxDef Array
 *     holding objects containing information on the contents of the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.renderContents_ = function(toolboxDef) {
  // This is for performance reasons. By using document fragment we only have to
  // add to the DOM once.
  var fragment = document.createDocumentFragment();
  for (var i = 0, toolboxItemDef; (toolboxItemDef = toolboxDef[i]); i++) {
    this.createToolboxItem_(toolboxItemDef, fragment);
  }
  this.contentsDiv_.appendChild(fragment);
};

/**
 * Creates and renders the toolbox item.
 * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef Any information
 *    that can be used to create an item in the toolbox.
 * @param {!DocumentFragment} fragment The document fragment to add the child
 *     toolbox elements to.
 * @private
 */
Blockly.Toolbox.prototype.createToolboxItem_ = function(toolboxItemDef, fragment) {
  var registryName = toolboxItemDef['kind'];

  // Categories that are collapsible are created using a class registered under
  // a different name.
  if (registryName.toUpperCase() == 'CATEGORY' &&
      Blockly.utils.toolbox.isCategoryCollapsible(
      /** @type {!Blockly.utils.toolbox.CategoryInfo} */(toolboxItemDef))) {
    registryName = Blockly.CollapsibleToolboxCategory.registrationName;
  }

  var ToolboxItemClass = Blockly.registry.getClass(
      Blockly.registry.Type.TOOLBOX_ITEM, registryName.toLowerCase());
  if (ToolboxItemClass) {
    var toolboxItem = new ToolboxItemClass(toolboxItemDef, this);
    this.addToolboxItem_(toolboxItem);
    toolboxItem.init();
    var toolboxItemDom = toolboxItem.getDiv();
    if (toolboxItemDom) {
      fragment.appendChild(toolboxItemDom);
    }
    // Adds the ID to the HTML element that can receive a click.
    // This is used in onClick_ to find the toolboxItem that was clicked.
    if (toolboxItem.getClickTarget) {
      toolboxItem.getClickTarget().setAttribute('id', toolboxItem.getId());
    }
  }
};

/**
 * Adds an item to the toolbox.
 * @param {!Blockly.IToolboxItem} toolboxItem The item in the toolbox.
 * @protected
 */
Blockly.Toolbox.prototype.addToolboxItem_ = function(toolboxItem) {
  this.contents_.push(toolboxItem);
  this.contentMap_[toolboxItem.getId()] = toolboxItem;
  if (toolboxItem.isCollapsible()) {
    var collapsibleItem = /** @type {Blockly.ICollapsibleToolboxItem} */
        (toolboxItem);
    for (var i = 0, child; (child = collapsibleItem.getChildToolboxItems()[i]); i++) {
      this.addToolboxItem_(child);
    }
  }
};

/**
 * Gets the items in the toolbox.
 * @return {!Array<!Blockly.IToolboxItem>} The list of items in the toolbox.
 * @public
 */
Blockly.Toolbox.prototype.getToolboxItems = function() {
  return this.contents_;
};

/**
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 * @package
 */
Blockly.Toolbox.prototype.addStyle = function(style) {
  Blockly.utils.dom.addClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 * @package
 */
Blockly.Toolbox.prototype.removeStyle = function(style) {
  Blockly.utils.dom.removeClass(/** @type {!Element} */ (this.HtmlDiv), style);
};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
 *   target area should be ignored.
 */
Blockly.Toolbox.prototype.getClientRect = function() {
  if (!this.HtmlDiv || !this.isVisible_) {
    return null;
  }

  // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var toolboxRect = this.HtmlDiv.getBoundingClientRect();

  var top = toolboxRect.top;
  var bottom = top + toolboxRect.height;
  var left = toolboxRect.left;
  var right = left + toolboxRect.width;

  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (this.toolboxPosition == Blockly.utils.toolbox.Position.TOP) {
    return new Blockly.utils.Rect(-BIG_NUM, bottom, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.utils.toolbox.Position.BOTTOM) {
    return new Blockly.utils.Rect(top, BIG_NUM, -BIG_NUM, BIG_NUM);
  } else if (this.toolboxPosition == Blockly.utils.toolbox.Position.LEFT) {
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, right);
  } else {  // Right
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
  }
};

/**
 * Returns whether the provided block or bubble would be deleted if dropped on
 * this area.
 * This method should check if the element is deletable and is always called
 * before onDragEnter/onDragOver/onDragExit.
 * @param {!Blockly.IDraggable} element The block or bubble currently being
 *   dragged.
 * @param {boolean} _couldConnect Whether the element could could connect to
 *     another.
 * @return {boolean} Whether the element provided would be deleted if dropped on
 *     this area.
 * @override
 */
Blockly.Toolbox.prototype.wouldDelete = function(element, _couldConnect) {
  if (element instanceof Blockly.BlockSvg) {
    var block = /** @type {Blockly.BlockSvg} */ (element);
    // Prefer dragging to the toolbox over connecting to other blocks.
    this.updateWouldDelete_(!block.getParent() && block.isDeletable());
  } else {
    this.updateWouldDelete_(element.isDeletable());
  }
  return this.wouldDelete_;
};

/**
 * Handles when a cursor with a block or bubble enters this drag target.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Toolbox.prototype.onDragEnter = function(_dragElement) {
  this.updateCursorDeleteStyle_(true);
};

/**
 * Handles when a cursor with a block or bubble exits this drag target.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Toolbox.prototype.onDragExit = function(_dragElement) {
  this.updateCursorDeleteStyle_(false);
};


/**
 * Handles when a block or bubble is dropped on this component.
 * Should not handle delete here.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Toolbox.prototype.onDrop = function(_dragElement) {
  this.updateCursorDeleteStyle_(false);
};

/**
 * Updates the internal wouldDelete_ state.
 * @param {boolean} wouldDelete The new value for the wouldDelete state.
 * @protected
 * @override
 */
Blockly.Toolbox.prototype.updateWouldDelete_ = function(wouldDelete) {
  if (wouldDelete === this.wouldDelete_) {
    return;
  }
  // This logic handles updating the deleteStyle properly if the delete state
  // changes while the block is over the Toolbox. This could happen if the
  // implementation of wouldDeleteBlock depends on the couldConnect parameter
  // or if the isDeletable property of the block currently being dragged
  // changes during the drag.
  this.updateCursorDeleteStyle_(false);
  this.wouldDelete_ = wouldDelete;
  this.updateCursorDeleteStyle_(true);
};

/**
 * Adds or removes the CSS style of the cursor over the toolbox based whether
 * the block or bubble over it is expected to be deleted if dropped (using the
 * internal this.wouldDelete_ property).
 * @param {boolean} addStyle Whether the style should be added or removed.
 * @protected
 */
Blockly.Toolbox.prototype.updateCursorDeleteStyle_ = function(addStyle) {
  var style = this.wouldDelete_ ? 'blocklyToolboxDelete' :
      'blocklyToolboxGrab';
  if (addStyle) {
    this.addStyle(style);
  } else {
    this.removeStyle(style);
  }
};

/**
 * Gets the toolbox item with the given ID.
 * @param {string} id The ID of the toolbox item.
 * @return {?Blockly.IToolboxItem} The toolbox item with the given ID, or null
 *     if no item exists.
 * @public
 */
Blockly.Toolbox.prototype.getToolboxItemById = function(id) {
  return this.contentMap_[id] || null;
};

/**
 * Gets the width of the toolbox.
 * @return {number} The width of the toolbox.
 * @public
 */
Blockly.Toolbox.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Gets the height of the toolbox.
 * @return {number} The width of the toolbox.
 * @public
 */
Blockly.Toolbox.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Gets the toolbox flyout.
 * @return {?Blockly.IFlyout} The toolbox flyout.
 * @public
 */
Blockly.Toolbox.prototype.getFlyout = function() {
  return this.flyout_;
};

/**
 * Gets the workspace for the toolbox.
 * @return {!Blockly.WorkspaceSvg} The parent workspace for the toolbox.
 * @public
 */
Blockly.Toolbox.prototype.getWorkspace = function() {
  return this.workspace_;
};

/**
 * Gets the selected item.
 * @return {?Blockly.ISelectableToolboxItem} The selected item, or null if no item is
 *     currently selected.
 * @public
 */
Blockly.Toolbox.prototype.getSelectedItem = function() {
  return this.selectedItem_;
};

/**
 * Gets the previously selected item.
 * @return {?Blockly.ISelectableToolboxItem} The previously selected item, or null if no
 *     item was previously selected.
 * @public
 */
Blockly.Toolbox.prototype.getPreviouslySelectedItem = function() {
  return this.previouslySelectedItem_;
};

/**
 * Gets whether or not the toolbox is horizontal.
 * @return {boolean} True if the toolbox is horizontal, false if the toolbox is
 *     vertical.
 * @public
 */
Blockly.Toolbox.prototype.isHorizontal = function() {
  return this.horizontalLayout_;
};

/**
 * Positions the toolbox based on whether it is a horizontal toolbox and whether
 * the workspace is in rtl.
 * @public
 */
Blockly.Toolbox.prototype.position = function() {
  var workspaceMetrics = this.workspace_.getMetrics();
  var toolboxDiv = this.HtmlDiv;
  if (!toolboxDiv) {
    // Not initialized yet.
    return;
  }

  if (this.horizontalLayout_) {
    toolboxDiv.style.left = '0';
    toolboxDiv.style.height = 'auto';
    toolboxDiv.style.width = '100%';
    this.height_ = toolboxDiv.offsetHeight;
    this.width_ = workspaceMetrics.viewWidth;
    if (this.toolboxPosition == Blockly.utils.toolbox.Position.TOP) {
      toolboxDiv.style.top = '0';
    } else {  // Bottom
      toolboxDiv.style.bottom = '0';
    }
  } else {
    if (this.toolboxPosition == Blockly.utils.toolbox.Position.RIGHT) {
      toolboxDiv.style.right = '0';
    } else {  // Left
      toolboxDiv.style.left = '0';
    }
    toolboxDiv.style.height = '100%';
    this.width_ = toolboxDiv.offsetWidth;
    this.height_ = workspaceMetrics.viewHeight;
  }
  this.flyout_.position();
};
/**
 * Handles resizing the toolbox when a toolbox item resizes.
 * @package
 */
Blockly.Toolbox.prototype.handleToolboxItemResize = function() {
  // Reposition the workspace so that (0,0) is in the correct position relative
  // to the new absolute edge (ie toolbox edge).
  var workspace = this.workspace_;
  var rect = this.HtmlDiv.getBoundingClientRect();
  var newX = this.toolboxPosition == Blockly.utils.toolbox.Position.LEFT ?
      workspace.scrollX + rect.width :
      workspace.scrollX;
  var newY = this.toolboxPosition == Blockly.utils.toolbox.Position.TOP ?
      workspace.scrollY + rect.height :
      workspace.scrollY;
  workspace.translate(newX, newY);

  // Even though the div hasn't changed size, the visible workspace
  // surface of the workspace has, so we may need to reposition everything.
  Blockly.svgResize(workspace);
};

/**
 * Unhighlights any previously selected item.
 * @public
 */
Blockly.Toolbox.prototype.clearSelection = function() {
  this.setSelectedItem(null);
};

/**
 * Updates the category colours and background colour of selected categories.
 * @package
 */
Blockly.Toolbox.prototype.refreshTheme = function() {
  for (var i = 0; i < this.contents_.length; i++) {
    var child = this.contents_[i];
    if (child.refreshTheme) {
      child.refreshTheme();
    }
  }
};

/**
 * Updates the flyout's content without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 * @public
 */
Blockly.Toolbox.prototype.refreshSelection = function() {
  if (this.selectedItem_ && this.selectedItem_.isSelectable() &&
      this.selectedItem_.getContents().length) {
    this.flyout_.show(this.selectedItem_.getContents());
  }
};

/**
 * Shows or hides the toolbox.
 * @param {boolean} isVisible True if toolbox should be visible.
 * @public
 */
Blockly.Toolbox.prototype.setVisible = function(isVisible) {
  if (this.isVisible_ === isVisible) {
    return;
  }

  this.HtmlDiv.style.display = isVisible ? 'block' : 'none';
  this.isVisible_ = isVisible;
  // Invisible toolbox is ignored as drag targets and must have the drag target
  // updated.
  this.workspace_.recordDragTargets();
};

/**
 * Hides the component. Called in Blockly.hideChaff.
 * @param {boolean} onlyClosePopups Whether only popups should be closed.
 *     Flyouts should not be closed if this is true.
 */
Blockly.Toolbox.prototype.autoHide = function(onlyClosePopups) {
  if (!onlyClosePopups && this.flyout_ && this.flyout_.autoClose) {
    this.clearSelection();
  }
};

/**
 * Sets the given item as selected.
 * No-op if the item is not selectable.
 * @param {?Blockly.IToolboxItem} newItem The toolbox item to select.
 * @public
 */
Blockly.Toolbox.prototype.setSelectedItem = function(newItem) {
  var oldItem = this.selectedItem_;

  if ((!newItem && !oldItem) || (newItem && !newItem.isSelectable())) {
    return;
  }
  newItem = /** @type {Blockly.ISelectableToolboxItem} */ (newItem);

  if (this.shouldDeselectItem_(oldItem, newItem) && oldItem != null) {
    this.deselectItem_(oldItem);
  }

  if (this.shouldSelectItem_(oldItem, newItem) && newItem != null) {
    this.selectItem_(oldItem, newItem);
  }

  this.updateFlyout_(oldItem, newItem);
  this.fireSelectEvent_(oldItem, newItem);
};

/**
 * Decides whether the old item should be deselected.
 * @param {?Blockly.ISelectableToolboxItem} oldItem The previously selected
 *     toolbox item.
 * @param {?Blockly.ISelectableToolboxItem} newItem The newly selected toolbox
 *     item.
 * @return {boolean} True if the old item should be deselected, false otherwise.
 * @protected
 */
Blockly.Toolbox.prototype.shouldDeselectItem_ = function(oldItem, newItem) {
  // Deselect the old item unless the old item is collapsible and has been
  // previously clicked on.
  return oldItem != null && (!oldItem.isCollapsible() || oldItem != newItem);
};

/**
 * Decides whether the new item should be selected.
 * @param {?Blockly.ISelectableToolboxItem} oldItem The previously selected
 *     toolbox item.
 * @param {?Blockly.ISelectableToolboxItem} newItem The newly selected toolbox
 *     item.
 * @return {boolean} True if the new item should be selected, false otherwise.
 * @protected
 */
Blockly.Toolbox.prototype.shouldSelectItem_ = function(oldItem, newItem) {
  // Select the new item unless the old item equals the new item.
  return newItem != null && newItem != oldItem;
};

/**
 * Deselects the given item, marks it as unselected, and updates aria state.
 * @param {!Blockly.ISelectableToolboxItem} item The previously selected
 *     toolbox item which should be deselected.
 * @protected
 */
Blockly.Toolbox.prototype.deselectItem_ = function(item) {
  this.selectedItem_ = null;
  this.previouslySelectedItem_ = item;
  item.setSelected(false);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.contentsDiv_),
      Blockly.utils.aria.State.ACTIVEDESCENDANT, '');
};

/**
 * Selects the given item, marks it selected, and updates aria state.
 * @param {?Blockly.ISelectableToolboxItem} oldItem The previously selected
 *     toolbox item.
 * @param {!Blockly.ISelectableToolboxItem} newItem The newly selected toolbox
 *     item.
 * @protected
 */
Blockly.Toolbox.prototype.selectItem_ = function(oldItem, newItem) {
  this.selectedItem_ = newItem;
  this.previouslySelectedItem_ = oldItem;
  newItem.setSelected(true);
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.contentsDiv_),
      Blockly.utils.aria.State.ACTIVEDESCENDANT, newItem.getId());
};

/**
 * Selects the toolbox item by its position in the list of toolbox items.
 * @param {number} position The position of the item to select.
 * @public
 */
Blockly.Toolbox.prototype.selectItemByPosition = function(position) {
  if (position > -1 && position < this.contents_.length) {
    var item = this.contents_[position];
    if (item.isSelectable()) {
      this.setSelectedItem(item);
    }
  }
};

/**
 * Decides whether to hide or show the flyout depending on the selected item.
 * @param {?Blockly.ISelectableToolboxItem} oldItem The previously selected toolbox item.
 * @param {?Blockly.ISelectableToolboxItem} newItem The newly selected toolbox item.
 * @protected
 */
Blockly.Toolbox.prototype.updateFlyout_ = function(oldItem, newItem) {
  if ((oldItem == newItem && !newItem.isCollapsible()) || !newItem ||
      !newItem.getContents().length) {
    this.flyout_.hide();
  } else {
    this.flyout_.show(newItem.getContents());
    this.flyout_.scrollToStart();
  }
};

/**
 * Emits an event when a new toolbox item is selected.
 * @param {?Blockly.ISelectableToolboxItem} oldItem The previously selected
 *     toolbox item.
 * @param {?Blockly.ISelectableToolboxItem} newItem The newly selected toolbox
 *     item.
 * @private
 */
Blockly.Toolbox.prototype.fireSelectEvent_ = function(oldItem, newItem) {
  var oldElement = oldItem && oldItem.getName();
  var newElement = newItem && newItem.getName();
  // In this case the toolbox closes, so the newElement should be null.
  if (oldItem == newItem) {
    newElement = null;
  }
  var event = new (Blockly.Events.get(Blockly.Events.TOOLBOX_ITEM_SELECT))(
      oldElement, newElement, this.workspace_.id);
  Blockly.Events.fire(event);
};

/**
 * Closes the current item if it is expanded, or selects the parent.
 * @return {boolean} True if a parent category was selected, false otherwise.
 * @private
 */
Blockly.Toolbox.prototype.selectParent_ = function() {
  if (!this.selectedItem_) {
    return false;
  }

  if (this.selectedItem_.isCollapsible() && this.selectedItem_.isExpanded()) {
    var collapsibleItem = /** @type {!Blockly.ICollapsibleToolboxItem} */ (this.selectedItem_);
    collapsibleItem.setExpanded(false);
    return true;
  } else if (this.selectedItem_.getParent() &&
      this.selectedItem_.getParent().isSelectable()) {
    this.setSelectedItem(this.selectedItem_.getParent());
    return true;
  }
  return false;
};

/**
 * Selects the first child of the currently selected item, or nothing if the
 * toolbox item has no children.
 * @return {boolean} True if a child category was selected, false otherwise.
 * @private
 */
Blockly.Toolbox.prototype.selectChild_ = function() {
  if (!this.selectedItem_ || !this.selectedItem_.isCollapsible()) {
    return false;
  }
  var collapsibleItem = /** @type {Blockly.ICollapsibleToolboxItem} */
      (this.selectedItem_);
  if (!collapsibleItem.isExpanded()) {
    collapsibleItem.setExpanded(true);
    return true;
  } else {
    this.selectNext_();
    return true;
  }
};

/**
 * Selects the next visible toolbox item.
 * @return {boolean} True if a next category was selected, false otherwise.
 * @private
 */
Blockly.Toolbox.prototype.selectNext_ = function() {
  if (!this.selectedItem_) {
    return false;
  }

  var nextItemIdx = this.contents_.indexOf(this.selectedItem_) + 1;
  if (nextItemIdx > -1 && nextItemIdx < this.contents_.length) {
    var nextItem = this.contents_[nextItemIdx];
    while (nextItem && !nextItem.isSelectable()) {
      nextItem = this.contents_[++nextItemIdx];
    }
    if (nextItem && nextItem.isSelectable()) {
      this.setSelectedItem(nextItem);
      return true;
    }
  }
  return false;
};

/**
 * Selects the previous visible toolbox item.
 * @return {boolean} True if a previous category was selected, false otherwise.
 * @private
 */
Blockly.Toolbox.prototype.selectPrevious_ = function() {
  if (!this.selectedItem_) {
    return false;
  }

  var prevItemIdx = this.contents_.indexOf(this.selectedItem_) - 1;
  if (prevItemIdx > -1 && prevItemIdx < this.contents_.length) {
    var prevItem = this.contents_[prevItemIdx];
    while (prevItem && !prevItem.isSelectable()) {
      prevItem = this.contents_[--prevItemIdx];
    }
    if (prevItem && prevItem.isSelectable()) {
      this.setSelectedItem(prevItem);
      return true;
    }
  }
  return false;
};

/**
 * Disposes of this toolbox.
 * @public
 */
Blockly.Toolbox.prototype.dispose = function() {
  this.workspace_.getComponentManager().removeComponent('toolbox');
  this.flyout_.dispose();
  for (var i = 0; i < this.contents_.length; i++) {
    var toolboxItem = this.contents_[i];
    toolboxItem.dispose();
  }

  for (var j = 0; j < this.boundEvents_.length; j++) {
    Blockly.browserEvents.unbind(this.boundEvents_[j]);
  }
  this.boundEvents_ = [];
  this.contents_ = [];

  this.workspace_.getThemeManager().unsubscribe(this.HtmlDiv);
  Blockly.utils.dom.removeNode(this.HtmlDiv);
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

  '.blocklyToolboxContents {',
    'display: flex;',
    'flex-wrap: wrap;',
    'flex-direction: column;',
  '}',

  '.blocklyToolboxContents:focus {',
    'outline: none;',
  '}',
  /* eslint-enable indent */
]);

Blockly.registry.register(Blockly.registry.Type.TOOLBOX,
    Blockly.registry.DEFAULT, Blockly.Toolbox);
