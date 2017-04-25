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
 * @fileoverview Component representing the variable remove modal.
 *
 * @author corydiers@google.com (Cory Diers)
 */

blocklyApp.VariableRemoveModalComponent = ng.core.Component({
  selector: 'blockly-remove-variable-modal',
  template: `
    <div *ngIf="modalIsVisible"class="blocklyModalCurtain"
         (click)="dismissModal()">
      <!-- $event.stopPropagation() prevents the modal from closing when its
      interior is clicked. -->
      <div id="varModal" class="blocklyModal" role="alertdialog"
           (click)="$event.stopPropagation()" tabindex="0"
           aria-labelledby="variableModalHeading">
          <form id="varForm">
            <p id="label">Remove {{count}} instances of
              "{{currentVariableName}}" variable?
            </p>
            <hr>
            <button id="yesButton" (click)="submit()">
              YES
            </button>
            <button id="noButton" (click)="dismissModal()">
              NO
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
      this.count = 0;

      var that = this;
      this.variableModalService.registerPreRemoveShowHook(
        function(name, count) {
          that.currentVariableName = name;
          that.count = count
          that.modalIsVisible = true;

          Blockly.CommonModal.setupKeyboardOverrides(that);

          setTimeout(function() {
            document.getElementById('label').focus();
          }, 150);
        }
      );
    }
  ],
  // Closes the modal (on both success and failure).
  hideModal_: Blockly.CommonModal.hideModal,
  // Focuses on the button represented by the given index.
  focusOnOption: Blockly.CommonModal.focusOnOption,
  // Counts the number of interactive elements for the modal.
  numInteractiveElements: Blockly.CommonModal.numInteractiveElements,
  // Gets all the interactive elements for the modal.
  getInteractiveElements: Blockly.CommonModal.getInteractiveElements,
  // Gets the container with interactive elements.
  getInteractiveContainer: function() {
    return document.getElementById("varForm");
  },
  // Submits the name change for the variable.
  submit: function() {
    blocklyApp.workspace.deleteVariableInternal_(this.currentVariableName);
    this.hideModal_();
  },
  // Dismisses and closes the modal.
  dismissModal: function() {
    this.hideModal_();
  }
})
