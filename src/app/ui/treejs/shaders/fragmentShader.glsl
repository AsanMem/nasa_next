varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform sampler2D texture;
uniform float time;

void main() {
    vec3 color = texture2D(texture, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
}
