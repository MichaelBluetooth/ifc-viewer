import { IfcPropertySet } from "./ifc-property-set";

export interface IFCPropertyData {
  expressId: number;
  globalId: string;
  name: string;
  ifcType: string;
  propertySets: IfcPropertySet[];
}
