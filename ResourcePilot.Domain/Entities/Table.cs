// MOdel representing restaurant table with unique number seened by client and maximum guest count.
namespace ResourcePilot.Domain.Entities;

public class Table
{
    public int Id { get; set; }
    public int Number { get; set; }
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation property for list of all reservation
    // empty list for evading null
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}