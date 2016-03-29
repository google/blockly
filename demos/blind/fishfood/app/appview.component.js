/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how the BlindBlockly app is rendered on the page.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};
app.workspace = app.workspace || new Blockly.Workspace();

app.AppView = ng.core
  .Component({
    selector: 'app',
    template: `
    <div class='treeview'>
    <ol #tree id='tree' class='tree' role='tree' tabIndex=0 (keydown)="treeService.keyHandler($event)">
      <li id='toolbox' class='hasChildren' role='treeitem' aria-level='1' aria-labelledby='toolbox-title' aria-selected=false>
        <toolbox-view>Loading Toolbox...</toolbox-view>
      </li>
      <li id='workspace' class='hasChildren' role='treeitem' aria-level='1' aria-labelledby='workspace-title' aria-selected=false>
        <workspace-view>Loading Workspace...</workspace-view>
      </li>
    </ol>
    </div>
    `,
    directives: [app.ToolboxView, app.WorkspaceView],
    providers: [app.ClipboardService, app.TreeService],
  })
  .Class({
    constructor: [app.ClipboardService, app.TreeService, function(_service1, _service2) {
      this.treeService = _service2;
    }],
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
  });
