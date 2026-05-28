using ResourcePilot.Application.Common.DTOs;


namespace ResourcePilot.Application.Common.Interfaces;

/// <summary>
/// Interfejs serwisu - dzięki temu kontroler zależy od abstarkcji, nie implementacji (SOLID).
/// </summary>


public interface IReservationService
{
    Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int guestCount);
    Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync();
    Task<ReservationResponseDto?> GetReservationByIdAsync(int id);
    Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto);

    Task<ReservationResponseDto?> UpdateReservationAsync(int id, UpdateReservationDto dto);
    Task<bool> CancelReservationAsync(int id);
}