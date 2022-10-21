/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IParameterModel} from '../interfaces/i_parameter_model.js';
import {IProcedureModel} from '../interfaces/i_procedure_model.js';

import type {ISerializer} from '../interfaces/i_serializer.js';
import {ObservableProcedureModel} from '../procedures/observable_procedure_model.js';
import {ObservableParameterModel} from '../procedures/observable_parameter_model.js';
import * as priorities from './priorities.js';
import * as serializationRegistry from './registry.js';
import type {Workspace} from '../workspace.js';


/**
 * Representation of a procedure data model.
 */
export interface State {
  id: string, name: string, returnTypes: string[]|null,
      parameters?: ParameterState[],
}

/**
 * Representation of a parameter data model.
 */
export interface ParameterState {
  id: string, name: string, types?: string[],
}

type ProcedureModelFactory = (workspace: Workspace, name: string, id: string) =>
    IProcedureModel;
type ParameterModelFactory = (workspace: Workspace, name: string, id: string) =>
    IParameterModel;

function saveProcedure(proc: IProcedureModel): State {
  const state: State = {
    id: proc.getId(),
    name: proc.getName(),
    returnTypes: proc.getReturnTypes(),
  };
  if (!proc.getParameters().length) return state;
  state.parameters = proc.getParameters().map((param) => saveParameter(param));
  return state;
}

function saveParameter(param: IParameterModel): ParameterState {
  const state: ParameterState = {
    id: param.getId(),
    name: param.getName(),
  };
  if (!param.getTypes().length) return state;
  state.types = param.getTypes();
  return state;
}

function loadProcedure(
    procedureModelFactory: ProcedureModelFactory,
    parameterModelFactory: ParameterModelFactory, state: State,
    workspace: Workspace): IProcedureModel {
  const proc = procedureModelFactory(workspace, state.name, state.id)
                   .setReturnTypes(state.returnTypes);
  if (!state.parameters) return proc;
  for (const [index, param] of state.parameters.entries()) {
    proc.insertParameter(
        loadParameter(parameterModelFactory, param, workspace), index);
  }
  return proc;
}

function loadParameter(
    parameterModelFactory: ParameterModelFactory, state: ParameterState,
    workspace: Workspace): IParameterModel {
  return parameterModelFactory(workspace, state.name, state.id)
      .setTypes(state.types || []);
}

class ProcedureSerializer implements ISerializer {
  public priority = priorities.PROCEDURES;

  constructor(
      private readonly procedureModelFactory: ProcedureModelFactory,
      private readonly parameterModelFactory: ParameterModelFactory) {}

  save(workspace: Workspace): State[]|null {
    // TODO: use getProcedures().
    return [...workspace.getProcedureMap().values()].map(
        (proc) => saveProcedure(proc));
  }

  load(state: State[], workspace: Workspace) {
    for (const procState of state) {
      loadProcedure(
          this.procedureModelFactory, this.parameterModelFactory, procState,
          workspace);
    }
  }

  clear(workspace: Workspace) {
    workspace.getProcedureMap().clear();
  }
}

serializationRegistry.register(
    'variables',
    new ProcedureSerializer(
        (workspace: Workspace, name: string, id: string) =>
            new ObservableProcedureModel(workspace, id).setName(name),
        (workspace: Workspace, name: string, id: string) =>
            new ObservableParameterModel(workspace, name, id)));
