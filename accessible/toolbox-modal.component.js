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
 * @fileoverview Angular2 Component representing the toolbox modal.
 *
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.ToolboxModalComponent = ng.core.Component({
  selector: 'blockly-toolbox-modal',
  template: `
    <div *ngIf="modalIsVisible" id="toolboxModal" role="dialog" tabindex="-1">
      <div (click)="hideModal()" class="blocklyModalCurtain">
        <!-- The $event.stopPropagation() here prevents the modal from
        closing when its interior is clicked. -->
        <div class="blocklyModal" (click)="$event.stopPropagation()" role="document">
          <h3>Select a block for the new group...</h3>

          <div *ngFor="#toolboxCategory of toolboxCategories; #categoryIndex=index">
            <h4>{{toolboxCategory.categoryName}}</h4>
            <div class="blocklyModalButtonContainer"
                 *ngFor="#block of toolboxCategory.blocks; #blockIndex=index">
              <button [id]="getOptionId(getOverallIndex(categoryIndex, blockIndex))"
                      (click)="selectBlock(categoryIndex, blockIndex); hideModal();"
                      [ngClass]="{activeButton: activeButtonIndex == getOverallIndex(categoryIndex, blockIndex)}">
                {{getBlockDescription(block)}}
              </button>
            </div>
          </div>
          <hr>
          <div class="blocklyModalButtonContainer">
            <button [id]="getCancelOptionId()" (click)="hideModal()"
                    [ngClass]="{activeButton: activeButtonIndex == totalNumBlocks}">
              {{'CANCEL'|translate}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.ToolboxModalService, blocklyApp.KeyboardInputService,
    blocklyApp.AudioService, blocklyApp.UtilsService, blocklyApp.TreeService,
    blocklyApp.NotificationsService,
    function(
        toolboxModalService_, keyboardInputService_,
        audioService_, utilsService_, treeService_, notificationsService_) {
      this.toolboxModalService = toolboxModalService_;
      this.keyboardInputService = keyboardInputService_;
      this.audioService = audioService_;
      this.utilsService = utilsService_;
      this.treeService = treeService_;
      this.notificationsService = notificationsService_;

      this.modalIsVisible = false;
      this.toolboxCategories = [];
      this.firstBlockIndexes = [];
      this.activeButtonIndex = 0;
      this.totalNumBlocks = null;

      var that = this;
      this.toolboxModalService.registerPreShowHook(
        function(toolboxCategories) {
          that.modalIsVisible = true;
          that.toolboxCategories = toolboxCategories;

          var cumulativeIndex = 0;
          that.toolboxCategories.forEach(function(category) {
            that.firstBlockIndexes.push(cumulativeIndex);
            cumulativeIndex += category.blocks.length;
          });
          that.firstBlockIndexes.push(cumulativeIndex);
          that.totalNumBlocks = cumulativeIndex;

          that.activeButtonIndex = 0;
          that.keyboardInputService.setOverride({
            // Tab key: no-op.
            '9': function(evt) {
              evt.preventDefault();
              evt.stopPropagation();
            },
            // Enter key: selects an action, performs it, and closes the
            // modal.
            '13': function(evt) {
              var button = document.getElementById(
                  that.getOptionId(that.activeButtonIndex));

              for (var i = 0; i < that.toolboxCategories.length; i++) {
                if (that.firstBlockIndexes[i + 1] > that.activeButtonIndex) {
                  var categoryIndex = i;
                  var blockIndex =
                      that.activeButtonIndex - that.firstBlockIndexes[i];

                  that.selectBlock(categoryIndex, blockIndex);
                  break;
                }
              }

              that.hideModal();
            },
            // Escape key: closes the modal.
            '27': function() {
              that.hideModal();
            },
            // Up key: navigates to the previous item in the list.
            '38': function(evt) {
              evt.preventDefault();
              if (that.activeButtonIndex == 0) {
                that.audioService.playOopsSound();
              } else {
                that.activeButtonIndex--;
              }
              that.focusOnOptionIfPossible(that.activeButtonIndex);
            },
            // Down key: navigates to the next item in the list.
            '40': function(evt) {
              evt.preventDefault();
              if (that.activeButtonIndex == that.totalNumBlocks) {
                that.audioService.playOopsSound();
              } else {
                that.activeButtonIndex++;
              }
              that.focusOnOptionIfPossible(that.activeButtonIndex);
            }
          });

          setTimeout(function() {
            document.getElementById('toolboxModal').focus();
          }, 150);
        }
      );
    }
  ],
  getOverallIndex: function(categoryIndex, blockIndex) {
    return this.firstBlockIndexes[categoryIndex] + blockIndex;
  },
  selectBlock: function(categoryIndex, blockIndex) {
    var block = this.toolboxCategories[categoryIndex].blocks[blockIndex];
    var blockDescription = this.getBlockDescription(block);
    var xml = Blockly.Xml.blockToDom(block);
    var newBlockId = Blockly.Xml.domToBlock(blocklyApp.workspace, xml).id;

    var that = this;
    setTimeout(function() {
      that.treeService.focusOnBlock(newBlockId);
      that.notificationsService.setStatusMessage(
          blockDescription + ' added to workspace. ' +
          'Now on added block in workspace.');
    });
  },
  getBlockDescription: function(block) {
    return this.utilsService.getBlockDescription(block);
  },
  // Focuses on the button represented by the given index.
  focusOnOptionIfPossible: function(index) {
    var button = document.getElementById(this.getOptionId(index));
    if (!button.disabled) {
      button.focus();
    } else {
      document.activeElement.blur();
    }
  },
  // Returns the ID for the corresponding option button.
  getOptionId: function(index) {
    return 'toolbox-modal-option-' + index;
  },
  // Returns the ID for the "cancel" option button.
  getCancelOptionId: function() {
    return 'toolbox-modal-option-' + this.totalNumBlocks;
  },
  // Closes the modal.
  hideModal: function() {
    this.modalIsVisible = false;
    this.keyboardInputService.clearOverride();
    this.toolboxModalService.hideModal();
  }
});
