var api_url = '/api/';
var products = d3.map({
    'B2G': 'Firefox OS',
    'Firefox': 'Firefox Desktop',
    'FennecAndroid': 'Fennec Android',
    'MetroFirefox': 'Firefox Metro',
    'Thunderbird': 'Thunderbird',
    'SeaMonkey': 'SeaMonkey'
});


d3.json(api_url + 'CurrentVersions', function(payload) {
    var featured = {};
    d3.map(payload)
        .forEach(function(idx, release) {
            if (!release.featured) {
                return
            }
            if (!release.product in products) {
                return;
            }
            if (release.product in featured) {
                featured[release.product].push(release.version);
            } else {
                featured[release.product] = [release.version];
            }
        });

    var divs = d3.select('.container')
        .selectAll('div')
        .data(products.keys())
      .enter().append('div')
        .classed('product', true);

    divs.append('img')
        .attr('src', function(d) { return "/static/" + d + '.png'; });

    divs.append('div')
        .classed('supplemental-info', true)
        .append('ul')
        .selectAll('li')
        .data(function(d) {
            return featured[d].map(function(version) {
                return channelFromVersion(version.replace('.', '_', 'g'));
            });
        })
      .enter().append('li')
        .classed('sparklines', true)
        .text(function(d) { return d; });

    //crashesPerAdu(product, versions);
});

function crashesPerAdu(product, versions) {
    // FIXME hardcoded from_date
    var url = api_url + 'CrashesPerAdu/?product=' + product +
        '&from_date=2014-01-01&versions=' + versions.join('&versions=');
    d3.json(url, function(payload) {
        if (!payload) {
            console.log('payload is falsy');
            return;
        }
        var results = {};
        d3.map(payload.hits)
            .forEach(function(productVersion, data) {
                var version = productVersion.split(':')[1];
                version = version.replace('.', '_', 'g');
                var series = [];
                d3.map(data)
                    .forEach(function(date, raw) {
                        series.push(raw.crash_hadu);
                    });

                var channel = channelFromVersion(version);
                var color = '';
                if (channel == 'nightly') {
                    color = 'red';
                } else if (channel == 'aurora') {
                    color = 'orange';
                } else if (channel == 'beta') {
                    color = 'yellow';
                } else {
                    color = 'green';
                }

                /*
                d3.select('#sparkline-' + product + '-' + version)
                    .sparkline(
                        series,
                        {
                            lineColor: color,
                            fillColor: false,
                            disableInteraction: true
                        }
                    );
                */
        });
    });
}

function channelFromVersion(version) {
    if (version.indexOf('a1') != -1) {
        return 'nightly';
    }
    if (version.indexOf('a2') != -1) {
        return 'aurora';
    }
    if (version.indexOf('b') != -1) {
        return 'beta';
    }
    return 'release';
}
