import { Component, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TrackClick } from '../../../directives/track-click';

@Component({
  selector: 'app-db-connection-toolbar',
  imports: [Toolbar, Button, TooltipModule, TrackClick],
  templateUrl: './db-connection-toolbar.html',
  styleUrl: './db-connection-toolbar.scss',
})
export class DbConnectionToolbar {
  public createDBConnectionClicked = output<void>();
}
