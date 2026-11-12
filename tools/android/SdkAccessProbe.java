import java.nio.file.*;
import java.nio.file.attribute.*;
import java.util.*;
import java.util.zip.*;
public class SdkAccessProbe {
 interface Operation { void run() throws Exception; }
 static int failures=0;
 static void check(String label, Operation op) { try {op.run();System.out.println(label+": PASS");} catch(Exception e){failures++;System.out.println(label+": "+e); e.printStackTrace(System.out);} }
 public static void main(String[] args) throws Exception {
 System.out.println("Java "+System.getProperty("java.version"));
 for(String arg: args) {Path p=Path.of(arg);System.out.println("Path: "+p);
 for(Path a=p.getRoot(); a!=null; ) { final Path current=a; check("ancestor realPath "+a,()->current.toRealPath()); int count=a.getNameCount(); if(a.equals(a.getRoot()))count=0; if(count>=p.getNameCount())break; a=a.resolve(p.getName(count)); }
 check("attributes",()->Files.readAttributes(p,BasicFileAttributes.class));
 check("read",()->{try(var in=Files.newInputStream(p)){if(in.readNBytes(4).length!=4)throw new Exception("short read");}});
 check("realPath",()->System.out.println("Resolved: "+p.toRealPath()));
 check("ZipFile open/close",()->{try(var z=new ZipFile(p.toFile())){System.out.println("Zip entries: "+z.size());}});
 check("ZipFS open/close",()->{try(var z=FileSystems.newFileSystem(p,Map.of())){Files.readAttributes(z.getPath("/"),BasicFileAttributes.class);}});
 } if(failures>0)System.exit(1);
 }
}
