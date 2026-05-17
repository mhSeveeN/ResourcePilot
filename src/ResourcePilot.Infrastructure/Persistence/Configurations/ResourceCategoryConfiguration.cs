using ResourcePilot.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ResourcePilot.Infrastructure.Persistence.Configurations
{
    public class ResourceCategoryConfiguration : IEntityTypeConfiguration<ResourceCategory>
    {
        public void Configure(EntityTypeBuilder<ResourceCategory> builder)
        {
            builder.ToTable("ResourceCategories");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Slug)
                .IsRequired()
                .HasMaxLength(120);

            builder.HasIndex(x => x.Name).IsUnique();
            builder.HasIndex(x => x.Slug).IsUnique();
        }
    }
}


// This code defines the ResourceCategoryConfiguration class, which implements the IEntityTypeConfiguration interface for the ResourceCategory entity. The Configure method is used to specify the table name, primary key, property configurations (such as required and max length), and unique indexes for the Name and Slug properties. This configuration will be applied when the model is being built in the ResourcePilotDbContext.
// Fluent Configuration is used here to define the database schema for the ResourceCategory entity without using data annotations in the entity class itself. This approach allows for a cleaner separation of concerns and more flexibility in configuring the entity's mapping to the database.