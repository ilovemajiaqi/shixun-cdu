CREATE DATABASE IF NOT EXISTS chengdu_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chengdu_tourism;

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
('宽窄巷子', '由宽巷子、窄巷子、井巷子三条平行老街组成，成都遗留下来的较成规模的清朝古街道。', '/images/chengdu/kuanzhai.jpg', 0.00, '全天开放', '市区经典'),
('成都大熊猫繁育研究基地', '世界最大的大熊猫迁地保护与繁育基地，可近距离观察大熊猫。', '/images/chengdu/panda-base.jpg', 55.00, '07:30 - 18:00', '熊猫生态'),
('都江堰', '战国时期李冰主持修建的宏大水利工程，至今仍在灌溉成都平原，世界文化遗产。', '/images/chengdu/dujiangyan.jpg', 80.00, '08:00 - 18:00', '世界遗产');

INSERT INTO routes (name, description, duration, price) VALUES 
('天府经典一日游', '串联宽窄巷子、人民公园、锦里古街，体验最地道的成都慢生活。', '1天', 190.00),
('熊猫与古迹深度线', '深度游览大熊猫基地、武侯祠与杜甫草堂，人文与生态兼具。', '2天', 580.00);
