# TODO - Jelling Strømstyringssystem

**Sidst opdateret:** 30. november 2025

---

## 🔜 EFTER LINUX SERVER MIGRATION (~14 dage)

### Raspberry Pi MQTT Monitor
**Prioritet:** Høj  
**Estimat:** 2-3 timer  
**Hardware:** Raspberry Pi 4 (2GB) ~400 kr

Lokal overvågning af MQTT broker med alarm til telefon.

**Opsætning:**
- [ ] Køb Raspberry Pi 4 (2GB)
- [ ] Installer Uptime Kuma
- [ ] Konfigurer MQTT health-check
- [ ] Opsæt UniFi Protect push-notifikation ved fejl
- [ ] Test alarm-flow

**Fordele:**
- Kører uafhængigt af Linux server
- Virker uden internet
- Push-notifikation til telefon via UniFi app

---

## 📅 DEADLINE: UGE 11 (Marts 2026)

### Sammenbygning med Main Projekt
**Prioritet:** Mellem  
**Deadline:** Uge 11, 2026

Sammenbygning af strømstyring med hovedprojektet.

**Projekter:**
- **Strømstyring:** `jkmqliztlhmfyejhmuil`
- **Main projekt:** `lxrqtuhvvroplewkamnk`

**Opgaver:**
- [ ] Analysér datastruktur i begge projekter
- [ ] Plan for migration/integration
- [ ] Implementér sammenbygning
- [ ] Test

---

## ✅ IMPLEMENTERET

### Hytte-modul (25. november 2025) ✅ TESTET & VIRKER
- [x] Database: `cabins` og `cabin_cleaning_schedule` tabeller
- [x] Webhook integration til booking-system
- [x] Auto tænd/sluk ved check-in/out
- [x] Rengørings-cron (10:00-15:00)
- [x] Admin side: `/admin/hytter`
- [x] Staff side: `/staff/hytter`
- [x] Opret hytte i admin
- [x] Modtag webhook for hytte-booking
- [x] Verificer måler tildeles automatisk
- [x] Verificer prepaid pakke oprettes
- [x] Test check-in (strøm tænder)
- [x] Test check-out (strøm slukker)
- [x] Test rengørings-cron (10:00/15:00)
- [x] Verificer camping-gæst IKKE kan vælge hytte-måler

### Kort-modul (30. november 2025) ✅
- [x] Baggrundskort upload
- [x] Drag & drop elementer (standere, hytter, pladser, repeatere)
- [x] Dato-filter for bookinger
- [x] Kundedata ved klik på plads/hytte
- [x] Måler-info i modaler
- [x] Vinteropbevaring (lilla farve)
- [x] Webhook gemmer vinteropbevaring automatisk
- [x] Print funktion
- [x] Zoom/pan (virker også når låst)

---

## 📝 NOTER

### Linux Server Migration
- Planlagt: ~14 dage fra nu
- Alle Docker containers flyttes fra NAS til Linux
- Controller automatisering implementeres EFTER migration
- Fordel: Alt kører lokalt, ingen cloud-kommunikation nødvendig

### Controller IP'er (nuværende)
| Område | IP | Port |
|--------|-----|------|
| 1 | 192.168.0.254 | 8082 |
| 2 | 192.168.1.35 | 8083 |
| 3 | 192.168.1.9 | 8084 |
| 4 | 192.168.1.66 | 8085 |
| 5 | 192.168.0.95 | 8086 |
| 6 | 192.168.0.60 | 8087 |
