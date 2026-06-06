// ReservationServiceTests.cs
// ---------------------------
// Unit Tests for Reservation
// Using Moq and InMemory Database to test ReservationService without relying on
// real database or external dependencies. Tests cover creating reservations, checking available tables, cancelling and updating reservations.

using Microsoft.EntityFrameworkCore;
using Moq;
using ResourcePilot.Application.Common.DTOs;
using ResourcePilot.Api.Services;
using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using ResourcePilot.Infrastructure.Persistence;

namespace ResourcePilot.UnitTests;

public class ReservationServiceTests
{
    // ─── Helpers ────────────────────────────────────────────────────────────

    // Creates a new in-memory database context for testing, ensuring isolation between tests
    private static ResourcePilotDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<ResourcePilotDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new ResourcePilotDbContext(options);
    }

    // Creates a test table ready for use in tests
    private static Table CreateTestTable(int id = 1, int number = 1, int capacity = 4)
        => new Table
        {
            Id = id,
            Number = number,
            Capacity = capacity,
            Description = "Test table",
            IsActive = true,
        };

    // Creates a test reservation DTO ready for use in tests
    private static CreateReservationDto CreateTestDto(
        int tableId = 1,
        int guestCount = 2,
        DateOnly? date = null,
        TimeOnly? time = null) => new CreateReservationDto
        {
            TableId = tableId,
            CustomerName = "Jan Kowalski",
            CustomerEmail = "jan@test.pl",
            CustomerPhone = "+48 600 000 000",
            ReservationDate = date ?? DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            ReservationTime = time ?? new TimeOnly(19, 0),
            GuestCount = guestCount,
            Notes = "",
        };

    // ─── Test of creating reservations ──────────────────────────────────────────

    [Fact]
    public async Task CreateReservation_ValidData_ReturnsCreatedReservation()
    {
        // Arrange - preparing in-memory database with one active table
        var db = CreateInMemoryDb(nameof(CreateReservation_ValidData_ReturnsCreatedReservation));
        var table = CreateTestTable();
        db.Tables.Add(table);
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        var dto = CreateTestDto();

        // Act - calling reservation creation
        var result = await service.CreateReservationAsync(dto);

        // Assert - checking if reservation was created correctly
        Assert.NotNull(result);
        Assert.Equal("Jan Kowalski", result.CustomerName);
        Assert.Equal(2, result.GuestCount);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task CreateReservation_TableNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange - preparing empty database, table with ID 99 does not exist
        var db = CreateInMemoryDb(nameof(CreateReservation_TableNotFound_ThrowsKeyNotFoundException));
        var service = new ReservationService(db);
        var dto = CreateTestDto(tableId: 99);

        // Act & Assert - expecting exception when table does not exist
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.CreateReservationAsync(dto));
    }

    [Fact]
    public async Task CreateReservation_InactiveTable_ThrowsInvalidOperationException()
    {
        // Arrange - table exists but is disabled by admin
        var db = CreateInMemoryDb(nameof(CreateReservation_InactiveTable_ThrowsInvalidOperationException));
        var table = CreateTestTable();
        table.IsActive = false;
        db.Tables.Add(table);
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        var dto = CreateTestDto();

        // Act & Assert - disabled table cannot be reserved
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateReservationAsync(dto));
    }

    [Fact]
    public async Task CreateReservation_TooManyGuests_ThrowsInvalidOperationException()
    {
        // Arrange - table for 2 people, trying to reserve for 6
        var db = CreateInMemoryDb(nameof(CreateReservation_TooManyGuests_ThrowsInvalidOperationException));
        var table = CreateTestTable(capacity: 2);
        db.Tables.Add(table);
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        var dto = CreateTestDto(guestCount: 6);

        // Act & Assert - number of guests exceeds table capacity
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateReservationAsync(dto));
    }

    [Fact]
    public async Task CreateReservation_TableAlreadyBooked_ThrowsInvalidOperationException()
    {
        // Arrange - table already has a reservation at the same time
        var db = CreateInMemoryDb(nameof(CreateReservation_TableAlreadyBooked_ThrowsInvalidOperationException));
        var table = CreateTestTable();
        db.Tables.Add(table);

        var existingDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
        var existingTime = new TimeOnly(19, 0);

        // Existing reservation for the same table and time
        db.Reservations.Add(new Reservation
        {
            TableId = 1,
            Table = table,
            CustomerName = "Anna Nowak",
            Email = "anna@test.pl",
            Phone = "+48 111 111 111",
            ReservationDate = existingDate,
            ReservationTime = existingTime,
            GuestCount = 2,
            Notes = "",
            Status = ReservationStatus.Pending,
        });
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        // Trying to book the exact same time slot
        var dto = CreateTestDto(date: existingDate, time: existingTime);

        // Act & Assert - table is booked, cannot be reserved
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CreateReservationAsync(dto));
    }

    [Fact]
    public async Task CreateReservation_CancelledReservationExists_AllowsNewBooking()
    {
        // Arrange - exists cancelled reservation for the same table and time, but it should not block new booking
        var db = CreateInMemoryDb(nameof(CreateReservation_CancelledReservationExists_AllowsNewBooking));
        var table = CreateTestTable();
        db.Tables.Add(table);

        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
        var time = new TimeOnly(19, 0);

        db.Reservations.Add(new Reservation
        {
            TableId = 1,
            Table = table,
            CustomerName = "Stary Klient",
            Email = "stary@test.pl",
            Phone = "+48 000 000 000",
            ReservationDate = date,
            ReservationTime = time,
            GuestCount = 2,
            Notes = "",
            // Anulowana rezerwacja — shouldn't block new reservation for the same slot
            Status = ReservationStatus.Cancelled,
        });
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        var dto = CreateTestDto(date: date, time: time);

        // Act & Assert - new reservation should be allowed even if there's a cancelled one for the same slot
        var result = await service.CreateReservationAsync(dto);
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
    }

    // ─── Tests of downloading available tables ────────────────────────────────

    [Fact]
    public async Task GetAvailableTables_NoReservations_ReturnsAllActiveTables()
    {
        // Arrange - three active tables, no reservations, all should be available
        var db = CreateInMemoryDb(nameof(GetAvailableTables_NoReservations_ReturnsAllActiveTables));
        db.Tables.AddRange(
            CreateTestTable(id: 1, number: 1, capacity: 2),
            CreateTestTable(id: 2, number: 2, capacity: 4),
            CreateTestTable(id: 3, number: 3, capacity: 6)
        );
        await db.SaveChangesAsync();

        var service = new ReservationService(db);

        // Act
        var result = await service.GetAvailableTablesAsync(
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            new TimeOnly(19, 0),
            guestCount: 1);

        // Assert - all three tables should be returned as available
        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task GetAvailableTables_GuestCountFilter_ReturnsOnlySuitableTables()
    {
        // Arrange - tables for 2 and 6 people, searching for 4 guests
        var db = CreateInMemoryDb(nameof(GetAvailableTables_GuestCountFilter_ReturnsOnlySuitableTables));
        db.Tables.AddRange(
            CreateTestTable(id: 1, number: 1, capacity: 2),
            CreateTestTable(id: 2, number: 2, capacity: 6)
        );
        await db.SaveChangesAsync();

        var service = new ReservationService(db);

        // Act - searching for a table for 4 guests
        var result = await service.GetAvailableTablesAsync(
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            new TimeOnly(19, 0),
            guestCount: 4);

        // Assert - only the table for 6 people fits
        Assert.Single(result);
        Assert.Equal(6, result.First().Capacity);
    }

    [Fact]
    public async Task GetAvailableTables_InactiveTable_NotReturned()
    {
        // Arrange - one active and one inactive table, only the active one should be returned
        var db = CreateInMemoryDb(nameof(GetAvailableTables_InactiveTable_NotReturned));
        var active = CreateTestTable(id: 1, number: 1);
        var inactive = CreateTestTable(id: 2, number: 2);
        inactive.IsActive = false;

        db.Tables.AddRange(active, inactive);
        await db.SaveChangesAsync();

        var service = new ReservationService(db);

        // Act
        var result = await service.GetAvailableTablesAsync(
            DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            new TimeOnly(19, 0),
            guestCount: 1);

        // Assert - only the active table should be returned
        Assert.Single(result);
        Assert.Equal(1, result.First().Number);
    }

    // ─── Tests of cancelling reservations ─────────────────────────────────────────

    [Fact]
    public async Task CancelReservation_ExistingId_ReturnsTrue()
    {
        // Arrange
        var db = CreateInMemoryDb(nameof(CancelReservation_ExistingId_ReturnsTrue));
        var table = CreateTestTable();
        db.Tables.Add(table);
        db.Reservations.Add(new Reservation
        {
            Id = 1,
            TableId = 1,
            Table = table,
            CustomerName = "Test",
            Email = "t@t.pl",
            Phone = "+48 000 000 000",
            ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            ReservationTime = new TimeOnly(19, 0),
            GuestCount = 2,
            Notes = "",
            Status = ReservationStatus.Pending,
        });
        await db.SaveChangesAsync();

        var service = new ReservationService(db);

        // Act
        var result = await service.CancelReservationAsync(1);

        // Assert - cancelling should succeed
        Assert.True(result);

        // Check if the status has actually changed to Cancelled
        var reservation = await db.Reservations.FindAsync(1);
        Assert.Equal(ReservationStatus.Cancelled, reservation!.Status);
    }

    [Fact]
    public async Task CancelReservation_NonExistingId_ReturnsFalse()
    {
        // Arrange - pusta baza
        var db = CreateInMemoryDb(nameof(CancelReservation_NonExistingId_ReturnsFalse));
        var service = new ReservationService(db);

        // Act
        var result = await service.CancelReservationAsync(999);

        // Assert - cancelling a non-existing reservation returns false
        Assert.False(result);
    }

    // ─── Tests of updating reservations ───────────────────────────────────────

    [Fact]
    public async Task UpdateReservation_ValidId_UpdatesStatus()
    {
        // Arrange
        var db = CreateInMemoryDb(nameof(UpdateReservation_ValidId_UpdatesStatus));
        var table = CreateTestTable();
        db.Tables.Add(table);
        db.Reservations.Add(new Reservation
        {
            Id = 1,
            TableId = 1,
            Table = table,
            CustomerName = "Test",
            Email = "t@t.pl",
            Phone = "+48 000 000 000",
            ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            ReservationTime = new TimeOnly(19, 0),
            GuestCount = 2,
            Notes = "",
            Status = ReservationStatus.Pending,
        });
        await db.SaveChangesAsync();

        var service = new ReservationService(db);
        var updateDto = new UpdateReservationDto { Status = ReservationStatus.Confirmed };

        // Act - admin accepts the reservation, changing status to Confirmed
        var result = await service.UpdateReservationAsync(1, updateDto);

        // Assert - status should change to Confirmed
        Assert.NotNull(result);
        Assert.Equal("Confirmed", result.Status);
    }

    [Fact]
    public async Task UpdateReservation_NonExistingId_ReturnsNull()
    {
        // Arrange
        var db = CreateInMemoryDb(nameof(UpdateReservation_NonExistingId_ReturnsNull));
        var service = new ReservationService(db);
        var updateDto = new UpdateReservationDto { Status = ReservationStatus.Confirmed };

        // Act
        var result = await service.UpdateReservationAsync(999, updateDto);

        // Assert - a non-existing reservation returns null
        Assert.Null(result);
    }
}