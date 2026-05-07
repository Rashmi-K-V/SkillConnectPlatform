

from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import whisper
import requests
import re
import os

app = Flask(__name__)

print("Loading BLIP model...")
processor  = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("All models loaded.")



SKILL_MAP = {
    # Plumber 
    "pipe":     ("Pipe Fitting",        "plumber"),
    "pipes":    ("Pipe Fitting",        "plumber"),
    "plumbing": ("Plumbing",            "plumber"),
    "wrench":   ("Wrench Usage",        "plumber"),
    "faucet":   ("Faucet Repair",       "plumber"),
    "tap":      ("Tap Repair",          "plumber"),
    "drain":    ("Drain Cleaning",      "plumber"),
    "leak":     ("Leak Fixing",         "plumber"),
    "valve":    ("Valve Repair",        "plumber"),
    "fitting":  ("Pipe Fitting",        "plumber"),
    "sink":     ("Sink Repair",         "plumber"),
    "toilet":   ("Toilet Repair",       "plumber"),
    "water":    ("Water Supply Work",   "plumber"),

    #Electrician
    "wire":       ("Wiring",               "electrician"),
    "wiring":     ("Wiring",               "electrician"),
    "cable":      ("Cable Management",     "electrician"),
    "switch":     ("Switch Installation",  "electrician"),
    "circuit":    ("Circuit Repair",       "electrician"),
    "socket":     ("Socket Installation",  "electrician"),
    "fuse":       ("Fuse Replacement",     "electrician"),
    "panel":      ("Panel Work",           "electrician"),
    "bulb":       ("Light Installation",   "electrician"),
    "electric":   ("Electrical Work",      "electrician"),
    "electrical": ("Electrical Work",      "electrician"),
    "meter":      ("Meter Reading",        "electrician"),
    "plug":       ("Plug Wiring",          "electrician"),

    # Cook
    "cook":     ("Cooking",          "cook"),
    "cooking":  ("Cooking",          "cook"),
    "kitchen":  ("Kitchen Work",     "cook"),
    "frying":   ("Frying",           "cook"),
    "boiling":  ("Boiling",          "cook"),
    "baking":   ("Baking",           "cook"),
    "chopping": ("Chopping",         "cook"),
    "chef":     ("Culinary Skills",  "cook"),
    "spice":    ("Spice Handling",   "cook"),
    "dish":     ("Dish Preparation", "cook"),
    "stove":    ("Stove Handling",   "cook"),
    "pan":      ("Pan Cooking",      "cook"),
    "pot":      ("Pot Cooking",      "cook"),

    # Cleaner
    "clean":     ("Cleaning",      "cleaner"),
    "cleaning":  ("Cleaning",      "cleaner"),
    "mop":       ("Mopping",       "cleaner"),
    "sweep":     ("Sweeping",      "cleaner"),
    "sweeping":  ("Sweeping",      "cleaner"),
    "vacuum":    ("Vacuuming",     "cleaner"),
    "dust":      ("Dusting",       "cleaner"),
    "dusting":   ("Dusting",       "cleaner"),
    "scrub":     ("Scrubbing",     "cleaner"),
    "scrubbing": ("Scrubbing",     "cleaner"),
    "sanitize":  ("Sanitization",  "cleaner"),
    "wash":      ("Washing",       "cleaner"),
    "wipe":      ("Wiping",        "cleaner"),
    "wiping":    ("Wiping",        "cleaner"),
    "broom":     ("Sweeping",      "cleaner"),

   
    "iron":      ("Ironing",             "steam_ironing"),
    "ironing":   ("Ironing",             "steam_ironing"),
    "press":     ("Clothes Pressing",    "steam_ironing"),
    "pressing":  ("Clothes Pressing",    "steam_ironing"),
    "steam":     ("Steam Ironing",       "steam_ironing"),
    "steaming":  ("Steam Ironing",       "steam_ironing"),
    "wrinkle":   ("Wrinkle Removal",     "steam_ironing"),
    "fold":      ("Clothes Folding",     "steam_ironing"),
    "folding":   ("Clothes Folding",     "steam_ironing"),
    "laundry":   ("Laundry",             "steam_ironing"),
    "shirt":     ("Shirt Pressing",      "steam_ironing"),
    "trouser":   ("Trouser Pressing",    "steam_ironing"),
    "uniform":   ("Uniform Pressing",    "steam_ironing"),
    "saree":     ("Saree Pressing",      "steam_ironing"),
    "sari":      ("Saree Pressing",      "steam_ironing"),
    "kurta":     ("Kurta Pressing",      "steam_ironing"),
    "salwar":    ("Salwar Pressing",     "steam_ironing"),
    "suit":      ("Suit Pressing",       "steam_ironing"),
    "blazer":    ("Blazer Pressing",     "steam_ironing"),
    "bedsheet":  ("Bedsheet Pressing",   "steam_ironing"),
    "curtain":   ("Curtain Pressing",    "steam_ironing"),
    "clothes":   ("Clothes Ironing",     "steam_ironing"),
    "garment":   ("Garment Pressing",    "steam_ironing"),
    "fabric":    ("Fabric Care",         "steam_ironing"),
    "cloth":     ("Fabric Care",         "steam_ironing"),
    "delicate":  ("Delicate Fabric Care","steam_ironing"),
}


