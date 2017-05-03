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
 * @fileoverview Angular2 Service for updating the ARIA live region that
 * allows screenreaders to notify the user about actions that they have taken.
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.NotificationsService = ng.core.Class({
  constructor: [function() {
    this.currentMessage = '';
    this.timeouts = [];
  }],
  setDisplayedMessage_: function(newMessage) {
    this.currentMessage = newMessage;
  },
  getDisplayedMessage: function() {
    return this.currentMessage;
  },
  speak: function(newMessage) {
    // Clear and reset any existing timeouts.
    this.timeouts.forEach(function(timeout) {
      clearTimeout(timeout);
    });
    this.timeouts.length = 0;

    // Clear the current message, so that if, e.g., two operations of the same
    // type are performed, both messages will be read in succession.
    this.setDisplayedMessage_('');

    // We need a non-zero timeout here, otherwise NVDA does not read the
    // notification messages properly.
    var that = this;
    this.timeouts.push(setTimeout(function() {
      that.setDisplayedMessage_(newMessage);
    }, 20));
    this.timeouts.push(setTimeout(function() {
      that.setDisplayedMessage_('');
    }, 5000));
  }
});
