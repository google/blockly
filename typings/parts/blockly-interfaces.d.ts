
declare module Blockly {

  interface BlocklyOptions {
    toolbox?: HTMLElement | string;
    readOnly?: boolean;
    trashcan?: boolean;
    maxTrashcanContents?: number;
    collapse?: boolean;
    comments?: boolean;
    disable?: boolean;
    sounds?: boolean;
    rtl?: boolean;
    horizontalLayout?: boolean;
    toolboxPosition?: string;
    css?: boolean;
    oneBasedIndex?: boolean;
    media?: string;
    theme?: Blockly.BlocklyTheme;
    move?: {
      scrollbars?: boolean;
      drag?: boolean;
      wheel?: boolean;
    };
    grid?: {
      spacing?: number;
      colour?: string;
      length?: number;
      snap?: boolean;
    };
    zoom?: {
      controls?: boolean;
      wheel?: boolean;
      startScale?: number;
      maxScale?: number;
      minScale?: number;
      scaleSpeed?: number;
    };
  }

  interface BlocklyTheme {
    defaultBlockStyles?: {[blocks: string]: Blockly.Theme.BlockStyle;};
    categoryStyles?: {[category: string]: Blockly.Theme.CategoryStyle;};
  }

  interface Metrics {
    absoluteLeft: number;
    absoluteTop: number;
    contentHeight: number;
    contentLeft: number;
    contentTop: number;
    contentWidth: number;
    viewHeight: number;
    viewLeft: number;
    viewTop: number;
    viewWidth: number;
  }

}