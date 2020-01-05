function isMobile() {
    return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}

const interpolationFactor = 24;

let trackedMatrix = {
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

let markers = {
    "pinball": {
        width: 1637,
        height: 2048,
        dpi: 600,
        url: "../DataNFT/pinball",
    },
};

var setMatrix = function (matrix, value) {
    let array = [];
    for (let key in value) {
        array[key] = value[key];
    }
    if (typeof matrix.elements.set === "function") {
        matrix.elements.set(array);
    } else {
        matrix.elements = [].slice.call(array);
    }
};

let worker;
function start(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update) {
    worker = new Worker('wasm_worker/artoolkit.wasm_worker.js');
    worker.onmessage = (ev) => {
        start2(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update);
    }
}
function start2(container, marker, video, input_width, input_height, canvas_draw, render_update, track_update) {
    let vw, vh;
    let sw, sh;
    let pscale, sscale;
    let w, h;
    let pw, ph;
    let ox, oy;
    let camera_para = './../../Data/camera_para-iPhone 5 rear 640x480 1.0m.dat'

    let canvas_process = document.createElement('canvas');
    let context_process = canvas_process.getContext('2d');

    // let context_draw = canvas_draw.getContext('2d');
    let renderer = new THREE.WebGLRenderer({canvas: canvas_draw, alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);

    let scene = new THREE.Scene();

    let camera = new THREE.Camera();
    camera.matrixAutoUpdate = false;
    // let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    // camera.position.z = 400;

    scene.add(camera);

    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
    );

    let root = new THREE.Object3D();
    scene.add(root);

    sphere.material.shading = THREE.FlatShading;
    sphere.position.z = 0;
    sphere.position.x = 40;
    sphere.position.y = 40;
    sphere.scale.set(80, 80, 80);

    root.matrixAutoUpdate = false;
    root.add(sphere);

    let load = () => {
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

        worker.postMessage({type: "load", pw: pw, ph: ph, camera_para: camera_para, marker: '../' + marker.url});

        worker.onmessage = (ev) => {
            let msg = ev.data;
            switch (msg.type) {
                case "loaded": {
                    let proj = JSON.parse(msg.proj);
                    let ratioW = pw / w;
                    let ratioH = ph / h;
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

    let world;

    let found = msg => {
      if (!msg) {
        world = null;
      } else {
        world = JSON.parse(msg.matrixGL_RH);
      }
    };

    let lasttime = Date.now();
    let time = 0;

    let draw = () => {
        render_update();
        let now = Date.now();
        let dt = now - lasttime;
        time += dt;
        lasttime = now;

        if (!world) {
            sphere.visible = false;
        } else {
            sphere.visible = true;

                  // interpolate matrix
                  for (let i = 0; i < 16; i++) {
                    trackedMatrix.delta[i] = world[i] - trackedMatrix.interpolated[i];
                    trackedMatrix.interpolated[i] =
                      trackedMatrix.interpolated[i] +
                      trackedMatrix.delta[i] / interpolationFactor;
                  }

                  // set matrix of 'root' by detected 'world' matrix
                  setMatrix(root.matrix, trackedMatrix.interpolated);
        }
        renderer.render(scene, camera);
    };

    function process() {
      context_process.fillStyle = "black";
      context_process.fillRect(0, 0, pw, ph);
      context_process.drawImage(video, 0, 0, vw, vh, ox, oy, w, h);

      let imageData = context_process.getImageData(0, 0, pw, ph);
      worker.postMessage({ type: "process", imagedata: imageData }, [
        imageData.data.buffer
      ]);
    }
    let tick = () => {
        draw();
        requestAnimationFrame(tick);
    };

    load();
    tick();
    process();
}
