import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { TopNavbar } from './components/top-navbar/top-navbar';
import { AuthService } from './services/auth-service';
import { Toast } from 'primeng/toast';
import { first, Subject, takeUntil } from 'rxjs';
import { InactivityService } from './services/inactivity-service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InactivityPrompt } from './components/inactivity-prompt/inactivity-prompt';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TopNavbar, Toast, Message],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  public authService = inject(AuthService);
  private inactivityService = inject(InactivityService);
  private dialogService = inject(DialogService);
  private dialogRef?: DynamicDialogRef<InactivityPrompt> | null;
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected readonly title = signal('DBGuardClient');

  ngOnInit(): void {
    this.authService.initUser();
    this.setupInactivityListeners();
  }
  public toggleLogin(): void {
    if(this.authService.loggedIn()){
      this.authService.logout().subscribe();
    }
    else {
      this.router.navigate(['login']);
    }
  }
  private setupInactivityListeners(): void {
    this.inactivityService.countdownStarted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.dialogRef = this.dialogService.open(InactivityPrompt, {
        header: 'Idle detected',
        closable: false
      });
    });
    this.inactivityService.countdownStopped$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.dialogRef?.close());
  }
}
