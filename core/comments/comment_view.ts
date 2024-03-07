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
  /** The root group element of the comment view. */
  private svgRoot: SVGGElement;

  /** The rect background for the top bar. */
  private topBar: SVGRectElement;

  /** The delete icon that goes in the top bar. */
  private deleteIcon: SVGImageElement;

  /** The foldout icon that goes in the top bar. */
  private foldoutIcon: SVGImageElement;

  /** The text element that goes in the top bar. */
  private textPreview: SVGTextElement;

  /** The actual text node in the text preview. */
  private textPreviewNode: Text;

  /** The resize handle element. */
  private resizeHandle: SVGImageElement;

  /** The foreignObject containing the HTML text area. */
  private foreignObject: SVGForeignObjectElement;

  /** The text area where the user can type. */
  private textArea: HTMLTextAreaElement;

  /** The current size of the comment. */
  private size: Size = new Size(120, 100);

  /** Whether the comment is collapsed or not. */
  private collapsed: boolean = false;

  /** Whether the comment is editable or not. */
  private editable: boolean = true;

  /** The current location of the comment. */
  private location: Coordinate = new Coordinate(0, 0);

  /** The current text of the comment. Updates on  text area change. */
  private text: string = '';

  /** Listeners for changes to text. */
  private textChangeListeners: Array<
    (oldText: string, newText: string) => void
  > = [];

  /** Listeners for changes to size. */
  private sizeChangeListeners: Array<(oldSize: Size, newSize: Size) => void> =
    [];

  /** Listeners for disposal. */
  private disposeListeners: Array<() => void> = [];

  /** Listeners for collapsing. */
  private collapseChangeListeners: Array<(newCollapse: boolean) => void> = [];

  /**
   * Event data for the pointer up event on the resize handle. Used to
   * unregister the listener.
   */
  private resizePointerUpListener: browserEvents.Data | null = null;

  /**
   * Event data for the pointer move event on the resize handle. Used to
   * unregister the listener.
   */
  private resizePointerMoveListener: browserEvents.Data | null = null;

  constructor(private readonly workspace: WorkspaceSvg) {
    this.svgRoot = dom.createSvgElement(Svg.G, {
      'class': 'blocklyComment blocklyEditable',
    });

    ({
      topBar: this.topBar,
      deleteIcon: this.deleteIcon,
      foldoutIcon: this.foldoutIcon,
      textPreview: this.textPreview,
      textPreviewNode: this.textPreviewNode,
    } = this.createTopBar(this.svgRoot, workspace));

    ({foreignObject: this.foreignObject, textArea: this.textArea} =
      this.createTextArea(this.svgRoot));

    this.resizeHandle = this.createResizeHandle(this.svgRoot, workspace);

    // TODO: Remove this comment before merging.
    // I think we want comments to exist on the same layer as blocks.
    workspace.getLayerManager()?.append(this, layers.BLOCK);

    // Set size to the default size.
    this.setSize(this.size);
  }

  /**
   * Creates the top bar and the elements visually within it.
   * Registers event listeners.
   */
  private createTopBar(
    svgRoot: SVGGElement,
    workspace: WorkspaceSvg,
  ): {
    topBar: SVGRectElement;
    deleteIcon: SVGImageElement;
    foldoutIcon: SVGImageElement;
    textPreview: SVGTextElement;
    textPreviewNode: Text;
  } {
    const topBar = dom.createSvgElement(
      Svg.RECT,
      {
        'class': 'blocklyCommentTopbar',
        'x': 0,
        'y': 0,
      },
      svgRoot,
    );
    // TODO: Before merging, does this mean to override an individual image,
    // folks need to replace the whole media folder?
    const deleteIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyDeleteIcon',
        'href': `${workspace.options.pathToMedia}delete-icon.svg`,
      },
      svgRoot,
    );
    const foldoutIcon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyFoldoutIcon',
        'href': `${workspace.options.pathToMedia}arrow-dropdown.svg`,
      },
      svgRoot,
    );
    const textPreview = dom.createSvgElement(
      Svg.TEXT,
      {
        'class': 'blocklyCommentPreview blocklyCommentText blocklyText',
      },
      svgRoot,
    );
    const textPreviewNode = document.createTextNode('');
    textPreview.appendChild(textPreviewNode);

    // TODO: Triggering this on pointerdown means that we can't start drags
    //   on the foldout icon. We need to open up the gesture system to fix this.
    browserEvents.conditionalBind(
      foldoutIcon,
      'pointerdown',
      this,
      this.onFoldoutDown,
    );
    browserEvents.conditionalBind(
      deleteIcon,
      'pointerdown',
      this,
      this.onDeleteDown,
    );

    return {topBar, deleteIcon, foldoutIcon, textPreview, textPreviewNode};
  }

  /**
   * Creates the text area where users can type. Registers event listeners.
   */
  private createTextArea(svgRoot: SVGGElement): {
    foreignObject: SVGForeignObjectElement;
    textArea: HTMLTextAreaElement;
  } {
    const foreignObject = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'class': 'blocklyCommentForeignObject',
      },
      svgRoot,
    );
    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';
    const textArea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    dom.addClass(textArea, 'blocklyCommentText');
    dom.addClass(textArea, 'blocklyTextarea');
    dom.addClass(textArea, 'blocklyText');
    body.appendChild(textArea);
    foreignObject.appendChild(body);

    browserEvents.conditionalBind(textArea, 'change', this, this.onTextChange);

    return {foreignObject, textArea};
  }

  /** Creates the DOM elements for the comment resize handle. */
  private createResizeHandle(
    svgRoot: SVGGElement,
    workspace: WorkspaceSvg,
  ): SVGImageElement {
    const resizeHandle = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyResizeHandle',
        'href': `${workspace.options.pathToMedia}resize-handle.svg`,
      },
      svgRoot,
    );

    browserEvents.conditionalBind(
      resizeHandle,
      'pointerdown',
      this,
      this.onResizePointerDown,
    );

    return resizeHandle;
  }

  /** Returns the root SVG group element of the comment view. */
  getSvgRoot(): SVGGElement {
    return this.svgRoot;
  }

  /** Returns the current size of the comment in workspace units. */
  getSize(): Size {
    return this.size;
  }

  /**
   * Sets the size of the comment in workspace units, and updates the view
   * elements to reflect the new size.
   */
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

    this.updateTextAreaSize(size, topBarSize);
    this.updateDeleteIconPosition(size, topBarSize, deleteSize);
    this.updateFoldoutIconPosition(topBarSize, foldoutSize);
    this.updateTextPreviewSize(
      size,
      topBarSize,
      textPreviewSize,
      deleteSize,
      resizeSize,
    );

    this.resizeHandle.setAttribute('x', `${size.width - resizeSize.width}`);
    this.resizeHandle.setAttribute('y', `${size.height - resizeSize.height}`);

    this.onSizeChange(oldSize, this.size);
  }

  /** Updates the size of the text area elements to reflect the new size. */
  private updateTextAreaSize(size: Size, topBarSize: Size) {
    this.foreignObject.setAttribute(
      'height',
      `${size.height - topBarSize.height}`,
    );
    this.foreignObject.setAttribute('width', `${size.width}`);
    this.foreignObject.setAttribute('y', `${topBarSize.height}`);
    if (this.workspace.RTL) {
      this.foreignObject.setAttribute('x', `${-size.width}`);
    }
  }

  /**
   * Updates the position of the delete icon elements to reflect the new size.
   */
  private updateDeleteIconPosition(
    size: Size,
    topBarSize: Size,
    deleteSize: Size,
  ) {
    const deleteMargin = (topBarSize.height - deleteSize.height) / 2;
    this.deleteIcon.setAttribute('y', `${deleteMargin}`);
    this.deleteIcon.setAttribute(
      'x',
      `${size.width - deleteSize.width - deleteMargin}`,
    );
  }

  /**
   * Updates the position of the foldout icon elements to reflect the new size.
   */
  private updateFoldoutIconPosition(topBarSize: Size, foldoutSize: Size) {
    const foldoutMargin = (topBarSize.height - foldoutSize.height) / 2;
    this.foldoutIcon.setAttribute('y', `${foldoutMargin}`);
    this.foldoutIcon.setAttribute('x', `${foldoutMargin}`);
  }

  /**
   * Updates the size and position of the text preview elements to reflect the new size.
   */
  private updateTextPreviewSize(
    size: Size,
    topBarSize: Size,
    textPreviewSize: Size,
    deleteSize: Size,
    foldoutSize: Size,
  ) {
    const textPreviewMargin = (topBarSize.height - textPreviewSize.height) / 2;
    const deleteMargin = (topBarSize.height - deleteSize.height) / 2;
    const foldoutMargin = (topBarSize.height - foldoutSize.height) / 2;

    const textPreviewWidth =
      size.width -
      foldoutSize.width -
      foldoutMargin * 2 -
      deleteSize.width -
      deleteMargin * 2;
    this.textPreview.setAttribute(
      'x',
      `${foldoutSize.width + foldoutMargin * 2 * (this.workspace.RTL ? -1 : 1)}`,
    );
    this.textPreview.setAttribute(
      'y',
      `${textPreviewMargin + textPreviewSize.height / 2}`,
    );
    this.textPreview.setAttribute('width', `${textPreviewWidth}`);
  }

  /**
   * Triggers listeners when the size of the comment changes, either
   * progrmatically or manually by the user.
   */
  private onSizeChange(oldSize: Size, newSize: Size) {
    for (const listener of this.sizeChangeListeners) {
      listener(oldSize, newSize);
    }
  }

  /** Registers a callback that listens for size changes. */
  addSizeChangeListener(listener: (oldSize: Size, newSize: Size) => void) {
    this.sizeChangeListeners.push(listener);
  }

  /**
   * Handles starting an interaction with the resize handle to resize the
   * comment.
   */
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

  /** Ends an interaction with the resize handle. */
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

  /** Resizes the comment in response to a drag on the resize handle. */
  private onResizePointerMove(e: PointerEvent) {
    const delta = this.workspace.moveDrag(e);
    this.setSize(new Size(this.workspace.RTL ? -delta.x : delta.x, delta.y));
  }

  /** Returns true if the comment is currently collapsed. */
  isCollapsed(): boolean {
    return this.collapsed;
  }

  /** Sets whether the comment is currently collapsed or not. */
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

  /**
   * Triggers listeners when the collapsed-ness of the comment changes, either
   * progrmatically or manually by the user.
   */
  private onCollapse() {
    for (const listener of this.collapseChangeListeners) {
      listener(this.collapsed);
    }
  }

  /** Registers a callback that listens for collapsed-ness changes. */
  addOnCollapseListener(listener: (newCollapse: boolean) => void) {
    this.collapseChangeListeners.push(listener);
  }

  /**
   * Toggles the collapsedness of the block when we receive a pointer down
   * event on the foldout icon.
   */
  private onFoldoutDown(e: PointerEvent) {
    this.bringToFront();
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.setCollapsed(!this.collapsed);

    this.workspace.hideChaff();

    e.stopPropagation();
  }

  /** Returns true if the comment is currently editable. */
  isEditable(): boolean {
    return this.editable;
  }

  /** Sets the editability of the comment. */
  setEditable(editable: boolean) {
    this.editable = editable;
    if (this.editable) {
      dom.addClass(this.svgRoot, 'blocklyEditable');
      dom.removeClass(this.svgRoot, 'blocklyReadonly');
      this.textArea.removeAttribute('readonly');
    } else {
      dom.removeClass(this.svgRoot, 'blocklyEditable');
      dom.addClass(this.svgRoot, 'blocklyReadonly');
      this.textArea.setAttribute('readonly', 'true');
    }
  }

  /** Returns the current location of the comment in workspace coordinates. */
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

  /** Retursn the current text of the comment. */
  getText() {
    return this.text;
  }

  /** Sets the current text of the comment. */
  setText(text: string) {
    this.textArea.value = text;
    this.onTextChange();
  }

  /** Registers a callback that listens for text changes. */
  addTextChangeListener(listener: (oldText: string, newText: string) => void) {
    this.textChangeListeners.push(listener);
  }

  /**
   * Triggers listeners when the text of the comment changes, either
   * progrmatically or manually by the user.
   */
  private onTextChange() {
    const oldText = this.text;
    this.text = this.textArea.value;
    this.textPreviewNode.textContent = this.truncateText(this.text);
    for (const listener of this.textChangeListeners) {
      listener(oldText, this.text);
    }
  }

  /** Truncates the text to fit within the top view. */
  private truncateText(text: string): string {
    // TODO: before merging ile an issue to calculate how much this should be
    //   truncated automatically.
    return text.length >= 12 ? `${text.substring(0, 9)}...` : text;
  }

  /** Brings the workspace comment to the front of its layer. */
  private bringToFront() {
    const parent = this.svgRoot.parentNode;
    const childNodes = parent!.childNodes;
    // Avoid moving the comment if it's already at the bottom.
    if (childNodes[childNodes.length - 1] !== this.svgRoot) {
      parent!.appendChild(this.svgRoot);
    }
  }

  /**
   * Handles disposing of the comment when we get a pointer down event on the
   * delete icon.
   */
  private onDeleteDown(e: PointerEvent) {
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.dispose();
    e.stopPropagation();
  }

  /** Disposes of this comment view. */
  dispose() {
    dom.removeNode(this.svgRoot);
    for (const listener of this.disposeListeners) {
      listener();
    }
  }

  /** Registers a callback that listens for disposal of this view. */
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

.blocklyComment .blocklyTextarea {
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

.blocklyReadonly.blocklyComment .blocklyTextarea {
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

.blocklyComment .blocklyCommentPreview.blocklyText {
  fill: var(--commentIconColour);
  dominant-baseline: middle;
  display: none;
}

.blocklyCollapsed.blocklyComment .blocklyCommentPreview {
  display: block;
}

.blocklyCollapsed.blocklyComment .blocklyCommentForeignObject,
.blocklyCollapsed.blocklyComment .blocklyResizeHandle {
  display: none;
}

.blocklyCollapsed.blocklyComment .blocklyFoldoutIcon {
  transform: rotate(-90deg);
}

.blocklyRTL .blocklyComment {
  transform: scale(-1, 1);
}

.blocklyRTL .blocklyCommentForeignObject {
  /* Revert the scale and control RTL using direction instead. */
  transform: scale(-1, 1);
  direction: rtl;
}

.blocklyRTL .blocklyCommentPreview {
  /* Revert the scale and control RTL using direction instead. */
  transform: scale(-1, 1);
  direction: rtl;
}

.blocklyRTL .blocklyResizeHandle {
  cursor: sw-resize;
}
`);
