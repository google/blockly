/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Re-exports of Blockly.minimalist.* modules.
 */
'use strict';

/**
 * Re-exports of Blockly.minimalist.* modules.
 * @namespace Blockly.minimalist
 */
goog.module('Blockly.minimalist');

const {ConstantProvider} = goog.require('Blockly.minimalist.ConstantProvider');
const {Drawer} = goog.require('Blockly.minimalist.Drawer');
const {RenderInfo} = goog.require('Blockly.minimalist.RenderInfo');
const {Renderer} = goog.require('Blockly.minimalist.Renderer');

exports.ConstantProvider = ConstantProvider;
exports.Drawer = Drawer;
exports.RenderInfo = RenderInfo;
exports.Renderer = Renderer;