BLIP_HALLUCINATION_BLACKLIST = {
    "cutting", "cut", "cuts",  # Extremely common BLIP false positive
    "person", "man", "woman", "people", "standing", "wearing",
    "holding", "using", "sitting", "looking", "playing",
}

def extract_skills(text, worker_category=None):
    """
    Extract skills from BLIP caption text.
    If worker_category is provided, only return skills matching that category
    (avoids cross-category false positives).
    """
    words = re.findall(r'\b\w+\b', text.lower())
    matched = set()

    for word in words:
        # Skip blacklisted hallucination words
        if word in BLIP_HALLUCINATION_BLACKLIST:
            continue

        if word in SKILL_MAP:
            skill_label, skill_category = SKILL_MAP[word]
            # If we know the worker's category, filter to matching skills only
            if worker_category:
                # Normalize "tailor" → "steam_ironing" for comparison
                normalized_cat = "steam_ironing" if worker_category == "tailor" else worker_category
                if skill_category == normalized_cat:
                    matched.add(skill_label)
            else:
                matched.add(skill_label)

    return list(matched)


def translate_to_english(text):
    api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")
    if not api_key or not text:
        return text
    try:
        res = requests.post(
            "https://translation.googleapis.com/language/translate/v2",
            params={"key": api_key},
            json={"q": text, "target": "en"},
            timeout=10
        )
        data = res.json()
        return data["data"]["translations"][0]["translatedText"]
    except Exception as e:
        print(f"Google Translate error: {e}")
        return text


