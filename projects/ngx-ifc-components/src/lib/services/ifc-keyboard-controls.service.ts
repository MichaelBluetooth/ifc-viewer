import { Injectable } from '@angular/core';
import { IfcHistoryService } from './ifc-history.service';
import { IfcSnapshotService } from './ifc-snapshot.service';
import { IFCService } from './ifc.service';

@Injectable()
export class IfcKeyboardControlsService {
  constructor(
    private ifc: IFCService,
    private ifcHistory: IfcHistoryService,
    private ifcSnapshotService: IfcSnapshotService
  ) {}

  keyPress(keyboardEvt: KeyboardEvent) {
    if (keyboardEvt.key === 'Delete') {
      this.ifc.hideSelected();
    } else if (keyboardEvt.ctrlKey && keyboardEvt.key === 'z') {
      this.ifcHistory.undo();
    } else if (keyboardEvt.ctrlKey && keyboardEvt.key === 'c') {
      this.ifcSnapshotService.take();
    } else if (keyboardEvt.ctrlKey && keyboardEvt.key === 'a') {
      this.ifc.highlightAllVisible();
      keyboardEvt.preventDefault();
    }
  }
}
