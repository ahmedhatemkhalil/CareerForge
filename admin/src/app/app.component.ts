import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html', // التيمبلت الافتراضي للـ app
})
export class AppComponent {
  title = 'CareerForge Admin';
  toggleTheme() {
  const element = document.body;
  element.classList.toggle('dark');
}
}
