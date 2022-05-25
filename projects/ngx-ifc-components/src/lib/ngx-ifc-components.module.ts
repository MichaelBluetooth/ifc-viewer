import { ModuleWithProviders, NgModule } from '@angular/core';
import { IfcViewerComponent } from './components/ifc-viewer/ifc-viewer.component';
import { IFCDataService } from './services/ifc-data.service';
import { IfcHistoryTrackerService } from './services/ifc-history-tracker.service';
import { IfcHistoryService } from './services/ifc-history.service';
import { IfcKeyboardControlsService } from './services/ifc-keyboard-controls.service';
import { IfcSnapshotService } from './services/ifc-snapshot.service';
import { IFCService } from './services/ifc.service';
import { WorldService } from './utils/world';
import { NgxIfcComponentsConfig } from './config/ngx-ifc-components-config';
import { ElementContextMenuComponent } from './components/element-context-menu/element-context-menu.component';
import { IfcStructureComponent } from './components/ifc-structure/ifc-structure.component';
import { PluralizeIFCTypePipe } from './pipes/pluralize-ifc-type.pipe';
import { IfcContextMenuService } from './services/ifc-context-menu.service';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from './angular-material.module';

@NgModule({
  declarations: [
    IfcViewerComponent,
    IfcStructureComponent,
    ElementContextMenuComponent,
    PluralizeIFCTypePipe
  ],
  imports: [CommonModule, AngularMaterialModule],
  exports: [IfcViewerComponent, IfcStructureComponent],
  providers: [
    IFCDataService,
    IfcHistoryService,
    IfcHistoryTrackerService,
    IfcKeyboardControlsService,
    IfcSnapshotService,
    IfcContextMenuService,
    IFCService,
    WorldService,
  ],
})
export class NgxIfcComponentsModule {
  static forRoot(
    config: NgxIfcComponentsConfig
  ): ModuleWithProviders<NgxIfcComponentsModule> {
    return {
      ngModule: NgxIfcComponentsModule,
      providers: [{ provide: NgxIfcComponentsConfig, useValue: config }],
    };
  }
}
