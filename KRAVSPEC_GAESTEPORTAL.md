# 📋 Kravspecifikation: Gæsteportal (Personlig Velkomstside)

> **Projekt:** Jelling Camping - Personlig Velkomstside  
> **Oprettet:** 5. december 2025  
> **Sidst opdateret:** 5. december 2025  
> **Status:** Under udvikling

---

## 🎯 Formål

En personlig velkomstportal for gæster på Jelling Camping. Gæsten scanner QR-kode eller klikker magic link og får adgang til:
- Praktisk information om campingpladsen
- Strømstyring (for pladser med elmåler)
- Bageri-bestilling
- Events og aktiviteter
- Lokale attraktioner

---

## 👤 Brugertyper

| Type | Beskrivelse | Adgang |
|------|-------------|--------|
| **Kommende gæst** | Ikke ankommet endnu | Begrænset (praktisk info, events) |
| **Indtjekket campist** | På plads med elmåler | Fuld adgang inkl. strøm |
| **Indtjekket hytte** | I hytte | Fuld adgang ekskl. strøm |
| **Udtjekket gæst** | Har forladt pladsen | Kun "tak for besøget" besked |

---

## 📱 Sider & Features

### 1. Velkomstside (`/guest`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Personlig velkomst med navn | ✅ Færdig | "Velkommen, [Fornavn]!" |
| Status badge (ankommet/ikke ankommet) | ✅ Færdig | Grøn/orange/grå badge |
| Plads/hytte nummer | ✅ Færdig | Vises i badge |
| Ankomst/afrejse datoer | ✅ Færdig | Formateret efter sprog |
| Antal nætter | ✅ Færdig | Nætter tilbage (indtjekket) eller total (kommende) |
| Vejr-widget | ⏳ Mock | Vis aktuelt vejr i Jelling |
| Quick actions (genveje) | ✅ Færdig | Links til undersider |

### 2. Strømstyring (`/guest/power`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Vis forbrug (kWh) | ✅ Færdig | Live fra MQTT/database |
| Vis pris (DKK) | ✅ Færdig | Beregnet fra forbrug |
| Tænd/sluk strøm | ✅ Færdig | Via meter_commands |
| Forbrugshistorik (graf) | ✅ Færdig | Sidste 24 timer |
| Ekstra målere | ✅ Færdig | Hvis kunde har flere |

### 3. Bageri-bestilling (`/guest/bakery`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Vis produkter med billeder | ⏳ Mock | Brød, rundstykker, croissants |
| Tilføj til kurv | ⏳ Mock | Vælg antal |
| Vælg afhentningsdato | ⏳ Mock | Næste dag(e) |
| Send bestilling | ❌ Mangler | Gem i database, notificér personale |
| Betalingsintegration | ❓ Afventer | MobilePay? Betaling ved afhentning? |

### 4. Events & Aktiviteter (`/guest/events`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| **Interne events (på pladsen)** | ✅ Færdig | Admin opretter i database |
| - Opret event (admin) | ✅ Færdig | `/admin/events` |
| - Rediger event (admin) | ✅ Færdig | Titel, dato, tid, lokation |
| - Slet event (admin) | ✅ Færdig | Med bekræftelse |
| - Flersproget (da/en/de) | ✅ Færdig | Oversættelse af titel/beskrivelse |
| - Målgruppe | ✅ Færdig | Familier, voksne, børn, alle |
| - Tilmelding | ✅ Færdig | Reception, café, eller ingen |
| **Attraktioner i nærheden** | ✅ Færdig | Statisk liste med links |
| - Givskud Zoo | ✅ Færdig | 20 km, link til events |
| - LEGOLAND | ✅ Færdig | 25 km, link til events |
| - Kongernes Jelling | ✅ Færdig | 0.5 km, UNESCO |
| - Økolariet | ✅ Færdig | 12 km |
| - Gorilla Park | ✅ Færdig | 15 km |
| - Skærup Zoo | ✅ Færdig | 20 km |
| - Randbøldalmuseet | ✅ Færdig | 10 km |
| - Bindeballe Købmandsgård | ✅ Færdig | 15 km |
| **Eksterne events (API)** | ❌ Afvist | Kræver 5000 kr til GuideDanmark |

### 5. Café & Tilbud (`/guest/cafe`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Åbningstider | ⏳ Mock | Vis dagens tider |
| Menu | ⏳ Mock | Dagens retter, priser |
| Tilbud | ⏳ Mock | Ugentlige tilbud |
| Bestilling | ❓ Afventer | Online bestilling? |

