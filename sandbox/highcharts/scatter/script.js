$(function () {
    $('#container').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Height Versus Weight of 507 Individuals by Gender'
        },
        subtitle: {
            text: 'Source: Heinz  2003'
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Height (cm)'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Weight (kg)'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} cm, {point.y} kg'
                }
            }
        },
        series: [{
            name: 'Female',
            color: 'rgba(223, 83, 83, .5)',
            data: [
                [161.2, 51.6],
                [167.5, 59.0],
                [159.5, 49.2],
                [157.0, 63.0],
                [155.8, 53.6],
                [170.0, 59.0]
            ]

        }]
    }, function (chart) {
        $('#btn_red').click(function () {
            // chart.series[0].data[2].update({color:"red"}, false, false);
            var d = chart.series[0].data;
            for (var i = 0, l = d.length; i < l; ++i)
                d[i].update({
                    color: "red"
                }, false, false);
            chart.redraw();
        });
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