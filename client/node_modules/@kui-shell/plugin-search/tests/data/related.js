"use strict";
/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

const data = {
  count: 1,
  items: [
    {
      cluster: "local-cluster",
      container: "icp-memcached",
      created: "2019-09-17T18:17:13Z",
      hostIP: "1.1.1.1",
      image: "hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/ibmcom-amd64/icp-memcached:latest",
      kind: "pod",
      label: "app=icp-memcached; chart=system-healthcheck-service-99.99.99; pod-template-hash=5bd5ddbd86; release=system-healthcheck-service",
      name: "icp-memcached-5bd5ddbd86-9ckrj",
      namespace: "kube-system",
      podIP: "1.1.1.1",
      restarts: 0,
      selfLink: "/api/v1/namespaces/kube-system/pods/icp-memcached-5bd5ddbd86-9ckrj",
      startedAt: "2019-09-17T18:17:13Z",
      status: "Running"
    }
  ],
  related: [
    {
      count: 1,
      items: [
        {
          cluster: "local-cluster",
          created: "2019-09-17T17:49:01Z",
          kind: "secret",
          name: "default-token-f92vd",
          namespace: "kube-system",
          selfLink: "/api/v1/namespaces/kube-system/secrets/default-token-f92vd"
        }
      ],
      kind: "secret"
    },
    {
      count: 1,
      items: [
        {
          architecture: "amd64",
          cluster: "local-cluster",
          cpu: 8,
          created: "2019-09-17T17:48:58Z",
          kind: "node",
          label: "beta.kubernetes.io/arch=amd64; beta.kubernetes.io/os=linux; etcd=true; kubernetes.io/hostname=1.1.1.1; management=true; master=true; node-role.kubernetes.io/etcd=true; node-role.kubernetes.io/management=true; node-role.kubernetes.io/master=true; node-role.kubernetes.io/proxy=true; node-role.kubernetes.io/va=true; proxy=true; role=master; va=true",
          name: "1.1.1.1",
          osImage: "Ubuntu 18.04.3 LTS",
          role: "etcd, management, master, proxy, va",
          selfLink: "/api/v1/nodes/1.1.1.1"
        }
      ],
      kind: "node"
    },
    {
      count: 1,
      items: [
        {
          chartName: "system-healthcheck-service",
          chartVersion: "99.99.99",
          cluster: "local-cluster",
          kind: "release",
          name: "system-healthcheck-service",
          namespace: "kube-system",
          revision: 1,
          status: "DEPLOYED",
          updated: "2019-09-17T18:17:12Z"
        }
      ],
      kind: "release"
    },
    {
      count: 1,
      items: [
        {
          kind: "cluster",
          name: "local-cluster"
        }
      ],
      kind: "cluster"
    },
    {
      count: 1,
       items: [
        {
          cluster: "local-cluster",
          clusterIP: "None",
          created: "2019-09-17T18:17:12Z",
          kind: "service",
          label: "app=icp-memcached; chart=system-healthcheck-service-99.99.99; heritage=Tiller; release=system-healthcheck-service",
          name: "memcached",
          namespace: "kube-system",
          port: "11211/TCP",
          selfLink: "/api/v1/namespaces/kube-system/services/memcached",
          type: "ClusterIP"
        }
      ],
      kind: "service"
    },
    {
      count: 1,
      items: [
        {
          apigroup: "apps",
          available: 1,
          cluster: "local-cluster",
          created: "2019-09-17T18:17:12Z",
          current: 1,
          desired: 1,
          kind: "deployment",
          label: "app=icp-memcached; chart=system-healthcheck-service-99.99.99; heritage=Tiller; release=system-healthcheck-service",
          name: "icp-memcached",
          namespace: "kube-system",
          ready: 1,
          selfLink: "/apis/extensions/v1beta1/namespaces/kube-system/deployments/icp-memcached"
        }
      ],
      kind: "deployment"
    },
    {
      count: 1,
      items: [
        {
          apigroup: "apps",
          cluster: "local-cluster",
          created: "2019-09-17T18:17:13Z",
          current: 1,
          desired: 1,
          kind: "replicaset",
          label: "app=icp-memcached; chart=system-healthcheck-service-99.99.99; pod-template-hash=5bd5ddbd86; release=system-healthcheck-service",
          name: "icp-memcached-5bd5ddbd86",
          namespace: "kube-system",
          selfLink: "/apis/extensions/v1beta1/namespaces/kube-system/replicasets/icp-memcached-5bd5ddbd86"
        }
      ],
      kind: "replicaset"
    }
  ]
}
const yaml = {
  apiVersion: "v1",
  kind: "Pod",
  metadata: {
    annotations: {
      "kubernetes.io/psp": "ibm-privileged-psp",
      "scheduler.alpha.kubernetes.io/critical-pod": "",
      "seccomp.security.alpha.kubernetes.io/pod": "docker/default"
    },
    creationTimestamp: "2019-09-17T18:17:13Z",
    generateName: "icp-memcached-5bd5ddbd86-",
    labels: {
      app: "icp-memcached",
      chart: "system-healthcheck-service-99.99.99",
      "pod-template-hash": "5bd5ddbd86",
      release: "system-healthcheck-service"
    },
    name: "icp-memcached-5bd5ddbd86-9ckrj",
    namespace: "kube-system",
    ownerReferences: [
      {
        apiVersion: "apps/v1",
        blockOwnerDeletion: true,
        controller: true,
        kind: "ReplicaSet",
        name: "icp-memcached-5bd5ddbd86",
        uid: "5f09922d-d977-11e9-b79c-0016ac102c33"
      }
    ],
    resourceVersion: "6741",
    selfLink: "/api/v1/namespaces/kube-system/pods/icp-memcached-5bd5ddbd86-9ckrj",
    uid: "5f148b11-d977-11e9-b79c-0016ac102c33"
  },
}

exports.data = data
exports.yaml = yaml
