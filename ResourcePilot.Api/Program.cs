using Microsoft.EntityFrameworkCore;
using ResourcePilot.Api.Services;
using ResourcePilot.Application.Common.Interfaces;
using ResourcePilot.Infrastructure.Persistence;

// Created Web_application constructor
// Settings are applied from appsettings.json
var builder = WebApplication.CreateBuilder(args);

// DB connection (PostgreSQL)
builder.Services.AddDbContext<ResourcePilotDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Reservation servis register
// Scoped means that new instance is created for every http request    
builder.Services.AddScoped<IReservationService, ReservationService>();

// Enum configuration like a string insted of numbers in JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters
            .Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// CORS = frontend (React) + backend - for not blocking request by the browser
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "https://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
    });
});

// Automatically discovering endpoints required by Swagger to make API's documentation.
// API's documentation is available in browser: /swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// App build
var app = builder.Build();

// When Start automatically creates local database if not exists and creates tables with restaurent table
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ResourcePilotDbContext>();
    // All waiting migrations without doing 'by-hand'
    db.Database.Migrate();
    DbSeeder.Seed(db);
}

// Swagger is available only in dev environment & it share JSON file with OpenAPI specs
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactApp");
// HTTP => HTTPS (for safety)
//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// App start
app.Run();
