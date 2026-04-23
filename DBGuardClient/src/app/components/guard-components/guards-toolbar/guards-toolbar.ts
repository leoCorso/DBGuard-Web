import { Component, inject, output, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CreateGuard } from '../create-guard/create-guard';
import { AuthService } from '../../../services/auth-service';
import { Drawer } from 'primeng/drawer';
import { GuardFilters } from '../../guard-components/guard-filters/guard-filters';

@Component({
  selector: 'app-guards-toolbar',
  imports: [Toolbar, Button, TooltipModule, Drawer, GuardFilters],
  templateUrl: './guards-toolbar.html',
  styleUrl: './guards-toolbar.scss',
})
export class GuardsToolbar {
  public authService = inject(AuthService);
  public createGuardClicked = output<void>();
}
