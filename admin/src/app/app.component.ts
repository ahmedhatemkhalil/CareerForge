import { Component } from '@angular/core';
import { LucideShieldCheck } from '@lucide/angular';
import { cn } from '../lib/utils';

@Component({
  selector: 'app-root',
  imports: [LucideShieldCheck],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'CareerForge Admin';
  protected readonly cn = cn;
}
