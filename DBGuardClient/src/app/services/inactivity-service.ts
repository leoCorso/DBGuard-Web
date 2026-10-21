import { inject, Service } from '@angular/core';
import { TrackUser } from '@leonardocodes/user-away';
import { environment } from '../../environments/environment';
import { Subscription, switchMap, tap } from 'rxjs';
import { ThemeService } from './theme-service';
@Service()
export class InactivityService {
    private themeService = inject(ThemeService);

    private idleSeconds = environment.inactivityTimes.idleSeconds;
    private warningSeconds = environment.inactivityTimes.warningSeconds;

    // Idle trackers
    public idleTracker = new TrackUser(this.idleSeconds * 1000);
    public warningTracker = new TrackUser(this.warningSeconds * 1000);
    private sub = new Subscription();

    public start(): void {
        this.stop();
        this.idleTracker.startIdleTracking();

        this.sub.add(
            this.idleTracker.inactive$.subscribe(() => {
                this.sendIdleNotification();
                this.warningTracker.startIdleTracking();
            })
        );
        this.sub.add(
            this.warningTracker.idleStopped$.subscribe(() => {
                this.warningTracker.stopIdleTracking();
            })
        );
    }
    public stop(): void {
        this.sub.unsubscribe();
        this.sub = new Subscription();
        this.idleTracker.stopIdleTracking();
        this.warningTracker.stopIdleTracking();
    }
    private sendIdleNotification(): void {
        // If the document is focused we dont need to send a notification
        if(document.hasFocus()){
            return;
        }
        new Notification("Idle logout", { body: 'You are idle and will be logged out.', icon: this.themeService.logoName});
    }
}
