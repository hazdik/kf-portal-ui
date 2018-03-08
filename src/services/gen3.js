import { setGen3Token } from 'services/ajax';
import ajax from 'services/ajax';
import { gen3ApiRoot } from 'common/injectGlobals';

// Default config options
const defaultOptions = {
  baseURL: gen3ApiRoot,
  headers: {
    'Content-Type': 'application/json',
  },
};

// All these services call out to a proxy service
//  The body of the request contains all details for the request that should be sent to the cavatica API
//  Documentation on the cavatica API: http://docs.cavatica.org/docs/the-api

/** getUser()
  Return object structure:
    {
      "certificates_uploaded": [], 
      "email": null, 
      "message": "", 
      "project_access": {
        "march-demo": [
          "read-storage"
        ], 
        "phs001138": [
          "read-storage"
        ], 
        "phs001228": [
          "read-storage"
        ]
      }, 
      "resources_granted": [], 
      "user_id": 58, 
      "username": "RAHULVERMA"
    }

  */
export const getUser = async (credentials) => {
  let accessToken = await getAccessToken(credentials);
  await setGen3Token(accessToken.data.access_token);
  return await ajax.get(gen3ApiRoot + "user/user");
};

/**
Should return array of billing groups with the form:
  {
      "id": "864ca119-0298-4e0b-83e2-36861d3a5ace",
      "href": "https://cavatica-api.sbgenomics.com/v2/billing/groups/864ca119-0298-4e0b-83e2-36861d3a5ace",
      "name": "Pilot Funds"
  }
*/

export const getAccessToken = async (credentials) => {
  let config = {
    "headers": {
      "Content-Type": "application/json"
    }
  };
  return await ajax.post(gen3ApiRoot + "user/credentials/cdis/access_token", credentials, config);
}
export const getBillingGroups = async () => {
  const { items } = await ajax.post(gen3ApiRoot, {
    path: '/billing/groups',
    method: 'GET',
  });
  return items;
};

/**
 * Return array of projects, each of the form:
    {
        "href": "https://cavatica-api.sbgenomics.com/v2/projects/username01/test-project",
        "id": "username01/test-project",
        "name": "test project"
    }
 */
export const getProjects = async () => {
  return await ajax.post(gen3ApiRoot, {
    path: '/projects',
    method: 'GET',
  });
};

/**
 * Returns details of created project, or error:
  {
    "href": "https://cavatica-api.sbgenomics.com/v2/projects/username01/test-project",
    "id": "username01/test-project",
    "name": "test project",
    "type": "v2",
    "description": "test description",
    "tags": [],
    "settings": {
        "locked": false,
        "controlled": false,
        "use_interruptible_instances": false
    },
    "billing_group": "864ca119-0298-4e0b-83e2-36861d3a5ace"
  }
 * 
 */
export const createProject = async ({ name, billing_group, description = '' }) => {
  return await ajax.post(gen3ApiRoot, {
    path: '/projects',
    method: 'GET',
    body: { name, billing_group, description },
  });
};

export const getFiles = async () => {
  return await ajax.post(gen3ApiRoot, {
    path: '/files',
    method: 'GET',
  });
};
