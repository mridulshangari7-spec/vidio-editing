const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
await pg.goto('file://'+__dirname+'/stories.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(800);
const names=fs.readFileSync(__dirname+'/names.txt','utf8').split('\n');fs.mkdirSync(__dirname+'/out/png',{recursive:true});
const els=await pg.$$('.story');for(let i=0;i<els.length;i++){await els[i].screenshot({path:`${__dirname}/out/png/${names[i]}.png`});}
console.log(els.length);await b.close();})();
