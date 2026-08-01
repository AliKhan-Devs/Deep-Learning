import random
import os
import cv2
from ultralytics import YOLO


MODEL_PATH = "yolov8n.pt"
IMAGE_PATH = "images/5.jpg"
OUTPUT_DIR = "outputs"
OUTPUT_IMAGE = os.path.join(OUTPUT_DIR, "detected_image5.jpg")

CONFIDENCE_THRESHOLD = 0.40


def load_model():
    """Load YOLO model."""
    return YOLO(MODEL_PATH)


def load_image(path):
    """Load image from disk."""
    image = cv2.imread(path)

    if image is None:
        raise FileNotFoundError(f"Unable to load image: {path}")

    return image


def detect_objects(model, image):
    """Run object detection."""
    return model(image)


def draw_detections(image, results, model):

    detection_count = 0

    for box in results[0].boxes:

        confidence = float(box.conf[0])

        if confidence < CONFIDENCE_THRESHOLD:
            continue

        detection_count += 1

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        class_id = int(box.cls[0])
        class_name = model.names[class_id]

        label = f"{class_name} ({confidence:.2f})"


        # Generate a random BGR color tuple
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

        
        
        
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            color,
            2,
        )

        cv2.putText(
            image,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2,
        )

    return detection_count


def save_image(image):

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    cv2.imwrite(OUTPUT_IMAGE, image)


def display_image(image):

    cv2.imshow("YOLO Object Detection", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def main():

    print("=" * 50)
    print("YOLOv8 Object Detection")
    print("=" * 50)

    model = load_model()

    image = load_image(IMAGE_PATH)

    results = detect_objects(model, image)

    detections = draw_detections(image, results, model)

    save_image(image)

    print(f"Objects Detected : {detections}")
    print(f"Output Saved     : {OUTPUT_IMAGE}")

    display_image(image)


if __name__ == "__main__":
    main()