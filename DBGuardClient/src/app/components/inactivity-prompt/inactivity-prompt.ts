import { AsyncPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, input, OnInit, DestroyRef } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-inactivity-prompt',
  imports: [AsyncPipe],
  templateUrl: './inactivity-prompt.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inactivity-prompt.scss',
})
export class InactivityPrompt implements OnInit {
  private destroyRef = inject(DestroyRef);
  public inactivityTimestamp = input.required<Date>(); // When the user will be inactive
  public showCountdown = new Subject<number>();

  ngOnInit(): void {
    // Shows the seconds until user will be considered inactive and logged out
    timer(0, 1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const seconds = this.inactivityTimestamp().getSeconds() - new Date().getSeconds();
      this.showCountdown.next(seconds);
    })
  }
}
