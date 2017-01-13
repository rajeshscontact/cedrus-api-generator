'use strict';
<% apiPaths.forEach(function (apiPath){ -%>
  <% var fakeData = apiPath.requireFakeData, httpMethods = apiPath.HTTPMethods, resourceName = (apiPath.resourceName).charAt(0).toUpperCase() + (apiPath.resourceName).slice(1); -%>
  <% if (fakeData) { -%>
  var <%= resourceName %>FD = require('./<%= resourceName %>.json')
  var <%= resourceName %>Data = <%= resourceName %>FD;
  <% } else { -%>
  var <%= resourceName %>Data = {};
  <%= resourceName %>Data = [{}];
  <% } -%>
  <% httpMethods.forEach(function(method){-%>
  <% if (method === 'delete') { -%>
  exports.delete<%= resourceName %> = function(event, cb) {
      var index = <%= resourceName %>Data.indexOf(event.body);
      if (index > -1) {
          <%= resourceName %>Data.splice(index, 1);
          cb(null, 'Item deleted successfully');
      }else{
        cb(null, 'Item does not exist');
      }
  }
  <% } -%>
  <% if (method === 'get') { -%>
  exports.get<%= resourceName %> = function(event, cb) {
    cb(null, <%= resourceName %>Data);
  }
  <% } -%>
  <% if (method === 'patch') { -%>
  exports.patch<%= resourceName %> = function(event, cb) {
      <%= resourceName %>Data.push(event.body);
      cb(null, 'Item patched successfully');
  }
  <% } -%>
  <% if (method === 'post') { -%>
  exports.post<%= resourceName %> = function(event, cb) {
      <%= resourceName %>Data.push(event.body);
      cb(null, 'Item inserted successfully');
  }
  <% } -%>
  <% if (method === 'put') { -%>
  exports.put<%= resourceName %> = function(event, cb) {
      <%= resourceName %>Data.push(event.body);
      cb(null, 'Item inserted successfully');
  }
  <% } -%>
  <%}) -%>
<% }) -%>
