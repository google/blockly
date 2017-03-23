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
 * @fileoverview Angular2 Component that renders a "field segment" (a group
 * of non-editable Blockly.Field followed by 0 or 1 editable Blockly.Field)
 * in a block. Also handles any interactions with the field.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.FieldSegmentComponent = ng.core.Component({
  selector: 'blockly-field-segment',
  template: `
    <template [ngIf]="!mainField">
      <label [id]="mainFieldId">{{getPrefixText()}}</label>
    </template>

    <template [ngIf]="mainField">
      <template [ngIf]="isTextInput()">
        {{getPrefixText()}}
        <input [id]="mainFieldId" type="text"
               [ngModel]="mainField.getValue()" (ngModelChange)="setTextValue($event)"
               [attr.aria-label]="getFieldDescription() + '. ' + ('PRESS_ENTER_TO_EDIT_TEXT'|translate)"
               tabindex="-1">
      </template>

      <template [ngIf]="isNumberInput()">
        {{getPrefixText()}}
        <input [id]="mainFieldId" type="number"
               [ngModel]="mainField.getValue()" (ngModelChange)="setNumberValue($event)"
               [attr.aria-label]="getFieldDescription() + '. ' + ('PRESS_ENTER_TO_EDIT_NUMBER'|translate)"
               tabindex="-1">
      </template>

      <template [ngIf]="isDropdown()">
        {{getPrefixText()}}
        <select [id]="mainFieldId" [name]="mainFieldId"
                [ngModel]="mainField.getValue()" (ngModelChange)="setDropdownValue($event)"
                tabindex="-1">
          <option *ngFor="#option of dropdownOptions" value="{{option.value}}"
                  [selected]="mainField.getValue() == option.value">
            {{option.text}}
          </option>
        </select>
      </template>
    </template>
  `,
  inputs: ['prefixFields', 'mainField', 'mainFieldId', 'level'],
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
      blocklyApp.NotificationsService, function(notificationsService) {
    this.notificationsService = notificationsService;
    this.dropdownOptions = [];
  }],
  ngDoCheck: function() {
    if (this.isDropdown()) {
      var rawOptions = this.mainField.getOptions_();
      this.dropdownOptions = rawOptions.map(function(valueAndText) {
        return {
          text: valueAndText[0],
          value: valueAndText[1]
        };
      });
    }
  },
  getPrefixText: function() {
    var prefixTexts = this.prefixFields.map(function(prefixField) {
      return prefixField.getText();
    });
    return prefixTexts.join(' ');
  },
  getFieldDescription: function() {
    var description = this.mainField.getText();
    if (this.prefixFields.length > 0) {
      description = this.getPrefixText() + ': ' + description;
    }
    return description;
  },
  isTextInput: function() {
    return this.mainField instanceof Blockly.FieldTextInput &&
        !(this.mainField instanceof Blockly.FieldNumber);
  },
  isNumberInput: function() {
    return this.mainField instanceof Blockly.FieldNumber;
  },
  isDropdown: function() {
    return this.mainField instanceof Blockly.FieldDropdown;
  },
  setTextValue: function(newValue) {
    this.mainField.setValue(newValue);
  },
  setNumberValue: function(newValue) {
    // Do not permit a residual value of NaN after a backspace event.
    this.mainField.setValue(newValue || 0);
  },
  setDropdownValue: function(optionValue) {
    if (optionValue == 'NO_ACTION') {
      return;
    }

    this.mainField.setValue(optionValue);
    var optionText = undefined;
    for (var i = 0; i < this.dropdownOptions.length; i++) {
      if (this.dropdownOptions[i].value == optionValue) {
        optionText = this.dropdownOptions[i].text;
        break;
      }
    }

    if (!optionText) {
      throw Error(
          'There is no option text corresponding to the value: ' +
          optionValue);
    }

    this.notificationsService.speak('Selected option ' + optionText);
  }
});
