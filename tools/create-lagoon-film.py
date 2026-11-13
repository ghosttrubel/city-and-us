"""Optional existing-VLC encoder/decoder for the original sample; no install/download.
VLC_HOME may override the installed VLC directory. No game runtime dependency.
"""
import ctypes as C, os, sys, time, json
from pathlib import Path
vlcdir=os.environ.get('VLC_HOME',r'C:\Program Files\VideoLAN\VLC')
if hasattr(os,'add_dll_directory'): os.add_dll_directory(vlcdir)
os.environ['VLC_PLUGIN_PATH']=str(Path(vlcdir)/'plugins')
v=C.CDLL(str(Path(vlcdir)/('libvlc.dll' if os.name=='nt' else 'libvlc.so')))
ptr=C.c_void_p; string=C.c_char_p; integer=C.c_int
def bind(name,result,args):
 f=getattr(v,name);f.restype=result;f.argtypes=args;return f
new=bind('libvlc_new',ptr,[integer,C.POINTER(string)])
media=bind('libvlc_media_new_path',ptr,[ptr,string])
option=bind('libvlc_media_add_option',None,[ptr,string])
playernew=bind('libvlc_media_player_new_from_media',ptr,[ptr])
play=bind('libvlc_media_player_play',integer,[ptr])
state=bind('libvlc_media_player_get_state',integer,[ptr])
duration=bind('libvlc_media_player_get_length',C.c_longlong,[ptr])
stop=bind('libvlc_media_player_stop',None,[ptr])
args=[b'--ignore-config',b'--no-video-title-show',b'--no-media-library',b'--no-sout-display',b'--quiet']
if sys.argv[1]=='verify':args.extend([b'--no-audio',b'--avcodec-hw=none'])
inst=new(len(args),(string*len(args))(*args))
if not inst: raise RuntimeError('VLC could not initialize')
mode=sys.argv[1]
if mode=='encode':
 src,audio,dest=[Path(p).resolve() for p in sys.argv[2:5]]
 m=media(inst,str(src).encode());option(m,(':input-slave='+audio.as_uri()).encode())
 sout='#transcode{vcodec=h264,venc=x264{preset=veryfast,profile=baseline},vb=750,fps=24,acodec=mp4a,ab=64,channels=1,samplerate=22050}:std{access=file,mux=mp4,dst="'+str(dest)+'"}'
 option(m,(':sout='+sout).encode());option(m,b':no-sout-all')
 p=playernew(m)
 if play(p)!=0: raise RuntimeError('VLC could not start encoding')
 started=time.time()
 while time.time()-started<75:
  time.sleep(.2)
  if state(p) in (6,7):break
 terminal=state(p);length=duration(p);stop(p)
 print(json.dumps({'terminal_state':terminal,'duration_ms':length,'output_bytes':dest.stat().st_size if dest.exists() else 0}),flush=True)
 if terminal!=6: os._exit(1)
 os._exit(0)

if mode=='verify':
 import struct,hashlib
 src=Path(sys.argv[2]).resolve(); dest=Path(sys.argv[3]).resolve();dest.mkdir(parents=True,exist_ok=True)
 m=media(inst,str(src).encode());p=playernew(m)
 Lock=C.CFUNCTYPE(ptr,ptr,C.POINTER(ptr));Unlock=C.CFUNCTYPE(None,ptr,ptr,C.POINTER(ptr));Display=C.CFUNCTYPE(None,ptr,ptr)
 callbacks=bind('libvlc_video_set_callbacks',None,[ptr,Lock,Unlock,Display,ptr])
 fmt=bind('libvlc_video_set_format',None,[ptr,string,C.c_uint,C.c_uint,C.c_uint])
 gettime=bind('libvlc_media_player_get_time',C.c_longlong,[ptr])
 w,h=320,180;buffers={};serial=0;seen=0;samples=[];next_at=0;length=0
 @Lock
 def lock(opaque,planes):
  global serial
  serial+=1;frame=C.create_string_buffer(w*h*4);buffers[serial]=frame;planes[0]=C.addressof(frame);return serial
 @Unlock
 def unlock(opaque,picture,planes):pass
 @Display
 def display(opaque,picture):
  global seen,next_at
  frame=buffers.pop(picture,None)
  if frame is None:return
  seen+=1;t=gettime(p)
  if t>=next_at:
   filename='decoded-'+str(len(samples))+'.bmp'
   header=b'BM'+struct.pack('<IHHI',54+w*h*4,0,0,54)+struct.pack('<IiiHHIIiiII',40,w,-h,1,32,0,w*h*4,2835,2835,0,0)
   (dest/filename).write_bytes(header+frame.raw)
   samples.append({'timeMs':t,'file':filename,'sha256':hashlib.sha256(frame.raw).hexdigest()})
   next_at=t+5000
 callbacks(p,lock,unlock,display,None);fmt(p,b'RV32',w,h,w*4)
 if play(p)!=0:raise RuntimeError('Decode failed to start')
 started=time.time()
 while time.time()-started<40:
  time.sleep(.1);length=max(length,duration(p))
  if state(p) in (6,7):break
 terminal=state(p);stop(p)
 result={'durationMs':length,'decodedFrames':seen,'terminalState':terminal,'samples':samples,'method':'Actual local VLC software decoding into video memory; not browser/device acceptance'}
 (dest/'decode.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result),flush=True)
 os._exit(0 if terminal==6 and seen>300 and len(samples)>2 else 1)

raise RuntimeError('Unknown mode')
