use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;
use chrono::Local;

fn ensure_log_file(volume_root: &Path) -> Result<std::fs::File, String> {
    let log_dir = volume_root.join("logs");
    if !log_dir.exists() {
        fs::create_dir_all(&log_dir).map_err(|e| format!("failed to create logs/: {}", e))?;
    }

    let today = Local::now().format("%Y-%m-%d").to_string();
    let log_path = log_dir.join(format!("{}.log", today));

    OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .map_err(|e| format!("failed to open log file: {}", e))
}

fn write_log(volume_root: &Path, action: &str, a: &str, b: Option<&str>) -> Result<(), String> {
    let mut file = ensure_log_file(volume_root)?;
    let now = Local::now().format("%H:%M:%S").to_string();
    let line = match b {
        Some(target) => format!("{} {} {} -> {}\n", now, action, a, target),
        None => format!("{} {} {}\n", now, action, a),
    };
    file.write_all(line.as_bytes()).map_err(|e| format!("write failed: {}", e))
}

pub fn create(volume_root: &Path, id: &str) -> Result<(), String> {
    write_log(volume_root, "c", id, None)
}

pub fn delete(volume_root: &Path, id: &str) -> Result<(), String> {
    write_log(volume_root, "d", id, None)
}

pub fn transfer(volume_root: &Path, from: &str, to: &str) -> Result<(), String> {
    write_log(volume_root, "t", from, Some(to))
}

pub fn receive(volume_root: &Path, from: &str, to: &str) -> Result<(), String> {
    write_log(volume_root, "r", from, Some(to))
}
