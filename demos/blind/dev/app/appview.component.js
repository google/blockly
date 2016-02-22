var app = app || {};
app.workspace = app.workspace || new Blockly.Workspace();
app.markedInput;
app.clipboard;

app.AppView = ng.core
  .Component({
    selector: 'app',
    template: `
    <table>
    <tr>
      <td>
        <toolbox-view>Loading Toolbox...</toolbox-view>
      </td>
      <td>
        <workspace-view>Loading Workspace...</workspace-view>
      </td>
    </tr>
    </table>
    `,
    directives: [app.ToolboxView, app.WorkspaceView],
  })
  .Class({
    constructor: function() {
      //this function needs to exist in order for angular to update by both the toolbox and the workspace
    },
    log: function(obj){
      //TODO(madeeha): delete after development is finished
      console.log(obj)
    },
  });
