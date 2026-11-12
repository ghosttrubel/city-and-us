import java.nio.file.*;
import java.security.*;
import java.security.cert.Certificate;
import java.util.*;
import java.util.jar.*;

// Read-only validation: no key generation, exports, password printing or writes.
class SigningCheck {
 static final String ALIAS = "city-and-us-upload";
 public static void main(String[] args) {
  char[] password = null;
  try {
   String secret = System.getenv("CITY_KEY_PASSWORD"), path = System.getenv("CITY_KEYSTORE");
   if (secret == null || path == null) throw new Exception();
   password = secret.toCharArray(); secret = null;
   KeyStore store = KeyStore.getInstance("PKCS12");
   try (var input = Files.newInputStream(Path.of(path))) { store.load(input, password); }
   if (!store.isKeyEntry(ALIAS) || !(store.getKey(ALIAS, password) instanceof PrivateKey)) throw new Exception();
   Certificate expected = store.getCertificate(ALIAS);
   String fingerprint = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(expected.getEncoded()));
   int signed = 0;
   if (args.length > 0) {
    try (JarFile bundle = new JarFile(args[0], true)) {
     byte[] buffer = new byte[32768];
     for (JarEntry entry : Collections.list(bundle.entries())) {
      if (entry.isDirectory()) continue;
      try (var input = bundle.getInputStream(entry)) { while (input.read(buffer) != -1) {} }
      String name = entry.getName().toUpperCase(Locale.ROOT);
      if (name.equals("META-INF/MANIFEST.MF") || name.matches("META-INF/[^/]+\\.(SF|RSA|DSA|EC)") || name.startsWith("META-INF/SIG-")) continue;
      CodeSigner[] signers = entry.getCodeSigners();
      if (signers == null || signers.length != 1 || !expected.equals(signers[0].getSignerCertPath().getCertificates().get(0))) throw new Exception();
      signed++;
     }
    }
    if (signed == 0) throw new Exception();
   }
   System.out.println("{\"alias\":\"" + ALIAS + "\",\"certificateSHA256\":\"" + fingerprint + "\",\"signedEntries\":" + signed + "}");
  } catch (Exception failure) {
   System.err.println("Signing validation failed: password/key/alias unavailable or bundle not fully signed by the retained upload key.");
   System.exit(2);
  } finally { if (password != null) Arrays.fill(password, '\0'); }
 }
}
