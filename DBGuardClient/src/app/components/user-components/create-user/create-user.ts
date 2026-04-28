import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CreateUserDTO, CreateUserReferenceData, UserDTO } from '../../../interfaces/user.dto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { passwordMatchValidator } from '../../../form-validators/matching-validator';
import { FormControlError } from '../../shared/form-control-error/form-control-error';
import { EntityChangeService } from '../../../services/entity-change-service';

@Component({
  selector: 'app-create-user',
  imports: [ReactiveFormsModule, FloatLabel, InputText, Password, MultiSelect, Button, Message, FormControlError],
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
  public userForm = new FormGroup({
    username: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    password: new FormControl<string | null>(null, [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)]),
    confirmPassword: new FormControl<string | null>(null, [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)]),
    roles: new FormControl<string[]>([], [Validators.required])
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
    const userValues = this.userForm.value;
    const url = [environment.api.uri, 'User'];
    const user: CreateUserDTO = {
      id: this.userIdToEdit(),
      username: userValues.username!,
      password: userValues.password!,
      confirmPassword: userValues.confirmPassword!,
      roles: userValues.roles ?? []
    };
    this.userToEdit() ? url.push('PutUser') : url.push('PostUser');
    const request = this.userToEdit() ? this.httpClient.put<UserDTO>(url.join('/'), user) : this.httpClient.post<UserDTO>(url.join('/'), user);
    request.subscribe({
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
