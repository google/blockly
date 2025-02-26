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

interface InitOptions {
  minWidth: number;
  maxWidth?: number | null;
}

const DefaultInitOptions: InitOptions = {
  minWidth: 100,
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
  private htmlDiv: HTMLElement | null;
  private toolboxHtmlDiv: HTMLElement;
  private minWidth: number | null;
  private maxWidth: number | null;
  private initialClientX: number | null;
  private initialWidth: number | null;
  private initialWorkspaceDivDragEnter: ((e: DragEvent) => void) | null;
  private initialWorkspaceDivDragOver: ((e: DragEvent) => void) | null;
  private readonly throttleResizeToolbox: (width: number) => void;
  private onWorkspaceChangeWrapper: Function | null = null;

  constructor(workspace: Blockly.WorkspaceSvg, toolbox: Blockly.Toolbox, flyout: Blockly.IFlyout) {
    this.workspace_ = workspace;
    this.toolbox = toolbox;
    this.flyoutWorkspace_ = flyout.getWorkspace();

    const toolboxHtmlDiv = toolbox.HtmlDiv;
    if (toolboxHtmlDiv) {
      this.toolboxHtmlDiv = toolboxHtmlDiv;
    } else {
      throw new Error('Toolbox container cannot be null.');
    }

    this.id = 'toolboxResizer';
    this.htmlDiv = null;
    this.minWidth = null;
    this.maxWidth = null;
    this.initialClientX = null;
    this.initialWidth = null;
    this.initialWorkspaceDivDragEnter = null;
    this.initialWorkspaceDivDragOver = null;
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

    if (this.htmlDiv) {
      this.htmlDiv.remove();
      this.htmlDiv = null;
    }
  }

  protected createDom_(): void {
    this.htmlDiv = document.createElement('div');
    this.htmlDiv.classList.add('blocklyToolboxResizer');
    this.htmlDiv.setAttribute('draggable', 'true');
    this.htmlDiv.style.left = `${this.toolboxHtmlDiv.offsetWidth}px`;

    this.htmlDiv.ondragstart = this.onDragStart_.bind(this);
    this.htmlDiv.ondrag = this.onDrag_.bind(this);
    this.htmlDiv.ondragend = this.onDragEnd_.bind(this);
    this.htmlDiv.onmousemove = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };
    this.htmlDiv.onmouseenter = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    this.workspace_.getInjectionDiv().insertBefore(this.htmlDiv, this.toolboxHtmlDiv.nextSibling);
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
    if (this.htmlDiv) {
      this.htmlDiv.style.display = 'none';
    }
  }

  show(): void {
    if (this.htmlDiv) {
      this.htmlDiv.style.display = 'block';
    }
  }

  getMaxWidth(): number {
    let maxWidth: number = 0;

    const injectionDiv = this.workspace_.getInjectionDiv();
    if (this.maxWidth) {
      maxWidth = this.maxWidth;
    } else if (injectionDiv instanceof HTMLElement) {
      const injectionDivWidth = injectionDiv.offsetWidth;
      maxWidth = injectionDivWidth * 0.4 - 10;
    }

    if (this.initialWidth && this.initialWidth > maxWidth) {
      return this.initialWidth;
    } else {
      return maxWidth;
    }
  }

  onDragStart_(e: DragEvent): void {
    if (!e.dataTransfer) return;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.dropEffect = 'none';
    e.dataTransfer.setDragImage(e.target as HTMLElement, window.outerWidth, window.outerHeight);

    this.initialClientX = e.clientX;
    this.initialWidth = this.toolboxHtmlDiv.offsetWidth;

    const workspaceInjectionDiv = this.workspace_.getInjectionDiv();
    if (workspaceInjectionDiv instanceof HTMLElement) {
      this.initialWorkspaceDivDragOver = workspaceInjectionDiv.ondragover;
      workspaceInjectionDiv.ondragover = (e) => e.preventDefault();

      this.initialWorkspaceDivDragEnter = workspaceInjectionDiv.ondragenter;
      workspaceInjectionDiv.ondragenter = (e) => e.preventDefault();
    }
  }

  onDrag_(e: DragEvent): void {
    if (!this.initialClientX || !this.initialWidth || !e.dataTransfer) return;

    const width = this.calculateNewWidth(e);

    if (width < (this.minWidth || 0) || width > this.getMaxWidth()) {
      e.dataTransfer.effectAllowed = 'uninitialized';
      e.dataTransfer.dropEffect = 'none';
    } else {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.dropEffect = 'move';
    }

    this.throttleResizeToolbox(width);
  }

  onDragEnd_(e: DragEvent): void {
    if (!this.initialClientX || !this.initialWidth) return;

    const width = this.calculateNewWidth(e);
    this.resizeToolbox(width);

    const workspaceInjectionDiv = this.workspace_.getInjectionDiv();
    if (workspaceInjectionDiv instanceof HTMLElement) {
      workspaceInjectionDiv.ondragenter = this.initialWorkspaceDivDragEnter;
      this.initialWorkspaceDivDragEnter = null;

      workspaceInjectionDiv.ondragover = this.initialWorkspaceDivDragOver;
      this.initialWorkspaceDivDragOver = null;
    }

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

  calculateNewWidth(e: DragEvent): number {
    const diff = (e.clientX || 0) - (this.initialClientX || 0);
    return (this.initialWidth || 0) + diff;
  }

  resizeToolbox(newWidth: number): void {
    if (!this.htmlDiv) return;

    if (newWidth < (this.minWidth || 0)) newWidth = this.minWidth || 0;
    if (newWidth > this.getMaxWidth()) newWidth = this.getMaxWidth();

    const widthValue = `${newWidth}px`;
    localStorage.setItem(LocalStorageToolboxWidthKey, String(newWidth))

    if (this.toolboxHtmlDiv.style.width === widthValue) return;

    this.toolboxHtmlDiv.style.width = widthValue;
    this.toolbox.position();
    this.htmlDiv.style.left = `${newWidth}px`;
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
  transition: background-color .1s ease-in;
  background-color: transparent;
  border-right: 2px solid transparent;
}

.blocklyToolboxResizer::before {
  content: "";
  width: 8px;
  height: 100%;
  background-color: #ddd;
  position: absolute;
}

.blocklyToolboxResizer::after {
  content: "";
  background-image: url("data:image/svg+xml,%3Csvg width='2' height='14' viewBox='0 0 2 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2342526E' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='1' cy='5' r='1'/%3E%3Ccircle cx='1' cy='9' r='1'/%3E%3Ccircle cx='1' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 10% 50%;
  left: 0;
  width: 14px;
  height: 100%;
  position: absolute;
}

.blocklyToolboxResizer:hover {
  cursor: col-resize;
  border-right: 2px solid #5867dd;
}

.blocklyToolboxCategory {
  max-width: 100%;
  overflow-x: hidden;
}
`);
