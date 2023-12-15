# image_processing.py
import sys
import numpy as np
from keras.models import load_model
from PIL import Image

breed = ['boston_bull', 'dingo', 'pekinese', 'bluetick', 'golden_retriever', 'bedlington_terrier', 'borzoi', 'basenji', 'scottish_deerhound', 'shetland_sheepdog', 'walker_hound', 'maltese_dog', 'norfolk_terrier', 'african_hunting_dog', 'wire-haired_fox_terrier', 'redbone', 'lakeland_terrier', 'boxer', 'doberman', 'otterhound', 'standard_schnauzer', 'irish_water_spaniel', 'black-and-tan_coonhound', 'cairn', 'affenpinscher', 'labrador_retriever', 'ibizan_hound', 'english_setter', 'weimaraner', 'giant_schnauzer', 'groenendael', 'dhole', 'toy_poodle', 'border_terrier', 'tibetan_terrier', 'norwegian_elkhound', 'shih-tzu', 'irish_terrier', 'kuvasz', 'german_shepherd', 'greater_swiss_mountain_dog', 'basset', 'australian_terrier', 'schipperke', 'rhodesian_ridgeback', 'irish_setter', 'appenzeller', 'bloodhound', 'samoyed', 'miniature_schnauzer', 'brittany_spaniel', 'kelpie', 'papillon', 'border_collie', 'entlebucher', 'collie', 'malamute', 'welsh_springer_spaniel', 'chihuahua', 'saluki', 'pug', 'malinois', 'komondor', 'airedale', 'leonberg', 'mexican_hairless', 'bull_mastiff', 'bernese_mountain_dog', 'american_staffordshire_terrier', 'lhasa', 'cardigan', 'italian_greyhound', 'clumber', 'scotch_terrier', 'afghan_hound', 'old_english_sheepdog', 'saint_bernard', 'miniature_pinscher', 'eskimo_dog', 'irish_wolfhound', 'brabancon_griffon', 'toy_terrier', 'chow', 'flat-coated_retriever', 'norwich_terrier', 'soft-coated_wheaten_terrier', 'staffordshire_bullterrier', 'english_foxhound', 'gordon_setter', 'siberian_husky', 'newfoundland', 'briard', 'chesapeake_bay_retriever', 'dandie_dinmont', 'great_pyrenees', 'beagle', 'vizsla', 'west_highland_white_terrier', 'kerry_blue_terrier', 'whippet', 'sealyham_terrier', 'standard_poodle', 'keeshond', 'japanese_spaniel', 'miniature_poodle', 'pomeranian', 'curly-coated_retriever', 'yorkshire_terrier', 'pembroke', 'great_dane', 'blenheim_spaniel', 'silky_terrier', 'sussex_spaniel', 'german_short-haired_pointer', 'french_bulldog', 'bouvier_des_flandres', 'tibetan_mastiff', 'english_springer', 'cocker_spaniel', 'rottweiler']
emotion = ['angry', 'sad', 'relaxed', 'happy']

def preprocess_image(image_path):
    image_resized_rgb = image_path.resize((200, 200)).convert('RGB')
    image_array_rgb = np.array(image_resized_rgb)
    image_scale_rgb = image_array_rgb.astype("float32") / 255.0
    return image_scale_rgb.reshape(1, 200, 200, 3)

def predict_class(model, image_data):
    final_pred = model.predict(image_data)[0]
    return np.argmax(final_pred)

# 이미지 URL을 전달받아 예측만 하는 함수
def process_image(image_path, model):
    image = Image.open(image_path)
    image_data = preprocess_image(image)
    predicted_class = predict_class(model, image_data)
    print(breed[predicted_class])
    # print(predicted_class, end='')
    # sys.stdout.flush()

if __name__ == "__main__":

    # image_path = sys.argv[1]

    # breed_model_path = './model/dog_breed_model.h5' 
    # emotion_model_path = './model/dog_emotion_model.h5' 

    # if sys.argv[2] == 1:
    #     model = load_model(breed_model_path)
    # else:
    #     model = load_model(emotion_model_path)

    #테스트
    image_path = 'test_image\coo.webp'
    model = load_model('model\dog_breed_model.h5')
    process_image(image_path, model)
    