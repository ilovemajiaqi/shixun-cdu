CREATE DATABASE IF NOT EXISTS huangshan_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE huangshan_tourism;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attractions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10, 2),
    opening_hours VARCHAR(100),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    attraction_id BIGINT,
    content TEXT,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (attraction_id) REFERENCES attractions(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    item_id BIGINT,
    item_type VARCHAR(20), -- 'ATTRACTION', 'ROUTE', 'HOTEL'
    booking_date DATE,
    status VARCHAR(20), -- 'PENDING', 'CONFIRMED', 'CANCELLED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Data
INSERT INTO users (username, password, email, role) VALUES ('admin', '123456', 'admin@example.com', 'ADMIN');
INSERT INTO users (username, password, email, role) VALUES ('user', '123456', 'user@example.com', 'USER');

INSERT INTO attractions (name, description, image_url, price, opening_hours, category) VALUES 
('迎客松', '黄山标志性景观，树龄至少已有800年，黄山“四绝”之一。', 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 0.00, '全天', '黄山风景区'),
('光明顶', '黄山第二高峰，海拔1860米，是看日出、观云海的最佳地点之一。', 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 0.00, '全天', '黄山风景区'),
('飞来石', '重约360吨，形态奇特，似从天外飞来，又名“飞来峰”。', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop', 0.00, '全天', '黄山风景区');

INSERT INTO routes (name, description, duration, price) VALUES 
('黄山一日游精华线', '包含迎客松、光明顶、飞来石等核心景点。', '1天', 190.00),
('黄山二日游深度线', '深度游览黄山全景，包含住宿一晚。', '2天', 580.00);
