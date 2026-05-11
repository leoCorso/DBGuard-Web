import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { BehaviorSubject, debounce, debounceTime, finalize, merge, single, Subject, takeUntil } from 'rxjs';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { getEnumLabel } from '../../../helpers/enum-helper';
import { DatabaseEngine } from '../../../enums/database-engines';
import { AuthService } from '../../../services/auth-service';
import { Button } from 'primeng/button';
import { EntityChangeService } from '../../../services/entity-change-service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Password } from 'primeng/password';
import { Tooltip } from "primeng/tooltip";
import { DatePipe } from '@angular/common';
import { RouterLink, RouterModule } from "@angular/router";
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';

@Component({
  selector: 'app-db-connection-detail-pane',
  imports: [Button, ProgressSpinner, Tooltip, DatePipe, RouterLink, RouterModule],
  templateUrl: './db-connection-detail-pane.html',
  styleUrl: './db-connection-detail-pane.scss',
})
export class DbConnectionDetailPane implements OnInit, OnDestroy {
  public databaseConnectionId = input.required<number>();
  public guardId = input<number>();
  public databaseConnectionInfo = signal<DatabaseConnectionDTO | null>(null);
  private httpClient = inject(HttpClient);
  public authService = inject(AuthService);
  private entityChangeService = inject(EntityChangeService);
  public getEnumLabel = getEnumLabel;
  public databaseEngines = DatabaseEngine;
  private destroy = new Subject<void>();
  public showLoadingUi = signal<boolean>(false);
  public viewPassword = signal<boolean>(false);

  ngOnInit(): void {
    this.entityChangeService.dbConnectionEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (dbId) => {
        if(this.databaseConnectionId() == dbId){
          this.getInfo();
        }
      }
    });
    this.getInfo();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  private getInfo(): void {    
    const url = [environment.api.uri, 'DatabaseConnection', 'GetDatabaseConnectionDetail'].join('/');
    const params = new HttpParams().set('databaseConnectionId', this.databaseConnectionId());
    this.httpClient.get<DatabaseConnectionDTO>(url, { params: params }).pipe(withDelayedLoading((val) => this.showLoadingUi.set(val))).subscribe({
      next: (databaseInfo: DatabaseConnectionDTO) => {
        this.databaseConnectionInfo.set(databaseInfo);
      }
    })
  }
}
