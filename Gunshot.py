#!/usr/bin/env python
# coding: utf-8

# In[ ]:

# !pip install librosa
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


# In[4]:


metadata = pd.read_csv(f'C:\Users\Soham\Dropbox (ASU)\PC\Desktop\SCCIC\GunshotDetection\UrbanSound8K.tar\UrbanSound8K\metadata\UrbanSound8K.csv')
metadata.head()

# In[]:

print(metadata.shape)
y = to_categorical(y)
y.shape.head()


# In[5]:


classes = metadata.groupby('classID')['class'].unique()
classes


# In[6]:


def feature_extractor(path):
    data, simple_rate = lb.load(path)
    data = lb.feature.mfcc(data,n_mfcc=128)
    data = np.mean(data,axis=1)
    return data


# In[8]:


y = to_categorical(y)
y.shape


# In[9]:


xtrainval, xtest, ytrainval, ytest = train_test_split(x,y,test_size=0.1,stratify=y,random_state=387)
xtrain, xvalid, ytrain, yvalid = train_test_split(xtrainval,ytrainval,test_size=0.2,stratify=ytrainval,random_state=387)
print('\nNumber of samples for Train set :',xtrain.shape[0])
print('Number of samples for Validation set :',xvalid.shape[0])
print('Number of samples for Test set :',xtest.shape[0])


# In[10]:


model = Sequential(
                        [
                            layers.Dense(1000,activation='relu',input_shape=(128,)),
                            layers.Dense(750,activation='relu'),
                            layers.Dense(500,activation='relu'),
                            layers.Dense(250,activation='relu'),
                            layers.Dense(100,activation='relu'),
                            layers.Dense(50,activation='relu'),
                            layers.Dense(10,activation='softmax')
                        ]
                   )
model.summary()


# In[11]:


model.compile(loss='categorical_crossentropy',optimizer='adam',metrics=['accuracy'])
training = model.fit(xtrain,ytrain,validation_data=(xvalid,yvalid),epochs=20)


# In[12]:


train_hist = pd.DataFrame(training.history)
train_hist


# In[13]:


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


# In[14]:


ytrue = np.argmax(ytest,axis=1)
ypred = np.argmax(model.predict(xtest),axis=1)
print('\nConfusion Matrix :\n\n')
print(confusion_matrix(ytrue,ypred))
print('\n\nClassification Report : \n\n',classification_report(ytrue,ypred))


# In[95]:


def predict(path):
    audio = np.array([feature_extractor(path)])
    classid = np.argmax(model.predict(audio)[0])
    print('Class predicted :',classes[classid][0],'\n\n')
    #return ipd.Audio(path)
    return classes[classid][0]


# In[16]:


predict('sounds/fold6/104327-2-0-26.wav')


# In[17]:


predict('sounds/Sample-1+(Tue+Jun+28+17_59_55+2022) (1).wav')


# In[18]:


predict('sounds/Sample-914 (Sat Jul 16 20_03_31 2022).wav')


# In[25]:


predict('sounds/Sample-36 (Wed Jun 29 20_34_40 2022).wav')


# In[27]:


predict('Sample-195 (Sat Jul  2 11_17_22 2022).wav')


# In[29]:


predict('Sample-195 (Sat Jul  2 11_17_22 2022).wav')


# In[31]:


predict('Sample-195 (Sat Jul  2 11_17_22 2022).wav')


# In[45]:


import boto3
# Declare bucket name, remote file, and destination
my_bucket = 'phoenix-pd-gunshot-wav-files'
orig_file = 'Sample-5 (Wed Jun 29 14:59:05 2022).wav'
dest_file = 'Sample-5 (Wed Jun 29 14:59:05 2022).wav'

# Connect to S3 bucket and download file
s3 = boto3.resource('s3')
s3.Bucket(my_bucket).download_file(orig_file, dest_file)


# In[46]:


predict('Sample-5 (Wed Jun 29 14:59:05 2022).wav')


# In[47]:


import librosa
import librosa.display
import matplotlib.pyplot as plt
data, sample_rate = librosa.load('Sample-5 (Wed Jun 29 14:59:05 2022).wav')
plt.figure(figsize=(12, 5))
librosa.display.waveshow(data, sr=sample_rate)


# In[48]:


import pandas
df = pandas.read_csv('GunShot.csv')
print(df)


# In[49]:


import pandas
df = pandas.read_csv('GunShot.csv')
print(df)


# In[ ]:


# importing the module
import pandas as pd
import boto3

my_bucket = 'phoenix-pd-gunshot-wav-files'
s3 = boto3.resource('s3')

predictionList = []

  
# read specific columns of csv file using Pandas
#df = pd.read_csv("GunShot.csv", usecols = ['File name', 'File URL'],nrows=3)
df = pd.read_csv("GunShot.csv", usecols = ['File name', 'File URL'])
#print(df)


#for index, row in df.iterrows():
for index, row in df.iterrows():
    #if index == 3:
     #   break
    #print(row[0])
    orig_file = row[0]
    dest_file = "test.wav"
    # Connect to S3 bucket and download file
    s3.Bucket(my_bucket).download_file(orig_file, dest_file)
    predictionList.append(predict(dest_file))
    
prdictionArr = np.array(predictionList)
df.insert(0, "Prediction", prdictionArr)
df.to_csv("output.csv")
    

    


# In[116]:


import librosa
import librosa.display
import matplotlib.pyplot as plt
filepath = "test.wav"
data, sample_rate = librosa.load(filepath)
plt.figure(figsize=(12, 5))
librosa.display.waveshow(data, sr=sample_rate)

ipd.Audio(filepath)


# In[ ]:




