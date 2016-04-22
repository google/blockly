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
 * @fileoverview Angular2 Component that details how Blockly.Block's are rendered in the workspace in BlindBlockly. Also handles any interactions with the blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.TreeView = ng.core
  .Component({
    selector: 'tree-view',
    template: `
<li #parentList aria-selected=false role='treeitem' class='hasChildren' [attr.aria-level]='level' id='{{setId(parentList)}}' [attr.aria-labelledby]='block.id'>
  {{checkParentList(parentList)}}
  <label id='{{block.id}}' style='color: red'>{{block.toString()}}</label>
  {{setLabelledBy(parentList, concatStringWithSpaces('block-summary', block.id))}}
  <ol role='group' class='children' [attr.aria-level]='level+1'>
    <li #listItem id='{{treeService.createId(listItem)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+1'>
      {{setLabelledBy(listItem, concatStringWithSpaces('block-menu', block.id))}}
      <label #label id='{{treeService.createId(label)}}'>block action list </label>
      <ol role='group' class='children' [attr.aria-level]='level+2'>
        <li #cut id='{{treeService.createId(cut)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.cut(block)">cut block button</button>
        </li>
        <li #copy id='{{treeService.createId(copy)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.copy(block)">copy block button</button>
        </li>
        <li #pasteBelow *ngIf='!hasNoNextConnection(block) && !notCompatibleWithClipboard(block.nextConnection)' id='{{treeService.createId(pasteBelow)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.paste(block.nextConnection);" disabled='{{hasNoNextConnection(block)}}' disabled='{{notCompatibleWithClipboard(block.nextConnection)}}'>paste below button</button>
        </li>
        <li #pasteAbove *ngIf='!hasNoPreviousConnection(block) && !notCompatibleWithClipboard(block.nextConnection)' id='{{treeService.createId(pasteAbove)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.paste(block.previousConnection)" disabled='{{hasNoPreviousConnection(block)}}' disabled='{{notCompatibleWithClipboard(block.previousConnection)}}'>paste above button</button>
        </li>
        <li #markBelow *ngIf='!hasNoNextConnection(block)' id='{{treeService.createId(markBelow)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.markConnection(block.nextConnection)" disabled='{{hasNoNextConnection(block)}}'>mark spot below button</button>
        </li>
        <li #markAbove *ngIf='!hasNoPreviousConnection(block)' id='{{treeService.createId(markAbove)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sharedClipboardService.markConnection(block.previousConnection)" disabled='{{hasNoPreviousConnection(block)}}'>mark spot above button</button>
        </li>
        <li #sendToSelected *ngIf='!notCompatibleWithMarkedBlock(block)' id='{{treeService.createId(sendToSelected)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="sendToSelected(block)" disabled='{{notCompatibleWithMarkedBlock(block)}}'>move to marked spot button</button>
        </li>
        <li #delete id='{{treeService.createId(delete)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+2'>
          <button (click)="block.dispose(true)">delete button</button>
        </li>
      </ol>
      {{addClass(listItem, 'hasChildren')}}
    </li>
    <div *ngFor='#inputBlock of block.inputList'>
      <field-view *ngFor='#field of getInfo(inputBlock)' [field]='field'></field-view>
      <tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [isTopBlock]='false' [level]='level'></tree-view>
      <li #inputList [attr.aria-level]='level+1' id='{{treeService.createId(inputList)}}' *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()' (keydown)="treeService.keyHandler($event, tree)">
        {{inputType(inputBlock.connection)}} {{valueOrStatement(inputBlock)}} needed:
        <select aria-label='insert input menu' (change)='inputMenuSelected(inputBlock.connection, $event)'>
          <option value='NO_ACTION' selected>select an action</option>
          <option value='MARK_SPOT'>mark this spot</option>
          <option value='PASTE' disabled='{{notCompatibleWithClipboard(inputBlock.connection)}}'>paste</option>
        </select>
      </li>
    </div>
  </ol>
</li>
  <tree-view *ngIf= 'block.nextConnection && block.nextConnection.targetBlock()' [block]='block.nextConnection.targetBlock()' [isTopBlock]='false' [level]='level'></tree-view>

    `,
    directives: [ng.core.forwardRef(
        function() { return app.TreeView; }), app.FieldView],
    inputs: ['block', 'isTopBlock', 'topBlockIndex', 'level', 'parentId'],
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
    concatStringWithSpaces: function(a,b){
      return a + ' ' + b;
    },
    hasNoPreviousConnection: function(block){
      if (!block.previousConnection){
        return true;
      } else {
        return undefined;
      }
    },
    hasNoNextConnection: function(block){
      if (!block.nextConnection){
        return true;
      } else {
        return undefined;
      }
    },
    checkParentList: function(parentList) {
      console.log("setting parent list");
      var tree = parentList;
      while (tree && tree.id != 'workspace-tree0') {
        tree = tree.parentNode;
      }
      if (tree && tree.getAttribute('aria-activedescendant') == parentList.id){
        this.treeService.updateSelectedNode(parentList, tree, false);
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
    setId: function(block){
      if (this.isTopBlock){
        //TODO(madeeha): this should be the number of top level block that this is.
        return this.parentId+'-node0';
      }
      return this.treeService.createId(block);
    },
    getInfo: function(block) {
      //List all inputs
      if (this.infoBlocks[block.id]) {
        //TODO(madeeha): is there a situation in which overwriting often unnecessarily is a problem?
        this.infoBlocks[block.id].length = 0;
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
    sendToSelected: function(block){
      if (this.sharedClipboardService) {
        this.sharedClipboardService.pasteToMarkedConnection(block);
        block.dispose(true);
        alert('block sent to marked spot');
      }
    },
    inputMenuSelected: function(connection, event) {
      switch (event.target.value) {
        case 'MARK_SPOT':
          this.sharedClipboardService.markConnection(connection);
          console.log("marked spot");
          break;
        case 'PASTE':
          this.sharedClipboardService.paste(connection);
          break;
      }
      event.target.selectedIndex = 0;
    },
    notCompatibleWithClipboard: function(connection) {
      if (this.sharedClipboardService.isConnectionCompatibleWithClipboard(
              connection)){
        //undefined will result in the 'paste' option being ENABLED
        return undefined;
      } else {
        //true will result in the 'paste' option being DISABLED
        return true;
      }
    },
    valueOrStatement: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT){
        return "statement";
      } else {
        return "value";
      }
    },
    notCompatibleWithMarkedBlock: function(block) {
      if (this.sharedClipboardService.isBlockCompatibleWithMarkedConnection(block)) {
        //undefined will result in the 'copy to marked block' option being ENABLED
        return undefined;
      } else {
        //true will result in the 'copy to marked block' option being DISABLED
        return true;
      }
    },
    log: function(obj) {
      console.log(obj);
    }
  });
