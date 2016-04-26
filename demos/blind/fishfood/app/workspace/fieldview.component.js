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
    <li #listItem aria-selected=false role='treeitem' [attr.aria-level]='level' *ngIf='isTextInput(field)' id='{{createId(listItem)}}'>
      <input #input id='{{createId(input)}}' [ngModel]='field.getValue()' (ngModelChange)='field.setValue($event)'>
      {{setLabelledBy(listItem, concatStringWithSpaces('argument-input', input.id))}}
    </li>
    <li #listItem aria-selected=false role='treeitem' [attr.aria-level]='level' *ngIf='isDropdown(field)' id='{{createId(listItem)}}'>
      <label #label id='{{treeService.createId(label)}}'>current argument value: {{field.getText()}}</label>
      <ol role='group' class='children' [attr.aria-level]='level+1'>
        <li #option *ngFor='#optionValue of getOptions(field)' id='{{treeService.createId(option)}}' role='treeitem' aria-selected=false [attr.aria-level]='level+1'>
          <button #optionButton id='{{treeService.createId(optionButton)}}' (click)="handleDropdownChange(field,optionValue)">{{optionText[optionValue]}} button</button>
        </li>
      </ol>
      {{setLabelledBy(listItem, concatStringWithSpaces('argument-menu', label.id))}}
    </li>
    <li #listItem aria-selected=false role='treeitem' id='{{createId(listItem)}}' [attr.aria-level]='level' *ngIf='isCheckbox(field)'>
      //TODO(madeeha):CHECKBOX
    </li>
    <li #listItem aria-selected=false role='treeitem' id='{{createId(listItem)}}' [attr.aria-level]='level' *ngIf='isTextField(field) && notWhitespace(field)'>
      <label #label id='{{createId(label)}}'>
        {{field.getText()}}
      </label>
      {{setLabelledBy(listItem, concatStringWithSpaces('argument-text', label.id))}}
    </li>
    `,
    inputs: ['field', 'level', 'index', 'parentId'],
  })
  .Class({
    constructor: [app.TreeService, function(_service) {
      this.optionText = {
        keys: []
      };
      this.text = 'Nothing';
      this.treeService = _service;
    }],
    setLabelledBy: function(item,string){
      if (!item.getAttribute('aria-labelledby')) {
        item.setAttribute('aria-labelledby', string);
      }
    },
    concatStringWithSpaces: function(a,b){
      return a + ' ' + b;
    },
    createId: function(obj){
      if (obj && obj.id){
        return obj.id;
      }
      return Blockly.genUid();
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
    handleDropdownChange: function(field, text) {
      if (text == 'NO_ACTION') {
        return;
      }
      if (field instanceof Blockly.FieldVariable) {
        console.log(field);
        Blockly.FieldVariable.dropdownChange.call(field, text);
      } else {
        field.setValue(text);
      }
    },
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
  });
