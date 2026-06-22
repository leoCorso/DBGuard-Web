import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  
  public logoName: 'logo.png' | 'logo-light.png' = 'logo.png';

  public toggleDarkMode(): void {
    const element = document.querySelector('html') as HTMLElement;
    const darkMode = element.classList.toggle('my-app-dark');
    const localStorageValue = darkMode ? 'dark-mode' : 'light-mode';
    this.logoName = darkMode ? 'logo-light.png' : 'logo.png';
    localStorage.setItem('theme-mode', localStorageValue);
  }
  public initThemeMode(): void {
    const element = document.querySelector('html') as HTMLElement;
    const themePreference = localStorage.getItem('theme-mode');
    if(themePreference){
      themePreference === 'light-mode' ? element.classList.remove('my-app-dark') : element.classList.add('my-app-dark');  
      this.logoName = themePreference === 'light-mode' ? 'logo.png' : 'logo-light.png';

    }
  }
  public getMode(): string | null {
    return localStorage.getItem('theme-mode');
  }
}
