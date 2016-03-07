/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how a Blockly.Field is
 * rendered in the toolbox in BlindBlockly. Also handles any interactions
 * with the field.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.FieldView = ng.core
  .Component({
    selector: 'field-view',
    template: `
    <!-- html representation of a field -->
    <li *ngIf='isTextInput(field)'>
      <input [ngModel]='field.getValue()' (ngModelChange)='field.setValue($event)'>
    </li>
    <li *ngIf='isDropdown(field)'>
      <select [ngModel]='field.getValue()' (ngModelChange)='handleDropdownChange(field,$event)'>
      <option value='NO_ACTION' select>select an option</option>
      <option *ngFor='#optionValue of getOptions(field)' selected='{{isSelected(field, optionValue)}}' [value]='optionValue'>{{optionText[optionValue]}}</option>
      </select>
    </li>
    <li *ngIf='isCheckbox(field)'>
      //TODO(madeeha):CHECKBOX
    </li>
    <li *ngIf='isTextField(field) && notWhitespace(field)'>
      <label>
        {{field.getText()}}
      </label>
    </li>
    `,
    inputs: ['field'],
  })
  .Class({
    constructor: function() {
      this.optionText = {
        keys: []
      };
      this.text = 'Nothing';
    },
    isTextInput: function(field) {
      return field instanceof Blockly.FieldTextInput;
    },
    isDropdown: function(field) {
      return field instanceof Blockly.FieldDropdown;
    },
    isCheckbox: function(field) {
      return field instanceof Blockly.FieldCheckbox;
    },
    isTextField: function(field) {
      return !(field instanceof Blockly.FieldTextInput) &&
          !(field instanceof Blockly.FieldDropdown) &&
          !(field instanceof Blockly.FieldCheckbox);
    },
    notWhitespace: function(field) {
      var text = field.getText().trim();
      return !!text;
    },
    getOptions: function(field) {
      this.optionText.keys.length = 0;
      var options = field.getOptions_();
      for (var i = 0; i < options.length; i++) {
        var tuple = options[i];
        this.optionText[tuple[1]] = tuple[0];
        this.optionText.keys.push(tuple[1]);
      }
      return this.optionText.keys;
    },
    isSelected: function(field, value) {
      if (value == field.getValue()) {
        //true will result in the 'selected' option being ENABLED
        return 'true';
      }
      //undefined will result in the 'selected' option being DISABLED
    },
    handleDropdownChange: function(field, event) {
      if (field instanceof Blockly.FieldVariable) {
        Blockly.FieldVariable.dropdownChange(event);
      } else {
        field.setValue(event);
      }
    },
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
  });
