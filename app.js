'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['myApp.gallery'])

.service('imageService',['$q','$http', function($q,$http){
  
  this.loadImages = function(page){
     return $http.get("https://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos&page="+page+"&group_id=1648891@N24&extras=url_m,date_upload,original_format&per_page=500&api_key=9e3cb26cbc7631968506247dd74c6844&format=json")
     .then(function(data) {
        var response = data.data;
        response = response.replace('jsonFlickrApi(', '');
	      response = response.replace('})', '}');
        
        var photos = JSON.parse(response).photos;

        console.log(photos);
        return photos;
     }, function(data) {
        console.log('error', data);
        return data;
     });
    };

}])

.service('dataService',['$q','$http',function($q,$http){
  
  var dataService = {
    
    getData : function() {
      var deferred = $q.defer();
      $http.get("images.json")
      .then(function (response) {
          console.log('in getData success');
          deferred.resolve(response.data);
      }, function(response) {
          deferred.resolve(response.data);
          console.log('error');
      });
      return deferred.promise;
    },
    
    postData : function(data) {
      var deferred = $q.defer();
      $http.post("jsonsave.php", data)
      .then(function (response) {
        console.log('in postData success');
          deferred.resolve(response);
      });
      return deferred.promise;
    },
    
    saveImage : function(url,title) {
      var deferred = $q.defer();
      $http.get(url, { responseType:'blob' })
      .then(function(results){
          var data = results.data; 
          var blob = new Blob(
              [data],
              {type: "image/jpg"}
          );
          saveAs(blob, title+".jpg");
          deferred.resolve(results);
      });
      return deferred.promise
    }
    
  }
  
 
  
  return dataService;
    
}])




.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];

        var funCheckBounds = function(evt) {
            console.log("event fired: " + evt.type);
            var rectObject = raw.getBoundingClientRect();
            if (rectObject.bottom <= window.innerHeight) {
                scope.$apply(attr.whenScrolled);
            }

        };
        
        angular.element(window).bind('scroll load', funCheckBounds);
        
        
    };
})

.filter('startsWithLetter', function() {
  return function (items,letter) {
      var filtered = [];
      if (letter == "") {
        return items;
      } 
      for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (letter=='M' && item.title.lastIndexOf('M', 0)==0) {
            filtered.push(item);
          } else if (letter=='S' && item.title.lastIndexOf('M', 0)!=0) {
            filtered.push(item);
          } 
      }
      return filtered;
  };
})



.filter("multiWordFilter", function($filter){
    return function(inputArray, searchText){
        var wordArray = searchText ? searchText.toLowerCase().split(/\s+/) : [];
        var wordCount = wordArray.length;
        for(var i=0;i<wordCount;i++){
            inputArray = $filter('filter')(inputArray, wordArray[i]);
        }
        return inputArray;
    }
})


.filter("dateFilter", function() {
  return function(items, from, to) {
        var result = [];
        for (var i=0; i<items.length; i++){
            if (items[i].dateupload > from && items[i].dateupload < to)  {
              console.log(items[i].dateupload, from);
                result.push(items[i]);
            }
        }            
        return result;
  };
});
