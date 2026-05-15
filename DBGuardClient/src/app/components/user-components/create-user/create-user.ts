import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';
import { Password } from 'primeng/password';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { passwordMatchValidator } from '../../../form-validators/matching-validator';
import { passwordRequirementsRegex } from '../../../helpers/password-requirements';
import { CreateUserDTO, CreateUserReferenceData, UserDTO } from '../../../interfaces/user.dto';
import { EntityChangeService } from '../../../services/entity-change-service';
import { FormControlError } from '../../shared/form-control-error/form-control-error';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, FloatLabel, InputText, Password, MultiSelect, Button, Message, FormControlError, Checkbox],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss',
})
export class CreateUser implements OnInit {
  private dialogRef = inject(DynamicDialogRef);
  private entityChangeService = inject(EntityChangeService);
  private httpClient = inject(HttpClient);
  public referenceData = signal<CreateUserReferenceData | null>(null);
  public userIdToEdit = input<string>();
  public userToEdit = signal<CreateUserDTO | null>(null);
  public savingUser = signal<boolean>(false);
  public userForm = new FormGroup({
    username: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    password: new FormControl<string | null>(null, [Validators.required, Validators.pattern(passwordRequirementsRegex)]),
    confirmPassword: new FormControl<string | null>(null, [Validators.required, Validators.pattern(passwordRequirementsRegex)]),
    roles: new FormControl<string[]>([], [Validators.required]),
    isActive: new FormControl<boolean>(true, [Validators.required])
  }, [passwordMatchValidator()]);
  ngOnInit(): void {
    this.getReferenceData();
    if(this.userIdToEdit()){
      this.getUserToEdit();
    }
  }
  private getReferenceData(): void {
    const url = [environment.api.uri, 'User', 'GetCreateUserRefData'].join('/');
    this.httpClient.get<CreateUserReferenceData>(url).subscribe({
      next: (refData: CreateUserReferenceData) => {
        this.referenceData.set(refData);
      }
    });
  }
  private getUserToEdit(): void {
    const url = [environment.api.uri, 'User', 'GetUserToEdit'].join('/');
    const params = new HttpParams().set('userId', this.userIdToEdit()!);
    this.httpClient.get<CreateUserDTO>(url, { params: params }).subscribe({
      next: (userToEdit: CreateUserDTO) => {
        this.userToEdit.set(userToEdit);
        this.userForm.patchValue(userToEdit);
      }
    })
  }
  public saveUser(): void {
    this.savingUser.set(true);
    const userValues = this.userForm.value;
    const url = [environment.api.uri, 'User'];
    const user: CreateUserDTO = {
      id: this.userIdToEdit(),
      username: userValues.username!,
      password: userValues.password!,
      confirmPassword: userValues.confirmPassword!,
      roles: userValues.roles ?? [],
      isActive: userValues.isActive!
    };
    this.userToEdit() ? url.push('PutUser') : url.push('PostUser');
    const request = this.userToEdit() ? this.httpClient.put<UserDTO>(url.join('/'), user) : this.httpClient.post<UserDTO>(url.join('/'), user);
    request.pipe(finalize(() => this.savingUser.set(true))).subscribe({
      next: (user: UserDTO) => {
        if(this.userIdToEdit()){
          this.entityChangeService.userEdited.next(user.id);
        }
        else {
          this.entityChangeService.userCreated.next(user.id);
        }
        this.dialogRef.close(user);
      }
    })
  }
}
