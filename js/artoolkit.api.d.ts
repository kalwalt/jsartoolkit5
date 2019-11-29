// Type definitions for Javascript ARToolKit v5.x
// Project: https://github.com/artoolkitx/jsartoolkit5
// Definitions by: Hakan Dilek <https://github.com/hakandilek>
// and Thorsten Bux <https://github.com/thorstenbuxk>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export declare interface artoolkit {
    public static readonly AR_TEMPLATE_MATCHING_COLOR;
    public static readonly AR_TEMPLATE_MATCHING_MONO;
    public static readonly AR_MATRIX_CODE_DETECTION;
    public static readonly AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX;
    public static readonly AR_TEMPLATE_MATCHING_MONO_AND_MATRIX;
    public readonly frameMalloc: FrameMalloc;
}

export class ARController {
    width: number;
    height: number;
    camera: ARCameraParam;
    videoHeight: number;
    videoWidth: number;
    videoSize: number;

    id: number;
    orientation: string;
    listeners: object;
    defaultMarkerWidth: number;
    patternMarkers: object;
    barcodeMarkers: object;
    nftMarkers: object;
    transform_mat: Float64Array;
    transformGL_RH: Float64Array;

    //debugging
    _bwpointer: number;
    _lumaCtx: CanvasRenderingContext2D;


    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;


    //Set during _initialize; the heap space for these values is reserved inside the CPP part of artoolkit and then accessed from JS.
    framepointer: any;
    framesize: number;
    dataHeap: any;
    videoLuma: any;
    camera_mat: any;
    marker_transform_mat: any;
    videoLumaPointer: any;

    constructor(width: number, height: number, cameraData: string | ARCameraParam);

    onload(): void;
    debugSetup(): void;
    process(image: any): void;
    getCameraMatrix(): ArrayLike<number>;
    detectMarker(videoNative): void;
    debugDraw(): void;
    getMarkerNum(): number;
    getMarker(index: number): ARMarkerInfo;
    getTransMatSquare(markerIndex: number, markerWidth: number, dst: Float64Array): void;
    getTransMatSquareCont(markerIndex: number, markerWidth: number, previousMarkerTransform: Float64Array, dst: Float64Array): void;
    transMatToGLMat(transMat: Float64Array, glMat?: Float64Array | Float64Array, scale?: number): Float64Array;

    /**
     * Override the default marker width (which is 1) with the given value. This means we can only use one size of markers for now. TODO: Need to fix that later
     * @param {number} markerWidth
     */
    setDefaultMarkerWidth(markerWidth: number);

    /**
    Converts the given 4x4 openGL matrix in the 16-element transMat array
    into a 4x4 OpenGL Right-Hand-View matrix and writes the result into the 16-element glMat array.

    If scale parameter is given, scales the transform of the glMat by the scale parameter.

    @param {Float64Array} glMatrix The 4x4 marker transformation matrix.
    @param {Float64Array} glRhMatrix The 4x4 GL right hand transformation matrix.
    @param {number} [scale] The scale for the transform.
	*/
   arglCameraViewRHf(glMatrix: Float64Array, glRhMatrix?: Float64Array, scale?: number): Float64Array
    /**
        Set the pattern detection mode

        The pattern detection determines the method by which ARToolKit
        matches detected squares in the video image to marker templates
        and/or IDs. ARToolKit v4.x can match against pictorial "template" markers,
        whose pattern files are created with the mk_patt utility, in either colour
        or mono, and additionally can match against 2D-barcode-type "matrix"
        markers, which have an embedded marker ID. Two different two-pass modes
        are also available, in which a matrix-detection pass is made first,
        followed by a template-matching pass.

        @param {number} mode
            Options for this field are:
            AR_TEMPLATE_MATCHING_COLOR
            AR_TEMPLATE_MATCHING_MONO
            AR_MATRIX_CODE_DETECTION
            AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX
            AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
            The default mode is AR_TEMPLATE_MATCHING_COLOR.
    */
    setPatternDetectionMode(mode: number): void;

    /**
		Loads a pattern marker from the given URL and calls the onSuccess callback with the UID of the marker.

		arController.loadMarker(markerURL, onSuccess, onError);

		@param {string} markerURL - The URL of the marker pattern file to load.
		@param {function} onSuccess - The success callback. Called with the id of the loaded marker on a successful load.
		@param {function} onError - The error callback. Called with the encountered error if the load fails.
	*/
	loadMarker(markerURL: string, onSuccess: (id: number) => void, onError: (error:any) => void);

}

export class ARControllerStatic {
    getUserMedia(config: GetUserMediaConfig): HTMLVideoElement;
    getUserMediaARController(config: GetUserMediaARControllerConfig): HTMLVideoElement;
  }

declare interface GetUserMediaConfig {
        onSuccess : (video: HTMLVideoElement) => void;
        onError : (error: any) => void;

        width : number | {min: number, max: number};
        height : number | {min: number, max: number};

        facingMode : string | object;
        deviceId : string | object
}

declare interface GetUserMediaARControllerConfig{
    onSuccess : (arController: ARController, arCameraParam: ARCameraParam) => void;
    onError? : (error: any) => void;

    cameraParam: string; // URL to camera parameters definition file.
    maxARVideoSize: number; // Maximum max(width, height) for the AR processing canvas.

    width : number | {min: number, max: number};
    height : number | {min: number, max: number};

    facingMode : string | object;
}

export declare interface FrameMalloc {
    framepointer: number;
    framesize: number;
    camera: number;
    transform: number;
    videoLumaPointer: number;
}

//export declare interface ARControllerStatic{}

export declare class ARCameraParam {
    onload(): void;
    load(cameraData: string): void;
}

export declare interface ARMarkerInfo {
    /**
     * 2D position (in camera image coordinates, origin at top-left) of the centre of the marker.
     */
    pos: number[];
    /**
     * Line equations for the 4 sides of the marker.
     */
    line: number[];
    /**
     * 2D positions (in camera image coordinates, origin at top-left) of the corners of the marker.
     * vertex[(4 - dir)%4][] is the top-left corner of the marker. Other vertices proceed clockwise from this.
     * These are idealised coordinates (i.e. the onscreen position aligns correctly with the undistorted camera image.)
     */
    vertex: number[];
    /**
     * Area in pixels of the largest connected region, comprising the marker border and regions connected to it. Note that this is not the same as the actual onscreen area inside the marker border.
     */
    area: number;
    /**
     * If pattern detection mode is either pattern mode OR matrix but not both, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
     */
    id: number;
    /**
     * If pattern detection mode includes a pattern mode, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
     */
    idPatt: number;
    /**
     * If pattern detection mode includes a matrix mode, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
     */
    idMatrix: number;
    /**
     * If pattern detection mode is either pattern mode OR matrix but not both, and id != -1, will be marker direction (range 0 to 3, inclusive).
     */
    dir: number;
    /**
     * If pattern detection mode includes a pattern mode, and id != -1, will be marker direction (range 0 to 3, inclusive).
     */
    dirPatt: number;
    /**
     * If pattern detection mode includes a matrix mode, and id != -1, will be marker direction (range 0 to 3, inclusive).
     */
    dirMatrix: number;
    /**
     * If pattern detection mode is either pattern mode OR matrix but not both, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
     */
    cf: number;
    /**
     * If pattern detection mode includes a pattern mode, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
     */
    cfPatt: number;
    /**
     * If pattern detection mode includes a matrix mode, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
     */
    cfMatrix: number;
    errorCorrected: number;
}
