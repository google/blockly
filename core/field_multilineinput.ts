/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Text Area field.
 *
 * @class
 */
// Former goog.module ID: Blockly.FieldMultilineInput

import * as Css from './css.js';
import {Field, UnattachedFieldError} from './field.js';
import * as fieldRegistry from './field_registry.js';
import {
  FieldTextInput,
  FieldTextInputConfig,
  FieldTextInputValidator,
} from './field_textinput.js';
import * as aria from './utils/aria.js';
import * as dom from './utils/dom.js';
import * as parsing from './utils/parsing.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';
import * as WidgetDiv from './widgetdiv.js';

/**
 * Class for an editable text area field.
 */
export class FieldMultilineInput extends FieldTextInput {
  /**
   * The SVG group element that will contain a text element for each text row
   *     when initialized.
   */
  textGroup: SVGGElement | null = null;

  /**
   * Defines the maximum number of lines of field.
   * If exceeded, scrolling functionality is enabled.
   */
  protected maxLines_ = Infinity;

  /** Whether Y overflow is currently occurring. */
  protected isOverflowedY_ = false;

  /**
   * @param value The initial content of the field. Should cast to a string.
   *     Defaults to an empty string if null or undefined. Also accepts
   *     Field.SKIP_SETUP if you wish to skip setup (only used by subclasses
   *     that want to handle configuration and setting the field value after
   *     their own constructors have run).
   * @param validator An optional function that is called to validate any
   *     constraints on what the user entered.  Takes the new text as an
   *     argument and returns either the accepted text, a replacement text, or
   *     null to abort the change.
   * @param config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/multiline-text-input#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
    value?: string | typeof Field.SKIP_SETUP,
    validator?: FieldMultilineInputValidator,
    config?: FieldMultilineInputConfig,
  ) {
    super(Field.SKIP_SETUP);

    if (value === Field.SKIP_SETUP) return;
    if (config) {
      this.configure_(config);
    }
    this.setValue(value);
    if (validator) {
      this.setValidator(validator);
    }
  }

  /**
   * Configure the field based on the given map of options.
   *
   * @param config A map of options to configure the field based on.
   */
  protected override configure_(config: FieldMultilineInputConfig) {
    super.configure_(config);
    if (config.maxLines) this.setMaxLines(config.maxLines);
  }

  /**
   * Serializes this field's value to XML. Should only be called by Blockly.Xml.
   *
   * @param fieldElement The element to populate with info about the field's
   *     state.
   * @returns The element containing info about the field's state.
   * @internal
   */
  override toXml(fieldElement: Element): Element {
    // Replace '\n' characters with HTML-escaped equivalent '&#10'. This is
    // needed so the plain-text representation of the XML produced by
    // `Blockly.Xml.domToText` will appear on a single line (this is a
    // limitation of the plain-text format).
    fieldElement.textContent = (this.getValue() as string).replace(
      /\n/g,
      '&#10;',
    );
    return fieldElement;
  }

