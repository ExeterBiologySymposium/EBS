import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
  const {createOwnerOAuthClient,createOAuthDriveRequest}=await vite.ssrLoadModule('/server/drive/oauth.ts');
  const {driveConfiguration}=await vite.ssrLoadModule('/server/drive/config.ts');
  const values={EBS_DRIVE_ENABLED:'true',EBS_DRIVE_DATABASE_URL:'postgresql://unused',GOOGLE_OAUTH_CLIENT_ID:'client.apps.googleusercontent.com',GOOGLE_OAUTH_CLIENT_SECRET:'client-secret',GOOGLE_OAUTH_REFRESH_TOKEN:'refresh-secret',GOOGLE_DRIVE_OWNER_EMAIL:' EBS@example.com ',EBS_DRIVE_STAFF_EMAILS:'staff@example.com',CLERK_ACCEPTED_ORG_ID:'accepted',VERCEL_ENV:'production'};
  assert.equal(driveConfiguration(values).ownerEmail,'ebs@example.com');
  for(const key of ['GOOGLE_OAUTH_CLIENT_ID','GOOGLE_OAUTH_CLIENT_SECRET','GOOGLE_OAUTH_REFRESH_TOKEN','GOOGLE_DRIVE_OWNER_EMAIL','EBS_DRIVE_DATABASE_URL'])assert.throws(()=>driveConfiguration({...values,[key]:''}));
  assert.throws(()=>driveConfiguration({...values,VERCEL_ENV:'preview'}));
  const configured=driveConfiguration({...values,VERCEL_ENV:'preview',EBS_DRIVE_PARENT_ID:'test-parent',EBS_DRIVE_TEMPLATE_ID:'test-template'});
  assert.equal(configured.namespace,'accepted:test-parent:test-template');
  const client=createOwnerOAuthClient(configured);
  assert.equal(client.credentials.refresh_token,'refresh-secret');
  let refreshes=0;
  client.transporter.request=async options=>{
    assert.equal(String(options.url),'https://oauth2.googleapis.com/token');
    assert.equal(options.data.get('grant_type'),'refresh_token');
    assert.equal(options.data.get('refresh_token'),'refresh-secret');
    refreshes++;
    return {data:{access_token:'library-refreshed',expires_in:3600}};
  };
  assert.equal((await client.getAccessToken()).token,'library-refreshed');
  assert.equal((await client.getAccessToken()).token,'library-refreshed');
  assert.equal(refreshes,1,'library should cache an unexpired token');
  client.credentials.expiry_date=Date.now()-1000;
  await client.getAccessToken();assert.equal(refreshes,2,'expired tokens should refresh');
  let tokens=0,requests=0;
  const fakeClient={getAccessToken:async()=>({token:'access-'+(++tokens)})};
  const request=createOAuthDriveRequest(fakeClient,async(url,options)=>{
    requests++;assert.equal(options.headers.Authorization,'Bearer access-'+tokens);assert.equal(options.redirect,'error');
    assert(url.startsWith('https://www.googleapis.com/drive/v3/'));
    return Response.json({id:'doc'});
  });
  assert.deepEqual(await request('files/doc'),{id:'doc'});
  assert.deepEqual(await request('files/template/copy','POST',{parents:['fixed-parent']}),{id:'doc'});
  assert.equal(tokens,2);assert.equal(requests,2);
  let writes=0;
  const fail=createOAuthDriveRequest(fakeClient,async()=>{writes++;return new Response('secret-upstream-body',{status:503});});
  await assert.rejects(fail('files/template/copy','POST',{}),error=>!error.message.includes('secret-upstream'));
  assert.equal(writes,1,'must not retry an uncertain Docs copy');
  const revoked=createOAuthDriveRequest({getAccessToken:async()=>{throw Error('revoked refresh-secret');}},async()=>{throw Error('must not call Drive');});
  await assert.rejects(revoked('files/doc'),error=>!error.message.includes('refresh-secret'));
  console.log('PASS: owner OAuth configuration, refresh credentials, token acquisition, exact resource namespace, preview isolation, sanitized revocation, and no mutation retries.');
}finally{await vite.close();}
