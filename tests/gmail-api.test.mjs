import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gmailApiSender} from '../server/gmail-api.mjs';
const env={GMAIL_USER:'sender@example.com',GMAIL_CLIENT_ID:'test-client',GMAIL_CLIENT_SECRET:'test-secret',GMAIL_REFRESH_TOKEN:'test-refresh'};
test('Gmail API refreshes authorization and sends UTF-8 MIME over HTTPS with cached token',async()=>{
 const calls=[];
 const send=gmailApiSender(env,async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.includes('oauth2')?{access_token:'test-access',expires_in:3600}:{id:'receipt-id'}};});
 const message={to:'customer@example.com',subject:'測試確認',text:'商品 × 2',messageId:'<order@example.com>'};
 assert.deepEqual(await send(message),{messageId:'receipt-id'});await send(message);
 assert.equal(calls.length,3);assert.equal(calls[0].options.body.get('grant_type'),'refresh_token');
 const request=calls[1];assert.equal(request.options.headers.Authorization,'Bearer test-access');
 assert.match(request.url,/https:\/\/gmail.googleapis.com/);
 const mime=Buffer.from(JSON.parse(request.options.body).raw,'base64url').toString();
 assert.match(mime,/To: customer@example.com/);assert.match(mime,/From: sender@example.com/);assert.match(mime,/charset=utf-8/i);
});
test('Gmail API errors cannot mark mail sent or expose provider credentials',async()=>{
 const send=gmailApiSender(env,async()=>({ok:false,status:400}));
 await assert.rejects(send({}),{message:'Gmail authorization failed'});
 assert.throws(()=>gmailApiSender({}),/configuration incomplete/);
});
