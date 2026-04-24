import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationProvidersTable } from '../notification-providers-table/notification-providers-table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-notification-providers-webpage',
  imports: [NotificationProvidersTable],
  templateUrl: './notification-providers-webpage.html',
  styleUrl: './notification-providers-webpage.scss',
})
export class NotificationProvidersWebpage {

}
