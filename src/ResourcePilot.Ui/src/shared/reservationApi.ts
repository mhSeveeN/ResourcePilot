const API_BASE = "http://localhost:5000/api";

export type CreateReservationDto = Record<string, unknown>;

// 1. Pobierz dostępne stoliki dla danego terminu
export async function getAvailableTables(date: string, time: string, guestCount: number) {
  const params = new URLSearchParams({
    date,
    time,
    guestCount: guestCount.toString(),
  });
  const res = await fetch(`${API_BASE}/tables/available?${params}`);
  if (!res.ok) throw new Error("Błąd pobierania stolików");
  return res.json();
}

// 2. Utwórz rezerwację (submit formularza)
export async function createReservation(formData: CreateReservationDto) {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  
  if (res.status === 409) {  
    const err = await res.json();  
    throw new Error(err.message); // Stolik zajęty — pokaż użytkownikowi  
  }  
  if (!res.ok) throw new Error("Błąd tworzenia rezerwacji");  
  
  return res.json(); // Zwraca utworzoną rezerwację z ID  
}  
  
// 3. Pobierz rezerwację po ID (np. strona potwierdzenia)  
export async function getReservation(id: string) {  
  const res = await fetch(`${API_BASE}/reservations/${id}`);  
  if (!res.ok) throw new Error("Nie znaleziono rezerwacji");  
  return res.json();  
}  
  
// 4. Anuluj rezerwację  
export async function cancelReservation(id: string) {  
  const res = await fetch(`${API_BASE}/reservations/${id}`, { method: "DELETE" });  
  if (!res.ok) throw new Error("Błąd anulowania");  
}