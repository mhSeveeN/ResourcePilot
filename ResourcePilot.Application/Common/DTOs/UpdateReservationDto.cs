using System.ComponentModel.DataAnnotations;
using ResourcePilot.Domain.Enums;

namespace ResourcePilot.Application.Common.DTOs;
/// <summary>
/// Dane do aktualizacji istniejacej rezerwacji (np. zmiana statusu przez restauracje).
/// </summary>


public class UpdateReservationDto
{
    public DateOnly? ReservationDate { get; set; }
    public TimeOnly? ReservationTime { get; set; }

    [Range(1, 8)]
    public int? GuestCount { get; set; }

    public string? Notes { get; set; }
    public ReservationStatus? Status { get; set; }
}