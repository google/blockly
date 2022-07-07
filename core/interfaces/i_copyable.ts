/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is copyable.
 */

/**
 * The interface for an object that is copyable.
 * @namespace Blockly.ICopyable
 */
import * as goog from '../../closure/goog/goog';
goog.declareModuleId('Blockly.ICopyable');

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from '../workspace_svg';

import {ISelectable} from './i_selectable';


/** @alias Blockly.ICopyable */
export interface ICopyable extends ISelectable {
  /**
   * Encode for copying.
   * @return Copy metadata.
   * @internal
   */
  toCopyData: AnyDuringMigration;
}

export namespace ICopyable {
  export interface CopyData {
    saveInfo: AnyDuringMigration|Element;
    source: WorkspaceSvg;
    typeCounts: AnyDuringMigration|null;
  }
}

export type CopyData = ICopyable.CopyData;
