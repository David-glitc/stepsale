import {$,state,fmt,link,button,field,form,amount,read,tx,mine,chainTime,start} from '../core.js';
function controls(){
 $('list-title').textContent='Token sales';
 $('controls').innerHTML='<h2>Create a sale</h2>'+form('sale',field('start','Starts at (your local time)','','datetime-local')+field('soft','Soft cap (BOT)','1','text','inputmode="decimal"')+field('hard','Hard cap (BOT)','10','text','inputmode="decimal"')+field('min','Minimum contribution (BOT)','0.1','text','inputmode="decimal"')+field('max','Maximum per wallet (BOT)','5','text','inputmode="decimal"')+field('allocation','ROE tokens allocated','100','text','inputmode="decimal"'),'Create funded sale',async f=>tx('StepsaleLaunchpad','create',[BigInt(Math.floor(new Date(f.start).getTime()/1000)),amount(f.soft),amount(f.hard),amount(f.min),amount(f.max),amount(f.allocation)]));
 $('rules').innerHTML='<ul><li>Each sale creates its own ROE token with one billion supply. The creator receives unallocated tokens.</li><li>Three 24-hour rounds price one ROE at 0.5, 0.55, then 0.605 BOT.</li><li>Allocated tokens are deposited into the sale at creation. It cannot sell more than that allocation.</li><li>Claims unlock three days after the final round. If the soft cap fails, contributors can refund then.</li><li>Pausing stops purchases, but does not block refunds or matured claims.</li></ul>';
}
async function render(){
 const count=Number(await read('StepsaleLaunchpad','saleCount'));const nowMs=await chainTime()*1000;let html='';
 for(let id=count-1;id>=Math.max(0,count-20);id--){const addr=await read('StepsaleLaunchpad','sales',[BigInt(id)]);const get=(fn,args=[])=>read('ROEPresale',fn,args,addr);const [raised,soft,hard,current,claimStart,token]=await Promise.all([get('totalRaised'),get('softCap'),get('hardCap'),get('getPresaleStatus'),get('claimStart'),read('StepsaleLaunchpad','saleToken',[addr])]);
  html+=`<article class="item"><h3>ROE sale #${id+1}</h3><p>${link(token,'Token contract')} · ${link(addr,'Sale contract')}</p><div class="amount">${fmt(raised)} / ${fmt(hard)} BOT</div><p class="tiny">Soft cap ${fmt(soft)} BOT · ${current[0]?`Round ${current[1]+1} active`:'Sale not active'}<br>Claims / refunds: ${new Date(Number(claimStart)*1000).toLocaleString()}</p>`;
  if(current[0])html+=form(`buy-${id}`,field(`buy-amount-${id}`,'Contribution (BOT)','0.1','text','inputmode="decimal"'),'Buy ROE',f=>tx('ROEPresale','buyTokens',[],amount(f[`buy-amount-${id}`]),addr));
  if(state.account&&nowMs>=Number(claimStart)*1000){const contributed=await get('contributions',[state.account]),claimed=await get('claimed',[state.account]);if(contributed>0n&&!claimed)html+=button(raised>=soft?'Claim tokens':'Refund contribution',()=>tx('ROEPresale',raised>=soft?'claim':'refund',[],0n,addr),true);if(mine(await get('owner'))&&raised>=soft)html+=button('Withdraw raised BOT',()=>tx('ROEPresale','withdrawFunds',[state.account],0n,addr));}
  html+='</article>';
 }return html||'<p class="empty">No token sales yet. Create a sale with your chosen terms.</p>';
}
start({controls,render});
