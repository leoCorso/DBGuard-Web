import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from "primeng/tooltip";
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { withDelayedLoading } from '../../../custom-operators/delayed-loading';
import { DatabaseEngine } from '../../../enums/database-engines';
import { getEnumLabel } from '../../../helpers/enum-helper';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { AuthService } from '../../../services/auth-service';
import { EntityChangeService } from '../../../services/entity-change-service';
import { Tag } from 'primeng/tag';
import { TrackClick } from '../../../directives/track-click';
import { AnalyticsService } from '../../../services/analytics-service';

@Component({
  selector: 'app-db-connection-detail-pane',
  imports: [Button, ProgressSpinner, Tooltip, DatePipe, RouterLink, RouterModule, Tag, TrackClick],
  templateUrl: './db-connection-detail-pane.html',
  styleUrl: './db-connection-detail-pane.scss',
})
export class DbConnectionDetailPane implements OnInit, OnDestroy {
  public databaseConnectionId = input.required<number>();
  public guardId = input<number>();
  public databaseConnectionInfo = signal<DatabaseConnectionDTO | null>(null);
  private httpClient = inject(HttpClient);
  public authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private entityChangeService = inject(EntityChangeService);
  public getEnumLabel = getEnumLabel;
  public databaseEngines = DatabaseEngine;
  private destroy = new Subject<void>();
  public showLoadingUi = signal<boolean>(false);
  public passwordVisible = signal<boolean>(false);

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
  public togglePasswordVisible(): void {
    this.passwordVisible.set(!this.passwordVisible());
    this.analyticsService.logEvent('toggle_db_password', { visible: this.passwordVisible() });
  }
}
