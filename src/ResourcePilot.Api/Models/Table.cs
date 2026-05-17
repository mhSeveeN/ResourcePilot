namespace RestaurantReservationAPI.Models
{
    // Model reprezentujący pojedynczy stolik w restauracji.
    // Na razie dane są zakodowane na stałe w kontrolerze –
    // docelowo będą pobierane z bazy danych.
    public class Table
    {
        // Unikalny numer stolika (1–15)
        public int TableNumber { get; set; }

        // Maksymalna liczba osób, które mogą siedzieć przy stoliku
        public int Capacity { get; set; }
    }
}
