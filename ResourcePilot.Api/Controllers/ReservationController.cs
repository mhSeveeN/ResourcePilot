// Controller for handling reservation-related API endpoints, such as creating, updating, retrieving, and canceling reservations.
// Accepts requests from http and interacts with the IReservationService to perform the necessary operations.

using Microsoft.AspNetCore.Mvc;
using ResourcePilot.Application.Common.DTOs;
using ResourcePilot.Application.Common.Interfaces;

namespace ResourcePilot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _service;

    public ReservationController(IReservationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reservations = await _service.GetAllReservationsAsync();
        return Ok(reservations);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var reservation = await _service.GetReservationByIdAsync(id);
        return reservation is null ? NotFound() : Ok(reservation);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var created = await _service.CreateReservationAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateReservationDto dto)
    {
        var updated = await _service.UpdateReservationAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancel(int id)
    {
        var success = await _service.CancelReservationAsync(id);
        return success ? NoContent() : NotFound();
    }
}