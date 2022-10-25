
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ProcedureBase} from './events_procedure_base.js';
import * as registry from '../registry.js';
import * as eventUtils from './utils.js';


export class ProcedureChangeReturn extends ProcedureBase {}

registry.register(
    registry.Type.EVENT,
    eventUtils.PROCEDURE_CHANGE_RETURN,
    ProcedureChangeReturn);
