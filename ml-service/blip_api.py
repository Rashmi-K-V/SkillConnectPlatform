from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests

app = Flask(__name__)

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    image_urls = data.get("images", [])

    captions = []

    for url in image_urls:
        try:
            image = Image.open(requests.get(url, stream=True).raw).convert("RGB")
            inputs = processor(image, return_tensors="pt")
            out = model.generate(**inputs)
            caption = processor.decode(out[0], skip_special_tokens=True)
            captions.append(caption)
        except:
            continue

    final_text = " ".join(captions)

    return jsonify({ "description": final_text })


if __name__ == "__main__":
    app.run(port=5001)