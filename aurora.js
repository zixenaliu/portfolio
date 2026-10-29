/*
 * Hover Chroma Backgrounds / Liquid, by Framer University.
 * Matching published scene, SDK version, scale, DPI, FPS, and opacity.
 * https://framer.university/resources/hover-chroma-backgrounds-in-framer
 */
(() => {
  'use strict';
  const hero=document.querySelector('.hero');
  const gradient=document.getElementById('hero-gradient');
  const host=document.getElementById('chroma-scene');
  if(!hero||!gradient||!host)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCENE_ID='lHlDvoJDIXCxxXVqTNOC';
  const SDK_URL='assets/unicornStudio.umd.js';
  host.dataset.effect='liquid';host.dataset.scene=SCENE_ID;host.dataset.state=reduced?'reduced-motion':'loading';
  let scene=null,frame=0,visible=true,last=0;
  let x=.5,y=.5,targetX=.5,targetY=.5;
  function updateGradient(now){
    frame=0;if(!visible||document.hidden||reduced)return;
    if(now-last<32){frame=requestAnimationFrame(updateGradient);return;}last=now;
    x+=(targetX-x)*.018;y+=(targetY-y)*.018;
    const x2=57+(x-.5)*13,y2=64+(y-.5)*13,x3=35-(x-.5)*10,y3=49-(y-.5)*10;
    gradient.style.background=`radial-gradient(circle at 50% 50%,rgb(27,77,128) 0%,rgb(27,77,128) 22%,transparent 60%),radial-gradient(circle at ${x2.toFixed(2)}% ${y2.toFixed(2)}%,rgb(6,17,38) 0%,rgb(6,17,38) 22%,transparent 60%),radial-gradient(circle at ${x3.toFixed(2)}% ${y3.toFixed(2)}%,rgb(48,139,191) 0%,rgb(48,139,191) 22%,transparent 60%)`;
    if(Math.abs(x-targetX)+Math.abs(y-targetY)>.0005)frame=requestAnimationFrame(updateGradient);
  }
  function resumeGradient(){if(!frame&&!reduced&&visible&&!document.hidden)frame=requestAnimationFrame(updateGradient);}
  hero.addEventListener('pointermove',event=>{
    const r=hero.getBoundingClientRect();
    targetX=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));
    targetY=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));resumeGradient();
  },{passive:true});
  function loadSDK(){
    if(window.UnicornStudio)return Promise.resolve(window.UnicornStudio);
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=SDK_URL;script.async=true;
      script.onload=()=>window.UnicornStudio?resolve(window.UnicornStudio):reject(new Error('Liquid runtime unavailable'));
      script.onerror=()=>reject(new Error('Liquid runtime could not load'));document.head.appendChild(script);
    });
  }
  async function start(){
    if(reduced)return;
    const probe=document.createElement('canvas');let gl=null;
    try{gl=probe.getContext('webgl2')||probe.getContext('webgl');}catch(_){}
    if(!gl){host.dataset.state='webgl-unavailable';return;}
    const lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();
    try{
      const sdk=await loadSDK();
      scene=await sdk.addScene({elementId:'chroma-scene',filePath:'assets/liquid-scene.json',fps:60,scale:1,dpi:1,lazyLoad:false,interactivity:{mouse:{disableMobile:false,disabled:false}}});
      host.dataset.state='ready';if(!visible||document.hidden)scene.paused=true;
    }catch(error){host.dataset.state='load-error';console.warn('Liquid scene:',error.message);}
  }
  new ResizeObserver(()=>{if(scene)scene.resize();}).observe(hero);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;if(scene)scene.paused=!visible||document.hidden;
    if(visible)resumeGradient();else{cancelAnimationFrame(frame);frame=0;}
  },{threshold:0}).observe(hero);
  document.addEventListener('visibilitychange',()=>{
    if(scene)scene.paused=document.hidden||!visible;
    if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resumeGradient();
  });
  start();
})();
