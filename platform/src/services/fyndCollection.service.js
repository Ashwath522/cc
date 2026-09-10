import axios from 'axios';
import { url } from '../common/config';
import { getAppId } from '../helper/utils';

const baseApi = `${url.baseUrl}${url.baseApiUrl}`;

const searchCollections = (q) =>
  axios.get(
    `${baseApi}${url.appHome}/${getAppId()}/cms/collections/search`,
    {
      params: { q },
    },
  );

export { searchCollections };
