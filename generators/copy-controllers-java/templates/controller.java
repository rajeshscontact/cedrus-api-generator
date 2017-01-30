package <%= basePath %>.api;

import <%= basePath %>.model.<%= resourceName %>;
import io.swagger.annotations.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@javax.annotation.Generated(value = "<%= basePath %>.languages.SpringCodegen", date = "2017-01-25T13:29:39.620Z")

@Controller
public class <%= resourceName %>sApiController implements <%= resourceName %>sApi {
  <% httpMethods.forEach(function(method){-%>
    <% if (method === 'delete') { -%>
    public ResponseEntity<List<<%= resourceName %>>> delete<%= resourceName %>() {
        // do some magic!
        return new ResponseEntity<List<<%= resourceName %>>>(HttpStatus.OK);
    }
    <% } -%>
    <% if (method === 'patch') { -%>
    public ResponseEntity<List<<%= resourceName %>>> patch<%= resourceName %>() {
        // do some magic!
        return new ResponseEntity<List<<%= resourceName %>>>(HttpStatus.OK);
    }
    <% } -%>
    <% if (method === 'post') { -%>
    public ResponseEntity<List<<%= resourceName %>>> post<%= resourceName %>(@ApiParam(value = ""  ) @RequestBody <%= resourceName %> <%= resourceName %>) {
        // do some magic!
        return new ResponseEntity<List<<%= resourceName %>>>(HttpStatus.OK);
    }
    <% } -%>
    <% if (method === 'put') { -%>
    public ResponseEntity<List<<%= resourceName %>>> put<%= resourceName %>(@ApiParam(value = ""  ) @RequestBody <%= resourceName %> <%= resourceName %>) {
        // do some magic!
        return new ResponseEntity<List<<%= resourceName %>>>(HttpStatus.OK);
    }
    <% } -%>

    <% if (method === 'get') { -%>
    public ResponseEntity<List<<%= resourceName %>>> get<%= resourceName %>() {
    	List<<%= resourceName %>> <%= resourceName %>List = new ArrayList<<%= resourceName %>>();
      <% if (fakeData) { -%>
      	ObjectMapper mapper = new ObjectMapper();
      	try {
          InputStream inputStream = this.getClass().getResourceAsStream("/sampleData/<%= resourceName %>.json");
          <%= resourceName %>List = mapper.readValue(inputStream, TypeFactory.defaultInstance().constructCollectionType(List.class, <%= resourceName %>.class));
      		//<%= resourceName %>List = mapper.readValue(new File("/Users/rajeshlagisetty/Desktop/Cedrus/training/generators/01252017/sampleData/<%= resourceName %>.json"), TypeFactory.defaultInstance().constructCollectionType(List.class, <%= resourceName %>.class));
  		} catch (JsonParseException e) {
  			// TODO Auto-generated catch block
  			e.printStackTrace();
  		} catch (JsonMappingException e) {
  			// TODO Auto-generated catch block
  			e.printStackTrace();
  		} catch (IOException e) {
  			// TODO Auto-generated catch block
  			e.printStackTrace();
  		}
      <% } -%>
        // do some magic!
        return new ResponseEntity<List<<%= resourceName %>>>(<%= resourceName %>List, HttpStatus.OK);
    }
    <% } -%>
  <%}) -%>


}
