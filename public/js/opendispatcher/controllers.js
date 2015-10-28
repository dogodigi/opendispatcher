(function () {
  'use strict';
  /* Controllers */
  var app = angular.module('opendispatcher.controllers', []);
  app.value('searchprovider', 'google');
  // Clear browser cache (in development mode)
  //
  // http://stackoverflow.com/questions/14718826/angularjs-disable-partial-caching-on-dev-machine
  //app.run(function ($rootScope, $templateCache) {
  //  $rootScope.$on('$viewContentLoaded', function () {
  //    $templateCache.removeAll();
  //  });
  //});

  app.controller('HeaderController', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
  });
  app.controller('GeocoderController', function($scope, GoogleGeocoderFactory, NominatimGeocoderFactory, searchprovider) {
    $scope.selected = undefined;
    // Any function returning a promise object can be used to load values asynchronously

    $scope.getLocation = function(val) {
      switch (searchprovider) {
        case "nominatim":
          return NominatimGeocoderFactory.search({
            format: 'json',
            countrycodes: 'nl',
            addressdetails: 1,
            q: val
          })
          .$promise.then(function(response) {
            return response.map(function(item){
              return item.display_name;
            });
          });
        default:
          return GoogleGeocoderFactory.search({
            address: val,
            sensor: false
          })
          .$promise.then(function(response) {
            return response.results.map(function(item){
              return item.formatted_address;
            });
          });
      }
    };
  });
  app.controller('OrganizationsController',
    function ($scope, $state, organizations, OrganizationsFactory) {
      $scope.organizations = organizations;
      $scope.deleteOrganization = function (organization) {
        SiteFactory.delete(organization);
        $state.reload();
      };
    });
  app.controller('OrganizationController',
    function ($scope, $state, organization, leafletData) {
      if (organization) {
        $scope.organization = organization;
        if(organization.Region) {
          leafletData.getMap().then(function(map) {
            map.fitBounds(L.geoJson($scope.organization.Region.data).getBounds());
          });
        }
      }
      $scope.cancel = function () {
        $state.go('sites');
      };
    });

  app.controller('HazardsController',
      function ($scope, $state, hazards) {
        $scope.hazards = hazards;
      });

  app.controller('SitesController',
    function ($scope, $state, sites, SiteFactory, $filter) {
      var orderBy = $filter('orderBy');
      var filter = $filter('filter');
      $scope.sites = sites;
      $scope.filteredSites = sites;
      $scope.maxSize = 5;
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;
      $scope.reverse = false;
      $scope.allItems = $scope.sites.length;
      $scope.deleteSite = function (site) {
        SiteFactory.delete(site);
        $state.reload();
      };
      $scope.search = function(){
        $scope.filteredSites = filter(sites, $scope.searchText, 'search.$');
        $scope.totalItems = $scope.filteredSites.length;
      };
      $scope.order = function(predicate) {
        $scope.reverse = !$scope.reverse;
        $scope.sortType = predicate;
        $scope.filteredSites = orderBy($scope.filteredSites, predicate, $scope.reverse);
      };
      $scope.sites.$promise.then(function () {
        $scope.totalItems = $scope.sites.length;
        $scope.$watch('currentPage + itemsPerPage', function() {
          var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
          end = begin + $scope.itemsPerPage;
        });
      });
    });
  app.controller('SiteController',
    function ($scope, $state, $stateParams, SiteFactory, SitesFactory) {
      $scope.updateSite = function () {
        SiteFactory.update($scope.site);
        $state.go('sites');
      };
      $scope.cancel = function () {
        $state.go('sites');
      };
      $scope.updateAssistance = function (value){
        $scope.boolAssistanceClass = value;
        if($scope.site){
          $scope.site.assistance = value;
        }
      };
      $scope.addSite = function () {
        if(!$scope.site){
          $scope.site = {};
        }
        $scope.site.assistance = $scope.site.assistance || false;
        SitesFactory.create($scope.site);
        $state.go('sites');
      };
      // Make sure creating a New Site does not trigger show()
      if($stateParams.id){
        $scope.site = SiteFactory.show({ id: $stateParams.id });
      }
    });

  app.controller('SelectDateController', ['$scope',
    function ($scope) {
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
      $scope.minDate = new Date(2010, 1, 1); // $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);

    $scope.open = function($event) {
      $scope.status.opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.status = {
      opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
      [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];

    $scope.getDayClass = function(date, mode) {
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);

        for (var i=0;i<$scope.events.length;i++){
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    };
  }]);
}());
