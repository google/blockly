/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JSON reader and writer - Modified from XML reader/writer
 * @author primary.edw@gmail.com (Andrew Mee)
 */
'use strict';

goog.provide('Blockly.JSON');

/**
 * Field labels in JSON output
 */
Blockly.JSON.fieldLabels = {
	positionX:'x'
	,positionY:'y'
	,type:'type'
	,xmlMutation:'xmlMutation'
	,jsonMutation:'mutation'
	,title:'title'
	,titleValue:'value'
	,titleName:'name'
	,comment:'comment'
	,commentText:'text'
	,commentPinned:'pinned'
	,commentHeight:'h'
	,commentWidth:'w'
	,inputList:'inputList'
	,inputName:'name'
	,inputType:'type'
	,inputInline:'inline'
	,inputCollapsed:'collapsed'
	,inputDisabled:'disabled'
	,inputDeletable:'deleteable'
	,inputMovable:'movable'
	,inputEditable:'editable'
	,childBlocks:'childBlocks'
	,nextBlock:'next'
	
}
/**
 * Encode a block tree as JSON.
 * @param {!Object} workspace The SVG workspace.
 * @return {!Element} JSON document.
 */
Blockly.JSON.workspaceToObject = function(workspace) {
  var width = Blockly.svgSize().width;
  var blocks = workspace.getTopBlocks(true);
  var JSON = [];
  for (var i = 0, block; block = blocks[i]; i++) {
    var element = Blockly.JSON.blockToObject_(block);
	if(!element) continue;
    var xy = block.getRelativeToSurfaceXY();
    element[Blockly.JSON.fieldLabels.positionX]= Blockly.RTL ? width - xy.x : xy.x;
    element[Blockly.JSON.fieldLabels.positionY]= xy.y;
    JSON.push(element);
  }
  return JSON;
};

/**
 * Encode a block subtree as JSON.
 * @param {!Blockly.Block} block The root block to encode.
 * @return {!Element} Tree of JSON elements.
 * @private
 */
Blockly.JSON.blockToObject_ = function(block) {
  var element = {};
  element[Blockly.JSON.fieldLabels.type]= block.type;
  if (block.mutationToObject) {
	var mutation = block.mutationToObject();
    if (mutation) {
      element[Blockly.JSON.fieldLabels.jsonMutation]=mutation;
    }
  }else  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom();
    if (mutation) {
      element[Blockly.JSON.fieldLabels.xmlMutation]=mutation.outerHTML;
    }
  }
  
  function titleToObject(title) {
	element[Blockly.JSON.fieldLabels.title] = element[Blockly.JSON.fieldLabels.title] ||[]; //maybe multiple???
    if (title.name && title.EDITABLE) {
		var newTitleData = {};
		newTitleData[Blockly.JSON.fieldLabels.titleValue] = title.getValue();
		newTitleData[Blockly.JSON.fieldLabels.titleName] = title.name;
		element[Blockly.JSON.fieldLabels.title].push(newTitleData);
    }
  }
  
  for (var x = 0, input; input = block.inputList[x]; x++) {
    for (var y = 0, title; title = input.fieldRow[y]; y++) {
      titleToObject(title);
    }
  }
  
  if(element[Blockly.JSON.fieldLabels.title] && !element[Blockly.JSON.fieldLabels.title].length){
	  delete element[Blockly.JSON.fieldLabels.title];
  }

  if (block.comment) {
	var hw = block.comment.getBubbleSize();
	var newComment = {};
    newComment[Blockly.JSON.fieldLabels.commentText] = block.comment.getText();
    newComment[Blockly.JSON.fieldLabels.commentPinned] = block.comment.isVisible();
    newComment[Blockly.JSON.fieldLabels.commentHeight] = hw.height;
    newComment[Blockly.JSON.fieldLabels.commentWidth] = hw.width;
    
    element[Blockly.JSON.fieldLabels.comment] = newComment;
  }

  var hasValues = false;
  for (var i = 0, input; input = block.inputList[i]; i++) {
	if (input.type == Blockly.DUMMY_INPUT) {
      continue;
    }
    var container = {};
    container[Blockly.JSON.fieldLabels.inputName] = input.name;
    
    var empty = true;
     
	var childBlock = input.connection.targetBlock();
	if (input.type == Blockly.INPUT_VALUE) {
	  container[Blockly.JSON.fieldLabels.inputType]='value';
	  hasValues = true;
	} else if (input.type == Blockly.NEXT_STATEMENT) {
	  container[Blockly.JSON.fieldLabels.inputType]='statement';
	}
	if (childBlock) {
	  container[Blockly.JSON.fieldLabels.childBlocks] = Blockly.JSON.blockToObject_(childBlock);
	  empty = false;
	}
    
   
    if (!empty) {
	  element[Blockly.JSON.fieldLabels.inputList] = element[Blockly.JSON.fieldLabels.inputList] || [];
      element[Blockly.JSON.fieldLabels.inputList].push(container);
    }
  }
  
  if (hasValues) {
    element[Blockly.JSON.fieldLabels.inputInline]= block.inputsInline;
  }
  if (block.isCollapsed()) {
    element[Blockly.JSON.fieldLabels.inputCollapsed]= true;
  }
  if (block.disabled) {
    element[Blockly.JSON.fieldLabels.inputDisabled]= true;
  }
  if (!block.isDeletable()) {
    element[Blockly.JSON.fieldLabels.inputDeletable]= false;
  }
  if (!block.isMovable()) {
    element[Blockly.JSON.fieldLabels.inputMovable] = false;
  }
  if (!block.isEditable()) {
    element[Blockly.JSON.fieldLabels.inputEditable]= false;
  }
  try{
	block.render();
  }catch (e) {
	 return; 
  }
  if (block.nextConnection) {
    var nextBlock = block.nextConnection.targetBlock();
    if (nextBlock) {
	  element[Blockly.JSON.fieldLabels.nextBlock] = element[Blockly.JSON.fieldLabels.nextBlock] || [];
      var container =Blockly.JSON.blockToObject_(nextBlock);
      element[Blockly.JSON.fieldLabels.nextBlock].push(container);
    }
  }

  return element;
};


