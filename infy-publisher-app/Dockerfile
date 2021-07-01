FROM node:12

WORKDIR /app/messenger/publisher

ADD . /app/messenger/publisher

RUN \
    npm install && \
    npm install -g nodemon
    
CMD ["npm", "start"]