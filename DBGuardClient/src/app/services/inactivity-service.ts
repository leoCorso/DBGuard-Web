import { inject, Service } from '@angular/core';
import { TrackUser } from '@leonardocodes/user-away';
import { environment } from '../../environments/environment';
import { switchMap, tap } from 'rxjs';
import { ThemeService } from './theme-service';
@Service()
export class InactivityService {
    private themeService = inject(ThemeService);

    private idleSeconds = environment.inactivityTimes.idleSeconds;
    private warningSeconds = environment.inactivityTimes.warningSeconds;

    // Idle trackers
    public idleTracker = new TrackUser(this.idleSeconds * 1000);
    public warningTracker = new TrackUser(this.warningSeconds * 1000);

    public start(): void {
        this.idleTracker.startIdleTracking().pipe(
        switchMap(() => this.warningTracker.startIdleTracking()),
        ).subscribe(() => {
            this.sendIdleNotification();            
        })
    }
    public stop(): void {
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
