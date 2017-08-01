/**
 * Copyright 2017 Juan Carlos Orozco Arena
 * Apache License Version 2.0
 */

/**
 * @fileoverview Block element construction functions.
 * @author JC-Orozco (Juan Carlos Orozco), AnmAtAnm (Andrew n marshall)
 */
'use strict';

/**
 * Namespace for BlockDefinitionExtractor.
 */
goog.provide('BlockDefinitionExtractor');

/**
 * Callback to chain node tree.
 * @callback nodeChainCallback
 */

/**
 * Class to contain all functions needed to extract block definition from
 * the block preview data structure.
 * @constructor
 */
BlockDefinitionExtractor = function() {
  /** @type {{root: Blockly.Block, current: Blockly.Block}} */
  this.src = {root: null, current: null};
  /** @type {{root: Element, current: Element}} */
  this.dst = {root: null, current: null};
};

/**
 * Helper function to create a new DOM element.
 * @param {!string} name New element tag name.
 * @param {Map} name New element's attributes.
 * @param {string} text New element's inner text.
 * @return {Element} The newly created element.
 */
BlockDefinitionExtractor.prototype.newElement_ = function(name, attrs, text) {
  var block1;
  if(name === 'block') {
    block1 = goog.dom.createDom('block');
  } else {
    block1 = goog.dom.createDom(name);
  }
  for (var key in attrs) {
    block1.setAttribute(key, attrs[key]);
  }
  if (text) {
    block1.append(text);
  }
  return block1;
};

/**
 * Checks whether a given block can contain statements or not.
 * @param {!Element} block A block Element to test.
 * @return {boolean} Returns true if this block can contain statements.
 */
BlockDefinitionExtractor.prototype.isStatementsContainer_ = function(block) {
  return (block.tagName === 'STATEMENT' || block.tagName === 'VALUE');
};

/**
 * Creates an connection constraint type <block> Element for the requested type.
 *
 * @param {string} type Type name of element to be created.
 * @retrun {Element} The XML element for the Block representing the type.
 */
BlockDefinitionExtractor.prototype.buildBlockForType_ = function(type) {
  switch (type) {
    case 'Null':
      return this.typeNull_();
    case 'Boolean':
      return this.typeBoolean_();
    case 'Number':
      return this.typeNumber_();
    case 'String':
      return this.typeString_();
    case 'Array':
      return this.typeList_();
    default:
      return this.typeOther_(type);
  }
};

/**
 * Parses the current src node to create the corresponding type elements.
 *
 * @retrun {Element} The XML elements for the Block representing the type
 *     constraints.
 */
BlockDefinitionExtractor.prototype.buildTypeConstraintBlockForConnection_ =
    function(connection)
{
  var typeBlock;
  if (connection.check_) {
    if (connection.check_.length < 1) {
      typeBlock = this.typeNullShadow_();
    } else if (connection.check_.length === 1) {
      typeBlock = this.buildBlockForType_(connection.check_[0]);
    } else if (connection.check_.length > 1 ) {
      typeBlock = this.typeGroup_(connection.check_);
    }
  } else {
    typeBlock = this.typeNullShadow_();
  }
  return typeBlock;
};

/**
 * Parses the current src node to create the corresponding field elements.
 */
