# TODO: Interaktivt Kort-System

**Oprettet:** 30. november 2025  
**Status:** I gang

---

## Fase 1: Database (Estimat: 1 time)

- [x] Opret `power_stands` tabel (strømstandere)
- [x] Opret `map_spots` tabel (admin-oprettede pladser)
- [x] Opret `map_config` tabel (baggrundskort + indstillinger)
- [x] Tilføj kolonner til `power_meters`: stand_id, map_x, map_y, map_locked
- [ ] Upload baggrundskort til Supabase Storage

---

## Fase 2: Stander-administration (Estimat: 2 timer)

- [x] CRUD for standere (opret, omdøb, slet)
- [x] Liste over alle standere med status
- [x] Tildel målere til stander
- [x] Fjern målere fra stander
- [x] Vis ikke-tildelte målere

---

## Fase 3: Kort-canvas (Estimat: 4 timer)

### Grundstruktur
- [x] Konva canvas setup
- [x] Zoom ind/ud funktionalitet
- [x] Panorering (flytte rundt)
- [ ] Baggrundskort fra Supabase Storage

### Render elementer
- [x] Strømstandere: Cirkel med sort kant, fyld grøn/gul/rød
- [x] Repeatere: Trekant, blå/rød
- [x] Hytter: Nummer (strip "Hytte" prefix), sort/grøn/rød
- [x] Pladser: Nummer i parentes, grøn/blå/rød

### Drag & drop
- [x] Træk standere til position
- [x] Træk hytter til position
- [x] Træk pladser til position
- [x] Træk repeatere til position
- [x] Gem position til database ved drop

### Filtrering
- [x] Toggle: Vis/skjul standere
- [x] Toggle: Vis/skjul hytter
- [x] Toggle: Vis/skjul pladser
- [x] Toggle: Vis/skjul repeatere

---

## Fase 4: Modals & Interaktion (Estimat: 2 timer)

### Klik på stander
- [x] Modal med liste over tilknyttede målere
- [x] Vis måler-status (online/offline)
- [ ] Vis måler-forbrug
- [ ] Link til "Administrer målere"

### Klik på hytte
- [x] Modal med hytte-info
- [ ] Vis måler-status
- [ ] Vis forbrug

### Klik på plads
- [x] Modal med plads-info
- [x] Vis sæsongæst eller kørende gæst

---

## Fase 5: Pladser (Estimat: 1 time)

- [x] Opret ny plads (indtast nummer)
- [ ] Slet plads
- [ ] Sammenlign med database for status
- [x] Farvekodning baseret på optaget/ledig

---

## Fase 6: Dato-filter (Estimat: 1 time)

- [ ] Dato-picker komponent
- [ ] Query webhooks for valgt dato
- [ ] Vis fremtidige bookinger (også ikke checked-in)
- [ ] Opdater plads-farver baseret på dato

---

## Fase 7: Indstillinger (Estimat: 1 time)

- [x] Justér tekststørrelse for målernumre
- [x] Justér tekststørrelse for pladsnumre
- [x] Justér størrelse på stander-cirkler
- [x] Justér størrelse på repeater-trekanter
- [x] Upload nyt baggrundskort (knap klar, kræver Storage bucket)
- [ ] Advarsel: "Nulstiller alle positioner"

---

## Fase 8: Print (Estimat: 30 min)

- [x] Print-knap
- [x] A3 liggende format
- [x] Eksporter canvas til billede
- [x] Åbn print-dialog

---

## Fase 9: Lås-funktion (Estimat: 30 min)

- [x] Global lås-toggle
- [x] Per-element lås (via database map_locked)
- [ ] Visuel indikator for låst element
- [x] Forhindre drag når låst

---

## Fase 10: Sidebar & Navigation (Estimat: 30 min)

- [x] Tilføj "Kort" i admin sidebar
- [x] Undermenuer: Vis kort, Standere, Pladser
- [x] Routing til nye sider

---

## Farve-reference

### Strømstander (cirkel med sort kant)
| Status | Fyld-farve | Hex |
|--------|------------|-----|
| Alle online | Grøn | #22C55E |
| 1+ offline | Gul | #EAB308 |
| Alle offline | Rød | #EF4444 |

### Repeater (trekant)
| Status | Farve | Hex |
|--------|-------|-----|
| Online | Blå | #3B82F6 |
| Offline | Rød | #EF4444 |

### Hytte (nummer)
| Status | Farve | Hex |
|--------|-------|-----|
| Offline | Rød | #EF4444 |
| Ubeboet + online | Sort | #000000 |
| Beboet + online | Grøn | #22C55E |

### Plads (nummer i parentes)
| Status | Farve | Hex |
|--------|-------|-----|
| Ledig | Grøn | #22C55E |
| Sæsongæst | Rød | #EF4444 |
| Kørende gæst | Blå | #3B82F6 |

---

## Database-migrationer

```sql
-- 1. Strømstandere
CREATE TABLE power_stands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  map_x FLOAT,
  map_y FLOAT,
  map_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tilføj stander-relation til power_meters
ALTER TABLE power_meters 
ADD COLUMN stand_id UUID REFERENCES power_stands(id),
ADD COLUMN map_x FLOAT,
ADD COLUMN map_y FLOAT,
ADD COLUMN map_locked BOOLEAN DEFAULT FALSE;

-- 3. Pladser
CREATE TABLE map_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_number TEXT NOT NULL UNIQUE,
  spot_type TEXT DEFAULT 'standard',
  map_x FLOAT,
  map_y FLOAT,
  map_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Kort-konfiguration
CREATE TABLE map_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  image_url TEXT,
  image_width INTEGER,
  image_height INTEGER,
  settings JSONB DEFAULT '{
    "standFontSize": 10,
    "spotFontSize": 12,
    "cabinFontSize": 14,
    "repeaterSize": 15,
    "standRadius": 20
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

**Total estimat: ~10-12 timer**
