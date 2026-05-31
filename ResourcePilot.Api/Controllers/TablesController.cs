// Controller for handling table-related API endpoints, such as retrieving available tables based on date, time, and guest count.
// Accepts requests from http and interacts with the IReservationService to fetch the necessary data. Validates input parameters and returns appropriate HTTP responses.

using Microsoft.AspNetCore.Mvc;
using ResourcePilot.Application.Common.Interfaces;

namespace ResourcePilot.Api.Controllers;

// ApiController attribute indicates that this controller responds to web API requests. 
// The Route attribute defines the base route for all actions in this controller, which is "api/tables". 
// The controller has a dependency on IReservationService, which is injected through the constructor. The GetAvailable action method handles GET requests to "api/tables/available" and accepts query parameters for date, time, and guest count. 
// It validates the guest count and returns a BadRequest response if it's less than 1. Otherwise, it calls the service to get available tables and returns them in an Ok response.
[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    // Dependency injection of the reservation service to handle business logic related to reservations and tables.
    private readonly IReservationService _service;

    public TablesController(IReservationService service)
    {
        _service = service;
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable([FromQuery] DateOnly date, [FromQuery] TimeOnly time, [FromQuery] int guestCount)
    {
        if (guestCount < 1)
            return BadRequest("Liczba gości musi być conajmniej 1.");

        var tables = await _service.GetAvailableTablesAsync(date, time, guestCount);
        return Ok(tables);
    }
}