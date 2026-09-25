# RoomFlow / ProcureAI

Bản demo quy trình đề xuất mua hàng và mua sắm, gồm giao diện React và API FastAPI.

## Yêu cầu

- Docker Desktop có Docker Compose v2
- Git

## Khởi chạy từ bản clone mới

1. Sao chép mẫu cấu hình môi trường an toàn cho phát triển:

   ```powershell
   Copy-Item .env.example .env
   ```

   Trên macOS/Linux, dùng `cp .env.example .env`.

2. Tạo image và khởi chạy ứng dụng:

   ```sh
   docker compose up --build -d
   ```

3. Kiểm tra trạng thái dịch vụ:

   ```sh
   docker compose ps
   curl http://localhost:8000/health
   ```

4. Mở <http://localhost:8080>. API truy cập tại <http://localhost:8000>.

Tài khoản demo dùng email kết thúc bằng `@demo.com` và mật khẩu `123456` (ví dụ: `employee@demo.com`). Chỉ dùng các tài khoản này trong môi trường phát triển.

Mặc định, Compose dùng bộ nhớ trong của backend (`USE_SUPABASE=false`); dữ liệu sẽ mất khi tạo lại container API. Để lưu yêu cầu vào Supabase, cấu hình `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY`, đặt `USE_SUPABASE=true`, chạy các migration SQL trong `supabase/migrations/`, rồi khởi động lại API. Không đưa khóa bí mật/service-role của Supabase vào frontend hoặc commit file `.env đã điền thông tin thật`.

`SECRET_KEY` mẫu chỉ dành cho phát triển cục bộ. Backend hiện chủ động từ chối khởi động khi `APP_ENV=production`: cần thay kho tài khoản demo bằng nguồn danh tính được quản lý, xem xét/gỡ chốt khởi động này, rồi đặt `SECRET_KEY` ngẫu nhiên có ít nhất 32 ký tự trước khi triển khai production.

## Chạy test backend tại máy

Cần Python 3.11 trở lên.

```sh
cd backend-test
python -m pip install -e ".[test]"
python -m pytest -q
```

Bộ test đặt `USE_SUPABASE=false` để kiểm thử API độc lập. Không chạy test bằng thông tin đăng nhập production.

## CI và triển khai

`.github/workflows/ci.yml` chạy test backend, kiểm tra lỗ hổng dependency của Python/npm, build frontend và build Docker image. Khi push lên `main` hoặc tạo version tag, workflow publish image API và web lên GitHub Container Registry (GHCR). Pull request chỉ chạy bước xác minh, không publish image.

Để bật triển khai tự động lên máy chủ từ nhánh `main`, cấu hình repository variable `DEPLOY_ENABLED=true`, `DEPLOY_PATH` (thư mục trên máy chủ chứa `compose.yaml` và `.env` production của repository này), cùng `PUBLIC_API_URL`. Cấu hình các repository/environment secret sau:

- `DEPLOY_HOST`, `DEPLOY_USER`
- `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`
- `GHCR_USERNAME`, `GHCR_READ_TOKEN` (token chỉ có quyền đọc package)

Máy chủ triển khai cần cài Docker Compose, có các file triển khai của repository và `.env` production. Workflow kéo image theo commit rồi khởi động lại dịch vụ; health check của Compose đợi dịch vụ sẵn sàng. Compose chỉ bind port vào loopback, vì vậy cần cấu hình reverse proxy TLS cho URL web/API công khai. Không bật triển khai trước khi xử lý migration Supabase và yêu cầu xác thực production nêu trên.

## Lệnh thường dùng

```sh
docker compose logs -f api web
docker compose down
```
