var app = app || {};
var workspace = workspace || null;

app.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    template: `
<table>
  <tr>
    <td>
      <h3>Block List</h3>
	<ul role="navigation">
        <li>
          <button #button1 aria-pressed="false" (click)="workspaceUpdated(block1,workspaceList, button1, button2, button3, 1)">Block 1</button>
          <ul>
            <li>
             <img src="app/block1.png" alt="image of what block1 traditionally looks like in Blockly">
           </li>
         </ul>
       </li>
       <li>
        <button #button2 aria-pressed="false" (click)="workspaceUpdated(block2, workspaceList, button1, button2, button3, 2)">Block 2</button>
        <ul>
          <li>
           <img src="app/block2.png" alt="image of what block2 traditionally looks like in Blockly">
         </li>
       </ul>
     </li>
     <li>
      <button #button3 aria-pressed="false" (click)="workspaceUpdated(block3, workspaceList, button1, button2, button3, 3)">Block 3</button>
      <ul>
        <li>
          <img src="app/block3.png" alt="image of what block3 traditionally looks like in Blockly">
        </li>
      </ul>
    </li>
  </ul>
</td>
<td>
</td>
<td #workspaceList role="main" tabindex="-1">
<h3>Block Display Area</h3>  
<div *ngIf="workspace">
  <ul *ngFor="#block of workspace.topBlocks_">
    <tree-view [block]="block"></tree-view>
  </ul>
  </div>
</td>
</tr>
</table>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: function() {
      console.log("constructor");
      if (workspace){
        this.workspace = workspace;
      } else {
        this.workspace;
      }
      this.block1 = `
<xml id="startBlocks" style="display: none">
  <block type="controls_if" inline="false" x="20" y="20">
    <mutation else="1"></mutation>
    <value name="IF0">
      <block type="logic_compare" inline="true">
        <field name="OP">EQ</field>
        <value name="A">
          <block type="math_arithmetic" inline="true">
            <field name="OP">MULTIPLY</field>
            <value name="A">
              <block type="math_number">
                <field name="NUM">6</field>
              </block>
            </value>
	    <value name="B">
              <block type="math_number">
                <field name="NUM">7</field>
              </block>
            </value>
          </block>
        </value>
        <value name="B">
          <block type="math_number">
            <field name="NUM">42</field>
          </block>
        </value>
      </block>
    </value>
    <statement name="DO0">
      <block type="text_print" inline="false">
        <value name="TEXT">
          <block type="text">
            <field name="TEXT">Don't panic</field>
          </block>
        </value>
      </block>
    </statement>
    <statement name="ELSE">
      <block type="text_print" inline="false">
        <value name="TEXT">
          <block type="text">
            <field name="TEXT">Panic</field>
          </block>
        </value>
      </block>
    </statement>
  </block>
</xml>
`;
      this.block2 = `
    <xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="variables_set" x="113" y="188">
    <field name="VAR">list</field>
    <value name="VALUE">
      <block type="lists_create_with">
        <mutation items="0"></mutation>
      </block>
    </value>
    <next>
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
        <statement name="DO">
          <block type="lists_setIndex">
            <mutation at="false"></mutation>
            <field name="MODE">INSERT</field>
            <field name="WHERE">LAST</field>
            <value name="LIST">
              <block type="variables_get">
                <field name="VAR">list</field>
              </block>
            </value>
            <value name="TO">
              <block type="text">
                <field name="TEXT">Hello!</field>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="text_print">
            <value name="TEXT">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
              <block type="variables_get">
                <field name="VAR">list</field>
              </block>
            </value>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>
    `;
      this.block3 = `
    <xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="controls_if" x="138" y="63">
    <value name="IF0">
      <block type="logic_boolean">
        <field name="BOOL">TRUE</field>
      </block>
    </value>
    <statement name="DO0">
      <block type="variables_set">
        <field name="VAR">item</field>
        <value name="VALUE">
          <block type="lists_repeat">
            <value name="ITEM">
              <block type="colour_random"></block>
            </value>
            <value name="NUM">
              <shadow type="math_number">
                <field name="NUM">5</field>
              </shadow>
            </value>
          </block>
        </value>
      </block>
    </statement>
  </block>
  <block type="text_print" x="137" y="213">
    <value name="TEXT">
      <shadow type="text">
        <field name="TEXT">abc</field>
      </shadow>
      <block type="variables_get">
        <field name="VAR">item</field>
      </block>
    </value>
  </block>
</xml>
    `;
    },
    workspaceUpdated: function(xmlText, workspaceList, button1, button2, button3, num){
      // Parse the XML into a tree.
      try {
        var xml = Blockly.Xml.textToDom(xmlText)
      } catch (e) {
        alert(e);
        return;
      }
      //make a headless workspace
      workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(workspace, xml);

      this.workspace = workspace;

      //move keyboard focus to the workspace instead of the block list.
      workspaceList.focus();
      switch(num){
        case 1:
          button1.setAttribute("aria-pressed","true");
          button2.setAttribute("aria-pressed","false");
          button3.setAttribute("aria-pressed","false");
          break;
        case 2:
          button1.setAttribute("aria-pressed","false");
          button2.setAttribute("aria-pressed","true");
          button3.setAttribute("aria-pressed","false");
          break;
        case 3:
          button1.setAttribute("aria-pressed","false");
          button2.setAttribute("aria-pressed","false");
          button3.setAttribute("aria-pressed","true");
          break;
      }
      //TODO(madeeha): it would be nice to have non-visual feedback when this completes successfully or not successfully.
    },
  });



