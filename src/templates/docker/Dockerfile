FROM node:10

WORKDIR /usr/rede

COPY .rede .rede

COPY package.json .

RUN npm ci

{{#expose}}
EXPOSE {{.}}
{{/expose}}

#ENTRYPOINT ["_git/install.hooks.sh"]

CMD [ "npm", "run", "build" ]
