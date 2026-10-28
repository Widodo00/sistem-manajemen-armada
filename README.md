# Sistem Manajemen Armada

Aplikasi pemantauan kendaraan berbasis React dan TypeScript yang menggunakan REST API untuk menampilkan informasi kendaraan, filter rute dan trip, pagination, serta detail kendaraan.

## Teknologi

- React dan TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Select Async Paginate
- REST API

## Cara Menjalankan Aplikasi

1. Clone repository:
   - git clone https://github.com/Widodo00/sistem-manajemen-armada.git
   - cd sistem-manajemen-armada

2. Instal dependensi:
   - npm install

3. Buat file .env di direktori utama proyek:
   - VITE_API_URL=https://api-v3.mbta.com/

4. Jalankan aplikasi:
   - npm run dev

5. Buka URL lokal yang ditampilkan di terminal.

## Arsitektur

Aplikasi menggunakan component-based architecture dengan pemisahan tanggung jawab:

- **Components:** Mengelola UI dan interaksi pengguna, seperti filter, daftar kendaraan, pagination, serta modal detail.
- **Services:** master-api.ts mengelola komunikasi dengan REST API.
- **Utils:** api.ts menyediakan kebutuhan komunikasi API.
- **Types:** Mendefinisikan tipe data dan struktur respons API menggunakan TypeScript.

Struktur ini memisahkan tanggung jawab UI, komunikasi API, utilitas, dan tipe data agar kode lebih terorganisasi serta mudah dikelola.
