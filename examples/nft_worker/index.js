onCameraStream = function (arScene, arController) {
    var proxy = new ARProxy(arController, '../examples/Data/camera_para-iPhone 5 rear 640x480 1.0m.dat', function () {
        console.log('Create ARProxy', arguments);
    });

    proxy.addEventListener('load', function (ev) {
        console.log('ARController loaded', ev);

        this.processingDone = false;

        this.loadNFTMarker('../examples/DataNFT/pinball', function (ev) {

            var markerRoot = this.arController.createThreeNFTMarker(ev.result[0]);

            console.log('Created NFT marker', ev.result[0], markerRoot);

            markerRoot.add(sphere);
            arScene.scene.add(markerRoot);

            this.processingDone = true;

            const loader = document.body.querySelector('.arjs-loader');
            if (loader && loader.parentElement) {
                loader.parentElement.removeChild(loader);
            }
        });
    });

    document.body.className = arController.orientation;

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    if (arController.orientation === 'portrait') {
        var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
        var h = window.innerWidth;
        renderer.setSize(w, h);
        renderer.domElement.style.paddingBottom = (w - h) + 'px';
    } else {
        if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
            renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
        } else {
            renderer.setSize(arController.videoWidth, arController.videoHeight);
            document.body.className += ' desktop';
        }
    }

    document.body.insertBefore(renderer.domElement, document.body.firstChild);

    var rotationV = 0;
    var rotationTarget = 0;

    renderer.domElement.addEventListener('click', function (ev) {
        ev.preventDefault();
        rotationTarget += 1;
    }, false);

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
    );
    sphere.material.shading = THREE.FlatShading;
    sphere.position.z = 40;
    sphere.position.x = 80;
    sphere.position.y = 80;
    sphere.scale.set(80, 80, 80);

    var torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.2, 8, 8),
        new THREE.MeshNormalMaterial()
    );
    torus.material.shading = THREE.FlatShading;
    torus.position.z = 0.5;
    torus.rotation.x = Math.PI / 2;

    arController.process = function (image) { };

    var tick = function () {
        proxy.process(arScene.video);

        rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
        sphere.rotation.z += rotationV;
        torus.rotation.y += rotationV;
        rotationV *= 0.8;

        arScene.renderOn(renderer);
        requestAnimationFrame(tick);
    };

    tick();
}

window.ARThreeOnLoad = function () {
    ARController.getUserMediaThreeScene({
        maxARVideoSize: 320,
        cameraParam: '../Data/camera_para-iPhone 5 rear 640x480 1.0m.dat',
        onSuccess: onCameraStream,
    });

    delete window.ARThreeOnLoad;
};
