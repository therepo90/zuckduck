#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUV;
uniform sampler2D iChannel0;
uniform vec2 mouse;
uniform vec2 iResolution;
uniform float iTime; // seconds

void mainImage(out vec4 f, in vec2 w)
{
    vec2 u = w / iResolution.xy; // left-bottom is (0,0)
    vec4 textureColor = texture2D(iChannel0, u);
    f = textureColor;
}

void main()
{
    mainImage(gl_FragColor, vUV * iResolution.xy);
}
