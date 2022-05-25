import {
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
  Object3D,
  Scene,
} from 'three';
import { IFCManager } from 'web-ifc-three/IFC/components/IFCManager';
import { Subset } from 'web-ifc-three/IFC/components/subsets/SubsetManager';
import { IfcHistoryTrackerService } from '../services/ifc-history-tracker.service';

const HIDDEN_ELEMENTS_SUBSET_NAME = 'hidden_elements';

export class SubSetManager {
  private ifc: IFCManager;
  private scene: Scene;
  private subsets: TrackedSubset[] = [];
  private hiddenElementsSubset: TrackedSubset;
  private ifcHistory: IfcHistoryTrackerService;

  get hiddenIds(): number[] {
    return this.hiddenElementsSubset.ids;
  }

  constructor(
    ifc: IFCManager,
    scene: Scene,
    ifcHistory: IfcHistoryTrackerService
  ) {
    this.ifc = ifc;
    this.scene = scene;
    this.ifcHistory = ifcHistory;
  }

  dispose() {
    this.subsets.forEach((ss) => {
      if (ss.lines) {
        this.scene.remove(ss.lines);
      }
    });
    this.subsets = [];
    this.hiddenElementsSubset = null;
  }

  createSubset(modelID: number, expressIds: number[], customId: string) {
    //if these ids are part of another subset, remove them
    this.removeIdsFromSubset(modelID, expressIds);

    const subset: Subset = this.ifc.createSubset({
      modelID: modelID,
      ids: expressIds,
      scene: this.scene,
      removePrevious: true,
      customID: customId,
    });

    const lines = this.createLines(subset.geometry);
    this.scene.add(lines);

    this.subsets.push({
      modelID: modelID,
      subsetId: customId,
      ids: expressIds,
      ifcSubset: subset,
      lines: lines,
    });
  }

  createLines(geometry: any) {
    const edges = new EdgesGeometry(geometry);
    const line = new LineSegments(
      edges,
      new LineBasicMaterial({ color: 'black' })
    );
    return line;
  }

  hideElements(modelID: number, expressIds: number[]) {
    //remove the existing hidden elements subset
    let existingHiddenIds: number[] = [];
    if (this.hiddenElementsSubset) {
      existingHiddenIds = this.hiddenElementsSubset.ids;
      this.ifc.removeSubset(modelID, null, this.hiddenElementsSubset.subsetId);
    }

    //remove the ids from their existing subset
    this.removeIdsFromSubset(modelID, expressIds);

    //create a new subset with the hidden elements
    const hiddenIds = existingHiddenIds.concat(expressIds);
    const hiddenElementsIFCSubset = this.ifc.createSubset({
      modelID: modelID,
      ids: hiddenIds,
      scene: this.scene,
      removePrevious: true,
      customID: HIDDEN_ELEMENTS_SUBSET_NAME,
    });
    this.hiddenElementsSubset = {
      ids: hiddenIds,
      modelID: modelID,
      ifcSubset: hiddenElementsIFCSubset,
      lines: null,
      subsetId: HIDDEN_ELEMENTS_SUBSET_NAME,
    };
    this.hiddenElementsSubset.ifcSubset.removeFromParent();
  }

  showHiddenElements(modelID: number) {
    if (this.hiddenElementsSubset) {
      this.ifc.removeSubset(modelID, null, HIDDEN_ELEMENTS_SUBSET_NAME);
      this.hiddenElementsSubset = null;
    }
  }

  removeIdsFromSubset(modelID: number, expressIds: number[]) {
    this.subsets
      .filter(
        (ss) =>
          ss.modelID === modelID &&
          ss.ids.some((ids) => expressIds.includes(ids))
      )
      .forEach((ss) => {
        //remove the hidden ids from the existing subset
        this.ifc.removeFromSubset(modelID, expressIds, ss.subsetId);

        //remove the existing lines
        if (ss.lines) {
          this.scene.remove(ss.lines);

          //redraw the lines, without the ids that are no longer part of the subset
          ss.lines = this.createLines(ss.ifcSubset.geometry);
          this.scene.add(ss.lines);
        }
      });
  }

  hideLines() {
    this.subsets.forEach((ss) => {
      if (ss.lines) {
        this.scene.remove(ss.lines);
        ss.lines = null;
      }
    });
  }

  showLines() {
    this.subsets.forEach((ss) => {
      ss.lines = this.createLines(ss.ifcSubset.geometry);
      this.scene.add(ss.lines);
    });
  }

  hideWireFrame() {
    this.subsets.forEach((ss) => {
      if (Array.isArray(ss.ifcSubset.material)) {
        ss.ifcSubset.material.forEach((material: Material) => {
          material.opacity = 1;
          material.transparent = false;
        });
      } else {
        (ss.ifcSubset.material as Material).opacity = 1;
        (ss.ifcSubset.material as Material).transparent = false;
      }
    });
  }

  showWireFrame() {
    this.subsets.forEach((ss) => {
      if (Array.isArray(ss.ifcSubset.material)) {
        ss.ifcSubset.material.forEach((material: Material) => {
          material.opacity = 0;
          material.transparent = true;
        });
      } else {
        (ss.ifcSubset.material as Material).opacity = 0;
        (ss.ifcSubset.material as Material).transparent = true;
      }
    });
  }
}

interface TrackedSubset {
  subsetId: string;
  ids: number[];
  modelID: number;
  lines: Object3D;
  ifcSubset: Subset;
}
