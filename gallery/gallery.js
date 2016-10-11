'use strict';
 
angular.module('myApp.gallery', ['bootstrapLightbox','ui.bootstrap.tpls'])

 
// Gallery controller
.controller('GalleryCtrl', ['$scope', 'dataService', 'imageService', 'Lightbox', function($scope, dataService, imageService, Lightbox) {
    
    console.log('into  galleryctrl');
  
    var pics = [];
    
    $scope.pics = [];
    $scope.inProgress = false;
    $scope.filters = { 'tag': '', 'date': {'start':10000,'end':991461167799} };
    $scope.sort = { 'view': 'grid', 'by': 'dateupload', 'dir':true };
    $scope.numLimit = 50;
    
    function getData() {
        $scope.firstLoad = true;
        dataService.getData().then(function(data) {
            $scope.firstLoad = false;
            var currentImages = data;
            if (typeof(currentImages)!='string' && currentImages.length > 10 ) {
                pics = currentImages;
                $scope.pics = currentImages;
                console.log('got pics', pics.length)
            } else {
                pics = [];
                $scope.pics = [];
                console.log('it empty yall');
            }
            
            console.log(currentImages);
            
            var page = 1;
            imageService.loadImages().then(function(data){
                console.log(data);
                var flickrImages = data;
                var totalImages = parseInt(flickrImages.total);
                var maxPages = flickrImages.pages;
                if (pics.length < totalImages-300) {
                    console.log('more (or less) on flickr');
                    var currentPage = 0;
                    for(var i=1; i<=maxPages; i++){
                      console.log('calling to flickr page '+i);
                      pics=[];
                      imageService.loadImages(i).then(function(data){
                        $scope.inProgress = true;
                        currentPage++
                        pics = pics.concat(data.photo);
                        console.log(pics.length);
                        if (currentPage>=maxPages) var lastCall=true;
                        if (lastCall) {
                            console.log(lastCall, 'in last call');
                            $scope.inProgress = false;
                            console.log(arrayUnique(pics).length);
                            dataService.postData({ 'json' : JSON.stringify(arrayUnique(pics)) }).then(function(postData){console.log(postData)});
                            $scope.pics = arrayUnique(pics);
                        }
                      });
                    }
                }  else {
                  // we've got all the images
                  console.log($scope.pics);
                }
                pics = data.photo;
                dataService.postData({ 'json' : JSON.stringify(arrayUnique(pics)) })
                .then(function(postData){
                    console.log(postData)
                    $scope.pics = arrayUnique(pics);
                    console.log('scope.pics = ', $scope.pics);
                });
            });
        });
    }
    
    getData();
    
    $('button.btn-dr').daterangepicker({
        locale: {
          format: 'DD-MM-YYYY',
          cancelLabel: 'Clear'
        },
        minDate: '01-01-2015',
        maxDate: moment().add(1, 'days')
    }, 
    function(start, end, label) {
      $scope.filters.date.start = Math.round(new Date(start).getTime()/1000);
      $scope.filters.date.end = Math.round(new Date(end).getTime()/1000);
      console.log($scope.filters.date);
      $scope.pics = pics.filter(function (obj) {
        return obj.dateupload > $scope.filters.date.start && obj.dateupload < $scope.filters.date.end;
      });
      $scope.$apply();
    });
    
    $('button.btn-dr').on('cancel.daterangepicker', function(ev, picker) {
      //do something, like clearing an input
      $('button.btn-dr').data('daterangepicker').setStartDate(10000);
      $('button.btn-dr').data('daterangepicker').setEndDate(moment().add(1, 'days'));
      $scope.filters.date.start = 10000;
      $scope.filters.date.end = moment().add(1, 'days');
      $scope.pics = pics.filter(function (obj) {
        return true;
      });
      $scope.$apply();
    });
    
    $scope.increaseLimit = function() {
        $scope.numLimit = $scope.numLimit+10;
    }


    //apply filter based on tag
    $scope.filterSet  = function(tag){
        $scope.filters.tag = tag;
    }
    
    $scope.filterClear = function(){
        $scope.filters.tag = '';
    }
    
     // set grid or list view
    $scope.viewSet  = function(viewType){
        $scope.sort.view = viewType;
    }
    
    // apply sort 
    $scope.sortSet  = function(by){
        if ($scope.sort.by == by) {
            $scope.sort.dir = !$scope.sort.dir;
        } else {
          $scope.sort.by = by;
          by == 'title' ? $scope.sort.dir = false : $scope.sort.dir=true;
        }
    }
    
    $scope.reverse = function() {
        $scope.sort.dir = !$scope.sort.dir;
    }
    
    $scope.openLightboxModal = function (index) {
        $scope.singleImage = $scope.filtered[index];
        Lightbox.openModal($scope.filtered, index);
    };
    
    
    function arrayUnique(array) {
        var a = array.concat();
        //console.log('into arrayUnique', a)
        for(var i=0; i<a.length; ++i) {
          //console.log(a[i].id);
            for(var j=i+1; j<a.length; ++j) {
                if(a[i].id == a[j].id)
                    a.splice(j--, 1);
            }
        }
    
        return a;
    }
    
}])

