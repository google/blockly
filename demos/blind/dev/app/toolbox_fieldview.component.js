var app = app || {};

app.ToolboxFieldView = ng.core
  .Component({
    selector: 'toolbox-field-view',
    template: `
    <!-- html representation of a field -->
    <li *ngIf="isTextInput(field)">
      <input [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)">
    </li>

    <li *ngIf="isDropdown(field)">
      <select  [ngModel]="field.getValue()" (ngModelChange)="handleDropdownChange(field,$event)">
          <option value="NO_ACTION" select>select an option</option>
          <option *ngFor="#optionValue of getOptions(field)" selected="{{isSelected(field, optionValue)}}" [value]="optionValue">{{optionText[optionValue]}}</option>
      </select>
    </li>
    <li *ngIf="isCheckbox(field)">
      //TODO(madeeha):CHECKBOX
    </li>
    <li *ngIf="isTextField(field) && notWhitespace(field)">
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
        keys:[]
      };
      this.text="Nothing";
    },
    isTextInput: function(field){
      return field instanceof Blockly.FieldTextInput;
    },
    isDropdown: function(field){
      return field instanceof Blockly.FieldDropdown;
    },
    isCheckbox: function(field){
      return field instanceof Blockly.FieldCheckbox;
    },
    isTextField: function(field){
      return !(field instanceof Blockly.FieldTextInput)
       && !(field instanceof Blockly.FieldDropdown)
       && !(field instanceof Blockly.FieldCheckbox);
    },
    notWhitespace: function(field){
      var text = field.getText().trim();
      return text != '';
    },
    getOptions: function(field){
      this.optionText.keys.length=0;
      for (var i = 0; i<field.getOptions_().length; i++){
        var tuple = field.getOptions_()[i]
        this.optionText[tuple[1]] = tuple[0];
        this.optionText.keys.push(tuple[1]);
      }
      return this.optionText.keys;
    },
    isSelected: function(field,value){
      if (value == field.getValue()){
        //true will result in the "selected" option being ENABLED
        return 'true';
      }
      //undefined will result in the "selected" option being DISABLED
    },
    handleDropdownChange(field,event){
      if (field instanceof Blockly.FieldVariable){
        console.log(event);
        Blockly.FieldVariable.dropdownChange(event);
      } else {
        // console.log(field);
        field.setValue(event);
      }
    }
    ,
    log: function(obj){
      //TODO(madeeha): delete after development is finished
      console.log(obj)
    },


  });
