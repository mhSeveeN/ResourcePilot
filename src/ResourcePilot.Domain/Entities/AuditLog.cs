using System.Dynamic;
using ResourcePilot.Domain.Common;

namespace ResourcePilot.Domain.Entities
{
    public class AuditLog : AuditableEntity
    {
        public Guid? ActorUserId { get; set; }
        public ApplicationUser? ActorUser { get; set; }

        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;

        public string Action { get; set; } = string.Empty;

        public string? BeforeJson { get; set; }
        public string? AfterJson { get; set; }

        public string? IpAddress { get; set; }
    }
}

// Audit Log is a record of changes made to an entity in the system. It captures information about who made the change, what was changed, and when it was changed. This can be useful for tracking changes, debugging issues, and maintaining an audit trail for compliance purposes.   