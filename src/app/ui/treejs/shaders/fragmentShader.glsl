
precision mediump float;\
\
uniform sampler2D texture;\
uniform float time;\
varying vec2 vUv;\
\
void main() {
    vec4 texColor = texture2D(texture, vUv);\
    vec3 color = texColor.rgb;\
    gl_FragColor = vec4(color, 41.0);\
}\

