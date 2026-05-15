import { Component, inject, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-guards-toolbar',
  imports: [Toolbar, Button, TooltipModule],
  templateUrl: './guards-toolbar.html',
  styleUrl: './guards-toolbar.scss',
})
export class GuardsToolbar {
  public authService = inject(AuthService);
  public createGuardClicked = output<void>();
}
