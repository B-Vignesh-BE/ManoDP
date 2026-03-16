from tensorflow.keras.preprocessing import image
import numpy as np
import os
import tensorflow as tf

model_path = os.path.join(os.path.dirname(__file__), "medicine_model.keras")
model = tf.keras.models.load_model(model_path)

import os
import json

base_path = os.path.dirname(__file__)
json_path = os.path.join(base_path, "class_names.json")

with open(json_path, "r") as f:
    class_names = json.load(f)

def predict_image(img_path):
    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img)

    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)

    print("Raw prediction:", prediction)
    print("Predicted index:", np.argmax(prediction))
    print("Class names:", class_names)

    predicted_class = class_names[np.argmax(prediction)]

    confidence = float(np.max(prediction))
    return predicted_class, confidence