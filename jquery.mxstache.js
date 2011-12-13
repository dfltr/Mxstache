;(function($) {
    $.mxstache = function(options) {
        var url = options.url,
            cache = $.mxstache.templateCache,
            complete = options.complete || function() {},
            curry = function(f) {
                return function() {
                    f.apply(window, $.makeArray(arguments));
                    complete.apply(window, $.makeArray(arguments));
                };
            },
            success = options.success ? curry(options.success) : function(){},
            error = options.error ? curry(options.error) : function(){},
            as = options.as || url,
            data = options.data || {},
            type = options.type || 'GET';

        //TODO: Limit cache at some point

        if(cache[as]) {
            //fire normal json request
            $.ajax({
                url: url + '.json',
                type: type,
                dataType: 'json',
                data: {},
                success: function(json) {
                    if(cache[as].partials) {
                        success(Mustache.to_html(cache[as].template, json, cache[as].partials));
                    } else {
                        success(Mustache.to_html(cache[as].template, json));
                    }
                },
                error: error
            });
        } else {
            //fire mxhr for tpl / json
            $.mxhr({
                url: url + '.mxhr',
                type: type,
                data: data,
                'text/x-mustache-template': function(data) {
                    data = $.parseJSON(data);

                    cache[as] = {
                        template: data.template
                    }

                    if(data.partials) {
                        cache[as].partials = data.partials;
                    }
                },
                'application/json': function(data) {
                    //TODO: Potential race condition if tpl is sent before view.
                    //...use end of mxhr to wrap it all together instead
                    if(cache[as].partials) {
                        success(Mustache.to_html(cache[as].template, $.parseJSON(data), cache[as].partials));
                    } else {
                        success(Mustache.to_html(cache[as].template, $.parseJSON(data)));
                    }
                },

                //TODO: MXHRs don't have error handling yet
                error: error
            });
        }
    };

    $.mxstache.templateCache = {};
})(jQuery);