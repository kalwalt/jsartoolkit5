// Type definitions for Javascript ARToolKit v5.x
// Project: https://github.com/artoolkit/jsartoolkit5
// Definitions by: Hakan Dilek <https://github.com/hakandilek>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { Scene, Renderer } from 'three';
import { ARCameraParam } from 'jsartoolkit5';
import { ARControllerStatic as ARTK_APIStatic} from './artoolkit.api';


export class ARControllerStatic extends ARTK_APIStatic{
  getUserMediaThreeScene(config: GetUserMediaThreeSceneConfig): HTMLVideoElement;
}

declare interface GetUserMediaThreeSceneConfig {
  width?: number; height?: number;
  maxARVideoSize?: number;
  cameraParam: string | ARCameraParam;
  onSuccess: GetUserMediaThreeSceneConfigSuccessHandler;
}

type GetUserMediaThreeSceneConfigSuccessHandler = (arScene, arController, arCamera) => void;

export class ARThreeScene {
  scene: Scene;
  process(): void;
  renderOn (renderer: Renderer);
}
