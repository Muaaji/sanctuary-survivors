'use strict';
// Local inventory only. PNG facts are read from chunks and decoded alpha bytes.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]);}
function pngFacts(buffer){
 if(buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')return null;
 let width,height,bitDepth,colorType,interlace,hasTRNS=false;const idat=[];
 for(let offset=8;offset+12<=buffer.length;){const n=buffer.readUInt32BE(offset),type=buffer.toString('ascii',offset+4,offset+8),chunk=buffer.subarray(offset+8,offset+8+n);
  if(type==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);bitDepth=chunk[8];colorType=chunk[9];interlace=chunk[12];}
  if(type==='tRNS')hasTRNS=true;if(type==='IDAT')idat.push(chunk);offset+=12+n;
 }
 const alphaChannel=colorType===4||colorType===6;
 let transparentPixels=null,opaquePixels=null;
 if(alphaChannel&&bitDepth===8&&!interlace){
  const channels=colorType===6?4:2,stride=width*channels,raw=zlib.inflateSync(Buffer.concat(idat));let prev=Buffer.alloc(stride),offset=0;transparentPixels=0;opaquePixels=0;
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){const filter=raw[offset++],row=Buffer.alloc(stride);for(let x=0;x<stride;x++){const left=x>=channels?row[x-channels]:0,up=prev[x],corner=x>=channels?prev[x-channels]:0;row[x]=(raw[offset++]+(filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,corner):0))&255;}
   for(let x=channels-1;x<stride;x+=channels){if(row[x]<255)transparentPixels++;else opaquePixels++;}prev=row;
  }
 }
 return {width,height,bitDepth,colorType,alphaChannel,transparencyChunk:hasTRNS,hasTransparentPixels:transparentPixels===null?(alphaChannel||hasTRNS?null:false):transparentPixels>0,transparentPixels,opaquePixels};
}
function inventory(){
 const assets=files(path.join(root,'assets')).filter(f=>f.endsWith('.png')).sort().map(file=>{
  const relative=path.relative(root,file).split(path.sep).join('/'),buffer=fs.readFileSync(file),facts=pngFacts(buffer),actor=relative.startsWith('assets/sprites/'),champion=relative.includes('/champions/'),strip=actor&&!champion&&facts.width>=facts.height&&facts.width%facts.height===0;
  const frameW=strip?facts.height:relative.includes('/survivors/spells/')&&facts.width===128&&facts.height===32?32:facts.width;
  const count=Math.max(1,facts.width/frameW),atlas=relative.includes('sprite-sheet');
  return {path:relative,fileBytes:buffer.length,...facts,kind:atlas?'atlas-grid-unmapped':count>1?'horizontal-strip':'single-image',frameW:atlas?null:frameW,frameCount:atlas?null:count,decodedBytesRGBA:facts.width*facts.height*4,anchor:actor?{policy:'runtime-feet-offset',normalizedX:.5,normalizedY:1,screenYOffset:8,source:'js/survivors/integration.js drawImage; bottom lands at entity y+8'}:{policy:'consumer-specific',source:'no universal feet anchor'},technicalReuse:atlas?'requires explicit tile mapping':count>1?'crop one frame before icon reuse':actor?'actor sprite; preserve transparent silhouette':'existing project image; inspect consumer before reuse',provenance:{origin:champion?'imagegen-generated-project-champion':'existing-project-origin-unverified',verifiedLicense:false,externalReferenceImport:false},notes:champion?'Champion sprite generated for this project; static image, not a direction atlas.':null};
 });
 return {schemaVersion:1,scope:'Local PNG inventory; no Vampire Survivors data or assets imported.',provenancePolicy:'Technical reuse compatibility does not establish authorship or licensing. Existing files remain origin-unverified unless independently documented.',totalFiles:assets.length,totalFileBytes:assets.reduce((sum,a)=>sum+a.fileBytes,0),totalDecodedBytesRGBA:assets.reduce((sum,a)=>sum+a.decodedBytesRGBA,0),assets};
}
if(require.main===module)process.stdout.write(JSON.stringify(inventory(),null,2)+'\n');
module.exports={pngFacts,inventory};
