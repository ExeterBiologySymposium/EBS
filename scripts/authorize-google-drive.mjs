import { OAuth2Client } from 'google-auth-library';
import { createServer } from 'node:http';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { lstat, open, readFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ownerDriveScope = 'https://www.googleapis.com/auth/drive';
export const ownerCallbackUri = 'http://127.0.0.1:53682/oauth/callback';
export function ownerSetupConfig(env) {
  const clientId=env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret=env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const ownerEmail=env.GOOGLE_DRIVE_OWNER_EMAIL?.trim().toLowerCase();
  if(!clientId||!clientSecret||!ownerEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))throw Error('Set the OAuth client ID, client secret, and expected EBS owner email in .env.google-drive.local.');
  return {clientId,clientSecret,ownerEmail};
}
export async function saveRefreshToken(path, token) {
  if(!/^[\w./+=-]+$/.test(token))throw Error('Invalid refresh token format.');
  let original='';
  try {
    const info=await lstat(path);
    if(!info.isFile()||info.isSymbolicLink())throw Error('Credentials destination must be a regular file.');
    original=await readFile(path,'utf8');
  } catch(error) {if(error.code!=='ENOENT')throw error;}
  const line='GOOGLE_OAUTH_REFRESH_TOKEN='+JSON.stringify(token);
  const lines=original.split(/\r?\n/).filter(value=>!/^\s*(?:export\s+)?GOOGLE_OAUTH_REFRESH_TOKEN\s*=/.test(value));
  while(lines.at(-1)==='')lines.pop();
  const content=[...lines,line,''].join('\n');
  const temporary=path+'.'+randomUUID()+'.tmp';
  let handle;
  try {
    handle=await open(temporary,'wx',0o600);await handle.writeFile(content);await handle.sync();await handle.close();handle=null;
    // Avoid overwriting a concurrent manual edit or a newly inserted symlink.
    let current='';
    try {const info=await lstat(path);if(!info.isFile()||info.isSymbolicLink())throw Error('Credentials destination changed.');current=await readFile(path,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
    if(current!==original)throw Error('Credentials file changed during setup; run again.');
    await rename(temporary,path);
  } finally {await handle?.close();await unlink(temporary).catch(()=>{});}
}
export async function startOwnerAuthorization({clientId,clientSecret,ownerEmail,port=53682,timeoutMs=300_000,clientFactory=options=>new OAuth2Client(options),fetcher=fetch,save=token=>saveRefreshToken(resolve('.env.google-drive.local'),token)}) {
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))throw Error('Expected EBS owner email is required.');
  let finish,fail;
  const completion=new Promise((resolve,reject)=>{finish=resolve;fail=reject;});
  completion.catch(()=>{});
  let finished=false,claimed=false,timer,client,redirectUri;
  const state=randomBytes(32).toString('base64url');
  let codeVerifier;
  const stop=error=>{
    if(finished)return;
    finished=true;clearTimeout(timer);server.close();
    if(error)fail(error);else finish();
  };
  const server=createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','text/plain; charset=utf-8');res.setHeader('Connection','close');res.setHeader('Content-Security-Policy',"default-src 'none'");
    const reply=(status,message)=>{res.statusCode=status;res.end(message);};
    if(!redirectUri||req.headers.host!==new URL(redirectUri).host){reply(403,'Invalid callback host.');return;}
    let url;
    try{url=new URL(req.url,redirectUri);}catch{reply(400,'Invalid callback URL.');return;}
    if(url.pathname!=='/oauth/callback'){reply(404,'Not found.');return;}
    if(req.method!=='GET'){reply(405,'GET required.');return;}
    if(claimed||finished){reply(409,'This authorization callback was already used.');return;}
    claimed=true;
    try {
      const returnedState=url.searchParams.get('state')||'';
      if(url.searchParams.getAll('state').length!==1||returnedState.length!==state.length||!timingSafeEqual(Buffer.from(returnedState),Buffer.from(state)))throw Error('Invalid authorization state.');
      if(url.searchParams.has('error'))throw Error('Authorization was cancelled or denied.');
      if(url.searchParams.getAll('code').length!==1||!url.searchParams.get('code'))throw Error('A single authorization code is required.');
      const {tokens}=await client.getToken({code:url.searchParams.get('code'),codeVerifier,redirect_uri:redirectUri});
      if(!tokens.refresh_token)throw Error('No refresh token returned; authorize again with consent.');
      client.setCredentials(tokens);
      const accessToken=(await client.getAccessToken()).token;
      if(!accessToken)throw Error('Google authorization could not be verified.');
      const scopes=tokens.scope?.split(' ')||(await client.getTokenInfo(accessToken)).scopes;
      if(!scopes.includes(ownerDriveScope))throw Error('Required Drive permission was not granted.');
      const response=await fetcher('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',{headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(15_000),redirect:'error'});
      if(!response.ok)throw Error('Could not verify the Google owner.');
      const identity=await response.json();
      if(identity.user?.emailAddress?.toLowerCase()!==ownerEmail.toLowerCase())throw Error('The authorized Google account does not match the configured EBS owner.');
      if(finished)return reply(410,'Authorization expired. Run setup again.');
      await save(tokens.refresh_token);
      if(finished)return reply(410,'Setup expired; check the local credentials file before retrying.');
      reply(200,'EBS owner authorization saved locally. You can close this tab and return to the terminal.');stop();
    }catch{
      // Provider errors may contain authorization codes, tokens, or client secrets.
      reply(400,'Authorization did not complete. Confirm the EBS owner account, consent, client settings, and required Drive permission, then run setup again.');
      stop(Error('Owner authorization failed. Confirm the owner account, OAuth configuration, and full Drive permission; then run again.'));
    }
  });
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
    server.on('error',()=>stop(Error('Local authorization listener failed.')));
    redirectUri=`http://127.0.0.1:${server.address().port}/oauth/callback`;
    client=clientFactory({clientId,clientSecret,redirectUri,transporterOptions:{timeout:15_000}});
    const proof=await client.generateCodeVerifierAsync();codeVerifier=proof.codeVerifier;
    const url=client.generateAuthUrl({access_type:'offline',prompt:'consent',scope:[ownerDriveScope],state,login_hint:ownerEmail,code_challenge:proof.codeChallenge,code_challenge_method:'S256'});
    timer=setTimeout(()=>stop(Error('Owner authorization timed out. Run setup again.')),timeoutMs);
    return {url,redirectUri,completion,close:()=>stop(Error('Owner authorization cancelled.'))};
  }catch{server.close();throw Error('Could not start owner authorization. Check local port 53682 and OAuth settings.');}
}
async function main() {
  let session;
  const cancel=()=>session?.close();
  try {
    const config=ownerSetupConfig(process.env);
    session=await startOwnerAuthorization(config);
    process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
    console.log('Open this Google consent link in your normal browser and authorize the personal EBS owner account:');
    console.log(session.url);
    await session.completion;
    console.log('Saved GOOGLE_OAUTH_REFRESH_TOKEN in .env.google-drive.local (owner-readable only).');
    console.log('Add its value to the server-only Vercel variable of the same name. No Google files or permissions were changed.');
  } catch(error) {
    const safe=error.message?.startsWith('Set the OAuth')?error.message:'Owner authorization did not complete. Check the owner email, OAuth client, registered callback, consent, or local port, then run again.';
    console.error(safe);process.exitCode=1;
  }finally{process.removeListener('SIGINT',cancel);process.removeListener('SIGTERM',cancel);session?.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
