import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

export class HomeWatchlistReuseStrategy
  extends BaseRouteReuseStrategy
  implements RouteReuseStrategy
{
  private stored = new Map<string, DetachedRouteHandle>();

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.isReusableRoute(route);
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.getKey(route);
    if (!key || !handle) {
      return;
    }

    this.stored.set(key, handle);
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getKey(route);
    return !!key && this.stored.has(key);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getKey(route);
    if (!key) {
      return null;
    }

    return this.stored.get(key) ?? null;
  }

  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private isReusableRoute(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path ?? '';
    return path === '' || path === 'watchlist';
  }

  private getKey(route: ActivatedRouteSnapshot): string | null {
    if (!this.isReusableRoute(route)) {
      return null;
    }

    return route.routeConfig?.path ?? null;
  }
}
