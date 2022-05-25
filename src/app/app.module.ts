import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import { NgxIfcComponentsModule } from 'ngx-ifc-components';
import { AngularMaterialModule } from './angular-material.module';

import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { StructurePanelComponent } from './components/structure-panel/structure-panel.component';
import { ControlsButtonBarComponent } from './components/controls-button-bar/controls-button-bar.component';
import { CameraControlsButtonBarComponent } from './components/camera-controls-button-bar/camera-controls-button-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonBarComponent,
    ControlsButtonBarComponent,
    StructurePanelComponent,
    CameraControlsButtonBarComponent
  ],
  imports: [
    BrowserAnimationsModule,
    NgxIfcComponentsModule.forRoot({
      wasmPath: 'assets/ifc/'
    }),
    AngularMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
