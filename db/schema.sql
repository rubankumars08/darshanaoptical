-- ============================================================
-- Darshana Optical — Full Database Schema
-- Run against TiDB Cloud (MySQL-compatible)
-- ============================================================

-- ─── Users (Admin Staff) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,          -- scrypt$N$r$p$salt$key
  role          ENUM('admin','manager','staff') NOT NULL DEFAULT 'staff',
  phone         VARCHAR(20),
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  -- Bumped on password/role/status change to invalidate that user's cookies.
  token_version INT NOT NULL DEFAULT 0,
  joined_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active   DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Customers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          VARCHAR(36)  PRIMARY KEY,
  customer_id VARCHAR(20)  UNIQUE NOT NULL,     -- DO-2026-001 format
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  email       VARCHAR(255),
  dob         DATE,
  gender      ENUM('male','female','other'),
  address     TEXT,
  notes       TEXT,
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  last_visit  DATETIME,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_name  (name)
);

-- ─── Eye Tests / Prescriptions ───────────────────────────────
CREATE TABLE IF NOT EXISTS eye_tests (
  id                  VARCHAR(36)  PRIMARY KEY,
  customer_id         VARCHAR(36)  NOT NULL,
  customer_name       VARCHAR(255) NOT NULL,
  customer_phone      VARCHAR(20)  NOT NULL,
  test_date           DATE         NOT NULL,
  tested_by           VARCHAR(255) NOT NULL,
  -- Right Eye
  re_sph              VARCHAR(10),
  re_cyl              VARCHAR(10),
  re_axis             VARCHAR(10),
  re_add              VARCHAR(10),
  re_pd               VARCHAR(10),
  -- Left Eye
  le_sph              VARCHAR(10),
  le_cyl              VARCHAR(10),
  le_axis             VARCHAR(10),
  le_add              VARCHAR(10),
  le_pd               VARCHAR(10),
  -- Visual Acuity
  visual_acuity_right VARCHAR(20),
  visual_acuity_left  VARCHAR(20),
  recommendation      TEXT,
  notes               TEXT,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  VARCHAR(36)   PRIMARY KEY,
  product_code        VARCHAR(50)   UNIQUE NOT NULL,
  name                VARCHAR(255)  NOT NULL,
  brand               VARCHAR(255)  NOT NULL,
  model               VARCHAR(255),
  category            ENUM('frame','lens','sunglass','accessory','service') NOT NULL,
  color               VARCHAR(100),
  size                VARCHAR(100),
  material            VARCHAR(100),
  purchase_price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp                 DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock               INT           NOT NULL DEFAULT 0,
  low_stock_threshold INT           NOT NULL DEFAULT 5,
  image_url           TEXT,
  description         TEXT,
  status              ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_brand    (brand)
);

-- ─── Invoices ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id               VARCHAR(36)   PRIMARY KEY,
  invoice_number   VARCHAR(30)   UNIQUE NOT NULL,
  customer_id      VARCHAR(36)   NOT NULL,
  customer_name    VARCHAR(255)  NOT NULL,
  customer_phone   VARCHAR(20)   NOT NULL,
  eye_test_id      VARCHAR(36),
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2)  NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid             DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance          DECIMAL(10,2) NOT NULL DEFAULT 0,
  status           ENUM('paid','partially_paid','pending','cancelled') NOT NULL DEFAULT 'pending',
  order_status     ENUM('new','lens_ordered','in_process','ready','delivered','cancelled'),
  frame_product    VARCHAR(255),
  lens_product     VARCHAR(255),
  expected_date    DATE,
  delivered_at     DATETIME,
  created_by       VARCHAR(255)  NOT NULL,
  notes            TEXT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer    (customer_id),
  INDEX idx_status      (status),
  INDEX idx_order_status(order_status),
  INDEX idx_created_at  (created_at)
);

-- ─── Invoice Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id           VARCHAR(36)   PRIMARY KEY,
  invoice_id   VARCHAR(36)   NOT NULL,
  product_id   VARCHAR(36)   NOT NULL,
  product_name VARCHAR(255)  NOT NULL,
  product_code VARCHAR(50)   NOT NULL,
  category     ENUM('frame','lens','sunglass','accessory','service') NOT NULL,
  quantity     INT           NOT NULL DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL,
  discount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  total        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ─── Payments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id           VARCHAR(36)   PRIMARY KEY,
  invoice_id   VARCHAR(36)   NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  method       ENUM('cash','upi','card','bank') NOT NULL,
  payment_date DATETIME      NOT NULL,
  notes        TEXT,
  received_by  VARCHAR(255)  NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ─── Suppliers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             VARCHAR(36)   PRIMARY KEY,
  name           VARCHAR(255)  NOT NULL,
  contact_person VARCHAR(255),
  phone          VARCHAR(20)   NOT NULL,
  email          VARCHAR(255),
  address        TEXT,
  gst            VARCHAR(20),
  balance        DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Purchases ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id                  VARCHAR(36)   PRIMARY KEY,
  purchase_number     VARCHAR(30)   UNIQUE NOT NULL,
  supplier_id         VARCHAR(36)   NOT NULL,
  supplier_name       VARCHAR(255)  NOT NULL,
  supplier_bill_number VARCHAR(100),
  total               DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid                DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance             DECIMAL(10,2) NOT NULL DEFAULT 0,
  status              ENUM('paid','partially_paid','pending') NOT NULL DEFAULT 'pending',
  created_by          VARCHAR(255)  NOT NULL,
  notes               TEXT,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── Purchase Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_items (
  id             VARCHAR(36)   PRIMARY KEY,
  purchase_id    VARCHAR(36)   NOT NULL,
  product_id     VARCHAR(36)   NOT NULL,
  product_name   VARCHAR(255)  NOT NULL,
  product_code   VARCHAR(50)   NOT NULL,
  quantity       INT           NOT NULL DEFAULT 1,
  purchase_price DECIMAL(10,2) NOT NULL,
  total          DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
);

