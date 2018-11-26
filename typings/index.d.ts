import { Observable } from 'rxjs'

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
    [key:string] : PluginControl | ((l:string[]) => Promise<void>) | ((l:string[]) => void)
  }
}

interface NGLayerObj{

}

interface UserLandmark{
  name : string
  position : [number, number, number]
  id : string /* probably use the it to track and remove user landmarks */
  highlight : boolean
}

interface ModalHandler{

  hide : () => void
  show : () => void
  // onHide : (callback: () => void) => void
  // onHidden : (callback : () => void) => void
  // onShow : (callback : () => void) => void
  // onShown : (callback : () => void) => void
  title : string
  body : string
  footer : String
  
  /**
   * @default true
   */
  dismissable?: boolean 
}

interface ToastHandler{
  message? : string
  timeout? : number
  dismissable? : boolean
  show : () => void
  hide : () => void
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