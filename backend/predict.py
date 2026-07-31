from PIL import Image
import torch
from torchvision import transforms

from model import model, device, class_names

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def predict_image(image):

    image = image.convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0)

    image = image.to(device)

    with torch.no_grad():

        outputs = model(image)

        probabilities = torch.softmax(outputs, dim=1)

        confidence, predicted = torch.max(probabilities, 1)

    return {
        "disease": class_names[predicted.item()],
        "confidence": round(confidence.item()*100,2)
    }