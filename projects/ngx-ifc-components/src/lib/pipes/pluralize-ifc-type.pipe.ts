import { Pipe, PipeTransform } from '@angular/core';
import * as pluralize from 'pluralize';

@Pipe({
  name: 'pluralizeIFCType'
})
export class PluralizeIFCTypePipe implements PipeTransform {
  transform(ifcTypeName: string): unknown {
    // return pluralize(ifcTypeName.replace('IFC', ''));
    return ifcTypeName.replace('IFC', '') + 'S';
  }
}
