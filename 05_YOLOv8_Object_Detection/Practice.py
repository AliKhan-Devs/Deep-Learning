from ultralytics import YOLO

# Load pretrained YOLOv8 Nano model
model = YOLO("yolov8n.pt")

# Perform object detection
results = model("images/1.jpg")

print("Detection completed successfully!")

# print(results)
# print(results[0])
# print(results[0].boxes)
# print(results[0].boxes.xyxy)
# print(results[0].boxes.conf)
# print(results[0].boxes.cls)
# print(model.names)

for box in results[0].boxes:

    x1, y1, x2, y2 = box.xyxy[0]

    confidence = box.conf[0]

    class_id = int(box.cls[0])

    class_name = model.names[class_id]

    print(class_name, confidence)


