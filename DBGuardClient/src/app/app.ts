import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { InactivityPrompt } from './components/inactivity-prompt/inactivity-prompt';
import { Sidebar } from './components/sidebar/sidebar';
import { TopNavbar } from './components/top-navbar/top-navbar';
import { AuthService } from './services/auth-service';
import { ThemeService } from './services/theme-service';
import { TrackUser } from '@leonardocodes/user-away';
import { merge, switchMap, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { InactivityService } from './services/inactivity-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TopNavbar, Toast, Message],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  public authService = inject(AuthService);
  private inactivityService = inject(InactivityService);
  private dialogService = inject(DialogService);
  private dialogRef?: DynamicDialogRef<InactivityPrompt> | null;
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  protected readonly title = signal('DBGuardClient');

  ngOnInit(): void {
    this.themeService.initThemeMode();
    this.configureNotificationPermissions();
    this.authService.initUser();
    this.setupInactivityListeners();
  }
  public toggleLogin(): void {
    if (this.authService.loggedIn()) {
      this.authService.logout().subscribe();
    } else {
      this.router.navigate(['login']);
    }
  }
  private setupInactivityListeners(): void {
    // When we become idle we want to display the idle dialOg warning user
    // We pass the timestamp of when user will become inactive for component to display
    this.inactivityService.idleTracker.inactive$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      this.dialogRef = this.dialogService.open(InactivityPrompt, {
        header: 'Idle detected',
        closable: false,
        inputValues: {
          inactivityTimestamp: new Date(event.inactiveTimestamp.getTime() + (environment.inactivityTimes.warningSeconds * 1000))
        }
      })
    });
    // If we stop idling during warning phase, or we become inactive (logged out) we can hide the dialog
    merge(this.inactivityService.warningTracker.idleStopped$, this.inactivityService.warningTracker.inactive$).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {
      this.dialogRef?.close();
    });
  }
  private configureNotificationPermissions(): void {
    if (!('Notification' in window)) {
      console.log('Notifications are not supported in this environment');
      return;
    }
    Notification.requestPermission((result) => {
      console.log(`Notification permission request: ${result}`);
    });
  }
}
