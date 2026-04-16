import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatRunPeriod',
})
export class FormatRunPeriodPipe implements PipeTransform {
  transform(minutes: number): string {
    let formatString = 'Every ';
    if(minutes === 1){
      return formatString + 'minute';
    }
    return formatString + minutes + ' minutes';
  }
}
