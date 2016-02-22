var app = app || {};

app.ToolboxTreeView = ng.core
  .Component({
    selector: 'toolbox-tree-view',
    template: `
<li>
  <label style="color:red">{{block.toString()}}</label>
  <select *ngIf="displayBlockMenu" aria-label="toolbar block menu" (change)="blockMenuSelected(block,$event)">
    <option value="NO_ACTION" select>select an action</option>
    <option value="MOVE_TO_WORKSPACE">copy to workspace</option>
    <option value="COPY_BLOCK">copy to Blockly clipboard</option>
    <option value="SEND_TO_SELECTED" disabled="{{notCompatibleWithMarkedBlock(block)}}">copy to selected input</option>
  </select>
  <ul>
    <div *ngFor="#inputBlock of block.inputList">
      <toolbox-field-view *ngFor="#field of getInfo(inputBlock)" [field]="field"></toolbox-field-view>
      <toolbox-tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [displayBlockMenu]="false"></toolbox-tree-view>
      <li *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()">
        {{inputType(inputBlock.connection)}} input needed
      </li>
    </div>
  </ul>
</li>
<li *ngIf= "block.nextConnection && block.nextConnection.targetBlock()">
  <toolbox-tree-view [block]="block.nextConnection.targetBlock()" [displayBlockMenu]="false"></toolbox-tree-view>
</li>
    `,
    directives : [ng.core.forwardRef(function() { return app.ToolboxTreeView; }), app.ToolboxFieldView],
    inputs: ['block','displayBlockMenu'],
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
        case "MOVE_TO_WORKSPACE":
          var xml = Blockly.Xml.blockToDom_(block);
          var block = Blockly.Xml.domToBlock(app.workspace, xml);
          console.log("added block to workspace");
          break;
        case "SEND_TO_SELECTED":
          var xml = Blockly.Xml.blockToDom_(block);
          var blockOnProperWorkspace = Blockly.Xml.domToBlock(app.workspace, xml);
          app.markedInput.connection.connect(blockOnProperWorkspace.outputConnection || blockOnProperWorkspace.previousConnection);
          break;
        case "COPY_BLOCK":
          app.clipboard = block;
          break;
        default:
          console.log("default case");
          break;
      }
      event.target.selectedIndex=0;
    },
    notCompatibleWithMarkedBlock: function(block){
      var blockConnection = block.outputConnection || block.previousConnection;
      if (app.markedInput && blockConnection){
        if(Blockly.OPPOSITE_TYPE[blockConnection.type] == app.markedInput.connection.type && app.markedInput.connection.checkType_(blockConnection)){
            //undefined will result in the "copy to marked block" option being ENABLED
            return undefined;
          } else {
          //true will result in the "copy to marked block" option being DISABLED
          return true;
          }
      } else {
        return true;
      }
    }
  });
