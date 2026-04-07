import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { TopNavbar } from './components/top-navbar/top-navbar';
import { AuthService } from './services/auth-service';
import { Toast } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TopNavbar, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private destroy = new Subject<void>();

  protected readonly title = signal('DBGuardClient');

  ngOnInit(): void {
    this.authService.initUser();
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
