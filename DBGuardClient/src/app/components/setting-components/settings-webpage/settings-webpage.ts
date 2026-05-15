import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ThemeService } from '../../../services/theme-service';
import { EditSelf } from '../../user-components/edit-self/edit-self';

@Component({
  selector: 'app-settings-webpage',
  imports: [Button, Card, EditSelf],
  templateUrl: './settings-webpage.html',
  styleUrl: './settings-webpage.scss',
})
export class SettingsWebpage {
  public themeService = inject(ThemeService);
}
