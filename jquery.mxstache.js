/* Copyright 2011 Micah Snyder <micah.snyder@gmail.com>. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY MICAH SNYDER "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

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