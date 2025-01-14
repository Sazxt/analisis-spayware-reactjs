# Analisis Malware: Stealer & Spyware Multi-Platform

**Peringatan:** Repositori ini berisi kode malware yang dianalisis untuk tujuan pendidikan dan penelitian keamanan siber.  **Jangan jalankan kode ini** di sistem manapun yang tidak ingin Anda kompromikan.  Kode ini sangat berbahaya dan dapat mengakibatkan pencurian data dan kerusakan sistem.

**Deskripsi:**

Repositori ini berisi analisis kode malware yang ditulis dalam JavaScript dan dirancang untuk berjalan di berbagai platform (Windows, macOS, dan Linux). Malware ini menunjukkan karakteristik *spyware* dan *stealer*, yang berarti ia mengumpulkan informasi sensitif dari sistem yang terinfeksi dan mengirimkannya ke server remote.

**Fungsionalitas Malware:**

* **Pengumpulan Informasi Sistem:** Mengumpulkan informasi detail tentang sistem yang terinfeksi, termasuk hostname, platform, direktori home user, dan direktori sementara.
* **Pencurian Data Browser:** Menargetkan berbagai browser populer (Chrome, Brave, Opera, dan Edge) untuk mencuri:
    * Riwayat penjelajahan
    * Cookies
    * Kredensial login yang disimpan
    * Data ekstensi browser (menargetkan ekstensi spesifik dengan ID yang di-hardcode)
* **Pencurian Data Dompet Cryptocurrency:** Mencari dan mencuri data dari dompet Exodus.
* **Pencurian Keychain (macOS):** Di macOS, malware ini mencoba mencuri data dari keychain login, yang mungkin berisi password dan sertifikat.
* **Pengunggahan Data ke Server C2:** Semua data yang dicuri diunggah ke server command-and-control (C2) yang terletak di `http://185.153.182.241:1224`.
* **Download dan Eksekusi Payload:** Malware mengunduh dan menjalankan payload tambahan dari server C2. Payload ini kemungkinan berisi malware lebih lanjut atau instruksi untuk aktivitas berbahaya lainnya.  Payload dieksekusi menggunakan interpreter Python yang ada di sistem atau diunduh jika belum ada.
* **Anti-Debugging:** Mengimplementasikan teknik anti-debugging dasar untuk menghindari analisis oleh peneliti keamanan.
* **Persistensi:** Dijadwalkan untuk dijalankan secara berkala, memastikan bahwa ia tetap aktif dan terus mengumpulkan data.

**Tujuan Analisis:**

Tujuan dari analisis ini adalah untuk memahami fungsionalitas malware, mengidentifikasi teknik yang digunakan, dan memberikan informasi untuk upaya mitigasi dan deteksi.

**Temuan Kunci:**

* Malware ini sangat canggih dan dirancang untuk mencuri berbagai jenis data sensitif.
* Vektor infeksi yang tepat tidak diketahui dari analisis kode statis ini, tetapi kemungkinan disebarkan melalui metode seperti phishing, unduhan drive-by, atau perangkat lunak yang dibundel.
* Server C2 (`http://185.153.182.241:1224`) memainkan peran penting dalam operasi malware dan harus diblokir oleh firewall dan solusi keamanan.
* Kehadiran payload tambahan menunjukkan bahwa malware ini dapat memiliki kemampuan di luar apa yang diamati dalam analisis kode awal.

**Rekomendasi:**

* **Jangan jalankan kode ini.**
* Selalu perbarui perangkat lunak dan sistem operasi Anda.
* Gunakan solusi antivirus dan anti-malware yang andal.
* Berhati-hatilah saat membuka lampiran email atau mengklik tautan dari sumber yang tidak tepercaya.
* Laporkan aktivitas yang mencurigakan ke otoritas yang berwenang.


**Disclaimer:**

Informasi yang diberikan dalam repositori ini hanya untuk tujuan pendidikan dan penelitian.  Penulis tidak bertanggung jawab atas penyalahgunaan informasi ini.


