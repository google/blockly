/**
 * Do not edit this file!
 * Automatically generated using xml to DOM element builder functions tool:
 * demos/blockfactoryutils/block_functions_generator.html and copy the console output
 *
 * Copyright 2017 Juan Carlos Orozco Arena
 * Apache License Version 2.0
 */

/**
 * @fileoverview Block element construction functions auto generated using block_functions_generator.html
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
 * Creates a factory_base Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param connections
 * @param NAME
 * @param INLINE
 * @param CONNECTIONS
 * @param INPUTS
 * @param TOOLTIP
 * @param HELPURL
 * @param COLOUR
 * @return {number} Returns 0 
 */
BlockConstructors.factoryBase = function(data, connections, NAME, INLINE, CONNECTIONS, INPUTS, TOOLTIP, HELPURL, COLOUR) {
  var block1 = FactoryUtils.newNode('block', {type: 'factory_base'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {connections: connections.toString()}));
  block1.append(FactoryUtils.newNode('field', {name: 'NAME'}, NAME));
  block1.append(FactoryUtils.newNode('field', {name: 'INLINE'}, INLINE));
  block1.append(FactoryUtils.newNode('field', {name: 'CONNECTIONS'}, CONNECTIONS));
  block1.append(data.dst.current = FactoryUtils.newNode('statement', {name: 'INPUTS'}));
  INPUTS(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'TOOLTIP'}));
  TOOLTIP(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'HELPURL'}));
  HELPURL(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'COLOUR'}));
  COLOUR(data);
  data.dst.current = block1;
  return 0;
};

/**
 * Creates a input_dummy Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param ALIGN
 * @param FIELDS
 * @return {number} Returns 0 
 */
BlockConstructors.inputDummy = function(data, ALIGN, FIELDS) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_dummy'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, ALIGN));
  block1.append(data.dst.current = FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  FIELDS(data);
  data.dst.current = block1;
  return 0;
};

/**
 * Creates a input_statement Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param INPUTNAME
 * @param ALIGN
 * @param FIELDS
 * @param TYPE
 * @return {number} Returns 0 
 */
BlockConstructors.inputStatement = function(data, INPUTNAME, ALIGN, FIELDS, TYPE) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_statement'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, INPUTNAME));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, ALIGN));
  block1.append(data.dst.current = FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  FIELDS(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'TYPE'}));
  TYPE(data);
  data.dst.current = block1;
  return 0;
};

/**
 * Creates a input_value Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param INPUTNAME
 * @param ALIGN
 * @param FIELDS
 * @param TYPE
 * @return {number} Returns 0 
 */
BlockConstructors.inputValue = function(data, INPUTNAME, ALIGN, FIELDS, TYPE) {
  var block1 = FactoryUtils.newNode('block', {type: 'input_value'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'INPUTNAME'}, INPUTNAME));
  block1.append(FactoryUtils.newNode('field', {name: 'ALIGN'}, ALIGN));
  block1.append(data.dst.current = FactoryUtils.newNode('statement', {name: 'FIELDS'}));
  FIELDS(data);
  data.dst.current = block1;
  block1.append(data.dst.current = FactoryUtils.newNode('value', {name: 'TYPE'}));
  TYPE(data);
  data.dst.current = block1;
  return 0;
};

/**
 * Creates a field_static Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TEXT
 * @return {number} Returns 0 
 */
BlockConstructors.fieldStatic = function(data, TEXT) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_static'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, TEXT));
  return 0;
};

/**
 * Creates a field_input Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TEXT
 * @param FIELDNAME
 * @return {number} Returns 0 
 */
BlockConstructors.fieldInput = function(data, TEXT, FIELDNAME) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_input'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, TEXT));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  return 0;
};

/**
 * Creates a field_number Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param VALUE
 * @param FIELDNAME
 * @param MIN
 * @param MAX
 * @param PRECISION
 * @return {number} Returns 0 
 */
