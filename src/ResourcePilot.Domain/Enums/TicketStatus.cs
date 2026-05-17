namespace ResourcePilot.Domain.Enums
{
    public enum TicketStatus
    {
        New = 0,
        InProgress = 1,
        Resolved = 2,
        Closed = 3
    }
}

// Enum `TicketStatus` jest używany do reprezentowania różnych statusów zgłoszeń w systemie. Każdy status jest przypisany do unikalnej wartości całkowitej, co ułatwia ich przechowywanie i porównywanie w kodzie. Statusy takie jak "Nowy", "W trakcie", "Rozwiązany" i "Zamknięty" pomagają w zarządzaniu zgłoszeniami i określaniu ich aktualnego stanu. 