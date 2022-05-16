from scipy.io.wavfile import read
from scipy.signal import find_peaks
import numpy as np
import os
import traceback
import requests
import json
import boto3
import time
from datetime import datetime
from datetime import timedelta
import re
from itertools import combinations
from helpers import download_file, get_timestamp, get_solution

# %%

table_name = os.environ['table_name'] or 'lora-sensor-uplink-data'
dynamo_client = boto3.client('dynamodb')
dynamo_res = boto3.resource('dynamodb')
sns_client = boto3.client('sns')
lambda_client = boto3.client('lambda')
location_tables = os.environ['locations_table'] or 'device_locations'
triangulation_table = os.environ['triangulation_table'] or 'triangulated_gunshots'
triangulation_status = os.environ['triangulation_status'] or 'triangulation_status'


def lambda_handler(event, context):
    items = []
    start = time.time()
    response = dynamo_client.scan(
        TableName = table_name,
        FilterExpression = 'is_processed = :is_processed',
        ExpressionAttributeValues = {
                # ':is_processed': False
                ':is_processed': {
                    "BOOL": False
                }
            },
    )
    if 'Items' in response:
        items.extend(response['Items'])
    
    while 'LastEvaluatedKey' in response:
        last_evaluated_key = response['LastEvaluatedKey']
        response = dynamo_client.scan(
            TableName = table_name,
            FilterExpression = 'is_processed = :is_processed',
            ExpressionAttributeValues = {
                # ':is_processed': False
                ':is_processed': {
                    "BOOL": False
                }
            },
            ExclusiveStartKey = last_evaluated_key
        )
        if 'Items' in response:
            items.extend(response['Items'])
    
    
    # if 3 items are not there, skip
    # if len(items) < 3:
    #     return {
    #         'statusCode': 201,
    #         'body': 'Not enough items in dynamodb!'
    #     }
    
    # got all WAV files URL, download and process them
    paths = []
    timestamp_objs = []
    device_locations = {}
    closest = None
    for item in items:
        device_id = item['device_id']['S']
        
        # fetch device location if not done yet,
        if device_id not in device_locations:
            response = dynamo_client.get_item(
                Key={
                    'device_id':{
                        'S':device_id
                    },
                },
                TableName = location_tables
            )
            if 'Item' in response:
                x = response['Item']
                lat = x['lat']['N']
                lon = x['lon']['N']
                device_locations[device_id] = (lat, lon) 
        
        notification =item['notification']['S']
        s3_url = item['s3_url']['S']
        is_processed = item['is_processed']['BOOL']
        timestamp = item['timestamp']['N']
        try:
            # path, filename = download_file(s3_url)
            # paths.append(path)
            # fs, data = read(path)
            # print(data.shape)
            # peaks, props = find_peaks(data, prominence=(max(abs(data)) * 1.5, None), distance = fs/2)
            # print('peaks', peaks)
            # rel_time_stamps = [peak/fs % 1 for peak in peaks ]
            # first_peak = rel_time_stamps[0]
            # gunshot_dt = get_timestamp(filename)
            # print(f'first peak frac at {first_peak} and gunshot dt is {gunshot_dt}')
            # delta = timedelta(milliseconds=first_peak * 1000)
            # gunshot_dt = gunshot_dt + delta
            # timestamp = gunshot_dt.timestamp()
            print(f'after change in ms {timestamp}')
            lat, lon = device_locations[device_id]
            obj = {'device_id':device_id, 'timestamp':timestamp, 'lat':lat, 'lon':lon}
            timestamp_objs.append(obj)
        except Exception as e:
            print('-'*100)
            print(e)
            print(traceback.format_exc())

    if len(timestamp_objs) == 1:
        first = timestamp_objs[0]
        results = {
            'lat': first['lat'],
            'long': first['lon']
        }
    elif len(timestamp_objs) == 2:
        first = min(timestamp_objs, key=lambda t: t['timestamp'])
        results = {
            'lat': first['lat'],
            'long': first['lon']
        }
    else:
        # do triangulation
        solutions = []
        combs = list(combinations(timestamp_objs, 3))
        print('combinations', len(combs), 'time till now', time.time() - start)
        for comb in combs:
            A = comb[0]
            B = comb[1]
            C = comb[2]
            xA, yA, tA = float(A['lat']), float(A['lon']), int(A['timestamp'])
            xB, yB, tB = float(B['lat']), float(B['lon']), int(B['timestamp'])
            xC, yC, tC = float(C['lat']), float(C['lon']), int(C['timestamp'])
            try:
                solution = get_solution(xA, yA, xB, yB, xC, yC, tA, tB, tC)
                print(f'triangulated (lat,lon) at {solution}')
                solutions.append(solution)
                print(f'average (lat,lon) coordinates -> {np.mean(solutions, axis=0)}')
                lat, lon = np.mean(solutions, axis=0)
                results = {
                    'lat':lat,
                    'long':lon
                }
            except Exception as e:
                print('-----------------')
                print('Solution does not exist!')
                print(e)
                first = min(timestamp_objs, key=lambda t: t['timestamp'])
                results = {
                    'lat': first['lat'],
                    'long': first['lon']
                }
    
    
    result = {
        'timestamp': time.time(),
        'lat': results['lat'],
        'long': results['long']
    }
    
    lambda_client.invoke(
        FunctionName='arn:aws:lambda:us-west-2:027537027602:function:publishMessages',
        Payload=json.dumps(result),
    )
    
    response = dynamo_client.put_item(
        TableName = triangulation_table,
        Item = result
    )
    print('posted into triangulation table', result)
    
    print(f'updating processed status of {len(items)} items')
    for item in items:
        item['is_processed']['BOOL'] = True
        dynamo_client.put_item(
            TableName = table_name,
            Item = item
        )
    
    return {
        'statusCode': 201,
        'body': json.dumps(results)
    }
