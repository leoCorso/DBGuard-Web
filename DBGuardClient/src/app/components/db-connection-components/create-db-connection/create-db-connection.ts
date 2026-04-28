import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseEngine } from '../../../enums/database-engines';
import { CreateDatabaseConnectionDTO, DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { enumToOptions } from '../../../helper-functions/enum-helper';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Data } from '@angular/router';
import { EntityChangeService } from '../../../services/entity-change-service';
import { Tooltip, TooltipModule } from "primeng/tooltip";
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-create-db-connection',
  imports: [ReactiveFormsModule, FloatLabel, InputText, Select, Message, Password, Button, ProgressSpinner, TooltipModule, Checkbox],
  templateUrl: './create-db-connection.html',
  styleUrl: './create-db-connection.scss',
})
export class CreateDbConnection implements OnInit {

  public dbConnectionToEditId = input<number>();
  private dbConnectionToEdit = signal<CreateDatabaseConnectionDTO | null>(null);
  public databaseEngines = enumToOptions(DatabaseEngine, {PostgreSQL: 'PostgreSQL', SQLite: 'SQLite', SQLServer: 'SQL Server', MySql: 'MySQL'});
  private httpClient = inject(HttpClient);
  public loading = signal<boolean>(false);
  public dbConnectionForm = new FormGroup({
    endpoint: new FormControl<string | null>(null, [Validators.required]),
    databaseEngine: new FormControl<DatabaseEngine | null>(null, [Validators.required]),
    databaseName: new FormControl<string | null>(null, [Validators.required]),
    username: new FormControl<string | null>(null),
    password: new FormControl<string | null>(null),
    validateConnection: new FormControl<boolean>(true)
  });
  private dialogRef = inject(DynamicDialogRef<DatabaseConnectionDTO>);
  private entityChangeService = inject(EntityChangeService);

  ngOnInit(): void {
    if (this.dbConnectionToEditId()) {
      this.getConnectionToEdit();
    }
  }
  public saveConnectionForm(): void {
    this.loading.set(true);
    const formValues = this.dbConnectionForm.value;

    let newConnection: CreateDatabaseConnectionDTO = {
      id: this.dbConnectionToEditId(),
      endpoint: formValues.endpoint!,
      databaseEngine: formValues.databaseEngine!,
      databaseName: formValues.databaseName!,
      username: formValues.username ?? undefined,
      password: formValues.password ?? undefined,
      validateConnection: formValues.validateConnection!
    };
    const url = [environment.api.uri, 'DatabaseConnection'];
    
    this.dbConnectionToEditId() ? url.push("PutDatabaseConnection") : url.push('PostDatabaseConnection');
    const urlString = url.join('/');
    const request = this.dbConnectionToEditId() ? this.httpClient.put<DatabaseConnectionDTO>(urlString, newConnection) : this.httpClient.post<DatabaseConnectionDTO>(urlString, newConnection);
    request.subscribe({
      next: (newConnection: DatabaseConnectionDTO) => {
        if(this.dbConnectionToEditId()){
          this.entityChangeService.dbConnectionEdited.next(newConnection.id!);
        }
        else {
          this.entityChangeService.dbConnectionCreated.next(newConnection.id!);
        }
        this.dialogRef.close(newConnection);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  private getConnectionToEdit(): void {
    const url = [environment.api.uri, 'DatabaseConnection', 'GetDatabaseConnectionToEdit'].join('/');
    const params = new HttpParams().set('connectionId', this.dbConnectionToEditId()!);
    const id = this.dbConnectionToEditId();
    this.httpClient.get<CreateDatabaseConnectionDTO>(url, { params: params }).subscribe({
      next: (connectionToEdit: CreateDatabaseConnectionDTO) => {
        this.dbConnectionToEdit.set(connectionToEdit);
        this.dbConnectionForm.patchValue(connectionToEdit);
      }
    })
  }
}
