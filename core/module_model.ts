/**
 * @license
 * Copyright 2017 Google LLC
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
 * @file Components for the module model.
 * @author dev@varwin.com (Varwin Developers)
 */

/**
 * Class for a module model.
 *
 * @class
 */
// Former: goog.module('Blockly.ModuleModel');

import * as idGenerator from './utils/idgenerator.js';
import type {Workspace} from './workspace.js';
import {Msg} from './msg.js';

/**
 * Class for a module model.
 * Holds information for the module including name and ID
 */
export class ModuleModel {
  workspace: Workspace;
  name: string;
  _translationKey: string | null;
  private readonly id_: string;
  scrollX: number = 0;
  scrollY: number = 0;
  scale: number = 1;

  constructor(workspace: Workspace, name: string, opt_id: string) {
    this.workspace = workspace;
    this.name = name;
    this._translationKey = Msg[name] ? name : null;
    this.id_ = opt_id || idGenerator.genUid();
  }

  /**
   * Workspace horizontal scrolling offset in pixel units.
   */
  static scrollX: number = 0;

  /**
   * Workspace vertical scrolling offset in pixel units.
   */
  static scrollY: number = 0;

  /**
   * Workspace scale.
   */
  static scale: number = 1;

  /**
   * @returns {string} The ID for the module.
   */
  getId() {
    return this.id_;
  }

  /**
   * @returns {string} Translated or raw module name.
   */
  getName() {
    return this._translationKey ? Msg[this._translationKey] : this.name;
  }
}
