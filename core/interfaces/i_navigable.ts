import type {Block} from '../block.js';
import type {IASTNodeLocation} from './i_ast_node_location.js';

export interface INavigable extends IASTNodeLocation {
  in(): INavigable | null;
  out(): INavigable | null;
  next(): INavigable | null;
  prev(): INavigable | null;
  isNavigable(): boolean;
  getSourceBlock?(): Block | null;
}
