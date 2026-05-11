import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { passwordRequirementsRegex } from '../../../helpers/password-requirements';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { EditPasswordDTO } from '../../../interfaces/user.dto';
import { passwordMatchValidator } from '../../../form-validators/matching-validator';
import { FormControlError } from '../../shared/form-control-error/form-control-error';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, FloatLabel, Password, Message, Button, FormControlError],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  public editPasswordForm = new FormGroup({
    currentPassword: new FormControl<string | null>(null, [Validators.required, Validators.pattern(passwordRequirementsRegex)]),
    password: new FormControl<string | null>(null, [Validators.required, Validators.pattern(passwordRequirementsRegex)]),
    confirmPassword: new FormControl<string | null>(null, [Validators.required, Validators.pattern(passwordRequirementsRegex)])
  }, [passwordMatchValidator()]);
  private httpClient = inject(HttpClient);
  private dialogRef = inject(DynamicDialogRef);

  public updatePassword(): void {
    const url = [environment.api.uri, 'User', 'PutPassword'].join('/');
    const passwordEdits = this.editPasswordForm.value;
    const passwordRequest: EditPasswordDTO = {
      currentPassword: passwordEdits.currentPassword!,
      newPassword: passwordEdits.password!,
      confirmNewPassword: passwordEdits.confirmPassword!
    };
    this.httpClient.put(url, passwordRequest).subscribe({
      next: () => this.dialogRef?.close()
    });
  }
}
