using Microsoft.EntityFrameworkCore;
using ResourcePilot.Api.Models;

namespace ResourcePilot.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Relacja: jeden stolik ma wiele rezerwacji
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Table)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TableId)
            .OnDelete(DeleteBehavior.Restrict); // Zapobiega usuwaniu stolika, jeśli ma rezerwacje

        // Indeks: szybkie wyszukiwanie rezerwacji po dacie i stoliku
        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.TableId, r.ReservationDate });

        // EF Core konwertuje DateOnly < - > SQLite TEXT automatycznie od .NET 8.00
    }
}