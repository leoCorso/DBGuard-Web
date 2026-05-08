import { Component, inject, OnInit, signal } from '@angular/core';
import { ViewUserSelfDTO } from '../../../interfaces/user.dto';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { ProgressSpinner } from 'primeng/progressspinner';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-edit-self',
  imports: [ProgressSpinner, InputText, Password, Button, Tag, ReactiveFormsModule, FloatLabel, Message],
  templateUrl: './edit-self.html',
  styleUrl: './edit-self.scss',
})
export class EditSelf implements OnInit {
  private httpClient = inject(HttpClient);
  public editingUsername = signal<boolean>(false);
  public editingPassword = signal<boolean>(false);
  public loadingUserInfo = signal<boolean>(false);
  public userInfo = signal<ViewUserSelfDTO | null>(null);
  public usernameControl = new FormControl<string | null>(null, Validators.required);
  public editPasswordForm = new FormGroup({
    currentPassword: new FormControl<string | null>(null, [Validators.required]),
    newPassword: new FormControl<string | null>(null, [Validators.required]),
    confirmPassword: new FormControl<string | null>(null, [Validators.required])
  });
  ngOnInit(): void {
    this.getUserInfo().subscribe({
      next: (userInfo) => this.userInfo.set(userInfo)
    });
  }
  private getUserInfo(): Observable<ViewUserSelfDTO> {
    const url = [environment.api.uri, 'User', 'GetSelfInfo'].join('/');
    return this.httpClient.get<ViewUserSelfDTO>(url).pipe(withDelayedLoading((val) => this.loadingUserInfo.set(val)), tap((userInfo) => this.populateUsername(userInfo.username)));
  }
  public saveUsernameEdit(): Observable<void> {
    return of();
  }
  public cancelUsernameEdit(): void {
    this.usernameControl.patchValue(this.userInfo()!.username);
    this.editingUsername.set(false);
  }
  private populateUsername(username: string): void {
    this.usernameControl.patchValue(username);
  }
  public updatePassword(): void {

  }
  public cancelPasswordEdit(): void {
    this.editPasswordForm.reset();
    this.editingPassword.set(false);
  }
}
