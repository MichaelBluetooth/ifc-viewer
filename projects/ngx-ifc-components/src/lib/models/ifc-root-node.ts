import { IFCNode } from "./ifc-node";

export interface IFCRootNode {
    children: IFCNode[];
    type: string;
    expressID: number;
}