use chrono::{Local, Timelike};

fn timestamp() -> String {
    let t = Local::now();
    format!("{:02}:{:02}:{:02}", t.hour(), t.minute(), t.second())
}

pub fn good(msg: &str) {
    println!("{} + {}", timestamp(), msg);
}

pub fn info(msg: &str) {
    println!("{} - {}", timestamp(), msg);
}

pub fn warn(msg: &str) {
    println!("{} ! {}", timestamp(), msg);
}

pub fn action(msg: &str) {
    println!("{} > {}", timestamp(), msg);
}
