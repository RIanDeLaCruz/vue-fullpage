(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fullpage = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * vue2.x fullpage
 */
function broadcast(children, eventName, params) {
    children && children.forEach(function (child) {
        var context = child.context;

        if (context) {
            context.$emit.apply(context, [eventName].concat(params));
        }

        broadcast(child.children, eventName, params);
    });
}

var Fullpage = function () {
    function Fullpage(el, options, vnode) {
        var _this = this;

        classCallCheck(this, Fullpage);

        var that = this;
        this.assignOpts(options);

        this.vnode = vnode;
        this.vm = vnode.context;
        this.curIndex = this.opts.start;

        this.startY = 0;
        this.opts.movingFlag = false;

        this.el = el;
        this.el.classList.add('fullpage-wp');

        this.parentEle = this.el.parentNode;
        this.parentEle.classList.add('fullpage-container');

        this.pageEles = this.el.children;
        this.total = this.pageEles.length;

        this.initScrollDirection();

        this.initEvent(el);

        window.setTimeout(function () {

            _this.resize();

            //如果是一页 则不移动 直接触发动画
            if (that.curIndex == 0) {
                that.toogleAnimate(that.curIndex);
            } else {
                that.moveTo(that.curIndex, false);
            }
        }, 0);
    }

    createClass(Fullpage, [{
        key: 'resize',
        value: function resize() {
            this.width = this.opts.width || this.el.offsetWidth;
            this.height = this.opts.height || this.el.offsetHeight;

            for (var i = 0; i < this.pageEles.length; i++) {
                var pageEle = this.pageEles[i];
                pageEle.setAttribute('data-id', i);
                pageEle.classList.add('page');
                //pageEle.style.width = this.width + 'px'
                pageEle.style.height = this.height + 'px';
            }
        }
    }, {
        key: 'setOptions',
        value: function setOptions(options) {
            this.assignOpts(options, this.opts);
        }
    }, {
        key: 'toogleAnimate',
        value: function toogleAnimate(curIndex) {
            broadcast(this.vnode.children, 'toogle.animate', curIndex);
        }
    }, {
        key: 'assignOpts',
        value: function assignOpts(opts, o) {
            o = o || Fullpage.defaultOptions;
            opts = opts || {};
            for (var key in opts) {
                if (opts.hasOwnProperty(key)) {
                    o[key] = opts[key];
                }
            }
            this.opts = o;
        }
    }, {
        key: 'initScrollDirection',
        value: function initScrollDirection() {
            if (this.opts.dir !== 'v') {
                this.el.classList.add('fullpage-wp-h');
            }
        }
    }, {
        key: 'initEvent',
        value: function initEvent(el) {
            var _this2 = this;

            var that = this;
            that.prevIndex = that.curIndex;

            if ("ontouchstart" in document) {
                document.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                    return false;
                }, false);

                /// touch ///
                el.addEventListener('touchstart', function (e) {
                    if (that.opts.movingFlag) {
                        return false;
                    }
                    that.startX = e.targetTouches[0].pageX;
                    that.startY = e.targetTouches[0].pageY;
                }, false);

                el.addEventListener('touchend', function (e) {
                    e.preventDefault();
                    if (that.opts.movingFlag) {
                        return false;
                    }

                    var preIndex = that.curIndex;
                    var dir = that.opts.dir;
                    var sub = dir === 'v' ? (e.changedTouches[0].pageY - that.startY) / that.height : (e.changedTouches[0].pageX - that.startX) / that.width;
                    var der = sub > that.opts.der ? -1 : sub < -that.opts.der ? 1 : 0;

                    var curIndex = der + that.curIndex;

                    that.moveTo(curIndex, true);
                }, false);
            } else {

                var isMousedown = false;
                addEventListener(el, 'mousedown', function (e) {
                    if (that.opts.movingFlag) {
                        return false;
                    }
                    isMousedown = true;
                    that.startX = e.pageX;
                    that.startY = e.pageY;
                });

                addEventListener(el, 'mouseup', function (e) {
                    isMousedown = false;
                });

                addEventListener(el, 'mousemove', function (e) {
                    e.preventDefault();
                    if (that.opts.movingFlag || !isMousedown) {
                        return false;
                    }
                    var preIndex = that.curIndex;
                    var dir = that.opts.dir;
                    var sub = dir === 'v' ? (e.pageY - that.startY) / that.height : (e.pageX - that.startX) / that.width;
                    var der = sub > that.opts.der ? -1 : sub < -that.opts.der ? 1 : 0;

                    var curIndex = der + that.curIndex;

                    that.moveTo(curIndex, true);
                });

                var debounceTimer = void 0,
                    interval = 1200,
                    debounce = true;

                // fixed firefox DOMMouseScroll closed #1.
                var mousewheelType = document.mozFullScreen !== undefined ? 'DOMMouseScroll' : 'mousewheel';

                addEventListener(el, mousewheelType, function (e) {
                    if (that.opts.movingFlag) {
                        return false;
                    }
                    if (!debounce) {
                        return;
                    }

                    debounce = false;
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(function () {
                        debounce = true;
                    }, interval);

                    var preIndex = that.curIndex;
                    var dir = that.opts.dir;

                    // 兼容 DOMMouseScroll event.detail 
                    if (!e.wheelDelta) {
                        e.deltaY = e.detail;
                        e.deltaX = e.detail;
                    }

                    var sub = dir === 'v' ? e.deltaY : e.deltaX;

                    var der = sub > 0 ? 1 : sub < 0 ? -1 : 0;

                    var curIndex = der + that.curIndex;

                    that.moveTo(curIndex, true);
                });
            }

            addEventListener(el, 'webkitTransitionEnd', function () {
                _this2.toogleAnimate(_this2.curIndex);
                _this2.opts.afterChange.call(_this2, _this2.pageEles[_this2.curIndex], _this2.curIndex);
                _this2.opts.movingFlag = false;
            });

            addEventListener(window, 'resize', function () {
                if (el.offsetHeight != that.height) {
                    _this2.resize();
                }
            });
        }
    }, {
        key: 'move',
        value: function move(dist) {
            var xPx = '0px',
                yPx = '0px';
            if (this.opts.dir === 'v') {
                yPx = dist + 'px';
            } else {
                xPx = dist + 'px';
            }
            this.el.style.cssText += ';-webkit-transform : translate3d(' + xPx + ', ' + yPx + ', 0px);' + 'transform : translate3d(' + xPx + ', ' + yPx + ', 0px);';
        }
    }, {
        key: 'moveTo',
        value: function moveTo(curIndex, anim) {
            var _this3 = this;

            var that = this;
            if (Math.min(Math.max(curIndex, 0), that.total) == that.curIndex) {
                return;
            }
            if (!(curIndex >= 0 && curIndex < that.total)) {
                if (!!that.opts.loop) {
                    curIndex = that.curIndex = curIndex < 0 ? that.total - 1 : 0;
                } else {
                    that.curIndex = curIndex < 0 ? 0 : that.total - 1;
                    return;
                }
            }

            //beforeChange 返回false取消本次的滑动
            var flag = that.opts.beforeChange.call(that, that.pageEles[this.curIndex], this.curIndex, curIndex);
            if (flag === false) {
                return false;
            }

            var dist = that.opts.dir === 'v' ? curIndex * -that.height : curIndex * -that.width;
            this.curIndex = curIndex;

            that.opts.movingFlag = true;
            if (anim) {
                that.el.classList.add('anim');
            } else {
                that.el.classList.remove('anim');
            }

            that.move(dist);

            var afterChange = function afterChange() {
                that.opts.afterChange.call(that, that.pageEles[_this3.curIndex], _this3.curIndex, curIndex);
                that.opts.movingFlag = false;
            };

            // window.setTimeout(() => {
            //     this.toogleAnimate(curIndex)
            //     if (!anim) {
            //         afterChange();
            //     }
            // }, that.opts.duration)
        }
    }, {
        key: 'movePrev',
        value: function movePrev() {
            this.moveTo(this.curIndex - 1, true);
        }
    }, {
        key: 'moveNext',
        value: function moveNext() {
            this.moveTo(this.curIndex + 1, true);
        }
    }, {
        key: 'update',
        value: function update() {
            this.pageEles = this.el.children;
            this.total = this.pageEles.length;
            this.resize();
        }
    }, {
        key: 'destroy',
        value: function destroy() {}
    }]);
    return Fullpage;
}();

