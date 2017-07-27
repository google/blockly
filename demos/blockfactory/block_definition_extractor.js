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
BlockDefinitionExtractor.prototype.parseFields_ = function() {
  for (var i=0; i<this.src.current.length; i++) {
    var field = this.src.current[i];
    if (field instanceof Blockly.FieldLabel) {
      this.fieldStatic_(field.text_);
    } else if (field instanceof Blockly.FieldTextInput) {
      this.fieldInput_(field.text_, field.name);
    } else if (field instanceof Blockly.FieldNumber) {
      this.fieldNumber_(field.text_, field.name, field.min_,
          field.max_, field.presicion_);
    } else if (field instanceof Blockly.FieldAngle) {
      this.fieldAngle_(field.text_, field.name);
    } else if (field instanceof Blockly.FieldDropdown) {
      this.fieldDropdown_(field.menuGenerator_, field.name);
    } else if (field instanceof Blockly.FieldCheckbox) {
      this.fieldCheckbox_(field.state_ , field.name);
    } else if (field instanceof Blockly.FieldColour) {
      this.fieldColour_(field.colour_ , field.name);
    } else if (field instanceof Blockly.FieldVariable) {
      this.fieldVariable_(field.text_, field.name);
    } else if (field instanceof Blockly.FieldImage) {
      this.fieldImage_(field.src_, field.width_,
          field.height_, field.text_);
    }
  }
};

/**
 * Parses the current src node to create the corresponding input elements.
 */
BlockDefinitionExtractor.prototype.parseInputs_ = function() {
  var lastInputDefElement = null;
  for (var i=0; i<this.src.current.length; i++) {
    var input = this.src.current[i];
    var align = 'LEFT'; // Left alignment is the default.
    if (input.align || input.align === 0) {
      if (input.align === Blockly.ALIGN_CENTRE) {
        align = 'CENTRE';
      } else if (input.align === Blockly.ALIGN_RIGHT) {
        align = 'RIGHT';
      }
    }
    var inputDefElement = this.input_(input, align,
        this.chainNodesCB_('fields', input.fieldRow));
    if (lastInputDefElement) {
      var next = this.newElement_('next');
      next.append(inputDefElement);
      lastInputDefElement.append(next);
    } else {
      this.dst.current.append(inputDefElement);
    }
    lastInputDefElement = inputDefElement;
  }
};

/**
 * Callback function generator based on the chained nodes type.
 *
 * @param {string} nodesType Type of nodes to be chained
 * @param {Element} currentSrcNode Pass the current source node
 * @return {Function} Returns a callback function to chain
 */
BlockDefinitionExtractor.prototype.chainNodesCB_ =
  function(nodesType, currentSrcNode)
{
  return function() {
    var src = this.src.current;
    this.src.current = currentSrcNode;
    switch (nodesType) {
      case 'fields':
        this.parseFields_();
        break;
      case 'inputs':
        this.parseInputs_();
        break;
    };
    this.src.current = src;
  }.bind(this);
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
 * @param {nodeChainCallback} tooltipCB
 * @param {nodeChainCallback} helpUrlCB
 * @param {nodeChainCallback} colourCB
 * @return {Element} The factory_base block element.
 */
BlockDefinitionExtractor.prototype.factoryBase_ =
  function(block, connections, name, inline, tooltipCB, helpUrlCB, colourCB)
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
  factoryBaseEl.append(this.dst.current =
      this.newElement_('statement', {name: 'INPUTS'}));
  this.chainNodesCB_('inputs', block.inputList)();
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.dst.current =
      this.newElement_('value', {name: 'TOOLTIP'}));
  tooltipCB();
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.dst.current =
      this.newElement_('value', {name: 'HELPURL'}));
  helpUrlCB();
  this.dst.current = factoryBaseEl;
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
  colourCB();
  return factoryBaseEl;
};

/**
 * Creates a block Element for the input_statement block.
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

  inputDefBlock.append(this.newElement_('field', {name: 'INPUTNAME'}, input.name));
  inputDefBlock.append(this.newElement_('field', {name: 'ALIGN'}, align));

  var parentDst = this.dst.current;  // TODO: Replace with flattened call.
  var fieldsDef = this.dst.current = this.newElement_('statement', {name: 'FIELDS'});
  fieldsCB();
  inputDefBlock.append(fieldsDef);
  this.dst.current = parentDst;

  if (input.type != Blockly.DUMMY_INPUT) {
    var typeValue = this.newElement_('value', {name: 'TYPE'});
    typeValue.append(this.buildTypeConstraintBlockForConnection_(input.connection));
    inputDefBlock.append(typeValue);
  }

  return inputDefBlock;
};

/**
 * Creates a block Element for the field_static block.
 * @param {string} text
 */
