# ocr_translate.py
import os
import io
from google.cloud import vision
from google.cloud import translate_v2 as translate

# You will have to make folder named API_keys outside repository and store the API key there
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "../../API_keys/samvad_translate.json"

def extract_text_from_image(image_path): 
    """Extracts text and bounding boxes from an image using Google Cloud Vision API"""
    client = vision.ImageAnnotatorClient()
    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    
    if response.error.message:
        raise Exception(f"Error during Vision API call: {response.error.message}")

    segments = []
    for annotation in response.text_annotations[1:]:  # have to skip first because the first is the entire page
        text = annotation.description
        vertices = [(v.x, v.y) for v in annotation.bounding_poly.vertices]
        segments.append({
            "text": text,
            "bounding_box": vertices
        })

    return segments


def google_translate_text(segments, target_language='en'):
    translate_client = translate.Client()
    translated_segments = []

    for segment in segments:
        original_text = segment['text']
        result = translate_client.translate(original_text, target_language=target_language)
        translated_segments.append({
            "original_text": original_text,
            "translated_text": result['translatedText'],
            "bounding_box": segment['bounding_box']
        })

    return translated_segments


# Test function if running as standalone script
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python ocr_translate.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    extracted_text = extract_text_from_image(image_path)
    print(f"Extracted Text:\n{extracted_text}\n")
    
    translated_text = google_translate_text(extracted_text, target_language='en')
    print(f"Translated Text:\n{translated_text}")
