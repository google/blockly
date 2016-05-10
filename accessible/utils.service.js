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
 * @fileoverview Angular2 Service with functions required by multiple
 * components.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var blocklyApp = {};
blocklyApp.UtilsService = ng.core
  .Class({
    constructor: function() {
    },
    concatStringWithSpaces: function() {
      var string = arguments[0];
      for (i = 1; i < arguments.length; i++) {
        var arg = arguments[i];
        // arg can be undefined and if so, should be ignored.
        if (arg) {
          string += ' ' + arg;
        }
      }
      return string;
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
        return 'any';
      }
    },
    getBlockTypeLabel: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT) {
        return 'statement';
      } else {
        return 'value';
      }
    },
    getMarkedBlockCompatibilityHTMLText: function(isCompatible) {
      if (isCompatible) {
        // undefined will result in the
        // 'copy to marked block' option being ENABLED.
        return undefined;
      } else {
        // Anything will result in the
        // 'copy to marked block' option being DISABLED.
        return 'blockly-disabled';
      }
    },
    setLabelledBy: function(item, id) {
      if (!item.getAttribute('aria-labelledby')) {
        item.setAttribute('aria-labelledby', id);
      }
    }
});
