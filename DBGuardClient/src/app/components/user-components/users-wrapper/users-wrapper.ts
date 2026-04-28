import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { UsersToolbar } from '../users-toolbar/users-toolbar';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateUser } from '../create-user/create-user';

@Component({
  selector: 'app-users-wrapper',
  imports: [RouterOutlet, UsersToolbar],
  templateUrl: './users-wrapper.html',
  styleUrl: './users-wrapper.scss',
})
export class UsersWrapper {
  private dialogService = inject(DialogService);

  public createUserClicked(): void {
    this.dialogService.open(CreateUser, {
      header: 'Create user',
      draggable: true,
      closable: true,
      resizable: true,
      maximizable: true
    });
  }
}
