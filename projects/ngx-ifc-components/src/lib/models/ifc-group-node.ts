import { IFCNode } from './ifc-node';
import { IFCValue } from './ifc-value';

export class IFCGroupNode {
  Name: IFCValue;
  children: IFCNode[];
  isGroup: true
}
