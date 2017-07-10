// Copyright 2017 Juan Carlos Orozco Arena
// Apache License Version 2.0

BlockFactory.manualEdit = function(){
  BlockFactory.updateBlocksFlag = true; // Avoid infinite update loop
  BlockFactory.updateBlocksFlag2 = true;
  BlockFactory.updateLanguage();
}

var newNode = function(name, attrs, text){
  var block1;
  if(name === 'block'){
    block1 = goog.dom.createDom('block');
  } else {
    block1 = goog.dom.createDom(name);      
  }
  for(var key in attrs){
    block1.setAttribute(key, attrs[key]);
  }
  if(text) block1.append(text);
  return block1;
};

var firstStatement = function(block){
  return (block.tagName === 'STATEMENT' || block.tagName === 'XML' || block.tagName === 'VALUE');
};

// Manually edited function since the block mutated fields can not be detected by the generator. 
var field_dropdown_xml2 = function(data, options, FIELDNAME) {
  var block1 = newNode('block', {type: 'field_dropdown'});
  var OPTIONS = '[';
  
  if(!firstStatement(data.dst.current)){
    let nextBlock = newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  var mutation = newNode('mutation'); 
  block1.append(mutation);
  block1.append(newNode('field', {name: 'FIELDNAME'}, FIELDNAME));
  for(let i=0; i<options.length; i++){
    let option = options[i];
    if(typeof option[0] === "string"){
      OPTIONS+='&quot;text&quot;,'
      block1.append(newNode('field', {name: 'USER'+i}, option[0]));
    } else {
      OPTIONS+='&quot;image&quot;,';
      block1.append(newNode('field', {name: 'SRC'+i}, option[0].src));
      block1.append(newNode('field', {name: 'WIDTH'+i}, option[0].width));
      block1.append(newNode('field', {name: 'HEIGHT'+i}, option[0].height));
      block1.append(newNode('field', {name: 'ALT'+i}, option[0].alt));
    }
    block1.append(newNode('field', {name: 'CPU'+i}, option[1]));
  }
  OPTIONS = OPTIONS.slice(0,-1); // Drop last comma 
  OPTIONS += ']';
  mutation.setAttribute('options', OPTIONS);
  return 0;
};

// Manually edited function since the block mutated fields can not be detected by the generator. 
var type_group_xml2 = function(data, types) {
  var block1 = newNode('block', {type: 'type_group'});

  if(!firstStatement(data.dst.current)){
    let nextBlock = newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;
  block1.append(newNode('mutation', {types:types.length}));
  for(let i=0; i<types.length; i++){
    let type = types[i];
    let value = newNode('value', {name:'TYPE'+i});
    block1.append(value);
    data.dst.current = value;
    parseType(data, type);
  }
  data.dst.current = block1;  
  return 0;
};

var parseType = function(data, type){
  switch(type){
    case "Null":
      type_null_xml(data);
      break;
    case "Boolean":
      type_boolean_xml(data);
      break;
    case "Number":
      type_number_xml(data);
      break;
    case "String":
      type_string_xml(data);
      break;
    case "Array":
      type_list_xml(data);
      break;
    default:
      type_other_xml(data, type);
      break;
  }
};

var parseTypes = function(data){
  let curr = data.src.current;
  if(curr.check_){
    if(curr.check_.length === 1){
      parseType(data, curr.check_[0]);
    } else if(curr.check_.length > 1 ) {
      type_group_xml2(data, curr.check_);
    }
  }
};

var parseFields = function(data){
  for(let i=0; i<data.src.current.length; i++){
    let field = data.src.current[i];
    if(field instanceof Blockly.FieldLabel){
      field_static_xml(data, field.text_);
    } else if(field instanceof Blockly.FieldTextInput){
      field_input_xml(data, field.text_, field.name);
    } else if(field instanceof Blockly.FieldNumber){
      field_number_xml(data, field.text_, field.name, field.min_, field.max_, field.presicion_);
    } else if(field instanceof Blockly.FieldAngle){
      field_angle_xml(data, field.text_, field.name);
    } else if(field instanceof Blockly.FieldDropdown){
      field_dropdown_xml2(data, field.menuGenerator_, field.name);
    } else if(field instanceof Blockly.FieldCheckbox){
      field_checkbox_xml(data, field.state_ , field.name);
    } else if(field instanceof Blockly.FieldColour){
      field_colour_xml(data, field.colour_ , field.name);
    } else if(field instanceof Blockly.FieldVariable){
      field_variable_xml(data, field.text_, field.name);
    } else if(field instanceof Blockly.FieldImage){
      field_image_xml(data, field.src_, field.width_, field.height_, field.text_);
    }
  }
};

var parseInputs = function(data){
  for(let i=0; i<data.src.current.length; i++){
    let input = data.src.current[i];
    let align = 'LEFT'; // This seems to be the default Blockly.ALIGN_LEFT
    if(input.align || input.align === 0){
      if(input.align === Blockly.ALIGN_CENTRE){
        align = 'CENTRE';
      } else if(input.align === Blockly.ALIGN_RIGHT){
        align = 'RIGHT';
      }
    }
    switch(input.type){
      case Blockly.INPUT_VALUE:
        input_value_xml(data,
          input.name, // NAME
          align,
          function(data){ 
            let src = data.src.current;
            data.src.current = input.fieldRow;
            parseFields(data);
            data.src.current = src;
          }, // FIELDS
          function(data){
            let src = data.src.current;
            data.src.current = input.connection;
            parseTypes(data);
            data.src.current = src;
          }); // TYPE
        break;
      case Blockly.NEXT_STATEMENT:
        input_statement_xml(data,
          input.name, // NAME
          align,
          function(data){ 
            let src = data.src.current;
            data.src.current = input.fieldRow;
            parseFields(data);
            data.src.current = src;
          }, // FIELDS
          function(data){
            let src = data.src.current;
            data.src.current = input.connection;
            parseTypes(data);
            data.src.current = src;
          }); // TYPE
        break;
      case Blockly.DUMMY_INPUT:
        input_dummy_xml(data,
          align,
          function(data){ 
            let src = data.src.current;
            data.src.current = input.fieldRow;
            parseFields(data);
            data.src.current = src;
          }); // FIELDS
        break;
    }
  }
};

var buildBlockFactoryDef = function(block){
  var data = {src: {root: block, current: block},
              dst: {}};
  data.dst.root = newNode('xml');
  data.dst.current = data.dst.root;

  let colour_hue = Math.floor(goog.color.hexToHsv(data.src.current.colour_)[0]); // Convert to hue value 0-360 degrees
  let inline = 'AUTO'; // When block.inputsInlineDefault === undefined
  if(block.inputsInlineDefault === true){
    inline = 'INT';
  } else if(block.inputsInlineDefault === false){
    inline = 'EXT';
  }   
  let connections = 'NONE';
  if(block.outputConnection){
    connections = 'LEFT';
  } else {
    if(block.prevConnection && block.nextConnection){
      connections = 'BOTH';
    } else {
      if(block.prevConnection){
        connections = 'TOP';
      }
      if(block.nextConnection){
        connections = 'BOTTOM';
      }
    }
  }
  factory_base_xml(data, connections,
    block.type, //NAME
    inline, //INLINE
    connections, //CONNECTIONS
    function(data){
      let src = data.src.current;
      data.src.current = data.src.current.inputList;
      parseInputs(data);
      data.src.current = src;
    }, //INPUTS
    function(data){text_xml(data, data.src.current.tooltip);}, //TOOLTIP
    function(data){text_xml(data, data.src.current.helpUrl);}, //HELPURL
    function(data){colour_hue_xml(data, data.src.current.colour_, colour_hue);})
  console.log(data.dst.root);
  return data.dst.root;
};
