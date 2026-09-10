import axios from 'axios';
import { url } from '../common/config';
import { getAppId } from '../helper/utils';

const baseApi = `${url.baseUrl}${url.baseApiUrl}`;

const searchProducts = (q) =>
  axios.get(
    `${baseApi}${url.appHome}/${getAppId()}/cms/products/search`,
    {
      params: { q },
    },
  );

export { searchProducts };
