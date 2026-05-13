import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { EditUsernameDTO, ViewUserSelfDTO } from '../../../interfaces/user.dto';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { ProgressSpinner } from 'primeng/progressspinner';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-edit-self',
  imports: [ProgressSpinner, InputText, Password, Button, Tag, ReactiveFormsModule, FloatLabel, Message],
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
  }
}
