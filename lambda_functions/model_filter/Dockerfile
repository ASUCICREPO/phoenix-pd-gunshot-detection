# Pull the base image with python 3.9 as a runtime for your Lambda
FROM public.ecr.aws/lambda/python:3.9

# Install OS packages for Pillow-SIMD
RUN yum -y install tar gzip zlib 
    make \
    rh-python36 \
    rh-python36-python-virtualenv \
    sudo \
    which \
    && yum clean all

# libsndfile
RUN curl -o libsndfile-1.0.28-alt1.x86_64.rpm http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//libsndfile-1.0.28-alt1.x86_64.rpm 
RUN curl -o libsndfile-devel-1.0.28-alt1.x86_64.rpm http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//libsndfile-devel-1.0.28-alt1.x86_64.rpm
#ffmpeg
RUN curl -o ffmpeg-4.4-alt5.x86_64.rpm  http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//ffmpeg-4.4-alt5.x86_64.rpm 

RUN yum localinstall \
    libsndfile-devel-1.0.28-alt1.x86_64.rpm \
    fmpeg-4.4-alt5.x86_64.rpm

# Copy the earlier created requirements.txt file to the container
COPY requirements.txt ./

# Install the python requirements from requirements.txt
RUN python3.9 -m pip install -r requirements.txt

# Copy the earlier created app.py file to the container
COPY helper.py ./
COPY lambda_function.py ./

EXPOSE 8080

# Set the CMD to your handler
CMD ["lambda_function.lambda_handler"]