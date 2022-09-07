/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A toolbox category used to organize blocks in the toolbox.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.ToolboxCategory');

import * as Css from '../css.js';
import type {ICollapsibleToolboxItem} from '../interfaces/i_collapsible_toolbox_item.js';
import type {ISelectableToolboxItem} from '../interfaces/i_selectable_toolbox_item.js';
import type {IToolbox} from '../interfaces/i_toolbox.js';
import type {IToolboxItem} from '../interfaces/i_toolbox_item.js';
import * as registry from '../registry.js';
import * as aria from '../utils/aria.js';
import * as colourUtils from '../utils/colour.js';
import * as dom from '../utils/dom.js';
import * as parsing from '../utils/parsing.js';
import * as toolbox from '../utils/toolbox.js';

import {ToolboxItem} from './toolbox_item.js';


/**
 * Class for a category in a toolbox.
 *
 * @alias Blockly.ToolboxCategory
 */
export class ToolboxCategory extends ToolboxItem implements
    ISelectableToolboxItem {
  /** Name used for registering a toolbox category. */
  static registrationName = 'category';

  /** The number of pixels to move the category over at each nested level. */
  static nestedPadding = 19;

  /** The width in pixels of the strip of colour next to each category. */
  static borderWidth = 8;

  /**
   * The default colour of the category. This is used as the background colour
   * of the category when it is selected.
   */
  static defaultBackgroundColour = '#57e';

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  override toolboxItemDef_!: toolbox.CategoryInfo;

  /** The name that will be displayed on the category. */
  protected name_ = '';

  /** The colour of the category. */
  protected colour_ = '';

  /** The html container for the category. */
  protected htmlDiv_: HTMLDivElement|null = null;

  /** The html element for the category row. */
  protected rowDiv_: HTMLDivElement|null = null;

  /** The html element that holds children elements of the category row. */
  protected rowContents_: HTMLDivElement|null = null;

  /** The html element for the toolbox icon. */
  protected iconDom_: Element|null = null;

  /** The html element for the toolbox label. */
  protected labelDom_: Element|null = null;
  protected cssConfig_: CssConfig;

  /** True if the category is meant to be hidden, false otherwise. */
  protected isHidden_ = false;

  /** True if this category is disabled, false otherwise. */
  protected isDisabled_ = false;

  /** The flyout items for this category. */
  protected flyoutItems_: string|toolbox.FlyoutItemInfoArray = [];

  /**
   * @param categoryDef The information needed to create a category in the
   *     toolbox.
   * @param parentToolbox The parent toolbox for the category.
   * @param opt_parent The parent category or null if the category does not have
   *     a parent.
   */
  constructor(
      categoryDef: toolbox.CategoryInfo, parentToolbox: IToolbox,
      opt_parent?: ICollapsibleToolboxItem) {
    super(categoryDef, parentToolbox, opt_parent);

    /** All the css class names that are used to create a category. */
    this.cssConfig_ = this.makeDefaultCssConfig_();
  }

  /**
   * Initializes the toolbox item.
   * This includes creating the DOM and updating the state of any items based
   * on the info object.
   * Init should be called immediately after the construction of the toolbox
   * item, to ensure that the category contents are properly parsed.
   */
  override init() {
    this.parseCategoryDef_(this.toolboxItemDef_);
    this.parseContents_(this.toolboxItemDef_);
    this.createDom_();
    if (this.toolboxItemDef_['hidden'] === 'true') {
      this.hide();
    }
  }

  /**
   * Creates an object holding the default classes for a category.
   *
   * @returns The configuration object holding all the CSS classes for a
   *     category.
   */
  protected makeDefaultCssConfig_(): CssConfig {
    // AnyDuringMigration because:  Type '{ container: string; row: string;
    // rowcontentcontainer: string; icon: string; label: string; contents:
    // string; selected: string; openicon: string; closedicon: string; }' is not
    // assignable to type 'CssConfig'.
    return {
      'container': 'blocklyToolboxCategory',
      'row': 'blocklyTreeRow',
      'rowcontentcontainer': 'blocklyTreeRowContentContainer',
      'icon': 'blocklyTreeIcon',
      'label': 'blocklyTreeLabel',
      'contents': 'blocklyToolboxContents',
      'selected': 'blocklyTreeSelected',
      'openicon': 'blocklyTreeIconOpen',
      'closedicon': 'blocklyTreeIconClosed',
    } as AnyDuringMigration;
  }

  /**
   * Parses the contents array depending on if the category is a dynamic
   * category, or if its contents are meant to be shown in the flyout.
   *
   * @param categoryDef The information needed to create a category.
   */
  protected parseContents_(categoryDef: toolbox.CategoryInfo) {
    const contents = (categoryDef as AnyDuringMigration)['contents'];

    if ((categoryDef as AnyDuringMigration)['custom']) {
      this.flyoutItems_ = (categoryDef as AnyDuringMigration)['custom'];
    } else if (contents) {
      for (let i = 0; i < contents.length; i++) {
        const itemDef = contents[i];
        const flyoutItem = itemDef as toolbox.FlyoutItemInfo;
        // AnyDuringMigration because:  Property 'push' does not exist on type
        // 'string | FlyoutItemInfoArray'.
        (this.flyoutItems_ as AnyDuringMigration).push(flyoutItem);
      }
    }
  }

  /**
   * Parses the non-contents parts of the category def.
   *
   * @param categoryDef The information needed to create a category.
   */
  protected parseCategoryDef_(categoryDef: toolbox.CategoryInfo) {
    this.name_ = parsing.replaceMessageReferences(
        (categoryDef as AnyDuringMigration)['name']);
    this.colour_ = this.getColour_(categoryDef);
    Object.assign(
        this.cssConfig_,
        categoryDef['cssconfig'] ||
            (categoryDef as AnyDuringMigration)['cssConfig']);
  }

  /**
   * Creates the DOM for the category.
   *
   * @returns The parent element for the category.
   */
  protected createDom_(): HTMLDivElement {
    this.htmlDiv_ = this.createContainer_();
    aria.setRole(this.htmlDiv_, aria.Role.TREEITEM);
    aria.setState((this.htmlDiv_), aria.State.SELECTED, false);
    aria.setState((this.htmlDiv_), aria.State.LEVEL, this.level_);

    this.rowDiv_ = this.createRowContainer_();
    this.rowDiv_.style.pointerEvents = 'auto';
    this.htmlDiv_.appendChild(this.rowDiv_);

    this.rowContents_ = this.createRowContentsContainer_();
    this.rowContents_.style.pointerEvents = 'none';
    this.rowDiv_.appendChild(this.rowContents_);

    this.iconDom_ = this.createIconDom_();
    aria.setRole(this.iconDom_, aria.Role.PRESENTATION);
    this.rowContents_.appendChild(this.iconDom_);

    this.labelDom_ = this.createLabelDom_(this.name_);
    this.rowContents_.appendChild(this.labelDom_);
    // AnyDuringMigration because:  Argument of type 'string | null' is not
    // assignable to parameter of type 'string | number | boolean | string[]'.
    aria.setState(
        this.htmlDiv_ as Element, aria.State.LABELLEDBY,
        this.labelDom_.getAttribute('id') as AnyDuringMigration);

    this.addColourBorder_(this.colour_);

    return this.htmlDiv_;
  }

  /**
   * Creates the container that holds the row and any subcategories.
   *
   * @returns The div that holds the icon and the label.
   */
  protected createContainer_(): HTMLDivElement {
    const container = document.createElement('div');
    const className = this.cssConfig_.container;
    if (className) {
      container.classList.add(className);
    }
    return container;
  }

  /**
   * Creates the parent of the contents container. All clicks will happen on
   * this div.
   *
   * @returns The div that holds the contents container.
   */
  protected createRowContainer_(): HTMLDivElement {
    const rowDiv = (document.createElement('div'));
    const className = this.cssConfig_.row;
    if (className) {
      rowDiv.classList.add(className);
    }
    let nestedPadding = ToolboxCategory.nestedPadding * this.getLevel();
    // AnyDuringMigration because:  Type 'string' is not assignable to type
    // 'number'.
    nestedPadding = (nestedPadding.toString() + 'px') as AnyDuringMigration;
    // AnyDuringMigration because:  Type 'number' is not assignable to type
    // 'string'. AnyDuringMigration because:  Type 'number' is not assignable to
    // type 'string'.
    this.workspace_.RTL ?
        rowDiv.style.paddingRight = nestedPadding as AnyDuringMigration :
        rowDiv.style.paddingLeft = nestedPadding as AnyDuringMigration;
    return rowDiv;
  }

  /**
   * Creates the container for the label and icon.
   * This is necessary so we can set all subcategory pointer events to none.
   *
   * @returns The div that holds the icon and the label.
   */
  protected createRowContentsContainer_(): HTMLDivElement {
    const contentsContainer = document.createElement('div');
    const className = this.cssConfig_.rowcontentcontainer;
    if (className) {
      contentsContainer.classList.add(className);
    }
    return contentsContainer;
  }

  /**
   * Creates the span that holds the category icon.
   *
   * @returns The span that holds the category icon.
   */
  protected createIconDom_(): Element {
    const toolboxIcon = document.createElement('span');
    if (!this.parentToolbox_.isHorizontal()) {
      const className = this.cssConfig_.icon;
      if (className) {
        toolboxIcon.classList.add(className);
      }
    }

    toolboxIcon.style.display = 'inline-block';
    return toolboxIcon;
  }

  /**
   * Creates the span that holds the category label.
   * This should have an ID for accessibility purposes.
   *
   * @param name The name of the category.
   * @returns The span that holds the category label.
   */
  protected createLabelDom_(name: string): Element {
    const toolboxLabel = document.createElement('span');
    toolboxLabel.setAttribute('id', this.getId() + '.label');
    toolboxLabel.textContent = name;
    const className = this.cssConfig_.label;
    if (className) {
      toolboxLabel.classList.add(className);
    }
    return toolboxLabel;
  }

  /** Updates the colour for this category. */
  refreshTheme() {
    this.colour_ = this.getColour_((this.toolboxItemDef_));
    this.addColourBorder_(this.colour_);
  }

  /**
   * Add the strip of colour to the toolbox category.
   *
   * @param colour The category colour.
   */
  protected addColourBorder_(colour: string) {
    if (colour) {
      const border =
          ToolboxCategory.borderWidth + 'px solid ' + (colour || '#ddd');
      if (this.workspace_.RTL) {
        this.rowDiv_!.style.borderRight = border;
      } else {
        this.rowDiv_!.style.borderLeft = border;
      }
    }
  }

  /**
   * Gets either the colour or the style for a category.
   *
   * @param categoryDef The object holding information on the category.
   * @returns The hex colour for the category.
   */
  protected getColour_(categoryDef: toolbox.CategoryInfo): string {
    const styleName =
        categoryDef['categorystyle'] || (categoryDef as any)['categoryStyle'];
    const colour = categoryDef['colour'];

    if (colour && styleName) {
      console.warn(
          'Toolbox category "' + this.name_ +
          '" must not have both a style and a colour');
    } else if (styleName) {
      return this.getColourfromStyle_(styleName);
    } else {
      // AnyDuringMigration because:  Argument of type 'string | undefined' is
      // not assignable to parameter of type 'string | number'.
      return this.parseColour_(colour as AnyDuringMigration);
    }
    return '';
  }

  /**
   * Sets the colour for the category using the style name and returns the new
   * colour as a hex string.
   *
   * @param styleName Name of the style.
   * @returns The hex colour for the category.
   */
  private getColourfromStyle_(styleName: string): string {
    const theme = this.workspace_.getTheme();
    if (styleName && theme) {
      const style = theme.categoryStyles[styleName];
      if (style && style.colour) {
        return this.parseColour_(style.colour);
      } else {
        console.warn(
            'Style "' + styleName + '" must exist and contain a colour value');
      }
    }
    return '';
  }

  /**
   * Gets the HTML element that is clickable.
   * The parent toolbox element receives clicks. The parent toolbox will add an
   * ID to this element so it can pass the onClick event to the correct
   * toolboxItem.
   *
   * @returns The HTML element that receives clicks.
   */
  override getClickTarget(): Element {
    return this.rowDiv_ as Element;
  }

  /**
   * Parses the colour on the category.
   *
   * @param colourValue HSV hue value (0 to 360), #RRGGBB string, or a message
   *     reference string pointing to one of those two values.
   * @returns The hex colour for the category.
   */
  private parseColour_(colourValue: number|string): string {
    // Decode the colour for any potential message references
    // (eg. `%{BKY_MATH_HUE}`).
    const colour = parsing.replaceMessageReferences(colourValue);
    if (colour == null || colour === '') {
      // No attribute. No colour.
      return '';
    } else {
      const hue = Number(colour);
      if (!isNaN(hue)) {
        return colourUtils.hueToHex(hue);
      } else {
        const hex = colourUtils.parse(colour);
        if (hex) {
          return hex;
        } else {
          console.warn(
              'Toolbox category "' + this.name_ +
              '" has unrecognized colour attribute: ' + colour);
          return '';
        }
      }
    }
  }

  /**
   * Adds appropriate classes to display an open icon.
   *
   * @param iconDiv The div that holds the icon.
   */
  protected openIcon_(iconDiv: Element|null) {
    if (!iconDiv) {
      return;
    }
    // AnyDuringMigration because:  Argument of type 'string | undefined' is not
    // assignable to parameter of type 'string'.
    dom.removeClasses(
        iconDiv, (this.cssConfig_ as AnyDuringMigration)['closedicon']);
    const className = this.cssConfig_.openicon;
    if (className) {
      iconDiv.classList.add(className);
    }
  }

  /**
   * Adds appropriate classes to display a closed icon.
   *
   * @param iconDiv The div that holds the icon.
   */
  protected closeIcon_(iconDiv: Element|null) {
    if (!iconDiv) {
      return;
    }
    // AnyDuringMigration because:  Argument of type 'string | undefined' is not
    // assignable to parameter of type 'string'.
    dom.removeClasses(
        iconDiv, (this.cssConfig_ as AnyDuringMigration)['openicon']);
    const className = this.cssConfig_.closedicon;
    if (className) {
      iconDiv.classList.add(className);
    }
  }

  /**
   * Sets whether the category is visible or not.
   * For a category to be visible its parent category must also be expanded.
   *
   * @param isVisible True if category should be visible.
   */
  override setVisible_(isVisible: boolean) {
    this.htmlDiv_!.style.display = isVisible ? 'block' : 'none';
    this.isHidden_ = !isVisible;

    if (this.parentToolbox_.getSelectedItem() === this) {
      this.parentToolbox_.clearSelection();
    }
  }

  /** Hide the category. */
  hide() {
    this.setVisible_(false);
  }

  /**
   * Show the category. Category will only appear if its parent category is also
   * expanded.
   */
  show() {
    this.setVisible_(true);
  }

  /**
   * Whether the category is visible.
   * A category is only visible if all of its ancestors are expanded and
   * isHidden_ is false.
   *
   * @returns True if the category is visible, false otherwise.
   */
  isVisible(): boolean {
    return !this.isHidden_ && this.allAncestorsExpanded_();
  }

  /**
   * Whether all ancestors of a category (parent and parent's parent, etc.) are
   * expanded.
   *
   * @returns True only if every ancestor is expanded
   */
  protected allAncestorsExpanded_(): boolean {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    let category: IToolboxItem = this;
    while (category.getParent()) {
      category = category.getParent()!;
      if (!(category as ICollapsibleToolboxItem).isExpanded()) {
        return false;
      }
    }
    return true;
  }

  override isSelectable() {
    return this.isVisible() && !this.isDisabled_;
  }

  /**
   * Handles when the toolbox item is clicked.
   *
   * @param _e Click event to handle.
   */
  onClick(_e: Event) {}
  // No-op

  /**
   * Sets the current category as selected.
   *
   * @param isSelected True if this category is selected, false otherwise.
   */
  setSelected(isSelected: boolean) {
    if (isSelected) {
      const defaultColour =
          this.parseColour_(ToolboxCategory.defaultBackgroundColour);
      this.rowDiv_!.style.backgroundColor = this.colour_ || defaultColour;
      const className = this.cssConfig_.selected;
      if (className && this.rowDiv_) {
        this.rowDiv_.classList.add(className);
      }
    } else {
      this.rowDiv_!.style.backgroundColor = '';
      dom.removeClass(this.rowDiv_!, this.cssConfig_['selected']!);
    }
    aria.setState(this.htmlDiv_ as Element, aria.State.SELECTED, isSelected);
  }

  /**
   * Sets whether the category is disabled.
   *
   * @param isDisabled True to disable the category, false otherwise.
   */
  setDisabled(isDisabled: boolean) {
    this.isDisabled_ = isDisabled;
    // AnyDuringMigration because:  Argument of type 'boolean' is not assignable
    // to parameter of type 'string'.
    this.getDiv()!.setAttribute('disabled', isDisabled as AnyDuringMigration);
    isDisabled ? this.getDiv()!.setAttribute('disabled', 'true') :
                 this.getDiv()!.removeAttribute('disabled');
  }

  /**
   * Gets the name of the category. Used for emitting events.
   *
   * @returns The name of the toolbox item.
   */
  getName(): string {
    return this.name_;
  }

  override getParent() {
    return this.parent_;
  }

  override getDiv() {
    return this.htmlDiv_;
  }

  /**
   * Gets the contents of the category. These are items that are meant to be
   * displayed in the flyout.
   *
   * @returns The definition of items to be displayed in the flyout.
   */
  getContents(): toolbox.FlyoutItemInfoArray|string {
    return this.flyoutItems_;
  }

  /**
   * Updates the contents to be displayed in the flyout.
   * If the flyout is open when the contents are updated, refreshSelection on
   * the toolbox must also be called.
   *
   * @param contents The contents to be displayed in the flyout. A string can be
   *     supplied to create a dynamic category.
   */
  updateFlyoutContents(contents: toolbox.FlyoutDefinition|string) {
    this.flyoutItems_ = [];

    if (typeof contents === 'string') {
      (this.toolboxItemDef_ as AnyDuringMigration)['custom'] = contents;
    } else {
      // Removes old custom field when contents is updated.
      delete (this.toolboxItemDef_ as AnyDuringMigration)['custom'];
      (this.toolboxItemDef_ as AnyDuringMigration)['contents'] =
          toolbox.convertFlyoutDefToJsonArray(contents);
    }
    this.parseContents_((this.toolboxItemDef_));
  }

  override dispose() {
    dom.removeNode(this.htmlDiv_);
  }
}

