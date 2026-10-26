import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { SplashcreenPageRoutingModule } from './splashcreen-routing.module';

import { SplashcreenPage } from './splashcreen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplashcreenPageRoutingModule
  ],
  declarations: [SplashcreenPage]
})
export class SplashcreenPageModule {}
