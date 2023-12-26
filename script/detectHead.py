import dlib, cv2, os
from imutils import face_utils
import numpy as np
import matplotlib.pyplot as plt
from math import atan2, degrees
import sys

# overlay function
def overlay_transparent(background_img, img_to_overlay_t, x, y, overlay_size=None):
    img_to_overlay_t = cv2.cvtColor(img_to_overlay_t, cv2.COLOR_BGRA2RGBA)
    bg_img = background_img.copy()
    # convert 3 channels to 4 channels
    if bg_img.shape[2] == 3:
        bg_img = cv2.cvtColor(bg_img, cv2.COLOR_RGB2RGBA)

    if overlay_size is not None:
        img_to_overlay_t = cv2.resize(img_to_overlay_t.copy(), overlay_size)

    b, g, r, a = cv2.split(img_to_overlay_t)

    mask = cv2.medianBlur(a, 5)

    h, w, _ = img_to_overlay_t.shape
    roi = bg_img[int(y-h/2):int(y+h/2), int(x-w/2):int(x+w/2)]

    img1_bg = cv2.bitwise_and(roi.copy(), roi.copy(), mask=cv2.bitwise_not(mask))
    img2_fg = cv2.bitwise_and(img_to_overlay_t, img_to_overlay_t, mask=mask)

    bg_img[int(y-h/2):int(y+h/2), int(x-w/2):int(x+w/2)] = cv2.add(img1_bg, img2_fg)

    # convert 4 channels to 4 channels
    bg_img = cv2.cvtColor(bg_img, cv2.COLOR_RGBA2RGB)

    return bg_img

def angle_between(p1, p2):
    xDiff = p2[0] - p1[0]
    yDiff = p2[1] - p1[1]
    return degrees(atan2(yDiff, xDiff))


if __name__ == "__main__":
    image_path = sys.argv[1]  # Corrected variable name

    detector = dlib.cnn_face_detection_model_v1('dogHeadDetector.dat')
    predictor = dlib.shape_predictor('landmarkDetector.dat')

    filename, ext = os.path.splitext(os.path.basename(image_path))
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    dets = detector(img, upsample_num_times=0)

    img_result = img.copy()

    # Load the angry filter image
    ear = cv2.imread('redAngryFilter.png', cv2.IMREAD_UNCHANGED)

    for i, d in enumerate(dets):
        shape = predictor(img, d.rect)
        shape = face_utils.shape_to_np(shape)

        for i, p in enumerate(shape):
            # Assuming you want to apply the filter at the tip of the nose (change these coordinates accordingly)
            filter_x = p[0]
            filter_y = p[1]

            # Apply the filter
            img_result = overlay_transparent(img_result, ear, filter_x, filter_y, overlay_size=(100, 100))
            break

    img_out = cv2.cvtColor(img_result, cv2.COLOR_RGB2BGR)

    # Save the result
    output_path = os.path.join('uploads', '%s_out%s' % (filename, ext))
    cv2.imwrite(output_path, img_out)
    print(output_path)
    sys.stdout.flush()