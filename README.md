# Tweet-Temizleme 🧹

> 🇹🇷 **Türkçe için aşağıya kaydırın / Scroll down for Turkish**

**Tweet-Temizleme** is a swipeable tweet deleter mobile app that helps you clean up your Twitter/X timeline. It connects to a browser extension on your PC to sync your tweets and lets you swipe left to delete or right to keep them.

![App Screenshot](https://via.placeholder.com/800x400?text=Tweet-Temizleme+Preview)

## ✨ Features

- **Swipe Interface**: Swipe left to delete, swipe right to keep.
- **Media Support**: View images and auto-play videos directly in the card.
- **Link Previews**: Native-style link cards for news and YouTube videos.
- **Real-time Sync**: Tweets are scraped from your browser and sent to your phone instantly.
- **Privacy Focused**: Data is stored locally on your machine (SQLite).

## 🚀 Getting Started (Simple Guide)

Even if you don't know how to code, you can run this app by following these steps carefully.

### Prerequisites

1.  **Install Node.js**: Download and install the "LTS" version from [nodejs.org](https://nodejs.org/).
2.  **Download Code**: Click the green **Code** button above and select **Download ZIP**. Extract the folder to your desktop.

### 1. Setup the Server

1.  Open the extracted folder (`tweet-temizleme`).
2.  Right-click anywhere inside the folder and select **Open in Terminal** (or Command Prompt).
3.  Type the following command and press Enter:
    ```bash
    npm install
    ```
4.  After it finishes, type this command and press Enter:
    ```bash
    npx prisma db push
    ```
5.  Finally, start the server by typing:
    ```bash
    npm run dev
    ```
    You should see a message saying `Ready on http://0.0.0.0:3000`. **Keep this window open!**

### 2. Setup the Extension

1.  Open Google Chrome (or Edge/Brave).
2.  Go to this address: `chrome://extensions`
3.  Turn on **Developer mode** (switch in the top right corner).
4.  Click the **Load unpacked** button (top left).
5.  Select the `extension` folder inside the `tweet-temizleme` folder you downloaded.

### 3. Connect Mobile App

1.  Find your computer's Local IP Address:
    - **Windows**: Open Command Prompt, type `ipconfig`, look for `IPv4 Address` (e.g., `192.168.1.15`).
    - **Mac**: Open System Settings > Wi-Fi > Details, look for IP Address.
2.  On your phone, make sure you are connected to the **same Wi-Fi** as your computer.
3.  Open your phone's browser (Safari/Chrome) and go to: `http://YOUR_IP_ADDRESS:3000` (replace `YOUR_IP_ADDRESS` with the number you found, e.g., `http://192.168.1.15:3000`).
4.  You should see the app with a "Connected" status.

### 4. Start Cleaning

1.  On your computer, go to your Twitter/X Profile page.
2.  Click the **Tweet-Temizleme** extension icon in your browser toolbar.
3.  Click **START**.
4.  Watch tweets appear on your phone and start swiping!

---

# 🇹🇷 Tweet-Temizleme (Türkçe)

**Tweet-Temizleme**, Twitter/X zaman tünelinizi temizlemenize yardımcı olan, kaydırmalı (swipe) bir tweet silme uygulamasıdır. Bilgisayarınızdaki bir tarayıcı eklentisine bağlanarak tweetlerinizi senkronize eder ve sola kaydırarak silmenize, sağa kaydırarak saklamanıza olanak tanır.

## ✨ Özellikler

- **Kaydırmalı Arayüz**: Silmek için sola, saklamak için sağa kaydırın.
- **Medya Desteği**: Resimleri ve videoları doğrudan kartın içinde görüntüleyin.
- **Bağlantı Önizlemeleri**: Haberler ve YouTube videoları için kart önizlemeleri.
- **Anlık Senkronizasyon**: Tweetler tarayıcınızdan çekilir ve anında telefonunuza gönderilir.
- **Gizlilik Odaklı**: Veriler tamamen kendi bilgisayarınızda saklanır.

## 🚀 Kurulum Rehberi (Yazılım Bilmeyenler İçin)

Kodlama bilmeseniz bile aşağıdaki adımları takiperek uygulamayı çalıştırabilirsiniz.

### Gereksinimler

1.  **Node.js İndirin**: [nodejs.org](https://nodejs.org/) adresinden "LTS" sürümünü indirip kurun.
2.  **Kodu İndirin**: Yukarıdaki yeşil **Code** butonuna tıklayın ve **Download ZIP** seçeneğini seçin. İndirdiğiniz klasörü masaüstüne çıkartın.

### 1. Sunucuyu Kurun

1.  Çıkardığınız klasörü (`tweet-temizleme`) açın.
2.  Klasörün içinde boş bir yere sağ tıklayın ve **Terminalde Aç** (veya Komut İstemi) seçeneğini seçin.
3.  Şu komutu yazın ve Enter'a basın:
    ```bash
    npm install
    ```
4.  İşlem bitince şu komutu yazın ve Enter'a basın:
    ```bash
    npx prisma db push
    ```
5.  Son olarak sunucuyu başlatmak için şunu yazın:
    ```bash
    npm run dev
    ```
    Ekranda `Ready on http://0.0.0.0:3000` yazısını görmelisiniz. **Bu pencereyi kapatmayın!**

### 2. Eklentiyi Kurun

1.  Google Chrome (veya Edge/Brave) tarayıcısını açın.
2.  Adres çubuğuna şunu yazın: `chrome://extensions`
3.  Sağ üst köşedeki **Geliştirici modu** (Developer mode) anahtarını açın.
4.  Sol üstteki **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
5.  İndirdiğiniz `tweet-temizleme` klasörünün içindeki `extension` klasörünü seçin.

### 3. Telefonu Bağlayın

1.  Bilgisayarınızın Yerel IP Adresini bulun:
    - **Windows**: Başlat menüsüne `cmd` yazıp açın, `ipconfig` yazın ve `IPv4 Address` karşısındaki numarayı not edin (örneğin: `192.168.1.15`).
    - **Mac**: Ayarlar > Wi-Fi > Ayrıntılar kısmından IP Adresine bakın.
2.  Telefonunuzun bilgisayarınızla **aynı Wi-Fi** ağına bağlı olduğundan emin olun.
3.  Telefonunuzun tarayıcısını açın ve şu adrese gidin: `http://IP_ADRESINIZ:3000` (örneğin: `http://192.168.1.15:3000`).
4.  Uygulamanın açıldığını ve "Connected" (Bağlandı) yazdığını görmelisiniz.

### 4. Temizliğe Başlayın

1.  Bilgisayarınızda Twitter/X Profil sayfanıza gidin.
2.  Tarayıcınızın sağ üst köşesindeki **Tweet-Temizleme** ikonuna tıklayın.
3.  **START** butonuna basın.
4.  Tweetlerin telefonunuza geldiğini göreceksiniz. Keyifli temizlikler!

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
