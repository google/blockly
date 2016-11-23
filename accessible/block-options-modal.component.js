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

blocklyApp.BlockOptionsModalComponent = ng.core.Component({
  selector: 'blockly-block-options-modal',
  template: `
    <div *ngIf="modalIsVisible" id="blockOptionsModal" role="dialog" tabindex="-1">
      <div (click)="hideModal()" class="blocklyModalCurtain">
        <!-- The $event.stopPropagation() here prevents the modal from
        closing when its interior is clicked. -->
        <div class="blocklyModal" (click)="$event.stopPropagation()" role="document">
          <h3>Block Options</h3>

          <div class="blocklyModalButtonContainer"
               *ngFor="#buttonInfo of actionButtonsInfo; #i=index">
            <button [id]="getOptionId(i)" (click)="buttonInfo.action(); hideModal();"
                    [disabled]="buttonInfo.isDisabled()"
                    [ngClass]="{activeButton: activeActionButtonIndex == i}">
              {{buttonInfo.translationIdForText|translate}}
            </button>
          </div>
          <div class="blocklyModalButtonContainer">
            <button [id]="getCancelOptionId()" (click)="hideModal()"
                    [ngClass]="{activeButton: activeActionButtonIndex == actionButtonsInfo.length}">
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
    blocklyApp.BlockOptionsModalService, blocklyApp.KeyboardInputService,
    blocklyApp.AudioService,
    function(blockOptionsModalService_, keyboardInputService_, audioService_) {
      this.blockOptionsModalService = blockOptionsModalService_;
      this.keyboardInputService = keyboardInputService_;
      this.audioService = audioService_;

      this.modalIsVisible = false;
      this.actionButtonsInfo = [];
      this.activeActionButtonIndex = 0;
      this.onCancelCallback = null;

      var that = this;
      this.blockOptionsModalService.registerPreShowHook(
        function(newActionButtonsInfo, onCancelCallback) {
          that.modalIsVisible = true;
          that.actionButtonsInfo = newActionButtonsInfo;
          that.activeActionButtonIndex = 0;
          that.onCancelCallback = onCancelCallback;

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
                  that.getOptionId(that.activeActionButtonIndex));
              if (button.disabled) {
                evt.preventDefault();
                evt.stopPropagation();
                return;
              }

              if (that.activeActionButtonIndex <
                  that.actionButtonsInfo.length) {
                that.actionButtonsInfo[that.activeActionButtonIndex].action();
              } else {
                that.onCancelCallback();
              }

              that.hideModal();
            },
            // Escape key: closes the modal.
            '27': function() {
              that.onCancelCallback();
              that.hideModal();
            },
            // Up key: navigates to the previous item in the list.
            '38': function(evt) {
              evt.preventDefault();
              if (that.activeActionButtonIndex == 0) {
                that.audioService.playOopsSound();
              } else {
                that.activeActionButtonIndex--;
              }
              that.focusOnOptionIfPossible(that.activeActionButtonIndex);
            },
            // Down key: navigates to the next item in the list.
            '40': function(evt) {
              evt.preventDefault();
              if (that.activeActionButtonIndex ==
                  that.actionButtonsInfo.length) {
                that.audioService.playOopsSound();
              } else {
                that.activeActionButtonIndex++;
              }
              that.focusOnOptionIfPossible(that.activeActionButtonIndex);
            }
          });

          setTimeout(function() {
            document.getElementById('blockOptionsModal').focus();
          }, 150);
        }
      );
    }
  ],
  // Focuses on the button represented by the given index, if the button
  // is not disabled. Otherwise, removes any existing focus.
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
    return 'modal-option-' + index;
  },
  // Returns the ID for the "cancel" option button.
  getCancelOptionId: function() {
    return this.getOptionId(this.actionButtonsInfo.length);
  },
  // Closes the modal.
  hideModal: function() {
    this.modalIsVisible = false;
    this.keyboardInputService.clearOverride();
    this.blockOptionsModalService.hideModal();
  }
});
