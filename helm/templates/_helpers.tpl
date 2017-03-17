{{/*
Common helper templates/"functions" for use in the other files in this directory.
/*}}

{{/*
Expand the name of the chart.
*/}}
{{- define "name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.

We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).

If the chart name is the same as the release name then don't include both
*/}}
{{- define "fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if eq $name .Release.Name -}}
  {{- $name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
  {{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Built full docker image name, including sha reference or tag
*/}}
{{- define "docker-image" -}}
{{- if hasKey .Values "dockerSha" -}}
  {{- printf "%s@%s" .Values.dockerImage .Values.dockerSha | quote -}}
{{- else -}}
  {{- printf "%s:%s" .Values.dockerImage (default .Values.dockerTag "latest") | quote -}}
{{- end -}}
{{- end -}}
