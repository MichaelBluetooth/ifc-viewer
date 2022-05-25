import { IFCValue } from "./ifc-value";

export interface IFCNode {
    children: IFCNode[];
    type: string;
    expressID: number;
    GlobalId: IFCValue;
    Name: IFCValue;

    //Lots more fields, do we need them?
    // RefLatitude: IFCValue[];
    // RefLongitude: IFCValue[];
    // RefElevation: IFCValue;
    // ObjectPlacement: IFCValue;

    //Not an IFC prop!!
    isGroup: boolean;
}