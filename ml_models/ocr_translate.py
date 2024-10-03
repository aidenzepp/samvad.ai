# ocr_translate.py
import os
import io
from google.cloud import vision
from google.cloud import translate_v2 as translate

# You will have to make folder named API_keys outside repository and store the API key there
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "../../API_keys/samvad_translate.json"

def extract_text_from_image(image_path): #TODO: SEGMENT TEXT FOR HIGHLIGHTING CAPABILITIES
    """Extracts text from an image using Google Cloud Vision API"""
    client = vision.ImageAnnotatorClient()
    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    if response.error.message:
        raise Exception(f"Error during Vision API call: {response.error.message}")
    extracted_text = texts[0].description if texts else ""
    return extracted_text

def google_translate_text(text, target_language='en'):
    # initialize the translation client
    translate_client = translate.Client()
    result = translate_client.translate(text, target_language=target_language)
    return result['translatedText']

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
