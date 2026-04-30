# API Spec - Shortlink Unira

Dokumen ini merangkum endpoint API backend untuk integrasi frontend.

## Base URL

- Development: `http://localhost:4123` (atau sesuai konfigurasi `.env`)

## Format Respons

### Sukses

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "...",
  "data": null
}
```

## Autentikasi

Endpoint yang berawalan `/links` (kecuali public redirect) membutuhkan JWT token.

Header yang harus dikirim:

```http
Authorization: Bearer <accessToken>
```

Token didapat dari endpoint login.

## Auth Endpoints

### 1. Register

`POST /auth/register`

#### Request Body

| Field    | Tipe   | Wajib | Keterangan         |
| -------- | ------ | ----- | ------------------ |
| name     | string | tidak | Nama user          |
| email    | string | ya    | Email valid        |
| password | string | ya    | Minimal 6 karakter |

#### Contoh Request

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "password123"
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "email": "budi@example.com",
    "name": "Budi",
    "createdAt": "2026-04-30T10:00:00.000Z"
  }
}
```

### 2. Login

`POST /auth/login`

#### Request Body

| Field    | Tipe   | Wajib | Keterangan    |
| -------- | ------ | ----- | ------------- |
| email    | string | ya    | Email valid   |
| password | string | ya    | Password user |

#### Contoh Request

```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

#### Contoh Response

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "budi@example.com",
      "name": "Budi"
    }
  }
}
```

## Link Endpoints

Semua endpoint berikut membutuhkan JWT token.

### 1. Create Link

`POST /links`

#### Request Body

| Field       | Tipe              | Wajib | Keterangan              |
| ----------- | ----------------- | ----- | ----------------------- |
| url         | string            | ya    | URL tujuan, harus valid |
| code        | string            | tidak | Custom shortcode        |
| title       | string            | tidak | Judul link              |
| description | string            | tidak | Deskripsi link          |
| expiredAt   | string (ISO date) | tidak | Tanggal expired         |

#### Contoh Request

```json
{
  "url": "example.com/landing-page",
  "code": "promo-2026",
  "title": "Landing Page",
  "description": "Halaman promo"
}
```

#### Catatan

- Jika `code` kosong, shortlink dibuat otomatis oleh server.
- URL akan otomatis ditambahkan awalan `http://` jika dikirimkan tanpa protokol.
- Respons menyertakan `stats` dengan `totalClicks`.

### 2. Get All Links

`GET /links`

Mengambil semua link milik user yang sedang login.

#### Contoh Response

```json
{
  "success": true,
  "message": "Berhasil mengambil semua link",
  "data": [
    {
      "id": "uuid-v4-string",
      "code": "promo-2026",
      "originalUrl": "http://example.com/landing-page",
      "userId": 1,
      "title": "Landing Page",
      "description": "Halaman promo",
      "createdAt": "2026-04-30T10:10:00.000Z",
      "expiredAt": null,
      "isActive": true,
      "stats": {
        "linkId": "uuid-v4-string",
        "totalClicks": 0,
        "lastClickedAt": null
      }
    }
  ]
}
```

### 3. Get Link by ID

`GET /links/:id`

Hanya bisa mengakses link milik user sendiri.

### 4. Update Link

`PATCH /links/:id`

#### Request Body

| Field       | Tipe              | Wajib | Keterangan           |
| ----------- | ----------------- | ----- | -------------------- |
| url         | string            | tidak | URL tujuan baru      |
| code        | string            | tidak | Custom code baru     |
| isActive    | boolean           | tidak | Aktif atau nonaktif  |
| title       | string            | tidak | Judul baru           |
| description | string            | tidak | Deskripsi baru       |
| expiredAt   | string (ISO date) | tidak | Tanggal expired baru |

### 5. Delete Link

`DELETE /links/:id`

Menghapus link milik user sendiri.

## Stats Endpoints

### 1. Global Overview Stats (Publik)

`GET /stats/overview`

**Tidak butuh token.** Berguna untuk ditampilkan pada landing page.

#### Contoh Response

```json
{
  "success": true,
  "message": "Berhasil mengambil statistik publik",
  "data": {
    "totalLinks": 1520,
    "totalClicks": 54200,
    "uptimePercentage": 99.9
  }
}
```

### 2. Link Specific Stats

`GET /links/:id/stats`

**Butuh token.** Hanya pemilik link yang dapat mengakses data ini.

#### Contoh Response

```json
{
  "success": true,
  "message": "Berhasil mengambil statistik link",
  "data": {
    "totalClicks": 120,
    "topCountries": [
      { "name": "ID", "count": 100 },
      { "name": "US", "count": 20 }
    ],
    "topBrowsers": [
      { "name": "Chrome", "count": 80 },
      { "name": "Firefox", "count": 40 }
    ]
  }
}
```

## Public Redirect

### Redirect Shortlink

`GET /:code`

Endpoint publik ini tidak membutuhkan login.

#### Perilaku

- Jika `code` valid, server akan redirect ke `originalUrl`.
- Server juga mencatat klik secara background, mendeteksi asal negara, dan merekam browser (userAgent).
- Jika link tidak ditemukan, nonaktif, atau expired, server mengembalikan JSON error.

#### Contoh Error

```json
{
  "success": false,
  "message": "Link tidak ditemukan",
  "data": null
}
```

## Validation Rules

- Register:
  - `email` harus valid.
  - `password` minimal 6 karakter.
- Login:
  - `email` harus valid.
- Create link / Update Link:
  - `url` divalidasi. Jika tidak ada http/https, backend otomatis menyisipkan http://.
  - `code` hanya boleh mengandung huruf, angka, strip (-), dan underscore (_).
  - `expiredAt` harus format tanggal valid jika diisi.

## Model Data Penting

### User

| Field     | Tipe           |
| --------- | -------------- |
| id        | number         |
| email     | string         |
| name      | string \| null |
| createdAt | string         |

### Link

| Field       | Tipe           |
| ----------- | -------------- |
| id          | string (UUID)  |
| code        | string         |
| originalUrl | string         |
| userId      | number \| null |
| title       | string \| null |
| description | string \| null |
| createdAt   | string         |
| expiredAt   | string \| null |
| isActive    | boolean        |

### LinkStat

| Field         | Tipe           |
| ------------- | -------------- |
| linkId        | string (UUID)  |
| totalClicks   | number         |
| lastClickedAt | string \| null |
