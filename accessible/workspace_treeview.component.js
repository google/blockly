/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how Blockly.Block's are
 * rendered in the workspace in AccessibleBlockly. Also handles any
 * interactions with the blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */
blocklyApp.TreeView = ng.core
  .Component({
    selector: 'tree-view',
    template: `
      <li #parentList aria-selected=false role="treeitem" class="blocklyHasChildren" [attr.aria-level]="level" id="{{setId(parentList)}}">
        {{checkParentList(parentList)}}
        <label #blockSummary id="blockly-{{block.id}}">{{block.toString()}}</label>
        {{setLabelledBy(parentList, concatStringWithSpaces("blockly-block-summary", blockSummary.id))}}
        <ol role="group"  [attr.aria-level]="level+1">
          <li #listItem id="{{treeService.createId(listItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+1">
            {{setLabelledBy(listItem, concatStringWithSpaces("blockly-block-menu", blockSummary.id))}}
            <label #label id="{{treeService.createId(label)}}">block action list </label>
            <ol role="group"  [attr.aria-level]="level+2">
              <li #cutListItem id="{{treeService.createId(cutListItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #cutButton id="{{treeService.createId(cutButton)}}" (click)="sharedClipboardService.cut(block)">cut block</button>
                {{setLabelledBy(cutListItem, concatStringWithSpaces(cutButton.id, "blockly-button"))}}
              </li>
              <li #copyListItem id="{{treeService.createId(copyListItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #copyButton id="{{treeService.createId(copyButton)}}" (click)="sharedClipboardService.copy(block)">copy block</button>
                {{setLabelledBy(copyListItem, concatStringWithSpaces(copyButton.id, "blockly-button"))}}
              </li>
              <li #pasteBelow id="{{treeService.createId(pasteBelow)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #pasteBelowButton id="{{treeService.createId(pasteBelowButton)}}" (click)="sharedClipboardService.paste(block.nextConnection)" disabled="{{hasNoNextConnection(block)}}" disabled="{{notCompatibleWithClipboard(block.nextConnection)}}">paste below</button>
                {{setLabelledBy(pasteBelow, concatStringWithSpaces(pasteBelowButton.id, "blockly-button", (hasNoNextConnection(block)||notCompatibleWithClipboard(block.nextConnection))))}}
              </li>
              <li #pasteAbove id="{{treeService.createId(pasteAbove)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #pasteAboveButton id="{{treeService.createId(pasteAboveButton)}}" (click)="sharedClipboardService.paste(block.previousConnection)" disabled="{{hasNoPreviousConnection(block)}}" disabled="{{notCompatibleWithClipboard(block.previousConnection)}}">paste above</button>
                {{setLabelledBy(pasteAbove, concatStringWithSpaces(pasteAboveButton.id, "blockly-button", (hasNoPreviousConnection(block)||notCompatibleWithClipboard(block.previousConnection))))}}
              </li>
              <li #markBelow id="{{treeService.createId(markBelow)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #markBelowButton id="{{treeService.createId(markBelowButton)}}" (click)="sharedClipboardService.markConnection(block.nextConnection)" disabled="{{hasNoNextConnection(block)}}">mark spot below</button>
                {{setLabelledBy(markBelow, concatStringWithSpaces(markBelowButton.id, "blockly-button", hasNoNextConnection(block)))}}
              </li>
              <li #markAbove id="{{treeService.createId(markAbove)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #markAboveButton id="{{treeService.createId(markAboveButton)}}" (click)="sharedClipboardService.markConnection(block.previousConnection)" disabled="{{hasNoPreviousConnection(block)}}">mark spot above</button>
                {{setLabelledBy(markAbove, concatStringWithSpaces(markAboveButton.id, "blockly-button", hasNoPreviousConnection(block)))}}
              </li>
              <li #sendToSelected id="{{treeService.createId(sendToSelected)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #sendToSelectedButton id="{{treeService.createId(sendToSelectedButton)}}" (click)="sendToSelected(block)" disabled="{{notCompatibleWithMarkedBlock(block)}}">move to marked spot</button>
                {{setLabelledBy(sendToSelected, concatStringWithSpaces(sendToSelectedButton.id, "blockly-button", notCompatibleWithMarkedBlock(block)))}}
              </li>
              <li #delete id="{{treeService.createId(delete)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #deleteButton id="{{treeService.createId(deleteButton)}}" (click)="block.dispose(true)">delete button</button>
              </li>
            </ol>
            {{addClass(listItem, "blocklyHasChildren")}}
          </li>
          <div *ngFor="#inputBlock of block.inputList">
            <field-view *ngFor="#field of getInfo(inputBlock)" [field]="field"></field-view>
            <tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [isTopBlock]="false" [level]="level"></tree-view>
            <li #inputList [attr.aria-level]="level+1" id="{{treeService.createId(inputList)}}" *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" (keydown)="treeService.keyHandler($event, tree)">
              {{getInputTypeLabel(inputBlock.connection)}} {{valueOrStatement(inputBlock)}} needed:
              <select aria-label="insert input menu" (change)="inputMenuSelected(inputBlock.connection, $event)">
                <option value="NO_ACTION" selected>select an action</option>
                <option value="MARK_SPOT">mark this spot</option>
                <option value="PASTE" disabled="{{notCompatibleWithClipboard(inputBlock.connection)}}">paste</option>
              </select>
            </li>
          </div>
        </ol>
      </li>
      <tree-view *ngIf= "block.nextConnection && block.nextConnection.targetBlock()" [block]="block.nextConnection.targetBlock()" [isTopBlock]="false" [level]="level"></tree-view>
    `,
    directives: [ng.core.forwardRef(
        function() { return blocklyApp.TreeView; }), blocklyApp.FieldView],
    inputs: ['block', 'isTopBlock', 'topBlockIndex', 'level', 'parentId'],
  })
  .Class({
    constructor: [blocklyApp.ClipboardService, blocklyApp.TreeService,
      function(_service, _service2) {
      this.infoBlocks = {};
      this.nextBlock = {};
      this.sharedClipboardService = _service;
      this.treeService = _service2;
    }],
    setLabelledBy: function(item, string) {
      if (!item.getAttribute('aria-labelledby')) {
        item.setAttribute('aria-labelledby', string);
      }
    },
    concatStringWithSpaces: function() {
      var string = arguments[0];
      for (i = 1; i < arguments.length; i++) {
        string = string + ' ' + arguments[i];
      }
      return string;
    },
    hasNoPreviousConnection: function(block) {
      if (!block.previousConnection) {
        return 'blockly-disabled';
      } else {
        return undefined;
      }
    },
    hasNoNextConnection: function(block) {
      if (!block.nextConnection) {
        return 'blockly-disabled';
      } else {
        return undefined;
      }
    },
    checkParentList: function(parentList) {
      blocklyApp.debug && console.log('setting parent list');
      var tree = parentList;
      while (tree && !tree.id.match(/^blockly-workspace-tree\d+$/)) {
        tree = tree.parentNode;
      }
      if (tree && tree.getAttribute('aria-activedescendant') == parentList.id) {
        this.treeService.updateSelectedNode(parentList, tree, false);
      }
    },
    addClass: function(node, classText) {
      //ensure that node doesn't have class already in it
      var classList = node.className;
      classList = classList.split(' ');
      var canAdd = true;
      for (var i = 0; i < classList.length; i++) {
        if (classList[i] == classText) {
          canAdd = false;
        }
      }
      //add class if it doesn't
      if (canAdd) {
        if (classList.length) {
          node.className += ' ' + classText;
        } else {
          node.className += classText;
        }
      }
    },
    setId: function(block) {
      if (this.isTopBlock) {
        return this.parentId + '-node0';
      }
      return this.treeService.createId(block);
    },
    getInfo: function(block) {
      // List all inputs
      if (this.infoBlocks[block.id]) {
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
    getInputTypeLabel: function(connection) {
      if (connection.check_) {
        return connection.check_.join(', ').toUpperCase();
      } else {
        return 'any';
      }
    },
    sendToSelected: function(block) {
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
          blocklyApp.debug && console.log('marked spot');
          break;
        case 'PASTE':
          this.sharedClipboardService.paste(connection);
          break;
      }
      event.target.selectedIndex = 0;
    },
    notCompatibleWithClipboard: function(connection) {
      if (this.sharedClipboardService.isConnectionCompatibleWithClipboard(
              connection)) {
        // undefined will result in the 'paste' option being ENABLED
        return undefined;
      } else {
        // any value returned will result in the 'paste' option being DISABLED
        return 'blockly-disabled';
      }
    },
    valueOrStatement: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT) {
        return 'statement';
      } else {
        return 'value';
      }
    },
    notCompatibleWithMarkedBlock: function(block) {
      if (this.sharedClipboardService
          .isBlockCompatibleWithMarkedConnection(block)) {
        // undefined will result in the 'copy to marked block'
        // option being ENABLED
        return undefined;
      } else {
        // any value returned will result in the 'copy to marked block'
        // option being DISABLED
        return 'blockly-disabled';
      }
    }
  });
