import './styles.less';
import * as BABYLON from 'babylonjs';
import * as bgShader from './assets/bg.shader.fragment.fx';


async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

var canvas;
function getResolution(scene){
    var c = scene.getEngine().getRenderingCanvas()
    return new BABYLON.Vector2(c.width, c.height)
}

const createBgPostProcess = (scene: BABYLON.Scene, camera: BABYLON.Camera) => {
    var postProcess = new BABYLON.PostProcess("bg", "./bg.shader", ["iResolution", "iTime", "iMouse", 'laserTint'], ["iChannel0"], 1.0, camera);
    postProcess.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
    var iChannel0 = new BABYLON.Texture('main.JPG', scene);
    let mousePos = new BABYLON.Vector2(0,0); // left-bottom of canvas is (0,0)
    document.addEventListener('mousemove', function(e) {
            mousePos = new BABYLON.Vector2( (e.pageX - canvas.offsetLeft) / canvas.width, 1.0 - (e.pageY - canvas.offsetTop) / canvas.height);
        }
    );
    let time = 0; // time that passed from the beginning

    postProcess.onApply = function (effect) {
        //console.log('rpobimy se apply');
        time += scene.getEngine().getDeltaTime() * 0.001; // Convert milliseconds to seconds
        postProcess.getEffect().setTexture('iChannel0', iChannel0);
        effect.setVector2('iResolution', getResolution(scene))
        effect.setFloat('iTime', time)
        effect.setVector2('iMouse', mousePos);
        effect.setVector3('laserTint', new BABYLON.Vector3(1.0, 0.384,1.000));
    }
    return postProcess;
};

window.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('renderCanvas') as any;
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.0, 0, 0, 0);
        var camera = new BABYLON.UniversalCamera('UniversalCamera', new BABYLON.Vector3(0, 0, -1), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        const pgPostProcess = createBgPostProcess(scene, camera);

        return scene;
    };
    var scene = createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
    setTimeout(() => {
        engine.resize();
    }, 50); // some fancy bug;
});