def extract_info_from_transcript(transcript):
    info = {}
    text = transcript.lower()

    name_patterns = [
        r"my name is ([a-z]+)",
        r"i am ([a-z]+)",
        r"i'm ([a-z]+)",
        r"myself ([a-z]+)",
        r"call me ([a-z]+)",
        r"known as ([a-z]+)",
        r"mera naam ([a-z]+)",
        r"main ([a-z]+) hoon",
        r"mujhe ([a-z]+) kehte",
        r"naa peru ([a-z]+)",
        r"naaku ([a-z]+) ani",
        r"en peyar ([a-z]+)",
        r"enakku ([a-z]+) nu",
        r"nanna hesaru ([a-z]+)",
        r"naanu ([a-z]+)",
    ]
    SKIP_WORDS = {
        "a","an","the","here","from","going","working","doing","this","that",
        "with","also","very","good","best","your","my","his","her","their",
        "our","its","am","is","are","was","were","be","been","being","have",
        "has","had","do","does","did","will","would","could","should","may",
        "might","shall","can","not","no","yes","ok","okay","hello","hi",
        "hey","so","and","or","but","if","then","when","what","how","why",
        "who","where","which","that",
    }
    for pattern in name_patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).capitalize()
            if name.lower() not in SKIP_WORDS and len(name) > 1:
                info["name"] = name
                break

    age_patterns = [
        r"i am (\d+) years", r"i'm (\d+) years", r"(\d+) years old",
        r"age is (\d+)", r"aged (\d+)", r"meri umar (\d+)",
        r"meri age (\d+)", r"naaku (\d+) years",
        r"en vayasu (\d+)", r"nanna vayassu (\d+)",
    ]
    for pattern in age_patterns:
        match = re.search(pattern, text)
        if match:
            age = int(match.group(1))
            if 16 <= age <= 80:
                info["age"] = age
                break

    female_hints = [
        "i am a woman","i'm a woman","i am a lady","i'm a lady",
        "i am female","i'm female","main ek aurat","main aurat",
        "nenu oka ammayini","naan oru penn","naanu hengassu",
    ]
    male_hints = [
        "i am a man","i'm a man","i am male","i'm male",
        "main ek aadmi","main aadmi",
        "nenu oka abbayini","naan oru aal","naanu gandasu",
    ]
    if any(h in text for h in female_hints):
        info["gender"] = "Female"
    elif any(h in text for h in male_hints):
        info["gender"] = "Male"

    exp_patterns = [
        r"(\d+) years? of experience", r"(\d+) years? experience",
        r"experience of (\d+) years?", r"(\d+) saal ka experience",
        r"(\d+) saal se kaam", r"(\d+) years? ka kaam",
        r"working for (\d+) years?", r"(\d+) years? in this",
    ]
    for pattern in exp_patterns:
        match = re.search(pattern, text)
        if match:
            exp = int(match.group(1))
            if 0 <= exp <= 50:
                info["experience"] = f"{exp} years"
                break

    return info


@app.route("/generate", methods=["POST"])
def generate():
    data        = request.json
    image_paths = data.get("images", [])
    video_path  = data.get("video_path", None)
    # Accept worker_category from the Node.js caller so we can filter skills
    worker_category = data.get("worker_category", None)

    # BLIP captions 
    captions = []
    for img_path in image_paths:
        try:
            image   = Image.open(img_path).convert("RGB")
            inputs  = processor(image, return_tensors="pt")
            out     = blip_model.generate(**inputs, max_new_tokens=50)
            caption = processor.decode(out[0], skip_special_tokens=True)
            captions.append(caption)
            print(f"Caption: {caption}")
        except Exception as e:
            print(f"BLIP error on {img_path}: {e}")

    captions      = list(dict.fromkeys(captions))
    combined_text = " ".join(captions)
    # Pass worker_category so only relevant skills are returned
    skills = extract_skills(combined_text, worker_category)
    print("Skills:", skills)

    
    auto_fill          = {}
    transcript         = ""
    transcript_english = ""

    if video_path and os.path.exists(video_path):
        try:
            print("Transcribing with Whisper...")
            result        = whisper_model.transcribe(video_path, task="transcribe")
            transcript    = result["text"]
            detected_lang = result.get("language", "en")
            print(f"Whisper ({detected_lang}): {transcript}")

            if detected_lang != "en":
                transcript_english = translate_to_english(transcript)
                print(f"Translated: {transcript_english}")
            else:
                transcript_english = transcript

            auto_fill = extract_info_from_transcript(transcript_english)
            print("Auto-fill:", auto_fill)

        except Exception as e:
            print(f"Whisper error: {e}")
    else:
        print("No video path or file not found — skipping Whisper.")

    return jsonify({
        "description":        combined_text,
        "skills":             skills,
        "transcript":         transcript,
        "transcript_english": transcript_english,
        "auto_fill":          auto_fill,
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)