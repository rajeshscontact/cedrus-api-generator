'use strict';
<% if (fakeData) { -%>
var <%= resourceName %>FD = require('../sampleData/<%= resourceName %>.json')
var <%= resourceName %>Data = <%= resourceName %>FD;
<% } else { -%>
var <%= resourceName %>Data = {};
<%= resourceName %>Data = [{}];
<% } -%>
<% httpMethods.forEach(function(method){-%>
<% if (method === 'delete') { -%>
exports.delete<%= resourceName %> = function(args, res, next) {
    if (Object.keys(<%= resourceName %>Data).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}
<% } -%>
<% if (method === 'get') { -%>
exports.get<%= resourceName %> = function(args, res, next) {
    if (Object.keys(<%= resourceName %>Data).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<%= resourceName %>Data));
    } else {
        res.end();
    }
}
<% } -%>
<% if (method === 'patch') { -%>
exports.patch<%= resourceName %> = function(args, res, next) {
    if (Object.keys(<%= resourceName %>Data).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}
<% } -%>
<% if (method === 'post') { -%>
exports.post<%= resourceName %> = function(args, res, next) {
    if (Object.keys(<%= resourceName %>Data).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}
<% } -%>
<% if (method === 'put') { -%>
exports.put<%= resourceName %> = function(args, res, next) {
    if (Object.keys(<%= resourceName %>Data).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(<%= resourceName %>Data[Object.keys(<%= resourceName %>Data)[0]] || {}, null, 2));
    } else {
        res.end();
    }
}
<% } -%>
<%}) -%>
