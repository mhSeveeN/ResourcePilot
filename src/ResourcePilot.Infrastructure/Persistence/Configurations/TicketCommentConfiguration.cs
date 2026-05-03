using ResourcePilot.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class TicketCommentConfiguration : IEntityTypeConfiguration<TicketComment>
    {
        public void Configure(EntityTypeBuilder<TicketComment> builder)
        {
            builder.ToTable("TicketComments");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Content)
                .IsRequired()
                .HasMaxLength(4000);

            builder.HasOne(x => x.AuthorUser)
                .WithMany(x => x.TicketComments)
                .HasForeignKey(x => x.AuthorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.SupportTicketId);
            builder.HasIndex(x => x.AuthorUserId);
            builder.HasIndex(x => x.CreatedAt);
        }
    }
}

// Fluent API configuration for the TicketComment entity. It defines the table name, primary key, properties, relationships, and indexes for the TicketComments table in the database.
