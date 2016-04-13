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
<li #parentList aria-selected=false role='treeitem' [attr.aria-level]='level' id='{{treeService.createId(parentList)}}' [attr.aria-labelledby]='block.id'>
  <label id='{{block.id}}' style='color:red'>{{block.toString()}}</label>
  <ol role='group' *ngIf='displayBlockMenu || block.inputList.length > 0' class='children' [attr.aria-level]='level+1'>
    {{addClass(parentList, 'hasChildren')}}
    <li #listItem id='{{treeService.createId(listItem)}}' *ngIf='displayBlockMenu' role='treeitem' aria-selected=false [attr.aria-level]='level+1'  [attr.aria-labelledby]='block.id' aria-label='toolbar block menu'>
      <select #select id='{{treeService.createId(select)}}' [attr.aria-labelledby]='block.id' aria-label='toolbar block menu' (change)='blockMenuSelected(block, $event)'>
        <option value='NO_ACTION' selected>select an action</option>
        <option value='COPY_TO_WORKSPACE'>copy to workspace</option>
        <option value='COPY_BLOCK'>copy to Blockly clipboard</option>
        <option value='SEND_TO_SELECTED' disabled='{{notCompatibleWithMarkedBlock(block)}}'>copy to selected input</option>
      </select>
    </li>
    <div *ngFor='#inputBlock of block.inputList; #i=index'>
      <field-view [attr.aria-level]='level+1' *ngFor='#field of getInfo(inputBlock); #j=index' [field]='field' [level]='level+1'></field-view>
      <toolbox-tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [displayBlockMenu]='false' [level]='level+1'></toolbox-tree-view>
      <li aria-selected=false #listItem1 role='treeitem' [attr.aria-level]='level+1' id='{{treeService.createId(listItem1)}}' *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()'>
        <label #label id='{{treeService.createId(label)}}'>{{inputType(inputBlock.connection)}} input needed</label>
        {{labelParent(listItem1, label.id)}}
      </li>
    </div>
  </ol>
</li>
<li #listItem2 aria-selected=false role='treeitem' [attr.aria-level]='level' id='{{treeService.createId(listItem2)}}' *ngIf= 'block.nextConnection && block.nextConnection.targetBlock()'>
  <toolbox-tree-view [level]='level+1' [block]='block.nextConnection.targetBlock()' [displayBlockMenu]='false'></toolbox-tree-view>
</li>
    `,
    directives: [ng.core.forwardRef(
        function() { return app.ToolboxTreeView; }), app.FieldView],
    inputs: ['block','displayBlockMenu','level'],
  })
  .Class({
    constructor: [app.ClipboardService, app.TreeService, function(_service, _service2) {
      this.infoBlocks = {};
      this.nextBlock = {};
      this.sharedClipboardService = _service;
      this.treeService = _service2;
    }],
    labelParent: function(parent, childId) {
      if (!parent.getAttribute('aria-labelledby')) {
        parent.setAttribute('aria-labelledby', childId);
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
        case 'COPY_TO_WORKSPACE':
          var xml = Blockly.Xml.blockToDom(block);
          Blockly.Xml.domToBlock(app.workspace, xml);
          console.log('added block to workspace');
          alert('block added to workspace');
          break;
        case 'SEND_TO_SELECTED':
          if (this.sharedClipboardService) {
            this.sharedClipboardService.pasteToMarkedConnection(block);
            alert('block sent to marked spot');
          }
          break;
        case 'COPY_BLOCK':
          if (this.sharedClipboardService) {
            this.sharedClipboardService.copy(block);
            alert('block copied to clipboard');
          }
          break;
      }
      event.target.selectedIndex = 0;
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
    log: function(obj){
	console.log(obj);
    },
    globallyUniqueId: function(){
    }
  });
