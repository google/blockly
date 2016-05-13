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
    <li [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-input', idMap['input'])" aria-selected=false role="treeitem" [attr.aria-level]="level" *ngIf="isTextInput(field)" [id]="idMap['listItem']">
      <input [id]="idMap['input']" [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)">
    </li>
    <li [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-menu', idMap['label'])" aria-selected=false role="treeitem" [attr.aria-level]="level" *ngIf="isDropdown(field)" [id]="idMap['listItem']">
      <label [id]="idMap['label']">current argument value: {{field.getText()}}</label>
      <ol role="group" [attr.aria-level]="level+1">
        <li *ngFor="#optionValue of getOptions(field)" [id]="idMap[optionValue]" [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap[optionValue + 'Button'], 'blockly-button')" role="treeitem" aria-selected=false [attr.aria-level]="level+1">
          <button [id]="idMap[optionValue + 'Button']" (click)="handleDropdownChange(field,optionValue)">{{optionText[optionValue]}}</button>
        </li>
      </ol>
    </li>
    <li aria-selected=false role="treeitem" [id]="idMap['listItem']" [attr.aria-level]="level" *ngIf="isCheckbox(field)">
      // Checkboxes not currently supported.
    </li>
    <li aria-selected=false [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-text', idMap['label'])" role="treeitem" [id]="idMap['listItem']" [attr.aria-level]="level" *ngIf="isTextField(field) && hasVisibleText(field)">
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
    }],
    ngOnInit: function(){
      var elementsNeedingIds = this.generateElementNames(this.field);
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
    },
    generateElementNames: function(field){
      var elementNames = ['listItem'];
      switch(true){
        case this.isTextInput(field):
          elementNames.push('input');
          break;
        case this.isDropdown(field):
          elementNames.push('label');
          var keys = this.getOptions(field);
          for (var i=0; i<keys.length; i++){
            elementNames.push(keys[i]);
            elementNames.push(keys[i]+'Button');
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
      if (this.optionText.keys.length){
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
