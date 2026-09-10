import Vue from 'vue';
import VueRouter from 'vue-router';
import { routeGuard, routeGuardApp } from './guard';
Vue.use(VueRouter);

const routes = [
  {
    path: '/company/:company_id/',
    name: 'CompanyHome',
    beforeEnter: routeGuard,
    component: () => import('../views/CompanyHome.vue'),
  },
  {
    name: 'CmsDefinitions',
    path: `/company/:company_id/application/:application_id/cms/definitions`,
    component: () => import('../views/CmsDefinitions.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'CmsDefinitionCreate',
    path: `/company/:company_id/application/:application_id/cms/definitions/new`,
    component: () => import('../views/CmsDefinitionCreate.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'CmsDefinitionEdit',
    path: `/company/:company_id/application/:application_id/cms/definitions/:definition_id/edit`,
    component: () => import('../views/CmsDefinitionCreate.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'CmsObjects',
    path: `/company/:company_id/application/:application_id/cms/:slug`,
    component: () => import('../views/CmsObjects.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'CmsObjectCreate',
    path: `/company/:company_id/application/:application_id/cms/:slug/new`,
    component: () => import('../views/CmsObjectCreate.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'CmsObjectEdit',
    path: `/company/:company_id/application/:application_id/cms/:slug/:object_id/edit`,
    component: () => import('../views/CmsObjectEdit.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'AiContentJobs',
    path: `/company/:company_id/application/:application_id/ai-content/jobs`,
    component: () => import('../views/AiContentJobs.vue'),
    beforeEnter: routeGuardApp,
  },
  {
    name: 'AiContentReview',
    path: `/company/:company_id/application/:application_id/ai-content/jobs/:job_id/review`,
    component: () => import('../views/AiContentReview.vue'),
    beforeEnter: routeGuardApp,
  },
];


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
