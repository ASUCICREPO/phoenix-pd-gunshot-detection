from tensorflow import keras
from helper import feature_extractor, download_file, predict
import json
import boto3
import os
import numpy as np

MODEL_BUCKET = os.environ['model-bucket'] or "gunshot-filter-model"
KEY = os.environ['model-key'] or "11_28_100_keras_filter.h5"
triangulation_trigger = os.environ['triangulation_trigger'] or "arn:aws:sns:us-west-2:027537027602:triangulation_trigger"

s3 = boto3.resource('s3')
sns = boto3.client('sns')

PATH_MODEL = '/tmp/model.h5'

def lambda_handler(event, context):
    
    message = json.loads(event['Records'][0]['Sns']['Message'])
    print('message', message)
    
    s3_url = message['s3_url']
    path, filename = download_file(s3_url)
    
    # download model
    try:
        s3.Bucket(MODEL_BUCKET).download_file(KEY, PATH_MODEL)
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == "404":
            print("The object does not exist.")
        else:
            print('Error', e.response)
    
    # load model
    model = keras.models.load_model(PATH_MODEL)
    gunshot = predict(model, path)
    
    if not gunshot:
        return {
            'statusCode': 201,
            'body': 'Audio file ' + filename + ' not detected as a gunshot'
        }
    
    response = sns.publish(
        TopicArn=triangulation_trigger,
        Message='Trigger triangulation'
    )
    
    return {
        'statusCode': 200,
        'body': 'Audio file ' + filename + ' not detected as a gunshot' 
    }
