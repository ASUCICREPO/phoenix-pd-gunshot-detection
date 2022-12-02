import librosa as lb
import numpy as np
import os 
import requests

def feature_extractor(path):
    data, simple_rate = lb.load(path)
    data = lb.feature.mfcc(y=data, n_mfcc=128)
    data = np.mean(data,axis=1)
    return data

def predict(model, path):
    audio = np.array([feature_extractor(path)])
    classid = np.argmax(model.predict(audio)[0])
    print(f"For file at {path}, \nclass predicted : {'gunshot' if classid else 'not a gunshot'}" )
    return classid == 1


def download_file(url):
    local_filename = url.split('/')[-1]
    path = os.path.join('/tmp', local_filename)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return path, local_filename
