// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2013-2014 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0
/**
 * @license
 * @fileoverview Visual blocks editor for App Inventor
 * Set of drawers for holding factory blocks (blocks that create
 * other blocks when dragged onto the workspace). The set of drawers
 * includes the built-in drawers that we get from the blocks language, as
 * well as a drawer per component instance that was added to this workspace.
 *
 * @author mckinney@mit.edu (Andrew F. McKinney)
 * @author Sharon Perl (sharon@google.com)
 */

'use strict';

goog.provide('Blockly.Drawer');

goog.require('Blockly.Flyout');

// Some block drawers need to be initialized after all the javascript source is loaded because they
// use utility functions that may not yet be defined at the time their source is read in. They
// can do this by adding a field to Blockly.DrawerInit whose value is their initialization function.
// For example, see language/common/math.js.

/**
 * Create the dom for the drawer. Creates a flyout Blockly.Drawer.flyout_,
 * and initializes its dom.
 */
Blockly.Drawer.createDom = function() {
  Blockly.Drawer.flyout_ = new Blockly.Flyout();
  // insert the flyout after the main workspace (except, there's no
  // svg.insertAfter method, so we need to insert before the thing following
  // the main workspace. Neil Fraser says: this is "less hacky than it looks".
  var flyoutGroup = Blockly.Drawer.flyout_.createDom();
  Blockly.svg.insertBefore(flyoutGroup, Blockly.mainWorkspace.svgGroup_.nextSibling);
};

/**
 * Initializes the drawer by initializing the flyout and creating the
 * language tree. Call after calling createDom.
 */
Blockly.Drawer.init = function() {
  Blockly.Drawer.flyout_.init(Blockly.mainWorkspace, true);
  for (var name in Blockly.DrawerInit) {
    Blockly.DrawerInit[name]();
  }

  Blockly.Drawer.languageTree = Blockly.Drawer.buildTree_();
};

/**
 * String to prefix on categories of each potential block in the drawer.
 * Used to prevent collisions with built-in properties like 'toString'.
 * @private
 */
Blockly.Drawer.PREFIX_ = 'cat_';

/**
 * Build the hierarchical tree of block types.
 * Note: taken from Blockly's toolbox.js
 * @return {!Object} Tree object.
 * @private
 */
Blockly.Drawer.buildTree_ = function() {
  var tree = {};
  // Populate the tree structure.
  for (var name in Blockly.Blocks) {
    var block = Blockly.Blocks[name];
    // Blocks without a category are fragments used by the mutator dialog.
    if (block.category) {
      var cat = Blockly.Drawer.PREFIX_ + window.encodeURI(block.category);
      if (cat in tree) {
        tree[cat].push(name);
      } else {
        tree[cat] = [name];
      }
    }
  }
  return tree;
};

/**
 * Show the contents of the built-in drawer named drawerName. drawerName
 * should be one of Blockly.MSG_VARIABLE_CATEGORY,
 * Blockly.MSG_PROCEDURE_CATEGORY, or one of the built-in block categories.
 * @param drawerName
 */
Blockly.Drawer.showBuiltin = function(drawerName) {
  drawerName = Blockly.Drawer.PREFIX_ + drawerName;
  var blockSet = Blockly.Drawer.languageTree[drawerName];
  if(drawerName == "cat_Procedures") {
    var newBlockSet = [];
    for(var i=0;i<blockSet.length;i++) {
      if(!(blockSet[i] == "procedures_callnoreturn" // Include callnoreturn only if at least one defnoreturn declaration
           && JSON.stringify(Blockly.AIProcedure.getProcedureNames(false))
              == JSON.stringify([Blockly.FieldProcedure.defaultValue]))
         &&
         !(blockSet[i] == "procedures_callreturn" // Include callreturn only if at least one defreturn declaration
           && JSON.stringify(Blockly.AIProcedure.getProcedureNames(true))
              == JSON.stringify([Blockly.FieldProcedure.defaultValue]))){
        newBlockSet.push(blockSet[i]);
      }
    }
    blockSet = newBlockSet;
  }

  if (!blockSet) {
    throw "no such drawer: " + drawerName;
  }
  var xmlList = Blockly.Drawer.blockListToXMLArray(blockSet);
  Blockly.Drawer.flyout_.show(xmlList);
};

/**
 * Show the blocks drawer for the component with give instance name. If no
 * such component is found, currently we just log a message to the console
 * and do nothing.
 */
Blockly.Drawer.showComponent = function(instanceName) {
  if (Blockly.ComponentInstances[instanceName]) {
    Blockly.Drawer.flyout_.hide();

    var xmlList = Blockly.Drawer.instanceNameToXMLArray(instanceName);
    Blockly.Drawer.flyout_.show(xmlList);
  } else {
    console.log("Got call to Blockly.Drawer.showComponent(" +  instanceName +
                ") - unknown component name");
  }
};

