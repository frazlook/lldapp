﻿var express = require('express');
var flash = require('connect-flash');
var formatCurrency = require('format-currency');
var functions = require('../functions.js');
var rp = require('request-promise');

// Load the environment config
var environmentConfig = require('../environment.json');

var router = express.Router();

router.get('/', function (req, res, next) {
    if (req.session.memberData) {
        var options = {
            method: 'GET',
            uri: environmentConfig.ApiServer + '/gallery/' + req.query.galleryId,
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + req.session.memberData.Token
            },
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function (json) {
                // GET succeeded...
                var artworks = json["Artworks"];
                for (var i = 0; i < artworks.length; i++) {
                    if (artworks[i].Sellable) {
                        artworks[i].Price = formatCurrency(artworks[i].Price, { format: '%s%v', symbol: '$' });
                    }
                }
                res.render('art-galleryart', { title: 'Look Lateral Test Gallery Art', ApiServer: environmentConfig.ApiServer, MemberData: req.session.memberData, ErrorText: req.flash('error'), Artworks: artworks, Gallery: json });
            })
            .catch(function (err) {
                // GET failed...
                console.log(err);
                res.redirect(functions.redirectWithError(req, err.error.Error));
            });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;