/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Text input field.
 */
'use strict';

/**
 * Text input field.
 * @class
 */
goog.module('Blockly.FieldTextInput');

const WidgetDiv = goog.require('Blockly.WidgetDiv');
const aria = goog.require('Blockly.utils.aria');
const browserEvents = goog.require('Blockly.browserEvents');
const dialog = goog.require('Blockly.dialog');
const dom = goog.require('Blockly.utils.dom');
const dropDownDiv = goog.require('Blockly.dropDownDiv');
const eventUtils = goog.require('Blockly.Events.utils');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const parsing = goog.require('Blockly.utils.parsing');
const userAgent = goog.require('Blockly.utils.userAgent');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Field} = goog.require('Blockly.Field');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {Msg} = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');


/**
 * Class for an editable text field.
 * @alias Blockly.FieldTextInput
 */
class FieldTextInput extends Field {
  /**
   * @param {(string|!Sentinel)=} opt_value The initial value of the
   *     field. Should cast to a string. Defaults to an empty string if null or
   *     undefined.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {?Function=} opt_validator A function that is called to validate
   *     changes to the field's value. Takes in a string & returns a validated
   *     string, or null to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/text-input#creation}
   *     for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * Allow browser to spellcheck this field.
     * @type {boolean}
     * @protected
     */
    this.spellcheck_ = true;

    /**
     * The HTML input element.
     * @type {HTMLElement}
     * @protected
     */
    this.htmlInput_ = null;

    /**
     * True if the field's value is currently being edited via the UI.
     * @type {boolean}
     * @private
     */
    this.isBeingEdited_ = false;

    /**
     * True if the value currently displayed in the field's editory UI is valid.
     * @type {boolean}
     * @private
     */
    this.isTextValid_ = false;

    /**
     * Key down event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onKeyDownWrapper_ = null;

    /**
     * Key input event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onKeyInputWrapper_ = null;

    /**
     * Whether the field should consider the whole parent block to be its click
     * target.
     * @type {?boolean}
     */
    this.fullBlockClickTarget_ = false;

