import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateGuardDTO, GuardDetailDTO } from '../../../interfaces/guard-dto';
import { Card } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { GuardOperator } from '../../../enums/guard-operator';
import { formatEnumKey, getEnumLabel } from '../../../helper-functions/enum-helper';
import { GuardState } from '../../../enums/guard-state';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { GuardTransactionPreview } from './guard-transaction-preview/guard-transaction-preview';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { GuardNotificationTransactionsPreview } from './guard-notification-transactions-preview/guard-notification-transactions-preview';
import { GuardDbConnectionPreview } from './guard-db-connection-preview/guard-db-connection-preview';
import { GuardConfiguredNotifications } from './guard-configured-notifications/guard-configured-notifications';
import { Tag } from 'primeng/tag';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateGuard } from '../create-guard/create-guard';
import { GuardService } from '../../../services/guard-service';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getGuardStateSeverity } from '../../../helper-functions/guard-state-helper';
import { FormatRunPeriodPipe } from '../../../pipes/format-run-period-pipe';

@Component({
  selector: 'app-guard-detail',
  imports: [Card, DatePipe, Button, Tag, ButtonGroup, GuardTransactionPreview, GuardNotificationTransactionsPreview, 
    GuardDbConnectionPreview, GuardConfiguredNotifications, ProgressSpinner, ConfirmPopup, FormatRunPeriodPipe],
  templateUrl: './guard-detail.html',
  styleUrl: './guard-detail.scss',
})
export class GuardDetail implements OnInit, OnDestroy {
  
  private httpClient = inject(HttpClient);
  private dialogService = inject(DialogService);
  private guardService = inject(GuardService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public getGuardStateSeverity = getGuardStateSeverity;
  public guardDetail = signal<GuardDetailDTO | null>(null);
  public guardId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  public guardOperator = GuardOperator;
  public guardState = GuardState;
  public formatEnum = formatEnumKey;
  public getEnumLabel = getEnumLabel;
  private loadingEvent = new BehaviorSubject<boolean>(false);
  public showLoadingSpinner = signal<boolean>(true);
  private destroy = new Subject<void>();

  ngOnInit(): void {
    const guardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(this.guardId() === guardId){
          this.loadDetails();
        }
      }
    })
    this.guardId.set(Number(guardId!));
    this.loadingEvent.pipe(takeUntil(this.destroy), debounceTime(500)).subscribe(state => this.showLoadingSpinner.set(state));
    this.loadDetails();
  }
  private loadDetails(): void {
    this.loadingEvent.next(true);
    const url =   [environment.api.uri, 'Guards', 'GetGuardDetail', this.guardId()].join('/');
    this.httpClient.get<GuardDetailDTO>(url).subscribe({
      next: (guardDetail: GuardDetailDTO) => {
        this.guardDetail.set(guardDetail);
        this.loadingEvent.next(false);
      },
      error: () => this.router.navigate(['guards/view-guards'])
    });
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  public editGuardClicked(): void {
    this.dialogService.open(CreateGuard, {
      header: 'Edit guard',
      closable: true,
      draggable: true,
      resizable: true,
      inputValues: {
        guardToEditId: this.guardDetail()!.id
      }
    })
  }
  public onDeleteGuard(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to delete this guard? You can pause them if needed.',
      icon: 'pi pi-info-curcle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },
      accept: () => this.deleteGuard(),
      reject: () => {return;}
    });
  }
  private deleteGuard(): void {
    const url = [environment.api.uri, 'Guards', 'DeleteGuard'].join('/');
    const params = new HttpParams().set('guardId', this.guardId()!);
    this.httpClient.delete<void>(url, { params: params }).subscribe({
      next: () => {
        this.router.navigate(['guards/view-guards']);
      }
    })
  }
}
