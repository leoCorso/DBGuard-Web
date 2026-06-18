import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter, take } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConsentDialog } from '../components/user-components/consent-dialog/consent-dialog';
import { HttpClient, HttpParams } from '@angular/common/http';

declare let gtag: Function;
declare global {
  interface Window {
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private pageViewTrackSubscription?: Subscription;
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private dialogService = inject(DialogService);
  public consentDialogRef?: DynamicDialogRef<ConsentDialog> | null;
  public consentStatus = signal<boolean>(false);

  private static analyticsConsentKey = 'analytics-consent'
  constructor(){
    this.injectGtag();
  }
  private grantConsent(): void {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }
  private revokeConsent(): void {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
      window.dataLayer = [];
    }
  }
  private injectGtag(): void {
    if (!environment.googleAnalytics.measurementId) {
      console.warn('GA Measurement ID not set in environment.');
      return;
    }
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.measurementId}`;
    document.head.appendChild(gtagScript);
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', 
      { 
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        ads_data_redaction: true,
      });
      gtag('js', new Date());
      gtag('config', '${environment.googleAnalytics.measurementId}', 
      { 
        send_page_view: false,
       
      });
    `;
    document.head.appendChild(inlineScript);
  }
  public logEvent(eventName: string, params: Record<string, any> = {}): void {
    if (typeof gtag === 'function' && this.consentGiven()) {
      gtag('event', eventName, params);
    }
  }
  // Set user properties for GA4
  public setUserProperties(properties: Record<string, any>) {
    if (typeof gtag === 'function') {
      gtag('set', 'user_properties', properties);
    }
  }
  // Automatically track page views on route changes
  private trackPageViews() {
    this.pageViewTrackSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects,
          page_location: window.location.href,
          page_title: document.title
        });
      }
    });
  }
  // Stops any automatic event based trackers
  private stopTracking(): void {
    if(this.consentDialogRef){
      this.consentDialogRef.destroy();
    }
    this.pageViewTrackSubscription?.unsubscribe();
  }
  // Checks in localstorage if consent was given
  public consentGiven(): boolean {
    const consent = JSON.parse(localStorage.getItem(AnalyticsService.analyticsConsentKey) ?? 'false')
    return consent;
  }
  // Checks if consent exists in local storage and if not, it prompts for consent
  public initConsent(): void {
    // If key already exists in local storage we update gtag so it logs events
    if(localStorage.getItem(AnalyticsService.analyticsConsentKey)){
      if (this.consentGiven()) {
        this.grantConsent();
      }
      return;
    }
    // If key doesnt exist prompt for consent
    this.getConsent();
  }
  public getConsent(): void {
    // Show consent dialog
    this.consentDialogRef = this.dialogService.open(ConsentDialog, {
      closable: false,
      header: 'Grant analytics consent'
    });
    this.consentDialogRef?.onClose.pipe(take(1)).subscribe({
      next: (granted: boolean) => {
        granted ? this.onConsentGranted() : this.onConsentDenied();
      }
    });
  }
  private onConsentGranted(): void {
    localStorage.setItem(AnalyticsService.analyticsConsentKey, JSON.stringify(true));
    this.consentStatus.set(true);
    this.grantConsent();
    this.trackPageViews();
    this.postConsentUpdate(true);
  }
  private onConsentDenied(): void {
    localStorage.setItem(AnalyticsService.analyticsConsentKey, JSON.stringify(false));
    this.consentStatus.set(false);
    this.revokeConsent();
    this.stopTracking();
    this.postConsentUpdate(false);
  }
  private postConsentUpdate(granted: boolean): void {
    const url = [environment.api.uri, 'User', 'AnalyticsConsentUpdated'].join('/');
    const params = new HttpParams().set('granted', granted);
    this.httpClient.post(url, {}, { params: params}).subscribe();
  }
}
