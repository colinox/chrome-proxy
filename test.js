;(function (ob) {
    ob.hookAjax = function (proxy) {
        window._ahrealxhr = window._ahrealxhr || XMLHttpRequest;
        XMLHttpRequest = function () {
            this.xhr = new window._ahrealxhr;
            for (var attr in this.xhr) {
                var type = "";
                try {
                    type = typeof this.xhr[attr]
                } catch (e) {};
                if (type === "function") {
                    this[attr] = hookfun(attr)
                } else {
                    Object.defineProperty(this, attr, {
                        get: getFactory(attr),
                        set: setFactory(attr)
                    })
                }
            }
        };

        function getFactory(attr) {
            return function () {
                var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
                var attrGetterHook = (proxy[attr] || {})["getter"];
                return attrGetterHook && attrGetterHook(v, this) || v
            }
        }

        function setFactory(attr) {
            return function (v) {
                var xhr = this.xhr;
                var that = this;
                var hook = proxy[attr];
                if (typeof hook === "function") {
                    xhr[attr] = function () {
                        proxy[attr](that) || v.apply(xhr, arguments)
                    }
                } else {
                    var attrSetterHook = (hook || {})["setter"];
                    v = attrSetterHook && attrSetterHook(v, that) || v;
                    try {
                        xhr[attr] = v
                    } catch (e) {
                        this[attr + "_"] = v
                    }
                }
            }
        };

        function hookfun(fun) {
            return function () {
                var args = [].slice.call(arguments);
                if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
                    return
                };
                return this.xhr[fun].apply(this.xhr, args)
            }
        }
        return window._ahrealxhr
    };
    ob.unHookAjax = function () {
        if (window._ahrealxhr) XMLHttpRequest = window._ahrealxhr;
        window._ahrealxhr = undefined
    }
})(window);
hookAjax({
    open: function (arg, xhr) {
        if (arg[1].indexOf("http") > -1 || arg[1].indexOf("//") > -1 ) {
            var url = arg[1].split("//");
            if (url[1].substring(0, 4) == "test") {
                var argUrl = url[1].split("sanjieke.cn");
                arg[1] = "http://api.524411.com" + argUrl[1];
            } else if (url[1].indexOf(": ") > -1) {
                if (arg[1].substring(0, 5) != " /json") {
                    var argUrl = arg[1].split(": ");
                    argUrl = argUrl[2].slice(4);
                    arg[1] = "http: //api.524411.com" + argUrl
                };
            } else if (arg[1].indexOf("sockjs-node") > -1 || arg[1].indexOf("hot-update") > -1) {
            } else {
                arg[1] = arg[1].replace(new RegExp("\/\/(.+?)\/"), "http://api.524411.com/");
            }
        } else {
            if (arg[1].indexOf("hot-update") > -1) {
                arg[1] = arg[1]
            } else if (arg[1].indexOf(".") > -1) {
                arg[1] = arg[1].replace(new RegExp("(.+?)\/"), "http://api.524411.com/");
            } else if (arg[1].substring(0, 5) != "/json") {
                arg[1] = "http://api.524411.com" + arg[1];
            }
        }
    }
});