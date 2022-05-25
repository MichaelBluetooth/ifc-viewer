import { Component } from '@angular/core';
import { IFCService, IfcHistoryService, IfcSnapshotService } from 'ngx-ifc-components';


@Component({
  selector: 'app-controls-button-bar',
  templateUrl: './controls-button-bar.component.html',
  styleUrls: ['./controls-button-bar.component.less']
})
export class ControlsButtonBarComponent  {

  constructor(private ifc: IFCService, private ifcHistory: IfcHistoryService, private ifcSnapShot: IfcSnapshotService) { }

  selectAll(){
    this.ifc.highlightAllVisible();
  }

  showAll(){
    this.ifc.showAll();
  }

  hideSelected(){
    this.ifc.hideSelected();
  }

  hideOthers(){
    this.ifc.hideOthers();
  }

  undo(){
    this.ifcHistory.undo();
  }

  snapshot(){
    this.ifcSnapShot.take();
  }
}
