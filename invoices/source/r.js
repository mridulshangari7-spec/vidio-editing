const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.goto('file://'+__dirname+'/inv.html');await pg.evaluate(()=>document.fonts.ready);
await pg.pdf({path:__dirname+'/ov.pdf',preferCSSPageSize:true,printBackground:true,omitBackground:true});await b.close();})();
