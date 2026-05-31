// Model representing table reservation containing every data needed
using ResourcePilot.Domain.Enums;

namespace ResourcePilot.Domain.Entities;

public class Reservation
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public Table Table { get; set; } = null!;
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;
    public DateOnly ReservationDate { get; set; }
    public TimeOnly ReservationTime { get; set; }
    public int GuestCount { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}