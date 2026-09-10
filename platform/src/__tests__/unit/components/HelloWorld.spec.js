'use strict';

import { shallowMount } from '@vue/test-utils';
import HelloWorld from './../../../components/HelloWorld.vue';

//Simple Vue component testing
describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
