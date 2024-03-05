/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IRenderedElement} from '../interfaces/i_rendered_element.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import * as dom from '../utils/dom.js';
import {Svg} from '../utils/svg.js';
import * as layers from '../layers.js';
import * as css from '../css.js';
import {Coordinate, Size, browserEvents} from '../utils.js';
import * as touch from '../touch.js';

// TODO: Before merging file an issue for calculating a better min size. We
//   don't want text to go off the top bar when collapsing, but we also don't
//   want to require an excessively large min size.
const MIN_SIZE = new Size(100, 60);
export class CommentView implements IRenderedElement {
  private svgRoot: SVGGElement;
  private topBar: SVGRectElement;
  private deleteIcon: SVGImageElement;
  private foldoutIcon: SVGImageElement;
  private textPreview: SVGTextElement;
  private textPreviewNode: Text;
  private resizeHandle: SVGImageElement;
  private foreignObject: SVGForeignObjectElement;
  private textarea: HTMLTextAreaElement;
  private size: Size = new Size(120, 100);
  private collapsed: boolean = false;
  private editable: boolean = true;
  private location: Coordinate = new Coordinate(0, 0);
  private text: string = '';
  private textChangeListeners: Array<
    (oldText: string, newText: string) => void
  > = [];
  private sizeChangeListeners: Array<(oldSize: Size, newSize: Size) => void> =
    [];
  private disposeListeners: Array<() => void> = [];
  private collapseChangeListeners: Array<(newCollapse: boolean) => void> = [];
  private resizePointerUpListener: browserEvents.Data | null = null;
  private resizePointerMoveListener: browserEvents.Data | null = null;

