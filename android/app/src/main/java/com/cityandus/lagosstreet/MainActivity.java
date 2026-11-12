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

/** Offline asset-only WebView. No INTERNET permission, remote pages or mic bridge. */
public class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> chooser;
 private String pendingExport;
 private static final int IMPORT=10, EXPORT=11;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
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
    if(!"https".equals(uri.getScheme())||!HOST.equals(uri.getHost())||path==null||!path.startsWith("/assets/")||path.contains(".."))return missing();
    try {String file=path.substring(8);String ext=file.substring(file.lastIndexOf('.')+1);String mime=switch(ext){case "js","mjs" -> "text/javascript";case "html" -> "text/html";case "css" -> "text/css";case "json" -> "application/json";case "glb" -> "model/gltf-binary";case "svg" -> "image/svg+xml";case "webp" -> "image/webp";case "png" -> "image/png";case "wav" -> "audio/wav";case "woff2" -> "font/woff2";default -> "application/octet-stream";};return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-cache"),getAssets().open(file));}catch(Exception e){return missing();}
   }
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);try{startActivityForResult(i,IMPORT);}catch(Exception e){chooser.onReceiveValue(null);chooser=null;}return true;}
   @Override public void onPermissionRequest(PermissionRequest request){request.deny();}
  });
  web.loadUrl("https://"+HOST+"/assets/index.html");
 }
 private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 public class SaveBridge {
  @JavascriptInterface public void exportSave(String json){if(json==null||json.length()>1000000)return;runOnUiThread(()->{if(pendingExport!=null)return;pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.setType("application/json");i.addCategory(Intent.CATEGORY_OPENABLE);i.putExtra(Intent.EXTRA_TITLE,"city-and-us-save.json");try{startActivityForResult(i,EXPORT);}catch(Exception e){pendingExport=null;}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==IMPORT&&chooser!=null){chooser.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);chooser=null;}if(request==EXPORT){if(result==RESULT_OK&&data!=null&&pendingExport!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){if(out!=null)out.write(pendingExport.getBytes(StandardCharsets.UTF_8));}catch(IOException e){new AlertDialog.Builder(this).setMessage("Save export failed. Your in-game story is unchanged.").setPositiveButton("OK",null).show();}}pendingExport=null;}}
 @Override protected void onPause(){web.evaluateJavascript("window.CityRuntime&&window.CityRuntime.setNativePaused(true)",null);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.CityRuntime&&window.CityRuntime.setNativePaused(false)",null);}}
 @Override public void onBackPressed(){new AlertDialog.Builder(this).setMessage("Leave City & Us? Your story stays on this device.").setPositiveButton("Leave",(d,w)->finish()).setNegativeButton("Keep playing",null).show();}
 @Override protected void onDestroy(){if(chooser!=null)chooser.onReceiveValue(null);web.removeJavascriptInterface("CityAndroid");web.destroy();super.onDestroy();}
}
