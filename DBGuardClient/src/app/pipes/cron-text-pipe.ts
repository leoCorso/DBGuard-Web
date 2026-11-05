import { Pipe, PipeTransform } from '@angular/core';
import cronstrue from 'cronstrue';

@Pipe({
  name: 'cronText',
})
export class CronTextPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return cronstrue.toString(value);
  }
}