function addEventListener(el, eventName, callback, isBubble) {
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, !!isBubble);
    } else {
        el.attachEvent('on' + eventName, callback, !!isBubble);
    }
}

Fullpage.defaultOptions = {
    start: 0,
    duration: 500,
    loop: false,
    dir: 'v',
    der: 0.1,
    movingFlag: false,
    beforeChange: noop,
    afterChange: noop
};

function noop() {}

var Animate = function () {
	function Animate(el, binding, vnode) {
		classCallCheck(this, Animate);

		var that = this,
		    vm = vnode.context,
		    aminate = binding.value;

		el.style.opacity = '0';
		vm.$on('toogle.animate', function (curIndex) {
			var curPage = +el.parentNode.getAttribute('data-id');
			if (curIndex === curPage) {
				that.addAnimated(el, aminate);
			} else {
				el.style.opacity = '0';
				that.removeAnimated(el, aminate);
			}
		});
	}

	createClass(Animate, [{
		key: 'addAnimated',
		value: function addAnimated(el, animate) {
			var delay = animate.delay || 0;
			el.classList.add('animated');
			window.setTimeout(function () {
				el.style.opacity = '1';
				el.classList.add(animate.value);
			}, delay);
		}
	}, {
		key: 'removeAnimated',
		value: function removeAnimated(el, animate) {
			var cls = el.getAttribute('class');
			if (cls && cls.indexOf('animated') > -1) {
				el.classList.remove(animate.value);
			}
		}
	}]);
	return Animate;
}();

var fullpage = {
	install: function install(Vue, options) {
		Vue.directive('fullpage', {
			inserted: function inserted(el, binding, vnode) {
				var opts = binding.value || {};

				el.$fullpage = new Fullpage(el, opts, vnode);

				el.$fullpage.$update = function () {
					Vue.nextTick(function () {
						el.$fullpage.update();
					});
				};
			},
			componentUpdated: function componentUpdated(el, binding, vnode) {

				var opts = binding.value || {};
				var that = el.$fullpage;
				that.setOptions(opts);
			}
		});

		Vue.directive('animate', {
			inserted: function inserted(el, binding, vnode) {
				var opts = binding || {};
				el.$animate = new Animate(el, opts, vnode);
			}
		});
	}
};

if (window.Vue) {
	window.VueFullpage = fullpage;
	Vue.use(fullpage);
}

return fullpage;

})));