## Extension browser
```
data = [
    {"Extension ID": "nkbihfbeogaeaoehlefnkodbefgpgknn", "Extension Name": "MetaMask"},
    {"Extension ID": "ejbalbakoplchlghecdalmeeeajnimhm", "Extension Name": "Grammarly for Chrome"},
    {"Extension ID": "fhbohimaelbohpjbbldcngcnapndodjp", "Extension Name": "LastPass: Free Password Manager"},
    {"Extension ID": "ibnejdfjmmkpcnlpebklmnkoeoihofec", "Extension Name": "Bitwarden - Free Password Manager"},
    {"Extension ID": "bfnaelmomeimhlpmgjnjophhpkkoljpa", "Extension Name": "Honey - Automatic Coupons & Cash Back"},
    {"Extension ID": "aeachknmefphepccionboohckonoeemg", "Extension Name": "Google Keep Chrome Extension"},
    {"Extension ID": "hifafgmccdpekplomjjkcfgodnhcellj", "Extension Name": "Zoom Scheduler"},
    {"Extension ID": "jblndlipeogpafnldhgmapagcccfchpi", "Extension Name": "Save to Pocket"},
    {"Extension ID": "acmacodkjbdgmoleebolmdjonilkdbch", "Extension Name": "Web Clipper - Evernote"},
    {"Extension ID": "dlcobpjiigpikoobohmabehhmhfoodbb", "Extension Name": "DuckDuckGo Privacy Essentials"},
    {"Extension ID": "mcohilncbfahbmgdjkbpemcciiolgcge", "Extension Name": "Google Translate"},
    {"Extension ID": "agoakfejjabomempkjlepdflaleeobhb", "Extension Name": "Dashlane Free Password Manager"},
    {"Extension ID": "omaabbefbmiijedngplfjmnooppbclkk", "Extension Name": "Adblock Plus - free ad blocker"},
    {"Extension ID": "aholpfdialjgjfhomihkjbmgjidlcdno", "Extension Name": "Dark Reader"},
    {"Extension ID": "nphplpgoakhhjchkkhmiggakijnkhfnd", "Extension Name": "uBlock Origin"},
    {"Extension ID": "penjlddjkjgpnkllboccdgccekpkcbin", "Extension Name": "Tampermonkey"},
    {"Extension ID": "lgmpcpglpngdoalbgeoldeajfclnhafa", "Extension Name": "Momentum"},
    {"Extension ID": "fldfpgipfncgndfolcbkdeeknbbbnhcc", "Extension Name": "Stylus"},
    {"Extension ID": "bhhhlbepdkbapadjdnnojkbgioiodbic", "Extension Name": "Pushbullet"},
    {"Extension ID": "gjnckgkfmgmibbkoficdidcljeaaaheg", "Extension Name": "Checker Plus for Gmail"},
    {"Extension ID": "afbcbjpbpfadlkmhmclhkeeodmamcflc", "Extension Name": "HTTPS Everywhere"},
]
```


## Flow
```
+--------------------------------------+
| Start Program                        |
+--------------------------------------+
           |
           v
+-----------------------------+
| Get System Information      |
| - Hostname                  |
| - Platform                  |
| - Home Directory            |
| - Temporary Directory       |
+-----------------------------+
           |
           v
+-----------------------------+
| Define Helper Functions     |
| - resolvePath()             |
| - canAccessFile()           |
+-----------------------------+
           |
           v
+--------------------------------+
| Define Browser Paths &         |
| Extension IDs                  |
+--------------------------------+
           |
           v
+--------------------------------+
| Define Functions for Data      |
| Extraction & File Upload       |
| - uploadFiles()                |
| - getBrowserData()             |
| - getLoginData()               |
| - getExtensionFiles()          |
| - getKeychainData()            |
| - getExodusWalletData()        |
+--------------------------------+
           |
           v
+--------------------------------+
| Define Payload Download &      |
| Execution Logic                |
| - downloadAndExtractPayload()  |
| - scheduleNextDownload()       |
| - extractPayload()             |
| - runPayload()                 |
+--------------------------------+
           |
           v
+--------------------------------------+
| Main Function                        |
| - Get Current Timestamp              |
| - Extract Data from Chrome, Brave,   |
|   Opera, Edge, and Exodus Wallet     |
| - Execute Payload                    |
+--------------------------------------+
           |
           v
+-----------------------------+
| Schedule Periodic Execution |
| Every 5 minutes, up to 2    |
| iterations                  |
+-----------------------------+
           |
           v
+--------------------------------------+
| Anti-debugging placeholder (inactive)|
+--------------------------------------+
           |
           v
+--------------------------------------+
| End Program                          |
+--------------------------------------+

```

