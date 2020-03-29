/* BABYLON.js ARToolKit integration */

;(function() {
	var integrate = function() {

		ARController.getUserMediaBabylonScene = function(configuration) {
			var obj = {};
			for (var i in configuration) {
				obj[i] = configuration[i];
			}
			var onSuccess = configuration.onSuccess;

			obj.onSuccess = function(arController, arCameraParam) {
				var scenes = arController.createBabylonScene();
				onSuccess(scenes, arController, arCameraParam);
			};

			var video = this.getUserMediaARController(obj);
			return video;
		};

		ARController.prototype.createBabylonScene = function(video) {
			video = video || this.image;

			this.setupBabylon();

			var canvas = document.createElement('canvas');

			// load the 3D engine
			var engine = new BABYLON.Engine(canvas, true);
			engine.setSize(video.width, video.height);

			// createScene function that creates and return the scene
			var createScene = function () {
					// create a basic BJS Scene object
					var scene = new BABYLON.Scene(engine);
					scene.useRightHandedSystem = true;

					// return the created scene
					return scene;
			};

			var scene = createScene();

			var camera = new BABYLON.Camera('camera1', new BABYLON.Vector3(0, 0, 0), scene);

			camera.attachControl(canvas, true);
			window.camera = camera;

			//setProjectionMatrix(camera.projectionMatrix, this.getCameraMatrix());
			//camera.freezeProjectionMatrix(BABYLON.Matrix.FromArray(arController.getCameraMatrix()));



			var self = this;

			return {
				scene: scene,

				camera: camera,

				arController: this,

				video: video,

				canvas: canvas,

				process: function() {
					for (var i in self.babylonPatternMarkers) {
						self.babylonPatternMarkers[i].visible = false;
					}
					self.process(video);
				},

				renderOn: engine.runRenderLoop(function () {
						/*if (!arController) {
								return;
						}*/
            scene.render();
					}),

			};
		};

		ARController.prototype.createBabylonMarker = function(markerUID, markerWidth) {
			this.setupBabylon();
			var obj = new BABYLON.TransformNode("root");
			obj.markerTracker = this.trackPatternMarkerId(markerUID, markerWidth);
			console.log(obj);
			this.babylonPatternMarkers[markerUID] = obj;
			return obj;
		};


		ARController.prototype.setupBabylon = function() {
			if (this.BABYLON_JS_ENABLED) {
				return;
			}
			this.BABYLON_JS_ENABLED = true;

			/*
				Listen to getMarker events to keep track of Three.js markers.
			*/
			this.addEventListener('getMarker', function(ev) {
				var marker = ev.data.marker;
				var obj;
				if (ev.data.type === artoolkit.PATTERN_MARKER) {
					obj = this.babylonPatternMarkers[marker.idPatt];

				}
				if (obj) {
					// setProjectionMatrix(obj.matrix, ev.data.matrixGL_RH); to be changed...
					obj.visible = true;
				}
			});

			/**
				Index of Babylon.js pattern markers.
			*/
			this.babylonPatternMarkers = {};

		};

	};
	/**
	 * Helper Method for Babylon.js compatibility
	 */
	 /* This code needs to be changed because too Three.js oriented...
	var setProjectionMatrix = function(projectionMatrix, value) {
		if (typeof projectionMatrix.elements.set === "function") {
			projectionMatrix.elements.set(value);
		} else {
			projectionMatrix.elements = [].slice.call(value);
		}
	};*/

	var tick = function() {
		if (window.ARController && window.BABYLON) {
			integrate();
			if (window.ARBabylonOnLoad) {
				window.ARBabylonOnLoad();
			}
		} else {
			setTimeout(tick, 50);
		}
	};

	tick();

})();
