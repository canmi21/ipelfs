// src/utils/logger.rs

use chrono::{Local, Timelike};
use std::io::Write;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use once_cell::sync::Lazy;
use termcolor::{Color, ColorChoice, ColorSpec, StandardStream, WriteColor};

static START_TIME: Lazy<Instant> = Lazy::new(Instant::now);
static LAST_LOG_TIME: Lazy<Mutex<Instant>> = Lazy::new(|| Mutex::new(*START_TIME));

pub fn init_logger() {
    let _ = *START_TIME;
    let mut last = LAST_LOG_TIME.lock().unwrap();
    *last = Instant::now();
}

fn get_timestamp_str() -> String {
    let t = Local::now();
    format!("{:02}:{:02}:{:02}", t.hour(), t.minute(), t.second())
}

fn get_delta_str_val() -> String {
    let now = Instant::now();
    let mut last = LAST_LOG_TIME.lock().unwrap();
    let duration = now.duration_since(*last);
    *last = now;
    format!("+{}", format_duration(duration))
}

fn format_duration(d: Duration) -> String {
    let ms = d.as_millis();

    if ms < 1000 {
        format!("{}ms", ms)
    } else if ms < 60_000 {
        format!("{}s", ms / 1000)
    } else if ms < 3_600_000 {
        format!("{}m", ms / 60_000)
    } else {
        let h = ms / 3_600_000;
        if h > 999 {
            "999h".to_string()
        } else {
            format!("{}h", h)
        }
    }
}

fn get_role_display_info(identity_key: &str) -> (String, Option<Color>) {
    if identity_key.starts_with("client") {
        ("Client".to_string(), Some(Color::Yellow))
    } else if identity_key.starts_with("server") {
        ("Server".to_string(), Some(Color::Cyan))
    } else {
        (identity_key.to_string(), None)
    }
}

fn log(identity_key: &str, symbol: &str, msg: &str) {
    let mut stdout = StandardStream::stdout(ColorChoice::Auto);

    let timestamp_val = get_timestamp_str();
    let delta_val = get_delta_str_val();
    let (role_text, role_color_opt) = get_role_display_info(identity_key);

    stdout.set_color(ColorSpec::new().set_fg(Some(Color::Green))).unwrap_or_default();
    write!(&mut stdout, "{}", timestamp_val).unwrap_or_default();
    stdout.reset().unwrap_or_default();

    write!(&mut stdout, " {} ", symbol).unwrap_or_default();

    if let Some(role_color) = role_color_opt {
        stdout.set_color(ColorSpec::new().set_fg(Some(role_color))).unwrap_or_default();
    }
    write!(&mut stdout, "{}", role_text).unwrap_or_default();
    stdout.reset().unwrap_or_default();

    write!(&mut stdout, " {}", msg).unwrap_or_default();

    stdout.set_color(ColorSpec::new().set_fg(Some(Color::Yellow))).unwrap_or_default();
    write!(&mut stdout, " {}", delta_val).unwrap_or_default();
    stdout.reset().unwrap_or_default();

    writeln!(&mut stdout).unwrap_or_default();
    stdout.flush().unwrap_or_default();
}

pub fn good(identity: &str, msg: &str) {
    log(identity, "+", msg);
}

pub fn info(identity: &str, msg: &str) {
    log(identity, "-", msg);
}

pub fn warn(identity: &str, msg: &str) {
    log(identity, "!", msg);
}

pub fn action(identity: &str, msg: &str) {
    log(identity, ">", msg);
}
