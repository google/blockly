/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how the AccessibleBlockly
 * app is rendered on the page.
 * @author madeeha@google.com (Madeeha Ghori)
 */
blocklyApp.workspace = new Blockly.Workspace();
// If the debug flag is true, print console.logs to help with debugging.
blocklyApp.debug = false;

blocklyApp.AppView = ng.core
  .Component({
    selector: 'blockly-app',
    template: `
    <table>
      <tr>
        <td class="blocklyTable">
          <toolbox-view>Blockly.Msg.TOOLBOX_LOAD_MSG</toolbox-view>
        </td>
        <td class="blocklyTable">
          <workspace-view>Blockly.Msg.WORKSPACE_LOAD_MSG</workspace-view>
        </td>
      </tr>
    </table>
    <label id="blockly-block-summary" aria-hidden="true" hidden>Blockly.Msg.BLOCK_SUMMARY</label>
    <label id="blockly-block-menu" aria-hidden="true" hidden>Blockly.Msg.BLOCK_ACTION_LIST</label>
    <label id="blockly-menu" aria-hidden="true" hidden>Blockly.Msg.OPTION_LIST</label>
    <label id="blockly-argument-menu" aria-hidden="true" hidden>Blockly.Msg.ARGUMENT_OPTIONS_LIST</label>
    <label id="blockly-argument-input" aria-hidden="true" hidden>Blockly.Msg.ARGUMENT_INPUT</label>
    <label id="blockly-argument-block-menu" aria-hidden="true" hidden>Blockly.Msg.ARGUMENT_BLOCK_ACTION_LIST</label>
    <label id="blockly-argument-text" aria-hidden="true" hidden>Blockly.Msg.TEXT</label>
    <label id="blockly-button" aria-hidden="true" hidden>Blockly.Msg.BUTTON</label>
    <label id="blockly-disabled" aria-hidden="true" hidden>Blockly.Msg.UNAVAILABLE</label>
    `,
    directives: [blocklyApp.ToolboxView, blocklyApp.WorkspaceView],
  })
  .Class({
    constructor: function() {
    }
  });
