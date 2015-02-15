![alt text](http://www.christian-bromann.com/webdrivercss-adminpanel.png "WebdriverCSS Adminpanel")

WebdriverCSS Adminpanel
=======================

This application helps you to manage all your image repositories of your CSS regression tests made with [WebdriverCSS](https://github.com/webdriverio/webdrivercss).
It provides an API to synchronise and configure them. This allows you to exchange the repositories with your peers and
colleagues to be able to run regression tests decentralized.

## Install

First download this repository:

```sh
$ git clone git@github.com:webdriverio/webdrivercss-adminpanel.git
```

Then download all Node.js and Bower dependencies:

```sh
$ npm install
$ npm install -g grunt-cli
$ bower install
```

Last but not least start the application by running:

```sh
$ grunt serve:dist
```

This command minifies all stylesheets and scripts and starts the application on [localhost:9000](http://localhost:9000).
I'm not going to describe how to deploy a Node.js application to a server. There are plenty of tutorials out there who
describe how to do that very well.

## Usage

Per default the applications provides the following API interfaces:

* **GET**   /api/repositories (`"Content-Type": "application/json"`)<br>
  returns a list of all current stored image repositories<br>

  **Example Request** *http://localhost:9000/api/repositories*

  ```json
  {
    "gz": ["amoeba-example.tar.gz"],
    "repositories": {
        "amoeba-example": {
            "images": ["contact.baseline.png","team.baseline.png","team.regression.png"],
            "diffs": ["team.diff.png"]
        }
    }
  }
  ```

* **GET**   /api/repositories/:file (`"Content-Type": "application/octed-stream"`)<br>
  returns the image repository tarball

  **Example Request** *http://localhost:9000/api/repositories/amoeba-example.tar.gz*

* **GET**   /api/repositories/:project/:file (`"Content-Type": "image/png"`)<br>
  get a current or new image from specific repository

  **Example Request** *http://localhost:9000/api/repositories/amoeba-example/contact.baseline.png*

* **GET**   /api/repositories/:project/diff/:diff (`"Content-Type": "image/png"`)<br>
  get diff image of specific repository

  **Example Request** *http://localhost:9000/api/repositories/amoeba-example/diff/team.diff.png*

* **POST**  /api/repositories/confirm (`"Accept": "application/json"`)<br>
  confirm image diff if changes were made on purpose

  **Example Request** *http://localhost:9000/api/repositories/confirm

  **JSON Parameters**<br>
    `file`    - `{String}`  filename of new file
    `project` - `{String}`  project name

* **POST**  /api/repositories/* (`"Accept": "application/octed-stream"`)<br>
  takes an image repository tarball (tar.gz), unzips it and saves it to the file system

  **Example Request** *http://localhost:9000/api/repositories/amoeba-example.tar.gz*

  **JSON Parameters**<br>
    `gz` - `{Object}`  repository tarbal

## Setup WebdriverCSS

For instructions on how to install WebdriverCSS please checkout the [repository website](https://github.com/webdriverio/webdrivercss)
on GitHub. There is also described [how to](https://github.com/webdriverio/webdrivercss#synchronize-your-taken-images) sync your
repository to the WebdriverCSS - Adminpanel application. Here is an example how to use this application in order to synchronise
image repositories created with WebdriverCSS:

```js
var WebdriverIO = require('webdriverio'),
    WebdriverCSS = require('webdrivercss');

// init webdriverio
var client = WebdriverIO.remote({
    desiredCapabilities: {
        browserName: 'firefox'
    }
});

// init webdrivercss
WebdriverCSS.init(client, {
    screenshotRoot: 'myProject',
    api: 'http://localhost:9000/api/repositories/'
});

client
    .init()
    .sync() // BEFORE: download current stored image repository of the project (if existing)

    .url('http://example.com')
    .webdrivercss('exampleTest', {
        name: 'homepage',
        elem: '#section'
    })

    .sync() // AFTER: zips and uploads state of image repository
    .end();
```

## Contributing
Any contributions or patches are welcome! In lieu of a formal styleguide, take care to maintain the existing coding style.
