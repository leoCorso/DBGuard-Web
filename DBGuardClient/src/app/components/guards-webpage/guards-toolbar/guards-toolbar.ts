import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CreateGuard } from '../create-guard/create-guard';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-guards-toolbar',
  imports: [Toolbar, Button, TooltipModule],
  templateUrl: './guards-toolbar.html',
  styleUrl: './guards-toolbar.scss',
})
export class GuardsToolbar {
  private dialogService = inject(DialogService);
  public authService = inject(AuthService);
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
