using Microsoft.EntityFrameworkCore;
using ResourcePilot.Api.Data;
using ResourcePilot.Api.DTOs;
using ResourcePilot.Api.Models;

namespace ResourcePilot.Api.Services;

public class ReservationService : IReservationService
{
    private readonly AppDbContext _db;

    // Czas trwania rezerwacji - stolik jest "zajety" przez 2 godziny
    private static readonly TimeSpan ReservationDuration = TimeSpan.FromHours(2);

    public ReservationService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Zwraca stoliki wolne w danym terminie dla podanej liczby gosci.
    /// Stolik jest zajety jesli ma aktywna rezerwacje w oknie +- 2h od żadanej godziny.
    /// </summary>
    public async Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int guestCount)
    {
        // Pobierz zajete stoliki w tym terminie
        var occupiedTableIds = await _db.Reservations
            .Where(r => r.ReservationDate == date &&
                        r.Status != ReservationStatus.Cancelled &&
                        // Nakladanie sie okien czasowych
                        r.ReservationTime < time.Add(ReservationDuration) &&
                        r.ReservationTime.Add(ReservationDuration) > time)
            .Select(r => r.TableId)
            .ToListAsync();
        // Stoliki aktywne, wystarczająco duze i niezajete
        var availableTables = await _db.Tables
            .Where(t => t.IsActive &&
                        t.Capacity >= guestCount &&
                        !occupiedTableIds.Contains(t.Id))
            .Select(t => new TableDto(t.Id, t.Number, t.Capacity, t.Description))
            .ToListAsync();
        return availableTables;
    }

    public async Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync()
    {
        return await _db.Reservations
            .Include(r => r.Table) // JOIN ze stolikiem
            .OrderByDescending(r => r.ReservationDate)
            .ThenBy(r => r.ReservationTime)
            .Select(r => MapToDto(r))
            .ToListAsync();
    }

    public async Task<ReservationResponseDto?> GetReservationByIdAsync(int id)
    {
        var reservation = await _db.Reservations
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == id);
        return reservation == null ? null : MapToDto(reservation);
    }

    public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto)
    {
        // Weryfikacja: stolik istnieje i jest aktywny
        var table = await _db.Tables.FindAsync(dto.TableId) ?? throw new KeyNotFoundException($"Stolik o ID {dto.TableId} nie istnieje.");
        if (!table.IsActive)
            throw new InvalidOperationException("Ten stolik jest chwilowo niedostępny");

        //Weryfikacja: pojemność
        if (table.Capacity < dto.GuestCount)
            throw new InvalidOperationException($"Stolik {table.Number} mieści maksymalnie {table.Capacity} osoby.");

        // Weryfikacja: czy stolik jest dostępny w tym terminie
        var isOccupied = await _db.Reservations.AnyAsync(r =>
            r.TableId == dto.TableId &&
            r.ReservationDate == dto.ReservationDate &&
            r.Status != ReservationStatus.Cancelled &&
            r.ReservationTime < dto.ReservationTime.Add(ReservationDuration) &&
            r.ReservationTime.Add(ReservationDuration) > dto.ReservationTime);

        if (isOccupied)
            throw new InvalidOperationException("Ten stolik jest już zajęty w podanym terminie");

        var reservation = new ReservationService
        {
            TableId = dto.TableId,
            CustomerName = dto.CustomerName,
            Phone = dto.Phone,
            ReservationDate = dto.ReservationDate,
            ReservationTime = dto.ReservationTime,
            GuestCount = dto.GuestCount,
            Notes = dto.Notes,
            Status = ReservationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync();
        // Załaduj stolik do nawigacji (potrzebny MapToDto)
        reservation.Table = table;
        return MapToDto(reservation);
    }

    public async Task<ReservationResponseDto?> UpdateReservationAsync(int id, UpdateReservationDto dto)
    {
        var reservation = await _db.Reservations.Include(r => r.Table).FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null)
            return null;

        // Aktualizuj tylko podane pola (partial update)
        if (dto.ReservationDate.HasValue)
            reservation.ReservationDate = dto.ReservationDate.Value;
        if (dto.ReservationTime.HasValue) reservation.ReservationTime = dto.ReservationTime.Value;
        if (dto.GuestCount.HasValue)
            reservation.GuestCount = dto.GuestCount.Value;
        if (dto.Notes is not null)
            reservation.Notes = dto.Notes;
        if (dto.Status.HasValue)
            reservation.Status = dto.Status.Value;

        await _db.SaveChangesAsync();
        return MapToDto(reservation);
    }

    public async Task<bool> CancelReservationAsync(int id)
    {
        var reservation = await _db.Reservations.FindAsync(id);
        if (reservation == null)
            return false;

        reservation.Status = ReservationStatus.Cancelled;
        await _db.SaveChangesAsync();
        return true;
    }

    // Prywatna metoda mapująca model -> DTO
    // Uzywamy jej w kilku miejscach, więc wydzielamy żeby nie duplikować kodu
    private static ReservationResponseDto MapToDto(ReservationService r) => new(
        r.Id,
        r.TableId,
        r.Table.Number,
        r.CustomerName,
        r.Phone,
        r.ReservationDate,
        r.ReservationTime,
        r.GuestCount,
        r.Notes,
        r.Status.ToString(), // "Pending", "Confirmed", "Cancelled"
        r.CreatedAt
    );
}