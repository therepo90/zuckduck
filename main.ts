import './styles.less';
import * as BABYLON from 'babylonjs';
import * as bgShader from './assets/bg.shader.fragment.fx';
import {api} from './config';

function getResolution(scene){
    var c = scene.getEngine().getRenderingCanvas()
    return new BABYLON.Vector2(c.width, c.height)
}

const createBgPostProcess = (scene: BABYLON.Scene, camera: BABYLON.Camera, cfg) => {
    const canvas = scene.getEngine().getRenderingCanvas();
    BABYLON.Effect.ShadersStore["bgFragmentShader"] = bgShader;
    var postProcess = new BABYLON.PostProcess("bg", "bg", ["iResolution", "iTime", "iMouse", 'laserTint'], ["iChannel0"], 1.0, camera);
    postProcess.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
    var iChannel0 = new BABYLON.Texture(cfg.img, scene);
    let mousePos = new BABYLON.Vector2(0,0); // left-bottom of canvas is (0,0)
    document.addEventListener('mousemove', function(e) {
            mousePos = new BABYLON.Vector2( (e.pageX - canvas.offsetLeft) / canvas.width, 1.0 - (e.pageY - canvas.offsetTop) / canvas.height);
        }
    );
    let time = 0; // time that passed from the beginning

    postProcess.onApply = function (effect) {
        //console.log('rpobimy se apply');
        time += scene.getEngine().getDeltaTime() * 0.001; // Convert milliseconds to seconds
        effect.setTexture('iChannel0', iChannel0);
        effect.setVector2('iResolution', getResolution(scene))
        effect.setFloat('iTime', time)
        effect.setVector2('iMouse', mousePos);
        effect.setVector3('laserTint', cfg.borderColor);
    }
    return postProcess;
};

function initCanvasEngine(canvas: any, cfg: any) {
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.0, 0, 0, 0);
        var camera = new BABYLON.UniversalCamera('UniversalCamera', new BABYLON.Vector3(0, 0, -1), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        const pgPostProcess = createBgPostProcess(scene, camera, cfg);

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
}

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('renderCanvas') as any;
    const canvas2 = document.getElementById('renderCanvas2') as any;
    const fbCfg = {
        img: 'fb.png',
        borderColor: new BABYLON.Vector3(0.043, 0.573, 0.969)
    }
    const instaCfg = {
        img: 'insta.png',
        borderColor: new BABYLON.Vector3(254,0,129)
    }
    initCanvasEngine(canvas, fbCfg);
    initCanvasEngine(canvas2, instaCfg);

    document.querySelector('#counter-btn-fb').addEventListener('click', function(e) {
        fetch(
        // @ts-ignore
            `${api}/api/up`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'fb'
                }),
            });
    });

    document.querySelector('#counter-btn-ig').addEventListener('click', function(e) {
        fetch(
            // @ts-ignore
            `${api}/api/up`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'ig'
                }),
            });
    });

    fetch(
        // @ts-ignore
        `${api}/api/stuff`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => {
            return res.json()
        }).then(res => {
            document.querySelector('#counter-fb').textContent = res.fb;
            document.querySelector('#counter-ig').textContent = res.ig;
    })

});
