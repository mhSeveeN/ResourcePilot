// Interface responsible for contract for reservation servis
// By the I. controllers depends on abstraction - not of implementation
// It's making easy to write Unit Tests

using ResourcePilot.Application.Common.DTOs;


namespace ResourcePilot.Application.Common.Interfaces;

/// <summary>
/// Interfejs serwisu - dzięki temu kontroler zależy od abstarkcji, nie implementacji (SOLID).
/// </summary>


public interface IReservationService
{
    // returning empty tables, sorting, concrets, reservations, updates, cancelling
    Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int guestCount);
    Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync();
    Task<ReservationResponseDto?> GetReservationByIdAsync(int id);
    Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto);

    Task<ReservationResponseDto?> UpdateReservationAsync(int id, UpdateReservationDto dto);
    Task<bool> CancelReservationAsync(int id);
}