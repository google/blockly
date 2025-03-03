/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file ToolboxResizer class for Blockly
 * @author dev@varwin.com (Varwin Developers)
 *
 * @class
 */

// Former goog.module("Blockly.ToolboxResizer");

import * as Blockly from '../blockly.js';
import * as Css from '../css.js';
import {throttle} from "../utils/throttle.js";
import * as toolbox from "../utils/toolbox.js";

interface InitOptions {
  minWidth: number;
  maxWidth?: number | null;
}

const DefaultInitOptions: InitOptions = {
  minWidth: 80,
  maxWidth: null
};

const ResizerToolboxOffset = 8;
const LocalStorageToolboxWidthKey = 'blockly-toolbox-width'

/**
 * Class for toolbox resizer.
 */
export class ToolboxResizer implements Blockly.IComponent {
  private workspace_: Blockly.WorkspaceSvg;
  private flyoutWorkspace_: Blockly.WorkspaceSvg;
  private toolbox: Blockly.Toolbox;
  public id: string;
  private htmlDiv_: HTMLElement | null;
  private toolboxHtmlDiv: HTMLElement;
  private minWidth: number | null;
  private maxWidth: number | null;
  private initialClientX: number | null;
  private initialWidth: number | null;
  private readonly throttleResizeToolbox: (width: number) => void;
  private onWorkspaceChangeWrapper: Function | null = null;

  constructor(workspace: Blockly.WorkspaceSvg, toolbox: Blockly.Toolbox, flyout: Blockly.IFlyout) {
    this.workspace_ = workspace;
    this.toolbox = toolbox;
    this.flyoutWorkspace_ = flyout.getWorkspace();

    if (this.workspace_.options.horizontalLayout) {
      throw new Error('ToolboxResizer is only supported in horizontal layout.');
    }

    const toolboxHtmlDiv = toolbox.HtmlDiv;
    if (toolboxHtmlDiv) {
      this.toolboxHtmlDiv = toolboxHtmlDiv;
    } else {
      throw new Error('Toolbox container cannot be null.');
    }

    this.id = 'toolboxResizer';
    this.htmlDiv_ = null;
    this.minWidth = null;
    this.maxWidth = null;
    this.initialClientX = null;
    this.initialWidth = null;
    this.throttleResizeToolbox = throttle(this.resizeToolbox.bind(this), 90, {trailing: true});
  }

