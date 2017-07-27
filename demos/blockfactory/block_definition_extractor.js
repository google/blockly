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
 * Helper function to create a new DOM node.
 * @param {!string} name New node name.
 * @param {Map} name New node attribute map.
 * @param {string} text New node text.
 * @return {Element} The newly created node.
 */
BlockDefinitionExtractor.prototype.newNode_ = function(name, attrs, text) {
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
 * Checks wether a given block can contain statements or not.
 * @param {!Element} block A block Element to test.
 * @return {boolean} Returns true if this block can contain statements.
 */
BlockDefinitionExtractor.prototype.isStatementsContainer_ = function(block) {
  return (block.tagName === 'STATEMENT' || block.tagName === 'XML' ||
      block.tagName === 'VALUE');
};

/**
 * Creates an connection constraint type Element for the request type name.
 *
 * @param {string} type Type name of element to be created.
 */
BlockDefinitionExtractor.prototype.parseType_ = function(type) {
  switch (type) {
    case 'Null':
      this.typeNull_();
      break;
    case 'Boolean':
      this.typeBoolean_();
      break;
    case 'Number':
      this.typeNumber_();
      break;
    case 'String':
      this.typeString_();
      break;
    case 'Array':
      this.typeList_();
      break;
    default:
      this.typeOther_(type);
      break;
  }
};

/**
 * Parses the current src node to create the corresponding type elements.
 *
 * @param {Blockly.RenderedConnection} connection
 */
BlockDefinitionExtractor.prototype.parseTypes_ = function(connection) {
  if (connection.check_) {
    if (connection.check_.length < 1) {
      this.typeNullShadow_();
    } else if (connection.check_.length === 1) {
      this.parseType_(connection.check_[0]);
    } else if (connection.check_.length > 1 ) {
      this.typeGroup_(connection.check_);
    }
  } else {
    this.typeNullShadow_();
  }
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
  for (var i=0; i<this.src.current.length; i++) {
    var input = this.src.current[i];
    var align = 'LEFT'; // This seems to be the default Blockly.ALIGN_LEFT
    if (input.align || input.align === 0) {
      if (input.align === Blockly.ALIGN_CENTRE) {
        align = 'CENTRE';
      } else if (input.align === Blockly.ALIGN_RIGHT) {
        align = 'RIGHT';
      }
    }
    switch (input.type) {
      case Blockly.INPUT_VALUE:
        this.inputValue_(input.name, align,
            this.chainNodesCB_('fields', input.fieldRow),
            this.chainNodesCB_('types', input.connection));
        break;
      case Blockly.NEXT_STATEMENT:
        this.inputStatement_(input.name, align,
            this.chainNodesCB_('fields', input.fieldRow),
            this.chainNodesCB_('types', input.connection));
        break;
      case Blockly.DUMMY_INPUT:
        this.inputDummy_(align,
            this.chainNodesCB_('fields', input.fieldRow));
        break;
    }
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
  var this_ = this;
  return function() {
    var src = this_.src.current;
    this_.src.current = currentSrcNode;
    switch (nodesType) {
      case 'fields':
        this_.parseFields_();
        break;
      case 'types':
        this_.parseTypes_(this_.src.current);
        break;
      case 'inputs':
        this_.parseInputs_();
        break;
    }
    this_.src.current = src;
  }
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
 * @param {nodeChainCallback} outputTypeCB
 * @param {nodeChainCallback} topTypeCB
 * @param {nodeChainCallback} bottomTypeCB
 * @param {nodeChainCallback} colourCB
 * @return {Element} The factory_base block element.
 */
BlockDefinitionExtractor.prototype.factoryBase_ =
  function(block, connections, name, inline, tooltipCB, helpUrlCB,
           outputTypeCB, topTypeCB, bottomTypeCB, colourCB)
{
  this.src = {root: block, current: block};
  var factoryBaseEl = this.newNode_('block', {type: 'factory_base'});
  this.dst = Object.create(null);
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.newNode_('mutation', {connections: connections}));
  factoryBaseEl.append(this.newNode_('field', {name: 'NAME'}, name));
  factoryBaseEl.append(this.newNode_('field', {name: 'INLINE'}, inline));
  factoryBaseEl.append(
      this.newNode_('field', {name: 'CONNECTIONS'}, connections));
  factoryBaseEl.append(this.dst.current =
      this.newNode_('statement', {name: 'INPUTS'}));
  this.chainNodesCB_('inputs', block.inputList)();
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.dst.current =
      this.newNode_('value', {name: 'TOOLTIP'}));
  tooltipCB();
  this.dst.current = factoryBaseEl;
  factoryBaseEl.append(this.dst.current =
      this.newNode_('value', {name: 'HELPURL'}));
  helpUrlCB();
  this.dst.current = factoryBaseEl;
  if (connections === 'LEFT') {
    factoryBaseEl.append(
      this.dst.current = this.newNode_('value', {name: 'OUTPUTTYPE'}));
    outputTypeCB();
    this.dst.current = factoryBaseEl;
  } else {
    if (connections === 'UP' || connections === 'BOTH') {
      factoryBaseEl.append(this.dst.current =
         this.newNode_('value', {name: 'TOPTYPE'}));
      topTypeCB();
      this.dst.current = factoryBaseEl;
    }
    if (connections === 'DOWN' || connections === 'BOTH') {
      factoryBaseEl.append(this.dst.current =
          this.newNode_('value', {name: 'BOTTOMTYPE'}));
      bottomTypeCB();
      this.dst.current = factoryBaseEl;
    }
  }
  factoryBaseEl.append(this.dst.current =
      this.newNode_('value', {name: 'COLOUR'}));
  colourCB();
  return factoryBaseEl;
};

/**
 * Creates a block Element for the input_dummy block.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 */
BlockDefinitionExtractor.prototype.inputDummy_ = function(align, fieldsCB) {
  var block1 = this.newNode_('block', {type: 'input_dummy'});
  if (!this.isStatementsContainer_(
      this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'ALIGN'}, align));
  block1.append(this.dst.current =
      this.newNode_('statement', {name: 'FIELDS'}));
  fieldsCB();
  this.dst.current = block1;
};

