
window.addEventListener('artoolkit-loaded', () => {

    QUnit.module("ARCameraPara");
    QUnit.test( "Create object and load camera parameter", function( assert ) {
        const cParaUrl = './camera_para.dat';
        const done = assert.async();
        const success = function() {
            assert.ok(true, "Successfully loaded camera para");
            done();
        }
        const error = function () {
            assert.ok(false, "Failed loading camera para");
            done();
        }
        const cameraPara = new ARCameraParam(cParaUrl, success, error, false);
        assert.equal(cameraPara.src, cParaUrl, "Camera para URL is equal to: " + cParaUrl);
    });
    QUnit.test( "Create object and fail to load camera parameter", function( assert ) {
        const cParaUrl = './camera_para_error.dat';
        const done = assert.async();
        const success = function() {
            assert.ok(false, "Successfully loaded camera para");
            done();
        }
        const error = function () {
            assert.ok(true, "Failed loading camera para");
            done();
        }
        const cameraPara = new ARCameraParam(cParaUrl, success, error, false);
    });
    QUnit.test("Try to load twice", assert => {
        const cParaUrl = './camera_para_error.dat';
        const success = function() {
        }
        const error = function () {
        }
        const cameraPara = new ARCameraParam(cParaUrl, success, error);

        assert.throws(() => {cameraPara.load('./camera_para.dat')},"Throws an error that calibration tried to load twice");
    });
    QUnit.test("Try to load twice but empty existing ARCameraPara before loading", assert => {
        const cParaUrl = './camera_para_error.dat';
        const success = function() {
        }
        const error = function () {
        }
        const cameraPara = new ARCameraParam(cParaUrl, success, error);
        cameraPara.dispose();
        assert.deepEqual("",cameraPara.src);

        const cameraParaString = './camera_para.dat';
        cameraPara.load(cameraParaString);
        assert.deepEqual(cameraParaString, cameraPara.src, "load after dispose should work");
    });

    /* #### ARController Module #### */
    QUnit.module("ARController", {
        beforeEach : assert => {
            this.timeout = 5000;
            this.cleanUpTimeout = 500;
            this.cParaUrl = './camera_para.dat';
            this.checkDefault = (arController) => {
                assert.ok(arController);
                assert.deepEqual(arController.orientation, "landscape", "Check the default values: landscape");
                assert.deepEqual(arController.listeners, {}, "Check the default values: listeners");
                assert.deepEqual(arController.defaultMarkerWidth, 1, "Check the default values: defaultMarkerWidth");
                assert.deepEqual(arController.patternMarkers,{},"Check the default values: patternMarkers==={}");
                assert.deepEqual(arController.barcodeMarkers,{},"Check the default values: barcodeMarkers==={}");
                assert.deepEqual(arController.transform_mat,new Float32Array(16),"Check the default values: transform_mat");
                assert.ok(arController.canvas, "Check the default values: canvas");
                assert.ok(arController.ctx, "Check the default values: ctx");
            }
        }
    });
    QUnit.test("Create ARController default", assert => {
        const videoWidth = 640, videoHeight = 480;
        const done = assert.async();
        assert.timeout(this.timeout);
        const success = () => {
            const arController = new ARController(videoWidth, videoHeight, cameraPara);
            this.checkDefault(arController);
        
            arController.onload = (err) => {
                assert.notOk(err, "no error");
                assert.ok(true, "successfully loaded");
        
                assert.deepEqual(arController.cameraParam, cameraPara, "Check the default values: cameraPara");
                assert.deepEqual(arController.videoWidth, videoWidth, "Check the default values: videoWidth");
                assert.deepEqual(arController.videoHeight, videoHeight, "Check the default values: videoHeight");
                assert.notOk(arController.image, "Check the default values: image === undefined");
            
                assert.deepEqual(arController.canvas.width, videoWidth,"Check the default values: canvas.width");
                assert.deepEqual(arController.canvas.height, videoHeight, "Check the default values: canvas.height");
                setTimeout(() => {
                    arController.dispose();
                    done();
                }
                ,this.cleanUpTimeout);
            };
        }
        const error = function () {
            assert.ok(false);
        }
        const cameraPara = new ARCameraParam(this.cParaUrl, success, error);

    });
    QUnit.test("Create ARController track image", assert => {
        const done = assert.async();
        assert.timeout(this.timeout);
        const success = () => {
            const arController = new ARController(v1, cameraPara);
            arController.debugSetup();
            this.checkDefault(arController);
        
            arController.onload = (err) => {
                assert.notOk(err, "no error");
                assert.ok(true, "successfully loaded");
                assert.deepEqual(arController.cameraParam, cameraPara, "Check the default values: cameraPara");
                assert.deepEqual(arController.image, v1, "Check the default values: image");
                assert.deepEqual(arController.videoWidth, v1.width, "Check the default values: image.width");
                assert.deepEqual(arController.videoHeight, v1.height, "Check the default values: image.height");
            
                assert.deepEqual(arController.canvas.width, v1.width,"Check the default values: canvas.width");
                assert.deepEqual(arController.canvas.height, v1.height, "Check the default values: canvas.height");
                const t0 = performance.now();
                const detectMarkerResult = arController.detectMarker()
                const t1 = performance.now();

                assert.ok( detectMarkerResult == 0, "Detected marker in image");
                assert.ok( t1 - t0 < 700, "Detect marker returns within expected time < 100ms actual: " + (t1 - t0));

                arController.debugDraw();
                setTimeout(() => {
                    arController.dispose();
                    done();
                }
                ,this.cleanUpTimeout);
            };
        }
        const error = () => {
            assert.ok(false);
            done();
        }
        const cameraPara = new ARCameraParam(this.cParaUrl, success, error);
    });
    QUnit.test("Create ARController default, CameraPara as string", assert => {
        const videoWidth = 640, videoHeight = 480;
        const cameraParaUrl = './camera_para.dat';
        const done = assert.async();
        assert.timeout(this.timeout);
        //ARController calls _initialize, which in turn contains a timeOut-function that waits for 1ms 

        const error = function () {
            assert.ok(false);
            done();
        }
        const success = () => {
            const arController = new ARController(videoWidth, videoHeight, cameraParaUrl);

            arController.onload = (err) => {
                assert.notOk(err, "no error");
                assert.ok(true, "successfully loaded");
                this.checkDefault(arController);
        
                assert.deepEqual(arController.videoWidth, videoWidth, "Check the default values: videoWidth");
                assert.deepEqual(arController.videoHeight, videoHeight, "Check the default values: videoHeight");
                assert.notOk(arController.image, "Check the default values: image === undefined");
            
                assert.deepEqual(arController.canvas.width, videoWidth,"Check the default values: canvas.width");
                assert.deepEqual(arController.canvas.height, videoHeight, "Check the default values: canvas.height");

                setTimeout(() => {
                    arController.dispose();
                    done();
                }
                ,this.cleanUpTimeout);
            };
        }
        const cameraPara = new ARCameraParam(this.cParaUrl, success, error);
    });
    QUnit.test("Create ARController default, CameraPara as invalid string", assert => {
        const videoWidth = 640, videoHeight = 480;
        const cameraParaUrl = './camera_para_error.dat';
        assert.timeout(this.timeout);
        //ARController calls _initialize, which in turn contains a timeOut-function that waits for 1ms 
        const done = assert.async();

        const error = function () {
            assert.ok(false);
        }
        const success = () => {
            const arController = new ARController(videoWidth, videoHeight, cameraParaUrl);

            arController.onload = (err) => {
                assert.deepEqual(err, 404, "error while loading");
                setTimeout(() => {
                    arController.dispose();
                    done();
                }
                ,this.cleanUpTimeout);
            };
        }
        const cameraPara = new ARCameraParam(this.cParaUrl, success, error);

    });

    /* #### ARController.getUserMedia module #### */ 
    QUnit.module("ARController.getUserMedia", {
        afterEach : assert => {
            if(this.video.srcObject) {
                const track = this.video.srcObject.getTracks()[0];
                track.stop();
                this.video.srcObject = null;
            }
            this.video.src = null;
        }
    });
    QUnit.test("getUserMedia", assert => {
        const width = 640;
        const height = 480;
        const facingMode = 'environment';
        const success = (video) => {
            assert.ok(video,"Successfully created video element");
            assert.ok(video.srcObject, "Check the source object");
            assert.deepEqual(video.srcObject.getTracks().length,1, "Ensure we only get one Track back ... ");
            assert.deepEqual(video.srcObject.getVideoTracks().length,1, ".. and that that track is of type 'video'");
            const videoTrack = video.srcObject.getVideoTracks()[0];
            console.log("videoTrack.label: " + videoTrack.label);

            assert.ok(videoTrack.getSettings(), "Check if the video track has settings available");
            const videoTrackSettings = videoTrack.getSettings();
            assert.deepEqual(videoTrackSettings.width, width, "Video width from constraints");
            assert.deepEqual(videoTrackSettings.height, height, "Video height from constraints");
            
            const supported = navigator.mediaDevices.getSupportedConstraints();
            // Mobile supports facingMode to be set. Desktop states that facingMode is supported but doesn't list the facing mode inside the settings and hence it will fail
            if(supported["facingMode"] && videoTrackSettings.facingMode)
                assert.deepEqual(videoTrackSettings.facingMode, facingMode, "Video facing mode from constraints");

            // Don't check video.src anymore because it should not be available in modern browsers
            //assert.ok(video.src);
            this.video = video;
            done();
        }
        const error = err => {
            assert.notOk(err);
            done();
        }

        const configuration = {
            onSuccess : success,
            onError : error,
            width : width,
            height : height,
            facingMode : facingMode

        };
        assert.timeout(10000);
        const done = assert.async();
        const video = ARController.getUserMedia(configuration);
        // The video element is lazy loading better to check it inside the success function
        assert.ok(video, "The created video element");
        // Add the video element to html
        document.body.appendChild(video);
    });
    QUnit.test("getUserMedia with max/min constraints", assert => {
        const width = {min: 320, max: 640};
        const height = {min: 240, max: 480};
        const facingMode = {ideal: 'environment'};
        const success = (video) => {
            this.video = video;
            const videoTrack = video.srcObject.getVideoTracks()[0];
            const videoTrackSettings = videoTrack.getSettings();
            assert.deepEqual(videoTrackSettings.width, width.max, "Video width from constraints");
            assert.deepEqual(videoTrackSettings.height, height.max, "Video height from constraints");

            done();
        }
        const error = err => {
            assert.notOk(err);
            done();
        }

        const configuration = {
            onSuccess : success,
            onError : error,
            width : width,
            height : height,
            facingMode : facingMode

        };
        assert.timeout(10000);
        const done = assert.async();
        const video = ARController.getUserMedia(configuration);
        // The video element is lazy loading better to check it inside the success function
        assert.ok(video, "The created video element");
    });
    QUnit.test("getUserMedia with ideal constraints", assert => {
        const width = {min: 320, ideal: 640};
        const height = {min: 240, ideal: 480};
        const facingMode = {ideal: 'environment'};
        const success = (video) => {
            this.video = video;
            const videoTrack = video.srcObject.getVideoTracks()[0];
            const videoTrackSettings = videoTrack.getSettings();
            assert.deepEqual(videoTrackSettings.width, width.ideal, "Video width from constraints");
            assert.deepEqual(videoTrackSettings.height, height.ideal, "Video height from constraints");
            done();
        }
        const error = err => {
            assert.notOk(err);
            done();
        }

        const configuration = {
            onSuccess : success,
            onError : error,
            width : width,
            height : height,
            facingMode : facingMode

        };
        assert.timeout(10000);
        const done = assert.async();
        const video = ARController.getUserMedia(configuration);
        // The video element is lazy loading better to check it inside the success function
        assert.ok(video, "The created video element");
    });

    QUnit.test("getUserMedia facing user", assert => {
        const facingMode = {ideal: 'user'};
        const success = (video) => {
            this.video = video;
            const videoTrack = video.srcObject.getVideoTracks()[0];
            const videoTrackSettings = videoTrack.getSettings();

            const supported = navigator.mediaDevices.getSupportedConstraints();
            // Mobile supports facingMode to be set. Desktop states that facingMode is supported but doesn't list the facing mode inside the settings and hence it will fail
            if(supported["facingMode"] && videoTrackSettings.facingMode)
                assert.deepEqual(videoTrackSettings.facingMode, facingMode.ideal, "Video facing mode from constraints");
            done();
        }
        const error = err => {
            assert.notOk(err);
            done();
        }

        const configuration = {
            onSuccess : success,
            onError : error,
            facingMode : facingMode

        };
        assert.timeout(10000);
        const done = assert.async();
        const video = ARController.getUserMedia(configuration);
        // The video element is lazy loading better to check it inside the success function
        assert.ok(video, "The created video element");
        // Add the video element to html
        document.body.appendChild(video);
    });

    /* #### ARController.getUserMediaARController module #### */ 
    QUnit.module("ARController.getUserMediaARController", { 
        beforeEach : assert => {
            this.timeout = 5000;
            this.cleanUpTimeout = 500;
        }
    });
    QUnit.test("getUserMediaARController default", assert => {
        const done = assert.async();
        assert.timeout(this.timeout);
        const success = (arController, arCameraParam) => {
            assert.ok(arController, "ARController created");
            assert.ok(arController.id>=0, "ARController id created");
            assert.ok(arCameraParam, "ARCameraPara created");
            setTimeout( ()=> {
                arController.dispose();
                done();
            }, this.cleanUpTimeout);
        };

        const error = error => {
            assert.notOk(error);
            done();
        }

        const config = {
            onSuccess : success,
            onError : error,

            cameraParam: './camera_para.dat', // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.

            width : 640,
            height : 480,

            facingMode : 'environment'
        }
        const video = ARController.getUserMediaARController(config);
        assert.ok(video, "Video created");                                                  
        document.body.appendChild(video);
    });
    QUnit.test("getUserMediaARController wrong calib-url", assert => {
        const done = assert.async();
        assert.timeout(5000);
        const success = (arController, arCameraParam) => {
            assert.notOk(arController, "ARController created");
            done();
        };

        const error = error => {
            assert.ok(error);
            assert.notOk(video.srcObject);
            done();
        }

        const config = {
            onSuccess : success,
            onError : error,

            cameraParam: './camera_para_error.dat', // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.

            width : 640,
            height : 480,

            facingMode : 'environment'
        }
        const video = ARController.getUserMediaARController(config);
        assert.ok(video, "Video created");                                                  
        document.body.appendChild(video);
    });
    QUnit.module("ARController.Test trackable registration",{
        afterEach : assert => {
            if(this.video.srcObject) {
                const track = this.video.srcObject.getTracks()[0];
                track.stop();
                this.video.srcObject = null;
            }
            this.video.src = null;
        }
    });
    QUnit.test("Register valid trackable", assert => {

        const done = assert.async();
        assert.timeout(5000);

        const loadMarkerSuccess = (markerId) => {
            assert.ok(markerId >= 0);
            done();
        }
        const loadMarkerError = error => {
            assert.notOk(error);
            done();
        }


        const successCallback = (arController, arCameraParam) => {
            // add marker string
            arController.loadMarker('../examples/Data/patt.hiro', loadMarkerSuccess, loadMarkerError);

        };

        const errorCallback = (error) => {
            console.log("ERROR" + error);
            assert.notOk(error, "Error while calling `getUserMediaARController`");
            done();
        }

        const config = {
            onSuccess : successCallback,
            onError: errorCallback,
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment', 
        };

        this.video = ARController.getUserMediaARController(config);
        
    });
    QUnit.test("Register invalid trackable", assert => {

        const done = assert.async();
        assert.timeout(5000);

        const loadMarkerSuccess = (markerId) => {
            assert.ok(markerId >= 0);
            done();
        };
        const loadMarkerError = error => {
            assert.ok(error=404, 'Test with invalid pattern-URL');
            done();
        };

        const successCallback = (arController, arCameraParam) => {
            // add marker string
            arController.loadMarker('../examples/Data/patt_error.hiro', loadMarkerSuccess, loadMarkerError);
        };

        const errorCallback = (error) => {
            console.log("ERROR" + error);
            assert.notOk(error, "Error while calling `getUserMediaARController`");
            done();
        };

        const config = {
            onSuccess : successCallback,
            onError: errorCallback,
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment', 
        };

        this.video = ARController.getUserMediaARController(config);
        
    });
    QUnit.test("Register valid NFT trackable", assert => {

      const done = assert.async();
      assert.timeout(5000);
    
      const loadMarkerSuccess = (markerId) => {
          assert.ok(markerId >= 0);
          done();
      }
      const loadMarkerError = error => {
          assert.notOk(error);
          done();
      }
    
    
      const successCallback = (arController, arCameraParam) => {
          // add NFT marker string
          arController.loadNFTMarker('../examples/DataNFT/pinball', loadMarkerSuccess, loadMarkerError);
    
      };
    
      const errorCallback = (error) => {
          console.log("ERROR" + error);
          assert.notOk(error, "Error while calling `getUserMediaARController`");
          done();
      }
    
      const config = {
          onSuccess : successCallback,
          onError: errorCallback,
          cameraParam: './camera_para.dat',
          maxARVideoSize: 640,
          width: 640,
          height: 480,
          facingMode: 'environment',
      };
    
      this.video = ARController.getUserMediaARController(config);
    
    });
    QUnit.test("Register invalid NFT trackable", assert => {
    
      const done = assert.async();
      assert.timeout(5000);
    
      const loadMarkerSuccess = (markerId) => {
          assert.ok(markerId >= 0);
          done();
      };
      const loadMarkerError = error => {
          assert.ok(error=404, 'Test with invalid pattern-URL');
          done();
      };
    
      const successCallback = (arController, arCameraParam) => {
          // add marker string
          arController.loadNFTMarker('../examples/DataNFT/pinball-error', loadMarkerSuccess, loadMarkerError);
      };
    
      const errorCallback = (error) => {
          console.log("ERROR" + error);
          assert.notOk(error, "Error while calling `getUserMediaARController`");
          done();
      };
    
      const config = {
          onSuccess : successCallback,
          onError: errorCallback,
          cameraParam: './camera_para.dat',
          maxARVideoSize: 640,
          width: 640,
          height: 480,
          facingMode: 'environment',
      };
    
      this.video = ARController.getUserMediaARController(config);
    
    });
    QUnit.test("Register empty URL NFT trackable", assert => {
    
      const done = assert.async();
      assert.timeout(5000);
    
      const loadMarkerSuccess = (markerId) => {
          assert.ok(markerId >= 0, 'MarkerId is greater or equals 0');
          done();
      };
      const loadMarkerError = error => {
          console.log(error);
          assert.ok(error, 'Test with invalid pattern-URL');
          done();
      };
    
      const successCallback = (arController, arCameraParam) => {
          // add marker string
          arController.loadNFTMarker("", loadMarkerSuccess, loadMarkerError);
      };
    
      const errorCallback = (error) => {
          console.log("ERROR" + error);
          assert.notOk(error, "Error while calling `getUserMediaARController`");
          done();
      };
    
      const config = {
          onSuccess : successCallback,
          onError: errorCallback,
          cameraParam: './camera_para.dat',
          maxARVideoSize: 640,
          width: 640,
          height: 480,
          facingMode: 'environment',
      };
    
      this.video = ARController.getUserMediaARController(config);
    
    });
    QUnit.test("Register empty URL trackable", assert => {

        const done = assert.async();
        assert.timeout(5000);

        const loadMarkerSuccess = (markerId) => {
            assert.ok(markerId >= 0, 'MarkerId is greater or equals 0');
            done();
        };
        const loadMarkerError = error => {
            console.log(error);
            assert.ok(error, 'Test with invalid pattern-URL');
            done();
        };

        const successCallback = (arController, arCameraParam) => {
            // add marker string
            arController.loadMarker("", loadMarkerSuccess, loadMarkerError);
        };

        const errorCallback = (error) => {
            console.log("ERROR" + error);
            assert.notOk(error, "Error while calling `getUserMediaARController`");
            done();
        };

        const config = {
            onSuccess : successCallback,
            onError: errorCallback,
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment', 
        };

        this.video = ARController.getUserMediaARController(config);
        
    });
    

    /* #### Full setup test #### */ 
    QUnit.module("Performance test",{
        beforeEach : assert => {
            this.timeout = 10000;
            this.cleanUpTimeout = 500;
        },
        afterEach : assert => {
            if(this.video.srcObject) {
                const track = this.video.srcObject.getTracks()[0];
                track.stop();
                this.video.srcObject = null;
            }
            this.video.src = null;
        }
    });
    QUnit.test("PTV: performance test video", assert => {

        const t0 = performance.now();
        const testDone = assert.async();

        performance.mark('start video measure');
        const done = () => {
            performance.mark('cleanup-done');
            performance.measure('Cleanup time', 'cleanup', 'cleanup-done');
            performance.measure('Test time', 'start video measure', 'cleanup-done');
            const measures = performance.getEntriesByType('measure');
            const csv = Papa.unparse(JSON.stringify(measures));
            console.log(csv);

            testDone();
        };
        assert.timeout(this.timeout);
        assert.expect(0);
        const success = (arController, arCameraParam) => {
            performance.mark('getUserMediaARController-success');
            performance.measure('Start videostream','start video measure', 'getUserMediaARController-success');

            arController.loadMarker('./patt.hiro',(markerId) => { 
                performance.mark('loadMarker-success');
                performance.measure('Load marker','getUserMediaARController-success', 'loadMarker-success');


                let t1 = performance.now();
                //Process the open video stream
                for(var i = 0; i <= 100; i++) {
                    performance.mark('process-' + i + ' start');
                    t1 = performance.now();
                    arController.process(this.video);
                    performance.mark('process-' + i + ' done');
                    performance.measure('process video','process-' + i + ' start', 'process-' + i + ' done');
                }

                performance.mark('cleanup');
                arController.dispose();
                done();
            });
        };

        const error = error => {
            done();
        }

        const config = {
            onSuccess : success,
            onError : error,

            cameraParam: './camera_para.dat', // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.

            width : 640,
            height : 480,

            facingMode : 'environment'
        }
        this.video = ARController.getUserMediaARController(config);
        document.body.appendChild(this.video);
    });
    
    QUnit.module("Performance test image",{
        beforeEach : assert => {
            this.timeout = 10000;
            this.cleanUpTimeout = 500;
        }
    });
    QUnit.test("performance test image", assert => {

        const testDone = assert.async();
        const cParaUrl = './camera_para.dat';

        performance.mark('start image measure');
        const done = () => {
            performance.mark('cleanup-done');
            performance.measure('Cleanup time', 'cleanup', 'cleanup-done');
            performance.measure('Test time', 'start image measure', 'cleanup-done');
            const measures = performance.getEntriesByType('measure');
            const csv = Papa.unparse(JSON.stringify(measures));
            console.log(csv);

            testDone();
        };
        assert.timeout(this.timeout);
        assert.expect(0);

        const success = () => {
            const arController = new ARController(v1, cameraPara);
            arController.onload = () => {
                performance.mark('ARController.onload()');
                performance.measure('Start ARController','start image measure', 'ARController.onload()');
        
                arController.loadMarker('./patt.hiro',(markerId) => { 
                    performance.mark('loadMarker-success');
                    performance.measure('Load marker','ARController.onload()', 'loadMarker-success');
        
                    for(var i = 0; i <= 100; i++) {
                        //Process an image
                        performance.mark('process-' + i + ' start');
                        arController.process(v1);
                        performance.mark('process-' + i + ' done');
                        performance.measure('process image','process-' + i + ' start', 'process-' + i + ' done');
                    }
        
                    performance.mark('cleanup');
                    arController.dispose();
                    done();
                });
            };
        };

        const error = error => {
            assert.notOk(error);
            testDone();
        }

        const cameraPara = new ARCameraParam(cParaUrl, success, error);
    });
});
//TODO write test for external Video stream creation