var app = app || {};

app.TreeView = ng.core
  .Component({
    selector: 'tree-view',
    template: `
<li>
  <label style="color: red">{{block.toString()}}</label>
  <select aria-label="block menu" (change)="blockMenuSelected(block, $event)">
    <option value="NO_ACTION" select>select an action</option>
    <option value="COPY_BLOCK">copy</option>
    <option value="CUT_BLOCK">cut</option>
    <option value="DELETE_BLOCK">delete</option>
  </select>
  <ul>
    <div *ngFor="#inputBlock of block.inputList">
      <field-view *ngFor="#field of getInfo(inputBlock)" [field]="field"></field-view>
      <tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()"></tree-view>
      <li *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()">
        {{inputType(inputBlock.connection)}} input needed:
        <select aria-label="insert input menu" (change)="inputMenuSelected(inputBlock,$event)">
          <option value="NO_ACTION" select>select an action</option>
          <option value="MARK_SPOT">Mark this spot</option>
          <option value="PASTE">Paste</option>
        </select>
      </li>
    </div>
  </ul>
</li>
<li *ngIf= "block.nextConnection && block.nextConnection.targetBlock()">
  <tree-view [block]="block.nextConnection.targetBlock()"></tree-view>
</li>
    `,
    directives : [ng.core.forwardRef(function() { return app.TreeView; }), app.FieldView],
    inputs: ['block'],
  })
  .Class({
    constructor: function() {
      this.infoBlocks = {};
      this.nextBlock = {};
    },
    getInfo: function(block){
      //we're going to list all inputs

      if (this.infoBlocks[block.id]){
        //TODO: is there a situation in which overwriting often unnecessarily is a problem?
        this.infoBlocks[block.id].length = 0;
      } else {
        this.infoBlocks[block.id] = [];
      }

      var blockInfoList = this.infoBlocks[block.id];

      for (var j=0, field; field = block.fieldRow[j]; j++){
        blockInfoList.push(field);
      }

      return this.infoBlocks[block.id];
    },
    inputType: function(connection){
      if (connection.check_) {
        return connection.check_.join(', ').toUpperCase();
      } else {
        return 'any';
      }
    },
    blockMenuSelected: function(block,event){
      switch(event.target.value){
        case "DELETE_BLOCK":
          console.log("delete case");
          block.dispose(true);
          break;
        case "CUT_BLOCK":
          console.log("cut case");
          break;
        default:
          console.log("default case");
          break;
      }
      event.target.selectedIndex=0;
    },
    inputMenuSelected: function(input,event){
      switch(event.target.value){
        case "MARK_SPOT":
          app.markedInput = input;
          break;
        case "PASTE":
          if (app.clipboard){
            if (app.clipboard.workspace.id == app.workspace.id){
              input.connection.connect(app.clipboard.outputConnection);
              //have to deal with error saying that I attempted to connect incompatible types
            } else {
              var xml = Blockly.Xml.blockToDom_(app.clipboard);
              var blockOnProperWorkspace = Blockly.Xml.domToBlock(app.workspace, xml);
              input.connection.connect(blockOnProperWorkspace.outputConnection);
              //have to deal with error saying that I attempted to connect incompatible types
            }
          }
          break;
        default:
          console.log(event.target.value);
          break;
      }
      event.target.selectedIndex=0;
    }
  });
