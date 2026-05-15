import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Image } from 'primeng/image';
import { Menubar } from 'primeng/menubar';
import { AuthService } from '../../services/auth-service';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-top-navbar',
  imports: [Menubar, Button, Image, RouterLink],
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.scss',
})
export class TopNavbar {
  public authService = inject(AuthService);
  private bpObserver = inject(BreakpointObserver);
  private bpResult = toSignal(this.bpObserver.observe([Breakpoints.Handset]));
  public isMobile = computed(() => this.bpResult()?.matches ?? false);
  public toggleLogin = output<void>();
  public themeService = inject(ThemeService);
  
  public menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home'
    }
  ]
}
