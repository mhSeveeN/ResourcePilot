using ResourcePilot.Domain.Common;

namespace ResourcePilot.Domain.Entities
{
    public class ResourceCategory : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        public ICollection<Resource> Resources { get; set; } = new List<Resource>();
    }
}

// Kategorie i zasoby są kluczowymi elementami w systemie zarządzania zasobami. Klasa `ResourceCategory` reprezentuje kategorię zasobów, która może być używana do grupowania podobnych zasobów razem. Właściwości `Name` i `Slug` przechowują nazwę kategorii oraz jej unikalny identyfikator w formie przyjaznej dla URL. Kolekcja `Resources` umożliwia łatwe zarządzanie relacją między kategorią a zasobami, które do niej należą. Dziedziczenie po klasie `AuditableEntity` pozwala na automatyczne śledzenie dat utworzenia i aktualizacji kategorii, co jest ważne dla audytu i zarządzania danymi. 