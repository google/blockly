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
 * @fileoverview Angular2 Component that represents the block options modal.
 *
 * @author sll@google.com (Sean Lip)
 */

goog.provide('blocklyApp.BlockOptionsModalComponent');

goog.require('blocklyApp.AudioService');
goog.require('blocklyApp.BlockOptionsModalService');
goog.require('blocklyApp.KeyboardInputService');
goog.require('blocklyApp.TranslatePipe');

goog.require('Blockly.CommonModal');


blocklyApp.BlockOptionsModalComponent = ng.core.Component({
  selector: 'blockly-block-options-modal',
  template: `
    <div *ngIf="modalIsVisible" class="blocklyModalCurtain"
         (click)="dismissModal()">
      <!-- $event.stopPropagation() prevents the modal from closing when its
      interior is clicked. -->
      <div id="blockOptionsModal" class="blocklyModal" role="alertdialog"
           (click)="$event.stopPropagation()" tabindex="-1"
           aria-labelledby="blockOptionsModalHeading">
        <h3 id="blockOptionsModalHeading">{{'BLOCK_OPTIONS'|translate}}</h3>
        <div role="document">
          <div class="blocklyModalButtonContainer"
               *ngFor="#buttonInfo of actionButtonsInfo; #buttonIndex=index">
            <button [id]="getOptionId(buttonIndex)"
                    (click)="buttonInfo.action(); hideModal();"
                    [ngClass]="{activeButton: activeButtonIndex == buttonIndex}">
              {{buttonInfo.translationIdForText|translate}}
            </button>
          </div>
        </div>

        <div class="blocklyModalButtonContainer">
          <button [id]="getCancelOptionId()"
                  (click)="dismissModal()"
                  [ngClass]="{activeButton: activeButtonIndex == actionButtonsInfo.length}">
            {{'CANCEL'|translate}}
          </button>
        </div>
      </div>
    </div>
  `,
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.BlockOptionsModalService, blocklyApp.KeyboardInputService,
    blocklyApp.AudioService,
    function(blockOptionsModalService_, keyboardInputService_, audioService_) {
      this.blockOptionsModalService = blockOptionsModalService_;
      this.keyboardInputService = keyboardInputService_;
      this.audioService = audioService_;

      this.modalIsVisible = false;
      this.actionButtonsInfo = [];
      this.activeButtonIndex = -1;
      this.onDismissCallback = null;

      var that = this;
      this.blockOptionsModalService.registerPreShowHook(
        function(newActionButtonsInfo, onDismissCallback) {
          that.modalIsVisible = true;
          that.actionButtonsInfo = newActionButtonsInfo;
          that.activeActionButtonIndex = -1;
          that.onDismissCallback = onDismissCallback;

          Blockly.CommonModal.setupKeyboardOverrides(that);
          that.keyboardInputService.addOverride('13', function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              if (that.activeButtonIndex == -1) {
                return;
              }

              var button = document.getElementById(
                  that.getOptionId(that.activeButtonIndex));
              if (that.activeButtonIndex <
                  that.actionButtonsInfo.length) {
                that.actionButtonsInfo[that.activeButtonIndex].action();
              } else {
                that.dismissModal();
              }

              that.hideModal();
            });

          setTimeout(function() {
            document.getElementById('blockOptionsModal').focus();
          }, 150);
        }
      );
    }
  ],
  focusOnOption: function(index) {
    var button = document.getElementById(this.getOptionId(index));
    button.focus();
  },
  // Counts the number of interactive elements for the modal.
  numInteractiveElements: function() {
    return this.actionButtonsInfo.length + 1;
  },
  // Returns the ID for the corresponding option button.
  getOptionId: function(index) {
    return 'block-options-modal-option-' + index;
  },
  // Returns the ID for the "cancel" option button.
  getCancelOptionId: function() {
    return this.getOptionId(this.actionButtonsInfo.length);
  },
  dismissModal: function() {
    this.onDismissCallback();
    this.hideModal();
  },
  // Closes the modal.
  hideModal: function() {
    this.modalIsVisible = false;
    this.keyboardInputService.clearOverride();
    this.blockOptionsModalService.hideModal();
  }
});
