using Microsoft.AspNetCore.Mvc;
using RestaurantReservationAPI.Models;

namespace RestaurantReservationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        // Statyczna lista rezerwacji przechowywana w pamięci aplikacji.
        // Dane znikają po restarcie – docelowo zastąpiona bazą danych.
        private static List<Reservation> reservations_List = new();

        // Statyczna lista wszystkich stolików w restauracji (15 sztuk).
        // Zakodowana na stałe – docelowo będzie pobierana z bazy danych.
        // Stoliki 1–7:   4-osobowe
        // Stoliki 8–11:  8-osobowe
        // Stoliki 12–15: 2-osobowe
        private static List<Table> allTables_List = new()
        {
            new Table { TableNumber = 1,  Capacity = 4 },
            new Table { TableNumber = 2,  Capacity = 4 },
            new Table { TableNumber = 3,  Capacity = 4 },
            new Table { TableNumber = 4,  Capacity = 4 },
            new Table { TableNumber = 5,  Capacity = 4 },
            new Table { TableNumber = 6,  Capacity = 4 },
            new Table { TableNumber = 7,  Capacity = 4 },
            new Table { TableNumber = 8,  Capacity = 8 },
            new Table { TableNumber = 9,  Capacity = 8 },
            new Table { TableNumber = 10, Capacity = 8 },
            new Table { TableNumber = 11, Capacity = 8 },
            new Table { TableNumber = 12, Capacity = 2 },
            new Table { TableNumber = 13, Capacity = 2 },
            new Table { TableNumber = 14, Capacity = 2 },
            new Table { TableNumber = 15, Capacity = 2 },
        };

        // ---------------------------------------------------------------
        // GET /api/reservations
        // Zwraca listę wszystkich istniejących rezerwacji.
        // ---------------------------------------------------------------
        [HttpGet]
        public IActionResult GetReservations_Controller()
        {
            return Ok(reservations_List);
        }

        // ---------------------------------------------------------------
        // POST /api/reservations
        // Przyjmuje nową rezerwację z ciała żądania (JSON) i zapisuje ją.
        // ---------------------------------------------------------------
        [HttpPost]
        public IActionResult AddReservation_Controller([FromBody] Reservation reservation_Model)
        {
            reservations_List.Add(reservation_Model);
            return Ok(reservation_Model);
        }

        // ---------------------------------------------------------------
        // GET /api/reservations/available-tables?date=2025-06-15T19:00:00
        //
        // Przyjmuje datę i godzinę jako parametr w URL (query string),
        // a następnie zwraca listę wolnych stolików na ten termin.
        //
        // Logika działania:
        //   1. Pobierz numery stolików już zajętych w podanym terminie.
        //   2. Zwróć wszystkie stoliki, których nie ma na liście zajętych.
        //
        // Przykładowe zapytanie:
        //   /api/reservations/available-tables?date=2025-06-15T19:00:00
        // ---------------------------------------------------------------
        [HttpGet("available-tables")]
        public IActionResult GetAvailableTables_Controller([FromQuery] DateTime date)
        {
            // Sprawdzamy czy data w ogóle została podana (DateTime ma domyślną wartość MinValue)
            if (date == DateTime.MinValue)
            {
                // BadRequest() zwraca HTTP 400 z komunikatem błędu
                return BadRequest("Podaj datę i godzinę rezerwacji (parametr: date).");
            }

            // Każda rezerwacja blokuje stolik przez 2 godziny od podanej godziny.
            // Przykład: rezerwacja na 18:00 blokuje stolik w przedziale [18:00, 20:00).
            //
            // Stolik jest zajęty jeśli przedziały czasowe zachodzą na siebie, tzn.:
            //   - istniejąca rezerwacja zaczyna się przed końcem nowej (existingStart < requestedEnd)
            //   - istniejąca rezerwacja kończy się po początku nowej  (existingEnd   > requestedStart)
            //
            // Ta sama logika zadziała po przejściu na bazę danych – wystarczy
            // przenieść warunek Where() do zapytania LINQ-to-SQL / EF Core.
            var reservationDuration = TimeSpan.FromHours(2);

            var requestedStart = date;
            var requestedEnd = date + reservationDuration;

            var occupiedTableNumbers_List = reservations_List
                .Where(r =>
                {
                    var existingStart = r.ReservationDate_Model;
                    var existingEnd = r.ReservationDate_Model + reservationDuration;

                    // Przedziały zachodzą na siebie gdy NIE jest tak,
                    // że jeden kończy się zanim drugi się zaczyna
                    return existingStart < requestedEnd && existingEnd > requestedStart;
                })
                .Select(r => r.TableNumber_Model)
                .ToHashSet();

            // Filtrujemy wszystkie stoliki – zostawiamy tylko te,
            // których numer NIE znajduje się na liście zajętych
            var availableTables_List = allTables_List
                .Where(t => !occupiedTableNumbers_List.Contains(t.TableNumber))
                .ToList();

            // Jeśli żaden stolik nie jest wolny, zwracamy 404 z komunikatem
            if (!availableTables_List.Any())
            {
                return NotFound($"Brak wolnych stolików na dzień {date:yyyy-MM-dd HH:mm}.");
            }

            // Zwracamy HTTP 200 z listą wolnych stolików jako JSON
            return Ok(availableTables_List);
        }
    }
}