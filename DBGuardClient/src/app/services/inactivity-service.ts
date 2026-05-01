import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Subscription, merge, fromEvent, tap, switchMap, timer } from 'rxjs';

const IDLE_SECONDS = 240;
const WARNING_SECONDS = 60;


@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  public readonly onIdleWarning$ = new Subject<number>();
  public readonly onTimeout$ = new Subject<void>();
  public readonly countdownStarted$ = new Subject<void>();
  public readonly countdownStopped$ = new Subject<void>();

  private destroyRef = inject(DestroyRef);

  private mainSubscription: Subscription | null = null;
  private countDownSubscription: Subscription | null = null;

  private readonly activityEvents$ = merge(
    fromEvent(window, 'mousemove'),
    fromEvent(window, 'keydown'),
    fromEvent(window, 'mousedown'),
    fromEvent(window, 'touchstart'),
    fromEvent(window, 'scroll'),
  );

  public start(): void {
    this.mainSubscription = this.activityEvents$.pipe(
      tap(() => this.cancelCountdown()),
      switchMap(() => timer(IDLE_SECONDS * 1000)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.startWarningCountdown());
  }
  public stop() {
    this.cancelCountdown();
    this.mainSubscription?.unsubscribe();
    this.mainSubscription = null;
  }
  private cancelCountdown(): void {
    if (this.countDownSubscription) {
      this.countdownStopped$.next();
      this.countDownSubscription.unsubscribe();
      this.countDownSubscription = null;
    }
  }
  private startWarningCountdown() {
    this.countdownStarted$.next();
    let count = WARNING_SECONDS;
    this.countDownSubscription = timer(0, 1000).subscribe(() => {
      if (count <= 0) {
        this.onTimeout$.next();
        this.cancelCountdown();
        return;
      }
      this.onIdleWarning$.next(count--);
    });
  }
}

