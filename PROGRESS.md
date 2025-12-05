# 📋 Personlig Velkomstside - Udviklingsstatus

**Sidst opdateret:** 5. december 2025, kl. 08:15

---

## ✅ FÆRDIGT

### 1. Lokal Server
- Kører på: http://127.0.0.1:5174/
- Start kommando: `npm run dev` i `personlig-velkomstside/` mappen

### 2. Supabase Konfiguration
- Fil: `.env.local`
- Project ID: `jkmqliztlhmfyejhmuil`
- URL: `https://jkmqliztlhmfyejhmuil.supabase.co`

### 3. Token-baseret Login
- Fil: `src/pages/MagicLink.tsx`
- Route: `/m/:token`
- Bruger `mockValidateToken()` fra `src/lib/mockBackend.ts`

### 4. GuestContext med Live Data Support
- Fil: `src/contexts/GuestContext.tsx`
- Har `setGuestData()` funktion til at opdatere med live data
- Interface inkluderer: `checkedIn`, `checkedOut`, `spotNumber`, `bookingType`

### 5. Status-baseret UI
- Fil: `src/pages/guest/GuestWelcome.tsx`
- 4 forskellige layouts:
  - **Ikke ankommet** (orange badge) - viser kun events + praktisk info
  - **Ankommet - hytte** (grøn badge + hytte info) - alle sektioner + hytte
  - **Ankommet - plads** (grøn badge + plads info) - alle sektioner
  - **Rejst** (grå badge) - kun praktisk info + tak besked

### 6. Edge Function Forberedt
- Fil: `supabase/functions/get-live-data/index.ts`
- Henter data fra `regular_customers` eller `seasonal_customers`
- IKKE DEPLOYET ENDNU

---

## ❌ MANGLER

### 1. HENT LIVE DATA FRA SUPABASE
**Booking IDs der skal hentes:**
- 46160
- 46159  
- 46158

**SQL til at hente data:**
```sql
SELECT * FROM regular_customers WHERE booking_id IN (46160, 46159, 46158);
```

**Hvis ikke fundet, prøv:**
```sql
SELECT * FROM webhook_data WHERE id IN (46160, 46159, 46158);
```

**Find en booking med "rejst" status:**
```sql
SELECT * FROM regular_customers WHERE checked_out = true LIMIT 5;
```

### 2. DEPLOY EDGE FUNCTION
- Funktion: `get-live-data`
- Fil klar: `supabase/functions/get-live-data/index.ts`

### 3. OPDATER MOCK BACKEND MED RIGTIGE DATA
- Fil: `src/lib/mockBackend.ts`
- Erstat `getMockBookingData()` med rigtige data fra databasen

---

## 📁 VIGTIGE FILER

| Fil | Formål |
|-----|--------|
| `src/lib/mockBackend.ts` | Token validation og data hentning |
| `src/lib/supabase.ts` | Supabase client |
| `src/pages/MagicLink.tsx` | Login via token |
| `src/contexts/GuestContext.tsx` | Gæste data state |
| `src/pages/guest/GuestWelcome.tsx` | Hovedside med status-baseret UI |
| `supabase/functions/get-live-data/index.ts` | Edge Function til live data |
| `.env.local` | Supabase credentials |

---

## 🔗 TEST URLS

Når live data er hentet:
- http://127.0.0.1:5174/m/46160 (booking 46160)
- http://127.0.0.1:5174/m/46159 (booking 46159)
- http://127.0.0.1:5174/m/46158 (booking 46158)

---

## 📊 DATABASE TABELLER

- `regular_customers` - Normale gæster
- `seasonal_customers` - Sæsongæster
- `webhook_data` - Rå webhook data fra Sirvoy
- `cabins` - Hytte information

**Vigtige felter i customer tabeller:**
- `booking_id` - Booking nummer fra Sirvoy
- `first_name` / `last_name` - Navn
- `arrival_date` / `departure_date` - Datoer
- `checked_in` - Boolean, er gæsten ankommet?
- `checked_out` - Boolean, er gæsten rejst?
- `spot_number` - Plads/hytte nummer
- `meter_id` - Elmåler ID

---

## 🚀 NÆSTE SKRIDT

1. **Kør SQL queries** i Supabase dashboard for at hente live data
2. **Opdater `src/lib/mockBackend.ts`** med rigtige data
3. **Deploy Edge Function** `get-live-data`
4. **Test alle 4 portaler** med rigtige booking IDs
