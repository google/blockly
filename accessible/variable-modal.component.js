/**
 * AccessibleBlockly
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Component representing the variable modal.
 *
 * @author corydiers@google.com (Cory Diers)
 */

blocklyApp.VariableModalComponent = ng.core.Component({
  selector: 'blockly-variable-modal',
  template: `
    <div *ngIf="modalIsVisible"class="blocklyModalCurtain"
         (click)="dismissModal()">
      <!-- $event.stopPropagation() prevents the modal from closing when its
      interior is clicked. -->
      <div id="varModal" class="blocklyModal" role="alertdialog"
           (click)="$event.stopPropagation()" tabindex="0"
           aria-labelledby="variableModalHeading">
          <form id="varForm">
            <p id="inputLabel">New Variable Name:
              <input id="mainFieldId" type="text" [ngModel]="VALUE"
                     (ngModelChange)="setTextValue($event)" tabindex="0"
                     aria-labelledby="inputLabel" />
            </p>
            <hr>
            <button id="submitButton" (click)="submit()">
              SUBMIT
            </button>
            <button id="cancelButton" (click)="dismissModal()">
              CANCEL
            </button>
          </form>
      </div>
    </div>
  `,
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.AudioService, blocklyApp.KeyboardInputService, blocklyApp.VariableModalService,
    function(audioService, keyboardService, variableService) {
      this.workspace = blocklyApp.workspace;
      this.variableModalService = variableService;
      this.audioService = audioService;
      this.keyboardInputService = keyboardService
      this.modalIsVisible = false;
      this.activeButtonIndex = -1;
      this.currentVariableName = "";

      var that = this;
      this.variableModalService.registerPreShowHook(
        function(oldName) {
          that.currentVariableName = oldName;
          that.modalIsVisible = true;

          that.keyboardInputService.setOverride({
            // Tab key: navigates to the previous or next item in the list.
            '9': function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              if (evt.shiftKey) {
                // Move to the previous item in the list.
                if (that.activeButtonIndex <= 0) {
                  that.activeActionButtonIndex = 0;
                  that.audioService.playOopsSound();
                } else {
                  that.activeButtonIndex--;
                }
              } else {
                // Move to the next item in the list.
                if (that.activeButtonIndex == that.numInteractiveElements() - 1) {
                  that.audioService.playOopsSound();
                } else {
                  that.activeButtonIndex++;
                }
              }

              that.focusOnOption(that.activeButtonIndex);
            },
            // Escape key: closes the modal.
            '27': function() {
              that.dismissModal();
            },
            // Up key: no-op.
            '38': function(evt) {
              evt.preventDefault();
            },
            // Down key: no-op.
            '40': function(evt) {
              evt.preventDefault();
            }
          });

          setTimeout(function() {
            document.getElementById('mainFieldId').focus();
          }, 150);
        }
      );
    }
  ],
  // Caches the current text variable as the user types.
  setTextValue: function(newValue) {
    this.variableName = newValue;
  },
  // Closes the modal (on both success and failure).
  hideModal_: function() {
    this.modalIsVisible = false;
    this.keyboardInputService.clearOverride();
  },
  // Focuses on the button represented by the given index.
  focusOnOption: function(index) {
    var elements = this.getInteractiveElements();
    var button = elements[index];
    button.focus();
  },
  // Counts the number of interactive elements for the modal.
  numInteractiveElements: function() {
    var elements = this.getInteractiveElements();
    return elements.length;
  },
  // Gets all the interactive elements for the modal.
  getInteractiveElements: function() {
    return Array.prototype.filter.call(
      document.getElementById("varForm").elements, function(element) {
      if (element.type === 'hidden') {
        return false;
      }
      if (element.disabled) {
        return false;
      }
      if (element.tabIndex < 0) {
        return false;
      }
      return true;
    });
  },
  // Submits the name change for the variable.
  submit: function() {
    this.workspace.renameVariable(this.currentVariableName, this.variableName);
    this.hideModal_();
  },
  // Dismisses and closes the modal.
  dismissModal: function() {
    this.hideModal_();
  }
})
