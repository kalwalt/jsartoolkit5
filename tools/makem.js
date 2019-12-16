/*
 * Simple script for running emcc on ARToolKit
 * @author zz85 github.com/zz85
 * @author ThorstenBux github.com/ThorstenBux
 */


var
	exec = require('child_process').exec,
	path = require('path'),
  fs = require('fs'),
  os = require('os'),
	child;

var HAVE_NFT = 1;

var EMSCRIPTEN_ROOT = process.env.EMSCRIPTEN;
var ARTOOLKIT5_ROOT = process.env.ARTOOLKIT5_ROOT || path.resolve(__dirname, "../emscripten/artoolkit5");
var LIBJPEG_INCLUDE = process.env.LIBJPEG_ROOT;

// LIBJPEG_ROOT not defined? Take to one from artoolkit5 directory for macOS and Win
if (!LIBJPEG_INCLUDE) {
	const platform = os.platform();
  if (platform === 'darwin') {
    LIBJPEG_INCLUDE = `${ARTOOLKIT5_ROOT}/include/macosx-universal/`
  } else if (platform === 'win32') {
    LIBJPEG_INCLUDE = `${ARTOOLKIT5_ROOT}/include/win64-x64/`
  }
}

if (!EMSCRIPTEN_ROOT) {
	console.log("\nWarning: EMSCRIPTEN environment variable not found.")
	console.log("If you get a \"command not found\" error,\ndo `source <path to emsdk>/emsdk_env.sh` and try again.");
}

var EMCC = EMSCRIPTEN_ROOT ? path.resolve(EMSCRIPTEN_ROOT, 'emcc') : 'emcc';
var EMPP = EMSCRIPTEN_ROOT ? path.resolve(EMSCRIPTEN_ROOT, 'em++') : 'em++';
var OPTIMIZE_FLAGS = ' -Oz '; // -Oz for smallest size
var MEM = 256 * 1024 * 1024;


var SOURCE_PATH = path.resolve(__dirname, '../emscripten/') + '/';
var OUTPUT_PATH = path.resolve(__dirname, '../build/') + '/';

var BUILD_DEBUG_FILE = 'artoolkit.debug.js';
var BUILD_WASM_FILE = 'artoolkit_wasm.js';
var BUILD_MIN_FILE = 'artoolkit.min.js';

var MAIN_SOURCES = [
	'ARToolKitJS.cpp',
	'trackingMod.c',
	'trackingMod2d.c',
];

if (!fs.existsSync(path.resolve(ARTOOLKIT5_ROOT, 'include/AR/config.h'))) {
	console.log("Renaming and moving config.h.in to config.h");
	fs.copyFileSync(
		path.resolve(ARTOOLKIT5_ROOT, 'include/AR/config.h.in'),
		path.resolve(ARTOOLKIT5_ROOT, 'include/AR/config.h')
	);
	console.log("Done!");
}

MAIN_SOURCES = MAIN_SOURCES.map(function(src) {
	return path.resolve(SOURCE_PATH, src);
}).join(' ');

var glob = require("glob");
function match(pattern) {
    var r = glob.sync('emscripten/artoolkit5/lib/SRC/' + pattern);
    return r;
}
function matchAll(patterns, prefix="") {
    let r = [];
    for(let pattern of patterns) {
        r.push(...(match(prefix + pattern)));
    }
    return r;
}

var ar_sources = matchAll([
    'AR/arLabelingSub/*.c',
    'AR/*.c',
    'ARICP/*.c',
    'ARMulti/*.c',
    'Video/video.c',
    'ARUtil/log.c',
    'ARUtil/file_utils.c',
]);

var ar2_sources = matchAll([
    'handle.c',
    'imageSet.c',
    'jpeg.c',
    'marker.c',
    'featureMap.c',
    'featureSet.c',
    'selectTemplate.c',
    'surface.c',
    'tracking.c',
    'tracking2d.c',
    'matching.c',
    'matching2.c',
    'template.c',
    'searchPoint.c',
    'coord.c',
    'util.c',
], 'AR2/');

var kpm_sources = matchAll([
    'kpmHandle.c*',
    'kpmRefDataSet.c*',
    'kpmMatching.c*',
    'kpmResult.c*',
    'kpmUtil.c*',
    'kpmFopen.c*',
    'FreakMatcher/detectors/DoG_scale_invariant_detector.c*',
    'FreakMatcher/detectors/gaussian_scale_space_pyramid.c*',
    'FreakMatcher/detectors/gradients.c*',
    'FreakMatcher/detectors/harris.c*',
    'FreakMatcher/detectors/orientation_assignment.c*',
    'FreakMatcher/detectors/pyramid.c*',
    'FreakMatcher/facade/visual_database_facade.c*',
    'FreakMatcher/matchers/hough_similarity_voting.c*',
    'FreakMatcher/matchers/freak.c*',
    'FreakMatcher/framework/date_time.c*',
    'FreakMatcher/framework/image.c*',
    'FreakMatcher/framework/logger.c*',
    'FreakMatcher/framework/timers.c*',
], 'KPM/');

