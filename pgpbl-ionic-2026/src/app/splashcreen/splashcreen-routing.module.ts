import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplashcreenPage } from './splashcreen.page';

const routes: Routes = [
  {
    path: '',
    component: SplashcreenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplashcreenPageRoutingModule {}
