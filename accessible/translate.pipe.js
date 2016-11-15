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
 * @fileoverview Angular2 Pipe for internationalizing Blockly message strings.
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.TranslatePipe = ng.core
  .Pipe({
    name: 'translate'
  })
  .Class({
    constructor: function() {},
    transform: function(messageId) {
      return Blockly.Msg[messageId];
    }
  });
