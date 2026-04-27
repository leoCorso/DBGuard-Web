import { Component, computed, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-sidebar',
  imports: [Menu, Button],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);

  public menuItems: MenuItem[] = [
    {
      label: 'Home',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/'
        }
      ]
    },
    {
      label: 'Guards',
      items: [
        {
          label: 'View guards',
        icon: 'pi pi-shield',
          routerLink: 'guards/view-all'
        },
        {
          label: 'Change history',
          icon: 'pi pi-history',
          routerLink: 'guards/change-history'
        },
        {
          label: 'Notifications transactions',
          icon: 'pi pi-envelope',
          routerLink: 'guards/notification-transactions'
        },
        {
          label: 'Configured notifications',
          icon: 'pi pi-file',
          routerLink: 'guards/configured-notifications'
        }
      ]
    },
    {
      label: 'DB Connections',
      items: [
        {
          label: 'View connections',
          icon: 'pi pi-database',
          routerLink: 'db-connections/view-all'
        }
      ]
    },
    {
      label: 'Notification providers',
      items: [
        {
          label: 'View providers',
          icon: 'pi pi-send',
          routerLink: 'providers/view-all'
        }
      ]
    },
    {
      label: 'Misc',
      items: [
        {
          label: 'Users',
          icon: 'pi pi-users',
          visible: this.authService.hasRoles(['Admin']),
          routerLink: 'users/view-all'
        },
        {
          label: 'Settings',
          icon: 'pi pi-cog'
        }
      ]
    },

  ];
  private bpObserver = inject(BreakpointObserver);
  private bpResult = toSignal(this.bpObserver.observe([Breakpoints.Handset, Breakpoints.Small]));
  public isMobile = computed(() => this.bpResult()?.matches ?? false);
  @ViewChild('menu') public sidebarMenu?: Menu;

}
