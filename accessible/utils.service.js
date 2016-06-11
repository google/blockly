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
 * @fileoverview Angular2 utility service for multiple components. All
 * functions in this service should be stateless, since this is a singleton
 * service that is used for the entire application.
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */

var blocklyApp = {};

blocklyApp.UtilsService = ng.core
  .Class({
    constructor: function() {
      blocklyApp.debug && console.log('Utils service constructed');
    },
    generateUniqueId: function() {
      return 'blockly-' + Blockly.genUid();
    },
    generateIds: function(elementsList) {
      var idMap = {};
      for (var i = 0; i < elementsList.length; i++){
        idMap[elementsList[i]] = this.generateUniqueId();
      }
      return idMap;
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel, isDisabled) {
      var attrValue = mainLabel + ' ' + secondLabel;
      if (isDisabled) {
        attrValue += ' blockly-disabled';
      }
      return attrValue;
    },
    getInputTypeLabel: function(connection) {
      // Returns an upper case string in the case of official input type names.
      // Returns the lower case string 'any' if any official input type qualifies.
      // The differentiation between upper and lower case signifies the difference
      // between an input type (BOOLEAN, LIST, etc) and the colloquial english term
      // 'any'.
      if (connection.check_) {
        return connection.check_.join(', ').toUpperCase();
      } else {
        return Blockly.Msg.ANY;
      }
    },
    getBlockTypeLabel: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT) {
        return Blockly.Msg.STATEMENT;
      } else {
        return Blockly.Msg.VALUE;
      }
    }
  });
