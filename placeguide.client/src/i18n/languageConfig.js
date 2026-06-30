export const DEFAULT_LANGUAGE = 'vi';

export const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI', speechLocale: 'vi-VN' },
  { code: 'en', label: 'English', shortLabel: 'EN', speechLocale: 'en-US' },
  { code: 'zh-CN', label: '中文（简体）', shortLabel: '简中', speechLocale: 'zh-CN' },
  { code: 'zh-TW', label: '中文（繁體）', shortLabel: '繁中', speechLocale: 'zh-TW' },
  { code: 'ko', label: '한국어', shortLabel: 'KO', speechLocale: 'ko-KR' },
  { code: 'ja', label: '日本語', shortLabel: 'JA', speechLocale: 'ja-JP' },
  { code: 'th', label: 'ไทย', shortLabel: 'TH', speechLocale: 'th-TH' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID', speechLocale: 'id-ID' },
  { code: 'ms', label: 'Bahasa Melayu', shortLabel: 'MS', speechLocale: 'ms-MY' },
  { code: 'tl', label: 'Tagalog', shortLabel: 'TL', speechLocale: 'tl-PH' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE', speechLocale: 'de-DE' },
  { code: 'es', label: 'Español', shortLabel: 'ES', speechLocale: 'es-ES' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'HI', speechLocale: 'hi-IN' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', speechLocale: 'fr-FR' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', speechLocale: 'ru-RU' }
];

const LANGUAGE_CODES = new Set(LANGUAGE_OPTIONS.map((language) => language.code));

const LANGUAGE_NAME_FALLBACKS = {
  vi: {
    vi: 'Tiếng Việt',
    en: 'Tiếng Anh',
    'zh-CN': 'Tiếng Trung giản thể',
    'zh-TW': 'Tiếng Trung phồn thể',
    ko: 'Tiếng Hàn',
    ja: 'Tiếng Nhật',
    th: 'Tiếng Thái',
    id: 'Tiếng Indonesia',
    ms: 'Tiếng Mã Lai',
    tl: 'Tiếng Tagalog',
    de: 'Tiếng Đức',
    es: 'Tiếng Tây Ban Nha',
    hi: 'Tiếng Hindi',
    fr: 'Tiếng Pháp',
    ru: 'Tiếng Nga'
  },
  en: {
    vi: 'Vietnamese',
    en: 'English',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    ko: 'Korean',
    ja: 'Japanese',
    th: 'Thai',
    id: 'Indonesian',
    ms: 'Malay',
    tl: 'Tagalog',
    de: 'German',
    es: 'Spanish',
    hi: 'Hindi',
    fr: 'French',
    ru: 'Russian'
  }
};

export function getLanguageDisplayName(languageCode, displayLanguage = DEFAULT_LANGUAGE) {
  const option = LANGUAGE_OPTIONS.find((item) => item.code === languageCode);
  const locale = isSupportedLanguage(displayLanguage)
    ? displayLanguage
    : DEFAULT_LANGUAGE;
  const fallbackName = LANGUAGE_NAME_FALLBACKS[locale]?.[languageCode];

  if (fallbackName) {
    return fallbackName;
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
    const localizedName = displayNames.of(languageCode);

    if (localizedName && localizedName !== languageCode) {
      return localizedName;
    }
  } catch {
    // Some browsers may not support every locale in Intl.DisplayNames.
  }

  return (
    LANGUAGE_NAME_FALLBACKS.vi[languageCode] ||
    option?.label ||
    languageCode
  );
}

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
    previous: 'Trước', next: 'Sau', listen: 'Nghe thuyết minh', highlights: 'Món nổi bật:', noReviews: 'Chưa có đánh giá',
    errInsecureContext: 'Trình duyệt không cho phép lấy vị trí khi truy cập bằng HTTP qua IP nội bộ. Hãy mở web bằng HTTPS hoặc dùng tunnel HTTPS như ngrok/cloudflared để test trên điện thoại.',
    errPermissionDenied: 'Bạn đã từ chối quyền vị trí. Hãy bật quyền vị trí cho trình duyệt rồi thử lại.',
    errTimeout: 'Không lấy được vị trí trong thời gian cho phép. Vui lòng thử lại hoặc kiểm tra GPS.',
    errPositionUnavailable: 'Thiết bị chưa cung cấp được vị trí hiện tại. Vui lòng bật GPS hoặc thử lại.',
    errGeolocationUnsupported: 'Trình duyệt này không hỗ trợ lấy vị trí.',
    locationUpdated: 'Đã cập nhật vị trí của bạn.'
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
    previous: 'Previous', next: 'Next', listen: 'Listen to guide', highlights: 'Highlights:', noReviews: 'No reviews yet',
    errInsecureContext: 'Geolocation is not allowed over HTTP via local IP. Please open using HTTPS or use an HTTPS tunnel like ngrok/cloudflared to test on mobile.',
    errPermissionDenied: 'Location access denied. Please enable location permission in browser settings and try again.',
    errTimeout: 'Location request timed out. Please try again or check your GPS.',
    errPositionUnavailable: 'Location information is unavailable. Please enable GPS or try again.',
    errGeolocationUnsupported: 'This browser does not support geolocation.',
    locationUpdated: 'Your location has been updated.'
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

const DETAIL_UI_TEXT = {
  vi: {
    restaurantFallbackName: 'Quán ăn', noAddress: 'Chưa có địa chỉ', unknownDistance: 'Chưa xác định',
    notUpdated: 'Chưa cập nhật', detailLoading: 'Đang tải thông tin quán...', detailLoadFailed: 'Không tải được quán ăn',
    back: 'Quay lại', backToHome: 'Quay lại Home', closedNow: 'Đang đóng cửa', currentlyClosed: 'Hiện không mở cửa',
    reviewLabel: 'đánh giá', directions: 'Chỉ đường', saving: 'Đang lưu...', savedRestaurant: 'Đã lưu',
    saveRestaurant: 'Lưu quán', detailInfo: 'Thông tin chi tiết', distanceFromYou: 'Cách vị trí của bạn',
    noTags: 'Chưa có tag', restaurantAudioTitle: 'Thuyết minh về quán', selectedLanguage: 'Ngôn ngữ hiện tại',
    audioPassAccess: 'AudioPass', audioLockedText: 'Nội dung thuyết minh đầy đủ được mở khi khách kích hoạt gói nghe premium.',
    audioPassText: 'Gói nghe giúp bạn nghe thuyết minh quán và món ăn bằng ngôn ngữ đã chọn.',
    audioGuideTip: 'Nội dung giúp khách du lịch hiểu nhanh về quán, món nên thử và bối cảnh ẩm thực địa phương.',
    recommendedDishesTitle: 'Món nên thử', recommendedDishesDescription: 'Thực đơn gợi ý từ quán, có mô tả và thuyết minh theo ngôn ngữ bạn chọn.',
    dishesLoadFailed: 'Chưa tải được danh sách món ăn. Bạn vẫn có thể xem thông tin quán bình thường.',
    noDishDescription: 'Chưa có mô tả cho món này.', spicy: 'Cay', listenDish: 'Nghe thuyết minh món',
    cultureCornerTitle: 'Góc văn hóa ẩm thực', cultureText: 'Những quán ăn địa phương thường không chỉ là nơi dùng bữa, mà còn là cách nhanh nhất để cảm nhận nhịp sống của thành phố. Hãy thử quan sát cách người địa phương gọi món, ăn kèm rau thơm và dùng nước chấm.',
    localTip: 'Lời khuyên của Local', shouldTry: 'Nên thử', localTipText: 'Hãy hỏi nhân viên món bán chạy nhất trong ngày và thử dùng kèm rau thơm hoặc nước chấm đặc trưng để cảm nhận đúng vị địa phương.',
    saveForLater: 'Lưu quán để quay lại sau', restaurantLocation: 'Vị trí quán', openFullMap: 'Mở bản đồ đầy đủ',
    missingRestaurantId: 'Thiếu mã quán ăn để tải thuyết minh.', passActivated: 'Gói nghe đã được kích hoạt.',
    missingRestaurantNarration: 'Quán này chưa có nội dung thuyết minh.', speechUnsupported: 'Trình duyệt không hỗ trợ đọc thuyết minh.',
    missingDishIds: 'Thiếu mã quán ăn hoặc món ăn để tải thuyết minh.', missingDishNarration: 'Món này chưa có nội dung thuyết minh.',
    noCoordinates: 'Quán này chưa có tọa độ để chỉ đường.', removedSaved: 'Đã bỏ lưu quán.', savedToBookmarks: 'Đã lưu quán vào Bookmarks.'
  },
  en: {
    restaurantFallbackName: 'Restaurant', noAddress: 'No address yet', unknownDistance: 'Unknown',
    notUpdated: 'Not updated', detailLoading: 'Loading restaurant details...', detailLoadFailed: 'Could not load restaurant',
    back: 'Back', backToHome: 'Back to Home', closedNow: 'Closed', currentlyClosed: 'Currently closed',
    reviewLabel: 'reviews', directions: 'Directions', saving: 'Saving...', savedRestaurant: 'Saved',
    saveRestaurant: 'Save place', detailInfo: 'Details', distanceFromYou: 'From your location',
    noTags: 'No tags yet', restaurantAudioTitle: 'Restaurant audio guide', selectedLanguage: 'Selected language',
    audioPassAccess: 'AudioPass', audioLockedText: 'The full audio guide is unlocked after activating a premium audio pass.',
    audioPassText: 'The pass lets you listen to restaurant and dish guides in your selected language.',
    audioGuideTip: 'The guide helps travelers quickly understand the place, recommended dishes, and local food context.',
    recommendedDishesTitle: 'Recommended dishes', recommendedDishesDescription: 'Suggested menu items with descriptions and narration in your selected language.',
    dishesLoadFailed: 'Could not load dishes. You can still view the restaurant information.',
    noDishDescription: 'No description is available for this dish.', spicy: 'Spicy', listenDish: 'Listen to dish guide',
    cultureCornerTitle: 'Food culture corner', cultureText: 'Local eateries are not only places to eat, but also a quick way to feel the rhythm of the city. Notice how locals order, pair herbs, and use dipping sauces.',
    localTip: 'Local tip', shouldTry: 'Try', localTipText: 'Ask the staff for the best-selling dish of the day and try it with herbs or signature dipping sauce for the local flavor.',
    saveForLater: 'Save this place for later', restaurantLocation: 'Restaurant location', openFullMap: 'Open full map',
    missingRestaurantId: 'Missing restaurant ID for audio guide.', passActivated: 'AudioPass has been activated.',
    missingRestaurantNarration: 'This restaurant has no narration yet.', speechUnsupported: 'Your browser does not support speech narration.',
    missingDishIds: 'Missing restaurant or dish ID for audio guide.', missingDishNarration: 'This dish has no narration yet.',
    noCoordinates: 'This restaurant has no coordinates for directions.', removedSaved: 'Removed from saved places.', savedToBookmarks: 'Saved to Bookmarks.'
  },
  'zh-CN': {
    restaurantFallbackName: '餐厅', noAddress: '暂无地址', unknownDistance: '未知', notUpdated: '尚未更新',
    detailLoading: '正在加载餐厅信息...', detailLoadFailed: '无法加载餐厅', back: '返回', backToHome: '返回首页',
    closedNow: '已关闭', currentlyClosed: '当前未营业', reviewLabel: '条评价', directions: '路线',
    saving: '正在保存...', savedRestaurant: '已保存', saveRestaurant: '收藏餐厅', detailInfo: '详细信息',
    distanceFromYou: '距离您的位置', noTags: '暂无标签', restaurantAudioTitle: '餐厅语音讲解',
    selectedLanguage: '当前语言', audioPassAccess: 'AudioPass', audioLockedText: '完整语音讲解将在启用高级听讲套餐后开放。',
    audioPassText: '套餐可让您用所选语言收听餐厅和菜品讲解。', audioGuideTip: '讲解帮助游客快速了解餐厅、推荐菜品和当地饮食背景。',
    recommendedDishesTitle: '推荐菜品', recommendedDishesDescription: '餐厅推荐菜单，包含描述和所选语言讲解。',
    dishesLoadFailed: '无法加载菜品列表。您仍可正常查看餐厅信息。', noDishDescription: '该菜品暂无描述。',
    spicy: '辣', listenDish: '收听菜品讲解', cultureCornerTitle: '饮食文化角',
    cultureText: '本地餐馆不只是用餐地点，也是感受城市节奏的快速方式。可以观察当地人如何点餐、搭配香草和使用蘸酱。',
    localTip: '本地建议', shouldTry: '推荐尝试', localTipText: '可以询问店员当天最受欢迎的菜品，并搭配香草或特色蘸酱品尝当地风味。',
    saveForLater: '保存餐厅以便稍后查看', restaurantLocation: '餐厅位置', openFullMap: '打开完整地图',
    missingRestaurantId: '缺少餐厅编号，无法加载讲解。', passActivated: 'AudioPass 已激活。',
    missingRestaurantNarration: '该餐厅暂无讲解内容。', speechUnsupported: '您的浏览器不支持语音朗读。',
    missingDishIds: '缺少餐厅或菜品编号，无法加载讲解。', missingDishNarration: '该菜品暂无讲解内容。',
    noCoordinates: '该餐厅暂无坐标，无法导航。', removedSaved: '已取消收藏。', savedToBookmarks: '已保存到收藏。'
  },
  'zh-TW': {
    restaurantFallbackName: '餐廳', noAddress: '尚無地址', unknownDistance: '未知', notUpdated: '尚未更新',
    detailLoading: '正在載入餐廳資訊...', detailLoadFailed: '無法載入餐廳', back: '返回', backToHome: '返回首頁',
    closedNow: '已打烊', currentlyClosed: '目前未營業', reviewLabel: '則評價', directions: '路線',
    saving: '正在儲存...', savedRestaurant: '已收藏', saveRestaurant: '收藏餐廳', detailInfo: '詳細資訊',
    distanceFromYou: '距離您的位置', noTags: '尚無標籤', restaurantAudioTitle: '餐廳語音導覽',
    selectedLanguage: '目前語言', audioPassAccess: 'AudioPass', audioLockedText: '完整語音導覽會在啟用進階聆聽套票後開放。',
    audioPassText: '套票可讓您用所選語言聆聽餐廳與菜色導覽。', audioGuideTip: '導覽可協助旅客快速了解餐廳、推薦菜色與在地飲食背景。',
    recommendedDishesTitle: '推薦菜色', recommendedDishesDescription: '餐廳推薦菜單，包含描述與所選語言導覽。',
    dishesLoadFailed: '無法載入菜色列表。您仍可正常查看餐廳資訊。', noDishDescription: '此菜色尚無描述。',
    spicy: '辣', listenDish: '聆聽菜色導覽', cultureCornerTitle: '飲食文化角',
    cultureText: '在地餐館不只是用餐地點，也是感受城市節奏的快速方式。可以觀察當地人如何點餐、搭配香草與使用沾醬。',
    localTip: '在地建議', shouldTry: '推薦嘗試', localTipText: '可以詢問店員當天最受歡迎的菜色，並搭配香草或特色沾醬品嚐在地風味。',
    saveForLater: '收藏餐廳稍後再看', restaurantLocation: '餐廳位置', openFullMap: '開啟完整地圖',
    missingRestaurantId: '缺少餐廳編號，無法載入導覽。', passActivated: 'AudioPass 已啟用。',
    missingRestaurantNarration: '此餐廳尚無導覽內容。', speechUnsupported: '您的瀏覽器不支援語音朗讀。',
    missingDishIds: '缺少餐廳或菜色編號，無法載入導覽。', missingDishNarration: '此菜色尚無導覽內容。',
    noCoordinates: '此餐廳尚無座標，無法導航。', removedSaved: '已取消收藏。', savedToBookmarks: '已儲存到收藏。'
  },
  ko: {
    restaurantFallbackName: '식당', noAddress: '주소 없음', unknownDistance: '알 수 없음', notUpdated: '업데이트 전',
    detailLoading: '식당 정보를 불러오는 중...', detailLoadFailed: '식당 정보를 불러올 수 없습니다', back: '뒤로',
    backToHome: '홈으로 돌아가기', closedNow: '영업 종료', currentlyClosed: '현재 영업하지 않음', reviewLabel: '리뷰',
    directions: '길찾기', saving: '저장 중...', savedRestaurant: '저장됨', saveRestaurant: '식당 저장',
    detailInfo: '상세 정보', distanceFromYou: '현재 위치에서', noTags: '태그 없음', restaurantAudioTitle: '식당 오디오 가이드',
    selectedLanguage: '선택한 언어', audioPassAccess: 'AudioPass', audioLockedText: '프리미엄 오디오 패스를 활성화하면 전체 가이드를 들을 수 있습니다.',
    audioPassText: '선택한 언어로 식당과 음식 가이드를 들을 수 있습니다.', audioGuideTip: '가이드는 여행자가 식당, 추천 메뉴, 현지 음식 문화를 빠르게 이해하도록 돕습니다.',
    recommendedDishesTitle: '추천 메뉴', recommendedDishesDescription: '선택한 언어 설명과 음성 안내가 있는 추천 메뉴입니다.',
    dishesLoadFailed: '메뉴를 불러올 수 없습니다. 식당 정보는 계속 볼 수 있습니다.', noDishDescription: '이 메뉴의 설명이 아직 없습니다.',
    spicy: '매움', listenDish: '메뉴 가이드 듣기', cultureCornerTitle: '음식 문화 코너',
    cultureText: '현지 식당은 식사 공간일 뿐 아니라 도시의 리듬을 느끼는 가장 빠른 방법입니다. 현지인이 주문하고 허브와 소스를 곁들이는 방식을 살펴보세요.',
    localTip: '현지 팁', shouldTry: '추천', localTipText: '직원에게 오늘 가장 잘 팔리는 메뉴를 물어보고 허브나 대표 소스와 함께 맛보세요.',
    saveForLater: '나중에 다시 보려고 저장', restaurantLocation: '식당 위치', openFullMap: '전체 지도 열기',
    missingRestaurantId: '오디오 가이드를 불러올 식당 ID가 없습니다.', passActivated: 'AudioPass가 활성화되었습니다.',
    missingRestaurantNarration: '이 식당의 안내 내용이 아직 없습니다.', speechUnsupported: '브라우저가 음성 안내를 지원하지 않습니다.',
    missingDishIds: '식당 또는 메뉴 ID가 없습니다.', missingDishNarration: '이 메뉴의 안내 내용이 아직 없습니다.',
    noCoordinates: '이 식당은 길찾기 좌표가 없습니다.', removedSaved: '저장에서 제거했습니다.', savedToBookmarks: '북마크에 저장했습니다.'
  },
  ja: {
    restaurantFallbackName: 'レストラン', noAddress: '住所未登録', unknownDistance: '不明', notUpdated: '未更新',
    detailLoading: 'レストラン情報を読み込み中...', detailLoadFailed: 'レストランを読み込めません', back: '戻る',
    backToHome: 'ホームへ戻る', closedNow: '営業時間外', currentlyClosed: '現在営業していません', reviewLabel: '件のレビュー',
    directions: 'ルート', saving: '保存中...', savedRestaurant: '保存済み', saveRestaurant: '保存する',
    detailInfo: '詳細情報', distanceFromYou: '現在地から', noTags: 'タグなし', restaurantAudioTitle: 'レストラン音声ガイド',
    selectedLanguage: '選択中の言語', audioPassAccess: 'AudioPass', audioLockedText: 'プレミアム音声パスを有効にすると、完全な音声ガイドを利用できます。',
    audioPassText: '選択した言語でレストランと料理のガイドを聞けます。', audioGuideTip: 'ガイドは旅行者が店、推奨料理、地域の食文化をすばやく理解するのに役立ちます。',
    recommendedDishesTitle: 'おすすめ料理', recommendedDishesDescription: '選択した言語の説明と音声ガイド付きのおすすめメニューです。',
    dishesLoadFailed: '料理一覧を読み込めません。レストラン情報は引き続き表示できます。', noDishDescription: 'この料理の説明はまだありません。',
    spicy: '辛い', listenDish: '料理ガイドを聞く', cultureCornerTitle: '食文化コーナー',
    cultureText: '地元の食堂は食事の場所であるだけでなく、街のリズムを感じる近道です。地元の人の注文、ハーブ、つけだれの使い方を観察してみましょう。',
    localTip: 'ローカルのヒント', shouldTry: 'おすすめ', localTipText: 'スタッフにその日の人気料理を聞き、ハーブや特製だれと一緒に味わってみましょう。',
    saveForLater: 'あとで見るために保存', restaurantLocation: 'レストランの場所', openFullMap: '大きな地図を開く',
    missingRestaurantId: '音声ガイド用のレストランIDがありません。', passActivated: 'AudioPassが有効になりました。',
    missingRestaurantNarration: 'このレストランのガイドはまだありません。', speechUnsupported: 'このブラウザは音声読み上げに対応していません。',
    missingDishIds: 'レストランまたは料理IDがありません。', missingDishNarration: 'この料理のガイドはまだありません。',
    noCoordinates: 'このレストランにはルート用の座標がありません。', removedSaved: '保存を解除しました。', savedToBookmarks: 'ブックマークに保存しました。'
  },
  th: {
    restaurantFallbackName: 'ร้านอาหาร', noAddress: 'ยังไม่มีที่อยู่', unknownDistance: 'ไม่ทราบ', notUpdated: 'ยังไม่อัปเดต',
    detailLoading: 'กำลังโหลดข้อมูลร้าน...', detailLoadFailed: 'โหลดข้อมูลร้านไม่ได้', back: 'ย้อนกลับ', backToHome: 'กลับหน้าแรก',
    closedNow: 'ปิดอยู่', currentlyClosed: 'ขณะนี้ไม่เปิด', reviewLabel: 'รีวิว', directions: 'เส้นทาง',
    saving: 'กำลังบันทึก...', savedRestaurant: 'บันทึกแล้ว', saveRestaurant: 'บันทึกร้าน', detailInfo: 'รายละเอียด',
    distanceFromYou: 'จากตำแหน่งของคุณ', noTags: 'ยังไม่มีแท็ก', restaurantAudioTitle: 'คำบรรยายเสียงของร้าน',
    selectedLanguage: 'ภาษาที่เลือก', audioPassAccess: 'AudioPass', audioLockedText: 'คำบรรยายฉบับเต็มจะเปิดหลังจากเปิดใช้งานแพ็กเกจเสียงพรีเมียม',
    audioPassText: 'แพ็กเกจนี้ให้คุณฟังคำบรรยายร้านและเมนูในภาษาที่เลือก', audioGuideTip: 'คำบรรยายช่วยให้นักท่องเที่ยวเข้าใจร้าน เมนูแนะนำ และบริบทอาหารท้องถิ่นได้เร็วขึ้น',
    recommendedDishesTitle: 'เมนูแนะนำ', recommendedDishesDescription: 'เมนูที่ร้านแนะนำ พร้อมคำอธิบายและเสียงบรรยายในภาษาที่คุณเลือก',
    dishesLoadFailed: 'โหลดรายการเมนูไม่ได้ แต่คุณยังดูข้อมูลร้านได้ตามปกติ', noDishDescription: 'ยังไม่มีคำอธิบายสำหรับเมนูนี้',
    spicy: 'เผ็ด', listenDish: 'ฟังคำบรรยายเมนู', cultureCornerTitle: 'มุมวัฒนธรรมอาหาร',
    cultureText: 'ร้านอาหารท้องถิ่นไม่ใช่แค่ที่กินข้าว แต่เป็นวิธีเร็วที่สุดในการสัมผัสจังหวะชีวิตของเมือง ลองสังเกตวิธีสั่งอาหาร การกินคู่กับสมุนไพร และการใช้น้ำจิ้มของคนท้องถิ่น',
    localTip: 'คำแนะนำจากคนท้องถิ่น', shouldTry: 'ควรลอง', localTipText: 'ถามพนักงานว่าเมนูไหนขายดีที่สุดในวันนั้น แล้วลองกินคู่กับสมุนไพรหรือน้ำจิ้มเฉพาะของร้าน',
    saveForLater: 'บันทึกร้านไว้กลับมาดูภายหลัง', restaurantLocation: 'ตำแหน่งร้าน', openFullMap: 'เปิดแผนที่เต็ม',
    missingRestaurantId: 'ไม่มีรหัสร้านสำหรับโหลดเสียงบรรยาย', passActivated: 'เปิดใช้งาน AudioPass แล้ว',
    missingRestaurantNarration: 'ร้านนี้ยังไม่มีเนื้อหาบรรยาย', speechUnsupported: 'เบราว์เซอร์ของคุณไม่รองรับการอ่านเสียง',
    missingDishIds: 'ไม่มีรหัสร้านหรือเมนูสำหรับโหลดเสียงบรรยาย', missingDishNarration: 'เมนูนี้ยังไม่มีเนื้อหาบรรยาย',
    noCoordinates: 'ร้านนี้ยังไม่มีพิกัดสำหรับนำทาง', removedSaved: 'ลบออกจากรายการที่บันทึกแล้ว', savedToBookmarks: 'บันทึกลง Bookmarks แล้ว'
  },
  fr: {
    restaurantFallbackName: 'Restaurant', noAddress: 'Adresse non renseignée', unknownDistance: 'Inconnu', notUpdated: 'Non mis à jour',
    detailLoading: 'Chargement du restaurant...', detailLoadFailed: 'Impossible de charger le restaurant', back: 'Retour',
    backToHome: 'Retour à l’accueil', closedNow: 'Fermé', currentlyClosed: 'Actuellement fermé', reviewLabel: 'avis',
    directions: 'Itinéraire', saving: 'Enregistrement...', savedRestaurant: 'Enregistré', saveRestaurant: 'Enregistrer',
    detailInfo: 'Informations détaillées', distanceFromYou: 'Depuis votre position', noTags: 'Aucun tag', restaurantAudioTitle: 'Guide audio du restaurant',
    selectedLanguage: 'Langue sélectionnée', audioPassAccess: 'AudioPass', audioLockedText: 'Le guide audio complet est disponible après activation du pass premium.',
    audioPassText: 'Le pass permet d’écouter les guides du restaurant et des plats dans la langue choisie.', audioGuideTip: 'Le guide aide les voyageurs à comprendre rapidement le lieu, les plats à essayer et le contexte culinaire local.',
    recommendedDishesTitle: 'Plats recommandés', recommendedDishesDescription: 'Suggestions du restaurant avec descriptions et narration dans la langue choisie.',
    dishesLoadFailed: 'Impossible de charger les plats. Vous pouvez toujours consulter les informations du restaurant.',
    noDishDescription: 'Aucune description disponible pour ce plat.', spicy: 'Épicé', listenDish: 'Écouter le guide du plat',
    cultureCornerTitle: 'Coin culture culinaire', cultureText: 'Les restaurants locaux ne sont pas seulement des lieux où manger, ils permettent aussi de ressentir rapidement le rythme de la ville. Observez comment les habitants commandent, ajoutent des herbes et utilisent les sauces.',
    localTip: 'Conseil local', shouldTry: 'À essayer', localTipText: 'Demandez au personnel le plat le plus populaire du jour et goûtez-le avec des herbes ou une sauce maison.',
    saveForLater: 'Enregistrer pour plus tard', restaurantLocation: 'Emplacement du restaurant', openFullMap: 'Ouvrir la carte complète',
    missingRestaurantId: 'Identifiant du restaurant manquant pour le guide audio.', passActivated: 'AudioPass activé.',
    missingRestaurantNarration: 'Ce restaurant n’a pas encore de narration.', speechUnsupported: 'Votre navigateur ne prend pas en charge la synthèse vocale.',
    missingDishIds: 'Identifiant du restaurant ou du plat manquant.', missingDishNarration: 'Ce plat n’a pas encore de narration.',
    noCoordinates: 'Ce restaurant n’a pas de coordonnées pour l’itinéraire.', removedSaved: 'Retiré des favoris.', savedToBookmarks: 'Enregistré dans les favoris.'
  },
  ru: {
    restaurantFallbackName: 'Ресторан', noAddress: 'Адрес не указан', unknownDistance: 'Неизвестно', notUpdated: 'Не обновлено',
    detailLoading: 'Загрузка ресторана...', detailLoadFailed: 'Не удалось загрузить ресторан', back: 'Назад',
    backToHome: 'Вернуться на главную', closedNow: 'Закрыто', currentlyClosed: 'Сейчас закрыто', reviewLabel: 'отзывов',
    directions: 'Маршрут', saving: 'Сохранение...', savedRestaurant: 'Сохранено', saveRestaurant: 'Сохранить',
    detailInfo: 'Подробности', distanceFromYou: 'От вашего местоположения', noTags: 'Тегов пока нет', restaurantAudioTitle: 'Аудиогид ресторана',
    selectedLanguage: 'Выбранный язык', audioPassAccess: 'AudioPass', audioLockedText: 'Полный аудиогид доступен после активации премиум-пакета.',
    audioPassText: 'Пакет позволяет слушать гид по ресторану и блюдам на выбранном языке.', audioGuideTip: 'Гид помогает туристам быстро понять место, рекомендуемые блюда и местный гастрономический контекст.',
    recommendedDishesTitle: 'Рекомендуемые блюда', recommendedDishesDescription: 'Рекомендации ресторана с описаниями и озвучкой на выбранном языке.',
    dishesLoadFailed: 'Не удалось загрузить блюда. Информацию о ресторане всё ещё можно посмотреть.',
    noDishDescription: 'Описание для этого блюда пока отсутствует.', spicy: 'Острое', listenDish: 'Слушать гид по блюду',
    cultureCornerTitle: 'Уголок гастрономической культуры', cultureText: 'Местные кафе и рестораны — это не только еда, но и быстрый способ почувствовать ритм города. Обратите внимание, как местные заказывают блюда, добавляют травы и используют соусы.',
    localTip: 'Совет местного', shouldTry: 'Стоит попробовать', localTipText: 'Спросите у персонала самое популярное блюдо дня и попробуйте его с травами или фирменным соусом.',
    saveForLater: 'Сохранить, чтобы вернуться позже', restaurantLocation: 'Расположение ресторана', openFullMap: 'Открыть полную карту',
    missingRestaurantId: 'Нет ID ресторана для аудиогида.', passActivated: 'AudioPass активирован.',
    missingRestaurantNarration: 'У этого ресторана пока нет аудиогида.', speechUnsupported: 'Ваш браузер не поддерживает озвучивание.',
    missingDishIds: 'Нет ID ресторана или блюда для аудиогида.', missingDishNarration: 'У этого блюда пока нет аудиогида.',
    noCoordinates: 'У ресторана нет координат для маршрута.', removedSaved: 'Удалено из сохранённых.', savedToBookmarks: 'Сохранено в закладки.'
  }
};

const SOUTHEAST_ASIA_UI_TEXT = {
  id: {
    explore: 'Jelajahi', map: 'Peta', bookmarks: 'Tersimpan', history: 'Riwayat',
    login: 'Masuk', logout: 'Keluar', title: 'Temukan Cita Rasa',
    titleHighlight: 'Vietnam', subtitle: 'Temukan restoran di dekat Anda dan dengarkan panduan dalam bahasa pilihan.',
    currentLocation: 'Lokasi saat ini:', useLocation: 'Gunakan lokasi saya', gettingLocation: 'Mengambil lokasi...',
    search: 'Cari hidangan atau restoran...', viewMap: 'Lihat peta', distance: 'Jarak',
    price: 'Harga:', all: 'Semua', cheap: 'Hemat', medium: 'Menengah', high: 'Premium',
    openNow: 'Sedang buka', vegetarian: 'Vegetarian', nonSpicy: 'Tidak pedas', spicy: 'Pedas', allergy: 'Alergi',
    nearby: 'Restoran unggulan di dekat Anda', viewAll: 'Lihat semua', show: 'Menampilkan', restaurants: 'restoran',
    previous: 'Sebelumnya', next: 'Berikutnya', listen: 'Dengarkan panduan', highlights: 'Hidangan unggulan:', noReviews: 'Belum ada ulasan',
    errInsecureContext: 'Geolokasi tidak diizinkan lewat HTTP melalui IP lokal. Gunakan HTTPS atau tunnel HTTPS untuk tes di ponsel.',
    errPermissionDenied: 'Izin lokasi ditolak. Aktifkan izin lokasi di browser lalu coba lagi.',
    errTimeout: 'Permintaan lokasi habis waktu. Coba lagi atau periksa GPS.',
    errPositionUnavailable: 'Informasi lokasi tidak tersedia. Aktifkan GPS atau coba lagi.',
    errGeolocationUnsupported: 'Browser ini tidak mendukung geolokasi.',
    locationUpdated: 'Lokasi Anda telah diperbarui.'
  },
  ms: {
    explore: 'Teroka', map: 'Peta', bookmarks: 'Disimpan', history: 'Sejarah',
    login: 'Log masuk', logout: 'Log keluar', title: 'Terokai Rasa',
    titleHighlight: 'Vietnam', subtitle: 'Cari restoran berhampiran anda dan dengar panduan dalam bahasa pilihan.',
    currentLocation: 'Lokasi semasa:', useLocation: 'Guna lokasi saya', gettingLocation: 'Mendapatkan lokasi...',
    search: 'Cari hidangan atau restoran...', viewMap: 'Lihat peta', distance: 'Jarak',
    price: 'Harga:', all: 'Semua', cheap: 'Jimat', medium: 'Sederhana', high: 'Premium',
    openNow: 'Sedang dibuka', vegetarian: 'Vegetarian', nonSpicy: 'Tidak pedas', spicy: 'Pedas', allergy: 'Alergi',
    nearby: 'Restoran pilihan berhampiran anda', viewAll: 'Lihat semua', show: 'Memaparkan', restaurants: 'restoran',
    previous: 'Sebelumnya', next: 'Seterusnya', listen: 'Dengar panduan', highlights: 'Hidangan pilihan:', noReviews: 'Belum ada ulasan',
    errInsecureContext: 'Geolokasi tidak dibenarkan melalui HTTP pada IP tempatan. Gunakan HTTPS atau tunnel HTTPS untuk ujian telefon.',
    errPermissionDenied: 'Kebenaran lokasi ditolak. Aktifkan kebenaran lokasi dalam pelayar dan cuba lagi.',
    errTimeout: 'Permintaan lokasi tamat masa. Cuba lagi atau semak GPS.',
    errPositionUnavailable: 'Maklumat lokasi tidak tersedia. Aktifkan GPS atau cuba lagi.',
    errGeolocationUnsupported: 'Pelayar ini tidak menyokong geolokasi.',
    locationUpdated: 'Lokasi anda telah dikemas kini.'
  },
  tl: {
    explore: 'Tuklasin', map: 'Mapa', bookmarks: 'Naka-save', history: 'Kasaysayan',
    login: 'Mag-log in', logout: 'Mag-log out', title: 'Tuklasin ang Lasa ng',
    titleHighlight: 'Vietnam', subtitle: 'Maghanap ng mga kainan malapit sa iyo at makinig sa gabay sa napiling wika.',
    currentLocation: 'Kasalukuyang lokasyon:', useLocation: 'Gamitin ang lokasyon ko', gettingLocation: 'Kinukuha ang lokasyon...',
    search: 'Maghanap ng pagkain o kainan...', viewMap: 'Tingnan ang mapa', distance: 'Distansya',
    price: 'Presyo:', all: 'Lahat', cheap: 'Abot-kaya', medium: 'Katamtaman', high: 'Premium',
    openNow: 'Bukas ngayon', vegetarian: 'Vegetarian', nonSpicy: 'Hindi maanghang', spicy: 'Maanghang', allergy: 'Alerhiya',
    nearby: 'Mga tampok na kainan malapit sa iyo', viewAll: 'Tingnan lahat', show: 'Ipinapakita', restaurants: 'kainan',
    previous: 'Nakaraan', next: 'Susunod', listen: 'Makinig sa gabay', highlights: 'Tampok na pagkain:', noReviews: 'Wala pang review',
    errInsecureContext: 'Hindi pinapayagan ang geolocation sa HTTP gamit ang lokal na IP. Gumamit ng HTTPS o HTTPS tunnel para mag-test sa telepono.',
    errPermissionDenied: 'Tinanggihan ang pahintulot sa lokasyon. I-enable ito sa browser settings at subukang muli.',
    errTimeout: 'Nag-time out ang pagkuha ng lokasyon. Subukang muli o tingnan ang GPS.',
    errPositionUnavailable: 'Hindi available ang impormasyon ng lokasyon. I-enable ang GPS o subukang muli.',
    errGeolocationUnsupported: 'Hindi sinusuportahan ng browser na ito ang geolocation.',
    locationUpdated: 'Na-update na ang lokasyon mo.'
  }
};

const SOUTHEAST_ASIA_DETAIL_TEXT = {
  id: {
    restaurantFallbackName: 'Restoran', noAddress: 'Belum ada alamat', unknownDistance: 'Belum diketahui', notUpdated: 'Belum diperbarui',
    detailLoading: 'Memuat detail restoran...', detailLoadFailed: 'Tidak dapat memuat restoran', back: 'Kembali', backToHome: 'Kembali ke Home',
    closedNow: 'Tutup', currentlyClosed: 'Saat ini tutup', reviewLabel: 'ulasan', directions: 'Rute',
    saving: 'Menyimpan...', savedRestaurant: 'Tersimpan', saveRestaurant: 'Simpan restoran', detailInfo: 'Informasi detail',
    distanceFromYou: 'Dari lokasi Anda', noTags: 'Belum ada tag', restaurantAudioTitle: 'Panduan audio restoran',
    selectedLanguage: 'Bahasa terpilih', audioPassAccess: 'AudioPass', audioLockedText: 'Panduan audio lengkap terbuka setelah AudioPass premium aktif.',
    audioPassText: 'AudioPass memungkinkan Anda mendengar panduan restoran dan menu dalam bahasa pilihan.', audioGuideTip: 'Panduan membantu wisatawan memahami tempat, menu rekomendasi, dan budaya kuliner lokal.',
    recommendedDishesTitle: 'Menu rekomendasi', recommendedDishesDescription: 'Menu pilihan restoran dengan deskripsi dan narasi dalam bahasa pilihan.',
    dishesLoadFailed: 'Tidak dapat memuat daftar menu. Anda tetap dapat melihat informasi restoran.', noDishDescription: 'Belum ada deskripsi untuk menu ini.',
    spicy: 'Pedas', listenDish: 'Dengarkan panduan menu', cultureCornerTitle: 'Sudut budaya kuliner',
    cultureText: 'Warung lokal bukan hanya tempat makan, tetapi juga cara cepat merasakan ritme kota. Perhatikan cara warga lokal memesan, memakai herba, dan saus celup.',
    localTip: 'Tips lokal', shouldTry: 'Coba', localTipText: 'Tanyakan menu terlaris hari ini dan coba bersama herba atau saus khas.',
    saveForLater: 'Simpan untuk dikunjungi nanti', restaurantLocation: 'Lokasi restoran', openFullMap: 'Buka peta lengkap',
    missingRestaurantId: 'ID restoran tidak tersedia untuk memuat audio.', passActivated: 'AudioPass telah aktif.',
    missingRestaurantNarration: 'Restoran ini belum memiliki narasi.', speechUnsupported: 'Browser Anda tidak mendukung pembacaan suara.',
    missingDishIds: 'ID restoran atau menu tidak tersedia.', missingDishNarration: 'Menu ini belum memiliki narasi.',
    noCoordinates: 'Restoran ini belum memiliki koordinat untuk rute.', removedSaved: 'Dihapus dari tersimpan.', savedToBookmarks: 'Disimpan ke Bookmarks.'
  },
  ms: {
    restaurantFallbackName: 'Restoran', noAddress: 'Belum ada alamat', unknownDistance: 'Belum diketahui', notUpdated: 'Belum dikemas kini',
    detailLoading: 'Memuatkan butiran restoran...', detailLoadFailed: 'Tidak dapat memuatkan restoran', back: 'Kembali', backToHome: 'Kembali ke Home',
    closedNow: 'Tutup', currentlyClosed: 'Sedang tutup', reviewLabel: 'ulasan', directions: 'Arah',
    saving: 'Menyimpan...', savedRestaurant: 'Disimpan', saveRestaurant: 'Simpan restoran', detailInfo: 'Maklumat terperinci',
    distanceFromYou: 'Dari lokasi anda', noTags: 'Belum ada tag', restaurantAudioTitle: 'Panduan audio restoran',
    selectedLanguage: 'Bahasa dipilih', audioPassAccess: 'AudioPass', audioLockedText: 'Panduan audio penuh dibuka selepas AudioPass premium diaktifkan.',
    audioPassText: 'AudioPass membolehkan anda mendengar panduan restoran dan menu dalam bahasa pilihan.', audioGuideTip: 'Panduan membantu pelancong memahami tempat, menu cadangan dan budaya makanan tempatan.',
    recommendedDishesTitle: 'Menu cadangan', recommendedDishesDescription: 'Menu pilihan restoran dengan penerangan dan narasi dalam bahasa pilihan.',
    dishesLoadFailed: 'Tidak dapat memuatkan senarai menu. Anda masih boleh melihat maklumat restoran.', noDishDescription: 'Belum ada penerangan untuk menu ini.',
    spicy: 'Pedas', listenDish: 'Dengar panduan menu', cultureCornerTitle: 'Sudut budaya makanan',
    cultureText: 'Kedai makan tempatan bukan sekadar tempat makan, tetapi cara cepat merasai rentak bandar. Perhatikan cara penduduk tempatan memesan, makan bersama herba dan sos pencicah.',
    localTip: 'Tip tempatan', shouldTry: 'Cuba', localTipText: 'Tanya staf menu paling laris hari ini dan cuba bersama herba atau sos istimewa.',
    saveForLater: 'Simpan untuk lawatan kemudian', restaurantLocation: 'Lokasi restoran', openFullMap: 'Buka peta penuh',
    missingRestaurantId: 'ID restoran tiada untuk memuatkan audio.', passActivated: 'AudioPass telah diaktifkan.',
    missingRestaurantNarration: 'Restoran ini belum mempunyai narasi.', speechUnsupported: 'Pelayar anda tidak menyokong bacaan suara.',
    missingDishIds: 'ID restoran atau menu tiada.', missingDishNarration: 'Menu ini belum mempunyai narasi.',
    noCoordinates: 'Restoran ini belum mempunyai koordinat untuk arah.', removedSaved: 'Dikeluarkan daripada simpanan.', savedToBookmarks: 'Disimpan ke Bookmarks.'
  },
  tl: {
    restaurantFallbackName: 'Kainan', noAddress: 'Wala pang address', unknownDistance: 'Hindi pa alam', notUpdated: 'Hindi pa updated',
    detailLoading: 'Nilo-load ang detalye ng kainan...', detailLoadFailed: 'Hindi ma-load ang kainan', back: 'Bumalik', backToHome: 'Bumalik sa Home',
    closedNow: 'Sarado', currentlyClosed: 'Kasalukuyang sarado', reviewLabel: 'review', directions: 'Direksyon',
    saving: 'Sine-save...', savedRestaurant: 'Naka-save', saveRestaurant: 'I-save ang kainan', detailInfo: 'Detalye',
    distanceFromYou: 'Mula sa lokasyon mo', noTags: 'Wala pang tag', restaurantAudioTitle: 'Audio guide ng kainan',
    selectedLanguage: 'Napiling wika', audioPassAccess: 'AudioPass', audioLockedText: 'Mabubuksan ang buong audio guide pagkatapos i-activate ang premium AudioPass.',
    audioPassText: 'Pinapakinggan mo ang gabay ng kainan at pagkain sa napiling wika gamit ang AudioPass.', audioGuideTip: 'Tinutulungan ng gabay ang turista na maunawaan ang lugar, rekomendadong pagkain, at lokal na kultura ng pagkain.',
    recommendedDishesTitle: 'Mga rekomendadong pagkain', recommendedDishesDescription: 'Mga mungkahing menu ng kainan na may deskripsyon at audio sa napiling wika.',
    dishesLoadFailed: 'Hindi ma-load ang listahan ng pagkain. Maaari mo pa ring tingnan ang impormasyon ng kainan.', noDishDescription: 'Wala pang deskripsyon para sa pagkaing ito.',
    spicy: 'Maanghang', listenDish: 'Makinig sa gabay ng pagkain', cultureCornerTitle: 'Sulok ng kultura ng pagkain',
    cultureText: 'Ang mga lokal na kainan ay hindi lang lugar para kumain, kundi mabilis na paraan para maramdaman ang ritmo ng lungsod. Obserbahan kung paano umorder ang mga lokal at gumamit ng herbs at sawsawan.',
    localTip: 'Tip ng lokal', shouldTry: 'Subukan', localTipText: 'Tanungin ang staff kung ano ang best-seller ngayong araw at subukan ito kasama ng herbs o espesyal na sawsawan.',
    saveForLater: 'I-save para balikan mamaya', restaurantLocation: 'Lokasyon ng kainan', openFullMap: 'Buksan ang buong mapa',
    missingRestaurantId: 'Walang restaurant ID para i-load ang audio.', passActivated: 'Na-activate na ang AudioPass.',
    missingRestaurantNarration: 'Wala pang narration ang kainan na ito.', speechUnsupported: 'Hindi sinusuportahan ng browser mo ang speech narration.',
    missingDishIds: 'Walang restaurant o dish ID.', missingDishNarration: 'Wala pang narration ang pagkaing ito.',
    noCoordinates: 'Wala pang coordinates ang kainan para sa direksyon.', removedSaved: 'Inalis sa naka-save.', savedToBookmarks: 'Na-save sa Bookmarks.'
  }
};

const LIBRE_TRANSLATE_TOURIST_UI_TEXT = {
  de: {
    explore: 'Entdecken', map: 'Karte', bookmarks: 'Gespeichert', history: 'Verlauf',
    login: 'Anmelden', logout: 'Abmelden', title: 'Entdecken Sie die Aromen von',
    titleHighlight: 'Vietnam', subtitle: 'Finden Sie Restaurants in Ihrer Nähe und hören Sie Führungen in Ihrer Sprache.',
    currentLocation: 'Aktueller Standort:', useLocation: 'Meinen Standort verwenden', gettingLocation: 'Standort wird ermittelt...',
    search: 'Gerichte oder Restaurants suchen...', viewMap: 'Karte anzeigen', distance: 'Entfernung',
    price: 'Preis:', all: 'Alle', cheap: 'Günstig', medium: 'Mittel', high: 'Premium',
    openNow: 'Jetzt geöffnet', vegetarian: 'Vegetarisch', nonSpicy: 'Nicht scharf', spicy: 'Scharf', allergy: 'Allergie',
    nearby: 'Empfohlene Restaurants in Ihrer Nähe', viewAll: 'Alle anzeigen', show: 'Anzeigen', restaurants: 'Restaurants',
    previous: 'Zurück', next: 'Weiter', listen: 'Audioführung hören', highlights: 'Highlights:', noReviews: 'Noch keine Bewertungen',
    errInsecureContext: 'Geolokalisierung ist über HTTP mit lokaler IP nicht erlaubt. Bitte HTTPS oder einen HTTPS-Tunnel verwenden.',
    errPermissionDenied: 'Standortzugriff verweigert. Bitte in den Browser-Einstellungen erlauben und erneut versuchen.',
    errTimeout: 'Standortanfrage abgelaufen. Bitte erneut versuchen oder GPS prüfen.',
    errPositionUnavailable: 'Standortinformationen sind nicht verfügbar. Bitte GPS aktivieren oder erneut versuchen.',
    errGeolocationUnsupported: 'Dieser Browser unterstützt keine Geolokalisierung.',
    locationUpdated: 'Ihr Standort wurde aktualisiert.'
  },
  es: {
    explore: 'Explorar', map: 'Mapa', bookmarks: 'Guardados', history: 'Historial',
    login: 'Iniciar sesión', logout: 'Cerrar sesión', title: 'Descubre los sabores de',
    titleHighlight: 'Vietnam', subtitle: 'Encuentra restaurantes cercanos y escucha guías en tu idioma.',
    currentLocation: 'Ubicación actual:', useLocation: 'Usar mi ubicación', gettingLocation: 'Obteniendo ubicación...',
    search: 'Buscar platos o restaurantes...', viewMap: 'Ver mapa', distance: 'Distancia',
    price: 'Precio:', all: 'Todos', cheap: 'Económico', medium: 'Medio', high: 'Premium',
    openNow: 'Abierto ahora', vegetarian: 'Vegetariano', nonSpicy: 'No picante', spicy: 'Picante', allergy: 'Alergia',
    nearby: 'Restaurantes recomendados cerca de ti', viewAll: 'Ver todo', show: 'Mostrando', restaurants: 'restaurantes',
    previous: 'Anterior', next: 'Siguiente', listen: 'Escuchar guía', highlights: 'Destacados:', noReviews: 'Aún no hay reseñas',
    errInsecureContext: 'La geolocalización no está permitida por HTTP con IP local. Usa HTTPS o un túnel HTTPS.',
    errPermissionDenied: 'Permiso de ubicación denegado. Actívalo en el navegador e inténtalo de nuevo.',
    errTimeout: 'La solicitud de ubicación agotó el tiempo. Inténtalo de nuevo o revisa el GPS.',
    errPositionUnavailable: 'La información de ubicación no está disponible. Activa el GPS o inténtalo de nuevo.',
    errGeolocationUnsupported: 'Este navegador no admite geolocalización.',
    locationUpdated: 'Tu ubicación se ha actualizado.'
  },
  hi: {
    explore: 'खोजें', map: 'मानचित्र', bookmarks: 'सहेजे गए', history: 'इतिहास',
    login: 'लॉग इन', logout: 'लॉग आउट', title: 'स्वादों की खोज करें',
    titleHighlight: 'वियतनाम', subtitle: 'अपने पास रेस्तरां खोजें और अपनी भाषा में गाइड सुनें।',
    currentLocation: 'वर्तमान स्थान:', useLocation: 'मेरा स्थान उपयोग करें', gettingLocation: 'स्थान लिया जा रहा है...',
    search: 'व्यंजन या रेस्तरां खोजें...', viewMap: 'मानचित्र देखें', distance: 'दूरी',
    price: 'कीमत:', all: 'सभी', cheap: 'किफायती', medium: 'मध्यम', high: 'प्रीमियम',
    openNow: 'अभी खुला है', vegetarian: 'शाकाहारी', nonSpicy: 'कम मसालेदार', spicy: 'मसालेदार', allergy: 'एलर्जी',
    nearby: 'आपके पास सुझाए गए रेस्तरां', viewAll: 'सभी देखें', show: 'दिखा रहे हैं', restaurants: 'रेस्तरां',
    previous: 'पिछला', next: 'अगला', listen: 'ऑडियो गाइड सुनें', highlights: 'मुख्य व्यंजन:', noReviews: 'अभी कोई समीक्षा नहीं',
    errInsecureContext: 'लोकल IP पर HTTP के माध्यम से जियोलोकेशन की अनुमति नहीं है। HTTPS या HTTPS tunnel का उपयोग करें।',
    errPermissionDenied: 'स्थान अनुमति अस्वीकार हुई। ब्राउज़र सेटिंग में अनुमति दें और फिर प्रयास करें।',
    errTimeout: 'स्थान अनुरोध का समय समाप्त हुआ। फिर प्रयास करें या GPS जांचें।',
    errPositionUnavailable: 'स्थान जानकारी उपलब्ध नहीं है। GPS चालू करें या फिर प्रयास करें।',
    errGeolocationUnsupported: 'यह ब्राउज़र जियोलोकेशन का समर्थन नहीं करता।',
    locationUpdated: 'आपका स्थान अपडेट हो गया है।'
  }
};

const LIBRE_TRANSLATE_TOURIST_DETAIL_TEXT = {
  de: {
    restaurantFallbackName: 'Restaurant', noAddress: 'Noch keine Adresse', unknownDistance: 'Unbekannt', notUpdated: 'Nicht aktualisiert',
    detailLoading: 'Restaurantdetails werden geladen...', detailLoadFailed: 'Restaurant konnte nicht geladen werden', back: 'Zurück', backToHome: 'Zurück zur Startseite',
    closedNow: 'Geschlossen', currentlyClosed: 'Derzeit geschlossen', reviewLabel: 'Bewertungen', directions: 'Route',
    saving: 'Speichern...', savedRestaurant: 'Gespeichert', saveRestaurant: 'Restaurant speichern', detailInfo: 'Details',
    distanceFromYou: 'Von Ihrem Standort', noTags: 'Noch keine Tags', restaurantAudioTitle: 'Audioführung zum Restaurant',
    selectedLanguage: 'Ausgewählte Sprache', audioPassAccess: 'AudioPass', audioLockedText: 'Die vollständige Audioführung wird nach Aktivierung des Premium-AudioPass freigeschaltet.',
    audioPassText: 'Mit dem AudioPass hören Sie Restaurant- und Gerichtführungen in der gewählten Sprache.', audioGuideTip: 'Die Führung hilft Reisenden, Ort, empfohlene Gerichte und lokale Esskultur schnell zu verstehen.',
    recommendedDishesTitle: 'Empfohlene Gerichte', recommendedDishesDescription: 'Vorschläge des Restaurants mit Beschreibung und Audioführung in Ihrer Sprache.',
    dishesLoadFailed: 'Gerichte konnten nicht geladen werden. Sie können die Restaurantinformationen weiterhin ansehen.', noDishDescription: 'Für dieses Gericht gibt es noch keine Beschreibung.',
    spicy: 'Scharf', listenDish: 'Gerichtführung hören', cultureCornerTitle: 'Ecke der Esskultur',
    cultureText: 'Lokale Restaurants sind nicht nur Orte zum Essen, sondern auch ein schneller Weg, den Rhythmus der Stadt zu spüren.',
    localTip: 'Lokaler Tipp', shouldTry: 'Probieren', localTipText: 'Fragen Sie nach dem meistverkauften Gericht des Tages und probieren Sie es mit Kräutern oder typischer Sauce.',
    saveForLater: 'Für später speichern', restaurantLocation: 'Restaurantstandort', openFullMap: 'Vollständige Karte öffnen',
    missingRestaurantId: 'Restaurant-ID für Audioführung fehlt.', passActivated: 'AudioPass wurde aktiviert.',
    missingRestaurantNarration: 'Dieses Restaurant hat noch keine Führung.', speechUnsupported: 'Ihr Browser unterstützt keine Sprachausgabe.',
    missingDishIds: 'Restaurant- oder Gericht-ID fehlt.', missingDishNarration: 'Dieses Gericht hat noch keine Führung.',
    noCoordinates: 'Dieses Restaurant hat keine Koordinaten für die Route.', removedSaved: 'Aus gespeicherten Orten entfernt.', savedToBookmarks: 'In Bookmarks gespeichert.'
  },
  es: {
    restaurantFallbackName: 'Restaurante', noAddress: 'Sin dirección todavía', unknownDistance: 'Desconocido', notUpdated: 'No actualizado',
    detailLoading: 'Cargando detalles del restaurante...', detailLoadFailed: 'No se pudo cargar el restaurante', back: 'Volver', backToHome: 'Volver al inicio',
    closedNow: 'Cerrado', currentlyClosed: 'Actualmente cerrado', reviewLabel: 'reseñas', directions: 'Cómo llegar',
    saving: 'Guardando...', savedRestaurant: 'Guardado', saveRestaurant: 'Guardar restaurante', detailInfo: 'Detalles',
    distanceFromYou: 'Desde tu ubicación', noTags: 'Sin etiquetas', restaurantAudioTitle: 'Guía de audio del restaurante',
    selectedLanguage: 'Idioma seleccionado', audioPassAccess: 'AudioPass', audioLockedText: 'La guía de audio completa se desbloquea al activar el AudioPass premium.',
    audioPassText: 'El AudioPass permite escuchar guías del restaurante y platos en el idioma elegido.', audioGuideTip: 'La guía ayuda a entender rápidamente el lugar, los platos recomendados y la cultura culinaria local.',
    recommendedDishesTitle: 'Platos recomendados', recommendedDishesDescription: 'Sugerencias del restaurante con descripción y audio en tu idioma.',
    dishesLoadFailed: 'No se pudieron cargar los platos. Aún puedes ver la información del restaurante.', noDishDescription: 'Este plato aún no tiene descripción.',
    spicy: 'Picante', listenDish: 'Escuchar guía del plato', cultureCornerTitle: 'Rincón de cultura gastronómica',
    cultureText: 'Los restaurantes locales no son solo lugares para comer, también son una forma rápida de sentir el ritmo de la ciudad.',
    localTip: 'Consejo local', shouldTry: 'Prueba', localTipText: 'Pregunta al personal por el plato más vendido del día y pruébalo con hierbas o salsa típica.',
    saveForLater: 'Guardar para más tarde', restaurantLocation: 'Ubicación del restaurante', openFullMap: 'Abrir mapa completo',
    missingRestaurantId: 'Falta el ID del restaurante para la guía de audio.', passActivated: 'AudioPass activado.',
    missingRestaurantNarration: 'Este restaurante aún no tiene narración.', speechUnsupported: 'Tu navegador no admite narración por voz.',
    missingDishIds: 'Falta el ID del restaurante o del plato.', missingDishNarration: 'Este plato aún no tiene narración.',
    noCoordinates: 'Este restaurante no tiene coordenadas para la ruta.', removedSaved: 'Eliminado de guardados.', savedToBookmarks: 'Guardado en Bookmarks.'
  },
  hi: {
    restaurantFallbackName: 'रेस्तरां', noAddress: 'अभी पता नहीं है', unknownDistance: 'अज्ञात', notUpdated: 'अपडेट नहीं',
    detailLoading: 'रेस्तरां विवरण लोड हो रहा है...', detailLoadFailed: 'रेस्तरां लोड नहीं हो सका', back: 'वापस', backToHome: 'Home पर वापस',
    closedNow: 'बंद', currentlyClosed: 'अभी बंद है', reviewLabel: 'समीक्षाएँ', directions: 'दिशा-निर्देश',
    saving: 'सहेज रहा है...', savedRestaurant: 'सहेजा गया', saveRestaurant: 'रेस्तरां सहेजें', detailInfo: 'विवरण',
    distanceFromYou: 'आपके स्थान से', noTags: 'अभी कोई टैग नहीं', restaurantAudioTitle: 'रेस्तरां ऑडियो गाइड',
    selectedLanguage: 'चुनी गई भाषा', audioPassAccess: 'AudioPass', audioLockedText: 'पूर्ण ऑडियो गाइड प्रीमियम AudioPass सक्रिय करने के बाद खुलती है।',
    audioPassText: 'AudioPass से आप चुनी गई भाषा में रेस्तरां और व्यंजन गाइड सुन सकते हैं।', audioGuideTip: 'यह गाइड यात्रियों को स्थान, सुझाए गए व्यंजन और स्थानीय भोजन संस्कृति जल्दी समझने में मदद करती है।',
    recommendedDishesTitle: 'सुझाए गए व्यंजन', recommendedDishesDescription: 'रेस्तरां के सुझाए गए मेनू, विवरण और आपकी भाषा में ऑडियो के साथ।',
    dishesLoadFailed: 'व्यंजन सूची लोड नहीं हो सकी। आप फिर भी रेस्तरां जानकारी देख सकते हैं।', noDishDescription: 'इस व्यंजन का विवरण अभी नहीं है।',
    spicy: 'मसालेदार', listenDish: 'व्यंजन गाइड सुनें', cultureCornerTitle: 'भोजन संस्कृति कोना',
    cultureText: 'स्थानीय रेस्तरां सिर्फ खाने की जगह नहीं हैं, बल्कि शहर की लय महसूस करने का आसान तरीका भी हैं।',
    localTip: 'स्थानीय सुझाव', shouldTry: 'ज़रूर चखें', localTipText: 'स्टाफ से आज का सबसे लोकप्रिय व्यंजन पूछें और उसे जड़ी-बूटियों या खास सॉस के साथ चखें।',
    saveForLater: 'बाद के लिए सहेजें', restaurantLocation: 'रेस्तरां स्थान', openFullMap: 'पूरा मानचित्र खोलें',
    missingRestaurantId: 'ऑडियो गाइड के लिए रेस्तरां ID नहीं है।', passActivated: 'AudioPass सक्रिय हो गया है।',
    missingRestaurantNarration: 'इस रेस्तरां में अभी narration नहीं है।', speechUnsupported: 'आपका ब्राउज़र speech narration का समर्थन नहीं करता।',
    missingDishIds: 'रेस्तरां या व्यंजन ID नहीं है।', missingDishNarration: 'इस व्यंजन में अभी narration नहीं है।',
    noCoordinates: 'इस रेस्तरां में दिशा-निर्देश के लिए coordinates नहीं हैं।', removedSaved: 'सहेजे गए से हटाया गया।', savedToBookmarks: 'Bookmarks में सहेजा गया।'
  }
};

Object.assign(UI_TEXT, SOUTHEAST_ASIA_UI_TEXT, LIBRE_TRANSLATE_TOURIST_UI_TEXT);
Object.assign(DETAIL_UI_TEXT, SOUTHEAST_ASIA_DETAIL_TEXT, LIBRE_TRANSLATE_TOURIST_DETAIL_TEXT);

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
  return (
    UI_TEXT[language]?.[key] ||
    DETAIL_UI_TEXT[language]?.[key] ||
    UI_TEXT.en[key] ||
    DETAIL_UI_TEXT.en[key] ||
    key
  );
}
