/**
 * Copyright 2017 Juan Carlos Orozco Arena
 * Apache License Version 2.0
 */

/**
 * @fileoverview Block element construction functions.
 * @author JC-Orozco (Juan Carlos Orozco)
 */
'use strict';

/**
 * Namespace for BlockConstructors.
 */
goog.provide('BlockConstructors');

/**
 * Callback to chain node tree.
 * @callback nodeChainCallback
 */

/**
 * Creates a block Element for the factory_base block.
 * @param {string} connections Define block connections. Options: NONE, LEFT,
 *     UP, DOWN, BOTH.
 * @param {string} name Block name.
 * @param {boolean} inline Block layout inline or not.
 * @param {nodeChainCallback} inputsCB
 * @param {nodeChainCallback} tooltipCB
 * @param {nodeChainCallback} helpUrlCB
 * @param {nodeChainCallback} outputTypeCB
 * @param {nodeChainCallback} topTypeCB
 * @param {nodeChainCallback} bottomTypeCB
 * @param {nodeChainCallback} colourCB
 */
BlockConstructors.factoryBase = function(connections, name, inline,
    inputsCB, tooltipCB, helpUrlCB, outputTypeCB, topTypeCB, bottomTypeCB,
    colourCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'factory_base'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {connections: connections}));
  block1.append(FactoryUtils.newNode('field', {name: 'NAME'}, name));
  block1.append(FactoryUtils.newNode('field', {name: 'INLINE'}, inline));
  block1.append(
      FactoryUtils.newNode('field', {name: 'CONNECTIONS'}, connections));
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('statement', {name: 'INPUTS'}));
  inputsCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('value', {name: 'TOOLTIP'}));
  tooltipCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('value', {name: 'HELPURL'}));
  helpUrlCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
  if (connections === 'LEFT') {
    block1.append(
      FactoryUtils.treeSrcDst.dst.current = FactoryUtils.newNode('value', {name: 'OUTPUTTYPE'}));
    outputTypeCB();
    FactoryUtils.treeSrcDst.dst.current = block1;
  } else {
    if (connections === 'UP' || connections === 'BOTH') {
      block1.append(FactoryUtils.treeSrcDst.dst.current =
         FactoryUtils.newNode('value', {name: 'TOPTYPE'}));
      topTypeCB();
      FactoryUtils.treeSrcDst.dst.current = block1;      
    }
    if (connections === 'DOWN' || connections === 'BOTH') {
      block1.append(FactoryUtils.treeSrcDst.dst.current =
          FactoryUtils.newNode('value', {name: 'BOTTOMTYPE'}));
      bottomTypeCB();
      FactoryUtils.treeSrcDst.dst.current = block1;      
    }
  }
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('value', {name: 'COLOUR'}));
  colourCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the input_dummy block.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 */
