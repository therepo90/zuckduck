// Fragment shader for circle
precision highp float;
varying vec2 vUV;
void main(void) {
    float dist = distance(vUV, vec2(0.5, 0.5));
    if (dist < 0.45) {
        gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0); // blue circle
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // transparent
    }
}
