namespace ResourcePilot.Domain.Enums

{
    public enum ResourceStatus
    {
        Available = 0,
        Unavailable = 1,
        Maintenance = 2,
        Archived = 3
    }
}

// Enum `ResourceStatus` jest używany do reprezentowania różnych stanów zasobów w systemie. Każdy status jest przypisany do unikalnej wartości całkowitej, co ułatwia ich przechowywanie i porównywanie w kodzie. Statusy takie jak "Dostępny", "Niedostępny", "W konserwacji" i "Zarchiwizowany" pomagają w zarządzaniu zasobami i określaniu ich aktualnego stanu.    