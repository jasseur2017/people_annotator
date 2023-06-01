FROM python:3.8-slim

RUN apt-get update
RUN pip3 install --upgrade pip

COPY requirements.txt .
RUN pip install -r requirements.txt

RUN apt-get install -y sudo openssh-server git vim ffmpeg

RUN useradd -d /home/annotator-back-end -u 1000 -ms /bin/bash -g root -G sudo -p password username
RUN echo username:password | chpasswd

WORKDIR /home/annotator-back-end
