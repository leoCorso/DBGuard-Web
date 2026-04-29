import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationTransactionDetailPane } from '../notification-transaction-detail-pane/notification-transaction-detail-pane';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationTransactionDTO } from '../../../../interfaces/notification-dto';
import { environment } from '../../../../../environments/environment.development';
import { Card } from 'primeng/card';
import { GuardChangeTransactionDTO } from '../../../../interfaces/guard-change-transaction-dto';
import { PagedResponse } from '../../../../interfaces/request-response-dto';
import { MessageService } from 'primeng/api';
import { GuardChangeDetailPane } from '../../guard-change-detail-pane/guard-change-detail-pane';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-notification-transaction-detail-webpage',
  imports: [NotificationTransactionDetailPane, Card, GuardChangeDetailPane, ProgressSpinner],
  templateUrl: './notification-transaction-detail-webpage.html',
  styleUrl: './notification-transaction-detail-webpage.scss',
})
export class NotificationTransactionDetailWebpage implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  public loadingTransactions = signal<boolean>(true);
  public loadingGuardChange = signal<boolean>(true);
  public notificationTransactionId = signal<number | null>(null);
  public notificationTransactionInfo = signal<NotificationTransactionDTO | null>(null);
  public guardChangeTransaction = signal<GuardChangeTransactionDTO | null>(null);

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(!id){
      this.router.navigate(['/guards/notification-transactions']);
    }  
    this.notificationTransactionId.set(parseInt(id!));
    this.loadDetails();
  }
  private loadDetails(): void {
    this.loadingTransactions.set(true);
    const url = [environment.api.uri, 'NotificationTransactions', 'GetNotificationTransactionDetail'].join('/');
    const params = new HttpParams().set('transactionId', this.notificationTransactionId()!);
    this.httpClient.get<NotificationTransactionDTO>(url, { params: params }).subscribe({
      next: (details: NotificationTransactionDTO) => {
        this.notificationTransactionInfo.set(details);
        this.loadingTransactions.set(false);
        this.getGuardChangeDetails();
      }
    })
  }
  private getGuardChangeDetails(): void {
    this.loadingGuardChange.set(true);
    const url = [environment.api.uri, 'Guards', 'GetGuardChangeTransactions'].join('/');
    const params = new HttpParams()
    .set('filters', `id==${this.notificationTransactionInfo()!.guardChangeTransactionId}`)
    .set('page', 1)
    .set('pageSize', 1);
    this.httpClient.get<PagedResponse<GuardChangeTransactionDTO>>(url, { params: params }).subscribe({
      next: (data: PagedResponse<GuardChangeTransactionDTO>) => {
        if(data.totalItems !== 1 || data.pageNumber !== 1 || data.pageSize !== 1){
          this.messageService.add({summary: 'Error', detail: 'Invalid response while getting guard transaction', severity: 'danger', key: 'request-error'});
          this.router.navigate(['/guards/change-history']);
        }
        const changeHistoryDetail = data.dataItems[0];
        this.guardChangeTransaction.set(changeHistoryDetail);
        this.loadingGuardChange.set(false);
      }
    })
  }
}
