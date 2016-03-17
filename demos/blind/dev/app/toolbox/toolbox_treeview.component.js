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
<li tabIndex='0' [attr.aria-level]='level'>
  <label id='{{block.id}}' style='color:red'>{{block.toString()}}</label>
  <ol [attr.aria-level]='level+1'>
    <li *ngIf='displayBlockMenu' [attr.aria-level]='level+1'>
      <select [attr.aria-labelledby]='block.id' aria-label='toolbar block menu' (change)='blockMenuSelected(block, $event)'>
        <option value='NO_ACTION' selected>select an action</option>
        <option value='COPY_TO_WORKSPACE'>copy to workspace</option>
        <option value='COPY_BLOCK'>copy to Blockly clipboard</option>
        <option value='SEND_TO_SELECTED' disabled='{{notCompatibleWithMarkedBlock(block)}}'>copy to selected input</option>
      </select>
    </li>
    <div *ngFor='#inputBlock of block.inputList'>
      <field-view [attr.aria-level]='level+1' *ngFor='#field of getInfo(inputBlock)' [field]='field' [level]='level+1'></field-view>
      <toolbox-tree-view *ngIf='inputBlock.connection && inputBlock.connection.targetBlock()' [block]='inputBlock.connection.targetBlock()' [displayBlockMenu]='false' [level]='level+1'></toolbox-tree-view>
      <li tabIndex='0' [attr.aria-level]='level+1' *ngIf='inputBlock.connection && !inputBlock.connection.targetBlock()'>
        {{inputType(inputBlock.connection)}} input needed
      </li>
    </div>
  </ol>
</li>
<li [attr.aria-level]='level' tabIndex='0' *ngIf= 'block.nextConnection && block.nextConnection.targetBlock()'>
  <toolbox-tree-view [level]='level+1' [block]='block.nextConnection.targetBlock()' [displayBlockMenu]='false'></toolbox-tree-view>
</li>
    `,
    directives: [ng.core.forwardRef(
        function() { return app.ToolboxTreeView; }), app.FieldView],
    inputs: ['block','displayBlockMenu','level'],
  })
  .Class({
    constructor: [app.ClipboardService, function(_service) {
      this.infoBlocks = {};
      this.nextBlock = {};
      this.sharedClipboardService = _service;
    }],
    keyHandler: function(e){
      //console.log(document.activeElement);
      var currentElement = document.activeElement;
      console.log(e.keyCode);
      switch (e.keyCode){
        case 37:
          //left-facing arrow: go out a level, if possible. If not, go to the previous top-level block
          var tempElement = currentElement.parentNode;
          while (tempElement != null && tempElement.tabIndex != 0) {
            tempElement = tempElement.parentNode;
          }
          if (tempElement == null){
            return;
            e.preventDefault();
          }
          tempElement.focus();
          console.log("focus on parent");
          e.preventDefault();
          break;
        case 38:
          //up-facing arrow: go up a level, if possible. If not, make done sound
          var prevSibling = this.getPreviousSibling(currentElement);
          if (prevSibling){
            prevSibling.focus();
          } else {
            console.log("no previous sibling");
          }
          e.preventDefault();
          break;
        case 39:
          //right-facing arrow: go in a level, if possible. If not, go to next top-level block
          var firstChild = this.getFirstChild(currentElement);
          if (firstChild){
            firstChild.focus();
          } else {
            console.log("no valid child");
          }
          e.preventDefault();
          break;
        case 40:
          //down-facing arrow: go down a level, if possible. If not, make done sound
          var nextSibling = this.getNextSibling(currentElement);
          if (nextSibling){
            nextSibling.focus();
          } else {
            console.log("no next sibling");
          }
          e.preventDefault();
          break;
      }
    },
    getFirstChild: function(element){
      //get the children of the element
      //are any of them tabIndex=0?
      //go to the children of the first child
      if (element == null){
        return element;
      } else {
        var childList = element.children;
        for (var i=0; i<childList.length; i++){
          if (childList[i].tabIndex == 0){
            return childList[i];
          } else {
            var potentialElement = this.getFirstChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        return null;
      }
    },
    getNextSibling: function(element){
      if (element.nextElementSibling){
        return element.nextElementSibling;
      } else {
        var parent = element.parentNode;
        while (parent != null){
          if (parent.nextElementSibling){
            var node = parent.nextElementSibling;
            if (node.tabIndex == 0){
              return node;
            } else {
              return this.getFirstChild(node);
            }
          } else {
            parent = parent.parentNode;
          }
        }
        return null;
      }
    },
    getPreviousSibling: function(element){
      if (element.previousElementSibling){
        console.log("found a previous sibling!");
        var sibling = element.previousElementSibling;
        if (sibling.tabIndex == '0') {
          return sibling;
        } else {
          return this.getLastChild(sibling);
        }
      } else {
        var parent = element.parentNode;
        console.log(parent);
        while (parent != null){
          console.log("looping");
          if (parent.tagName == 'OL') {
            break;
          }
          if (parent.previousElementSibling){
            console.log("parent has a sibling!");
            var node = parent.previousElementSibling;
            if (node.tabIndex == 0){
              console.log("return the sibling of the parent!");
              return node;
            } else {
              return this.getLastChild(node);
            }
          } else {
            parent = parent.parentNode;
            console.log(parent);
          }
        }
        return null;
      }
    },
    getLastChild: function(element){
      if (element == null){
        console.log("no element");
        return element;
      } else {
        var childList = element.children;
        for (var i=childList.length-1; i>=0; i--){
          if (childList[i].tabIndex == 0){
            return childList[i];
          } else {
            var potentialElement = this.getLastChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        console.log("no last child");
        return null;
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
      if (this.sharedClipboardService.isBlockCompatibleWithMarkedConnection(block)) {
        //undefined will result in the 'copy to marked block' option being ENABLED
        return undefined;
      } else {
        //true will result in the 'copy to marked block' option being DISABLED
        return true;
      }
    }
  });
