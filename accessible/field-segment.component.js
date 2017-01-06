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
        <input [id]="mainFieldId" type="text" [disabled]="disabled"
               [ngModel]="mainField.getValue()" (ngModelChange)="mainField.setValue($event)"
               [attr.aria-label]="getFieldDescription() + (disabled ? 'Disabled text field' : 'Press Enter to edit text')"
               tabindex="-1">
      </template>

      <template [ngIf]="isNumberInput()">
        {{getPrefixText()}}
        <input [id]="mainFieldId" type="number" [disabled]="disabled"
               [ngModel]="mainField.getValue()" (ngModelChange)="setNumberValue($event)"
               [attr.aria-label]="getFieldDescription() + (disabled ? 'Disabled number field' : 'Press Enter to edit number')"
               tabindex="-1">
      </template>

      <template [ngIf]="isDropdown()">
        {{getPrefixText()}}
        <select [id]="mainFieldId" [name]="mainFieldId" tabindex="-1"
                [ngModel]="mainField.getValue()"
                (ngModelChange)="handleDropdownChange(mainField, $event)">
          <option *ngFor="#optionValue of getOptions()" value="{{optionValue}}"
                  [selected]="mainField.getValue() == optionValue">
            {{optionText[optionValue]}}
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
      blocklyApp.NotificationsService, blocklyApp.UtilsService,
      function(_notificationsService, _utilsService) {
    this.optionText = {
      keys: []
    };
    this.notificationsService = _notificationsService;
    this.utilsService = _utilsService;
  }],
  ngOnInit: function() {
    var elementsNeedingIds = this.generateElementNames(this.mainField);
    // Warning: this assumes that the elements returned by
    // this.generateElementNames() are unique.
    this.idMap = this.utilsService.generateIds(elementsNeedingIds);
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
  setNumberValue: function(newValue) {
    // Do not permit a residual value of NaN after a backspace event.
    this.mainField.setValue(newValue || 0);
  },
  generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
    return mainLabel + ' ' + secondLabel;
  },
  generateElementNames: function() {
    var elementNames = [];
    if (this.isDropdown()) {
      var keys = this.getOptions();
      for (var i = 0; i < keys.length; i++){
        elementNames.push(keys[i], keys[i] + 'Button');
      }
    }
    return elementNames;
  },
  isNumberInput: function() {
    return this.mainField instanceof Blockly.FieldNumber;
  },
  isTextInput: function() {
    return this.mainField instanceof Blockly.FieldTextInput &&
        !(this.mainField instanceof Blockly.FieldNumber);
  },
  isDropdown: function() {
    return this.mainField instanceof Blockly.FieldDropdown;
  },
  isCheckbox: function() {
    return this.mainField instanceof Blockly.FieldCheckbox;
  },
  isTextField: function() {
    return !(this.mainField instanceof Blockly.FieldTextInput) &&
        !(this.mainField instanceof Blockly.FieldDropdown) &&
        !(this.mainField instanceof Blockly.FieldCheckbox);
  },
  hasVisibleText: function() {
    var text = this.mainField.getText().trim();
    return !!text;
  },
  getOptions: function() {
    if (this.optionText.keys.length) {
      return this.optionText.keys;
    }
    var options = this.mainField.getOptions_();
    for (var i = 0; i < options.length; i++) {
      var tuple = options[i];
      this.optionText[tuple[1]] = tuple[0];
      this.optionText.keys.push(tuple[1]);
    }
    return this.optionText.keys;
  },
  handleDropdownChange: function(field, optionValue) {
    if (optionValue == 'NO_ACTION') {
      return;
    }
    if (this.mainField instanceof Blockly.FieldVariable) {
      Blockly.FieldVariable.dropdownChange.call(this.mainField, optionValue);
    } else {
      this.mainField.setValue(optionValue);
    }

    this.notificationsService.speak(
        'Selected option ' + this.optionText[optionValue]);
  }
});
