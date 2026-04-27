import { Component, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-db-connection-toolbar',
  imports: [Toolbar, Button, TooltipModule],
  templateUrl: './db-connection-toolbar.html',
  styleUrl: './db-connection-toolbar.scss',
})
export class DbConnectionToolbar {
  public createDBConnectionClicked = output<void>();
}
