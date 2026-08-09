from ultralytics import YOLO
import cv2


def main():
    # Load trained model
    model = YOLO("runs/detect/runs/face_mask_v2/weights/best.pt")


    # Open webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Unable to open webcam.")
        return

    while True:
        # Read frame
        ret, frame = cap.read()

        if not ret:
            print("Error: Failed to read frame.")
            break

        # Perform inference
        results = model(frame)

        # Draw detections automatically
        annotated_frame = results[0].plot()

        # Display result
        cv2.imshow("Face Mask Detection", annotated_frame)

        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release resources
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()