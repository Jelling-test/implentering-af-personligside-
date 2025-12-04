# 📋 TODO: QR Magic Link Login System

> **Projekt:** Jelling Camping Strømstyring
> **Oprettet:** 3. december 2025
> **Status:** Planlagt - starter 4. december 2025

---

## Oversigt

Implementer sikkert QR-baseret login system hvor kunder kan scanne en QR kode for at få adgang til deres strømstyring dashboard. Token er kun aktiv når kunden er checked ind.

### Vigtige principper:
- Token er KUN aktiv når `checked_in = true` OG `checked_out = false`
- Token er bundet til én specifik booking (kan ikke genbruges)
- Backup login: Efternavn + Booking nummer (altid tilgængeligt)
- **Receptionen kan printe QR kode til kunder der ikke har modtaget email**

---

## FASE 1: Database Forberedelse
- [ ] **1.1** Tilføj `magic_token` kolonne til `seasonal_customers`
- [ ] **1.2** Tilføj `magic_token` kolonne til `regular_customers`
- [ ] **1.3** Tilføj `country` kolonne til begge tabeller
- [ ] **1.4** Tilføj `language` kolonne til begge tabeller
- [ ] **1.5** Opret `system_settings` tabel til admin indstillinger
- [ ] **1.6** Tilføj indeks på `magic_token` for hurtig lookup

---

## FASE 2: Webhook Opdatering
- [ ] **2.1** Opdater `webhook` Edge Function til at gemme `country` fra Sirvoy
- [ ] **2.2** Opdater `webhook` Edge Function til at gemme `language` fra Sirvoy
- [ ] **2.3** Generer unik `magic_token` (16 tegn) ved booking oprettelse
- [ ] **2.4** Test webhook med nyt data

---

## FASE 3: Magic Link Backend
- [ ] **3.1** Opret ny Edge Function `magic-login`
- [ ] **3.2** Validér token eksisterer
- [ ] **3.3** Validér `checked_in = true` (ellers afvis med besked)
- [ ] **3.4** Validér `checked_out = false` (ellers afvis med besked)
- [ ] **3.5** Returnér kunde session ved succes
- [ ] **3.6** Tilføj rate limiting (max 10 forsøg/IP/time)
- [ ] **3.7** Log fejlede forsøg

---

## FASE 4: Login Side Opdatering
- [ ] **4.1** Tilføj route `/m/:token` til magic link
- [ ] **4.2** Opdater login side til at bruge `Efternavn + Booking nummer`
- [ ] **4.3** Vis fejlbesked hvis token ugyldig
- [ ] **4.4** Vis "Du er ikke tjekket ind endnu" hvis `checked_in = false`
- [ ] **4.5** Redirect til dashboard ved succes

---

## FASE 5: QR Print Funktion (Admin) ⭐ VIGTIG
- [ ] **5.1** Tilføj "Print QR" knap i Admin Kunder
- [ ] **5.2** Design print-venlig side (8x8 cm)
- [ ] **5.3** Generer QR kode med magic link URL
- [ ] **5.4** Inkluder booking nummer som backup tekst
- [ ] **5.5** Inkluder kundenavn
- [ ] **5.6** Test print fra browser

**BEMÆRK:** Denne funktion er kritisk for kunder der:
- Kommer via eksterne booking kanaler (Booking.com etc.)
- Har forkert/gammel email i systemet
- Ikke har modtaget velkomst email

Receptionen skal hurtigt kunne printe QR kode ved check-in!

---

## FASE 6: Automatisk Velkomst Email
- [ ] **6.1** Opret email templates per sprog (start med DA, EN, DE)
- [ ] **6.2** Tilføj admin indstilling: "Dage før ankomst"
- [ ] **6.3** Opret Edge Function `send-welcome-email`
- [ ] **6.4** Opret Cron job der kører dagligt
- [ ] **6.5** Find kunder hvor `arrival_date = today + X dage`
- [ ] **6.6** Send email med QR kode (som billede) + magic link
- [ ] **6.7** Tilføj `welcome_email_sent` kolonne (undgå dubletter)
- [ ] **6.8** Håndter sprog baseret på `language` felt

---

## FASE 7: Admin Indstillinger
- [ ] **7.1** Opret Admin Indstillinger side
- [ ] **7.2** Indstilling: Dage før ankomst (email) - default: 7
- [ ] **7.3** Indstilling: Aktive sprog (multi-select)
- [ ] **7.4** Indstilling: WiFi kode (til velkomstbrev)
- [ ] **7.5** Indstilling: Camping kontakt info
- [ ] **7.6** Preview af email templates

---

