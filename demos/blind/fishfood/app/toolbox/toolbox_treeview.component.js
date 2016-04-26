/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Angular2 Component that details how blocks are
 * rendered in the toolbox in BlindBlockly. Also handles any interactions
 * with the blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */

var app = app || {};

app.ToolboxTreeView = ng.core
  .Component({
    selector: 'toolbox-tree-view',
    template: `
<li #parentList aria-selected=false role='treeitem' [attr.aria-level]='level' id='{{createCategoryDependantId(index, parentList)}}'>
  <label id='{{block.id}}' style='color:red'>{{block.toString()}}</label>
  {{setLabelledBy(parentList, concatStringWithSpaces('blockly-block-summary', block.id))}}
  <ol role='group' *ngIf='displayBlockMenu || block.inputList.length > 0' class='children' [attr.aria-level]='level+1'>
    {{addClass(parentList, 'hasChildren')}}
    <li #listItem id='{{treeService.createId(listItem)}}' *ngIf='displayBlockMenu' role='treeitem' aria-selected=false [attr.aria-level]='level+1'>
      {{setLabelledBy(listItem, concatStringWithSpaces('blockly-block-menu', block.id))}}
      <label #label id='{{treeService.createId(label)}}'>block action list </label>
      <ol role='group' *ngIf='displayBlockMenu' class='children' [attr.aria-level]='level+2'>
        <li #workspaceCopy id='{{treeService.createId(workspaceCopy)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button #workspaceCopyButton id='{{treeService.createId(workspaceCopyButton)}}' (click)="copyToWorkspace(block)">copy to workspace</button>
          {{setLabelledBy(workspaceCopy, concatStringWithSpaces(workspaceCopyButton.id, 'blockly-button'))}}
        </li>
        <li #blockCopy id='{{treeService.createId(blockCopy)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button #blockCopyButton id='{{treeService.createId(blockCopyButton)}}' (click)="copyToClipboard(block)">copy to clipboard</button>
          {{setLabelledBy(blockCopy, concatStringWithSpaces(blockCopyButton.id, 'blockly-button'))}}
        </li>
        <li #sendToSelected id='{{treeService.createId(sendToSelected)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button #sendToSelectedButton id='{{treeService.createId(sendToSelectedButton)}}' (click)="copyToMarked(block)" disabled='{{notCompatibleWithMarkedBlock(block)}}' [attr.aria-disabled]='notCompatibleWithMarkedBlock(block)'>copy to marked spot</button>
          {{setLabelledBy(sendToSelected, concatStringWithSpaces(sendToSelectedButton.id, 'blockly-button', notCompatibleWithMarkedBlock(block)))}}
        </li>
      </ol>
      {{addClass(listItem, 'hasChildren')}}
    </li>
    <div *ngFor='#inputBlock of block.inputList; #i=index'>
      <field-view [attr.aria-level]='level+1' *ngFor='#field of getInfo(inputBlock); #j=index' [field]='field' [level]='level+1'></field-view>
      <toolbox-tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [displayBlockMenu]='false' [level]='level+1'></toolbox-tree-view>
      <li aria-selected=false #listItem1 role='treeitem' [attr.aria-level]='level+1' id='{{treeService.createId(listItem1)}}' *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()'>
        <label #label id='{{treeService.createId(label)}}'>{{inputType(inputBlock.connection)}} {{valueOrStatement(inputBlock)}} needed:</label>
        {{setLabelledBy(listItem1, concatStringWithSpaces('blockly-argument-text', label.id))}}
      </li>
    </div>
  </ol>
</li>
<toolbox-tree-view *ngIf= 'block.nextConnection && block.nextConnection.targetBlock()' [level]='level' [block]='block.nextConnection.targetBlock()' [displayBlockMenu]='false'></toolbox-tree-view>
    `,
    directives: [ng.core.forwardRef(
        function() { return app.ToolboxTreeView; }), app.FieldView],
    inputs: ['block', 'displayBlockMenu', 'level', 'index', 'tree'],
  })
  .Class({
    constructor: [app.ClipboardService, app.TreeService, function(_service, _service2) {
      this.infoBlocks = {};
      this.nextBlock = {};
      this.sharedClipboardService = _service;
      this.treeService = _service2;
    }],
    setLabelledBy: function(item,string){
      if (!item.getAttribute('aria-labelledby')) {
        item.setAttribute('aria-labelledby', string);
      }
    },
    concatStringWithSpaces: function(){
      var string = arguments[0];
      for (i = 1; i < arguments.length; i++) {
        var arg = arguments[i];
        //arg can be undefined if it is coming from a function that checks whether the button should be disabled or not.
        if (arg){
          string = string + ' ' + arguments[i];
        }
      }
      return string;
    },
    createCategoryDependantId: function(index, parentList){
      //if this is the first block in a category-less toolbox, the id should be toolbox-tree-node0
      if (index != undefined && index == 0) {
        if (this.tree.getAttribute('aria-activedescendant') == 'toolbox-tree-node0') {
          this.addClass(parentList, 'activedescendant');
          parentList.setAttribute("aria-selected", "true");
          this.treeService.setActiveDesc(parentList, this.tree.id);
        }
        return 'toolbox-tree-node0';
      } else {
        return this.treeService.createId(parentList);
      }
    },
    addClass: function(node, classText) {
      //ensure that node doesn't have class already in it
      var classList = node.className;
      classList = classList.split(" ");
      var canAdd = true;
      for (var i=0; i<classList.length; i++){
        if (classList[i] == classText) {
          canAdd = false;
        }
      }
      //add class if it doesn't
      if (canAdd) {
        if (classList.length == 0) {
          node.className += classText;
        } else {
          node.className += (' ' + classText);
        }
      }
    },
    getInfo: function(block) {
      //list all inputs
      if (this.infoBlocks[block.id]) {
        //this is required for some reason
        this.infoBlocks[block.id].length=0;
      } else {
        this.infoBlocks[block.id] = [];
      }

      var blockInfoList = this.infoBlocks[block.id];

      for (var j = 0, field; field = block.fieldRow[j]; j++) {
        blockInfoList.push(field);
      }

      return this.infoBlocks[block.id];
    },
    inputType: function(connection) {
      if (connection.check_) {
        return connection.check_.join(', ').toUpperCase();
      } else {
        return 'any';
      }
    },
    copyToWorkspace: function(block){
      var xml = Blockly.Xml.blockToDom(block);
      Blockly.Xml.domToBlock(app.workspace, xml);
      console.log('added block to workspace');
      alert('block added to workspace');
    },
    copyToClipboard: function(block){
      if (this.sharedClipboardService) {
        this.sharedClipboardService.copy(block);
        alert('block copied to clipboard');
      }
    },
    copyToMarked: function(block){
      if (this.sharedClipboardService) {
        this.sharedClipboardService.pasteToMarkedConnection(block);
        alert('block sent to marked spot');
      }
    },
    notCompatibleWithMarkedBlock: function(block) {
      if (this.sharedClipboardService.isBlockCompatibleWithMarkedConnection(block)) {
        //undefined will result in the 'copy to marked block' option being ENABLED
        return undefined;
      } else {
        //anything will result in the 'copy to marked block' option being DISABLED
        return 'blockly-disabled';
      }
    },
    valueOrStatement: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT){
        return "statement";
      } else {
        return "value";
      }
    },
    log: function(obj){
	   console.log(obj);
    },
  });
