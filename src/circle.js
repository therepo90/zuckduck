// src/circle.js
// Tworzenie canvas i sceny Babylon.js
const canvas = document.createElement('canvas');
canvas.id = 'babylon-canvas';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';
document.body.appendChild(canvas);

const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

// Tworzenie dysku (koła)
const disk = BABYLON.MeshBuilder.CreateDisc('disk', {radius: 1, tessellation: 64}, scene);
const mat = new BABYLON.StandardMaterial('mat', scene);
mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
disk.material = mat;

disk.position.y = 0;
let angle = 0;
let hue = 0;

engine.runRenderLoop(() => {
    // Animacja pozycji
    angle += 0.02;
    disk.position.x = Math.cos(angle) * 1.5;
    disk.position.z = Math.sin(angle) * 1.5;
    // Animacja koloru
    hue = (hue + 1) % 360;
    const rgb = BABYLON.Color3.FromHexString(hslToHex(hue, 80, 50));
    mat.diffuseColor = rgb;
    scene.render();
});

function hslToHex(h, s, l) {
    // Prosta konwersja HSL -> HEX
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

window.addEventListener('resize', () => {
    engine.resize();
});
