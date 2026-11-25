# INDIE FREQUENCY

Website khám phá âm nhạc theo thể loại, nghệ sĩ yêu thích và tâm trạng.

## 1. Công nghệ
- React + Vite
- CSS thuần, responsive
- YouTube Data API v3 (không bắt buộc để chạy giao diện)
- Spotify và SoundCloud: mở trang tìm kiếm theo tên bài hát/nghệ sĩ

## 2. Cài đặt
Cài Node.js bản LTS từ https://nodejs.org/ rồi mở thư mục dự án bằng VS Code.

Mở Terminal trong VS Code và chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ mà Vite in ra, thường là http://localhost:5173

## 3. Bật tìm kiếm YouTube thật
Mặc định website chạy bằng 10 bài demo đã có sẵn để bạn thử giao diện và luồng chọn gu.

Để tìm video YouTube thật:
1. Mở Google Cloud Console: https://console.cloud.google.com/
2. Tạo project (hoặc chọn project hiện có).
3. Vào APIs & Services → Library → bật **YouTube Data API v3**.
4. Vào APIs & Services → Credentials → Create credentials → API key.
5. Trong thư mục dự án, sao chép `.env.example` thành `.env.local`.
6. Thay `your_youtube_data_api_key_here` bằng API key.
7. Dừng server bằng Ctrl+C rồi chạy lại `npm run dev`.

Lưu ý: API key ở frontend có thể được người dùng xem trong trình duyệt. Khi triển khai website công khai, hãy giới hạn key theo HTTP referrer và API được phép; tốt hơn nữa là chuyển truy vấn YouTube sang backend/serverless function. YouTube API có quota và có thể trả lỗi nếu hết quota.

## 4. Build bản production
```bash
npm run build
npm run preview
```

## 5. Cách hoạt động
- Bước 1: chọn tối thiểu 3 thể loại.
- Bước 2: nhập ít nhất 1 nghệ sĩ (tối đa 2).
- Bước 3: chọn tối thiểu 3 mood.
- Bước 4: nhận 10 kết quả YouTube, hoặc 10 gợi ý demo nếu chưa cấu hình API key.
- Mỗi kết quả YouTube được nhúng bằng player với `start=0&end=60`. YouTube quyết định khả năng phát dựa trên quyền nhúng, khu vực và trạng thái video.
- Spotify/SoundCloud hiện là liên kết tìm kiếm theo tên bài hát/nghệ sĩ, không phải player nhúng trực tiếp.

## 6. Giới hạn hiện tại
Đây là prototype frontend. Bộ demo được chấm điểm dựa trên tag để minh họa cá nhân hóa; khi bật API, YouTube trả về video phù hợp với cụm từ tìm kiếm, chưa phải hệ thống recommendation AI hiểu sâu âm nhạc. Không thể bảo đảm mọi video là bản audio chính thức hoặc mọi bài đều có thể nhúng/phát 60 giây. Muốn chọn “đoạn hay nhất” cần dữ liệu timestamp được biên tập riêng cho từng bài hoặc một dịch vụ có quyền cung cấp preview.
