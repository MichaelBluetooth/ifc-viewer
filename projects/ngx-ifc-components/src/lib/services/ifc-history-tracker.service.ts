import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class IfcHistoryTrackerService {
  private _history = new BehaviorSubject<IfcHistory[]>([]);

  get records$(): Observable<IfcHistory[]> {
    return this._history.asObservable();
  }

  track(historyRecord: IfcHistory) {
    const records = this._history.value;
    records.push(historyRecord);
    this._history.next(records);
  }

  clear() {
    this._history.next([]);
  }

  pop() {
    const records = this._history.value;
    records.pop();
    const last = records.pop();
    this._history.next(records);
    return last;
  }
}

export interface IfcHistory {
  selectedIds: number[];
  hiddenIds: number[];
}


