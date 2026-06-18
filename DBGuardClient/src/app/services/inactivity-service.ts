import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, of, Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { ThemeService } from './theme-service';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private themeService = inject(ThemeService);
  private idleSeconds = environment.inactivityTimes.idleSeconds;
  private warningSeconds = environment.inactivityTimes.warningSeconds;

  public readonly onIdleWarning$ = new Subject<number>();
  public readonly onTimeout$ = new Subject<void>();
  public readonly countdownStarted$ = new Subject<void>();
  public readonly countdownStopped$ = new Subject<void>();

  private destroyRef = inject(DestroyRef);

  private mainSubscription: Subscription | null = null;
  private countDownSubscription: Subscription | null = null;

  private readonly activityEvents$ = merge(
    fromEvent(window.document.body, 'mousemove'),
    fromEvent(window.document.body, 'keydown'),
    fromEvent(window.document.body, 'mousedown'),
    fromEvent(window.document.body, 'touchstart'),
    fromEvent(window.document.body, 'scroll'),
  );

  public start(): void {
    // Use a of(null) that fires right away so we dont need to wait for first event
    const activityStart$ = merge(
      this.activityEvents$,
      of(null)
    )
    this.mainSubscription = activityStart$.pipe(
      tap(() => this.cancelCountdown()),
      switchMap(() => timer(this.idleSeconds * 1000)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.startWarningCountdown());
  }
  public stop(): void {
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
  private startWarningCountdown(): void {
    this.countdownStarted$.next();
    let count = this.warningSeconds;
    this.countDownSubscription = timer(0, 1000).subscribe(() => {
      if (count <= 0) {
        this.onTimeout$.next();
        this.cancelCountdown();
        this.sendIdleNotification();
        return;
      }
      this.onIdleWarning$.next(count--);
    });
  }
  private sendIdleNotification(): void {
    // If the document is focused we dont need to send a notification
    if(document.hasFocus()){
      return;
    }
    new Notification("Idle logout", { body: 'You are idle and will be logged out.', icon: this.themeService.logoName});
  }
}