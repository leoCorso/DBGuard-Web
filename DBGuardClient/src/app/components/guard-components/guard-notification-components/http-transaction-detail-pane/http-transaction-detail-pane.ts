import { Component, input } from '@angular/core';
import { HttpNotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { getEnumLabel } from '../../../../helpers/enum-helper';
import { HTTPAction } from '../../../../enums/http-action';
import { mapToArray } from '../../../../helpers/http-notification-record-helper';
import { HttpBodyType } from '../../../../enums/http-body-type';
import { HttpResponseCodes } from '../../../../enums/http-response-codes';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { getHttpSeverity } from '../../../../helpers/http-severity-mapper';

@Component({
  selector: 'app-http-transaction-detail-pane',
  imports: [Tag, Dialog, Button],
  templateUrl: './http-transaction-detail-pane.html',
  styleUrl: './http-transaction-detail-pane.scss',
})
export class HttpTransactionDetailPane {
  public httpTransactionInfo = input.required<HttpNotificationTransactionDTO>();
  public httpMethods = HTTPAction;
  public bodyTypes = HttpBodyType;
  public httpResponseCodes = HttpResponseCodes;
  public getEnumLabel = getEnumLabel;
  public mapToArray = mapToArray;
  public getHttpSeverity = getHttpSeverity;
  public responseMessageVisible = false;
  
  public showResponseMessageDialog(): void {
    this.responseMessageVisible = true;
  }
  prettifyHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const serializer = new XMLSerializer();
    let pretty = serializer.serializeToString(doc);
    
    // Basic indent formatting
    return pretty
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
  public recordHasItem(record: Record<string, string | null>): boolean {
    return Object.keys(record).length > 0;
  }
}