-- ─── Expenses ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id             VARCHAR(36)   PRIMARY KEY,
  expense_date   DATE          NOT NULL,
  category       ENUM('rent','electricity','salary','transport','maintenance','marketing','supplies','other') NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','upi','card','bank') NOT NULL,
  description    TEXT          NOT NULL,
  reference      VARCHAR(255),
  created_by     VARCHAR(255)  NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date     (expense_date),
  INDEX idx_category (category)
);

-- ─── Stock Movements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id           VARCHAR(36) PRIMARY KEY,
  product_id   VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(50)  NOT NULL,
  type         ENUM('purchase','sale','damage','return','adjustment') NOT NULL,
  quantity     INT NOT NULL,               -- positive = in, negative = out
  reason       TEXT,
  reference    VARCHAR(255),
  created_by   VARCHAR(255) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_date    (created_at)
);

-- ─── Audit Logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id                VARCHAR(36) PRIMARY KEY,
  action            VARCHAR(255) NOT NULL,
  entity            VARCHAR(100) NOT NULL,
  entity_id         VARCHAR(36),
  details           TEXT         NOT NULL,
  performed_by      VARCHAR(255) NOT NULL,
  performed_by_role ENUM('admin','manager','staff') NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity     (entity),
  INDEX idx_created_at (created_at)
);

-- ─── Shop Settings (single row) ──────────────────────────────
CREATE TABLE IF NOT EXISTS shop_settings (
  id                   INT     PRIMARY KEY DEFAULT 1,
  shop_name            VARCHAR(255) NOT NULL DEFAULT 'Darshana Optical',
  tagline              VARCHAR(255) DEFAULT 'Quality eye care for a better life',
  phone                VARCHAR(20)  DEFAULT '8870571536',
  whatsapp             VARCHAR(20)  DEFAULT '918870571536',
  email                VARCHAR(255) DEFAULT 'darshanaoptical31@gmail.com',
  address              VARCHAR(512),
  city                 VARCHAR(100) DEFAULT 'Harur',
  state                VARCHAR(100) DEFAULT 'Tamil Nadu',
  pincode              VARCHAR(10)  DEFAULT '636903',
  gst                  VARCHAR(20)  DEFAULT '',
  invoice_prefix       VARCHAR(10)  DEFAULT 'DO',
  customer_id_prefix   VARCHAR(10)  DEFAULT 'DO',
  low_stock_threshold  INT          DEFAULT 5,
  tax_enabled          BOOLEAN      DEFAULT FALSE,
  tax_rate             DECIMAL(5,2) DEFAULT 0,
  invoice_footer       VARCHAR(512),
  invoice_terms        VARCHAR(512),
  max_discount_admin   INT          DEFAULT 100,
  max_discount_manager INT          DEFAULT 15,
  max_discount_staff   INT          DEFAULT 5,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default settings row
INSERT IGNORE INTO shop_settings
  (id, shop_name, tagline, phone, whatsapp, email, address, city, state, pincode,
   invoice_prefix, customer_id_prefix, low_stock_threshold, tax_enabled, tax_rate,
   invoice_footer, invoice_terms, max_discount_admin, max_discount_manager, max_discount_staff)
VALUES
  (1, 'Darshana Optical', 'Quality eye care for a better life',
   '8870571536', '918870571536', 'darshanaoptical31@gmail.com',
   'Tvk nagar, Salem Bypass Road, Harur – 636903',
   'Harur', 'Tamil Nadu', '636903',
   'DO', 'DO', 5, FALSE, 0,
   'Thank you for choosing Darshana Optical!',
   'Goods once sold will not be taken back.',
   100, 15, 5);

-- ─── Login throttle ──────────────────────────────────────────
-- Brute-force counter, keyed by 'email:<address>' and 'ip:<addr>'.
-- Kept in the database so the limit survives across app instances.
CREATE TABLE IF NOT EXISTS login_attempts (
  identifier     VARCHAR(190) PRIMARY KEY,
  attempts       INT NOT NULL DEFAULT 0,
  last_failed_at DATETIME NULL,
  locked_until   DATETIME NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Document counters ───────────────────────────────────────
-- Invoice / purchase numbering. Incremented under a row lock inside the same
-- transaction as the document itself, so concurrent sales cannot reuse a number.
CREATE TABLE IF NOT EXISTS counters (
  name  VARCHAR(64) PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0
);

-- ─── Appointments (public eye-test booking form) ─────────────
-- Written by POST /api/appointments from the website booking form.
CREATE TABLE IF NOT EXISTS appointments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(255),
  preferred_date DATE,
  preferred_time VARCHAR(50),
  test_type      VARCHAR(100) NOT NULL DEFAULT 'Eye Testing',
  wears_glasses  VARCHAR(10)  NOT NULL DEFAULT 'No',
  notes          TEXT,
  status         ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status  (status),
  INDEX idx_created (created_at)
);

-- ─── Inquiries (public contact form) ─────────────────────────
-- Written by POST /api/inquiries from the contact page.
CREATE TABLE IF NOT EXISTS inquiries (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  email      VARCHAR(255),
  interest   VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
  message    TEXT,
  status     ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status  (status),
  INDEX idx_created (created_at)
);
