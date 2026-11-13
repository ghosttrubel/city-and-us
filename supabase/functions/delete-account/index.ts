// Server-only: deploy after auditing all Auth foreign-key deletion behavior.
const base=Deno.env.get('SUPABASE_URL')!;
const publicKey=Deno.env.get('SUPABASE_ANON_KEY')!;
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
Deno.serve(async(req:Request)=>{
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
 const reply=(status:number,message:string)=>new Response(JSON.stringify({message}),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply(405,'POST required');
 try{
  if((await req.json()).confirm!=='DELETE')return reply(400,'Explicit deletion confirmation required');
  const token=req.headers.get('Authorization');if(!token?.startsWith('Bearer '))return reply(401,'Sign in first');
  const userResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:publicKey,Authorization:token}});
  if(!userResponse.ok)return reply(401,'Session expired. Sign in again');
  const user=await userResponse.json();if(!user.id)return reply(401,'Invalid session');
  // The request body cannot choose the target identity. Admin key never enters the client.
  const removed=await fetch(base+'/auth/v1/admin/users/'+encodeURIComponent(user.id),{method:'DELETE',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({should_soft_delete:false})});
  if(!removed.ok)return reply(503,'Deletion was not completed. Retry or submit a deletion request.');
  return reply(200,'Account and linked data deleted');
 }catch{return reply(503,'Deletion could not be confirmed. Retry or use the request route.');}
});
