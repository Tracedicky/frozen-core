(()=>{
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives'),comboEl=document.getElementById('combo'),punEl=document.getElementById('pun'),fillEl=document.getElementById('modeFill');
const start=document.getElementById('start'),over=document.getElementById('over'),soundBtn=document.getElementById('sound');
const W=1080,H=680,TAU=Math.PI*2;
const face=new Image();face.src=window.MARCO_FACE;;
const goodWords=['PROMPT','STYLE','LIGHT','DETAIL','VIBES','UPSCALE','VISION'];
const badWords=['MID','BAD HANDS','WATERMARK','GENERIC','COPY/PASTE','NO SOUL','7 FINGERS'];
const puns=[
 'Prompt and circumstance!','That idea just got upscaled!','Marco has entered his latent space.','Fine-tuned and completely unhinged.','No brushes. No boundaries. No problem.','The critics have been negatively prompted.','This is absolutely model behaviour.','Ten times the pixels. Ten times the confidence.','A stunning diffusion of responsibility.','Ctrl+C? More like Ctrl+CREATIVE.','He came. He saw. He generated variations.','Art history is buffering.','The canvas has accepted the terms of service.','One small prompt for man, one giant render for Marco.','Hands are temporary. Style is forever.','The composition is suffering from success.'];
const bossPuns=['THE AI EGO HAS ENTERED THE CHAT!','NEGATIVE PROMPT: HUMILITY','DELETE THE EGO BEFORE IT UPSCALES ITSELF!'];
let keys={},items=[],shots=[],particles=[],stars=[],boss=null,running=false,last=0,spawnTimer=0,bossTimer=22,score=0,lives=3,combo=0,meter=0,tenX=0,shake=0,punTimer=0,sound=true,audio=null;
let player={x:W/2,y:H-112,w:112,h:116,speed:570,fireCd:0,hitCd:0};
for(let i=0;i<120;i++) stars.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*2+.4});
function sfx(type){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();let o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.connect(g);g.connect(audio.destination);o.type=type==='bad'?'sawtooth':type==='blast'?'square':'sine';o.frequency.setValueAtTime(type==='good'?520:type==='bad'?120:type==='boss'?80:260,t);o.frequency.exponentialRampToValueAtTime(type==='good'?840:type==='bad'?55:type==='boss'?45:520,t+.12);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.start(t);o.stop(t+.16)}catch(e){}}
function reset(){items=[];shots=[];particles=[];boss=null;score=0;lives=3;combo=0;meter=0;tenX=0;bossTimer=22;spawnTimer=0;shake=0;player.x=W/2;player.hitCd=0;updateHud();}
function begin(){reset();start.classList.add('hidden');over.classList.add('hidden');running=true;last=performance.now();showPun('MARCO HAS ENTERED THE LATENT SPACE');requestAnimationFrame(loop);}
function end(){running=false;let hi=Math.max(score,+localStorage.marco10xHigh||0);localStorage.marco10xHigh=hi;document.getElementById('finalTitle').textContent=score>=1000?'STILL 10X, OBVIOUSLY':'THE MID FOUGHT BACK';document.getElementById('finalText').innerHTML=`Marco generated <b>${score.toLocaleString()}</b> artistic units.<br>Highest suspiciously creative output: <b>${hi.toLocaleString()}</b>.`;over.classList.remove('hidden');}
function updateHud(){scoreEl.textContent=String(score).padStart(6,'0');livesEl.textContent='♥'.repeat(Math.max(0,lives));comboEl.textContent=(tenX>0?'10X':combo+'X');comboEl.className=tenX>0?'x10':'';fillEl.style.width=(tenX>0?Math.min(100,tenX/7*100):meter*10)+'%';}
function showPun(text){punEl.textContent=text||puns[(Math.random()*puns.length)|0];punEl.classList.add('show');punTimer=2.1;}
function spawn(){let good=Math.random()>.34;items.push({x:55+Math.random()*(W-110),y:-40,r:good?24:28,vy:120+Math.random()*100+score/40,rot:Math.random()*TAU,vr:(Math.random()-.5)*3,good,word:(good?goodWords:badWords)[(Math.random()*(good?goodWords.length:badWords.length))|0],pulse:Math.random()*TAU});}
function spawnBoss(){boss={x:W/2,y:-100,r:72,hp:10,max:10,vx:125,phase:0};showPun(bossPuns[(Math.random()*bossPuns.length)|0]);sfx('boss');}
function blast(){if(!running||player.fireCd>0)return;player.fireCd=tenX>0?.11:.28;shots.push({x:player.x,y:player.y-55,vy:-780,w:tenX>0?18:9,life:1});sfx('blast');}
function burst(x,y,c,n=12){for(let i=0;i<n;i++){let a=Math.random()*TAU,sp=60+Math.random()*260;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.4+Math.random()*.55,max:1,c,size:2+Math.random()*6});}}
function hitBad(){if(player.hitCd>0)return;player.hitCd=1.15;lives--;combo=0;meter=Math.max(0,meter-3);shake=17;sfx('bad');showPun('OUCH. THAT TAKE WAS MID-JOURNEY.');updateHud();if(lives<=0)setTimeout(end,250);}
function collect(it){score+=tenX>0?100:10;combo++;meter=Math.min(10,meter+1);burst(it.x,it.y,'#3ff5ff',15);sfx('good');if(combo%4===0)showPun();if(meter>=10&&tenX<=0){tenX=7;meter=0;showPun('10X MODE: MAXIMUM PROMPTITUDE!');burst(player.x,player.y,'#ffe46b',45)}updateHud();}
function rectCircle(px,py,pw,ph,cx,cy,cr){let nx=Math.max(px-pw/2,Math.min(cx,px+pw/2)),ny=Math.max(py-ph/2,Math.min(cy,py+ph/2));return (cx-nx)**2+(cy-ny)**2<cr**2}
function update(dt){
 let dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);player.x=Math.max(62,Math.min(W-62,player.x+dir*player.speed*dt));player.fireCd=Math.max(0,player.fireCd-dt);player.hitCd=Math.max(0,player.hitCd-dt);if(keys.Space)blast();
 if(punTimer>0&&(punTimer-=dt)<=0)punEl.classList.remove('show');if(tenX>0){tenX-=dt;if(tenX<=0){tenX=0;showPun('10X MODE EXPIRED. MARCO REMAINS AT LEAST 9.8X.')}updateHud()}
 spawnTimer-=dt;if(spawnTimer<=0){spawn();spawnTimer=Math.max(.26,.72-score/7000)}
 bossTimer-=dt;if(bossTimer<=0&&!boss){spawnBoss();bossTimer=28}
 for(const s of shots){s.y+=s.vy*dt;s.life-=dt}
 for(const it of items){it.y+=it.vy*dt;it.rot+=it.vr*dt;it.pulse+=dt*5;if(rectCircle(player.x,player.y,player.w*.72,player.h*.72,it.x,it.y,it.r)){it.dead=true;if(it.good)collect(it);else hitBad()}else if(it.y>H+60){it.dead=true;if(it.good){combo=0;meter=Math.max(0,meter-1);updateHud()}}}
 for(const s of shots)for(const it of items)if(!it.good&&!it.dead&&Math.hypot(s.x-it.x,s.y-it.y)<it.r+s.w){s.life=0;it.dead=true;score+=tenX>0?50:5;burst(it.x,it.y,'#ff4fd8',12);if(Math.random()<.25)showPun('BAD TAKE: NEGATIVELY PROMPTED.');updateHud()}
 if(boss){boss.phase+=dt;boss.y=Math.min(125,boss.y+120*dt);boss.x+=boss.vx*dt;if(boss.x<100||boss.x>W-100)boss.vx*=-1;for(const s of shots)if(s.life>0&&Math.hypot(s.x-boss.x,s.y-boss.y)<boss.r+s.w){s.life=0;boss.hp-=tenX>0?2:1;burst(s.x,s.y,'#ffe46b',8);shake=7;if(boss.hp<=0){score+=tenX>0?1000:250;showPun('EGO DELETED. HUMILITY UPSCALED.');burst(boss.x,boss.y,'#ffe46b',75);boss=null;updateHud()}}}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;p.life-=dt}
 items=items.filter(x=>!x.dead);shots=shots.filter(x=>x.life>0&&x.y>-40);particles=particles.filter(x=>x.life>0);shake*=.86;
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawBg(t){
 let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b2847');g.addColorStop(.55,'#071629');g.addColorStop(1,'#02050c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalAlpha=.7;for(const st of stars){st.y+=st.z*.15;if(st.y>H)st.y=0;ctx.fillStyle=st.z>1.5?'#ff4fd8':'#3ff5ff';ctx.fillRect(st.x,st.y,st.z,st.z)}ctx.restore();
 ctx.save();ctx.strokeStyle='rgba(63,245,255,.11)';ctx.lineWidth=1;let horizon=410;for(let y=horizon;y<H;y+=38){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=-W;x<W*2;x+=65){ctx.beginPath();ctx.moveTo(W/2+(x-W/2)*.18,horizon);ctx.lineTo(x,H);ctx.stroke()}ctx.restore();
 ctx.font='900 118px Impact';ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.025)';ctx.fillText('GENERATE',W/2,360);
}
function drawPlayer(t){
 const x=player.x,y=player.y,flash=player.hitCd>0&&Math.floor(player.hitCd*12)%2===0;if(flash)ctx.globalAlpha=.25;
 ctx.save();ctx.translate(x,y);if(tenX>0){ctx.shadowBlur=35;ctx.shadowColor=`hsl(${t*.12%360} 100% 60%)`;ctx.strokeStyle=`hsl(${t*.12%360} 100% 65%)`;ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,-3,67+Math.sin(t*.012)*4,0,TAU);ctx.stroke()}
 // ridiculous futuristic artist suit
 ctx.fillStyle='#eaf8ff';ctx.strokeStyle='#3ff5ff';ctx.lineWidth=5;roundRect(-46,28,92,70,24);ctx.fill();ctx.stroke();ctx.fillStyle='#0a9eb7';ctx.fillRect(-44,53,88,12);ctx.fillStyle='#ff4fd8';ctx.font='900 24px Impact';ctx.textAlign='center';ctx.fillText('10X',0,85);
 // Photo head
 ctx.save();ctx.beginPath();ctx.ellipse(0,-24,52,59,0,0,TAU);ctx.clip();ctx.drawImage(face,-62,-90,124,145);ctx.restore();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,-24,52,59,0,0,TAU);ctx.stroke();
 ctx.restore();ctx.globalAlpha=1;
}
function drawItem(it){ctx.save();ctx.translate(it.x,it.y);ctx.rotate(it.rot);let glow=8+Math.sin(it.pulse)*4;ctx.shadowBlur=glow;ctx.shadowColor=it.good?'#3ff5ff':'#ff315d';ctx.fillStyle=it.good?'rgba(20,220,235,.22)':'rgba(255,35,75,.22)';ctx.strokeStyle=it.good?'#69fbff':'#ff5278';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,it.r,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(-it.rot);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.font=`900 ${it.word.length>7?10:13}px system-ui`;ctx.fillText(it.good?'✦ '+it.word:it.word,0,1);ctx.restore()}
function drawBoss(t){if(!boss)return;ctx.save();ctx.translate(boss.x,boss.y);ctx.rotate(Math.sin(boss.phase)*.08);ctx.shadowBlur=28;ctx.shadowColor='#ff4fd8';let grd=ctx.createRadialGradient(-18,-20,5,0,0,boss.r);grd.addColorStop(0,'#ff90eb');grd.addColorStop(.48,'#7b167e');grd.addColorStop(1,'#170829');ctx.fillStyle=grd;ctx.strokeStyle='#ff82e6';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,boss.r,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 23px Impact';ctx.fillText('AI EGO',0,-4);ctx.font='800 11px system-ui';ctx.fillText('SELF-IMPORTANT MODEL',0,17);ctx.restore();ctx.fillStyle='rgba(0,0,0,.65)';roundRect(boss.x-70,boss.y+82,140,11,9);ctx.fill();ctx.fillStyle='#ffe46b';roundRect(boss.x-68,boss.y+84,136*(boss.hp/boss.max),7,8);ctx.fill()}
function draw(t){ctx.save();if(shake)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawBg(t);for(const it of items)drawItem(it);for(const s of shots){ctx.shadowBlur=18;ctx.shadowColor=tenX>0?'#ffe46b':'#3ff5ff';ctx.fillStyle=tenX>0?'#fff2a6':'#a9ffff';roundRect(s.x-s.w/2,s.y-15,s.w,31,8);ctx.fill()}drawBoss(t);for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.9);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.size,p.size)}ctx.globalAlpha=1;drawPlayer(t);ctx.restore();}
function loop(t){if(!running)return;let dt=Math.min(.034,(t-last)/1000||0);last=t;update(dt);draw(t);requestAnimationFrame(loop)}
addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Enter'&&!running)begin()},{passive:false});addEventListener('keyup',e=>keys[e.code]=false);
canvas.addEventListener('pointerdown',e=>{if(running)blast()});
function hold(id,code){let el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[code]=true;if(code==='Space')blast()});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,()=>keys[code]=false))}
hold('left','ArrowLeft');hold('right','ArrowRight');hold('fire','Space');
document.getElementById('startBtn').onclick=begin;document.getElementById('againBtn').onclick=begin;soundBtn.onclick=()=>{sound=!sound;soundBtn.textContent=sound?'♪':'×'};
face.onload=()=>draw(0);draw(0);
})();
