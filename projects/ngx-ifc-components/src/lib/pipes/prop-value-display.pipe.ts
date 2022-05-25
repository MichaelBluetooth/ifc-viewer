import { Pipe, PipeTransform } from '@angular/core';
import { IFCValue } from '../models/ifc-value';

@Pipe({
  name: 'propValueDisplay',
})
export class PropValueDisplayPipe implements PipeTransform {
  transform(property: IFCValue): string {
    let display: string = property.value.toString();
    if (property.unit) {
      display = `${(+property.value).toFixed(4)} ${property.unit}`;
    }
    return display;
  }
}
