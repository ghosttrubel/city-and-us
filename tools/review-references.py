# Optional reference-only CPU decoder. Requires installed VLC and Python; no game dependency.
# Usage: python tools/review-references.py clip.mp4 output-directory [width height]
# Produces timestamped BMPs and frames.json. Audio is disabled.
import ctypes as C, os, sys, time, json, struct
from pathlib import Path
vlcdir = r'C:\Program Files\VideoLAN\VLC'
os.add_dll_directory(vlcdir)
os.environ['VLC_PLUGIN_PATH'] = vlcdir + r'\plugins'
v = C.CDLL(vlcdir + r'\libvlc.dll')
def bind(name, result, args):
 f=getattr(v,name); f.restype=result; f.argtypes=args; return f
ptr=C.c_void_p; string=C.c_char_p; integer=C.c_int
new=bind('libvlc_new',ptr,[integer,C.POINTER(string)])
media=bind('libvlc_media_new_path',ptr,[ptr,string]); playernew=bind('libvlc_media_player_new_from_media',ptr,[ptr])
play=bind('libvlc_media_player_play',integer,[ptr]); gettime=bind('libvlc_media_player_get_time',C.c_longlong,[ptr]); getlength=bind('libvlc_media_player_get_length',C.c_longlong,[ptr]); getstate=bind('libvlc_media_player_get_state',integer,[ptr]); rate=bind('libvlc_media_player_set_rate',integer,[ptr,C.c_float])
stop=bind('libvlc_media_player_stop',None,[ptr]); release=bind('libvlc_media_player_release',None,[ptr]); mrelease=bind('libvlc_media_release',None,[ptr]); vrelease=bind('libvlc_release',None,[ptr])
Lock=C.CFUNCTYPE(ptr,ptr,C.POINTER(ptr)); Unlock=C.CFUNCTYPE(None,ptr,ptr,C.POINTER(ptr)); Display=C.CFUNCTYPE(None,ptr,ptr)
callbacks=bind('libvlc_video_set_callbacks',None,[ptr,Lock,Unlock,Display,ptr]); fmt=bind('libvlc_video_set_format',None,[ptr,string,C.c_uint,C.c_uint,C.c_uint])
args=[b'--ignore-config',b'--no-audio',b'--avcodec-hw=none',b'--no-video-title-show',b'--no-plugins-cache',b'--no-media-library',b'--quiet',b'--no-drop-late-frames',b'--no-skip-frames']
inst=new(len(args),(string*len(args))(*args)); print('instance',bool(inst),flush=True)
if not inst: sys.exit(1)
clip=Path(sys.argv[1]).resolve(); out=Path(sys.argv[2]).resolve(); out.mkdir(parents=True,exist_ok=True)
m=media(inst,str(clip).encode('utf-8')); p=playernew(m)
w,h=(int(sys.argv[3]),int(sys.argv[4])) if len(sys.argv)>4 else (420,746); buffer=C.create_string_buffer(w*h*4); captures=[]; last=-10000; seen=0; buffers={}; serial=0
@Lock
def lock(opaque,planes):
 global serial
 serial+=1; frame=C.create_string_buffer(w*h*4); buffers[serial]=frame; planes[0]=C.addressof(frame); return serial
@Unlock
def unlock(opaque,picture,planes): pass
@Display
def display(opaque,picture):
 global last,seen,buffer
 buffer=buffers.pop(picture,buffer)
 seen+=1; t=gettime(p)
 if t>=0 and t-last>=3000:
  name='at-%09d.bmp'%t
  header=b'BM'+struct.pack('<IHHI',54+w*h*4,0,0,54)+struct.pack('<IiiHHIIiiII',40,w,-h,1,32,0,w*h*4,2835,2835,0,0)
  (out/name).write_bytes(header+buffer.raw); captures.append({'milliseconds':t,'file':name});last=t
callbacks(p,lock,unlock,display,None);fmt(p,b'RV32',w,h,w*4)
print('play',play(p),flush=True);rate(p,1)
started=time.time(); length=0; laststate=0
while time.time()-started<210:
 time.sleep(.2); length=max(length,getlength(p)); state=getstate(p)
 if state in (6,7): break
 if time.time()-started>25 and seen==0: break
t=gettime(p)
if seen and t>=0 and t>last:
 name='at-%09d.bmp'%t; header=b'BM'+struct.pack('<IHHI',54+w*h*4,0,0,54)+struct.pack('<IiiHHIIiiII',40,w,-h,1,32,0,w*h*4,2835,2835,0,0); (out/name).write_bytes(header+buffer.raw); captures.append({'milliseconds':t,'file':name})
(out/'frames.json').write_text(json.dumps({'clip':str(clip),'method':'libVLC CPU video memory callbacks; no audio','duration_ms':length,'decoded_frames':seen,'captures':captures,'terminal_state':state},indent=2))
print(json.dumps({'length':length,'seen':seen,'captures':len(captures),'state':state}),flush=True)
os._exit(0)
