FROM node

RUN apt-get update && \
    apt-get install -y ruby-full rubygems && \
    npm install -g bower grunt && \
    gem install bundler

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN bower install --allow-root && \
    npm install && \
    bundle install

# These folders are listed in the .dockerignore file so they won't make it
# into the image. However, they need to be available during build, and runtime.
RUN mkdir -p dist repositories

EXPOSE 9000

VOLUME /usr/src/app/repositories

CMD npm start
