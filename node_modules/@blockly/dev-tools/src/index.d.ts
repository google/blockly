import * as Blockly from 'blockly/core';
import * as dat from 'dat.gui';

interface FieldGeneratorOptions {
  label?: string;
  args: {[key: string]: unknown};
}

interface PlaygroundTab {
  generate: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  tabElement: HTMLElement;
}

interface PlaygroundAPI {
  addAction: (
    name: string,
    callback: (workspace: Blockly.Workspace) => void,
    folder?: string,
  ) => dat.GUIController;
  addCheckboxAction: (
    name: string,
    callback: (workspace: Blockly.Workspace, value: boolean) => void,
    folder?: string,
    defaultValue?: boolean,
  ) => dat.GUIController;
  addGenerator: (
    label: string,
    generator: Blockly.Generator,
    language?: string,
  ) => void;
  getCurrentTab: () => PlaygroundTab;
  getGUI: () => DevTools.GUI;
  getWorkspace: () => Blockly.WorkspaceSvg;
  removeGenerator: (label: string) => void;
}

declare namespace DevTools {
  /**
   * A basic visualizer for debugging custom renderers.
   */
  export class DebugRenderer extends Blockly.blockRendering.Debug {
    static init(): void;
  }

  /**
   * An extension of dat.GUI with additional functionality.
   */
  export class GUI extends dat.GUI {
    addAction(
      name: string,
      callback: (workspace: Blockly.Workspace) => void,
      folder?: string,
    ): dat.GUIController;
    addCheckboxAction: (
      name: string,
      callback: (workspace: Blockly.Workspace, value: boolean) => void,
      folder?: string,
      defaultValue?: boolean,
    ) => dat.GUIController;
    getWorkspace: () => Blockly.WorkspaceSvg;
  }

  /**
   * Create the Blockly playground.
   *
   * @param container
   * @param createWorkspace
   * @param defaultOptions
   * @param vsEditorPath
   * @returns A promise to the playground API.
   */
  function createPlayground(
    container: HTMLElement,
    createWorkspace?: (
      blocklyDiv: HTMLElement,
      options: Blockly.BlocklyOptions,
    ) => Blockly.Workspace,
    defaultOptions?: Blockly.BlocklyOptions,
    vsEditorPath?: string,
  ): Promise<PlaygroundAPI>;

  /**
   * Use dat.GUI to add controls to adjust configuration of a Blockly workspace.
   *
   * @param createWorkspace
   * @param defaultOptions
   * @returns The dat.GUI instance.
   */
  function addGUIControls(
    createWorkspace: (options: Blockly.BlocklyOptions) => Blockly.Workspace,
    defaultOptions: Blockly.BlocklyOptions,
  ): GUI;

  /**
   * Generates a number of field testing blocks for a specific field and returns
   * the toolbox xml string.
   *
   * @param fieldName
   * @param options
   * @returns The toolbox xml string.
   */
  export function generateFieldTestBlocks(
    fieldName: string,
    options?: FieldGeneratorOptions | FieldGeneratorOptions[],
  ): string;

  /**
   * A toolbox xml with built-in blocks split into categories.
   */
  const toolboxCategories: Blockly.utils.toolbox.ToolboxInfo;

  /**
   * A simple toolbox xml with built-in blocks and no categories.
   */
  const toolboxSimple: Blockly.utils.toolbox.ToolboxInfo;
}

export = DevTools;
