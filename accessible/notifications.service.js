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
 * @fileoverview Angular2 Service that notifies the user about actions that
 * they have taken, by updating an ARIA live region.
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.NotificationsService = ng.core
  .Class({
    constructor: [function() {
      this.statusMessage_ = '';
    }],
    getStatusMessage: function() {
      return this.statusMessage_;
    },
    setStatusMessage: function(newMessage) {
      // Introduce a temporary status message, so that if, e.g., two "copy"
      // operations are done in succession, both messages will be read.
      this.statusMessage_ = '';

      // We need a non-zero timeout here, otherwise NVDA does not read the
      // notification messages properly.
      var that = this;
      setTimeout(function() {
        that.statusMessage_ = newMessage;
      }, 20);
    }
  });