BlockDefinitionExtractor.prototype.parseFields_ = function(fieldRow) {
  var firstFieldDefElement = null;
  var lastFieldDefElement = null;

  for (var i = 0; i < fieldRow.length; i++) {
    var field = fieldRow[i];
    var fieldDefElement = null;
    if (field instanceof Blockly.FieldLabel) {
      fieldDefElement = this.fieldLabel_(field.text_);
    } else if (field instanceof Blockly.FieldTextInput) {
      fieldDefElement = this.fieldInput_(field.name, field.text_);
    } else if (field instanceof Blockly.FieldNumber) {
      fieldDefElement = this.fieldNumber_(
          field.name, field.text_, field.min_, field.max_, field.presicion_);
    } else if (field instanceof Blockly.FieldAngle) {
      fieldDefElement = this.fieldAngle_(field.name, field.text_);
    } else if (field instanceof Blockly.FieldDropdown) {
      fieldDefElement = this.fieldDropdown_(field.name, field.menuGenerator_);
    } else if (field instanceof Blockly.FieldCheckbox) {
      fieldDefElement = this.fieldCheckbox_(field.name, field.state_);
    } else if (field instanceof Blockly.FieldColour) {
      fieldDefElement = this.fieldColour_(field.name, field.colour_);
    } else if (field instanceof Blockly.FieldVariable) {
      fieldDefElement = this.fieldVariable_(field.name, field.text_);
    } else if (field instanceof Blockly.FieldImage) {
      fieldDefElement = this.fieldImage_(
          field.src_, field.width_, field.height_, field.text_);
    }

    if (lastFieldDefElement) {
      var next = this.newElement_('next');
      next.append(fieldDefElement);
      lastFieldDefElement.append(next);
    } else {
      firstFieldDefElement = fieldDefElement;
    }
    lastFieldDefElement = fieldDefElement;
  }

  return firstFieldDefElement;
};

/**
 * Parses the current src node to create the corresponding input elements.
 *
 * @param {Blockly.Block} The source block to copy the inputs of.
 * @return {Element} The XML for the stack of input definition blocks.
 */
BlockDefinitionExtractor.prototype.parseInputs_ = function(block) {
  var firstInputDefElement = null;
  var lastInputDefElement = null;
  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    var align = 'LEFT'; // Left alignment is the default.
    if (input.align || input.align === 0) {
      if (input.align === Blockly.ALIGN_CENTRE) {
        align = 'CENTRE';
      } else if (input.align === Blockly.ALIGN_RIGHT) {
        align = 'RIGHT';
      }
    }

    var inputDefElement = this.input_(input, align);
    if (lastInputDefElement) {
      var next = this.newElement_('next');
      next.append(inputDefElement);
      lastInputDefElement.append(next);
    } else {
      firstInputDefElement = inputDefElement;
    }
    lastInputDefElement = inputDefElement;
  }
  return firstInputDefElement;
};

/**
 * Creates the root factory_base block for the block definition editing
 * workspace.
 *
 * @param {Blockly.Block} block The example block for the extracted style.
 * @param {string} connections Define block connections. Options: NONE, LEFT,
 *     UP, DOWN, BOTH.
 * @param {string} name Block name.
 * @param {boolean} inline Block layout inline or not.
 * @return {Element} The factory_base block element.
 */
BlockDefinitionExtractor.prototype.factoryBase_ =
  function(block, connections, name, inline)
{
  this.src = {root: block, current: block};
  var factoryBaseEl = this.newElement_('block', {type: 'factory_base'});
  this.dst = Object.create(null);
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.newElement_('mutation', {connections: connections}));
  factoryBaseEl.append(this.newElement_('field', {name: 'NAME'}, name));
  factoryBaseEl.append(this.newElement_('field', {name: 'INLINE'}, inline));
  factoryBaseEl.append(
      this.newElement_('field', {name: 'CONNECTIONS'}, connections));

  var inputsStatement = this.newElement_('statement', {name: 'INPUTS'});
  inputsStatement.append(this.parseInputs_(block));
  factoryBaseEl.append(inputsStatement);

  var tooltipValue = this.newElement_('value', {name: 'TOOLTIP'});
  tooltipValue.append(this.text_(block.tooltip));
  factoryBaseEl.append(tooltipValue);

  var helpUrlValue = this.newElement_('value', {name: 'HELPURL'});
  helpUrlValue.append(this.text_(block.helpUrl));
  factoryBaseEl.append(helpUrlValue);

  if (connections === 'LEFT') {
    var inputValue = this.newElement_('value', {name: 'OUTPUTTYPE'});
    inputValue.append(this.buildTypeConstraintBlockForConnection_(
        block.outputConnection));
    factoryBaseEl.append(inputValue);
  } else {
    if (connections === 'UP' || connections === 'BOTH') {
      var inputValue = this.newElement_('value', {name: 'TOPTYPE'});
      inputValue.append(this.buildTypeConstraintBlockForConnection_(
          block.previousConnection));
      factoryBaseEl.append(inputValue);
    }
    if (connections === 'DOWN' || connections === 'BOTH') {
      var inputValue = this.newElement_('value', {name: 'BOTTOMTYPE'});
      inputValue.append(this.buildTypeConstraintBlockForConnection_(
          block.nextConnection));
      factoryBaseEl.append(inputValue);
    }
  }
  factoryBaseEl.append(this.dst.current =
      this.newElement_('value', {name: 'COLOUR'}));

  // Convert colour_ to hue value 0-360 degrees
  // TODO(#1247): Solve off-by-one errors.
  // TODO: Deal with colors that don't map to standard hues. (Needs improved block definitions.)
  var colour_hue = Math.floor(
      goog.color.hexToHsv(block.colour_)[0]);  // This is off by one... sometimes
  this.colourHue_(block.colour_, colour_hue)
  return factoryBaseEl;
};

