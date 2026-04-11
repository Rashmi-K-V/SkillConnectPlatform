from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import whisper
import re
import os

app = Flask(__name__)

print("Loading BLIP model...")
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Loading Whisper model...")
whisper_model = whisper.load_model("small")  # small = better multilingual than base
print("All models loaded.")

# ── Skill keyword map ─────────────────────────────────────────────────────────
SKILL_LABELS = {
    # Plumber
    "pipe": "Pipe Fitting", "pipes": "Pipe Fitting", "plumbing": "Plumbing",
    "wrench": "Wrench Usage", "faucet": "Faucet Repair", "tap": "Tap Repair",
    "drain": "Drain Cleaning", "leak": "Leak Fixing", "valve": "Valve Repair",
    "fitting": "Pipe Fitting", "tube": "Pipe Fitting", "sink": "Sink Repair",
    "toilet": "Toilet Repair", "water": "Water Supply Work",

    # Electrician
    "wire": "Wiring", "wiring": "Wiring", "cable": "Cable Management",
    "switch": "Switch Installation", "circuit": "Circuit Repair",
    "socket": "Socket Installation", "fuse": "Fuse Replacement",
    "panel": "Panel Work", "bulb": "Light Installation",
    "electric": "Electrical Work", "electrical": "Electrical Work",
    "meter": "Meter Reading", "plug": "Plug Wiring",

    # Cook
    "cook": "Cooking", "cooking": "Cooking", "kitchen": "Kitchen Work",
    "frying": "Frying", "boiling": "Boiling", "baking": "Baking",
    "chopping": "Chopping", "cutting": "Cutting", "chef": "Culinary Skills",
    "spice": "Spice Handling", "dish": "Dish Preparation",
    "stove": "Stove Handling", "pan": "Pan Cooking", "pot": "Pot Cooking",

    # Cleaner
    "clean": "Cleaning", "cleaning": "Cleaning", "mop": "Mopping",
    "sweep": "Sweeping", "sweeping": "Sweeping", "vacuum": "Vacuuming",
    "dust": "Dusting", "dusting": "Dusting", "scrub": "Scrubbing",
    "scrubbing": "Scrubbing", "sanitize": "Sanitization", "wash": "Washing",
    "wipe": "Wiping", "wiping": "Wiping", "broom": "Sweeping",

    # Tailor / Sewing
    "sew": "Sewing", "sewing": "Sewing", "stitch": "Stitching",
    "stitching": "Stitching", "embroider": "Embroidery", "embroidery": "Embroidery",
    "design": "Designing", "designing": "Designing", "pattern": "Pattern Making",
    "hem": "Hemming", "tailor": "Tailoring", "measure": "Measurement",
    "fabric": "Fabric Handling", "needle": "Needle Work", "thread": "Threading",
    "cloth": "Fabric Handling", "garment": "Garment Making", "dress": "Dress Making",
    "machine": "Machine Operation",
}

def extract_skills(text):
    words = re.findall(r'\b\w+\b', text.lower())
    matched = set()
    for word in words:
        if word in SKILL_LABELS:
            matched.add(SKILL_LABELS[word])
    return list(matched)

def extract_info_from_transcript(transcript):
    info = {}
    text = transcript.lower()

    # Name patterns (English + Hindi + Telugu + Tamil + Kannada)
    name_patterns = [
        r"my name is ([a-z]+)",
        r"i am ([a-z]+)",
        r"i'm ([a-z]+)",
        r"myself ([a-z]+)",
        r"mera naam ([a-z]+)",        # Hindi
        r"main ([a-z]+) hoon",        # Hindi
        r"mujhe ([a-z]+) kehte",      # Hindi
        r"naa peru ([a-z]+)",         # Telugu
        r"naaku ([a-z]+) ani",        # Telugu
        r"en peyar ([a-z]+)",         # Tamil
        r"enakku ([a-z]+) nu",        # Tamil
        r"nanna hesaru ([a-z]+)",     # Kannada
        r"naanu ([a-z]+)",            # Kannada
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).capitalize()
            # Filter out common words that aren't names
            if name.lower() not in ["a", "an", "the", "here", "from", "going", "working"]:
                info["name"] = name
                break

    # Age patterns
    age_patterns = [
        r"i am (\d+) years",
        r"i'm (\d+) years",
        r"(\d+) years old",
        r"age is (\d+)",
        r"meri umar (\d+)",           # Hindi
        r"meri age (\d+)",            # Hindi
        r"naaku (\d+) years",         # Telugu
        r"en vayasu (\d+)",           # Tamil
        r"nanna vayassu (\d+)",       # Kannada
    ]
    for pattern in age_patterns:
        match = re.search(pattern, text)
        if match:
            age = int(match.group(1))
            if 16 <= age <= 80:       # sanity check
                info["age"] = age
                break

    # Gender
    female_hints = ["i am a woman", "i'm a woman", "main ek aurat", "main aurat",
                    "nenu oka ammayini", "naan oru penn", "naanu hengassu"]
    male_hints   = ["i am a man", "i'm a man", "main ek aadmi", "main aadmi",
                    "nenu oka abbayini", "naan oru aal", "naanu gandasu"]
    if any(h in text for h in female_hints):
        info["gender"] = "Female"
    elif any(h in text for h in male_hints):
        info["gender"] = "Male"

    # Experience (e.g. "5 years of experience", "10 saal ka experience")
    exp_patterns = [
        r"(\d+) years? of experience",
        r"(\d+) years? experience",
        r"(\d+) saal ka experience",  # Hindi
        r"(\d+) saal se kaam",        # Hindi
        r"(\d+) years? ka kaam",
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

    # ── BLIP captions ─────────────────────────────────────────────────────────
    captions = []
    for img_path in image_paths:
        try:
            image  = Image.open(img_path).convert("RGB")
            inputs = processor(image, return_tensors="pt")
            out    = blip_model.generate(**inputs, max_new_tokens=50)
            caption = processor.decode(out[0], skip_special_tokens=True)
            captions.append(caption)
            print(f"Caption: {caption}")
        except Exception as e:
            print(f"BLIP error on {img_path}: {e}")

    captions     = list(dict.fromkeys(captions))   # deduplicate
    combined_text = " ".join(captions)

    # ── Skill extraction ──────────────────────────────────────────────────────
    skills = extract_skills(combined_text)
    print("Skills:", skills)

    # ── Whisper transcription ─────────────────────────────────────────────────
    auto_fill  = {}
    transcript = ""

    if video_path and os.path.exists(video_path):
        try:
            print("Transcribing with Whisper...")
            result     = whisper_model.transcribe(video_path, task="transcribe")
            transcript = result["text"]
            print("Transcript:", transcript)
            auto_fill  = extract_info_from_transcript(transcript)
            print("Auto-fill:", auto_fill)
        except Exception as e:
            print(f"Whisper error: {e}")
    else:
        print("No video path provided or file not found, skipping Whisper.")

    return jsonify({
        "description": combined_text,
        "skills":      skills,        # e.g. ["Stitching", "Embroidery", "Designing"]
        "transcript":  transcript,
        "auto_fill":   auto_fill      # e.g. { name, age, gender, experience }
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)