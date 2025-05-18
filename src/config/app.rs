/* src/config/app.rs */

// Application configuration settings.
pub struct AppConfig {
    pub base_url: String,
}

impl AppConfig {
    // Creates a new AppConfig instance with default values.
    pub fn new() -> Self {
        AppConfig {
            // Define the base URL for the API.
            // Ensure it ends with a '/' if it's a path prefix.
            base_url: "/v1/ipelfs/".to_string(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self::new()
    }
}

// Global static instance for easy access, initialized with default values.
// For more complex scenarios, consider using OnceCell or a state management solution.
lazy_static::lazy_static! {
    pub static ref CONFIG: AppConfig = AppConfig::new();
}