/**
 * Show the contents of the generic component drawer named drawerName. (This is under the
 * "Any components" section in App Inventor). drawerName should be the name of a component type for
 * which we have at least one component instance in the blocks workspace. If no such component
 * type is found, currently we just log a message to the console and do nothing.
 * @param drawerName
 */
Blockly.Drawer.showGeneric = function(typeName) {
  if (Blockly.ComponentTypes[typeName]) {
    Blockly.Drawer.flyout_.hide();

    var xmlList = Blockly.Drawer.componentTypeToXMLArray(typeName);
    Blockly.Drawer.flyout_.show(xmlList);
  } else {
    console.log("Got call to Blockly.Drawer.showGeneric(" +  typeName +
                ") - unknown component type name");
  }
};

/**
 * Hide the Drawer flyout
 */
Blockly.Drawer.hide = function() {
  Blockly.Drawer.flyout_.hide();
};

/**
 * @returns  true if the Drawer flyout is currently open, false otherwise.
 */
Blockly.Drawer.isShowing = function() {
  return Blockly.Drawer.flyout_.isVisible();
};

Blockly.Drawer.blockListToXMLArray = function(blockList) {
  var xmlArray = [];
  for(var i=0;i<blockList.length;i++) {
    xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray(blockList[i],null));
  }
  return xmlArray;
};

Blockly.Drawer.instanceNameToXMLArray = function(instanceName) {
  var xmlArray = [];
  var typeName = Blockly.Component.instanceNameToTypeName(instanceName);
  var mutatorAttributes;

  //create event blocks
  var eventObjects = Blockly.ComponentTypes[typeName].componentInfo.events;
  for(var i=0;i<eventObjects.length;i++) {
    if (eventObjects[i].deprecated === "true") continue;
    mutatorAttributes = {component_type: typeName, instance_name: instanceName, event_name : eventObjects[i].name};
    xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_event",mutatorAttributes));
  }
  //create non-generic method blocks
  var methodObjects = Blockly.ComponentTypes[typeName].componentInfo.methods;
  for(var i=0;i<methodObjects.length;i++) {
    if (methodObjects[i].deprecated === "true") continue;
    mutatorAttributes = {component_type: typeName, instance_name: instanceName, method_name: methodObjects[i].name, is_generic:"false"};
    xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_method",mutatorAttributes));
  }

  //for each property
  var propertyObjects = Blockly.ComponentTypes[typeName].componentInfo.blockProperties;
  for(var i=0;i<propertyObjects.length;i++) {
    //create non-generic get block
    if(propertyObjects[i].rw == "read-write" || propertyObjects[i].rw == "read-only") {
      mutatorAttributes = {set_or_get:"get", component_type: typeName, instance_name: instanceName, property_name: propertyObjects[i].name, is_generic: "false"};
      xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_set_get",mutatorAttributes));
    }
    //create non-generic set block
    if(propertyObjects[i].rw == "read-write" || propertyObjects[i].rw == "write-only") {
      mutatorAttributes = {set_or_get:"set", component_type: typeName, instance_name: instanceName, property_name: propertyObjects[i].name, is_generic: "false"};
      xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_set_get",mutatorAttributes));
    }
  }

  //create component literal block
  mutatorAttributes = {component_type: typeName, instance_name: instanceName};
  xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_component_block",mutatorAttributes));

  return xmlArray;
};

Blockly.Drawer.componentTypeToXMLArray = function(typeName) {
  var xmlArray = [];
  var mutatorAttributes;

  //create generic method blocks
  var methodObjects = Blockly.ComponentTypes[typeName].componentInfo.methods;
  for(var i=0;i<methodObjects.length;i++) {
    mutatorAttributes = {component_type: typeName, method_name: methodObjects[i].name, is_generic:"true"};
    xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_method",mutatorAttributes));
  }

  //for each property
  var propertyObjects = Blockly.ComponentTypes[typeName].componentInfo.blockProperties;
  for(var i=0;i<propertyObjects.length;i++) {
    //create generic get block
    if(propertyObjects[i].rw == "read-write" || propertyObjects[i].rw == "read-only") {
      mutatorAttributes = {set_or_get: "get", component_type: typeName, property_name: propertyObjects[i].name, is_generic: "true"};
      xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_set_get",mutatorAttributes));
    }
    //create generic set block
    if(propertyObjects[i].rw == "read-write" || propertyObjects[i].rw == "write-only") {
      mutatorAttributes = {set_or_get: "set", component_type: typeName, property_name: propertyObjects[i].name, is_generic: "true"};
      xmlArray = xmlArray.concat(Blockly.Drawer.blockTypeToXMLArray("component_set_get",mutatorAttributes));
    }
  }
  return xmlArray;
};

