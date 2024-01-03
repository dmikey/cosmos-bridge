FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN wget https://github.com/ovrclk/akash/releases/download/v0.12.1/akash_0.12.1_linux_arm64.deb -O akash.deb
RUN dpkg -i akash.deb
RUN apt-get update
RUN apt install redis-server -y
RUN rm akash.deb
RUN npm ci
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]