  init({minWidth, maxWidth}: InitOptions = DefaultInitOptions): void {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth || null;

    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 0,
      capabilities: []
    });

    const initWidth = Number(localStorage.getItem(LocalStorageToolboxWidthKey)) || window.innerWidth * 0.20
    this.toolboxHtmlDiv.style.width = `${initWidth}px`;

    this.setToolboxSearchWidth();
    this.createDom_();

    this.onWorkspaceChangeWrapper = this.flyoutWorkspace_.addChangeListener(
      this.flyoutEventsListener.bind(this)
    );
    this.toolbox.handleToolboxItemResize = () => null;
  }

  dispose(): void {
    this.workspace_.getComponentManager().removeComponent(this.id);
    if (this.onWorkspaceChangeWrapper) {
      this.workspace_.removeChangeListener(this.onWorkspaceChangeWrapper);
    }

    if (this.htmlDiv_) {
      this.htmlDiv_.remove();
      this.htmlDiv_ = null;
    }
  }

  protected createDom_(): void {
    this.htmlDiv_ = document.createElement('div');
    this.htmlDiv_.classList.add('blocklyToolboxResizer');
    if (this.workspace_.RTL) {
      this.htmlDiv_.setAttribute('dir', 'RTL');
    }

    this.htmlDiv_.onmousedown = this.onMouseDown_.bind(this);

    this.workspace_.getInjectionDiv().insertBefore(this.htmlDiv_, this.toolboxHtmlDiv.nextSibling);
    this.position();
  }

  position(): void {
    if (!this.htmlDiv_) return;

    if (this.toolbox.toolboxPosition === toolbox.Position.RIGHT) {
      this.htmlDiv_.style.right = `${this.toolboxHtmlDiv.offsetWidth}px`;
    } else {
      this.htmlDiv_.style.left = `${this.toolboxHtmlDiv.offsetWidth}px`;
    }
  }

  flyoutEventsListener(event: Blockly.Events.Abstract): void {
    if (event.type === Blockly.Events.FLYOUT_SHOW) {
      this.hide();
    }
    if (event.type === Blockly.Events.FLYOUT_HIDE) {
      this.show();
    }
  }

  hide(): void {
    if (this.htmlDiv_) {
      this.htmlDiv_.style.display = 'none';
    }
  }

  show(): void {
    if (this.htmlDiv_) {
      this.htmlDiv_.style.display = 'block';
    }
  }

  getMaxWidth(): number {
    let maxWidth: number = 0;

    const injectionDiv = this.workspace_.getInjectionDiv();
    if (this.maxWidth) {
      maxWidth = this.maxWidth;
    } else if (injectionDiv instanceof HTMLElement) {
      const injectionDivWidth = injectionDiv.offsetWidth;
      maxWidth = Math.ceil(injectionDivWidth * 0.4 - 10);
    }

    if (this.initialWidth && this.initialWidth > maxWidth) {
      return this.initialWidth;
    } else {
      return maxWidth;
    }
  }

  onMouseDown_(e: MouseEvent): void {
    e.preventDefault();
    this.initialClientX = e.clientX;
    this.initialWidth = this.toolboxHtmlDiv.offsetWidth;

    document.addEventListener('mousemove', this.onMouseMove_);
    document.addEventListener('mouseup', this.onMouseUp_);
    this.htmlDiv_?.classList.add('resizing')
  }

  onMouseMove_ = (e: MouseEvent): void => {
    const width = this.calculateNewWidth(e);
    this.throttleResizeToolbox(width);
  }

  onMouseUp_ = (e: MouseEvent): void => {
    document.removeEventListener('mousemove', this.onMouseMove_);
    document.removeEventListener('mouseup', this.onMouseUp_);
    this.htmlDiv_?.classList.remove('resizing');

    const width = this.calculateNewWidth(e);
    this.resizeToolbox(width);

    this.initialClientX = null;
    this.initialWidth = null;
  }

  setToolboxSearchWidth(width?: number): void {
    let newWidth = width;
    if (!newWidth) {
      newWidth = this.toolboxHtmlDiv.offsetWidth;
    }

    this.toolbox.getSearch()?.resize(newWidth + ResizerToolboxOffset);
  }

  calculateNewWidth(e: MouseEvent): number {
    const clientX = e.clientX || 0;
    const initialClientX = this.initialClientX || 0;

    const diff= this.toolbox.toolboxPosition === toolbox.Position.RIGHT ? initialClientX - clientX : clientX - initialClientX;
    return Math.ceil((this.initialWidth || 0) + diff);
  }

  resizeToolbox(newWidth: number): void {
    if (!this.htmlDiv_) return;

    if (newWidth < (this.minWidth || 0)) newWidth = this.minWidth || 0;
    if (newWidth > this.getMaxWidth()) newWidth = this.getMaxWidth();

    const widthValue = `${newWidth}px`;
    localStorage.setItem(LocalStorageToolboxWidthKey, String(newWidth))

    if (this.toolboxHtmlDiv.style.width === widthValue) return;

    this.toolboxHtmlDiv.style.width = widthValue;
    this.toolbox.position();
    this.position();
    this.workspace_.resize();
    this.setToolboxSearchWidth(newWidth);
  }
}

/** CSS for ToolboxResizer.  See css.js for use. */
Css.register(`
.blocklyToolboxResizer {
  position: absolute;
  height: 100%;
  width: 8px;
  z-index: 71;
  background-color: #ddd;
}

.blocklyToolboxResizer::after {
  left: 0;
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='2' height='14' viewBox='0 0 2 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2342526E' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='1' cy='5' r='1'/%3E%3Ccircle cx='1' cy='9' r='1'/%3E%3Ccircle cx='1' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10% 50%;
  width: 8px;
  height: 100%;
  position: absolute;
}

.blocklyToolboxResizer:dir(RTL)::after {
  left: 4px;
}

.blocklyToolboxResizer:hover, .blocklyToolboxResizer .resizing {
  cursor: col-resize;
}

.blocklyToolboxCategory {
  max-width: 100%;
  overflow-x: hidden;
}

`);