Blockly.Drawer.blockTypeToXMLArray = function(blockType,mutatorAttributes) {
  var xmlString = Blockly.Drawer.getDefaultXMLString(blockType,mutatorAttributes);
  if(xmlString == null) {
    // [lyn, 10/23/13] Handle procedure calls in drawers specially
    if (blockType == 'procedures_callnoreturn' || blockType == 'procedures_callreturn') {
      xmlString = Blockly.Drawer.procedureCallersXMLString(blockType == 'procedures_callreturn');
    } else {
      xmlString = '<xml><block type="' + blockType + '">';
      if(mutatorAttributes) {
        xmlString += Blockly.Drawer.mutatorAttributesToXMLString(mutatorAttributes);
      }
      xmlString += '</block></xml>';
    }
  }
  var xmlBlockArray = [];
  var xmlFromString = Blockly.Xml.textToDom(xmlString);
  // [lyn, 11/10/13] Use goog.dom.getChildren rather than .children or .childNodes
  //   to make this code work across browsers.
  var children = goog.dom.getChildren(xmlFromString);
  for(var i=0;i<children.length;i++) {
    xmlBlockArray.push(children[i]);
  }
  return xmlBlockArray;
}

Blockly.Drawer.mutatorAttributesToXMLString = function(mutatorAttributes){
  var xmlString = '<mutation ';
  for(var attributeName in mutatorAttributes) {
    xmlString += attributeName + '="' + mutatorAttributes[attributeName] + '" ';
  }
  xmlString += '></mutation>';
  return xmlString;
}

// [lyn, 10/22/13] return an XML string including one procedure caller for each procedure declaration
// in main workspace.
Blockly.Drawer.procedureCallersXMLString = function(returnsValue) {
  var xmlString = '<xml>'  // Used to accumulate xml for each caller
  var decls = Blockly.AIProcedure.getProcedureDeclarationBlocks(returnsValue);
  decls.sort(Blockly.Drawer.compareDeclarationsByName); // sort decls lexicographically by procedure name
  for (var i = 0; i < decls.length; i++) {
    xmlString += Blockly.Drawer.procedureCallerBlockString(decls[i]);
  }
  xmlString += '</xml>';
  return xmlString;
}

Blockly.Drawer.compareDeclarationsByName = function (decl1, decl2) {
  var name1 = decl1.getFieldValue('NAME').toLocaleLowerCase();
  var name2 = decl2.getFieldValue('NAME').toLocaleLowerCase();
  return name1.localeCompare(name2);
}

// [lyn, 10/22/13] return an XML string for a caller block for the give procedure declaration block
// Here's an example:
//   <block type="procedures_callnoreturn" inline="false">
//     <title name="PROCNAME">p2</title>
//     <mutation name="p2">
//       <arg name="b"></arg>
//       <arg name="c"></arg>
//    </mutation>
//  </block>
Blockly.Drawer.procedureCallerBlockString = function(procDeclBlock) {
  var declType = procDeclBlock.type;
  var callerType = (declType == 'procedures_defreturn') ? 'procedures_callreturn' : 'procedures_callnoreturn';
  var blockString = '<block type="' + callerType + '" inline="false">'
  var procName = procDeclBlock.getFieldValue('NAME');
  blockString += '<title name="PROCNAME">' + procName + '</title>';
  var mutationDom = procDeclBlock.mutationToDom();
  mutationDom.setAttribute('name', procName); // Decl doesn't have name attribute, but caller does
  var mutationXmlString = Blockly.Xml.domToText(mutationDom);
  blockString += mutationXmlString;
  blockString += '</block>';
  return blockString;
}

/**
 * Given the blockType and a dictionary of the mutator attributes
 * either return the xml string associated with the default block
 * or return null, since there are no default blocks associated with the blockType.
 */
Blockly.Drawer.getDefaultXMLString = function(blockType,mutatorAttributes) {
  //return null if the
  if(Blockly.Drawer.defaultBlockXMLStrings[blockType] == null) {
    return null;
  }

  if(Blockly.Drawer.defaultBlockXMLStrings[blockType].xmlString != null) {
    //return xml string associated with block type
    return Blockly.Drawer.defaultBlockXMLStrings[blockType].xmlString;
  } else if(Blockly.Drawer.defaultBlockXMLStrings[blockType].length != null){
    var possibleMutatorDefaults = Blockly.Drawer.defaultBlockXMLStrings[blockType];
    var matchingAttributes;
    var allMatch;
    //go through each of the possible matching cases
    for(var i=0;i<possibleMutatorDefaults.length;i++) {
      matchingAttributes = possibleMutatorDefaults[i].matchingMutatorAttributes;
      //if the object doesn't have a matchingAttributes object, then skip it
      if(!matchingAttributes) {
        continue;
      }
      //go through each of the mutator attributes.
      //if one attribute does not match then move to the next possibility
      allMatch = true;
      for(var mutatorAttribute in matchingAttributes) {
        if(mutatorAttributes[mutatorAttribute] != matchingAttributes[mutatorAttribute]){
          allMatch = false
          break;
        }
      }
      //if all of the attributes matched, return the xml string given the appropriate mutator
      if(allMatch) {
        return possibleMutatorDefaults[i].mutatorXMLStringFunction(mutatorAttributes);
      }
    }
    //if the mutator attributes did not match for all of the possibilities, return null
    return null;
  }

}

