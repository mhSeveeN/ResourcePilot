using System;

namespace ResourcePilot.Domain.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
    }
}

// Wspólna baza encji, zawierająca tylko identyfikator. Inne encje będą dziedziczyć po tej klasie, co pozwoli na łatwe zarządzanie identyfikatorami i zapewni spójność w całej domenie.