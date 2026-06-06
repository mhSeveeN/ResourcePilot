// ReservationApiTests.cs
// ----------------------
// Integration tests for ReservationController — checking if the whole flow works correctly, from the moment
// an HTTP request is sent, through the controller, service, to the database, until the response is sent back.
// Tests are run in-memory without a real server or database.

using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ResourcePilot.Application.Common.DTOs;
using ResourcePilot.Domain.Entities;
using ResourcePilot.Domain.Enums;
using ResourcePilot.Infrastructure.Persistence;

namespace ResourcePilot.IntegrationTests;

// WebApplicationFactory starts the whole app in-memory, allowing us to send real HTTP requests to our controllers without a real server.
// We also replace the real database with an in-memory one for isolation and speed.
public class ReservationApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public ReservationApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            // Replace PostgreSQL with InMemory database in basic setup of the factory, so that all tests
            // run against a clean, in-memory database instead of the real one.
            builder.UseEnvironment("Test");
        });

        _client = _factory.CreateClient();
    }

    // Helper method to seed the in-memory database with test data before running a test.
    // Creates a scope, gets the DbContext, applies the seeding action, and saves changes.
    private async Task SeedDatabaseAsync(Func<ResourcePilotDbContext, Task> seed)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ResourcePilotDbContext>();
        await seed(db);
        await db.SaveChangesAsync();
    }

    // ─── GET /api/Reservation ────────────────────────────────────────────────

    [Fact]
    public async Task GetAllReservations_EmptyDb_ReturnsEmptyList()
    {
        // Act
        var response = await _client.GetAsync("/api/Reservation");

        // Assert - endpoint works and returns an empty list when there are no reservations in the database
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<ReservationResponseDto>>();
        Assert.NotNull(result);
    }

    [Fact]
    public async Task GetAllReservations_WithData_ReturnsReservations()
    {
        // Arrange - add a reservation to the in-memory database so that we can check if it is returned by the API.
        // Create a table and a reservation linked to that table, then save it to the database.
        await SeedDatabaseAsync(async db =>
        {
            var table = new Table { Number = 99, Capacity = 4, IsActive = true };
            db.Tables.Add(table);
            await db.SaveChangesAsync();

            db.Reservations.Add(new Reservation
            {
                TableId = table.Id,
                Table = table,
                CustomerName = "Testowy Klient",
                Email = "test@test.pl",
                Phone = "+48 600 000 000",
                ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                ReservationTime = new TimeOnly(18, 0),
                GuestCount = 2,
                Notes = "",
                Status = ReservationStatus.Pending,
            });
        });

        // Act
        var response = await _client.GetAsync("/api/Reservation");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<ReservationResponseDto>>();
        Assert.NotNull(result);
        Assert.Contains(result, r => r.CustomerName == "Testowy Klient");
    }

    // ─── GET /api/Reservation/{id} ───────────────────────────────────────────

    [Fact]
    public async Task GetReservationById_NonExisting_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/Reservation/9999");

        // Assert - ERROR 404
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── POST /api/Reservation ───────────────────────────────────────────────

    [Fact]
    public async Task CreateReservation_ValidData_Returns201()
    {
        // Arrange - add a table to the in-memory database, so that we can create a reservation for it.
        // We need to have a valid table in the database, because the reservation must be linked to an existing table (foreign key constraint).
        // After seeding the table, we prepare a CreateReservationDto with valid data to send in the POST request.
        await SeedDatabaseAsync(db =>
        {
            db.Tables.Add(new Table
            {
                Id = 20,
                Number = 20,
                Capacity = 4,
                IsActive = true
            });
            return Task.CompletedTask;
        });

        var dto = new CreateReservationDto
        {
            TableId = 20,
            CustomerName = "Nowy Klient",
            CustomerEmail = "nowy@test.pl",
            CustomerPhone = "+48 700 000 000",
            ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
            ReservationTime = new TimeOnly(20, 0),
            GuestCount = 3,
            Notes = "",
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Reservation", dto);

        // Assert - new reservation returns 201 Created
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ReservationResponseDto>();
        Assert.NotNull(result);
        Assert.Equal("Nowy Klient", result.CustomerName);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task CreateReservation_InvalidData_Returns400()
    {
        // Arrange - missing required fields (CustomerName is empty)
        var dto = new CreateReservationDto
        {
            TableId = 1,
            CustomerName = "", // required field is empty
            CustomerEmail = "zly-email",
            CustomerPhone = "",
            ReservationDate = DateOnly.FromDateTime(DateTime.Today),
            ReservationTime = new TimeOnly(12, 0),
            GuestCount = 0, // outside range 1-20
            Notes = "",
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Reservation", dto);

        // Assert - validation should reject request with code 400
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateReservation_NonExistingTable_Returns404()
    {
        // Arrange - table with ID 9999 does not exist
        var dto = new CreateReservationDto
        {
            TableId = 9999,
            CustomerName = "Klient",
            CustomerEmail = "k@test.pl",
            CustomerPhone = "+48 600 000 000",
            ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            ReservationTime = new TimeOnly(19, 0),
            GuestCount = 2,
            Notes = "",
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Reservation", dto);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── DELETE /api/Reservation/{id} ────────────────────────────────────────

    [Fact]
    public async Task CancelReservation_ExistingId_Returns204()
    {
        // Arrange
        await SeedDatabaseAsync(db =>
        {
            var table = new Table { Id = 30, Number = 30, Capacity = 4, IsActive = true };
            db.Tables.Add(table);
            db.Reservations.Add(new Reservation
            {
                Id = 30,
                TableId = 30,
                Table = table,
                CustomerName = "To Cancel",
                Email = "anuluj@test.pl",
                Phone = "+48 600 000 000",
                ReservationDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                ReservationTime = new TimeOnly(19, 0),
                GuestCount = 2,
                Notes = "",
                Status = ReservationStatus.Pending,
            });
            return Task.CompletedTask;
        });

        // Act
        var response = await _client.DeleteAsync("/api/Reservation/30");

        // Assert - successful cancellation returns 204 No Content
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task CancelReservation_NonExistingId_Returns404()
    {
        // Act
        var response = await _client.DeleteAsync("/api/Reservation/9999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── GET /api/Tables/available ───────────────────────────────────────────

    [Fact]
    public async Task GetAvailableTables_ValidParams_Returns200()
    {
        // Arrange
        await SeedDatabaseAsync(db =>
        {
            db.Tables.Add(new Table
            {
                Id = 40,
                Number = 40,
                Capacity = 4,
                IsActive = true
            });
            return Task.CompletedTask;
        });

        // Act
        var date = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd");
        var response = await _client.GetAsync(
            $"/api/Tables/available?date={date}&time=19:00:00&guestCount=2");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAvailableTables_GuestCountZero_Returns400()
    {
        // Act - guestCount=0 is invalid
        var date = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd");
        var response = await _client.GetAsync(
            $"/api/Tables/available?date={date}&time=19:00:00&guestCount=0");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}