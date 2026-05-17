using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.ToTable("Reservations");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Purpose)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(x => x.RejectionReason)
                .HasMaxLength(500);

            builder.Property(x => x.StartAt).IsRequired();

            builder.Property(x => x.EndAt).IsRequired();

            builder.HasOne(x => x.User)
                .WithMany(x => x.Reservations)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Resource)
                .WithMany(x => x.Reservations)
                .HasForeignKey(x => x.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ProcessedByUser)
                .WithMany()
                .HasForeignKey(x => x.ProcessedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.ResourceId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => new { x.ResourceId, x.StartAt, x.EndAt });
        }
    }
}

// Fluent Reservation configuration for Entity Framework Core, defining the schema and relationships for the Reservation entity.
