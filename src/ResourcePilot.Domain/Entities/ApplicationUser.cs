using System;
using Microsoft.AspNetCore.Identity;
using ResourcePilot.Domain.Common;

namespace ResourcePilot.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;
        public bool isActive { get; set; } = true;

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }


        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<SupportTicket> CreatedTickets { get; set; } = new List<SupportTicket>();
        public ICollection<SupportTicket> AssignedTickets { get; set; } = new List<SupportTicket>();
        public ICollection<TicketComment> TicketComments { get; set; } = new List<TicketComment>();
        public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}

// Użytkownik `ApplicationUser` jest rozszerzeniem klasy `IdentityUser` z biblioteki ASP.NET Core Identity, która zapewnia podstawową funkcjonalność zarządzania użytkownikami, taką jak uwierzytelnianie i autoryzacja. Klasa ta dodaje dodatkowe właściwości, takie jak `FullName`, `isActive`, `CreatedAt` i `UpdatedAt`, które przechowują pełną nazwę użytkownika, status aktywności oraz daty utworzenia i aktualizacji konta. Ponadto, klasa zawiera kolekcje związane z rezerwacjami, zgłoszeniami wsparcia, komentarzami do zgłoszeń oraz logami audytu, co umożliwia łatwe zarządzanie relacjami między użytkownikiem a innymi encjami w systemie.    