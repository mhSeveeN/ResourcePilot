using ResourcePilot.Domain.Common;
using ResourcePilot.Domain.Enums;

namespace ResourcePilot.Domain.Entities
{
    public class Reservation : AuditableEntity
    {
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public Guid ResourceId { get; set; }
        public Resource Resource { get; set; } = null!;

        public DateTimeOffset StartAt { get; set; }
        public DateTimeOffset EndAt { get; set; }

        public string Purpose { get; set; } = string.Empty;
        public ReservationStatus Status { get; set; }

        public Guid? ProcessedByUserId { get; set; }
        public ApplicationUser? ProcessedByUser { get; set; }

        public string? RejectionReason { get; set; }
    }
}

// Rezerwacje są kluczowym elementem systemu zarządzania zasobami, umożliwiając użytkownikom rezerwowanie zasobów na określony czas. Klasa `Reservation` reprezentuje pojedynczą rezerwację, zawierającą informacje o użytkowniku dokonującym rezerwacji, zasobie, który jest rezerwowany, oraz czasie trwania rezerwacji. Właściwości takie jak `Purpose` i `Status` pozwalają na określenie celu rezerwacji oraz jej aktualnego stanu (np. oczekująca, zatwierdzona, odrzucona). Relacja z klasą `ApplicationUser` umożliwia śledzenie, kto dokonał rezerwacji oraz kto ją przetworzył (zatwierdził lub odrzucił). Dodatkowo, właściwość `RejectionReason` pozwala na przechowywanie informacji o przyczynie odrzucenia rezerwacji, co jest ważne dla komunikacji z użytkownikami i zarządzania procesem rezerwacji. Dziedziczenie po klasie `AuditableEntity` zapewnia automatyczne śledzenie dat utworzenia i aktualizacji rezerwacji, co jest istotne dla audytu i zarządzania danymi. 