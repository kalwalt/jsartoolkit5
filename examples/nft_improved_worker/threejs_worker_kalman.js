function isMobile() {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}

var interpolationFactor = 24;

var trackedMatrix = {
  // for interpolation
  delta: [
      0,0,0,0,
      0,0,0,0,
      0,0,0,0,
      0,0,0,0
  ],
  interpolated: [
      0,0,0,0,
      0,0,0,0,
      0,0,0,0,
      0,0,0,0
  ]
}

var markers = {
    "pinball": {
        width: 1637,
        height: 2048,
        dpi: 250,
        url: "./examples/DataNFT/pinball",
    },
};

var setMatrix = function (matrix, value) {
    var array = [];
    for (var key in value) {
        array[key] = value[key];
    }
    if (typeof matrix.elements.set === "function") {
        matrix.elements.set(array);
    } else {
        matrix.elements = [].slice.call(array);
    }
};

function start(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update, greyCover) {
    var vw, vh;
    var sw, sh;
    var pscale, sscale;
    var w, h;
    var pw, ph;
    var ox, oy;
    var worker;
    var camera_para = './../examples/Data/camera_para-iPhone 5 rear 640x480 1.0m.dat'

    var canvas_process = document.createElement('canvas');
    var context_process = canvas_process.getContext('2d');

    var renderer = new THREE.WebGLRenderer({ canvas: canvas_draw, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);

    var scene = new THREE.Scene();

    var camera = new THREE.Camera();
    camera.matrixAutoUpdate = false;

    scene.add(camera);

    var cube = new THREE.Mesh(
        new THREE.CubeGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
    );

    var root = new THREE.Object3D();
    scene.add(root);

    cube.material.flatShading;
    cube.position.z = 0;
    cube.position.x = 100;
    cube.position.y = 100;
    cube.scale.set(1000, 1000, 1000);

    root.matrixAutoUpdate = false;
    root.add(cube);

    var load = function() {
        vw = input_width;
        vh = input_height;

        pscale = 320 / Math.max(vw, vh / 3 * 4);
        sscale = isMobile() ? window.outerWidth / input_width : 1;

        sw = vw * sscale;
        sh = vh * sscale;
        video.style.width = sw + "px";
        video.style.height = sh + "px";
        container.style.width = sw + "px";
        container.style.height = sh + "px";
        canvas_draw.style.clientWidth = sw + "px";
        canvas_draw.style.clientHeight = sh + "px";
        canvas_draw.width = sw;
        canvas_draw.height = sh;
        w = vw * pscale;
        h = vh * pscale;
        pw = Math.max(w, h / 3 * 4);
        ph = Math.max(h, w / 4 * 3);
        ox = (pw - w) / 2;
        oy = (ph - h) / 2;
        canvas_process.style.clientWidth = pw + "px";
        canvas_process.style.clientHeight = ph + "px";
        canvas_process.width = pw;
        canvas_process.height = ph;

        renderer.setSize(sw, sh);

        worker = new Worker('../../js/artoolkit.worker.js');

        worker.postMessage({ type: "load", pw: pw, ph: ph, camera_para: camera_para, marker: '../' + marker.url });

        worker.onmessage = function(ev) {
            var msg = ev.data;
            switch (msg.type) {
                case "loaded": {
                    var proj = JSON.parse(msg.proj);
                    var ratioW = pw / w;
                    var ratioH = ph / h;
                    proj[0] *= ratioW;
                    proj[4] *= ratioW;
                    proj[8] *= ratioW;
                    proj[12] *= ratioW;
                    proj[1] *= ratioH;
                    proj[5] *= ratioH;
                    proj[9] *= ratioH;
                    proj[13] *= ratioH;
                    setMatrix(camera.projectionMatrix, proj);
                    break;
                }
                case "endLoading": {
                  if (msg.end == true)
                    // removing loader page if present
                    document.body.classList.remove("loading");
                    document.getElementById("loading").remove();
                  break;
                }
                case "found": {
                    found(msg);
                    break;
                }
                case "not found": {
                    found(null);
                    break;
                }
            }
            track_update();
            process();
        };
    };

    var world;

    var found = function(msg) {
      if (!msg) {
        world = null;
      } else {
        world = JSON.parse(msg.matrixGL_RH);
      }
    };

    var lasttime = Date.now();
    var time = 0;
    var kf = new KalmanFilter({R: 0.1, Q: 5, A: 0.5});

    var draw = function() {
        render_update();
        var now = Date.now();
        var dt = now - lasttime;
        time += dt;
        lasttime = now;

        if (!world) {
          cube.visible = false;
        } else {
          cube.visible = true;
                // interpolate matrix
                var filterMat = [];

                filterMat[0] = kf.filter(world[0])
                filterMat[1] = kf.filter(world[1])
                filterMat[2] = kf.filter(world[2])
                filterMat[4] = kf.filter(world[4])
                filterMat[5] = kf.filter(world[5])
                filterMat[6] = kf.filter(world[6])
                filterMat[8] = kf.filter(world[8])
                filterMat[9] = kf.filter(world[9])
                filterMat[10] = kf.filter(world[10])

                filterMat[3] = world[3] // always equal to 0
                filterMat[7] = world[7] // always equal to 0
                filterMat[11] = world[11] // always equal to 0
                filterMat[15] = world[15] // always equal to 1
                filterMat[12] = world[12]
                filterMat[13] = world[13]
                filterMat[14] = world[14]

                console.log(world);
                console.log(filterMat);

                // set matrix of 'root' by detected 'world' matrix
                setMatrix(root.matrix, trackedMatrix.interpolated);
        }
        renderer.render(scene, camera);
    };

    function process() {
        context_process.fillStyle = "black";
        context_process.fillRect(0, 0, pw, ph);
        context_process.drawImage(video, 0, 0, vw, vh, ox, oy, w, h);

        var imageData = context_process.getImageData(0, 0, pw, ph);
        worker.postMessage({ type: "process", imagedata: imageData }, [imageData.data.buffer]);
    }
    var tick = function() {
        draw();
        requestAnimationFrame(tick);
    };

    load();
    tick();
    process();
}
