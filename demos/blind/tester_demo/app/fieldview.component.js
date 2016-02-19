var app = app || {};

app.FieldView = ng.core
  .Component({
    selector: 'field-view',
    template: `
    <!-- html representation of a field -->
    <li *ngIf="isTextInput(field)">
      <input [ngModel]="field.getValue()" (ngModelChange)="field.setValue($event)" aria-required="true" aria-live="assertive">
    </li>
    <! -- {{log(field.getText())}} "variable and first are going through this bit of code 10 times on a page load. It should only be once." -->
    <!-- {{log(getOptions(field))}} "gets called 10 times" -->

    <li *ngIf="isDropdown(field)">
      <select  [ngModel]="field.getValue()" (ngModelChange)="handleDropdownChange(field,$event)">
          <!-- "this line is being called wayy to often?? Shouldn't it only be called twice?" -->
          <!-- "this isn't always true. Sometimes we want the dropdown selection to do something instead of set something." -->
          <option *ngFor="#optionValue of getOptions(field)" selected="{{isSelected(field, optionValue)}}" [value]="optionValue">{{optionText[optionValue]}}</option>
      </select>
    </li>
    <li *ngIf="isCheckbox(field)">
      //TODO(madeeha): Properly handle checkboxes.
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
        return 'true';
      }
    },
    handleDropdownChange(field,event){
      if (field instanceof Blockly.FieldVariable){
        console.log(event);
        switch (event) {
          case Blockly.Msg.RENAME_VARIABLE:
            //TODO(madeeha): create an alert box that allows the user to change the name of the variable and affects the workspace.
	    break;
          case Blockly.Msg.NEW_VARIABLE:
            break;
          default:
            console.log("Unhandled event " + event + " from field " + field);
            break;
        }
      } else {
        field.setValue(event);
      }
    }
    ,
    log: function(obj){
      //TODO(madeeha): delete after development is finished
      console.log(obj)
    },


  });
