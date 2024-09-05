"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[299],{6993:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"RouterContext",{enumerable:!0,get:function(){return i}});let i=r(6921)._(r(2265)).default.createContext(null)},6967:function(e,t,r){r.d(t,{z:function(){return h}});var i=r(6376);let a={type:"change"},o={type:"start"},s={type:"end"},n=new i.zHn,l=new i.JOQ,u=Math.cos(70*i.M8C.DEG2RAD);class h extends i.pBf{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new i.Pa4,this.cursor=new i.Pa4,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:i.RsA.ROTATE,MIDDLE:i.RsA.DOLLY,RIGHT:i.RsA.PAN},this.touches={ONE:i.QmN.ROTATE,TWO:i.QmN.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return m.phi},this.getAzimuthalAngle=function(){return m.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(e){e.addEventListener("keydown",er),this._domElementKeyEvents=e},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",er),this._domElementKeyEvents=null},this.saveState=function(){r.target0.copy(r.target),r.position0.copy(r.object.position),r.zoom0=r.object.zoom},this.reset=function(){r.target.copy(r.target0),r.object.position.copy(r.position0),r.object.zoom=r.zoom0,r.object.updateProjectionMatrix(),r.dispatchEvent(a),r.update(),c=h.NONE},this.update=function(){let t=new i.Pa4,o=new i._fP().setFromUnitVectors(e.up,new i.Pa4(0,1,0)),s=o.clone().invert(),v=new i.Pa4,b=new i._fP,T=new i.Pa4,M=2*Math.PI;return function(x=null){let C=r.object.position;t.copy(C).sub(r.target),t.applyQuaternion(o),m.setFromVector3(t),r.autoRotate&&c===h.NONE&&D(null!==x?2*Math.PI/60*r.autoRotateSpeed*x:2*Math.PI/60/60*r.autoRotateSpeed),r.enableDamping?(m.theta+=p.theta*r.dampingFactor,m.phi+=p.phi*r.dampingFactor):(m.theta+=p.theta,m.phi+=p.phi);let E=r.minAzimuthAngle,y=r.maxAzimuthAngle;isFinite(E)&&isFinite(y)&&(E<-Math.PI?E+=M:E>Math.PI&&(E-=M),y<-Math.PI?y+=M:y>Math.PI&&(y-=M),E<=y?m.theta=Math.max(E,Math.min(y,m.theta)):m.theta=m.theta>(E+y)/2?Math.max(E,m.theta):Math.min(y,m.theta)),m.phi=Math.max(r.minPolarAngle,Math.min(r.maxPolarAngle,m.phi)),m.makeSafe(),!0===r.enableDamping?r.target.addScaledVector(g,r.dampingFactor):r.target.add(g),r.target.sub(r.cursor),r.target.clampLength(r.minTargetRadius,r.maxTargetRadius),r.target.add(r.cursor);let P=!1;if(r.zoomToCursor&&S||r.object.isOrthographicCamera)m.radius=B(m.radius);else{let e=m.radius;m.radius=B(m.radius*f),P=e!=m.radius}if(t.setFromSpherical(m),t.applyQuaternion(s),C.copy(r.target).add(t),r.object.lookAt(r.target),!0===r.enableDamping?(p.theta*=1-r.dampingFactor,p.phi*=1-r.dampingFactor,g.multiplyScalar(1-r.dampingFactor)):(p.set(0,0,0),g.set(0,0,0)),r.zoomToCursor&&S){let a=null;if(r.object.isPerspectiveCamera){let e=t.length();a=B(e*f);let i=e-a;r.object.position.addScaledVector(_,i),r.object.updateMatrixWorld(),P=!!i}else if(r.object.isOrthographicCamera){let e=new i.Pa4(w.x,w.y,0);e.unproject(r.object);let o=r.object.zoom;r.object.zoom=Math.max(r.minZoom,Math.min(r.maxZoom,r.object.zoom/f)),r.object.updateProjectionMatrix(),P=o!==r.object.zoom;let s=new i.Pa4(w.x,w.y,0);s.unproject(r.object),r.object.position.sub(s).add(e),r.object.updateMatrixWorld(),a=t.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),r.zoomToCursor=!1;null!==a&&(this.screenSpacePanning?r.target.set(0,0,-1).transformDirection(r.object.matrix).multiplyScalar(a).add(r.object.position):(n.origin.copy(r.object.position),n.direction.set(0,0,-1).transformDirection(r.object.matrix),Math.abs(r.object.up.dot(n.direction))<u?e.lookAt(r.target):(l.setFromNormalAndCoplanarPoint(r.object.up,r.target),n.intersectPlane(l,r.target))))}else if(r.object.isOrthographicCamera){let e=r.object.zoom;r.object.zoom=Math.max(r.minZoom,Math.min(r.maxZoom,r.object.zoom/f)),e!==r.object.zoom&&(r.object.updateProjectionMatrix(),P=!0)}return f=1,S=!1,!!(P||v.distanceToSquared(r.object.position)>d||8*(1-b.dot(r.object.quaternion))>d||T.distanceToSquared(r.target)>d)&&(r.dispatchEvent(a),v.copy(r.object.position),b.copy(r.object.quaternion),T.copy(r.target),!0)}}(),this.dispose=function(){r.domElement.removeEventListener("contextmenu",ea),r.domElement.removeEventListener("pointerdown",W),r.domElement.removeEventListener("pointercancel",$),r.domElement.removeEventListener("wheel",J),r.domElement.removeEventListener("pointermove",q),r.domElement.removeEventListener("pointerup",$),r.domElement.getRootNode().removeEventListener("keydown",ee,{capture:!0}),null!==r._domElementKeyEvents&&(r._domElementKeyEvents.removeEventListener("keydown",er),r._domElementKeyEvents=null)};let r=this,h={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},c=h.NONE,d=1e-6,m=new i.$V,p=new i.$V,f=1,g=new i.Pa4,v=new i.FM8,b=new i.FM8,T=new i.FM8,M=new i.FM8,x=new i.FM8,C=new i.FM8,E=new i.FM8,y=new i.FM8,P=new i.FM8,_=new i.Pa4,w=new i.FM8,S=!1,R=[],A={},N=!1;function O(e){return Math.pow(.95,r.zoomSpeed*Math.abs(.01*e))}function D(e){p.theta-=e}function L(e){p.phi-=e}let j=function(){let e=new i.Pa4;return function(t,r){e.setFromMatrixColumn(r,0),e.multiplyScalar(-t),g.add(e)}}(),F=function(){let e=new i.Pa4;return function(t,i){!0===r.screenSpacePanning?e.setFromMatrixColumn(i,1):(e.setFromMatrixColumn(i,0),e.crossVectors(r.object.up,e)),e.multiplyScalar(t),g.add(e)}}(),I=function(){let e=new i.Pa4;return function(t,i){let a=r.domElement;if(r.object.isPerspectiveCamera){let o=r.object.position;e.copy(o).sub(r.target);let s=e.length();j(2*t*(s*=Math.tan(r.object.fov/2*Math.PI/180))/a.clientHeight,r.object.matrix),F(2*i*s/a.clientHeight,r.object.matrix)}else r.object.isOrthographicCamera?(j(t*(r.object.right-r.object.left)/r.object.zoom/a.clientWidth,r.object.matrix),F(i*(r.object.top-r.object.bottom)/r.object.zoom/a.clientHeight,r.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),r.enablePan=!1)}}();function z(e){r.object.isPerspectiveCamera||r.object.isOrthographicCamera?f/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),r.enableZoom=!1)}function k(e){r.object.isPerspectiveCamera||r.object.isOrthographicCamera?f*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),r.enableZoom=!1)}function U(e,t){if(!r.zoomToCursor)return;S=!0;let i=r.domElement.getBoundingClientRect(),a=e-i.left,o=t-i.top,s=i.width,n=i.height;w.x=a/s*2-1,w.y=-(o/n*2)+1,_.set(w.x,w.y,1).unproject(r.object).sub(r.object.position).normalize()}function B(e){return Math.max(r.minDistance,Math.min(r.maxDistance,e))}function Y(e){v.set(e.clientX,e.clientY)}function H(e){M.set(e.clientX,e.clientY)}function K(e){if(1===R.length)v.set(e.pageX,e.pageY);else{let t=es(e),r=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);v.set(r,i)}}function Q(e){if(1===R.length)M.set(e.pageX,e.pageY);else{let t=es(e),r=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);M.set(r,i)}}function V(e){let t=es(e),r=e.pageX-t.x,i=e.pageY-t.y;E.set(0,Math.sqrt(r*r+i*i))}function G(e){if(1==R.length)b.set(e.pageX,e.pageY);else{let t=es(e),r=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);b.set(r,i)}T.subVectors(b,v).multiplyScalar(r.rotateSpeed);let t=r.domElement;D(2*Math.PI*T.x/t.clientHeight),L(2*Math.PI*T.y/t.clientHeight),v.copy(b)}function X(e){if(1===R.length)x.set(e.pageX,e.pageY);else{let t=es(e),r=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);x.set(r,i)}C.subVectors(x,M).multiplyScalar(r.panSpeed),I(C.x,C.y),M.copy(x)}function Z(e){let t=es(e),i=e.pageX-t.x,a=e.pageY-t.y;y.set(0,Math.sqrt(i*i+a*a)),P.set(0,Math.pow(y.y/E.y,r.zoomSpeed)),z(P.y),E.copy(y),U((e.pageX+t.x)*.5,(e.pageY+t.y)*.5)}function W(e){if(!1!==r.enabled)0===R.length&&(r.domElement.setPointerCapture(e.pointerId),r.domElement.addEventListener("pointermove",q),r.domElement.addEventListener("pointerup",$)),!function(e){for(let t=0;t<R.length;t++)if(R[t]==e.pointerId)return!0;return!1}(e)&&(R.push(e.pointerId),"touch"===e.pointerType?ei(e):function(e){let t;switch(e.button){case 0:t=r.mouseButtons.LEFT;break;case 1:t=r.mouseButtons.MIDDLE;break;case 2:t=r.mouseButtons.RIGHT;break;default:t=-1}switch(t){case i.RsA.DOLLY:if(!1===r.enableZoom)return;U(e.clientX,e.clientX),E.set(e.clientX,e.clientY),c=h.DOLLY;break;case i.RsA.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===r.enablePan)return;H(e),c=h.PAN}else{if(!1===r.enableRotate)return;Y(e),c=h.ROTATE}break;case i.RsA.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===r.enableRotate)return;Y(e),c=h.ROTATE}else{if(!1===r.enablePan)return;H(e),c=h.PAN}break;default:c=h.NONE}c!==h.NONE&&r.dispatchEvent(o)}(e))}function q(e){!1!==r.enabled&&("touch"===e.pointerType?function(e){switch(eo(e),c){case h.TOUCH_ROTATE:if(!1===r.enableRotate)return;G(e),r.update();break;case h.TOUCH_PAN:if(!1===r.enablePan)return;X(e),r.update();break;case h.TOUCH_DOLLY_PAN:if(!1===r.enableZoom&&!1===r.enablePan)return;r.enableZoom&&Z(e),r.enablePan&&X(e),r.update();break;case h.TOUCH_DOLLY_ROTATE:if(!1===r.enableZoom&&!1===r.enableRotate)return;r.enableZoom&&Z(e),r.enableRotate&&G(e),r.update();break;default:c=h.NONE}}(e):function(e){switch(c){case h.ROTATE:if(!1===r.enableRotate)return;!function(e){b.set(e.clientX,e.clientY),T.subVectors(b,v).multiplyScalar(r.rotateSpeed);let t=r.domElement;D(2*Math.PI*T.x/t.clientHeight),L(2*Math.PI*T.y/t.clientHeight),v.copy(b),r.update()}(e);break;case h.DOLLY:if(!1===r.enableZoom)return;y.set(e.clientX,e.clientY),P.subVectors(y,E),P.y>0?z(O(P.y)):P.y<0&&k(O(P.y)),E.copy(y),r.update();break;case h.PAN:if(!1===r.enablePan)return;x.set(e.clientX,e.clientY),C.subVectors(x,M).multiplyScalar(r.panSpeed),I(C.x,C.y),M.copy(x),r.update()}}(e))}function $(e){switch(function(e){delete A[e.pointerId];for(let t=0;t<R.length;t++)if(R[t]==e.pointerId){R.splice(t,1);return}}(e),R.length){case 0:r.domElement.releasePointerCapture(e.pointerId),r.domElement.removeEventListener("pointermove",q),r.domElement.removeEventListener("pointerup",$),r.dispatchEvent(s),c=h.NONE;break;case 1:let t=R[0],i=A[t];ei({pointerId:t,pageX:i.x,pageY:i.y})}}function J(e){if(!1!==r.enabled&&!1!==r.enableZoom&&c===h.NONE){var t;e.preventDefault(),r.dispatchEvent(o),U((t=function(e){let t=e.deltaMode,r={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:r.deltaY*=16;break;case 2:r.deltaY*=100}return e.ctrlKey&&!N&&(r.deltaY*=10),r}(e)).clientX,t.clientY),t.deltaY<0?k(O(t.deltaY)):t.deltaY>0&&z(O(t.deltaY)),r.update(),r.dispatchEvent(s)}}function ee(e){"Control"===e.key&&(N=!0,r.domElement.getRootNode().addEventListener("keyup",et,{passive:!0,capture:!0}))}function et(e){"Control"===e.key&&(N=!1,r.domElement.getRootNode().removeEventListener("keyup",et,{passive:!0,capture:!0}))}function er(e){!1!==r.enabled&&!1!==r.enablePan&&function(e){let t=!1;switch(e.code){case r.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?L(2*Math.PI*r.rotateSpeed/r.domElement.clientHeight):I(0,r.keyPanSpeed),t=!0;break;case r.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?L(-2*Math.PI*r.rotateSpeed/r.domElement.clientHeight):I(0,-r.keyPanSpeed),t=!0;break;case r.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?D(2*Math.PI*r.rotateSpeed/r.domElement.clientHeight):I(r.keyPanSpeed,0),t=!0;break;case r.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?D(-2*Math.PI*r.rotateSpeed/r.domElement.clientHeight):I(-r.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),r.update())}(e)}function ei(e){switch(eo(e),R.length){case 1:switch(r.touches.ONE){case i.QmN.ROTATE:if(!1===r.enableRotate)return;K(e),c=h.TOUCH_ROTATE;break;case i.QmN.PAN:if(!1===r.enablePan)return;Q(e),c=h.TOUCH_PAN;break;default:c=h.NONE}break;case 2:switch(r.touches.TWO){case i.QmN.DOLLY_PAN:if(!1===r.enableZoom&&!1===r.enablePan)return;r.enableZoom&&V(e),r.enablePan&&Q(e),c=h.TOUCH_DOLLY_PAN;break;case i.QmN.DOLLY_ROTATE:if(!1===r.enableZoom&&!1===r.enableRotate)return;r.enableZoom&&V(e),r.enableRotate&&K(e),c=h.TOUCH_DOLLY_ROTATE;break;default:c=h.NONE}break;default:c=h.NONE}c!==h.NONE&&r.dispatchEvent(o)}function ea(e){!1!==r.enabled&&e.preventDefault()}function eo(e){let t=A[e.pointerId];void 0===t&&(t=new i.FM8,A[e.pointerId]=t),t.set(e.pageX,e.pageY)}function es(e){return A[e.pointerId===R[0]?R[1]:R[0]]}r.domElement.addEventListener("contextmenu",ea),r.domElement.addEventListener("pointerdown",W),r.domElement.addEventListener("pointercancel",$),r.domElement.addEventListener("wheel",J,{passive:!1}),r.domElement.getRootNode().addEventListener("keydown",ee,{passive:!0,capture:!0}),this.update()}}},9262:function(e,t,r){r.d(t,{x:function(){return u}});var i=r(6376),a=r(1947),o=r(9333);class s extends o.w{constructor(e,t){super(),this.textureID=void 0!==t?t:"tDiffuse",e instanceof i.jyz?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=i.rDY.clone(e.uniforms),this.material=new i.jyz({name:void 0!==e.name?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new o.T(this.material)}render(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this.fsQuad.render(e)}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class n extends o.w{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,r){let i,a;let o=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0),this.inverse?(i=0,a=1):(i=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),s.buffers.stencil.setFunc(o.ALWAYS,i,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(o.EQUAL,1,4294967295),s.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),s.buffers.stencil.setLocked(!0)}}class l extends o.w{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class u{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),void 0===t){let r=e.getSize(new i.FM8);this._width=r.width,this._height=r.height,(t=new i.dd2(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:i.cLu})).texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new s(a.C),this.copyPass.material.blending=i.jFi,this.clock=new i.SUY}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);-1!==t&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){void 0===e&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),r=!1;for(let t=0,i=this.passes.length;t<i;t++){let i=this.passes[t];if(!1!==i.enabled){if(i.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),i.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),i.needsSwap){if(r){let t=this.renderer.getContext(),r=this.renderer.state.buffers.stencil;r.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),r.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}void 0!==n&&(i instanceof n?r=!0:i instanceof l&&(r=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(void 0===e){let t=this.renderer.getSize(new i.FM8);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,(e=this.renderTarget1.clone()).setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let r=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(r,i),this.renderTarget2.setSize(r,i);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(r,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}},3682:function(e,t,r){r.d(t,{v:function(){return s}});var i=r(6376),a=r(9333);let o={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class s extends a.w{constructor(){super(),this.uniforms=i.rDY.clone(o.uniforms),this.material=new i.FIo({name:o.name,uniforms:this.uniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.fsQuad=new a.T(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},i.epp.getTransfer(this._outputColorSpace)===i.j17&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===i.EoG?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===i.CdI?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===i.YGz?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===i.LY2?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===i.Bgp?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===i.ORg&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),!0===this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this.fsQuad.render(e)}dispose(){this.material.dispose(),this.fsQuad.dispose()}}},9333:function(e,t,r){r.d(t,{T:function(){return l},w:function(){return a}});var i=r(6376);class a{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}let o=new i.iKG(-1,1,1,-1,0,1);class s extends i.u9r{constructor(){super(),this.setAttribute("position",new i.a$l([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new i.a$l([0,2,0,0,2,0],2))}}let n=new s;class l{constructor(e){this._mesh=new i.Kj0(n,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,o)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}},4284:function(e,t,r){r.d(t,{C:function(){return o}});var i=r(6376),a=r(9333);class o extends a.w{constructor(e,t,r=null,a=null,o=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=r,this.clearColor=a,this.clearAlpha=o,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new i.Ilk}render(e,t,r){let i,a;let o=e.autoClear;e.autoClear=!1,null!==this.overrideMaterial&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),null!==this.clearColor&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),null!==this.clearAlpha&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),!0==this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),!0===this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),null!==this.clearColor&&e.setClearColor(this._oldClearColor),null!==this.clearAlpha&&e.setClearAlpha(i),null!==this.overrideMaterial&&(this.scene.overrideMaterial=a),e.autoClear=o}}},7556:function(e,t,r){r.d(t,{m:function(){return n}});var i=r(6376),a=r(9333),o=r(1947);let s={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new i.Ilk(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class n extends a.w{constructor(e,t,r,n){super(),this.strength=void 0!==t?t:1,this.radius=r,this.threshold=n,this.resolution=void 0!==e?new i.FM8(e.x,e.y):new i.FM8(256,256),this.clearColor=new i.Ilk(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);this.renderTargetBright=new i.dd2(l,u,{type:i.cLu}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new i.dd2(l,u,{type:i.cLu});t.texture.name="UnrealBloomPass.h"+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let r=new i.dd2(l,u,{type:i.cLu});r.texture.name="UnrealBloomPass.v"+e,r.texture.generateMipmaps=!1,this.renderTargetsVertical.push(r),l=Math.round(l/2),u=Math.round(u/2)}this.highPassUniforms=i.rDY.clone(s.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new i.jyz({uniforms:this.highPassUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.separableBlurMaterials=[];let h=[3,5,7,9,11];l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(h[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new i.FM8(1/l,1/u),l=Math.round(l/2),u=Math.round(u/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1,this.compositeMaterial.uniforms.bloomFactors.value=[1,.8,.6,.4,.2],this.bloomTintColors=[new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let c=o.C;this.copyUniforms=i.rDY.clone(c.uniforms),this.blendMaterial=new i.jyz({uniforms:this.copyUniforms,vertexShader:c.vertexShader,fragmentShader:c.fragmentShader,blending:i.WMw,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new i.Ilk,this.oldClearAlpha=1,this.basic=new i.vBJ,this.fsQuad=new a.T(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let r=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(r,a);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(r,a),this.renderTargetsVertical[e].setSize(r,a),this.separableBlurMaterials[e].uniforms.invSize.value=new i.FM8(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2)}render(e,t,r,i,a){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=r.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let s=this.renderTargetBright;for(let t=0;t<this.nMips;t++)this.fsQuad.material=this.separableBlurMaterials[t],this.separableBlurMaterials[t].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[t].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[t]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[t].uniforms.colorTexture.value=this.renderTargetsHorizontal[t].texture,this.separableBlurMaterials[t].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[t]),e.clear(),this.fsQuad.render(e),s=this.renderTargetsVertical[t];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?e.setRenderTarget(null):e.setRenderTarget(r),this.fsQuad.render(e),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){let t=[];for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(e*e))/e);return new i.jyz({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new i.FM8(.5,.5)},direction:{value:new i.FM8(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new i.jyz({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}n.BlurDirectionX=new i.FM8(1,0),n.BlurDirectionY=new i.FM8(0,1)},1947:function(e,t,r){r.d(t,{C:function(){return i}});let i={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}}}]);