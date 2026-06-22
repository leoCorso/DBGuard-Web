import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateUser } from '../create-user/create-user';
import { UsersToolbar } from '../users-toolbar/users-toolbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../../services/analytics-service';
import { UserDTO } from '../../../interfaces/user.dto';

@Component({
  selector: 'app-users-wrapper',
  imports: [RouterOutlet, UsersToolbar],
  templateUrl: './users-wrapper.html',
  styleUrl: './users-wrapper.scss',
})
export class UsersWrapper implements OnDestroy {
  private dialogService = inject(DialogService);
  private userCreateDialogRef?: DynamicDialogRef<CreateUser> | null;
  private destroyRef = inject(DestroyRef);
  private analyticsService = inject(AnalyticsService);

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
    this.userCreateDialogRef?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user: UserDTO | null) => {
        if(!user){
          this.analyticsService.logEvent('create_user_cancelled');
        }
      }
    })
  }
}
