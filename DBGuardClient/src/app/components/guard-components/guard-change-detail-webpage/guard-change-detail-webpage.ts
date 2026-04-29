import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { GuardChangeTransactionDTO } from '../../../interfaces/guard-change-transaction-dto';
import { environment } from '../../../../environments/environment.development';
import { PagedResponse } from '../../../interfaces/request-response-dto';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { GuardState } from '../../../enums/guard-state';
import { formatEnumKey, getEnumLabel } from '../../../helper-functions/enum-helper';
import { getGuardStateSeverity } from '../../../helper-functions/guard-state-helper';
import { GuardOperator } from '../../../enums/guard-operator';
import { DatabaseEngine } from '../../../enums/database-engines';
import { GuardNotificationTransactionsTable } from '../guard-notification-components/guard-notification-transactions-table/guard-notification-transactions-table';
import { GuardChangeDetailPane } from '../guard-change-detail-pane/guard-change-detail-pane';
import { GuardDetailPane } from '../guard-detail-pane/guard-detail-pane';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-guard-change-detail-webpage',
  imports: [GuardChangeDetailPane, Card, GuardNotificationTransactionsTable, GuardDetailPane, ProgressSpinner],
  templateUrl: './guard-change-detail-webpage.html',
  styleUrl: './guard-change-detail-webpage.scss',
})
export class GuardChangeDetailWebpage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  public loadingChangeDetail = signal<boolean>(false);
  public changeHistoryId = signal<number | null>(null);
  public changeHistoryDetail = signal<GuardChangeTransactionDTO | null>(null);
  public guardDetail = signal<GuardDetailDTO | null>(null);

  ngOnInit(): void {
    const changeId =  this.activatedRoute.snapshot.paramMap.get('id');
    if(changeId === undefined){
      this.router.navigate(['/guards/change-history']);
    }
    this.changeHistoryId.set(Number(changeId));
    this.getChangeDetailInfo();
  }

  private getChangeDetailInfo(): void {
    this.loadingChangeDetail.set(true);
    const url = [environment.api.uri, 'Guards', 'GetGuardChangeTransactions'].join('/');
    const params = new HttpParams()
    .set('filters', `id==${this.changeHistoryId()!}`)
    .set('page', 1)
    .set('pageSize', 1);
    this.httpClient.get<PagedResponse<GuardChangeTransactionDTO>>(url, { params: params }).subscribe({
      next: (data: PagedResponse<GuardChangeTransactionDTO>) => {
        if(data.totalItems !== 1 || data.pageNumber !== 1 || data.pageSize !== 1){
          this.messageService.add({summary: 'Error', detail: 'Invalid response while getting guard transaction', severity: 'danger', key: 'request-error'});
          this.router.navigate(['/guards/change-history']);
        }
        const changeHistoryDetail = data.dataItems[0];
        this.changeHistoryDetail.set(changeHistoryDetail);
        this.loadingChangeDetail.set(false);
        if(this.changeHistoryDetail()?.guardId){
          this.getGuardDetails();
        }
      }
    })
  }
  private getGuardDetails(): void {
    // Called if change has a guard id
    const url =   [environment.api.uri, 'Guards', 'GetGuardDetail', this.changeHistoryDetail()!.guardId].join('/');
    this.httpClient.get<GuardDetailDTO>(url).subscribe({
      next: (guardDetail: GuardDetailDTO) => {
        this.guardDetail.set(guardDetail);
      }
    })
  }
}
