
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as registry from '../registry.js';

import {ProcedureBase} from './events_procedure_base.js';
import * as eventUtils from './utils.js';


export class ProcedureEnable extends ProcedureBase {}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_ENABLE, ProcedureEnable);
