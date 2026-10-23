export default {
 slug:'stepsale',vercel:'stepsale',assets:['BOT'],name:'Stepsale',repo:'stepsale',contract:'StepsaleLaunchpad',color:'#d5c5ff',eyebrow:'TOKEN LAUNCHPAD',symbol:'↗',
 line:'Three rounds. Transparent terms.',
 app:{title:'Sale calendar',line:'Three priced rounds per sale. Claims or refunds follow the soft cap.',layout:'calendar'},
 description:'Create a fully funded ROE token sale with fixed round prices, contribution limits, claims and refunds.',
 abis:['StepsaleLaunchpad','ROEPresale'],
 contracts:['src/StepsaleLaunchpad.sol','src/roepresale.sol','src/roetoken.sol'],tests:['test/Stepsale.t.sol'],
 artifacts:{ROEPresale:'roepresale',ROEToken:'roetoken'},
 landing:{
  steps:[['Set your terms','Choose start time, soft and hard caps, wallet limits and the token allocation.'],['Three fixed rounds','Contributors buy across three 24-hour rounds at 0.5, 0.55 and 0.605 BOT per ROE.'],['Claim or refund','Three days after the sale, buyers claim tokens — or refund if the soft cap failed.']],
  features:[['Fully funded sales','The sale holds its whole token allocation from creation, so it cannot oversell.'],['Built-in refunds','If the soft cap is missed, every contributor can take their BOT back.'],['Pause without lock-in','Pausing stops new purchases but never blocks refunds or matured claims.'],['One contract per sale','Each sale deploys its own ROE token and sale contract you can inspect on BOTScan.']],
  faq:[['Who can create a sale?','Anyone. Each creator owns their sale and receives the unallocated token supply.'],['How are prices set?','Fixed by round: 0.5, 0.55 and 0.605 BOT per ROE.'],['When can I claim?','Three days after the final round ends.'],['Is this an endorsement of any token?','No. The launchpad is neutral infrastructure; do your own research before contributing.']],
 },
 async deploy({deploy}){await deploy('StepsaleLaunchpad');},
};
