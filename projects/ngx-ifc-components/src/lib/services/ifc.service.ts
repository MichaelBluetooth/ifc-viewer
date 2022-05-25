import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MeshLambertMaterial, Scene } from 'three';
import { IFCLoader } from 'web-ifc-three';
import { ParserProgress } from 'web-ifc-three/IFC/components/IFCParser';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';
import { RaycasterHelper } from '../utils/raycaster-helper';
import { SubSetManager } from '../utils/subset-managet';
import { IFCRootNode } from '../models/ifc-root-node';
import { getAllIds } from '../utils/spatial-utils';
import { IfcHistoryTrackerService } from './ifc-history-tracker.service';
import { NgxIfcComponentsConfig } from '../config/ngx-ifc-components-config';

const ALL_ELEMENTS_SUBSET_NAME = 'all_elements';
const SELECT_MATERIAL = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xff00ff,
  depthTest: false,
});
const PRESELECT_MATERIAL = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xff88ff,
  depthTest: false,
});

@Injectable()
export class IFCService {
  private WASM_PATH: string = 'static/ifc/';
  private ifcLoader: IFCLoader;
  private ifcModels: any[] = [];
  private previousFileUrl: string = null;
  private scene: Scene;
  private raycaster: RaycasterHelper;
  private subsetManager: SubSetManager;

  private _hiddenIds = new BehaviorSubject<number[]>([]);
  private _selectedIds = new BehaviorSubject<number[]>([]);
  private _spatialStructure = new BehaviorSubject<IFCRootNode>(null);
  private _loading = new BehaviorSubject<number>(null);
  private _showLines = new BehaviorSubject<boolean>(true);
  private _wireFrame = new BehaviorSubject<boolean>(false);

  get hiddenIds$() {
    return this._hiddenIds.asObservable();
  }

  get hiddenIds() {
    return this._hiddenIds.value;
  }

  get selectedIds() {
    return this._selectedIds.value;
  }

  get selectedIds$() {
    return this._selectedIds.asObservable();
  }

  get spatialStructure$() {
    return this._spatialStructure.asObservable();
  }

  get loading$() {
    return this._loading.asObservable();
  }

  get showLines$() {
    return this._showLines.asObservable();
  }

  get wireFrame$() {
    return this._wireFrame.asObservable();
  }

  constructor(
    private ifcConfig: NgxIfcComponentsConfig,
    private ifcHistoryTracker: IfcHistoryTrackerService
  ) {
    if (ifcConfig.wasmPath) {
      this.WASM_PATH = ifcConfig.wasmPath;
    }
  }

  init(scene: Scene, raycaster: RaycasterHelper) {
    this.ifcLoader = new IFCLoader();
    // this.ifcLoader.ifcManager.useWebWorkers(true, `${WASM_PATH}IFCWorker.js`);
    this.ifcLoader.ifcManager.setWasmPath(this.WASM_PATH);

    this.scene = scene;
    this.raycaster = raycaster;

    this.ifcLoader.ifcManager.setOnProgress((event: ParserProgress) => {
      const percent = (event.loaded / event.total) * 100;
      const result = Math.trunc(percent);
      this._loading.next(result);
    });

    this.subsetManager = new SubSetManager(
      this.ifcLoader.ifcManager,
      this.scene,
      this.ifcHistoryTracker
    );
  }

  async reset(reloadPrevious: boolean = false): Promise<void> {
    this.ifcLoader.ifcManager.dispose();
    this.subsetManager.dispose();
    this.ifcHistoryTracker.clear();

    this.ifcLoader = null;
    this.ifcModels = [];
    this.ifcLoader = new IFCLoader();
    this.ifcLoader.ifcManager.setWasmPath(this.WASM_PATH);
    this.ifcLoader.ifcManager.setupThreeMeshBVH(
      computeBoundsTree,
      disposeBoundsTree,
      acceleratedRaycast
    );

    this.subsetManager = new SubSetManager(
      this.ifcLoader.ifcManager,
      this.scene,
      this.ifcHistoryTracker
    );

    if (reloadPrevious) {
      this.loadUrl(this.previousFileUrl);
    }

    this._hiddenIds.next([]);
    this._selectedIds.next([]);
    this._spatialStructure.next(null);
  }

  async loadFile(file: File) {
    this.reset();
    const fileUrl = URL.createObjectURL(file);
    this.loadUrl(fileUrl);
  }

  async loadUrl(url: string) {
    this.previousFileUrl = url;
    this.ifcLoader.load(url, async (ifcModel) => {
      this.ifcModels.push(ifcModel);

      this.ifcLoader.ifcManager
        .getSpatialStructure(ifcModel.modelID, true)
        .then((spatialStruct) => {
          this._spatialStructure.next(spatialStruct);
          const ids = getAllIds(spatialStruct);
          this.subsetManager.createSubset(
            ifcModel.modelID,
            ids,
            ALL_ELEMENTS_SUBSET_NAME
          );
        });
    });
  }

  async getAllExpressIds() {
    const spatialStruct = await this.ifcLoader.ifcManager.getSpatialStructure(
      this.ifcModels[0].modelID,
      true
    );
    return getAllIds(spatialStruct);
  }

  getSpatialStruct(): Promise<IFCRootNode> {
    return this.ifcLoader.ifcManager.getSpatialStructure(
      this.ifcModels[0].modelID,
      false
    );
  }

