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

// Former goog.module("Blockly.FlyoutResizer");

import * as Blockly from './blockly.js';
import * as Css from './css.js';
import {throttle} from "./utils/throttle.js";
import {Flyout} from "./blockly.js";

interface InitOptions {
  minWidth: number;
  maxWidth?: number | null;
}

const DefaultInitOptions: InitOptions = {
  minWidth: 200,
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
  private div_: HTMLElement | null;
  private minWidth: number | null;
  private maxWidth: number | null;
  private initialWidth: number | null;
  private initialClientX: number | null;
  private initialWorkspaceDivDragEnter: ((e: DragEvent) => void) | null;
  private initialWorkspaceDivDragOver: ((e: DragEvent) => void) | null;
  private readonly throttleResizeFlyout: (width: number) => void;

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
    this.div_ = null;
    this.minWidth = null;
    this.maxWidth = null;
    this.initialWidth = null;
    this.initialClientX = null;
    this.initialWorkspaceDivDragEnter = null;
    this.initialWorkspaceDivDragOver = null;
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

    const initWidth = Number(localStorage.getItem(LocalStorageFlyoutWidthKey)) || minWidth;
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
    this.workspace_.removeChangeListener(this.flyoutEventsListener.bind(this));

    if (this.div_) {
      this.div_.remove();
      this.div_ = null;
    }
  }

  protected createDom_(): void {
    this.div_ = document.createElement('div');
    this.div_.classList.add('blocklyFlyoutResizer');

    const flyoutSVG = this.workspace_.getParentSvg();
    const flyoutParentEl = flyoutSVG.parentElement;
    if (!flyoutParentEl) {
      throw new Error('Flyout parent element not found.');
    }

    const flyoutClientRect = flyoutSVG.getBoundingClientRect();
    const flyoutParentClientRect = flyoutParentEl.getBoundingClientRect();

    const left = flyoutClientRect.right - flyoutParentClientRect.left;
    this.div_.style.left = `${left}px`;

    this.div_.setAttribute('draggable', 'true');
    this.div_.ondragstart = this.onDragStart_.bind(this);
    this.div_.ondrag = this.onDrag_.bind(this);
    this.div_.ondragend = this.onDragEnd_.bind(this);

    flyoutParentEl.insertBefore(this.div_, flyoutSVG.nextSibling);
  }

  flyoutEventsListener(event: Blockly.Events.Abstract): void {
    if (event.type === Blockly.Events.FLYOUT_SHOW) this.show();
    if (event.type === Blockly.Events.FLYOUT_HIDE) this.hide();
  }

  hide(): void {
    if (this.div_) {
      this.div_.style.display = 'none';
    }
  }

  show(): void {
    if (this.div_) {
      this.div_.style.display = 'block';
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
    if (!this.div_) return;

    const flyoutWidth = this.flyout_.getWidth();
    const toolboxWidth = (this.toolbox_.HtmlDiv as HTMLElement).offsetWidth;

    this.div_.style.left = `${flyoutWidth + toolboxWidth}px`;
  }

  onDragStart_(e: DragEvent): void {
    if (!e.dataTransfer) return;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.target as HTMLElement, window.outerWidth, window.outerHeight);

    this.initialClientX = e.clientX;


    this.initialWidth = this.flyout_.getWidth();

    const workspaceInjectionDiv = this.workspace_.getInjectionDiv();
    if (!(workspaceInjectionDiv instanceof HTMLElement)) {
      throw new Error('Workspace injection div not found.');
    }

    if (workspaceInjectionDiv.ondragover) {
      this.initialWorkspaceDivDragOver = workspaceInjectionDiv.ondragover;
    }

    workspaceInjectionDiv.ondragover = (e) => e.preventDefault();

    if (workspaceInjectionDiv.ondragenter) {
      this.initialWorkspaceDivDragEnter = workspaceInjectionDiv.ondragenter;
    }

    workspaceInjectionDiv.ondragenter = (e) => e.preventDefault();

    this.flyout_.setDisableBlocksMouseEvents(true);
  }

  onDrag_(e: DragEvent): void {
    const width = this.calculateNewWidth(e);

    if (width < (this.minWidth || 0) || width > this.getMaxWidth()) {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'uninitialized';
        e.dataTransfer.dropEffect = 'none';
      }
    } else {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
      }
    }

    this.throttleResizeFlyout(width);
  }

  onDragEnd_(e: DragEvent): void {
    const width = this.calculateNewWidth(e);
    this.moveFlyout(width);

    const workspaceInjectionDiv = this.workspace_.getInjectionDiv();
    if (!(workspaceInjectionDiv instanceof HTMLElement)) {
      throw new Error('Workspace injection div not found.');
    }

    if (workspaceInjectionDiv.ondragenter) {
      workspaceInjectionDiv.ondragenter = this.initialWorkspaceDivDragEnter;
      this.initialWorkspaceDivDragEnter = null;
    }

    if (workspaceInjectionDiv.ondragover) {
      workspaceInjectionDiv.ondragover = this.initialWorkspaceDivDragOver;
      this.initialWorkspaceDivDragOver = null;
    }

    this.flyout_.setDisableBlocksMouseEvents(false);
    this.initialWidth = null;
    this.initialClientX = null;
  }

  calculateNewWidth(e: DragEvent): number {
    const diff = (e.clientX || 0) - (this.initialClientX || 0);
    return (this.initialWidth || 0) + diff;
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
  background-color: transparent;
  border-right: 2px solid transparent;
}

.blocklyFlyoutResizer::before {
  content: "";
  width: 8px;
  height: 100%;
  background-color: #eee;
  position: absolute;
}

.blocklyFlyoutResizer::after {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='2' height='14' viewBox='0 0 2 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2342526E' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='1' cy='5' r='1'/%3E%3Ccircle cx='1' cy='9' r='1'/%3E%3Ccircle cx='1' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10% 50%;
  left: 0;
  width: 14px;
  height: 100%;
  position: absolute;
}

.blocklyFlyoutResizer:hover {
  cursor: col-resize;
  border-right: 2px solid #5867dd;
}
`);
