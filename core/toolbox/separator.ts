/** @fileoverview A separator used for separating toolbox categories. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * A separator used for separating toolbox categories.
 * @class
 */

import * as Css from '../css';
/* eslint-disable-next-line no-unused-vars */
import { IToolbox } from '../interfaces/i_toolbox';
import * as registry from '../registry';
import * as dom from '../utils/dom';
import * as object from '../utils/object';
/* eslint-disable-next-line no-unused-vars */
import * as toolbox from '../utils/toolbox';

import { ToolboxItem } from './toolbox_item';


/**
 * Class for a toolbox separator. This is the thin visual line that appears on
 * the toolbox. This item is not interactable.
 * @alias Blockly.ToolboxSeparator
 */
export class ToolboxSeparator extends ToolboxItem {
  /** Name used for registering a toolbox separator. */
  static registrationName = 'sep';

  /** All the CSS class names that are used to create a separator. */
  protected cssConfig_: CssConfig = { 'container': 'blocklyTreeSeparator' };

  private htmlDiv_: HTMLDivElement | null = null;

  /**
   * @param separatorDef The information needed to create a separator.
   * @param toolbox The parent toolbox for the separator.
   */
  constructor(separatorDef: toolbox.SeparatorInfo, toolbox: IToolbox) {
    super(separatorDef, toolbox);

    const cssConfig =
      separatorDef['cssconfig'] || (separatorDef as any)['cssConfig'];
    object.mixin(this.cssConfig_, cssConfig);
  }

  override init() {
    this.createDom_();
  }

  /**
   * Creates the DOM for a separator.
   * @return The parent element for the separator.
   */
  protected createDom_(): HTMLDivElement {
    const container = (document.createElement('div'));
    dom.addClass(container, this.cssConfig_['container']!);
    this.htmlDiv_ = container;
    return container;
  }

  override getDiv() {
    return this.htmlDiv_ as HTMLDivElement;
  }

  override dispose() {
    dom.removeNode(this.htmlDiv_ as HTMLDivElement);
  }
}
export interface CssConfig {
  container: string | undefined;
}

/** CSS for Toolbox.  See css.js for use. */
Css.register(`
.blocklyTreeSeparator {
  border-bottom: solid #e5e5e5 1px;
  height: 0;
  margin: 5px 0;
}

.blocklyToolboxDiv[layout="h"] .blocklyTreeSeparator {
  border-right: solid #e5e5e5 1px;
  border-bottom: none;
  height: auto;
  margin: 0 5px 0 5px;
  padding: 5px 0;
  width: 0;
}
`);

registry.register(
  registry.Type.TOOLBOX_ITEM, ToolboxSeparator.registrationName,
  ToolboxSeparator);
