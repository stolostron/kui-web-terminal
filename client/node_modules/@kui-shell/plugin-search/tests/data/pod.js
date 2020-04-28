"use strict";
/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

const pod = {
  apiVersion: "v1",
  kind: "Pod",
  name: "nginx",
  namespace: "kube-system",
  cluster: 'local-cluster',
  selfLink: '/api/v1/namespaces/kube-system/pods/nginx',
  container: ['fake-container'],
  metadata: {
    name: "nginx",
    namespace: "kube-system",
    labels: {
      name: "nginx"
    }
  },
  spec: {
    containers: [
      {
        name: "nginx",
        image: "nginx",
        ports: [
          {
            "containerPort": 80
          }
        ]
      }
    ]
  }
}

const data = {
  items: [
    {
        "kind": "pod",
        "name": "search-search-collector-768b94548b-w5pg5",
        "namespace": "kube-system",
        "label": "app=ibm-search-prod; chart=ibm-search-prod-99.99.99; component=search-collector; heritage=Tiller; pod-template-hash=768b94548b; release=search",
        "cluster": "local-cluster",
        "created": "2019-09-17T18:13:28Z",
        "container": "collector",
        "selfLink": "/api/v1/namespaces/kube-system/pods/search-search-collector-768b94548b-w5pg5",
        "status": "Running",
        "startedAt": "2019-09-17T18:13:28Z",
        "restarts": 34,
        "image": "hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/ibmcom-amd64/search-collector:latest",
        "podIP": "1.1.1.1",
        "hostIP": "1.1.1.1"
    },
    {
        "kind": "pod",
        "name": "internal-management-ingress-dnj88",
        "namespace": "kube-system",
        "label": "app=internal-management-ingress; chart=icp-management-ingress; component=internal-management-ingress; controller-revision-hash=dffff58f9; heritage=Tiller; k8s-app=internal-management-ingress; pod-template-generation=1; release=internal-management-ingress",
        "cluster": "local-cluster",
        "created": "2019-09-17T18:00:29Z",
        "container": "icp-management-ingress",
        "selfLink": "/api/v1/namespaces/kube-system/pods/internal-management-ingress-dnj88",
        "status": "Running",
        "startedAt": "2019-09-17T18:00:29Z",
        "restarts": 0,
        "image": "hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/ibmcom-amd64/icp-management-ingress:latest",
        "podIP": "1.1.1.1",
        "hostIP": "1.1.1.1"
    },
    {
        "kind": "pod",
        "name": "k8s-kmsplugin-1.1.1.1",
        "namespace": "kube-system",
        "cluster": "local-cluster",
        "created": "2019-09-17T17:51:09Z",
        "container": "kms-plugin",
        "selfLink": "/api/v1/namespaces/kube-system/pods/k8s-kmsplugin-1.1.1.1",
        "status": "Running",
        "startedAt": "2019-09-17T17:49:08Z",
        "restarts": 0,
        "image": "hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/ibmcom-amd64/kmsplugin:latest",
        "podIP": "1.1.1.1",
        "hostIP": "1.1.1.1"
    },
    {
        "kind": "pod",
        "name": "icp-memcached-5bd5ddbd86-9ckrj",
        "namespace": "kube-system",
        "label": "app=icp-memcached; chart=system-healthcheck-service-99.99.99; pod-template-hash=5bd5ddbd86; release=system-healthcheck-service",
        "cluster": "local-cluster",
        "created": "2019-09-17T18:17:13Z",
        "container": "icp-memcached",
        "selfLink": "/api/v1/namespaces/kube-system/pods/icp-memcached-5bd5ddbd86-9ckrj",
        "status": "Running",
        "startedAt": "2019-09-17T18:17:13Z",
        "restarts": 0,
        "image": "hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/ibmcom-amd64/icp-memcached:latest",
        "podIP": "1.1.1.1",
        "hostIP": "1.1.1.1"
    },
  ]
}

exports.pod = pod
exports.data = data
