ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS rules_today text NOT NULL DEFAULT 'Setoran hari ini hanya menerima akun Gmail baru. Kirim satu email per baris, tanpa password. Password setoran wajib sesuai password yang berlaku hari ini dari admin.',
  ADD COLUMN IF NOT EXISTS tiktok_link text NOT NULL DEFAULT 'https://www.tiktok.com/@s3lryu88',
  ADD COLUMN IF NOT EXISTS announcement_title text NOT NULL DEFAULT 'PENGUMUMAN RESMI';