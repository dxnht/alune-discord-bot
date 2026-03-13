# 🌙 Alune Bot

**Alune Bot** là một Discord Bot được thiết kế để cung cấp thông tin các Tướng Liên Minh Huyền Thoại. Được xây dựng trên nền tảng **Cloudflare Workers (Serverless)**, Alune Bot hoạt động với tốc độ cực nhanh, ổn định và hoàn toàn miễn phí.

---

## ✨ Tính năng nổi bật

### 🎭 Random Tướng Thông Minh
*   **Lệnh:** `/random [role]`
*   Lấy ngẫu nhiên một vị tướng dựa trên vị trí bạn chọn (Top, Jungle, Mid, Bot, Support).

### 🖼️ Album Trang Phục Tương Tác
*   **Lệnh:** `/skins [name]`
*   Hiển thị kho trang phục LMHT ngay trong Discord
*   Sử dụng nút **"Trước"** và **"Sau"** để lướt xem toàn bộ Splash Art chất lượng cao của vị tướng đó.

### 📚 Thông Tin Chi Tiết
*   **Lệnh:** `/champion [name]`
*   Xem chi tiết về danh hiệu, vai trò và cốt truyện (Lore) của từng vị tướng.

### 🌍 Đa Ngôn Ngữ (VI/EN)
*   **Lệnh:** `/language [lang]`
*   Hỗ trợ hoàn hảo cả tiếng Việt và tiếng Anh.
*   Bot tự động ghi nhớ tùy chọn ngôn ngữ của từng người dùng
---

## 🛠️ Công Nghệ Sử Dụng

*   **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) (Edge Computing).
*   **Language:** JavaScript (ES Modules).
*   **Database:** [Cloudflare KV](https://www.cloudflare.com/products/workers-kv/) (Lưu trữ cache dữ liệu tướng và tùy chỉnh người dùng).
*   **API:** Riot Games Data Dragon.
*   **Security:** Xác thực chữ ký bằng **Web Crypto API** thuần túy (Ed25519).

---

## 🚀 Hướng Dẫn Cài Đặt (Cho Nhà Phát Triển)

### 1. Yêu cầu hệ thống
*   Node.js & npm.
*   Tài khoản Cloudflare và Discord Developer.

### 2. Cài đặt biến môi trường
Sử dụng lệnh sau để lưu Token bảo mật:
```bash
npx wrangler secret put DISCORD_TOKEN
```

Cấu hình các biến khác trong `wrangler.json`:
*   `DISCORD_PUBLIC_KEY`: Mã Public Key từ Discord.
*   `DISCORD_CLIENT_ID`: ID ứng dụng của bạn.
*   `ALUNE_BOT_KV`: ID của KV Namespace bạn đã tạo.

### 3. Triển khai
```bash
# Cài đặt phụ thuộc
npm install

# Đăng ký Slash Commands với Discord
npm run register

# Deploy lên Cloudflare
npm run deploy
```

---

## 📜 Giấy Phép
Dự án được phát hành dưới giấy phép MIT.

---
*Phát triển bởi [ngducnhatt](https://github.com/ngducnhatt)*
