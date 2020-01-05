# ARToolKit.js

Emscripten port of [ARToolKit](https://github.com/artoolkit/artoolkit5) to JavaScript.

---
**NOTE:**

When writing JavaScript and making changes be aware that the emscripten uglifier does not support the ES6 syntax.

---

## Project Structure

- `build/` (compiled debug and minified versions of ARToolKit.js)
- `doc/` (documentation, coming...)
- `emscripten/` (source code for ARToolKit.js)
- `examples/` (demos and examples using ARToolKit.js)
- `js/` (compiled versions of ARToolKit.js with Three.js helper api)
- `tools/` (build scripts for building ARToolKit.js)

## WebAssembly
JSARToolKit5 supports WebAssembly. The libary builds two WebAssembly artefacts during the build process. These are ```build/artoolkit_wasm.js``` and ```build/artoolkit_wasm.wasm```. To use those include the artoolkit_wasm.js into your html page and define ```var artoolkit_wasm_url = '<<PATH TO>>/artoolkit_wasm.wasm';``` prior to loading the artoolkit_wasm.js file, like so:

```js
<script type='text/javascript'>
      var artoolkit_wasm_url = '../build/artoolkit_wasm.wasm';
</script>
<script src="../build/artoolkit_wasm.js"></script>
```
As loading the WebAssembly artefact is done asynchronous there is a callback that is called once everything is ready.

```js
window.addEventListener('artoolkit-loaded', () => {  
    //do artoolkit stuff here
});
```
See examples/simple_image_wasm.html for details.

## Clone the repository

1. Clone this repository
2. Clone ARToolKit5 project to get the latest source files. From within jsartoolkit5 directory do `git submodule update --init`. If you already cloned ARToolKit5 to a different directory you can:
  - create a link in the `jsartoolkit5/emscripten/` directory that points to ARToolKit5 (`jsartoolkit5/emscripten/artoolkit5`) (Linux and macOS only)
  - or, set the `ARTOOLKIT5_ROOT` environment variable to point to your ARToolKit5 clone
  - or, change the `tools/makem.js` file to point to your artoolkit5 clone (line 62, 83, 107, 140)

## Build Instructions

### Recommended: Build using Docker
1. Install Docker (if you havn't already) [Docker](https://www.docker.com/) -> Get Docker
2. Clone artoolkit5 repository on your machine: `git submodule update --init`
3. `npm install`
4. From inside jsartoolkit5 directory run `docker run -dit --name emscripten -v $(pwd):/src trzeci/emscripten-slim:latest bash` - download and start the container, in preparation for the build
5. `docker exec emscripten npm run build-local` - build JS version of artoolkit5
6. `docker stop emscripten` - stop the container after the build if needed
7. `docker rm emscripten` - remove the container
8. `docker rmi trzeci/emscripten-slim:latest` - remove the image if you don't need it anymore
9. The build artefacts are in `/build`. There's a build with debug symbols in `artoolkit.debug.js` and the optimized build with bundled JS API in `artoolkit.min.js` and a WebAssembly build artoolkit_wasm.js and artoolkit_wasm.wasm

### !! Not recommended !! : Build local with manual emscripten setup
To prevent issues with Emscripten setup and to not have to maintain several build environments (macOS, Windows, Linux) we only maintain the **Build using Docker**. Following are the instructions of the last know build on Linux which we verified are working. **Use at own risk.**
** Not working on macOS!**

1. Install build tools
  1. Install node.js (https://nodejs.org/en/)
  2. Install python2 (https://www.python.org/downloads/)
  3. Install emscripten (https://emscripten.org/docs/getting_started/downloads.html#download-and-install)
     We used emscripten version **1.38.44-fastcomp**

jsartoolkit5 aim is to create a Javascript version of artoolkit5. First, you need the artoolkit5 repository on your machine:
2. Clone ARToolKit5 project to get the latest source files. From within jsartoolkit5 directory do `git submodule update --init`. If you already cloned ARToolKit5 to a different directory you can:
  - create a link in the `jsartoolkit5/emscripten/` directory that points to ARToolKit5 (`jsartoolkit5/emscripten/artoolkit5`)
  - or, set the `ARTOOLKIT5_ROOT` environment variable to point to your ARToolKit5 clone
  - or, change the `tools/makem.js` file to point to your artoolkit5 clone (line 62, 83, 107, 140)

3. Building
  1. Make sure `EMSCRIPTEN` env variable is set (e.g. `EMSCRIPTEN=/usr/lib/emsdk_portable/emscripten/master/ node tools/makem.js`
  3. Run `npm install`
  4. Run `npm run build-local`

During development, you can run ```npm run watch```, it will rebuild the library everytime you change ```./js/``` directory.

4. The built ASM.js files are in `/build`. There's a build with debug symbols in `artoolkit.debug.js` and the optimized build with bundled JS API in `artoolkit.min.js`.

# ARToolKit JS API

```js
<script async src="build/artoolkit.min.js">
// include optimized ASM.js build and JS API
</script>
```

# ARToolKit JS debug build

```js
<script src="build/artoolkit.debug.js">
// - include debug build
</script>
<script src="js/artoolkit.api.js">
// - include JS API
</script>
```

# ARToolKit Three.js helper API

```js
<script async src="build/artoolkit.min.js">
// - include optimized ASM.js build and JS API
</script>
<script async src="three.min.js">
// - include Three.js
</script>
<script async src="js/artoolkit.three.js">
// - include Three.js helper API
</script>
<script>
window.ARThreeOnLoad = function () {
console.log("Three.js helper API loaded");
};
if (window.ARController && window.ARController.getUserMediaThreeScene) {
ARThreeOnLoad();
}
</script>
```

# Examples

See `examples/` for examples on using the raw API and the Three.js helper API.

The basic operation goes like this:

1. Load a `ARCameraParam` object
2. Create a `ARController` object
3. Set pattern detection mode
4. Load pattern markers or multimarkers if needed
5. Add a `'getMarker'` event listener
6. Call `ARController.process(img)`

```js
<script src="build/artoolkit.min.js"></script>
<script>
  var param = new ARCameraParam();

  param.onload = function () {
    var img = document.getElementById('my-image');
    var ar = new ARController(img.width, img.height, param);

    // Set pattern detection mode to detect both pattern markers and barcode markers.
    // This is more error-prone than detecting only pattern markers (default) or only barcode markers.
    //
    // For barcode markers, use artoolkit.AR_MATRIX_CODE_DETECTION
    // For pattern markers, use artoolkit.AR_TEMPLATE_MATCHING_COLOR
    //
    ar.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX);

    ar.addEventListener('markerNum', function (ev) {
      console.log('got markers', markerNum);
    });
    ar.addEventListener('getMarker', function (ev) {
      console.log('found marker?', ev);
    });
    ar.loadMarker('Data/patt.hiro', function (marker) {
      console.log('loaded marker', marker);
      ar.process(img);
    });
};

  param.src = 'Data/camera_para.dat';
</script>
```

## Public

*the calls your JS apps needs*

- `artoolkit.init(path, camera_param_path)` - load path for artoolkit emscripten files
- `artoolkit.onReady(callback)` - runs callback when artoolkit has completely downloaded, initalized and ready to run
- `artoolkit.setup(width, height);` - initalize a buffer size for a canvas of width & height
- `artoolkit.process(canvas);` - extracts a frame from a canvas and process it
- `artoolkit.debugSetup()` - enables debugging, adds a threshold image to the dom
- `artoolkit.getDetectedMarkers()` - returns an array of detected markers from last detection process
- `artoolkit.getCameraMatrix()` - returns the projection matrix computed from camera parameters
- `artoolkit.getTransformationMatrix()` - returns the 16-element WebGL transformation matrix

## Internals

*calls called from emscripten runtime -> artoolkit.js*

- `artoolkit.onFrameMalloc(object)` - gets called when frame buffer gets allocated for canvas
- `artoolkit.onMarkerNum(number)` - gets called with the numbers of markers detected
- `artoolkit.onGetMarker(object, index)` - gets called with the marker struct for the positioned marker

*calls available from js -> emscripten*

- `_setup(width, height)`
- `_setThreshold(int)` - 0 to 255
- `_process()`
- `_setDebugMode(boolean)`
- `_addMarker(string)`
- `setThreshold`
- `setThresholdMode()` eg. `Module.setThresholdMode(Module.AR_LABELING_THRESH_MODE_AUTO_MEDIAN / AR_LABELING_THRESH_MODE_AUTO_OTSU );
- `setLabelingMode`
- `setPatternDetectionMode`
- `setMatrixCodeType()` : Eg. Module.setMatrixCodeType(Module.AR_MATRIX_CODE_3x3);
- `setImageProcMode`
- `setPattRatio`

## Examples

```
artoolkit.init('', 'camera_para.dat').onReady(function() {
artoolkit.setProjectionNearPlane(1);
artoolkit.setProjectionFarPlane(1000);
artoolkit.setPatternDetectionMode(artoolkit.CONSTANTS.AR_MATRIX_CODE_DETECTION);
artoolkit.setMatrixCodeType(artoolkit.CONSTANTS.AR_MATRIX_CODE_4x4);
})

artoolkit.init('', 'camera_para.dat').onReady(function() {
artoolkit.addMarker('../bin/Data/patt.hiro', function(marker) {
artoolkit.process(v);
})
})
```

## Constants

*prepend all these constants with `Module.` or `artoolkit.CONSTANTS` to access them*

```
- AR_DEBUG_DISABLE
- AR_DEBUG_ENABLE
- AR_DEFAULT_DEBUG_MODE
- AR_LABELING_WHITE_REGION
- AR_LABELING_BLACK_REGION
- AR_DEFAULT_LABELING_MODE
- AR_DEFAULT_LABELING_THRESH
- AR_IMAGE_PROC_FRAME_IMAGE
- AR_IMAGE_PROC_FIELD_IMAGE
- AR_DEFAULT_IMAGE_PROC_MODE
- AR_TEMPLATE_MATCHING_COLOR
- AR_TEMPLATE_MATCHING_MONO
- AR_MATRIX_CODE_DETECTION
- AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX
- AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
- AR_DEFAULT_PATTERN_DETECTION_MODE
- AR_USE_TRACKING_HISTORY
- AR_NOUSE_TRACKING_HISTORY
- AR_USE_TRACKING_HISTORY_V2
- AR_DEFAULT_MARKER_EXTRACTION_MODE
- AR_MAX_LOOP_COUNT
- AR_LOOP_BREAK_THRESH
- AR_MATRIX_CODE_3x3
- AR_MATRIX_CODE_3x3_HAMMING63 5
- AR_MATRIX_CODE_3x3_PARITY65 2
- AR_MATRIX_CODE_4x4
- AR_MATRIX_CODE_4x4_BCH_13_9_3 7
- AR_MATRIX_CODE_4x4_BCH_13_5_5 10
- AR_LABELING_THRESH_MODE_MANUAL
- AR_LABELING_THRESH_MODE_AUTO_MEDIAN
- AR_LABELING_THRESH_MODE_AUTO_OTSU
- AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE
- AR_MARKER_INFO_CUTOFF_PHASE_NONE
- AR_MARKER_INFO_CUTOFF_PHASE_PATTERN_EXTRACTION
- AR_MARKER_INFO_CUTOFF_PHASE_MATCH_GENERIC
- AR_MARKER_INFO_CUTOFF_PHASE_MATCH_CONTRAST
- AR_MARKER_INFO_CUTOFF_PHASE_MATCH_BARCODE_NOT_FOUND
- AR_MARKER_INFO_CUTOFF_PHASE_MATCH_BARCODE_EDC_FAIL
- AR_MARKER_INFO_CUTOFF_PHASE_MATCH_CONFIDENCE
- AR_MARKER_INFO_CUTOFF_PHASE_POSE_ERROR
- AR_MARKER_INFO_CUTOFF_PHASE_POSE_ERROR_MULTI
- AR_MARKER_INFO_CUTOFF_PHASE_HEURISTIC_TROUBLESOME_MATRIX_CODES
```