BlockDefinitionExtractor.prototype.fieldStatic_ = function(text) {
  var block1 = this.newElement_('block', {type: 'field_static'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'TEXT'}, text));
};

/**
 * Creates a block Element for the field_input block.
 *
 * @param {string} text
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldInput_ = function(text, fieldName) {
  var block1 = this.newElement_('block', {type: 'field_input'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'TEXT'}, text));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_number block.
 *
 * @param {number} value
 * @param {string} fieldName
 * @param {number} min
 * @param {number} max
 * @param {number} precision
 */
BlockDefinitionExtractor.prototype.fieldNumber_ =
  function(value, fieldName, min, max, precision)
{
  var block1 = this.newElement_('block', {type: 'field_number'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'VALUE'}, value));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  block1.append(this.newElement_('field', {name: 'MIN'}, min));
  block1.append(this.newElement_('field', {name: 'MAX'}, max));
  block1.append(this.newElement_('field', {name: 'PRECISION'}, precision));
};

/**
 * Creates a block Element for the field_angle block.
 *
 * @param {number} angle
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldAngle_ = function(angle, fieldName) {
  var block1 = this.newElement_('block', {type: 'field_angle'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'ANGLE'}, angle));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_dropdown block.
 *
 * @param {Array<string>} options List of options for the dropdown field.
 * @param {string} fieldName Name of the field.
 */
BlockDefinitionExtractor.prototype.fieldDropdown_ =
  function(options, fieldName)
{
  var block1 = this.newElement_('block', {type: 'field_dropdown'});
  var optionsStr = '[';

  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  var mutation = this.newElement_('mutation');
  block1.append(mutation);
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
  for (var i=0; i<options.length; i++) {
    var option = options[i];
    if (typeof option[0] === "string") {
      optionsStr+='&quot;text&quot;,'
      block1.append(this.newElement_('field', {name: 'USER'+i}, option[0]));
    } else {
      optionsStr+='&quot;image&quot;,';
      block1.append(
          this.newElement_('field', {name: 'SRC'+i}, option[0].src));
      block1.append(
          this.newElement_('field', {name: 'WIDTH'+i}, option[0].width));
      block1.append(
          this.newElement_('field', {name: 'HEIGHT'+i}, option[0].height));
      block1.append(
          this.newElement_('field', {name: 'ALT'+i}, option[0].alt));
    }
    block1.append(this.newElement_('field', {name: 'CPU'+i}, option[1]));
  }
  optionsStr = optionsStr.slice(0,-1); // Drop last comma
  optionsStr += ']';
  mutation.setAttribute('options', optionsStr);
};

/**
 * Creates a block Element for the field_checkbox block.
 *
 * @param {string} checked Can be true or false
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldCheckbox_ =
  function(checked, fieldName)
{
  var block1 = this.newElement_('block', {type: 'field_checkbox'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'CHECKED'}, checked));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_colour block.
 *
 * @param {number} colour
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldColour_ = function(colour, fieldName) {
  var block1 = this.newElement_('block', {type: 'field_colour'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'COLOUR'}, colour));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_variable block.
 *
 * @param {string} text
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldVariable_ = function(text, fieldName) {
  var block1 = this.newElement_('block', {type: 'field_variable'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'TEXT'}, text));
  block1.append(this.newElement_('field', {name: 'FIELDNAME'}, fieldName));
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
 * @param text
 */
BlockDefinitionExtractor.prototype.text_ = function(text) {
  var block1 = this.newElement_('block', {type: 'text'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newElement_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newElement_('field', {name: 'TEXT'}, text));
};

/**
 * Builds the block description of the given block.
 * @param {!Blockly.Block} block Block that will be assigned as the
 *     this.src element to generate the description blocks.
 *
 * @return {Element} Returns a workspace DOM for the Block Definition
 *     workspace.
 */
BlockDefinitionExtractor.prototype.buildBlockFactoryDef =
  function(block)
{
  var this_ = this;
  var workspaceXml = goog.dom.createDom('xml');
  // Convert colour_ to hue value 0-360 degrees
  var colour_hue = Math.floor(
      goog.color.hexToHsv(block.colour_)[0]);
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
  var factoryBaseXml = this.factoryBase_(block, connections, block.type, inline,
    function() {
      this.text_(block.tooltip);
    }.bind(this),
    function() {
      this.text_(block.helpUrl);
    }.bind(this),
    function() {
      this_.colourHue_(block.colour_, colour_hue);
    }.bind(this)
  );
  workspaceXml.append(factoryBaseXml);

  return workspaceXml;
};
