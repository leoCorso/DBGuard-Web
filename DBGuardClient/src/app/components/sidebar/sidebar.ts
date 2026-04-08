import { Component, computed, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  imports: [Menu, Button],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  public menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Guards',
      icon: 'pi pi-shield',
      routerLink: 'guards/view-guards'
    },
    {
      label: 'Guard history',
      icon: 'pi pi-history'
    },
    {
      label: 'DB Endpoints',
      icon: 'pi pi-desktop'
    },
    {
      label: 'Notification providers',
      icon: 'pi pi-send'
    },
    {
      label: 'Users',
      icon: 'pi pi-users'
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog'
    }
  ];
  private bpObserver = inject(BreakpointObserver);
  private bpResult = toSignal(this.bpObserver.observe([Breakpoints.Handset]));
  public isMobile = computed(() => this.bpResult()?.matches ?? false);
  @ViewChild('menu') public sidebarMenu?: Menu;

}
