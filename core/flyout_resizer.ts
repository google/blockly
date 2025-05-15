/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file FlyoutResizer class for Blockly
 * @author dev@varwin.com (Varwin Developers)
 *
 * @class
 */

import * as Blockly from './blockly.js';
import * as Css from './css.js';
import {throttle} from "./utils/throttle.js";
import {Flyout} from "./blockly.js";

interface InitOptions {
  minWidth: number;
  maxWidth?: number | null;
}

const DefaultInitOptions: InitOptions = {
  minWidth: 100,
  maxWidth: null
};

const LocalStorageFlyoutWidthKey = 'blockly-flyout-width'

/**
 * Class for flyout resizer.
 */
export class FlyoutResizer implements Blockly.IComponent {
  private workspace_: Blockly.WorkspaceSvg;
  private toolbox_: Blockly.Toolbox;
  private flyoutWorkspace_: Blockly.WorkspaceSvg;
  private flyout_: Blockly.IFlyout;
  public id: string;
  private htmlDiv_: HTMLElement | null;
  private minWidth: number | null;
  private maxWidth: number | null;
  private initialWidth: number | null;
  private initialClientX: number | null;
  private readonly throttleResizeFlyout: (width: number) => void;
  private onWorkspaceChangeWrapper: Function | null = null;

  constructor(workspace: Blockly.WorkspaceSvg, flyout: Blockly.IFlyout) {
    this.workspace_ = workspace;

    const toolbox = workspace.getToolbox();
    if (toolbox instanceof Blockly.Toolbox) {
      this.toolbox_ = toolbox;
    } else {
      throw new Error('Toolbox not found.');
    }

    this.flyout_ = flyout;
    this.flyoutWorkspace_ = flyout.getWorkspace();
    this.id = 'flyoutResizer';
    this.htmlDiv_ = null;
    this.minWidth = null;
    this.maxWidth = null;
    this.initialWidth = null;
    this.initialClientX = null;
    this.throttleResizeFlyout = throttle(this.moveFlyout.bind(this), 90, { trailing: true });
  }

  init({ minWidth, maxWidth }: InitOptions = DefaultInitOptions): void {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth || null;

    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 0,
      capabilities: []
    });

    let defaultWidth = window.innerWidth * 0.20;

    if (this.maxWidth && defaultWidth > this.maxWidth) {
      defaultWidth = this.maxWidth;
    }

    if (this.minWidth && defaultWidth < this.minWidth) {
      defaultWidth = this.minWidth;
    }

    const initWidth = Number(localStorage.getItem(LocalStorageFlyoutWidthKey)) || defaultWidth;
    if (this.flyout_ instanceof Flyout) {
      this.flyout_.setWidth(initWidth);
      this.flyout_.setAutoClose(false);
      this.flyout_.fixedWidth = true;
    }

    this.createDom_();
    this.flyoutWorkspace_.addChangeListener(this.flyoutEventsListener.bind(this));
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
    this.htmlDiv_.classList.add('blocklyFlyoutResizer');

    const flyoutSVG = this.workspace_.getParentSvg();
    const flyoutParentEl = flyoutSVG.parentElement;
    if (!flyoutParentEl) {
      throw new Error('Flyout parent element not found.');
    }

    const flyoutClientRect = flyoutSVG.getBoundingClientRect();
    const flyoutParentClientRect = flyoutParentEl.getBoundingClientRect();

    const left = flyoutClientRect.right - flyoutParentClientRect.left;
    this.htmlDiv_.style.left = `${left}px`;

    this.htmlDiv_.onmousedown = this.onMouseDown_.bind(this);

    flyoutParentEl.insertBefore(this.htmlDiv_, flyoutSVG.nextSibling);
  }

  flyoutEventsListener(event: Blockly.Events.Abstract): void {
    if (event.type === Blockly.Events.FLYOUT_SHOW) this.show();
    if (event.type === Blockly.Events.FLYOUT_HIDE) this.hide();
  }

  hide(): void {
    if (this.htmlDiv_) {
      this.htmlDiv_.style.display = 'none';
    }
  }

  show(): void {
    if (this.htmlDiv_) {
      this.htmlDiv_.style.display = 'block';
      this.position();
    }
  }

  getMaxWidth(): number {
    let maxWidth: number;

    if (this.maxWidth) {
      maxWidth = this.maxWidth;
    } else {
      const injectionDivWidth = (this.workspace_.getInjectionDiv() as HTMLElement).offsetWidth;
      maxWidth = injectionDivWidth * 0.4;
    }

    if (this.initialWidth && this.initialWidth > maxWidth) {
      return this.initialWidth;
    } else {
      return maxWidth;
    }
  }

  position(): void {
    if (!this.htmlDiv_) return;

    const flyoutWidth = this.flyout_.getWidth();
    const toolboxWidth = (this.toolbox_.HtmlDiv as HTMLElement).offsetWidth;

    this.htmlDiv_.style.left = `${flyoutWidth + toolboxWidth}px`;
  }

  onMouseDown_(e: MouseEvent): void {
    e.preventDefault();
    this.initialClientX = e.clientX;
    this.initialWidth = this.flyout_.getWidth();

    document.addEventListener('mousemove', this.onMouseMove_);
    document.addEventListener('mouseup', this.onMouseUp_);
    this.htmlDiv_?.classList.add('resizing')
  }

  onMouseMove_ = (e: MouseEvent): void => {
    const width = this.calculateNewWidth(e);
    this.throttleResizeFlyout(width);
  }

  onMouseUp_ = (e: MouseEvent): void => {
    document.removeEventListener('mousemove', this.onMouseMove_);
    document.removeEventListener('mouseup', this.onMouseUp_);
    this.htmlDiv_?.classList.remove('resizing');

    const width = this.calculateNewWidth(e);
    this.moveFlyout(width);

    this.initialClientX = null;
    this.initialWidth = null;
  }

  calculateNewWidth(e: MouseEvent): number {
    const diff = (e.clientX || 0) - (this.initialClientX || 0);
    return Math.ceil((this.initialWidth || 0) + diff);
  }

  moveFlyout(newWidth: number): void {
    if (newWidth < (this.minWidth || 0)) newWidth = this.minWidth || 0;
    if (newWidth > this.getMaxWidth()) newWidth = this.getMaxWidth();

    localStorage.setItem(LocalStorageFlyoutWidthKey, String(newWidth))

    if (this.flyout_.getWidth() === newWidth) return;

    this.flyout_.setWidth(newWidth)

    this.workspace_.resize();
    this.position();
  }
}

/** CSS for ToolboxResizer.  See css.js for use. */
Css.register(`
.blocklyFlyoutResizer {
  position: absolute;
  display: none;
  height: 100%;
  width: 8px;
  z-index: 20;
  transition: background-color .1s ease-in;
  background-color: #eee;
}

.blocklyFlyoutResizer::after {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='2' height='14' viewBox='0 0 2 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2342526E' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='1' cy='5' r='1'/%3E%3Ccircle cx='1' cy='9' r='1'/%3E%3Ccircle cx='1' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10% 50%;
  left: 0;
  width: 8px;
  height: 100%;
  position: absolute;
}

.blocklyFlyoutResizer:hover, .blocklyToolboxResizer .resizing {
  cursor: col-resize;
}

`);
