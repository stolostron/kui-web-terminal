"use strict";
/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

const configmap = {
  count: 1,
  items: [
    {
      cluster: "local-cluster",
      created: "2019-09-17T18:16:50Z",
      kind: "configmap",
      label: "app=audit-logging-fluentd; chart=audit-logging-99.99.99; component=fluentd; heritage=Tiller; release=audit-logging",
      name: "audit-logging-fluentd-ds-elk-config",
      namespace: "kube-system",
      selfLink: "/api/v1/namespaces/kube-system/configmaps/audit-logging-fluentd-ds-elk-config",
    }
  ],
  related:[
    {
      count: 1,
      items: [
        {
          chartName: "audit-logging",
          chartVersion: "99.99.99",
          cluster: "local-cluster",
          kind: "release",
          name: "audit-logging",
          namespace: "kube-system",
          revision: 1,
          status: "DEPLOYED",
          updated: "2019-09-17T18:16:50Z",
        }
      ],
      kind: "release",
    }
  ],
}

exports.configmap = configmap
