namespace RestaurantReservationAPI.Models
{
    // Model danych reprezentujący pojedynczą rezerwację w restauracji.
    // Klasa ta jest używana zarówno do przechowywania danych w pamięci,
    // jak i do deserializacji JSON-a przesyłanego przez klienta API.
    public class Reservation
    {
        // Unikalny identyfikator rezerwacji (np. 1, 2, 3...)
        public int Id_Model { get; set; }
 
        // Imię i nazwisko klienta składającego rezerwację
        public string CustomerName_Model { get; set; }
 
        // Data i godzina planowanej rezerwacji
        public DateTime ReservationDate_Model { get; set; }
 
        // Numer stolika przypisanego do rezerwacji
        public int TableNumber_Model { get; set; }
 
        // Liczba gości objętych rezerwacją
        public int GuestsCount_Model { get; set; }
    }
}