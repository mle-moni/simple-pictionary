/*
The MIT License (MIT)

Copyright (c) 2015 Max Irwin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var floodfill=(function(){function f(p,v,u,l,t,g,B){var k=p.length;var q=[];var o=(v+u*g)*4;var r=o,z=o,s,A,n=g*4;var h=[p[o],p[o+1],p[o+2],p[o+3]];if(!a(o,h,l,p,k,t)){return false}q.push(o);while(q.length){o=q.pop();if(e(o,h,l,p,k,t)){r=o;z=o;A=parseInt(o/n)*n;s=A+n;while(A<z&&A<(z-=4)&&e(z,h,l,p,k,t)){}while(s>r&&s>(r+=4)&&e(r,h,l,p,k,t)){}for(var m=z+4;m<r;m+=4){if(m-n>=0&&a(m-n,h,l,p,k,t)){q.push(m-n)}if(m+n<k&&a(m+n,h,l,p,k,t)){q.push(m+n)}}}}return p}function a(j,l,h,m,k,g){if(j<0||j>=k){return false}if(m[j+3]===0&&h.a>0){return true}if(Math.abs(l[3]-h.a)<=g&&Math.abs(l[0]-h.r)<=g&&Math.abs(l[1]-h.g)<=g&&Math.abs(l[2]-h.b)<=g){return false}if((l[3]===m[j+3])&&(l[0]===m[j])&&(l[1]===m[j+1])&&(l[2]===m[j+2])){return true}if(Math.abs(l[3]-m[j+3])<=(255-g)&&Math.abs(l[0]-m[j])<=g&&Math.abs(l[1]-m[j+1])<=g&&Math.abs(l[2]-m[j+2])<=g){return true}return false}function e(j,l,h,m,k,g){if(a(j,l,h,m,k,g)){m[j]=h.r;m[j+1]=h.g;m[j+2]=h.b;m[j+3]=h.a;return true}return false}function b(j,n,m,i,k,g,o){if(!j instanceof Uint8ClampedArray){throw new Error("data must be an instance of Uint8ClampedArray")}if(isNaN(g)||g<1){throw new Error("argument 'width' must be a positive integer")}if(isNaN(o)||o<1){throw new Error("argument 'height' must be a positive integer")}if(isNaN(n)||n<0){throw new Error("argument 'x' must be a positive integer")}if(isNaN(m)||m<0){throw new Error("argument 'y' must be a positive integer")}if(g*o*4!==j.length){throw new Error("width and height do not fit Uint8ClampedArray dimensions")}var l=Math.floor(n);var h=Math.floor(m);if(l!==n){console.warn("x truncated from",n,"to",l)}if(h!==m){console.warn("y truncated from",m,"to",h)}k=(!isNaN(k))?Math.min(Math.abs(Math.round(k)),254):0;return f(j,l,h,i,k,g,o)}var d=function(l){var h=document.createElement("div");var g={r:0,g:0,b:0,a:0};h.style.color=l;h.style.display="none";document.body.appendChild(h);var i=window.getComputedStyle(h,null).color;document.body.removeChild(h);var k=/([\.\d]+)/g;var j=i.match(k);if(j&&j.length>2){g.r=parseInt(j[0])||0;g.g=parseInt(j[1])||0;g.b=parseInt(j[2])||0;g.a=Math.round((parseFloat(j[3])||1)*255)}return g};function c(p,n,m,i,o,q,g){var s=this;var k=d(this.fillStyle);i=(isNaN(i))?0:i;o=(isNaN(o))?0:o;q=(!isNaN(q)&&q)?Math.min(Math.abs(q),s.canvas.width):s.canvas.width;g=(!isNaN(g)&&g)?Math.min(Math.abs(g),s.canvas.height):s.canvas.height;var j=s.getImageData(i,o,q,g);var l=j.data;var h=j.width;var r=j.height;if(h>0&&r>0){b(l,p,n,k,m,h,r);s.putImageData(j,i,o)}}if(typeof CanvasRenderingContext2D!="undefined"){CanvasRenderingContext2D.prototype.fillFlood=c}return b})();