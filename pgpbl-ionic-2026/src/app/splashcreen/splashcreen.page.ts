import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-splashcreen',
  templateUrl: './splashcreen.page.html',
  styleUrls: ['./splashcreen.page.scss'],
  standalone: false,
})
export class SplashcreenPage implements OnInit {

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      window.location.href = 'tabs/tab1';
     }, 3000);
  }

}
