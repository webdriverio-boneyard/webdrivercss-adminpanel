Webdrivercss Adminpanel Installation
====================================

## Local Machine

You will need the following installed on system:

* nodejs and npm
* ruby

```
# Fetch code
git clone https://github.com/webdriverio/webdrivercss-adminpanel.git
cd webdrivercss-adminpanel

# Install dependencies
./bin/install

# install grunt-cli
npm install -g grunt-cli

# Build and serve code
grunt serve:dev
```

## Using Docker and Fig

You will need the following installed on system:

* [docker](http://docker.com)
* [fig](http://fig.sh)

```
# Fetch code
git clone https://github.com/webdriverio/webdrivercss-adminpanel.git
cd webdrivercss-adminpanel

# Install dependencies
fig run npm install

# Up
fig up frontend
```

More information about what is happening in `fig.yml` file.
