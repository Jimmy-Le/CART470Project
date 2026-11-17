async function startCredits() {
const data = await Credits.load(new URLSearchParams(location.search).has('preview'));
const creditGroups = data.sections;
const fields = {
  skip: '.skip', eyebrow: '.hero .eyebrow', title: '.hero h1', intro: '.intro',
  follow: '.follow-text', endingLabel: '.ending .eyebrow', endingTitle: '.ending h2 span',
  endingEm: '.ending em', thanks: '.ending > p:not(.eyebrow)', back: '#return-link',
  footerLeft: 'footer span:first-child', footerRight: 'footer span:last-child'
};
document.title = data.page.pageTitle.text;
for (const [key, selector] of Object.entries(fields)) {
  Credits.paint(document.querySelector(selector), data.page[key]);
}
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
root.classList.add('js');
root.classList.toggle('reduced', reduce.matches);
const container = document.querySelector('#credits');
creditGroups.forEach((group,index) => {
  const section = document.createElement('section');
  section.className = `credit-section ${index % 2 === 0 ? 'right' : 'left'}`;
  const content = document.createElement('div');
  content.className='credit-content reveal';
  const label=document.createElement('span'); label.className='section-index'; Credits.paint(label,group.label);
  const title=document.createElement('h2'); Credits.paint(title,group.title);
  content.append(label,title);
  group.people.forEach(person=>{
    const entry=document.createElement('p'); entry.className='person';
    const role=document.createElement('span'); role.className='role'; Credits.paint(role,person.role);
    const name=document.createElement('span'); name.className='name'; Credits.paint(name,person.name);
    entry.append(role,name); content.append(entry);
  });
  if(group.note.text){const note=document.createElement('p');note.className='caption';Credits.paint(note,group.note);content.append(note);}
  if(index === creditGroups.length - 1){
    const gull=document.createElement('button');gull.className='gull';gull.setAttribute('aria-label','Say hello to Steven Gull');
    gull.innerHTML='<svg viewBox="0 0 100 70" aria-hidden="true"><path d="m38 49-2 15m13-15 1 14" stroke="#ae744b" stroke-width="2"/><path d="M15 30Q40 53 63 34Q57 13 72 15Q89 14 82 30Q86 48 62 52Q33 60 15 30Z" fill="#fcfbf3" stroke="#697771" stroke-width="1.5"/><path d="M28 38Q40 40 60 36Q52 54 28 38Z" fill="#bcc7c0"/><path d="m82 23 14 5-14 3" fill="#bd894d"/><circle cx="76" cy="22" r="1.8" fill="#293e3c"/></svg>';
    const scene=document.createElement('div');scene.className='gull-scene';
    const bubble=document.createElement('div');bubble.id='gull-note';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
    gull.setAttribute('aria-controls','gull-note');gull.setAttribute('aria-expanded','false');
    const gullLines=data.gullLines;
    let lineIndex=0;
    let timer;
    const closeBubble=()=>{bubble.classList.remove('show');bubble.textContent='';gull.setAttribute('aria-expanded','false');};
    gull.addEventListener('click',()=>{
      clearTimeout(timer);
      gull.classList.remove('flying');void gull.offsetWidth;gull.classList.add('flying');
      Credits.paint(bubble,gullLines[lineIndex++ % gullLines.length]);
      bubble.classList.add('show');gull.setAttribute('aria-expanded','true');
      timer=setTimeout(closeBubble,7000);
    });
    scene.addEventListener('keydown',event=>{if(event.key==='Escape'){clearTimeout(timer);closeBubble();}});
    scene.append(gull,bubble);content.append(scene);
  }
  section.append(content);container.append(section);
});
// Names reveal once. They stay readable when scrolling back up.
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:0});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
const route=document.querySelector('#route');
const river=document.querySelector('#river');
const boat=document.querySelector('#boat');
let length=0, riverHeight=0;
let scheduled=false;
const world=document.querySelector('.river-world');
const dock=document.createElement('div');dock.className='dock';
dock.innerHTML="<svg viewBox=\"0 0 170 110\" style=\"overflow:visible\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><defs><pattern id=\"dock-hatch\" width=\"5\" height=\"5\" patternUnits=\"userSpaceOnUse\"><path d=\"M0 5 5 0\" stroke=\"#6e7662\" stroke-width=\".5\" opacity=\".25\"/></pattern></defs><path d=\"M132 21Q167 13 169 43L168 98Q140 101 126 79Z\" fill=\"#a9b59b\" opacity=\".22\"/><g stroke=\"#697665\" stroke-width=\"1.15\" stroke-linejoin=\"round\"><polygon points=\"22.00,32.86 153.00,32.86 153.00,84.87 22.00,84.87\" fill=\"#6c8d7a26\"/><path d=\"M18.5 20.28v15.39q3.5 3 7 0V20.28\" fill=\"#adac87\"/><ellipse cx=\"22.0\" cy=\"20.28\" rx=\"3.5\" ry=\"2.6\" fill=\"#e5dec2\"/><ellipse cx=\"22.0\" cy=\"38.67\" rx=\"8\" ry=\"2.5\" fill=\"none\" stroke=\"#8aab97\" stroke-width=\".8\"/><path d=\"M128.5 20.28v15.39q3.5 3 7 0V20.28\" fill=\"#adac87\"/><ellipse cx=\"132.0\" cy=\"20.28\" rx=\"3.5\" ry=\"2.6\" fill=\"#e5dec2\"/><ellipse cx=\"132.0\" cy=\"38.67\" rx=\"8\" ry=\"2.5\" fill=\"none\" stroke=\"#8aab97\" stroke-width=\".8\"/><polygon points=\"20.00,72.93 148.00,72.93 148.00,77.24 20.00,77.24\" fill=\"#a7a58a\"/><polygon points=\"20.00,27.22 20.00,72.93 20.00,77.24 20.00,31.53\" fill=\"#b5b093\"/><polygon points=\"20.00,27.22 33.50,27.22 33.50,72.93 20.00,72.93\" fill=\"#e5dec4\"/><path d=\"M24.00,36.68 Q27.00,47.71 25.00,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"27.00\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"27.00\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"34.20,27.22 47.70,27.22 47.70,72.93 34.20,72.93\" fill=\"#d8d3b8\"/><path d=\"M38.20,36.68 Q41.20,47.71 39.20,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"41.20\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"41.20\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"48.40,27.22 61.90,27.22 61.90,72.93 48.40,72.93\" fill=\"#eae3cd\"/><path d=\"M52.40,36.68 Q55.40,47.71 53.40,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"55.40\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"55.40\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"62.60,27.22 76.10,27.22 76.10,72.93 62.60,72.93\" fill=\"#e5dec4\"/><path d=\"M66.60,36.68 Q69.60,47.71 67.60,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"69.60\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"69.60\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"76.80,27.22 90.30,27.22 90.30,72.93 76.80,72.93\" fill=\"#d8d3b8\"/><path d=\"M80.80,36.68 Q83.80,47.71 81.80,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"83.80\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"83.80\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"91.00,27.22 104.50,27.22 104.50,72.93 91.00,72.93\" fill=\"#eae3cd\"/><path d=\"M95.00,36.68 Q98.00,47.71 96.00,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"98.00\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"98.00\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"105.20,27.22 118.70,27.22 118.70,72.93 105.20,72.93\" fill=\"#e5dec4\"/><path d=\"M109.20,36.68 Q112.20,47.71 110.20,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"112.20\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"112.20\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"119.40,27.22 132.90,27.22 132.90,72.93 119.40,72.93\" fill=\"#d8d3b8\"/><path d=\"M123.40,36.68 Q126.40,47.71 124.40,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"126.40\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"126.40\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"133.60,27.22 147.10,27.22 147.10,72.93 133.60,72.93\" fill=\"#eae3cd\"/><path d=\"M137.60,36.68 Q140.60,47.71 138.60,60.32\" fill=\"none\" stroke-width=\".5\" opacity=\".6\"/><circle cx=\"140.60\" cy=\"31.95\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><circle cx=\"140.60\" cy=\"68.20\" r=\".85\" fill=\"#6a7361\" stroke=\"none\"/><polygon points=\"20.00,72.93 148.00,72.93 148.00,77.24 20.00,77.24\" fill=\"url(#dock-hatch)\"/><path d=\"M18.5 67.56v15.39q3.5 3 7 0V67.56\" fill=\"#adac87\"/><ellipse cx=\"22.0\" cy=\"67.56\" rx=\"3.5\" ry=\"2.6\" fill=\"#e5dec2\"/><ellipse cx=\"22.0\" cy=\"85.95\" rx=\"8\" ry=\"2.5\" fill=\"none\" stroke=\"#8aab97\" stroke-width=\".8\"/><path d=\"M128.5 67.56v15.39q3.5 3 7 0V67.56\" fill=\"#adac87\"/><ellipse cx=\"132.0\" cy=\"67.56\" rx=\"3.5\" ry=\"2.6\" fill=\"#e5dec2\"/><ellipse cx=\"132.0\" cy=\"85.95\" rx=\"8\" ry=\"2.5\" fill=\"none\" stroke=\"#8aab97\" stroke-width=\".8\"/></g></svg>";
world.append(dock);
let targetX=0,targetYpx=0,boatX=0,boatY=0,docking=0,wakeX=0,wakeY=0,lastWake=0;
function riverPointAtY(y){let lo=0,hi=length;for(let i=0;i<18;i++){const m=(lo+hi)/2;if(route.getPointAtLength(m).y<y)lo=m;else hi=m;}return route.getPointAtLength((lo+hi)/2);}

