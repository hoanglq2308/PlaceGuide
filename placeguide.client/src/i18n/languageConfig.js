export const DEFAULT_LANGUAGE = 'vi';

export const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI', speechLocale: 'vi-VN' },
  { code: 'en', label: 'English', shortLabel: 'EN', speechLocale: 'en-US' },
  { code: 'zh-CN', label: '中文（简体）', shortLabel: '简中', speechLocale: 'zh-CN' },
  { code: 'zh-TW', label: '中文（繁體）', shortLabel: '繁中', speechLocale: 'zh-TW' },
  { code: 'ko', label: '한국어', shortLabel: 'KO', speechLocale: 'ko-KR' },
  { code: 'ja', label: '日本語', shortLabel: 'JA', speechLocale: 'ja-JP' },
  { code: 'th', label: 'ไทย', shortLabel: 'TH', speechLocale: 'th-TH' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', speechLocale: 'fr-FR' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', speechLocale: 'ru-RU' }
];

const LANGUAGE_CODES = new Set(LANGUAGE_OPTIONS.map((language) => language.code));

const UI_TEXT = {
  vi: {
    explore: 'Khám phá', map: 'Bản đồ', bookmarks: 'Đã lưu', history: 'Lịch sử',
    login: 'Đăng nhập', logout: 'Đăng xuất', title: 'Khám Phá Hương Vị',
    titleHighlight: 'Việt Nam', subtitle: 'Tìm quán ăn gần bạn và nghe thuyết minh bằng ngôn ngữ phù hợp.',
    currentLocation: 'Vị trí hiện tại:', useLocation: 'Dùng vị trí của tôi', gettingLocation: 'Đang lấy vị trí...',
    search: 'Tìm món hoặc quán ăn...', viewMap: 'Xem bản đồ', distance: 'Khoảng cách',
    price: 'Giá:', all: 'Tất cả', cheap: 'Giá rẻ', medium: 'Trung bình', high: 'Cao',
    openNow: 'Đang mở cửa', vegetarian: 'Món chay', nonSpicy: 'Không cay', allergy: 'Dị ứng',
    nearby: 'Quán ăn nổi bật gần bạn', viewAll: 'Xem tất cả', show: 'Hiển thị', restaurants: 'quán',
    previous: 'Trước', next: 'Sau', listen: 'Nghe thuyết minh', highlights: 'Món nổi bật:', noReviews: 'Chưa có đánh giá'
  },
  en: {
    explore: 'Explore', map: 'Map', bookmarks: 'Saved', history: 'History',
    login: 'Log in', logout: 'Log out', title: 'Discover the Flavors of',
    titleHighlight: 'Vietnam', subtitle: 'Find restaurants near you and listen to guides in your language.',
    currentLocation: 'Current location:', useLocation: 'Use my location', gettingLocation: 'Getting location...',
    search: 'Search dishes or restaurants...', viewMap: 'View map', distance: 'Distance',
    price: 'Price:', all: 'All', cheap: 'Budget', medium: 'Mid-range', high: 'Premium',
    openNow: 'Open now', vegetarian: 'Vegetarian', nonSpicy: 'Not spicy', allergy: 'Allergy',
    nearby: 'Featured restaurants near you', viewAll: 'View all', show: 'Showing', restaurants: 'restaurants',
    previous: 'Previous', next: 'Next', listen: 'Listen to guide', highlights: 'Highlights:', noReviews: 'No reviews yet'
  },
  'zh-CN': {
    explore: '探索', map: '地图', bookmarks: '收藏', history: '历史记录', login: '登录', logout: '退出登录',
    title: '探索', titleHighlight: '越南风味', subtitle: '寻找附近餐厅，并用适合您的语言聆听讲解。',
    currentLocation: '当前位置：', useLocation: '使用我的位置', gettingLocation: '正在获取位置...',
    search: '搜索菜品或餐厅...', viewMap: '查看地图', distance: '距离', price: '价格：',
    all: '全部', cheap: '经济', medium: '中等', high: '高档', openNow: '正在营业',
    vegetarian: '素食', nonSpicy: '不辣', allergy: '过敏信息', nearby: '附近推荐餐厅', viewAll: '查看全部',
    show: '显示', restaurants: '家餐厅', previous: '上一页', next: '下一页', listen: '收听讲解',
    highlights: '招牌菜：', noReviews: '暂无评价'
  },
  'zh-TW': {
    explore: '探索', map: '地圖', bookmarks: '收藏', history: '歷史紀錄', login: '登入', logout: '登出',
    title: '探索', titleHighlight: '越南風味', subtitle: '尋找附近餐廳，並用適合您的語言聆聽導覽。',
    currentLocation: '目前位置：', useLocation: '使用我的位置', gettingLocation: '正在取得位置...',
    search: '搜尋菜色或餐廳...', viewMap: '查看地圖', distance: '距離', price: '價格：',
    all: '全部', cheap: '平價', medium: '中等', high: '高級', openNow: '營業中',
    vegetarian: '素食', nonSpicy: '不辣', allergy: '過敏資訊', nearby: '附近推薦餐廳', viewAll: '查看全部',
    show: '顯示', restaurants: '家餐廳', previous: '上一頁', next: '下一頁', listen: '聆聽導覽',
    highlights: '推薦菜色：', noReviews: '尚無評價'
  },
  ko: {
    explore: '둘러보기', map: '지도', bookmarks: '저장됨', history: '기록', login: '로그인', logout: '로그아웃',
    title: '베트남의 맛을', titleHighlight: '발견하세요', subtitle: '가까운 식당을 찾고 원하는 언어로 안내를 들어 보세요.',
    currentLocation: '현재 위치:', useLocation: '내 위치 사용', gettingLocation: '위치를 가져오는 중...',
    search: '음식 또는 식당 검색...', viewMap: '지도 보기', distance: '거리', price: '가격:',
    all: '전체', cheap: '저렴한', medium: '보통', high: '고급', openNow: '영업 중',
    vegetarian: '채식', nonSpicy: '맵지 않음', allergy: '알레르기', nearby: '내 주변 추천 식당', viewAll: '전체 보기',
    show: '표시', restaurants: '개 식당', previous: '이전', next: '다음', listen: '안내 듣기',
    highlights: '대표 메뉴:', noReviews: '아직 리뷰가 없습니다'
  },
  ja: {
    explore: '探す', map: '地図', bookmarks: '保存済み', history: '履歴', login: 'ログイン', logout: 'ログアウト',
    title: 'ベトナムの味を', titleHighlight: '見つけよう', subtitle: '近くのレストランを探し、お好みの言語でガイドを聞けます。',
    currentLocation: '現在地:', useLocation: '現在地を使う', gettingLocation: '位置情報を取得中...',
    search: '料理またはレストランを検索...', viewMap: '地図を見る', distance: '距離', price: '価格:',
    all: 'すべて', cheap: 'お手頃', medium: '標準', high: '高級', openNow: '営業中',
    vegetarian: 'ベジタリアン', nonSpicy: '辛くない', allergy: 'アレルギー', nearby: '近くのおすすめレストラン', viewAll: 'すべて見る',
    show: '表示', restaurants: '軒のレストラン', previous: '前へ', next: '次へ', listen: 'ガイドを聞く',
    highlights: 'おすすめ料理:', noReviews: 'まだレビューはありません'
  },
  th: {
    explore: 'สำรวจ', map: 'แผนที่', bookmarks: 'บันทึกแล้ว', history: 'ประวัติ', login: 'เข้าสู่ระบบ', logout: 'ออกจากระบบ',
    title: 'ค้นหารสชาติ', titleHighlight: 'เวียดนาม', subtitle: 'ค้นหาร้านอาหารใกล้คุณและฟังคำบรรยายในภาษาที่เหมาะกับคุณ',
    currentLocation: 'ตำแหน่งปัจจุบัน:', useLocation: 'ใช้ตำแหน่งของฉัน', gettingLocation: 'กำลังรับตำแหน่ง...',
    search: 'ค้นหาอาหารหรือร้านอาหาร...', viewMap: 'ดูแผนที่', distance: 'ระยะทาง', price: 'ราคา:',
    all: 'ทั้งหมด', cheap: 'ประหยัด', medium: 'ปานกลาง', high: 'พรีเมียม', openNow: 'เปิดอยู่',
    vegetarian: 'มังสวิรัติ', nonSpicy: 'ไม่เผ็ด', allergy: 'สารก่อภูมิแพ้', nearby: 'ร้านอาหารแนะนำใกล้คุณ', viewAll: 'ดูทั้งหมด',
    show: 'แสดง', restaurants: 'ร้าน', previous: 'ก่อนหน้า', next: 'ถัดไป', listen: 'ฟังคำบรรยาย',
    highlights: 'เมนูเด่น:', noReviews: 'ยังไม่มีรีวิว'
  },
  fr: {
    explore: 'Découvrir', map: 'Carte', bookmarks: 'Enregistrés', history: 'Historique', login: 'Connexion', logout: 'Déconnexion',
    title: 'Découvrez les saveurs du', titleHighlight: 'Vietnam', subtitle: 'Trouvez des restaurants près de vous et écoutez les guides dans votre langue.',
    currentLocation: 'Position actuelle :', useLocation: 'Utiliser ma position', gettingLocation: 'Recherche de la position...',
    search: 'Rechercher un plat ou un restaurant...', viewMap: 'Voir la carte', distance: 'Distance', price: 'Prix :',
    all: 'Tous', cheap: 'Économique', medium: 'Moyen', high: 'Haut de gamme', openNow: 'Ouvert',
    vegetarian: 'Végétarien', nonSpicy: 'Non épicé', allergy: 'Allergènes', nearby: 'Restaurants recommandés près de vous', viewAll: 'Voir tout',
    show: 'Affichage', restaurants: 'restaurants', previous: 'Précédent', next: 'Suivant', listen: 'Écouter le guide',
    highlights: 'À découvrir :', noReviews: 'Pas encore d’avis'
  },
  ru: {
    explore: 'Обзор', map: 'Карта', bookmarks: 'Сохранённое', history: 'История', login: 'Войти', logout: 'Выйти',
    title: 'Откройте вкусы', titleHighlight: 'Вьетнама', subtitle: 'Находите рестораны рядом и слушайте гид на удобном языке.',
    currentLocation: 'Текущее местоположение:', useLocation: 'Использовать моё местоположение', gettingLocation: 'Определение местоположения...',
    search: 'Поиск блюд или ресторанов...', viewMap: 'Открыть карту', distance: 'Расстояние', price: 'Цена:',
    all: 'Все', cheap: 'Недорого', medium: 'Средний', high: 'Премиум', openNow: 'Открыто',
    vegetarian: 'Вегетарианское', nonSpicy: 'Неострое', allergy: 'Аллергены', nearby: 'Рекомендуемые рестораны рядом', viewAll: 'Смотреть все',
    show: 'Показано', restaurants: 'ресторанов', previous: 'Назад', next: 'Далее', listen: 'Слушать гид',
    highlights: 'Рекомендуем:', noReviews: 'Отзывов пока нет'
  }
};

export function isSupportedLanguage(language) {
  return LANGUAGE_CODES.has(language);
}

export function getSpeechLocale(language) {
  return (
    LANGUAGE_OPTIONS.find((item) => item.code === language)?.speechLocale ||
    'en-US'
  );
}

export function getLocalizedText(values, language, fallback = '') {
  if (!values || typeof values !== 'object') {
    return fallback;
  }

  return values[language] || values.en || values.vi || fallback;
}

export function getUiText(language, key) {
  return UI_TEXT[language]?.[key] || UI_TEXT.en[key] || key;
}
