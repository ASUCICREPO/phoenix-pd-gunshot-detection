# %%
# Imports
!pip install openpyxl 
import os
import numpy as np
import pandas as pd
import librosa as lb
import IPython.display as ipd
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import Sequential, layers
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Read labeled data 
# %%
raw_gunshot = pd.read_csv('gunshot_data_csv.csv')
raw_gunshot.head()

# %%
one_hot = pd.read_excel('one_hot_encoded_cic.xlsx')
one_hot.head()

# %%
!pip install wget
import wget
import os
# download files from above csv
# manually download more gunshot examples from online datasets cited below
# TODO: Add links or better automate it
for index, row in one_hot.iterrows():
    URL = row['File URL']
    prefix = './gunshots/' if row['Gun Shot (Y/N)'] == 'Y' else './non-gunshots/'
    fileName = prefix + str(index) + '.wav'
    if os.path.exists(fileName):
        continue
    response = wget.download(URL, fileName)

# %%
def feature_extractor(path):
    data, simple_rate = lb.load(path)
    data = lb.feature.mfcc(y=data, n_mfcc=128)
    data = np.mean(data,axis=1)
    return data

# %%
import random
filepaths = []
num_gunshots = len(os.listdir('./gunshots/'))
non_gunshots = [{'isGunshot': False, 'file':x} for x in os.listdir('./non-gunshots/')]

# equal number of gunshots and non gunshots
filepaths.extend([{'isGunshot': True, 'file':x} for x in os.listdir('./gunshots/')])
filepaths.extend(random.sample(non_gunshots, num_gunshots))

# %%
import sklearn
def normalize(x, axis=0):
    return sklearn.preprocessing.minmax_scale(x, axis=axis)
# gather spectogram
for _ in range(3):
    rows = random.choice(filepaths)
    directory = './gunshots/' if rows['isGunshot'] else './non-gunshots'
    path = directory + '/' + str(rows['file'])
    x , sr = lb.load(path)
    
    spectogram = lb.stft(x)
    spectogram_db = lb.amplitude_to_db(abs(spectogram))
    print(f'spectogram count = {len(spectogram_db)}')
    
    zero_crossings = lb.zero_crossings(x, pad=False)
    print(f'total zero crossings = {sum(zero_crossings)}')
    
    #spectral centroid -- centre of mass -- weighted mean of the frequencies present in the sound
    spectral_centroids = lb.feature.spectral_centroid(x, sr=sr)[0]
    # Computing the time variable for visualization
    frames = range(len(spectral_centroids))
    t = lb.frames_to_time(frames)
    # Normalising the spectral centroid 
    normlaized_spectral_centroid = normalize(spectral_centroids)
    print(f'Normalized Spectral centroid shape -> {normlaized_spectral_centroid.shape}')
    
    spectral_rolloff = lb.feature.spectral_rolloff(x, sr=sr)[0]
    normalized_spectral_rolloff = normalize(spectral_rolloff)
    print(f'Normalized Spectral Rolloff shape -> {normalized_spectral_rolloff.shape}')
    print('-------------------------------------')

# %%
x, y = [], []
for rows in tqdm(filepaths):
    try:
        directory = './gunshots/' if rows['isGunshot'] else './non-gunshots'
        path = directory + '/' + str(rows['file'])
        x.append(feature_extractor(path))
        y.append(1 if rows['isGunshot'] else 0)
    except Exception as e:
        print(e)
x = np.array(x)
y = np.array(y)
x.shape, y.shape

# %%
y = to_categorical(y)
y.shape

# %%
xtrainval, xtest, ytrainval, ytest = train_test_split(x,y,test_size=0.1,stratify=y,random_state=387)
xtrain, xvalid, ytrain, yvalid = train_test_split(xtrainval,ytrainval,test_size=0.2,stratify=ytrainval,random_state=387)
print('\nNumber of samples for Train set :',xtrain.shape[0])
print('Number of samples for Validation set :',xvalid.shape[0])
print('Number of samples for Test set :',xtest.shape[0])


# %%
model = Sequential(
                        [
                            layers.Dense(1000,activation='relu',input_shape=(128,)),
                            layers.Dense(750,activation='relu'),
                            layers.Dense(500,activation='relu'),
                            layers.Dense(250,activation='relu'),
                            layers.Dense(100,activation='relu'),
                            layers.Dense(50,activation='relu'),
                            layers.Dense(10,activation='relu'),
                            layers.Dense(2,activation='softmax')
                        ]
                   )
model.summary()

# %%
model.compile(loss='categorical_crossentropy',optimizer='adam',metrics=['accuracy'])
training = model.fit(xtrain,ytrain,validation_data=(xvalid,yvalid),epochs=20)

# %%
train_hist = pd.DataFrame(training.history)
train_hist

# %%
plt.figure(figsize=(20,8))
plt.plot(train_hist[['loss','val_loss']])
plt.legend(['loss','val_loss'])
plt.title('Loss Per Epochs')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.show()

plt.figure(figsize=(20,8))
plt.plot(train_hist[['accuracy','val_accuracy']])
plt.legend(['accuracy','val_accuracy'])
plt.title('Accuracy Per Epochs')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.show()


# %%
ytrue = np.argmax(ytest,axis=1)
ypred = np.argmax(model.predict(xtest),axis=1)
print('\nConfusion Matrix :\n\n')
print(confusion_matrix(ytrue,ypred))
print('\n\nClassification Report : \n\n',classification_report(ytrue,ypred))

# %%
def predict(path, actual):
    audio = np.array([feature_extractor(path)])
    classid = np.argmax(model.predict(audio)[0])
    # print('Class predicted :','gunshot' if classid else 'not a gunshot', 'and was', 'gunshot' if actual else 'not a gunshot','\n\n')
    print(f"For file at {path}, class predicted : {'gunshot' if classid else 'not a gunshot'} and was { 'gunshot' if actual else 'not a gunshot'}")
    return ipd.Audio(path)


# %%
import random
samples = 5
for _ in range(samples):
    choice = random.choice(filepaths)
    directory = './gunshots/' if choice['isGunshot'] else './non-gunshots'
    path = directory + '/' + str(choice['file'])
    predict(path, choice['isGunshot'])    


