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
 * @fileoverview Angular2 Component that details how a Blockly.Workspace is rendered in BlindBlockly.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    viewInjector: [app.ClipboardService],
    template: `
  <div *ngIf='workspace'>
  <h1>Workspace</h1>
  <ul *ngFor='#block of workspace.topBlocks_'>
    <tree-view [block]='block'></tree-view>
  </ul>
  </div>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: function() {
      if (app.workspace) {
        this.workspace = app.workspace;
      }
    }
  });
