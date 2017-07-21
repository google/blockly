/**
 * Copyright 2017 Juan Carlos Orozco Arena
 * Apache License Version 2.0
 */

/**
 * @fileoverview Block element construction functions
 * @author JC-Orozco (Juan Carlos Orozco)
 */
'use strict';

/**
 * Namespace for BlockConstructors
 */
goog.provide('BlockConstructors');

/**
 * @typedef {{root: Element, current: Element}} ElementPointers
 */

/**
 * Callback to chain node three
 * @callback nodeChainCallback
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 */

/**
 * Creates a factory_base Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} connections Define block connections. Options: NONE, LEFT,
 *     UP, DOWN, BOTH
 * @param {string} name Block name
 * @param {boolean} inline Block layout inline or not
 * @param {nodeChainCallback} inputsCB
 * @param {nodeChainCallback} tooltipCB
 * @param {nodeChainCallback} helpUrlCB
 * @param {nodeChainCallback} outputTypeCB
 * @param {nodeChainCallback} topTypeCB
 * @param {nodeChainCallback} bottomTypeCB
 * @param {nodeChainCallback} colourCB
 */
BlockConstructors.factoryBase = function(data, connections, name, inline,
    inputsCB, tooltipCB, helpUrlCB, outputTypeCB, topTypeCB, bottomTypeCB,
    colourCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'factory_base'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {connections: connections}));
  block1.append(FactoryUtils.newNode('field', {name: 'NAME'}, name));
  block1.append(FactoryUtils.newNode('field', {name: 'INLINE'}, inline));
  block1.append(
      FactoryUtils.newNode('field', {name: 'CONNECTIONS'}, connections));
  block1.append(
      data.dst.current = FactoryUtils.newNode('statement', {name: 'INPUTS'}));
  inputsCB(data);
  data.dst.current = block1;
  block1.append(
      data.dst.current = FactoryUtils.newNode('value', {name: 'TOOLTIP'}));
  tooltipCB(data);
  data.dst.current = block1;
  block1.append(
      data.dst.current = FactoryUtils.newNode('value', {name: 'HELPURL'}));
  helpUrlCB(data);
  data.dst.current = block1;
  if (connections === 'LEFT') {
    block1.append(
      data.dst.current = FactoryUtils.newNode('value', {name: 'OUTPUTTYPE'}));
    outputTypeCB(data);
    data.dst.current = block1;
  } else {
    if (connections === 'UP' || connections === 'BOTH') {
      block1.append(
        data.dst.current = FactoryUtils.newNode('value', {name: 'TOPTYPE'}));
      topTypeCB(data);
      data.dst.current = block1;      
    }
    if (connections === 'DOWN' || connections === 'BOTH') {
      block1.append(
        data.dst.current = FactoryUtils.newNode('value', {name: 'BOTTOMTYPE'}));
      bottomTypeCB(data);
      data.dst.current = block1;      
    }
  }
  block1.append(
      data.dst.current = FactoryUtils.newNode('value', {name: 'COLOUR'}));
  colourCB(data);
  data.dst.current = block1;
};

/**
 * Creates a input_dummy Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} align Can be left, right or centre
 * @param {nodeChainCallback} fieldsCB
 */
BlockConstructors.inputDummy = function(data, align, fieldsCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_dummy'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(data.dst.current =
      FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB(data);
  data.dst.current = block1;
};

/**
 * Creates a input_statement Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} inputName Input statement name
 * @param {string} align Can be left, right or centre
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockConstructors.inputStatement =
    function(data, inputName, align, fieldsCB, typeCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_statement'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, inputName));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(
      data.dst.current = FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB(data);
  data.dst.current = block1;
  block1.append(
      data.dst.current = FactoryUtils.newNode('value', {name: 'TYPE'}));
  typeCB(data);
  data.dst.current = block1;
};

/**
 * Creates a input_value Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} inputName Input value name
 * @param {string} align Can be left, right or centre
 * @param {nodeChainCallback} fieldsCB
 * @param {nodeChainCallback} typeCB
 */
