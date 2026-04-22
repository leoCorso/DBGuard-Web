import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { GuardDetailDTO } from '../../../../interfaces/guard-dto';
import { BehaviorSubject, debounce, debounceTime, single, Subject, takeUntil } from 'rxjs';
import { DatabaseConnectionDTO } from '../../../../interfaces/database-connection-dto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { getEnumLabel } from '../../../../helper-functions/enum-helper';
import { DatabaseEngine } from '../../../../enums/database-engines';
import { AuthService } from '../../../../services/auth-service';
import { Button } from 'primeng/button';
import { GuardService } from '../../../../services/guard-service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Password } from 'primeng/password';
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: 'app-guard-db-connection-preview',
  imports: [Button, ProgressSpinner, Password, Tooltip],
  templateUrl: './guard-db-connection-preview.html',
  styleUrl: './guard-db-connection-preview.scss',
})
export class GuardDbConnectionPreview implements OnInit, OnDestroy {
  public guardId = input.required<number>();
  public databaseConnectionInfo = signal<DatabaseConnectionDTO | null>(null);
  private httpClient = inject(HttpClient);
  public authService = inject(AuthService);
  private guardService = inject(GuardService);
  public getEnumLabel = getEnumLabel;
  public databaseEngines = DatabaseEngine;
  private destroy = new Subject<void>();
  public showLoadingUi = signal<boolean>(true);
  public loadingSignal = new BehaviorSubject<boolean>(true);
  public viewPassword = signal<boolean>(false);

  ngOnInit(): void {
    this.guardService.guardEdited.pipe(takeUntil(this.destroy)).subscribe({
      next: (guardId) => {
        if(this.guardId() == guardId){
          this.getInfo();
        }
      }
    });
    this.loadingSignal.pipe(debounceTime(500), takeUntil(this.destroy)).subscribe(loading => this.showLoadingUi.set(loading));
    this.getInfo();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  private getInfo(): void {    
    this.loadingSignal.next(true);
    const url = [environment.api.uri, 'DatabaseConnection', 'GetGuardDatabaseConnection'].join('/');
    const params = new HttpParams().set('guardId', this.guardId());
    this.httpClient.get<DatabaseConnectionDTO>(url, { params: params }).subscribe({
      next: (databaseInfo: DatabaseConnectionDTO) => {
        this.databaseConnectionInfo.set(databaseInfo);
        this.loadingSignal.next(false);
      },
      error: () => {
        this.loadingSignal.next(false);
      }
    })
  }
}
