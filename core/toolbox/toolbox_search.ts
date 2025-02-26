/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ToolboxSearch class for Blockly
 * @author dev@varwin.com (Varwin Developers)
 *
 * @class
 */

// Former goog.module("Blockly.ToolboxSearch");
import * as Blockly from '../blockly.js';
import * as toolbox from "../utils/toolbox";
import * as browserEvents from '../browser_events.js';
import {DynamicCategoryInfo} from "../utils/toolbox";
import {ICollapsibleToolboxItem} from "../blockly.js";
import * as Css from '../css.js';
import {Msg} from '../msg.js';

/**
 * Class for toolbox search.
 */
export class ToolboxSearch implements Blockly.IComponent {
  private readonly workspace_: Blockly.WorkspaceSvg;
  private toolbox_: Blockly.Toolbox;
  private initialToolboxDef_: Blockly.utils.toolbox.ToolboxInfo;
  public id: string;
  private htmlDiv_: HTMLElement | null;
  private inputElement_: HTMLInputElement | null;
  /**
   * Array holding info needed to unbind event handlers.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   */
  protected boundEvents_: browserEvents.Data[] = [];

  /**
   * Class for toolbox search.
   *
   * @param {!Blockly.WorkspaceSvg} workspace The workspace where toolbox sits in.
   * @param {!Blockly.Toolbox} toolbox The toolbox to search in.
   * @param {!Blockly.utils.toolbox.ToolboxInfo} toolboxDef_ The toolbox definition.
   */
  constructor(workspace: Blockly.WorkspaceSvg, toolbox: Blockly.Toolbox, toolboxDef_: toolbox.ToolboxInfo) {
    this.workspace_ = workspace;
    this.toolbox_ = toolbox;
    this.initialToolboxDef_ = Object.assign({}, toolboxDef_);
    this.id = 'toolboxSearch';
    this.htmlDiv_ = null;
    this.inputElement_ = null;
    this.boundEvents_ = [];
  }