BlockConstructors.inputValue =
    function(data, inputName, align, fieldsCB, typeCB) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_value'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, inputName));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, align));
  block1.append(data.dst.current =
      FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  fieldsCB(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'TYPE'}));
  typeCB(data);
  data.dst.current = block1;
};

/**
 * Creates a field_static Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} text
 */
BlockConstructors.fieldStatic = function(data, text) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_static'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
};

/**
 * Creates a field_input Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} text
 * @param {string} fieldName
 */
BlockConstructors.fieldInput = function(data, text, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_input'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a field_number Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {number} value
 * @param {string} fieldName
 * @param {number} min
 * @param {number} max
 * @param {number} precision
 */
BlockConstructors.fieldNumber =
    function(data, value, fieldName, min, max, precision) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_number'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'VALUE'}, value));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
  block1.append(FactoryUtils.newNode('field', {name: 'MIN'}, min));
  block1.append(FactoryUtils.newNode('field', {name: 'MAX'}, max));
  block1.append(FactoryUtils.newNode('field', {name: 'PRECISION'}, precision));
};

/**
 * Creates a field_angle Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {number} angle
 * @param {string} fieldName
 */
BlockConstructors.fieldAngle = function(data, angle, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_angle'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ANGLE'}, angle));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a dropdown field Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {Array<string>} options List of options for the dropdown field.
 * @param {string} fieldName Name of the field.
 */
BlockConstructors.fieldDropdown = function(data, options, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_dropdown'});
  var optionsStr = '[';
  
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
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
 * Creates a field_checkbox Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} checked Can be true or false
 * @param {string} fieldName
 */
BlockConstructors.fieldCheckbox = function(data, checked, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_checkbox'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'CHECKED'}, checked));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a field_colour Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {number} colour
 * @param {string} fieldName
 */
BlockConstructors.fieldColour = function(data, COLOUR, FIELDNAME) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_colour'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'COLOUR'}, colour));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a field_variable Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} text
 * @param {string} fieldName
 */
BlockConstructors.fieldVariable = function(data, text, fieldName) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_variable'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, text));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, fieldName));
};

/**
 * Creates a field_image Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {string} src Image src URL
 * @param {number} width
 * @param {number} height
 * @param {string} alt Alterante text to describe image
 */
BlockConstructors.fieldImage = function(data, src, width, height, alt) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_image'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'SRC'}, src));
  block1.append(FactoryUtils.newNode('field', {name: 'WIDTH'}, width));
  block1.append(FactoryUtils.newNode('field', {name: 'HEIGHT'}, height));
  block1.append(FactoryUtils.newNode('field', {name: 'ALT'}, alt));
};

/**
 * Creates a group type Element
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param {Array<string>} types List of types of this type group.
 */
BlockConstructors.typeGroup = function(data, types) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_group'});

  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {types:types.length}));
  for (let i=0; i<types.length; i++) {
    let type = types[i];
    let value = FactoryUtils.newNode('value', {name:'TYPE'+i});
    block1.append(value);
    data.dst.current = value;
    FactoryUtils.parseType(data, type);
  }
  data.dst.current = block1;
};

/**
 * Creates a type_null shadow Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeNullShadow = function(data) {
  var block1 = FactoryUtils.newNode('shadow', {type: 'type_null'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_null Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeNull = function(data) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_null'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_boolean Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeBoolean = function(data) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_boolean'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_number Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeNumber = function(data) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_number'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_string Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeString = function(data) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_string'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_list Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 */
BlockConstructors.typeList = function(data) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_list'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
};

/**
 * Creates a type_other Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TYPE
 */
BlockConstructors.typeOther = function(data, TYPE) {
  var block1 = FactoryUtils.newNode('block', {type: 'type_other'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TYPE'}, TYPE));
};

/**
 * Creates a colour_hue Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param colour
 * @param HUE
 */
BlockConstructors.colourHue = function(data, colour, HUE) {
  var block1 = FactoryUtils.newNode('block', {type: 'colour_hue'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {colour:colour.toString()}));
  block1.append(FactoryUtils.newNode('field', {name: 'HUE'}, HUE.toString()));
};

/**
 * Creates a text Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TEXT
 */
BlockConstructors.text = function(data, TEXT) {
  var block1 = FactoryUtils.newNode('block', {type: 'text'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, TEXT));
};
