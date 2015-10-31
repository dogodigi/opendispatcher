angular.module('opendispatcher.controllers', []);
angular.module('opendispatcher.factories', []);
angular.module('opendispatcher.services', []);
angular.module('opendispatcher', [
    'ngAnimate',
    'ui.router',
    'ngResource',
    'ui.bootstrap',
    'leaflet-directive',
    'ncy-angular-breadcrumb',
    'angular.filter',
    'angularRangeSlider',
    'jm.i18next',
    'opendispatcher.controllers',
    'opendispatcher.factories',
    'opendispatcher.services'
  ])
  .config(function($i18nextProvider) {
    $i18nextProvider.options = {
      fallbackLng: 'en', // Default is dev
      detectLngQS: 'l',
      useCookie: false,
      resGetPath: '/locales/__lng__/__ns__.json'
    };
  })
  .config(function($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
      prefixStateName: 'home'
    });
  })
  .config(function($stateProvider) {
    $stateProvider
      .state('home', {
        ncyBreadcrumb: {
          label: 'Home'
        }
      })
      .state('sites', {
        url: '/sites',
        templateUrl: '/templates/manager/sites',
        resolve: {
          SitesFactory: 'SitesFactory',
          sites: function(SitesFactory) {
            return SitesFactory.query().$promise;
          }
        },
        controller: 'SitesController',
        ncyBreadcrumb: {
          label: 'Sites'
        }
      })
      .state('hazards', {
        url: '/site/:id/hazards',
        templateUrl: '/templates/manager/hazards',
        resolve: {
          HazardsFactory: 'HazardsFactory',
          hazards: function(HazardsFactory) {
            return HazardsFactory.query({
              id: 1
            }).$promise;
          }
        },
        ncyBreadcrumb: {
          label: 'Hazards',
          parent: 'sites'
        },
        controller: 'HazardsController',
      })
      .state('editSite', {
        url: '/site/:id',
        templateUrl: '/templates/manager/site/edit',
        controller: 'SiteController',
        ncyBreadcrumb: {
          label: 'Edit Site',
          parent: 'sites'
        }
      })
      .state('newSite', {
        url: '/site/new',
        templateUrl: '/ang/site/new',
        controller: 'SiteController',
        ncyBreadcrumb: {
          label: 'New Site',
          parent: 'sites'
        }
      })
      .state('organizations', {
        // Force resource resolution
        // http://www.jvandemo.com/how-to-resolve-angularjs-resources-with-ui-router/
        url: '/organizations',
        templateUrl: '/templates/manager/organizations',
        resolve: {
          OrganizationsFactory: 'OrganizationsFactory',
          organizations: function(OrganizationsFactory) {
            return OrganizationsFactory.query().$promise;
          }
        },
        ncyBreadcrumb: {
          label: 'Organizations'
        },
        controller: 'OrganizationsController'
      })
      .state('editOrganization', {
        // Force resource resolution
        // http://www.jvandemo.com/how-to-resolve-angularjs-resources-with-ui-router/
        url: '/organization/:id',
        templateUrl: '/templates/manager/organization',
        resolve: {
          OrganizationFactory: 'OrganizationFactory',
          organization: function(OrganizationFactory, $stateParams) {
            return OrganizationFactory.query({
              id: $stateParams.id
            }).$promise;
          }
        },
        ncyBreadcrumb: {
          label: 'Edit Organization',
          parent: 'organizations'
        },
        controller: 'OrganizationController'
      })
      .state('newOrganization', {
        // Force resource resolution
        // http://www.jvandemo.com/how-to-resolve-angularjs-resources-with-ui-router/
        url: '/organization/new',
        templateUrl: '/templates/manager/organization',
        resolve: {
          OrganizationFactory: 'OrganizationFactory',
          organization: function(OrganizationFactory) {
            return {};
          }
        },
        ncyBreadcrumb: {
          label: 'New Organization',
          parent: 'organizations'
        },
        controller: 'OrganizationController'
      });
  });

// Clear browser cache (in development mode)
//
// http://stackoverflow.com/questions/14718826/angularjs-disable-partial-caching-on-dev-machine
//app.run(function ($rootScope, $templateCache) {
//  $rootScope.$on('$viewContentLoaded', function () {
//    $templateCache.removeAll();
//  });
//});
