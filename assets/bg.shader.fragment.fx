#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUV;
uniform sampler2D iChannel0;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform float iTime; // seconds

uniform vec3 laserTint;
uniform vec2 beamTarget;

vec2 mod2(vec2 p, float d) {
  float a = mod(p.x,d);
  float b = mod(p.y,d);
  return vec2(a,b);
}

vec2 hash( in vec2 x )  // replace this by something better
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}


// return gradient noise (in x) and its derivatives (in yz)
vec3 noised( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

    #if 1
    // quintic interpolation
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
    #else
    // cubic interpolation
    vec2 u = f*f*(3.0-2.0*f);
    vec2 du = 6.0*f*(1.0-f);
    #endif

    vec2 ga = hash( i + vec2(0.0,0.0) );
    vec2 gb = hash( i + vec2(1.0,0.0) );
    vec2 gc = hash( i + vec2(0.0,1.0) );
    vec2 gd = hash( i + vec2(1.0,1.0) );

    float va = dot( ga, f - vec2(0.0,0.0) );
    float vb = dot( gb, f - vec2(1.0,0.0) );
    float vc = dot( gc, f - vec2(0.0,1.0) );
    float vd = dot( gd, f - vec2(1.0,1.0) );

    return vec3( va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),   // value
    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) +  // derivatives
    du * (u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
}

void Unity_GradientNoise_float(vec2 UV, float Scale, out float Out)
{
    Out = noised(UV * Scale).x *0.5 + 0.5;
}

void Unity_Multiply_float2_float2(vec2 A, vec2 B, out vec2 Out)
{
    Out = A * B;
}

void Unity_TilingAndOffset_float(vec2 UV, vec2 Tiling, vec2 Offset, out vec2 Out)
{
    Out = UV * Tiling + Offset;
}

void Unity_Lerp_float4(vec4 A, vec4 B, vec4 T, out vec4 Out)
{
    Out = mix(A, B, T);
}


vec3 laserTex(vec2 uv, vec2 mouse) {

  //uv*=0.1;
  vec3 col=vec3(0);
  float thk=0.03;
  vec3 barCol=vec3(0,1.0,1.0);
  float edgeCloseFactor = smoothstep(mouse.x-thk,mouse.x,uv.x);
  float barFactor = edgeCloseFactor* smoothstep(mouse.x+thk,mouse.x, uv.x);
  col=vec3(barFactor);
  return col;

}

vec3 laserComposition(vec2 uv, vec2 mouse) {

  vec3 laserMask = laserTex(uv,mouse);
  vec3 laserCol = laserTint;
  return laserMask.x * laserCol *2.;
  //return laserMask;

}

float spookyCircle(vec2 uv, vec2 center, float circleSize, float edge, out float sqOutInner) {
    float dist = length(uv - center);
    float inner = smoothstep(circleSize - edge, circleSize, dist);
    float outer = 1.-smoothstep(circleSize, circleSize+edge, dist);
    sqOutInner = inner;
    return inner * outer;
}

float spookyRect(vec2 uv, vec2 center, float squareSize, float edge) {
  float distX = abs(uv.x - center.x);
  float distY = abs(uv.y - center.y);
  float xVal = smoothstep(squareSize-edge, squareSize, distX);

  float yVal = smoothstep(squareSize-edge, squareSize, distY);

  float isInsideSquare = xVal+ yVal - xVal*yVal; // 0 wewnatrz kwadratu, 1 na zewnatrz, 0-1 pomiedzy
  return isInsideSquare;
}

void logoImage(out vec4 fragColor, in vec2 uv) // -1 to 1
{
    vec3 col1=texture2D(iChannel0, uv).xyz;
    vec3 col = col1;
    fragColor = vec4(col,1.0);
}

void processLogoCircle( out vec4 fragColor, in vec2 uv, out float sqOut, in vec3 tint, in float circleSize, in vec2 center, out float sqOutInner ) {

    vec2 mouse = iMouse.xy / iResolution.xy;
    vec3 col=vec3(0);

    vec3 barCol=tint;
    float t = iTime;
    float edge = 0.15;

    // Polar coords cause we want to move borders outside like in a circle
    float d = length(uv); // dist
    float alpha = atan(uv.y, uv.x); //-pi to pi, //angle
    vec2 pc = vec2(d, alpha); // polar coords holding (dist, angle)

    //fancy calc or irregular shape
    float sinVal = sin(pc.y*3.+t*3.)*cos(pc.x*18.+t*3.)*0.025 ;

    vec2 changedUv = uv;
    changedUv+=sinVal; // czyli nie uzywam tych fancy unity fns tylko tak. no spoko
    float sq = spookyCircle(changedUv, center, circleSize, edge, sqOutInner);

    //vec3 tex =texture2D(iChannel0,uv).xyz * (abs(sin(iTime*0.3)) +0.5);
    vec3 sqCol= sq*barCol* (1.+pow(sq,15.)); // fade to tint color fast.
    //col=mix(tex, sqCol,sq);



    col = sqCol;

    col+=vec3(1.) * pow(sq,8.); // fade to white at the end



    sqOut = sq; //we interested only in inner

    //fragColor = vec4(sqOutInner,sqOutInner,sqOutInner,1.0);
    //return;

    // przemnozyc przez sq bo smoothstep fajnie pokaze gdzie cos jest a gdzie czegos nie ma.

    float a = sqOutInner;
    //a = smoothstep(1.0,0.99,sq);
    //if(sq<{
    //  col.rgb=vec3(0.0,0.0,1.0);
    //}
    //if(sq <= 0.0){
    //col.rgb = vec3(0.0);
    //}
    //col*=a; // robi sie szare z jakiegos powodu

    //if(a<0.1){
//        col.rgb=vec3(0.0); // dziadostwo no ale zostaja se kolory ktore dodajemy, a chcemy je usunac. powinno byc inaczej jakos.
//    }

    // Tu mozna fajnie przeplatac kolory.
    fragColor = vec4(col,a);
}