Blockly.Drawer.defaultBlockXMLStrings = {
  controls_forRange: {xmlString:
  '<xml>' +
    '<block type="controls_forRange">' +
      '<value name="START"><block type="math_number"><title name="NUM">1</title></block></value>' +
      '<value name="END"><block type="math_number"><title name="NUM">5</title></block></value>' +
      '<value name="STEP"><block type="math_number"><title name="NUM">1</title></block></value>' +
    '</block>' +
  '</xml>' },

   math_random_int: {xmlString:
  '<xml>' +
    '<block type="math_random_int">' +
    '<value name="FROM"><block type="math_number"><title name="NUM">1</title></block></value>' +
    '<value name="TO"><block type="math_number"><title name="NUM">100</title></block></value>' +
    '</block>' +
  '</xml>'},
  color_make_color: {xmlString:
  '<xml>' +
    '<block type="color_make_color">' +
      '<value name="COLORLIST">' +
        '<block type="lists_create_with" inline="false">' +
          '<mutation items="3"></mutation>' +
          '<value name="ADD0"><block type="math_number"><title name="NUM">255</title></block></value>' +
          '<value name="ADD1"><block type="math_number"><title name="NUM">0</title></block></value>' +
          '<value name="ADD2"><block type="math_number"><title name="NUM">0</title></block></value>' +
        '</block>' +
      '</value>' +
    '</block>' +
  '</xml>'},
  lists_create_with: {xmlString:
  '<xml>' +
    '<block type="lists_create_with">' +
      '<mutation items="0"></mutation>' +
    '</block>' +
    '<block type="lists_create_with">' +
      '<mutation items="2"></mutation>' +
    '</block>' +
  '</xml>'},
   lists_lookup_in_pairs: {xmlString:
  '<xml>' +
    '<block type="lists_lookup_in_pairs">' +
    '<value name="NOTFOUND"><block type="text"><title name="TEXT">not found</title></block></value>' +
    '</block>' +
  '</xml>'},

  component_method: [
    {matchingMutatorAttributes:{component_type:"TinyDB", method_name:"GetValue"},
     mutatorXMLStringFunction: function(mutatorAttributes) {
       return '' +
         '<xml>' +
         '<block type="component_method">' +
         //mutator generator
         Blockly.Drawer.mutatorAttributesToXMLString(mutatorAttributes) +
         '<value name="ARG1"><block type="text"><title name="TEXT"></title></block></value>' +
         '</block>' +
         '</xml>';}},

    // Notifer.ShowTextDialog has cancelable default to TRUE
    {matchingMutatorAttributes:{component_type:"Notifier", method_name:"ShowTextDialog"},
     mutatorXMLStringFunction: function(mutatorAttributes) {
       return '' +
         '<xml>' +
         '<block type="component_method">' +
         //mutator generator
         Blockly.Drawer.mutatorAttributesToXMLString(mutatorAttributes) +
         '<value name="ARG2"><block type="logic_boolean"><title name="BOOL">TRUE</title></block></value>' +
         '</block>' +
         '</xml>';}},

    // Notifer.ShowChooseDialog has cancelable default to TRUE
    {matchingMutatorAttributes:{component_type:"Notifier", method_name:"ShowChooseDialog"},
     mutatorXMLStringFunction: function(mutatorAttributes) {
       return '' +
         '<xml>' +
         '<block type="component_method">' +
         //mutator generator
         Blockly.Drawer.mutatorAttributesToXMLString(mutatorAttributes) +
         '<value name="ARG4"><block type="logic_boolean"><title name="BOOL">TRUE</title></block></value>' +
         '</block>' +
         '</xml>';}},

    // Canvas.DrawCircle has fill default to TRUE
    {matchingMutatorAttributes:{component_type:"Canvas", method_name:"DrawCircle"},
     mutatorXMLStringFunction: function(mutatorAttributes) {
       return '' +
         '<xml>' +
         '<block type="component_method">' +
         //mutator generator
         Blockly.Drawer.mutatorAttributesToXMLString(mutatorAttributes) +
         '<value name="ARG3"><block type="logic_boolean"><title name="BOOL">TRUE</title></block></value>' +
         '</block>' +
         '</xml>';}}
  ]
};
