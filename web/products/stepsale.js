import {$,state,fmt,link,button,field,form,amount,read,tx,mine,chainTime,asset,start} from '../core.js';
const trim=v=>{const [a,b='']=v.split('.');return b?`${a}.${b.slice(0,4).replace(/0+$/,'')||'0'}`.replace(/\.0$/,''):a;};
const day=d=>new Date(Number(d)*1000).toLocaleDateString(undefined,{day:'numeric',month:'short'});
const tally={sales:0,live:0,raised:0n};
const box=inner=>`<div>${inner}</div>`;
function controls(){
 $('list-title').textContent='Sales';
 $('controls').innerHTML='<h2>Launch a sale</h2><p>Three 24-hour rounds at 0.5, 0.55 and 0.605 BOT per token. The allocation is locked in the sale when you create it.</p>'
  +form('sale',field('start','Round 1 opens (your local time)','','datetime-local')
   +`<div class="two">${box(field('soft','Soft cap (BOT)','1','text','inputmode="decimal"'))}${box(field('hard','Hard cap (BOT)','10','text','inputmode="decimal"'))}</div>`
   +`<div class="two">${box(field('min','Min per wallet (BOT)','0.1','text','inputmode="decimal"'))}${box(field('max','Max per wallet (BOT)','5','text','inputmode="decimal"'))}</div>`
   +field('allocation','Tokens for sale (ROE)','100','text','inputmode="decimal"'),
   'Create sale',async f=>tx('StepsaleLaunchpad','create',[BigInt(Math.floor(new Date(f.start).getTime()/1000)),amount(f.soft),amount(f.hard),amount(f.min),amount(f.max),amount(f.allocation)]));
 $('rules').innerHTML='<ul><li>Each sale creates its own ROE token with one billion supply. The creator receives unallocated tokens.</li><li>Three 24-hour rounds price one ROE at 0.5, 0.55, then 0.605 BOT.</li><li>Allocated tokens are deposited into the sale at creation. It cannot sell more than that allocation.</li><li>Claims unlock three days after the final round. If the soft cap fails, contributors can refund then.</li><li>Pausing stops purchases, but does not block refunds or matured claims.</li></ul>';
}
async function card(id){
 const addr=await read('StepsaleLaunchpad','sales',[BigInt(id)]);const get=(fn,args=[])=>read('ROEPresale',fn,args,addr);
 const [raised,soft,hard,status,claimStart,token,r0,r1,r2,min]=await Promise.all([get('totalRaised'),get('softCap'),get('hardCap'),get('getPresaleStatus'),get('claimStart'),read('StepsaleLaunchpad','saleToken',[addr]),get('rounds',[0n]),get('rounds',[1n]),get('rounds',[2n]),get('minContribution')]);
 const now=await chainTime(),rounds=[r0,r1,r2],[active,cur]=status,ended=now>=Number(r2[2]),upcoming=now<Number(r0[1]);
 tally.sales++;if(active)tally.live++;tally.raised+=raised;
 const pct=hard>0n?Math.min(100,Number(raised*1000n/hard)/10):0,capAt=hard>0n?Math.min(100,Number(soft*1000n/hard)/10):0;
 const label=active?`Round ${cur+1} live`:upcoming?`Opens ${day(r0[1])}`:now>=Number(claimStart)?(raised>=soft?'Claims open':'Refunds open'):'Sale ended';
 let html=`<article class="sale"><div class="sheet-head"><div><h3>ROE sale #${id+1}</h3><span class="tiny">${link(token,'Token')} · ${link(addr,'Sale contract')}</span></div><div class="badges"><span class="badge${active?' live':''}">${label}</span></div></div>`;
 html+=`<ol class="steps-track" aria-label="Rounds">${rounds.map((r,n)=>`<li class="${active&&cur===n?'now':(active&&cur>n)||ended?'done':''}"><strong>${trim(fmt(r[0]))} BOT</strong>Round ${n+1} · ${day(r[1])}</li>`).join('')}</ol>`;
 html+=`<div class="meter" role="progressbar" aria-label="Raised toward hard cap" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i><span class="cap" style="left:${capAt}%" title="Soft cap"></span></div>`;
 html+=`<dl class="figs"><div><dt>Raised</dt><dd>${trim(fmt(raised))} BOT</dd></div><div><dt>Soft cap</dt><dd>${trim(fmt(soft))} BOT</dd></div><div><dt>Hard cap</dt><dd>${trim(fmt(hard))} BOT</dd></div><div><dt>Claims from</dt><dd>${day(claimStart)}</dd></div></dl>`;
 if(active)html+=form(`buy-${id}`,field(`buy-amount-${id}`,`Contribute (BOT, min ${trim(fmt(min))})`,trim(fmt(min)),'text','inputmode="decimal"'),`Buy in round ${cur+1}`,f=>tx('ROEPresale','buyTokens',[],amount(f[`buy-amount-${id}`]),addr));
 if(state.account){const contributed=await get('contributions',[state.account]);
  if(contributed>0n)html+=`<p class="you">You contributed ${trim(fmt(contributed))} BOT.</p>`;
  if(now>=Number(claimStart)){const claimed=await get('claimed',[state.account]);if(contributed>0n&&!claimed)html+=`<div class="actions">${button(raised>=soft?'Claim tokens':'Refund contribution',()=>tx('ROEPresale',raised>=soft?'claim':'refund',[],0n,addr),true)}</div>`;
   if(mine(await get('owner'))&&raised>=soft)html+=`<div class="actions">${button('Withdraw raised BOT',()=>tx('ROEPresale','withdrawFunds',[state.account],0n,addr))}</div>`;}}
 return html+'</article>';
}
async function render(){
 const count=Number(await read('StepsaleLaunchpad','saleCount'));Object.assign(tally,{sales:0,live:0,raised:0n});
 const ids=[];for(let id=count-1;id>=Math.max(0,count-20);id--)ids.push(id);
 const cards=await Promise.all(ids.map(card));
 return cards.length?`<div class="sales">${cards.join('')}</div>`:'<p class="empty">No sales yet. Launch the first one with your own terms.</p>';
}
function stats(empty){return [['Sales',empty?'—':String(tally.sales)],['Live now',empty?'—':String(tally.live)],['Raised',empty?'—':`${trim(fmt(tally.raised))} BOT`]];}
start({controls,render,stats});
