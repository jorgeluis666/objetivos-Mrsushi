const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root=path.resolve(__dirname,'..');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sushi-alert-currency-'));
fs.mkdirSync(path.join(dir,'scripts'));fs.mkdirSync(path.join(dir,'data'));
fs.copyFileSync(path.join(root,'scripts/alertas.js'),path.join(dir,'scripts/alertas.js'));
const config=JSON.parse(fs.readFileSync(path.join(root,'data/alertas-config.json'),'utf8'));
config.copia_local='data/fixture.json';
const date=new Date(Date.now()-5*3600*1000);const year=date.getUTCFullYear(),month=date.getUTCMonth()+1;
fs.writeFileSync(path.join(dir,'data/fixture.json'),JSON.stringify({months:[{name:'Prueba',year,month,columns:['day','campaign','resultType','spend','impressions','reach','clicks','results'],rows:[[`${year}-${String(month).padStart(2,'0')}-01`,'Prueba','Conversaciones con mensajes iniciadas',64.06,100,90,10,5]]}]}));
fs.writeFileSync(path.join(dir,'data/alertas-envios.json'),'{}');
function run(currency,symbol){
 const c={...config};if(currency===undefined)delete c.currency;else c.currency=currency;
 fs.writeFileSync(path.join(dir,'data/alertas-config.json'),JSON.stringify(c));
 const env={PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,DRY_RUN:'true'};
 const dry=spawnSync(process.execPath,['scripts/alertas.js','--dry-run'],{cwd:dir,env,encoding:'utf8'});
 assert.equal(dry.status,0,dry.stderr);assert.match(dry.stdout,/Asunto/);assert.ok(dry.stdout.includes(symbol+' 64'),dry.stdout);
 const preview=spawnSync(process.execPath,['scripts/alertas.js','--preview','preview.html'],{cwd:dir,env,encoding:'utf8'});
 assert.equal(preview.status,0,preview.stderr);
 const html=fs.readFileSync(path.join(dir,'preview.html'),'utf8');assert.ok(html.includes(symbol+' 64.06'));
 if(currency==='USD')assert.ok(!html.includes('S/.'));
 assert.equal(fs.readFileSync(path.join(dir,'data/alertas-envios.json'),'utf8'),'{}');
}
try{run('USD','US$');run('PEN','S/.');run(undefined,'S/.');
 fs.writeFileSync(path.join(dir,'data/alertas-config.json'),JSON.stringify({...config,currency:'EUR'}));
 const bad=spawnSync(process.execPath,['scripts/alertas.js','--dry-run'],{cwd:dir,env:{DRY_RUN:'true'},encoding:'utf8'});
 assert.notEqual(bad.status,0);assert.match(bad.stderr,/Moneda de alertas no soportada/);
 console.log('USD/PEN: asunto y HTML correctos, importes conservados, sin envio ni registro; moneda desconocida rechazada.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
