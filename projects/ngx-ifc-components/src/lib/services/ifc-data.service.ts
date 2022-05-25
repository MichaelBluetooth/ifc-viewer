import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { IFCPropertyData } from '../models/ifc-property-data';
import { IfcPropertySet } from '../models/ifc-property-set';
import { IFCValue } from '../models/ifc-value';
import { IFCService } from './ifc.service';

@Injectable()
export class IFCDataService {
  constructor(private ifc: IFCService) {}

  async getProperties(id: number): Promise<IFCPropertyData> {
    const properties = await this.ifc.getItemProperties(id);
    const propData: IFCPropertyData = {
      name: properties.Name.value,
      globalId: properties.GlobalId.value,
      expressId: properties.expressID,
      ifcType: this.ifc.getIFCType(id),
      propertySets: [],
    };

    const propertySets = await this.ifc.getPropertySets(id);
    for (const propertySet of propertySets) {
      const propertySetData: IfcPropertySet = {
        name: propertySet.Name.value,
        values: [],
      };

      if (this.isIfcPropertySet(propertySet)) {
        for (const prop of propertySet.HasProperties) {
          propertySetData.values.push({
            name: prop.Name.value,
            value: prop.NominalValue.value,
          });
        }
      } else if (this.isIfcElementQuantity(propertySet)) {
        for (const quantity of propertySet.Quantities) {
          //NOTE - there is a "quantity.Unit" field, but it always appears to be null
          //NOTE - the "quantity.Description.value" field always appears to store a text representation of the unit
          //NOTE - the "quantity.Description.value" storing the unit appears to be consistant with all measurement types
          const quantityData: IFCValue = {
            name: quantity.Name.value,
            value: null,
            unit: quantity.Description.value,
          };

          //NOTE - each "quantity" here can be IfcQuantityLength, IfcQuantityWeight, IfcQuantityVolume or IfcQuantityArea.
          if (quantity.LengthValue) {
            quantityData.value = quantity.LengthValue.value;
          } else if (quantity.AreaValue) {
            quantityData.value = quantity.AreaValue.value;
          } else if (quantity.WeightValue) {
            quantityData.value = quantity.WeightValue.value;
          } else if (quantity.VolumeValue) {
            quantityData.value = quantity.VolumeValue.value;
          }

          propertySetData.values.push(quantityData);
        }
      }
      propData.propertySets.push(propertySetData);
    }

    return propData;
  }

  async getPropertyData(ids: number[]): Promise<any> {
    let propNames = await this.getPropNames(ids);

    let rawValues: any[] = [];
    for (const id of ids) {
      const rowData: any = {};
      const properties = await this.ifc.getItemProperties(id);
      rowData['name'] = properties.Name.value;
      rowData['globalID'] = properties.GlobalId.value;
      rowData['expressID'] = properties.expressID;
      rowData['ifcType'] = this.ifc.getIFCType(id);

      const propertySets = await this.ifc.getPropertySets(id);
      for (const propertySet of propertySets) {
        if (this.isIfcPropertySet(propertySet)) {
          for (const prop of propertySet.HasProperties) {
            rowData[prop.Name.value] = prop.NominalValue.value;
          }
        } else if (this.isIfcElementQuantity(propertySet)) {
          for (const quantity of propertySet.Quantities) {
            //NOTE - each "quantity" here can be IfcQuantityLength, IfcQuantityWeight, IfcQuantityVolume or IfcQuantityArea.
            if (quantity.LengthValue) {
              rowData[quantity.Name.value] = quantity.LengthValue.value;
            } else if (quantity.AreaValue) {
              rowData[quantity.Name.value] = quantity.AreaValue.value;
            } else if (quantity.WeightValue) {
              rowData[quantity.Name.value] = quantity.WeightValue.value;
            } else if (quantity.VolumeValue) {
              rowData[quantity.Name.value] = quantity.VolumeValue.value;
            }

            //NOTE - there is a "quantity.Unit" field, but it always appears to be null
            //NOTE - the "quantity.Description.value" field always appears to store a text representation of the unit
            //NOTE - the "quantity.Description.value" storing the unit appears to be consistant with all measurement types
            rowData[quantity.Name.value + '_unit'] = quantity.Description.value;
          }
        }
      }
      rawValues.push(rowData);
    }

    return {
      propertyNames: propNames,
      propertyValues: rawValues,
    };
  }

  async readSelected() {
    const ids = this.ifc.selectedIds;
    const data = await this.getPropertyData(ids);
    let propNames = data.propertyNames;
    let rawValues = data.propertyValues;
    let csvData: string = this.toCSV(propNames, rawValues);
    this.downloadData(csvData, 'data.csv');
  }

  isIfcPropertySet(propertySet: any): boolean {
    return (
      // propertySet.constructor.name === 'IfcPropertySet' &&
      propertySet.HasProperties
    );
  }

  isIfcElementQuantity(propertySet: any): boolean {
    return (
      // propertySet.constructor.name === 'IfcElementQuantity' && <--this doesn't work when we build in prod mode!
      propertySet.Quantities
    );
  }

  getPropertyNames(propertySet: any): string[] {
    const names: string[] = [];
    propertySet.HasProperties.forEach((prop: any) => {
      names.push(prop.Name.value);
    });
    return names;
  }

  getMeasurementNames(propertySet: any): string[] {
    const names: string[] = [];
    propertySet.Quantities.forEach((quantity: any) => {
      names.push(quantity.Name.value);
      names.push(quantity.Name.value + '_unit');
    });
    return names;
  }

  async getPropNames(ids: number[]): Promise<string[]> {
    let propNames = new Set<string>();
    propNames.add('globalID');
    propNames.add('expressID');
    propNames.add('name');
    propNames.add('ifcType');
    for (const id of ids) {
      const propertySets = await this.ifc.getPropertySets(id);
      for (const propertySet of propertySets) {
        if (this.isIfcPropertySet(propertySet)) {
          propNames = new Set<string>([
            ...propNames,
            ...this.getPropertyNames(propertySet),
          ]);
        } else if (this.isIfcElementQuantity(propertySet)) {
          propNames = new Set<string>([
            ...propNames,
            ...this.getMeasurementNames(propertySet),
          ]);
        }
      }
    }
    return of(Array.from(propNames)).toPromise();
  }

  toCSV(propNames: string[], rawValues: any): string {
    let csvData: string = '';
    csvData += propNames.join(',');
    rawValues.forEach((rawValue: any) => {
      let csvRow: string[] = [];
      propNames.forEach((propName: string) => {
        csvRow.push(rawValue[propName]);
      });
      csvData += '\n';
      csvData += csvRow.join(',');
    });
    return csvData;
  }

  downloadData(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}
