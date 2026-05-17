using ResourcePilot.Domain.Common;
using ResourcePilot.Domain.Enums;

namespace ResourcePilot.Domain.Entities
{
    public class SupportTicket : AuditableEntity
    {
        public Guid CreatedByUserId { get; set; }
        public ApplicationUser CreatedByUser { get; set; } = null!;

        public Guid? AssignedToUserId { get; set; }
        public ApplicationUser? AssignedToUser { get; set; }

        public Guid? ResourceID { get; set; }
        public Resource? Resource { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;
        public TicketPriority Priority { get; set; }
        public TicketStatus Status { get; set; }

        public DateTimeOffset? ResolvedAt { get; set; }
        public DateTimeOffset? ClosedAt { get; set; }

        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
    }
}


// Tickety i komentarze do ticketa, które będą wyświetlane w kolejności od najnowszego do najstarszego. Każdy komentarz będzie zawierał informacje o autorze, treści komentarza oraz dacie dodania. Dzięki temu użytkownicy będą mogli łatwo śledzić historię komunikacji i rozwiązywania problemu związanego z danym ticketem. 