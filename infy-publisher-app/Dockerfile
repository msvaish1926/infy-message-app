FROM node:12

WORKDIR /app/messenger/publisher

ADD . /app/messenger/publisher

RUN \
    npm install && \
    npm install -g nodemon

EXPOSE 3000
    
CMD ["npm", "start"]
