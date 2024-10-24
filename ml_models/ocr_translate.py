import os
import io
from google.cloud import vision
from google.cloud import translate_v2 as translate
from pdf2image import convert_from_path

# You will have to make folder named API_keys outside repository and store the API key there
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "../../API_keys/samvad_translate.json"

def extract_text_from_file(file_path):
    """Extracts text and bounding boxes from an image or PDF using Google Cloud Vision API"""
    client = vision.ImageAnnotatorClient()

    file_ext = os.path.splitext(file_path)[1].lower()

    segments = []  # Returning this: holds all text segments and bounding boxes

    if file_ext == '.pdf':
        # Convert PDF to images (one image per page)
        images = convert_from_path(file_path)

        # Process each page
        for i, image in enumerate(images):
            # Convert PIL Image to byte array
            image_byte_array = io.BytesIO()
            image.save(image_byte_array, format='PNG')
            content = image_byte_array.getvalue()

            # Create Vision API Image object
            vision_image = vision.Image(content=content)

            # Perform text detection on the image
            response = client.text_detection(image=vision_image)

            if response.error.message:
                raise Exception(f"Error during Vision API call on page {i + 1}: {response.error.message}")

            # Extract text and bounding boxes
            for annotation in response.text_annotations[1:]:  # Skip the first, it's the entire page text
                text = annotation.description
                vertices = [(v.x, v.y) for v in annotation.bounding_poly.vertices]
                segments.append({
                    "text": text,
                    "bounding_box": vertices,
                    "page": i + 1
                })

    elif file_ext in ['.png', '.jpg', '.jpeg']:
        # Handle regular image files
        with io.open(file_path, 'rb') as image_file:
            content = image_file.read()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            raise Exception(f"Error during Vision API call: {response.error.message}")

        # Extract text and bounding boxes
        for annotation in response.text_annotations[1:]:  # Skip the first, it's the entire image text
            text = annotation.description
            vertices = [(v.x, v.y) for v in annotation.bounding_poly.vertices]
            segments.append({
                "text": text,
                "bounding_box": vertices
            })

    else:
        raise Exception(f"Unsupported file type: {file_ext}")

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
            "bounding_box": segment['bounding_box'],
            "page": segment.get("page", 1)  # Add page number if available
        })

    return translated_segments


# Test function if running as standalone script
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python ocr_translate.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    extracted_segments = extract_text_from_file(file_path)
    print(f"Extracted Segments:\n{extracted_segments}\n")

    translated_segments = google_translate_text(extracted_segments, target_language='en')
    print(f"Translated Segments:\n{translated_segments}")