## FASE 8: Sprog Templates
- [ ] **8.1** Dansk (da) - Velkomst email
- [ ] **8.2** Engelsk (en) - Welcome email
- [ ] **8.3** Tysk (de) - Willkommens-E-Mail
- [ ] **8.4** Hollandsk (nl) - Welkomst e-mail
- [ ] **8.5** Svensk (sv) - Välkomstmail
- [ ] **8.6** Norsk (no) - Velkomst e-post
- [ ] **8.7** Fallback til engelsk for ukendte sprog
- [ ] **8.8** Tilføj flere sprog efter behov (baseret på faktiske bookings)

---

## FASE 9: Test & Validering
- [ ] **9.1** Test QR scan på mobil (iOS + Android)
- [ ] **9.2** Test login med booking + efternavn
- [ ] **9.3** Test at token afvises før check-in
- [ ] **9.4** Test at token afvises efter check-out
- [ ] **9.5** Test email afsendelse (alle sprog)
- [ ] **9.6** Test print funktion i reception
- [ ] **9.7** Test rate limiting

---

## FASE 10: Dokumentation
- [ ] **10.1** Opdater STROMSTYRING_KOMPLET.md
- [ ] **10.2** Tilføj guide til receptionen (hvordan print QR)
- [ ] **10.3** Opdater README med nye features
- [ ] **10.4** Lav simpel brugerguide til gæster

---

## Tekniske Specifikationer

### Magic Token
```
Format:     16 tegn (a-z, A-Z, 0-9)
Eksempel:   "Xk9mP2nL8qR4wT5y"
Generering: crypto.randomBytes(12).toString('base64url')
Unikhed:    UNIQUE constraint i database
```

### QR Kode URL
```
https://strom.jellingcamping.dk/m/Xk9mP2nL8qR4wT5y
```

### Token Livscyklus
```
┌─────────────────────────────────────────────────────────┐
│  BOOKING OPRETTES (webhook)                             │
│  → Token genereres                                      │
│  → Status: INAKTIV (checked_in = false)                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  KUNDE CHECKER IND (Sirvoy → webhook)                  │
│  → Status: AKTIV (checked_in = true)                   │
│  → Kunde kan nu scanne QR og logge ind                 │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  KUNDE CHECKER UD (Sirvoy → webhook)                   │
│  → Status: INAKTIV (checked_out = true)                │
│  → Token virker ikke længere                           │
└─────────────────────────────────────────────────────────┘
```

### Sikkerhed
```
- 16 tegn = ~10^28 kombinationer (umuligt at gætte)
- Rate limiting: 10 forsøg/IP/time
- Token binding: 1 token = 1 booking
- Scope: Kun aktiv ved check-in
- Mere sikkert end nuværende booking+email system
```

### QR Print Størrelse
```
┌────────────────────────────┐
│                            │
│      ┌──────────────┐      │
│      │              │      │
│      │   QR KODE    │      │    8 cm
│      │              │      │
│      └──────────────┘      │
│                            │
│   Booking: 46134           │
│   Johnni Knudsen           │
│                            │
│   strom.jellingcamping.dk  │
│                            │
└────────────────────────────┘
         8 cm
```

---

## Prioritering

| Prioritet | Fase | Beskrivelse | Estimat |
|-----------|------|-------------|---------|
| 🔴 Høj | 1 | Database forberedelse | 30 min |
| 🔴 Høj | 2 | Webhook opdatering | 1 time |
| 🔴 Høj | 3 | Magic link backend | 1 time |
| 🔴 Høj | 4 | Login side opdatering | 1 time |
| 🔴 Høj | 5 | QR print funktion | 1 time |
| 🟡 Medium | 6 | Automatisk email | 2 timer |
| 🟡 Medium | 7 | Admin indstillinger | 1 time |
| 🟢 Lav | 8 | Sprog templates | 2 timer |
| 🟢 Lav | 9 | Test & validering | 1 time |
| 🟢 Lav | 10 | Dokumentation | 30 min |

**Total estimat:** ~11 timer

---

## Afhængigheder

```
Fase 1 (Database) 
    ↓
Fase 2 (Webhook) ──────────────────┐
    ↓                              │
Fase 3 (Backend)                   │
    ↓                              │
Fase 4 (Login side)                │
    ↓                              ▼
Fase 5 (QR print) ◄─────── Fase 6 (Email)
                                   │
                                   ▼
                           Fase 7 (Admin)
                                   │
                                   ▼
                           Fase 8 (Sprog)
```

---

## Noter

### Husk:
- Kunder fra eksterne kanaler (Booking.com, Expedia) har ofte forkert email
- Receptionen SKAL kunne printe QR hurtigt ved check-in
- Behold backup login (efternavn + booking) for alle kunder

### Fremtidige forbedringer:
- SMS velkomst besked (kræver SMS gateway)
- Push notifikationer
- Digital check-in via QR

---

*Sidste opdatering: 3. december 2025*
