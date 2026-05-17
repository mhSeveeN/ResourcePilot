namespace ResourcePilot.Api.DTOs;

/// <summary>
/// Dane stolika wysyłane do frontendu.
/// </summary>


public record TableDto(
    int Id,
    int Number,
    int Capacity,
    string? Description
);