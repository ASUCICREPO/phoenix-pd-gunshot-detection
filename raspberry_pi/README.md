# Gunshot Detection Algorithm Installation Guide
> Our gunshot detection system utilizes the algorithm developed in this repository: https://github.com/gabemagee/gunshot_detection

## Prerequisites
1. Raspberry Pi device running Raspberry Pi OS with a command line terminal and `git` installed
2. Python-3
3. Existing Database tables and S3 buckets in AWS. Refer [AWS Services guide](https://github.com/ASUCICREPO/smart-beats/blob/master/AWS_Services.md).
4. External microphone

## Installation

### Gunshot algorithm 

1. Clone the github repository: [phoenix-pd-gunshot-detection](https://github.com/ASUCICREPO/phoenix-pd-gunshot-detection)
   
2. Go to `raspberry_pi` directory.
```
cd sphoenix-pd-gunshot-detection/raspberry_pi/
```

3. Create Python virtual environment
```
python -m venv venv/
source venv/bin/activate
```

4. Install dependencies from `pi_requirements.txt`
```
pip install -r pi_requirements.txt
```

5. Update configuration in `./gunshot_detection.py`. Refer [AWS Services guide](https://github.com/ASUCICREPO/smart-beats/blob/master/AWS_Services.md) for AWS configurations. 

> You can add your AWS credentials as environment variables (inside `.bashrc`) and load them using `os.environ['property']` in the config file 

```python
S3_BUCKET_NAME = "phoenix-pd-gunshot-wav-files"
FRONTEND_URL = "https://asucic-gunshotdetection.com/api/incidents/upload"
```

6. Run the application

```bash
nohup python3 gunshot_detection.py &
```


### Cronjob Setup
> The gunshot-detection code should run automatically everytime Raspberry Pi reboots

1. Open Raspberry Pi terminal
2. Run `crontab -e`
3. Add the following two lines:

```bash
@reboot bash /<parent-directory>/phoenix-pd-gunshot-detection/startup-scripts/reboot_message.sh
@reboot bash /<parent-directory>/phoenix-pd-gunshot-detection/startup-scripts/run_gunshot_detector.sh
```

The **cronjob** scripts can be found at [startup-scripts](../startup-scripts/)

4. Save and exit



> **Known Issue:** 
> 
> If a Raspberry Pi is abruptly switched off, it can sometimes corrupt the running script **gunshot_detection.py**. To mitigate this issue, we keep a backup of this script in the **backups** folder. The [startup script](../startup-scripts/run_gunshot_detector.sh) verifies the checksum of **gunshot_detection.py** and **backups/gunshot_detection.py** before executing the gunshot detection python script. *Please ensure that both **gunshot_detection.py** and **backups/gunshot_detection.py** are always identical (have the same checksum)*. If both scripts are different, the [startup script](../startup-scripts/run_gunshot_detector.sh) will always execute the **backups/gunshot_detection.py**.

