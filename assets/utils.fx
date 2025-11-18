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
