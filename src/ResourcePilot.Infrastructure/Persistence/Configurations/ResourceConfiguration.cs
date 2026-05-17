using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class ResourceConfiguration : IEntityTypeConfiguration<Resource>
    {
        public void Configure(EntityTypeBuilder<Resource> builder)
        {
            builder.ToTable("Resources");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.Location).HasMaxLength(250);

            builder.Property(x => x.Capacity).IsRequired();

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.HasOne(x => x.ResourceCategory)
                .WithMany(x => x.Resources)
                .HasForeignKey(x => x.ResourceCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.Name);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => new { x.ResourceCategoryId, x.Status });
        }
    }
}

// This code defines the ResourceConfiguration class, which implements the IEntityTypeConfiguration interface for the Resource entity. The Configure method specifies the table name, primary key, property configurations (such as required and max length), and relationships with the ResourceCategory entity. It also sets up indexes on the Name, Status, and a composite index on ResourceCategoryId and Status for efficient querying. The Status property is configured to be stored as an integer in the database using a value converter.
// Fluent Configuration is used here to define the database schema for the Resource entity without using data annotations in the entity class itself. This approach allows for a cleaner separation of concerns and more flexibility in configuring the entity's mapping to the database.
