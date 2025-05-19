// src/utils/id.rs

use rand::{distributions::Uniform, Rng};
use std::collections::HashSet;

const LETTERS: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const DIGITS: &[u8] = b"0123456789";

pub fn generate_unique_id(length: usize, existing_ids: &[String]) -> Option<String> {
    if length < 5 {
        return None;
    }

    let existing_set: HashSet<_> = existing_ids.iter().collect();
    let mut rng = rand::thread_rng();
    let digit_dist = Uniform::from(0..DIGITS.len());
    let letter_dist = Uniform::from(0..LETTERS.len());

    loop {
        let mut id = String::new();
        let first_char = LETTERS[rng.sample(letter_dist)] as char;
        id.push(first_char);

        for _ in 1..length {
            let is_letter = rng.gen_bool(0.3);
            let c = if is_letter {
                LETTERS[rng.sample(letter_dist)] as char
            } else {
                DIGITS[rng.sample(digit_dist)] as char
            };
            id.push(c);
        }

        if !existing_set.contains(&id) {
            return Some(id);
        }
    }
}
