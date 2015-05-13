$(function () {
    var data = [];
    for(var i = 0; i < 1000; ++i)
        data.push([Math.random(), Math.random()]);
    $('#container').highcharts({
        chart: {
            type: 'scatter',
        },
        series: [{
            name: 'Female',
            color: 'red',
            data: data

        }]
    }, function (chart) {
        $('#btn_green').click(function () {
            chart.series[0].data.forEach(function (p) {
                p.update({
                    color: "green"
                }, false, false)
            });
            chart.redraw();
        });
    });
});