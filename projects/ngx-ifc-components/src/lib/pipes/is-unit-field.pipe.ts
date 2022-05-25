import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isUnitField'
})
export class IsUnitFieldPipe implements PipeTransform {
  transform(fieldName: string): unknown {
    return fieldName.endsWith('_unit');
  }
}
