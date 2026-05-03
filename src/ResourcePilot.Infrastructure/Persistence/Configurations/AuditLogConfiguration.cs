using ResourcePilot.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id);

            builder.Property(x => x.EntityName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.EntityId)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Action)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.BeforeJson)
                .HasColumnType("text");

            builder.Property(x => x.AfterJson)
                .HasColumnType("text");

            builder.Property(x => x.IpAddress)
                .HasMaxLength(45);

            builder.HasOne(x => x.ActorUser)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.ActorUserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => x.EntityName);
            builder.HasIndex(x => x.EntityId);
            builder.HasIndex(x => x.ActorUserId);
            builder.HasIndex(x => x.CreatedAt);
        }
    }
}

// Fluent API configuration for the AuditLog entity, defining table name, primary key, properties, relationships, and indexes.
