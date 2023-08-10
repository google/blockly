/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IParameterModel} from '../interfaces/i_parameter_model.js';
import {IProcedureModel} from '../interfaces/i_procedure_model.js';
import type {ISerializer} from '../interfaces/i_serializer.js';
import * as priorities from './priorities.js';
import type {Workspace} from '../workspace.js';

/**
 * Representation of a procedure data model.
 */
export interface State {
  // TODO: This should also handle enabled.
  id: string;
  name: string;
  returnTypes: string[] | null;
  parameters?: ParameterState[];
}

/**
 * Representation of a parameter data model.
 */
export interface ParameterState {
  id: string;
  name: string;
  types?: string[];
}

/**
 * A newable signature for an IProcedureModel.
 *
 * Refer to
 * https://www.typescriptlang.org/docs/handbook/2/generics.html#using-class-types-in-generics
 * for what is going on with this.
 */
type ProcedureModelConstructor<ProcedureModel extends IProcedureModel> = new (
  workspace: Workspace,
  name: string,
  id: string,
) => ProcedureModel;

/**
 * A newable signature for an IParameterModel.
 *
 * Refer to
 * https://www.typescriptlang.org/docs/handbook/2/generics.html#using-class-types-in-generics
 * for what is going on with this.
 */
type ParameterModelConstructor<ParameterModel extends IParameterModel> = new (
  workspace: Workspace,
  name: string,
  id: string,
) => ParameterModel;

/**
 * Serializes the given IProcedureModel to JSON.
 *
 * @internal
 */
export function saveProcedure(proc: IProcedureModel): State {
  const state: State = {
    id: proc.getId(),
    name: proc.getName(),
    returnTypes: proc.getReturnTypes(),
  };
  if (!proc.getParameters().length) return state;
  state.parameters = proc.getParameters().map((param) => saveParameter(param));
  return state;
}

/**
 * Serializes the given IParameterModel to JSON.
 *
 * @internal
 */
export function saveParameter(param: IParameterModel): ParameterState {
  const state: ParameterState = {
    id: param.getId(),
    name: param.getName(),
  };
  if (!param.getTypes().length) return state;
  state.types = param.getTypes();
  return state;
}

/**
 * Deserializes the given procedure model State from JSON.
 *
 * @internal
 */
export function loadProcedure<
  ProcedureModel extends IProcedureModel,
  ParameterModel extends IParameterModel,
>(
  procedureModelClass: ProcedureModelConstructor<ProcedureModel>,
  parameterModelClass: ParameterModelConstructor<ParameterModel>,
  state: State,
  workspace: Workspace,
): ProcedureModel {
  const proc = new procedureModelClass(
    workspace,
    state.name,
    state.id,
  ).setReturnTypes(state.returnTypes);
  if (!state.parameters) return proc;
  for (const [index, param] of state.parameters.entries()) {
    proc.insertParameter(
      loadParameter(parameterModelClass, param, workspace),
      index,
    );
  }
  return proc;
}

/**
 * Deserializes the given ParameterState from JSON.
 *
 * @internal
 */
export function loadParameter<ParameterModel extends IParameterModel>(
  parameterModelClass: ParameterModelConstructor<ParameterModel>,
  state: ParameterState,
  workspace: Workspace,
): ParameterModel {
  const model = new parameterModelClass(workspace, state.name, state.id);
  if (state.types) model.setTypes(state.types);
  return model;
}

/** Serializer for saving and loading procedure state. */
export class ProcedureSerializer<
  ProcedureModel extends IProcedureModel,
  ParameterModel extends IParameterModel,
> implements ISerializer
{
  public priority = priorities.PROCEDURES;

  /**
   * Constructs the procedure serializer.
   *
   * Example usage:
   *   new ProcedureSerializer(MyProcedureModelClass, MyParameterModelClass)
   *
   * @param procedureModelClass The class (implementing IProcedureModel) that
   *     you want this serializer to deserialize.
   * @param parameterModelClass The class (implementing IParameterModel) that
   *     you want this serializer to deserialize.
   */
  constructor(
    private readonly procedureModelClass: ProcedureModelConstructor<ProcedureModel>,
    private readonly parameterModelClass: ParameterModelConstructor<ParameterModel>,
  ) {}

  /** Serializes the procedure models of the given workspace. */
  save(workspace: Workspace): State[] | null {
    const save = workspace
      .getProcedureMap()
      .getProcedures()
      .map((proc) => saveProcedure(proc));
    return save.length ? save : null;
  }

  /**
   * Deserializes the procedures models defined by the given state into the
   * workspace.
   */
  load(state: State[], workspace: Workspace) {
    const map = workspace.getProcedureMap();
    for (const procState of state) {
      map.add(
        loadProcedure(
          this.procedureModelClass,
          this.parameterModelClass,
          procState,
          workspace,
        ),
      );
    }
  }

  /** Disposes of any procedure models that exist on the workspace. */
  clear(workspace: Workspace) {
    workspace.getProcedureMap().clear();
  }
}
