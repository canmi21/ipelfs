use chrono::Local;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use serde::Serialize;
use std::process::Command;
use crate::log;

#[derive(Serialize)]
struct VolumeMeta {
    id: String,
    timestamp: String,
    fs_type: String,
    storage_type: Option<String>,
    connection_type: Option<String>,
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
    let fs_type = get_fs_type(path)?;
    let removable = is_removable(&device)?;
    let connection_type = detect_connection_type(&device);
    let storage_type = if removable {
        None
    } else {
        match std::fs::read_to_string(format!("/sys/block/{}/queue/rotational", device_basename(&device))) {
            Ok(v) => match v.trim() {
                "0" => Some("ssd".to_string()),
                "1" => Some("hdd".to_string()),
                _ => Some("ssd".to_string()),
            },
            Err(_) => Some("ssd".to_string()),
        }
    };

    let smart_str = get_smart_output(&device)?;
    let smart_total_written = parse_data_units_written(&smart_str);
    let power_on_hours = parse_power_on_hours_nvme(&smart_str);

    let meta = VolumeMeta {
        id: id.to_string(),
        timestamp: Local::now().to_rfc3339(),
        fs_type,
        storage_type: storage_type.clone(),
        connection_type,
        removable,
        smart_total_written,
        power_on_hours,
        tbw_estimate: estimate_tbw(storage_type.as_deref()),
        poh_estimate: estimate_poh(storage_type.as_deref()),
    };

    let toml_str = toml::to_string(&meta).unwrap();
    File::create(&meta_path)?.write_all(toml_str.as_bytes())?;

    log::good(&format!("metadata successful save at {}", meta_path.display()));

    Ok(())
}

fn device_basename(dev: &str) -> &str {
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

fn detect_connection_type(dev: &str) -> Option<String> {
    let d = dev.to_lowercase();
    if d.contains("nvme") {
        Some("nvme".to_string())
    } else if d.contains("usb") {
        Some("usb".to_string())
    } else if d.contains("sd") || d.contains("sda") {
        Some("sata".to_string())
    } else {
        None
    }
}

fn get_smart_output(dev: &str) -> std::io::Result<String> {
    let out = Command::new("smartctl").args(&["-A", dev]).output()?;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

fn parse_data_units_written(s: &str) -> Option<u64> {
    s.lines()
        .find(|l| l.contains("Data Units Written"))
        .and_then(|l| l.split_once('['))
        .and_then(|(_, right)| right.trim_end_matches(']').split_whitespace().next())
        .and_then(|val| val.replace(",", "").parse::<f64>().ok())
        .map(|tb| (tb * 1024.0 * 1024.0 * 1024.0 * 1024.0) as u64)
}

fn parse_power_on_hours_nvme(s: &str) -> Option<u64> {
    s.lines()
        .find(|l| l.contains("Power On Hours"))
        .and_then(|l| l.split(':').nth(1))
        .and_then(|v| v.trim().parse::<u64>().ok())
}

fn estimate_tbw(ty: Option<&str>) -> Option<u64> {
    match ty {
        Some("ssd") => Some(600 * 1024 * 1024 * 1024 * 1024),
        _ => None,
    }
}

fn estimate_poh(ty: Option<&str>) -> Option<u64> {
    match ty {
        Some("hdd") => Some(3 * 365 * 24),
        _ => None,
    }
}
