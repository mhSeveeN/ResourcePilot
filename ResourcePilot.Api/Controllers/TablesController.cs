using Microsoft.AspNetCore.Mvc;
using ResourcePilot.Application.Common.Interfaces;

namespace ResourcePilot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
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