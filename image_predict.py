import sys
import numpy as np
from keras.models import load_model
from keras.preprocessing import image
import tensorflow as tf
from keras.applications import EfficientNetB4, Xception, ResNet50
from keras.layers import GlobalAveragePooling2D
from keras.layers import Input
from keras.models import Model
from PIL import Image
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

breed = [
    'labrador_retriever', 'german_shepherd', 'golden_retriever',
    'bulldog', 'beagle', 'poodle', 'rottweiler',
    'yorkshire_terrier', 'boxer', 'dachshund',
    'siberian_husky', 'great_dane', 'doberman_pinscher',
    'australian_shepherd', 'cavalier_king_charles_spaniel',
    'shih_tzu', 'pomeranian', 'boston_terrier',
    'hound', 'bernese_mountain_dog'
]
emotion = ['angry', 'sad', 'relaxed', 'happy']

def preprocess_image_emotion(image_path):
    image = Image.open(image_path)
    image_resized_rgb = image.resize((224, 224)).convert('RGB')
    image_array_rgb = np.array(image_resized_rgb)
    image_scale_rgb = image_array_rgb.astype("float32") / 255.0
    return image_scale_rgb.reshape(1, 224, 224, 3)

def preprocess_image_breed(image_path):
    img = image.load_img(image_path, target_size=(224, 224))  # 이미지 크기를 (224, 224)로 변경
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # 배치 차원 추가
    img_array /= 255.0

    # 특징 추출 과정
    effnet_preprocessor = tf.keras.applications.efficientnet.preprocess_input
    effnet_features = get_features(EfficientNetB4, effnet_preprocessor, (224, 224, 3), img_array)
    
    xception_preprocessor = tf.keras.applications.xception.preprocess_input
    xception_features = get_features(Xception, xception_preprocessor, (224, 224, 3), img_array)
    
    resnet_preprocessor = tf.keras.applications.resnet50.preprocess_input
    resnet_features = get_features(ResNet50, resnet_preprocessor, (224, 224, 3), img_array)

    # 모든 특징 벡터를 연결
    final_features = np.concatenate([effnet_features, xception_features, resnet_features], axis=-1)
    return final_features

def get_features(model_name, model_preprocessor, input_size, data):
    input_layer = Input(input_size)
    preprocessor = model_preprocessor(input_layer)
    base_model = model_name(weights='imagenet', include_top=False, input_shape=input_size)(preprocessor)
    avg = GlobalAveragePooling2D()(base_model)
    feature_extractor = Model(inputs=input_layer, outputs=avg)
    feature_maps = feature_extractor.predict(data, verbose=1)
    print('Feature maps shape:', feature_maps.shape)
    return feature_maps

def predict_class(model, image_data):
    final_pred = model.predict(image_data)
    return np.argmax(final_pred, axis=1)[0]

# 이미지를 전달받아 예측만 하는 함수
def process_image(image_path, model, predict_flag):
    if predict_flag == 1:
        image_data = preprocess_image_breed(image_path)
    else:
        image_data = preprocess_image_emotion(image_path)
    predicted_class = predict_class(model, image_data)
    if predict_flag == 1:
        print(breed[predicted_class], end='\n')
    elif predict_flag == 2:
        print(emotion[predicted_class], end='\n')
    else:
        raise Exception("예외가 발생했습니다.")

if __name__ == "__main__":

    image_path = sys.argv[1]

    breed_model_path = '../model/best_model.h5' 
    breed_model = load_model(breed_model_path)

    emotion_model_path = '../model/dog_emotion_model.h5' 
    emotion_model = load_model(emotion_model_path)

    
    process_image(image_path, breed_model, 1)
    process_image(image_path, emotion_model, 2)
    sys.stdout.flush()