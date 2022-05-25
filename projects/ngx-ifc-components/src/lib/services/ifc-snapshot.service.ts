import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IfcSnapshot } from '../models/ifc-snapshot';
import { NgxIfcComponentsModule } from '../ngx-ifc-components.module';
import { WorldService } from '../utils/world';
import { IFCService } from './ifc.service';

@Injectable()
export class IfcSnapshotService {
  private _snapshots = new BehaviorSubject<IfcSnapshot[]>([]);

  get snapshots$(): Observable<IfcSnapshot[]> {
    return this._snapshots;
  }

  constructor(private ifc: IFCService, private world: WorldService) {}

  take(): void {
    const cameraPosition = this.world.getCameraPosition();
    const hiddenIds = this.ifc.hiddenIds;
    const selectedIds = this.ifc.selectedIds;

    const snapshots = this._snapshots.value;
    snapshots.push({
      hiddenIds: hiddenIds,
      selectedIds: selectedIds,
      cameraPosition: cameraPosition,
    });
    this._snapshots.next(snapshots);
  }

  apply(idx: number) {
    const snapshot = this._snapshots.value[idx];
    if (snapshot) {
      this.ifc.showAll().then(() => {
        this.ifc.hideElementsById(snapshot.hiddenIds);
        this.ifc.highlightById(snapshot.selectedIds);
        this.world.setCameraPosition(snapshot.cameraPosition);
      });
    }
  }

  delete(idx: number): void {
    const snapshots = this._snapshots.value;
    snapshots.splice(idx, 1);
    this._snapshots.next(snapshots);
  }
}
