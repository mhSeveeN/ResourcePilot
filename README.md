# ResourcePilot 🍽️

> Aplikacja webowa do rezerwacji stolików w restauracji — projekt akademicki zrealizowany w ramach przedmiotu Programowanie Obiektowe.

## O projekcie

ResourcePilot to pełnoprawny system rezerwacji stolików składający się z backendu REST API w .NET, bazy danych PostgreSQL oraz reaktywnego frontendu w React. Projekt zaprojektowany został z myślą o dobry praktykach programowania obiektowego — zastosowano architekturę Clean Architecture, wzorzec Dependency Injection, Data Transfer Objects oraz Service Layer.

## Stack technologiczny

| Warstwa | Technologia |
|--------|-------------|
| Backend | ASP.NET Core 8/10 (C#) |
| ORM | Entity Framework Core + Npgsql |
| Baza danych | PostgreSQL 16+ |
| Frontend | React 18 + TypeScript (Vite) |
| Stylowanie | Tailwind CSS + Framer Motion |
| Dokumentacja API | Swagger / OpenAPI |

## Struktura projektu

```
ResourcePilot/
├── ResourcePilot.Api/            # Kontrolery HTTP, serwisy, Program.cs
├── ResourcePilot.Application/    # Interfejsy, DTOs
├── ResourcePilot.Domain/         # Encje, enumy (Table, Reservation)
├── ResourcePilot.Infrastructure/ # DbContext, migracje EF Core, DbSeeder
├── ResourcePilot.Ui/             # Frontend React/TypeScript
│   └── src/
│       ├── app/core/             # Konfiguracja, typy, stałe
│       ├── features/             # Komponenty funkcjonalne
│       └── shared/               # reservationApi.ts, UI components
└── tests/                        # Testy
```

## Uruchomienie

### Wymagania

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [PostgreSQL 16+](https://www.postgresql.org/download/)
- [Node.js 18+](https://nodejs.org/)
- dotnet-ef: `dotnet tool install --global dotnet-ef`

### 1. Baza danych

Utwórz użytkownika i bazę danych w PostgreSQL:

```sql
CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE restaurant OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE restaurant TO admin;
```

### 2. Backend

```bash
# Zastosuj migracje i uruchom backend
dotnet ef database update --project ResourcePilot.Infrastructure --startup-project ResourcePilot.Api
dotnet run --project ResourcePilot.Api
```

Backend startuje domyślnie na losowym porcie — adres widoczny jest w terminalu po uruchomieniu (`Now listening on: http://localhost:XXXX`).

Dokumentacja Swagger dostępna pod: `http://localhost:{PORT}/swagger`

### 3. Frontend

```bash
cd ResourcePilot.Ui
npm install
npm run dev
```

Frontend dostępny pod: `http://localhost:5173`

> **Ważne:** Upewnij się że stała `API_BASE` w pliku `src/shared/reservationApi.ts` wskazuje na właściwy port backendu.

## Endpointy API

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/Tables/available?date=&time=&guestCount=` | Wolne stoliki w terminie |
| `GET` | `/api/Reservation` | Lista wszystkich rezerwacji |
| `GET` | `/api/Reservation/{id}` | Szczegóły rezerwacji |
| `POST` | `/api/Reservation` | Nowa rezerwacja |
| `PATCH` | `/api/Reservation/{id}` | Aktualizacja statusu / notatki |
| `DELETE` | `/api/Reservation/{id}` | Anulowanie rezerwacji |

## Funkcjonalności

- Rezerwacja stolika w 3 krokach (data → stolik → dane gościa)
- Sprawdzanie dostępności stolików w czasie rzeczywistym
- Blokada stolika na 2 godziny od momentu rezerwacji
- Panel administracyjny restauracji z zarządzaniem rezerwacjami
- Walidacja danych po stronie frontendu i backendu
- Automatyczne seedowanie bazy danych przy pierwszym uruchomieniu

## Wzorce projektowe

- **Clean Architecture** — podział na warstwy Domain / Application / Infrastructure / API
- **Dependency Injection** — serwisy wstrzykiwane przez konstruktor
- **DTO (Data Transfer Object)** — oddzielenie modelu domenowego od kontraktu API
- **Service Layer** — logika biznesowa wydzielona do `ReservationService`
- **Adapter Pattern** — `reservationApi.ts` tłumaczy format danych frontend ↔ backend

## Zespół

| Imię i Nazwisko | Rola |
|----------------|------|
| [ Imię i Nazwisko ] | Frontend (React / TypeScript) |
| [ Imię i Nazwisko ] | API & Domain (.NET / C#) |
| [ Imię i Nazwisko ] | Baza danych, Integracja, Testy i Dokumentacja |
