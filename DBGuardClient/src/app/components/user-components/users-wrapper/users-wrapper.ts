import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { UsersToolbar } from '../users-toolbar/users-toolbar';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateUser } from '../create-user/create-user';

@Component({
  selector: 'app-users-wrapper',
  imports: [RouterOutlet, UsersToolbar],
  templateUrl: './users-wrapper.html',
  styleUrl: './users-wrapper.scss',
})
export class UsersWrapper implements OnDestroy {
  private dialogService = inject(DialogService);
  private userCreateDialogRef?: DynamicDialogRef<CreateUser> | null;

  ngOnDestroy(): void {
    this.userCreateDialogRef?.close();
  }
  public createUserClicked(): void {
    this.userCreateDialogRef = this.dialogService.open(CreateUser, {
      header: 'Create user',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
