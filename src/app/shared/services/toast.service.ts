import { Injectable, signal } from '@angular/core';
export interface Toast { id: number; type: 'success'|'error'|'info'; message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private id = 0;

  show(type: Toast['type'], message: string) {
    const t: Toast = { id: ++this.id, type, message };
    this.toasts.update(list => [...list, t]);
    setTimeout(() => this.remove(t.id), 3500);
  }
  remove(id: number) { this.toasts.update(list => list.filter(t => t.id !== id)); }
  success(m: string) { this.show('success', m); }
  error(m: string)   { this.show('error', m); }
  info(m: string)    { this.show('info', m); }
}
