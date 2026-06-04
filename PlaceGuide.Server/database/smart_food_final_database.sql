-- =============================================================
-- DATABASE: Smart Food Travel Web App
-- Scope: Tourist - Restaurant/Owner - Admin
-- DBMS: PostgreSQL
-- Notes:
--   This script is designed for an academic project.
--   It keeps the system complete but avoids overly commercial complexity.
-- =============================================================

DROP SCHEMA IF EXISTS smart_food CASCADE;
CREATE SCHEMA smart_food;
SET search_path TO smart_food;

-- =============================================================
-- 1. MASTER DATA AND USER MANAGEMENT
-- =============================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    exchange_to_vnd NUMERIC(18,4),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'LOCKED', 'PENDING', 'DELETED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferred_language_id INT REFERENCES languages(id),
    nationality VARCHAR(100),
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE,
    note TEXT
);

-- =============================================================
-- 2. RESTAURANT MANAGEMENT
-- =============================================================

CREATE TABLE restaurants (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    phone VARCHAR(30),
    email VARCHAR(150),
    price_range VARCHAR(20) DEFAULT 'MEDIUM'
        CHECK (price_range IN ('LOW', 'MEDIUM', 'HIGH', 'PREMIUM')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant_images (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(30) NOT NULL DEFAULT 'OTHER'
        CHECK (image_type IN ('AVATAR', 'COVER', 'OUTSIDE', 'INSIDE', 'FOOD', 'OTHER')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant_opening_hours (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (restaurant_id, day_of_week)
);

CREATE TABLE restaurant_special_closures (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    closure_date DATE NOT NULL,
    reason TEXT,
    UNIQUE (restaurant_id, closure_date)
);

CREATE TABLE restaurant_translations (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    language_id INT NOT NULL REFERENCES languages(id),
    translated_name VARCHAR(200),
    translated_description TEXT,
    UNIQUE (restaurant_id, language_id)
);

-- Simplified OCR requirement: only store uploaded menu files.
-- The real OCR processing result is not modeled as a separate module.
CREATE TABLE menu_uploads (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    uploaded_by BIGINT REFERENCES users(id),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(30) CHECK (file_type IN ('IMAGE', 'PDF', 'DOCX', 'OTHER')),
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED'
        CHECK (status IN ('UPLOADED', 'PROCESSED', 'REJECTED')),
    note TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 3. MENU AND DISH MANAGEMENT
-- =============================================================

CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE dishes (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_id BIGINT REFERENCES menus(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price_vnd NUMERIC(12,2) NOT NULL CHECK (price_vnd >= 0),
    preparation_time_minutes INT CHECK (preparation_time_minutes >= 0),
    calories INT CHECK (calories >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'HIDDEN', 'DELETED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dish_images (
    id BIGSERIAL PRIMARY KEY,
    dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dish_translations (
    id BIGSERIAL PRIMARY KEY,
    dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    language_id INT NOT NULL REFERENCES languages(id),
    translated_name VARCHAR(200),
    translated_description TEXT,
    UNIQUE (dish_id, language_id)
);

-- =============================================================
-- 4. ALLERGENS AND DIETARY SUPPORT
-- =============================================================

CREATE TABLE allergens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE dish_allergens (
    dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    allergen_id INT NOT NULL REFERENCES allergens(id),
    note TEXT,
    PRIMARY KEY (dish_id, allergen_id)
);

CREATE TABLE dietary_tags (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE dish_dietary_tags (
    dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    dietary_tag_id INT NOT NULL REFERENCES dietary_tags(id),
    PRIMARY KEY (dish_id, dietary_tag_id)
);

-- =============================================================
-- 5. AUDIO INTRODUCTION FOR RESTAURANTS AND DISHES
-- =============================================================

CREATE TABLE audio_files (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('RESTAURANT', 'DISH')),
    target_id BIGINT NOT NULL,
    language_id INT NOT NULL REFERENCES languages(id),
    title VARCHAR(200),
    audio_url TEXT NOT NULL,
    duration_seconds INT CHECK (duration_seconds >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (target_type, target_id, language_id)
);

-- =============================================================
-- 6. CUSTOMER INTERACTION, FAVORITES, CART AND ORDERS
-- =============================================================

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('RESTAURANT', 'DISH')),
    target_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ORDERED', 'ABANDONED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    dish_id BIGINT NOT NULL REFERENCES dishes(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id),
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(30),
    customer_email VARCHAR(150),
    table_number VARCHAR(30),
    order_type VARCHAR(20) NOT NULL DEFAULT 'DINE_IN'
        CHECK (order_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
        CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    dish_id BIGINT REFERENCES dishes(id) ON DELETE SET NULL,
    dish_name_snapshot VARCHAR(200) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    note TEXT
);

-- =============================================================
-- 7. PAYMENT
-- =============================================================

CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id INT NOT NULL REFERENCES payment_methods(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')),
    transaction_code VARCHAR(100),
    qr_code_url TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 8. REVIEWS
-- =============================================================

CREATE TABLE restaurant_reviews (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE'
        CHECK (status IN ('VISIBLE', 'HIDDEN', 'PENDING')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dish_reviews (
    id BIGSERIAL PRIMARY KEY,
    dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE'
        CHECK (status IN ('VISIBLE', 'HIDDEN', 'PENDING')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 9. NOTIFICATIONS AND ADMIN AUDIT
-- =============================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_menus_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_dishes_updated_at
BEFORE UPDATE ON dishes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- 11. INDEXES
-- =============================================================

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurant_images_restaurant ON restaurant_images(restaurant_id);
CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX idx_dishes_menu ON dishes(menu_id);
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available, status);
CREATE INDEX idx_dish_translations_language ON dish_translations(language_id);
CREATE INDEX idx_audio_target ON audio_files(target_type, target_id);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_orders_restaurant_created ON orders(restaurant_id, created_at);
CREATE INDEX idx_orders_status ON orders(status, payment_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_dish ON order_items(dish_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX idx_dish_reviews_dish ON dish_reviews(dish_id);

-- =============================================================
-- 12. REPORTING VIEWS FOR RESTAURANT DASHBOARD
-- These are not physical statistic tables. They calculate reports from
-- orders, order_items, payments and reviews so data stays consistent.
-- =============================================================

CREATE OR REPLACE VIEW v_restaurant_daily_revenue AS
SELECT
    o.restaurant_id,
    DATE(o.created_at) AS revenue_date,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM orders o
WHERE o.status = 'COMPLETED'
  AND o.payment_status = 'PAID'
GROUP BY o.restaurant_id, DATE(o.created_at);

CREATE OR REPLACE VIEW v_restaurant_monthly_revenue AS
SELECT
    o.restaurant_id,
    DATE_TRUNC('month', o.created_at)::DATE AS revenue_month,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue
FROM orders o
WHERE o.status = 'COMPLETED'
  AND o.payment_status = 'PAID'
GROUP BY o.restaurant_id, DATE_TRUNC('month', o.created_at)::DATE;

CREATE OR REPLACE VIEW v_restaurant_best_selling_dishes AS
SELECT
    o.restaurant_id,
    oi.dish_id,
    oi.dish_name_snapshot,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.total_price) AS total_revenue
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'COMPLETED'
  AND o.payment_status = 'PAID'
GROUP BY o.restaurant_id, oi.dish_id, oi.dish_name_snapshot;

CREATE OR REPLACE VIEW v_restaurant_rating_summary AS
SELECT
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    COUNT(rr.id) AS total_reviews,
    ROUND(AVG(rr.rating)::NUMERIC, 2) AS average_rating
FROM restaurants r
LEFT JOIN restaurant_reviews rr
    ON rr.restaurant_id = r.id AND rr.status = 'VISIBLE'
GROUP BY r.id, r.name;

CREATE OR REPLACE VIEW v_dish_rating_summary AS
SELECT
    d.id AS dish_id,
    d.restaurant_id,
    d.name AS dish_name,
    COUNT(dr.id) AS total_reviews,
    ROUND(AVG(dr.rating)::NUMERIC, 2) AS average_rating
FROM dishes d
LEFT JOIN dish_reviews dr
    ON dr.dish_id = d.id AND dr.status = 'VISIBLE'
GROUP BY d.id, d.restaurant_id, d.name;

CREATE OR REPLACE VIEW v_restaurant_dashboard_summary AS
WITH order_stats AS (
    SELECT
        restaurant_id,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'COMPLETED' AND payment_status = 'PAID'), 0) AS total_revenue
    FROM orders
    GROUP BY restaurant_id
),
dish_stats AS (
    SELECT
        restaurant_id,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_dishes
    FROM dishes
    GROUP BY restaurant_id
),
review_stats AS (
    SELECT
        restaurant_id,
        COUNT(*) FILTER (WHERE status = 'VISIBLE') AS total_reviews,
        ROUND((AVG(rating) FILTER (WHERE status = 'VISIBLE'))::NUMERIC, 2) AS average_rating
    FROM restaurant_reviews
    GROUP BY restaurant_id
)
SELECT
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    COALESCE(os.completed_orders, 0) AS completed_orders,
    COALESCE(os.pending_orders, 0) AS pending_orders,
    COALESCE(os.total_revenue, 0) AS total_revenue,
    COALESCE(ds.active_dishes, 0) AS active_dishes,
    COALESCE(rs.total_reviews, 0) AS total_reviews,
    rs.average_rating
FROM restaurants r
LEFT JOIN order_stats os ON os.restaurant_id = r.id
LEFT JOIN dish_stats ds ON ds.restaurant_id = r.id
LEFT JOIN review_stats rs ON rs.restaurant_id = r.id;

-- =============================================================
-- 13. SEED DATA
-- =============================================================

INSERT INTO roles (code, name, description) VALUES
('ADMIN', 'Quản trị viên', 'Quản lý toàn bộ hệ thống'),
('RESTAURANT_OWNER', 'Chủ quán ăn', 'Quản lý thông tin quán, menu, món ăn và đơn hàng'),
('TOURIST', 'Khách du lịch', 'Xem quán, xem món, đặt món, thanh toán và đánh giá');

INSERT INTO languages (code, name) VALUES
('vi', 'Tiếng Việt'),
('en', 'English'),
('ko', '한국어'),
('ja', '日本語'),
('zh', '中文'),
('fr', 'Français'),
('de', 'Deutsch');

INSERT INTO currencies (code, name, symbol, exchange_to_vnd, is_default) VALUES
('VND', 'Vietnamese Dong', '₫', 1, TRUE),
('USD', 'US Dollar', '$', 25000, FALSE),
('EUR', 'Euro', '€', 27000, FALSE),
('JPY', 'Japanese Yen', '¥', 170, FALSE),
('KRW', 'Korean Won', '₩', 18, FALSE),
('CNY', 'Chinese Yuan', '¥', 3500, FALSE);

INSERT INTO allergens (name, description) VALUES
('Peanut', 'Lạc hoặc đậu phộng'),
('Tree Nuts', 'Các loại hạt cây'),
('Egg', 'Trứng'),
('Milk', 'Sữa và sản phẩm từ sữa'),
('Soy', 'Đậu nành'),
('Wheat/Gluten', 'Lúa mì hoặc gluten'),
('Seafood', 'Hải sản'),
('Fish', 'Cá'),
('Shellfish', 'Tôm, cua, sò, ốc');

INSERT INTO dietary_tags (code, name, description) VALUES
('VEGETARIAN', 'Vegetarian', 'Món phù hợp người ăn chay'),
('VEGAN', 'Vegan', 'Món thuần chay'),
('HALAL', 'Halal', 'Món phù hợp tiêu chuẩn Halal'),
('KOSHER', 'Kosher', 'Món phù hợp tiêu chuẩn Kosher'),
('GLUTEN_FREE', 'Gluten Free', 'Món không chứa gluten'),
('SPICY', 'Spicy', 'Món cay'),
('POPULAR', 'Popular', 'Món được nhiều khách chọn');

INSERT INTO payment_methods (code, name) VALUES
('CASH', 'Tiền mặt'),
('VIETQR', 'VietQR'),
('MOMO', 'MoMo'),
('ZALOPAY', 'ZaloPay'),
('CARD', 'Thẻ quốc tế');
