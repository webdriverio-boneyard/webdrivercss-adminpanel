FROM node:0.10

RUN apt-get -y update && apt-get install -y ruby rubygems

ADD ./Gemfile .

RUN gem install bundler
RUN bundle install

RUN npm install -g grunt


