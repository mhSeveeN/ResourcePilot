namespace ResourcePilot.Domain.Enums
{
    public enum ReservationStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Cancelled = 3,
        Completed = 4
    }
}

// Enumy są używane do definiowania zestawu stałych wartości, które reprezentują różne stany lub opcje. W tym przypadku, `ReservationStatus` reprezentuje różne statusy rezerwacji, takie jak "Oczekująca", "Zatwierdzona", "Odrzucona", "Anulowana" i "Zakończona". Każdy status jest przypisany do unikalnej wartości całkowitej, co ułatwia ich przechowywanie i porównywanie w kodzie.  