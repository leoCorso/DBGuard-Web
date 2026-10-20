import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-users-toolbar',
  imports: [Toolbar, Button, TooltipModule],
  templateUrl: './users-toolbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users-toolbar.scss',
})
export class UsersToolbar {
  public createUserClicked = output<void>();
}
