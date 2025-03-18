import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/components/footer/footer.component";
import { TopMenuComponent } from './shared/components/top-menu/top-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, TopMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pizza-proyect';
}

