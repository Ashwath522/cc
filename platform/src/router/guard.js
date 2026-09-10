import { setCompany, setAppId } from '../helper/utils';

export const routeGuard = (to, from, next) => {
  const { params } = to;
  if (params.company_id) {
    setCompany(params.company_id);
  }
  next();
};

export const routeGuardApp = (to, from, next) => {
  const { params } = to;
  setCompany(params.company_id);
  setAppId(params.application_id);
  next();
};
