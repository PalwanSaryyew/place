// utils/apply-theme.ts

/**
 * Telegram Mini Uygulama tema parametrelerinin tür tanımı
 * Eksik veya null olabilecek tüm potansiyel alanları içerir
 */
export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
  // Diğer potansiyel alanlar
  [key: string]: string | undefined;
}


/**
 * Telegram renklerini Shadcn/Tailwind CSS değişkenleri ile eşleştirme
 * Mevcut tema değişkenlerinize göre bir eşleştirme önerisidir.
 * Bu eşleştirmeyi projenizin ihtiyacına göre ayarlayabilirsiniz.
 * * NOT: Telegram renkleri genellikle light/dark mod ayrımı yapmaz, 
 * bu yüzden onları doğrudan `:root`'a (veya light temaya) uygulayacağız 
 * ve `.dark` sınıfının üzerine yazılmasını sağlayacağız.
 */
const TELEGRAM_TO_SHADCN_MAP: { [key in keyof TelegramThemeParams]?: string } = {
  // Arkaplan Renkleri
  bg_color: 'background', // Ana arkaplan
  text_color: 'foreground', // Ana metin rengi
  button_color: 'primary', // Buton arkaplanı (primary'e eşlenebilir)
  button_text_color: 'primary-foreground', // Buton metin rengi (primary-foreground'a eşlenebilir)
  secondary_bg_color: 'secondary', // İkincil arkaplan (Card, Muted vb. için kullanılabilir)
  section_header_text_color: 'secondary-foreground', // Bölüm başlığı metni
  header_bg_color: 'popover', // Header arkaplanı (Pop-over, Card vb. için kullanılabilir)
  accent_text_color: 'popover-foreground', // Vurgu rengi (Genellikle ana etkileşimler)
  
  // Metin Renkleri
  section_bg_color: 'card', // Bölüm arkaplanı
  
  // Vurgu ve Etkileşim Renkleri
  subtitle_text_color: 'accent', // Alt başlık metni
  hint_color: 'muted', // İpucu/Placeholder metin rengi
  link_color: 'ring', // Bağlantı rengi (primary'e eşlenebilir)
  destructive_text_color: 'destructive', // Tehlike metin rengi


  // Buton Renkleri

  // Tehlike/Hata Renkleri
};


/**
 * Telegram tema renklerini alarak CSS değişkenlerini günceller.
 * @param themeParams - Telegram'dan gelen tema parametreleri
 */
export function applyTelegramTheme(themeParams: TelegramThemeParams) {
  const root = document.documentElement;

  for (const [tgKey, cssVarName] of Object.entries(TELEGRAM_TO_SHADCN_MAP)) {
    const telegramColor = themeParams[tgKey];

    if (telegramColor) {
      // CSS değişkeni formatı: --<isim>
      const cssVariableName = `--${cssVarName}`;

      // Shadcn/Tailwind'de, Tailwind renk yardımcılarının doğru çalışması için
      // CSS değişkenine sadece rengin kendisi (örn. #RRGGBB) atanmalıdır.
      
      // NOT: Mevcut OKLCH formatınız, Tailwind'in `oklch(var(--<isim>))` 
      // şeklinde kullanımıyla uyumlu olabilir. Ancak Telegram'dan gelen 
      // hex kodları doğrudan atarsak, Tailwind'in bunu okuyabilmesi için 
      // ya Tailwind config dosyasını ayarlamalıyız ya da direkt `rgb` veya `hsl` 
      // (veya hex) kullanmalıyız.
      
      // En basit ve en uyumlu çözüm, hex kodunu doğrudan atamaktır.
      // Bu, mevcut oklch değerlerinizi geçersiz kılacaktır, ki bu da istediğimiz şey.
      root.style.setProperty(cssVariableName, telegramColor);
      
      // Bazı renklerin -foreground karşılıkları da var. Örneğin:
      // primary: button_color
      // primary-foreground: button_text_color
      if (tgKey === 'button_color' && themeParams.button_text_color) {
         root.style.setProperty('--primary-foreground', themeParams.button_text_color);
      }
      
      // NOT: Eğer Telegram'da Dark modu varsa, `WebApp.colorScheme` kontrol edilerek
      // `.dark` sınıfına da özel atama yapılabilir. Şimdilik `:root` üzerine yazıyoruz.
    }
  }
}