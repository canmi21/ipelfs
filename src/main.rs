use chrono::Timelike;

mod config;

fn main() {
    match config::Config::load() {
        Ok(cfg) => println!("{:#?}", cfg),
        Err(e) => {
            let time = chrono::Local::now();
            println!("{:02}:{:02}:{:02} ! failed to load config: {}", time.hour(), time.minute(), time.second(), e);
        }
    }
}
