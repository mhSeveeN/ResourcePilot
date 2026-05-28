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
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TableId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.TableId, r.ReservationDate });
    }
}