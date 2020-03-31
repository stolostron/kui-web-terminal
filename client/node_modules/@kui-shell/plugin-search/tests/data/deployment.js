"use strict";
/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/

const deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  name: 'myapp',
  namespace: 'kube-system',
  cluster: 'local-cluster',
  selfLink: '/api/v1/namespaces/kube-system/deployment/myapp',
  metadata: {
    name: 'myapp',
    namespace: 'kube-system',
    labels: {
      app: 'drone-app'
    }
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels:{
        app: 'drone-app'
      }
    },
    template: {
      metadata: {
        labels: {
          app: 'drone-app'
        }
      },
        spec: {
        terminationGracePeriodSeconds: 0,        
        affinity: {
          podAntiAffinity: {
            requiredDuringSchedulingIgnoredDuringExecution: [
              {
                labelSelector: {
                  matchExpressions: [
                    {
                      key: 'app',
                      operator: 'In',
                      values: [
                        'drone-app'
                      ]
                    }
                  ]
                },
                topologyKey: 'kubernetes.io/hostname'
              }
            ]
          }
        },
        containers: [
          {
            name: 'drone-app',
            image: 'rvennam/drone-app:latest',
            ports: [
              {
                containerPort: 3000
              }
            ],
            resources: {
              requests: {
                memory: '64Mi',
                cpu: '50m'
              },
               limits: {
                memory: '128Mi',
                cpu: '100m'
              }
            }
          }
        ]
      }
    }
  }
}

exports.deployment = deployment
