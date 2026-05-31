// DB Context - main point of communication
using Microsoft.EntityFrameworkCore;
using ResourcePilot.Domain.Entities;


namespace ResourcePilot.Infrastructure.Persistence;

public class ResourcePilotDbContext : DbContext
{
    public ResourcePilotDbContext(DbContextOptions<ResourcePilotDbContext> options) : base(options)
    {
    }

    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // config 1 to N
        // 1 table can have a lot of reservations
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TableId)
            // prevent deleting table with reservation
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.TableId, r.ReservationDate });
    }
}