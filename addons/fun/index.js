var sq  = require('../../sqlt.js');
var ECT = require('ect');
var ect;

exports.init = function(a,c,home) {
	ect = ECT({ root: home + '/views', watch: true });
	// ...
	return true;
};

var render = 
exports.render = function(req, res, template, data) {
	console.log( 'render()', template, data );
	if (!ect) console.log( 'no ect' );
	var html = ect.render(template, data);
	console.log( 'generated: ' + html );
	res.send( html );
};

exports.setup = function (a,c,home) {
	//
};


// there is:
//  - the SQL template
//  - a list of parameters
//  - each parameter may have a type and may have a value.
//  - if a parameter has no value,   
//

var sqlt = {};

sqlt.get_file = {
	sqlt: 'select * from file where file_id= {id}',
	params: { id: 'string' },
};

sqlt.average_response_time = {
	sqlt: 
'select req_url_path, sum(resp_t_app) as sum_app_time, count(*) as count, \
  sum(resp_t_app) / count(*) as average from requests \
  where req_time between {start} and {end} \
  group by req_url_path having count(*) > {count} \
order by sum_app_time desc',
	params: { start: 'date', end: 'date', count: 'int' },
};

function create_sqlt_feature( sqlt ) {
	return function( req, res, n ) {
		sq.run_sqlt( sqlt, req, res, n );
	};
}


function _do (req, res, next) {
	req.dbconnection.query( 'select count(*) from product', [], 
		function(err,result) { res.json(result); } 
	);
//	res.send('do this & that');
}

var features = 
exports.features = {
	'do': _do,
	'show': function(req,res,n) { 
		console.log( 'show()' );
		render(req, res, 'show', {hello:'dolly'}); 
	},
};

for (var i in sqlt) {
	var s = sqlt[i];
	features[i] = create_sqlt_feature( s );
}


