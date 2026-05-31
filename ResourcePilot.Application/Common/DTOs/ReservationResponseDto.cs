using ResourcePilot.Application.Common.DTOs;

namespace ResourcePilot.Application.Common.DTOs;

/// <summary>
/// To co zwracamy frontendowi - pełne dane rezerweacji z informacją o stoliku.
/// </summary>


public record ReservationResponseDto(
    int Id,
    int TableId,
    int TableNumber,
    string CustomerName,
    string Email,
    string Phone,
    DateOnly ReservationDate,
    TimeOnly ReservationTime,
    int GuestCount,
    string? Notes,
    string Status,          // Zwracamy string zamiast int enuma - czytelniejsze w JSON-ie
    DateTime CreatedAt
);