/**
 * Creates a block Element for the input_statement block.
 *
 * @param {string} inputName Input statement name.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockDefinitionExtractor.prototype.inputStatement_ =
  function(inputName, align, fieldsCB, typeCB)
{
  var block1 = this.newNode_('block', {type: 'input_statement'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'INPUTNAME'}, inputName));
  block1.append(this.newNode_('field', {name: 'ALIGN'}, align));
  block1.append(this.dst.current =
      this.newNode_('statement', {name: 'FIELDS'}));
  fieldsCB();
  this.dst.current = block1;
  block1.append(this.dst.current =
      this.newNode_('value', {name: 'TYPE'}));
  typeCB();
  this.dst.current = block1;
};

/**
 * Creates a block Element for the input_value block.
 *
 * @param {string} inputName Input value name.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockDefinitionExtractor.prototype.inputValue_ =
  function(inputName, align, fieldsCB, typeCB)
{
  var block1 = this.newNode_('block', {type: 'input_value'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'INPUTNAME'}, inputName));
  block1.append(this.newNode_('field', {name: 'ALIGN'}, align));
  block1.append(this.dst.current =
      this.newNode_('statement', {name: 'FIELDS'}));
  fieldsCB();
  this.dst.current = block1;
  block1.append(this.dst.current =
      this.newNode_('value', {name: 'TYPE'}));
  typeCB();
  this.dst.current = block1;
};

/**
 * Creates a block Element for the field_static block.
 * @param {string} text
 */
BlockDefinitionExtractor.prototype.fieldStatic_ = function(text) {
  var block1 = this.newNode_('block', {type: 'field_static'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'TEXT'}, text));
};

/**
 * Creates a block Element for the field_input block.
 *
 * @param {string} text
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldInput_ = function(text, fieldName) {
  var block1 = this.newNode_('block', {type: 'field_input'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'TEXT'}, text));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
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
  var block1 = this.newNode_('block', {type: 'field_number'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'VALUE'}, value));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
  block1.append(this.newNode_('field', {name: 'MIN'}, min));
  block1.append(this.newNode_('field', {name: 'MAX'}, max));
  block1.append(this.newNode_('field', {name: 'PRECISION'}, precision));
};

/**
 * Creates a block Element for the field_angle block.
 *
 * @param {number} angle
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldAngle_ = function(angle, fieldName) {
  var block1 = this.newNode_('block', {type: 'field_angle'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'ANGLE'}, angle));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
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
  var block1 = this.newNode_('block', {type: 'field_dropdown'});
  var optionsStr = '[';

  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  var mutation = this.newNode_('mutation');
  block1.append(mutation);
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
  for (var i=0; i<options.length; i++) {
    var option = options[i];
    if (typeof option[0] === "string") {
      optionsStr+='&quot;text&quot;,'
      block1.append(this.newNode_('field', {name: 'USER'+i}, option[0]));
    } else {
      optionsStr+='&quot;image&quot;,';
      block1.append(
          this.newNode_('field', {name: 'SRC'+i}, option[0].src));
      block1.append(
          this.newNode_('field', {name: 'WIDTH'+i}, option[0].width));
      block1.append(
          this.newNode_('field', {name: 'HEIGHT'+i}, option[0].height));
      block1.append(
          this.newNode_('field', {name: 'ALT'+i}, option[0].alt));
    }
    block1.append(this.newNode_('field', {name: 'CPU'+i}, option[1]));
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
  var block1 = this.newNode_('block', {type: 'field_checkbox'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'CHECKED'}, checked));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_colour block.
 *
 * @param {number} colour
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldColour_ = function(colour, fieldName) {
  var block1 = this.newNode_('block', {type: 'field_colour'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'COLOUR'}, colour));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_variable block.
 *
 * @param {string} text
 * @param {string} fieldName
 */