const paperBoat=new PaperBoat(document.querySelector('#paper-boat'));
let targetHeading=0,heading=0,bank=0,initialized=false;
let boatTime=0,lastFrame=0,animationId=0;
const angleDifference=(a,b)=>((a-b+540)%360)-180;
// Find the point at the viewport's vertical center, then place the paper boat
// on that same point of the river. It works even when the page height changes.
function update(){
 scheduled=false;
 const rect=river.getBoundingClientRect();
 if (riverHeight !== rect.height) {
   riverHeight = rect.height;
   if (!riverHeight) return;
   const steps = Math.ceil((riverHeight + 100) / 640);
   const bends = ['M740,-100'];
   for (let i = 0; i < steps; i++) {
     const y = i * 640 - 100;
     const start = i % 2 ? 445 : 740, end = i % 2 ? 740 : 445;
     bends.push(`C${start},${y+260} ${end},${y+380} ${end},${y+640}`);
   }
   route.setAttribute('d', bends.join(' '));
   river.setAttribute('viewBox', `0 0 1000 ${riverHeight}`);
   length = route.getTotalLength();
 }
 const targetY=Math.max(0,Math.min(riverHeight,(innerHeight*.6-rect.top)/rect.height*riverHeight));
 let low=0,high=length;
 for(let i=0;i<18;i++){const mid=(low+high)/2;if(route.getPointAtLength(mid).y<targetY)low=mid;else high=mid;}
 const point=route.getPointAtLength((low+high)/2);
 const next=route.getPointAtLength(Math.min(length,(low+high)/2+4));
 const angle=Math.atan2((next.y-point.y)*rect.height/riverHeight,(next.x-point.x)*rect.width/1000)*180/Math.PI+90;
 const maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const ending=document.querySelector('.ending');
 const endY=Math.max(ending.offsetTop+60, Math.min(rect.height-65, rect.height-innerHeight*.4));
 const end=riverPointAtY(endY);
 // Keep the pier on screen even when the mobile river extends beyond the viewport.
 const berthX=Math.min(end.x/1000*rect.width+48,innerWidth-rect.left-190);
 const berthY=end.y/riverHeight*rect.height;
 dock.style.transform=`translate(${berthX+22}px,${berthY-55}px)`;
 const arrival=Math.max(0,Math.min(1,(scrollY-(maxScroll-260))/260));
 docking=arrival*arrival*(3-2*arrival);
 targetX=point.x/1000*rect.width*(1-docking)+berthX*docking;
 targetYpx=point.y/riverHeight*rect.height*(1-docking)+berthY*docking;
 targetHeading=angle+angleDifference(90,angle)*docking;
 if(!initialized){heading=targetHeading;boatX=targetX;boatY=targetYpx;wakeX=boatX;wakeY=boatY;initialized=true;}

 const max=document.documentElement.scrollHeight-innerHeight;
 document.querySelector('#progress').style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
const motion=document.querySelector('#motion');
let paused=reduce.matches;
function applyMotion(){root.classList.toggle('paused',paused);motion.setAttribute('aria-pressed',String(paused));motion.disabled=reduce.matches;Credits.paint(motion,data.page[reduce.matches?'reduced':paused?'resume':'pause']);}

motion.addEventListener('click',()=>{paused=!paused;applyMotion();});
reduce.addEventListener('change',()=>{root.classList.toggle('reduced',reduce.matches);paused=reduce.matches;applyMotion();});applyMotion();

// The camera stays nearly overhead. Roll is capped at 4 degrees, pitch at 1.1.
// Turn-induced lean eases in/out; scroll position itself remains responsive.
function animate(now){
 const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;lastFrame=now;
 const oldX=boatX,oldY=boatY;
 const follow=paused||reduce.matches?1:1-Math.exp(-dt*12);
 boatX+=(targetX-boatX)*follow;boatY+=(targetYpx-boatY)*follow;
 boat.style.transform=`translate(${boatX-48}px,${boatY-48}px)`;
 const travelled=Math.hypot(boatX-wakeX,boatY-wakeY);
 if(!paused&&!reduce.matches&&docking<.98&&travelled>12&&now-lastWake>95){
   const direction=Math.atan2(boatY-oldY,boatX-oldX);
   const wake=document.createElement('span');wake.className='boat-wake';
   wake.style.left=`${boatX-Math.cos(direction)*29}px`;wake.style.top=`${boatY-Math.sin(direction)*29}px`;
   wake.style.setProperty('--wake-angle',`${direction*180/Math.PI+90}deg`);
   world.append(wake);wake.addEventListener('animationend',()=>wake.remove(),{once:true});setTimeout(()=>wake.remove(),2200);
   wakeX=boatX;wakeY=boatY;lastWake=now;
 }
 if(paused||reduce.matches){world.querySelectorAll('.boat-wake').forEach(w=>w.remove());wakeX=boatX;wakeY=boatY;}
 const delta=angleDifference(targetHeading,heading);
 const calm=paused||reduce.matches;
 if(calm){heading=targetHeading;bank=0;}
 else{
   boatTime+=dt;
   heading+=delta*(1-Math.exp(-dt*9));
   const targetBank=Math.max(-1.8,Math.min(1.8,delta*.12));
   bank+=(targetBank-bank)*(1-Math.exp(-dt*5));
 }
 const roll=calm?0:Math.max(-4,Math.min(4,Math.sin(boatTime*1.45)*2.2+bank));
 const pitch=calm?0:Math.sin(boatTime*1.1+.7)*1.1;
 paperBoat.draw(heading,roll*(1-docking*.8),pitch*(1-docking*.8),calm?0:Math.sin(boatTime*1.9)*.55*(1-docking*.8));
 animationId=requestAnimationFrame(animate);
}
// No accumulated jump after the browser tab has been hidden.
addEventListener('visibilitychange',()=>{
 cancelAnimationFrame(animationId);lastFrame=0;
 if(!document.hidden)animationId=requestAnimationFrame(animate);
});
update();animationId=requestAnimationFrame(animate);

if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.querySelector('main'));
}
startCredits().catch(error => {
  const message = document.createElement('p');
  message.textContent = 'Could not load the credits. ' + error.message;
  document.querySelector('#credits').append(message);
});
