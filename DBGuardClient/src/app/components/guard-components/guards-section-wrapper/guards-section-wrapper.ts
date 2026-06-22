import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GuardsToolbar } from '../guards-toolbar/guards-toolbar';
import { CreateGuard } from '../create-guard/create-guard';
import { AuthService } from '../../../services/auth-service';
import { AnalyticsService } from '../../../services/analytics-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SimpleGuardDTO } from '../../../interfaces/guard-dto';

@Component({
  selector: 'app-guards-section-wrapper',
  imports: [GuardsToolbar, RouterOutlet],
  templateUrl: './guards-section-wrapper.html',
  styleUrl: './guards-section-wrapper.scss',
})
export class GuardsSectionWrapper implements OnDestroy {
  
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private dialogRef?: DynamicDialogRef<CreateGuard> | null;
  private destroyRef = inject(DestroyRef);

  public createGuardClicked(): void {
    this.dialogRef = this.dialogService.open(CreateGuard, {
      header: 'Create guard',
      maximizable: true,
      closable: true,
      draggable: true,
      resizable: true
    });
    this.dialogRef?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (newGuard: SimpleGuardDTO | null) => {
        if(!newGuard){ //Cancelled
          this.analyticsService.logEvent('create_guard_cancelled');
        }
      }
    })
  }
  ngOnDestroy(): void {
    this.dialogRef?.close();
  }
}