/**
 * Converts plain text into a DOM structure.
 * Throws an error if JSON doesn't parse.
 * @param {string} text Text representation.
 * @return {!Element} A tree of JSON elements.
 */
Blockly.JSON.textToObject = function(text) {
   var jsonObject = JSON.parse(text);
  // The DOM should have one and only one top-level node, an JSON tag.
  if (!jsonObject) {
    // Whatever we got back from the parser is not JSON.
    throw 'Blockly.JSON.textToObject did not obtain a valid JSON tree.';
  }
  return jsonObject;
};

/**
 * Decode an JSON DOM and create blocks on the workspace.
 * @param {!Blockly.Workspace} workspace The SVG workspace.
 * @param {!Element} JSON JSON DOM.
 */
Blockly.JSON.objectToWorkspace = function(workspace, json) {
  var width = Blockly.svgSize().width;
  for (var x = 0, jsonChild; jsonChild = json[x]; x++) {
    //if (JSONChild['eType'] == 'block') {
      var block = Blockly.JSON.objectToBlock_(workspace, jsonChild);
	  if(!block)continue;
      var blockX = parseInt(jsonChild[Blockly.JSON.fieldLabels.positionX]||0,10);
      var blockY = parseInt(jsonChild[Blockly.JSON.fieldLabels.positionY]||0,10);
      if (!isNaN(blockX) && !isNaN(blockY)) {
        block.moveBy(Blockly.RTL ? width - blockX : blockX, blockY);
      }
   // }
  }
};

