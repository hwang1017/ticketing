import axios from 'axios';

// try to build an instance of 'axios', ->
// to handle the request from different side ->
// from 'a pod in the cluster' or from 'browser'.

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server(inside the cluster)

    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // we are on the browser

    return axios.create({ baseUrl: '/' });
  }
};

export default buildClient;
