import { Component, inject, input, signal } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-create-db-connection',
  imports: [ReactiveFormsModule, FloatLabel, InputText, Select, Message, Password, Button, ProgressSpinner],
  templateUrl: './create-db-connection.html',
  styleUrl: './create-db-connection.scss',
})
export class CreateDbConnection {

  public dbConnectionToEdit = input<DatabaseConnectionDTO>();
  public databaseEngines = enumToOptions(DatabaseEngine, {PostgreSQL: 'PostgreSQL', SQLite: 'SQLite', SQLServer: 'SQL Server', MySql: 'MySQL'});
  private httpClient = inject(HttpClient);
  public loading = signal<boolean>(false);
  public dbConnectionForm = new FormGroup({
    endpoint: new FormControl<string | null>(null, [Validators.required]),
    databaseEngine: new FormControl<DatabaseEngine | null>(null, [Validators.required]),
    databaseName: new FormControl<string | null>(null, [Validators.required]),
    username: new FormControl<string | null>(null),
    password: new FormControl<string | null>(null)
  });
  private dialogRef = inject(DynamicDialogRef<DatabaseConnectionDTO>);

  public saveConnectionForm(): void {
    this.loading.set(true);
    const formValues = this.dbConnectionForm.value;

    let newConnection: CreateDatabaseConnectionDTO = {
      endpoint: formValues.endpoint!,
      databaseEngine: formValues.databaseEngine!,
      databaseName: formValues.databaseName!,
      username: formValues.username ?? undefined,
      password: formValues.password ?? undefined
    };
    const url = [environment.api.uri, 'DatabaseConnection'];
    if(this.dbConnectionToEdit()){ // Editing a connection
      newConnection.id = this.dbConnectionToEdit()!.id
      url.push('PutDatabaseConnection');
    }
    else { // Creating a connection
      url.push('PostDatabaseConnection');
    }
    const urlString = url.join('/');
    this.httpClient.post<DatabaseConnectionDTO>(urlString, newConnection).subscribe({
      next: (newConnection: DatabaseConnectionDTO) => {
        this.dialogRef.close(newConnection);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

}
