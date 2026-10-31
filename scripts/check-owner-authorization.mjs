import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, stat, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { createHash } from 'node:crypto';
import { startOwnerAuthorization, saveRefreshToken, ownerSetupConfig } from './authorize-google-drive.mjs';
const scope='https://www.googleapis.com/auth/drive';
const temp=await mkdtemp(join(tmpdir(),'ebs-owner-oauth-'));
try {
  assert.throws(()=>ownerSetupConfig({}));
  const env={GOOGLE_OAUTH_CLIENT_ID:'id',GOOGLE_OAUTH_CLIENT_SECRET:'secret',GOOGLE_DRIVE_OWNER_EMAIL:' EBS@example.com '};
  assert.equal(ownerSetupConfig(env).ownerEmail,'ebs@example.com');
  function fake(mode='success') {
    let options,exchanges=0,saved=0;
    const client={
      generateCodeVerifierAsync:async()=>({codeVerifier:'verifier',codeChallenge:createHash('sha256').update('verifier').digest('base64url')}),
      generateAuthUrl:input=>{options=input;return 'https://accounts.google.com/authorize?'+new URLSearchParams({...input,scope:input.scope.join(' ')});},
      getToken:async input=>{exchanges++;assert.equal(input.codeVerifier,'verifier');if(mode==='exchange-error')throw Error('secret-client-secret');return {tokens:{access_token:'secret-access',refresh_token:mode==='no-refresh'?undefined:'secret-refresh',scope:mode==='scope'? 'openid':scope}};},
      setCredentials(){},getAccessToken:async()=>({token:'secret-access'}),
    };
    return {client,fetcher:async()=>Response.json({user:{emailAddress:mode==='owner'?'someone@example.com':'ebs@example.com'}}),save:async token=>{assert.equal(token,'secret-refresh');saved++;},options:()=>options,saved:()=>saved,exchanges:()=>exchanges};
  }
  const begin=async(f,extra={})=>startOwnerAuthorization({...ownerSetupConfig(env),port:0,timeoutMs:2000,clientFactory:()=>f.client,fetcher:f.fetcher,save:f.save,...extra});
  const success=fake();const session=await begin(success);
  const options=success.options();assert.equal(options.access_type,'offline');assert.equal(options.prompt,'consent');assert.equal(options.code_challenge_method,'S256');assert(options.state.length>=32);
  const response=await fetch(session.redirectUri+'?code=secret-code&state='+options.state);
  assert.equal(response.status,200);const output=await response.text();assert(!output.includes('secret-'));
  await session.completion;assert.equal(success.saved(),1);assert.equal(success.exchanges(),1);
  for(const mode of ['state','cancel','no-refresh','owner','scope','exchange-error','duplicate']){
    const f=fake(mode);const s=await begin(f);const o=f.options();
    const query= mode==='state'?'state=wrong&code=secret-code':mode==='cancel'?'state='+o.state+'&error=access_denied':mode==='duplicate'?'state='+o.state+'&code=a&code=b':'state='+o.state+'&code=secret-code';
    const r=await fetch(s.redirectUri+'?'+query);const body=await r.text();assert(!body.includes('secret-'),mode);
    await assert.rejects(s.completion,error=>!error.message.includes('secret-'),mode);assert.equal(f.saved(),0,mode);
  }
  const concurrent=fake();
  let releaseExchange,entered;
  const exchangeStarted=new Promise(resolve=>{entered=resolve;});
  const gate=new Promise(resolve=>{releaseExchange=resolve;});
  const originalExchange=concurrent.client.getToken;
  concurrent.client.getToken=async input=>{entered();await gate;return originalExchange(input);};
  const single=await begin(concurrent);const callback=single.redirectUri+'?state='+concurrent.options().state+'&code=first';
  const first=fetch(callback);await exchangeStarted;
  const second=await fetch(callback);assert.equal(second.status,409);
  releaseExchange();assert.equal((await first).status,200);await single.completion;
  assert.equal(concurrent.exchanges(),1);assert.equal(concurrent.saved(),1);
  const host=fake();const local=await begin(host);
  const badHost=await new Promise((resolve,reject)=>{
    const req=httpRequest(local.redirectUri+'?code=a&state='+host.options().state,{headers:{Host:'not-local.example'}},response=>{response.resume();response.once('end',()=>resolve(response.statusCode));});
    req.once('error',reject);req.end();
  });
  assert.equal(badHost,403);local.close();await assert.rejects(local.completion);assert.equal(host.saved(),0);
  const timed=fake();const timeout=await begin(timed,{timeoutMs:20});await assert.rejects(timeout.completion,/timed out/i);assert.equal(timed.saved(),0);
  const closed=fake();const c=await begin(closed);c.close();await assert.rejects(c.completion);assert.equal(closed.saved(),0);
  const file=join(temp,'.env.google-drive.local');await writeFile(file,'OTHER=value\nGOOGLE_OAUTH_CLIENT_ID=id\n');
  await saveRefreshToken(file,'saved-token');assert.equal((await stat(file)).mode&0o777,0o600);
  assert.equal(await readFile(file,'utf8'),'OTHER=value\nGOOGLE_OAUTH_CLIENT_ID=id\nGOOGLE_OAUTH_REFRESH_TOKEN="saved-token"\n');
  await saveRefreshToken(file,'updated-token');assert.equal((await readFile(file,'utf8')).match(/GOOGLE_OAUTH_REFRESH_TOKEN=/g).length,1);
  await symlink(file,join(temp,'link'));await assert.rejects(saveRefreshToken(join(temp,'link'),'token'));
  console.log('PASS: loopback owner consent, offline access/PKCE/state, owner/scope validation, cancellation/timeout, secret-free failures, and atomic private token storage.');
}finally{await rm(temp,{recursive:true,force:true});}
