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
          <toolbox-view>{{stringMap['TOOLBOX_LOAD']}}</toolbox-view>
        </td>
        <td class="blocklyTable">
          <workspace-view>{{stringMap['WORKSPACE_LOAD']}}</workspace-view>
        </td>
      </tr>
    </table>
    <label id="blockly-block-summary" aria-hidden="true" hidden>{{stringMap['BLOCK_SUMMARY']}}</label>
    <label id="blockly-block-menu" aria-hidden="true" hidden>{{stringMap['BLOCK_ACTION_LIST']}}</label>
    <label id="blockly-menu" aria-hidden="true" hidden>{{stringMap['OPTION_LIST']}}</label>
    <label id="blockly-argument-menu" aria-hidden="true" hidden>{{stringMap['ARGUMENT_OPTIONS_LIST']}}</label>
    <label id="blockly-argument-input" aria-hidden="true" hidden>{{stringMap['ARGUMENT_INPUT']}}</label>
    <label id="blockly-argument-block-menu" aria-hidden="true" hidden>{{stringMap['ARGUMENT_BLOCK_ACTION_LIST']}}</label>
    <label id="blockly-argument-text" aria-hidden="true" hidden>{{stringMap['TEXT']}}</label>
    <label id="blockly-button" aria-hidden="true" hidden>{{stringMap['BUTTON']}}</label>
    <label id="blockly-disabled" aria-hidden="true" hidden>{{stringMap['UNAVAILABLE']}}</label>
    `,
    directives: [blocklyApp.ToolboxView, blocklyApp.WorkspaceView],
    // ClipboardService declared here so that all components are using the same
    // instance of the clipboard.
    // https://www.sitepoint.com/angular-2-components-providers-classes-factories-values/
    providers: [blocklyApp.ClipboardService]
  })
  .Class({
    constructor: function() {
      this.stringMap = {
        ['TOOLBOX_LOAD']: Blockly.Msg.TOOLBOX_LOAD_MSG,
        ['WORKSPACE_LOAD']: Blockly.Msg.WORKSPACE_LOAD_MSG,
        ['BLOCK_SUMMARY']: Blockly.Msg.BLOCK_SUMMARY,
        ['BLOCK_ACTION_LIST']: Blockly.Msg.BLOCK_ACTION_LIST,
        ['OPTION_LIST']: Blockly.Msg.OPTION_LIST,
        ['ARGUMENT_OPTIONS_LIST']: Blockly.Msg.ARGUMENT_OPTIONS_LIST,
        ['UNAVAILABLE']: Blockly.Msg.UNAVAILABLE,
        ['BUTTON']: Blockly.Msg.BUTTON,
        ['TEXT']: Blockly.Msg.TEXT,
        ['ARGUMENT_BLOCK_ACTION_LIST']: Blockly.Msg.ARGUMENT_BLOCK_ACTION_LIST,
        ['ARGUMENT_INPUT']: Blockly.Msg.ARGUMENT_INPUT
      };
    }
  });
