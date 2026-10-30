const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
await pg.goto('file://'+__dirname+'/card.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
await pg.pdf({path:__dirname+'/out.pdf',preferCSSPageSize:true,printBackground:true});await b.close();})();
