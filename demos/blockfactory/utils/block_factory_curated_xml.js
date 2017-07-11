// Copyright 2017 Juan Carlos Orozco Arena
// Apache License Version 2.0

var xml = `
<xml>
  <block type="factory_base" deletable="false" movable="false" x="0" y="0">
    <mutation connections="NONE"></mutation>
    <field name="NAME">value_input1</field>
    <field name="INLINE">AUTO</field>
    <field name="CONNECTIONS">NONE</field>
    <statement name="INPUTS">
    </statement>
    <value name="TOOLTIP">
      <block type="text" movable="false">
        <field name="TEXT"></field>
      </block>
    </value>
    <value name="HELPURL">
      <block type="text" deletable="false" movable="false">
        <field name="TEXT"></field>
      </block>
    </value>
    <value name="COLOUR">
      <block type="colour_hue">
        <mutation colour="#5b67a5"></mutation>
        <field name="HUE">230</field>
      </block>
    </value>
  </block>

  <block type="input_dummy">
    <field name="ALIGN">LEFT</field>
    <statement name="FIELDS">
      <block type="field_static">
        <field name="TEXT">value input</field>
        <next>
          <block type="field_input">
            <field name="TEXT">NAME</field>
            <field name="FIELDNAME">NAME</field>
          </block>
        </next>
      </block>
    </statement>
  </block>

  <block type="input_statement">
    <field name="INPUTNAME">NAME</field>
    <field name="ALIGN">LEFT</field>
    <statement name="FIELDS">
      <block type="field_static">
        <field name="TEXT">fields</field>
        <next>
          <block type="field_variable">
            <field name="TEXT">item</field>
            <field name="FIELDNAME">NAME</field>
          </block>
        </next>
      </block>
    </statement>
    <value name="TYPE">
      <shadow type="type_null"></shadow>
    </value>
  </block>

  <block type="input_value">
    <field name="INPUTNAME">NAME</field>
    <field name="ALIGN">RIGHT</field>
    <statement name="FIELDS">
      <block type="field_static">
        <field name="TEXT">type</field>
      </block>
    </statement>
    <value name="TYPE">
      <shadow type="type_null"></shadow>
    </value>
  </block>

  <block xmlns="http://www.w3.org/1999/xhtml" type="field_static">
    <field name="TEXT"></field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_input">
    <field name="TEXT">default</field>
    <field name="FIELDNAME">NAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_number">
    <field name="VALUE">0</field>
    <field name="FIELDNAME">NAME</field>
    <field name="MIN">-Infinity</field>
    <field name="MAX">Infinity</field>
    <field name="PRECISION">0</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_angle">
    <field name="ANGLE">90</field>
    <field name="FIELDNAME">NAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_dropdown">
    <mutation options="[&quot;text&quot;,&quot;text&quot;,&quot;text&quot;]"></mutation>
    <field name="FIELDNAME">NAME</field>
    <field name="USER0">option</field>
    <field name="CPU0">OPTIONNAME</field>
    <field name="USER1">option</field>
    <field name="CPU1">OPTIONNAME</field>
    <field name="USER2">option</field>
    <field name="CPU2">OPTIONNAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_checkbox">
    <field name="CHECKED">TRUE</field>
    <field name="FIELDNAME">NAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_colour">
    <field name="COLOUR">#ff0000</field>
    <field name="FIELDNAME">NAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_variable">
    <field name="TEXT">item</field>
    <field name="FIELDNAME">NAME</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="field_image">
    <field name="SRC">https://www.gstatic.com/codesite/ph/images/star_on.gif</field>
    <field name="WIDTH">15</field>
    <field name="HEIGHT">15</field>
    <field name="ALT">*</field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_group">
    <mutation types="2"></mutation>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_null"></block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_boolean"></block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_number"></block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_string"></block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_list"></block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="type_other">
    <field name="TYPE"></field>
  </block>
  <block xmlns="http://www.w3.org/1999/xhtml" type="colour_hue">
    <mutation colour="#000000"></mutation>
    <field name="HUE">0</field>
  </block>

  <block type="text" deletable="false" movable="false">
    <field name="TEXT"></field>
  </block>

</xml>
`

// data = {src: {root:null, current:null}, dst: {root:null, current:null}}
var convertXmlToCode = function(xml){
  var blockType = xml.getAttribute('type');
  var childList = [];
  var parameters = ', ';
  for(let i=0; i<xml.childElementCount; i++){
    let child = xml.children[i];
    let name = '';
    if(child.tagName === 'mutation'){
      let attrs = child.attributes;
      name = attrs[0].name;
    } else {
      name = child.getAttribute('name');
    }
    childList.push([child.tagName, name]);
    parameters += name+', ';
  }
  parameters = parameters.slice(0,-2);
  var code = 'var '+blockType+'_xml = function(data'+parameters+') {\n';
  code += "  var block1 = FactoryUtils.newNode('block', {type: '" + blockType +"'});";
  code += `
  if(!FactoryUtils.firstStatement(data.dst.current)){
    let nextBlock = FactoryUtils.newNode('next');
    data.dst.current.append(nextBlock);
    data.dst.current = nextBlock;
  }
  data.dst.current.append(block1);
  data.dst.current = block1;\n`;
  for(i in childList){
    let child = childList[i];
    switch(child[0]){
      case 'mutation':
        code += "  block1.append(FactoryUtils.newNode('mutation', {"+ child[1] +":"+ child[1] +"}));\n";
        break;
      case 'field':
        code += "  block1.append(FactoryUtils.newNode('field', {name: '"+ child[1] +"'}, "+ child[1] +"));\n";
        break;
      case 'statement':
      case 'value':
        code += "  block1.append(data.dst.current = FactoryUtils.newNode('"+ child[0] +"', {name: '"+ child[1] +"'}));\n";
        code += "  "+ child[1] +"(data);\n"+
                "  data.dst.current = block1;\n";
        break;
    }
  }
  code += '  return 0;\n' + 
          '};\n\n';
  return code;
};

document.addEventListener("DOMContentLoaded", function(event) {
  var code = `
// Do not edit this file!
// Automatically generated using xml to DOM element builder functions tool by Juan Carlos Orozco:
// demos/blockfactoryutils/index.html and copy the console output
// The curated xml at block_factory_curated_xml.js was based on the output of blockfactory Toolbar XML button\n\n`;
  var parser = new DOMParser();
  var xml1 = parser.parseFromString(xml,"text/xml");
  var xml2 = xml1.children[0].children;
  for(let i=0; i<xml2.length; i++){
    code += convertXmlToCode(xml2[i]);
  }
  console.log(code+'//');
});
