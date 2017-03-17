# Using this as a starter pack

Helm has "starter packs" to make creating charts a bit simpler. To set this up
you will need to checkout this repo and then run `helm init --client-only &&
cd kubernetes-deployment && ln -s $PWD/helm/sampleapp
~/.helm/starters/mns-sampleapp`. You can then run `helm create -p
mns-sampleapp helm/` in your own app and it will write most of
these files you need automatically

## First Time Setup For Chart Creator.

If you have just created this sample chart with `helm create -p mns-sampleapp`
you will need to edit a few lines in values.yaml, then remove this section
from the readme:

- `dockerImage` will need to be set to what ever image your CI pipeline is
  building.
- `ingress.name` will need to be set to a cluster-wide unique name. Currently
  there is no enforcing of uniqueness so if you overlap with another team you
  will steal their traffic. Don't do this :) Ask in #paas-feedback to make
  sure the name you pick is unique
- `resources` key sets the memory and cpu limits for your containers. You will
  need to work out what sensible values for your app is and set them.
- `namespace` key sets the Kubernetes namespace to which components will be deployed. Namespaces can be used to logically group components in your helm chart. Namespaces can also be used to restrict the CPU and memory used by pods, but usual defaults are fine.

**Remember** Now edit README.md and delete up to this line.

# Helm deployment chart for Webdriver CSS Admin Panel

## Prerequisites

- Access to a Kubernetes cluster, 1.5+, with Helm and an ingress controller
  installed. (The M&S clusters have these. IF you are using minikube etc. it's
  up to you.)
- You must provide one of `dockerSha` or `dockerTag` values - the concourse
  pipeline takes care of this.
- You must provide a value for `ingress.domain`. The value to use here depends
  on which cluster you are deploying to. Again the concourse pipeline will
  provide this for you.

## Configuration

The following tables lists the configurable parameters of the Prometheus chart and their default values.

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `dockerImage` | Name ofthe docker image to deploy | `registry.pulp.devops.mnscorp.net/front-end/webdrivercss_adminpanel` |
| `dockerSha` | Content-addressable SHA of docker image to deploy | N/A - set at deploy time |
| `dockerTag` | Tag name of docker image to deploy | N/A - set at deploy time |
| `resources` | resource requests and limits (YAML) |`requests: {cpu: 10m, memory: 64Mi}` |
| `ingress.name` | The subdomain component to request the ingress route for. | `visualtesting` |
| `ingress.domain` | The domainname to request the ingress route for. | N/A - set at deployment time |
| `ingress.ssl` | Should the ingress route use HTTPS? | `false` |
| `namespace` | Kubernetes namespace to which the components will be deployed | `pegasus` |
