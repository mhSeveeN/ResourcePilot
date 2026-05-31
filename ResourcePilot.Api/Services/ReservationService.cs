// Implementation of reservation service for managing restaurant reservations, including availability checks, CRUD operations, and status updates.
// Separated from controllers for better maintainability and testability. Uses Entity Framework Core for data access and includes business logic for reservation rules.

using Microsoft.EntityFrameworkCore;
using ResourcePilot.Application.Common.DTOs;
using ResourcePilot.Application.Common.Interfaces;
using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using ResourcePilot.Infrastructure.Persistence;

namespace ResourcePilot.Api.Services;

public class ReservationService : IReservationService
{
    private readonly ResourcePilotDbContext _db;
    private static readonly TimeSpan ReservationDuration = TimeSpan.FromHours(2);

    public ReservationService(ResourcePilotDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int guestCount)
    {
        var occupiedTableIds = await _db.Reservations
            .Where(r => r.ReservationDate == date &&
                        r.Status != ReservationStatus.Cancelled &&
                        r.ReservationTime < time.Add(ReservationDuration) &&
                        r.ReservationTime.Add(ReservationDuration) > time)
            .Select(r => r.TableId)
            .ToListAsync();

        return await _db.Tables
            .Where(t => t.IsActive && t.Capacity >= guestCount && !occupiedTableIds.Contains(t.Id))
            .Select(t => new TableDto(t.Id, t.Number, t.Capacity, t.Description))
            .ToListAsync();
    }

    public async Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync()
    {
        return await _db.Reservations
            .Include(r => r.Table)
            .OrderByDescending(r => r.ReservationDate)
            .ThenBy(r => r.ReservationTime)
            .Select(r => MapToDto(r))
            .ToListAsync();
    }

    public async Task<ReservationResponseDto?> GetReservationByIdAsync(int id)
    {
        var reservation = await _db.Reservations
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == id);

        return reservation is null ? null : MapToDto(reservation);
    }

    public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto)
    {
        var table = await _db.Tables.FindAsync(dto.TableId)
            ?? throw new KeyNotFoundException($"Stolik o ID {dto.TableId} nie istnieje.");

        if (!table.IsActive)
            throw new InvalidOperationException("Ten stolik jest chwilowo niedostępny.");

        if (table.Capacity < dto.GuestCount)
            throw new InvalidOperationException($"Stolik {table.Number} mieści maksymalnie {table.Capacity} osoby.");

        var isOccupied = await _db.Reservations.AnyAsync(r =>
            r.TableId == dto.TableId &&
            r.ReservationDate == dto.ReservationDate &&
            r.Status != ReservationStatus.Cancelled &&
            r.ReservationTime < dto.ReservationTime.Add(ReservationDuration) &&
            r.ReservationTime.Add(ReservationDuration) > dto.ReservationTime);

        if (isOccupied)
            throw new InvalidOperationException("Ten stolik jest już zajęty w tym terminie.");

        var reservation = new Reservation
        {
            TableId = dto.TableId,
            CustomerName = dto.CustomerName,
            Email = dto.CustomerEmail,
            Phone = dto.CustomerPhone,
            ReservationDate = dto.ReservationDate,
            ReservationTime = dto.ReservationTime,
            GuestCount = dto.GuestCount,
            Notes = dto.Notes,
            Status = ReservationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        reservation.Table = table; // Załaduj dane stolika do DTO
        return MapToDto(reservation);
    }

    public async Task<ReservationResponseDto?> UpdateReservationAsync(int id, UpdateReservationDto dto)
    {
        var reservation = await _db.Reservations
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation is null) return null;

        if (dto.ReservationDate.HasValue)
            reservation.ReservationDate = dto.ReservationDate.Value;
        if (dto.ReservationTime.HasValue)
            reservation.ReservationTime = dto.ReservationTime.Value;
        if (dto.GuestCount.HasValue)
            reservation.GuestCount = dto.GuestCount.Value;
        if (dto.Notes is not null)
            reservation.Notes = dto.Notes;
        if (dto.Status.HasValue)
            reservation.Status = dto.Status.Value;

        await _db.SaveChangesAsync();
        return MapToDto(reservation);
    }

    public async Task<bool> CancelReservationAsync(int id)
    {
        var reservation = await _db.Reservations.FindAsync(id);
        if (reservation is null) return false;

        reservation.Status = ReservationStatus.Cancelled;
        await _db.SaveChangesAsync();
        return true;
    }

    public static ReservationResponseDto MapToDto(Reservation r) => new(
        r.Id,
        r.TableId,
        r.Table.Number,
        r.CustomerName,
        r.Email,
        r.Phone,
        r.ReservationDate,
        r.ReservationTime,
        r.GuestCount,
        r.Notes,
        r.Status.ToString(),
        r.CreatedAt
    );
}