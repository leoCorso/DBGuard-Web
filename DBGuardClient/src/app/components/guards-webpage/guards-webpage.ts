import { Component, inject } from '@angular/core';
import { GuardsToolbar } from './guards-toolbar/guards-toolbar';
import { RouterOutlet } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { CreateGuard } from './create-guard/create-guard';

@Component({
  selector: 'app-guards-webpage',
  imports: [GuardsToolbar, RouterOutlet],
  templateUrl: './guards-webpage.html',
  styleUrl: './guards-webpage.scss',
})
export class GuardsWebpage {
  
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
