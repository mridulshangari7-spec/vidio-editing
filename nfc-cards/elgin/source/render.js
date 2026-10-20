const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:360,height:216},deviceScaleFactor:1});
await pg.goto('file://'+__dirname+'/card.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
await pg.pdf({path:__dirname+'/Elgin_NFC_Card_PRINT.pdf',preferCSSPageSize:true,printBackground:true});
await b.close();})();
