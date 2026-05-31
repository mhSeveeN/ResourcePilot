// Class responsible for inserting db with start data.
// It starts automatically when app starts if db is empty
using ResourcePilot.Domain.Entities;

namespace ResourcePilot.Infrastructure.Persistence;

public static class DbSeeder
{
    // Method for checking if db contains tables - if not adding them.
    public static void Seed(ResourcePilotDbContext context)
    {
        if (context.Tables.Any()) return; // DB has been seeded

        var tables = new List<Table>
        {
           new() { Number = 1, Capacity = 4, Description = "Stolik 1 - 4 osoby" },
        new() { Number = 2, Capacity = 4, Description = "Stolik 2 - 4 osoby" },
        new() { Number = 3, Capacity = 4, Description = "Stolik 3 - 4 osoby" },
        new() { Number = 4, Capacity = 4, Description = "Stolik 4 - 4 osoby" },
        new() { Number = 5, Capacity = 4, Description = "Stolik 5 - 4 osoby" },
        new() { Number = 6, Capacity = 4, Description = "Stolik 6 - 4 osoby" },
        new() { Number = 7, Capacity = 4, Description = "Stolik 7 - 4 osoby" },
        new() { Number = 8, Capacity = 8, Description = "Stolik 8 - 8 osób" },
        new() { Number = 9, Capacity = 8, Description = "Stolik 9 - 8 osób" },
        new() { Number = 10, Capacity = 8, Description = "Stolik 10 - 8 osób" },
        new() { Number = 11, Capacity = 8, Description = "Stolik 11 - 8 osób" },
        new() { Number = 12, Capacity = 2, Description = "Stolik 12 - 2 osoby" },
        new() { Number = 13, Capacity = 2, Description = "Stolik 13 - 2 osoby" },
        new() { Number = 14, Capacity = 2, Description = "Stolik 14 - 2 osoby" },
        new() { Number = 15, Capacity = 2, Description = "Stolik 15 - 2 osoby" },
        };

        context.Tables.AddRange(tables);
        context.SaveChanges();
    }
}