const $=s=>document.querySelector(s),canvas=$('#canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const scenes=[['Reino','reino'],['Aldea de la Ma’at','aldea'],['Distrito Cardinal','distrito']];let current=0,elapsed=0,last=0,paused=false,ready=false,duration=4200,source,sketch,paper,run=0;const W=1920,H=1080;
const buffer=()=>{let c=document.createElement('canvas');c.width=W;c.height=H;return c};let mask=buffer(),mc=mask.getContext('2d'),layer=buffer(),lc=layer.getContext('2d');
const concepts=[{"tag": "Una Aldea que creció hasta consolidarse como Reino.", "text": "Quienes lo habitan le dan raíces; quienes llegan de visita alimentan su vida."}, {"tag": "Una comunidad que echa raíces y abre caminos.", "text": "Puede florecer como Reino o seguir escribiendo su historia como Aldea."}, {"tag": "Un rincón con alma propia.", "text": "Entre casas, comercios y encuentros, la comunidad florece dentro de su propio contorno."}];async function load(i){const ticket=++run;ready=false;current=(i+3)%3;const c=concepts[current];$("#tagline").textContent=c.tag;$("#description").textContent=c.text;elapsed=0;paused=false;$('#pause').textContent='Ⅱ';$('#loading').style.display='grid';$('#title').textContent=scenes[current][0];$('#number').textContent=String(current+1).padStart(2,'0');canvas.setAttribute('aria-label','Ilustración animada: '+scenes[current][0]);document.querySelectorAll('.tab').forEach((t,j)=>{t.classList.toggle('active',j===current);t.setAttribute('aria-current',j===current?'step':'false')});try{const img=new Image();img.src='assets/'+scenes[current][1]+'.png';await img.decode();if(ticket!==run)return;source=buffer();const sc=source.getContext('2d');sc.drawImage(img,0,0,W,H);const pixels=sc.getImageData(0,0,W,H);sketch=buffer();let data=sketch.getContext('2d').createImageData(W,H),p=pixels.data,d=data.data;
// Edge-derived graphite layer: retain the actual geometry of the supplied illustration.
for(let y=0;y<H;y++)for(let x=0;x<W;x++){let k=(y*W+x)*4;let gray=.3*p[k]+.59*p[k+1]+.11*p[k+2],k2=(y*W+Math.min(W-1,x+1))*4,k3=(Math.min(H-1,y+1)*W+x)*4;let edge=Math.abs(gray-(.3*p[k2]+.59*p[k2+1]+.11*p[k2+2]))+Math.abs(gray-(.3*p[k3]+.59*p[k3+1]+.11*p[k3+2]));d[k]=62;d[k+1]=48;d[k+2]=29;d[k+3]=Math.min(200,edge*3.8)}sketch.getContext('2d').putImageData(data,0,0);paper=buffer();const pc=paper.getContext('2d');pc.drawImage(img,0,0,150,1080,0,0,W,H);pc.fillStyle='#f8e5ba55';pc.fillRect(0,0,W,H);ready=true;last=performance.now();$('#loading').style.display='none';if(matchMedia('(prefers-reduced-motion: reduce)').matches)elapsed=duration;render();}catch(e){$('#loading').textContent='No se pudo cargar la imagen. Pulsa Volver a dibujar para reintentar.'}}
// Staggered diagonal pen strokes grow from the center toward the margins.
// A second, broader pass brings the watercolor in just behind the ink.
function reveal(image,t,width){
 if(t<=0)return;
 if(t>=1){ctx.drawImage(image,0,0);return;}
 mc.clearRect(0,0,W,H);mc.strokeStyle='white';mc.lineCap='round';mc.lineJoin='round';
 const count=42,spacing=78,tilt=current===1?-.58:.58;
 const order=Array.from({length:count},(_,i)=>i).sort((a,b)=>Math.abs(a-(count-1)/2)-Math.abs(b-(count-1)/2));
 for(let rank=0;rank<count;rank++){
  const index=order[rank],delay=(rank/(count-1))*.68;
  const phase=Math.max(0,Math.min(1,(t-delay)/.32));
  if(!phase)continue;
  const reach=1-Math.pow(1-phase,1.55);
  const base=-650+index*spacing,reverse=index%2===0;
  // Fine offset strands leave a dry-brush edge, followed by a solid ink core.
  for(let strand=0;strand<3;strand++){
   mc.globalAlpha=strand===0?1:.32;mc.lineWidth=strand===0?width:width*.2;
   const offset=strand===0?0:(strand===1?-1:1)*width*.48;
   mc.beginPath();
   const steps=Math.max(1,Math.ceil(reach*55));
   for(let step=0;step<=steps;step++){
    const f=reach*step/steps;
    const y=reverse?H+100-f*(H+200):-100+f*(H+200);
    const x=base+tilt*(y-H/2)+offset+Math.sin(y*.021+index*1.7)*7+Math.sin(y*.053+index)*2;
    if(step===0)mc.moveTo(x,y);else mc.lineTo(x,y);
   }
   mc.stroke();
  }
 }
 mc.globalAlpha=1;
 lc.clearRect(0,0,W,H);lc.globalCompositeOperation='source-over';lc.drawImage(image,0,0);
 lc.globalCompositeOperation='destination-in';lc.drawImage(mask,0,0);ctx.drawImage(layer,0,0);
}
function render(){let p=Math.min(1,elapsed/duration);ctx.clearRect(0,0,W,H);ctx.drawImage(paper,0,0);reveal(sketch,Math.min(1,p/.72),105);reveal(source,Math.min(1,Math.max(0,(p-.14)/.86)),118);if(p===1)ctx.drawImage(source,0,0);$('#progress').style.width=p*100+'%';$('#pause').textContent=p===1?'↻':paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',p===1?'Repetir animación':paused?'Reanudar animación':'Pausar animación')}
function frame(now){if(ready&&!paused&&elapsed<duration){elapsed=Math.min(duration,elapsed+Math.min(80,now-last));render()}last=now;requestAnimationFrame(frame)}
$('#replay').onclick=()=>{if(!ready){load(current);return}elapsed=0;paused=false;render()};$('#pause').onclick=()=>{if(elapsed>=duration){elapsed=0;paused=false;}else paused=!paused;if(ready)render()};$('#speed').onchange=e=>{let p=elapsed/duration;duration=Number(e.target.value)*1000;elapsed=p*duration};$('#next').onclick=()=>load(current+1);$('#prev').onclick=()=>load(current-1);document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>load(Number(t.dataset.i)));$('.brand').onclick=e=>{e.preventDefault();load(0)};$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{ $('#fullscreen').title='Usa F11 para ampliar la presentación'}};document.addEventListener('keydown',e=>{if(e.target.matches('select,button,a,input,textarea'))return;if(e.key==='ArrowRight')load(current+1);if(e.key==='ArrowLeft')load(current-1);if(e.code==='Space'){e.preventDefault();$('#pause').click()}});load(0);requestAnimationFrame(frame);


// The offline edition carries the identical PowerPoint payload inside the HTML.
document.querySelector('#export-pptx').addEventListener('click',function(event){
 const embedded=document.querySelector('#pptx-data');
 if(!embedded)return;
 event.preventDefault();
 const binary=atob(embedded.textContent.trim());
 const data=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
 const blob=new Blob([data],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='Universo-aBanza.pptx';document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
});
