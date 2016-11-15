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
 * @fileoverview Angular2 Service that stores the content for custom modals.
 * This is a singleton service.
 *
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.ModalService = ng.core.Class({
  constructor: [function() {
    this.modalHeaderHtml = '';
    this.actionButtonsInfo = [];
    this.preShowHookHtml = null;
    this.modalIsShown = false;
    this.onHideCallback = null;
  }],
  registerPreShowHook: function(preShowHook) {
    this.preShowHook = function() {
      preShowHook(this.modalHeaderHtml, this.actionButtonsInfo);
    };
  },
  isModalShown: function() {
    return this.modalIsShown;
  },
  showModal: function(modalHeaderHtml, actionButtonsInfo, onHideCallback) {
    this.modalHeaderHtml = modalHeaderHtml;
    this.actionButtonsInfo = actionButtonsInfo;
    this.onHideCallback = onHideCallback;

    if (this.preShowHook) {
      this.preShowHook();
    }
    this.modalIsShown = true;
  },
  hideModal: function() {
    this.modalIsShown = false;
    if (this.onHideCallback) {
      this.onHideCallback();
    }
  }
});
