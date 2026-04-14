const mineflayer = require('mineflayer');
const fs = require('fs');

// --- AYARLAR ---
const ayarlar = {
    host: 'mergensmp.aternos.me',
    version: '1.21.5', // Sunucu sürümünü buradan kontrol et
    sifre: 'Mergen123',
    botSayisi: 3,
    prefix: 'MergenBot_'
};

const DB_FILE = './database.json';

// JSON dosyasını oku veya oluştur
function getDb() {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '{}');
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Kayıt durumunu güncelle
function setRegistered(username) {
    const db = getDb();
    db[username] = true;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function botYarat(isim, sira) {
    setTimeout(() => {
        const bot = mineflayer.createBot({
            host: ayarlar.host,
            username: isim,
            version: ayarlar.version
        });

        bot.on('spawn', () => {
            const db = getDb();
            const isRegistered = db[isim] || false;

            console.log(`[+] ${isim} oyunda. Durum: ${isRegistered ? 'Kayıtlı' : 'Yeni Kayıt'}`);

            setTimeout(() => {
                if (!isRegistered) {
                    // EĞER İLK KEZ GİRİYORSA (FALSE)
                    bot.chat(`/register ${ayarlar.sifre} ${ayarlar.sifre}`);
                    setRegistered(isim); // Hafızaya al
                    console.log(`[!] ${isim} ilk kaydını yaptı.`);
                } else {
                    // EĞER DAHA ÖNCE KAYIT OLDUYSA (TRUE)
                    bot.chat(`/login ${ayarlar.sifre}`);
                    console.log(`[!] ${isim} hafızadan login yaptı.`);
                }
            }, 3000);

            // 5 DAKİKADA BİR ZIPLAMA (Anti-AFK)
            setInterval(() => {
                if (bot.entity) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                    console.log(`[AFK] ${isim} taze tutuldu.`);
                }
            }, 300000); // 300.000ms = 5 dk
        });

        bot.on('error', (err) => console.log(`[HATA] ${isim}: ${err.message}`));
        bot.on('kicked', (reason) => console.log(`[-] ${isim} atıldı.`));

    }, sira * 5000); // Aternos için 5 saniye aralık daha güvenli
}

// Botları Döngüyle Başlat
for (let i = 1; i <= ayarlar.botSayisi; i++) {
    botYarat(`${ayarlar.prefix}${i}`, i);
}