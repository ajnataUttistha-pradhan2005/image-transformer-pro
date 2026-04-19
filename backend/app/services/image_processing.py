import cv2
import numpy as np
from app.models.schemas import Operations

def process_image_pipeline(image: np.ndarray, ops: Operations) -> np.ndarray:
    result = image.copy()

    # OpenCV loads images in BGR format for cv2.imdecode
    
    # 1. Grayscale
    if ops.grayscale:
        # If it has 3 channels
        if len(result.shape) == 3 and result.shape[2] == 3:
            result = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
            # Convert back to 3 channels so remainder of pipeline can assume 3 channels safely if needed, 
            # but usually single channel is fine. We will convert it back to BGR for consistency
            result = cv2.cvtColor(result, cv2.COLOR_GRAY2BGR)

    # 2. Brightness and Contrast
    if ops.brightness != 0 or ops.contrast != 1.0:
        # cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)
        result = cv2.convertScaleAbs(result, alpha=ops.contrast, beta=ops.brightness)

    # 3. Blur
    if ops.blur and ops.blur > 0:
        ksize = ops.blur
        if ksize % 2 == 0:
            ksize += 1 # Ensure odd kernel size
        result = cv2.GaussianBlur(result, (ksize, ksize), 0)

    # 4. Sharpen
    if ops.sharpen and ops.sharpen > 0:
        # simple sharpening filter conceptually like unsharp masking
        # center weight = 1 + 4*intensity, neighbors = -intensity
        kernel = np.array([[0, -ops.sharpen, 0],
                           [-ops.sharpen, 1 + 4 * ops.sharpen, -ops.sharpen],
                           [0, -ops.sharpen, 0]])
        result = cv2.filter2D(result, -1, kernel)

    # 5. Sobel Edge Detection
    if ops.sobel:
        # Convert to gray for edge detection
        gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY) if len(result.shape) == 3 else result
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        abs_grad_x = cv2.convertScaleAbs(sobelx)
        abs_grad_y = cv2.convertScaleAbs(sobely)
        result_gray = cv2.addWeighted(abs_grad_x, 0.5, abs_grad_y, 0.5, 0)
        result = cv2.cvtColor(result_gray, cv2.COLOR_GRAY2BGR)

    # 6. Canny Edge Detection
    if ops.canny:
        gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY) if len(result.shape) == 3 else result
        result_gray = cv2.Canny(gray, ops.canny.t1, ops.canny.t2)
        result = cv2.cvtColor(result_gray, cv2.COLOR_GRAY2BGR)

    # 7. Resize
    if ops.resize:
        result = cv2.resize(result, (ops.resize.width, ops.resize.height))

    # 8. Rotate
    if ops.rotate and ops.rotate.angle != 0:
        h, w = result.shape[:2]
        center = (w // 2, h // 2)
        
        angle = ops.rotate.angle % 360
        # If it's a multiple of 90, we can use fast rotate
        if angle == 90:
            result = cv2.rotate(result, cv2.ROTATE_90_COUNTERCLOCKWISE)
        elif angle == 180:
            result = cv2.rotate(result, cv2.ROTATE_180)
        elif angle == 270:
            result = cv2.rotate(result, cv2.ROTATE_90_CLOCKWISE)
        else:
            # Arbitrary rotation
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            
            # calculate new bounding dims
            cos = np.abs(M[0, 0])
            sin = np.abs(M[0, 1])
            nW = int((h * sin) + (w * cos))
            nH = int((h * cos) + (w * sin))
            
            M[0, 2] += (nW / 2) - center[0]
            M[1, 2] += (nH / 2) - center[1]
            
            result = cv2.warpAffine(result, M, (nW, nH), borderValue=(0,0,0))

    # 9. Flip
    if ops.flip:
        if ops.flip == 'horizontal':
            result = cv2.flip(result, 1)
        elif ops.flip == 'vertical':
            result = cv2.flip(result, 0)
        elif ops.flip == 'both':
            result = cv2.flip(result, -1)

    # 10. Crop
    if ops.crop:
        h, w = result.shape[:2]
        start_x = int(w * (ops.crop.left / 100))
        start_y = int(h * (ops.crop.top / 100))
        end_x = int(w - w * (ops.crop.right / 100))
        end_y = int(h - h * (ops.crop.bottom / 100))
        
        start_x = max(0, min(start_x, w - 2))
        start_y = max(0, min(start_y, h - 2))
        end_x = max(start_x + 1, min(end_x, w))
        end_y = max(start_y + 1, min(end_y, h))
        
        result = result[start_y:end_y, start_x:end_x]

    return result
