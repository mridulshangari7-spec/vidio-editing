const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs'),cp=require('child_process');
(async()=>{const b=await chromium.launch();const names=fs.readFileSync(__dirname+'/names.txt','utf8').split('\n');
fs.mkdirSync(__dirname+'/out/mp4',{recursive:true});fs.mkdirSync(__dirname+'/vtmp',{recursive:true});
for(let i=0;i<names.length;i++){
  const ctx=await b.newContext({viewport:{width:1080,height:1920},recordVideo:{dir:__dirname+'/vtmp',size:{width:1080,height:1920}}});
  const pg=await ctx.newPage();await pg.goto('file://'+__dirname+'/stories.html?anim=1&s='+(i+1));await pg.waitForTimeout(7600);
  const v=pg.video();await ctx.close();const p=await v.path();
  cp.execSync(`ffmpeg -y -loglevel error -ss 0.5 -i "${p}" -t 7 -vf "fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 20 -movflags +faststart "${__dirname}/out/mp4/${names[i]}.mp4"`);
  fs.unlinkSync(p);console.log(names[i]);}
await b.close();})();
