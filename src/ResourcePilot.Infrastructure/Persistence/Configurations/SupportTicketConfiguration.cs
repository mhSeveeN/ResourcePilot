using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class SupportTicketConfiguration : IEntityTypeConfiguration<SupportTicket>
    {
        public void Configure(EntityTypeBuilder<SupportTicket> builder)
        {
            builder.ToTable("SupportTickets");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Description)
                .IsRequired()
                .HasMaxLength(4000);

            builder.Property(x => x.Category)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Priority)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.CreatedTickets)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.AssignedToUser)
                .WithMany(x => x.AssignedTickets)
                .HasForeignKey(x => x.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Resource)
                .WithMany(x => x.Tickets)
                .HasForeignKey(x => x.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Comments)
                .WithOne(x => x.SupportTicket)
                .HasForeignKey(x => x.SupportTicketId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => x.CreatedByUserId);
            builder.HasIndex(x => x.AssignedToUserId);
            builder.HasIndex(x => x.ResourceId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.Priority);
        }
    }
}

// Fluent API configuration for the SupportTicket entity, defining table name, keys, properties, relationships, and indexes.
