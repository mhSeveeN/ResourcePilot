namespace ResourcePilot.Domain.Entities;

public class Table
{
    public int Id { get; set; }
    public int Number { get; set; }
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}