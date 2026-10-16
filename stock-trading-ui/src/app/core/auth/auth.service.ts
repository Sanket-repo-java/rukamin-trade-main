import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionKey = 'rukamini-demo-session';

  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) && sessionStorage.getItem(this.sessionKey) === 'active';
  }

  startDemoSession(userId: string, password: string): boolean {
    if (!isPlatformBrowser(this.platformId) || !userId.trim() || password.length < 6) {
      return false;
    }

    sessionStorage.setItem(this.sessionKey, 'active');
    return true;
  }

  endSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.sessionKey);
    }
  }
}