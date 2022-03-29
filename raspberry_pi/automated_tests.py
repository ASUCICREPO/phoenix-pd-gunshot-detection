import os
from time import sleep
from playsound import playsound
    
d = "gunshot_sounds"

while True:
    for path in os.listdir(d):
        full_path = os.path.join(d, path)
        if os.path.isfile(full_path):
            print(full_path)
            playsound(full_path)
            sleep(5)
