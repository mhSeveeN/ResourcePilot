using System.ComponentModel.DataAnnotations;

namespace ResourcePilot.Application.Common.DTOs;

public class CreateReservationDto
{
    [Required(ErrorMessage = "ID stolika jest wymagane.")]
    public int TableId { get; set; }

    [Required(ErrorMessage = "Imię i nazwisko jest wymagane.")]
    [MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email jest wymagany.")]
    [EmailAddress(ErrorMessage = "Nieprawidłowy format adresu email.")]
    public string CustomerEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Numer telefonu jest wymagany.")]
    [Phone(ErrorMessage = "Nieprawidłowy format numeru telefonu.")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Data rezerwacji jest wymagana.")]
    public DateOnly ReservationDate { get; set; }

    [Required(ErrorMessage = "Godzina rezerwacji jest wymagana.")]
    public TimeOnly ReservationTime { get; set; }

    [Range(1, 8, ErrorMessage = "Liczba osób musi być między 1 a 8.")]
    public int GuestCount { get; set; }

    [MaxLength(500)]
    public string Notes { get; set; }
}