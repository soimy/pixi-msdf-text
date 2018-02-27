varying vec2 vTextureCoord;
uniform vec3 u_color;
uniform sampler2D uSampler;
uniform float u_alpha;
uniform float u_fontSize;
uniform float u_weight;
uniform float u_pxrange;

uniform vec3 tint;
// Stroke effect parameters
uniform float strokeWeight;
uniform vec3 strokeColor;

// Shadow effect parameters
uniform bool hasShadow;
uniform vec2 shadowOffset;
uniform float shadowSmoothing;
uniform vec3 shadowColor;
uniform float shadowAlpha;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main(void)
{
    float smoothing = clamp(2.0 * u_pxrange / u_fontSize, 0.0, 0.5);

    vec2 textureCoord = vTextureCoord * 2.;
    vec3 sample = texture2D(uSampler, vTextureCoord).rgb;
    float dist = median(sample.r, sample.g, sample.b);

    float alpha;
    vec3 color;

    // dirty if statment, will change soon
    if (strokeWeight > 0.0) {
        alpha = smoothstep(strokeWeight - smoothing, strokeWeight + smoothing, dist);
        float outlineFactor = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);
        color = mix(strokeColor, u_color, outlineFactor) * alpha;
    } else {
        alpha = smoothstep(u_weight - smoothing, u_weight + smoothing, dist);
        color = u_color * alpha;
    }
    vec4 text = vec4(color * tint, alpha) * u_alpha;
    if (hasShadow == false) {
        gl_FragColor = text;
    } else {
        vec3 shadowSample = texture2D(uSampler, vTextureCoord - shadowOffset).rgb;
        float shadowDist = median(shadowSample.r, shadowSample.g, shadowSample.b);
        float distAlpha = smoothstep(0.5 - shadowSmoothing, 0.5 + shadowSmoothing, shadowDist);
        vec4 shadow = vec4(shadowColor, shadowAlpha * distAlpha);
        gl_FragColor = mix(shadow, text, text.a);
    }
}