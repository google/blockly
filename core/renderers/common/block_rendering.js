/** @fileoverview Namespace for block rendering functionality. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Namespace for block rendering functionality.
 * @namespace Blockly.blockRendering
 */

import * as registry from 'google3/third_party/javascript/blockly/core/registry';
/* eslint-disable-next-line no-unused-vars */
import { Theme } from 'google3/third_party/javascript/blockly/core/theme';
import * as deprecation from 'google3/third_party/javascript/blockly/core/utils/deprecation';

import { Measurable } from '../measurables/base';
import { BottomRow } from '../measurables/bottom_row';
import { Connection } from '../measurables/connection';
import { ExternalValueInput } from '../measurables/external_value_input';
import { Field } from '../measurables/field';
import { Hat } from '../measurables/hat';
import { Icon } from '../measurables/icon';
import { InRowSpacer } from '../measurables/in_row_spacer';
import { InlineInput } from '../measurables/inline_input';
import { InputConnection } from '../measurables/input_connection';
import { InputRow } from '../measurables/input_row';
import { JaggedEdge } from '../measurables/jagged_edge';
import { NextConnection } from '../measurables/next_connection';
import { OutputConnection } from '../measurables/output_connection';
import { PreviousConnection } from '../measurables/previous_connection';
import { RoundCorner } from '../measurables/round_corner';
import { Row } from '../measurables/row';
import { SpacerRow } from '../measurables/spacer_row';
import { SquareCorner } from '../measurables/square_corner';
import { StatementInput } from '../measurables/statement_input';
import { TopRow } from '../measurables/top_row';
import { Types } from '../measurables/types';

import { ConstantProvider } from './constants';
import * as debug from './debug';
import { Debug } from './debugger';
import { Drawer } from './drawer';
import { IPathObject } from './i_path_object';
import { RenderInfo } from './info';
import { MarkerSvg } from './marker_svg';
import { PathObject } from './path_object';
import { Renderer } from './renderer';

/**
 * Returns whether the debugger is turned on.
 * @return Whether the debugger is turned on.
 * @alias Blockly.blockRendering.isDebuggerEnabled
 * @deprecated
 */
export function isDebuggerEnabled(): boolean {
  deprecation.warn(
    'Blockly.blockRendering.isDebuggerEnabled()', 'September 2021',
    'September 2022',
    'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  return debug.isDebuggerEnabled();
}

/**
 * Registers a new renderer.
 * @param name The name of the renderer.
 * @param rendererClass The new renderer class to register.
 * @throws {Error} if a renderer with the same name has already been registered.
 */
export function register(name: string, rendererClass: Function) {
  registry.register(registry.Type.RENDERER, name, rendererClass);
}

/**
 * Unregisters the renderer registered with the given name.
 * @param name The name of the renderer.
 * @alias Blockly.blockRendering.unregister
 */
export function unregister(name: string) {
  registry.unregister(registry.Type.RENDERER, name);
}

/**
 * Turn on the blocks debugger.
 * @alias Blockly.blockRendering.startDebugger
 * @deprecated
 */
export function startDebugger() {
  deprecation.warn(
    'Blockly.blockRendering.startDebugger()', 'September 2021',
    'September 2022',
    'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  debug.startDebugger();
}

/**
 * Turn off the blocks debugger.
 * @alias Blockly.blockRendering.stopDebugger
 * @deprecated
 */
export function stopDebugger() {
  deprecation.warn(
    'Blockly.blockRendering.stopDebugger()', 'September 2021',
    'September 2022',
    'the debug renderer in @blockly/dev-tools (See https://www.npmjs.com/package/@blockly/dev-tools.)');
  debug.stopDebugger();
}

/**
 * Initialize anything needed for rendering (constants, etc).
 * @param name Name of the renderer to initialize.
 * @param theme The workspace theme object.
 * @param opt_rendererOverrides Rendering constant overrides.
 * @return The new instance of a renderer.
 *     Already initialized.
 * @alias Blockly.blockRendering.init
 */
export function init(
  name: string, theme: Theme, opt_rendererOverrides?: object): Renderer {
  const rendererClass = registry.getClass(registry.Type.RENDERER, name);
  const renderer = new rendererClass!(name);
  renderer.init(theme, opt_rendererOverrides);
  return renderer;
}
export { BottomRow };
export { Connection };
export { ConstantProvider };
export { Debug };
export { Drawer };
export { ExternalValueInput };
export { Field };
export { Hat };
export { Icon };
export { InRowSpacer };
export { InlineInput };
export { InputConnection };
export { InputRow };
export { IPathObject };
export { JaggedEdge };
export { MarkerSvg };
export { Measurable };
export { NextConnection };
export { OutputConnection };
export { PathObject };
export { PreviousConnection };
export { Renderer };
export { RenderInfo };
export { RoundCorner };
export { Row };
export { SpacerRow };
export { SquareCorner };
export { StatementInput };
export { TopRow };
export { Types };