if (HAVE_NFT) {
  ar_sources = ar_sources
  .concat(ar2_sources)
  .concat(kpm_sources);
}

var DEFINES = ' ';
if (HAVE_NFT) DEFINES += ' -D HAVE_NFT ';

var FLAGS = '' + OPTIMIZE_FLAGS;
FLAGS += ' -Wno-warn-absolute-paths ';
FLAGS += ' -s TOTAL_MEMORY=' + MEM + ' ';
FLAGS += ' -s USE_ZLIB=1';
FLAGS += ' -s USE_LIBJPEG';
FLAGS += ' --memory-init-file 0 '; // for memless file
// FLAGS += ' -s BINARYEN_TRAP_MODE=clamp'

var PRE_FLAGS = ' --pre-js ' + path.resolve(__dirname, '../js/artoolkit.api.js') +' ';

FLAGS += ' --bind ';

/* DEBUG FLAGS */
var DEBUG_FLAGS = ' -g ';
// DEBUG_FLAGS += ' -s ASSERTIONS=2 '
DEBUG_FLAGS += ' -s ASSERTIONS=1 '
DEBUG_FLAGS += ' --profiling '
// DEBUG_FLAGS += ' -s EMTERPRETIFY_ADVISE=1 '
DEBUG_FLAGS += ' -s ALLOW_MEMORY_GROWTH=1';
DEBUG_FLAGS += '  -s DEMANGLE_SUPPORT=1 ';

var INCLUDES = [
    path.resolve(__dirname, ARTOOLKIT5_ROOT + '/include'),
    OUTPUT_PATH,
    SOURCE_PATH,
    path.resolve(__dirname, ARTOOLKIT5_ROOT + '/lib/SRC/KPM/FreakMatcher'),
    path.resolve(__dirname, LIBJPEG_INCLUDE),
].map(function(s) { return '-I' + s }).join(' ');

function format(str) {
    for (var f = 1; f < arguments.length; f++) {
        str = str.replace(/{\w*}/, arguments[f]);
    }
    return str;
}

function clean_builds() {
    try {
        var stats = fs.statSync(OUTPUT_PATH);
    } catch (e) {
        fs.mkdirSync(OUTPUT_PATH);
    }

    try {
        var files = fs.readdirSync(OUTPUT_PATH);
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = OUTPUT_PATH + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
            }
    }
    catch(e) { return console.log(e); }
}

var compile_arlib = format(EMCC + ' ' + INCLUDES + ' '
    + ar_sources.join(' ')
    + FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}libar.bc ',
    OUTPUT_PATH);

var compile_kpm = format(EMCC + ' ' + INCLUDES + ' '
    + kpm_sources.join(' ')
    + FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}libkpm.bc ',
    OUTPUT_PATH);

var ALL_BC = " {OUTPUT_PATH}libar.bc " + SOURCE_PATH + "libjpeg/lib/libjpeg.bc ";

var compile_combine = format(EMCC + ' ' + INCLUDES + ' '
    + ALL_BC + MAIN_SOURCES
    + FLAGS + ' -s WASM=0' + ' '  + DEBUG_FLAGS + DEFINES + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, OUTPUT_PATH, BUILD_DEBUG_FILE);

var compile_combine_min = format(EMCC + ' ' + INCLUDES + ' '
    + ALL_BC + MAIN_SOURCES
    + FLAGS + ' -s WASM=0' + ' ' + DEFINES + PRE_FLAGS + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, OUTPUT_PATH, BUILD_MIN_FILE);

var compile_wasm = format(EMCC + ' ' + INCLUDES + ' '
    + ALL_BC + MAIN_SOURCES
    + FLAGS + DEFINES + PRE_FLAGS + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, OUTPUT_PATH, BUILD_WASM_FILE);

var compile_all = format(EMCC + ' ' + INCLUDES + ' '
    + ar_sources.join(' ')
    + FLAGS + ' ' + DEFINES + ' -o {OUTPUT_PATH}{BUILD_FILE} ',
    OUTPUT_PATH, BUILD_DEBUG_FILE);

/*
 * Run commands
 */

function onExec(error, stdout, stderr) {
    if (stdout) console.log('stdout: ' + stdout);
    if (stderr) console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error.code);
        process.exit(error.code);
    } else {
        runJob();
    }
}

function runJob() {
    if (!jobs.length) {
        console.log('Jobs completed');
        return;
    }
    var cmd = jobs.shift();

    if (typeof cmd === 'function') {
        cmd();
        runJob();
        return;
    }

    console.log('\nRunning command: ' + cmd + '\n');
    exec(cmd, onExec);
}

var jobs = [];

function addJob(job) {
    jobs.push(job);
}

addJob(clean_builds);
addJob(compile_arlib);
//addJob(compile_kpm);
// compile_kpm
addJob(compile_combine);
addJob(compile_wasm);
addJob(compile_combine_min);
// addJob(compile_all);

runJob();
