import { Directive, HostListener, inject, input } from '@angular/core';
import { AnalyticsService } from '../services/analytics-service';

@Directive({
  selector: '[appTrackClick]',
})
export class TrackClick {
  public eventName = input.required<string>();
  public eventData = input<Record<string, any>>();
  private analyticsService = inject(AnalyticsService);

  constructor() {}
  @HostListener('click')
  public onClick(): void {
    this.analyticsService.logEvent(this.eventName(), this.eventData());
  }
}
