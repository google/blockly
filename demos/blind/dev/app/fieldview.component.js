var app = app || {};

app.FieldView = ng.core
  .Component({
    selector: 'field-view',
    template: `
    <!-- html representation of a field -->
    <li *ngIf="isTextInput(field)">
      <input [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)">
    </li>
    <! -- {{log(field.getText())}} "variable and first are going through this bit of code 10 times on a page load. It should only be once." -->
    <!-- {{log(getOptions(field))}} "gets called 10 times" -->

    <li *ngIf="isDropdown(field)">
      <select  [ngModel]="field.getValue()" (ngModelChange)="handleDropdownChange(field,$event)">
          <!-- "this line is being called wayy to often?? Shouldn't it only be called twice?" -->
          <!-- "this isn't always true. Sometimes we want the dropdown selection to do something instead of set something." -->
          <option value="NO_ACTION">select an option</option>
          <option *ngFor="#optionValue of getOptions(field)" selected="{{isSelected(field, optionValue)}}" [value]="optionValue">{{optionText[optionValue]}}</option>
      </select>
    </li>
    <li *ngIf="isCheckbox(field)">
      //TODO:CHECKBOX
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
      //TODO: should I be just setting field to this.field instead or is that not how inputs work?
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
      //I'm pretty sure this is also going to get called like 10 times on a page load...
      this.optionText.keys.length=0; //not 100% sure on this line
      for (var i = 0; i<field.getOptions_().length; i++){
        var tuple = field.getOptions_()[i]
        this.optionText[tuple[1]] = tuple[0];
        this.optionText.keys.push(tuple[1]);
      }
      return this.optionText.keys;
    },
    isSelected: function(field,value){
      //the reason this function works is terrible
      if (value == field.getValue()){
        return 'true';
      }
    },
    handleDropdownChange(field,event){
      if (field instanceof Blockly.FieldVariable){
	  console.log(event);
        Blockly.FieldVariable.dropdownChange(event);
      } else {
        // console.log(field);
        field.setValue(event);
      }
      event.target.selectedIndex=0;
    }
    ,
    log: function(obj){
      //TODO: delete after development is finished
      console.log(obj)
    },


  });

//(ngModelChange)="handleDropdownChange(field,$event)"
//{{optionText[optionValue]}}
