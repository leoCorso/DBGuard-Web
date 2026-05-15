import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { Card } from 'primeng/card';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { GuardState } from '../../../enums/guard-state';
import { getEnumLabel } from '../../../helpers/enum-helper';
import { getGuardStateSeverityTwo } from '../../../helpers/guard-state-helper';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { AuthService } from '../../../services/auth-service';
import { EntityChangeService } from '../../../services/entity-change-service';
import { DbConnectionDetailPane } from '../../db-connection-components/db-connection-detail-pane/db-connection-detail-pane';
import { CreateGuard } from '../create-guard/create-guard';
import { GuardChangeHistoryTable } from '../guard-change-history-table/guard-change-history-table';
import { GuardDetailPane } from '../guard-detail-pane/guard-detail-pane';
import { GuardNotificationTransactionsTable } from '../guard-notification-components/guard-notification-transactions-table/guard-notification-transactions-table';
import { GuardNotificationsTable } from '../guard-notification-components/guard-notifications-table/guard-notifications-table';

@Component({
  selector: 'app-guard-detail-webpage',
  imports: [Card, GuardDetailPane, Button, ButtonGroup, GuardChangeHistoryTable, GuardNotificationTransactionsTable, 
    DbConnectionDetailPane, GuardNotificationsTable, ProgressSpinner, ConfirmPopup, TooltipModule, Toast],
  templateUrl: './guard-detail-webpage.html',
  styleUrl: './guard-detail-webpage.scss',
})
export class GuardDetailWebpage implements OnInit, OnDestroy {
  
  private httpClient = inject(HttpClient);
  private dialogService = inject(DialogService);
  private entityChangeService = inject(EntityChangeService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  public guardDetail = signal<GuardDetailDTO | null>(null);
  public guardId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  public loadingGuardDetail = signal<boolean>(false);
  public deletingGuard = signal<boolean>(false);
  public testingGuard = signal<boolean>(false);
  private destroy = new Subject<void>();
  private messageService = inject(MessageService);
  private editGuardDialogRef?: DynamicDialogRef<CreateGuard> | null;

  ngOnInit(): void {
    const guardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.entityChangeService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId: number) => {
        if(this.guardId() === guardId){
          this.loadDetails();
        }
      }
    })
    this.guardId.set(Number(guardId!));
    this.loadDetails();
  }
  private loadDetails(): void {
    const url =   [environment.api.uri, 'Guards', 'GetGuardDetail', this.guardId()].join('/');
    this.httpClient.get<GuardDetailDTO>(url).pipe(withDelayedLoading((val) => this.loadingGuardDetail.set(val))).subscribe({
      next: (guardDetail: GuardDetailDTO) => {
        this.guardDetail.set(guardDetail);
      },
      error: () => this.router.navigate(['/guards/view-all'])
    });
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    this.editGuardDialogRef?.close();
  }
  public editGuardClicked(): void {
    this.editGuardDialogRef = this.dialogService.open(CreateGuard, {
      header: 'Edit guard',
      closable: true,
      draggable: true,
      resizable: true,
      maximizable: true,
      inputValues: {
        guardToEditId: this.guardDetail()!.id
      }
    })
  }
  public onDeleteGuard(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to delete this guard? You can pause them if needed.',
      icon: 'pi pi-info-circle',
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
    this.deletingGuard.set(true);
    const url = [environment.api.uri, 'Guards', 'DeleteGuard'].join('/');
    const params = new HttpParams().set('guardId', this.guardId()!);
    this.httpClient.delete<void>(url, { params: params }).pipe(finalize(() => this.deletingGuard.set(false))).subscribe({
      next: () => {
        this.entityChangeService.guardDeleted.next(this.guardId()!);
        this.router.navigate(['/guards/view-all']);
      }
    })
  }
  public runGuard(): void {
    this.testingGuard.set(true);
    const url = [environment.api.uri, 'Guards', 'RunGuardManually'].join('/');
    const params = new HttpParams().set('guardId', this.guardId()!);
    this.httpClient.post<GuardState>(url, {}, { params: params }).pipe(finalize(() => this.testingGuard.set(false))).subscribe({
      next: (guardState: GuardState) => {
        this.entityChangeService.guardEdited.next(this.guardId()!);
        this.messageService.add({summary: 'Guard finished', detail: `Guard state: ${getEnumLabel(GuardState, guardState)}`, severity: getGuardStateSeverityTwo(guardState), key: 'guard-run-toast'});
      }
    })
  }
}
