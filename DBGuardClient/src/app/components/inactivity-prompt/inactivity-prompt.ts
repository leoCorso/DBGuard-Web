import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { InactivityService } from '../../services/inactivity-service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-inactivity-prompt',
  imports: [AsyncPipe],
  templateUrl: './inactivity-prompt.html',
  styleUrl: './inactivity-prompt.scss',
})
export class InactivityPrompt {
  public inactivityService = inject(InactivityService);
}
