import { IFCNode } from './ifc-node';

export class SpatialTreeNode {
  highlighted?: boolean;
  hidden?: boolean;
  collapsed?: boolean;
  isGroup?: boolean;
  nodeId: string | number;
  label?: string;
  data?: IFCNode;
  children?: SpatialTreeNode[];
}