BlockConstructors.fieldNumber = function(data, VALUE, FIELDNAME, MIN, MAX, PRECISION) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_number'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'VALUE'}, VALUE));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  block1.append(FactoryUtils.newNode('field', {name: 'MIN'}, MIN));
  block1.append(FactoryUtils.newNode('field', {name: 'MAX'}, MAX));
  block1.append(FactoryUtils.newNode('field', {name: 'PRECISION'}, PRECISION));
  return 0;
};

/**
 * Creates a field_angle Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param ANGLE
 * @param FIELDNAME
 * @return {number} Returns 0 
 */
BlockConstructors.fieldAngle = function(data, ANGLE, FIELDNAME) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_angle'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'ANGLE'}, ANGLE));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  return 0;
};

/**
 * Creates a field_dropdown Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param options
 * @param FIELDNAME
 * @param USER0
 * @param CPU0
 * @param USER1
 * @param CPU1
 * @param USER2
 * @param CPU2
 * @return {number} Returns 0 
 */
BlockConstructors.fielDropdown = function(data, options, FIELDNAME, USER0, CPU0, USER1, CPU1, USER2, CPU2) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_dropdown'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('mutation', {options:options}));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  block1.append(FactoryUtils.newNode('field', {name: 'USER0'}, USER0));
  block1.append(FactoryUtils.newNode('field', {name: 'CPU0'}, CPU0));
  block1.append(FactoryUtils.newNode('field', {name: 'USER1'}, USER1));
  block1.append(FactoryUtils.newNode('field', {name: 'CPU1'}, CPU1));
  block1.append(FactoryUtils.newNode('field', {name: 'USER2'}, USER2));
  block1.append(FactoryUtils.newNode('field', {name: 'CPU2'}, CPU2));
  return 0;
};

/**
 * Creates a field_checkbox Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param CHECKED
 * @param FIELDNAME
 * @return {number} Returns 0 
 */
BlockConstructors.fieldCheckbox = function(data, CHECKED, FIELDNAME) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_checkbox'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'CHECKED'}, CHECKED));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  return 0;
};

/**
 * Creates a field_colour Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param COLOUR
 * @param FIELDNAME
 * @return {number} Returns 0 
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
  block1.append(FactoryUtils.newNode('field', {name: 'COLOUR'}, COLOUR));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  return 0;
};

/**
 * Creates a field_variable Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TEXT
 * @param FIELDNAME
 * @return {number} Returns 0 
 */
BlockConstructors.fieldVariable = function(data, TEXT, FIELDNAME) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_variable'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'TEXT'}, TEXT));
  block1.append(FactoryUtils.newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  return 0;
};

/**
 * Creates a field_image Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param SRC
 * @param WIDTH
 * @param HEIGHT
 * @param ALT
 * @return {number} Returns 0 
 */
BlockConstructors.fieldImage = function(data, SRC, WIDTH, HEIGHT, ALT) {
  var block1 = FactoryUtils.newNode('block', {type: 'field_image'});
  if (!FactoryUtils.firstStatement(data.dst.current)) {
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(FactoryUtils.newNode('field', {name: 'SRC'}, SRC));
  block1.append(FactoryUtils.newNode('field', {name: 'WIDTH'}, WIDTH));
  block1.append(FactoryUtils.newNode('field', {name: 'HEIGHT'}, HEIGHT));
  block1.append(FactoryUtils.newNode('field', {name: 'ALT'}, ALT));
  return 0;
};

/**
 * Creates a type_group Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param types
 * @return {number} Returns 0 
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
  block1.append(FactoryUtils.newNode('mutation', {types:types}));
  return 0;
};

/**
 * Creates a type_null Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a type_boolean Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a type_number Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a type_string Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a type_list Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a type_other Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TYPE
 * @return {number} Returns 0 
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
  return 0;
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
 * @return {number} Returns 0 
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
  return 0;
};

/**
 * Creates a text Element
 * This is an automaticaly generated function
 * The first parameter is data plus an autogenerated parameter list
 * @param {{src: ElementPointers, dst: ElementPointers}} data Data structure
 *     that stores source and destination nodes with their corresponding current
 *     nodes.
 * @param TEXT
 * @return {number} Returns 0 
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
  return 0;
};

//  block_factory_curated_xml.js:259:3
