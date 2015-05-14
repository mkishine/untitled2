$(function () {
    var data = [];
    for(var i = 0; i < 10000; ++i)
        data.push([Math.random(), Math.random()]);
    $('#container').highcharts({
        chart: {
            type: 'scatter',
        },
        plotOptions: {
            scatter: {
                animation: false,
                turboThreshold: 0
            }
        },
        series: [{
            name: 'Female',
            color: 'red',
            data: data

        }]
    }, function (chart) {
        $('#btn_green').click(function () {
            chart.showLoading("Hello");
            window.setTimeout(function(){
                chart.series[0].data.forEach(function (p) {
                    p.update({
                        color: "green"
                    }, false, false)
                });
                chart.redraw();
                chart.hideLoading();
            }, 100);
        });
    });
});