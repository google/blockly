var app = app || {};
app.workspace = app.workspace || null;

app.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    template: `
  <div *ngIf="workspace">
  <ul *ngFor="#block of workspace.topBlocks_">
    <tree-view [block]="block"></tree-view>
  </ul>
  </div>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: function() {
      console.log("constructor");
      if (app.workspace){
        this.workspace = app.workspace;
      } else {
        console.log("no workspace");
        this.workspace;
      }
    },
    workspaceUpdated: function(xmlText){
      //This function can be completely empty.
      //Any DOM event will trigger angular to reevaluate all objects
      //and update what is necessary.

      //currently this button reevaluates the XML on the left hand side
      //and makes that the new workspace

      // Parse the XML into a tree.
      try {
        var xml = Blockly.Xml.textToDom(xmlText)
      } catch (e) {
        alert(e);
        return;
      }
      // Create a headless workspace.
      workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(workspace, xml);

      this.workspace = workspace;
      //it would be nice to have non-visual feedback when this completes successfully or not successfully.
    },
  });