BlockDefinitionExtractor.prototype.fieldVariable_ = function(text, fieldName) {
  var block1 = this.newNode_('block', {type: 'field_variable'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'TEXT'}, text));
  block1.append(this.newNode_('field', {name: 'FIELDNAME'}, fieldName));
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
  var block1 = this.newNode_('block', {type: 'field_image'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'SRC'}, src));
  block1.append(this.newNode_('field', {name: 'WIDTH'}, width));
  block1.append(this.newNode_('field', {name: 'HEIGHT'}, height));
  block1.append(this.newNode_('field', {name: 'ALT'}, alt));
};

/**
 * Creates a block Element for the type_group block.
 *
 * @param {Array<string>} types List of types of this type group.
 */
BlockDefinitionExtractor.prototype.typeGroup_ = function(types) {
  var block1 = this.newNode_('block', {type: 'type_group'});

  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('mutation', {types:types.length}));
  for (var i=0; i<types.length; i++) {
    var type = types[i];
    var value = this.newNode_('value', {name:'TYPE'+i});
    block1.append(value);
    this.dst.current = value;
    this.parseType_(type);
  }
  this.dst.current = block1;
};

/**
 * Creates a shadow Element for the type_null block.
 */
BlockDefinitionExtractor.prototype.typeNullShadow_ = function() {
  var block1 = this.newNode_('shadow', {type: 'type_null'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_null block.
 */
BlockDefinitionExtractor.prototype.typeNull_ = function() {
  var block1 = this.newNode_('block', {type: 'type_null'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_boolean block.
 */
BlockDefinitionExtractor.prototype.typeBoolean_ = function() {
  var block1 = this.newNode_('block', {type: 'type_boolean'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_number block.
 */
BlockDefinitionExtractor.prototype.typeNumber_ = function() {
  var block1 = this.newNode_('block', {type: 'type_number'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_string block.
 */
BlockDefinitionExtractor.prototype.typeString_ = function() {
  var block1 = this.newNode_('block', {type: 'type_string'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_list block.
 */
BlockDefinitionExtractor.prototype.typeList_ = function() {
  var block1 = this.newNode_('block', {type: 'type_list'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
};

/**
 * Creates a block Element for the type_other block.
 *
 * @param {string} type Name of a custom type.
 */
BlockDefinitionExtractor.prototype.typeOther_ = function(type) {
  var block1 = this.newNode_('block', {type: 'type_other'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'TYPE'}, type));
};

/**
 * Creates a block Element for the color_hue block.
 * @param colour
 * @param hue
 */
BlockDefinitionExtractor.prototype.colourHue_ =
  function(colour, hue)
{
  var block1 = this.newNode_('block', {type: 'colour_hue'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('mutation', {colour:colour.toString()}));
  block1.append(this.newNode_('field', {name: 'HUE'}, hue.toString()));
};

/**
 * Creates a block Element for the text block.
 *
 * @param text
 */
BlockDefinitionExtractor.prototype.text_ = function(text) {
  var block1 = this.newNode_('block', {type: 'text'});
  if (!this.isStatementsContainer_(this.dst.current)) {
    var nextBlock = this.newNode_('next');
    this.dst.current.append(nextBlock);
    this.dst.current = nextBlock;
  }
  this.dst.current.append(block1);
  this.dst.current = block1;
  block1.append(this.newNode_('field', {name: 'TEXT'}, text));
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
    this.chainNodesCB_('types', block.outputConnection),
    this.chainNodesCB_('types', block.previousConnection),
    this.chainNodesCB_('types', block.nextConnection),
    function() {
      this_.colourHue_(block.colour_, colour_hue);
    }.bind(this)
  );
  workspaceXml.append(factoryBaseXml);

  return workspaceXml;
};
