/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Type definitions for Blockly.
 * @author samelh@google.com (Sam El-Husseini)
 */

/// <reference path="core.d.ts" />
/// <reference path="blocks.d.ts" />
/// <reference path="javascript.d.ts" />
/// <reference path="msg/msg.d.ts" />

import { Generator } from 'core/blockly';
export * from './core';
export * from './blocks';
export const JavaScript: Generator;
import './msg/msg';
