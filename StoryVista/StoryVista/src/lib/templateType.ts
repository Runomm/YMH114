// Sayfa düzeni şablonları için enum tanımı
enum TemplateType {
  CLASSIC = 'classic',     // Klasik düzen: görsel üstte metin altta
  VISUAL_TEXT = 'visualText', // Metin ve görsel yan yana
  PANORAMIC = 'panoramic',  // Tam sayfa genişliğinde panoramik görsel
  FULLPAGE = 'fullpage'    // Tam sayfa görsel
}

export default TemplateType; 