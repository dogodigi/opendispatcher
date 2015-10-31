(function() {
  'use strict';
  angular
    .module('opendispatcher.controllers')
    .controller('SitesController', SitesController);

  function SitesController($scope, $state, sites, SiteFactory, $filter) {
    var orderBy = $filter('orderBy');
    var filter = $filter('filter');
    $scope.sites = sites;
    $scope.filteredSites = sites;
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.reverse = false;
    $scope.allItems = $scope.sites.length;
    $scope.deleteSite = function(site) {
      SiteFactory.delete(site);
      $state.reload();
    };
    $scope.search = function() {
      $scope.filteredSites = filter(sites, $scope.searchText, 'search.$');
      $scope.totalItems = $scope.filteredSites.length;
    };
    $scope.order = function(predicate) {
      $scope.reverse = !$scope.reverse;
      $scope.sortType = predicate;
      $scope.filteredSites = orderBy($scope.filteredSites, predicate, $scope.reverse);
    };
    $scope.sites.$promise.then(function() {
      $scope.totalItems = $scope.sites.length;
      $scope.$watch('currentPage + itemsPerPage', function() {
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
          end = begin + $scope.itemsPerPage;
      });
    });
  }
}());
