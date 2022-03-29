/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox from whence to create blocks.
 */
'use strict';

/**
 * Toolbox from whence to create blocks.
 * @class
 */
goog.module('Blockly.Toolbox');

const Css = goog.require('Blockly.Css');
const Touch = goog.require('Blockly.Touch');
const aria = goog.require('Blockly.utils.aria');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
const {BlockSvg} = goog.require('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {BlocklyOptions} = goog.requireType('Blockly.BlocklyOptions');
const {CollapsibleToolboxCategory} = goog.require('Blockly.CollapsibleToolboxCategory');
const {ComponentManager} = goog.require('Blockly.ComponentManager');
const {DeleteArea} = goog.require('Blockly.DeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {IAutoHideable} = goog.require('Blockly.IAutoHideable');
/* eslint-disable-next-line no-unused-vars */
const {ICollapsibleToolboxItem} = goog.requireType('Blockly.ICollapsibleToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IDraggable} = goog.requireType('Blockly.IDraggable');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.requireType('Blockly.IFlyout');
/* eslint-disable-next-line no-unused-vars */
const {IKeyboardAccessible} = goog.require('Blockly.IKeyboardAccessible');
/* eslint-disable-next-line no-unused-vars */
const {ISelectableToolboxItem} = goog.requireType('Blockly.ISelectableToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IStyleable} = goog.require('Blockly.IStyleable');
/* eslint-disable-next-line no-unused-vars */
const {IToolboxItem} = goog.requireType('Blockly.IToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolbox} = goog.require('Blockly.IToolbox');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {Options} = goog.require('Blockly.Options');
const {Rect} = goog.require('Blockly.utils.Rect');
/* eslint-disable-next-line no-unused-vars */
const {ShortcutRegistry} = goog.requireType('Blockly.ShortcutRegistry');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.ToolboxItemSelect');


/**
 * Class for a Toolbox.
 * Creates the toolbox's DOM.
 * @implements {IAutoHideable}
 * @implements {IKeyboardAccessible}
 * @implements {IStyleable}
 * @implements {IToolbox}
 * @extends {DeleteArea}
 * @alias Blockly.Toolbox
 */
class Toolbox extends DeleteArea {
  /**
   * @param {!WorkspaceSvg} workspace The workspace in which to create new
   *     blocks.
   */
  constructor(workspace) {
    super();

    /**
     * The workspace this toolbox is on.
     * @type {!WorkspaceSvg}
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
     * @type {!toolbox.ToolboxInfo}
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
     * @type {?HTMLDivElement}
     */
    this.HtmlDiv = null;

    /**
     * The html container for the contents of a toolbox.
     * @type {?HTMLDivElement}
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
     * @type {!Array<!IToolboxItem>}
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
     * @type {?IFlyout}
     * @private
     */
    this.flyout_ = null;

    /**
     * A map from toolbox item IDs to toolbox items.
     * @type {!Object<string, !IToolboxItem>}
     * @protected
     */
    this.contentMap_ = Object.create(null);

    /**
     * Position of the toolbox and flyout relative to the workspace.
     * @type {!toolbox.Position}
     */
    this.toolboxPosition = workspace.options.toolboxPosition;

    /**
     * The currently selected item.
     * @type {?ISelectableToolboxItem}
     * @protected
     */
    this.selectedItem_ = null;

    /**
     * The previously selected item.
     * @type {?ISelectableToolboxItem}
     * @protected
     */
    this.previouslySelectedItem_ = null;

    /**
     * Array holding info needed to unbind event handlers.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array<!browserEvents.Data>}
     * @protected
     */
    this.boundEvents_ = [];
  }

  /**
   * Handles the given keyboard shortcut.
   * @param {!ShortcutRegistry.KeyboardShortcut} _shortcut The shortcut to be
   *     handled.
   * @return {boolean} True if the shortcut has been handled, false otherwise.
   * @public
   */
  onShortcut(_shortcut) {
    return false;
  }

  /**
   * Initializes the toolbox
   * @public
   */
  init() {
    const workspace = this.workspace_;
    const svg = workspace.getParentSvg();

    this.flyout_ = this.createFlyout_();

    this.HtmlDiv = this.createDom_(this.workspace_);
    dom.insertAfter(this.flyout_.createDom('svg'), svg);
    this.setVisible(true);
    this.flyout_.init(workspace);

    this.render(this.toolboxDef_);
    const themeManager = workspace.getThemeManager();
    themeManager.subscribe(
        this.HtmlDiv, 'toolboxBackgroundColour', 'background-color');
    themeManager.subscribe(this.HtmlDiv, 'toolboxForegroundColour', 'color');
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 1,
      capabilities: [
        ComponentManager.Capability.AUTOHIDEABLE,
        ComponentManager.Capability.DELETE_AREA,
        ComponentManager.Capability.DRAG_TARGET,
      ],
    });
  }

  /**
   * Creates the DOM for the toolbox.
   * @param {!WorkspaceSvg} workspace The workspace this toolbox is on.
   * @return {!HTMLDivElement} The HTML container for the toolbox.
   * @protected
   */
  createDom_(workspace) {
    const svg = workspace.getParentSvg();

    const container = this.createContainer_();

    this.contentsDiv_ = this.createContentsContainer_();
    this.contentsDiv_.tabIndex = 0;
    aria.setRole(this.contentsDiv_, aria.Role.TREE);
    container.appendChild(this.contentsDiv_);

    svg.parentNode.insertBefore(container, svg);

    this.attachEvents_(container, this.contentsDiv_);
    return container;
  }

  /**
   * Creates the container div for the toolbox.
   * @return {!HTMLDivElement} The HTML container for the toolbox.
   * @protected
   */
  createContainer_() {
    const toolboxContainer =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    toolboxContainer.setAttribute('layout', this.isHorizontal() ? 'h' : 'v');
    dom.addClass(toolboxContainer, 'blocklyToolboxDiv');
    dom.addClass(toolboxContainer, 'blocklyNonSelectable');
    toolboxContainer.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
    return toolboxContainer;
  }

  /**
   * Creates the container for all the contents in the toolbox.
   * @return {!HTMLDivElement} The HTML container for the toolbox contents.
   * @protected
   */
  createContentsContainer_() {
    const contentsContainer =
        /** @type {!HTMLDivElement} */ (document.createElement('div'));
    dom.addClass(contentsContainer, 'blocklyToolboxContents');
    if (this.isHorizontal()) {
      contentsContainer.style.flexDirection = 'row';
    }
    return contentsContainer;
  }

  /**
   * Adds event listeners to the toolbox container div.
   * @param {!HTMLDivElement} container The HTML container for the toolbox.
   * @param {!HTMLDivElement} contentsContainer The HTML container for the
   *     contents of the toolbox.
   * @protected
   */
  attachEvents_(container, contentsContainer) {
    // Clicking on toolbox closes popups.
    const clickEvent = browserEvents.conditionalBind(
        container, 'click', this, this.onClick_,
        /* opt_noCaptureIdentifier */ false,
        /* opt_noPreventDefault */ true);
    this.boundEvents_.push(clickEvent);

    const keyDownEvent = browserEvents.conditionalBind(
        contentsContainer, 'keydown', this, this.onKeyDown_,
        /* opt_noCaptureIdentifier */ false,
        /* opt_noPreventDefault */ true);
    this.boundEvents_.push(keyDownEvent);
  }

  /**
   * Handles on click events for when the toolbox or toolbox items are clicked.
   * @param {!Event} e Click event to handle.
   * @protected
   */
  onClick_(e) {
    if (browserEvents.isRightButton(e) || e.target === this.HtmlDiv) {
      // Close flyout.
      /** @type {!WorkspaceSvg} */ (common.getMainWorkspace()).hideChaff(false);
    } else {
      const targetElement = e.target;
      const itemId = targetElement.getAttribute('id');
      if (itemId) {
        const item = this.getToolboxItemById(itemId);
        if (item.isSelectable()) {
          this.setSelectedItem(item);
          item.onClick(e);
        }
      }
      // Just close popups.
      /** @type {!WorkspaceSvg} */ (common.getMainWorkspace()).hideChaff(true);
    }
    Touch.clearTouchIdentifier();  // Don't block future drags.
  }

  /**
   * Handles key down events for the toolbox.
   * @param {!KeyboardEvent} e The key down event.
   * @protected
   */
  onKeyDown_(e) {
    let handled = false;
    switch (e.keyCode) {
      case KeyCodes.DOWN:
        handled = this.selectNext_();
        break;
      case KeyCodes.UP:
        handled = this.selectPrevious_();
        break;
      case KeyCodes.LEFT:
        handled = this.selectParent_();
        break;
      case KeyCodes.RIGHT:
        handled = this.selectChild_();
        break;
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        if (this.selectedItem_ && this.selectedItem_.isCollapsible()) {
          const collapsibleItem =
              /** @type {!ICollapsibleToolboxItem} */ (this.selectedItem_);
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
  }

  /**
   * Creates the flyout based on the toolbox layout.
   * @return {!IFlyout} The flyout for the toolbox.
   * @throws {Error} If missing a require for `Blockly.HorizontalFlyout`,
   *     `Blockly.VerticalFlyout`, and no flyout plugin is specified.
   * @protected
   */
  createFlyout_() {
    const workspace = this.workspace_;
    // TODO (#4247): Look into adding a makeFlyout method to Blockly Options.
    const workspaceOptions = new Options(
        /** @type {!BlocklyOptions} */
        ({
          'parentWorkspace': workspace,
          'rtl': workspace.RTL,
          'oneBasedIndex': workspace.options.oneBasedIndex,
          'horizontalLayout': workspace.horizontalLayout,
          'renderer': workspace.options.renderer,
          'rendererOverrides': workspace.options.rendererOverrides,
          'move': {
            'scrollbars': true,
          },
        }));
    // Options takes in either 'end' or 'start'. This has already been parsed to
    // be either 0 or 1, so set it after.
    workspaceOptions.toolboxPosition = workspace.options.toolboxPosition;
    let FlyoutClass = null;
    if (workspace.horizontalLayout) {
      FlyoutClass = registry.getClassFromOptions(
          registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, workspace.options, true);
    } else {
      FlyoutClass = registry.getClassFromOptions(
          registry.Type.FLYOUTS_VERTICAL_TOOLBOX, workspace.options, true);
    }
    return new FlyoutClass(workspaceOptions);
  }

  /**
   * Fills the toolbox with new toolbox items and removes any old contents.
   * @param {!toolbox.ToolboxInfo} toolboxDef Object holding information
   *     for creating a toolbox.
   * @package
   */
  render(toolboxDef) {
    this.toolboxDef_ = toolboxDef;
    for (let i = 0; i < this.contents_.length; i++) {
      const toolboxItem = this.contents_[i];
      if (toolboxItem) {
        toolboxItem.dispose();
      }
    }
    this.contents_ = [];
    this.contentMap_ = Object.create(null);
    this.renderContents_(toolboxDef['contents']);
    this.position();
    this.handleToolboxItemResize();
  }

  /**
   * Adds all the toolbox items to the toolbox.
   * @param {!Array<!toolbox.ToolboxItemInfo>} toolboxDef Array
   *     holding objects containing information on the contents of the toolbox.
   * @protected
   */
  renderContents_(toolboxDef) {
    // This is for performance reasons. By using document fragment we only have
    // to add to the DOM once.
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < toolboxDef.length; i++) {
      const toolboxItemDef = toolboxDef[i];
      this.createToolboxItem_(toolboxItemDef, fragment);
    }
    this.contentsDiv_.appendChild(fragment);
  }

  /**
   * Creates and renders the toolbox item.
   * @param {!toolbox.ToolboxItemInfo} toolboxItemDef Any information
   *    that can be used to create an item in the toolbox.
   * @param {!DocumentFragment} fragment The document fragment to add the child
   *     toolbox elements to.
   * @private
   */
  createToolboxItem_(toolboxItemDef, fragment) {
    let registryName = toolboxItemDef['kind'];

    // Categories that are collapsible are created using a class registered
    // under a different name.
    if (registryName.toUpperCase() === 'CATEGORY' &&
        toolbox.isCategoryCollapsible(
            /** @type {!toolbox.CategoryInfo} */ (toolboxItemDef))) {
      registryName = CollapsibleToolboxCategory.registrationName;
    }

    const ToolboxItemClass = registry.getClass(
        registry.Type.TOOLBOX_ITEM, registryName.toLowerCase());
    if (ToolboxItemClass) {
      const toolboxItem = new ToolboxItemClass(toolboxItemDef, this);
      toolboxItem.init();
      this.addToolboxItem_(toolboxItem);
      const toolboxItemDom = toolboxItem.getDiv();
      if (toolboxItemDom) {
        fragment.appendChild(toolboxItemDom);
      }
      // Adds the ID to the HTML element that can receive a click.
      // This is used in onClick_ to find the toolboxItem that was clicked.
      if (toolboxItem.getClickTarget()) {
        toolboxItem.getClickTarget().setAttribute('id', toolboxItem.getId());
      }
    }
  }

  /**
   * Adds an item to the toolbox.
   * @param {!IToolboxItem} toolboxItem The item in the toolbox.
   * @protected
   */
  addToolboxItem_(toolboxItem) {
    this.contents_.push(toolboxItem);
    this.contentMap_[toolboxItem.getId()] = toolboxItem;
    if (toolboxItem.isCollapsible()) {
      const collapsibleItem = /** @type {ICollapsibleToolboxItem} */
          (toolboxItem);
      const childToolboxItems = collapsibleItem.getChildToolboxItems();
      for (let i = 0; i < childToolboxItems.length; i++) {
        const child = childToolboxItems[i];
        this.addToolboxItem_(child);
      }
    }
  }

  /**
   * Gets the items in the toolbox.
   * @return {!Array<!IToolboxItem>} The list of items in the toolbox.
   * @public
   */
  getToolboxItems() {
    return this.contents_;
  }

  /**
   * Adds a style on the toolbox. Usually used to change the cursor.
   * @param {string} style The name of the class to add.
   * @package
   */
  addStyle(style) {
    dom.addClass(/** @type {!Element} */ (this.HtmlDiv), style);
  }

  /**
   * Removes a style from the toolbox. Usually used to change the cursor.
   * @param {string} style The name of the class to remove.
   * @package
   */
  removeStyle(style) {
    dom.removeClass(/** @type {!Element} */ (this.HtmlDiv), style);
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return {?Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
    if (!this.HtmlDiv || !this.isVisible_) {
      return null;
    }

    // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
    // area are still deleted.  Must be smaller than Infinity, but larger than
    // the largest screen size.
    const BIG_NUM = 10000000;
    const toolboxRect = this.HtmlDiv.getBoundingClientRect();

    const top = toolboxRect.top;
    const bottom = top + toolboxRect.height;
    const left = toolboxRect.left;
    const right = left + toolboxRect.width;

    // Assumes that the toolbox is on the SVG edge.  If this changes
    // (e.g. toolboxes in mutators) then this code will need to be more complex.
    if (this.toolboxPosition === toolbox.Position.TOP) {
      return new Rect(-BIG_NUM, bottom, -BIG_NUM, BIG_NUM);
    } else if (this.toolboxPosition === toolbox.Position.BOTTOM) {
      return new Rect(top, BIG_NUM, -BIG_NUM, BIG_NUM);
    } else if (this.toolboxPosition === toolbox.Position.LEFT) {
      return new Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, right);
    } else {  // Right
      return new Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
    }
  }

  /**
   * Returns whether the provided block or bubble would be deleted if dropped on
   * this area.
   * This method should check if the element is deletable and is always called
   * before onDragEnter/onDragOver/onDragExit.
   * @param {!IDraggable} element The block or bubble currently being
   *   dragged.
   * @param {boolean} _couldConnect Whether the element could could connect to
   *     another.
   * @return {boolean} Whether the element provided would be deleted if dropped
   *     on this area.
   * @override
   */
  wouldDelete(element, _couldConnect) {
    if (element instanceof BlockSvg) {
      const block = /** @type {BlockSvg} */ (element);
      // Prefer dragging to the toolbox over connecting to other blocks.
      this.updateWouldDelete_(!block.getParent() && block.isDeletable());
    } else {
      this.updateWouldDelete_(element.isDeletable());
    }
    return this.wouldDelete_;
  }

  /**
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDragEnter(_dragElement) {
    this.updateCursorDeleteStyle_(true);
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDragExit(_dragElement) {
    this.updateCursorDeleteStyle_(false);
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDrop(_dragElement) {
    this.updateCursorDeleteStyle_(false);
  }

  /**
   * Updates the internal wouldDelete_ state.
   * @param {boolean} wouldDelete The new value for the wouldDelete state.
   * @protected
   * @override
   */
  updateWouldDelete_(wouldDelete) {
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
  }

  /**
   * Adds or removes the CSS style of the cursor over the toolbox based whether
   * the block or bubble over it is expected to be deleted if dropped (using the
   * internal this.wouldDelete_ property).
   * @param {boolean} addStyle Whether the style should be added or removed.
   * @protected
   */
  updateCursorDeleteStyle_(addStyle) {
    const style =
        this.wouldDelete_ ? 'blocklyToolboxDelete' : 'blocklyToolboxGrab';
    if (addStyle) {
      this.addStyle(style);
    } else {
      this.removeStyle(style);
    }
  }

  /**
   * Gets the toolbox item with the given ID.
   * @param {string} id The ID of the toolbox item.
   * @return {?IToolboxItem} The toolbox item with the given ID, or null
   *     if no item exists.
   * @public
   */
  getToolboxItemById(id) {
    return this.contentMap_[id] || null;
  }

  /**
   * Gets the width of the toolbox.
   * @return {number} The width of the toolbox.
   * @public
   */
  getWidth() {
    return this.width_;
  }

  /**
   * Gets the height of the toolbox.
   * @return {number} The width of the toolbox.
   * @public
   */
  getHeight() {
    return this.height_;
  }

  /**
   * Gets the toolbox flyout.
   * @return {?IFlyout} The toolbox flyout.
   * @public
   */
  getFlyout() {
    return this.flyout_;
  }

  /**
   * Gets the workspace for the toolbox.
   * @return {!WorkspaceSvg} The parent workspace for the toolbox.
   * @public
   */
  getWorkspace() {
    return this.workspace_;
  }

  /**
   * Gets the selected item.
   * @return {?ISelectableToolboxItem} The selected item, or null if no item is
   *     currently selected.
   * @public
   */
  getSelectedItem() {
    return this.selectedItem_;
  }

  /**
   * Gets the previously selected item.
   * @return {?ISelectableToolboxItem} The previously selected item, or null if
   *     no item was previously selected.
   * @public
   */
  getPreviouslySelectedItem() {
    return this.previouslySelectedItem_;
  }

  /**
   * Gets whether or not the toolbox is horizontal.
   * @return {boolean} True if the toolbox is horizontal, false if the toolbox
   *     is vertical.
   * @public
   */
  isHorizontal() {
    return this.horizontalLayout_;
  }

  /**
   * Positions the toolbox based on whether it is a horizontal toolbox and
   * whether the workspace is in rtl.
   * @public
   */
  position() {
    const workspaceMetrics = this.workspace_.getMetrics();
    const toolboxDiv = this.HtmlDiv;
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
      if (this.toolboxPosition === toolbox.Position.TOP) {
        toolboxDiv.style.top = '0';
      } else {  // Bottom
        toolboxDiv.style.bottom = '0';
      }
    } else {
      if (this.toolboxPosition === toolbox.Position.RIGHT) {
        toolboxDiv.style.right = '0';
      } else {  // Left
        toolboxDiv.style.left = '0';
      }
      toolboxDiv.style.height = '100%';
      this.width_ = toolboxDiv.offsetWidth;
      this.height_ = workspaceMetrics.viewHeight;
    }
    this.flyout_.position();
  }

  /**
   * Handles resizing the toolbox when a toolbox item resizes.
   * @package
   */
  handleToolboxItemResize() {
    // Reposition the workspace so that (0,0) is in the correct position
    // relative to the new absolute edge (ie toolbox edge).
    const workspace = this.workspace_;
    const rect = this.HtmlDiv.getBoundingClientRect();
    const newX = this.toolboxPosition === toolbox.Position.LEFT ?
        workspace.scrollX + rect.width :
        workspace.scrollX;
    const newY = this.toolboxPosition === toolbox.Position.TOP ?
        workspace.scrollY + rect.height :
        workspace.scrollY;
    workspace.translate(newX, newY);

    // Even though the div hasn't changed size, the visible workspace
    // surface of the workspace has, so we may need to reposition everything.
    common.svgResize(workspace);
  }

  /**
   * Unhighlights any previously selected item.
   * @public
   */
  clearSelection() {
    this.setSelectedItem(null);
  }

  /**
   * Updates the category colours and background colour of selected categories.
   * @package
   */
  refreshTheme() {
    for (let i = 0; i < this.contents_.length; i++) {
      const child = this.contents_[i];
      if (child.refreshTheme) {
        child.refreshTheme();
      }
    }
  }

  /**
   * Updates the flyout's content without closing it.  Should be used in
   * response to a change in one of the dynamic categories, such as variables or
   * procedures.
   * @public
   */
  refreshSelection() {
    if (this.selectedItem_ && this.selectedItem_.isSelectable() &&
        this.selectedItem_.getContents().length) {
      this.flyout_.show(this.selectedItem_.getContents());
    }
  }

  /**
   * Shows or hides the toolbox.
   * @param {boolean} isVisible True if toolbox should be visible.
   * @public
   */
  setVisible(isVisible) {
    if (this.isVisible_ === isVisible) {
      return;
    }

    this.HtmlDiv.style.display = isVisible ? 'block' : 'none';
    this.isVisible_ = isVisible;
    // Invisible toolbox is ignored as drag targets and must have the drag
    // target updated.
    this.workspace_.recordDragTargets();
  }

  /**
   * Hides the component. Called in WorkspaceSvg.hideChaff.
   * @param {boolean} onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups) {
    if (!onlyClosePopups && this.flyout_ && this.flyout_.autoClose) {
      this.clearSelection();
    }
  }

  /**
   * Sets the given item as selected.
   * No-op if the item is not selectable.
   * @param {?IToolboxItem} newItem The toolbox item to select.
   * @public
   */
  setSelectedItem(newItem) {
    const oldItem = this.selectedItem_;

    if ((!newItem && !oldItem) || (newItem && !newItem.isSelectable())) {
      return;
    }
    newItem = /** @type {ISelectableToolboxItem} */ (newItem);

    if (this.shouldDeselectItem_(oldItem, newItem) && oldItem !== null) {
      this.deselectItem_(oldItem);
    }

    if (this.shouldSelectItem_(oldItem, newItem) && newItem !== null) {
      this.selectItem_(oldItem, newItem);
    }

    this.updateFlyout_(oldItem, newItem);
    this.fireSelectEvent_(oldItem, newItem);
  }

  /**
   * Decides whether the old item should be deselected.
   * @param {?ISelectableToolboxItem} oldItem The previously selected
   *     toolbox item.
   * @param {?ISelectableToolboxItem} newItem The newly selected toolbox
   *     item.
   * @return {boolean} True if the old item should be deselected, false
   *     otherwise.
   * @protected
   */
  shouldDeselectItem_(oldItem, newItem) {
    // Deselect the old item unless the old item is collapsible and has been
    // previously clicked on.
    return oldItem !== null &&
        (!oldItem.isCollapsible() || oldItem !== newItem);
  }

  /**
   * Decides whether the new item should be selected.
   * @param {?ISelectableToolboxItem} oldItem The previously selected
   *     toolbox item.
   * @param {?ISelectableToolboxItem} newItem The newly selected toolbox
   *     item.
   * @return {boolean} True if the new item should be selected, false otherwise.
   * @protected
   */
  shouldSelectItem_(oldItem, newItem) {
    // Select the new item unless the old item equals the new item.
    return newItem !== null && newItem !== oldItem;
  }

  /**
   * Deselects the given item, marks it as unselected, and updates aria state.
   * @param {!ISelectableToolboxItem} item The previously selected
   *     toolbox item which should be deselected.
   * @protected
   */
  deselectItem_(item) {
    this.selectedItem_ = null;
    this.previouslySelectedItem_ = item;
    item.setSelected(false);
    aria.setState(
        /** @type {!Element} */ (this.contentsDiv_),
        aria.State.ACTIVEDESCENDANT, '');
  }

  /**
   * Selects the given item, marks it selected, and updates aria state.
   * @param {?ISelectableToolboxItem} oldItem The previously selected
   *     toolbox item.
   * @param {!ISelectableToolboxItem} newItem The newly selected toolbox
   *     item.
   * @protected
   */
  selectItem_(oldItem, newItem) {
    this.selectedItem_ = newItem;
    this.previouslySelectedItem_ = oldItem;
    newItem.setSelected(true);
    aria.setState(
        /** @type {!Element} */ (this.contentsDiv_),
        aria.State.ACTIVEDESCENDANT, newItem.getId());
  }

  /**
   * Selects the toolbox item by its position in the list of toolbox items.
   * @param {number} position The position of the item to select.
   * @public
   */
  selectItemByPosition(position) {
    if (position > -1 && position < this.contents_.length) {
      const item = this.contents_[position];
      if (item.isSelectable()) {
        this.setSelectedItem(item);
      }
    }
  }

  /**
   * Decides whether to hide or show the flyout depending on the selected item.
   * @param {?ISelectableToolboxItem} oldItem The previously selected toolbox
   *     item.
   * @param {?ISelectableToolboxItem} newItem The newly selected toolbox item.
   * @protected
   */
  updateFlyout_(oldItem, newItem) {
    if (!newItem || (oldItem === newItem && !newItem.isCollapsible()) ||
        !newItem.getContents().length) {
      this.flyout_.hide();
    } else {
      this.flyout_.show(newItem.getContents());
      this.flyout_.scrollToStart();
    }
  }

  /**
   * Emits an event when a new toolbox item is selected.
   * @param {?ISelectableToolboxItem} oldItem The previously selected
   *     toolbox item.
   * @param {?ISelectableToolboxItem} newItem The newly selected toolbox
   *     item.
   * @private
   */
  fireSelectEvent_(oldItem, newItem) {
    const oldElement = oldItem && oldItem.getName();
    let newElement = newItem && newItem.getName();
    // In this case the toolbox closes, so the newElement should be null.
    if (oldItem === newItem) {
      newElement = null;
    }
    const event = new (eventUtils.get(eventUtils.TOOLBOX_ITEM_SELECT))(
        oldElement, newElement, this.workspace_.id);
    eventUtils.fire(event);
  }

  /**
   * Closes the current item if it is expanded, or selects the parent.
   * @return {boolean} True if a parent category was selected, false otherwise.
   * @private
   */
  selectParent_() {
    if (!this.selectedItem_) {
      return false;
    }

    if (this.selectedItem_.isCollapsible() && this.selectedItem_.isExpanded()) {
      const collapsibleItem =
          /** @type {!ICollapsibleToolboxItem} */ (this.selectedItem_);
      collapsibleItem.setExpanded(false);
      return true;
    } else if (
        this.selectedItem_.getParent() &&
        this.selectedItem_.getParent().isSelectable()) {
      this.setSelectedItem(this.selectedItem_.getParent());
      return true;
    }
    return false;
  }

  /**
   * Selects the first child of the currently selected item, or nothing if the
   * toolbox item has no children.
   * @return {boolean} True if a child category was selected, false otherwise.
   * @private
   */
  selectChild_() {
    if (!this.selectedItem_ || !this.selectedItem_.isCollapsible()) {
      return false;
    }
    const collapsibleItem = /** @type {ICollapsibleToolboxItem} */
        (this.selectedItem_);
    if (!collapsibleItem.isExpanded()) {
      collapsibleItem.setExpanded(true);
      return true;
    } else {
      this.selectNext_();
      return true;
    }
  }

  /**
   * Selects the next visible toolbox item.
   * @return {boolean} True if a next category was selected, false otherwise.
   * @private
   */
  selectNext_() {
    if (!this.selectedItem_) {
      return false;
    }

    let nextItemIdx = this.contents_.indexOf(this.selectedItem_) + 1;
    if (nextItemIdx > -1 && nextItemIdx < this.contents_.length) {
      let nextItem = this.contents_[nextItemIdx];
      while (nextItem && !nextItem.isSelectable()) {
        nextItem = this.contents_[++nextItemIdx];
      }
      if (nextItem && nextItem.isSelectable()) {
        this.setSelectedItem(nextItem);
        return true;
      }
    }
    return false;
  }

  /**
   * Selects the previous visible toolbox item.
   * @return {boolean} True if a previous category was selected, false
   *     otherwise.
   * @private
   */
  selectPrevious_() {
    if (!this.selectedItem_) {
      return false;
    }

    let prevItemIdx = this.contents_.indexOf(this.selectedItem_) - 1;
    if (prevItemIdx > -1 && prevItemIdx < this.contents_.length) {
      let prevItem = this.contents_[prevItemIdx];
      while (prevItem && !prevItem.isSelectable()) {
        prevItem = this.contents_[--prevItemIdx];
      }
      if (prevItem && prevItem.isSelectable()) {
        this.setSelectedItem(prevItem);
        return true;
      }
    }
    return false;
  }

  /**
   * Disposes of this toolbox.
   * @public
   */
  dispose() {
    this.workspace_.getComponentManager().removeComponent('toolbox');
    this.flyout_.dispose();
    for (let i = 0; i < this.contents_.length; i++) {
      const toolboxItem = this.contents_[i];
      toolboxItem.dispose();
    }

    for (let j = 0; j < this.boundEvents_.length; j++) {
      browserEvents.unbind(this.boundEvents_[j]);
    }
    this.boundEvents_ = [];
    this.contents_ = [];

    this.workspace_.getThemeManager().unsubscribe(this.HtmlDiv);
    dom.removeNode(this.HtmlDiv);
  }
}

/**
 * CSS for Toolbox.  See css.js for use.
 */
Css.register(`
.blocklyToolboxDelete {
  cursor: url("<<<PATH>>>/handdelete.cur"), auto;
}

.blocklyToolboxGrab {
  cursor: url("<<<PATH>>>/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

/* Category tree in Toolbox. */
.blocklyToolboxDiv {
  background-color: #ddd;
  overflow-x: visible;
  overflow-y: auto;
  padding: 4px 0 4px 0;
  position: absolute;
  z-index: 70;  /* so blocks go under toolbox when dragging */
  -webkit-tap-highlight-color: transparent;  /* issue #1345 */
}

.blocklyToolboxContents {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

.blocklyToolboxContents:focus {
  outline: none;
}
`);

registry.register(registry.Type.TOOLBOX, registry.DEFAULT, Toolbox);

exports.Toolbox = Toolbox;
