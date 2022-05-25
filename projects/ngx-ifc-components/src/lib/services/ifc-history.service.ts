import { Injectable } from '@angular/core';
import { IfcHistoryTrackerService } from './ifc-history-tracker.service';
import { IFCService } from './ifc.service';

@Injectable()
export class IfcHistoryService {
  constructor(private ifc: IFCService, private ifcHistroryTracker: IfcHistoryTrackerService) {}

  undo() {
    const lastState = this.ifcHistroryTracker.pop();
    if (lastState) {
      this.ifc.showAll().then(() => {
        this.ifc.hideElementsById(lastState.hiddenIds, false);
        this.ifc.highlightById(lastState.selectedIds, false);
      });
    }
  }
}
