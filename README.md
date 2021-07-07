# Advanced Ticket Bot
> Bu Bot 07.07.2021 tarihinde Sude Alaçatı ([Github](https://github.com/sudis)) tarafından yazılmıştır. Herhangi bir kar amacı gütmeyen bu proje sunucularınızda üyelerinize etkili şekillerde ulaşmanızı sağlıyor. Adından da anlaşıldığı üzere Bilet Bot'u üyelerinizin sizlere daha kolay ulaşmasını sağlayacak sistemlerden birisidir. Bu projenin herhangi bir yerde parayla satışına izin verilmeyecek. 

> **Discord'un Ratelimit** kurallarına önem göstermeniz gerekiyor. Botu kullanırken art arda buton işlemleri **yapmayın**. Bunun sebebi butonlara her tıkladığınızda butonun kanal işlemi gerçekleştirmesi. Yani Butona bastığınız zaman `ticket-20` olarak açılan kanal tekrar butona basıldığında `ticket-claimed-20` olarak değişecek. Bu değişmeye kanalın içerik bölümü de dahil. Bundan dolayı her yapılan iki eylemden sonra zaman geçmeli ve buna göre hareket edilmeli. Buna uyulmazsa kanal adları ve diğer özellikler **Ratelimit** engelinden dolayı değişmeyecek ve problem yaratacak. 

***Bu bot MySQL veri tabanını kullanıyor. MongoDB'ye geçirin diye yapılmadı. Buna göre kullanın.***

## İçerik
- Başlamadan Önce
- MySQL Community Server'in Kurulumu
-- MySQL Nedir?
-- Neden MySQL?
- Dosya Düzenlemeleri
-- `config.js` dosyasının düzenlenmesi.
-- MySQL Veri tabanı kurulumu.
-- `tables.sql` dosyasının aktarılması
- Aktifleştirme
- Özellikler
- Bitiş

## Başlamadan Önce
> *Başlamadan önce bu bot GCommands Framework'unu kullanmakta. Normal DJS Handler'larından farklı olarak her yarattığınız komut birer `SLASH COMMAND` özelliği taşır. Bundan dolayı `OAuth/Scopes` bölümünden botu davet etmelisiniz.

![Scope ayarlanması.](https://cdn.discordapp.com/attachments/861924288118652958/862294514793316372/Zrzut_ekranu_2021-07-7_o_13.30.07.png)

Problemler devam ederse bota `Administrator` rolü vererek tekrar deneyin. Admin rolü gerekmese de bazen problem çıkabiliyor.

> Botun iki adet eğik çizgi komutu mevcut. Bunlardan birisi `/geri-bildirim` diğeri `/profil`. Bu iki komutun çalışma prensibi eğik çizgi olduğu için oluşmaları bir saate kadar zaman alabiliyor. Bundan dolayı dikkatli olun.

## MySQL Community Server'in Kurulumu

`•` Windows için: https://dev.mysql.com/downloads/file/?id=505213
`•` Mac için: https://dev.mysql.com/downloads/file/?id=505134

> Kurulum yaparken panik yapmanıza gerek yok. `Proje Bilgisayarı` olarak seçim yapın. Sadece `root` şifresini ayarlayın. Yine sadece `Community Server`'i kurun.

***MySQL nedir ve nasıl kurulur hakkında daha fazla bilgi almak için yazımı inceleyebilirsiniz.***
> https://github.com/sudis/mysql

## Dosya Düzenlemeleri

Config düzenlemeleri aşağıdaki gibi olacak. 

```
{

"bot":  {
"token":  "TOKEN_BURAYA",
"owners":  ["KURUCU_BURAYA"],
"testers":  ["TESTER_BURAYA"],
"guildID":  "SUNUCU_ID_BURAYA",
"voiceChannel":  "SES_KANALI_BURAYA",
"status":  "OYNUYOR_BURAYA"
},
"colors":  {
"panelEmbedColor":  "RENK_SEÇ",
"claimEmbedColor":  "RENK_SEÇ",
"welcomeEmbedColor":  "RENK_SEÇ"
},
"ticketSettings":  {
"rooms":  {
"panelChannel":  "KATEGORİ_SEÇ",
"ticketParent":  "KATEGORİ_SEÇ",
"archiveParent":  "KATEGORİ_SEÇ"
},
"auths":  {
"moderatorRole":  "ROL_SEÇ",
"generalDepartment":  "ROL_SEÇ",
"problemDepartment":  "ROL_SEÇ",
"suggestionDepartment":  "ROL_SEÇ"
},
"ticketFeelings":  {
"ticketStarting":  "EMOJİ_SEÇ",
"starEmoji":  "EMOJİ_SEÇ",
"generalHelpEmoji":  "EMOJİ_SEÇ",
"bugHelpEmoji":  "EMOJİ_SEÇ",
"suggestionHelpEmoji":  "EMOJİ_SEÇ",
"whatEmoji":  "EMOJİ_SEÇ",
"upvoteEmoji":  "EMOJİ_SEÇ",
"donwvoteEmoji":  "EMOJİ_SEÇ"
}
},
"mysql":  {
"database":  "DATABASE_ADI",
"host":  "HOST_ADI(localhost)",
"user":  "USER_ADI(root)",
"password":  "ŞİFRE"
}
}
```

MySQL'da bir veri tabanı oluşturmak için arama çubuğuna `MySQL Command Prompt` yazmanız yeterli. İlk çıkan sonuca girin. Sizden kendi oluşturmuş olduğunuz şifreyi isteyecek. Girdikten sonra `CREATE DATABASE TicketBot;` kodunu girin. Daha sonrasında `USE TicketBot;` kodunu girin.

Aşağıda verilmiş olan `TABLE`'ları bütün şekilde kopyalayıp yapıştırın ve `enter`'e basın.

```
CREATE  TABLE Tickets (
pid INT AUTO_INCREMENT PRIMARY  KEY  NOT  NULL,
member_id CHAR(18) NOT  NULL,
claimed_staff CHAR(18),
ticket_status ENUM('AÇIK','ARŞİVDE','KAPALI','SİLİNMİŞ') DEFAULT  'AÇIK'  NOT  NULL,
ticket_type ENUM('GENEL','HATALAR','ÖNERİLER'),
ticket_room CHAR(18),
ticket_transcript VARCHAR(255),
opening_timestamp CHAR(10) NOT  NULL,
opening_time DATETIME  DEFAULT (CURRENT_TIME) NOT  NULL
);
  

CREATE  TABLE TicketStats (
pid INT AUTO_INCREMENT UNIQUE  NOT  NULL,
member_id CHAR(18) PRIMARY  KEY  NOT  NULL,
clicked_buttons INT  DEFAULT  0  NOT  NULL,
opened_tickets INT  DEFAULT  0  NOT  NULL,
solved_tickets INT  DEFAULT  0  NOT  NULL,
unsolved_tickets INT  DEFAULT  0  NOT  NULL,
general_ask INT  DEFAULT  0  NOT  NULL,
problem_ask INT  DEFAULT  0  NOT  NULL,
suggestion_ask INT  DEFAULT  0  NOT  NULL
);
  

CREATE  TABLE Comments (
pid INT AUTO_INCREMENT UNIQUE  NOT  NULL,
staff_id CHAR(18) PRIMARY  KEY  NOT  NULL,
staff_solubility INT  DEFAULT  0  NOT  NULL,
staff_unsolubility INT  DEFAULT  0  NOT  NULL,
comment ENUM('Akıllı','Hızlı','Arkadaşça','Dalgacı','Bilgisiz','Kötü Hız','Belirtilmemiş') DEFAULT  'Belirtilmemiş'  NOT  NULL
);
``` 

MySQL bilginiz yoksa `TABLE` düzenlemesi yapmanızı önermem. MySQL hakkında bilgi almak için üstte yazdığım yazıyı incelemenizde fayda var.

## Aktifleştirme
> Üstteki adımları yerine getirdiyseniz botunuzun klasörünü Terrminal ile açın. Bu bot `yarn` kullandığı için `npm` işlemleri yapmayın. `yarn install` koduyla bütün modülleri indirin. `nodemon main` komutuyla botu çalıştırın. (Diğer türlü çalıştırmak isterseniz orası size kalmış.)

## Özellikler
> Bu botta bir çok özellik mevcut. En iyi şekilde üyelerinize ulaşmanız için eklenebilecek özellikleri ekledim. Özelliklerden bir kaçını tanıtmak gerekirse; 

### 1. Yenilikler
> Discord'un yeni sağlamış olduğu yenilikleri kullanıyoruz. 

![Yenlilikler](https://cdn.discordapp.com/attachments/861924288118652958/862299258908442654/Zrzut_ekranu_2021-07-7_o_13.49.12.png)

![Yenlilikler](https://cdn.discordapp.com/attachments/861924288118652958/862299528203206677/Zrzut_ekranu_2021-07-7_o_13.50.20.png)

### 2. Yetkili Kontrolleri
> Yetkililer biletleri devralabilirler.

![Yetkililer Biletleri Devralır](https://cdn.discordapp.com/attachments/861924288118652958/862299871054266378/Zrzut_ekranu_2021-07-7_o_13.51.42.png)

### 3. Gelişmiş Mesajlar
> Üyelerin kafalarının karışmaması için her şey mesajlarla yürütülür. Ana mesaj ve sistem mesajları olarak ikiye ayrılan sistemimizde, ana mesaj ilk kanal mesajı sayılır.

![Gelişmiş Mesajlar](https://cdn.discordapp.com/attachments/861924288118652958/862300188022013952/Zrzut_ekranu_2021-07-7_o_13.52.53.png)

### 4. Gelişmiş Kanal Açıklaması
> Mesajlardan da takip edebileceğiniz bilgileri kanal açıklamasında depolarız.

![enter image description here](https://cdn.discordapp.com/attachments/861924288118652958/862300501496561664/Zrzut_ekranu_2021-07-7_o_13.54.12.png)

### 5. Arşivleme Sistemi
> Biletleri sonra okumak için arşive kaldırabilirsiniz.

![enter image description here](https://cdn.discordapp.com/attachments/861924288118652958/862300846883340308/Zrzut_ekranu_2021-07-7_o_13.55.17.png)

### 6. Tekrar Açılan Biletler
> Biletleri tekrar açtığınızda tek tek kişileri çağırmak zorunda değilsiniz.

![enter image description here](https://cdn.discordapp.com/attachments/861924288118652958/862301321508290580/Zrzut_ekranu_2021-07-7_o_13.56.54.png)

### 7. Geribildirim Sistemi
> Bilet devraldıktan sonra etkinleşen `/geri-bildirim` komutu yetkililerin davranışlarından ne kadar memnun olup olmadığınıza göre değişiyor. Yetkiliden memnun değilseniz onu **gizlice** yani anonim bir şekilde oylama fırsatı sunuyor.

5, 4 ve 3. Yıldız iyi kategorisine girerken, 2 ve 1. Yıldız kötü kategorisine giriyor. Aynı zamanda açıklamada da bulunuyorsunuz.

![Puanlama](https://cdn.discordapp.com/attachments/861924288118652958/862301758322901012/Zrzut_ekranu_2021-07-7_o_13.58.20.png)

![Açıklama](https://cdn.discordapp.com/attachments/861924288118652958/862302051954589736/Zrzut_ekranu_2021-07-7_o_14.00.20.png)

![Anonimlik](https://cdn.discordapp.com/attachments/861924288118652958/862302959382822922/Zrzut_ekranu_2021-07-7_o_14.03.43.png)

### 8. Gelişmiş Profil Sistemi
> Yaptığınız bir çok şey anonimce kayıt altına alınıyor. Buna istatistikleriniz de dahil. Profil komutu sayesinde bir yetkiliyseniz ne kadar üyeye yardım ettiğinizi görebilir, bir üyeyseniz de ne kadar yardım aldığınızı sorgulayabilirsiniz.

![Profil](https://cdn.discordapp.com/attachments/861924288118652958/862302518004416533/Zrzut_ekranu_2021-07-7_o_14.02.11.png)

![Profil devamı](https://cdn.discordapp.com/attachments/861924288118652958/862302675977502740/Zrzut_ekranu_2021-07-7_o_14.02.50.png)

### 9. Güçlü MySQL Veritabanı
> Her şey elinizin altında. Bir çok kayıt `ENUM` ile yapıldığı için düzenleme yaparken çok basitçe düzenlemeler yapabileceksiniz.

![Veritabanı](https://cdn.discordapp.com/attachments/861924288118652958/862303337306652682/Zrzut_ekranu_2021-07-7_o_14.05.27.png)

### 10. Sadelik ve Basitlik
> Herkes bir bilet açabilir. Bileti hakkında her an tetikte kalabilir.

![Sadelik](https://cdn.discordapp.com/attachments/861924288118652958/862303564567281684/Zrzut_ekranu_2021-07-7_o_14.06.22.png)

## Bitiş
> Herhangi bir problem çıkarsa GCommands sürümünü güncelleyebilirsiniz. Dilerseniz `Serendia Squad`'a katılıp sorularınızı sorabilirsiniz.

![Serendia Squad](https://cdn.discordapp.com/attachments/814960684705513482/854475799335534592/standard.gif)

**Discord:** https://discord.gg/serendia
**GCommands Kılavuzu:** http://gcommands.js.org (*Ben çeviri yapıyorum.*)

**İyi kodlamalar!**

***Normalnie chciałem to zrobić moim polskim przyjaciołom. Ale nie mogłem tego zrobić. Proszę nie gniewaj się na mnie. Mój pierwszy projekt był na tym szczycie.*** 

