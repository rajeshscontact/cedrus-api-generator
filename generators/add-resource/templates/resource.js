'use strict';

var url = require('url');


var <%= resourceName %> = require('./<%= resourceName %>Service');

<% httpMethods.forEach(function(method){-%>
<% if (method === 'delete') { -%>
module.exports.delete<%= resourceName %> = function delete<%= resourceName %> (req, res, next) {
    <%= resourceName %>.delete<%= resourceName %> (req.swagger.params, res, next);
};
<% } -%>
<% if (method === 'get') { -%>
module.exports.get<%= resourceName %> = function get<%= resourceName %> (req, res, next) {
    <%= resourceName %>.get<%= resourceName %> (req.swagger.params, res, next);
};
<% } -%>
<% if (method === 'patch') { -%>
module.exports.patch<%= resourceName %> = function patch<%= resourceName %> (req, res, next) {
    <%= resourceName %>.patch<%= resourceName %> (req.swagger.params, res, next);
};
<% } -%>
<% if (method === 'post') { -%>
module.exports.post<%= resourceName %> = function post<%= resourceName %> (req, res, next) {
    <%= resourceName %>.post<%= resourceName %> (req.swagger.params, res, next);
};
<% } -%>
<% if (method === 'put') { -%>
module.exports.put<%= resourceName %> = function put<%= resourceName %> (req, res, next) {
    <%= resourceName %>.put<%= resourceName %> (req.swagger.params, res, next);
};
<% } -%>

<%}) -%>
