import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PreventBackGuard implements CanDeactivate<any> {
  canDeactivate(): boolean {
    return false;
  }
}