  /**
   * Initializes the workspace search bar.
   */
  init(): void {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 0,
      capabilities: []
    });
    this.createDom_();
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose(): void {
    this.workspace_.getComponentManager().removeComponent(this.id);
    for (const event of this.boundEvents_) {
      Blockly.browserEvents.unbind(event);
    }
    this.boundEvents_ = [];
    if (this.htmlDiv_) {
      this.htmlDiv_.remove();
      this.htmlDiv_ = null;
    }
    this.inputElement_ = null;
  }

  resize(width: number): void {
    if (this.htmlDiv_) {
      this.htmlDiv_.style.width = `${width}px`;
    }
  }

  /**
   * Creates and injects the search bar's DOM.
   *
   * @protected
   */
  protected createDom_(): void {
    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blocklyToolboxSearch');

    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'blocklyToolboxSearchInput');
    this.inputElement_ = this.createSearchInput_();
    this.addEvent_(this.inputElement_, 'input', this, debounce(this.onInput_.bind(this), 300));

    inputWrapper.appendChild(this.inputElement_);
    this.htmlDiv_.appendChild(inputWrapper);

    const moduleBarHtml = this.workspace_.getModuleBar()!.getUlWrapElement()!;
    moduleBarHtml.parentNode!.insertBefore(this.htmlDiv_, moduleBarHtml);
  }

  /**
   * Helper method for adding an event.
   *
   * @param {!Element} node Node upon which to listen.
   * @param {string} name Event name to listen to (e.g. 'mousedown').
   * @param {object} thisObject The value of 'this' in the function.
   * @param {Function} func Function to call when event is triggered.
   * @private
   */
  private addEvent_(node: Element, name: string, thisObject: any, func: Function): void {
    const event = Blockly.browserEvents.conditionalBind(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Creates the text input for the search bar.
   *
   * @returns {!HTMLInputElement} A text input for the search bar.
   * @protected
   */
  protected createSearchInput_(): HTMLInputElement {
    const textInput = document.createElement('input');
    textInput.type = 'search';
    textInput.setAttribute('placeholder', Msg['TOOLBOX_SEARCH_PLACEHOLDER']);
    return textInput;
  }

  /**
   * Handles input value change in search bar.
   *
   * @private
   */
  private onInput_(): void {
    const inputValue = this.inputElement_?.value.trim().toLowerCase() || '';
    this.searchBlocks(inputValue);
  }

  /**
   * A search blocks in toolbox definition tree function
   *
   * @param {string} searchString string
   */
  searchBlocks(searchString: string): void {
    if (!searchString) {
      this.workspace_.updateToolbox(this.initialToolboxDef_);
      this.toolbox_.getFlyout()!.hide();
      return;
    }

    const searchWorkspace = new Blockly.Workspace();

    const workspaceVariables = this.workspace_.getVariableMap().getAllVariables();
    workspaceVariables.forEach(variable => {
      searchWorkspace.getVariableMap().createVariable(variable.name, variable.type, variable.getId());
    });

    const toolboxWithDynamicCategories = Object.assign({}, this.initialToolboxDef_, {
      contents: this.initialToolboxDef_.contents.map(category => {
        if (!('custom' in category)) {
          return category;
        }

        let blockXmls: Element[] = [];

        switch ((category as DynamicCategoryInfo).custom) {
          case Blockly.VARIABLE_CATEGORY_NAME:
            blockXmls = Blockly.Variables.flyoutCategoryBlocks(searchWorkspace);
            break;

          case Blockly.PROCEDURE_CATEGORY_NAME:
            blockXmls = Blockly.Procedures.flyoutCategory(this.workspace_);
            break;

          default:
            return category;
        }

        return {
          name: category.name,
          colour: category.colour,
          categorystyle: category.categorystyle,
          kind: Blockly.ToolboxCategory.registrationName,
          contents: blockXmls.map(blockXml => {
            const typeAttr = blockXml.attributes.getNamedItem('type');
            return {
              blockxml: blockXml,
              kind: 'BLOCK',
              type: typeAttr ? typeAttr.value : ''
            }
          })
        };
      })
    });

    const searchedToolboxDef = this.searchToolboxDefinition(toolboxWithDynamicCategories, searchString, searchWorkspace);

    if (!searchedToolboxDef) {
      this.workspace_.updateToolbox({
        contents: [{
          kind: 'CATEGORY',
          name: Msg['TOOLBOX_SEARCH_NOTHING_FOUND']
        }]
      });

      this.toolbox_.getFlyout()!.hide();
      searchWorkspace.dispose();

      return;
    }

    this.workspace_.updateToolbox(searchedToolboxDef);

    const firstCategoryItem = this.toolbox_.getToolboxItems()?.[0] || null;

    if (firstCategoryItem) {
      if (firstCategoryItem.isCollapsible()) {
        const childToolboxItems = (firstCategoryItem as ICollapsibleToolboxItem).getChildToolboxItems();
        if (childToolboxItems.length > 0) {
          const firstChildClickTarget = childToolboxItems[0].getClickTarget();
          if (firstChildClickTarget instanceof HTMLElement) {
            this.emulateClick(firstChildClickTarget);
          }
        }
      } else {
        const clickTarget = firstCategoryItem.getClickTarget();
        if (clickTarget instanceof HTMLElement) {
          this.emulateClick(clickTarget);
        }
      }
    }

    searchWorkspace.dispose();
  }

  emulateClick(target: HTMLElement): void {
    const event = new PointerEvent('pointerdown', {
      pointerId: 1,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
  }

  /**
   * Sets the initial toolbox definition.
   *
   * @param {!Blockly.utils.toolbox.ToolboxInfo} def The toolbox definition.
   */
  setInitialToolboxDef(def: Blockly.utils.toolbox.ToolboxInfo): void {
    this.initialToolboxDef_ = def;
  }

  searchToolboxDefinition(item: any, searchString: string, searchWorkspace: Blockly.Workspace): any {
    if (item.contents) {
      const foundChildren: any[] = [];
      item.contents.forEach((child: any) => {
        const foundChild = this.searchToolboxDefinition(child, searchString, searchWorkspace);
        if (foundChild) {
          foundChildren.push(foundChild);
        }
      });

      if (foundChildren.length) {
        return {
          ...item,
          contents: [...foundChildren]
        };
      }
    } else {
      if (item.kind === 'BLOCK') {
        const blockXml = item.blockxml;
        const blockType = blockXml.attributes.type.value;
        const searchBlock = searchWorkspace.newBlock(blockType, Blockly.utils.idGenerator.genUid());

        if (searchBlock.isObsolete() || searchBlock.isRemoved()) {
          return null;
        }

        if (blockType.toLowerCase().search(searchString) > -1 || blockXml.outerHTML.toLowerCase().search(searchString) > -1) {
          return item;
        }

        if (this.getBlockSearchString(searchBlock).toLowerCase().search(searchString) > -1) {
          return item;
        }
      }
    }

    return null;
  }

  getBlockSearchString(block: Blockly.Block): string {
    const text: string[] = [];

    const prevNavigateFields = Blockly.ASTNode.NAVIGATE_ALL_FIELDS;
    Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;

    let node = Blockly.ASTNode.createBlockNode(block);
    const rootNode = node;

    function checkRoot() {
      if (node && rootNode && node.getType() === rootNode.getType() && node.getLocation() === rootNode.getLocation()) {
        node = null;
      }
    }

    while (node) {
      switch (node.getType()) {
        case Blockly.ASTNode.types.FIELD: {
          const field = node.getLocation() as Blockly.Field;

          if (field instanceof Blockly.FieldDropdown) {
            if (Array.isArray((field as any).generatedOptions_)) {
              (field as any).generatedOptions_.forEach((option: any) => {
                text.push(option[0]);
              });
            } else if (Array.isArray((field as any).menuGenerator_)) {
              (field as any).menuGenerator_.forEach((option: any) => {
                text.push(option[0]);
              });
            }

            break;
          }

          if (field.name !== Blockly.constants.COLLAPSED_FIELD_NAME) {
            text.push(field.getText());
          }

          break;
        }
      }

      const current = node;
      node = current.in() || current.next();

      if (!node) {
        node = current.out();
        checkRoot();
        while (node && !node.next()) {
          node = node.out();
          checkRoot();
        }
        if (node) {
          node = node.next();
        }
      }
    }

    Blockly.ASTNode.NAVIGATE_ALL_FIELDS = prevNavigateFields;

    const tooltip = block.tooltip;
    if (typeof tooltip === 'function') {
      const tooltipResult = tooltip();
      if (typeof tooltipResult === 'string') {
        text.push(tooltipResult);
      }
    } else if (typeof tooltip === 'string') {
      text.push(tooltip);
    }

    return text.join(' ').trim();
  }
}

function debounce(func: (...args: any[]) => void, wait: number, immediate: boolean = false) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: any[]) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}


/** CSS for ToolboxSearch. See css.js for use. */
Css.register(`
.blocklyToolboxSearch {
  height: 40px;
  background-color: #ddd;
  overflow: hidden;
  flex-shrink: 0;
}

.blocklyToolboxSearchInput {
  padding: 4px 8px;
}

.blocklyToolboxSearchInput input {
  width: 100%;
  padding: 4px 8px 4px 16px;
  border: 2px solid #dddddd;
  border-radius: 5px;
  background-color: #f6f6f6;
  outline: none;
}

.blocklyToolboxSearchInput input:focus {
  border-color: #5c81a6;
}

`);
