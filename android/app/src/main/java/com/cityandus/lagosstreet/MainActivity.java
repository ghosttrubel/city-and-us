package com.cityandus.lagosstreet;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.webkit.*;
import android.view.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

/** Local asset WebView; authentication opens only in the external browser. */
public class MainActivity extends Activity {
 private WebView web;
 private View fullscreenVideo;
 private WebChromeClient.CustomViewCallback videoCallback;
 private ValueCallback<Uri[]> chooser;
 private String pendingExport;
 private String pendingAuthReturn;
 private static final String AUTH_HOST="yhervptejlpgallfinro.supabase.co";
 private static final int IMPORT=10, EXPORT=11;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  acceptAuthIntent(getIntent());
  web=new WebView(this);setContentView(web);
  web.setBackgroundColor(0xff173d34);
  web.setOnApplyWindowInsetsListener((v,insets)->{if(Build.VERSION.SDK_INT>=30){android.graphics.Insets safe=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());v.setPadding(safe.left,safe.top,safe.right,safe.bottom);}else{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());}return insets;});
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(false);settings.setSupportMultipleWindows(false);
  WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
  web.addJavascriptInterface(new SaveBridge(),"CityAndroid");
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){Uri u=request.getUrl();return !"https".equals(u.getScheme())||!HOST.equals(u.getHost())||!u.getPath().startsWith("/assets/");}
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();String path=uri.getPath();
    if("https".equals(uri.getScheme())&&(AUTH_HOST.equals(uri.getHost())||approvedMediaHost(uri.getHost())))return null;
    if(!"https".equals(uri.getScheme())||!HOST.equals(uri.getHost())||path==null||!path.startsWith("/assets/")||path.contains(".."))return missing();
    try {String file=path.substring(8);if(file.endsWith(".mp4"))return videoAsset(file,request);String ext=file.substring(file.lastIndexOf('.')+1);String mime=switch(ext){case "js","mjs" -> "text/javascript";case "html" -> "text/html";case "css" -> "text/css";case "json" -> "application/json";case "glb" -> "model/gltf-binary";case "svg" -> "image/svg+xml";case "webp" -> "image/webp";case "png" -> "image/png";case "wav" -> "audio/wav";case "woff2" -> "font/woff2";default -> "application/octet-stream";};return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-cache"),getAssets().open(file));}catch(Exception e){return missing();}
   }
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onShowCustomView(View view,CustomViewCallback callback){if(fullscreenVideo!=null){callback.onCustomViewHidden();return;}fullscreenVideo=view;videoCallback=callback;getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);web.setVisibility(View.GONE);((ViewGroup)getWindow().getDecorView()).addView(view,new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT));view.requestFocus();}
   @Override public void onHideCustomView(){hideVideo();}

   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);try{startActivityForResult(i,IMPORT);}catch(Exception e){chooser.onReceiveValue(null);chooser=null;}return true;}
   @Override public void onPermissionRequest(PermissionRequest request){request.deny();}
  });
  web.loadUrl("https://"+HOST+"/assets/index.html");
 }
 private boolean approvedMediaHost(String host){if(host==null)return false;for(String allowed:getResources().getStringArray(R.array.movie_stream_hosts))if(host.equalsIgnoreCase(allowed))return true;return false;}
 private void hideVideo(){if(fullscreenVideo==null)return;((ViewGroup)getWindow().getDecorView()).removeView(fullscreenVideo);fullscreenVideo=null;web.setVisibility(View.VISIBLE);getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);WebChromeClient.CustomViewCallback cb=videoCallback;videoCallback=null;if(cb!=null)cb.onCustomViewHidden();}
 private WebResourceResponse videoAsset(String file,WebResourceRequest request)throws IOException{
  InputStream input=getAssets().open(file);long total=input.available(),start=0,end=total-1;String range=null;
  for(java.util.Map.Entry<String,String> entry:request.getRequestHeaders().entrySet())if("Range".equalsIgnoreCase(entry.getKey()))range=entry.getValue();
  java.util.Map<String,String> headers=new java.util.HashMap<>();headers.put("Accept-Ranges","bytes");headers.put("Cache-Control","no-cache");
  if(range!=null){
   try{if(!range.matches("bytes=\\d*-\\d*"))throw new IllegalArgumentException();String[] parts=range.substring(6).split("-",-1);if(parts[0].isEmpty()){long suffix=Long.parseLong(parts[1]);if(suffix<=0)throw new IllegalArgumentException();start=Math.max(0,total-suffix);}else{start=Long.parseLong(parts[0]);if(!parts[1].isEmpty())end=Math.min(end,Long.parseLong(parts[1]));}if(start>end||start>=total)throw new IllegalArgumentException();}
   catch(Exception e){input.close();headers.put("Content-Range","bytes */"+total);return new WebResourceResponse("video/mp4",null,416,"Range Not Satisfiable",headers,new ByteArrayInputStream(new byte[0]));}
   long skipped=0;while(skipped<start){long n=input.skip(start-skipped);if(n<=0){input.close();throw new IOException("Cannot seek video");}skipped+=n;}headers.put("Content-Range","bytes "+start+"-"+end+"/"+total);
  }
  final long length=end-start+1;headers.put("Content-Length",Long.toString(length));
  InputStream limited=new FilterInputStream(input){long remaining=length;@Override public int read()throws IOException{if(remaining<=0)return -1;int value=super.read();if(value>=0)remaining--;return value;}@Override public int read(byte[] b,int off,int len)throws IOException{if(remaining<=0)return -1;int n=in.read(b,off,(int)Math.min(len,remaining));if(n>0)remaining-=n;return n;}};
  return new WebResourceResponse("video/mp4",null,range==null?200:206,range==null?"OK":"Partial Content",headers,limited);
 }
 private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 private boolean validReturn(Uri u){return u!=null&&"com.cityandus.lagosstreet".equals(u.getScheme())&&"auth".equals(u.getHost())&&"/callback".equals(u.getPath());}
 private void acceptAuthIntent(Intent intent){Uri u=intent==null?null:intent.getData();if(validReturn(u))pendingAuthReturn=u.toString();}
 @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);acceptAuthIntent(intent);if(web!=null&&pendingAuthReturn!=null){String value=pendingAuthReturn;web.evaluateJavascript("typeof window.cityAuthReturn==='function'",result->{if("true".equals(result)){pendingAuthReturn=null;web.evaluateJavascript("window.cityAuthReturn("+org.json.JSONObject.quote(value)+")",null);}});}}
 public class SaveBridge {
  @JavascriptInterface public synchronized String takeAuthReturn(){String value=pendingAuthReturn;pendingAuthReturn=null;return value;}
  @JavascriptInterface public void openAuth(String value){Uri u=Uri.parse(value);if(!"https".equals(u.getScheme())||!AUTH_HOST.equals(u.getHost())||!"/auth/v1/authorize".equals(u.getPath()))return;runOnUiThread(()->{try{startActivity(new Intent(Intent.ACTION_VIEW,u).addCategory(Intent.CATEGORY_BROWSABLE));}catch(Exception e){new AlertDialog.Builder(MainActivity.this).setMessage("No browser is available for Google sign-in.").setPositiveButton("OK",null).show();}});}

  @JavascriptInterface public void exportSave(String json){if(json==null||json.length()>1000000)return;runOnUiThread(()->{if(pendingExport!=null)return;pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.setType("application/json");i.addCategory(Intent.CATEGORY_OPENABLE);i.putExtra(Intent.EXTRA_TITLE,"city-and-us-save.json");try{startActivityForResult(i,EXPORT);}catch(Exception e){pendingExport=null;}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==IMPORT&&chooser!=null){chooser.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);chooser=null;}if(request==EXPORT){if(result==RESULT_OK&&data!=null&&pendingExport!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){if(out!=null)out.write(pendingExport.getBytes(StandardCharsets.UTF_8));}catch(IOException e){new AlertDialog.Builder(this).setMessage("Save export failed. Your in-game story is unchanged.").setPositiveButton("OK",null).show();}}pendingExport=null;}}
 @Override protected void onPause(){web.evaluateJavascript("window.CityRuntime&&window.CityRuntime.setNativePaused(true)",null);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.CityRuntime&&window.CityRuntime.setNativePaused(false)",null);}}
 @Override public void onBackPressed(){if(fullscreenVideo!=null){hideVideo();return;}new AlertDialog.Builder(this).setMessage("Leave City & Us? Your story stays on this device.").setPositiveButton("Leave",(d,w)->finish()).setNegativeButton("Keep playing",null).show();}
 @Override protected void onDestroy(){hideVideo();if(chooser!=null)chooser.onReceiveValue(null);web.removeJavascriptInterface("CityAndroid");web.destroy();super.onDestroy();}
}
