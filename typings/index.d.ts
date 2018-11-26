interface InteractiveViewer {

  metadata : {
    selectedTemplateBSubject : Observable<any|null>
    selectedParcellationBSubject : Observable<any|null>
    selectedRegionsBSubject : Observable<any[]|null>
    loadedTemplates : any[]
    regionsLabelIndexMap : Map<number,any> | null
    datasetsBSubject : Observable<any[]>
  },

  viewerHandle? : {
    setNavigationLoc : (coordinates:[number,number,number],realSpace?:boolean)=>void
    moveToNavigationLoc : (coordinates:[number,number,number],realSpace?:boolean)=>void
    setNavigationOri : (quat:[number,number,number,number])=>void
    moveToNavigationOri : (quat:[number,number,number,number])=>void
    showSegment : (labelIndex : number)=>void
    hideSegment : (labelIndex : number)=>void
    showAllSegments : ()=>void
    hideAllSegments : ()=>void
    segmentColourMap : Map<number,{red:number,green:number,blue:number}>
    applyColourMap : (newColourMap : Map<number,{red:number,green:number,blue:number}>)=>void
    loadLayer : (layerobj:NGLayerObj)=>NGLayerObj
    removeLayer : (condition:{name : string | RegExp})=>string[]
    setLayerVisibility : (condition:{name : string|RegExp},visible:boolean)=>void

    add3DLandmarks : (landmarks: UserLandmark[]) => void
    remove3DLandmarks : (ids:string[]) => void

    mouseEvent : Observable<{eventName:string,event:MouseEvent}>
    mouseOverNehuba : Observable<{labelIndex : number, foundRegion : any | null}>

    getNgHash : () => string
  }

  uiHandle : {
    getModalHandler : () => ModalHandler
    getToastHandler : () => ToastHandler
  }

  pluginControl : {
    loadExternalLibraries : (libraries:string[])=>Promise<void>
    unloadExternalLibraries : (libraries:string[])=>void
    [key:string] : PluginControl
  }
}

interface PluginControl{
  blink: (sec?:number) => void
  shutdown: () => void
  onShutdown(callback): (callback:() => void) => void
  initState: String
  initStateUrl: String
  setInitManifestUrl: (initManifestUrl:String) => void
}

declare var interactiveViewer: InteractiveViewer