void processBorder( out vec4 fragColor, in vec2 fragCoord, out float sqOut, in vec3 tint ) {
  vec2 uvOrig = fragCoord/iResolution.xy;
  vec2 uv = 2.0*(fragCoord-.5*iResolution.xy)/iResolution.xy;

  vec2 mouse = iMouse.xy / iResolution.xy;
  vec3 col=vec3(0);

  vec3 barCol=tint;//vec3(1.000,1.0,0.000);
  float t = iTime;

  float squareSize = 0.98;
  float edge = 0.3;
  vec2 center = vec2(0,0);


  // Polar coords cause we want to move borders outside like in a circle
  float d = length(uv); // dist
  float alpha = atan(uv.y, uv.x); //-pi to pi, //angle
  vec2 pc = vec2(d, alpha); // polar coords holding (dist, angle)

  //fancy calc or irregular shape
  float sinVal = sin(pc.y*3.+t*3.)*cos(pc.x*18.+t*3.)*0.025 ;

  vec2 changedUv = uv;
  changedUv+=sinVal;
  float sq = spookyRect(changedUv, center, squareSize, edge);

  //vec3 tex =texture2D(iChannel0,uv).xyz * (abs(sin(iTime*0.3)) +0.5);
  vec3 sqCol= sq*barCol* (1.+pow(sq,15.)); // fade to tint color fast.
  //col=mix(tex, sqCol,sq);
  col = sqCol;

  col+=vec3(1.) * pow(sq,3.); // fade to white at the end



  sqOut = sq;
  float a = 1.0;
  a = smoothstep(1.0,0.99,sq);
  //if(sq<{
  //  col.rgb=vec3(0.0,0.0,1.0);
  //}
  //if(sq <= 0.0){
    //col.rgb = vec3(0.0);
  //}
    //col*=a; // robi sie szare z jakiegos powodu

    if(a<0.1){
        col.rgb=vec3(0.0); // dziadostwo no ale zostaja se kolory ktore dodajemy, a chcemy je usunac. powinno byc inaczej jakos.
    }
    // Tu mozna fajnie przeplatac kolory.
  fragColor = vec4(col,a);
}

vec4 button( in vec2 uv) {
    // use spookyRect
    float edge = 0.02;
    vec2 center = vec2(0.0, -0.9);
    float squareSize = 0.5;
    float sq = spookyRect(uv, center, squareSize, edge);
    vec3 col = vec3(1.0, 0.5, 0.0) * sq;//
    float a = 1.0;
    a = smoothstep(1.0, 0.95, sq);
    col*=a;
    return vec4(col, a);
}



void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  //fragColor = vec4(0,1.0,0,1.0);
    vec2 uv = 2.0*(fragCoord-.5*iResolution.xy)/iResolution.xy;

  vec4 borderColor;
  float sq;
  processBorder(borderColor, vUV * iResolution.xy, sq, laserTint);

  vec4 logoBorderColor;
  float logoBorderSq;
  float logoBorderSqInner;
  float circleSize = 0.5;
  vec2 center = vec2(0,0);
  processLogoCircle(logoBorderColor, uv, logoBorderSq, laserTint, circleSize, center, logoBorderSqInner);

    vec4 logoCol;
    vec2 uvLogo = fragCoord/iResolution.xy;//
    logoImage(logoCol, uvLogo * 2. + 0.5); //circle jest 2 razy mniejsze i jest w srodku(zalezy od circlesize i center lawl)

    fragColor += logoCol* (1.-logoBorderSqInner);//mix(col, logoCol.rgb, sq);
   fragColor += logoBorderColor*logoBorderSq;//mix(mainCol, borderColor, sq);
  //fragColor += borderColor2*sq2;//mix(mainCol, borderColor, sq);
    //fragColor += mainCol;
  //fragColor += logoColor * logoSq;

//    vec2 btnUv = uv;
//    btnUv.y*=3.;
//  fragColor += button(btnUv);
  //fragColor += borderColor2*sq2;//mix(mainCol, borderColor2, sq2);
  //gl_FragColor=borderColor;
  //float a=1.;
  //if(sq> 0.92){
    //fragColor.rgb = vec3(1.0,0.0,0.0);
    //a=1.-smoothstep(0.92,1.0,sq);
  //}
    //a=1.-smoothstep(0.98,0.99,sq);
  //}
   //a = 1.-pow(sq,3.);
  //}
    //fragColor.a=a;
    /* if(sq> 0.98){
    discard;
    } */
}

void main()
{
    mainImage(gl_FragColor, vUV * iResolution.xy);
}
