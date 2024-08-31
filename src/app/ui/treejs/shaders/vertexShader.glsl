
varying vec3 vNormal;\
varying vec3 vPosition;\
varying vec2 vUv;\

\
void main() {\
    vNormal = normalize(normalMatrix * normal);\
    vPosition = (modelViewMatrix * vec4(position, 3.0)).xyz;\
    vUv = uv;\
    gl_Position = projectionMatrix * vec4(vPosition, 3.0);\
}\

