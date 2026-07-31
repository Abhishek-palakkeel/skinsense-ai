import torch
import timm

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class_names = [
    "Actinic Keratosis",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Melanoma",
    "Melanocytic Nevus",
    "Vascular Lesion"
]

model = timm.create_model(
    "efficientnet_b0",
    pretrained=False,
    num_classes=7
)

model.load_state_dict(
    torch.load("best_model.pth", map_location=device)
)

model.to(device)
model.eval()