  /**
   * Sets the field's value based on the given XML element. Should only be
   * called by Blockly.Xml.
   *
   * @param fieldElement The element containing info about the field's state.
   * @internal
   */
  override fromXml(fieldElement: Element) {
    this.setValue(fieldElement.textContent!.replace(/&#10;/g, '\n'));
  }

  /**
   * Saves this field's value.
   * This function only exists for subclasses of FieldMultilineInput which
   * predate the load/saveState API and only define to/fromXml.
   *
   * @returns The state of this field.
   * @internal
   */
  override saveState(): AnyDuringMigration {
    const legacyState = this.saveLegacyState(FieldMultilineInput);
    if (legacyState !== null) {
      return legacyState;
    }
    return this.getValue();
  }

  /**
   * Sets the field's value based on the given state.
   * This function only exists for subclasses of FieldMultilineInput which
   * predate the load/saveState API and only define to/fromXml.
   *
   * @param state The state of the variable to assign to this variable field.
   * @internal
   */
  override loadState(state: AnyDuringMigration) {
    if (this.loadLegacyState(Field, state)) {
      return;
    }
    this.setValue(state);
  }

  /**
   * Create the block UI for this field.
   */
  override initView() {
    this.createBorderRect_();
    this.textGroup = dom.createSvgElement(
      Svg.G,
      {
        'class': 'blocklyEditableText',
      },
      this.fieldGroup_,
    );
  }

  /**
   * Get the text from this field as displayed on screen.  May differ from
   * getText due to ellipsis, and other formatting.
   *
   * @returns Currently displayed text.
   */
  protected override getDisplayText_(): string {
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }
    let textLines = this.getText();
    if (!textLines) {
      // Prevent the field from disappearing if empty.
      return Field.NBSP;
    }
    const lines = textLines.split('\n');
    textLines = '';
    const displayLinesNumber = this.isOverflowedY_
      ? this.maxLines_
      : lines.length;
    for (let i = 0; i < displayLinesNumber; i++) {
      let text = lines[i];
      if (text.length > this.maxDisplayLength) {
        // Truncate displayed string and add an ellipsis ('...').
        text = text.substring(0, this.maxDisplayLength - 4) + '...';
      } else if (this.isOverflowedY_ && i === displayLinesNumber - 1) {
        text = text.substring(0, text.length - 3) + '...';
      }
      // Replace whitespace with non-breaking spaces so the text doesn't
      // collapse.
      text = text.replace(/\s/g, Field.NBSP);

      textLines += text;
      if (i !== displayLinesNumber - 1) {
        textLines += '\n';
      }
    }
    if (block.RTL) {
      // The SVG is LTR, force value to be RTL.
      textLines += '\u200F';
    }
    return textLines;
  }

  /**
   * Called by setValue if the text input is valid. Updates the value of the
   * field, and updates the text of the field if it is not currently being
   * edited (i.e. handled by the htmlInput_). Is being redefined here to update
   * overflow state of the field.
   *
   * @param newValue The value to be saved. The default validator guarantees
   *     that this is a string.
   */
  protected override doValueUpdate_(newValue: string) {
    super.doValueUpdate_(newValue);
    if (this.value_ !== null) {
      this.isOverflowedY_ = this.value_.split('\n').length > this.maxLines_;
    }
  }

  /** Updates the text of the textElement. */
  protected override render_() {
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }
    // Remove all text group children.
    let currentChild;
    const textGroup = this.textGroup;
    while ((currentChild = textGroup!.firstChild)) {
      textGroup!.removeChild(currentChild);
    }

    // Add in text elements into the group.
    const lines = this.getDisplayText_().split('\n');
    let y = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineHeight =
        this.getConstants()!.FIELD_TEXT_HEIGHT +
        this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING;
      const span = dom.createSvgElement(
        Svg.TEXT,
        {
          'class': 'blocklyText blocklyMultilineText',
          'x': this.getConstants()!.FIELD_BORDER_RECT_X_PADDING,
          'y': y + this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING,
          'dy': this.getConstants()!.FIELD_TEXT_BASELINE,
        },
        textGroup,
      );
      span.appendChild(document.createTextNode(lines[i]));
      y += lineHeight;
    }

    if (this.isBeingEdited_) {
      const htmlInput = this.htmlInput_ as HTMLElement;
      if (this.isOverflowedY_) {
        dom.addClass(htmlInput, 'blocklyHtmlTextAreaInputOverflowedY');
      } else {
        dom.removeClass(htmlInput, 'blocklyHtmlTextAreaInputOverflowedY');
      }
    }

    this.updateSize_();

