import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ThemeService } from '../../../services/theme-service';
import { EditSelf } from '../../user-components/edit-self/edit-self';
import { AnalyticsService } from '../../../services/analytics-service';
import { Tag } from 'primeng/tag';
import { TrackClick } from '../../../directives/track-click';

@Component({
  selector: 'app-settings-webpage',
  imports: [Button, Card, EditSelf, Tag, TrackClick],
  templateUrl: './settings-webpage.html',
  styleUrl: './settings-webpage.scss',
})
export class SettingsWebpage {
  public themeService = inject(ThemeService);
  public analyticsService = inject(AnalyticsService);

  public toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
    this.analyticsService.logEvent('dark_mode_toggle_click', { mode: this.themeService.getMode()});
  }
}
