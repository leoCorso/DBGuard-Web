import { Component, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { TrackClick } from '../../../directives/track-click';

@Component({
  selector: 'app-notification-provider-toolbar',
  imports: [Toolbar, Button, TrackClick],
  templateUrl: './notification-provider-toolbar.html',
  styleUrl: './notification-provider-toolbar.scss',
})
export class NotificationProviderToolbar {

  public createNotificationProvider = output<void>();
}
