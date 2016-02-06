var app = app || {};
app.toolbox = app.toolbox || new Blockly.Workspace();
app.toolboxInfo = app.toolboxInfo || null;

app.ToolboxView = ng.core
  .Component({
    selector: 'toolbox-view',
    template: `
    <ul *ngFor="#block of toolbox.topBlocks_">
    <tree-view [block]="block"></tree-view>
    </ul>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: function() {
      console.log("toolbox constructor");
      // try {
      //   var xml = Blockly.Xml.textToDom(app.toolboxXml)
      //   console.log(xml);
      // } catch (e) {
      //   alert(e);
      //   return;
      // }
      // Blockly.Xml.domToWorkspace(app.toolbox, xml);
      this.toolbox = app.toolbox;
    },
  });

