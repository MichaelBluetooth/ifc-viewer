import { Vector3 } from 'three';

export interface IfcSnapshot {
  name?: string;
  selectedIds: number[];
  hiddenIds: number[];
  cameraPosition: Vector3;
}
