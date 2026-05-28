using System.Security.Authentication.ExtendedProtection;
using Microsoft.EntityFrameworkCore;
using ResourcePilot.Api.Data;
using ResourcePilot.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// === REJESTRACJA SERWISÓW ===

// Baza danych SQLite - plik restaurant.db w katalogu aplikacji
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Rejestracja serwisu rezerwacji - Scoped = nowa instancja na każde żądanie HTTP
builder.Services.AddScoped<IReservationService, ReservationService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Zwracaj enumy jako stringi w JSON, nie jako liczby
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// CORS - zezwalaj na requesty z React dev servera (port 5173?)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", PolicyEnforcement =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000") // Adres React dev servera
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger - dokumentacja API dostępna pod /swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "ResourcePilot API",
        Version = "v1",
        Description = "API do zarządzania rezerwacjami stolików w restauracji"
    });
});

// === BUDOWANIE APLIKACJI ===
var app = builder.Build();

// Inicjalizacja bazy danych przy starcie - migracje + seed danych
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Stworzenie tabelek jeśli nie istnieją
    DbSeeder.Seed(db); // Wypełnia przykładowymi stolikami
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactApp");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