/**
 * Creates a block Element for the input_value, input_statement, or input_dummy
 * blocks.
 *
 * @param {Blockly.Input} input The input object.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 * @return {Element} The <block> element that defines the input.
 */
BlockDefinitionExtractor.prototype.input_ =
  function(input, align, fieldsCB)
{
  var inputTypeAttr = (input.type === Blockly.INPUT_VALUE) ? 'input_value' :
      (input.type === Blockly.INPUT_STATEMENT) ? 'input_statement' :
      /* input.type === Blockly.INPUT_DUMMY */ 'input_dummy';
  var inputDefBlock = this.newElement_('block', {type: inputTypeAttr});

  if (input.type != Blockly.DUMMY_INPUT) {
    inputDefBlock.append(
        this.newElement_('field', {name: 'INPUTNAME'}, input.name));
  }
  inputDefBlock.append(this.newElement_('field', {name: 'ALIGN'}, align));

  var fieldsDef = this.dst.current = this.newElement_('statement', {name: 'FIELDS'});
  var fieldsXml = this.parseFields_(input.fieldRow);
  fieldsDef.append(fieldsXml);
  inputDefBlock.append(fieldsDef);

  if (input.type != Blockly.DUMMY_INPUT) {
    var typeValue = this.newElement_('value', {name: 'TYPE'});
    typeValue.append(this.buildTypeConstraintBlockForConnection_(input.connection));
    inputDefBlock.append(typeValue);
  }

  return inputDefBlock;
};

/**
 * Creates the XML for a FieldLabel definition.
 * @param {string} text
 * @return {Element} The XML for FieldLabel definition.
 */
BlockDefinitionExtractor.prototype.fieldLabel_ = function(text) {
  var fieldBlock = this.newElement_('block', {type: 'field_static'});
  fieldBlock.append(this.newElement_('field', {name: 'TEXT'}, text));
  return fieldBlock;
};

/**
 * Creates the XML for a FieldInput (text input) definition.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {string} text The default text string.
 * @return {Element} The XML for FieldInput definition.
 */
BlockDefinitionExtractor.prototype.fieldInput_ = function(fieldName, text) {
  var fieldInput = this.newElement_('block', {type: 'field_input'});
  fieldInput.append(this.newElement_('field', {name: 'TEXT'}, text));
  fieldInput.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  return fieldInput;
};

/**
 * Creates the XML for a FieldNumber definition.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {number} value The field's default value.
 * @param {number} min The minimum allowed value, or negative infinity.
 * @param {number} max The maximum allowed value, or positive infinity.
 * @param {number} precision The precision allowed for the number.
 * @return {Element} The XML for FieldNumber definition.
 */
BlockDefinitionExtractor.prototype.fieldNumber_ =
  function(fieldName, value, min, max, precision)
{
  var fieldNumber = this.newElement_('block', {type: 'field_number'});
  fieldNumber.append(this.newElement_('field', {name: 'VALUE'}, value));
  fieldNumber.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  fieldNumber.append(this.newElement_('field', {name: 'MIN'}, min));
  fieldNumber.append(this.newElement_('field', {name: 'MAX'}, max));
  fieldNumber.append(this.newElement_('field', {name: 'PRECISION'}, precision));
  return fieldNumber;
};

/**
 * Creates the XML for a FieldAngle definition.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {number} angle The field's default value.
 * @return {Element} The XML for FieldAngle definition.
 */
