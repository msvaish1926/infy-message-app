FROM node:12

WORKDIR /app/messenger/consumer

ADD . /app/messenger/consumer

RUN \
    npm install && \
    npm install -g nodemon
	
EXPOSE 3001
    
CMD ["npm", "start"]