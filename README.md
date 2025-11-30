# TweetPurge Sync

TweetPurge Sync, Twitter/X geçmişinizi temizlemenize yardımcı olan, yerel ağ üzerinde çalışan bir araçtır. Tinder benzeri bir mobil arayüz ile tweetlerinizi "Sakla" (Sağa Kaydır) veya "Sil" (Sola Kaydır) olarak işaretleyebilirsiniz.

## Özellikler

- **Yerel Ağ Senkronizasyonu:** Bilgisayarınızdaki Chrome eklentisi ile telefonunuzdaki mobil arayüz anlık olarak haberleşir.
- **Tinder Tarzı Arayüz:** Tweetleri hızlıca elemek için kaydırma mantığı.
- **Otomatik Silme:** Sola kaydırdığınız tweetler, Chrome eklentisi aracılığıyla tarayıcınızda otomatik olarak silinir.
- **Veri Güvenliği:** Tüm veriler yerel bilgisayarınızda (SQLite) tutulur, dışarıya veri gönderilmez.
- **Kaldığı Yerden Devam:** Uygulamayı kapatsanız bile kaldığınız yerden devam edebilirsiniz.

## Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- Google Chrome Tarayıcısı

### 1. Projeyi İndirin ve Bağımlılıkları Yükleyin

Terminali açın ve proje dizininde şu komutu çalıştırın:

```bash
npm install
```

### 2. Veritabanını Hazırlayın

Prisma ile SQLite veritabanını oluşturun:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Sunucuyu Başlatın

Uygulamayı yerel ağda erişilebilir şekilde başlatmak için:

```bash
npm run dev
```

Sunucu `http://0.0.0.0:3000` adresinde çalışmaya başlayacaktır.

## Kullanım

### Adım 1: Chrome Eklentisini Yükleyin

1. Google Chrome'u açın ve adres çubuğuna `chrome://extensions` yazın.
2. Sağ üst köşedeki **Geliştirici modu** (Developer mode) seçeneğini aktif hale getirin.
3. **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
4. Proje klasörünün içindeki `extension` klasörünü seçin.

### Adım 2: Mobil Uygulamayı Açın

1. Bilgisayarınızın yerel IP adresini bulun (Mac'te `ipconfig getifaddr en0`, Windows'ta `ipconfig`).
2. Telefonunuzun tarayıcısından `http://<BILGISAYAR_IP_ADRESI>:3000` adresine gidin.
3. Ekranda "Disconnected" (Kırmızı) yazısını göreceksiniz.

### Adım 3: Temizliğe Başlayın

1. Bilgisayarınızda Chrome üzerinden Twitter/X profilinize (veya Tweetler sekmesine) gidin.
2. Eklenti otomatik olarak tweetleri taramaya başlayacak ve telefonunuza gönderecektir.
3. Telefonunuzda beliren kartları:
   - **Sağa Kaydır:** Tweeti SAKLA (Veritabanına kaydedilir, silinmez).
   - **Sola Kaydır:** Tweeti SİL (Chrome eklentisine silme komutu gönderilir).

## Teknoloji Yığını

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Backend:** Node.js (Custom Server), Socket.io
- **Veritabanı:** SQLite, Prisma
- **Eklenti:** Chrome Extension Manifest V3

## Notlar

- Twitter arayüzü değiştikçe eklentinin DOM seçicilerinin güncellenmesi gerekebilir.
- Silme işlemi, bot algılamasını önlemek için küçük gecikmelerle yapılır.
