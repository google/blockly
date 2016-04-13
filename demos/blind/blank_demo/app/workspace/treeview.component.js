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
  <ol role='group' class='children' [attr.aria-level]='level+1'>
    <li #listItem id='{{treeService.createId(listItem)}}' role='treeitem' [attr.aria-level]='level+1' aria-selected=false  aria-label='block action menu'>
        <select [attr.aria-labelledby]='block.id' (change)='blockMenuSelected(block, $event)'>
          <option value='NO_ACTION' selected>select an action</option>
          <option value='CUT_BLOCK'>cut block</option>
          <option value='COPY_BLOCK'>copy block</option>
          <option value='PASTE_ABOVE' disabled='block.previousConnection' disabled='{{notCompatibleWithClipboard(block.previousConnection)}}'>paste above this block</option>
          <option value='PASTE_BELOW' disabled='block.nextConnection' disabled='{{notCompatibleWithClipboard(block.nextConnection)}}'>paste below this block</option>
          <option value='MARK_ABOVE' disabled='block.previousConnection'>mark spot above this block</option>
          <option value='MARK_BELOW' disabled='block.nextConnection'>mark spot above this block</option>
          <option value='SEND_TO_SELECTED' disabled='{{notCompatibleWithMarkedBlock(block)}}'>move to marked spot</option>
          <option value='DELETE_BLOCK'>delete</option>
        </select>
    </li>
    <div *ngFor='#inputBlock of block.inputList'>
      <field-view *ngFor='#field of getInfo(inputBlock)' [field]='field'></field-view>
      <tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [isTopBlock]='false' [level]='level'></tree-view>
      <li #inputList [attr.aria-level]='level+1' id='{{treeService.createId(inputList)}}' *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()'>
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
    blockMenuSelected: function(block, event) {
      switch (event.target.value) {
        case 'DELETE_BLOCK':
          block.dispose(true);
          alert('block deleted');
          break;
        case 'CUT_BLOCK':
          this.sharedClipboardService.cut(block);
          alert('block cut');
          break;
        case 'COPY_BLOCK':
          this.sharedClipboardService.copy(block);
          alert('block copied');
          break;
        case 'PASTE_BELOW':
          this.sharedClipboardService.paste(block.nextConnection);
          alert('block pasted below');
          break;
        case 'PASTE_ABOVE':
          this.sharedClipboardService.paste(block.previousConnection);
          alert('block pasted above');
          break;
        case 'MARK_BELOW':
          this.sharedClipboardService.markConnection(block.nextConnection);
          alert('marked spot below');
          break;
        case 'MARK_ABOVE':
          this.sharedClipboardService.markConnection(block.previousConnection);
          alert('marked spot above');
          break;
        case 'SEND_TO_SELECTED':
          if (this.sharedClipboardService) {
            this.sharedClipboardService.pasteToMarkedConnection(block);
            block.dispose(true);
            alert('block sent to marked spot');
          }
          break;
      }
      event.target.selectedIndex = 0;
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
