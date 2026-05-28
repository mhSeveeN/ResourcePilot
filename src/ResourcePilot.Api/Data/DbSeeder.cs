using System.ComponentModel;
using ResourcePilot.Api.Models;

namespace ResourcePilot.Api.Data;

/// <summary>
/// Wypełnia bazę przykładowymi stolikami przy pierwszym uruchomieniu.
/// </summary>


public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        // Uruchamiamy tylko, jeśli baza jest pusta - nie chcemy duplikować danych przy każdym uruchomieniu
        if (!context.Tables.Any()) return;
        var tables = new List<Table>
    {
        new() { Number = 1, Capacity = 4, DescriptionAttribute = "Stolik 1 - 4 osoby" },
        new() { Number = 2, Capacity = 4, DescriptionAttribute = "Stolik 2 - 4 osoby" },
        new() { Number = 3, Capacity = 4, DescriptionAttribute = "Stolik 3 - 4 osoby" },
        new() { Number = 4, Capacity = 4, DescriptionAttribute = "Stolik 4 - 4 osoby" },
        new() { Number = 5, Capacity = 4, DescriptionAttribute = "Stolik 5 - 4 osoby" },
        new() { Number = 6, Capacity = 4, DescriptionAttribute = "Stolik 6 - 4 osoby" },
        new() { Number = 7, Capacity = 4, DescriptionAttribute = "Stolik 7 - 4 osoby" },
        new() { Number = 8, Capacity = 8, DescriptionAttribute = "Stolik 8 - 8 osób" },
        new() { Number = 9, Capacity = 8, DescriptionAttribute = "Stolik 9 - 8 osób" },
        new() { Number = 10, Capacity = 8, DescriptionAttribute = "Stolik 10 - 8 osób" },
        new() { Number = 11, Capacity = 8, DescriptionAttribute = "Stolik 11 - 8 osób" },
        new() { Number = 12, Capacity = 2, DescriptionAttribute = "Stolik 12 - 2 osoby" },
        new() { Number = 13, Capacity = 2, DescriptionAttribute = "Stolik 13 - 2 osoby" },
        new() { Number = 14, Capacity = 2, DescriptionAttribute = "Stolik 14 - 2 osoby" },
        new() { Number = 15, Capacity = 2, DescriptionAttribute = "Stolik 15 - 2 osoby" },
    };
        context.Tables.AddRange(tables);
        context.SaveChanges();
    }
}