/**
 * Decode an JSON block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {!Element} JSONBlock JSON block element.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
Blockly.JSON.objectToBlock_ = function(workspace, jsonBlock) {
  var prototypeName = jsonBlock[Blockly.JSON.fieldLabels.type];
  //var block = new Blockly.Block(workspace, prototypeName);
  try{
  var block = Blockly.Block.obtain(workspace, prototypeName);
  } catch (e){
	  return;
  }
  if (!block.svg_) {
    block.initSvg();
  }
  
  var inline = jsonBlock[Blockly.JSON.fieldLabels.inputInline];
  if (inline) {
    block.setInputsInline(true);
  }
  var collapsed = jsonBlock[Blockly.JSON.fieldLabels.inputCollapsed];
  if (collapsed) {
    block.setCollapsed(true);
  }
  var disabled = jsonBlock[Blockly.JSON.fieldLabels.inputDisabled];
  if (disabled) {
    block.setDisabled(true);
  }
  var deletable = jsonBlock[Blockly.JSON.fieldLabels.inputDeletable];
  if (deletable) {
    block.setDeletable(true);
  }
  var movable = jsonBlock[Blockly.JSON.fieldLabels.inputMovable];
  if (movable) {
    block.setMovable(true);
  }
  var editable = jsonBlock[Blockly.JSON.fieldLabels.inputEditable];
  if (editable) {
    block.setEditable(true);
  }

  if (jsonBlock[Blockly.JSON.fieldLabels.jsonMutation] && block.objectToMutation) {
	  block.objectToMutation(jsonBlock[Blockly.JSON.fieldLabels.jsonMutation]);
  }else if (jsonBlock[Blockly.JSON.fieldLabels.xmlMutation] && block.domToMutation) {
	  var mutationDom = document.createElement('div');
	 mutationDom.innerHTML = jsonBlock[Blockly.JSON.fieldLabels.xmlMutation];
	 block.domToMutation(mutationDom.firstChild);
  }
  
  if (jsonBlock[Blockly.JSON.fieldLabels.comment]){
	   block.setCommentText(jsonBlock[Blockly.JSON.fieldLabels.comment][Blockly.JSON.fieldLabels.commentText]);
        var visible = jsonBlock[Blockly.JSON.fieldLabels.comment][Blockly.JSON.fieldLabels.commentPinned];
        if (visible) {
          block.comment.setVisible(true);
        }
        var bubbleW = jsonBlock[Blockly.JSON.fieldLabels.comment][Blockly.JSON.fieldLabels.commentWidth];
        var bubbleH = jsonBlock[Blockly.JSON.fieldLabels.comment][Blockly.JSON.fieldLabels.commentHeight];
        if (!isNaN(bubbleW) && !isNaN(bubbleH)) {
          block.comment.setBubbleSize(bubbleW, bubbleH);
        }    
  }
  
  if (jsonBlock[Blockly.JSON.fieldLabels.title]){
	   for(var i=0,jsonTitle; jsonTitle = jsonBlock[Blockly.JSON.fieldLabels.title][i];i++){
		   try{
				block.setFieldValue(
					jsonTitle[Blockly.JSON.fieldLabels.titleValue]
					, jsonTitle[Blockly.JSON.fieldLabels.titleName]
					);
			}catch(e){
			  //Just ignore the error 
		   }
	   }  
  }
  

  
  if (jsonBlock[Blockly.JSON.fieldLabels.inputList]){
	  for(var i=0,jsonInput; jsonInput = jsonBlock[Blockly.JSON.fieldLabels.inputList][i];i++){
		    var input = block.getInput(jsonInput[Blockly.JSON.fieldLabels.inputName]);
			if (!input) {
			  //throw 'Input does not exist: ' + jsonInput['vName'];
			  continue;
			}
			if (jsonInput[Blockly.JSON.fieldLabels.childBlocks]) {	
			  var blockChild = Blockly.JSON.objectToBlock_(workspace, jsonInput[Blockly.JSON.fieldLabels.childBlocks]);
			  if (blockChild && blockChild.outputConnection) {
				 if(input.connection)input.connection.connect(blockChild.outputConnection);
			  } else if (blockChild && blockChild.previousConnection) {
				input.connection.connect(blockChild.previousConnection);
			  } else {
				console.log('Child block does not have output or previous statement.');
			  }
			}
	   }  
  }
  
  //If a block has mutation that create new outputs or affect inputs
  //Then you cannot set these input or outputs restriction until both
  //mutationTodata/dom is done and the title/inputList is done.
  if(block.afterRender) {
      block.afterRender();
  }
  
  if (jsonBlock[Blockly.JSON.fieldLabels.nextBlock]){
	  for(var i=0,jsonNext; jsonNext = jsonBlock[Blockly.JSON.fieldLabels.nextBlock][i];i++){
		   if (!block.nextConnection) {
            throw 'Next statement does not exist.';
          } else if (block.nextConnection.targetConnection) {
            // This could happen if there is more than one JSON 'lNext' tag.
            throw 'Next statement is already connected.';
          }
          blockChild = Blockly.JSON.objectToBlock_(workspace, jsonNext);
          if (!blockChild.previousConnection) {
            throw 'Next block does not have previous statement.';
          }
          block.nextConnection.connect(blockChild.previousConnection);
	   }  
  }
  
  
  

  var next = block.nextConnection && block.nextConnection.targetBlock();
  if (next) {
    // Next block in a stack needs to square off its corners.
    // Rendering a child will render its parent.
    next.render();
  } else {
    block.render();
  }
  return block;
};


// Export symbols that would otherwise be renamed by Closure compiler.
if (!window['Blockly']) {
  window['Blockly'] = {};
}
if (!window['Blockly']['JSON']) {
  window['Blockly']['JSON'] = {};
}
window['Blockly']['JSON']['objectToText'] = Blockly.JSON.objectToText;
window['Blockly']['JSON']['objectToWorkspace'] = Blockly.JSON.objectToWorkspace;
window['Blockly']['JSON']['textToObject'] = Blockly.JSON.textToObject;
window['Blockly']['JSON']['workspaceToObject'] = Blockly.JSON.workspaceToObject;