  constructor(private readonly workspace: WorkspaceSvg) {
    this.svgRoot = dom.createSvgElement(Svg.G, {
      'class': 'blocklyComment blocklyEditable',
    });

    this.topBar = dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyCommentTopbar',
        'x': 0,
        'y': 0,
      },
      this.svgRoot,
    );
    // TODO: Before merging, does this mean to override an individual image,
    // folks need to replace the whole media folder?
    this.deleteIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyDeleteIcon',
        'href': `${workspace.options.pathToMedia}delete-icon.svg`,
      },
      this.svgRoot,
    );
    this.foldoutIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyFoldoutIcon',
        'href': `${workspace.options.pathToMedia}arrow-dropdown.svg`,
      },
      this.svgRoot,
    );
    this.textPreview = dom.createSvgElement(
      Svg.TEXT,
      {'class': 'blocklyCommentText blocklyText'},
      this.svgRoot,
    );
    this.textPreviewNode = document.createTextNode('');
    this.textPreview.appendChild(this.textPreviewNode);

    this.foreignObject = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'class': 'blocklyCommentForeignObject',
      },
      this.svgRoot,
    );
    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';
    this.textarea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    this.textarea.className = 'blocklyCommentText blocklyTextarea blocklyText';
    // TODO: Handle RTL.
    // this.textarea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');
    body.appendChild(this.textarea);
    this.foreignObject.appendChild(body);

    this.resizeHandle = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyResizeHandle',
        'href': `${workspace.options.pathToMedia}resize-handle.svg`,
      },
      this.svgRoot,
    );

    // TODO: Remove this comment before merging.
    // I think we want comments to exist on the same layer as blocks.
    workspace.getLayerManager()?.append(this, layers.BLOCK);

    // Set size to the default size.
    this.setSize(this.size);

    browserEvents.conditionalBind(
      this.textarea,
      'change',
      this,
      this.onTextChange,
    );
    // TODO: Triggering this on pointerdown means that we can't start drags
    //   on the foldout icon. We need to open up the gesture system to fix this.
    browserEvents.conditionalBind(
      this.foldoutIcon,
      'pointerdown',
      this,
      this.onFoldoutUp,
    );
    browserEvents.conditionalBind(
      this.deleteIcon,
      'pointerdown',
      this,
      this.onDeleteDown,
    );
    browserEvents.conditionalBind(
      this.resizeHandle,
      'pointerdown',
      this,
      this.onResizePointerDown,
    );
  }

  getSvgRoot(): SVGElement {
    return this.svgRoot;
  }

  getSize(): Size {
    return this.size;
  }

  setSize(size: Size) {
    size = new Size(
      Math.max(size.width, MIN_SIZE.width),
      Math.max(size.height, MIN_SIZE.height),
    );

    const oldSize = this.size;
    this.size = size;
    const topBarSize = this.topBar.getBBox();
    const deleteSize = this.deleteIcon.getBBox();
    const foldoutSize = this.foldoutIcon.getBBox();
    const textPreviewSize = this.textPreview.getBBox();
    const resizeSize = this.resizeHandle.getBBox();

    this.svgRoot.setAttribute('height', `${size.height}`);
    this.svgRoot.setAttribute('width', `${size.width}`);

    this.topBar.setAttribute('width', `${size.width}`);

    this.foreignObject.setAttribute(
      'height',
      `${size.height - topBarSize.height}`,
    );
    this.foreignObject.setAttribute('y', `${topBarSize.height}`);
    this.foreignObject.setAttribute('width', `${size.width}`);

    const deleteMargin = (topBarSize.height - deleteSize.height) / 2;
    this.deleteIcon.setAttribute('y', `${deleteMargin}`);
    this.deleteIcon.setAttribute(
      'x',
      `${size.width - deleteSize.width - deleteMargin}`,
    );

    const foldoutMargin = (topBarSize.height - foldoutSize.height) / 2;
    this.foldoutIcon.setAttribute('y', `${foldoutMargin}`);
    this.foldoutIcon.setAttribute('x', `${foldoutMargin}`);

    const textPreviewMargin = (topBarSize.height - textPreviewSize.height) / 2;
    const textPreviewWidth =
      size.width -
      foldoutSize.width -
      foldoutMargin * 2 -
      deleteSize.width -
      deleteMargin * 2;
    this.textPreview.setAttribute(
      'x',
      `${foldoutSize.width + foldoutMargin * 2}`,
    );
    this.textPreview.setAttribute(
      'y',
      `${textPreviewMargin + textPreviewSize.height / 2}`,
    );
    this.textPreview.setAttribute('width', `${textPreviewWidth}`);

    this.resizeHandle.setAttribute('x', `${size.width - resizeSize.width}`);
    this.resizeHandle.setAttribute('y', `${size.height - resizeSize.height}`);

    this.onSizeChange(oldSize, this.size);
  }

  private onSizeChange(oldSize: Size, newSize: Size) {
    for (const listener of this.sizeChangeListeners) {
      listener(oldSize, newSize);
    }
  }

  addSizeChangeListener(listener: (oldSize: Size, newSize: Size) => void) {
    this.sizeChangeListeners.push(listener);
  }

  private onResizePointerDown(e: PointerEvent) {
    this.bringToFront();
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    // TODO: Write an issue to move this into a utils file before merging.
    //   Same for moveDrag below.
    this.workspace.startDrag(
      e,
      new Coordinate(
        this.workspace.RTL ? -this.getSize().width : this.getSize().width,
        this.getSize().height,
      ),
    );

    this.resizePointerUpListener = browserEvents.conditionalBind(
      document,
      'pointerup',
      this,
      this.onResizePointerUp,
    );
    this.resizePointerMoveListener = browserEvents.conditionalBind(
      document,
      'pointermove',
      this,
      this.onResizePointerMove,
    );

    this.workspace.hideChaff();

    e.stopPropagation();
  }

  private onResizePointerUp(_e: PointerEvent) {
    touch.clearTouchIdentifier();
    if (this.resizePointerUpListener) {
      browserEvents.unbind(this.resizePointerUpListener);
      this.resizePointerUpListener = null;
    }
    if (this.resizePointerMoveListener) {
      browserEvents.unbind(this.resizePointerMoveListener);
      this.resizePointerMoveListener = null;
    }
  }

  private onResizePointerMove(e: PointerEvent) {
    const delta = this.workspace.moveDrag(e);
    this.setSize(new Size(this.workspace.RTL ? -delta.x : delta.x, delta.y));
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
    if (collapsed) {
      dom.addClass(this.svgRoot, 'blocklyCollapsed');
    } else {
      dom.removeClass(this.svgRoot, 'blocklyCollapsed');
    }
    // Repositions resize handle and such.
    this.setSize(this.size);
    this.onCollapse();
  }

  private onCollapse() {
    for (const listener of this.collapseChangeListeners) {
      listener(this.collapsed);
    }
  }

  addOnCollapseListener(listener: (newCollapse: boolean) => void) {
    this.collapseChangeListeners.push(listener);
  }

  private onFoldoutUp(e: PointerEvent) {
    this.bringToFront();
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.setCollapsed(!this.collapsed);

    this.workspace.hideChaff();

    e.stopPropagation();
  }

  isEditable(): boolean {
    return this.editable;
  }

  setEditable(editable: boolean) {
    this.editable = editable;
    if (this.editable) {
      dom.addClass(this.svgRoot, 'blocklyEditable');
      dom.removeClass(this.svgRoot, 'blocklyReadonly');
      this.textarea.removeAttribute('readonly');
    } else {
      dom.removeClass(this.svgRoot, 'blocklyEditable');
      dom.addClass(this.svgRoot, 'blocklyReadonly');
      this.textarea.setAttribute('readonly', 'true');
    }
  }

  getRelativeToSurfaceXY(): Coordinate {
    return this.location;
  }

  /**
   * Moves the comment view to the given location.
   *
   * @param location The location to move to in workspace coordinates.
   */
  moveTo(location: Coordinate) {
    this.location = location;
    this.svgRoot.setAttribute(
      'transform',
      `translate(${location.x}, ${location.y})`,
    );
  }

  getText() {
    return this.text;
  }

  setText(text: string) {
    this.textarea.value = text;
    this.onTextChange();
  }

  addTextChangeListener(listener: (oldText: string, newText: string) => void) {
    this.textChangeListeners.push(listener);
  }

  private onTextChange() {
    const oldText = this.text;
    this.text = this.textarea.value;
    this.textPreviewNode.textContent = this.truncateText(this.text);
    for (const listener of this.textChangeListeners) {
      listener(oldText, this.text);
    }
  }

  private truncateText(text: string): string {
    return text.length >= 12 ? `${text.substring(0, 9)}...` : text;
  }

  bringToFront() {
    const parent = this.svgRoot.parentNode;
    const childNodes = parent!.childNodes;
    // Avoid moving the comment if it's already at the bottom.
    if (childNodes[childNodes.length - 1] !== this.svgRoot) {
      parent!.appendChild(this.svgRoot);
    }
  }

  private onDeleteDown(e: PointerEvent) {
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.dispose();
    e.stopPropagation();
  }

  dispose() {
    dom.removeNode(this.svgRoot);
    for (const listener of this.disposeListeners) {
      listener();
    }
  }

  addDisposeListener(listener: () => void) {
    this.disposeListeners.push(listener);
  }
}

