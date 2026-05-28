namespace ResourcePilot.Application.Common.DTOs;

public record TableDto(
    int Id,
    int Number,
    int Capacity,
    string? Description
);