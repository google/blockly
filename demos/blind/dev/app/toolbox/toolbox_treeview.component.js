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
<li>
  <label style='color:red'>{{block.toString()}}</label>
  <select *ngIf='displayBlockMenu' aria-label='toolbar block menu' (change)='blockMenuSelected(block,$event)'>
    <option value='NO_ACTION' select>select an action</option>
    <option value='COPY_TO_WORKSPACE'>copy to workspace</option>
    <option value='COPY_BLOCK'>copy to Blockly clipboard</option>
    <option value='SEND_TO_SELECTED' disabled='{{notCompatibleWithMarkedBlock(block)}}'>copy to selected input</option>
  </select>
  <ul>
    <div *ngFor='#inputBlock of block.inputList'>
      <field-view *ngFor='#field of getInfo(inputBlock)' [field]='field'></field-view>
      <toolbox-tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [displayBlockMenu]='false'></toolbox-tree-view>
      <li *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()'>
        {{inputType(inputBlock.connection)}} input needed
      </li>
    </div>
  </ul>
</li>
<li *ngIf= 'block.nextConnection && block.nextConnection.targetBlock()'>
  <toolbox-tree-view [block]='block.nextConnection.targetBlock()' [displayBlockMenu]='false'></toolbox-tree-view>
</li>
    `,
    directives: [ng.core.forwardRef(
        function() { return app.ToolboxTreeView; }), app.FieldView],
    inputs: ['block','displayBlockMenu'],
  })
  .Class({
    constructor: [app.ClipboardService, function(_service) {
      this.infoBlocks = {};
      this.nextBlock = {};
      this.sharedClipboardService = _service;
    }],
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
          var xml = Blockly.Xml.blockToDom_(block);
          Blockly.Xml.domToBlock(app.workspace, xml);
          console.log('added block to workspace');
          break;
        case 'SEND_TO_SELECTED':
          if (this.sharedClipboardService) {
            this.sharedClipboardService.pasteToMarkedConnection(block);
          }
          break;
        case 'COPY_BLOCK':
          if (this.sharedClipboardService) {
            this.sharedClipboardService.copy(block);
          }
          break;
      }
      event.target.selectedIndex = 0;
    },
    notCompatibleWithMarkedBlock: function(block) {
      if (this.sharedClipboardService.isCompatibleWithMarkedConnection(block)) {
        //undefined will result in the 'copy to marked block' option being ENABLED
        return undefined;
      } else {
        //true will result in the 'copy to marked block' option being DISABLED
        return true;
      }
    }
  });
