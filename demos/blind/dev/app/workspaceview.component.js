var app = app || {};

app.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    template: `
  <div *ngIf="workspace">
  <h1>Workspace</h1>
  <ul *ngFor="#block of workspace.topBlocks_">
    <tree-view [block]="block"></tree-view>
  </ul>
  </div>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: function() {
      if (app.workspace){
        this.workspace = app.workspace;
      } else {
        console.log("no workspace");
        this.workspace;
      }
    }
  });


