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
