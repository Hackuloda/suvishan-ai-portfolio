const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(!e.isIntersecting||e.target.classList.contains('on')||e.target.dataset.revealPending)return;
  if(e.target.matches('#expertise .card')){
    e.target.dataset.revealPending='true';
    const cards=[...document.querySelectorAll('#expertise .card')];
    setTimeout(()=>e.target.classList.add('on'),cards.indexOf(e.target)*120+80);
  }else e.target.classList.add('on');
}),{threshold:.12});
const motionTargets=document.querySelectorAll('.hero h1,.section-head h2,.job h3');
motionTargets.forEach(target=>{
  let index=0;
  const walk=node=>{
    [...node.childNodes].forEach(child=>{
      if(child.nodeType===Node.TEXT_NODE&&child.textContent.trim()){
        const frag=document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part=>{
          if(/^\s+$/.test(part)){frag.append(part);return}
          const span=document.createElement('span');span.className='motion-word';span.style.setProperty('--word-index',index++);span.textContent=part;frag.append(span);
        });
        child.replaceWith(frag);
      }else if(child.nodeType===Node.ELEMENT_NODE&&child.tagName!=='BR')walk(child);
    });
  };
  walk(target);target.classList.add('motion-text');
});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const stage=document.querySelector('[data-tilt]');
const character=document.querySelector('.character-reveal');
const faceHotspot=document.querySelector('.face-hotspot');
if(stage&&matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove',e=>{
    const x=(e.clientX/innerWidth-.5)*8;
    const y=(e.clientY/innerHeight-.5)*-7;
    stage.style.transform=`perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
  });
  window.addEventListener('pointerleave',()=>{stage.style.transform='';character?.classList.remove('face-active')});
}
faceHotspot?.addEventListener('pointerenter',()=>character?.classList.add('face-active'));
faceHotspot?.addEventListener('pointerleave',()=>character?.classList.remove('face-active'));
faceHotspot?.addEventListener('focus',()=>character?.classList.add('face-active'));
faceHotspot?.addEventListener('blur',()=>character?.classList.remove('face-active'));
faceHotspot?.addEventListener('click',()=>{if(matchMedia('(pointer:coarse)').matches)character?.classList.toggle('face-active')});
const skillPanel=document.querySelector('.skill-panel');
const skillRows=[...document.querySelectorAll('.skill-row')];
document.querySelectorAll('.skill-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.skill-tab').forEach(t=>t.classList.toggle('active',t===tab));
  const filter=tab.dataset.filter;
  skillRows.forEach((row,index)=>{
    const show=filter==='all'||row.dataset.category===filter;
    row.classList.toggle('filtered-out',!show);
    row.classList.remove('pulse');
    if(show){row.style.setProperty('--delay',`${index*55}ms`);requestAnimationFrame(()=>row.classList.add('pulse'))}
  });
}));
if(skillPanel){new IntersectionObserver(([entry])=>{if(entry.isIntersecting)skillPanel.classList.add('lit')},{threshold:.28}).observe(skillPanel)}
const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  const video=entry.target;
  if(entry.isIntersecting){
    if(!video.src){video.src=video.dataset.src;video.load()}
    video.play().catch(()=>{});
  }else{video.pause()}
}),{rootMargin:'180px 0px',threshold:.08});
document.querySelectorAll('.card-video,.journey-video').forEach(video=>videoObserver.observe(video));
document.querySelectorAll('.video-card').forEach(card=>{
  card.tabIndex=0;
  card.addEventListener('click',()=>{
    if(!matchMedia('(pointer:coarse)').matches)return;
    const opening=!card.classList.contains('expertise-active');
    document.querySelectorAll('.video-card').forEach(item=>item.classList.remove('expertise-active'));
    card.classList.toggle('expertise-active',opening);
  });
});
if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.video-card').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const px=event.clientX-rect.left;
      const py=event.clientY-rect.top;
      const nx=px/rect.width-.5;
      const ny=py/rect.height-.5;
      card.style.setProperty('--px',`${px}px`);
      card.style.setProperty('--py',`${py}px`);
      card.style.setProperty('--ry',`${nx*7}deg`);
      card.style.setProperty('--rx',`${ny*-6}deg`);
      card.style.setProperty('--vx',`${nx*-9}px`);
      card.style.setProperty('--vy',`${ny*-7}px`);
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--ry','0deg');
      card.style.setProperty('--rx','0deg');
      card.style.setProperty('--vx','0px');
      card.style.setProperty('--vy','0px');
    });
  });
}
const timeline=document.querySelector('.timeline');
const journeyJobs=[...document.querySelectorAll('.timeline .job')];
journeyJobs.forEach(job=>{
  const panel=job.querySelector(':scope > div');
  if(panel){
    const signal=document.createElement('span');
    signal.className='journey-signal';
    signal.setAttribute('aria-hidden','true');
    signal.innerHTML='<i></i><i></i><i></i><i></i>';
    panel.append(signal);
  }
});
const moveTraveler=job=>{
  if(!timeline||!job)return;
  const nextX=job.offsetLeft+job.offsetWidth/2;
  const previousX=Number(timeline.dataset.journeyX||nextX);
  timeline.classList.remove('flying-left','flying-right');
  timeline.classList.add(nextX<previousX?'flying-left':'flying-right');
  timeline.dataset.journeyX=nextX;
  timeline.style.setProperty('--journey-x',`${nextX}px`);
  journeyJobs.forEach(item=>item.classList.toggle('journey-active',item===job));
  clearTimeout(timeline._sailTimer);
  timeline._sailTimer=setTimeout(()=>timeline.classList.remove('flying-left','flying-right'),780);
};
journeyJobs.forEach(job=>{
  job.addEventListener('pointerenter',()=>moveTraveler(job));
  job.addEventListener('pointermove',event=>{
    const panel=job.querySelector(':scope > div');
    if(!panel)return;
    const rect=panel.getBoundingClientRect();
    job.style.setProperty('--signal-x',`${Math.max(0,Math.min(rect.width,event.clientX-rect.left))}px`);
    job.style.setProperty('--signal-y',`${Math.max(0,Math.min(rect.height,event.clientY-rect.top))}px`);
  });
  job.addEventListener('focus',()=>moveTraveler(job));
  job.addEventListener('pointerleave',()=>job.classList.remove('journey-active'));
  job.addEventListener('blur',()=>job.classList.remove('journey-active'));
  job.addEventListener('click',()=>{if(matchMedia('(pointer:coarse)').matches)moveTraveler(job)});
});

const statNumbers=document.querySelectorAll('.stat-number');
const countStat=element=>{
  if(element.dataset.counted)return;
  element.dataset.counted='true';
  const target=Number(element.dataset.count||0);
  const suffix=element.dataset.suffix||'';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    element.textContent=target.toLocaleString()+suffix;
    return;
  }
  const duration=1850;
  const start=performance.now();
  const tick=now=>{
    const progress=Math.min((now-start)/duration,1);
    const eased=1-Math.pow(1-progress,5);
    const value=Math.min(target,Math.floor(target*eased));
    element.textContent=value.toLocaleString()+suffix;
    if(progress<1)requestAnimationFrame(tick);
    else element.textContent=target.toLocaleString()+suffix;
  };
  requestAnimationFrame(tick);
};
const statObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
    statNumbers.forEach((number,index)=>setTimeout(()=>countStat(number),index*90));
    statObserver.disconnect();
  }
}),{threshold:.35});
if(statNumbers.length)statObserver.observe(document.querySelector('.stats-strip'));

const certificateIcons={
  project:'<svg viewBox="0 0 80 80"><rect x="17" y="14" width="46" height="53" rx="7"/><path d="M29 29h23M29 41h23M29 53h15"/><path class="icon-check" d="m48 54 5 5 10-13"/></svg>',
  development:'<svg viewBox="0 0 80 80"><path d="m29 22-18 18 18 18M51 22l18 18-18 18M46 14 34 66"/></svg>',
  tech:'<svg viewBox="0 0 80 80"><path d="M40 10 61 22v24L40 58 19 46V22Z"/><path d="m19 22 21 12 21-12M40 34v24"/><circle cx="40" cy="66" r="4"/></svg>',
  leadership:'<svg viewBox="0 0 80 80"><circle cx="40" cy="22" r="9"/><circle cx="19" cy="38" r="7"/><circle cx="61" cy="38" r="7"/><path d="M25 68c0-13 6-22 15-22s15 9 15 22M8 65c0-10 4-17 11-17 4 0 7 2 9 6M72 65c0-10-4-17-11-17-4 0-7 2-9 6"/></svg>',
  strategy:'<svg viewBox="0 0 80 80"><circle cx="18" cy="19" r="7"/><circle cx="62" cy="19" r="7"/><circle cx="40" cy="61" r="7"/><path d="M25 19h30M22 25l14 29M58 25 44 54"/></svg>',
  mindset:'<svg viewBox="0 0 80 80"><path d="M27 53c-8-5-13-14-11-24 2-12 13-20 25-19 13 1 23 12 23 25 0 8-4 14-10 19-4 3-5 6-5 11H31c0-6-1-9-4-12Z"/><path d="M31 65h18M33 72h14M40 20v13m-13-7 9 10m17-10-9 10"/></svg>',
  delivery:'<svg viewBox="0 0 80 80"><path class="rocket" d="M28 51c8-23 19-35 38-39-3 19-15 31-38 39Z"/><circle cx="52" cy="26" r="6"/><path d="M30 45 17 47 9 60l20-2M35 50l-2 20 13-8 2-13M22 59 12 69"/></svg>',
  design:'<svg viewBox="0 0 80 80"><path d="m40 10 22 22-22 38-22-38Z"/><circle cx="40" cy="33" r="7"/><path d="M40 40v30M18 32h44"/></svg>',
  linux:'<svg viewBox="0 0 80 80"><rect x="10" y="14" width="60" height="52" rx="8"/><path class="terminal-line" d="m22 31 9 8-9 8M38 48h18"/><circle cx="20" cy="23" r="2"/><circle cx="27" cy="23" r="2"/></svg>'
};
document.querySelectorAll('.certificate-card').forEach(card=>{
  const category=(card.querySelector(':scope > span')?.textContent||'').toLowerCase();
  const type=category.includes('project')?'project':category.includes('development')?'development':category.includes('emerging')?'tech':category.includes('leadership')?'leadership':category.includes('strategy')?'strategy':category.includes('mindset')?'mindset':category.includes('delivery')?'delivery':category.includes('design')?'design':'linux';
  const icon=document.createElement('span');
  icon.className=`certificate-icon certificate-icon-${type}`;
  icon.setAttribute('aria-hidden','true');
  icon.innerHTML=certificateIcons[type];
  card.append(icon);
});

const facebookButton=document.querySelector('.hero-facebook');
if(facebookButton&&!document.querySelector('.hero-line')){
  const lineButton=document.createElement('a');
  lineButton.className='hero-social hero-line';
  lineButton.href='https://line.me/ti/p/~auzafreedom';
  lineButton.target='_blank';
  lineButton.rel='noreferrer';
  lineButton.setAttribute('aria-label','Add Suvishan on LINE');
  lineButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 10.3C24 4.62 18.62 0 12 0S0 4.62 0 10.3c0 5.1 4.53 9.37 10.65 10.18.41.09.98.28 1.12.64.13.33.09.85.04 1.19l-.18 1.12c-.05.33-.26 1.29 1.13.7 1.39-.58 7.5-4.42 10.23-7.56C23.93 14.91 24 12.92 24 10.3ZM7.32 13.68H4.94a.63.63 0 0 1-.63-.63V8.27a.63.63 0 1 1 1.26 0v4.15h1.75a.63.63 0 1 1 0 1.26Zm2.47-.63a.63.63 0 1 1-1.26 0V8.27a.63.63 0 1 1 1.26 0v4.78Zm5.74 0a.63.63 0 0 1-1.12.4l-2.45-3.32v2.92a.63.63 0 1 1-1.26 0V8.27a.63.63 0 0 1 1.13-.38l2.44 3.31V8.27a.63.63 0 1 1 1.26 0v4.78Zm3.87-3.02a.63.63 0 1 1 0 1.26h-1.75v1.13h1.75a.63.63 0 1 1 0 1.26h-2.38a.63.63 0 0 1-.63-.63V8.27c0-.35.28-.63.63-.63h2.38a.63.63 0 1 1 0 1.26h-1.75v1.13h1.75Z"/></svg><span>LINE</span>';
  facebookButton.after(lineButton);
}

const radarTargets=[...new Set(document.querySelectorAll('a,button,.card,.job,.skill-row,.stat-item,.education-item,.certificate-card,.contact-item'))];
radarTargets.forEach(target=>{
  if(target.querySelector(':scope > .global-radar'))return;
  target.classList.add('radar-target');
  const radar=document.createElement('span');
  radar.className='global-radar';
  radar.setAttribute('aria-hidden','true');
  radar.innerHTML='<span></span><span></span><span></span>';
  target.append(radar);
  target.addEventListener('pointermove',event=>{
    const rect=target.getBoundingClientRect();
    target.style.setProperty('--radar-x',`${event.clientX-rect.left}px`);
    target.style.setProperty('--radar-y',`${event.clientY-rect.top}px`);
  });
  target.addEventListener('pointerenter',event=>{
    const rect=target.getBoundingClientRect();
    target.style.setProperty('--radar-x',`${event.clientX-rect.left}px`);
    target.style.setProperty('--radar-y',`${event.clientY-rect.top}px`);
    target.classList.add('radar-active');
  });
  target.addEventListener('pointerleave',()=>target.classList.remove('radar-active'));
  target.addEventListener('focusin',()=>target.classList.add('radar-active'));
  target.addEventListener('focusout',()=>target.classList.remove('radar-active'));
});
