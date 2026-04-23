import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { GuardsToolbar } from '../guards-toolbar/guards-toolbar';
import { CreateGuard } from '../create-guard/create-guard';

@Component({
  selector: 'app-guards-section-wrapper',
  imports: [GuardsToolbar, RouterOutlet],
  templateUrl: './guards-section-wrapper.html',
  styleUrl: './guards-section-wrapper.scss',
})
export class GuardsSectionWrapper {
  
  private dialogService = inject(DialogService);

  public createGuardClicked(): void {
    this.dialogService.open(CreateGuard, {
      header: 'Create guard',
      maximizable: true,
      closable: true,
      draggable: true,
      resizable: true
    });
  }
}
