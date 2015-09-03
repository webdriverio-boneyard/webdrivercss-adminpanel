'use strict';

angular.module('webdrivercssAdminpanelApp').directive('imagediff', function($http) {

    var ImageDiff = function(id, width, height) {

        if (!(this instanceof ImageDiff)) {
            return new ImageDiff(id, width, height);
        }

        var self = this,
            canvas = document.createElement('canvas'),
            container = document.getElementById(id),
            divide = 0.32;

        this.ctx = canvas.getContext('2d');
        this.images = [];
        this.resp = 1;

        var handler = function(ev) {
            if (ev.layerX || ev.layerX === 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX === 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            var eventHandler = self[ev.type];
            if (typeof eventHandler === 'function') {
                eventHandler.call(self, ev);
            }
        };

        Object.defineProperty(this, 'ready', {
            get: function() {
                return this.images.length >= 2;
            }
        });

        Object.defineProperty(this, 'width', {
            get: function() {
                return width;
            }
        });

        Object.defineProperty(this, 'height', {
            get: function() {
                return height;
            }
        });

        Object.defineProperty(this, 'divide', {
            get: function() {
                return divide;
            },
            set: function(value) {
                if (value > 1) {
                    value = (value / 100);
                }

                divide = value;
                this.draw();
            }
        });

        // Draw canvas into its container
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        container.insertBefore(canvas, container.childNodes[1]);

        // Event handlers
        canvas.addEventListener('mousemove', handler, false);
        canvas.addEventListener('mousedown', handler, false);
        canvas.addEventListener('mouseup', handler, false);
    };

    ImageDiff.prototype.add = function(src) {
        var onload = function() {
            this.images.push(img);

            if (this.ready) {
                this.draw();
            }
        };

        var img = createImage(src, onload.bind(this));
    };

    ImageDiff.prototype.setNewWidth = function(width) {
        this.resp = this.width / width;
        this.draw();
    };

    ImageDiff.prototype.draw = function() {
        if (!this.ready) {
            return;
        }

        var lastIndex = this.images.length - 1,
            before = this.images[lastIndex - 1],
            after = this.images[lastIndex];

        this.drawImages(this.ctx, before, after);
        this.drawHandle(this.ctx);
    };

    ImageDiff.prototype.drawImages = function(ctx, before, after) {
        var split = this.divide * this.width * this.resp;

        ctx.drawImage(after, 0, 0);
        ctx.drawImage(before, 0, 0, split, this.height, 0, 0, split, this.height);
    };

    ImageDiff.prototype.drawHandle = function(ctx) {
        var split = this.divide * this.width * this.resp;

        ctx.fillStyle = 'rgb(220, 50, 50)';
        ctx.fillRect(split - 1, 0, 2, this.height);
    };

    ImageDiff.prototype.mousedown = function(event) {
        var divide = event._x / this.width;
        this.divide = divide;

        this.dragstart = true;
    };

    ImageDiff.prototype.mousemove = function(event) {
        if (this.dragstart === true) {
            var divide = event._x / this.width;
            this.divide = divide;
        }
    };

    ImageDiff.prototype.mouseup = function(event) {
        var divide = event._x / this.width;
        this.divide = divide;

        this.dragstart = false;
    };

    function createImage(src, onload) {
        var img = document.createElement('img');
        img.src = src;

        if (typeof onload === 'function') {
            img.addEventListener('load', onload);
        }

        return img;
    }

    return {
        restrict: 'E',
        scope: {
            diff: '=',
            project: '='
        },
        link: function($scope, element) {

            $scope.toggleDiff = 0;

            $scope.$watchCollection('[diff,project]', function(params) {
                $scope.diffImg = params[0];
                $scope.diffID = $scope.diffImg;
                $scope.project = params[1];

                element.attr('id', $scope.diffID);

                element.find('img').load(function() {
                    var imageDiffs = new ImageDiff($scope.diffID, this.width, this.height);
                    imageDiffs.add('/api/repositories/' + $scope.project + '/' + $scope.diffImg.replace('diff', 'baseline'));
                    imageDiffs.add('/api/repositories/' + $scope.project + '/' + $scope.diffImg.replace('diff', 'regression'));
                    imageDiffs.setNewWidth($(this).parent().width());
                    $(this).off('load');
                });

            });

            $scope.confirmChange = function() {

                $http({
                    method: 'POST',
                    url: '/api/repositories/confirm',
                    data: {
                        project: $scope.project,
                        file: $scope.diff.replace(/diff/,'new')
                    }
                }).success(function() {
                    element.parents('.panel:eq(0)').toggleClass('shots').toggleClass('diffs');
                    element.find('img').attr('src', '/api/repositories/' + $scope.project + '/' + $scope.diffImg.replace('diff', 'baseline'));
                    element.find('canvas, .toggleDiff').remove();
                    $scope.toggleDiff = 1;
                });

            };

        },
        templateUrl: '/directives/imageDiff.html'
    };
});