  preselect(x: number, y: number) {
    const rayCastedElements = this.raycaster.cast(x, y, this.ifcModels);

    //For all elements in the intersected objects, find the first one that hasn't been hidden
    let found: any = null;
    for (const elementInSelection of rayCastedElements as any) {
      const expressID = elementInSelection.object.getExpressId(
        elementInSelection.object.geometry,
        elementInSelection.faceIndex
      );

      if (this._hiddenIds.value.indexOf(expressID) === -1) {
        found = elementInSelection;
        break;
      }
    }

    if (found) {
      // Gets Express ID
      const index = found.faceIndex;
      const geometry = found.object.geometry;
      const id = this.ifcLoader.ifcManager.getExpressId(geometry, index);

      this.ifcLoader.ifcManager.createSubset({
        modelID: 0,
        ids: [id],
        material: PRESELECT_MATERIAL,
        scene: this.scene,
        removePrevious: true,
      });
    } else {
      this.ifcLoader.ifcManager.removeSubset(0, PRESELECT_MATERIAL);
    }
  }

  highlight(x: number, y: number, isMulti: boolean) {
    const rayCastedElements = this.raycaster.cast(x, y, this.ifcModels);

    //For all elements in the intersected objects, find the first one that hasn't been hidden
    let found: any = null;
    for (const elementInSelection of rayCastedElements as any) {
      const expressID = elementInSelection.object.getExpressId(
        elementInSelection.object.geometry,
        elementInSelection.faceIndex
      );

      if (this._hiddenIds.value.indexOf(expressID) === -1) {
        found = elementInSelection;
        break;
      }
    }

    if (found) {
      // Gets Express ID
      const index = found.faceIndex;
      const geometry = found.object.geometry;
      const id = this.ifcLoader.ifcManager.getExpressId(geometry, index);

      if (isMulti) {
        const ids = [...this._selectedIds.value, id];
        this.highlightById(ids);
      } else {
        this.highlightById([id]);
      }
    } else {
      this._selectedIds.next([]);
      this.ifcLoader.ifcManager.removeSubset(0, SELECT_MATERIAL);
    }
  }

  highlightById(expressIDs: number[], audit: boolean = true) {
    expressIDs = Array.from(new Set<number>(expressIDs)); //remove any dupes
    this._selectedIds.next(expressIDs);

    const subset = this.ifcLoader.ifcManager.createSubset({
      modelID: 0,
      ids: expressIDs,
      material: SELECT_MATERIAL,
      scene: this.scene,
      removePrevious: true,
    });

    if (audit) {
      this.ifcHistoryTracker.track({
        hiddenIds: this._hiddenIds.value,
        selectedIds: expressIDs,
      });
    }
  }

  async highlightAllVisible() {
    const allIds = await this.getAllExpressIds();
    let visibleIds = allIds.filter(
      (id: number) => this._hiddenIds.value.indexOf(id) === -1
    );
    this.highlightById(visibleIds);
  }

  hideElementsById(ids: number[], audit: boolean = true) {
    this.subsetManager.hideElements(0, ids);
    this._hiddenIds.next(ids.concat(this._hiddenIds.value));
    this._selectedIds.next([]);
    this.ifcLoader.ifcManager.removeSubset(0, SELECT_MATERIAL);

    if (audit) {
      this.ifcHistoryTracker.track({
        hiddenIds: this._hiddenIds.value,
        selectedIds: [],
      });
    }
  }

  showElementsById(ids: number[]) {
    const newHiddenIds = this._hiddenIds.value;
    ids.forEach((id) => {
      const idx = newHiddenIds.indexOf(id);
      newHiddenIds.splice(idx, 1);
    });

    this.showAll();
    this.hideElementsById(newHiddenIds);
    this._hiddenIds.next(newHiddenIds);
  }

  hideSelected() {
    this.hideElementsById(this._selectedIds.value);
  }

  async hideOthers(ids: number[] = []) {
    const allIds = await this.getAllExpressIds();
    const otherIds = allIds.filter(
      (id: number) => this._selectedIds.value.indexOf(id) === -1
    );
    this.hideElementsById(otherIds);
  }

  async showAll() {
    //if there's a subset of individual elements, remove it
    this.subsetManager.showHiddenElements(0);

    const ids = await this.getAllExpressIds();
    this.subsetManager.createSubset(0, ids, ALL_ELEMENTS_SUBSET_NAME);
    this._hiddenIds.next([]);
  }

  getItemProperties(expressID: number): Promise<any> {
    return this.ifcLoader.ifcManager.getItemProperties(0, expressID, true);
  }

  getPropertySets(expressID: number): Promise<any> {
    return this.ifcLoader.ifcManager.getPropertySets(0, expressID, true);
  }

  getIFCType(expressID: number) {
    return this.ifcLoader.ifcManager.getIfcType(0, expressID);
  }

  showLines(show: boolean): void {
    if (show) {
      this.subsetManager.showLines();
    } else {
      this.subsetManager.hideLines();
    }
    this._showLines.next(show);
  }

  setWireFrame(show: boolean): void {
    if (show) {
      this.subsetManager.showWireFrame();
    } else {
      this.subsetManager.hideWireFrame();
    }
  }
}
