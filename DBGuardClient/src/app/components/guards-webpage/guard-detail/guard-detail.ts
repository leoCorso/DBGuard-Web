import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ActivatedRoute } from '@angular/router';
import { GuardDetailDTO } from '../../../interfaces/guard-dto';
import { Card } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { GuardOperator } from '../../../enums/guard-operator';
import { formatEnumKey, getEnumLabel } from '../../../helper-functions/enum-helper';
import { GuardState } from '../../../enums/guard-state';
import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { GuardTransactionPreview } from './guard-transaction-preview/guard-transaction-preview';

@Component({
  selector: 'app-guard-detail',
  imports: [Card, DatePipe, Button, ButtonGroup, GuardTransactionPreview],
  templateUrl: './guard-detail.html',
  styleUrl: './guard-detail.scss',
})
export class GuardDetail implements OnInit {
  
  private httpClient = inject(HttpClient);
  public loading = signal<boolean>(false);
  public guardDetail = signal<GuardDetailDTO | null>(null);
  private guardId = signal<number | null>(null);
  private activatedRoute = inject(ActivatedRoute);
  public guardOperator = GuardOperator;
  public guardState = GuardState;
  public formatEnum = formatEnumKey;
  public getEnumLabel = getEnumLabel;

  ngOnInit(): void {
    const guardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.guardId.set(Number(guardId!));

    const url =   [environment.api.uri, 'Guards', 'GetGuardDetail', this.guardId()].join('/');
    this.loading.set(true);
    this.httpClient.get<GuardDetailDTO>(url).subscribe({
      next: (guardDetail: GuardDetailDTO) => {
        this.loading.set(false);
        this.guardDetail.set(guardDetail);
      },
      error: () => {
        this.loading.set(false);
      }
    })
  }
}