css.register(`
.blocklyWorkspace {
  --commentFillColour: #FFFCC7;
  --commentBorderColour: #F2E49B;
  --commentIconColour: #1A1A1A
}

.blocklyComment .blocklyCommentText.blocklyTextarea.blocklyText {
  background-color: var(--commentFillColour);
  border: 1px solid var(--commentBorderColour);
  outline: 0;
  resize: none;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8px;
  width: 100%;
  height: 100%;
  display: block;
}

.blocklyReadonly.blocklyComment .blocklyCommentText.blocklyTextarea.blocklyText {
  cursor: inherit;
}

.blocklyDeleteIcon {
  width: 20px;
  height: 20px;
  display: none;
  fill: var(--commentIconColour);
  cursor: pointer;
}

.blocklyFoldoutIcon {
  width: 20px;
  height: 20px;
  fill: var(--commentIconColour);
  transform-origin: 12px 12px;
  cursor: pointer;
}
.blocklyResizeHandle {
  width: 12px;
  height: 12px;
  stroke: var(--commentIconColour);
  cursor: se-resize;
}

.blocklyCommentTopbar {
  fill: var(--commentBorderColour);
  height: 24px;
}

.blocklyComment .blocklyCommentText.blocklyText {
  fill: var(--commentIconColour);
  dominant-baseline: middle;
  display: none;
}

.blocklyCollapsed.blocklyComment .blocklyCommentText.blocklyText {
  display: block;
}

.blocklyCollapsed.blocklyComment .blocklyCommentForeignObject,
.blocklyCollapsed.blocklyComment .blocklyResizeHandle {
  display: none;
}

.blocklyCollapsed.blocklyComment .blocklyFoldoutIcon {
  transform: rotate(-90deg);
}
`);