### 6. Praktisk Information (`/guest/practical`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| WiFi information | ✅ Færdig | "Jelling camping Free Wifi" |
| Reception kontakt | ✅ Færdig | +45 8182 6300 |
| Nødkontakter | ✅ Færdig | 112, Lægevagt 70 11 07 07 |
| Faciliteter | ✅ Færdig | Toiletter, bad, køkken, etc. |
| Butikker i nærheden | ✅ Færdig | SuperBrugsen, Rema, Netto |
| Check-out tidspunkt | ✅ Færdig | Kl. 11:00 |
| Affaldshåndtering | ⏳ Mock | Sortering, placering |
| Husregler | ⏳ Mock | Støj, hastighed, etc. |

### 7. Hytte-information (`/guest/cabin`)
| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Hytte detaljer | ⏳ Mock | Inventar, faciliteter |
| Instruktioner | ⏳ Mock | Varme, køkken, etc. |
| Rengøring ved afrejse | ⏳ Mock | Tjekliste |

---

## 🔐 Login & Autentificering

| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Magic link via email | ⏳ I gang | `/m/:token` route |
| QR-kode scanning | ⏳ I gang | Samme som magic link |
| Backup: Efternavn + Booking | 📋 Planlagt | For gæster uden email |
| Token kun aktiv ved check-in | ✅ Færdig | Valideres i Edge Function |
| Token deaktiveres ved check-out | ✅ Færdig | Viser "tak for besøget" |

---

## 🌐 Sprog

| Sprog | Status | Beskrivelse |
|-------|--------|-------------|
| Dansk (da) | ✅ Færdig | Primært sprog |
| Engelsk (en) | ✅ Færdig | Internationale gæster |
| Tysk (de) | ✅ Færdig | Mange tyske gæster |
| Hollandsk (nl) | ⏳ Delvist | Nogle oversættelser mangler |

---

## 📊 Database Tabeller

| Tabel | Status | Formål |
|-------|--------|--------|
| `regular_customers` | ✅ Eksisterer | Normale gæster |
| `seasonal_customers` | ✅ Eksisterer | Sæsongæster |
| `webhook_data` | ✅ Eksisterer | Sirvoy webhooks (fallback) |
| `camp_events` | ✅ Oprettet | Interne events |
| `bakery_orders` | ❌ Mangler | Bageri-bestillinger |
| `bakery_products` | ❌ Mangler | Bageri-produkter |
| `cafe_menu` | ❌ Mangler | Café menu |

---

## 🔌 Edge Functions

| Funktion | Status | Formål |
|----------|--------|--------|
| `get-live-data` | ✅ Deployet | Hent gæstedata (hybrid: DB + webhook) |
| `toggle-power` | ✅ Eksisterer | Tænd/sluk strøm |
| `create-bakery-order` | ❌ Mangler | Opret bageri-bestilling |

---

## 📧 Email System

| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Velkomst email X dage før | 📋 Planlagt | Med QR-kode |
| Booking bekræftelse | 📋 Planlagt | Med magic link |
| Sprog-tilpasset | 📋 Planlagt | Baseret på gæstens sprog |

---

## 🖨️ Admin Funktioner

| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Print QR-kode til gæst | 📋 Planlagt | Ved check-in |
| Events administration | ✅ Færdig | `/admin/events` |
| Bageri administration | ❌ Mangler | Se bestillinger |
| Café menu administration | ❌ Mangler | Opdater menu |

---

## 🚀 Deployment

| Miljø | Status | URL |
|-------|--------|-----|
| Lokal udvikling | ✅ Kører | http://127.0.0.1:5174 |
| Vercel (produktion) | 📋 Planlagt | guest.jellingcamping.dk |
| Supabase | ✅ Kører | jkmqliztlhmfyejhmuil |

---

## 📋 Prioriteret Backlog

### Høj prioritet (nu)
- [x] Live data fra Supabase
- [x] Praktisk info rettelser
- [x] Interne events system
- [x] Attraktioner i nærheden
- [ ] Test alle 4 gæstetyper

### Mellem prioritet (snart)
- [ ] Bageri-bestilling (database + UI)
- [ ] Café menu administration
- [ ] Velkomst email med QR
- [ ] Print QR i reception

### Lav prioritet (senere)
- [ ] Vejr-widget (live data)
- [ ] Affaldshåndtering info
- [ ] Husregler side
- [ ] Push notifikationer

---

## 📝 Changelog

### 5. december 2025
- ✅ Interne events system implementeret (database + admin UI)
- ✅ Attraktioner i nærheden tilføjet (8 stk, max 50 km)
- ✅ Praktisk info rettet (WiFi, telefon, lægevagt, butikker)
- ✅ Nætter beregning rettet (kommende vs. indtjekket)
- ✅ Edge Function deployet med hybrid data (DB + webhook fallback)

### 4. december 2025
- ✅ Live data integration fra Supabase
- ✅ Token validation via Edge Function
- ✅ Status-baseret UI (4 gæstetyper)

---

*Denne fil opdateres løbende med nye features og ændringer.*
