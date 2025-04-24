FROM selenium/standalone-chrome:latest
WORKDIR /app
ADD . /app
USER root
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm

COPY data/ /app/data
COPY framework/ /app/framework
COPY model/ /app/model
COPY pages/ /app/pages
COPY utils/ /app/utils
COPY webdriverio-typescript-cucumber/ /app/webdriverio-typescript-cucumber
COPY webdriverio-typescript-mocha/ /app/webdriverio-typescript-mocha
COPY package.json /app/
COPY package-lock.json /app/
COPY tsconfig.json /app/
COPY .npmrc /app/
COPY webdriverio-ts-mocha-config.ts /app/

RUN npm install

CMD ["npm", "run", "test-wdio-mocha"]