using ResourcePilot.Domain.Common;

namespace ResourcePilot.Domain.Entities
{
    public class TicketComment : AuditableEntity
    {
        public Guid SupportTicketId { get; set; }
        public SupportTicket SupportTicket { get; set; } = null!;

        public Guid AuthorUserId { get; set; }
        public ApplicationUser AuthorUser { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
    }
}

// Tickety i komentarze do tickety. Każdy komentarz jest powiązany z konkretnym ticketem oraz autorem (użytkownikiem). Zawiera treść komentarza oraz informacje o dacie utworzenia i modyfikacji (dzięki dziedziczeniu po AuditableEntity). Komentarze mogą być używane do komunikacji między użytkownikami a zespołem wsparcia, umożliwiając wymianę informacji i aktualizacji dotyczących ticketów.   