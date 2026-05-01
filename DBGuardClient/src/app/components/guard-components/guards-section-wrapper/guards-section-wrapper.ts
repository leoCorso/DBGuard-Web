import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GuardsToolbar } from '../guards-toolbar/guards-toolbar';
import { CreateGuard } from '../create-guard/create-guard';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-guards-section-wrapper',
  imports: [GuardsToolbar, RouterOutlet],
  templateUrl: './guards-section-wrapper.html',
  styleUrl: './guards-section-wrapper.scss',
})
export class GuardsSectionWrapper implements OnDestroy {
  
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
  private dialogRef?: DynamicDialogRef<CreateGuard> | null;

  public createGuardClicked(): void {
    this.dialogRef = this.dialogService.open(CreateGuard, {
      header: 'Create guard',
      maximizable: true,
      closable: true,
      draggable: true,
      resizable: true
    });
  }
  ngOnDestroy(): void {
    this.dialogRef?.close();
  }
}
