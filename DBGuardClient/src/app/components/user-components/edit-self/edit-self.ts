import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { EditPasswordDTO, EditUsernameDTO, ViewUserSelfDTO } from '../../../interfaces/user.dto';
import { ChangePassword } from '../change-password/change-password';
import { TrackClick } from '../../../directives/track-click';
import { AnalyticsService } from '../../../services/analytics-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-self',
  imports: [InputText, Button, Tag, ReactiveFormsModule, TrackClick],
  templateUrl: './edit-self.html',
  styleUrl: './edit-self.scss',
})
export class EditSelf implements OnInit, OnDestroy {
  private httpClient = inject(HttpClient);
  public editingUsername = signal<boolean>(false);
  public loadingUserInfo = signal<boolean>(false);
  public userInfo = signal<ViewUserSelfDTO | null>(null);
  public usernameControl = new FormControl<string | null>(null, Validators.required);

  public editPasswordDialog?: DynamicDialogRef<ChangePassword> | null;
  private dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.getUserInfo().subscribe({
      next: (userInfo) => this.userInfo.set(userInfo)
    });
  }
  ngOnDestroy(): void {
    this.editPasswordDialog?.close();
  }
  private getUserInfo(): Observable<ViewUserSelfDTO> {
    const url = [environment.api.uri, 'User', 'GetSelfInfo'].join('/');
    return this.httpClient.get<ViewUserSelfDTO>(url).pipe(withDelayedLoading((val) => this.loadingUserInfo.set(val)), tap((userInfo) => this.populateUsername(userInfo.username)));
  }
  public saveUsernameEdit(): void {
    const url = [environment.api.uri, 'User', 'PutUsername'].join('/');
    const username = this.usernameControl.value;
    const editUsernameRequest: EditUsernameDTO = {
      newUsername: username!
    };
    this.httpClient.put<EditUsernameDTO>(url, editUsernameRequest).subscribe({
      next: (newUsername: EditUsernameDTO) => {
        this.userInfo.update(info => ({...info!, username:newUsername.newUsername}));
        this.usernameControl.patchValue(newUsername.newUsername);
        this.editingUsername.set(false);
      }
    })
  }
  public cancelUsernameEdit(): void {
    this.usernameControl.patchValue(this.userInfo()!.username);
    this.editingUsername.set(false);
  }
  private populateUsername(username: string): void {
    this.usernameControl.patchValue(username);
  }
  public changePassword(): void {
    this.editPasswordDialog = this.dialogService.open(ChangePassword, {
      header: 'Change password',
      closable: true,
      maximizable: true,
      resizable: true,
      draggable: true
    });
    this.editPasswordDialog?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (editedPassword: EditPasswordDTO | null) => {
        if(!editedPassword){{
          this.analyticsService.logEvent('password_change_cancelled');
        }}
      }
    })
  }
}
