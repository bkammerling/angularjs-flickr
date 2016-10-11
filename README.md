# AngularJS Flickr Gallery
A lightning fast flexbox gallery for displaying and filtering flickr images. Using $http.get to call to Flickr and pull images from any one of the extensive list of services on the [Flickr API](https://www.flickr.com/services/api/). The file jsonsave.php will then update the images.json file so we no longer need to make any calls to Flickr to display the images.

This is good for larger sets of files where more than 1 call is needed to download all the data. Flickr is not only free to use (up to 1TB) but also delivers the images very fast. Included in the components/ directory is the [DPZ Flickr API](https://github.com/dopiaza/DPZFlickr) kit for PHP that supports authentication using OAuth 1.0a. If you need to show your private images, this is how you could auth in without having to be redirected to Flickr/Yahoo to log in.

- [angular-bootstrap-lightbox](https://github.com/compact/angular-bootstrap-lightbox) is used for the modals on click.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) is used to create a blob of the images and download them, which seems is not yet possible with the 'download' html5 attribute on anything other than chrome.
