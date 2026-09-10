'use strict';

import { shallowMount, createLocalVue } from '@vue/test-utils';
import AboutPage from './../../../views/About.vue';
import MockAdapter from 'axios-mock-adapter';
import VueRouter from 'vue-router';
import URLS from './../../../services/endpoint.service';
import flushPromises from 'flush-promises';
import APPLICATION_MOCK_DATA from './../fixtures/application.json';
import { routeGuard } from './../../../router/guard';
import axios from 'axios';

let localVue;
const mock = new MockAdapter(axios);
let wrapper, router;
describe('AboutPage', () => {
  beforeEach(async () => {
    mock.reset();
    localVue = createLocalVue();
    localVue.use(VueRouter);
    mock.onGet(URLS.GET_ALL_APPLICATIONS()).reply((config) => {
      if (config.headers['x-company-id']) return [200, APPLICATION_MOCK_DATA];
      else return [400, { message: 'company id is missing' }];
    });
    router = new VueRouter({
      routes: [
        {
          path: '/company/:company_id/about',
          component: AboutPage,
          beforeEnter: routeGuard,
        },
      ],
    });
    router.push('/company/1/about');
    wrapper = shallowMount(AboutPage, {
      localVue,
      router,
    });
    await flushPromises();
  });
  it('click me', async () => {
    wrapper.vm.clickMe();
    await flushPromises();
    expect(wrapper.vm.applicationData.items.length).toBe(25);
  });
});
