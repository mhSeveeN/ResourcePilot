using ResourcePilot.Domain.Common;
using ResourcePilot.Domain.Enums;

namespace ResourcePilot.Domain.Entities
{
    public class Resource : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }

        public int Capacity { get; set; }
        public ResourceStatus Status { get; set; }

        public Guid ResourceCategoryId { get; set; }
        public ResourceCategory ResourceCategory { get; set; } = null!;

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<SupportTicket> Tickets { get; set; } = new List<SupportTicket>();
    }
}

// Kategorie i zasoby są kluczowymi elementami w systemie zarządzania zasobami. Klasa `Resource` reprezentuje pojedynczy zasób, który może być rezerwowany lub zgłaszany w systemie. Właściwości takie jak `Name`, `Description`, `Location`, `Capacity` i `Status` przechowują podstawowe informacje o zasobie, jego lokalizacji, pojemności oraz aktualnym stanie. Relacja z klasą `ResourceCategory` umożliwia grupowanie zasobów według kategorii, co ułatwia ich organizację i wyszukiwanie. Kolekcje `Reservations` i `Tickets` pozwalają na zarządzanie rezerwacjami i zgłoszeniami wsparcia związanymi z danym zasobem, co jest kluczowe dla efektywnego zarządzania zasobami w systemie. Dziedziczenie po klasie `AuditableEntity` pozwala na automatyczne śledzenie dat utworzenia i aktualizacji zasobu, co jest ważne dla audytu i zarządzania danymi.  