    /**
     * The workspace that this field belongs to.
     * @type {?WorkspaceSvg}
     * @protected
     */
    this.workspace_ = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    /**
     * Mouse cursor style when over the hotspot that initiates the editor.
     * @type {string}
     */
    this.CURSOR = 'text';

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) this.configure_(opt_config);
    this.setValue(opt_value);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * @override
   */
  configure_(config) {
    super.configure_(config);
    if (typeof config['spellcheck'] === 'boolean') {
      this.spellcheck_ = config['spellcheck'];
    }
  }

  /**
   * @override
   */
  initView() {
    if (this.getConstants().FULL_BLOCK_FIELDS) {
      // Step one: figure out if this is the only field on this block.
      // Rendering is quite different in that case.
      let nFields = 0;
      let nConnections = 0;

      // Count the number of fields, excluding text fields
      for (let i = 0, input; (input = this.sourceBlock_.inputList[i]); i++) {
        for (let j = 0; (input.fieldRow[j]); j++) {
          nFields++;
        }
        if (input.connection) {
          nConnections++;
        }
      }
      // The special case is when this is the only non-label field on the block
      // and it has an output but no inputs.
      this.fullBlockClickTarget_ =
          nFields <= 1 && this.sourceBlock_.outputConnection && !nConnections;
    } else {
      this.fullBlockClickTarget_ = false;
    }

    if (this.fullBlockClickTarget_) {
      this.clickTarget_ = this.sourceBlock_.getSvgRoot();
    } else {
      this.createBorderRect_();
    }
    this.createTextElement_();
  }

  /**
   * Ensure that the input value casts to a valid string.
   * @param {*=} opt_newValue The input value.
   * @return {*} A valid string, or null if invalid.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return String(opt_newValue);
  }

  /**
   * Called by setValue if the text input is not valid. If the field is
   * currently being edited it reverts value of the field to the previous
   * value while allowing the display text to be handled by the htmlInput_.
   * @param {*} _invalidValue The input value that was determined to be invalid.
   *    This is not used by the text input because its display value is stored
   * on the htmlInput_.
   * @protected
   */
  doValueInvalid_(_invalidValue) {
    if (this.isBeingEdited_) {
      this.isTextValid_ = false;
      const oldValue = this.value_;
      // Revert value when the text becomes invalid.
      this.value_ = this.htmlInput_.untypedDefaultValue_;
      if (this.sourceBlock_ && eventUtils.isEnabled()) {
        eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
            this.sourceBlock_, 'field', this.name || null, oldValue,
            this.value_));
      }
    }
  }

  /**
   * Called by setValue if the text input is valid. Updates the value of the
   * field, and updates the text of the field if it is not currently being
   * edited (i.e. handled by the htmlInput_).
   * @param {*} newValue The value to be saved. The default validator guarantees
   * that this is a string.
   * @protected
   */
  doValueUpdate_(newValue) {
    this.isTextValid_ = true;
    this.value_ = newValue;
    if (!this.isBeingEdited_) {
      // This should only occur if setValue is triggered programmatically.
      this.isDirty_ = true;
    }
  }

  /**
   * Updates text field to match the colour/style of the block.
   * @package
   */
  applyColour() {
    if (this.sourceBlock_ && this.getConstants().FULL_BLOCK_FIELDS) {
      if (this.borderRect_) {
        this.borderRect_.setAttribute(
            'stroke', this.sourceBlock_.style.colourTertiary);
      } else {
        this.sourceBlock_.pathObject.svgPath.setAttribute(
            'fill', this.getConstants().FIELD_BORDER_RECT_COLOUR);
      }
    }
  }

  /**
   * Updates the colour of the htmlInput given the current validity of the
   * field's value.
   * @protected
   */
  render_() {
    super.render_();
    // This logic is done in render_ rather than doValueInvalid_ or
    // doValueUpdate_ so that the code is more centralized.
    if (this.isBeingEdited_) {
      this.resizeEditor_();
      const htmlInput = /** @type {!HTMLElement} */ (this.htmlInput_);
      if (!this.isTextValid_) {
        dom.addClass(htmlInput, 'blocklyInvalidInput');
        aria.setState(htmlInput, aria.State.INVALID, true);
      } else {
        dom.removeClass(htmlInput, 'blocklyInvalidInput');
        aria.setState(htmlInput, aria.State.INVALID, false);
      }
    }
  }

  /**
   * Set whether this field is spellchecked by the browser.
   * @param {boolean} check True if checked.
   */
  setSpellcheck(check) {
    if (check === this.spellcheck_) {
      return;
    }
    this.spellcheck_ = check;
    if (this.htmlInput_) {
      this.htmlInput_.setAttribute('spellcheck', this.spellcheck_);
    }
  }

  /**
   * Show the inline free-text editor on top of the text.
   * @param {Event=} _opt_e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param {boolean=} opt_quietInput True if editor should be created without
   *     focus.  Defaults to false.
   * @protected
   */
  showEditor_(_opt_e, opt_quietInput) {
    this.workspace_ = (/** @type {!BlockSvg} */ (this.sourceBlock_)).workspace;
    const quietInput = opt_quietInput || false;
    if (!quietInput &&
        (userAgent.MOBILE || userAgent.ANDROID || userAgent.IPAD)) {
      this.showPromptEditor_();
    } else {
      this.showInlineEditor_(quietInput);
    }
  }

  /**
   * Create and show a text input editor that is a prompt (usually a popup).
   * Mobile browsers have issues with in-line textareas (focus and keyboards).
   * @private
   */
  showPromptEditor_() {
    dialog.prompt(Msg['CHANGE_VALUE_TITLE'], this.getText(), function(text) {
      // Text is null if user pressed cancel button.
      if (text !== null) {
        this.setValue(this.getValueFromEditorText_(text));
      }
    }.bind(this));
  }

  /**
   * Create and show a text input editor that sits directly over the text input.
   * @param {boolean} quietInput True if editor should be created without
   *     focus.
   * @private
   */
  showInlineEditor_(quietInput) {
    WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_.bind(this));
    this.htmlInput_ = this.widgetCreate_();
    this.isBeingEdited_ = true;

    if (!quietInput) {
      this.htmlInput_.focus({preventScroll: true});
      this.htmlInput_.select();
    }
  }

  /**
   * Create the text input editor widget.
   * @return {!HTMLElement} The newly created text input editor.
   * @protected
   */
  widgetCreate_() {
    eventUtils.setGroup(true);
    const div = WidgetDiv.getDiv();

    dom.addClass(this.getClickTarget_(), 'editing');

    const htmlInput =
        /** @type {HTMLInputElement} */ (document.createElement('input'));
    htmlInput.className = 'blocklyHtmlInput';
    htmlInput.setAttribute('spellcheck', this.spellcheck_);
    const scale = this.workspace_.getScale();
    const fontSize = (this.getConstants().FIELD_TEXT_FONTSIZE * scale) + 'pt';
    div.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;
    let borderRadius = (FieldTextInput.BORDERRADIUS * scale) + 'px';

    if (this.fullBlockClickTarget_) {
      const bBox = this.getScaledBBox();

      // Override border radius.
      borderRadius = (bBox.bottom - bBox.top) / 2 + 'px';
      // Pull stroke colour from the existing shadow block
      const strokeColour = this.sourceBlock_.getParent() ?
          this.sourceBlock_.getParent().style.colourTertiary :
          this.sourceBlock_.style.colourTertiary;
      htmlInput.style.border = (1 * scale) + 'px solid ' + strokeColour;
      div.style.borderRadius = borderRadius;
      div.style.transition = 'box-shadow 0.25s ease 0s';
      if (this.getConstants().FIELD_TEXTINPUT_BOX_SHADOW) {
        div.style.boxShadow =
            'rgba(255, 255, 255, 0.3) 0 0 0 ' + (4 * scale) + 'px';
      }
    }
    htmlInput.style.borderRadius = borderRadius;

    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.getEditorText_(this.value_);
    htmlInput.untypedDefaultValue_ = this.value_;
    htmlInput.oldValue_ = null;

    this.resizeEditor_();

    this.bindInputEvents_(htmlInput);

    return htmlInput;
  }

  /**
   * Closes the editor, saves the results, and disposes of any events or
   * DOM-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    // Non-disposal related things that we do when the editor closes.
    this.isBeingEdited_ = false;
    this.isTextValid_ = true;
    // Make sure the field's node matches the field's internal value.
    this.forceRerender();
    this.onFinishEditing_(this.value_);
    eventUtils.setGroup(false);

    // Actual disposal.
    this.unbindInputEvents_();
    const style = WidgetDiv.getDiv().style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
    style.transition = '';
    style.boxShadow = '';
    this.htmlInput_ = null;

    dom.removeClass(this.getClickTarget_(), 'editing');
  }

  /**
   * A callback triggered when the user is done editing the field via the UI.
   * @param {*} _value The new value of the field.
   */
  onFinishEditing_(_value) {
    // NOP by default.
    // TODO(#2496): Support people passing a func into the field.
  }

  /**
   * Bind handlers for user input on the text input field's editor.
   * @param {!HTMLElement} htmlInput The htmlInput to which event
   *    handlers will be bound.
   * @protected
   */
  bindInputEvents_(htmlInput) {
    // Trap Enter without IME and Esc to hide.
    this.onKeyDownWrapper_ = browserEvents.conditionalBind(
        htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
    // Resize after every input change.
    this.onKeyInputWrapper_ = browserEvents.conditionalBind(
        htmlInput, 'input', this, this.onHtmlInputChange_);
  }

  /**
   * Unbind handlers for user input and workspace size changes.
   * @protected
   */
  unbindInputEvents_() {
    if (this.onKeyDownWrapper_) {
      browserEvents.unbind(this.onKeyDownWrapper_);
      this.onKeyDownWrapper_ = null;
    }
    if (this.onKeyInputWrapper_) {
      browserEvents.unbind(this.onKeyInputWrapper_);
      this.onKeyInputWrapper_ = null;
    }
  }

  /**
   * Handle key down to the editor.
   * @param {!Event} e Keyboard event.
   * @protected
   */
  onHtmlInputKeyDown_(e) {
    if (e.keyCode === KeyCodes.ENTER) {
      WidgetDiv.hide();
      dropDownDiv.hideWithoutAnimation();
    } else if (e.keyCode === KeyCodes.ESC) {
      this.setValue(this.htmlInput_.untypedDefaultValue_);
      WidgetDiv.hide();
      dropDownDiv.hideWithoutAnimation();
    } else if (e.keyCode === KeyCodes.TAB) {
      WidgetDiv.hide();
      dropDownDiv.hideWithoutAnimation();
      this.sourceBlock_.tab(this, !e.shiftKey);
      e.preventDefault();
    }
  }

  /**
   * Handle a change to the editor.
   * @param {!Event} _e Keyboard event.
   * @private
   */
  onHtmlInputChange_(_e) {
    const text = this.htmlInput_.value;
    if (text !== this.htmlInput_.oldValue_) {
      this.htmlInput_.oldValue_ = text;

      const value = this.getValueFromEditorText_(text);
      this.setValue(value);
      this.forceRerender();
      this.resizeEditor_();
    }
  }

  /**
   * Set the HTML input value and the field's internal value. The difference
   * between this and ``setValue`` is that this also updates the HTML input
   * value whilst editing.
   * @param {*} newValue New value.
   * @protected
   */
  setEditorValue_(newValue) {
    this.isDirty_ = true;
    if (this.isBeingEdited_) {
      // In the case this method is passed an invalid value, we still
      // pass it through the transformation method `getEditorText` to deal
      // with. Otherwise, the internal field's state will be inconsistent
      // with what's shown to the user.
      this.htmlInput_.value = this.getEditorText_(newValue);
    }
    this.setValue(newValue);
  }

  /**
   * Resize the editor to fit the text.
   * @protected
   */
  resizeEditor_() {
    const div = WidgetDiv.getDiv();
    const bBox = this.getScaledBBox();
    div.style.width = bBox.right - bBox.left + 'px';
    div.style.height = bBox.bottom - bBox.top + 'px';

    // In RTL mode block fields and LTR input fields the left edge moves,
    // whereas the right edge is fixed.  Reposition the editor.
    const x = this.sourceBlock_.RTL ? bBox.right - div.offsetWidth : bBox.left;
    const xy = new Coordinate(x, bBox.top);

    div.style.left = xy.x + 'px';
    div.style.top = xy.y + 'px';
  }

  /**
   * Returns whether or not the field is tab navigable.
   * @return {boolean} True if the field is tab navigable.
   * @override
   */
  isTabNavigable() {
    return true;
  }

  /**
   * Use the `getText_` developer hook to override the field's text
   * representation. When we're currently editing, return the current HTML value
   * instead. Otherwise, return null which tells the field to use the default
   * behaviour (which is a string cast of the field's value).
   * @return {?string} The HTML value if we're editing, otherwise null.
   * @protected
   * @override
   */
  getText_() {
    if (this.isBeingEdited_ && this.htmlInput_) {
      // We are currently editing, return the HTML input value instead.
      return this.htmlInput_.value;
    }
    return null;
  }

  /**
   * Transform the provided value into a text to show in the HTML input.
   * Override this method if the field's HTML input representation is different
   * than the field's value. This should be coupled with an override of
   * `getValueFromEditorText_`.
   * @param {*} value The value stored in this field.
   * @return {string} The text to show on the HTML input.
   * @protected
   */
  getEditorText_(value) {
    return String(value);
  }

  /**
   * Transform the text received from the HTML input into a value to store
   * in this field.
   * Override this method if the field's HTML input representation is different
   * than the field's value. This should be coupled with an override of
   * `getEditorText_`.
   * @param {string} text Text received from the HTML input.
   * @return {*} The value to store.
   * @protected
   */
  getValueFromEditorText_(text) {
    return text;
  }

  /**
   * Construct a FieldTextInput from a JSON arg object,
   * dereferencing any string table references.
   * @param {!Object} options A JSON object with options (text, and spellcheck).
   * @return {!FieldTextInput} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    const text = parsing.replaceMessageReferences(options['text']);
    // `this` might be a subclass of FieldTextInput if that class doesn't
    // override the static fromJson method.
    return new this(text, undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldTextInput.prototype.DEFAULT_VALUE = '';

/**
 * Pixel size of input border radius.
 * Should match blocklyText's border-radius in CSS.
 */
FieldTextInput.BORDERRADIUS = 4;

fieldRegistry.register('field_input', FieldTextInput);

exports.FieldTextInput = FieldTextInput;