BlockDefinitionExtractor.prototype.fieldAngle_ = function(angle, fieldName) {
  var fieldAngle = this.newElement_('block', {type: 'field_angle'});
  fieldAngle.append(this.newElement_('field', {name: 'ANGLE'}, angle));
  fieldAngle.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  return fieldAngle;
};

/**
 * Creates the XML for a FieldDropdown definition.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {(!Array<!Array>|!Function)} fieldDropdown_ List of options, or a
 *     function that generates the same.
 * @return {Element} The XML for FieldDropdown definition.
 */
BlockDefinitionExtractor.prototype.fieldDropdown_ =
  function(fieldName, menuGenerator_)
{
  var fieldDropdown = this.newElement_('block', {type: 'field_dropdown'});
  var optionsStr = '[';

  var mutation = this.newElement_('mutation');
  fieldDropdown.append(mutation);
  fieldDropdown.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  for (var i=0; i<options.length; i++) {
    var option = options[i];
    if (typeof option[0] === "string") {
      optionsStr += '"text",'
      fieldDropdown.append(this.newElement_('field', {name: 'USER'+i}, option[0]));
    } else {
      optionsStr += '"image",';
      fieldDropdown.append(
          this.newElement_('field', {name: 'SRC'+i}, option[0].src));
      fieldDropdown.append(
          this.newElement_('field', {name: 'WIDTH'+i}, option[0].width));
      fieldDropdown.append(
          this.newElement_('field', {name: 'HEIGHT'+i}, option[0].height));
      fieldDropdown.append(
          this.newElement_('field', {name: 'ALT'+i}, option[0].alt));
    }
    fieldDropdown.append(this.newElement_('field', {name: 'CPU'+i}, option[1]));
  }
  optionsStr = optionsStr.slice(0,-1); // Drop last comma
  optionsStr += ']';
  mutation.setAttribute('options', optionsStr);

  return fieldDropdown;
};

/**
 * Creates a block Element for the field_checkbox block.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {string} checked The field's default value, true or false.
 * @return {Element} The XML for FieldCheckbox definition.
 */