    if (this.isBeingEdited_) {
      if (block.RTL) {
        // in RTL, we need to let the browser reflow before resizing
        // in order to get the correct bounding box of the borderRect
        // avoiding issue #2777.
        setTimeout(this.resizeEditor_.bind(this), 0);
      } else {
        this.resizeEditor_();
      }
      const htmlInput = this.htmlInput_ as HTMLElement;
      if (!this.isTextValid_) {
        dom.addClass(htmlInput, 'blocklyInvalidInput');
        aria.setState(htmlInput, aria.State.INVALID, true);
      } else {
        dom.removeClass(htmlInput, 'blocklyInvalidInput');
        aria.setState(htmlInput, aria.State.INVALID, false);
      }
    }
  }

  /** Updates the size of the field based on the text. */
  protected override updateSize_() {
    const nodes = (this.textGroup as SVGElement).childNodes;
    const fontSize = this.getConstants()!.FIELD_TEXT_FONTSIZE;
    const fontWeight = this.getConstants()!.FIELD_TEXT_FONTWEIGHT;
    const fontFamily = this.getConstants()!.FIELD_TEXT_FONTFAMILY;
    let totalWidth = 0;
    let totalHeight = 0;
    for (let i = 0; i < nodes.length; i++) {
      const tspan = nodes[i] as SVGTextElement;
      const textWidth = dom.getFastTextWidth(
        tspan,
        fontSize,
        fontWeight,
        fontFamily,
      );
      if (textWidth > totalWidth) {
        totalWidth = textWidth;
      }
      totalHeight +=
        this.getConstants()!.FIELD_TEXT_HEIGHT +
        (i > 0 ? this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING : 0);
    }
    if (this.isBeingEdited_) {
      // The default width is based on the longest line in the display text,
      // but when it's being edited, width should be calculated based on the
      // absolute longest line, even if it would be truncated after editing.
      // Otherwise we would get wrong editor width when there are more
      // lines than this.maxLines_.
      const actualEditorLines = String(this.value_).split('\n');
      const dummyTextElement = dom.createSvgElement(Svg.TEXT, {
        'class': 'blocklyText blocklyMultilineText',
      });

      for (let i = 0; i < actualEditorLines.length; i++) {
        if (actualEditorLines[i].length > this.maxDisplayLength) {
          actualEditorLines[i] = actualEditorLines[i].substring(
            0,
            this.maxDisplayLength,
          );
        }
        dummyTextElement.textContent = actualEditorLines[i];
        const lineWidth = dom.getFastTextWidth(
          dummyTextElement,
          fontSize,
          fontWeight,
          fontFamily,
        );
        if (lineWidth > totalWidth) {
          totalWidth = lineWidth;
        }
      }

      const scrollbarWidth =
        this.htmlInput_!.offsetWidth - this.htmlInput_!.clientWidth;
      totalWidth += scrollbarWidth;
    }
    if (this.borderRect_) {
      totalHeight += this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING * 2;
      totalWidth += this.getConstants()!.FIELD_BORDER_RECT_X_PADDING * 2;
      this.borderRect_.setAttribute('width', `${totalWidth}`);
      this.borderRect_.setAttribute('height', `${totalHeight}`);
    }
    this.size_.width = totalWidth;
    this.size_.height = totalHeight;

    this.positionBorderRect_();
  }

  /**
   * Show the inline free-text editor on top of the text.
   * Overrides the default behaviour to force rerender in order to
   * correct block size, based on editor text.
   *
   * @param e Optional mouse event that triggered the field to open, or
   *     undefined if triggered programmatically.
   * @param quietInput True if editor should be created without focus.
   *     Defaults to false.
   */
  override showEditor_(e?: Event, quietInput?: boolean) {
    super.showEditor_(e, quietInput);
    this.forceRerender();
  }

  /**
   * Create the text input editor widget.
   *
   * @returns The newly created text input editor.
   */
  protected override widgetCreate_(): HTMLTextAreaElement {
    const div = WidgetDiv.getDiv();
    const scale = this.workspace_!.getScale();

    const htmlInput = document.createElement('textarea');
    htmlInput.className = 'blocklyHtmlInput blocklyHtmlTextAreaInput';
    htmlInput.setAttribute('spellcheck', String(this.spellcheck_));
    const fontSize = this.getConstants()!.FIELD_TEXT_FONTSIZE * scale + 'pt';
    div!.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;
    const borderRadius = FieldTextInput.BORDERRADIUS * scale + 'px';
    htmlInput.style.borderRadius = borderRadius;
    const paddingX = this.getConstants()!.FIELD_BORDER_RECT_X_PADDING * scale;
    const paddingY =
      (this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING * scale) / 2;
    htmlInput.style.padding =
      paddingY + 'px ' + paddingX + 'px ' + paddingY + 'px ' + paddingX + 'px';
    const lineHeight =
      this.getConstants()!.FIELD_TEXT_HEIGHT +
      this.getConstants()!.FIELD_BORDER_RECT_Y_PADDING;
    htmlInput.style.lineHeight = lineHeight * scale + 'px';

    div!.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.getEditorText_(this.value_);
    htmlInput.setAttribute('data-untyped-default-value', String(this.value_));
    htmlInput.setAttribute('data-old-value', '');
    if (userAgent.GECKO) {
      // In FF, ensure the browser reflows before resizing to avoid issue #2777.
      setTimeout(this.resizeEditor_.bind(this), 0);
    } else {
      this.resizeEditor_();
    }

    this.bindInputEvents_(htmlInput);

    return htmlInput;
  }

  /**
   * Sets the maxLines config for this field.
   *
   * @param maxLines Defines the maximum number of lines allowed, before
   *     scrolling functionality is enabled.
   */
  setMaxLines(maxLines: number) {
    if (
      typeof maxLines === 'number' &&
      maxLines > 0 &&
      maxLines !== this.maxLines_
    ) {
      this.maxLines_ = maxLines;
      this.forceRerender();
    }
  }

  /**
   * Returns the maxLines config of this field.
   *
   * @returns The maxLines config value.
   */
  getMaxLines(): number {
    return this.maxLines_;
  }

  /**
   * Handle key down to the editor. Override the text input definition of this
   * so as to not close the editor when enter is typed in.
   *
   * @param e Keyboard event.
   */
  protected override onHtmlInputKeyDown_(e: KeyboardEvent) {
    if (e.key !== 'Enter') {
      super.onHtmlInputKeyDown_(e);
    }
  }

  /**
   * Construct a FieldMultilineInput from a JSON arg object,
   * dereferencing any string table references.
   *
   * @param options A JSON object with options (text, and spellcheck).
   * @returns The new field instance.
   * @nocollapse
   * @internal
   */
  static override fromJson(
    options: FieldMultilineInputFromJsonConfig,
  ): FieldMultilineInput {
    const text = parsing.replaceMessageReferences(options.text);
    // `this` might be a subclass of FieldMultilineInput if that class doesn't
    // override the static fromJson method.
    return new this(text, undefined, options);
  }
}

fieldRegistry.register('field_multilinetext', FieldMultilineInput);

/**
 * CSS for multiline field.
 */
Css.register(`
.blocklyHtmlTextAreaInput {
  font-family: monospace;
  resize: none;
  overflow: hidden;
  height: 100%;
  text-align: left;
}

.blocklyHtmlTextAreaInputOverflowedY {
  overflow-y: scroll;
}
`);

/**
 * Config options for the multiline input field.
 */
export interface FieldMultilineInputConfig extends FieldTextInputConfig {
  maxLines?: number;
}

/**
 * fromJson config options for the multiline input field.
 */
export interface FieldMultilineInputFromJsonConfig
  extends FieldMultilineInputConfig {
  text?: string;
}

/**
 * A function that is called to validate changes to the field's value before
 * they are set.
 *
 * @see {@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/validators#return_values}
 * @param newValue The value to be validated.
 * @returns One of three instructions for setting the new value: `T`, `null`,
 * or `undefined`.
 *
 * - `T` to set this function's returned value instead of `newValue`.
 *
 * - `null` to invoke `doValueInvalid_` and not set a value.
 *
 * - `undefined` to set `newValue` as is.
 */
export type FieldMultilineInputValidator = FieldTextInputValidator;
