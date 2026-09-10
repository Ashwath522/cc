let company_id = null,
  application_id = null,
  app_details = null;

export const setCompany = (companyId) => {
  company_id = companyId;
};

export const getCompany = () => {
  return company_id;
};

export const setAppId = (appId) => (application_id = appId);
export const getAppId = () => application_id;

export const setAppDetails = (appDetails) => (app_details = appDetails);
export const getApplicationDetails = () => app_details;

export const getCompanyBasePath = (route) => {
  return `/company/${
    (route && route.params && route.params.company_id) || getCompany()
  }`;
};

export const getAppBasePath = (route) => {
  return `${getCompanyBasePath(route)}/application/${
    (route && route.params && route.params.application_id) || getAppId()
  }`;
};
