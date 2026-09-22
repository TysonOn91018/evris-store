import nodemailer from 'nodemailer';

// HTTPS transport for hosts that block SMTP. No credentials enter the browser.
export function gmailApiSender(env, request=fetch) {
  const required=['GMAIL_USER','GMAIL_CLIENT_ID','GMAIL_CLIENT_SECRET','GMAIL_REFRESH_TOKEN'];
  if(required.some(key=>!env[key])) throw new Error('Gmail API configuration incomplete');
  const composer=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'windows'});
  let token,expires=0;
  return async message=>{
    if(!token || Date.now()>=expires){
      const response=await request('https://oauth2.googleapis.com/token',{
        method:'POST',body:new URLSearchParams({grant_type:'refresh_token',client_id:env.GMAIL_CLIENT_ID,client_secret:env.GMAIL_CLIENT_SECRET,refresh_token:env.GMAIL_REFRESH_TOKEN}),signal:AbortSignal.timeout(15000)
      });
      if(!response.ok)throw new Error('Gmail authorization failed');
      const data=await response.json();
      if(!data.access_token)throw new Error('Gmail authorization failed');
      token=data.access_token;expires=Date.now()+Math.max(0,(Number(data.expires_in)||3600)-60)*1000;
    }
    const mime=await composer.sendMail({...message,from:env.GMAIL_USER});
    const response=await request(`https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(env.GMAIL_USER)}/messages/send`,{
      method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({raw:mime.message.toString('base64url')}),signal:AbortSignal.timeout(30000)
    });
    if(response.status===401){token=null;expires=0;}
    if(!response.ok)throw new Error('Gmail delivery failed');
    const data=await response.json();if(!data.id)throw new Error('Gmail delivery not confirmed');
    return {messageId:data.id};
  };
}
