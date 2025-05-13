use chrono::Local;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
struct VolumeMeta {
    id: String,
    timestamp: String,
    fs_type: String,
    storage_type: Option<String>,
    removable: bool,
    smart_total_written: Option<u64>,
    power_on_hours: Option<u64>,
    tbw_estimate: Option<u64>,
    poh_estimate: Option<u64>,
}

pub fn init_volume_meta(id: &str, path: &str) -> std::io::Result<()> {
    let ipelfs_path = Path::new(path).join(".ipelfs");
    let meta_path = Path::new(path).join("meta.toml");

    File::create(&ipelfs_path)?.write_all(id.as_bytes())?;

    let device = get_device_name(path)?;
    println!("> device: {}", device);

    let fs_type = get_fs_type(path)?;
    println!("> fs_type: {}", fs_type);

    let removable = is_removable(&device)?;
    println!("> removable: {}", removable);

    let storage_type = if removable {
        println!("> device is removable, storage_type = null");
        None
    } else {
        let rotational_path = format!("/sys/block/{}/queue/rotational", device_name_basename(&device));
        println!("> checking: {}", rotational_path);

        match std::fs::read_to_string(&rotational_path) {
            Ok(val) => {
                let val = val.trim();
                println!("> rotational: {}", val);
                match val {
                    "0" => Some("SSD".to_string()),
                    "1" => Some("HDD".to_string()),
                    _ => {
                        println!("> unknown rotational value, fallback to SSD");
                        Some("SSD".to_string())
                    }
                }
            }
            Err(err) => {
                println!("> failed to read rotational info: {}, fallback to SSD", err);
                Some("SSD".to_string())
            }
        }
    };

    let smart_str = get_smart_output(&device)?;
    println!("> smart output size: {}", smart_str.len());

    let meta = VolumeMeta {
        id: id.to_string(),
        timestamp: Local::now().to_rfc3339(),
        fs_type,
        storage_type: storage_type.clone(),
        removable,
        smart_total_written: parse_total_written(&smart_str),
        power_on_hours: parse_power_on_hours(&smart_str),
        tbw_estimate: estimate_tbw(storage_type.as_deref()),
        poh_estimate: estimate_poh(storage_type.as_deref()),
    };

    let toml_str = toml::to_string(&meta).unwrap();
    File::create(&meta_path)?.write_all(toml_str.as_bytes())?;

    println!("+ meta.toml created");

    Ok(())
}

fn device_name_basename(dev: &str) -> &str {
    dev.trim_start_matches("/dev/").split('/').next().unwrap_or("unknown")
}

fn get_device_name(path: &str) -> std::io::Result<String> {
    let out = Command::new("df").arg(path).output()?;
    Ok(String::from_utf8_lossy(&out.stdout)
        .lines()
        .nth(1)
        .and_then(|l| l.split_whitespace().next())
        .unwrap_or("/dev/unknown")
        .to_string())
}

fn get_fs_type(path: &str) -> std::io::Result<String> {
    let out = Command::new("df").arg("-T").arg(path).output()?;
    Ok(String::from_utf8_lossy(&out.stdout)
        .lines()
        .nth(1)
        .and_then(|l| l.split_whitespace().nth(1))
        .unwrap_or("unknown")
        .to_string())
}

fn is_removable(dev: &str) -> std::io::Result<bool> {
    let out = Command::new("udevadm")
        .args(&["info", "--query=property", "--name", dev])
        .output()?;
    Ok(String::from_utf8_lossy(&out.stdout)
        .lines()
        .any(|l| l.contains("ID_BUS=usb")))
}

fn get_smart_output(dev: &str) -> std::io::Result<String> {
    let out = Command::new("smartctl").args(&["-A", dev]).output()?;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

fn parse_total_written(s: &str) -> Option<u64> {
    s.lines()
        .find(|l| l.contains("Total_LBAs_Written"))
        .and_then(|l| l.split_whitespace().last())
        .and_then(|v| v.parse::<u64>().ok())
        .map(|lba| lba * 512)
}

fn parse_power_on_hours(s: &str) -> Option<u64> {
    s.lines()
        .find(|l| l.contains("Power_On_Hours"))
        .and_then(|l| l.split_whitespace().nth(9))
        .and_then(|v| v.parse::<u64>().ok())
}

fn estimate_tbw(ty: Option<&str>) -> Option<u64> {
    match ty {
        Some("SSD") => Some(600 * 1024 * 1024 * 1024 * 1024),
        _ => None,
    }
}

fn estimate_poh(ty: Option<&str>) -> Option<u64> {
    match ty {
        Some("HDD") => Some(3 * 365 * 24),
        _ => None,
    }
}