.controller('ModalCtrl', function($scope, dataService) {
  
  $scope.downloading = false;
  
  $scope.downloadImage = function(url, title) {
    $scope.downloading = true;
    dataService.saveImage(url,title)
    .then(function(data) {
      console.log(data);
      $scope.downloading = false;
    });
  }
  
})

 
.config(function (LightboxProvider) {
  LightboxProvider.getImageUrl = function (pic) {
    return 'https://farm'+pic.farm+'.staticflickr.com/'+pic.server+'/'+pic.id+'_'+pic.secret+'_b.jpg';
  };

  LightboxProvider.getImageCaption = function (pic) {
    return pic.title;
  };
  
  // set a custom template
  LightboxProvider.templateUrl = 'gallery/modal.html';
  
  LightboxProvider.calculateModalDimensions = function (dimensions) {
    // 400px = arbitrary min width
    // 32px = 2 * (1px border of .modal-content
    //             + 15px padding of .modal-body)
    var width = Math.max(400, dimensions.imageDisplayWidth + 32);

    // 200px = arbitrary min height
    // 66px = 32px as above
    //        + 34px outer height of .lightbox-nav
    // BK: changed to 100 to allow for download button
    var height = Math.max(200, dimensions.imageDisplayHeight + 116);

    // first case:  the modal width cannot be larger than the window width
    //              20px = arbitrary value larger than the vertical scrollbar
    //                     width in order to avoid having a horizontal scrollbar
    // second case: Bootstrap modals are not centered below 768px
    if (width >= dimensions.windowWidth - 20 || dimensions.windowWidth < 768) {
      width = 'auto';
    }

    // the modal height cannot be larger than the window height
    if (height >= dimensions.windowHeight) {
      height = 'auto';
    }

    return {
      'width': width,
      'height': height
    };
  };
    
  LightboxProvider.calculateImageDimensionLimits = function (dimensions) {
      if (dimensions.windowWidth >= 768) {
        return {
          // 92px = 2 * (30px margin of .modal-dialog
          //             + 1px border of .modal-content
          //             + 15px padding of .modal-body)
          // with the goal of 30px side margins; however, the actual side margins
          // will be slightly less (at 22.5px) due to the vertical scrollbar
          'maxWidth': dimensions.windowWidth - 92,
          // 126px = 92px as above
          //         + 34px outer height of .lightbox-nav
          // BK: changed to 166 to allow for download button
          'maxHeight': dimensions.windowHeight - 176
        };
      } else {
        return {
          // 52px = 2 * (10px margin of .modal-dialog
          //             + 1px border of .modal-content
          //             + 15px padding of .modal-body)
          'maxWidth': dimensions.windowWidth - 52,
          // 86px = 52px as above
          //        + 34px outer height of .lightbox-nav
          'maxHeight': dimensions.windowHeight - 86
        };
      }
  };
  
});
