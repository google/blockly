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
    <label id='blockly-block-summary' aria-hidden='true' hidden>block summary</label>
    <label id='blockly-block-menu' aria-hidden='true' hidden>block action list</label>
    <label id='blockly-argument-menu' aria-hidden='true' hidden>argument options list</label>
    <label id='blockly-argument-input' aria-hidden='true' hidden>argument input</label>
    <label id='blockly-argument-block-menu' aria-hidden='true' hidden>argument block action list</label>
    <label id='blockly-argument-text' aria-hidden='true' hidden>text</label>
    <label id='blockly-button' aria-hidden='true' hidden>button</label>
    <label id='blockly-disabled' aria-hidden='true' hidden>unavailable</label>
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
