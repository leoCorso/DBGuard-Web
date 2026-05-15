import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InactivityService } from '../../services/inactivity-service';

@Component({
  selector: 'app-inactivity-prompt',
  imports: [AsyncPipe],
  templateUrl: './inactivity-prompt.html',
  styleUrl: './inactivity-prompt.scss',
})
export class InactivityPrompt {
  public inactivityService = inject(InactivityService);
}
