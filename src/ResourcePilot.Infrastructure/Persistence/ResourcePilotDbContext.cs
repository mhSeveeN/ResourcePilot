using ResourcePilot.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ResourcePilot.Infrastructure.Persistence
{
    public class ResourcePilotDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public ResourcePilotDbContext(DbContextOptions<ResourcePilotDbContext> options) : base(options)
        {
        }

        public DbSet<ResourceCategory> ResourceCategories => Set<ResourceCategory>();
        public DbSet<Resource> Resources => Set<Resource>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
        public DbSet<TicketComment> TicketComments => Set<TicketComment>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships and constraints here if needed
            builder.ApplyConfigurationsFromAssembly(typeof(ResourcePilotDbContext).Assembly);
        }
    }
}


// This code defines the ResourcePilotDbContext class, which inherits from IdentityDbContext to include ASP.NET Core Identity functionality. It includes DbSet properties for each of the domain entities (ResourceCategory, Resource, Reservation, SupportTicket, TicketComment, and AuditLog) and configures the model using the OnModelCreating method.  The constructor takes DbContextOptions and passes them to the base class constructor. The ApplyConfigurationsFromAssembly method is used to apply any entity configurations defined in the same assembly.   