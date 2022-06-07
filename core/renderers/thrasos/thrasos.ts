/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Re-exports of Blockly.thrasos.* modules.
 */
'use strict';

/**
 * Re-exports of Blockly.thrasos.* modules.
 * @namespace Blockly.thrasos
 */
goog.module('Blockly.thrasos');

const {RenderInfo} = goog.require('Blockly.thrasos.RenderInfo');
const {Renderer} = goog.require('Blockly.thrasos.Renderer');

exports.RenderInfo = RenderInfo;
exports.Renderer = Renderer;
