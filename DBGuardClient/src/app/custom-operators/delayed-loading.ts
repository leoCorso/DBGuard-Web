import { forkJoin, Observable, Subject, timer } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';

export function withDelayedLoading<T>(
  setLoading: (val: boolean) => void,
  delayMs = 1000
) {
  return (source$: Observable<T>): Observable<T> => {
    return new Observable<T>((subscriber) => {
      const done$ = new Subject<void>(); // signals completion without re-subscribing

      timer(delayMs).pipe(
        tap(() => setLoading(true)),
        takeUntil(done$)              // cancelled by subject, not source$
      ).subscribe();

      source$.pipe(
        finalize(() => {
          done$.next();               // cancel the timer if still running
          done$.complete();
          setLoading(false);          // always reset instantly
        })
      ).subscribe(subscriber);       // single subscription to source$
    });
  };
}