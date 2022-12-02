### Needs SNS and S3 permission
### Subscribed to SNS topic ->  TriangulationTrigger
### Environment Variables, change accordingly
 - model-bucket ==  <S3 bucket with the model>
 - model-key == "11_28_100_keras_filter.h5" [Model filepath name inside bucket]
 - triangulation_trigger == "arn:aws:sns:us-west-2:<AccountNumber>:triangulation_trigger"
