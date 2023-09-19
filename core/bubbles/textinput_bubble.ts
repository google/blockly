/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Bubble} from './bubble.js';
import {Coordinate} from '../utils/coordinate.js';
import * as Css from '../css.js';
import * as dom from '../utils/dom.js';
import {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import * as touch from '../touch.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {browserEvents} from '../utils.js';

/**
 * A bubble that displays editable text. It can also be resized by the user.
 * Used by the comment icon.
 */
export class TextInputBubble extends Bubble {
  /** The root of the elements specific to the text element. */
  private inputRoot: SVGForeignObjectElement;

  /** The text input area element. */
  private textArea: HTMLTextAreaElement;

  /** The group containing the lines indicating the bubble is resizable. */
  private resizeGroup: SVGGElement;

  /**
   * Event data associated with the listener for pointer up events on the
   * resize group.
   */
  private resizePointerUpListener: browserEvents.Data | null = null;

  /**
   * Event data associated with the listener for pointer move events on the
   * resize group.
   */
  private resizePointerMoveListener: browserEvents.Data | null = null;

  /** Functions listening for changes to the text of this bubble. */
  private textChangeListeners: (() => void)[] = [];

  /** Functions listening for changes to the size of this bubble. */
  private sizeChangeListeners: (() => void)[] = [];

  /** The text of this bubble. */
  private text = '';

  /** The default size of this bubble, including borders. */
  private readonly DEFAULT_SIZE = new Size(
    160 + Bubble.DOUBLE_BORDER,
    80 + Bubble.DOUBLE_BORDER,
  );

  /** The minimum size of this bubble, including borders. */
  private readonly MIN_SIZE = new Size(
    45 + Bubble.DOUBLE_BORDER,
    20 + Bubble.DOUBLE_BORDER,
  );

  /**
   * @param workspace The workspace this bubble belongs to.
   * @param anchor The anchor location of the thing this bubble is attached to.
   *     The tail of the bubble will point to this location.
   * @param ownerRect An optional rect we don't want the bubble to overlap with
   *     when automatically positioning.
   */
  constructor(
    protected readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect,
  ) {
    super(workspace, anchor, ownerRect);
    ({inputRoot: this.inputRoot, textArea: this.textArea} = this.createEditor(
      this.contentContainer,
    ));
    this.resizeGroup = this.createResizeHandle(this.svgRoot);
    this.setSize(this.DEFAULT_SIZE, true);
  }

  /** @returns the text of this bubble. */
  getText(): string {
    return this.text;
  }

  /** Sets the text of this bubble. Calls change listeners. */
  setText(text: string) {
    this.text = text;
    this.textArea.value = text;
    this.onTextChange();
  }

  /** Adds a change listener to be notified when this bubble's text changes. */
  addTextChangeListener(listener: () => void) {
    this.textChangeListeners.push(listener);
  }

  /** Adds a change listener to be notified when this bubble's size changes. */
  addSizeChangeListener(listener: () => void) {
    this.sizeChangeListeners.push(listener);
  }

  /** Creates the editor UI for this bubble. */
  private createEditor(container: SVGGElement): {
    inputRoot: SVGForeignObjectElement;
    textArea: HTMLTextAreaElement;
  } {
    const inputRoot = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      container,
    );

    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';

    const textArea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    textArea.className = 'blocklyCommentTextarea';
    textArea.setAttribute('dir', this.workspace.RTL ? 'RTL' : 'LTR');

    body.appendChild(textArea);
    inputRoot.appendChild(body);

    this.bindTextAreaEvents(textArea);
    setTimeout(() => {
      textArea.focus();
    }, 0);

    return {inputRoot, textArea};
  }

  /** Binds events to the text area element. */
  private bindTextAreaEvents(textArea: HTMLTextAreaElement) {
    // Don't zoom with mousewheel.
    browserEvents.conditionalBind(textArea, 'wheel', this, (e: Event) => {
      e.stopPropagation();
    });

    browserEvents.conditionalBind(
      textArea,
      'focus',
      this,
      this.onStartEdit,
      true,
    );
    browserEvents.conditionalBind(textArea, 'change', this, this.onTextChange);
  }

  /** Creates the resize handler elements and binds events to them. */
  private createResizeHandle(container: SVGGElement): SVGGElement {
    const resizeGroup = dom.createSvgElement(
      Svg.G,
      {
        'class': this.workspace.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE',
      },
      container,
    );
    const size = 2 * Bubble.BORDER_WIDTH;
    dom.createSvgElement(
      Svg.POLYGON,
      {'points': `0,${size} ${size},${size} ${size},0`},
      resizeGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': size / 3,
        'y1': size - 1,
        'x2': size - 1,
        'y2': size / 3,
      },
      resizeGroup,
    );
    dom.createSvgElement(
      Svg.LINE,
      {
        'class': 'blocklyResizeLine',
        'x1': (size * 2) / 3,
        'y1': size - 1,
        'x2': size - 1,
        'y2': (size * 2) / 3,
      },
      resizeGroup,
    );

    browserEvents.conditionalBind(
      resizeGroup,
      'pointerdown',
      this,
      this.onResizePointerDown,
    );

    return resizeGroup;
  }

  /**
   * Sets the size of this bubble, including the border.
   *
   * @param size Sets the size of this bubble, including the border.
   * @param relayout If true, reposition the bubble from scratch so that it is
   *     optimally visible. If false, reposition it so it maintains the same
   *     position relative to the anchor.
   */
  setSize(size: Size, relayout = false) {
    size.width = Math.max(size.width, this.MIN_SIZE.width);
    size.height = Math.max(size.height, this.MIN_SIZE.height);

    const widthMinusBorder = size.width - Bubble.DOUBLE_BORDER;
    const heightMinusBorder = size.height - Bubble.DOUBLE_BORDER;
    this.inputRoot.setAttribute('width', `${widthMinusBorder}`);
    this.inputRoot.setAttribute('height', `${heightMinusBorder}`);
    this.textArea.style.width = `${widthMinusBorder - 4}px`;
    this.textArea.style.height = `${heightMinusBorder - 4}px`;

    if (this.workspace.RTL) {
      this.resizeGroup.setAttribute(
        'transform',
        `translate(${Bubble.DOUBLE_BORDER}, ${heightMinusBorder}) scale(-1 1)`,
      );
    } else {
      this.resizeGroup.setAttribute(
        'transform',
        `translate(${widthMinusBorder}, ${heightMinusBorder})`,
      );
    }

    super.setSize(size, relayout);
    this.onSizeChange();
  }

  /** @returns the size of this bubble. */
  getSize(): Size {
    // Overriden to be public.
    return super.getSize();
  }

  /** Handles mouse down events on the resize target. */
  private onResizePointerDown(e: PointerEvent) {
    this.bringToFront();
    if (browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

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
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /** Handles pointer up events on the resize target. */
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

  /** Handles pointer move events on the resize target. */
  private onResizePointerMove(e: PointerEvent) {
    const delta = this.workspace.moveDrag(e);
    this.setSize(
      new Size(this.workspace.RTL ? -delta.x : delta.x, delta.y),
      false,
    );
    this.onSizeChange();
  }

  /**
   * Handles starting an edit of the text area. Brings the bubble to the front.
   */
  private onStartEdit() {
    if (this.bringToFront()) {
      // Since the act of moving this node within the DOM causes a loss of
      // focus, we need to reapply the focus.
      this.textArea.focus();
    }
  }

  /** Handles a text change event for the text area. Calls event listeners. */
  private onTextChange() {
    this.text = this.textArea.value;
    for (const listener of this.textChangeListeners) {
      listener();
    }
  }

  /** Handles a size change event for the text area. Calls event listeners. */
  private onSizeChange() {
    for (const listener of this.sizeChangeListeners) {
      listener();
    }
  }
}

Css.register(`
.blocklyCommentTextarea {
  background-color: #fef49c;
  border: 0;
  display: block;
  margin: 0;
  outline: 0;
  padding: 3px;
  resize: none;
  text-overflow: hidden;
}
`);
