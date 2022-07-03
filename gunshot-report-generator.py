import boto3
import pandas as pd

dynamodb = boto3.resource('dynamodb', region_name='us-west-2')

table = dynamodb.Table('lora-sensor-uplink-data')
response = table.scan()
data = response['Items']

while 'LastEvaluatedKey' in response:
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    data.extend(response['Items'])
    
df = pd.json_normalize(data)
df.drop(['notification', 'is_processed'], axis=1, inplace=True)

df['timestamp'] = pd.to_numeric(df['timestamp'])
df['timestamp'] = pd.to_datetime(df['timestamp'],unit='ms', utc=True)
df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms').dt.tz_convert('MST')
df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms').dt.tz_localize(None)


df = df.sort_values(by='timestamp', ascending=True)
print(df.head())

# Create Excel sheet
# df.to_excel("Gunshot Deployment Report.xlsx")