
dbkjs.bind_dbkjs_init_complete = function() {
    
    $(dbkjs).bind('dbkjs_init_complete', function() {
        FastClick.attach(document.body);
        (function() {
            var timer;
            function throttleCalc() {
                window.clearTimeout(timer);
                timer = window.setTimeout(calcMaxWidth, 150);
            }
            function calcMaxWidth() {
                // Calculate the max width for dbk title so other buttons are never pushed down when name is too long
                var maxWidth = $('body').outerWidth();
                $('.dbk-title').css('max-width', (maxWidth - 70) + 'px');
            }
            if(window.addEventListener) {
                // Listen for orientation changes
                window.addEventListener("orientationchange", function() {
                    calcMaxWidth();
                }, false);
                window.addEventListener("resize", function() {
                    throttleCalc();
                }, false);
            }
            calcMaxWidth();
        }());
    });
};
    