BlockConstructors.inputDummy = function(align, fieldsCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_dummy'});
  if (!FactoryUtils.isStatementsContainer(
      FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the input_statement block.
 * @param {string} inputName Input statement name.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockConstructors.inputStatement =
    function(inputName, align, fieldsCB, typeCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_statement'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, inputName));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('value', {name: 'TYPE'}));
  typeCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the input_value block.
 * @param {string} inputName Input value name.
 * @param {string} align Can be left, right or centre.
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockConstructors.inputValue = function(inputName, align, fieldsCB, typeCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_value'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, inputName));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.treeSrcDst.dst.current =
      FactoryUtils.newNode('value', {name: 'TYPE'}));
  typeCB();
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the field_static block. 
 * @param {string} text
 */
BlockConstructors.fieldStatic = function(text) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_static'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
};

/**
 * Creates a block Element for the field_input block.
 * @param {string} text
 * @param {string} fieldName
 */
BlockConstructors.fieldInput = function(text, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_input'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_number block.
 * @param {number} value
 * @param {string} fieldName
 * @param {number} min
 * @param {number} max
 * @param {number} precision
 */
BlockConstructors.fieldNumber =
    function(value, fieldName, min, max, precision) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_number'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'VALUE'}, value));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
  block1.append(FactoryUtils.newNode('field', {name: 'MIN'}, min));
  block1.append(FactoryUtils.newNode('field', {name: 'MAX'}, max));
  block1.append(FactoryUtils.newNode('field', {name: 'PRECISION'}, precision));
};

/**
 * Creates a block Element for the field_angle block.
 * @param {number} angle
 * @param {string} fieldName
 */
BlockConstructors.fieldAngle = function(angle, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_angle'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ANGLE'}, angle));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_dropdown block.
 * @param {Array<string>} options List of options for the dropdown field.
 * @param {string} fieldName Name of the field.
 */
BlockConstructors.fieldDropdown = function(options, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_dropdown'});
  var optionsStr = '[';
  
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  var mutation = FactoryUtils.newNode('mutation'); 
  block1.append(mutation);
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
  for (let i=0; i<options.length; i++) {
    let option = options[i];
    if (typeof option[0] === "string") {
      optionsStr+='&quot;text&quot;,'
      block1.append(FactoryUtils.newNode('field', {name: 'USER'+i}, option[0]));
    } else {
      optionsStr+='&quot;image&quot;,';
      block1.append(
          FactoryUtils.newNode('field', {name: 'SRC'+i}, option[0].src));
      block1.append(
          FactoryUtils.newNode('field', {name: 'WIDTH'+i}, option[0].width));
      block1.append(
          FactoryUtils.newNode('field', {name: 'HEIGHT'+i}, option[0].height));
      block1.append(
          FactoryUtils.newNode('field', {name: 'ALT'+i}, option[0].alt));
    }
    block1.append(FactoryUtils.newNode('field', {name: 'CPU'+i}, option[1]));
  }
  optionsStr = optionsStr.slice(0,-1); // Drop last comma 
  optionsStr += ']';
  mutation.setAttribute('options', optionsStr);
};

/**
 * Creates a block Element for the field_checkbox block.
 * @param {string} checked Can be true or false
 * @param {string} fieldName
 */
BlockConstructors.fieldCheckbox = function(checked, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_checkbox'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'CHECKED'}, checked));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_colour block.
 * @param {number} colour
 * @param {string} fieldName
 */
BlockConstructors.fieldColour = function(colour, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_colour'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'COLOUR'}, colour));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_variable block.
 * @param {string} text
 * @param {string} fieldName
 */
BlockConstructors.fieldVariable = function(text, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_variable'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a block Element for the field_image block.
 * @param {string} src Image src URL.
 * @param {number} width
 * @param {number} height
 * @param {string} alt Alterante text to describe image.
 */
BlockConstructors.fieldImage = function(src, width, height, alt) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_image'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'SRC'}, src));
  block1.append(FactoryUtils.newNode('field', {name: 'WIDTH'}, width));
  block1.append(FactoryUtils.newNode('field', {name: 'HEIGHT'}, height));
  block1.append(FactoryUtils.newNode('field', {name: 'ALT'}, alt));
};

/**
 * Creates a block Element for the type_group block.
 * @param {Array<string>} types List of types of this type group.
 */
BlockConstructors.typeGroup = function(types) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_group'});

  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {types:types.length}));
  for (let i=0; i<types.length; i++) {
    let type = types[i];
    let value = FactoryUtils.newNode('value', {name:'TYPE'+i});
    block1.append(value);
    FactoryUtils.treeSrcDst.dst.current = value;
    FactoryUtils.parseType(type);
  }
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a shadow Element for the type_null block.
 */
BlockConstructors.typeNullShadow = function() {
  var block1 = FactoryUtils.newNode('shadow', {type: 'type_null'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_null block.
 */
BlockConstructors.typeNull = function() {
  var block1 = FactoryUtils.newNode('block', {type: 'type_null'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_boolean block.
 */
BlockConstructors.typeBoolean = function() {
  var block1 = FactoryUtils.newNode('block', {type: 'type_boolean'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_number block.
 */
BlockConstructors.typeNumber = function() {
  var block1 = FactoryUtils.newNode('block', {type: 'type_number'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_string block.
 */
BlockConstructors.typeString = function() {
  var block1 = FactoryUtils.newNode('block', {type: 'type_string'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_list block.
 */
BlockConstructors.typeList = function() {
  var block1 = FactoryUtils.newNode('block', {type: 'type_list'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
};

/**
 * Creates a block Element for the type_other block.
 * @param {string} type Name of a custom type.
 */
BlockConstructors.typeOther = function(type) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_other'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TYPE'}, type));
};

/**
 * Creates a block Element for the color_hue block.
 * @param colour
 * @param hue
 */
BlockConstructors.colourHue = function(colour, hue) {
  var block1 = FactoryUtils.newNode('block', {type: 'colour_hue'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {colour:colour.toString()}));
  block1.append(FactoryUtils.newNode('field', {name: 'HUE'}, hue.toString()));
};

/**
 * Creates a block Element for the text block.
 * @param text
 */
BlockConstructors.text = function(text) {
  var block1 = FactoryUtils.newNode('block', {type: 'text'});
  if (!FactoryUtils.isStatementsContainer(FactoryUtils.treeSrcDst.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    FactoryUtils.treeSrcDst.dst.current.append(nextBlock);
    FactoryUtils.treeSrcDst.dst.current = nextBlock;
  }
  FactoryUtils.treeSrcDst.dst.current.append(block1);
  FactoryUtils.treeSrcDst.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
};
