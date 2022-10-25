/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ProcedureParameterBase} from './events_procedure_parameter_base.js';
import * as registry from '../registry.js';
import * as eventUtils from './utils.js';


export class ProcedureParameterCreate extends ProcedureParameterBase {}

registry.register(
    registry.Type.EVENT,
    eventUtils.PROCEDURE_PARAMETER_CREATE,
    ProcedureParameterCreate);