BlockDefinitionExtractor.prototype.fieldCheckbox_ =
  function(fieldName, checked)
{
  var fieldCheckbox = this.newElement_('block', {type: 'field_checkbox'});
  fieldCheckbox.append(this.newElement_('field', {name: 'CHECKED'}, checked));
  fieldCheckbox.append(
    this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  return fieldCheckbox;
};

/**
 * Creates a block Element for the field_colour block.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {string} colour The field's default value as a string.
 * @return {Element} The XML for FieldColour definition.
 */
BlockDefinitionExtractor.prototype.fieldColour_ =
    function(fieldName, colour)
{
  var fieldColour = this.newElement_('block', {type: 'field_colour'});
  fieldColour.append(this.newElement_('field', {name: 'COLOUR'}, colour));
  fieldColour.append(
    this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  return fieldColour;
};

/**
 * Creates a block Element for the field_variable block.
 *
 * @param {string} fieldName The identifying name of the field.
 * @param {string} text
 */
BlockDefinitionExtractor.prototype.fieldVariable_ = function(fieldName, text) {
  var fieldVar = this.newElement_('block', {type: 'field_variable'});
  fieldVar.append(this.newElement_('field', {name: 'TEXT'}, text));
  fieldVar.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  return fieldVar;
};

/**
 * Creates a block Element for the field_image block.
 *
 * @param {string} src Image src URL.
 * @param {number} width
 * @param {number} height
 * @param {string} alt Alterante text to describe image.
 */
BlockDefinitionExtractor.prototype.fieldImage_ =
  function(src, width, height, alt)
{
  var block1 = this.newElement_('block', {type: 'field_image'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'SRC'}, src));
  block1.append(this.newElement_('field', {name: 'WIDTH'}, width));
  block1.append(this.newElement_('field', {name: 'HEIGHT'}, height));
  block1.append(this.newElement_('field', {name: 'ALT'}, alt));
};

/**
 * Creates a block Element for the type_group block.
 *
 * @param {Array<string>} types List of types of this type group.
 * @return {Element} A "any" type group for child types.
 */
BlockDefinitionExtractor.prototype.typeGroup_ = function(types) {
  var typeGroupBlock = this.newElement_('block', {type: 'type_group'});
  typeGroupBlock.append(this.newElement_('mutation', {types:types.length}));
  for (var i=0; i<types.length; i++) {
    var typeBlock = this.buildBlockForType_(types[i]);
    var valueBlock = this.newElement_('value', {name:'TYPE'+i});
    valueBlock.append(typeBlock);
    typeGroupBlock.append(valueBlock);
  }
  return typeGroupBlock;
};

/**
 * Creates a shadow Element for the type_null block.
 * @return The shadow element for the null type.
 */
BlockDefinitionExtractor.prototype.typeNullShadow_ = function() {
  return this.newElement_('shadow', {type: 'type_null'});
};

/**
 * Creates a block Element for the type_null block.
 * @return The element for the null type.
 */
BlockDefinitionExtractor.prototype.typeNull_ = function() {
  return this.newElement_('block', {type: 'type_null'});
};

/**
 * Creates a block Element for the type_boolean block.
 * @return The element for the boolean type.
 */
BlockDefinitionExtractor.prototype.typeBoolean_ = function() {
  return this.newElement_('block', {type: 'type_boolean'});
};

/**
 * Creates a block Element for the type_number block.
 * @return The element for the number type.
 */
BlockDefinitionExtractor.prototype.typeNumber_ = function() {
  return this.newElement_('block', {type: 'type_number'});
};

/**
 * Creates a block Element for the type_string block.
 * @return The element for the string type.
 */
BlockDefinitionExtractor.prototype.typeString_ = function() {
  return this.newElement_('block', {type: 'type_string'});
};

/**
 * Creates a block Element for the type_list block.
 * @return The element for the list type.
 */
BlockDefinitionExtractor.prototype.typeList_ = function() {
  return this.newElement_('block', {type: 'type_list'});
};

/**
 * Creates a block Element for the type_other block.
 * @return The element for a custom type.
 */
BlockDefinitionExtractor.prototype.typeOther_ = function(type) {
  var block = this.newElement_('block', {type: 'type_other'});
  block.append(this.newElement_('field', {name: 'TYPE'}, type));
  return block;
};

/**
 * Creates a block Element for the color_hue block.
 * @param colour
 * @param hue
 */
BlockDefinitionExtractor.prototype.colourHue_ =
  function(colour, hue)
{
  var block1 = this.newElement_('block', {type: 'colour_hue'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('mutation', {colour:colour.toString()}));
  block1.append(this.newElement_('field', {name: 'HUE'}, hue.toString()));
};

/**
 * Creates a block Element for the text block.
 *
 * @param text The text value of the block.
 */
BlockDefinitionExtractor.prototype.text_ = function(text) {
  var textBlock = this.newElement_('block', {type: 'text'});
  if (text) {
    textBlock.append(this.newElement_('field', {name: 'TEXT'}, text));
  } // Else, use empty string default.
  return textBlock;
};

/**
 * Builds the block description of the given block.
 * @param {!Blockly.Block} block Block that will be assigned as the
 *     this.src element to generate the description blocks.
 *
 * @return {Element} Returns a workspace DOM for the Block Definition
 *     workspace.
 */
BlockDefinitionExtractor.prototype.buildBlockFactoryWorkspace =
  function(block)
{
  var workspaceXml = goog.dom.createDom('xml');
  var inline = 'AUTO'; // When block.inputsInlineDefault === undefined
  if (block.inputsInlineDefault === true) {
    inline = 'INT';
  } else if (block.inputsInlineDefault === false) {
    inline = 'EXT';
  }
  var connections = 'NONE';
  if (block.outputConnection) {
    connections = 'LEFT';
  } else {
    if (block.previousConnection && block.nextConnection) {
      connections = 'BOTH';
    } else {
      if (block.previousConnection) {
        connections = 'TOP';
      }
      if (block.nextConnection) {
        connections = 'BOTTOM';
      }
    }
  }
  var this_ = this;
  var factoryBaseXml = this.factoryBase_(block, connections, block.type, inline);
  workspaceXml.append(factoryBaseXml);

  return workspaceXml;
};
