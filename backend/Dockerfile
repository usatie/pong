FROM node:20

RUN useradd --user-group --create-home --shell /bin/false backend &&\
	npm install --global npm

ENV HOME=/home/backend

COPY package.json $HOME/api/
RUN chown -R backend:backend $HOME/*

USER backend
WORKDIR $HOME/api
RUN npm install

CMD ["yarn", "start"]
