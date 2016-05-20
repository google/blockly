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
 * @fileoverview Angular2 Component that details how a Blockly.Field is
 * rendered in the toolbox in AccessibleBlockly. Also handles any interactions
 * with the field.
 * @author madeeha@google.com (Madeeha Ghori)
 */
blocklyApp.FieldView = ng.core
  .Component({
    selector: 'field-view',
    template: `
    <li [id]="idMap['listItem']" role="treeitem" *ngIf="isTextInput(field)" 
        [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-input', idMap['input'])" 
        [attr.aria-level]="level"  aria-selected=false>
      <input [id]="idMap['input']" [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)">
    </li>
    <li [id]="idMap['listItem']" *ngIf="isDropdown(field)"
        [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-menu', idMap['label'])" 
        [attr.aria-level]="level" aria-selected=false role="treeitem">
      <label [id]="idMap['label']">{{stringMap['CURRENT_ARGUMENT_VALUE']}} {{field.getText()}}</label>
      <ol role="group" [attr.aria-level]="level+1">
        <li [id]="idMap[optionValue]" role="treeitem" *ngFor="#optionValue of getOptions(field)" 
            [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap[optionValue + 'Button'], 'blockly-button')" 
            [attr.aria-level]="level+1" aria-selected=false>
          <button [id]="idMap[optionValue + 'Button']" (click)="handleDropdownChange(field,optionValue)">
            {{optionText[optionValue]}}
          </button>
        </li>
      </ol>
    </li>
    <li [id]="idMap['listItem']" role="treeitem" 
        *ngIf="isCheckbox(field)" [attr.aria-level]="level" 
        aria-selected=false>
      // Checkboxes not currently supported.
    </li>
    <li [id]="idMap['listItem']" role="treeitem" 
        [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-text', idMap['label'])" 
        *ngIf="isTextField(field) && hasVisibleText(field)" 
        [attr.aria-level]="level" aria-selected=false>
      <label [id]="idMap['label']">
        {{field.getText()}}
      </label>
    </li>
    `,
    inputs: ['field', 'level', 'index', 'parentId'],
  })
  .Class({
    constructor: [blocklyApp.TreeService, blocklyApp.UtilsService, 
        function(_treeService, _utilsService) {
      this.optionText = {
        keys: []
      };
      this.text = '';
      this.treeService = _treeService;
      this.utilsService = _utilsService;
      this.stringMap = {
        'CURRENT_ARGUMENT_VALUE': Blockly.Msg.CURRENT_ARGUMENT_VALUE,
      };
    }],
    ngOnInit: function() {
      var elementsNeedingIds = this.generateElementNames(this.field);
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
    },
    generateElementNames: function(field) {
      var elementNames = ['listItem'];
      switch(true) {
        case this.isTextInput(field):
          elementNames.push('input');
          break;
        case this.isDropdown(field):
          elementNames.push('label');
          var keys = this.getOptions(field);
          for (var i = 0; i < keys.length; i++){
            elementNames.push(keys[i]);
            elementNames.push(keys[i] + 'Button');
          }
          break;
        case this.isTextField(field) && this.hasVisibleText(field):
          elementNames.push('label');
          break;
        default:
          break;
      }
      return elementNames;
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
    hasVisibleText: function(field) {
      var text = field.getText().trim();
      return !!text;
    },
    getOptions: function(field) {
      if (this.optionText.keys.length) {
        return this.optionText.keys;
      }
      var options = field.getOptions_();
      for (var i = 0; i < options.length; i++) {
        var tuple = options[i];
        this.optionText[tuple[1]] = tuple[0];
        this.optionText.keys.push(tuple[1]);
      }
      return this.optionText.keys;
    },
    handleDropdownChange: function(field, text) {
      if (text == 'NO_ACTION') {
        return;
      }
      if (field instanceof Blockly.FieldVariable) {
        blocklyApp.debug && console.log(field);
        Blockly.FieldVariable.dropdownChange.call(field, text);
      } else {
        field.setValue(text);
      }
    }
  });
