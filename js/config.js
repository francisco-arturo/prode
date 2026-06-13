// Configuración de Supabase (la anon key es pública por diseño; el acceso
// real lo controlan las políticas RLS definidas en la base de datos).
var SUPABASE_URL = "https://idtpbpydtijnrhbgwful.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdHBicHlkdGlqbnJoYmd3ZnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTc5NTgsImV4cCI6MjA5Njc3Mzk1OH0.7c6ozpQaasr5MEmIRyCI8x8YOL4KYpMUfee5QyEjp8E";

// Admin: identidad protegida por PIN. Quien entra como ADMIN_NAME debe ingresar
// el PIN, y obtiene acceso al panel de carga de resultados oficiales.
// Nota: el PIN es del lado del cliente (visible en el código); alcanza para un
// prode entre amigos, no es seguridad fuerte.
var ADMIN_NAME = "Francisco";
var ADMIN_PIN = "2133";
