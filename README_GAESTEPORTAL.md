# Jelling Camping - Gæsteportal

Personlig velkomstside til gæster på Jelling Camping.

## 🚀 Kom i gang

### 1. Klon repository
```bash
git clone https://github.com/Jelling-test/implentering-af-personligside-.git
cd implentering-af-personligside-
```

### 2. Installer dependencies
```bash
npm install
```

### 3. Opret miljøvariabler
```bash
cp .env.example .env.local
```

Udfyld `.env.local` med dine Supabase credentials:
- **Production (main):** `jkmqliztlhmfyejhmuil`
- **Development (develop branch):** `ljeszhbaqszgiyyrkxep`

### 4. Start udviklingsserver
```bash
npm run dev
```

Åbn: http://localhost:5174

## 🔗 Test links

- **Magic link test:** http://localhost:5174/m/46160
- **Gæsteside:** http://localhost:5174/guest

## 📁 Projektstruktur

```
src/
├── contexts/
│   └── GuestContext.tsx    # Gæstedata context
├── pages/
│   ├── guest/
│   │   ├── GuestWelcome.tsx   # Velkomstside med countdown
│   │   ├── GuestEvents.tsx    # Events (interne + eksterne)
│   │   ├── GuestPractical.tsx # Praktisk info
│   │   └── ...
│   └── MagicLink.tsx       # Magic link handler
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── mockBackend.ts      # Mock data til test
└── App.tsx                 # Router
```

## 🗄️ Database (Supabase)

### Tabeller:
- `camp_events` - Interne events på campingpladsen
- `external_events` - Eksterne events fra attraktioner (max 50km)
- `bookings` - Gæstebookinger
- `magic_links` - Magic link tokens

### Branching:
- **main:** Produktion - rør ikke!
- **develop:** Udvikling - frit frem

## 📝 Dokumentation

- `KRAVSPEC_GAESTEPORTAL.md` - Kravspecifikation
- `PROGRESS.md` - Fremskridt og status