export namespace ToolboxCategory {
  /** All the CSS class names that are used to create a category. */
  export interface CssConfig {
    container: string|undefined;
    row: string|undefined;
    rowcontentcontainer: string|undefined;
    icon: string|undefined;
    label: string|undefined;
    selected: string|undefined;
    openicon: string|undefined;
    closedicon: string|undefined;
  }
}

export type CssConfig = ToolboxCategory.CssConfig;

/** CSS for Toolbox.  See css.js for use. */
Css.register(`
.blocklyTreeRow:not(.blocklyTreeSelected):hover {
  background-color: rgba(255, 255, 255, .2);
}

.blocklyToolboxDiv[layout="h"] .blocklyToolboxCategory {
  margin: 1px 5px 1px 0;
}

.blocklyToolboxDiv[dir="RTL"][layout="h"] .blocklyToolboxCategory {
  margin: 1px 0 1px 5px;
}

.blocklyTreeRow {
  height: 22px;
  line-height: 22px;
  margin-bottom: 3px;
  padding-right: 8px;
  white-space: nowrap;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {
  margin-left: 8px;
  padding-right: 0;
}

.blocklyTreeIcon {
  background-image: url(<<<PATH>>>/sprites.png);
  height: 16px;
  vertical-align: middle;
  visibility: hidden;
  width: 16px;
}

.blocklyTreeIconClosed {
  background-position: -32px -1px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeIconClosed {
  background-position: 0 -1px;
}

.blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: -32px -17px;
}

.blocklyToolboxDiv[dir="RTL"] .blocklyTreeSelected>.blocklyTreeIconClosed {
  background-position: 0 -17px;
}

.blocklyTreeIconOpen {
  background-position: -16px -1px;
}

.blocklyTreeSelected>.blocklyTreeIconOpen {
  background-position: -16px -17px;
}

.blocklyTreeLabel {
  cursor: default;
  font: 16px sans-serif;
  padding: 0 3px;
  vertical-align: middle;
}

.blocklyToolboxDelete .blocklyTreeLabel {
  cursor: url("<<<PATH>>>/handdelete.cur"), auto;
}

.blocklyTreeSelected .blocklyTreeLabel {
  color: #fff;
}
`);

registry.register(
    registry.Type.TOOLBOX_ITEM, ToolboxCategory.registrationName,
    ToolboxCategory);
