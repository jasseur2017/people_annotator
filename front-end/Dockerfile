FROM node:16

#COPY . .

RUN apt-get update

#RUN npm install

#RUN npm run build

RUN apt-get install -y sudo openssh-server git vim

RUN useradd -d /home/annotator-front-end -u 1000 -ms /bin/bash -g root -G sudo -p password username
RUN echo username:password | chpasswd

WORKDIR /home/annotator-front-end
