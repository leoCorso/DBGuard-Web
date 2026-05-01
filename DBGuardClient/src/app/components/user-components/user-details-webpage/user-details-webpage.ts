import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetailsPane } from '../user-details-pane/user-details-pane';
import { Card } from 'primeng/card';
import { GuardsDetailTable } from '../../guard-components/guards-detail-table/guards-detail-table';
import { DbConnectionsTable } from '../../db-connection-components/db-connections-table/db-connections-table';
import { NotificationProvidersTable } from '../../notification-provider-components/notification-providers-table/notification-providers-table';
import { ButtonGroup } from 'primeng/buttongroup';
import { Button } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateUser } from '../create-user/create-user';
import { EntityChangeService } from '../../../services/entity-change-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-details-webpage',
  imports: [UserDetailsPane, Card, GuardsDetailTable, DbConnectionsTable, NotificationProvidersTable, ButtonGroup, Button, ConfirmPopup],
  templateUrl: './user-details-webpage.html',
  styleUrl: './user-details-webpage.scss',
})
export class UserDetailsWebpage implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  public userId = signal<string | null>(null);
  private editUserDialog?: DynamicDialogRef<CreateUser> | null;
  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id === null){
      this.router.navigate(['/users/view-all']);
    }
    this.userId.set(id!);
  }
  ngOnDestroy(): void {
    this.editUserDialog?.close();
  }
  public editUser(): void {
    this.editUserDialog = this.dialogService.open(CreateUser, {
      header: 'Edit user',
      draggable: true,
      resizable: true,
      closable: true,
      maximizable: true,
      inputValues: {
        userIdToEdit: this.userId()
      }
    });
  }
  public deleteUserClicked(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Are you sure you want to delete the user?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        severity: 'secondary'
      },
      acceptButtonProps: {
        severity: 'danger'
      },
      reject: () => {},
      accept: () => this.deleteUser() 
    });
  }
  private deleteUser(): void {
    const url = [environment.api.uri, 'User', 'DeleteUser'].join('/');
    const params = new HttpParams().set('userId', this.userId()!);
    this.httpClient.delete(url, { params: params}).subscribe({
      next: () => {
        this.router.navigate(['/users/view-all']);
      }
    })
  }
}
