from ultralytics import YOLO

model = YOLO("runs/detect/runs/face_mask_v1/weights/best.pt")

print(model.names)