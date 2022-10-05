/** @file Re-exports of Blockly.thrasos.* modules. */

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Re-exports of Blockly.thrasos.* modules.
 *
 * @namespace Blockly.thrasos
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.thrasos');

import {RenderInfo} from './info.js';
import {Renderer} from './renderer.js';


export {Renderer, RenderInfo};
